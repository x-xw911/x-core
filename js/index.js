/**
 * @fileoverview JavaScript 工具库统一导出文件
 * 包含树形数据结构、Promise 操作和并发控制的工具方法
 */

// 导入树形数据结构工具
import * as treeUtils from './treeUtils.js';

// 导入 Promise 工具
import * as promiseUtils from './promiseUtils.js';

// 导入并发控制工具
import * as concurrencyUtils from './concurrencyUtils.js';

// 统一导出
export {
    // 树形数据结构工具
    treeUtils,
    
    // Promise 工具
    promiseUtils,
    
    // 并发控制工具
    concurrencyUtils
};

// 也可以单独导出每个方法（可选）
export const {
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
} = treeUtils;

export const {
    promiseAllInBatches,
    promiseRetry,
    promiseTimeout,
    chainPromises,
    raceWithTimeout,
    allSettledWithResults,
    promiseWithCancellation,
    debouncePromise,
    throttlePromise
} = promiseUtils;

export const {
    asyncPool,
    queueProcessor,
    rateLimiter,
    semaphore,
    circuitBreaker,
    loadBalancer,
    backoffRetry,
    priorityQueue
} = concurrencyUtils;

// 默认导出
export default {
    treeUtils,
    promiseUtils,
    concurrencyUtils
};