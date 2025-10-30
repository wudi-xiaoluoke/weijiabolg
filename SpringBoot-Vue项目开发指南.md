# Spring Boot + Vue 项目开发指南

## 1. 项目结构

### 1.1 整体结构
```
your-project/
├── frontend/             # Vue前端项目
│   ├── public/           # 静态资源目录
│   ├── src/              # 源代码目录
│   │   ├── api/          # API请求封装
│   │   ├── assets/       # 资源文件
│   │   ├── components/   # 组件
│   │   ├── router/       # 路由配置
│   │   ├── store/        # 状态管理
│   │   ├── utils/        # 工具函数
│   │   ├── views/        # 页面视图
│   │   ├── App.vue       # 根组件
│   │   └── main.js       # 入口文件
│   ├── .env              # 环境变量配置
│   ├── package.json      # 项目依赖
│   ├── vite.config.js    # Vite配置
│   └── Dockerfile        # 前端Docker构建文件
│
├── backend/              # Spring Boot后端项目
│   ├── src/main/java/com/example/yourproject/
│   │   ├── config/       # 配置类
│   │   ├── controller/   # 控制器
│   │   ├── entity/       # 实体类
│   │   ├── mapper/       # MyBatis映射器
│   │   ├── service/      # 服务层
│   │   │   └── impl/     # 服务实现
│   │   ├── dto/          # 数据传输对象
│   │   ├── vo/           # 视图对象
│   │   ├── exception/    # 异常处理
│   │   ├── utils/        # 工具类
│   │   ├── constant/     # 常量类
│   │   └── YourProjectApplication.java # 启动类
│   ├── src/main/resources/
│   │   ├── application.yml # 应用配置
│   │   ├── mapper/       # MyBatis XML映射文件
│   │   └── static/       # 静态资源
│   ├── .env              # 环境变量
│   ├── pom.xml           # Maven依赖
│   └── Dockerfile        # 后端Docker构建文件
│
└── docker-compose.yml    # Docker Compose配置文件
```

### 1.2 关键文件说明
- **frontend/package.json**：前端项目依赖和脚本配置
- **frontend/vite.config.js**：Vite构建工具配置
- **backend/pom.xml**：后端Maven依赖配置
- **backend/src/main/resources/application.yml**：Spring Boot应用配置
- **docker-compose.yml**：多容器部署配置

## 2. Spring Boot 后端开发

