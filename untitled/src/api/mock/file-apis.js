import { delay, generateId, getRandomInt } from './utils';

// 模拟文件数据
let files = [
  {
    id: '1',
    name: 'blog-hero.jpg',
    type: 'image/jpeg',
    size: 2048000, // 2MB
    url: '/uploads/blog-hero.jpg',
    thumbnailUrl: '/uploads/thumbnails/blog-hero.jpg',
    uploadTime: '2024-01-15T10:30:00Z',
    category: 'image',
    status: 'completed',
    uploader: {
      id: '1',
      name: 'admin'
    },
    width: 1920,
    height: 1080,
    fileHash: 'hash123456',
    relatedArticles: ['1', '2']
  },
  {
    id: '2',
    name: 'profile.png',
    type: 'image/png',
    size: 512000, // 500KB
    url: '/uploads/profile.png',
    thumbnailUrl: '/uploads/thumbnails/profile.png',
    uploadTime: '2024-01-14T15:45:00Z',
    category: 'image',
    status: 'completed',
    uploader: {
      id: '1',
      name: 'admin'
    },
    width: 800,
    height: 800,
    fileHash: 'hash654321',
    relatedArticles: []
  },
  {
    id: '3',
    name: 'presentation.pdf',
    type: 'application/pdf',
    size: 5242880, // 5MB
    url: '/uploads/presentation.pdf',
    thumbnailUrl: null,
    uploadTime: '2024-01-13T09:20:00Z',
    category: 'document',
    status: 'completed',
    uploader: {
      id: '1',
      name: 'admin'
    },
    width: null,
    height: null,
    fileHash: 'hash789012',
    relatedArticles: ['3']
  },
  {
    id: '4',
    name: 'code-sample.js',
    type: 'text/javascript',
    size: 10240, // 10KB
    url: '/uploads/code-sample.js',
    thumbnailUrl: null,
    uploadTime: '2024-01-12T14:10:00Z',
    category: 'code',
    status: 'completed',
    uploader: {
      id: '1',
      name: 'admin'
    },
    width: null,
    height: null,
    fileHash: 'hash345678',
    relatedArticles: ['2']
  },
  {
    id: '5',
    name: 'banner-image.webp',
    type: 'image/webp',
    size: 1024000, // 1MB
    url: '/uploads/banner-image.webp',
    thumbnailUrl: '/uploads/thumbnails/banner-image.webp',
    uploadTime: '2024-01-11T11:05:00Z',
    category: 'image',
    status: 'completed',
    uploader: {
      id: '1',
      name: 'admin'
    },
    width: 1200,
    height: 400,
    fileHash: 'hash901234',
    relatedArticles: ['1', '3']
  }
];

// 文件分类映射
const FILE_CATEGORIES = {
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/gif': 'image',
  'image/webp': 'image',
  'image/svg+xml': 'image',
  'application/pdf': 'document',
  'text/plain': 'text',
  'text/javascript': 'code',
  'text/css': 'code',
  'text/html': 'code',
  'application/json': 'code',
  'application/msword': 'document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
  'application/vnd.ms-excel': 'document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'document',
  'application/vnd.ms-powerpoint': 'document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'document'
};

// 获取文件分类
function getFileCategory(type) {
  return FILE_CATEGORIES[type] || 'other';
}

// 格式化文件大小
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 模拟文件上传进度
async function simulateUploadProgress() {
  let progress = 0;
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      progress += getRandomInt(5, 15);
      if (progress >= 100) {
        clearInterval(interval);
        resolve(100);
      }
    }, 200);
  });
}

// 获取文件列表
export const getFiles = async (params = {}) => {
  await delay(300);
  
  let filteredFiles = [...files];
  
  // 搜索过滤
  if (params.keyword) {
    const keyword = params.keyword.toLowerCase();
    filteredFiles = filteredFiles.filter(file => 
      file.name.toLowerCase().includes(keyword) ||
      file.category.toLowerCase().includes(keyword)
    );
  }
  
  // 分类过滤
  if (params.category) {
    filteredFiles = filteredFiles.filter(file => file.category === params.category);
  }
  
  // 状态过滤
  if (params.status) {
    filteredFiles = filteredFiles.filter(file => file.status === params.status);
  }
  
  // 日期范围过滤
  if (params.startDate && params.endDate) {
    const startDate = new Date(params.startDate);
    const endDate = new Date(params.endDate);
    filteredFiles = filteredFiles.filter(file => {
      const uploadTime = new Date(file.uploadTime);
      return uploadTime >= startDate && uploadTime <= endDate;
    });
  }
  
  // 排序
  if (params.sortBy && params.sortOrder) {
    filteredFiles.sort((a, b) => {
      const order = params.sortOrder === 'asc' ? 1 : -1;
      if (params.sortBy === 'uploadTime') {
        return order * (new Date(a.uploadTime) - new Date(b.uploadTime));
      } else if (params.sortBy === 'name') {
        return order * a.name.localeCompare(b.name);
      } else if (params.sortBy === 'size') {
        return order * (a.size - b.size);
      }
      return 0;
    });
  } else {
    // 默认按上传时间倒序
    filteredFiles.sort((a, b) => new Date(b.uploadTime) - new Date(a.uploadTime));
  }
  
  // 分页
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedFiles = filteredFiles.slice(startIndex, endIndex);
  
  return {
    data: paginatedFiles,
    pagination: {
      total: filteredFiles.length,
      currentPage: page,
      pageSize: pageSize,
      totalPages: Math.ceil(filteredFiles.length / pageSize)
    }
  };
};

