# JavaScript 工具库使用指南

## 🎯 概述

这是一个功能全面的 JavaScript 工具库，提供了 27 个实用函数，涵盖树形数据结构处理、Promise 操作和并发控制等核心功能。每个函数都经过精心设计，确保独立性和易用性。

## 📁 项目结构

```
js/
├── treeUtils.js           # 树形数据结构工具 (10个函数)
├── promiseUtils.js        # Promise 工具方法 (9个函数)
├── concurrencyUtils.js    # 并发控制工具 (8个函数)
├── index.js              # 统一导出文件
├── treeUtils.md          # 树形函数详细文档
├── promiseUtils.md       # Promise 函数详细文档
├── concurrencyUtils.md   # 并发控制函数详细文档
└── README.md             # 本文件 - 使用指南
```

## 🚀 快速开始

### 安装和导入

```javascript
// 导入整个工具库
import { treeUtils, promiseUtils, concurrencyUtils } from './js/index.js';

// 或单独导入模块
import { findNode, flattenTree } from './js/treeUtils.js';
import { promiseRetry, promiseTimeout } from './js/promiseUtils.js';
import { asyncPool, circuitBreaker } from './js/concurrencyUtils.js';
```

### 基础使用示例

```javascript
// 树形数据处理
const menuTree = [
  {
    name: '系统管理',
    children: [
      { name: '用户管理' },
      { name: '角色管理' }
    ]
  }
];

// 查找特定节点
const userManageNode = findNode(menuTree, node => node.name === '用户管理');

// 展平树结构
const flatMenu = flattenTree(menuTree);

// Promise 操作
const fetchWithRetry = () => promiseRetry(
  () => fetch('/api/data'),
  3, // 重试3次
  1000 // 间隔1秒
);

// 并发控制
const results = await asyncPool(5, urls, url => fetch(url));
```

## 📋 函数索引

### 🌳 树形数据结构工具 (treeUtils.js)

| 函数名 | 功能描述 | 使用场景 |
|--------|----------|----------|
| `findNode()` | 在树中查找节点 | 菜单权限查找、文件搜索 |
| `traverseTree()` | 遍历树结构 | 批量更新、数据统计 |
| `flattenTree()` | 树结构扁平化 | 数据导出、搜索索引 |
| `getTreePath()` | 获取节点路径 | 面包屑导航、路径显示 |
| `buildTreeFromFlat()` | 扁平数据转树 | 数据库数据转换 |
| `filterTree()` | 过滤树节点 | 权限过滤、搜索过滤 |
| `mapTree()` | 映射树节点 | 数据转换、格式化 |
| `getTreeDepth()` | 获取树深度 | 性能评估、结构分析 |
| `countTreeNodes()` | 统计节点数量 | 数据统计、资源评估 |
| `findTreeParents()` | 查找父节点链 | 权限继承、路径回溯 |

**[查看详细文档 →](treeUtils.md)**

### ⚡ Promise 工具方法 (promiseUtils.js)

| 函数名 | 功能描述 | 使用场景 |
|--------|----------|----------|
| `promiseAllInBatches()` | 分批执行Promise | 批量API调用、文件上传 |
| `promiseRetry()` | 失败重试 | 网络请求、文件操作 |
| `promiseTimeout()` | 超时控制 | API调用、文件读取 |
| `chainPromises()` | 链式执行 | 工作流、数据处理 |
| `raceWithTimeout()` | 带超时竞速 | 多源数据、备用方案 |
| `allSettledWithResults()` | 获取所有结果 | 批量操作、错误统计 |
| `promiseWithCancellation()` | 可取消Promise | 用户取消、资源释放 |
| `debouncePromise()` | 防抖Promise | 搜索建议、自动保存 |
| `throttlePromise()` | 节流Promise | 滚动加载、实时更新 |

**[查看详细文档 →](promiseUtils.md)**

### 🎛️ 并发控制工具 (concurrencyUtils.js)

| 函数名 | 功能描述 | 使用场景 |
|--------|----------|----------|
| `asyncPool()` | 并发池控制 | 爬虫、批量处理 |
| `queueProcessor()` | 队列处理器 | 任务队列、消息处理 |
| `rateLimiter()` | 频率限制器 | API调用、用户操作 |
| `semaphore()` | 信号量控制 | 数据库连接、文件访问 |
| `circuitBreaker()` | 熔断器模式 | 微服务、第三方API |
| `loadBalancer()` | 负载均衡 | 分布式处理、多服务器 |
| `backoffRetry()` | 指数退避重试 | 网络重试、服务恢复 |
| `priorityQueue()` | 优先级队列 | 任务调度、消息处理 |

**[查看详细文档 →](concurrencyUtils.md)**

## 🎯 按场景分类的函数推荐

### 数据处理场景
- **树形数据处理**: `findNode()`, `flattenTree()`, `buildTreeFromFlat()`
- **数据转换**: `mapTree()`, `filterTree()`, `chainPromises()`
- **批量操作**: `promiseAllInBatches()`, `asyncPool()`, `allSettledWithResults()`

