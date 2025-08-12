/**
 * @fileoverview 并发控制和流量控制工具函数库
 * 提供用于控制并发执行和流量管理的各种工具方法
 */

/**
 * 以并发限制从可迭代对象运行异步任务
 * @param {number} poolLimit - 并发运行的最大 Promise 数量
 * @param {Array<any>} iterable - 要迭代的项目数组
 * @param {Function} iteratorFn - 为每个项目返回 Promise 的函数
 * @returns {Promise<Array<any>>} 一个 Promise，其解析值为所有结果的数组
 */
async function asyncPool(poolLimit, iterable, iteratorFn) {
    if (!Array.isArray(iterable)) return [];
    if (poolLimit <= 0) poolLimit = 1;
    
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

/**
 * 队列处理器，按顺序处理队列中的任务
 * @param {Array<any>} queue - 任务队列
 * @param {Function} processor - 处理函数，接收任务并返回 Promise
 * @param {number} concurrency - 并发数，默认为 1
 * @returns {Promise<Array<any>>} 处理结果数组
 */
async function queueProcessor(queue, processor, concurrency = 1) {
    if (!Array.isArray(queue)) return [];
    if (concurrency <= 0) concurrency = 1;
    
    const results = [];
    const processing = new Set();
    let index = 0;
    
    return new Promise((resolve, reject) => {
        const processNext = () => {
            if (index >= queue.length && processing.size === 0) {
                resolve(results);
                return;
            }
            
            while (processing.size < concurrency && index < queue.length) {
                const currentIndex = index++;
                const task = queue[currentIndex];
                
                const promise = processor(task)
                    .then(result => {
                        results[currentIndex] = result;
                        processing.delete(promise);
                        processNext();
                    })
                    .catch(error => {
                        processing.delete(promise);
                        reject(error);
                    });
                
                processing.add(promise);
            }
        };
        
        processNext();
    });
}

/**
 * 频率限制器，限制函数调用频率
 * @param {Function} fn - 要限制的函数
 * @param {number} limit - 时间窗口内的最大调用次数
 * @param {number} interval - 时间窗口长度（毫秒）
 * @returns {Function} 频率限制后的函数
 */
function rateLimiter(fn, limit, interval) {
    const calls = [];
    
    return function(...args) {
        const now = Date.now();
        
        // 清理过期的调用记录
        while (calls.length > 0 && calls[0] <= now - interval) {
            calls.shift();
        }
        
        // 检查是否超过限制
        if (calls.length >= limit) {
            const waitTime = calls[0] + interval - now;
            return Promise.reject(new Error(`Rate limit exceeded. Try again in ${waitTime}ms`));
        }
        
        calls.push(now);
        
        try {
            const result = fn.apply(this, args);
            if (result && typeof result.then === 'function') {
                return result;
            }
            return Promise.resolve(result);
        } catch (err) {
            return Promise.reject(err);
        }
    };
}

/**
 * 信号量控制，限制并发访问数量
 * @param {number} count - 信号量初始值
 * @returns {Object} 信号量对象 { acquire, release }
 */
function semaphore(count) {
    if (count <= 0) count = 1;
    
    const queue = [];
    let available = count;
    
    const acquire = () => {
        return new Promise(resolve => {
            if (available > 0) {
                available--;
                resolve();
            } else {
                queue.push(resolve);
            }
        });
    };
    
    const release = () => {
        available++;
        if (queue.length > 0) {
            const nextResolve = queue.shift();
            available--;
            nextResolve();
        }
    };
    
    return { acquire, release };
}

/**
 * 熔断器模式，在失败率过高时停止调用
 * @param {Function} fn - 要保护的函数
 * @param {Object} options - 熔断器选项
 * @param {number} options.failureThreshold - 失败阈值，默认 5
 * @param {number} options.resetTimeout - 重置超时（毫秒），默认 60000
 * @param {number} options.monitoringPeriod - 监控周期（毫秒），默认 60000
 * @returns {Function} 受保护的函数
 */
function circuitBreaker(fn, options = {}) {
    const {
        failureThreshold = 5,
        resetTimeout = 60000,
        monitoringPeriod = 60000
    } = options;
    
    let state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    let failures = [];
    let lastFailureTime = 0;
    
    return async function(...args) {
        const now = Date.now();
        
        // 清理过期的失败记录
        failures = failures.filter(time => now - time < monitoringPeriod);
        
        // 检查熔断状态
        if (state === 'OPEN') {
            if (now - lastFailureTime > resetTimeout) {
                state = 'HALF_OPEN';
            } else {
                throw new Error('Circuit breaker is OPEN');
            }
        }
        
        try {
            const result = await fn.apply(this, args);
            
            // 成功时重置状态
            if (state === 'HALF_OPEN') {
                state = 'CLOSED';
                failures = [];
            }
            
            return result;
        } catch (error) {
            // 记录失败
            failures.push(now);
            lastFailureTime = now;
            
            // 检查是否需要熔断
            if (failures.length >= failureThreshold) {
                state = 'OPEN';
            }
            
            throw error;
        }
    };
}

/**
 * 负载均衡器，在多个工作器之间分配任务
 * @param {Array<Function>} tasks - 任务数组
 * @param {number} workers - 工作器数量
 * @returns {Promise<Array<any>>} 所有任务的结果
 */
async function loadBalancer(tasks, workers) {
    if (!Array.isArray(tasks)) return [];
    if (workers <= 0) workers = 1;
    
    const results = new Array(tasks.length);
    const chunks = [];
    
    // 将任务分配给工作器
    for (let i = 0; i < tasks.length; i += workers) {
        chunks.push(tasks.slice(i, i + workers));
    }
    
    // 并行处理每个 chunk
    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const chunkResults = await Promise.all(
            chunk.map((task, index) => {
                const taskIndex = i * workers + index;
                return Promise.resolve(task()).then(result => {
                    results[taskIndex] = result;
                });
            })
        );
    }
    
    return results;
}

