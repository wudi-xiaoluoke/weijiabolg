<template>
  <div class="article-detail-container">
    <el-page-header :icon="ArrowLeft" :title="article.title || '文章详情'" @back="handleBack" />
    
    <el-card class="article-detail-card" shadow="hover">
      <div class="article-header">
        <h1 class="article-title">{{ article.title }}</h1>
        <div class="article-meta">
          <span>作者：{{ article.author }}</span>
          <span>发布日期：{{ article.date }}</span>
          <span>分类：{{ article.category }}</span>
          <span>阅读量：{{ article.views }}</span>
        </div>
      </div>
      
      <div class="article-content" v-html="article.content"></div>
      
      <div class="article-actions">
        <el-button size="small" @click="handleLike" :type="liked ? 'primary' : ''">
          <el-icon><Star /></el-icon>
          点赞 ({{ article.likes }})
        </el-button>
        <el-button size="small" @click="handleFavorite" :type="favorited ? 'success' : ''">
          <el-icon><StarFilled /></el-icon>
          收藏
        </el-button>
        <el-button size="small" @click="handleShare">
          <el-icon><Share /></el-icon>
          分享
        </el-button>
        <el-button size="small" type="primary" @click="editArticle">
          <el-icon><Edit /></el-icon>
          编辑
        </el-button>
      </div>
    </el-card>
    
    <!-- 评论区 -->
    <article-comments :article-id="articleId" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Star, StarFilled, Share, Edit } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import ArticleComments from '../../components/ArticleComments.vue'

const router = useRouter()
const route = useRoute()
const articleId = parseInt(route.params.id)

// 状态管理
const article = ref({
  id: '',
  title: '',
  author: '',
  date: '',
  category: '',
  views: 0,
  likes: 0,
  content: ''
})
const liked = ref(false)
const favorited = ref(false)

// 模拟文章数据
const mockArticleData = {
  1: {
    id: 1,
    title: 'Vue 3 组合式API深度解析',
    author: '技术博主',
    date: '2024-01-15',
    category: '前端开发',
    views: 1245,
    likes: 89,
    content: `
      <h2>什么是组合式API？</h2>
      <p>Vue 3 引入的组合式 API (Composition API) 是一组 API，使我们能够以更灵活的方式组织组件的逻辑。</p>
      
      <h2>为什么需要组合式API？</h2>
      <p>在 Vue 2 中，我们使用选项式 API (Options API) 组织代码。当组件变得复杂时，相关的逻辑会被分散在不同的选项中，使得代码难以维护和重用。</p>
      
      <h2>组合式API的核心函数</h2>
      <h3>1. setup() 函数</h3>
      <pre><code>export default {
  setup() {
    // 这里是组合式API的入口
    return {
      // 返回的响应式状态和方法
    }
  }
}</code></pre>
      
      <h3>2. ref() 函数</h3>
      <pre><code>import { ref } from 'vue'

const count = ref(0)
console.log(count.value) // 0

// 修改值
count.value++
console.log(count.value) // 1</code></pre>
      
      <h3>3. reactive() 函数</h3>
      <pre><code>import { reactive } from 'vue'

const state = reactive({
  count: 0,
  message: 'Hello'
})

// 修改值
state.count++</code></pre>
      
      <h3>4. computed() 函数</h3>
      <pre><code>import { ref, computed } from 'vue'

const count = ref(0)
const doubleCount = computed(() => count.value * 2)</code></pre>
      
      <h2>使用组合式API的最佳实践</h2>
      <ol>
        <li>按功能组织相关的逻辑代码</li>
        <li>将可复用的逻辑提取为组合函数</li>
        <li>合理使用响应式API</li>
        <li>结合TypeScript获得更好的类型支持</li>
      </ol>
    `
  },
  2: {
    id: 2,
    title: 'Element Plus 组件库最佳实践',
    author: '技术博主',
    date: '2024-01-10',
    category: '前端框架',
    views: 986,
    likes: 67,
    content: `
      <h2>Element Plus 简介</h2>
      <p>Element Plus 是一套基于 Vue 3 的桌面端组件库，为开发者、设计师和产品经理提供了一致的开发体验。</p>
      
      <h2>安装与配置</h2>
      <pre><code># NPM
npm install element-plus --save

# Yarn
yarn add element-plus

# pnpm
pnpm install element-plus</code></pre>
      
      <h2>按需导入</h2>
      <p>为了减小打包体积，推荐使用按需导入：</p>
      <pre><code>// vite.config.ts
import { defineConfig } from 'vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  // ...
  plugins: [
    // ...
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
})</code></pre>
      
      <h2>组件使用技巧</h2>
      <h3>表单验证</h3>
      <pre><code>const ruleFormRef = ref()
const rules = {
  name: [
    { required: true, message: '请输入名称', trigger: 'blur' },
    { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
  ]
}</code></pre>
      
      <h3>表格数据处理</h3>
      <p>使用懒加载、虚拟滚动处理大量数据，避免一次性渲染过多DOM元素。</p>
    `
  }
}

