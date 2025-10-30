// 标签Mock数据

const tags = [
  { id: 1, name: 'Vue 3', slug: 'vue-3', articleCount: 42, color: '#42b883', createdAt: '2024-01-01T00:00:00Z' },
  { id: 2, name: 'React', slug: 'react', articleCount: 38, color: '#61dafb', createdAt: '2024-01-01T00:00:00Z' },
  { id: 3, name: 'JavaScript', slug: 'javascript', articleCount: 67, color: '#f7df1e', createdAt: '2024-01-01T00:00:00Z' },
  { id: 4, name: 'TypeScript', slug: 'typescript', articleCount: 35, color: '#3178c6', createdAt: '2024-01-01T00:00:00Z' },
  { id: 5, name: 'Node.js', slug: 'node-js', articleCount: 33, color: '#339933', createdAt: '2024-01-01T00:00:00Z' },
  { id: 6, name: 'Python', slug: 'python', articleCount: 29, color: '#3776ab', createdAt: '2024-01-01T00:00:00Z' },
  { id: 7, name: 'CSS', slug: 'css', articleCount: 41, color: '#1572b6', createdAt: '2024-01-01T00:00:00Z' },
  { id: 8, name: 'HTML5', slug: 'html5', articleCount: 25, color: '#e34c26', createdAt: '2024-01-01T00:00:00Z' },
  { id: 9, name: 'Webpack', slug: 'webpack', articleCount: 18, color: '#8dd6f9', createdAt: '2024-01-01T00:00:00Z' },
  { id: 10, name: 'Vite', slug: 'vite', articleCount: 22, color: '#646cff', createdAt: '2024-01-01T00:00:00Z' },
  { id: 11, name: 'Git', slug: 'git', articleCount: 16, color: '#f05032', createdAt: '2024-01-01T00:00:00Z' },
  { id: 12, name: 'MySQL', slug: 'mysql', articleCount: 24, color: '#4479a1', createdAt: '2024-01-01T00:00:00Z' },
  { id: 13, name: 'MongoDB', slug: 'mongodb', articleCount: 17, color: '#47a248', createdAt: '2024-01-01T00:00:00Z' },
  { id: 14, name: 'Redis', slug: 'redis', articleCount: 19, color: '#dc382d', createdAt: '2024-01-01T00:00:00Z' },
  { id: 15, name: 'Docker', slug: 'docker', articleCount: 15, color: '#2496ed', createdAt: '2024-01-01T00:00:00Z' },
  { id: 16, name: 'GitHub Actions', slug: 'github-actions', articleCount: 13, color: '#2088ff', createdAt: '2024-01-01T00:00:00Z' },
  { id: 17, name: 'GraphQL', slug: 'graphql', articleCount: 12, color: '#e10098', createdAt: '2024-01-01T00:00:00Z' },
  { id: 18, name: 'REST API', slug: 'rest-api', articleCount: 21, color: '#005571', createdAt: '2024-01-01T00:00:00Z' },
  { id: 19, name: '算法', slug: 'algorithm', articleCount: 27, color: '#ff6b6b', createdAt: '2024-01-01T00:00:00Z' },
  { id: 20, name: '数据结构', slug: 'data-structure', articleCount: 14, color: '#4ecdc4', createdAt: '2024-01-01T00:00:00Z' },
  { id: 21, name: '计算机网络', slug: 'computer-network', articleCount: 16, color: '#9b59b6', createdAt: '2024-01-01T00:00:00Z' },
  { id: 22, name: '性能优化', slug: 'performance', articleCount: 23, color: '#e67e22', createdAt: '2024-01-01T00:00:00Z' },
  { id: 23, name: '前端工程化', slug: 'frontend-engineering', articleCount: 19, color: '#3498db', createdAt: '2024-01-01T00:00:00Z' },
  { id: 24, name: '设计模式', slug: 'design-pattern', articleCount: 17, color: '#95a5a6', createdAt: '2024-01-01T00:00:00Z' },
  { id: 25, name: '单元测试', slug: 'unit-test', articleCount: 14, color: '#2ecc71', createdAt: '2024-01-01T00:00:00Z' },
  { id: 26, name: '响应式设计', slug: 'responsive-design', articleCount: 15, color: '#1abc9c', createdAt: '2024-01-01T00:00:00Z' },
  { id: 27, name: 'PWA', slug: 'pwa', articleCount: 11, color: '#5a67d8', createdAt: '2024-01-01T00:00:00Z' },
  { id: 28, name: '微前端', slug: 'micro-frontend', articleCount: 13, color: '#7b68ee', createdAt: '2024-01-01T00:00:00Z' },
  { id: 29, name: '人工智能', slug: 'ai', articleCount: 20, color: '#ff6600', createdAt: '2024-01-01T00:00:00Z' },
  { id: 30, name: 'WebSocket', slug: 'websocket', articleCount: 12, color: '#0088cc', createdAt: '2024-01-01T00:00:00Z' },
  { id: 31, name: 'Electron', slug: 'electron', articleCount: 10, color: '#47848f', createdAt: '2024-01-01T00:00:00Z' },
  { id: 32, name: 'Next.js', slug: 'next-js', articleCount: 16, color: '#000000', createdAt: '2024-01-01T00:00:00Z' },
  { id: 33, name: 'Nuxt.js', slug: 'nuxt-js', articleCount: 14, color: '#00C58E', createdAt: '2024-01-01T00:00:00Z' },
  { id: 34, name: 'Tailwind CSS', slug: 'tailwind-css', articleCount: 21, color: '#38B2AC', createdAt: '2024-01-01T00:00:00Z' },
  { id: 35, name: 'Ant Design', slug: 'ant-design', articleCount: 18, color: '#1890ff', createdAt: '2024-01-01T00:00:00Z' },
  { id: 36, name: 'Element Plus', slug: 'element-plus', articleCount: 15, color: '#409eff', createdAt: '2024-01-01T00:00:00Z' },
  { id: 37, name: 'Sass/SCSS', slug: 'sass', articleCount: 17, color: '#cc6699', createdAt: '2024-01-01T00:00:00Z' },
  { id: 38, name: 'Less', slug: 'less', articleCount: 12, color: '#1d365d', createdAt: '2024-01-01T00:00:00Z' },
  { id: 39, name: 'PostCSS', slug: 'postcss', articleCount: 13, color: '#dc382d', createdAt: '2024-01-01T00:00:00Z' },
  { id: 40, name: 'Babel', slug: 'babel', articleCount: 14, color: '#f9dc3e', createdAt: '2024-01-01T00:00:00Z' },
  { id: 41, name: 'ESLint', slug: 'eslint', articleCount: 15, color: '#4b32c3', createdAt: '2024-01-01T00:00:00Z' },
  { id: 42, name: 'Prettier', slug: 'prettier', articleCount: 13, color: '#f7b93e', createdAt: '2024-01-01T00:00:00Z' },
  { id: 43, name: 'Jest', slug: 'jest', articleCount: 16, color: '#c21325', createdAt: '2024-01-01T00:00:00Z' },
  { id: 44, name: 'Mocha', slug: 'mocha', articleCount: 11, color: '#8d6748', createdAt: '2024-01-01T00:00:00Z' },
  { id: 45, name: 'Cypress', slug: 'cypress', articleCount: 12, color: '#17202c', createdAt: '2024-01-01T00:00:00Z' },
  { id: 46, name: 'Svelte', slug: 'svelte', articleCount: 10, color: '#ff3e00', createdAt: '2024-01-01T00:00:00Z' },
  { id: 47, name: 'Web Components', slug: 'web-components', articleCount: 8, color: '#4d61fc', createdAt: '2024-01-01T00:00:00Z' },
  { id: 48, name: 'Serverless', slug: 'serverless', articleCount: 14, color: '#ff7300', createdAt: '2024-01-01T00:00:00Z' },
  { id: 49, name: 'GraphQL', slug: 'graphql', articleCount: 12, color: '#e10098', createdAt: '2024-01-01T00:00:00Z' },
  { id: 50, name: 'gRPC', slug: 'grpc', articleCount: 9, color: '#3a75c4', createdAt: '2024-01-01T00:00:00Z' }
];

