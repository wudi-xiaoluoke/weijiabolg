<template>
  <div class="article-edit-container">
    <el-card class="edit-card">
      <template #header>
        <div class="card-header">
          <h2 class="page-title">{{ isEditMode ? '编辑文章' : '创建新文章' }}</h2>
          <div class="header-actions">
            <el-button 
              type="default" 
              @click="handleCancel" 
              :loading="saving || publishing"
            >
              取消
            </el-button>
            <el-button 
              type="warning" 
              @click="handleSaveDraft" 
              :loading="saving"
              :disabled="!canSave"
            >
              保存草稿
            </el-button>
            <el-button 
              type="primary" 
              @click="handlePublish" 
              :loading="publishing"
              :disabled="!canPublish"
            >
              {{ isEditMode ? '更新' : '发布' }}
            </el-button>
          </div>
        </div>
      </template>
      
      <!-- 文章表单 -->
      <el-form 
        ref="articleFormRef" 
        :model="articleForm" 
        :rules="formRules" 
        label-width="100px" 
        class="article-form"
      >
        <!-- 标题 -->
        <el-form-item label="标题" prop="title">
          <el-input 
            v-model="articleForm.title" 
            placeholder="请输入文章标题" 
            maxlength="200" 
            show-word-limit
            :disabled="saving || publishing"
          />
        </el-form-item>
        
        <!-- 副标题 -->
        <el-form-item label="副标题" prop="subtitle">
          <el-input 
            v-model="articleForm.subtitle" 
            placeholder="请输入文章副标题（选填）" 
            maxlength="500" 
            show-word-limit
            :disabled="saving || publishing"
          />
        </el-form-item>
        
        <!-- 封面图 -->
        <el-form-item label="封面图" prop="coverImage">
          <div class="cover-image-upload">
            <el-upload
              v-model:file-list="fileList"
              class="upload-demo"
              drag
              action=""
              :on-change="handleFileChange"
              :auto-upload="false"
              :disabled="saving || publishing"
              :limit="1"
              :on-exceed="handleExceed"
              accept="image/*"
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">
                拖放文件到此处，或 <em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  只能上传单个图片文件，建议尺寸为 1200x630
                </div>
              </template>
            </el-upload>
            
            <!-- 已上传的封面图预览 -->
            <div v-if="articleForm.coverImage" class="cover-preview">
              <img :src="articleForm.coverImage" alt="文章封面" />
              <el-button 
                type="danger" 
                size="small" 
                icon="el-icon-delete" 
                circle 
                @click="handleRemoveCover"
                :disabled="saving || publishing"
              />
            </div>
          </div>
        </el-form-item>
        
        <!-- 分类 -->
        <el-form-item label="分类" prop="categoryId">
          <el-cascader
            v-model="categoryValue"
            :options="categories"
            :props="categoryProps"
            placeholder="请选择文章分类"
            clearable
            :disabled="saving || publishing || categories.length === 0"
          />
          <div v-if="categories.length === 0" class="no-category-tip">
            <el-button type="text" size="small" @click="openCategoryDialog">添加分类</el-button>
          </div>
        </el-form-item>
        
        <!-- 标签 -->
        <el-form-item label="标签" prop="tags">
          <div class="custom-tags-container">
            <!-- 显示已添加的标签 -->
            <div 
              v-for="(tag, index) in processedTags" 
              :key="index" 
              class="custom-tag"
              :class="{ 'tag-disabled': saving || publishing }"
            >
              {{ tag }}
              <span 
                v-if="!saving && !publishing"
                class="tag-remove" 
                @click="removeTag(index)"
              >×</span>
            </div>
            
            <!-- 添加新标签的输入框 -->
            <div 
              v-if="processedTags.length < 10 && !saving && !publishing"
              class="tag-input-wrapper"
            >
              <input
                v-model="tagInput"
                type="text"
                class="tag-input"
                placeholder="添加标签"
                @keyup.enter="addTag"
                @keyup.space.prevent="addTag"
                @blur="addTag"
                maxlength="10"
              />
              <span class="add-icon" @click="addTag">+</span>
            </div>
          </div>
          <div class="tip-text">最多添加10个标签，每个标签不超过10个字符</div>
        </el-form-item>
        
        <!-- 内容编辑模式切换 -->
        <div class="editor-mode-switch">
          <el-radio-group v-model="editorMode" @change="switchEditorMode">
            <el-radio :label="'markdown'">Markdown 编辑器</el-radio>
            <el-radio :label="'rich'">富文本编辑器</el-radio>
          </el-radio-group>
        </div>
        
        <!-- Markdown编辑器 -->
        <el-form-item 
          label="内容" 
          prop="content" 
          v-if="editorMode === 'markdown'"
          class="markdown-editor-container"
        >
          <div class="markdown-editor">
            <div class="editor-toolbar">
              <el-dropdown @command="insertMarkdown">
                <el-button type="default" size="small">标题</el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="# ">H1</el-dropdown-item>
                    <el-dropdown-item command="## ">H2</el-dropdown-item>
                    <el-dropdown-item command="### ">H3</el-dropdown-item>
                    <el-dropdown-item command="#### ">H4</el-dropdown-item>
                    <el-dropdown-item command="##### ">H5</el-dropdown-item>
                    <el-dropdown-item command="###### ">H6</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              
              <el-button type="default" size="small" @click="insertMarkdown('**')">粗体</el-button>
              <el-button type="default" size="small" @click="insertMarkdown('*')">斜体</el-button>
              <el-button type="default" size="small" @click="insertMarkdown('`')">代码</el-button>
              <el-button type="default" size="small" @click="insertMarkdown('```\n```')">代码块</el-button>
              <el-button type="default" size="small" @click="insertMarkdown('> ')">引用</el-button>
              <el-button type="default" size="small" @click="insertMarkdown('- ')">无序列表</el-button>
              <el-button type="default" size="small" @click="insertMarkdown('1. ')">有序列表</el-button>
              <el-button type="default" size="small" @click="insertMarkdown('---')">分割线</el-button>
              <el-button type="default" size="small" @click="insertMarkdown('[链接文字](url)')">链接</el-button>
              <el-button type="default" size="small" @click="insertMarkdown('![图片描述](url)')">图片</el-button>
              <el-button type="default" size="small" @click="insertMarkdown('|表头1|表头2|\n|----|----|\n|单元格1|单元格2|')">表格</el-button>
            </div>
            
            <div class="editor-content">
              <el-input
                v-model="articleForm.content"
                type="textarea"
                :rows="20"
                placeholder="请使用Markdown编写文章内容"
                resize="none"
                :disabled="saving || publishing"
                ref="markdownTextareaRef"
                class="markdown-textarea"
              />
            </div>
          </div>
        </el-form-item>
        
        <!-- 富文本编辑器（模拟） -->
        <el-form-item 
          label="内容" 
          prop="content" 
          v-else
          class="rich-editor-container"
        >
          <div class="rich-editor">
            <div class="editor-toolbar">
              <!-- 富文本编辑器工具栏（模拟） -->
              <el-button type="default" size="small" @click="insertRichText('<h1></h1>')">H1</el-button>
              <el-button type="default" size="small" @click="insertRichText('<h2></h2>')">H2</el-button>
              <el-button type="default" size="small" @click="insertRichText('<h3></h3>')">H3</el-button>
              <el-button type="default" size="small" @click="insertRichText('<strong></strong>')">粗体</el-button>
              <el-button type="default" size="small" @click="insertRichText('<em></em>')">斜体</el-button>
              <el-button type="default" size="small" @click="insertRichText('<u></u>')">下划线</el-button>
              <el-button type="default" size="small" @click="insertRichText('<strike></strike>')">删除线</el-button>
              <el-button type="default" size="small" @click="insertRichText('<blockquote></blockquote>')">引用</el-button>
              <el-button type="default" size="small" @click="insertRichText('<ul><li></li></ul>')">无序列表</el-button>
              <el-button type="default" size="small" @click="insertRichText('<ol><li></li></ol>')">有序列表</el-button>
              <el-button type="default" size="small" @click="insertRichText('<hr>')">分割线</el-button>
              <el-button type="default" size="small" @click="insertRichText('<a href=""></a>')">链接</el-button>
              <el-button type="default" size="small" @click="insertRichText('<img src="">')">图片</el-button>
              <el-button type="default" size="small" @click="insertRichText('<table><thead><tr><th></th></tr></thead><tbody><tr><td></td></tr></tbody></table>')">表格</el-button>
              <el-button type="default" size="small" @click="insertRichText('<code></code>')">代码</el-button>
              <el-button type="default" size="small" @click="insertRichText('<pre></pre>')">代码块</el-button>
            </div>
            
            <div 
              contenteditable="true" 
              class="rich-text-content"
              v-html="articleForm.content"
              @input="handleRichTextInput"
              @paste="handleRichTextPaste"
              :disabled="saving || publishing"
              ref="richTextareaRef"
            ></div>
          </div>
        </el-form-item>
        
        <!-- 文章摘要 -->
        <el-form-item label="摘要" prop="summary">
          <el-input 
            v-model="articleForm.summary" 
            type="textarea"
            :rows="4"
            placeholder="请输入文章摘要（选填），如不填写将自动从内容中提取"
            maxlength="500" 
            show-word-limit
            :disabled="saving || publishing"
          />
        </el-form-item>
        
        <!-- 发布设置 -->
        <el-form-item label="发布设置">
          <el-checkbox v-model="articleForm.allowComments" :disabled="saving || publishing">
            允许评论
          </el-checkbox>
          <el-checkbox v-model="articleForm.isPublic" :disabled="saving || publishing">
            公开文章
          </el-checkbox>
          <el-checkbox v-model="articleForm.isFeatured" :disabled="saving || publishing">
            设为精选
          </el-checkbox>
        </el-form-item>
        
        <!-- 定时发布 -->
        <el-form-item label="定时发布">
          <el-switch 
            v-model="articleForm.enableSchedule" 
            active-text="开启" 
            inactive-text="关闭"
            :disabled="saving || publishing"
          />
          <el-date-picker
            v-if="articleForm.enableSchedule"
            v-model="articleForm.scheduledTime"
            type="datetime"
            placeholder="选择发布时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm:ss"
            :disabled="saving || publishing"
            :disabled-date="disabledDate"
          />
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 分类对话框 -->
    <el-dialog
      v-model="categoryDialogVisible"
      title="添加分类"
      width="400px"
    >
      <el-form :model="categoryForm" :rules="categoryRules" ref="categoryFormRef">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="父分类">
          <el-select 
            v-model="categoryForm.parentId" 
            placeholder="请选择父分类（选填）"
            clearable
          >
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="categoryForm.order" :min="0" :max="100" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="categoryDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleAddCategory" :loading="addingCategory">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 图片上传对话框 -->
    <el-dialog
      v-model="imageUploadDialogVisible"
      title="上传图片"
      width="600px"
    >
      <el-upload
        class="image-uploader"
        action=""
        :on-change="handleImageFileChange"
        :auto-upload="false"
        multiple
        :limit="10"
        :on-exceed="handleImageExceed"
        accept="image/*"
      >
        <el-button type="primary">点击上传图片</el-button>
        <template #tip>
          <div class="el-upload__tip">
            支持多张图片上传，单次最多上传10张
          </div>
        </template>
      </el-upload>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="imageUploadDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleUploadImages" :loading="uploadingImages">
            上传
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useArticleStore } from '../store/modules/article'
import { useAuthStore } from '../store/modules/auth'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const articleStore = useArticleStore()
const authStore = useAuthStore()

