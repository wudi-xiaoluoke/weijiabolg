// 用户Mock数据

const users = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123', // 实际项目中应该是加密的密码
    nickname: '系统管理员',
    avatar: 'https://picsum.photos/id/1/200/200',
    bio: '热爱技术，乐于分享',
    role: 'admin', // admin, editor, user
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    lastLogin: '2024-01-20T10:30:00Z',
    followingCount: 15,
    followersCount: 234,
    articleCount: 42,
    commentCount: 156
  },
  {
    id: 2,
    username: 'author1',
    email: 'author1@example.com',
    password: 'password123',
    nickname: '技术达人',
    avatar: 'https://picsum.photos/id/2/200/200',
    bio: '专注前端开发，Vue.js 爱好者',
    role: 'editor',
    status: 'active',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-16T00:00:00Z',
    lastLogin: '2024-01-19T15:20:00Z',
    followingCount: 8,
    followersCount: 128,
    articleCount: 23,
    commentCount: 89
  },
  {
    id: 3,
    username: 'user1',
    email: 'user1@example.com',
    password: 'user123',
    nickname: '技术爱好者',
    avatar: 'https://picsum.photos/id/3/200/200',
    bio: '喜欢阅读技术文章，不断学习新技术',
    role: 'user',
    status: 'active',
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-17T00:00:00Z',
    lastLogin: '2024-01-20T09:15:00Z',
    followingCount: 23,
    followersCount: 5,
    articleCount: 2,
    commentCount: 45
  },
  {
    id: 4,
    username: 'developer',
    email: 'developer@example.com',
    password: 'dev123',
    nickname: '全栈开发者',
    avatar: 'https://picsum.photos/id/4/200/200',
    bio: '前后端通吃，热爱编程',
    role: 'editor',
    status: 'active',
    createdAt: '2024-01-04T00:00:00Z',
    updatedAt: '2024-01-18T00:00:00Z',
    lastLogin: '2024-01-20T11:45:00Z',
    followingCount: 12,
    followersCount: 156,
    articleCount: 34,
    commentCount: 123
  },
  {
    id: 5,
    username: 'newuser',
    email: 'newuser@example.com',
    password: 'newuser123',
    nickname: '新手用户',
    avatar: 'https://picsum.photos/id/5/200/200',
    bio: '刚加入，正在探索',
    role: 'user',
    status: 'active',
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-19T00:00:00Z',
    lastLogin: '2024-01-20T08:30:00Z',
    followingCount: 3,
    followersCount: 1,
    articleCount: 0,
    commentCount: 8
  }
];

// 生成JWT Token的模拟函数
const generateToken = (user) => {
  // 实际项目中应该使用JWT库生成真实的token
  return `mock_token_${user.id}_${Date.now()}`;
};

// 验证用户登录
const validateLogin = (email, password) => {
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role
      },
      token: generateToken(user),
      refreshToken: `refresh_${generateToken(user)}`,
      expiresIn: 3600
    };
  }
  return null;
};

// 根据ID获取用户
const getUserById = (id) => {
  return users.find(user => user.id === id);
};

// 根据邮箱获取用户
const getUserByEmail = (email) => {
  return users.find(user => user.email === email);
};

// 创建新用户
const createUser = (userData) => {
  const newUser = {
    id: Date.now(),
    ...userData,
    role: 'user',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLogin: null,
    followingCount: 0,
    followersCount: 0,
    articleCount: 0,
    commentCount: 0
  };
  users.push(newUser);
  return newUser;
};

// 更新用户信息
const updateUser = (id, userData) => {
  const index = users.findIndex(user => user.id === id);
  if (index !== -1) {
    users[index] = {
      ...users[index],
      ...userData,
      updatedAt: new Date().toISOString()
    };
    return users[index];
  }
  return null;
};

// 更新用户密码
const updatePassword = (id, oldPassword, newPassword) => {
  const user = users.find(u => u.id === id);
  if (user && user.password === oldPassword) {
    user.password = newPassword;
    user.updatedAt = new Date().toISOString();
    return true;
  }
  return false;
};

export {
  users,
  validateLogin,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  updatePassword
};