// 随机颜色列表用于新建标签
const randomColors = [
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7',
  '#dfe6e9', '#dda0dd', '#98d8c8', '#f7dc6f', '#bb8fce',
  '#85c1e9', '#f8b500', '#f1948a', '#82e0aa', '#d7bde2',
  '#aed6f1', '#fad7a0', '#a3e4d7', '#f9ebea', '#d6eaf8'
];

// 获取所有标签
const getAllTags = () => {
  return tags;
};

// 分页获取标签
const getTags = (page = 1, pageSize = 20, keyword = '') => {
  let filteredTags = [...tags];
  
  // 关键词搜索
  if (keyword) {
    filteredTags = filteredTags.filter(tag => 
      tag.name.toLowerCase().includes(keyword.toLowerCase())
    );
  }
  
  // 按文章数量排序（降序）
  filteredTags.sort((a, b) => b.articleCount - a.articleCount);
  
  // 分页
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedTags = filteredTags.slice(start, end);
  
  return {
    items: paginatedTags,
    total: filteredTags.length,
    page,
    pageSize,
    totalPages: Math.ceil(filteredTags.length / pageSize)
  };
};

// 获取热门标签（按文章数量排序，取前N个）
const getPopularTags = (limit = 10) => {
  return [...tags]
    .sort((a, b) => b.articleCount - a.articleCount)
    .slice(0, limit);
};

