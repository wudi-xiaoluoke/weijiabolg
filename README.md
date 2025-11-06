# 技术博客系统

## 项目简介

这是一个功能完备的技术博客系统，采用前后端分离架构，支持文章发布、分类管理、标签管理、用户互动等核心功能。系统提供了（优雅的用户界面和流畅的交互体验）（AI王婆卖瓜），同时具备完善的权限管理和数据安全保障。

## 系统架构

采用现代化的前后端分离架构：

- **前端**：基于Vue 3 + Composition API构建，提供响应式用户界面
- **后端**：基于Spring Boot 3.x实现，提供RESTful API服务
- **数据库**：MySQL存储持久化数据
- **认证**：JWT (JSON Web Token)实现无状态认证

## 技术栈

### 前端技术

- **框架**：Vue 3 + Composition API
- **路由管理**：Vue Router 4
- **状态管理**：Pinia
- **UI组件库**：Element Plus
- **HTTP客户端**：Axios
- **构建工具**：Vite

### 后端技术

- **框架**：Spring Boot 3.x
- **ORM框架**：MyBatis-Plus
- **数据库**：MySQL
- **认证授权**：JWT
- **API文档**：Swagger/OpenAPI

## 功能特性

### 1. 用户管理

- 用户注册与登录
- 个人信息管理
- 密码修改
- 用户角色权限控制

### 2. 文章管理

- 文章创建、编辑、删除
- 文章发布与草稿保存
- 文章详情查看
- 文章列表分页查询
- 文章点赞与收藏

### 3. 分类管理

- 分类的创建、编辑、删除
- 按分类筛选文章

### 4. 标签管理

- 标签的创建、编辑、删除
- 按标签筛选文章
- 文章与标签的关联管理

### 5. 社交互动

- 文章点赞功能
- 文章收藏功能
- 评论系统
- 社交分享功能

### 6. 其他功能

- 黑暗模式支持
- 响应式布局，适配不同设备
- 全局搜索功能

## 项目结构

```
技术博客/
├── frontend/             # Vue前端项目
│   ├── src/              # 前端源代码
│   │   ├── api/          # API请求封装
│   │   ├── components/   # Vue组件
│   │   ├── router/       # 路由配置
│   │   ├── store/        # 状态管理
│   │   ├── views/        # 页面视图
│   │   └── main.js       # 入口文件
│   └── vite.config.js    # Vite配置
│
├── weijiahome/           # Spring Boot后端项目
│   ├── src/main/java/com/example/weijiahome/
│   │   ├── controller/   # 控制器
│   │   ├── service/      # 服务层
│   │   ├── mapper/       # 数据访问层
│   │   ├── entity/       # 实体类
│   │   ├── dto/          # 数据传输对象
│   │   ├── vo/           # 视图对象
│   │   ├── config/       # 配置类
│   │   └── utils/        # 工具类
│   └── pom.xml           # Maven依赖配置
│
├── 后端API接口文档.md     # API接口文档
├── 用户功能模块文档.md     # 用户模块详细文档
├── 文章功能模块文档.md     # 文章模块详细文档
├── 分类功能模块文档.md     # 分类模块详细文档
└── 标签功能模块文档.md     # 标签模块详细文档
```

## 快速开始

### 环境要求

- **Node.js**：v20.19.0 或更高版本
- **Java**：JDK 17 或更高版本
- **MySQL**：8.0 或更高版本

### 前端安装与运行

1. 进入前端目录
```bash
cd frontend
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

### 后端安装与运行

1. 进入后端目录
```bash
cd weijiahome
```

2. 配置数据库连接
   修改 `src/main/resources/application.yml` 中的数据库配置

3. 编译项目
```bash
mvn clean package
```

4. 运行应用
```bash
java -jar target/weijiahome-0.0.1-SNAPSHOT.jar
```

## API文档

系统提供了完整的RESTful API接口，可通过以下地址访问API文档：

- Swagger UI: `http://localhost:8080/swagger-ui/index.html`
- API文档: `http://localhost:8080/v3/api-docs`

详细的API接口说明请参考项目中的《后端API接口文档.md》文件。

## 开发规范

### 前端开发规范

- 组件命名：采用大驼峰命名法（PascalCase）
- 变量命名：采用小驼峰命名法（camelCase）
- 文件命名：组件文件使用大驼峰，其他文件使用小驼峰或短横线连接
- 代码风格：遵循ESLint和Prettier规范

### 后端开发规范

- 类命名：采用大驼峰命名法
- 方法命名：采用小驼峰命名法
- 变量命名：采用小驼峰命名法
- 常量命名：采用全大写加下划线命名法
- 代码风格：遵循Spring Boot官方推荐规范

## 安全措施

- 使用JWT进行身份认证
- 密码采用加密存储
- API接口进行权限验证
- 防止SQL注入、XSS攻击等常见安全问题
- 敏感操作需要验证用户身份

## 许可证

[MIT](LICENSE)

## 致谢

感谢所有为本项目做出贡献的开发者和用户！