### 2.1 项目初始化
使用Spring Initializr创建项目：
1. 访问 [Spring Initializr](https://start.spring.io/)
2. 选择以下依赖：
   - Spring Web
   - Spring Data JPA/MyBatis-Plus
   - MySQL Driver
   - Spring Security
   - Spring for RabbitMQ
   - Spring Cache (Redis)
   - SpringDoc OpenAPI (Swagger)
3. 生成项目并导入IDE

### 2.2 核心配置
#### application.yml 配置示例
```yaml
spring:
  # 数据库配置
  datasource:
    url: ${SPRING_DATASOURCE_URL}
    username: ${SPRING_DATASOURCE_USERNAME}
    password: ${SPRING_DATASOURCE_PASSWORD}
    driver-class-name: com.mysql.cj.jdbc.Driver
  
  # Redis配置
  redis:
    host: ${SPRING_REDIS_HOST}
    port: ${SPRING_REDIS_PORT}
    timeout: 3000ms
  
  # RabbitMQ配置
  rabbitmq:
    host: ${SPRING_RABBITMQ_HOST}
    port: ${SPRING_RABBITMQ_PORT}
    username: ${SPRING_RABBITMQ_USERNAME}
    password: ${SPRING_RABBITMQ_PASSWORD}
  
  # MyBatis-Plus配置
  main:
    allow-bean-definition-overriding: true
  
# MyBatis-Plus配置
mybatis-plus:
  mapper-locations: classpath:/mapper/**/*.xml
  type-aliases-package: com.example.yourproject.entity
  configuration:
    map-underscore-to-camel-case: true
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl

# 服务器配置
server:
  port: ${SERVER_PORT}
  servlet:
    context-path: /api

# Swagger配置
springdoc:
  api-docs:
    path: /v3/api-docs
  swagger-ui:
    path: /swagger-ui.html
    operations-sorter: alpha

# JWT配置
jwt:
  secret: ${JWT_SECRET}
  expiration: 86400000
```

### 2.3 实体类示例
```java
package com.example.yourproject.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

@Data
@TableName("products")
public class Product {
    @TableId(type = IdType.ASSIGN_UUID)
    private String id;         // 产品唯一标识
    private String name;       // 产品名称
    private String description;// 产品描述
    private BigDecimal price;  // 产品价格
    private String category;   // 产品分类
    private Integer stock;     // 库存数量
    @TableField(typeHandler = JacksonTypeHandler.class)
    private List<String> images; // 产品图片
    private Integer status;    // 产品状态 (0:下架, 1:上架)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date createTime;   // 创建时间
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date updateTime;   // 更新时间
}
```

### 2.4 Mapper 示例
```java
package com.example.yourproject.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.yourproject.entity.Product;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ProductMapper extends BaseMapper<Product> {
    // 自定义查询方法示例
    List<Product> selectByCategory(@Param("category") String category);
    
    List<Product> selectByStatus(@Param("status") Integer status);
}
```

### 2.5 Service 示例
```java
package com.example.yourproject.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.yourproject.entity.Product;
import com.example.yourproject.dto.ProductDTO;
import com.example.yourproject.vo.ProductVO;

import java.util.List;

public interface ProductService extends IService<Product> {
    // 添加产品
    ProductVO addProduct(ProductDTO productDTO);
    
    // 获取产品列表
    List<ProductVO> getProductList(String category, Integer status, Integer page, Integer size);
    
    // 获取产品详情
    ProductVO getProductById(String id);
    
    // 更新产品
    ProductVO updateProduct(String id, ProductDTO productDTO);
    
    // 删除产品
    boolean deleteProduct(String id);
    
    // 上架/下架产品
    boolean changeProductStatus(String id, Integer status);
}
```

### 2.6 ServiceImpl 示例
```java
package com.example.yourproject.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.yourproject.entity.Product;
import com.example.yourproject.mapper.ProductMapper;
import com.example.yourproject.service.ProductService;
import com.example.yourproject.dto.ProductDTO;
import com.example.yourproject.vo.ProductVO;
import com.example.yourproject.utils.BeanCopyUtils;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductServiceImpl extends ServiceImpl<ProductMapper, Product> implements ProductService {

    @Override
    public ProductVO addProduct(ProductDTO productDTO) {
        Product product = BeanCopyUtils.copyBean(productDTO, Product.class);
        product.setCreateTime(new Date());
        product.setUpdateTime(new Date());
        save(product);
        return BeanCopyUtils.copyBean(product, ProductVO.class);
    }

    @Override
    public List<ProductVO> getProductList(String category, Integer status, Integer page, Integer size) {
        QueryWrapper<Product> queryWrapper = new QueryWrapper<>();
        if (category != null && !category.isEmpty()) {
            queryWrapper.eq("category", category);
        }
        if (status != null) {
            queryWrapper.eq("status", status);
        }
        queryWrapper.orderByDesc("update_time");
        
        IPage<Product> productPage = page(new Page<>(page, size), queryWrapper);
        return productPage.getRecords().stream()
                .map(product -> BeanCopyUtils.copyBean(product, ProductVO.class))
                .collect(Collectors.toList());
    }

    // 其他方法实现...
}
```

### 2.7 Controller 示例
```java
package com.example.yourproject.controller;

import com.example.yourproject.common.Result;
import com.example.yourproject.service.ProductService;
import com.example.yourproject.dto.ProductDTO;
import com.example.yourproject.vo.ProductVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products")
@Tag(name = "产品管理", description = "产品的CRUD操作")
public class ProductController {
    
    @Autowired
    private ProductService productService;
    
    @Operation(summary = "创建产品", description = "添加新的产品信息")
    @PostMapping
    public Result<ProductVO> addProduct(@RequestBody ProductDTO productDTO) {
        ProductVO productVO = productService.addProduct(productDTO);
        return Result.success(productVO);
    }
    
    @Operation(summary = "获取产品列表", description = "分页查询产品列表")
    @GetMapping
    public Result<List<ProductVO>> getProductList(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Integer status,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {
        List<ProductVO> productList = productService.getProductList(category, status, page, size);
        return Result.success(productList);
    }
    
    // 其他接口实现...
}
```

### 2.8 Redis 缓存使用示例
```java
package com.example.yourproject.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.yourproject.entity.Product;
import com.example.yourproject.mapper.ProductMapper;
import com.example.yourproject.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
public class ProductServiceImpl extends ServiceImpl<ProductMapper, Product> implements ProductService {
    
    @Autowired
    private ProductMapper productMapper;
    
    @Cacheable(value = "product", key = "#id")
    public Product getProductById(String id) {
        return productMapper.selectById(id);
    }
    
    @CachePut(value = "product", key = "#result.id")
    public Product updateProduct(Product product) {
        productMapper.updateById(product);
        return product;
    }
    
    @CacheEvict(value = "product", key = "#id")
    public void deleteProduct(String id) {
        productMapper.deleteById(id);
    }
}
```

### 2.9 RabbitMQ 消息发送与接收示例
#### 消息发送示例
```java
package com.example.yourproject.service;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class MessageService {
    
    @Autowired
    private RabbitTemplate rabbitTemplate;
    
    public void sendOrderMessage(Object message) {
        // 发送消息到订单队列
        rabbitTemplate.convertAndSend("order-exchange", "order.key", message);
    }
    
    public void sendLogisticsMessage(Object message) {
        // 发送消息到物流队列
        rabbitTemplate.convertAndSend("logistics-exchange", "logistics.key", message);
    }
}
```

#### 消息接收示例
```java
package com.example.yourproject.config;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class MessageReceiver {
    
    @RabbitListener(queues = "order-queue")
    public void receiveOrderMessage(Object message) {
        // 处理订单消息
        System.out.println("收到订单消息: " + message);
        // 执行业务逻辑
    }
    
    @RabbitListener(queues = "logistics-queue")
    public void receiveLogisticsMessage(Object message) {
        // 处理物流消息
        System.out.println("收到物流消息: " + message);
        // 执行业务逻辑
    }
}
```

## 3. Vue 前端开发

### 3.1 项目初始化
使用Vite创建Vue项目：
```bash
npm create vite@latest frontend -- --template vue
cd frontend
npm install
```

### 3.2 安装必要依赖
```bash
# 安装axios（HTTP客户端）
npm install axios

# 安装Vue Router（路由管理）
npm install vue-router@4

# 安装Pinia（状态管理）
npm install pinia

# 安装Element Plus（UI组件库）
npm install element-plus --save

# 安装SCSS（样式预处理）
npm install sass --save-dev
```

### 3.3 项目配置
#### vite.config.js 配置示例
```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'static'
  }
})
```

### 3.4 路由配置示例
```javascript
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/products',
      name: 'products',
      component: () => import('../views/ProductListView.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/products/:id',
      name: 'productDetail',
      component: () => import('../views/ProductDetailView.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/orders',
      name: 'orders',
      component: () => import('../views/OrderListView.vue'),
      meta: {
        requiresAuth: true
      }
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next({ name: 'login' })
  } else {
    next()
  }
})

export default router
```

### 3.5 API 请求封装示例
```javascript
import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    // 统一处理响应数据
    return response.data
  },
  error => {
    // 统一处理错误
    if (error.response && error.response.status === 401) {
      // 未授权，跳转到登录页
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
```

### 3.6 API 模块示例
```javascript
import api from './request'

// 用户相关API
export const userAPI = {
  login(data) {
    return api.post('/users/login', data)
  },
  register(data) {
    return api.post('/users/register', data)
  },
  getProfile() {
    return api.get('/users/profile')
  }
}

// 产品相关API
export const productAPI = {
  getProducts(params) {
    return api.get('/products', { params })
  },
  getProduct(id) {
    return api.get(`/products/${id}`)
  },
  createProduct(data) {
    return api.post('/products', data)
  },
  updateProduct(id, data) {
    return api.put(`/products/${id}`, data)
  },
  deleteProduct(id) {
    return api.delete(`/products/${id}`)
  }
}

// 订单相关API
export const orderAPI = {
  getOrders(params) {
    return api.get('/orders', { params })
  },
  createOrder(data) {
    return api.post('/orders', data)
  },
  payOrder(id) {
    return api.post(`/orders/${id}/pay`)
  },
  cancelOrder(id) {
    return api.post(`/orders/${id}/cancel`)
  }
}
```

### 3.7 组件示例
#### 产品列表组件
```vue
<template>
  <div class="product-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>产品列表</span>
          <el-button type="primary" @click="handleAddProduct">添加产品</el-button>
        </div>
      </template>
      
      <!-- 搜索和筛选 -->
      <div class="search-filter mb-4">
        <el-input v-model="searchKeyword" placeholder="搜索产品名称" style="width: 200px; margin-right: 10px" />
        <el-select v-model="categoryFilter" placeholder="选择分类" style="width: 150px; margin-right: 10px">
          <el-option label="全部" value="" />
          <el-option v-for="category in categories" :key="category" :label="category" :value="category" />
        </el-select>
        <el-select v-model="statusFilter" placeholder="产品状态" style="width: 150px; margin-right: 10px">
          <el-option label="全部" value="" />
          <el-option label="上架" :value="1" />
          <el-option label="下架" :value="0" />
        </el-select>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </div>
      
      <!-- 产品表格 -->
      <el-table :data="products" style="width: 100%">
        <el-table-column prop="id" label="产品ID" width="180" />
        <el-table-column prop="name" label="产品名称" />
        <el-table-column prop="price" label="价格" width="100">
          <template #default="scope">￥{{ scope.row.price }}</template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="stock" label="库存" width="80" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleView(scope.row)">查看</el-button>
            <el-button type="success" size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination mt-4">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { productAPI } from '../api/product'
import { useRouter } from 'vue-router'

const router = useRouter()

// 数据
const products = ref([])
const searchKeyword = ref('')
const categoryFilter = ref('')
const statusFilter = ref('')
const categories = ref(['电子产品', '家居用品', '服装鞋帽', '食品饮料'])

// 分页数据
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 获取产品列表
const getProducts = async () => {
  try {
    const params = {
      page: pagination.value.currentPage,
      size: pagination.value.pageSize,
      category: categoryFilter.value,
      status: statusFilter.value
    }
    
    if (searchKeyword.value) {
      params.keyword = searchKeyword.value
    }
    
    const res = await productAPI.getProducts(params)
    if (res.code === 200) {
      products.value = res.data
      // 假设res.total包含总条数
      pagination.value.total = res.total || 0
    } else {
      ElMessage.error(res.message || '获取产品列表失败')
    }
  } catch (error) {
    ElMessage.error('获取产品列表失败')
    console.error(error)
  }
}

// 搜索
const handleSearch = () => {
  pagination.value.currentPage = 1
  getProducts()
}

// 分页大小变化
const handleSizeChange = (size) => {
  pagination.value.pageSize = size
  getProducts()
}

// 页码变化
const handleCurrentChange = (current) => {
  pagination.value.currentPage = current
  getProducts()
}

// 添加产品
const handleAddProduct = () => {
  router.push('/products/add')
}

// 查看产品
const handleView = (product) => {
  router.push(`/products/${product.id}`)
}

// 编辑产品
const handleEdit = (product) => {
  router.push({ path: '/products/edit', query: { id: product.id } })
}

// 删除产品
const handleDelete = async (id) => {
  try {
    const res = await productAPI.deleteProduct(id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      getProducts()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (error) {
    ElMessage.error('删除失败')
    console.error(error)
  }
}

// 页面加载时获取产品列表
onMounted(() => {
  getProducts()
})
</script>

<style scoped>
.product-list {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-filter {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
```

### 3.8 Element Plus 配置示例
```javascript
// main.js
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import store from './store'

const app = createApp(App)

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(ElementPlus)
app.use(router)
app.use(store)

app.mount('#app')
```

## 4. 开发工作流

### 4.1 本地开发
1. **启动后端服务**
```bash
cd backend
mvn spring-boot:run
```

2. **启动前端服务**
```bash
cd frontend
npm run dev
```

3. **访问应用**
   - 前端应用：http://localhost:3000
   - 后端API：http://localhost:8080/api
   - Swagger文档：http://localhost:8080/api/swagger-ui.html

### 4.2 代码提交规范
遵循语义化提交信息格式：`类型(范围): 描述`
- **feat**: 添加新功能
- **fix**: 修复bug
- **docs**: 仅文档变更
- **style**: 不影响代码含义的变更（空白、格式等）
- **refactor**: 既不是修复bug也不是添加功能的代码变更
- **test**: 添加缺失的测试或更正现有测试
- **chore**: 构建过程或辅助工具的变动

### 4.3 分支管理策略
- **master**：主分支，用于生产环境部署
- **develop**：开发分支，所有功能开发完成后合并到此分支
- **feature/xxx**：功能分支，用于开发新功能
- **fix/xxx**：修复分支，用于修复bug
- **release/xxx**：发布分支，用于准备发布版本

## 5. 部署流程

### 5.1 使用Docker Compose部署
1. **准备环境**
   - 安装Docker和Docker Compose
   - 克隆代码仓库
   - 配置环境变量

2. **构建并启动服务**
```bash
docker-compose up -d --build
```

3. **验证服务**
   - 前端应用：http://服务器IP:80
   - 后端API：http://服务器IP:8080/api
   - RabbitMQ管理界面：http://服务器IP:15672

### 5.2 手动部署
1. **构建前端应用**
```bash
cd frontend
npm install
npm run build
# 将dist目录部署到Nginx或其他Web服务器
```

2. **构建后端应用**
```bash
cd backend
mvn clean package
# 部署生成的jar包
java -jar target/your-project-0.0.1-SNAPSHOT.jar
```

## 6. 常见问题及解决方案

### 6.1 前端问题
1. **跨域问题**
   - 解决方案：配置Vite代理或在Spring Boot后端添加CORS配置

2. **API请求超时**
   - 解决方案：增加axios超时时间配置
   ```javascript
   const api = axios.create({
     timeout: 30000 // 30秒
   })
   ```

### 6.2 后端问题
1. **数据库连接池配置**
   - 解决方案：在application.yml中添加连接池配置
   ```yaml
   spring:
     datasource:
       hikari:
         maximum-pool-size: 20
         minimum-idle: 5
         idle-timeout: 30000
         connection-timeout: 30000
   ```

2. **Redis缓存失效**
   - 解决方案：检查Redis连接配置和缓存键命名规范

3. **RabbitMQ消息丢失**
   - 解决方案：配置消息持久化和确认机制

## 7. 性能优化建议

### 7.1 前端优化
1. **组件懒加载**
   ```javascript
   const routes = [
     {
       path: '/products',
       name: 'products',
       component: () => import('../views/ProductListView.vue')
     }
   ]
   ```

2. **图片懒加载**
   ```vue
   <img v-lazy="imageUrl" alt="产品图片">
   ```

3. **使用虚拟滚动处理大数据列表**

### 7.2 后端优化
1. **合理使用缓存**
   - 对频繁查询的数据使用Redis缓存
   - 设置适当的缓存过期时间

2. **数据库优化**
   - 添加合适的索引
   - 优化SQL查询
   - 使用分页查询

3. **异步处理**
   - 使用RabbitMQ处理异步任务
   - 使用CompletableFuture处理并行任务

4. **连接池优化**
   - 配置合适的连接池大小
   - 监控连接池状态

## 8. 安全建议

### 8.1 前端安全
1. **XSS防护**
   - 使用Vue的v-html指令时注意过滤HTML内容
   - 对用户输入进行验证和转义

2. **CSRF防护**
   - 使用axios的xsrfCookieName和xsrfHeaderName配置

### 8.2 后端安全
1. **认证与授权**
   - 使用Spring Security结合JWT进行认证
   - 实现基于角色的访问控制（RBAC）

2. **SQL注入防护**
   - 使用MyBatis-Plus的条件构造器
   - 参数化查询

3. **接口限流**
   - 使用Spring Cloud Gateway或Redis实现接口限流

4. **敏感信息加密**
   - 数据库中密码使用BCrypt加密
   - 敏感数据传输使用HTTPS

---
*本文档由 [项目名称] 团队编制，版权所有 © 2023*