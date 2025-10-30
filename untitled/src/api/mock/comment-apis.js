// 评论相关的模拟API函数
import { 
  delay, 
  generateRandomError, 
  generateUniqueId, 
  paginate, 
  filterByKeyword, 
  sortByField 
} from './utils';

// 模拟评论数据
let comments = [
  {
    id: '1',
    articleId: '1',
    userId: '1',
    userName: '张三',
    userAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=user1',
    content: '这篇文章写得很好，学到了很多东西！',
    parentId: null,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    likes: 15,
    isLiked: false,
    status: 'approved'
  },
  {
    id: '2',
    articleId: '1',
    userId: '2',
    userName: '李四',
    userAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=user2',
    content: '感谢分享，确实对Vue 3的组合式API有了更深入的理解。',
    parentId: null,
    createdAt: '2024-01-15T11:20:00Z',
    updatedAt: '2024-01-15T11:20:00Z',
    likes: 8,
    isLiked: false,
    status: 'approved'
  },
  {
    id: '3',
    articleId: '1',
    userId: '3',
    userName: '王五',
    userAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=user3',
    content: '请问在实际项目中如何处理组件间的状态共享？',
    parentId: null,
    createdAt: '2024-01-15T14:45:00Z',
    updatedAt: '2024-01-15T14:45:00Z',
    likes: 3,
    isLiked: false,
    status: 'approved'
  },
  {
    id: '4',
    articleId: '1',
    userId: '1',
    userName: '张三',
    userAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=user1',
    content: '可以使用Pinia或Vuex进行状态管理，或者使用Provide/Inject进行组件树间的数据共享。',
    parentId: '3',
    createdAt: '2024-01-15T15:30:00Z',
    updatedAt: '2024-01-15T15:30:00Z',
    likes: 5,
    isLiked: false,
    status: 'approved'
  },
  {
    id: '5',
    articleId: '2',
    userId: '2',
    userName: '李四',
    userAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=user2',
    content: 'React Hooks确实简化了很多代码，但是需要注意依赖项的处理。',
    parentId: null,
    createdAt: '2024-01-16T09:15:00Z',
    updatedAt: '2024-01-16T09:15:00Z',
    likes: 12,
    isLiked: false,
    status: 'approved'
  },
  {
    id: '6',
    articleId: '3',
    userId: '4',
    userName: '赵六',
    userAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=user4',
    content: 'Promise的链式调用让异步代码变得更加清晰，感谢分享！',
    parentId: null,
    createdAt: '2024-01-16T16:20:00Z',
    updatedAt: '2024-01-16T16:20:00Z',
    likes: 9,
    isLiked: false,
    status: 'approved'
  },
  {
    id: '7',
    articleId: '4',
    userId: '5',
    userName: '钱七',
    userAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=user5',
    content: 'TypeScript的类型系统确实能帮助我们在开发阶段就发现很多潜在问题。',
    parentId: null,
    createdAt: '2024-01-17T10:05:00Z',
    updatedAt: '2024-01-17T10:05:00Z',
    likes: 11,
    isLiked: false,
    status: 'approved'
  },
  {
    id: '8',
    articleId: '5',
    userId: '3',
    userName: '王五',
    userAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=user3',
    content: 'Node.js的性能确实很棒，特别适合高并发的场景。',
    parentId: null,
    createdAt: '2024-01-17T14:30:00Z',
    updatedAt: '2024-01-17T14:30:00Z',
    likes: 7,
    isLiked: false,
    status: 'approved'
  }
];