// 响应式数据
const articleFormRef = ref()
const markdownTextareaRef = ref()
const richTextareaRef = ref()
const articleForm = reactive({
  id: '',
  title: '',
  subtitle: '',
  coverImage: '',
  categoryId: null,
  tags: [],
  content: '',
  summary: '',
  allowComments: true,
  isPublic: true,
  isFeatured: false,
  enableSchedule: false,
  scheduledTime: ''
})

const tagInput = ref('')

// 处理后的标签数组，只包含字符串形式的标签名
const processedTags = computed(() => {
  return articleForm.tags.map(tag => {
    if (typeof tag === 'object' && tag !== null) {
      // 更健壮地处理对象格式的标签
      if (tag.name) return tag.name;
      // 如果对象没有name属性，尝试其他常见属性
      if (tag.title) return tag.title;
      if (tag.value) return tag.value;
      // 最后才转换为字符串
      try {
        return JSON.stringify(tag).replace(/[{}]/g, '').replace(/"/g, '');
      } catch (e) {
        return '标签';
      }
    }
    // 确保非对象值也被转换为字符串
    return String(tag).trim();
  }).filter(tag => tag); // 过滤空标签
})

const fileList = ref([])
const editorMode = ref('markdown') // 'markdown' 或 'rich'
const categoryValue = ref([])
const categories = ref([]) // 分类列表
const saving = ref(false)
const publishing = ref(false)

// 分类对话框相关
const categoryDialogVisible = ref(false)
const categoryFormRef = ref()
const categoryForm = reactive({
  name: '',
  parentId: null,
  order: 0
})
const addingCategory = ref(false)

// 图片上传对话框相关
const imageUploadDialogVisible = ref(false)
const imageFiles = ref([])
const uploadingImages = ref(false)

// 表单验证规则
const formRules = {
  title: [
    { required: true, message: '请输入文章标题', trigger: 'blur' },
    { min: 1, max: 200, message: '标题长度应在 1 到 200 个字符之间', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入文章内容', trigger: 'blur' },
    { min: 10, message: '内容至少需要 10 个字符', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择文章分类', trigger: 'change' }
  ]
}

const categoryRules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 1, max: 50, message: '分类名称长度应在 1 到 50 个字符之间', trigger: 'blur' }
  ]
}

