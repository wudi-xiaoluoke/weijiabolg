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
          <div class="tag-container">
            <!-- 已添加的标签 -->
            <el-tag
              v-for="(tag, index) in tagList"
              :key="index"
              closable
              @close="removeTag(index)"
              class="tag-item"
            >
              {{ tag }}
            </el-tag>
            
            <!-- 标签输入框 -->
            <el-input
              v-model="tagInput"
              placeholder="输入标签后按回车添加"
              class="tag-input"
              @keyup.enter="addTag"
              @blur="handleInputBlur"
              clearable
            />
          </div>
          <div class="form-tip">输入标签后按回车添加，最多添加10个标签</div>
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
            <el-radio :label="0">草稿</el-radio>
            <el-radio :label="1">已发布</el-radio>
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
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, UploadFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { articleAPI, categoryAPI, tagAPI } from '../../api/index.js'

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
  tags: '', // 用于表单提交，保持兼容性
  coverImage: '',
  content: '',
  summary: '',
  status: 0 // 默认草稿状态，对应后端的0值
})

// 标签相关状态
const tagList = ref([]) // 标签数组
const tagInput = ref('') // 标签输入框的值

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
  ],
  tags: [
    // tags验证通过tagList进行，这里保持空数组以避免验证错误
  ]
}

// 分类列表
const categories = ref([])

// 加载分类数据
const loadCategories = async () => {
  try {
    // 向API发送请求获取真实分类数据
    console.log('开始获取分类数据...')
    
    // 为了调试，添加请求前后的时间戳
    const startTime = Date.now()
    
    // 使用getFlatCategories方法获取扁平化的全部分类列表
    // 这个方法名称明确表示它返回扁平化的分类，应该不会有分页限制
    console.log('使用getFlatCategories方法获取扁平化分类列表')
    let response = await categoryAPI.getFlatCategories()
    
    const endTime = Date.now()
    
    console.log(`API请求耗时: ${endTime - startTime}ms`)
    console.log('API响应数据类型:', typeof response)
    console.log('API响应数据:', response)
    
    // 处理各种可能的数据格式
    let categoriesData = []
    
    // 直接检查响应是否为数组
    if (Array.isArray(response)) {
      categoriesData = response
      console.log('响应是数组格式，直接使用，数组长度:', response.length)
    } 
    // 如果是对象，检查常见的列表字段
    else if (typeof response === 'object' && response !== null) {
      // 检查是否为分页数据格式
      if (response.records || response.list || response.items || response.data) {
        categoriesData = response.records || response.list || response.items || response.data || []
        console.log('响应是对象格式，提取列表数据，数据长度:', categoriesData.length)
        
        // 如果是分页数据，记录分页信息
        if (response.total || response.page || response.size) {
          console.log('分页信息:', {
            total: response.total,
            page: response.page,
            pageSize: response.size || response.pageSize
          })
        }
      } 
      // 检查是否为单个分类对象
      else if (response.id || response.name) {
        categoriesData = [response]
        console.log('响应是单个分类对象，包装为数组')
      } else {
        console.log('响应是对象但不包含预期的数据结构')
        // 打印对象的所有键，以便调试
        console.log('响应对象的键:', Object.keys(response))
        // 尝试打印整个响应对象的字符串表示
        try {
          console.log('完整响应对象:', JSON.stringify(response, null, 2))
        } catch (stringifyError) {
          console.log('无法序列化响应对象:', stringifyError.message)
        }
      }
    } else {
      console.log('响应不是数组或对象，无法处理')
    }
    
    console.log('处理后的分类数据:', categoriesData)
    console.log('分类数据长度:', categoriesData.length)
    
    // 转换数据格式以适应下拉框组件
    if (Array.isArray(categoriesData) && categoriesData.length > 0) {
      categories.value = categoriesData.map(cat => {
        // 打印每个分类对象的结构，以便调试
        console.log('分类对象:', cat)
        return {
          // 兼容多种可能的字段名
          label: cat.name || cat.categoryName || cat.category_name || '未命名分类',
          value: (cat.id || cat.categoryId || cat.category_id || cat.key).toString()
        }
      })
      console.log('成功转换分类数据:', categories.value)
      ElMessage.success(`成功加载 ${categories.value.length} 个分类`)
    } else {
      console.warn('未获取到有效分类数据')
      // 这里不使用备份数据，只显示警告信息
      ElMessage.warning('暂未获取到分类数据，请确认后端服务是否正常运行')
    }
  } catch (error) {
    console.error('加载分类失败:', error)
    // 详细打印错误信息
    if (error.response) {
      // 服务器返回了错误响应
      console.error('HTTP错误状态:', error.response.status)
      console.error('HTTP错误数据:', error.response.data)
    } else if (error.request) {
      // 请求已发送但没有收到响应
      console.error('网络错误，没有收到响应:', error.request)
    } else {
      // 请求配置出错
      console.error('请求配置错误:', error.message)
    }
    ElMessage.error('获取分类失败，请检查网络连接或确认后端服务是否正常运行')
  }
}

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

// 添加标签
const addTag = () => {
  const tag = tagInput.value.trim();
  
  // 验证标签
  if (!tag) return;
  
  // 检查标签是否已存在
  if (tagList.value.includes(tag)) {
    ElMessage.warning('该标签已存在');
    tagInput.value = '';
    return;
  }
  
  // 检查标签数量限制
  if (tagList.value.length >= 10) {
    ElMessage.warning('最多只能添加10个标签');
    return;
  }
  
  // 检查标签长度
  if (tag.length > 20) {
    ElMessage.warning('标签长度不能超过20个字符');
    return;
  }
  
  // 添加标签
  tagList.value.push(tag);
  tagInput.value = '';
  
  // 更新articleForm.tags用于表单提交
  updateArticleFormTags();
};

