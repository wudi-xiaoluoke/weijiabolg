import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/modules/auth'

// 使用路由懒加载优化性能
const ArticleListView = () => import('../views/article/ArticleListView.vue')
const ArticleDetailView = () => import('../views/article/ArticleDetailView.vue')
const ArticleEditView = () => import('../views/article/ArticleEditView.vue')
const LoginView = () => import('../views/auth/LoginView.vue')
const RegisterView = () => import('../views/auth/RegisterView.vue')
const AuthProfileView = () => import('../views/auth/ProfileView.vue')
const UserProfileView = () => import('../views/UserProfileView.vue')
const CategoryView = () => import('../views/CategoryView.vue')
const TagView = () => import('../views/TagView.vue')
const SystemSettingsView = () => import('../views/SystemSettingsView.vue')

const routes = [
  {
    path: '/',
    name: 'home',
    component: ArticleListView,
    meta: {
      title: '首页 - 技术博客',
      breadcrumb: '首页'
    }
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: {
      title: '登录 - 技术博客',
      breadcrumb: '登录'
    }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: {
      title: '注册 - 技术博客',
      breadcrumb: '注册'
    }
  },
  {
    path: '/article',
    name: 'article',
    component: ArticleListView,
    meta: {
      title: '文章列表 - 技术博客',
      breadcrumb: '文章列表'
    }
  },
  {
    path: '/article/detail/:id',
    name: 'articleDetail',
    component: ArticleDetailView,
    meta: {
      title: '文章详情 - 技术博客',
      breadcrumb: '文章详情'
    }
  },
  {
    path: '/article/edit/:id?',
    name: 'articleEdit',
    component: ArticleEditView,
    meta: {
      title: '编辑文章 - 技术博客',
      breadcrumb: '编辑文章',
      requiresAuth: true // 需要登录才能访问
    }
  },
  {
    path: '/category',
    name: 'category',
    component: CategoryView,
    meta: {
      title: '分类 - 技术博客',
      breadcrumb: '分类'
    }
  },
  {
    path: '/category/:categoryId',
    name: 'categoryDetail',
    component: CategoryView,
    props: true,
    meta: {
      title: '分类文章 - 技术博客',
      breadcrumb: '分类文章'
    }
  },
  {
    path: '/tags',
    redirect: '/tag'
  },
  {
    path: '/tag',
    name: 'tag',
    component: TagView,
    meta: {
      title: '标签 - 技术博客',
      breadcrumb: '标签'
    }
  },
  {
    path: '/tag/:tagId',
    name: 'tagDetail',
    component: TagView,
    props: true,
    meta: {
      title: '标签文章 - 技术博客',
      breadcrumb: '标签文章'
    }
  },
  {
    path: '/profile',
    redirect: '/auth/profile'
  },
  {
    path: '/auth/profile',
    name: 'authProfile',
    component: AuthProfileView,
    meta: {
      title: '个人信息编辑 - 技术博客',
      breadcrumb: '个人信息编辑',
      requiresAuth: true // 需要登录才能访问
    }
  },
  {
    path: '/user/profile',
    name: 'userProfile',
    component: UserProfileView,
    meta: {
      title: '个人配置 - 技术博客',
      breadcrumb: '个人配置',
      requiresAuth: true // 需要登录才能访问
    }
  },
  {
    path: '/settings',
    name: 'systemSettings',
    component: SystemSettingsView,
    meta: {
      title: '系统设置 - 技术博客',
      breadcrumb: '系统设置',
      requiresAuth: true // 需要登录才能访问
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: ArticleListView,
    meta: {
      title: '页面未找到 - 技术博客',
      breadcrumb: '页面未找到'
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 缓存authStore实例以避免重复创建
let cachedAuthStore = null

router.beforeEach(async (to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title || '技术博客'
  
  // 初始化authStore（如果尚未初始化）
  if (!cachedAuthStore) {
    cachedAuthStore = useAuthStore()
  }
  const authStore = cachedAuthStore
  
  // 确保authStore已初始化，特别是对于需要认证的路由
  if (to.meta.requiresAuth && !authStore.isInitialized) {
    try {
      console.log('初始化auth状态...')
      await authStore.initializeAuth()
    } catch (error) {
      console.error('auth初始化失败:', error)
    }
  }
  
  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    // 再次检查认证状态，现在authStore应该已经初始化
    if (!authStore.isAuthenticated) {
      // 如果未登录，重定向到登录页面，并记录原始目标
      console.log('需要登录才能访问:', to.path)
      return next({
        name: 'login',
        query: { redirect: to.fullPath } // 记录原始请求路径，登录后可以重定向回来
      })
    }
  } else if (to.name === 'login' && authStore.isAuthenticated) {
    // 如果已登录但尝试访问登录页，则重定向到首页或指定的重定向地址
    console.log('用户已登录，重定向到首页')
    return next(from.query.redirect || '/')
  }
  
  // 继续导航
  next()
})

export default router