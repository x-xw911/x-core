import React, { useState, useCallback } from 'react';
import { Tree, Spin, message } from 'antd';
import { getAllChildKeys, findNodeByKey, addChildrenToNode } from './treeUtils';

const { DirectoryTree } = Tree;

/**
 * 异步多选框树组件
 * 支持点击父节点时异步加载子节点并自动勾选
 */
const AsyncCheckboxTree = ({
    treeData = [],
    onLoadChildren,
    height = 400,
    showLine = true,
    ...props
}) => {
    const [data, setData] = useState(treeData);
    const [checkedKeys, setCheckedKeys] = useState([]);
    const [loadingKeys, setLoadingKeys] = useState(new Set());
    const [expandedKeys, setExpandedKeys] = useState([]);

    // 模拟后端API调用
    const fetchChildNodes = useCallback(async (parentKey) => {
        try {
            // 调用外部传入的加载函数
            const result = await onLoadChildren(parentKey);
            
            // 更新树数据
            setData(prevData => addChildrenToNode(prevData, parentKey, result.children));
            
            // 展开父节点
            setExpandedKeys(prev => [...new Set([...prev, parentKey])]);
            
            return result;
        } catch (error) {
            message.error(`加载子节点失败: ${error.message}`);
            throw error;
        }
    }, [onLoadChildren]);

    // 处理多选框点击事件
    const handleCheck = useCallback(async (keys, info) => {
        const { node, checked } = info;
        
        if (checked && !node.children?.length) {
            // 勾选没有子节点的父节点，需要异步加载
            try {
                // 添加到加载状态
                setLoadingKeys(prev => new Set([...prev, node.key]));
                
                // 加载子节点数据
                const result = await fetchChildNodes(node.key);
                
                // 获取所有子节点的key
                const allChildKeys = getAllChildKeys(data, node.key);
                
                // 自动勾选父节点和所有子节点
                const newCheckedKeys = [...new Set([...keys, node.key, ...allChildKeys])];
                setCheckedKeys(newCheckedKeys);
                
            } catch (error) {
                // 加载失败，恢复勾选状态
                setCheckedKeys(keys.filter(key => key !== node.key));
            } finally {
                // 移除加载状态
                setLoadingKeys(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(node.key);
                    return newSet;
                });
            }
        } else {
            // 普通的勾选/取消勾选操作
            setCheckedKeys(keys);
            
            if (!checked && node.children?.length) {
                // 取消勾选父节点时，取消所有子节点的勾选
                const allChildKeys = getAllChildKeys(data, node.key);
                const filteredKeys = keys.filter(key => !allChildKeys.includes(key));
                setCheckedKeys(filteredKeys);
            }
        }
    }, [data, fetchChildNodes]);

    // 自定义树节点渲染
    const titleRender = useCallback((node) => {
        const isLoading = loadingKeys.has(node.key);
        
        return (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {isLoading && <Spin size="small" />}
                {node.title}
            </span>
        );
    }, [loadingKeys]);

    return (
        <div style={{ position: 'relative' }}>
            <Tree
                checkable
                checkedKeys={checkedKeys}
                onCheck={handleCheck}
                expandedKeys={expandedKeys}
                onExpand={setExpandedKeys}
                treeData={data}
                titleRender={titleRender}
                height={height}
                showLine={showLine}
                {...props}
            />
        </div>
    );
};

export default AsyncCheckboxTree;