// 移除标签
const removeTag = (index) => {
  tagList.value.splice(index, 1);
  // 更新articleForm.tags用于表单提交
  updateArticleFormTags();
};

// 处理输入框失焦事件
const handleInputBlur = () => {
  // 如果输入框有内容，自动添加标签
  if (tagInput.value.trim()) {
    addTag();
  }
};

// 更新articleForm.tags用于表单提交
const updateArticleFormTags = () => {
  articleForm.tags = tagList.value.join(',');
};

// 监听tagList变化，自动更新articleForm.tags
watch(tagList, () => {
  updateArticleFormTags();
}, { deep: true });

// 获取文章详情
const getArticleDetail = async () => {
  try {
    console.log('获取文章详情，文章ID:', articleId);
    const response = await articleAPI.getArticleById(articleId);
    console.log('文章详情获取成功:', response);
    
    // 从response.data中获取实际数据（根据API返回格式）
    const articleData = response.data || response;
    
    // 根据后端返回的数据结构填充表单
    articleForm.title = articleData.title || '';
    // 设置分类ID而不是名称
    articleForm.category = articleData.categoryId ? articleData.categoryId.toString() : '';
    
    // 设置标签列表
    if (articleData.tags) {
      if (Array.isArray(articleData.tags)) {
        // 提取标签对象的name属性，或者使用标签文本本身
        // 这里我们只保存标签名称，因为tagList用于显示
        tagList.value = articleData.tags.map(tag => {
          if (typeof tag === 'object') {
            // 如果是对象，优先使用name属性
            if (tag.name) {
              return tag.name;
            }
            // 如果有id属性但没有name，可能需要进一步处理
            if (tag.id) {
              console.warn('标签对象有ID但没有名称:', tag.id);
              return `标签${tag.id}`;
            }
          }
          // 如果是字符串，直接返回
          return typeof tag === 'string' ? tag : String(tag);
        }).filter(tag => tag && tag.trim());
      } else {
        // 如果是逗号分隔的字符串，分割后处理
        tagList.value = articleData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      }
    } else {
      tagList.value = [];
    }
    
    // 确保articleForm.tags也被更新
    updateArticleFormTags();
    
    articleForm.coverImage = articleData.coverImage || articleData.cover_url || '';
    articleForm.content = articleData.content || '';
    articleForm.summary = articleData.summary || '';
    articleForm.status = articleData.status === '0' ? 'draft' : 'published'; // 根据状态码转换
    
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
        // 准备发送给后端的数据
        // 注意：后端期望tagIds是整数数组
        const formData = {
          title: articleForm.title,
          categoryId: parseInt(articleForm.category), // 使用categoryId而不是category
          tagIds: [], // 初始化空数组
          coverImage: articleForm.coverImage,
          content: articleForm.content,
          summary: articleForm.summary,
          status: articleForm.status === 'draft' ? 0 : 1 // 确保状态为Integer类型
        };
        
        // 由于我们的tagList中存储的是标签名称，而不是ID
        // 这里我们需要一个映射机制来获取每个标签对应的ID
        // 注意：这是一个简化的实现，实际项目中应该有更完善的标签管理
        if (tagList.value.length > 0) {
          // 从API获取所有标签，以便查找标签ID
          try {
            // 获取标签列表
            const tagsResponse = await tagAPI.getTags();
            const allTags = Array.isArray(tagsResponse) ? tagsResponse : (tagsResponse.data || []);
            
            // 创建标签名称到ID的映射
            const tagMap = {};
            allTags.forEach(tag => {
              if (tag.name && tag.id) {
                tagMap[tag.name] = tag.id;
              }
            });
            
            // 根据标签名称查找对应的ID
            formData.tagIds = tagList.value
              .map(tagName => {
                // 如果标签名称在映射中存在，使用对应的ID
                if (tagMap[tagName]) {
                  return tagMap[tagName];
                }
                // 如果标签名称是纯数字，直接转换为整数
                if (/^\d+$/.test(tagName)) {
                  return parseInt(tagName);
                }
                // 如果找不到对应的ID，记录警告
                console.warn(`未找到标签名称 "${tagName}" 对应的ID`);
                return null;
              })
              .filter(id => id !== null); // 过滤掉无效的ID
              
            // 如果没有找到任何有效的标签ID，使用空数组
            if (formData.tagIds.length === 0) {
              formData.tagIds = [];
            }
          } catch (error) {
            console.error('获取标签列表失败:', error);
            ElMessage.warning('获取标签信息失败，将使用空标签');
            formData.tagIds = [];
          }
        }
        
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
onMounted(async () => {
  // 加载分类数据
  await loadCategories()
  
  if (isEditMode.value) {
    await getArticleDetail();
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

/* 标签样式 */
.tag-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  min-height: 32px;
  align-items: center;
}

.tag-item {
  margin-bottom: 0;
}

.tag-input {
  width: auto;
  min-width: 120px;
  border: none;
  outline: none;
  padding: 0;
}

.tag-input .el-input__wrapper {
  box-shadow: none;
}

.tag-input:focus-within .el-input__wrapper {
  box-shadow: 0 0 0 1px #409eff;
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
  
  .tag-input {
    min-width: 100px;
  }
}
</style>