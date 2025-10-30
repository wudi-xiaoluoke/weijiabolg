// Mock API 工具函数

/**
 * 生成随机延迟，模拟网络请求延迟
 * @param {number} min - 最小延迟时间（毫秒）
 * @param {number} max - 最大延迟时间（毫秒）
 * @returns {Promise} 延迟Promise
 */
export const generateDelay = (min = 100, max = 1000) => {
  const delayTime = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delayTime));
};

/**
 * 随机生成错误，模拟API错误情况
 * @param {number} errorRate - 错误率（0-1之间）
 * @returns {Object|null} 错误对象或null
 */
export const generateRandomError = (errorRate = 0.05) => {
  if (Math.random() < errorRate) {
    const errors = [
      { status: 500, message: 'Internal Server Error' },
      { status: 408, message: 'Request Timeout' },
      { status: 429, message: 'Too Many Requests' },
      { status: 503, message: 'Service Unavailable' }
    ];
    return errors[Math.floor(Math.random() * errors.length)];
  }
  return null;
};

/**
 * 生成唯一ID
 * @returns {string} 唯一ID
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
};

/**
 * 应用分页功能
 * @param {Array} data - 要分页的数据
 * @param {Object} params - 分页参数
 * @param {number} params.page - 页码（从1开始）
 * @param {number} params.pageSize - 每页大小
 * @returns {Object} 分页后的数据对象
 */
export const applyPagination = (data, params = {}) => {
  const page = parseInt(params.page) || 1;
  const pageSize = parseInt(params.pageSize) || 10;
  
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedData = data.slice(start, end);
  
  return {
    items: paginatedData,
    total: data.length,
    page,
    pageSize,
    totalPages: Math.ceil(data.length / pageSize)
  };
};

/**
 * 应用搜索和排序功能
 * @param {Array} data - 要处理的数据
 * @param {Object} params - 查询参数
 * @param {string} params.keyword - 搜索关键词
 * @param {Array} searchFields - 搜索字段
 * @param {string} params.sortBy - 排序字段
 * @param {string} params.sortOrder - 排序顺序（asc/desc）
 * @returns {Array} 处理后的数据
 */
export const applySearchAndSort = (data, params = {}, searchFields = ['title', 'content']) => {
  let result = [...data];
  
  // 应用搜索
  if (params.keyword) {
    const lowerKeyword = params.keyword.toLowerCase();
    result = result.filter(item => {
      return searchFields.some(field => {
        const value = item[field];
        return value && typeof value === 'string' && value.toLowerCase().includes(lowerKeyword);
      });
    });
  }
  
  // 应用排序
  if (params.sortBy) {
    const sortBy = params.sortBy;
    const sortOrder = params.sortOrder || 'desc';
    
    result.sort((a, b) => {
      // 处理日期类型
      if (a[sortBy] instanceof Date || (typeof a[sortBy] === 'string' && !isNaN(Date.parse(a[sortBy])))) {
        const dateA = new Date(a[sortBy]).getTime();
        const dateB = new Date(b[sortBy]).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      // 处理数字类型
      if (typeof a[sortBy] === 'number' && typeof b[sortBy] === 'number') {
        return sortOrder === 'asc' ? a[sortBy] - b[sortBy] : b[sortBy] - a[sortBy];
      }
      
      // 处理字符串类型
      if (typeof a[sortBy] === 'string' && typeof b[sortBy] === 'string') {
        return sortOrder === 'asc' 
          ? a[sortBy].localeCompare(b[sortBy]) 
          : b[sortBy].localeCompare(a[sortBy]);
      }
      
      // 默认不排序
      return 0;
    });
  }
  
  return result;
};

/**
 * 检查是否已登录
 * @returns {boolean} 是否已登录
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

/**
 * 获取当前登录用户ID
 * @returns {string|null} 用户ID或null
 */
export const getCurrentUserId = () => {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    try {
      return JSON.parse(userInfo).id;
    } catch (error) {
      console.error('Error parsing user info:', error);
    }
  }
  return null;
};

/**
 * 检查用户权限
 * @param {string} userId - 用户ID
 * @returns {boolean} 是否有权限
 */
export const checkPermission = (userId) => {
  const currentUserId = getCurrentUserId();
  // 检查是否是当前用户或管理员（简化版）
  return currentUserId === userId || currentUserId === '1'; // 假设ID为1的用户是管理员
};

/**
 * 格式化日期
 * @param {Date|string} date - 日期
 * @param {string} format - 格式化字符串
 * @returns {string} 格式化后的日期字符串
 */
export const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  const d = new Date(date);
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

/**
 * 截断文本
 * @param {string} text - 要截断的文本
 * @param {number} maxLength - 最大长度
 * @returns {string} 截断后的文本
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};