// 分类选择器配置
const categoryProps = {
  value: 'id',
  label: 'name',
  children: 'children'
}

// 计算属性
const isEditMode = computed(() => !!route.query.id)

// 判断是否可以保存
const canSave = computed(() => {
  return articleForm.title.trim() && articleForm.content.trim() && !saving.value && !publishing.value
})

// 判断是否可以发布
const canPublish = computed(() => {
  return articleForm.title.trim() && 
         articleForm.content.trim() && 
         articleForm.categoryId && 
         !saving.value && 
         !publishing.value
})

// 日期禁用函数
const disabledDate = (time) => {
  return time.getTime() < Date.now() - 8.64e7 // 不能选择昨天及之前的日期
}

// 初始化分类数据
const initCategories = async () => {
  // 这里应该从API获取分类数据
  // 暂时使用mock数据
  categories.value = [
    {
      id: 1,
      name: '前端开发',
      children: [
        { id: 11, name: 'Vue.js' },
        { id: 12, name: 'React' },
        { id: 13, name: 'JavaScript' },
        { id: 14, name: 'CSS/SCSS' },
        { id: 15, name: 'HTML5' }
      ]
    },
    {
      id: 2,
      name: '后端开发',
      children: [
        { id: 21, name: 'Node.js' },
        { id: 22, name: 'Python' },
        { id: 23, name: 'Java' },
        { id: 24, name: 'Go' }
      ]
    },
    {
      id: 3,
      name: '数据库',
      children: [
        { id: 31, name: 'MySQL' },
        { id: 32, name: 'MongoDB' },
        { id: 33, name: 'Redis' }
      ]
    },
    {
      id: 4,
      name: '计算机基础'
    },
    {
      id: 5,
      name: '算法与数据结构'
    },
    {
      id: 6,
      name: '开发工具'
    },
    {
      id: 7,
      name: '技术分享'
    },
    {
      id: 8,
      name: '其他'
    }
  ]
}