// 获取评论列表
export const getComments = async (params = {}) => {
  await delay();
  await generateRandomError(0.05);
  
  let filteredComments = [...comments];
  
  // 按文章ID筛选
  if (params.articleId) {
    filteredComments = filteredComments.filter(comment => comment.articleId === params.articleId);
  }
  
  // 按用户ID筛选
  if (params.userId) {
    filteredComments = filteredComments.filter(comment => comment.userId === params.userId);
  }
  
  // 按状态筛选
  if (params.status) {
    filteredComments = filteredComments.filter(comment => comment.status === params.status);
  }
  
  // 搜索内容
  if (params.keyword) {
    filteredComments = filterByKeyword(filteredComments, params.keyword, ['content', 'userName']);
  }
  
  // 排序
  if (params.sortBy) {
    filteredComments = sortByField(filteredComments, params.sortBy);
  } else {
    // 默认按创建时间降序
    filteredComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  
  // 分页
  const { data, pagination } = paginate(filteredComments, params.page || 1, params.pageSize || 10);
  
  // 如果是获取文章的评论，构建嵌套结构
  if (params.articleId && !params.flat) {
    const buildNestedComments = (parentId = null, level = 0) => {
      return data
        .filter(comment => comment.parentId === parentId)
        .map(comment => ({
          ...comment,
          level,
          replies: buildNestedComments(comment.id, level + 1)
        }));
    };
    
    return {
      data: buildNestedComments(),
      pagination
    };
  }
  
  return {
    data,
    pagination
  };
};

// 根据ID获取评论
export const getCommentById = async (id) => {
  await delay();
  await generateRandomError(0.05);
  
  const comment = comments.find(comment => comment.id === id);
  if (!comment) {
    throw new Error('评论不存在');
  }
  
  return comment;
};

// 创建评论
export const createComment = async (commentData) => {
  await delay();
  await generateRandomError(0.05);
  
  const newComment = {
    id: generateUniqueId(),
    ...commentData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    likes: 0,
    isLiked: false,
    status: 'approved' // 默认直接通过审核
  };
  
  comments.unshift(newComment);
  return newComment;
};

// 更新评论
export const updateComment = async (id, updateData) => {
  await delay();
  await generateRandomError(0.05);
  
  const index = comments.findIndex(comment => comment.id === id);
  if (index === -1) {
    throw new Error('评论不存在');
  }
  
  comments[index] = {
    ...comments[index],
    ...updateData,
    updatedAt: new Date().toISOString()
  };
  
  return comments[index];
};

// 删除评论
export const deleteComment = async (id) => {
  await delay();
  await generateRandomError(0.05);
  
  const index = comments.findIndex(comment => comment.id === id);
  if (index === -1) {
    throw new Error('评论不存在');
  }
  
  // 删除评论及其所有回复
  const deleteCommentAndReplies = (commentId) => {
    // 删除直接回复
    const replyIds = comments
      .filter(comment => comment.parentId === commentId)
      .map(comment => comment.id);
    
    // 递归删除所有子回复
    replyIds.forEach(replyId => deleteCommentAndReplies(replyId));
    
    // 删除当前评论
    comments = comments.filter(comment => comment.id !== commentId);
  };
  
  deleteCommentAndReplies(id);
  
  return { success: true };
};

// 批量删除评论
export const batchDeleteComments = async (ids) => {
  await delay();
  await generateRandomError(0.05);
  
  // 检查评论是否存在
  const existingIds = new Set(comments.map(comment => comment.id));
  const invalidIds = ids.filter(id => !existingIds.has(id));
  
  if (invalidIds.length > 0) {
    throw new Error(`部分评论不存在: ${invalidIds.join(', ')}`);
  }
  
  // 删除所有指定的评论及其回复
  ids.forEach(id => {
    const deleteCommentAndReplies = (commentId) => {
      const replyIds = comments
        .filter(comment => comment.parentId === commentId)
        .map(comment => comment.id);
      
      replyIds.forEach(replyId => deleteCommentAndReplies(replyId));
      
      comments = comments.filter(comment => comment.id !== commentId);
    };
    
    deleteCommentAndReplies(id);
  });
  
  return { success: true, deletedCount: ids.length };
};

// 点赞评论
export const likeComment = async (id) => {
  await delay();
  await generateRandomError(0.05);
  
  const comment = comments.find(comment => comment.id === id);
  if (!comment) {
    throw new Error('评论不存在');
  }
  
  if (!comment.isLiked) {
    comment.likes += 1;
    comment.isLiked = true;
  }
  
  return comment;
};

// 取消点赞
export const unlikeComment = async (id) => {
  await delay();
  await generateRandomError(0.05);
  
  const comment = comments.find(comment => comment.id === id);
  if (!comment) {
    throw new Error('评论不存在');
  }
  
  if (comment.isLiked) {
    comment.likes = Math.max(0, comment.likes - 1);
    comment.isLiked = false;
  }
  
  return comment;
};

// 审核评论
export const moderateComment = async (id, status) => {
  await delay();
  await generateRandomError(0.05);
  
  const validStatuses = ['approved', 'pending', 'rejected', 'spam'];
  if (!validStatuses.includes(status)) {
    throw new Error(`无效的状态: ${status}，必须是 ${validStatuses.join(', ')} 之一`);
  }
  
  const comment = comments.find(comment => comment.id === id);
  if (!comment) {
    throw new Error('评论不存在');
  }
  
  comment.status = status;
  comment.updatedAt = new Date().toISOString();
  
  return comment;
};

// 批量审核评论
export const batchModerateComments = async (ids, status) => {
  await delay();
  await generateRandomError(0.05);
  
  const validStatuses = ['approved', 'pending', 'rejected', 'spam'];
  if (!validStatuses.includes(status)) {
    throw new Error(`无效的状态: ${status}，必须是 ${validStatuses.join(', ')} 之一`);
  }
  
  // 检查评论是否存在
  const existingIds = new Set(comments.map(comment => comment.id));
  const invalidIds = ids.filter(id => !existingIds.has(id));
  
  if (invalidIds.length > 0) {
    throw new Error(`部分评论不存在: ${invalidIds.join(', ')}`);
  }
  
  // 更新状态
  ids.forEach(id => {
    const comment = comments.find(c => c.id === id);
    if (comment) {
      comment.status = status;
      comment.updatedAt = new Date().toISOString();
    }
  });
  
  return { success: true, moderatedCount: ids.length };
};

// 获取评论统计
export const getCommentStats = async (articleId = null) => {
  await delay();
  await generateRandomError(0.05);
  
  let filteredComments = [...comments];
  if (articleId) {
    filteredComments = filteredComments.filter(comment => comment.articleId === articleId);
  }
  
  return {
    total: filteredComments.length,
    approved: filteredComments.filter(comment => comment.status === 'approved').length,
    pending: filteredComments.filter(comment => comment.status === 'pending').length,
    rejected: filteredComments.filter(comment => comment.status === 'rejected').length,
    spam: filteredComments.filter(comment => comment.status === 'spam').length,
    // 只计算顶级评论数（非回复）
    topLevel: filteredComments.filter(comment => comment.parentId === null).length
  };
};

// 获取热门评论
export const getPopularComments = async (params = {}) => {
  await delay();
  await generateRandomError(0.05);
  
  let filteredComments = [...comments];
  
  // 只获取顶级评论
  filteredComments = filteredComments.filter(comment => comment.parentId === null);
  
  // 按点赞数降序排序
  filteredComments.sort((a, b) => b.likes - a.likes);
  
  // 限制数量
  const limit = params.limit || 10;
  filteredComments = filteredComments.slice(0, limit);
  
  return filteredComments;
};

// 获取最近评论
export const getRecentComments = async (params = {}) => {
  await delay();
  await generateRandomError(0.05);
  
  let filteredComments = [...comments];
  
  // 按创建时间降序排序
  filteredComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  // 限制数量
  const limit = params.limit || 10;
  filteredComments = filteredComments.slice(0, limit);
  
  return filteredComments;
};

export default {
  getComments,
  getCommentById,
  createComment,
  updateComment,
  deleteComment,
  batchDeleteComments,
  likeComment,
  unlikeComment,
  moderateComment,
  batchModerateComments,
  getCommentStats,
  getPopularComments,
  getRecentComments
};