<template>
  <div class="article-edit-container">
    <el-page-header :icon="ArrowLeft" :title="isEditMode ? '编辑文章' : '写文章'" @back="handleBack" />
    
    <el-card class="article-edit-card" shadow="hover">
      <el-form
        ref="articleFormRef"
        :model="articleForm"
        :rules="rules"
        label-width="80px"
        class="article-form"
      >
        <el-form-item label="标题" prop="title">
          <el-input
            v-model="articleForm.title"
            placeholder="请输入文章标题"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="分类" prop="category">
          <el-select
            v-model="articleForm.category"
            placeholder="请选择文章分类"
            clearable
          >
            <el-option
              v-for="category in categories"
              :key="category.value"
              :label="category.label"
              :value="category.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="标签" prop="tags">
          <el-input
            v-model="articleForm.tags"
            placeholder="请输入标签，多个标签用逗号分隔"
          />
          <div class="form-tip">多个标签之间用逗号分隔，例如：Vue,TypeScript,前端</div>
        </el-form-item>
        
        <el-form-item label="封面图" prop="coverImage">
          <el-upload
            v-model:file-list="fileList"
            class="upload-demo"
            drag
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            multiple
            limit="1"
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">
              拖放文件到此处或 <em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                只能上传jpg/png文件，且不超过2MB
              </div>
            </template>
          </el-upload>
        </el-form-item>
        
        <el-form-item label="内容" prop="content">
          <div class="editor-toolbar">
            <el-button size="small" @click="insertText('**', '**')">
              <strong>B</strong>
            </el-button>
            <el-button size="small" @click="insertText('*', '*')">
              <em>I</em>
            </el-button>
            <el-button size="small" @click="insertText('```\n', '\n```')">
              代码块
            </el-button>
            <el-button size="small" @click="insertText('# ', '')">
              H1
            </el-button>
            <el-button size="small" @click="insertText('## ', '')">
              H2
            </el-button>
            <el-button size="small" @click="insertText('### ', '')">
              H3
            </el-button>
            <el-button size="small" @click="insertText('- ', '')">
              列表
            </el-button>
            <el-button size="small" @click="insertText('[链接文本](url)', '')">
              链接
            </el-button>
            <el-button size="small" @click="insertText('![图片描述](url)', '')">
              图片
            </el-button>
          </div>
          <el-input
            v-model="articleForm.content"
            type="textarea"
            :rows="15"
            placeholder="请输入文章内容，支持Markdown格式"
            class="markdown-editor"
          />
        </el-form-item>
        
        <el-form-item label="摘要" prop="summary">
          <el-input
            v-model="articleForm.summary"
            type="textarea"
            :rows="4"
            placeholder="请输入文章摘要（100-200字）"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="发布状态" prop="status">
          <el-radio-group v-model="articleForm.status">
            <el-radio label="draft">草稿</el-radio>
            <el-radio label="published">已发布</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSubmit">提交</el-button>
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="danger" @click="handleDelete" v-if="isEditMode">删除</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, UploadFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { updatePublishStatus } from '../../api/modules/article'

const router = useRouter()
const route = useRoute()
const articleFormRef = ref()
const fileList = ref([])

// 判断是否为编辑模式
const isEditMode = computed(() => !!route.params.id)
const articleId = parseInt(route.params.id)

// 文章分类选项
const categories = [
  { label: '前端开发', value: '前端开发' },
  { label: '后端开发', value: '后端开发' },
  { label: '移动开发', value: '移动开发' },
  { label: '人工智能', value: '人工智能' },
  { label: '大数据', value: '大数据' },
  { label: '云计算', value: '云计算' },
  { label: 'DevOps', value: 'DevOps' },
  { label: '编程语言', value: '编程语言' },
  { label: '前端框架', value: '前端框架' },
  { label: '开发工具', value: '开发工具' },
  { label: '工程化', value: '工程化' }
]

// 表单数据
const articleForm = reactive({
  title: '',
  category: '',
  tags: '',
  coverImage: '',
  content: '',
  summary: '',
  status: 'draft'
})

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入文章标题', trigger: 'blur' },
    { min: 5, max: 100, message: '标题长度在 5 到 100 个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择文章分类', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入文章内容', trigger: 'blur' },
    { min: 10, message: '文章内容至少 10 个字符', trigger: 'blur' }
  ],
  summary: [
    { required: false, message: '请输入文章摘要', trigger: 'blur' },
    { max: 200, message: '摘要长度不超过 200 个字符', trigger: 'blur' }
  ]
}