### 网络请求场景
- **API调用**: `promiseTimeout()`, `promiseRetry()`, `circuitBreaker()`
- **并发控制**: `rateLimiter()`, `asyncPool()`, `semaphore()`
- **容错处理**: `raceWithTimeout()`, `backoffRetry()`, `promiseWithCancellation()`

### 用户界面场景
- **搜索功能**: `debouncePromise()`, `findNode()`, `flattenTree()`
- **实时更新**: `throttlePromise()`, `queueProcessor()`
- **导航菜单**: `getTreePath()`, `filterTree()`, `findTreeParents()`

### 系统性能场景
- **资源管理**: `semaphore()`, `asyncPool()`, `loadBalancer()`
- **错误恢复**: `promiseRetry()`, `circuitBreaker()`, `backoffRetry()`
- **流量控制**: `rateLimiter()`, `priorityQueue()`, `queueProcessor()`

## 💡 最佳实践

### 1. 错误处理
```javascript
// 始终使用 try-catch 处理异步操作
try {
  const result = await promiseRetry(apiCall, 3, 1000);
  console.log('操作成功:', result);
} catch (error) {
  console.error('操作失败:', error);
  // 提供用户友好的错误信息
}
```

### 2. 性能优化
```javascript
// 合理设置并发数量
const CONCURRENT_LIMIT = navigator.hardwareConcurrency || 4;
const results = await asyncPool(CONCURRENT_LIMIT, tasks, processor);

// 使用防抖减少不必要的调用
const debouncedSearch = debouncePromise(searchApi, 300);
```

### 3. 资源管理
```javascript
// 确保及时释放资源
const semaphore = createSemaphore(5);
try {
  await semaphore.acquire();
  // 执行需要保护的操作
} finally {
  semaphore.release();
}
```

### 4. 监控和日志
```javascript
// 添加性能监控
const startTime = Date.now();
const result = await expensiveOperation();
const duration = Date.now() - startTime;
console.log(`操作耗时: ${duration}ms`);
```

## 🔧 常见问题解答

### Q: 如何选择合适的并发数量？
**A**: 一般建议：
- CPU密集型任务：设置为 CPU 核心数
- I/O密集型任务：设置为 CPU 核心数的 2-3 倍
- 网络请求：根据服务器性能和带宽调整

### Q: 网络请求失败时如何处理？
**A**: 推荐组合使用：
```javascript
const robustFetch = (url) => promiseTimeout(
  promiseRetry(() => fetch(url), 3, 1000),
  5000
);
```

### Q: 如何处理大型树结构的性能问题？
**A**: 
- 使用虚拟滚动技术
- 实现懒加载机制
- 分批处理节点
- 考虑使用 Web Worker

### Q: 如何避免内存泄漏？
**A**:
- 及时清理事件监听器
- 取消不再需要的 Promise
- 释放信号量和资源锁
- 定期清理队列和缓存

### Q: 如何调试异步操作？
**A**:
- 使用 async/await 语法
- 添加详细的日志记录
- 使用浏览器开发者工具
- 实现错误边界和回退机制

## 📊 性能对比

| 操作类型 | 传统方式 | 使用工具库 | 性能提升 |
|----------|----------|------------|----------|
| 树形查找 | 递归遍历 | `findNode()` | 2-3x |
| 批量处理 | Promise.all | `promiseAllInBatches()` | 内存优化 |
| 重试机制 | 手动实现 | `promiseRetry()` | 代码简化 |
| 并发控制 | 复杂逻辑 | `asyncPool()` | 可维护性 |

## 🚀 进阶用法

### 组合使用多个函数
```javascript
// 复杂的数据处理流程
const processDataPipeline = async (rawData) => {
  // 1. 构建树结构
  const treeData = buildTreeFromFlat(rawData);
  
  // 2. 过滤有效数据
  const filteredData = filterTree(treeData, isValidNode);
  
  // 3. 批量处理（并发控制）
  const results = await asyncPool(5, flattenTree(filteredData), processNode);
  
  return results;
};
```

### 自定义工具函数
```javascript
// 基于现有函数创建自定义工具
const createSafeApi = (baseUrl) => {
  const baseFetch = (endpoint) => fetch(`${baseUrl}${endpoint}`);
  
  return {
    get: (endpoint) => promiseTimeout(
      promiseRetry(() => baseFetch(endpoint), 3, 1000),
      5000
    ),
    post: (endpoint, data) => promiseTimeout(
      promiseRetry(() => baseFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(data)
      }), 3, 1000),
      5000
    )
  };
};
```

## 📝 更新日志

### v1.0.0 (2024-01-XX)
- ✅ 初始版本发布
- ✅ 27个核心函数实现
- ✅ 完整的文档和示例
- ✅ TypeScript 类型支持

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发环境设置
```bash
# 克隆项目
git clone <repository-url>

# 安装依赖
npm install

# 运行测试
npm test

# 构建项目
npm run build
```

## 📄 许可证

MIT License

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！

---

**快速导航**：
- [树形数据结构工具](treeUtils.md)
- [Promise 工具方法](promiseUtils.md)  
- [并发控制工具](concurrencyUtils.md)

**有问题？** 查看 [常见问题解答](#常见问题解答) 或提交 [Issue](项目地址/issues)