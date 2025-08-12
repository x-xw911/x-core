# 并发控制和流量控制工具函数文档

## 概述

并发控制和流量控制工具函数提供了高级的异步操作管理方案，包括并发池、队列处理、频率限制、熔断器等模式。这些函数特别适合处理高并发、资源限制、服务保护等复杂场景。

## 函数详解

### 1. asyncPool(poolLimit, iterable, iteratorFn)

**函数简介**：创建并发池，精确控制同时运行的异步任务数量

**使用场景**：
- **爬虫程序**：控制同时爬取的网页数量
- **批量处理**：大量数据的分批并发处理
- **资源限制**：限制数据库连接数或API调用数
- **文件操作**：控制同时读取/写入的文件数量

**解决的问题**：
- 精确控制并发数量，避免资源耗尽
- 平衡性能和资源使用
- 防止因并发过高导致的系统崩溃

**代码示例**：
```javascript
// 网页爬虫并发控制
const urls = [
  'https://example.com/page1',
  'https://example.com/page2',
  // ... 更多URL
];

const crawlUrl = async (url) => {
  const response = await fetch(url);
  return await response.text();
};

// 限制同时爬取5个页面
const results = await asyncPool(5, urls, crawlUrl);
console.log(`爬取完成，共${results.length}个页面`);

// 批量图片处理
const imageFiles = ['image1.jpg', 'image2.jpg', 'image3.jpg'];
const processImage = async (filename) => {
  const image = await loadImage(filename);
  return await compressImage(image);
};

// 同时处理2张图片
const processedImages = await asyncPool(2, imageFiles, processImage);
```

**注意事项**：
- poolLimit 应根据系统资源合理设置
- 适合CPU密集型或I/O密集型任务
- 任务执行顺序可能与输入顺序不同

---

### 2. queueProcessor(queue, processor, concurrency)

**函数简介**：队列处理器，按顺序处理队列中的任务

**使用场景**：
- **任务队列**：后台任务的顺序处理
- **消息处理**：消息队列的顺序消费
- **工作流**：需要按特定顺序执行的工作流程
- **批量操作**：需要排队处理的批量操作

**解决的问题**：
- 保证任务的顺序执行
- 控制任务的并发处理
- 实现可靠的队列处理机制

**代码示例**：
```javascript
// 邮件发送队列
const emailQueue = [
  { to: 'user1@example.com', subject: 'Hello' },
  { to: 'user2@example.com', subject: 'Welcome' },
  // ... 更多邮件
];

const sendEmail = async (email) => {
  await emailService.send(email.to, email.subject);
  console.log(`邮件已发送至: ${email.to}`);
};

// 同时发送2封邮件，按顺序处理
await queueProcessor(emailQueue, sendEmail, 2);

// 文件处理队列
const fileQueue = ['file1.txt', 'file2.txt', 'file3.txt'];
const processFile = async (filename) => {
  const content = await fs.readFile(filename);
  const processed = await processData(content);
  await fs.writeFile(`processed_${filename}`, processed);
};

// 按顺序处理文件，并发数为1
await queueProcessor(fileQueue, processFile, 1);
```

**注意事项**：
- 队列中的任务按顺序处理，但并发执行
- 如果某个任务失败，整个队列处理会停止
- 适合需要保证顺序但允许并发的场景

---

### 3. rateLimiter(fn, limit, interval)

**函数简介**：频率限制器，限制函数在指定时间窗口内的调用次数

**使用场景**：
- **API调用限制**：避免超过第三方API的调用限制
- **用户操作限制**：防止用户频繁操作（如点赞、评论）
- **服务保护**：保护后端服务不被过载请求
- **反爬虫**：限制爬虫的请求频率

**解决的问题**：
- 遵守第三方服务的调用限制
- 防止恶意或过度的用户操作
- 保护系统稳定性

**代码示例**：
```javascript
// API调用频率限制
const limitedApiCall = rateLimiter(
  async (endpoint) => {
    const response = await fetch(`https://api.example.com${endpoint}`);
    return response.json();
  },
  100, // 每分钟最多100次调用
  60000 // 1分钟时间窗口
);

// 使用限制后的API调用
try {
  const data = await limitedApiCall('/users');
  console.log('API调用成功:', data);
} catch (error) {
  if (error.message.includes('Rate limit exceeded')) {
    console.log('调用过于频繁，请稍后重试');
  }
}

// 用户点赞限制
const limitedLike = rateLimiter(
  async (postId) => {
    await likePost(postId);
    return '点赞成功';
  },
  10, // 每分钟最多10次点赞
  60000
);