// 模拟文章数据
const mockArticleData = {
  1: {
    id: 1,
    title: 'Vue 3 组合式API深度解析',
    category: '前端开发',
    tags: 'Vue,Vue3,组合式API',
    coverImage: '',
    content: '# Vue 3 组合式API深度解析\n\n## 什么是组合式API？\nVue 3 引入的组合式 API (Composition API) 是一组 API，使我们能够以更灵活的方式组织组件的逻辑。\n\n## 为什么需要组合式API？\n在 Vue 2 中，我们使用选项式 API (Options API) 组织代码。当组件变得复杂时，相关的逻辑会被分散在不同的选项中，使得代码难以维护和重用。\n\n## 组合式API的核心函数\n\n### 1. setup() 函数\n```javascript\nexport default {\n  setup() {\n    // 这里是组合式API的入口\n    return {\n      // 返回的响应式状态和方法\n    }\n  }\n}\n```\n\n### 2. ref() 函数\n```javascript\nimport { ref } from \'vue\'\n\nconst count = ref(0)\nconsole.log(count.value) // 0\n\n// 修改值\ncount.value++\nconsole.log(count.value) // 1\n```\n\n## 使用组合式API的最佳实践\n1. 按功能组织相关的逻辑代码\n2. 将可复用的逻辑提取为组合函数\n3. 合理使用响应式API\n4. 结合TypeScript获得更好的类型支持',
    summary: '本文深入解析Vue 3组合式API的核心概念、使用方法和最佳实践，帮助开发者更好地理解和应用这一新特性。',
    status: 'published'
  }
}

// 生命周期钩子
onMounted(() => {
  if (isEditMode.value) {
    // 这里应该调用API获取真实数据
    // 暂时使用模拟数据
    const articleData = mockArticleData[articleId]
    if (articleData) {
      Object.assign(articleForm, articleData)
    } else {
      ElMessage.error('文章不存在')
      router.push('/article')
    }
  }
})

// 方法
const handleBack = () => {
  router.back()
}

const handleSubmit = async () => {
  articleFormRef.value.validate(async (valid) => {
    if (valid) {
      const operation = isEditMode.value ? '更新' : '发布'
      
      try {
        await ElMessageBox.confirm(
          `确定要${operation}这篇文章吗？`,
          '确认操作',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'info'
          }
        )
        
        // 如果是编辑模式，且需要更新发布状态
        if (isEditMode.value) {
          const isPublished = articleForm.status === 'published'
          await updatePublishStatus(articleId, isPublished)
        }
        
        // 这里应该调用API保存文章内容
        // await articleAPI.saveArticle(...)
        
        ElMessage.success(`文章${operation}成功`)
        router.push('/article')
      } catch (error) {
        if (error === 'cancel') {
          ElMessage.info('已取消操作')
        } else {
          console.error('保存文章失败:', error)
          ElMessage.error('保存失败，请稍后重试')
        }
      }
    } else {
      ElMessage.warning('请检查表单填写是否正确')
      return false
    }
  })
}

const handleCancel = () => {
  if (hasFormChanges()) {
    ElMessageBox.confirm(
      '表单内容已修改，确定要离开吗？',
      '确认离开',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
      .then(() => {
        router.push('/article')
      })
      .catch(() => {
        // 取消操作，留在当前页面
      })
  } else {
    router.push('/article')
  }
}

const handleDelete = () => {
  ElMessageBox.confirm(
    '确定要删除这篇文章吗？此操作不可撤销。',
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }
  )
    .then(() => {
      // 这里应该调用API删除文章
      ElMessage.success('文章删除成功')
      router.push('/article')
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

const handleFileChange = (file) => {
  // 这里应该处理文件上传逻辑
  // 暂时只是保存文件路径
  articleForm.coverImage = file.name
}

const insertText = (before, after) => {
  const textarea = document.querySelector('.markdown-editor textarea')
  if (textarea) {
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = articleForm.content.substring(start, end)
    const newText = before + selectedText + after
    
    articleForm.content = 
      articleForm.content.substring(0, start) + 
      newText + 
      articleForm.content.substring(end)
    
    // 设置光标位置
    setTimeout(() => {
      textarea.focus()
      textarea.selectionStart = start + before.length
      textarea.selectionEnd = start + before.length + selectedText.length
    }, 0)
  }
}

const hasFormChanges = () => {
  // 检查表单是否有修改
  if (isEditMode.value) {
    const originalData = mockArticleData[articleId]
    return JSON.stringify(articleForm) !== JSON.stringify(originalData)
  }
  
  // 新建模式下，只要有一个字段有值就算有修改
  return Object.values(articleForm).some(value => 
    value !== null && value !== undefined && value !== ''
  )
}
</script>

<style scoped>
.article-edit-container {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.article-edit-card {
  margin-bottom: 30px;
}

.article-form {
  padding-top: 20px;
}

.form-tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 5px;
}

.editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px 4px 0 0;
  border: 1px solid #e4e7ed;
  border-bottom: none;
}

.markdown-editor {
  border-radius: 0 0 4px 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

@media (max-width: 768px) {
  .article-edit-container {
    padding: 10px;
  }
  
  .editor-toolbar {
    gap: 4px;
  }
  
  .el-form-item__label {
    font-size: 14px;
  }
}
</style>