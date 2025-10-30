// 分类Mock数据

const categories = [
  {
    id: 1,
    name: '前端开发',
    slug: 'frontend',
    description: '前端开发相关技术文章',
    parentId: null,
    order: 1,
    articleCount: 156,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z',
    children: [
      {
        id: 11,
        name: 'Vue.js',
        slug: 'vue-js',
        description: 'Vue.js框架相关文章',
        parentId: 1,
        order: 1,
        articleCount: 45,
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-11T00:00:00Z'
      },
      {
        id: 12,
        name: 'React',
        slug: 'react',
        description: 'React框架相关文章',
        parentId: 1,
        order: 2,
        articleCount: 38,
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-11T00:00:00Z'
      },
      {
        id: 13,
        name: 'JavaScript',
        slug: 'javascript',
        description: 'JavaScript编程语言相关文章',
        parentId: 1,
        order: 3,
        articleCount: 32,
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-11T00:00:00Z'
      },
      {
        id: 14,
        name: 'CSS/SCSS',
        slug: 'css-scss',
        description: 'CSS/SCSS样式相关文章',
        parentId: 1,
        order: 4,
        articleCount: 21,
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-11T00:00:00Z'
      },
      {
        id: 15,
        name: 'HTML5',
        slug: 'html5',
        description: 'HTML5相关文章',
        parentId: 1,
        order: 5,
        articleCount: 20,
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-11T00:00:00Z'
      }
    ]
  },
  {
    id: 2,
    name: '后端开发',
    slug: 'backend',
    description: '后端开发相关技术文章',
    parentId: null,
    order: 2,
    articleCount: 124,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z',
    children: [
      {
        id: 21,
        name: 'Node.js',
        slug: 'node-js',
        description: 'Node.js后端相关文章',
        parentId: 2,
        order: 1,
        articleCount: 35,
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-11T00:00:00Z'
      },
      {
        id: 22,
        name: 'Python',
        slug: 'python',
        description: 'Python后端相关文章',
        parentId: 2,
        order: 2,
        articleCount: 28,
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-11T00:00:00Z'
      },
      {
        id: 23,
        name: 'Java',
        slug: 'java',
        description: 'Java后端相关文章',
        parentId: 2,
        order: 3,
        articleCount: 30,
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-11T00:00:00Z'
      },
      {
        id: 24,
        name: 'Go',
        slug: 'go',
        description: 'Go语言后端相关文章',
        parentId: 2,
        order: 4,
        articleCount: 21,
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-11T00:00:00Z'
      }
    ]
  },
  {
    id: 3,
    name: '数据库',
    slug: 'database',
    description: '数据库相关技术文章',
    parentId: null,
    order: 3,
    articleCount: 89,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z',
    children: [
      {
        id: 31,
        name: 'MySQL',
        slug: 'mysql',
        description: 'MySQL数据库相关文章',
        parentId: 3,
        order: 1,
        articleCount: 32,
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-11T00:00:00Z'
      },
      {
        id: 32,
        name: 'MongoDB',
        slug: 'mongodb',
        description: 'MongoDB数据库相关文章',
        parentId: 3,
        order: 2,
        articleCount: 25,
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-11T00:00:00Z'
      },
      {
        id: 33,
        name: 'Redis',
        slug: 'redis',
        description: 'Redis缓存相关文章',
        parentId: 3,
        order: 3,
        articleCount: 32,
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-11T00:00:00Z'
      }
    ]
  },
  {
    id: 4,
    name: '计算机基础',
    slug: 'computer-basics',
    description: '计算机基础知识相关文章',
    parentId: null,
    order: 4,
    articleCount: 67,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z'
  },
  {
    id: 5,
    name: '算法与数据结构',
    slug: 'algorithms-data-structures',
    description: '算法与数据结构相关文章',
    parentId: null,
    order: 5,
    articleCount: 54,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z'
  },
  {
    id: 6,
    name: '开发工具',
    slug: 'development-tools',
    description: '开发工具相关文章',
    parentId: null,
    order: 6,
    articleCount: 43,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z'
  },
  {
    id: 7,
    name: '技术分享',
    slug: 'tech-sharing',
    description: '技术分享与经验总结',
    parentId: null,
    order: 7,
    articleCount: 98,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z'
  },
  {
    id: 8,
    name: '其他',
    slug: 'others',
    description: '其他技术相关文章',
    parentId: null,
    order: 8,
    articleCount: 32,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z'
  }
];

// 获取所有分类（树形结构）
const getAllCategories = () => {
  return categories;
};

// 获取扁平分类列表
const getFlatCategories = () => {
  const result = [];
  
  const flatten = (cats) => {
    cats.forEach(cat => {
      // 移除children属性
      const { children, ...category } = cat;
      result.push(category);
      
      if (cat.children && cat.children.length > 0) {
        flatten(cat.children);
      }
    });
  };
  
  flatten(categories);
  return result;
};

// 根据ID获取分类
const getCategoryById = (id) => {
  let found = null;
  
  const search = (cats) => {
    for (const cat of cats) {
      if (cat.id === id) {
        found = cat;
        return true;
      }
      if (cat.children && cat.children.length > 0) {
        if (search(cat.children)) return true;
      }
    }
    return false;
  };
  
  search(categories);
  return found;
};

// 创建分类
const createCategory = (categoryData) => {
  const newCategory = {
    id: Date.now(),
    ...categoryData,
    slug: categoryData.name.toLowerCase().replace(/\s+/g, '-'),
    articleCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  if (categoryData.parentId) {
    // 查找父分类并添加子分类
    const parent = getCategoryById(categoryData.parentId);
    if (parent) {
      if (!parent.children) parent.children = [];
      parent.children.push(newCategory);
    } else {
      // 如果父分类不存在，添加为顶级分类
      categories.push(newCategory);
    }
  } else {
    // 添加为顶级分类
    categories.push(newCategory);
  }
  
  return newCategory;
};

// 更新分类
const updateCategory = (id, categoryData) => {
  let updated = null;
  
  const update = (cats) => {
    for (let i = 0; i < cats.length; i++) {
      if (cats[i].id === id) {
        cats[i] = {
          ...cats[i],
          ...categoryData,
          updatedAt: new Date().toISOString()
        };
        // 更新slug
        if (categoryData.name) {
          cats[i].slug = categoryData.name.toLowerCase().replace(/\s+/g, '-');
        }
        updated = cats[i];
        return true;
      }
      if (cats[i].children && cats[i].children.length > 0) {
        if (update(cats[i].children)) return true;
      }
    }
    return false;
  };
  
  update(categories);
  return updated;
};

// 删除分类
const deleteCategory = (id) => {
  const deleteFn = (cats) => {
    for (let i = 0; i < cats.length; i++) {
      if (cats[i].id === id) {
        cats.splice(i, 1);
        return true;
      }
      if (cats[i].children && cats[i].children.length > 0) {
        if (deleteFn(cats[i].children)) return true;
      }
    }
    return false;
  };
  
  return deleteFn(categories);
};

// 更新分类文章数量
const updateCategoryArticleCount = (categoryId, increment = 1) => {
  const category = getCategoryById(categoryId);
  if (category) {
    category.articleCount = Math.max(0, (category.articleCount || 0) + increment);
    
    // 同时更新父分类的文章数量
    if (category.parentId) {
      const parent = getCategoryById(category.parentId);
      if (parent) {
        parent.articleCount = Math.max(0, (parent.articleCount || 0) + increment);
      }
    }
  }
};

export {
  categories,
  getAllCategories,
  getFlatCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  updateCategoryArticleCount
};