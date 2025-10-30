// 评论Mock数据

const comments = [
  {
    id: 1,
    articleId: 1,
    userId: 1,
    content: '这篇文章写得非常好，对我帮助很大，谢谢分享！',
    likes: 15,
    status: 'approved',
    createdAt: '2024-01-10T10:30:00Z',
    updatedAt: '2024-01-10T10:30:00Z',
    user: {
      id: 1,
      username: 'admin',
      nickname: '管理员',
      avatar: 'https://i.pravatar.cc/150?img=1'
    },
    parentId: null,
    replies: [
      {
        id: 2,
        articleId: 1,
        userId: 2,
        content: '确实很有帮助，我也学到了很多新知识。',
        likes: 8,
        status: 'approved',
        createdAt: '2024-01-10T11:15:00Z',
        updatedAt: '2024-01-10T11:15:00Z',
        user: {
          id: 2,
          username: 'user1',
          nickname: '用户1',
          avatar: 'https://i.pravatar.cc/150?img=2'
        },
        parentId: 1
      },
      {
        id: 3,
        articleId: 1,
        userId: 1,
        content: '感谢支持，后续会继续分享更多优质内容。',
        likes: 5,
        status: 'approved',
        createdAt: '2024-01-10T14:20:00Z',
        updatedAt: '2024-01-10T14:20:00Z',
        user: {
          id: 1,
          username: 'admin',
          nickname: '管理员',
          avatar: 'https://i.pravatar.cc/150?img=1'
        },
        parentId: 1
      }
    ]
  },
  {
    id: 4,
    articleId: 1,
    userId: 3,
    content: '有个问题想请教一下，关于文中提到的性能优化部分，是否有更详细的示例代码？',
    likes: 3,
    status: 'approved',
    createdAt: '2024-01-11T09:45:00Z',
    updatedAt: '2024-01-11T09:45:00Z',
    user: {
      id: 3,
      username: 'user2',
      nickname: '学习者',
      avatar: 'https://i.pravatar.cc/150?img=3'
    },
    parentId: null,
    replies: [
      {
        id: 5,
        articleId: 1,
        userId: 1,
        content: '好的，我会在下一篇文章中详细介绍具体的实现代码，敬请关注。',
        likes: 2,
        status: 'approved',
        createdAt: '2024-01-11T11:30:00Z',
        updatedAt: '2024-01-11T11:30:00Z',
        user: {
          id: 1,
          username: 'admin',
          nickname: '管理员',
          avatar: 'https://i.pravatar.cc/150?img=1'
        },
        parentId: 4
      }
    ]
  },
  {
    id: 6,
    articleId: 2,
    userId: 2,
    content: '文章很实用，正好解决了我最近遇到的一个问题。',
    likes: 12,
    status: 'approved',
    createdAt: '2024-01-12T16:10:00Z',
    updatedAt: '2024-01-12T16:10:00Z',
    user: {
      id: 2,
      username: 'user1',
      nickname: '用户1',
      avatar: 'https://i.pravatar.cc/150?img=2'
    },
    parentId: null,
    replies: []
  },
  {
    id: 7,
    articleId: 3,
    userId: 4,
    content: '感谢作者的分享，期待更多精彩内容！',
    likes: 7,
    status: 'approved',
    createdAt: '2024-01-13T08:25:00Z',
    updatedAt: '2024-01-13T08:25:00Z',
    user: {
      id: 4,
      username: 'developer',
      nickname: '开发者',
      avatar: 'https://i.pravatar.cc/150?img=4'
    },
    parentId: null,
    replies: []
  },
  {
    id: 8,
    articleId: 4,
    userId: 5,
    content: '这个方法我之前也尝试过，效果确实不错。',
    likes: 9,
    status: 'approved',
    createdAt: '2024-01-14T13:40:00Z',
    updatedAt: '2024-01-14T13:40:00Z',
    user: {
      id: 5,
      username: 'coder',
      nickname: '程序员',
      avatar: 'https://i.pravatar.cc/150?img=5'
    },
    parentId: null,
    replies: []
  },
  {
    id: 9,
    articleId: 5,
    userId: 2,
    content: '文章内容很深入，对Vue 3的新特性讲解得很清晰。',
    likes: 18,
    status: 'approved',
    createdAt: '2024-01-15T11:20:00Z',
    updatedAt: '2024-01-15T11:20:00Z',
    user: {
      id: 2,
      username: 'user1',
      nickname: '用户1',
      avatar: 'https://i.pravatar.cc/150?img=2'
    },
    parentId: null,
    replies: [
      {
        id: 10,
        articleId: 5,
        userId: 3,
        content: '我也觉得，特别是关于Composition API的部分，解释得很到位。',
        likes: 11,
        status: 'approved',
        createdAt: '2024-01-15T14:30:00Z',
        updatedAt: '2024-01-15T14:30:00Z',
        user: {
          id: 3,
          username: 'user2',
          nickname: '学习者',
          avatar: 'https://i.pravatar.cc/150?img=3'
        },
        parentId: 9
      }
    ]
  }
];

