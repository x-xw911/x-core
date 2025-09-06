import { useRef } from "react";
import { Button, Space, message, Tag } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
// import ProTable from './components/ProTable';
// import type { ProTableActionRef, ProTableColumn } from './components/ProTable';
import type { FormInstance } from "antd";
import "antd/dist/reset.css";

import ProTable from "./components/antd-components/src/table";
import type {
  ActionType,
  ProColumns,
} from "./components/antd-components/src/table/typing";

// 模拟数据类型
interface UserRecord {
  id: number;
  name: string;
  age: number;
  email: string;
  department: string;
  status: "active" | "inactive" | "pending";
  createTime: string;
  role: "admin" | "user" | "manager";
}

// 模拟数据
const mockData: UserRecord[] = [
  {
    id: 1,
    name: "张三",
    age: 25,
    email: "zhangsan@example.com",
    department: "技术部",
    status: "active",
    createTime: "2024-01-01",
    role: "admin",
  },
  {
    id: 2,
    name: "李四",
    age: 30,
    email: "lisi@example.com",
    department: "产品部",
    status: "inactive",
    createTime: "2024-01-02",
    role: "user",
  },
  {
    id: 3,
    name: "王五",
    age: 28,
    email: "wangwu@example.com",
    department: "设计部",
    status: "pending",
    createTime: "2024-01-03",
    role: "manager",
  },
  {
    id: 4,
    name: "赵六",
    age: 32,
    email: "zhaoliu@example.com",
    department: "技术部",
    status: "active",
    createTime: "2024-01-04",
    role: "user",
  },
  {
    id: 5,
    name: "孙七",
    age: 26,
    email: "sunqi@example.com",
    department: "市场部",
    status: "active",
    createTime: "2024-01-05",
    role: "manager",
  },
];