// 加载文章数据
const loadArticleData = async () => {
  if (!isEditMode.value) return
  
  try {
    await articleStore.fetchArticleDetail(route.query.id)
    const article = articleStore.currentArticle
    
    if (article) {
      // 填充表单数据
      articleForm.id = article.id
      articleForm.title = article.title || ''
      articleForm.subtitle = article.subtitle || ''
      articleForm.coverImage = article.coverImage || ''
      articleForm.categoryId = article.categoryId
      // 确保正确处理标签数据，只提取name属性
      if (article.tags && Array.isArray(article.tags)) {
        articleForm.tags = article.tags.map(tag => {
          // 使用与processedTags计算属性相同的处理逻辑
          if (typeof tag === 'object' && tag !== null) {
            // 更健壮地处理对象格式的标签
            if (tag.name) return tag.name;
            // 如果对象没有name属性，尝试其他常见属性
            if (tag.title) return tag.title;
            if (tag.value) return tag.value;
            // 最后才转换为字符串
            try {
              return JSON.stringify(tag).replace(/[{}]/g, '').replace(/"/g, '');
            } catch (e) {
              return '标签';
            }
          }
          // 确保非对象值也被转换为字符串
          return String(tag).trim();
        }).filter(tag => tag); // 过滤空标签
      } else {
        articleForm.tags = [];
      }
      articleForm.content = article.content || ''
      articleForm.summary = article.summary || ''
      articleForm.allowComments = article.allowComments !== false
      articleForm.isPublic = article.isPublic !== false
      articleForm.isFeatured = article.isFeatured || false
      articleForm.enableSchedule = article.enableSchedule || false
      articleForm.scheduledTime = article.scheduledTime || ''
      
      // 设置分类选择器
      if (article.categoryId) {
        // 这里应该根据categoryId找到对应的层级路径
        // 暂时简化处理
        categoryValue.value = [article.categoryId]
      }
    }
  } catch (error) {
    console.error('加载文章失败:', error)
    ElMessage.error('加载文章失败')
  }
}

// 切换编辑器模式
const switchEditorMode = () => {
  // 这里可以添加模式切换时的内容转换逻辑
  // 简单起见，目前不做转换
  ElMessage.info('切换编辑器模式可能会导致部分格式丢失')
}

// 处理文件变化
const handleFileChange = (file) => {
  // 这里应该上传文件到服务器
  // 暂时使用本地预览
  const reader = new FileReader()
  reader.onload = (e) => {
    articleForm.coverImage = e.target.result
  }
  reader.readAsDataURL(file.raw)
}

// 处理文件超出限制
const handleExceed = () => {
  ElMessage.warning('只能上传单个封面图片')
}

// 移除封面图
const handleRemoveCover = () => {
  articleForm.coverImage = ''
  fileList.value = []
}

// 打开分类对话框
const openCategoryDialog = () => {
  categoryDialogVisible.value = true
}

// 添加标签
const addTag = () => {
  const tagText = tagInput.value.trim();
  if (tagText && !processedTags.value.includes(tagText) && processedTags.value.length < 10) {
    articleForm.tags.push(tagText);
    tagInput.value = '';
  }
}

// 移除标签
const removeTag = (index) => {
  articleForm.tags.splice(index, 1);
}

// 添加分类
const handleAddCategory = async () => {
  const valid = await categoryFormRef.value.validate()
  if (!valid) return
  
  addingCategory.value = true
  try {
    // 这里应该调用添加分类的API
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const newCategory = {
      id: Date.now(),
      name: categoryForm.name,
      order: categoryForm.order || 0
    }
    
    if (categoryForm.parentId) {
      // 查找父分类并添加子分类
      const findParent = (items) => {
        for (let item of items) {
          if (item.id === categoryForm.parentId) {
            if (!item.children) item.children = []
            item.children.push(newCategory)
            return true
          }
          if (item.children && findParent(item.children)) {
            return true
          }
        }
        return false
      }
      
      if (!findParent(categories.value)) {
        categories.value.push(newCategory)
      }
    } else {
      categories.value.push(newCategory)
    }
    
    ElMessage.success('分类添加成功')
    categoryDialogVisible.value = false
    resetCategoryForm()
  } catch (error) {
    console.error('添加分类失败:', error)
    ElMessage.error('添加分类失败')
  } finally {
    addingCategory.value = false
  }
}

// 重置分类表单
const resetCategoryForm = () => {
  categoryForm.name = ''
  categoryForm.parentId = null
  categoryForm.order = 0
}

// 处理富文本输入
const handleRichTextInput = (e) => {
  articleForm.content = e.target.innerHTML
}

// 处理富文本粘贴
const handleRichTextPaste = (e) => {
  // 阻止默认粘贴行为
  e.preventDefault()
  
  // 获取粘贴的纯文本内容
  const text = e.clipboardData.getData('text/plain')
  
  // 创建一个文本节点并插入到当前位置
  const selection = window.getSelection()
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0)
    range.deleteContents()
    range.insertNode(document.createTextNode(text))
    range.collapse(false)
    selection.removeAllRanges()
    selection.addRange(range)
  }
  
  // 更新内容
  articleForm.content = e.target.innerHTML
}