// 根据ID获取标签
const getTagById = (id) => {
  return tags.find(tag => tag.id === id) || null;
};

// 根据Slug获取标签
const getTagBySlug = (slug) => {
  return tags.find(tag => tag.slug === slug) || null;
};

// 创建标签
const createTag = (tagData) => {
  // 检查是否已存在同名标签
  const existingTag = tags.find(tag => 
    tag.name.toLowerCase() === tagData.name.toLowerCase()
  );
  
  if (existingTag) {
    return existingTag; // 如果已存在，直接返回
  }
  
  const newTag = {
    id: Date.now(),
    name: tagData.name,
    slug: tagData.name.toLowerCase().replace(/\s+/g, '-'),
    color: tagData.color || randomColors[Math.floor(Math.random() * randomColors.length)],
    articleCount: 0,
    createdAt: new Date().toISOString()
  };
  
  tags.push(newTag);
  return newTag;
};

// 批量创建标签
const createTags = (tagNames) => {
  return tagNames.map(name => {
    return createTag({ name });
  });
};

// 更新标签
const updateTag = (id, tagData) => {
  const index = tags.findIndex(tag => tag.id === id);
  if (index === -1) return null;
  
  const updatedTag = {
    ...tags[index],
    ...tagData,
    updatedAt: new Date().toISOString()
  };
  
  // 更新slug
  if (tagData.name) {
    updatedTag.slug = tagData.name.toLowerCase().replace(/\s+/g, '-');
  }
  
  tags[index] = updatedTag;
  return updatedTag;
};

// 删除标签
const deleteTag = (id) => {
  const index = tags.findIndex(tag => tag.id === id);
  if (index === -1) return false;
  
  tags.splice(index, 1);
  return true;
};

// 批量删除标签
const deleteTags = (ids) => {
  ids.forEach(id => {
    const index = tags.findIndex(tag => tag.id === id);
    if (index !== -1) {
      tags.splice(index, 1);
    }
  });
  return true;
};

// 更新标签文章数量
const updateTagArticleCount = (tagId, increment = 1) => {
  const tag = getTagById(tagId);
  if (tag) {
    tag.articleCount = Math.max(0, (tag.articleCount || 0) + increment);
  }
};

// 批量更新标签文章数量
const updateTagsArticleCount = (tagIds, increment = 1) => {
  tagIds.forEach(id => {
    updateTagArticleCount(id, increment);
  });
};

export {
  tags,
  getAllTags,
  getTags,
  getPopularTags,
  getTagById,
  getTagBySlug,
  createTag,
  createTags,
  updateTag,
  deleteTag,
  deleteTags,
  updateTagArticleCount,
  updateTagsArticleCount
};