/**
 * 指数退避重试
 * @param {Function} fn - 要重试的函数
 * @param {Object} options - 退避选项
 * @param {number} options.maxRetries - 最大重试次数，默认 3
 * @param {number} options.initialDelay - 初始延迟（毫秒），默认 1000
 * @param {number} options.maxDelay - 最大延迟（毫秒），默认 30000
 * @param {number} options.backoffFactor - 退避因子，默认 2
 * @returns {Promise<any>} 函数结果
 */
async function backoffRetry(fn, options = {}) {
    const {
        maxRetries = 3,
        initialDelay = 1000,
        maxDelay = 30000,
        backoffFactor = 2
    } = options;
    
    let retryCount = 0;
    let delay = initialDelay;
    
    while (true) {
        try {
            return await fn();
        } catch (error) {
            retryCount++;
            
            if (retryCount >= maxRetries) {
                throw error;
            }
            
            // 等待延迟时间
            await new Promise(resolve => setTimeout(resolve, delay));
            
            // 计算下一个延迟时间
            delay = Math.min(delay * backoffFactor, maxDelay);
        }
    }
}

/**
 * 优先级队列
 * @returns {Object} 优先级队列对象 { enqueue, dequeue, size, isEmpty }
 */
function priorityQueue() {
    const items = [];
    
    const enqueue = (item, priority = 0) => {
        items.push({ item, priority });
        items.sort((a, b) => b.priority - a.priority);
    };
    
    const dequeue = () => {
        if (items.length === 0) return null;
        return items.shift().item;
    };
    
    const size = () => items.length;
    
    const isEmpty = () => items.length === 0;
    
    return { enqueue, dequeue, size, isEmpty };
}

// 导出所有函数
export {
    asyncPool,
    queueProcessor,
    rateLimiter,
    semaphore,
    circuitBreaker,
    loadBalancer,
    backoffRetry,
    priorityQueue
};