// 插入Markdown格式
const insertMarkdown = (format) => {
  const textarea = markdownTextareaRef.value?.$el.querySelector('textarea')
  if (!textarea) return
  
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = textarea.value.substring(start, end)
  
  let newText
  let newPosition
  
  // 处理特殊格式
  if (format === '**' || format === '*' || format === '`') {
    // 对于粗体、斜体、行内代码，在选中的文本前后添加格式标记
    newText = textarea.value.substring(0, start) + format + selectedText + format + textarea.value.substring(end)
    newPosition = start + format.length + selectedText.length + format.length
  } else if (format.includes('```\n```')) {
    // 对于代码块，添加代码块标记并在中间添加光标
    const codeBlockFormat = '```\n' + selectedText + '\n```'
    newText = textarea.value.substring(0, start) + codeBlockFormat + textarea.value.substring(end)
    newPosition = start + 4 + selectedText.length
  } else if (format.includes('[链接文字](url)')) {
    // 对于链接，提供默认格式
    const linkFormat = selectedText ? `[${selectedText}](url)` : '[链接文字](url)'
    newText = textarea.value.substring(0, start) + linkFormat + textarea.value.substring(end)
    newPosition = linkFormat.indexOf('(url)') + 1
  } else if (format.includes('![图片描述](url)')) {
    // 对于图片，提供默认格式
    const imgFormat = selectedText ? `![${selectedText}](url)` : '![图片描述](url)'
    newText = textarea.value.substring(0, start) + imgFormat + textarea.value.substring(end)
    newPosition = imgFormat.indexOf('(url)') + 1
  } else if (format.includes('|')) {
    // 对于表格，使用默认表格格式
    newText = textarea.value.substring(0, start) + format + textarea.value.substring(end)
    newPosition = format.indexOf('|表头1') + 1
  } else {
    // 对于其他格式，在选中行的开头添加格式标记
    const beforeText = textarea.value.substring(0, start)
    const afterText = textarea.value.substring(end)
    
    // 寻找当前行的开头
    let lineStart = start
    while (lineStart > 0 && textarea.value[lineStart - 1] !== '\n') {
      lineStart--
    }
    
    newText = beforeText.substring(0, lineStart) + format + beforeText.substring(lineStart) + selectedText + afterText
    newPosition = lineStart + format.length + selectedText.length
  }
  
  // 更新文本并设置光标位置
  articleForm.content = newText
  
  // 在下一个tick设置光标位置
  setTimeout(() => {
    textarea.focus()
    textarea.setSelectionRange(newPosition, newPosition)
  }, 0)
}

