/**
 * @fileoverview Promise 工具函数库
 * 提供用于处理 Promise 的各种工具方法
 */

/**
 * 分批执行 Promise 以控制并发
 * 非常适合批量 API 调用
 * @param {Array<Function>} tasks - 返回 Promise 的函数数组
 * @param {number} batchSize - 每批中并发执行的 Promise 数量
 * @returns {Promise<Array<any>>} 一个 Promise，其解析值为所有结果的数组
 */
async function promiseAllInBatches(tasks, batchSize) {
    if (!Array.isArray(tasks)) return [];
    if (batchSize <= 0) batchSize = 1;
    
    let results = [];
    for (let i = 0; i < tasks.length; i += batchSize) {
        const batch = tasks.slice(i, i + batchSize).map(task => task());
        const batchResults = await Promise.all(batch);
        results = results.concat(batchResults);
    }
    return results;
}

/**
 * 失败时重试返回 Promise 的函数
 * @param {Function} task - 返回 Promise 的函数
 * @param {number} retries - 最大重试次数
 * @param {number} delay - 重试之间的延迟（毫秒）
 * @returns {Promise<any>} 一个 Promise，其解析值为任务的结果
 */
function promiseRetry(task, retries = 3, delay = 1000) {
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
 * 为 Promise 设置超时。如果 Promise 未在规定时间内解析/拒绝，它将被拒绝
 * @param {Promise<any>} promise - 要添加超时的 Promise
 * @param {number} ms - 超时时长（毫秒）
 * @returns {Promise<any>} 包装后的 Promise
 */
function promiseTimeout(promise, ms) {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error(`Promise timed out after ${ms} ms`));
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

/**
 * 链接一系列返回 Promise 的函数，使它们按顺序执行
 * @param {Array<Function>} tasks - 返回 Promise 的函数数组
 * @returns {Promise<any>} 一个 Promise，其解析值为最后一个任务的结果
 */
function chainPromises(tasks) {
    if (!Array.isArray(tasks)) return Promise.resolve();
    
    return tasks.reduce((promise, task) => {
        return promise.then(result => task(result));
    }, Promise.resolve());
}

/**
 * 带超时的 Promise 竞速
 * @param {Array<Promise>} promises - 要竞速的 Promise 数组
 * @param {number} timeout - 超时时间（毫秒）
 * @returns {Promise<any>} 第一个完成的 Promise 的结果，或超时错误
 */
function raceWithTimeout(promises, timeout) {
    if (!Array.isArray(promises)) return Promise.reject(new Error('promises must be an array'));
    
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Promise race timed out')), timeout);
    });
    
    return Promise.race([...promises, timeoutPromise]);
}

/**
 * 获取所有 Promise 的结果，无论成功或失败
 * @param {Array<Promise>} promises - Promise 数组
 * @returns {Promise<Object>} 包含成功和失败结果的对象 { fulfilled: [], rejected: [] }
 */
async function allSettledWithResults(promises) {
    if (!Array.isArray(promises)) return { fulfilled: [], rejected: [] };
    
    const results = await Promise.allSettled(promises);
    const fulfilled = [];
    const rejected = [];
    
    results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
            fulfilled.push({ value: result.value, index });
        } else {
            rejected.push({ reason: result.reason, index });
        }
    });
    
    return { fulfilled, rejected };
}

/**
 * 创建可取消的 Promise
 * @param {Promise<any>} promise - 要包装的 Promise
 * @param {Function} cancelFn - 取消函数
 * @returns {Promise<any>} 可取消的 Promise
 */
function promiseWithCancellation(promise, cancelFn) {
    let cancelled = false;
    
    const wrappedPromise = new Promise((resolve, reject) => {
        promise.then(
            (result) => {
                if (!cancelled) resolve(result);
            },
            (error) => {
                if (!cancelled) reject(error);
            }
        );
    });
    
    wrappedPromise.cancel = () => {
        cancelled = true;
        if (cancelFn) cancelFn();
    };
    
    return wrappedPromise;
}

/**
 * 创建防抖的 Promise 函数
 * @param {Function} fn - 要防抖的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
function debouncePromise(fn, delay) {
    let timeoutId;
    let pendingPromise = null;
    
    return function(...args) {
        if (pendingPromise) {
            clearTimeout(timeoutId);
            pendingPromise.reject(new Error('Debounced: previous call cancelled'));
        }
        
        return new Promise((resolve, reject) => {
            pendingPromise = { resolve, reject };
            
            timeoutId = setTimeout(() => {
                try {
                    const result = fn.apply(this, args);
                    if (result && typeof result.then === 'function') {
                        result.then(resolve, reject);
                    } else {
                        resolve(result);
                    }
                } catch (err) {
                    reject(err);
                } finally {
                    pendingPromise = null;
                }
            }, delay);
        });
    };
}

/**
 * 创建节流的 Promise 函数
 * @param {Function} fn - 要节流的函数
 * @param {number} limit - 节流时间（毫秒）
 * @returns {Function} 节流后的函数
 */
function throttlePromise(fn, limit) {
    let inThrottle = false;
    let lastPromise = null;
    
    return function(...args) {
        if (inThrottle) {
            return lastPromise || Promise.reject(new Error('Throttled: too many calls'));
        }
        
        inThrottle = true;
        
        return new Promise((resolve, reject) => {
            lastPromise = { resolve, reject };
            
            try {
                const result = fn.apply(this, args);
                if (result && typeof result.then === 'function') {
                    result.then(
                        (value) => {
                            resolve(value);
                            setTimeout(() => {
                                inThrottle = false;
                                lastPromise = null;
                            }, limit);
                        },
                        (error) => {
                            reject(error);
                            setTimeout(() => {
                                inThrottle = false;
                                lastPromise = null;
                            }, limit);
                        }
                    );
                } else {
                    resolve(result);
                    setTimeout(() => {
                        inThrottle = false;
                        lastPromise = null;
                    }, limit);
                }
            } catch (err) {
                reject(err);
                setTimeout(() => {
                    inThrottle = false;
                    lastPromise = null;
                }, limit);
            }
        });
    };
}

// 导出所有函数
export {
    promiseAllInBatches,
    promiseRetry,
    promiseTimeout,
    chainPromises,
    raceWithTimeout,
    allSettledWithResults,
    promiseWithCancellation,
    debouncePromise,
    throttlePromise
};