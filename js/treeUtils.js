/**
 * @fileoverview 树形数据结构工具函数库
 * 提供用于处理树形数据结构的各种工具方法
 */

/**
 * 根据断言函数在树结构中查找节点
 * @param {Array<Object>} tree - 要搜索的树结构。每个节点必须有一个 'children' 属性（即使为空）
 * @param {Function} predicate - 对所需节点返回 true 的函数
 * @returns {Object|null} 找到的节点，如果未找到则返回 null
 */
function findNode(tree, predicate) {
    if (!Array.isArray(tree)) return null;
    
    for (const node of tree) {
        if (predicate(node)) {
            return node;
        }
        if (node.children && Array.isArray(node.children) && node.children.length > 0) {
            const found = findNode(node.children, predicate);
            if (found) {
                return found;
            }
        }
    }
    return null;
}

/**
 * 遍历树并对每个节点应用回调函数
 * @param {Array<Object>} tree - 要遍历的树结构
 * @param {Function} callback - 应用于每个节点的回调函数
 */
function traverseTree(tree, callback) {
    if (!Array.isArray(tree)) return;
    
    for (const node of tree) {
        callback(node);
        if (node.children && Array.isArray(node.children) && node.children.length > 0) {
            traverseTree(node.children, callback);
        }
    }
}

/**
 * 将树结构展平为一维数组
 * @param {Array<Object>} tree - 要展平的树结构
 * @returns {Array<Object>} 包含所有节点的扁平数组
 */
function flattenTree(tree) {
    const flattened = [];
    traverseTree(tree, (node) => {
        flattened.push(node);
    });
    return flattened;
}

/**
 * 获取从根节点到满足断言函数的节点的路径
 * @param {Array<Object>} tree - 要搜索的树结构
 * @param {Function} predicate - 对目标节点返回 true 的函数
 * @returns {Array<Object>|null} 表示路径的节点数组，如果未找到则返回 null
 */
function getTreePath(tree, predicate) {
    if (!Array.isArray(tree)) return null;
    
    for (const node of tree) {
        if (predicate(node)) {
            return [node];
        }
        if (node.children && Array.isArray(node.children) && node.children.length > 0) {
            const path = getTreePath(node.children, predicate);
            if (path) {
                return [node, ...path];
            }
        }
    }
    return null;
}

/**
 * 从扁平数组构建树结构
 * @param {Array<Object>} flatArray - 扁平的节点数组
 * @param {Object} options - 构建选项
 * @param {string} options.idKey - 节点ID的字段名，默认为 'id'
 * @param {string} options.parentKey - 父节点ID的字段名，默认为 'parentId'
 * @param {string} options.childrenKey - 子节点的字段名，默认为 'children'
 * @param {string|null} options.rootParentId - 根节点的父ID值，默认为 null
 * @returns {Array<Object>} 构建好的树结构
 */
function buildTreeFromFlat(flatArray, options = {}) {
    if (!Array.isArray(flatArray)) return [];
    
    const {
        idKey = 'id',
        parentKey = 'parentId',
        childrenKey = 'children',
        rootParentId = null
    } = options;
    
    const nodeMap = new Map();
    const roots = [];
    
    // 创建节点映射
    flatArray.forEach(item => {
        nodeMap.set(item[idKey], { ...item, [childrenKey]: [] });
    });
    
    // 构建树结构
    nodeMap.forEach(node => {
        const parentId = node[parentKey];
        if (parentId === rootParentId || parentId === undefined || parentId === null) {
            roots.push(node);
        } else {
            const parent = nodeMap.get(parentId);
            if (parent) {
                parent[childrenKey].push(node);
            }
        }
    });
    
    return roots;
}

/**
 * 过滤树结构，只保留满足条件的节点及其路径
 * @param {Array<Object>} tree - 要过滤的树结构
 * @param {Function} predicate - 过滤条件函数
 * @returns {Array<Object>} 过滤后的树结构
 */
function filterTree(tree, predicate) {
    if (!Array.isArray(tree)) return [];
    
    return tree
        .map(node => ({ ...node }))
        .filter(node => {
            if (predicate(node)) {
                return true;
            }
            if (node.children && Array.isArray(node.children)) {
                const filteredChildren = filterTree(node.children, predicate);
                if (filteredChildren.length > 0) {
                    node.children = filteredChildren;
                    return true;
                }
            }
            return false;
        });
}

/**
 * 对树结构的每个节点应用映射函数
 * @param {Array<Object>} tree - 要映射的树结构
 * @param {Function} mapper - 映射函数，接收节点并返回新节点
 * @returns {Array<Object>} 映射后的树结构
 */
function mapTree(tree, mapper) {
    if (!Array.isArray(tree)) return [];
    
    return tree.map(node => {
        const newNode = mapper({ ...node });
        if (node.children && Array.isArray(node.children)) {
            newNode.children = mapTree(node.children, mapper);
        }
        return newNode;
    });
}

/**
 * 获取树的深度
 * @param {Array<Object>} tree - 树结构
 * @returns {number} 树的深度
 */
function getTreeDepth(tree) {
    if (!Array.isArray(tree) || tree.length === 0) return 0;
    
    let maxDepth = 0;
    traverseTree(tree, (node) => {
        let depth = 1;
        let current = node;
        while (current.parent) {
            depth++;
            current = current.parent;
        }
        maxDepth = Math.max(maxDepth, depth);
    });
    
    // 递归计算深度的替代方案
    const calculateDepth = (nodes, currentDepth = 1) => {
        if (!Array.isArray(nodes) || nodes.length === 0) return currentDepth;
        
        let maxChildDepth = currentDepth;
        nodes.forEach(node => {
            if (node.children && Array.isArray(node.children)) {
                const childDepth = calculateDepth(node.children, currentDepth + 1);
                maxChildDepth = Math.max(maxChildDepth, childDepth);
            }
        });
        
        return maxChildDepth;
    };
    
    return calculateDepth(tree);
}

/**
 * 统计树中节点的数量
 * @param {Array<Object>} tree - 树结构
 * @returns {number} 节点总数
 */
function countTreeNodes(tree) {
    if (!Array.isArray(tree)) return 0;
    
    let count = 0;
    traverseTree(tree, () => {
        count++;
    });
    return count;
}

/**
 * 查找指定节点的所有父节点
 * @param {Array<Object>} tree - 树结构
 * @param {string|number} targetKey - 目标节点的key值
 * @param {string} keyField - key字段名，默认为 'id'
 * @returns {Array<Object>} 父节点数组，从直接父节点到根节点
 */
function findTreeParents(tree, targetKey, keyField = 'id') {
    if (!Array.isArray(tree)) return [];
    
    const findPath = (nodes, key, path = []) => {
        for (const node of nodes) {
            if (node[keyField] === key) {
                return path;
            }
            if (node.children && Array.isArray(node.children)) {
                const found = findPath(node.children, key, [...path, node]);
                if (found) {
                    return found;
                }
            }
        }
        return null;
    };
    
    return findPath(tree, targetKey) || [];
}

// 导出所有函数
export {
    findNode,
    traverseTree,
    flattenTree,
    getTreePath,
    buildTreeFromFlat,
    filterTree,
    mapTree,
    getTreeDepth,
    countTreeNodes,
    findTreeParents
};