# JavaScript 工具函数库使用文档 (`USAGE.md`)

本文档提供了 `utils.js` 中所有工具函数的使用方法、示例和预期的测试输出。你可以根据这些示例来理解函数的功能，并在需要时进行修改。

---

## 菜单树 (Tree) 工具函数

这些函数用于处理常见的树形数据结构，例如导航菜单、组织结构图等。

### `findNode(tree, predicate)`

在树中查找满足条件的第一个节点。

**示例数据:**
```javascript
const tree = [
    { id: 1, name: 'Home', children: [] },
    {
        id: 2, name: 'Products',
        children: [
            { id: 3, name: 'Electronics', children: [] },
            { id: 4, name: 'Books', children: [] },
        ],
    },
];
```

**测试用例:**
```javascript
// 查找 ID 为 4 的节点
const node = findNode(tree, (n) => n.id === 4);
console.log(node); 
// 预期输出: { id: 4, name: 'Books', children: [] }

// 查找不存在的节点
const notFound = findNode(tree, (n) => n.id === 99);
console.log(notFound);
// 预期输出: null
```

### `traverseTree(tree, callback)`

遍历树中的所有节点，并对每个节点执行回调函数。

**测试用例:**
```javascript
const nodeNames = [];
traverseTree(tree, (node) => nodeNames.push(node.name));
console.log(nodeNames);
// 预期输出: ['Home', 'Products', 'Electronics', 'Books']
```

### `flattenTree(tree)`

将树形结构展平为一维数组。

**测试用例:**
```javascript
const flatNodes = flattenTree(tree);
console.log(flatNodes.length);
// 预期输出: 4
console.log(flatNodes[2].name);
// 预期输出: 'Electronics'
```

### `getTreePath(tree, predicate)`

获取从根节点到目标节点的路径。

**测试用例:**
```javascript
const path = getTreePath(tree, (n) => n.id === 4);
console.log(path.map(p => p.name));
// 预期输出: ['Products', 'Books']

const nonExistentPath = getTreePath(tree, (n) => n.id === 99);
console.log(nonExistentPath);
// 预期输出: null
```

---

## Promise 增强函数

这些函数用于处理复杂的异步场景，特别是批量 API 请求和失败重试。

### `promiseAllInBatches(tasks, batchSize)`

分批执行 Promise 任务，用于控制并发量，是**批量调接口的核心函数**。

**示例数据:**
```javascript
// 模拟返回 Promise 的异步任务
const createTask = (id) => () => new Promise(resolve => {
    console.log(`Task ${id} started`);
    setTimeout(() => {
        console.log(`Task ${id} finished`);
        resolve(`Result ${id}`);
    }, 1000);
});

const tasks = [createTask(1), createTask(2), createTask(3), createTask(4), createTask(5)];
```

**测试用例:**
```javascript
// 每批执行 2 个任务
const results = await promiseAllInBatches(tasks, 2);
console.log(results);
// 预期输出 (控制台日志会分批显示):
// Task 1 started
// Task 2 started
// (1秒后)
// Task 1 finished
// Task 2 finished
// Task 3 started
// Task 4 started
// ...以此类推
// 最终 results: ['Result 1', 'Result 2', 'Result 3', 'Result 4', 'Result 5']
```

### `promiseRetry(task, retries, delay)`

当 Promise 执行失败时，自动进行重试。

**示例数据:**
```javascript
let failCount = 2;
const failingTask = () => new Promise((resolve, reject) => {
    if (failCount > 0) {
        failCount--;
        console.log('Task failed, retrying...');
        reject('Error');
    } else {
        console.log('Task succeeded!');
        resolve('Success');
    }
});
```

**测试用例:**
```javascript
// 重试 3 次，每次间隔 500ms
const result = await promiseRetry(failingTask, 3, 500);
console.log(result);
// 预期输出:
// Task failed, retrying...
// Task failed, retrying...
// Task succeeded!
// 'Success'
```

### `chainPromises(tasks)`

顺序执行一系列返回 Promise 的函数。

**测试用例:**
```javascript
const chainedTasks = [
    () => Promise.resolve(1),
    (prevResult) => Promise.resolve(prevResult + 2), // 1 + 2 = 3
    (prevResult) => Promise.resolve(prevResult * 3), // 3 * 3 = 9
];

const finalResult = await chainPromises(chainedTasks);
console.log(finalResult);
// 预期输出: 9
```

### `promiseTimeout(promise, ms)`

为 Promise 设置超时限制。

**测试用例:**
```javascript
const longRunningPromise = new Promise(resolve => setTimeout(() => resolve('Done'), 2000));

try {
    await promiseTimeout(longRunningPromise, 1000); 
} catch (error) {
    console.log(error.message);
    // 预期输出: 'Promise timed out after 1000 ms'
}
```

---

## 高级流控制 (Flow Control) 函数

用于优化性能和控制函数执行频率。

### `debounce(fn, delay)`

函数防抖。在事件触发后，等待 `delay` 毫秒再执行函数。如果在此期间再次触发，则重新计时。

**测试用例:**
```javascript
const debouncedFn = debounce(() => console.log('Debounced!'), 500);

debouncedFn();
debouncedFn(); // 这次调用会重置计时器
setTimeout(debouncedFn, 300); // 这次也会

// 预期输出 (约 800ms 后): 'Debounced!'
```

### `throttle(fn, limit)`

函数节流。在 `limit` 时间段内，函数最多只执行一次。

**测试用例:**
```javascript
const throttledFn = throttle(() => console.log('Throttled!'), 1000);

throttledFn(); // 立即执行
throttledFn(); // 在 1s 内被忽略

setTimeout(throttledFn, 1200); // 1.2s 后可以再次执行

// 预期输出:
// 'Throttled!' (立即)
// 'Throttled!' (约 1.2s 后)
```

### `asyncPool(poolLimit, iterable, iteratorFn)`

一个强大的异步并发池，可以控制任何可迭代任务的并发量。

**示例数据:**
```javascript
const items = [1, 2, 3, 4, 5];
const asyncIteratorFn = (item) => new Promise(resolve => {
    console.log(`Processing item ${item}`);
    setTimeout(() => resolve(`Processed ${item}`), 1000);
});
```

**测试用例:**
```javascript
// 并发限制为 2
const poolResults = await asyncPool(2, items, asyncIteratorFn);
console.log(poolResults);

// 预期输出 (控制台日志会显示并发执行过程):
// Processing item 1
// Processing item 2
// (1s 后)
// Processing item 3
// Processing item 4
// ...
// 最终 poolResults: ['Processed 1', 'Processed 2', 'Processed 3', 'Processed 4', 'Processed 5']
```
