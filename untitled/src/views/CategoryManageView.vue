<template>
  <div class="category-manage">
    <el-card class="mb-4">
      <template #header>
        <div class="card-header">
          <span>分类管理</span>
          <el-button type="primary" @click="showAddDialog">添加分类</el-button>
        </div>
      </template>
      
      <div class="filter-container mb-4">
        <el-input 
          v-model="searchKeyword" 
          placeholder="搜索分类名称" 
          prefix-icon="Search" 
          class="mr-2"
          @keyup.enter="handleSearch"
        />
        <el-button @click="handleSearch">搜索</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </div>
      
      <el-tree
        v-loading="categoryStore.isLoading"
        :data="categoryStore.categoriesTree"
        :props="treeProps"
        :expand-on-click-node="false"
        @node-click="handleNodeClick"
        node-key="id"
        class="category-tree"
      >
        <template #default="{ node, data }">
          <div class="tree-node-content">
            <span>{{ data.name }}</span>
            <div class="node-actions">
              <el-button type="text" size="small" @click.stop="showEditDialog(data)">编辑</el-button>
              <el-button type="text" size="small" @click.stop="showAddSubDialog(data.id)">添加子分类</el-button>
              <el-button type="text" size="small" danger @click.stop="handleDelete(data)">删除</el-button>
            </div>
          </div>
        </template>
      </el-tree>
    </el-card>
    
    <!-- 添加/编辑分类对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      @close="handleDialogClose"
    >
      <el-form
        ref="categoryFormRef"
        :model="categoryForm"
        :rules="categoryRules"
        label-width="80px"
      >
        <el-form-item label="上级分类" prop="parentId">
          <el-select
            v-model="categoryForm.parentId"
            placeholder="选择上级分类"
            filterable
          >
            <el-option label="无（顶级分类）" :value="null" />
            <el-option
              v-for="cat in selectableCategories"
              :key="cat.id"
              :label="cat.name"
              :value="cat.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        
        <el-form-item label="分类描述" prop="description">
          <el-input
            v-model="categoryForm.description"
            placeholder="请输入分类描述（可选）"
            type="textarea"
            rows="3"
          />
        </el-form-item>
        
        <el-form-item label="分类图标" prop="icon">
          <el-input v-model="categoryForm.icon" placeholder="请输入分类图标（可选）" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="handleDialogClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useCategoryStore } from '../stores/categoryStore';

// 分类store
const categoryStore = useCategoryStore();

// 响应式数据
const searchKeyword = ref('');
const dialogVisible = ref(false);
const categoryFormRef = ref(null);
const categoryForm = reactive({
  id: '',
  name: '',
  parentId: null,
  description: '',
  icon: ''
});
const dialogMode = ref('add'); // 'add', 'edit', 'addSub'
const parentIdForSubCategory = ref(null);

// 树配置
const treeProps = {
  children: 'children',
  label: (data) => data.name
};

// 表单验证规则
const categoryRules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 1, max: 50, message: '分类名称长度在 1 到 50 个字符', trigger: 'blur' }
  ]
};

// 计算属性
const dialogTitle = computed(() => {
  if (dialogMode.value === 'edit') return '编辑分类';
  if (dialogMode.value === 'addSub') return '添加子分类';
  return '添加分类';
});

// 可选择的上级分类（排除自身和其子分类）
const selectableCategories = computed(() => {
  const excludeIds = new Set();
  if (categoryForm.id) {
    // 排除当前编辑的分类及其所有子分类
    const collectChildIds = (id) => {
      const category = categoryStore.getCategoryById(id);
      if (category) {
        excludeIds.add(id);
        const children = categoryStore.categoriesList.filter(c => c.parentId === id);
        children.forEach(child => collectChildIds(child.id));
      }
    };
    collectChildIds(categoryForm.id);
  }
  
  return categoryStore.flatCategories.filter(cat => !excludeIds.has(cat.id));
});

