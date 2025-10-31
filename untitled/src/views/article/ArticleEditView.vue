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
import { articleAPI } from '../../api/index.js'

const router = useRouter()
const route = useRoute()
const articleFormRef = ref()
const fileList = ref([])

// 判断是否为编辑模式
const isEditMode = computed(() => !!route.params.id)
const articleId = parseInt(route.params.id)

// 删除重复的categories声明

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
    { min: 3, max: 100, message: '标题长度在 3 到 100 个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择文章分类', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入文章内容', trigger: 'blur' }
  ],
  summary: [
    { required: true, message: '请输入文章摘要', trigger: 'blur' },
    { min: 50, max: 200, message: '摘要长度在 50 到 200 个字符', trigger: 'blur' }
  ]
}

// 分类列表
const categories = ref([
  { label: '前端开发', value: '前端开发' },
  { label: '后端开发', value: '后端开发' },
  { label: '数据库', value: '数据库' },
  { label: 'DevOps', value: 'DevOps' },
  { label: '算法', value: '算法' },
  { label: '其他', value: '其他' }
])

// 文件变更处理
const handleFileChange = (file, fileList) => {
  // 这里只是简单处理，实际项目中应该上传到服务器
  console.log('文件变更:', file, fileList)
  if (file && file.url) {
    articleForm.coverImage = file.url;
  }
}

// 插入文本到编辑器
const insertText = (before, after) => {
  const textarea = document.querySelector('.markdown-editor')
  if (textarea) {
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = textarea.value.substring(start, end)
    const newText = before + selectedText + after
    
    articleForm.content = 
      textarea.value.substring(0, start) + 
      newText + 
      textarea.value.substring(end)
    
    // 设置光标位置
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + before.length + selectedText.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }
}

// 获取文章详情
const getArticleDetail = async () => {
  try {
    console.log('获取文章详情，文章ID:', articleId);
    const response = await articleAPI.getArticleById(articleId);
    console.log('文章详情获取成功:', response);
    
    // 根据后端返回的数据结构填充表单
    articleForm.title = response.title || '';
    articleForm.category = response.category?.name || response.category || '';
    articleForm.tags = response.tags ? (Array.isArray(response.tags) ? response.tags.join(',') : response.tags) : '';
    articleForm.coverImage = response.coverImage || response.cover_url || '';
    articleForm.content = response.content || '';
    articleForm.summary = response.summary || '';
    articleForm.status = response.status || 'draft';
    
    // 如果有封面图，设置文件列表
    if (articleForm.coverImage) {
      fileList.value = [{ url: articleForm.coverImage, name: '封面图' }];
    }
    
    ElMessage.success('获取文章详情成功')
  } catch (error) {
    console.error('获取文章详情失败:', error);
    ElMessage.error('获取文章详情失败')
  }
}

// 提交表单
const handleSubmit = async () => {
  articleFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const formData = {
          title: articleForm.title,
          category: articleForm.category,
          tags: articleForm.tags ? articleForm.tags.split(',').map(tag => tag.trim()) : [],
          coverImage: articleForm.coverImage,
          content: articleForm.content,
          summary: articleForm.summary,
          status: articleForm.status
        };
        
        console.log('提交文章数据:', formData);
        
        if (isEditMode.value) {
          // 更新文章
          await articleAPI.updateArticle(articleId, formData);
          ElMessage.success('文章更新成功');
        } else {
          // 创建文章
          const response = await articleAPI.createArticle(formData);
          ElMessage.success('文章创建成功');
          router.push(`/article/detail/${response.id || 1}`);
          return;
        }
        
        router.push(`/article/detail/${articleId}`);
      } catch (error) {
        console.error('提交文章失败:', error);
        ElMessage.error(isEditMode.value ? '文章更新失败' : '文章创建失败');
      }
    }
  })
}

// 删除文章
const handleDelete = async () => {
  ElMessageBox.confirm('确定要删除这篇文章吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      console.log('删除文章，文章ID:', articleId);
      await articleAPI.deleteArticle(articleId);
      ElMessage.success('文章删除成功');
      router.push('/article');
    } catch (error) {
      console.error('删除文章失败:', error);
      ElMessage.error('文章删除失败');
    }
  }).catch(() => {
    // 取消删除
  })
}

// 返回上一页
const handleBack = () => {
  router.back()
}

// 取消编辑
const handleCancel = () => {
  router.back()
}

// 页面加载时，如果是编辑模式则获取文章详情
onMounted(() => {
  if (isEditMode.value) {
    getArticleDetail();
  }
})
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