// 插入富文本格式
const insertRichText = (html) => {
  const editor = richTextareaRef.value
  if (!editor) return
  
  // 获取当前选中区域
  const selection = window.getSelection()
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0)
    const selectedContent = range.toString()
    
    // 创建临时元素来解析HTML
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html
    
    // 如果有选中的内容，将其插入到适当的位置
    if (selectedContent && tempDiv.firstChild) {
      // 查找可以插入文本的第一个元素
      let textContainer = tempDiv.firstChild
      while (textContainer && !textContainer.textContent && textContainer.firstChild) {
        textContainer = textContainer.firstChild
      }
      
      if (textContainer) {
        textContainer.textContent = selectedContent
      }
    }
    
    // 清空当前选区并插入新内容
    range.deleteContents()
    
    // 插入临时元素的所有子节点
    const fragment = document.createDocumentFragment()
    while (tempDiv.firstChild) {
      fragment.appendChild(tempDiv.firstChild)
    }
    
    const insertedNode = range.insertNode(fragment)
    
    // 设置光标位置到插入内容的末尾
    range.setStartAfter(insertedNode.lastChild || insertedNode)
    range.setEndAfter(insertedNode.lastChild || insertedNode)
    selection.removeAllRanges()
    selection.addRange(range)
    
    // 更新文章内容
    articleForm.content = editor.innerHTML
  }
}

// 处理图片文件变化
const handleImageFileChange = (file, fileList) => {
  imageFiles.value = fileList
}

// 处理图片超出限制
const handleImageExceed = () => {
  ElMessage.warning('单次最多上传10张图片')
}

