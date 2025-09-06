# ProTable 组件

一个仿 Ant Design Pro Table 的高性能表格组件，基于 React、Ant Design 和 ahooks 实现。

## 功能特性

### ✅ 已实现的核心功能

- **request**: 异步数据请求
- **params**: 外部传入参数
- **postData**: 数据后处理
- **actionRef**: 手动触发方法
- **formRef**: 表单引用
- **tableClassName**: 自定义表格样式
- **search**: 搜索表单功能
- **defaultSize**: 默认表格尺寸
- **defaultValue**: 默认搜索值
- **onChange**: 表格变化回调

### 🔍 搜索表单 (Search)
- 自动根据列配置生成搜索表单
- 支持多种表单控件类型
- 支持 valueEnum 自动生成选择器

### 🎯 ActionRef 手动触发
- `reload()`: 重新加载数据
- `reloadAndRest()`: 重置并重新加载
- `reset()`: 重置搜索表单
- `clearSelected()`: 清除选中项

### 📊 列定义 (Columns)
- **valueEnum**: 枚举值映射
- **valueType**: 值类型处理
- **renderText**: 自定义文本渲染
- **search**: 控制是否在搜索中显示
- **hideInTable**: 在表格中隐藏
- **hideInSearch**: 在搜索中隐藏

## 使用示例

```tsx
import ProTable, { ProTableActionRef, ProTableColumn } from './components/ProTable';
import { useRef } from 'react';

interface UserRecord {
  id: number;
  name: string;
  status: 'active' | 'inactive';
  department: string;
}

function MyTable() {
  const actionRef = useRef<ProTableActionRef>(null);
  const formRef = useRef<FormInstance>(null);

  // 异步请求函数
  const request = async (params: Record<string, any>) => {
    const response = await fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(params)
    });
    const result = await response.json();
    
    return {
      data: result.data,
      success: true,
      total: result.total
    };
  };

  // 列定义
  const columns: ProTableColumn<UserRecord>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      search: false,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      search: true,
      renderText: (text) => <a>{text}</a>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueEnum: {
        active: { text: '激活', color: '#52c41a' },
        inactive: { text: '禁用', color: '#ff4d4f' },
      },
      search: true,
    },
    {
      title: '部门',
      dataIndex: 'department',
      valueEnum: {
        tech: { text: '技术部' },
        product: { text: '产品部' },
        design: { text: '设计部' },
      },
      search: true,
    },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record) => [
        <Button key="edit" onClick={() => edit(record)}>编辑</Button>,
        <Button key="delete" danger onClick={() => delete(record)}>删除</Button>,
      ],
    },
  ];

  return (
    <ProTable
      columns={columns}
      request={request}
      actionRef={actionRef}
      formRef={formRef}
      search={{
        submitText: '搜索',
        resetText: '重置',
      }}
      defaultValue={{
        status: 'active',
      }}
      onChange={(pagination, filters, sorter) => {
        console.log('Table changed:', { pagination, filters, sorter });
      }}
    />
  );
}
```

## API 参考

### ProTableProps

| 参数 | 说明 | 类型 | 默认值 |
|-----|-----|-----|--------|
| columns | 列配置 | `ProTableColumn[]` | - |
| request | 请求数据的函数 | `(params, sort, filter) => Promise<{data, success, total}>` | - |
| params | 额外的请求参数 | `Record<string, any>` | `{}` |
| postData | 对请求到的数据进行处理 | `(data: T[]) => T[]` | - |
| actionRef | 表格动作引用 | `MutableRefObject<ProTableActionRef>` | - |
| formRef | 搜索表单引用 | `MutableRefObject<FormInstance>` | - |
| search | 搜索表单配置 | `ProTableSearchConfig \| false` | `{}` |
| defaultValue | 搜索表单默认值 | `Record<string, any>` | `{}` |
| beforeSearchSubmit | 搜索前的参数处理 | `(params) => params` | - |

### ProTableColumn

| 参数 | 说明 | 类型 | 默认值 |
|-----|-----|-----|--------|
| dataIndex | 数据索引 | `string \| string[]` | - |
| valueType | 值类型 | `'text' \| 'select' \| 'date' \| 'number' \| 'option'` | `'text'` |
| valueEnum | 值的枚举 | `Record<string, {text, color}>` | - |
| renderText | 自定义渲染文本 | `(text, record, index) => ReactNode` | - |
| search | 是否可搜索 | `boolean` | `true` |
| hideInTable | 在表格中隐藏 | `boolean` | `false` |
| hideInSearch | 在搜索中隐藏 | `boolean` | `false` |

### ActionRef 方法

| 方法 | 说明 | 参数 |
|-----|-----|-----|
| reload | 重新加载数据 | `(resetPageIndex?: boolean)` |
| reloadAndRest | 重置搜索条件并重新加载 | - |
| reset | 重置搜索表单 | - |
| clearSelected | 清除选中项 | - |

## 性能优化

### 避免重复渲染
- 使用 `useMemoizedFn` 缓存事件处理函数
- 使用 `useMemo` 缓存计算结果
- 使用 `useReactive` 进行状态管理

### 代码解耦
- 分离搜索表单和表格逻辑
- 模块化列配置处理
- 独立的事件处理方法

## 示例效果

运行项目可以看到以下功能：

1. **搜索表单**: 根据列配置自动生成，支持文本输入、下拉选择等
2. **数据表格**: 支持分页、排序、筛选
3. **操作按钮**: 演示 ActionRef 的各种方法
4. **列功能**: 展示 valueEnum、renderText 等特性
5. **响应式**: 表单和表格的交互响应

## 注意事项

1. 确保 `request` 函数返回正确的数据格式
2. `valueEnum` 会自动在搜索表单中生成 Select 组件
3. 使用 `renderText` 或 `render` 来自定义列的显示
4. ActionRef 需要通过 `useRef` 创建引用
