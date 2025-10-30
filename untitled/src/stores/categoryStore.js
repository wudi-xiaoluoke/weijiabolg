import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { categoryAPI } from '../api';

export const useCategoryStore = defineStore('category', () => {
  // 状态
  const categories = ref([]);
  const flatCategories = ref([]);
  const currentCategory = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const total = ref(0);
  
  // 计算属性
  const categoriesList = computed(() => categories.value);
  const categoriesFlatList = computed(() => flatCategories.value);
  const currentCategoryInfo = computed(() => currentCategory.value);
  const isLoading = computed(() => loading.value);
  const hasError = computed(() => !!error.value);
  const errorMessage = computed(() => error.value);
  const totalCategories = computed(() => total.value);
  
  // 获取分类的子分类
  const getSubCategories = (parentId) => {
    return computed(() => {
      return categories.value.filter(cat => cat.parentId === parentId);
    });
  };
  
  // 递归构建树形结构
  const buildTree = (items, parentId = null) => {
    const tree = [];
    
    // 检查items是否有效
    if (!items || !Array.isArray(items)) {
      return tree;
    }
    
    // 特殊处理：如果只有一条数据且没有parentId字段，直接作为顶级节点返回
    if (items.length === 1 && !items[0].parentId) {
      return [{
        ...items[0],
        children: []
      }];
    }
    
    items.forEach(item => {
      // 安全检查：确保item是有效的对象
      if (!item || typeof item !== 'object') {
        return;
      }
      
      // 更宽松的顶级节点判断逻辑，确保能捕获到没有parentId的记录
      const isTopLevel = parentId === null && (!item.parentId || item.parentId === 0 || item.parentId === null || item.parentId === undefined);
      const isChildNode = parentId !== null && item.parentId === parentId;
      
      if (isTopLevel || isChildNode) {
        const node = { ...item };
        // 确保每个节点都有children属性
        const children = buildTree(items, item.id);
        node.children = children.length > 0 ? children : [];
        
        tree.push(node);
      }
    });
    
    return tree;
  };
  
  // 获取树形分类结构
  const categoriesTree = computed(() => {
    return buildTree(categories.value);
  });
  
  // 操作
  // 获取分类列表
  const fetchCategories = async (params = {}) => {
    loading.value = true;
    error.value = null;
    
    try {
      const result = await categoryAPI.getCategories(params);
      
      if (result.data) {
        categories.value = result.data;
        total.value = result.total || result.data.length;
      } else {
        categories.value = result;
        total.value = result.length;
      }
      
      // 如果需要扁平化列表，同时获取
      if (params.includeFlat !== false) {
        await fetchFlatCategories();
      }
      
      return result;
    } catch (err) {
      error.value = err.message || '获取分类列表失败';
      console.error('Failed to fetch categories:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  // 获取扁平化分类列表
  const fetchFlatCategories = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      const result = await categoryAPI.getFlatCategories();
      
      flatCategories.value = result.data || result;
      return result;
    } catch (err) {
      error.value = err.message || '获取扁平化分类列表失败';
      console.error('Failed to fetch flat categories:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  // 获取分类详情
  const fetchCategoryById = async (id) => {
    loading.value = true;
    error.value = null;
    
    try {
      const result = await categoryAPI.getCategoryById(id);
      currentCategory.value = result;
      return result;
    } catch (err) {
      error.value = err.message || '获取分类详情失败';
      console.error(`Failed to fetch category ${id}:`, err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  // 获取子分类
  const fetchSubCategories = async (parentId) => {
    loading.value = true;
    error.value = null;
    
    try {
      const result = await categoryAPI.getSubCategories(parentId);
      return result.data || result;
    } catch (err) {
      error.value = err.message || '获取子分类失败';
      console.error(`Failed to fetch subcategories for parent ${parentId}:`, err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  // 创建分类
  const createCategory = async (categoryData) => {
    loading.value = true;
    error.value = null;
    
    try {
      const newCategory = await categoryAPI.createCategory(categoryData);
      
      // 更新本地状态
      categories.value.push(newCategory);
      if (flatCategories.value.length > 0) {
        flatCategories.value.push(newCategory);
      }
      total.value++;
      
      return newCategory;
    } catch (err) {
      error.value = err.message || '创建分类失败';
      console.error('Failed to create category:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  // 更新分类
  const updateCategory = async (id, categoryData) => {
    loading.value = true;
    error.value = null;
    
    try {
      const updatedCategory = await categoryAPI.updateCategory(id, categoryData);
      
      // 更新本地状态
      const index = categories.value.findIndex(cat => cat.id === id);
      if (index !== -1) {
        categories.value[index] = updatedCategory;
      }
      
      // 更新扁平化列表
      const flatIndex = flatCategories.value.findIndex(cat => cat.id === id);
      if (flatIndex !== -1) {
        flatCategories.value[flatIndex] = updatedCategory;
      }
      
      if (currentCategory.value && currentCategory.value.id === id) {
        currentCategory.value = updatedCategory;
      }
      
      return updatedCategory;
    } catch (err) {
      error.value = err.message || '更新分类失败';
      console.error(`Failed to update category ${id}:`, err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  // 删除分类
  const deleteCategory = async (id) => {
    loading.value = true;
    error.value = null;
    
    try {
      // 检查是否有子分类
      const hasChildren = categories.value.some(cat => cat.parentId === id);
      if (hasChildren) {
        throw new Error('该分类下还有子分类，无法删除');
      }
      
      const result = await categoryAPI.deleteCategory(id);
      
      // 更新本地状态
      categories.value = categories.value.filter(cat => cat.id !== id);
      flatCategories.value = flatCategories.value.filter(cat => cat.id !== id);
      total.value--;
      
      if (currentCategory.value && currentCategory.value.id === id) {
        currentCategory.value = null;
      }
      
      return result;
    } catch (err) {
      error.value = err.message || '删除分类失败';
      console.error(`Failed to delete category ${id}:`, err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  // 根据ID获取分类信息（从本地缓存）
  const getCategoryById = (id) => {
    return categories.value.find(cat => cat.id === id) || null;
  };
  
  // 根据slug获取分类信息
  const getCategoryBySlug = (slug) => {
    return categories.value.find(cat => cat.slug === slug) || null;
  };
  
  // 检查分类名称是否已存在
  const isCategoryNameExists = (name, excludeId = null) => {
    return categories.value.some(cat => 
      cat.name.toLowerCase() === name.toLowerCase() && 
      cat.id !== excludeId
    );
  };
  
  // 检查分类slug是否已存在
  const isCategorySlugExists = (slug, excludeId = null) => {
    return categories.value.some(cat => 
      cat.slug.toLowerCase() === slug.toLowerCase() && 
      cat.id !== excludeId
    );
  };
  
  // 清除当前分类
  const clearCurrentCategory = () => {
    currentCategory.value = null;
  };
  
  // 清除错误
  const clearError = () => {
    error.value = null;
  };
  
  // 重置状态
  const resetState = () => {
    categories.value = [];
    flatCategories.value = [];
    currentCategory.value = null;
    loading.value = false;
    error.value = null;
    total.value = 0;
  };
  
  return {
    // 状态
    categories,
    flatCategories,
    currentCategory,
    loading,
    error,
    total,
    
    // 计算属性
    categoriesList,
    categoriesFlatList,
    currentCategoryInfo,
    isLoading,
    hasError,
    errorMessage,
    totalCategories,
    categoriesTree,
    
    // 方法
    getSubCategories,
    fetchCategories,
    fetchFlatCategories,
    fetchCategoryById,
    fetchSubCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    getCategoryBySlug,
    isCategoryNameExists,
    isCategorySlugExists,
    clearCurrentCategory,
    clearError,
    resetState
  };
});