// 获取文章的评论列表（树形结构）
const getArticleComments = (articleId, { page = 1, pageSize = 10, status = 'approved' } = {}) => {
  let filteredComments = comments.filter(comment => 
    comment.articleId === articleId && (status === 'all' || comment.status === status)
  );
  
  // 按创建时间降序排序
  filteredComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  // 分页
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedComments = filteredComments.slice(start, end);
  
  return {
    items: paginatedComments,
    total: filteredComments.length,
    page,
    pageSize,
    totalPages: Math.ceil(filteredComments.length / pageSize)
  };
};

// 获取评论详情
const getCommentById = (id) => {
  let found = null;
  
  // 先在顶级评论中查找
  for (const comment of comments) {
    if (comment.id === id) {
      found = comment;
      break;
    }
    // 在回复中查找
    if (comment.replies) {
      const replyFound = comment.replies.find(reply => reply.id === id);
      if (replyFound) {
        found = replyFound;
        break;
      }
    }
  }
  
  return found;
};

// 创建评论
const createComment = (commentData, userInfo) => {
  const newComment = {
    id: Date.now(),
    ...commentData,
    likes: 0,
    status: 'approved', // 默认自动通过
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: userInfo
  };
  
  if (commentData.parentId) {
    // 如果是回复，找到父评论并添加到replies中
    const parentComment = getCommentById(commentData.parentId);
    if (parentComment) {
      // 找到顶级评论
      const topLevelComment = comments.find(c => c.id === parentComment.parentId) || 
                             comments.find(c => c.id === commentData.parentId);
      
      if (topLevelComment) {
        if (!topLevelComment.replies) topLevelComment.replies = [];
        topLevelComment.replies.push(newComment);
      }
    }
  } else {
    // 如果是顶级评论，直接添加到comments数组
    newComment.replies = [];
    comments.push(newComment);
  }
  
  return newComment;
};

// 更新评论
const updateComment = (id, commentData) => {
  let updatedComment = null;
  
  // 先在顶级评论中查找
  for (let i = 0; i < comments.length; i++) {
    if (comments[i].id === id) {
      comments[i] = {
        ...comments[i],
        ...commentData,
        updatedAt: new Date().toISOString()
      };
      updatedComment = comments[i];
      break;
    }
    
    // 在回复中查找
    if (comments[i].replies) {
      const replyIndex = comments[i].replies.findIndex(reply => reply.id === id);
      if (replyIndex !== -1) {
        comments[i].replies[replyIndex] = {
          ...comments[i].replies[replyIndex],
          ...commentData,
          updatedAt: new Date().toISOString()
        };
        updatedComment = comments[i].replies[replyIndex];
        break;
      }
    }
  }
  
  return updatedComment;
};

// 删除评论
const deleteComment = (id) => {
  let deleted = false;
  
  // 先检查是否是顶级评论
  const topCommentIndex = comments.findIndex(comment => comment.id === id);
  if (topCommentIndex !== -1) {
    comments.splice(topCommentIndex, 1);
    deleted = true;
  } else {
    // 检查是否是回复
    for (const comment of comments) {
      if (comment.replies) {
        const replyIndex = comment.replies.findIndex(reply => reply.id === id);
        if (replyIndex !== -1) {
          comment.replies.splice(replyIndex, 1);
          deleted = true;
          break;
        }
      }
    }
  }
  
  return deleted;
};

// 点赞评论
const likeComment = (id, userId) => {
  const comment = getCommentById(id);
  if (!comment) return null;
  
  // 模拟增加点赞数
  comment.likes += 1;
  comment.updatedAt = new Date().toISOString();
  
  return comment;
};

// 取消点赞评论
const unlikeComment = (id, userId) => {
  const comment = getCommentById(id);
  if (!comment) return null;
  
  // 模拟减少点赞数
  comment.likes = Math.max(0, comment.likes - 1);
  comment.updatedAt = new Date().toISOString();
  
  return comment;
};

// 获取评论总数
const getCommentsCount = (articleId, status = 'approved') => {
  let count = 0;
  
  comments.forEach(comment => {
    if (comment.articleId === articleId && (status === 'all' || comment.status === status)) {
      count += 1; // 顶级评论
      if (comment.replies) {
        count += comment.replies.length; // 回复数
      }
    }
  });
  
  return count;
};

// 获取用户的所有评论
const getUserComments = (userId, { page = 1, pageSize = 10 } = {}) => {
  const userComments = [];
  
  // 收集用户的顶级评论
  comments.forEach(comment => {
    if (comment.userId === userId) {
      userComments.push({
        ...comment,
        type: 'comment'
      });
    }
    
    // 收集用户的回复
    if (comment.replies) {
      comment.replies.forEach(reply => {
        if (reply.userId === userId) {
          userComments.push({
            ...reply,
            type: 'reply',
            parentComment: {
              id: comment.id,
              content: comment.content
            }
          });
        }
      });
    }
  });
  
  // 按创建时间降序排序
  userComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  // 分页
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedComments = userComments.slice(start, end);
  
  return {
    items: paginatedComments,
    total: userComments.length,
    page,
    pageSize,
    totalPages: Math.ceil(userComments.length / pageSize)
  };
};

export {
  comments,
  getArticleComments,
  getCommentById,
  createComment,
  updateComment,
  deleteComment,
  likeComment,
  unlikeComment,
  getCommentsCount,
  getUserComments
};