// 生命周期钩子
onMounted(() => {
  // 这里应该调用API获取真实数据
  // 暂时使用模拟数据
  const articleData = mockArticleData[articleId]
  if (articleData) {
    article.value = articleData
    // 模拟增加阅读量
    article.value.views++
  } else {
    ElMessage.error('文章不存在')
    router.push('/article')
  }
})

// 方法
const handleBack = () => {
  router.back()
}

const handleLike = () => {
  if (liked.value) {
    article.value.likes--
    ElMessage.info('已取消点赞')
  } else {
    article.value.likes++
    ElMessage.success('点赞成功')
  }
  liked.value = !liked.value
}

const handleFavorite = () => {
  if (favorited.value) {
    ElMessage.info('已取消收藏')
  } else {
    ElMessage.success('收藏成功')
  }
  favorited.value = !favorited.value
}

const handleShare = () => {
  ElMessage.success('分享功能开发中')
}

const editArticle = () => {
  router.push(`/article/edit/${articleId}`)
}
</script>

<style scoped>
.article-detail-container {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
  transition: padding 0.3s ease;
}

.article-detail-card {
  margin-bottom: 30px;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.article-header {
  border-bottom: 1px solid var(--border-color-base, #ebeef5);
  padding-bottom: 20px;
  margin-bottom: 20px;
}

.article-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 16px;
  line-height: 1.3;
  transition: font-size 0.3s ease;
}

.article-meta {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
  flex-wrap: wrap;
}

.article-content {
  font-size: 16px;
  line-height: 1.8;
  color: var(--el-text-color-regular);
  padding: 20px 0;
  transition: font-size 0.3s ease;
}

.article-content h2 {
  font-size: 22px;
  margin-top: 30px;
  margin-bottom: 16px;
  color: var(--el-text-color-primary);
  padding-bottom: 8px;
  border-bottom: 2px solid var(--primary-color-light, #e6f7ff);
  transition: font-size 0.3s ease;
}

.article-content h3 {
  font-size: 18px;
  margin-top: 24px;
  margin-bottom: 12px;
  color: var(--el-text-color-primary);
  transition: font-size 0.3s ease;
}

.article-content p {
  margin-bottom: 16px;
  text-align: justify;
}

.article-content pre {
  background-color: var(--bg-color-light, #f5f7fa);
  border-radius: 6px;
  padding: 16px;
  overflow-x: auto;
  margin-bottom: 16px;
  border: 1px solid var(--border-color-light, #ebeef5);
  transition: all 0.3s ease;
}

.article-content code {
  background-color: var(--bg-color-light, #f5f7fa);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9em;
}

.article-content ol,
.article-content ul {
  padding-left: 24px;
  margin-bottom: 16px;
}

.article-content li {
  margin-bottom: 8px;
}

.article-actions {
  display: flex;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color-base, #ebeef5);
  flex-wrap: wrap;
  transition: all 0.3s ease;
}

/* 响应式设计增强 */
@media (max-width: 1024px) {
  .article-detail-container {
    padding: 15px;
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .article-detail-container {
    padding: 12px;
  }
  
  .article-title {
    font-size: 24px;
  }
  
  .article-meta {
    gap: 10px;
    font-size: 13px;
  }
  
  .article-content {
    font-size: 15px;
    padding: 16px 0;
  }
  
  .article-content h2 {
    font-size: 20px;
    margin-top: 24px;
  }
  
  .article-content h3 {
    font-size: 17px;
    margin-top: 20px;
  }
  
  .article-content pre {
    padding: 12px;
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .article-detail-container {
    padding: 8px;
  }
  
  .article-title {
    font-size: 20px;
  }
  
  .article-header {
    padding-bottom: 16px;
    margin-bottom: 16px;
  }
  
  .article-content {
    font-size: 14px;
    line-height: 1.7;
  }
  
  .article-content h2 {
    font-size: 18px;
  }
  
  .article-content h3 {
    font-size: 16px;
  }
  
  .article-actions {
    gap: 8px;
    padding-top: 16px;
  }
  
  .article-actions .el-button {
    font-size: 13px;
    padding: 6px 12px;
  }
}

/* 确保在暗黑主题下的良好显示 */
:deep(.el-card__body) {
  background-color: var(--bg-color-white, #ffffff);
  transition: background-color 0.3s ease;
}

/* 代码块在移动设备上的优化 */
.article-content pre {
  position: relative;
}

/* 优化按钮的触摸目标大小，提高移动端可用性 */
.el-button {
  min-height: 32px;
  min-width: 44px;
  display: inline-flex;
  align-items: center;
}

/* 防止内容溢出 */
.article-content img {
  max-width: 100%;
  height: auto;
}
</style>