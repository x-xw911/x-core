import React, { useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, message, Popconfirm, Card } from 'antd';
import { useReactive, useMemoizedFn } from 'ahooks';

const mockApi = {
  getList: (params) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let data = Array.from({ length: 50 }, (_, i) => ({
          id: i + 1,
          name: `用户${i + 1}`,
          age: 20 + Math.floor(Math.random() * 30),
          email: `user${i + 1}@example.com`,
          phone: `138${String(i + 1).padStart(8, '0')}`,
        }));

        const { name, phone } = params;
        if (name) data = data.filter(item => item.name.includes(name));
        if (phone) data = data.filter(item => item.phone.includes(phone));

        const { current = 1, pageSize = 10 } = params;
        const start = (current - 1) * pageSize;
        const end = start + pageSize;

        resolve({
          list: data.slice(start, end),
          total: data.length,
        });
      }, 500);
    });
  },

  save: (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, data: data.id ? data : { ...data, id: Date.now() } });
      }, 300);
    });
  },

  delete: (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 300);
    });
  },
};

const SearchForm = ({ onSearch, onReset }) => {
  const [form] = Form.useForm();

  const handleSearch = useMemoizedFn(async () => {
    const values = await form.validateFields();
    onSearch(values);
  });

  const handleReset = useMemoizedFn(() => {
    form.resetFields();
    onReset();
  });

  return (
    <Card style={{ marginBottom: 16 }}>
      <Form form={form} layout="inline">
        <Form.Item label="姓名" name="name">
          <Input placeholder="请输入姓名" allowClear style={{ width: 200 }} />
        </Form.Item>
        <Form.Item label="手机号" name="phone">
          <Input placeholder="请输入手机号" allowClear style={{ width: 200 }} />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" onClick={handleSearch}>搜索</Button>
            <Button onClick={handleReset}>重置</Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

const FormModal = ({ visible, record, onOk, onCancel }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      record ? form.setFieldsValue(record) : form.resetFields();
    } else {
      form.resetFields(); // 关闭时清除表单数据
    }
  }, [visible, record, form]);

  const handleOk = useMemoizedFn(async () => {
    try {
      const values = await form.validateFields();
      onOk(values);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  });

  return (
    <Modal
      title={record ? '编辑' : '新增'}
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      width={600}
      destroyOnClose
    >
      <Form form={form} layout="vertical" autoComplete="off">
        <Form.Item label="姓名" name="name" rules={[{ required: true, message: '请输入姓名' }]}>
          <Input placeholder="请输入姓名" />
        </Form.Item>
        <Form.Item
          label="年龄"
          name="age"
          rules={[
            { required: true, message: '请输入年龄' },
            { pattern: /^\d+$/, message: '请输入数字' },
          ]}
        >
          <Input placeholder="请输入年龄" />
        </Form.Item>
        <Form.Item
          label="邮箱"
          name="email"
          rules={[
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '请输入正确的邮箱格式' },
          ]}
        >
          <Input placeholder="请输入邮箱" />
        </Form.Item>
        <Form.Item
          label="手机号"
          name="phone"
          rules={[
            { required: true, message: '请输入手机号' },
            { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
          ]}
        >
          <Input placeholder="请输入手机号" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const TableCRUD = () => {
  const state = useReactive({
    dataSource: [],
    loading: false,
    modalVisible: false,
    currentRecord: null, // null为新增，有值为编辑
    searchParams: {},
    pagination: { current: 1, pageSize: 10, total: 0 },
  });

  // 获取列表数据
  const fetchList = useMemoizedFn(async () => {
    state.loading = true;
    try {
      const { current, pageSize } = state.pagination;
      const res = await mockApi.getList({ current, pageSize, ...state.searchParams });
      state.dataSource = res.list;
      state.pagination.total = res.total;
    } catch (error) {
      message.error('获取数据失败');
    } finally {
      state.loading = false;
    }
  });

  // 搜索处理
  const handleSearch = useMemoizedFn((values) => {
    state.searchParams = values;
    state.pagination.current = 1;
    fetchList();
  });

  // 重置搜索
  const handleReset = useMemoizedFn(() => {
    state.searchParams = {};
    state.pagination.current = 1;
    fetchList();
  });

  // 打开弹窗
  const handleOpenModal = useMemoizedFn((record = null) => {
    state.currentRecord = record;
    state.modalVisible = true;
  });

  // 删除记录
  const handleDelete = useMemoizedFn(async (id) => {
    try {
      await mockApi.delete(id);
      message.success('删除成功');
      fetchList();
    } catch (error) {
      message.error('删除失败');
    }
  });

  // 保存（新增/编辑）
  const handleModalOk = useMemoizedFn(async (values) => {
    try {
      const isEdit = !!state.currentRecord;
      const params = isEdit ? { ...state.currentRecord, ...values } : values;
      await mockApi.save(params);
      message.success(isEdit ? '编辑成功' : '新增成功');
      state.modalVisible = false;
      fetchList();
    } catch (error) {
      message.error('操作失败');
    }
  });

  // 取消弹窗
  const handleModalCancel = useMemoizedFn(() => {
    state.modalVisible = false;
  });

  // 表格分页变化
  const handleTableChange = useMemoizedFn((pagination) => {
    state.pagination.current = pagination.current;
    state.pagination.pageSize = pagination.pageSize;
    fetchList();
  });

  // 表格列配置
  const columns = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: '姓名', dataIndex: 'name', width: 120 },
    { title: '年龄', dataIndex: 'age', width: 80 },
    { title: '邮箱', dataIndex: 'email', width: 200 },
    { title: '手机号', dataIndex: 'phone', width: 150 },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <a onClick={() => handleOpenModal(record)}>编辑</a>
          <Popconfirm title="确定要删除吗？" onConfirm={() => handleDelete(record.id)} okText="确定" cancelText="取消">
            <a danger>删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <SearchForm onSearch={handleSearch} onReset={handleReset} />

      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => handleOpenModal()}>新增</Button>
      </div>

      <Table
        columns={columns}
        dataSource={state.dataSource}
        loading={state.loading}
        rowKey="id"
        pagination={{
          current: state.pagination.current,
          pageSize: state.pagination.pageSize,
          total: state.pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        onChange={handleTableChange}
        scroll={{ x: 1000 }}
      />

      <FormModal
        visible={state.modalVisible}
        record={state.currentRecord}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      />
    </div>
  );
};

export default TableCRUD;
