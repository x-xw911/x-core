# Ant Design Tree 多选框异步加载演示

## 功能概述

这是一个基于 Ant Design Tree 组件的异步多选框树组件，实现了以下功能：

- ✅ 点击父节点多选框时显示加载状态
- ✅ 异步加载子节点数据
- ✅ 数据返回后自动勾选父节点及所有子节点
- ✅ 支持取消勾选（取消父节点时取消所有子节点）
- ✅ 完整的错误处理和用户反馈
- ✅ 基于现有 treeUtils.js 工具库扩展

## 项目结构

```
async-tree-demo/
├── package.json          # 项目配置文件
├── index.html           # HTML 入口文件
├── index.js             # JavaScript 入口文件
├── App.jsx              # 主应用组件
├── AsyncCheckboxTree.jsx # 异步多选框树组件
├── mockApi.js           # 模拟后端 API 服务
├── treeUtils.js         # 树形数据结构工具函数库
└── README.md            # 项目说明文档
```

## 安装和运行

1. 进入项目目录：
```bash
cd async-tree-demo
```

2. 安装依赖：
```bash
npm install
```

3. 启动开发服务器：
```bash
npm start
```

4. 在浏览器中访问 `http://localhost:3000` 查看演示效果。

## 核心组件说明

### AsyncCheckboxTree 组件

这是核心的异步多选框树组件，主要特性：

- **异步加载**：点击父节点多选框时，显示加载状态并请求后端接口
- **自动勾选**：数据返回后自动勾选父节点及其所有子节点
- **级联取消**：取消父节点勾选时，自动取消所有子节点的勾选状态
- **错误处理**：完整的错误处理机制和用户反馈
- **性能优化**：使用 Set 管理加载状态，避免重复加载

### Props

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| treeData | Array | [] | 树形数据 |
| onLoadChildren | Function | - | 加载子节点的回调函数 |
| height | Number | 400 | 树的高度 |
| showLine | Boolean | true | 是否显示连接线 |

## 工具函数说明

### treeUtils.js

扩展了原有的树形数据结构工具函数库，新增了以下函数：

- `getAllChildKeys()` - 获取指定节点的所有子节点 key
- `findNodeByKey()` - 根据 key 查找节点
- `isLeafNode()` - 检查节点是否为叶子节点
- `addChildrenToNode()` - 为节点添加子节点

## 模拟 API

### mockApi.js

提供了模拟的后端 API 服务：

- `fetchChildNodes(parentKey)` - 获取指定父节点的子节点
- `fetchTreeData()` - 获取初始树数据

模拟了网络延迟（1-2秒）和 10% 的失败率，用于测试各种场景。

## 使用方法

### 基本使用

```jsx
import AsyncCheckboxTree from './AsyncCheckboxTree';
import { fetchChildNodes } from './mockApi';

const handleLoadChildren = async (parentKey) => {
    return await fetchChildNodes(parentKey);
};

<AsyncCheckboxTree
    treeData={treeData}
    onLoadChildren={handleLoadChildren}
    height={500}
    showLine
/>
```

### 自定义后端接口

替换 `mockApi.js` 中的函数，连接到真实的后端 API：

```javascript
export const fetchChildNodes = async (parentKey) => {
    const response = await axios.get(`/api/nodes/${parentKey}/children`);
    return response.data;
};
```

## 技术栈

- React 18+
- Ant Design 5.x
- Axios for HTTP requests
- 现有 treeUtils.js 工具库

## 注意事项

1. 确保每个节点都有唯一的 `key` 属性
2. `onLoadChildren` 函数需要返回 Promise，resolve 的数据格式为 `{ children: Array }`
3. 组件会自动管理加载状态和错误处理
4. 建议在生产环境中替换为真实的后端 API

## 开发说明

这是一个独立的演示项目，不会影响原有的代码库结构。你可以直接复制 `AsyncCheckboxTree.jsx` 和相关的工具函数到你的实际项目中使用。