import { defineStore } from 'pinia';
import { fileAPI } from '../api';

export const useFileStore = defineStore('file', {
  state: () => ({
    // 文件列表
    files: [],
    // 当前文件
    currentFile: null,
    // 文件统计
    fileStats: {
      total: 0,
      categories: [],
      recentUploads: []
    },
    // 分页信息
    pagination: {
      currentPage: 1,
      pageSize: 10,
      total: 0,
      pageCount: 0
    },
    // 加载状态
    loading: {
      list: false,
      upload: false,
      delete: false,
      update: false,
      stats: false
    },
    // 搜索条件
    searchParams: {
      keyword: '',
      category: '',
      sortBy: 'created_at',
      order: 'desc',
      fileType: ''
    },
    // 上传进度
    uploadProgress: {},
    // 错误信息
    error: null
  }),

  getters: {
    // 获取文件列表
    getFiles: (state) => state.files,
    
    // 获取当前文件
    getCurrentFile: (state) => state.currentFile,
    
    // 获取文件统计
    getFileStats: (state) => state.fileStats,
    
    // 获取分页信息
    getPagination: (state) => state.pagination,
    
    // 获取加载状态
    getLoading: (state) => state.loading,
    
    // 获取搜索参数
    getSearchParams: (state) => state.searchParams,
    
    // 获取上传进度
    getUploadProgress: (state) => state.uploadProgress,
    
    // 获取错误信息
    getError: (state) => state.error,
    
    // 按类型过滤文件
    getFilesByType: (state) => (type) => {
      return state.files.filter(file => file.type === type);
    },
    
    // 获取最近上传的文件
    getRecentUploads: (state) => {
      return [...state.files]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
    }
  },

  actions: {
    // 设置错误信息
    setError(error) {
      this.error = error;
      setTimeout(() => {
        this.error = null;
      }, 5000);
    },

    // 重置错误信息
    resetError() {
      this.error = null;
    },

    // 获取文件列表
    async fetchFiles(params = {}) {
      try {
        this.loading.list = true;
        this.resetError();
        
        const queryParams = {
          ...this.searchParams,
          ...params,
          page: params.page || this.pagination.currentPage,
          pageSize: params.pageSize || this.pagination.pageSize
        };
        
        const response = await fileAPI.getFiles(queryParams);
        
        this.files = response.data || [];
        this.pagination = {
          ...this.pagination,
          currentPage: response.meta?.current_page || 1,
          pageSize: response.meta?.per_page || 10,
          total: response.meta?.total || 0,
          pageCount: response.meta?.last_page || 1
        };
        
        return response;
      } catch (error) {
        this.setError(error.message || '获取文件列表失败');
        throw error;
      } finally {
        this.loading.list = false;
      }
    },

    // 根据ID获取文件
    async fetchFileById(id) {
      try {
        this.resetError();
        const response = await fileAPI.getFileById(id);
        this.currentFile = response.data;
        return response;
      } catch (error) {
        this.setError(error.message || '获取文件详情失败');
        throw error;
      }
    },

    // 上传文件
    async uploadFile(file, onProgress) {
      try {
        this.loading.upload = true;
        this.resetError();
        
        const formData = new FormData();
        formData.append('file', file);
        
        // 为进度监控添加唯一标识符
        const uploadId = Date.now().toString();
        this.uploadProgress[uploadId] = 0;
        
        const response = await fileAPI.uploadFile(formData);
        
        // 上传完成后从进度列表中移除
        delete this.uploadProgress[uploadId];
        
        // 如果上传成功，重新获取文件列表
        await this.fetchFiles();
        
        return response;
      } catch (error) {
        this.setError(error.message || '文件上传失败');
        throw error;
      } finally {
        this.loading.upload = false;
      }
    },

    // 批量上传文件
    async batchUploadFiles(files, onProgress) {
      try {
        this.loading.upload = true;
        this.resetError();
        
        const formData = new FormData();
        files.forEach(file => {
          formData.append('files[]', file);
        });
        
        const response = await fileAPI.batchUploadFiles(formData);
        
        // 如果上传成功，重新获取文件列表
        await this.fetchFiles();
        
        return response;
      } catch (error) {
        this.setError(error.message || '批量上传文件失败');
        throw error;
      } finally {
        this.loading.upload = false;
      }
    },

    // 删除文件
    async deleteFile(id) {
      try {
        this.loading.delete = true;
        this.resetError();
        
        await fileAPI.deleteFile(id);
        
        // 从列表中移除文件
        this.files = this.files.filter(file => file.id !== id);
        
        // 如果删除的是当前文件，清空当前文件
        if (this.currentFile && this.currentFile.id === id) {
          this.currentFile = null;
        }
        
        // 更新分页总数
        this.pagination.total -= 1;
        
        return { success: true };
      } catch (error) {
        this.setError(error.message || '删除文件失败');
        throw error;
      } finally {
        this.loading.delete = false;
      }
    },

    // 批量删除文件
    async batchDeleteFiles(ids) {
      try {
        this.loading.delete = true;
        this.resetError();
        
        await fileAPI.batchDeleteFiles(ids);
        
        // 从列表中移除文件
        this.files = this.files.filter(file => !ids.includes(file.id));
        
        // 更新分页总数
        this.pagination.total -= ids.length;
        
        return { success: true };
      } catch (error) {
        this.setError(error.message || '批量删除文件失败');
        throw error;
      } finally {
        this.loading.delete = false;
      }
    },

    // 更新文件信息
    async updateFile(id, data) {
      try {
        this.loading.update = true;
        this.resetError();
        
        const response = await fileAPI.updateFile(id, data);
        
        // 更新列表中的文件
        const index = this.files.findIndex(file => file.id === id);
        if (index !== -1) {
          this.files[index] = { ...this.files[index], ...response.data };
        }
        
        // 如果更新的是当前文件，更新当前文件
        if (this.currentFile && this.currentFile.id === id) {
          this.currentFile = { ...this.currentFile, ...response.data };
        }
        
        return response;
      } catch (error) {
        this.setError(error.message || '更新文件信息失败');
        throw error;
      } finally {
        this.loading.update = false;
      }
    },

    // 获取文件统计
    async fetchFileStats() {
      try {
        this.loading.stats = true;
        this.resetError();
        
        const response = await fileAPI.getFileStats();
        this.fileStats = response.data || {
          total: 0,
          categories: [],
          recentUploads: []
        };
        
        return response;
      } catch (error) {
        this.setError(error.message || '获取文件统计失败');
        throw error;
      } finally {
        this.loading.stats = false;
      }
    },

    // 搜索文件
    async searchFiles(keyword) {
      try {
        this.searchParams.keyword = keyword;
        await this.fetchFiles({ page: 1 });
      } catch (error) {
        throw error;
      }
    },

    // 按类型过滤文件
    async filterFilesByType(type) {
      try {
        this.searchParams.fileType = type;
        await this.fetchFiles({ page: 1 });
      } catch (error) {
        throw error;
      }
    },

    // 按分类过滤文件
    async filterFilesByCategory(category) {
      try {
        this.searchParams.category = category;
        await this.fetchFiles({ page: 1 });
      } catch (error) {
        throw error;
      }
    },

    // 排序文件
    async sortFiles(sortBy, order) {
      try {
        this.searchParams.sortBy = sortBy;
        this.searchParams.order = order;
        await this.fetchFiles();
      } catch (error) {
        throw error;
      }
    },

    // 重置搜索条件
    resetSearchParams() {
      this.searchParams = {
        keyword: '',
        category: '',
        sortBy: 'created_at',
        order: 'desc',
        fileType: ''
      };
    },

    // 切换分页
    async changePage(page) {
      try {
        await this.fetchFiles({ page });
      } catch (error) {
        throw error;
      }
    },

    // 切换每页数量
    async changePageSize(pageSize) {
      try {
        this.pagination.pageSize = pageSize;
        await this.fetchFiles({ page: 1, pageSize });
      } catch (error) {
        throw error;
      }
    },

    // 清空当前文件
    clearCurrentFile() {
      this.currentFile = null;
    },

    // 导出文件列表
    async exportFileList() {
      try {
        this.resetError();
        const response = await fileAPI.exportFileList(this.searchParams);
        return response;
      } catch (error) {
        this.setError(error.message || '导出文件列表失败');
        throw error;
      }
    },

    // 下载文件
    async downloadFile(id) {
      try {
        this.resetError();
        const response = await fileAPI.downloadFile(id);
        return response;
      } catch (error) {
        this.setError(error.message || '下载文件失败');
        throw error;
      }
    },

    // 批量下载文件
    async batchDownloadFiles(ids) {
      try {
        this.resetError();
        const response = await fileAPI.batchDownloadFiles(ids);
        return response;
      } catch (error) {
        this.setError(error.message || '批量下载文件失败');
        throw error;
      }
    }
  }
});