// 方法
// 初始化
const initData = async () => {
  try {
    await categoryStore.fetchCategories();
  } catch (error) {
    ElMessage.error('获取分类列表失败');
  }
};

// 搜索
const handleSearch = async () => {
  try {
    await categoryStore.fetchCategories({ keyword: searchKeyword.value });
  } catch (error) {
    ElMessage.error('搜索分类失败');
  }
};

// 重置搜索
const resetSearch = () => {
  searchKeyword.value = '';
  initData();
};

// 显示添加对话框
const showAddDialog = () => {
  resetForm();
  dialogMode.value = 'add';
  dialogVisible.value = true;
};

// 显示添加子分类对话框
const showAddSubDialog = (parentId) => {
  resetForm();
  categoryForm.parentId = parentId;
  parentIdForSubCategory.value = parentId;
  dialogMode.value = 'addSub';
  dialogVisible.value = true;
};

// 显示编辑对话框
const showEditDialog = (category) => {
  dialogMode.value = 'edit';
  categoryForm.id = category.id;
  categoryForm.name = category.name;
  categoryForm.parentId = category.parentId;
  categoryForm.description = category.description || '';
  categoryForm.icon = category.icon || '';
  dialogVisible.value = true;
};

// 重置表单
const resetForm = () => {
  if (categoryFormRef.value) {
    categoryFormRef.value.resetFields();
  }
  categoryForm.id = '';
  categoryForm.name = '';
  categoryForm.parentId = null;
  categoryForm.description = '';
  categoryForm.icon = '';
  parentIdForSubCategory.value = null;
};

// 处理对话框关闭
const handleDialogClose = () => {
  resetForm();
  dialogVisible.value = false;
};

// 处理节点点击
const handleNodeClick = (data) => {
  console.log('点击了分类:', data);
};

// 提交表单
const handleSubmit = async () => {
  try {
    await categoryFormRef.value.validate();
    
    // 检查名称是否重复
    if (categoryStore.isCategoryNameExists(categoryForm.name, categoryForm.id)) {
      ElMessage.error('分类名称已存在');
      return;
    }
    
    let result;
    if (dialogMode.value === 'edit') {
      result = await categoryStore.updateCategory(categoryForm.id, {
        name: categoryForm.name,
        parentId: categoryForm.parentId,
        description: categoryForm.description,
        icon: categoryForm.icon
      });
      ElMessage.success('分类更新成功');
    } else {
      result = await categoryStore.createCategory({
        name: categoryForm.name,
        parentId: categoryForm.parentId,
        description: categoryForm.description,
        icon: categoryForm.icon
      });
      ElMessage.success('分类创建成功');
    }
    
    handleDialogClose();
  } catch (error) {
    if (error === false) return; // 表单验证失败
    ElMessage.error(error.message || '操作失败');
  }
};

// 删除分类
const handleDelete = async (category) => {
  try {
    // 检查是否有子分类
    const hasChildren = categoryStore.categoriesList.some(cat => cat.parentId === category.id);
    if (hasChildren) {
      ElMessage.warning('该分类下还有子分类，无法删除');
      return;
    }
    
    await ElMessageBox.confirm(
      `确定要删除分类「${category.name}」吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    await categoryStore.deleteCategory(category.id);
    ElMessage.success('分类删除成功');
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败');
    }
  }
};

// 组件挂载时初始化数据
onMounted(() => {
  initData();
});
</script>

<style scoped>
.category-manage {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-container {
  display: flex;
  align-items: center;
}

.mr-2 {
  margin-right: 10px;
}

.category-tree {
  margin-top: 20px;
}

.tree-node-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.node-actions {
  display: flex;
  gap: 8px;
}

/* 树形图样式优化 */
.el-tree :deep(.el-tree-node__content) {
  padding: 8px 0;
}

.el-tree :deep(.el-tree-node__content:hover) {
  background-color: #f5f7fa;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .filter-container {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }
  
  .card-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .tree-node-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .node-actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>