// 获取单个文件详情
export const getFileById = async (id) => {
  await delay(200);
  const file = files.find(file => file.id === id);
  if (!file) {
    throw new Error('文件不存在');
  }
  return file;
};

// 上传文件
export const uploadFile = async (formData) => {
  // 模拟上传进度
  await simulateUploadProgress();
  await delay(500); // 额外延迟模拟服务器处理
  
  // 从formData中获取文件信息
  const file = formData.get('file');
  if (!file) {
    throw new Error('请选择要上传的文件');
  }
  
  // 创建新文件对象
  const newFile = {
    id: generateId(),
    name: file.name,
    type: file.type,
    size: file.size,
    url: `/uploads/${file.name}`,
    thumbnailUrl: file.type.startsWith('image/') ? `/uploads/thumbnails/${file.name}` : null,
    uploadTime: new Date().toISOString(),
    category: getFileCategory(file.type),
    status: 'completed',
    uploader: {
      id: '1',
      name: 'admin'
    },
    width: file.type.startsWith('image/') ? 800 : null, // 模拟值
    height: file.type.startsWith('image/') ? 600 : null, // 模拟值
    fileHash: `hash${generateId()}`,
    relatedArticles: []
  };
  
  // 添加到文件列表
  files.unshift(newFile);
  
  return newFile;
};

// 批量上传文件
export const batchUploadFiles = async (filesList) => {
  const uploadedFiles = [];
  const failedFiles = [];
  
  for (const file of filesList) {
    try {
      // 模拟上传
      await simulateUploadProgress();
      await delay(300);
      
      const newFile = {
        id: generateId(),
        name: file.name,
        type: file.type,
        size: file.size,
        url: `/uploads/${file.name}`,
        thumbnailUrl: file.type.startsWith('image/') ? `/uploads/thumbnails/${file.name}` : null,
        uploadTime: new Date().toISOString(),
        category: getFileCategory(file.type),
        status: 'completed',
        uploader: {
          id: '1',
          name: 'admin'
        },
        width: file.type.startsWith('image/') ? 800 : null,
        height: file.type.startsWith('image/') ? 600 : null,
        fileHash: `hash${generateId()}`,
        relatedArticles: []
      };
      
      files.unshift(newFile);
      uploadedFiles.push(newFile);
    } catch (error) {
      failedFiles.push({
        name: file.name,
        error: error.message
      });
    }
  }
  
  return {
    success: uploadedFiles,
    failed: failedFiles,
    total: filesList.length,
    successCount: uploadedFiles.length,
    failedCount: failedFiles.length
  };
};

// 删除文件
export const deleteFile = async (id) => {
  await delay(200);
  
  const index = files.findIndex(file => file.id === id);
  if (index === -1) {
    throw new Error('文件不存在');
  }
  
  // 检查是否有相关文章
  if (files[index].relatedArticles && files[index].relatedArticles.length > 0) {
    throw new Error('该文件已被文章引用，无法删除');
  }
  
  // 删除文件
  files.splice(index, 1);
  
  return { success: true, message: '文件删除成功' };
};

// 批量删除文件
export const batchDeleteFiles = async (ids) => {
  await delay(300);
  
  const deletedCount = 0;
  const failedFiles = [];
  
  ids.forEach(id => {
    const index = files.findIndex(file => file.id === id);
    if (index !== -1) {
      // 检查是否有相关文章
      if (files[index].relatedArticles && files[index].relatedArticles.length > 0) {
        failedFiles.push({
          id: id,
          name: files[index].name,
          error: '该文件已被文章引用，无法删除'
        });
      } else {
        files.splice(index, 1);
        deletedCount++;
      }
    } else {
      failedFiles.push({
        id: id,
        error: '文件不存在'
      });
    }
  });
  
  return {
    success: true,
    deletedCount,
    failedFiles,
    message: `成功删除 ${deletedCount} 个文件`
  };
};

