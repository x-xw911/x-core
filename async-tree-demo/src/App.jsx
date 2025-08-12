import React, { useState, useEffect } from 'react';
import { Card, Alert, Space, Typography } from 'antd';
import AsyncCheckboxTree from './AsyncCheckboxTree';
import { fetchTreeData, fetchChildNodes } from './mockApi';

const { Title, Paragraph } = Typography;

const App = () => {
    const [treeData, setTreeData] = useState([]);
    const [loading, setLoading] = useState(false);

    // 初始化树数据
    useEffect(() => {
        const initTreeData = async () => {
            setLoading(true);
            try {
                const data = await fetchTreeData();
                setTreeData(data);
            } catch (error) {
                console.error('初始化树数据失败:', error);
            } finally {
                setLoading(false);
            }
        };
        
        initTreeData();
    }, []);

    // 处理子节点加载
    const handleLoadChildren = async (parentKey) => {
        return await fetchChildNodes(parentKey);
    };

    return (
        <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                    <Title level={2}>Ant Design Tree 多选框异步加载演示</Title>
                    <Paragraph>
                        点击父级多选框时，组件会显示加载状态，异步请求后端接口获取子节点数据，
                        然后自动勾选整个父级菜单及其所有子节点。
                    </Paragraph>
                </div>

                <Alert
                    message="使用说明"
                    description="点击任意父级节点的多选框，系统将异步加载其子节点并自动勾选。取消勾选父节点将同时取消所有子节点的勾选状态。"
                    type="info"
                    showIcon
                />

                <Card title="异步多选框树组件" loading={loading}>
                    <AsyncCheckboxTree
                        treeData={treeData}
                        onLoadChildren={handleLoadChildren}
                        height={500}
                        showLine
                    />
                </Card>

                <Card title="功能特点">
                    <ul>
                        <li>✅ 点击父节点多选框时显示加载状态</li>
                        <li>✅ 异步加载子节点数据</li>
                        <li>✅ 数据返回后自动勾选父节点及所有子节点</li>
                        <li>✅ 支持取消勾选（取消父节点时取消所有子节点）</li>
                        <li>✅ 完整的错误处理和用户反馈</li>
                        <li>✅ 基于现有treeUtils.js工具库扩展</li>
                    </ul>
                </Card>
            </Space>
        </div>
    );
};

export default App;