// 用户点击点赞按钮
likeBtn.addEventListener('click', async () => {
  try {
    const result = await limitedLike(currentPostId);
    showMessage(result);
  } catch (error) {
    showMessage('点赞过于频繁，请稍后再试');
  }
});
```

**注意事项**：
- 限制参数应根据实际需求合理设置
- 超过限制时会抛出异常，需要妥善处理
- 适合需要精确控制调用频率的场景

---

### 4. semaphore(count)

**函数简介**：信号量控制，管理对共享资源的并发访问

**使用场景**：
- **数据库连接池**：限制数据库连接数量
- **文件访问**：控制同时访问同一文件的数量
- **硬件资源**：限制对硬件资源的并发访问
- **网络连接**：控制网络连接数量

**解决的问题**：
- 防止资源竞争和冲突
- 控制对稀缺资源的访问
- 实现资源的公平分配

**代码示例**：
```javascript
// 数据库连接池信号量
const dbSemaphore = semaphore(5); // 最多5个连接

const queryDatabase = async (sql) => {
  await dbSemaphore.acquire(); // 获取信号量
  
  try {
    const connection = await getConnection();
    const result = await connection.query(sql);
    return result;
  } finally {
    dbSemaphore.release(); // 释放信号量
  }
};

// 使用信号量保护数据库查询
const results = await Promise.all([
  queryDatabase('SELECT * FROM users'),
  queryDatabase('SELECT * FROM products'),
  queryDatabase('SELECT * FROM orders')
]);

// 文件访问信号量
const fileSemaphore = semaphore(1); // 一次只能一个进程访问