// 更新文件信息
export const updateFile = async (id, updates) => {
  await delay(200);
  
  const index = files.findIndex(file => file.id === id);
  if (index === -1) {
    throw new Error('文件不存在');
  }
  
  // 更新文件信息
  files[index] = { ...files[index], ...updates };
  
  return files[index];
};

// 获取文件统计信息
export const getFileStats = async () => {
  await delay(200);
  
  const stats = {
    totalFiles: files.length,
    totalSize: files.reduce((sum, file) => sum + file.size, 0),
    categories: {},
    recentUploads: files
      .sort((a, b) => new Date(b.uploadTime) - new Date(a.uploadTime))
      .slice(0, 5)
  };
  
  // 按分类统计
  files.forEach(file => {
    if (!stats.categories[file.category]) {
      stats.categories[file.category] = {
        count: 0,
        size: 0
      };
    }
    stats.categories[file.category].count++;
    stats.categories[file.category].size += file.size;
  });
  
  // 格式化大小
  stats.totalSizeFormatted = formatFileSize(stats.totalSize);
  Object.keys(stats.categories).forEach(category => {
    stats.categories[category].sizeFormatted = formatFileSize(stats.categories[category].size);
  });
  
  return stats;
};

// 获取文件分类列表
export const getFileCategories = async () => {
  await delay(100);
  
  const categories = ['image', 'document', 'code', 'text', 'other'];
  
  return categories.map(category => ({
    value: category,
    label: {
      'image': '图片',
      'document': '文档',
      'code': '代码',
      'text': '文本',
      'other': '其他'
    }[category]
  }));
};

// 搜索文件
export const searchFiles = async (keyword) => {
  await delay(200);
  
  const lowerKeyword = keyword.toLowerCase();
  const results = files.filter(file => 
    file.name.toLowerCase().includes(lowerKeyword) ||
    file.category.toLowerCase().includes(lowerKeyword) ||
    file.type.toLowerCase().includes(lowerKeyword)
  );
  
  return results;
};

// 获取热门文件（根据引用次数）
export const getPopularFiles = async (limit = 10) => {
  await delay(200);
  
  const popularFiles = [...files]
    .sort((a, b) => {
      const aCount = a.relatedArticles ? a.relatedArticles.length : 0;
      const bCount = b.relatedArticles ? b.relatedArticles.length : 0;
      return bCount - aCount;
    })
    .slice(0, limit);
  
  return popularFiles;
};

// 检查文件是否存在
export const checkFileExists = async (fileName) => {
  await delay(100);
  
  const exists = files.some(file => file.name === fileName);
  return { exists };
};

// 获取文件预览URL
export const getFilePreviewUrl = async (id) => {
  await delay(100);
  
  const file = files.find(file => file.id === id);
  if (!file) {
    throw new Error('文件不存在');
  }
  
  return {
    previewUrl: file.url,
    thumbnailUrl: file.thumbnailUrl,
    canPreview: file.type.startsWith('image/') || file.type === 'application/pdf'
  };
};

// 导出文件列表（CSV）
export const exportFileList = async (params = {}) => {
  await delay(500);
  
  // 获取过滤后的文件列表
  const result = await getFiles({ ...params, page: 1, pageSize: 1000 });
  const filteredFiles = result.data;
  
  // 生成CSV内容
  const headers = ['文件名', '类型', '大小', '分类', '上传时间', '上传者'];
  const rows = filteredFiles.map(file => [
    file.name,
    file.type,
    formatFileSize(file.size),
    file.category,
    new Date(file.uploadTime).toLocaleString('zh-CN'),
    file.uploader?.name || '未知'
  ]);
  
  // 构建CSV字符串
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  return {
    success: true,
    csvContent,
    fileName: `文件列表_${new Date().toISOString().split('T')[0]}.csv`,
    totalRows: filteredFiles.length
  };
};

// 下载文件
export const downloadFile = async (id) => {
  await delay(200);
  
  const file = files.find(file => file.id === id);
  if (!file) {
    throw new Error('文件不存在');
  }
  
  // 模拟下载URL
  const downloadUrl = `${file.url}?download=true`;
  
  return {
    success: true,
    downloadUrl,
    fileName: file.name
  };
};

// 批量下载文件
export const batchDownloadFiles = async (ids) => {
  await delay(300);
  
  const downloadFiles = files.filter(file => ids.includes(file.id));
  
  if (downloadFiles.length === 0) {
    throw new Error('未找到要下载的文件');
  }
  
  // 模拟下载URL（实际应用中可能会打包成ZIP）
  const downloadUrls = downloadFiles.map(file => ({
    id: file.id,
    name: file.name,
    downloadUrl: `${file.url}?download=true`
  }));
  
  return {
    success: true,
    files: downloadUrls,
    zipUrl: '/api/download/batch?ids=' + ids.join(','), // 模拟ZIP下载URL
    totalFiles: downloadFiles.length
  };
};