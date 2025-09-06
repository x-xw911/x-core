import React, { useImperativeHandle, useRef, useMemo, forwardRef } from 'react';
import { Table, Form, Button, Space, Input, Select, InputNumber, DatePicker } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useReactive, useMemoizedFn } from 'ahooks';
import type { TableProps, FormInstance } from 'antd';
import type { ColumnsType } from 'antd/es/table';

// 类型定义
export interface ProTableColumn<T = Record<string, any>> extends Omit<ColumnsType<T>[0], 'render'> {
  dataIndex?: string | string[];
  valueType?: 'text' | 'select' | 'date' | 'dateRange' | 'number' | 'option';
  valueEnum?: Record<string, { text: string; status?: string; color?: string }>;
  renderText?: (text: any, record: T, index: number) => React.ReactNode;
  render?: (text: any, record: T, index: number) => React.ReactNode;
  search?: boolean | {
    transform?: (value: any) => any;
  };
  hideInTable?: boolean;
  hideInSearch?: boolean;
}

export interface ProTableSearchConfig {
  labelWidth?: number | 'auto';
  span?: number;
  collapsed?: boolean;
  collapseRender?: (collapsed: boolean) => React.ReactNode;
  submitText?: string;
  resetText?: string;
  optionRender?: (searchConfig: any, formProps: any, dom: React.ReactNode[]) => React.ReactNode[];
}

export interface ProTableActionRef {
  reload: (resetPageIndex?: boolean) => void;
  reloadAndRest: () => void;
  reset: () => void;
  clearSelected: () => void;
}

export interface ProTableProps<T = Record<string, any>> extends Omit<TableProps<T>, 'columns' | 'dataSource'> {
  columns: ProTableColumn<T>[];
  request?: (params: Record<string, any>, sort: Record<string, any>, filter: Record<string, any>) => Promise<{
    data: T[];
    success: boolean;
    total?: number;
  }>;
  params?: Record<string, any>;
  postData?: (data: T[]) => T[];
  actionRef?: React.MutableRefObject<ProTableActionRef | undefined>;
  formRef?: React.MutableRefObject<FormInstance | undefined>;
  tableClassName?: string;
  search?: ProTableSearchConfig | false;
  defaultSize?: 'small' | 'middle' | 'large';
  defaultValue?: Record<string, any>;
  onChange?: (pagination: any, filters: any, sorter: any, extra: any) => void;
  beforeSearchSubmit?: (params: Record<string, any>) => Record<string, any>;
  onSubmit?: (params: Record<string, any>) => void;
  onReset?: () => void;
}

