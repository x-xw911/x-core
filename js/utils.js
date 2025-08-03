
/**
 * @fileoverview 一个功能全面的 JavaScript 工具库。
 * 包含用于处理树形数据结构、高级 Promise 操作和流控制的工具。
 */

// --- 树形结构工具函数 ---

/**
 * 根据断言函数在树结构中查找节点。
 * @param {Array<Object>} tree - 要搜索的树结构。每个节点必须有一个 'children' 属性（即使为空）。
 * @param {Function} predicate - 对所需节点返回 true 的函数。
 * @returns {Object|null} 找到的节点，如果未找到则返回 null。
 */
function findNode(tree, predicate) {
    for (const node of tree) {
        if (predicate(node)) {
            return node;
        }
        if (node.children && node.children.length > 0) {
            const found = findNode(node.children, predicate);
            if (found) {
                return found;
            }
        }
    }
    return null;
}

/**
 * 遍历树并对每个节点应用回调函数。
 * @param {Array<Object>} tree - 要遍历的树结构。
 * @param {Function} callback - 应用于每个节点的回调函数。
 */
function traverseTree(tree, callback) {
    for (const node of tree) {
        callback(node);
        if (node.children && node.children.length > 0) {
            traverseTree(node.children, callback);
        }
    }
}

/**
 * 将树结构展平为一维数组。
 * @param {Array<Object>} tree - 要展平的树结构。
 * @returns {Array<Object>} 包含所有节点的扁平数组。
 */
function flattenTree(tree) {
    const flattened = [];
    traverseTree(tree, (node) => {
        flattened.push(node);
    });
    return flattened;
}

/**
 * 获取从根节点到满足断言函数的节点的路径。
 * @param {Array<Object>} tree - 要搜索的树结构。
 * @param {Function} predicate - 对目标节点返回 true 的函数。
 * @returns {Array<Object>|null} 表示路径的节点数组，如果未找到则返回 null。
 */
function getTreePath(tree, predicate) {
    for (const node of tree) {
        if (predicate(node)) {
            return [node];
        }
        if (node.children && node.children.length > 0) {
            const path = getTreePath(node.children, predicate);
            if (path) {
                return [node, ...path];
            }
        }
    }
    return null;
}


// --- Promise 工具函数 ---

/**
 * 分批执行 Promise 以控制并发。
 * 非常适合批量 API 调用。
 * @param {Array<Function>} tasks - 返回 Promise 的函数数组。
 * @param {number} batchSize - 每批中并发执行的 Promise 数量。
 * @returns {Promise<Array<any>>} 一个 Promise，其解析值为所有结果的数组。
 */
async function promiseAllInBatches(tasks, batchSize) {
    let results = [];
    for (let i = 0; i < tasks.length; i += batchSize) {
        const batch = tasks.slice(i, i + batchSize).map(task => task());
        const batchResults = await Promise.all(batch);
        results = results.concat(batchResults);
    }
    return results;
}

/**
 * 失败时重试返回 Promise 的函数。
 * @param {Function} task - 返回 Promise 的函数。
 * @param {number} retries - 最大重试次数。
 * @param {number} delay - 重试之间的延迟（毫秒）。
 * @returns {Promise<any>} 一个 Promise，其解析值为任务的结果。
 */
function promiseRetry(task, retries, delay) {
    return new Promise((resolve, reject) => {
        const attempt = () => {
            task()
                .then(resolve)
                .catch((err) => {
                    if (retries > 0) {
                        setTimeout(() => {
                            retries--;
                            attempt();
                        }, delay);
                    } else {
                        reject(err);
                    }
                });
        };
        attempt();
    });
}

/**
 * 链接一系列返回 Promise 的函数，使它们按顺序执行。
 * @param {Array<Function>} tasks - 返回 Promise 的函数数组。
 * @returns {Promise<any>} 一个 Promise，其解析值为最后一个任务的结果。
 */
function chainPromises(tasks) {
    return tasks.reduce((promise, task) => {
        return promise.then(result => task(result));
    }, Promise.resolve());
}


/**
 * 为 Promise 设置超时。如果 Promise 未在规定时间内解析/拒绝，它将被拒绝。
 * @param {Promise<any>} promise - 要添加超时的 Promise。
 * @param {number} ms - 超时时长（毫秒）。
 * @returns {Promise<any>} 包装后的 Promise。
 */
function promiseTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Promise timed out after ${ms} ms`))
    }, ms);

    promise.then(
      (res) => {
        clearTimeout(timeoutId);
        resolve(res);
      },
      (err) => {
        clearTimeout(timeoutId);
        reject(err);
      }
    );
  });
}


// --- 流控制工具函数 ---

/**
 * 创建一个防抖函数，该函数会延迟调用 \`fn\`，直到自上次调用防抖函数后经过 \`delay\` 毫秒。
 * @param {Function} fn - 要防抖的函数。
 * @param {number} delay - 延迟的毫秒数。
 * @returns {Function} 新的防抖函数。
 */
function debounce(fn, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            fn.apply(this, args);
        }, delay);
    };
}

/**
 * 创建一个节流函数，该函数在每 \`limit\` 毫秒内最多调用 \`fn\` 一次。
 * @param {Function} fn - 要节流的函数。
 * @param {number} limit - 节流持续时间（毫秒）。
 * @returns {Function} 新的节流函数。
 */
function throttle(fn, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            fn.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * 以并发限制从可迭代对象运行异步任务。
 * @param {number} poolLimit - 并发运行的最大 Promise 数量。
 * @param {Array<any>} iterable - 要迭代的项目数组。
 * @param {Function} iteratorFn - 为每个项目返回 Promise 的函数。
 * @returns {Promise<Array<any>>} 一个 Promise，其解析值为所有结果的数组。
 */
async function asyncPool(poolLimit, iterable, iteratorFn) {
  const results = [];
  const executing = [];
  for (const item of iterable) {
    const p = Promise.resolve().then(() => iteratorFn(item));
    results.push(p);

    if (poolLimit <= iterable.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= poolLimit) {
        await Promise.race(executing);
      }
    }
  }
  return Promise.all(results);
}
