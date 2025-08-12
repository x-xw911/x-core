// 模拟后端API服务

// 模拟数据库
const mockDatabase = {
    children: {
        'parent-1': [
            { key: 'child-1-1', title: '子节点 1-1', children: [] },
            { key: 'child-1-2', title: '子节点 1-2', children: [] },
            { key: 'child-1-3', title: '子节点 1-3', children: [] }
        ],
        'parent-2': [
            { key: 'child-2-1', title: '子节点 2-1', children: [] },
            { key: 'child-2-2', title: '子节点 2-2', children: [] }
        ],
        'parent-3': [
            { key: 'child-3-1', title: '子节点 3-1', children: [] },
            { key: 'child-3-2', title: '子节点 3-2', children: [] },
            { key: 'child-3-3', title: '子节点 3-3', children: [] },
            { key: 'child-3-4', title: '子节点 3-4', children: [] }
        ]
    }
};

/**
 * 模拟延迟函数
 * @param {number} ms - 延迟毫秒数
 * @returns {Promise}
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 模拟获取子节点API
 * @param {string} parentKey - 父节点key
 * @returns {Promise<{children: Array<Object>}>}
 */
export const fetchChildNodes = async (parentKey) => {
    // 模拟网络延迟
    await delay(1000 + Math.random() * 1000);
    
    // 模拟10%的失败率
    if (Math.random() < 0.1) {
        throw new Error('网络请求失败，请重试');
    }
    
    const children = mockDatabase.children[parentKey] || [];
    
    return {
        children,
        total: children.length,
        parentKey
    };
};

/**
 * 模拟获取树结构API
 * @returns {Promise<Array<Object>>}
 */
export const fetchTreeData = async () => {
    await delay(500);
    
    return [
        {
            key: 'parent-1',
            title: '父级菜单 1',
            children: []
        },
        {
            key: 'parent-2',
            title: '父级菜单 2',
            children: []
        },
        {
            key: 'parent-3',
            title: '父级菜单 3',
            children: []
        }
    ];
};