const writeFile = async (filename, content) => {
  await fileSemaphore.acquire();
  
  try {
    await fs.writeFile(filename, content);
    console.log(`文件 ${filename} 写入成功`);
  } finally {
    fileSemaphore.release();
  }
};
```

**注意事项**：
- 必须确保在 finally 块中释放信号量
- 信号量数量应根据资源容量设置
- 适合保护共享资源的并发访问

---

### 5. circuitBreaker(fn, options)

**函数简介**：熔断器模式，在失败率过高时停止调用服务

**使用场景**：
- **微服务调用**：保护微服务不被级联故障影响
- **第三方API**：当第三方服务不稳定时快速失败
- **数据库访问**：数据库故障时的快速降级
- **外部依赖**：所有外部服务的调用保护

**解决的问题**：
- 防止级联故障扩散
- 提供快速失败机制
- 实现优雅的服务降级

**代码示例**：
```javascript
// 保护第三方API调用
const protectedApiCall = circuitBreaker(
  async (endpoint) => {
    const response = await fetch(`https://external-api.com${endpoint}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return response.json();
  },
  {
    failureThreshold: 5, // 连续失败5次后熔断
    resetTimeout: 30000, // 30秒后尝试恢复
    monitoringPeriod: 60000 // 监控周期1分钟
  }
);

// 使用熔断器保护的API调用
try {
  const userData = await protectedApiCall('/users/123');
  console.log('获取用户数据成功:', userData);
} catch (error) {
  if (error.message.includes('Circuit breaker is OPEN')) {
    console.log('服务暂时不可用，请稍后重试');
    // 使用缓存数据或降级方案
  } else {
    console.log('API调用失败:', error);
  }
}

// 数据库访问保护
const protectedDbQuery = circuitBreaker(
  async (sql) => {
    return await database.query(sql);
  },
  {
    failureThreshold: 3,
    resetTimeout: 10000
  }
);
```

**注意事项**：
- 熔断参数应根据服务特性调整
- 需要配合降级方案使用
- 适合保护关键的外部依赖

---

### 6. loadBalancer(tasks, workers)

**函数简介**：负载均衡器，在多个工作器之间分配任务

**使用场景**：
- **分布式处理**：将任务分配到多个处理器
- **多服务器**：在多个服务器间分配请求
- **多线程**：在多个线程间分配工作
- **资源利用**：最大化利用可用资源

**解决的问题**：
- 均衡分配工作负载
- 提高资源利用效率
- 实现并行处理能力

**代码示例**：
```javascript
// 多服务器负载均衡
const servers = ['server1', 'server2', 'server3'];
const requests = ['req1', 'req2', 'req3', 'req4', 'req5', 'req6'];

const processRequest = async (request, serverIndex) => {
  const server = servers[serverIndex];
  console.log(`处理请求 ${request} 在服务器 ${server}`);
  // 模拟处理时间
  await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
  return `${request} processed by ${server}`;
};

// 在3个服务器间分配6个请求
const results = await loadBalancer(
  requests.map(req => () => processRequest(req, 0)), // 实际使用时会更复杂
  3
);

// 多线程数据处理
const dataChunks = [chunk1, chunk2, chunk3, chunk4];
const processDataChunk = async (chunk) => {
  return await heavyProcessing(chunk);
};

// 使用2个"工作器"处理数据
const processedData = await loadBalancer(
  dataChunks.map(chunk => () => processDataChunk(chunk)),
  2
);
```

**注意事项**：
- 工作器数量应根据系统资源设置
- 任务应该能够独立并行处理
- 适合可以并行化的任务

---

### 7. backoffRetry(fn, options)

**函数简介**：指数退避重试，智能的重试策略

**使用场景**：
- **网络重试**：网络请求失败时的智能重试
- **服务恢复**：等待服务恢复后的重试
- **资源竞争**：资源竞争失败后的重试
- **临时故障**：临时性故障的恢复处理

**解决的问题**：
- 避免立即重试导致的资源浪费
- 智能处理不同类型的故障
- 提高重试的成功率

**代码示例**：
```javascript
// 网络请求的指数退避重试
const resilientFetch = backoffRetry(
  async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  },
  {
    maxRetries: 5,
    initialDelay: 1000, // 初始延迟1秒
    maxDelay: 30000, // 最大延迟30秒
    backoffFactor: 2 // 每次延迟翻倍
  }
);

// 使用指数退避重试
try {
  const data = await resilientFetch('https://api.example.com/data');
  console.log('数据获取成功:', data);
} catch (error) {
  console.log('重试后仍然失败:', error);
}

// 数据库连接重试
const connectToDatabase = backoffRetry(
  async () => {
    const connection = await createConnection();
    await connection.ping();
    return connection;
  },
  {
    maxRetries: 10,
    initialDelay: 500,
    backoffFactor: 1.5
  }
);
```

**注意事项**：
- 退避参数应根据故障类型调整
- 不适合用于逻辑错误的重试
- 需要设置合理的最大重试次数

---

### 8. priorityQueue()

**函数简介**：优先级队列，按优先级处理任务

**使用场景**：
- **任务调度**：按优先级执行任务
- **消息处理**：处理高优先级消息
- **资源分配**：优先分配给重要任务
- **紧急处理**：紧急任务的优先处理

**解决的问题**：
- 重要任务的优先处理
- 资源的合理分配
- 紧急情况的快速响应

**代码示例**：
```javascript
// 任务优先级队列
const taskQueue = priorityQueue();

// 添加任务，数字越大优先级越高
taskQueue.enqueue({ name: '发送紧急邮件', type: 'urgent' }, 10);
taskQueue.enqueue({ name: '生成月度报告', type: 'report' }, 5);
taskQueue.enqueue({ name: '清理临时文件', type: 'maintenance' }, 1);
taskQueue.enqueue({ name: '处理用户注册', type: 'user' }, 8);

// 按优先级处理任务
while (!taskQueue.isEmpty()) {
  const task = taskQueue.dequeue();
  console.log(`处理任务: ${task.name} (优先级: 获取的顺序)`);
  await processTask(task);
}

// 消息优先级处理
const messageQueue = priorityQueue();

messageQueue.enqueue(
  { content: '系统错误告警', level: 'error' },
  10
);
messageQueue.enqueue(
  { content: '用户登录成功', level: 'info' },
  1
);
messageQueue.enqueue(
  { content: '数据库连接警告', level: 'warning' },
  5
);

// 处理消息
const messageProcessor = async () => {
  while (!messageQueue.isEmpty()) {
    const message = messageQueue.dequeue();
    await handleMessage(message);
  }
};
```

**注意事项**：
- 优先级应该合理设置，避免所有任务都是高优先级
- 需要定期清理队列，避免任务堆积
- 适合有明确优先级区分的场景

## 最佳实践

1. **资源监控**：监控并发资源的使用情况，及时调整参数
2. **错误处理**：为所有并发操作添加完善的错误处理
3. **日志记录**：记录并发操作的执行情况和性能指标
4. **参数调优**：根据实际使用情况调整并发参数
5. **降级方案**：为关键操作准备降级方案

## 常见问题

**Q: 如何设置合适的并发数量？**
A: 根据系统资源（CPU、内存、网络带宽）和任务类型（CPU密集型、I/O密集型）来设置。

**Q: 熔断器什么时候会恢复？**
A: 达到重置超时时间后，熔断器会进入半开状态，如果下次调用成功则恢复，否则继续熔断。

**Q: 优先级队列如何处理相同优先级的任务？**
A: 相同优先级的任务按照添加顺序处理（FIFO）。

**Q: 指数退避的重试策略有什么优势？**
A: 避免立即重试加重系统负担，给服务恢复时间，提高重试成功率。

**Q: 如何监控并发控制的效果？**
A: 可以添加监控指标，如任务执行时间、成功率、资源使用率等。