function App() {
  const actionRef = useRef<ActionType>(null);
  const formRef = useRef<FormInstance>(null);

  // 模拟请求函数
  const request = async (
    params: Record<string, any>
  ): Promise<{ data: UserRecord[]; success: boolean; total: number }> => {
    console.log("Request params:", params);

    // 模拟网络延迟
    await new Promise((resolve) => setTimeout(resolve, 1000));

    let filteredData = [...mockData];

    // 模拟搜索过滤
    if (params.name) {
      filteredData = filteredData.filter((item) =>
        item.name.includes(params.name)
      );
    }

    if (params.department) {
      filteredData = filteredData.filter(
        (item) => item.department === params.department
      );
    }

    if (params.status) {
      filteredData = filteredData.filter(
        (item) => item.status === params.status
      );
    }

    if (params.role) {
      filteredData = filteredData.filter((item) => item.role === params.role);
    }

    // 模拟分页
    const { current = 1, pageSize = 20 } = params;
    const start = (current - 1) * pageSize;
    const end = start + pageSize;
    const pageData = filteredData.slice(start, end);

    return {
      data: pageData,
      success: true,
      total: filteredData.length,
    };
  };

  // 列定义，展示所有功能
  const columns: ProColumns<UserRecord>[] = [
    {
      title: "ID",
      dataIndex: "id",
      width: 80,
      search: false, // 不在搜索中显示
      sorter: true,
    },
    {
      title: "姓名",
      dataIndex: "name",
      width: 120,
      search: true, // 支持搜索
      renderText: (text) => (
        <a onClick={() => message.info(`查看用户: ${text}`)}>{text}</a>
      ),
    },
    {
      title: "年龄",
      dataIndex: "age",
      width: 80,
      valueType: "number", // 数字类型
      search: false,
      sorter: true,
    },
    {
      title: "邮箱",
      dataIndex: "email",
      width: 200,
      search: true,
    },
    {
      title: "部门",
      dataIndex: "department",
      width: 120,
      valueEnum: {
        技术部: { text: "技术部", color: "#1890ff" },
        产品部: { text: "产品部", color: "#52c41a" },
        设计部: { text: "设计部", color: "#fa8c16" },
        市场部: { text: "市场部", color: "#eb2f96" },
      },
      search: true, // 在搜索中会自动生成 Select
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 100,
      valueEnum: {
        active: { text: "激活", color: "#52c41a" },
        inactive: { text: "禁用", color: "#ff4d4f" },
        pending: { text: "待审核", color: "#faad14" },
      },
      search: true,
      render: (_, record: UserRecord) => {
        const statusConfig = {
          active: { color: "green", text: "激活" },
          inactive: { color: "red", text: "禁用" },
          pending: { color: "orange", text: "待审核" },
        };
        const config = statusConfig[record.status];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "角色",
      dataIndex: "role",
      width: 100,
      valueEnum: {
        admin: { text: "管理员", color: "#f50" },
        manager: { text: "经理", color: "#2db7f5" },
        user: { text: "普通用户", color: "#87d068" },
      },
      search: true,
    },
    {
      title: "创建时间",
      dataIndex: "createTime",
      width: 120,
      valueType: "date",
      search: false,
      sorter: true,
    },
    {
      title: "操作",
      valueType: "option",
      width: 180,
      render: (_, record: UserRecord) => [
        <Button
          key="edit"
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={() => message.info(`编辑用户: ${record.name}`)}
        >
          编辑
        </Button>,
        <Button
          key="delete"
          type="link"
          size="small"
          danger
          icon={<DeleteOutlined />}
          onClick={() => message.warning(`删除用户: ${record.name}`)}
        >
          删除
        </Button>,
      ],
    },
  ];

  // 处理表格变化
  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    console.log("Table changed:", { pagination, filters, sorter });
  };

  // 搜索前处理参数
  const beforeSearchSubmit = (params: any) => {
    console.log("Before search submit:", params);
    return params;
  };

  // 数据后处理
  const postData = (data: UserRecord[]) => {
    console.log("Post data processing:", data);
    return data;
  };

  return (
    <div style={{ padding: "24px" }}>
      <h1>ProTable 组件演示</h1>

      {/* 操作按钮演示 ActionRef */}
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => message.success("新增用户")}
          >
            新增用户
          </Button>
          <Button
            onClick={() => {
              actionRef.current?.reload();
              message.info("刷新表格");
            }}
          >
            刷新表格
          </Button>
          <Button
            onClick={() => {
              actionRef.current?.reloadAndRest();
              message.info("重置并刷新");
            }}
          >
            重置并刷新
          </Button>
          <Button
            onClick={() => {
              actionRef.current?.reset();
              message.info("重置搜索表单");
            }}
          >
            重置表单
          </Button>
          <Button
            onClick={() => {
              console.log("当前表单值:", formRef.current?.getFieldsValue());
              message.info("查看控制台输出");
            }}
          >
            获取表单值
          </Button>
        </Space>
      </div>

      {/* ProTable 组件 */}
      <ProTable
        columns={columns}
        request={request}
        actionRef={actionRef}
        formRef={formRef}
        tableClassName="custom-pro-table"
        search={{
          submitText: "搜索",
          resetText: "重置",
        }}
        defaultSize="middle"
        defaultValue={{
          status: "active", // 默认搜索激活状态的用户
        }}
        onChange={handleTableChange}
        beforeSearchSubmit={beforeSearchSubmit}
        postData={postData}
        onSubmit={(params) => {
          console.log("Search submitted:", params);
          message.success("搜索已提交");
        }}
        onReset={() => {
          console.log("Search reset");
          message.info("搜索已重置");
        }}
        params={{
          // 外部传入的额外参数
          timestamp: Date.now(),
        }}
        rowSelection={{
          onChange: (selectedRowKeys, selectedRows) => {
            console.log("Selected:", selectedRowKeys, selectedRows);
          },
        }}
        scroll={{ x: 1200 }}
        bordered
      />
    </div>
  );
}

export default App;