const ProTable = forwardRef<ProTableActionRef, ProTableProps>((props, ref) => {
  const {
    columns,
    request,
    params = {},
    postData,
    actionRef,
    formRef,
    tableClassName,
    search = {},
    defaultSize = 'middle',
    defaultValue = {},
    onChange,
    beforeSearchSubmit,
    onSubmit,
    onReset,
    ...restTableProps
  } = props;

  // 内部状态管理
  const state = useReactive({
    dataSource: [] as any[],
    loading: false,
    pagination: {
      current: 1,
      pageSize: 20,
      total: 0,
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: (total: number, range: [number, number]) => 
        `第 ${range[0]}-${range[1]} 条/总共 ${total} 条`,
    },
    formValues: { ...defaultValue },
    collapsed: true,
  });

  // 表单引用
  const [form] = Form.useForm();
  const searchFormRef = useRef<FormInstance>(form);

  // 如果外部传入了 formRef，则使用外部的
  if (formRef) {
    formRef.current = searchFormRef.current;
  }

  // 获取数据的核心方法
  const fetchData = useMemoizedFn(async (searchParams: Record<string, any> = {}, paginationParams: Record<string, any> = {}) => {
    if (!request) return;

    state.loading = true;
    try {
      const requestParams = {
        ...state.formValues,
        ...params,
        ...searchParams,
        current: paginationParams.current || state.pagination.current,
        pageSize: paginationParams.pageSize || state.pagination.pageSize,
      };

      const response = await request(requestParams, {}, {});
      
      if (response.success) {
        let { data } = response;
        
        // 如果有 postData 处理函数，先处理数据
        if (postData) {
          data = postData(data);
        }

        state.dataSource = data;
        state.pagination = {
          ...state.pagination,
          current: paginationParams.current || state.pagination.current,
          pageSize: paginationParams.pageSize || state.pagination.pageSize,
          total: response.total || data.length,
        };
      }
    } catch (error) {
      console.error('ProTable fetchData error:', error);
    } finally {
      state.loading = false;
    }
  });

  // ActionRef 方法实现
  const actionMethods: ProTableActionRef = useMemo(() => ({
    reload: (resetPageIndex = false) => {
      const paginationParams = resetPageIndex 
        ? { current: 1, pageSize: state.pagination.pageSize }
        : { current: state.pagination.current, pageSize: state.pagination.pageSize };
      fetchData({}, paginationParams);
    },
    reloadAndRest: () => {
      state.formValues = { ...defaultValue };
      searchFormRef.current?.setFieldsValue(defaultValue);
      fetchData(defaultValue, { current: 1, pageSize: state.pagination.pageSize });
    },
    reset: () => {
      searchFormRef.current?.resetFields();
      state.formValues = { ...defaultValue };
    },
    clearSelected: () => {
      // 清除选中项的逻辑，可以根据需要扩展
    },
  }), [fetchData, defaultValue, state.pagination]);

  // 暴露 actionRef
  useImperativeHandle(ref, () => actionMethods, [actionMethods]);
  if (actionRef) {
    actionRef.current = actionMethods;
  }

  // 搜索表单提交
  const handleSearch = useMemoizedFn((values: Record<string, any>) => {
    let searchParams = { ...values };
    
    if (beforeSearchSubmit) {
      searchParams = beforeSearchSubmit(searchParams);
    }
    
    state.formValues = searchParams;
    fetchData(searchParams, { current: 1, pageSize: state.pagination.pageSize });
    
    onSubmit?.(searchParams);
  });

  // 重置搜索
  const handleReset = useMemoizedFn(() => {
    searchFormRef.current?.resetFields();
    state.formValues = { ...defaultValue };
    fetchData(defaultValue, { current: 1, pageSize: state.pagination.pageSize });
    onReset?.();
  });

  // 表格变化处理
  const handleTableChange = useMemoizedFn((pagination: any, filters: any, sorter: any, extra: any) => {
    const paginationParams = {
      current: pagination.current,
      pageSize: pagination.pageSize,
    };
    
    state.pagination = {
      ...state.pagination,
      ...paginationParams,
    };
    
    fetchData({}, paginationParams);
    onChange?.(pagination, filters, sorter, extra);
  });

  // 处理列定义，支持 valueEnum, valueType, renderText
  const processedColumns = useMemo(() => {
    return columns.filter(col => !col.hideInTable).map(column => {
      const { valueEnum, valueType, renderText, ...restColumn } = column;
      
      // 基础渲染函数
      let render = column.render;
      
      // 如果没有自定义 render，根据 valueType 和 valueEnum 生成
      if (!render) {
        render = (text: any, record: any, index: number) => {
          // 优先使用 renderText
          if (renderText) {
            return renderText(text, record, index);
          }
          
          // 处理 valueEnum
          if (valueEnum && text !== undefined && text !== null) {
            const enumItem = valueEnum[text];
            if (enumItem) {
              return (
                <span style={{ color: enumItem.color }}>
                  {enumItem.text}
                </span>
              );
            }
          }
          
          // 处理不同的 valueType
          switch (valueType) {
            case 'number':
              return typeof text === 'number' ? text.toLocaleString() : text;
            case 'date':
              // 可以根据需要添加日期格式化
              return text;
            default:
              return text;
          }
        };
      }
      
      return {
        ...restColumn,
        render,
      };
    });
  }, [columns]);

  // 生成搜索表单项
  const searchFormItems = useMemo(() => {
    if (search === false) return null;
    
    return columns
      .filter(col => col.search !== false && !col.hideInSearch)
      .map(column => {
        const { dataIndex, title, valueType, valueEnum } = column;
        const fieldName = Array.isArray(dataIndex) ? dataIndex.join('.') : dataIndex;
        
        let formItem;
        
        if (valueEnum) {
          // 如果有 valueEnum，生成 Select
          formItem = (
            <Select placeholder={`请选择${title}`} allowClear>
              {Object.entries(valueEnum).map(([key, value]) => (
                <Select.Option key={key} value={key}>
                  {value.text}
                </Select.Option>
              ))}
            </Select>
          );
        } else {
          // 根据 valueType 生成不同的表单项
          switch (valueType) {
            case 'date': {
              formItem = <DatePicker placeholder={`请选择${title}`} />;
              break;
            }
            case 'dateRange': {
              const { RangePicker } = DatePicker;
              formItem = <RangePicker placeholder={[`开始${title}`, `结束${title}`]} />;
              break;
            }
            case 'number': {
              formItem = <InputNumber placeholder={`请输入${title}`} style={{ width: '100%' }} />;
              break;
            }
            default: {
              formItem = <Input placeholder={`请输入${title}`} allowClear />;
            }
          }
        }
        
        return (
          <Form.Item
            key={fieldName as string}
            name={fieldName}
            label={typeof title === 'function' ? undefined : title}
            style={{ marginBottom: 16 }}
          >
            {formItem}
          </Form.Item>
        );
      });
  }, [columns, search]);

  // 初始化数据加载
  React.useEffect(() => {
    if (request) {
      fetchData(defaultValue);
    }
  }, [request, fetchData, defaultValue]);

  // 监听外部 params 变化
  React.useEffect(() => {
    if (request && Object.keys(params).length > 0) {
      fetchData(params);
    }
  }, [params, request, fetchData]);

  return (
    <div className="pro-table-container">
      {/* 搜索表单 */}
      {search !== false && searchFormItems && searchFormItems.length > 0 && (
        <div className="pro-table-search" style={{ marginBottom: 16 }}>
          <Form
            form={searchFormRef.current}
            layout="inline"
            onFinish={handleSearch}
            initialValues={defaultValue}
            style={{ padding: '16px 0' }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', flex: 1 }}>
              {searchFormItems}
            </div>
            <div style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                  {(search as ProTableSearchConfig)?.submitText || '查询'}
                </Button>
                <Button onClick={handleReset} icon={<ReloadOutlined />}>
                  {(search as ProTableSearchConfig)?.resetText || '重置'}
                </Button>
              </Space>
            </div>
          </Form>
        </div>
      )}
      
      {/* 数据表格 */}
      <Table
        {...restTableProps}
        className={tableClassName}
        columns={processedColumns}
        dataSource={state.dataSource}
        loading={state.loading}
        pagination={state.pagination}
        size={defaultSize}
        onChange={handleTableChange}
        rowKey={(record, index) => record.key || record.id || index}
      />
    </div>
  );
});

ProTable.displayName = 'ProTable';

export default ProTable;
