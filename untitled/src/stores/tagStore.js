import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { tagAPI } from '../api';

export const useTagStore = defineStore('tag', () => {
  // 状态
  const tags = ref([]);
  const popularTags = ref([]);
  const currentTag = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const total = ref(0);
  
  // 计算属性
  const tagsList = computed(() => tags.value);
  const popularTagsList = computed(() => popularTags.value);
  const currentTagInfo = computed(() => currentTag.value);
  const isLoading = computed(() => loading.value);
  const hasError = computed(() => !!error.value);
  const errorMessage = computed(() => error.value);
  const totalTags = computed(() => total.value);
  
  // 操作
  // 获取标签列表
  const fetchTags = async (params = {}) => {
    loading.value = true;
    error.value = null;
    
    try {
      const result = await tagAPI.getTags(params);
      
      if (result.data) {
        tags.value = result.data;
        total.value = result.total || result.data.length;
      } else {
        tags.value = result;
        total.value = result.length;
      }
      
      return result;
    } catch (err) {
      error.value = err.message || '获取标签列表失败';
      console.error('Failed to fetch tags:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  // 获取热门标签
  const fetchPopularTags = async (limit = 10) => {
    loading.value = true;
    error.value = null;
    
    try {
      const result = await tagAPI.getPopularTags(limit);
      
      popularTags.value = result.data || result;
      return result;
    } catch (err) {
      error.value = err.message || '获取热门标签失败';
      console.error('Failed to fetch popular tags:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  // 搜索标签
  const searchTags = async (keyword) => {
    loading.value = true;
    error.value = null;
    
    try {
      const result = await tagAPI.searchTags(keyword);
      return result.data || result;
    } catch (err) {
      error.value = err.message || '搜索标签失败';
      console.error(`Failed to search tags with keyword ${keyword}:`, err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  // 创建标签
  const createTag = async (tagData) => {
    loading.value = true;
    error.value = null;
    
    try {
      // 检查标签名是否已存在
      if (isTagNameExists(tagData.name)) {
        throw new Error('标签名已存在');
      }
      
      // 检查slug是否已存在
      const slug = generateSlug(tagData.name);
      if (isTagSlugExists(slug)) {
        throw new Error('标签标识已存在');
      }
      
      const newTagData = {
        ...tagData,
        slug: slug
      };
      
      const newTag = await tagAPI.createTag(newTagData);
      
      // 更新本地状态
      tags.value.push(newTag);
      total.value++;
      
      return newTag;
    } catch (err) {
      error.value = err.message || '创建标签失败';
      console.error('Failed to create tag:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  // 更新标签
  const updateTag = async (id, tagData) => {
    loading.value = true;
    error.value = null;
    
    try {
      // 检查标签名是否已存在（排除当前标签）
      if (tagData.name && isTagNameExists(tagData.name, id)) {
        throw new Error('标签名已存在');
      }
      
      // 处理slug
      const updatedData = { ...tagData };
      if (tagData.name) {
        updatedData.slug = generateSlug(tagData.name);
        // 检查slug是否已存在（排除当前标签）
        if (isTagSlugExists(updatedData.slug, id)) {
          throw new Error('标签标识已存在');
        }
      }
      
      const updatedTag = await tagAPI.updateTag(id, updatedData);
      
      // 更新本地状态
      const index = tags.value.findIndex(tag => tag.id === id);
      if (index !== -1) {
        tags.value[index] = updatedTag;
      }
      
      if (currentTag.value && currentTag.value.id === id) {
        currentTag.value = updatedTag;
      }
      
      return updatedTag;
    } catch (err) {
      error.value = err.message || '更新标签失败';
      console.error(`Failed to update tag ${id}:`, err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  // 删除标签
  const deleteTag = async (id) => {
    loading.value = true;
    error.value = null;
    
    try {
      const result = await tagAPI.deleteTag(id);
      
      // 更新本地状态
      tags.value = tags.value.filter(tag => tag.id !== id);
      popularTags.value = popularTags.value.filter(tag => tag.id !== id);
      total.value--;
      
      if (currentTag.value && currentTag.value.id === id) {
        currentTag.value = null;
      }
      
      return result;
    } catch (err) {
      error.value = err.message || '删除标签失败';
      console.error(`Failed to delete tag ${id}:`, err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  // 批量创建标签
  const createTagsBatch = async (tagNames) => {
    loading.value = true;
    error.value = null;
    
    try {
      const createdTags = [];
      const errors = [];
      
      for (const name of tagNames) {
        try {
          if (!isTagNameExists(name)) {
            const tag = await createTag({ name });
            createdTags.push(tag);
          }
        } catch (err) {
          errors.push({ name, error: err.message });
        }
      }
      
      if (errors.length > 0) {
        throw new Error(`部分标签创建失败: ${errors.map(e => `${e.name}: ${e.error}`).join(', ')}`);
      }
      
      return createdTags;
    } catch (err) {
      error.value = err.message || '批量创建标签失败';
      console.error('Failed to create tags in batch:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  // 根据ID获取标签信息（从本地缓存）
  const getTagById = (id) => {
    return tags.value.find(tag => tag.id === id) || null;
  };
  
  // 根据slug获取标签信息
  const getTagBySlug = (slug) => {
    return tags.value.find(tag => tag.slug === slug) || null;
  };
  
  // 根据ID列表获取标签信息
  const getTagsByIds = (ids) => {
    return tags.value.filter(tag => ids.includes(tag.id));
  };
  
  // 检查标签名是否已存在
  const isTagNameExists = (name, excludeId = null) => {
    return tags.value.some(tag => 
      tag.name.toLowerCase() === name.toLowerCase() && 
      tag.id !== excludeId
    );
  };
  
  // 检查标签slug是否已存在
  const isTagSlugExists = (slug, excludeId = null) => {
    return tags.value.some(tag => 
      tag.slug.toLowerCase() === slug.toLowerCase() && 
      tag.id !== excludeId
    );
  };
  
  // 生成slug
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .trim();
  };
  
  // 清除当前标签
  const clearCurrentTag = () => {
    currentTag.value = null;
  };
  
  // 清除错误
  const clearError = () => {
    error.value = null;
  };
  
  // 重置状态
  const resetState = () => {
    tags.value = [];
    popularTags.value = [];
    currentTag.value = null;
    loading.value = false;
    error.value = null;
    total.value = 0;
  };
  
  return {
    // 状态
    tags,
    popularTags,
    currentTag,
    loading,
    error,
    total,
    
    // 计算属性
    tagsList,
    popularTagsList,
    currentTagInfo,
    isLoading,
    hasError,
    errorMessage,
    totalTags,
    
    // 方法
    fetchTags,
    fetchPopularTags,
    searchTags,
    createTag,
    updateTag,
    deleteTag,
    createTagsBatch,
    getTagById,
    getTagBySlug,
    getTagsByIds,
    isTagNameExists,
    isTagSlugExists,
    generateSlug,
    clearCurrentTag,
    clearError,
    resetState
  };
});