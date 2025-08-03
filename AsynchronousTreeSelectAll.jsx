import React, { useState } from 'react';
import { Tree, Button, Spin } from 'antd';

// 模拟异步请求
const fakeApi = (parentId) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([
        { title: `子节点 ${parentId}-1`, key: `${parentId}-1`, isLeaf: false },
        { title: `子节点 ${parentId}-2`, key: `${parentId}-2`, isLeaf: true },
      ]);
    }, 500);
  });
};

const AsynchronousTreeSelectAll = () => {
  const [treeData, setTreeData] = useState([
    { title: '父节点 1', key: '0-0', isLeaf: false },
    { title: '父节点 2', key: '0-1', isLeaf: false },
  ]);
  const [checkedKeys, setCheckedKeys] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 更新 treeData 中特定节点的数据
  const updateTreeData = (list, key, children) => {
    return list.map(node => {
      if (node.key === key) {
        return { ...node, children };
      }
      if (node.children) {
        return {
          ...node,
          children: updateTreeData(node.children, key, children),
        };
      }
      return node;
    });
  };

  // Tree组件需要的数据加载函数
  const onLoadData = ({ key, children }) => {
    return new Promise(async (resolve) => {
      if (children) {
        resolve();
        return;
      }
      const childNodes = await fakeApi(key);
      setTreeData(origin => updateTreeData(origin, key, childNodes));
      resolve();
    });
  };

  // 递归获取所有节点的 key
  const getAllNodeKeys = (nodes) => {
    let keys = [];
    for (const node of nodes) {
      keys.push(node.key);
      if (node.children) {
        keys = keys.concat(getAllNodeKeys(node.children));
      }
    }
    return keys;
  };

  // “全选”按钮处理函数
  const handleSelectAll = async () => {
    setIsLoading(true);

    // 使用一个循环来确保所有层级的节点都被加载
    // eslint-disable-next-line no-constant-condition
    while (true) {
        // 查找所有需要加载的节点
        const findNodesToLoad = (nodes) => nodes.flatMap(n => n.isLeaf === false && !n.children ? [n] : (n.children ? findNodesToLoad(n.children) : []));
        const nodes = findNodesToLoad(treeData);
        
        if (nodes.length === 0) {
            // 如果没有需要加载的节点，则退出循环
            break;
        }
        
        // 并行加载所有找到的节点
        await Promise.all(nodes.map(n => onLoadData({ key: n.key, children: n.children })));
    }

    // 所有节点加载完毕后，获取所有 key 并设置
    const allKeys = getAllNodeKeys(treeData);
    setCheckedKeys(allKeys);
    setIsLoading(false);
  };
  
  // 递归地根据 keys 筛选节点对象
  const getCheckedObjects = (keys, nodes) => {
      let result = [];
      for (const node of nodes) {
          // 如果节点被选中
          if (keys.includes(node.key)) {
              const newNode = {...node};
              // 如果它有子节点，递归地处理子节点
              if (node.children) {
                  newNode.children = getCheckedObjects(keys, node.children);
              }
              result.push(newNode);
          } else if (node.children) {
              // 如果父节点没被选中，但子节点可能被选中
              result.push(...getCheckedObjects(keys, node.children));
          }
      }
      return result;
  }

  const onCheck = (checkedKeysValue) => {
    // antd 的 onCheck 可能返回一个数组，或者一个 {checked: [], halfChecked: []} 的对象
    const keys = Array.isArray(checkedKeysValue) ? checkedKeysValue : checkedKeysValue.checked;
    console.log('选中的 keys:', keys);
    setCheckedKeys(keys);
    
    // 获取并打印选中的数据对象
    const checkedObjects = getCheckedObjects(keys, treeData);
    console.log('选中的数据对象:', checkedObjects);
  };

  return (
    <Spin spinning={isLoading} tip="正在加载所有节点...">
      <Button onClick={handleSelectAll} style={{ marginBottom: 16 }}>
        全选
      </Button>
      <Tree
        checkable
        onCheck={onCheck}
        checkedKeys={checkedKeys}
        loadData={onLoadData}
        treeData={treeData}
      />
    </Spin>
  );
};

export default AsynchronousTreeSelectAll;