// 上传图片
const handleUploadImages = async () => {
  if (imageFiles.value.length === 0) {
    ElMessage.warning('请选择要上传的图片')
    return
  }
  
  uploadingImages.value = true
  try {
    // 这里应该调用图片上传API
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟上传成功，将图片插入到编辑器
    imageFiles.value.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target.result
        const imageTag = editorMode.value === 'markdown' 
          ? `![图片](<${imageUrl}>)` 
          : `<img src="${imageUrl}" alt="上传图片">`
        
        // 插入到当前光标位置
        if (editorMode.value === 'markdown') {
          insertMarkdown(imageTag)
        } else {
          insertRichText(imageTag)
        }
      }
      reader.readAsDataURL(file.raw)
    })
    
    ElMessage.success(`成功上传${imageFiles.value.length}张图片`)
    imageUploadDialogVisible.value = false
    imageFiles.value = []
  } catch (error) {
    console.error('上传图片失败:', error)
    ElMessage.error('上传图片失败')
  } finally {
    uploadingImages.value = false
  }
}

// 保存草稿
const handleSaveDraft = async () => {
  // 验证表单
  const valid = await articleFormRef.value.validate()
  if (!valid) return
  
  // 设置草稿状态
  saving.value = true
  try {
    // 准备提交数据
    const formData = prepareFormData()
    formData.status = 'draft'
    
    let result
    if (isEditMode.value) {
      result = await articleStore.updateArticle(formData)
    } else {
      result = await articleStore.createArticle(formData)
    }
    
    ElMessage.success('草稿保存成功')
    
    // 如果是新建文章，保存后更新文章ID
    if (!isEditMode.value && result && result.id) {
      articleForm.id = result.id
    }
  } catch (error) {
    console.error('保存草稿失败:', error)
    ElMessage.error('保存草稿失败')
  } finally {
    saving.value = false
  }
}

// 发布文章
const handlePublish = async () => {
  // 验证表单
  const valid = await articleFormRef.value.validate()
  if (!valid) return
  
  // 确认发布
  const confirm = await ElMessageBox.confirm(
    isEditMode.value ? '确定要更新这篇文章吗？' : '确定要发布这篇文章吗？',
    isEditMode.value ? '更新确认' : '发布确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
  
  if (confirm) {
    publishing.value = true
    try {
      // 准备提交数据
      const formData = prepareFormData()
      formData.status = articleForm.enableSchedule ? 'scheduled' : 'published'
      
      let result
      if (isEditMode.value) {
        result = await articleStore.updateArticle(formData)
      } else {
        result = await articleStore.createArticle(formData)
      }
      
      ElMessage.success(isEditMode.value ? '文章更新成功' : '文章发布成功')
      
      // 跳转到文章详情页
      if (result && result.id) {
        router.push(`/article/${result.id}`)
      }
    } catch (error) {
      console.error(isEditMode.value ? '更新文章失败' : '发布文章失败', error)
      ElMessage.error(isEditMode.value ? '更新文章失败' : '发布文章失败')
    } finally {
      publishing.value = false
    }
  }
}

// 取消编辑
const handleCancel = () => {
  if (articleForm.title || articleForm.content || articleForm.tags.length > 0) {
    ElMessageBox.confirm(
      '当前内容尚未保存，确定要离开吗？',
      '确认离开',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      router.go(-1)
    }).catch(() => {
      // 取消离开
    })
  } else {
    router.go(-1)
  }
}

// 准备表单数据
const prepareFormData = () => {
  // 处理分类ID
  let categoryId = articleForm.categoryId
  if (Array.isArray(categoryValue.value) && categoryValue.value.length > 0) {
    categoryId = categoryValue.value[categoryValue.value.length - 1] // 使用最后一级分类ID
  }
  
  // 如果没有提供摘要，自动生成
  let summary = articleForm.summary
  if (!summary && articleForm.content) {
    // 从内容中提取纯文本作为摘要
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = articleForm.content.replace(/```[\s\S]*?```/g, '') // 移除代码块
    const plainText = tempDiv.textContent || tempDiv.innerText || ''
    summary = plainText.substring(0, 200) + (plainText.length > 200 ? '...' : '')
  }
  
  // 格式化标签数据为后端期望的格式（{id, name}数组）
  const formattedTags = articleForm.tags.map((tag, index) => {
    if (typeof tag === 'object' && tag !== null) {
      return {
        id: tag.id || `temp-${index}-${Date.now()}`, // 使用临时ID
        name: tag.name || String(tag)
      };
    } else {
      // 对于字符串标签，创建临时ID
      return {
        id: `temp-${index}-${Date.now()}`,
        name: String(tag)
      };
    }
  })

  return {
    id: articleForm.id,
    title: articleForm.title.trim(),
    subtitle: articleForm.subtitle.trim(),
    coverImage: articleForm.coverImage,
    categoryId: categoryId,
    tags: formattedTags,
    content: articleForm.content.trim(),
    summary: summary.trim(),
    allowComments: articleForm.allowComments,
    isPublic: articleForm.isPublic,
    isFeatured: articleForm.isFeatured,
    enableSchedule: articleForm.enableSchedule,
    scheduledTime: articleForm.scheduledTime
  }
}

