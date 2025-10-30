// 文章Mock数据

const articles = [
  {
    id: 1,
    title: 'Vue 3 组合式 API 完全指南',
    subtitle: '深入理解 Vue 3 的 Composition API 及其最佳实践',
    content: '# Vue 3 组合式 API 完全指南\n\nVue 3 引入了全新的组合式 API (Composition API)，这是一个重大的更新，为我们提供了更灵活的组件逻辑组织方式。\n\n## 什么是组合式 API\n\n组合式 API 是 Vue 3 中引入的新特性，它允许我们以更灵活的方式组织组件逻辑。与选项式 API (Options API) 不同，组合式 API 不再强制我们按照预设的选项（如 data、methods、computed 等）组织代码，而是让我们可以根据逻辑功能来组织代码。\n\n## 为什么使用组合式 API\n\n### 更好的逻辑复用\n\n组合式 API 使得跨组件复用逻辑变得更加简单，不再需要依赖 mixin、高阶组件或渲染函数。\n\n### 更好的类型推导\n\n组合式 API 对 TypeScript 的支持更加友好，能够提供更好的类型推导。\n\n### 更好的代码组织\n\n对于复杂组件，组合式 API 允许我们按照逻辑关注点来组织代码，而不是按照选项类型。\n\n## 基本使用\n\n下面是一个简单的组合式 API 使用示例：\n\n```javascript\nimport { ref, computed, onMounted } from 'vue'\n\nexport default {\n  setup() {\n    // 响应式状态\n    const count = ref(0)\n    \n    // 计算属性\n    const doubleCount = computed(() => count.value * 2)\n    \n    // 方法\n    const increment = () => {\n      count.value++\n    }\n    \n    // 生命周期钩子\n    onMounted(() => {\n      console.log('Component mounted')\n    })\n    \n    // 返回给模板使用的状态和方法\n    return {\n      count,\n      doubleCount,\n      increment\n    }\n  }\n}\n```\n\n## 响应式 API\n\n### ref\n\n`ref` 用于创建一个响应式的引用类型数据：\n\n```javascript\nconst count = ref(0)\nconsole.log(count.value) // 0\ncount.value++\nconsole.log(count.value) // 1\n```\n\n### reactive\n\n`reactive` 用于创建一个响应式的对象：\n\n```javascript\nconst state = reactive({\n  count: 0,\n  name: 'Vue 3'\n})\nconsole.log(state.count) // 0\nstate.count++\nconsole.log(state.count) // 1\n```\n\n## 组合式函数\n\n组合式函数是组合式 API 的核心概念，它允许我们封装和复用有状态的逻辑。\n\n```javascript\n// 定义一个组合式函数\nfunction useCounter(initialValue = 0) {\n  const count = ref(initialValue)\n  const increment = () => { count.value++ }\n  const decrement = () => { count.value-- }\n  \n  return {\n    count,\n    increment,\n    decrement\n  }\n}\n\n// 在组件中使用\nexport default {\n  setup() {\n    const { count, increment, decrement } = useCounter()\n    \n    return {\n      count,\n      increment,\n      decrement\n    }\n  }\n}\n```\n\n## 总结\n\n组合式 API 为 Vue 3 带来了更灵活、更强大的组件逻辑组织方式。它不仅解决了选项式 API 在复杂组件和逻辑复用方面的不足，还提供了更好的 TypeScript 支持。\n\n通过组合式 API，我们可以编写出更清晰、更易维护的代码，特别是对于大型应用程序和复杂组件。\n\n希望本指南能帮助你更好地理解和使用 Vue 3 的组合式 API！',
    excerpt: 'Vue 3 引入了全新的组合式 API (Composition API)，这是一个重大的更新，为我们提供了更灵活的组件逻辑组织方式。本文将深入探讨组合式 API 的概念、优势以及使用方法。',
    coverImage: 'https://picsum.photos/800/400?random=1',
    status: 'published', // published, draft, archived
    viewCount: 1254,
    likeCount: 89,
    commentCount: 15,
    favoriteCount: 42,
    authorId: 1,
    author: {
      id: 1,
      username: 'admin',
      nickname: '管理员',
      avatar: 'https://i.pravatar.cc/150?img=1'
    },
    categoryId: 1,
    category: {
      id: 1,
      name: '前端开发',
      slug: 'frontend'
    },
    tagIds: [1, 3, 10],
    tags: [
      { id: 1, name: 'Vue 3', slug: 'vue-3', color: '#42b883' },
      { id: 3, name: 'JavaScript', slug: 'javascript', color: '#f7df1e' },
      { id: 10, name: 'Vite', slug: 'vite', color: '#646cff' }
    ],
    publishedAt: '2024-01-10T08:00:00Z',
    createdAt: '2024-01-09T14:30:00Z',
    updatedAt: '2024-01-10T08:00:00Z',
    isHot: true,
    isFeatured: true
  },
  {
    id: 2,
    title: 'React Hooks 最佳实践',
    subtitle: '掌握 React Hooks 的使用技巧和最佳实践',
    content: '# React Hooks 最佳实践\n\n自 React 16.8 引入 Hooks 以来，它们已经成为 React 开发的标准方式。本文将分享一些使用 React Hooks 的最佳实践。\n\n## 1. 只在组件顶层调用 Hooks\n\n不要在循环、条件或嵌套函数中调用 Hooks，这会导致状态管理混乱。\n\n```javascript\n// ❌ 错误做法\nfunction UserInfo({ userId }) {\n  if (userId) {\n    const [user, setUser] = useState(null)\n    useEffect(() => {\n      // 获取用户信息\n    }, [userId])\n  }\n  // ...\n}\n\n// ✅ 正确做法\nfunction UserInfo({ userId }) {\n  const [user, setUser] = useState(null)\n  \n  useEffect(() => {\n    if (userId) {\n      // 获取用户信息\n    }\n  }, [userId])\n  // ...\n}\n```\n\n## 2. 使用自定义 Hooks 复用逻辑\n\n当你发现自己在多个组件中编写相同的状态逻辑时，应该考虑将其提取到自定义 Hook 中。\n\n```javascript\n// 自定义 Hook\nfunction useLocalStorage(key, initialValue) {\n  const [storedValue, setStoredValue] = useState(() => {\n    try {\n      const item = window.localStorage.getItem(key)\n      return item ? JSON.parse(item) : initialValue\n    } catch (error) {\n      console.error(error)\n      return initialValue\n    }\n  })\n  \n  const setValue = value => {\n    try {\n      const valueToStore = value instanceof Function ? value(storedValue) : value\n      setStoredValue(valueToStore)\n      window.localStorage.setItem(key, JSON.stringify(valueToStore))\n    } catch (error) {\n      console.error(error)\n    }\n  }\n  \n  return [storedValue, setValue]\n}\n```\n\n## 3. 注意依赖数组\n\n在使用 `useEffect`、`useMemo` 和 `useCallback` 时，务必正确设置依赖数组，避免无限循环和不必要的重新渲染。\n\n```javascript\n// 使用 useCallback 缓存函数引用\nconst handleSubmit = useCallback(() => {\n  // 提交表单\n}, [userId, formData])\n\n// 使用 useMemo 缓存计算结果\nconst totalPrice = useMemo(() => {\n  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)\n}, [items])\n```\n\n## 4. 使用 useReducer 处理复杂状态\n\n当状态逻辑变得复杂时，使用 `useReducer` 替代 `useState` 可以使代码更易维护。\n\n```javascript\nfunction todoReducer(state, action) {\n  switch (action.type) {\n    case 'ADD_TODO':\n      return {\n        todos: [...state.todos, { id: Date.now(), text: action.text, completed: false }]\n      }\n    case 'TOGGLE_TODO':\n      return {\n        todos: state.todos.map(todo =>\n          todo.id === action.id ? { ...todo, completed: !todo.completed } : todo\n        )\n      }\n    // 其他操作...\n    default:\n      return state\n  }\n}\n\nfunction TodoList() {\n  const [state, dispatch] = useReducer(todoReducer, { todos: [] })\n  // ...\n}\n```\n\n## 5. 性能优化\n\n使用 `React.memo`、`useMemo` 和 `useCallback` 优化组件性能。\n\n```javascript\n// 使用 React.memo 避免不必要的重新渲染\nconst ExpensiveComponent = React.memo(function ExpensiveComponent(props) {\n  // 复杂的渲染逻辑\n})\n```\n\n## 总结\n\n遵循这些最佳实践可以帮助你编写更清晰、更高效、更可维护的 React 代码。记住，Hooks 的目标是让 React 代码更加简洁和可复用，合理使用它们可以大大提高开发效率。',
    excerpt: '自 React 16.8 引入 Hooks 以来，它们已经成为 React 开发的标准方式。本文将分享一些使用 React Hooks 的最佳实践，帮助你编写更清晰、更高效的 React 代码。',
    coverImage: 'https://picsum.photos/800/400?random=2',
    status: 'published',
    viewCount: 987,
    likeCount: 76,
    commentCount: 12,
    favoriteCount: 38,
    authorId: 1,
    author: {
      id: 1,
      username: 'admin',
      nickname: '管理员',
      avatar: 'https://i.pravatar.cc/150?img=1'
    },
    categoryId: 1,
    category: {
      id: 1,
      name: '前端开发',
      slug: 'frontend'
    },
    tagIds: [2, 3],
    tags: [
      { id: 2, name: 'React', slug: 'react', color: '#61dafb' },
      { id: 3, name: 'JavaScript', slug: 'javascript', color: '#f7df1e' }
    ],
    publishedAt: '2024-01-08T10:20:00Z',
    createdAt: '2024-01-07T16:45:00Z',
    updatedAt: '2024-01-08T10:20:00Z',
    isHot: true,
    isFeatured: false
  },
  {
    id: 3,
    title: 'TypeScript 进阶技巧',
    subtitle: '掌握 TypeScript 的高级特性和最佳实践',
    content: '# TypeScript 进阶技巧\n\nTypeScript 作为 JavaScript 的超集，提供了静态类型检查，大大提高了代码的可维护性和可读性。本文将介绍一些 TypeScript 的进阶技巧。\n\n## 1. 泛型\n\n泛型是 TypeScript 中最强大的特性之一，它允许我们编写可重用的组件，这些组件可以支持多种类型而不是单一类型。\n\n```typescript\n// 泛型函数\nfunction identity<T>(arg: T): T {\n  return arg\n}\n\n// 泛型类\nclass GenericNumber<T> {\n  zeroValue: T\n  add: (x: T, y: T) => T\n}\n```\n\n## 2. 条件类型\n\n条件类型允许我们根据条件选择不同的类型。\n\n```typescript\ntype TypeName<T> = \n  T extends string ? "string" :\n  T extends number ? "number" :\n  T extends boolean ? "boolean" :\n  T extends undefined ? "undefined" :\n  T extends Function ? "function" :\n  "object"\n```\n\n## 3. 映射类型\n\n映射类型允许我们基于旧类型创建新类型。\n\n```typescript\n// 只读映射类型\ntype Readonly<T> = {\n  readonly [P in keyof T]: T[P]\n}\n\n// 可选映射类型\ntype Partial<T> = {\n  [P in keyof T]?: T[P]\n}\n```\n\n## 4. 类型保护\n\n类型保护允许我们在特定作用域内缩小变量的类型。\n\n```typescript\n// 使用 typeof 类型保护\nfunction padLeft(value: string, padding: string | number) {\n  if (typeof padding === "number") {\n    return Array(padding + 1).join(" ") + value\n  }\n  if (typeof padding === "string") {\n    return padding + value\n  }\n  throw new Error(`Expected string or number, got ${padding}.`)\n}\n```\n\n## 5. 装饰器\n\n装饰器是一种特殊类型的声明，它可以附加到类声明、方法、访问符、属性或参数上。\n\n```typescript\nfunction sealed(target: Function) {\n  Object.seal(target)\n  Object.seal(target.prototype)\n}\n\n@sealed\nclass Greeter {\n  greeting: string\n  constructor(message: string) {\n    this.greeting = message\n  }\n  greet() {\n    return "Hello, " + this.greeting\n  }\n}\n```\n\n## 6. 模块化\n\nTypeScript 支持多种模块模式，包括 ES 模块和 CommonJS。\n\n```typescript\n// 导出\nexport interface StringValidator {\n  isAcceptable(s: string): boolean\n}\n\n// 导入\nimport { StringValidator } from "./StringValidator"\n```\n\n## 总结\n\nTypeScript 提供了丰富的类型系统和高级特性，掌握这些特性可以帮助我们编写更安全、更可维护的代码。通过合理使用泛型、条件类型、映射类型等高级特性，我们可以充分发挥 TypeScript 的优势，提高开发效率和代码质量。',
    excerpt: 'TypeScript 作为 JavaScript 的超集，提供了静态类型检查，大大提高了代码的可维护性和可读性。本文将介绍一些 TypeScript 的进阶技巧，帮助你充分发挥 TypeScript 的优势。',
    coverImage: 'https://picsum.photos/800/400?random=3',
    status: 'published',
    viewCount: 876,
    likeCount: 65,
    commentCount: 9,
    favoriteCount: 32,
    authorId: 1,
    author: {
      id: 1,
      username: 'admin',
      nickname: '管理员',
      avatar: 'https://i.pravatar.cc/150?img=1'
    },
    categoryId: 1,
    category: {
      id: 1,
      name: '前端开发',
      slug: 'frontend'
    },
    tagIds: [3, 4],
    tags: [
      { id: 3, name: 'JavaScript', slug: 'javascript', color: '#f7df1e' },
      { id: 4, name: 'TypeScript', slug: 'typescript', color: '#3178c6' }
    ],
    publishedAt: '2024-01-06T14:30:00Z',
    createdAt: '2024-01-05T09:15:00Z',
    updatedAt: '2024-01-06T14:30:00Z',
    isHot: false,
    isFeatured: false
  },
  {
    id: 4,
    title: 'Node.js 性能优化指南',
    subtitle: '提高 Node.js 应用性能的实用技巧和最佳实践',
    content: '# Node.js 性能优化指南\n\nNode.js 作为一个基于 Chrome V8 引擎的 JavaScript 运行时，广泛应用于服务器端开发。本文将分享一些 Node.js 性能优化的实用技巧。\n\n## 1. 使用异步操作\n\nNode.js 的一大优势是其非阻塞 I/O 模型，我们应该充分利用这一点，避免使用同步操作。\n\n```javascript\n// ❌ 错误做法\nconst data = fs.readFileSync(\'file.txt\', \'utf8\');\n// 处理 data...\n\n// ✅ 正确做法\nfs.readFile(\'file.txt\', \'utf8\', (err, data) => {\n  if (err) throw err;\n  // 处理 data...\n});\n\n// 或者使用 Promise 和 async/await\nasync function readFile() {\n  try {\n    const data = await fs.promises.readFile(\'file.txt\', \'utf8\');\n    // 处理 data...\n  } catch (err) {\n    console.error(err);\n  }\n}\n```\n\n## 2. 使用连接池\n\n对于数据库连接等资源密集型操作，使用连接池可以显著提高性能。\n\n```javascript\nconst mysql = require(\'mysql2/promise\');\n\n// 创建连接池\nconst pool = mysql.createPool({\n  host: \'localhost\',\n  user: \'root\',\n  database: \'test\',\n  waitForConnections: true,\n  connectionLimit: 10,\n  queueLimit: 0\n});\n\n// 使用连接池\nasync function query(sql, params) {\n  const [rows] = await pool.execute(sql, params);\n  return rows;\n}\n```\n\n## 3. 使用缓存\n\n合理使用缓存可以减少重复计算和数据库查询，提高响应速度。\n\n```javascript\nconst NodeCache = require(\'node-cache\');\nconst myCache = new NodeCache({ stdTTL: 60 * 5 }); // 5分钟过期\n\nasync function getData(id) {\n  // 尝试从缓存获取\n  const cachedData = myCache.get(`data_${id}`);\n  if (cachedData) {\n    return cachedData;\n  }\n  \n  // 从数据库获取\n  const data = await database.query(\'SELECT * FROM data WHERE id = ?\', [id]);\n  \n  // 存入缓存\n  myCache.set(`data_${id}`, data);\n  \n  return data;\n}\n```\n\n## 4. 优化内存使用\n\nNode.js 应用可能会因为内存泄漏而导致性能下降，我们需要注意以下几点：\n\n- 避免不必要的全局变量\n- 及时清理定时器和事件监听器\n- 使用流处理大文件\n- 注意闭包可能导致的内存泄漏\n\n```javascript\n// 使用流处理大文件\nconst readableStream = fs.createReadStream(\'large-file.txt\');\nconst writableStream = fs.createWriteStream(\'output.txt\');\n\nreadableStream.pipe(writableStream);\n```\n\n## 5. 使用集群模式\n\nNode.js 是单线程的，但我们可以使用集群模块充分利用多核 CPU。\n\n```javascript\nconst cluster = require(\'cluster\');\nconst http = require(\'http\');\nconst numCPUs = require(\'os\').cpus().length;\n\nif (cluster.isMaster) {\n  console.log(`主进程 ${process.pid} 正在运行`);\n\n  // 生成工作进程\n  for (let i = 0; i < numCPUs; i++) {\n    cluster.fork();\n  }\n\n  cluster.on(\'exit\', (worker) => {\n    console.log(`工作进程 ${worker.process.pid} 已退出`);\n  });\n} else {\n  // 工作进程可以共享任何 TCP 连接\n  http.createServer((req, res) => {\n    res.writeHead(200);\n    res.end(\'你好世界\n\');\n  }).listen(8000);\n\n  console.log(`工作进程 ${process.pid} 已启动`);\n}\n```\n\n## 6. 性能监控和分析\n\n使用工具监控和分析应用性能，找出瓶颈并进行优化。\n\n- Node.js 内置的 `--inspect` 选项\n- PM2 进程管理器\n- New Relic 或 Datadog 等 APM 工具\n\n## 总结\n\nNode.js 性能优化是一个持续的过程，我们需要从多个方面入手，包括异步操作、连接池、缓存、内存管理、集群模式等。通过合理应用这些优化技巧，我们可以显著提高 Node.js 应用的性能和稳定性。',
    excerpt: 'Node.js 作为一个基于 Chrome V8 引擎的 JavaScript 运行时，广泛应用于服务器端开发。本文将分享一些 Node.js 性能优化的实用技巧，帮助你提高应用的性能和稳定性。',
    coverImage: 'https://picsum.photos/800/400?random=4',
    status: 'published',
    viewCount: 756,
    likeCount: 58,
    commentCount: 7,
    favoriteCount: 29,
    authorId: 1,
    author: {
      id: 1,
      username: 'admin',
      nickname: '管理员',
      avatar: 'https://i.pravatar.cc/150?img=1'
    },
    categoryId: 2,
    category: {
      id: 2,
      name: '后端开发',
      slug: 'backend'
    },
    tagIds: [5, 18, 22],
    tags: [
      { id: 5, name: 'Node.js', slug: 'node-js', color: '#339933' },
      { id: 18, name: 'REST API', slug: 'rest-api', color: '#005571' },
      { id: 22, name: '性能优化', slug: 'performance', color: '#e67e22' }
    ],
    publishedAt: '2024-01-04T11:45:00Z',
    createdAt: '2024-01-03T15:20:00Z',
    updatedAt: '2024-01-04T11:45:00Z',
    isHot: false,
    isFeatured: true
  },
  {
    id: 5,
    title: 'Python 数据科学入门',
    subtitle: '使用 Python 进行数据分析和可视化的基础教程',
    content: '# Python 数据科学入门\n\nPython 已经成为数据科学领域最流行的编程语言之一，本文将介绍如何使用 Python 进行数据分析和可视化。\n\n## 1. 环境搭建\n\n首先，我们需要安装 Python 和一些必要的库。\n\n```bash\n# 安装 Anaconda（推荐，包含了大多数数据科学库）\ndownload from https://www.anaconda.com/products/individual\n\n# 或者使用 pip 安装必要的库\npip install numpy pandas matplotlib seaborn jupyter\n```\n\n## 2. NumPy 基础\n\nNumPy 是 Python 科学计算的基础库，提供了高性能的多维数组对象和数学函数。\n\n```python\nimport numpy as np\n\n# 创建数组\na = np.array([1, 2, 3, 4, 5])\nb = np.array([[1, 2, 3], [4, 5, 6]])\n\n# 数组操作\nprint(a.shape)  # (5,)\nprint(b.shape)  # (2, 3)\nprint(a.mean())  # 3.0\nprint(b.sum())  # 21\nprint(np.dot(a, a))  # 点积：55\n```\n\n## 3. Pandas 数据分析\n\nPandas 提供了高性能、易用的数据结构和数据分析工具。\n\n```python\nimport pandas as pd\n\n# 创建 DataFrame\ndata = {\n    \'Name\': [\'Alice\', \'Bob\', \'Charlie\', \'David\'],\n    \'Age\': [25, 30, 35, 40],\n    \'City\': [\'New York\', \'Boston\', \'Chicago\', \'Dallas\']\n}\ndf = pd.DataFrame(data)\n\n# 基本操作\nprint(df.head())  # 查看前几行\nprint(df.describe())  # 统计描述\nprint(df[df[\'Age\'] > 30])  # 筛选\nprint(df.groupby(\'City\').size())  # 分组\n\n# 读取和保存数据\ndf = pd.read_csv(\'data.csv\')\ndf.to_csv(\'output.csv\', index=False)\n```\n\n## 4. Matplotlib 和 Seaborn 可视化\n\nMatplotlib 是 Python 的绘图库，而 Seaborn 是基于 Matplotlib 的高级可视化库。\n\n```python\nimport matplotlib.pyplot as plt\nimport seaborn as sns\n\n# 设置样式\nsns.set(style="whitegrid")\n\n# 折线图\nplt.figure(figsize=(10, 6))\nsns.lineplot(x=\'Age\', y=\'Income\', data=df)\nplt.title(\'Age vs Income\')\nplt.show()\n\n# 柱状图\nplt.figure(figsize=(10, 6))\nsns.countplot(x=\'City\', data=df)\nplt.title(\'Count by City\')\nplt.xticks(rotation=45)\nplt.show()\n\n# 散点图\nplt.figure(figsize=(10, 6))\nsns.scatterplot(x=\'Age\', y=\'Income\', hue=\'City\', data=df)\nplt.title(\'Age vs Income by City\')\nplt.show()\n\n# 热图\nplt.figure(figsize=(10, 8))\ncorr = df.corr()\nsns.heatmap(corr, annot=True, cmap=\'coolwarm\')\nplt.title(\'Correlation Matrix\')\nplt.show()\n```\n\n## 5. 数据清洗\n\n数据清洗是数据分析的重要步骤。\n\n```python\n# 处理缺失值\ndf.dropna()  # 删除缺失值\ndf.fillna(0)  # 填充缺失值\ndf.fillna(df.mean())  # 用平均值填充\n\n# 处理重复值\ndf.drop_duplicates()\n\n# 数据转换\ndf[\'Age\'] = df[\'Age\'].astype(int)  # 类型转换\ndf[\'Name\'] = df[\'Name\'].str.upper()  # 字符串操作\n\n# 特征工程\ndf[\'Age_Group\'] = pd.cut(df[\'Age\'], bins=[0, 30, 50, 100], labels=[\'Young\', \'Adult\', \'Senior\'])\n```\n\n## 6. 简单的机器学习\n\n使用 scikit-learn 进行简单的机器学习任务。\n\n```python\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.linear_model import LinearRegression\nfrom sklearn.metrics import mean_squared_error\n\n# 准备数据\nX = df[[\'Age\', \'Experience\']]\ny = df[\'Income\']\n\n# 划分训练集和测试集\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)\n\n# 训练模型\nmodel = LinearRegression()\nmodel.fit(X_train, y_train)\n\n# 预测和评估\ny_pred = model.predict(X_test)\nmse = mean_squared_error(y_test, y_pred)\nprint(f\'Mean Squared Error: {mse}\')\n```\n\n## 总结\n\nPython 提供了强大的数据科学工具集，包括 NumPy、Pandas、Matplotlib、Seaborn 等库。通过这些工具，我们可以方便地进行数据处理、分析和可视化。本文只是一个简单的入门教程，还有很多高级功能和技术等待你去探索。希望这篇文章能帮助你开始 Python 数据科学之旅！',
    excerpt: 'Python 已经成为数据科学领域最流行的编程语言之一，本文将介绍如何使用 Python 进行数据分析和可视化，包括环境搭建、NumPy、Pandas、Matplotlib 和 Seaborn 等库的基本使用。',
    coverImage: 'https://picsum.photos/800/400?random=5',
    status: 'published',
    viewCount: 645,
    likeCount: 49,
    commentCount: 6,
    favoriteCount: 25,
    authorId: 1,
    author: {
      id: 1,
      username: 'admin',
      nickname: '管理员',
      avatar: 'https://i.pravatar.cc/150?img=1'
    },
    categoryId: 2,
    category: {
      id: 2,
      name: '后端开发',
      slug: 'backend'
    },
    tagIds: [6, 19, 29],
    tags: [
      { id: 6, name: 'Python', slug: 'python', color: '#3776ab' },
      { id: 19, name: '算法', slug: 'algorithm', color: '#ff6b6b' },
      { id: 29, name: '人工智能', slug: 'ai', color: '#ff6600' }
    ],
    publishedAt: '2024-01-02T09:30:00Z',
    createdAt: '2024-01-01T13:15:00Z',
    updatedAt: '2024-01-02T09:30:00Z',
    isHot: false,
    isFeatured: false
  },
  {
    id: 6,
    title: 'CSS Grid 布局完全指南',
    subtitle: '掌握现代 CSS Grid 布局技术，创建复杂的网页布局',
    content: '# CSS Grid 布局完全指南\n\nCSS Grid 是一个强大的二维布局系统，它允许我们轻松创建复杂的网页布局。本文将详细介绍 CSS Grid 布局的各种特性和使用方法。\n\n## 1. 基本概念\n\nCSS Grid 是一个二维布局系统，它将页面划分为行和列，使我们能够在二维平面上精确控制元素的位置。\n\n主要术语：\n- **Grid Container**：网格容器，应用 `display: grid` 的元素\n- **Grid Item**：网格项，网格容器的直接子元素\n- **Grid Line**：网格线，划分网格的水平线和垂直线\n- **Grid Track**：网格轨道，两条相邻网格线之间的空间（行或列）\n- **Grid Cell**：网格单元，四条网格线包围的最小空间单位\n- **Grid Area**：网格区域，由一个或多个网格单元组成的矩形区域\n\n## 2. 基本语法\n\n```css\n.container {\n  display: grid;\n  grid-template-columns: 1fr 1fr 1fr;  /* 3 列，每列宽度相等 */\n  grid-template-rows: 100px auto;      /* 2 行，第一行 100px，第二行自动 */\n  gap: 20px;                          /* 网格间距 */\n}\n```\n\n## 3. 网格模板\n\n### grid-template-columns 和 grid-template-rows\n\n这两个属性用于定义网格的列和行。\n\n```css\n.container {\n  display: grid;\n  /* 使用 fr 单位（分数单位） */\n  grid-template-columns: 1fr 2fr 1fr;  /* 第二列是其他列的两倍宽 */\n  \n  /* 使用 repeat() 函数 */\n  grid-template-columns: repeat(3, 1fr);  /* 3 列，每列宽度相等 */\n  \n  /* 混合使用不同单位 */\n  grid-template-columns: 200px 1fr auto;\n  \n  /* 使用 minmax() 函数 */\n  grid-template-columns: repeat(3, minmax(200px, 1fr));  /* 最小 200px，最大 1fr */\n}\n```\n\n### grid-template-areas\n\n这个属性允许我们使用命名区域来定义网格布局。\n\n```css\n.container {\n  display: grid;\n  grid-template-columns: 1fr 3fr;\n  grid-template-rows: auto 1fr auto;\n  grid-template-areas: \n    "header header"\n    "sidebar main"\n    "footer footer";\n}\n\n.header { grid-area: header; }\n.sidebar { grid-area: sidebar; }\n.main { grid-area: main; }\n.footer { grid-area: footer; }\n```\n\n## 4. 网格项放置\n\n### grid-column 和 grid-row\n\n这些属性用于控制网格项在网格中的位置。\n\n```css\n.item-1 {\n  grid-column: 1 / 3;  /* 从第 1 条列线开始，到第 3 条列线结束（跨越 2 列） */\n  grid-row: 1 / 2;     /* 从第 1 条行线开始，到第 2 条行线结束（跨越 1 行） */\n}\n\n/* 使用 span 关键字 */\n.item-2 {\n  grid-column: 2 / span 2;  /* 从第 2 条列线开始，跨越 2 列 */\n}\n```\n\n### justify-items 和 align-items\n\n这些属性用于控制网格项在其网格单元中的对齐方式。\n\n```css\n.container {\n  justify-items: start | end | center | stretch;  /* 水平方向对齐 */\n  align-items: start | end | center | stretch;    /* 垂直方向对齐 */\n  \n  /* 简写 */\n  place-items: center center;\n}\n```\n\n### justify-content 和 align-content\n\n这些属性用于控制整个网格在网格容器中的对齐方式（当网格小于容器时）。\n\n```css\n.container {\n  justify-content: start | end | center | stretch | space-around | space-between | space-evenly;\n  align-content: start | end | center | stretch | space-around | space-between | space-evenly;\n  \n  /* 简写 */\n  place-content: center center;\n}\n```\n\n## 5. 响应式网格\n\n结合媒体查询，我们可以创建响应式的网格布局。\n\n```css\n.container {\n  display: grid;\n  grid-template-columns: repeat(1, 1fr);  /* 移动设备：单列 */\n  gap: 20px;\n}\n\n@media (min-width: 768px) {\n  .container {\n    grid-template-columns: repeat(2, 1fr);  /* 平板：双列 */\n  }\n}\n\n@media (min-width: 1024px) {\n  .container {\n    grid-template-columns: repeat(4, 1fr);  /* 桌面：四列 */\n  }\n}\n```\n\n## 6. 高级特性\n\n### 隐式网格\n\n当我们没有明确指定所有行和列时，CSS Grid 会自动创建隐式网格。\n\n```css\n.container {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);  /* 只定义了列 */\n  grid-auto-rows: minmax(100px, auto);    /* 自动创建的行的最小高度 */\n}\n```\n\n### grid-auto-flow\n\n这个属性控制自动放置的网格项的填充方向。\n\n```css\n.container {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  grid-template-rows: repeat(3, 100px);\n  grid-auto-flow: row | column;  /* 默认是 row */\n}\n```\n\n## 7. 实际应用示例\n\n### 卡片布局\n\n```css\n.card-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));\n  gap: 20px;\n}\n\n.card {\n  background: white;\n  border-radius: 8px;\n  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);\n  padding: 20px;\n}\n```\n\n### 仪表盘布局\n\n```css\n.dashboard {\n  display: grid;\n  grid-template-columns: 250px 1fr;\n  grid-template-rows: 60px 1fr;\n  grid-template-areas:\n    "sidebar header"\n    "sidebar main";\n  height: 100vh;\n}\n```\n\n## 总结\n\nCSS Grid 是一个强大的布局系统，它使我们能够轻松创建复杂的二维布局。通过掌握 CSS Grid 的各种特性和使用方法，我们可以大大简化布局代码，创建更加灵活和响应式的网页设计。希望本文能帮助你更好地理解和使用 CSS Grid 布局！',
    excerpt: 'CSS Grid 是一个强大的二维布局系统，它允许我们轻松创建复杂的网页布局。本文将详细介绍 CSS Grid 布局的各种特性和使用方法，帮助你掌握这一现代布局技术。',
    coverImage: 'https://picsum.photos/800/400?random=6',
    status: 'published',
    viewCount: 534,
    likeCount: 42,
    commentCount: 5,
    favoriteCount: 21,
    authorId: 1,
    author: {
      id: 1,
      username: 'admin',
      nickname: '管理员',
      avatar: 'https://i.pravatar.cc/150?img=1'
    },
    categoryId: 1,
    category: {
      id: 1,
      name: '前端开发',
      slug: 'frontend'
    },
    tagIds: [7, 26],
    tags: [
      { id: 7, name: 'CSS', slug: 'css', color: '#1572b6' },
      { id: 26, name: '响应式设计', slug: 'responsive-design', color: '#1abc9c' }
    ],
    publishedAt: '2023-12-30T16:45:00Z',
    createdAt: '2023-12-29T10:20:00Z',
    updatedAt: '2023-12-30T16:45:00Z',
    isHot: false,
    isFeatured: false
  },
  {\n    id: 7,\n    title: '微服务架构设计原则',\n    subtitle: '探索微服务架构的核心原则和最佳实践',\n    content: '# 微服务架构设计原则\n\n微服务架构已经成为现代软件开发的重要范式，它将应用程序拆分为一系列独立部署的服务。本文将探讨微服务架构的核心设计原则。\n\n## 1. 单一职责原则\n\n每个微服务应该有且只有一个职责，只关注一个业务领域。这样可以使服务更加内聚，更容易理解和维护。\n\n## 2. 服务自治\n\n微服务应该是独立的、自治的，具有自己的数据库和业务逻辑。服务之间通过API进行通信，而不是直接访问彼此的数据库。\n\n## 3. 去中心化\n\n微服务架构强调去中心化，包括去中心化的数据管理和去中心化的治理。不同的服务可以使用不同的技术栈，适合各自的业务需求。\n\n## 4. 容错设计\n\n在微服务架构中，服务故障是常态。我们需要设计容错机制，如断路器模式、重试机制、服务降级等，确保系统的整体可用性。\n\n## 5. API 优先\n\n采用API优先的设计方法，先定义API，再实现服务。这样可以确保服务之间的良好协作，并支持并行开发。\n\n## 6. 持续交付\n\n微服务架构需要强大的持续交付能力，包括自动化测试、自动化构建、自动化部署等。\n\n## 7. 基础设施即代码\n\n使用基础设施即代码(IaC)管理基础设施，确保环境的一致性和可重复性。\n\n## 8. 监控和可观测性\n\n建立完善的监控和可观测性系统，包括日志、指标、追踪等，以便快速发现和解决问题。\n\n## 9. 安全性\n\n在微服务架构中，安全性是一个重要考虑因素。我们需要实现服务间的安全通信、身份认证和授权、数据加密等安全措施。\n\n## 10. 演进式设计\n\n微服务架构支持演进式设计，我们可以根据业务需求的变化，逐步调整和优化服务。\n\n## 总结\n\n微服务架构不是银弹，它有自己的优势和挑战。在采用微服务架构之前，我们需要仔细评估业务需求和团队能力。如果决定采用微服务架构，那么遵循这些设计原则将有助于构建一个健壮、可扩展的系统。',
    excerpt: '微服务架构已经成为现代软件开发的重要范式，它将应用程序拆分为一系列独立部署的服务。本文将探讨微服务架构的核心设计原则和最佳实践，帮助你构建更好的微服务系统。',
    coverImage: 'https://picsum.photos/800/400?random=7',
    status: 'published',
    viewCount: 423,
    likeCount: 35,
    commentCount: 4,
    favoriteCount: 18,
    authorId: 1,
    author: {
      id: 1,
      username: 'admin',
      nickname: '管理员',
      avatar: 'https://i.pravatar.cc/150?img=1'
    },
    categoryId: 7,
    category: {
      id: 7,
      name: '技术分享',
      slug: 'tech-sharing'
    },
    tagIds: [15, 48],
    tags: [
      { id: 15, name: 'Docker', slug: 'docker', color: '#2496ed' },
      { id: 48, name: 'Serverless', slug: 'serverless', color: '#ff7300' }
    ],
    publishedAt: '2023-12-28T14:20:00Z',
    createdAt: '2023-12-27T09:15:00Z',
    updatedAt: '2023-12-28T14:20:00Z',
    isHot: false,
    isFeatured: false
  },
  {\n    id: 8,\n    title: '深入理解 JavaScript Promise',\n    subtitle: '从基础到高级，全面掌握 Promise 的使用和原理',\n    content: '# 深入理解 JavaScript Promise\n\nPromise 是 JavaScript 中处理异步操作的重要机制，它使异步代码更加清晰和易于管理。本文将深入探讨 Promise 的使用和原理。\n\n## 1. Promise 基础\n\nPromise 是一个表示异步操作最终完成或失败的对象。\n\n### 创建 Promise\n\n```javascript\nconst promise = new Promise((resolve, reject) => {\n  // 异步操作\n  setTimeout(() => {\n    const success = true;\n    if (success) {\n      resolve(\'操作成功\');\n    } else {\n      reject(new Error(\'操作失败\'));\n    }\n  }, 1000);\n});\n```\n\n### 使用 Promise\n\n```javascript\npromise\n  .then(result => {\n    console.log(\'成功:\', result);\n  })\n  .catch(error => {\n    console.error(\'失败:\', error);\n  })\n  .finally(() => {\n    console.log(\'无论成功失败都会执行\');\n  });\n```\n\n## 2. Promise 链式调用\n\nPromise 的一大优势是支持链式调用，避免了回调地狱。\n\n```javascript\nfetch(\'https://api.example.com/data\')\n  .then(response => response.json())\n  .then(data => processData(data))\n  .then(result => displayResult(result))\n  .catch(error => console.error(\'发生错误:\', error));\n```\n\n## 3. Promise 组合\n\nPromise 提供了几个静态方法来组合多个 Promise。\n\n### Promise.all\n\n当所有 Promise 都成功时才成功，否则失败。\n\n```javascript\nPromise.all([promise1, promise2, promise3])\n  .then(results => {\n    console.log(\'所有操作都成功了\', results);\n  })\n  .catch(error => {\n    console.error(\'有一个操作失败了\', error);\n  });\n```\n\n### Promise.race\n\n返回第一个完成的 Promise 的结果（无论成功或失败）。\n\n```javascript\nPromise.race([promise1, promise2])\n  .then(result => {\n    console.log(\'第一个完成的结果:\', result);\n  })\n  .catch(error => {\n    console.error(\'第一个失败的错误:\', error);\n  });\n```\n\n### Promise.allSettled\n\n返回所有 Promise 的结果，无论成功或失败。\n\n```javascript\nPromise.allSettled([promise1, promise2, promise3])\n  .then(results => {\n    results.forEach(result => {\n      if (result.status === \'fulfilled\') {\n        console.log(\'成功:\', result.value);\n      } else {\n        console.error(\'失败:\', result.reason);\n      }\n    });\n  });\n```\n\n### Promise.any\n\n返回第一个成功的 Promise 的结果，如果所有都失败，则返回一个 AggregateError。\n\n```javascript\nPromise.any([promise1, promise2, promise3])\n  .then(result => {\n    console.log(\'第一个成功的结果:\', result);\n  })\n  .catch(error => {\n    console.error(\'所有操作都失败了\', error);\n  });\n```\n\n## 4. async/await\n\nES2017 引入了 async/await，它是基于 Promise 的语法糖，使异步代码看起来更像同步代码。\n\n```javascript\nasync function fetchData() {\n  try {\n    const response = await fetch(\'https://api.example.com/data\');\n    const data = await response.json();\n    const result = await processData(data);\n    return result;\n  } catch (error) {\n    console.error(\'发生错误:\', error);\n    throw error;\n  }\n}\n\n// 使用\nfetchData()\n  .then(result => console.log(result))\n  .catch(error => console.error(error));\n```\n\n## 5. Promise 实现原理\n\n### Promise 状态\n\nPromise 有三种状态：\n- **pending**: 初始状态，既不是成功也不是失败\n- **fulfilled**: 操作成功完成\n- **rejected**: 操作失败\n\n状态只能从 pending 转变为 fulfilled 或 rejected，且一旦转变，就不能再变。\n\n### 简单实现\n\n下面是一个简化版的 Promise 实现：\n\n```javascript\nclass MyPromise {\n  constructor(executor) {\n    this.state = \'pending\';\n    this.value = null;\n    this.reason = null;\n    this.onFulfilledCallbacks = [];\n    this.onRejectedCallbacks = [];\n\n    const resolve = (value) => {\n      if (this.state === \'pending\') {\n        this.state = \'fulfilled\';\n        this.value = value;\n        this.onFulfilledCallbacks.forEach(callback => callback());\n      }\n    };\n\n    const reject = (reason) => {\n      if (this.state === \'pending\') {\n        this.state = \'rejected\';\n        this.reason = reason;\n        this.onRejectedCallbacks.forEach(callback => callback());\n      }\n    };\n\n    try {\n      executor(resolve, reject);\n    } catch (error) {\n      reject(error);\n    }\n  }\n\n  then(onFulfilled, onRejected) {\n    return new MyPromise((resolve, reject) => {\n      if (this.state === \'fulfilled\') {\n        try {\n          const result = onFulfilled(this.value);\n          resolve(result);\n        } catch (error) {\n          reject(error);\n        }\n      }\n\n      if (this.state === \'rejected\') {\n        try {\n          const result = onRejected(this.reason);\n          resolve(result);\n        } catch (error) {\n          reject(error);\n        }\n      }\n\n      if (this.state === \'pending\') {\n        this.onFulfilledCallbacks.push(() => {\n          try {\n            const result = onFulfilled(this.value);\n            resolve(result);\n          } catch (error) {\n            reject(error);\n          }\n        });\n\n        this.onRejectedCallbacks.push(() => {\n          try {\n            const result = onRejected(this.reason);\n            resolve(result);\n          } catch (error) {\n            reject(error);\n          }\n        });\n      }\n    });\n  }\n\n  catch(onRejected) {\n    return this.then(null, onRejected);\n  }\n}\n```\n\n## 6. 常见陷阱和最佳实践\n\n### 常见陷阱\n\n- 忘记返回 Promise，导致链式调用中断\n- 忘记处理错误，导致未捕获的 Promise 错误\n- 在 Promise 构造函数中使用同步代码\n\n### 最佳实践\n\n- 始终返回 Promise，以支持链式调用\n- 始终使用 catch 捕获错误\n- 使用 async/await 使代码更清晰\n- 避免在循环中使用 await，使用 Promise.all 并行处理\n\n## 总结\n\nPromise 是 JavaScript 异步编程的重要组成部分，它使异步代码更加清晰和易于管理。通过掌握 Promise 的基本使用、链式调用、组合方法和 async/await 语法，我们可以编写出更加优雅和可靠的异步代码。希望本文能帮助你深入理解 JavaScript Promise！',
    excerpt: 'Promise 是 JavaScript 中处理异步操作的重要机制，它使异步代码更加清晰和易于管理。本文将深入探讨 Promise 的使用和原理，从基础到高级，帮助你全面掌握 Promise。',
    coverImage: 'https://picsum.photos/800/400?random=8',
    status: 'published',
    viewCount: 312,
    likeCount: 28,
    commentCount: 3,
    favoriteCount: 15,
    authorId: 1,
    author: {
      id: 1,
      username: 'admin',
      nickname: '管理员',
      avatar: 'https://i.pravatar.cc/150?img=1'
    },
    categoryId: 1,
    category: {
      id: 1,
      name: '前端开发',
      slug: 'frontend'
    },
    tagIds: [3],
    tags: [
      { id: 3, name: 'JavaScript', slug: 'javascript', color: '#f7df1e' }
    ],
    publishedAt: '2023-12-26T11:30:00Z',
    createdAt: '2023-12-25T15:45:00Z',
    updatedAt: '2023-12-26T11:30:00Z',
    isHot: false,
    isFeatured: false
  },
  {\n    id: 9,\n    title: 'Docker 容器化实践',\n    subtitle: '从零开始学习 Docker，掌握容器化技术',\n    content: '# Docker 容器化实践\n\nDocker 是一个开源的容器化平台，它允许开发者打包应用程序及其依赖项到一个轻量级、可移植的容器中。本文将介绍 Docker 的基本概念和实践。\n\n## 1. Docker 基础概念\n\n### 容器 vs 虚拟机\n\n容器和虚拟机都提供隔离环境，但它们的实现方式不同：\n- 虚拟机运行在完整的操作系统上，资源开销大\n- 容器共享宿主机内核，资源开销小，启动速度快\n\n### 核心概念\n\n- **镜像(Image)**: 只读模板，包含应用程序及其依赖\n- **容器(Container)**: 镜像的运行实例\n- **仓库(Repository)**: 存储镜像的地方\n- **Dockerfile**: 定义如何构建镜像的脚本\n- **Docker Compose**: 用于定义和运行多容器 Docker 应用的工具\n\n## 2. Docker 安装\n\n### Linux\n\n```bash\n# Ubuntu\nsudo apt-get update\nsudo apt-get install docker.io\n\n# CentOS\nsudo yum install docker\n\n# 启动 Docker 服务\nsudo systemctl start docker\nsudo systemctl enable docker\n```\n\n### macOS 和 Windows\n\n下载并安装 Docker Desktop：https://www.docker.com/products/docker-desktop\n\n## 3. Docker 基本命令\n\n### 镜像操作\n\n```bash\n# 拉取镜像\ndocker pull nginx:latest\n\n# 列出本地镜像\ndocker images\n\n# 删除镜像\ndocker rmi nginx:latest\n\n# 构建镜像\ndocker build -t myapp:v1 .\n```\n\n### 容器操作\n\n```bash\n# 运行容器\ndocker run -d -p 8080:80 --name mynginx nginx:latest\n\n# 列出运行中的容器\ndocker ps\n\n# 列出所有容器（包括停止的）\ndocker ps -a\n\n# 停止容器\ndocker stop mynginx\n\n# 启动容器\ndocker start mynginx\n\n# 删除容器\ndocker rm mynginx\n\n# 进入容器\ndocker exec -it mynginx /bin/bash\n\n# 查看容器日志\ndocker logs mynginx\n```\n\n## 4. Dockerfile 详解\n\nDockerfile 是一个文本文件，包含构建镜像的指令。\n\n```dockerfile\n# 使用官方 Node.js 镜像作为基础镜像\nFROM node:14-alpine\n\n# 设置工作目录\nWORKDIR /app\n\n# 复制 package.json 和 package-lock.json\nCOPY package*.json ./\n\n# 安装依赖\nRUN npm install\n\n# 复制应用程序代码\nCOPY . .\n\n# 构建应用\nRUN npm run build\n\n# 暴露端口\nEXPOSE 3000\n\n# 定义启动命令\nCMD ["npm", "start"]\n```\n\n常用指令：\n- **FROM**: 指定基础镜像\n- **WORKDIR**: 设置工作目录\n- **COPY**: 复制文件\n- **RUN**: 执行命令\n- **EXPOSE**: 暴露端口\n- **CMD**: 定义容器启动时执行的命令\n- **ENTRYPOINT**: 定义容器入口点\n- **ENV**: 设置环境变量\n\n## 5. Docker Compose\n\nDocker Compose 用于定义和运行多容器应用。\n\n### docker-compose.yml 示例\n\n```yaml\nversion: '3'\nservices:\n  web:\n    build: .\n    ports:\n      - "3000:3000"\n    depends_on:\n      - db\n  db:\n    image: postgres:12\n    environment:\n      POSTGRES_USER: admin\n      POSTGRES_PASSWORD: password\n      POSTGRES_DB: myapp\n    volumes:\n      - postgres-data:/var/lib/postgresql/data\nvolumes:\n  postgres-data:\n```\n\n### 基本命令\n\n```bash\n# 启动服务\ndocker-compose up -d\n\n# 停止服务\ndocker-compose down\n\n# 查看服务状态\ndocker-compose ps\n\n# 查看服务日志\ndocker-compose logs\n\n# 重新构建镜像并启动\ndocker-compose up -d --build\n```\n\n## 6. 容器化最佳实践\n\n### 镜像优化\n\n- 使用多阶段构建减小镜像体积\n- 使用 Alpine 基础镜像\n- 优化层缓存\n- 清理不必要的文件\n\n### 安全性\n\n- 使用非 root 用户运行容器\n- 定期更新基础镜像\n- 使用镜像扫描工具检查漏洞\n- 限制容器权限\n\n### 生产环境部署\n\n- 使用 Docker Compose 或 Kubernetes 管理容器\n- 实现自动化构建和部署\n- 设置健康检查\n- 实现日志收集和监控\n\n## 7. 实战项目\n\n下面是一个简单的 Node.js 应用容器化的完整流程：\n\n### 1. 创建项目结构\n\n```\nmyapp/\n  ├── Dockerfile\n  ├── docker-compose.yml\n  ├── package.json\n  └── server.js\n```\n\n### 2. 编写 server.js\n\n```javascript\nconst express = require('express');\nconst app = express();\nconst PORT = process.env.PORT || 3000;\n\napp.get('/', (req, res) => {\n  res.send('Hello from Docker!');\n});\n\napp.listen(PORT, () => {\n  console.log(`Server running on port ${PORT}`);\n});\n```\n\n### 3. 编写 Dockerfile\n\n```dockerfile\nFROM node:14-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install --production\nCOPY . .\nEXPOSE 3000\nCMD ["node", "server.js"]\n```\n\n### 4. 编写 docker-compose.yml\n\n```yaml\nversion: '3'\nservices:\n  app:\n    build: .\n    ports:\n      - "3000:3000"\n    restart: always\n```\n\n### 5. 构建和运行\n\n```bash\ndocker-compose up -d --build\n```\n\n## 总结\n\nDocker 已经成为现代软件开发和部署的重要工具，它大大简化了应用程序的打包、分发和部署过程。通过掌握 Docker 的基本概念、命令和最佳实践，我们可以更加高效地开发和部署应用程序。希望本文能帮助你开始 Docker 容器化之旅！',
    excerpt: 'Docker 是一个开源的容器化平台，它允许开发者打包应用程序及其依赖项到一个轻量级、可移植的容器中。本文将介绍 Docker 的基本概念和实践，帮助你从零开始学习 Docker。',
    coverImage: 'https://picsum.photos/800/400?random=9',
    status: 'published',
    viewCount: 289,
    likeCount: 25,
    commentCount: 2,
    favoriteCount: 14,
    authorId: 1,
    author: {
      id: 1,
      username: 'admin',
      nickname: '管理员',
      avatar: 'https://i.pravatar.cc/150?img=1'
    },
    categoryId: 6,
    category: {
      id: 6,
      name: '开发工具',
      slug: 'development-tools'
    },
    tagIds: [15, 23],
    tags: [
      { id: 15, name: 'Docker', slug: 'docker', color: '#2496ed' },
      { id: 23, name: '前端工程化', slug: 'frontend-engineering', color: '#3498db' }
    ],
    publishedAt: '2023-12-24T10:15:00Z',
    createdAt: '2023-12-23T14:30:00Z',
    updatedAt: '2023-12-24T10:15:00Z',
    isHot: false,
    isFeatured: false
  },
  {\n    id: 10,\n    title: '现代前端工程化实践',\n    subtitle: '构建高效、可维护的前端开发工作流',\n    content: '# 现代前端工程化实践\n\n前端工程化是指将软件工程的方法和工具应用于前端开发，以提高开发效率和代码质量。本文将介绍现代前端工程化的实践方法。\n\n## 1. 项目初始化和脚手架\n\n使用现代化的脚手架工具快速创建项目，避免从零开始搭建基础架构。\n\n### Vite\n\n```bash\nnpm create vite@latest my-app -- --template vue\ncd my-app\nnpm install\nnpm run dev\n```\n\n### Create React App\n\n```bash\nnpx create-react-app my-app\ncd my-app\nnpm start\n```\n\n## 2. 依赖管理\n\n合理管理项目依赖，保持依赖的版本一致性和可维护性。\n\n### package.json 配置\n\n```json\n{\n  "name": "my-app",\n  "version": "1.0.0",\n  "private": true,\n  "scripts": {\n    "dev": "vite",\n    "build": "vite