import { createRouter, createWebHistory } from 'vue-router'

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
      breadcrumb: '编辑文章'
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
      breadcrumb: '个人信息编辑'
    }
  },
  {
    path: '/user/profile',
    name: 'userProfile',
    component: UserProfileView,
    meta: {
      title: '个人配置 - 技术博客',
      breadcrumb: '个人配置'
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

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || '技术博客'
  next()
})

export default router