// 监听分类选择变化
watch(
  () => categoryValue.value,
  (newValue) => {
    if (Array.isArray(newValue) && newValue.length > 0) {
      articleForm.categoryId = newValue[newValue.length - 1] // 使用最后一级分类ID
    } else {
      articleForm.categoryId = null
    }
  }
)

// 监听编辑器模式变化，添加快捷键支持
watch(
  () => editorMode.value,
  (newMode) => {
    if (newMode === 'markdown') {
      // 为Markdown编辑器添加快捷键
      const handleKeyDown = (e) => {
        // Ctrl/Cmd + S 保存草稿
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
          e.preventDefault()
          if (canSave.value) {
            handleSaveDraft()
          }
        }
        // Ctrl/Cmd + Enter 发布
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault()
          if (canPublish.value) {
            handlePublish()
          }
        }
      }
      
      const textarea = markdownTextareaRef.value?.$el.querySelector('textarea')
      if (textarea) {
        textarea.addEventListener('keydown', handleKeyDown)
        
        // 清理函数
        return () => {
          textarea.removeEventListener('keydown', handleKeyDown)
        }
      }
    }
  },
  { immediate: true }
)

// 页面加载时初始化
onMounted(async () => {
  // 检查用户登录状态
  const isLoggedIn = await authStore.checkLoginStatus()
  if (!isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  // 初始化分类数据
  await initCategories()
  
  // 如果是编辑模式，加载文章数据
  if (isEditMode.value) {
    await loadArticleData()
  }
})
</script>

<style scoped>
.article-edit-container {
  max-width: 1200px;
  margin: 0 auto;
}

.edit-card {
  margin-bottom: 30px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

/* 自定义标签样式 */
.custom-tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 0;
  min-height: 40px;
}

.custom-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background-color: #f0f2f5;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  position: relative;
}

.custom-tag.tag-disabled {
  background-color: #f5f7fa;
  color: #c0c4cc;
  border-color: #ebeef5;
}

.tag-remove {
  margin-left: 6px;
  cursor: pointer;
  font-size: 16px;
  color: #909399;
  font-weight: bold;
}

.tag-remove:hover {
  color: #f56c6c;
}

.tag-input-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.tag-input {
  padding: 4px 30px 4px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  width: 120px;
  background-color: transparent;
}

.tag-input:focus {
  border-color: #409eff;
}

.add-icon {
  position: absolute;
  right: 10px;
  cursor: pointer;
  font-size: 16px;
  color: #409eff;
  font-weight: bold;
}

.add-icon:hover {
  color: #66b1ff;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.article-form {
  margin-top: 20px;
}

.cover-image-upload {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cover-preview {
  position: relative;
  display: inline-block;
}

.cover-preview img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
}

.cover-preview .el-button {
  position: absolute;
  top: 10px;
  right: 10px;
}

.no-category-tip {
  margin-top: 10px;
}

.editor-mode-switch {
  margin: 20px 0;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.markdown-editor,
.rich-editor {
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  overflow: hidden;
}

.editor-toolbar {
  padding: 10px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #dcdfe6;
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.editor-content {
  width: 100%;
}

.markdown-textarea {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
}

.rich-text-content {
  min-height: 400px;
  padding: 15px;
  font-size: 14px;
  line-height: 1.6;
  outline: none;
}

.rich-text-content:empty::before {
  content: '请开始输入内容...';
  color: #909399;
}

.tip-text {
  color: #909399;
  font-size: 12px;
  margin-top: 5px;
}

.image-uploader {
  margin-top: 15px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .editor-toolbar {
    flex-wrap: wrap;
  }
}
</style>