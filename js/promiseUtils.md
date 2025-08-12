# Promise 工具函数文档

## 概述

Promise 工具函数提供了处理异步操作的完整解决方案，包括批量处理、重试机制、超时控制、链式执行等功能。这些函数特别适合处理网络请求、文件操作、定时任务等异步场景。

## 函数详解

### 1. promiseAllInBatches(tasks, batchSize)

**函数简介**：将大量 Promise 任务分批执行，控制并发数量

**使用场景**：
- **批量API调用**：同时调用多个API接口时控制并发数
- **文件上传**：批量上传文件时限制同时上传的数量
- **数据处理**：大量数据分批处理，避免内存溢出
- **爬虫请求**：控制爬虫的并发请求数量

**解决的问题**：
- 避免同时发起过多请求导致服务器压力过大
- 防止浏览器或Node.js的并发限制
- 平衡性能和资源使用

**代码示例**：
```javascript
// 批量获取用户信息
const userIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const batchSize = 3; // 每批处理3个

// 创建获取用户信息的任务
const tasks = userIds.map(id => () => 
  fetch(`/api/users/${id}`).then(res => res.json())
);

// 分批执行
const users = await promiseAllInBatches(tasks, batchSize);
console.log(users); // 所有用户信息的数组

// 批量文件上传
const files = [file1, file2, file3, file4, file5];
const uploadTasks = files.map(file => () => uploadFile(file));

// 限制同时上传3个文件
const results = await promiseAllInBatches(uploadTasks, 3);
```

**注意事项**：
- batchSize 应该根据服务器性能和网络状况调整
- 如果某个批次中的任务失败，整个操作会抛出异常
- 任务执行顺序与原始数组顺序一致

---

### 2. promiseRetry(task, retries, delay)

**函数简介**：在 Promise 失败时自动重试指定次数

**使用场景**：
- **网络请求**：网络不稳定时自动重试API调用
- **文件操作**：文件读写失败时的重试机制
- **第三方服务**：调用外部服务时的容错处理
- **数据库操作**：数据库连接失败时的重连

**解决的问题**：
- 网络抖动或临时性故障的自动恢复
- 提高系统的稳定性和可靠性
- 减少因临时故障导致的用户错误

**代码示例**：
```javascript
// 网络请求重试
const fetchUserData = () => promiseRetry(
  () => fetch('/api/user/123').then(res => res.json()),
  3, // 重试3次
  1000 // 每次间隔1秒
);

// 文件上传重试
const uploadWithRetry = (file) => promiseRetry(
  () => uploadToServer(file),
  5, // 最多重试5次
  2000 // 每次间隔2秒
);

// 使用示例
try {
  const userData = await fetchUserData();
  console.log('获取用户数据成功:', userData);
} catch (error) {
  console.log('重试后仍然失败:', error);
}
```

**注意事项**：
- 只适用于临时性故障，不适合逻辑错误
- 重试次数不宜过多，避免长时间阻塞
- 建议结合日志记录重试情况

---

### 3. promiseTimeout(promise, ms)

**函数简介**：为 Promise 添加超时控制，超时后自动拒绝

**使用场景**：
- **API调用**：防止API响应时间过长
- **文件读取**：避免大文件读取阻塞程序
- **网络请求**：设置请求超时时间
- **用户操作**：防止用户等待时间过长

**解决的问题**：
- 防止无限等待，提升用户体验
- 避免因某个操作超时影响整个系统
- 提供更好的错误处理机制

**代码示例**：
```javascript
// API调用超时控制
const fetchWithTimeout = (url) => promiseTimeout(
  fetch(url),
  5000 // 5秒超时
);

// 文件读取超时
const readFileWithTimeout = (filePath) => promiseTimeout(
  fs.promises.readFile(filePath),
  3000 // 3秒超时
);

// 使用示例
try {
  const response = await fetchWithTimeout('/api/data');
  const data = await response.json();
  console.log('数据获取成功:', data);
} catch (error) {
  if (error.message.includes('timed out')) {
    console.log('请求超时，请稍后重试');
  } else {
    console.log('请求失败:', error);
  }
}
```

**注意事项**：
- 超时时间应根据操作类型合理设置
- 超时后原Promise仍会继续执行，只是结果被忽略
- 建议清理超时操作占用的资源

---

### 4. chainPromises(tasks)

**函数简介**：按顺序链式执行一系列 Promise 任务

**使用场景**：
- **数据处理流水线**：数据需要经过多个处理步骤
- **工作流程**：需要按特定顺序执行的任务
- **依赖执行**：后一个任务依赖前一个任务的结果
- **表单验证**：多步骤表单的顺序验证

**解决的问题**：
- 异步任务的顺序执行控制
- 复杂工作流程的简化
- 数据处理管道的实现

**代码示例**：
```javascript
// 数据处理流水线
const processData = (rawData) => chainPromises([
  // 第一步：数据清洗
  (data) => {
    console.log('清洗数据...');
    return cleanData(data);
  },
  // 第二步：数据验证
  (cleanedData) => {
    console.log('验证数据...');
    return validateData(cleanedData);
  },
  // 第三步：数据转换
  (validatedData) => {
    console.log('转换数据...');
    return transformData(validatedData);
  },
  // 第四步：数据保存
  (transformedData) => {
    console.log('保存数据...');
    return saveData(transformedData);
  }
]);

// 使用示例
const result = await processData(rawData);
console.log('处理完成:', result);

// 用户注册流程
const registerUser = (userInfo) => chainPromises([
  (data) => validateUserInfo(data),
  (validated) => checkUsernameExists(validated.username),
  (available) => createUser(available),
  (user) => sendWelcomeEmail(user.email)
]);
```

**注意事项**：
- 每个任务会接收前一个任务的结果作为参数
- 如果某个任务失败，整个链会停止执行
- 适合有明确执行顺序的场景

---

### 5. raceWithTimeout(promises, timeout)

**函数简介**：在多个 Promise 中选择最先完成的，但有超时限制

**使用场景**：
- **多源数据获取**：从多个数据源获取数据，选择最快的
- **备用方案**：主方案失败时快速切换到备用方案
- **竞速处理**：多个服务同时处理，选择最快响应的
- **容错处理**：在超时时间内尝试多个方案

**解决的问题**：
- 提高响应速度，选择最优数据源
- 实现优雅的降级处理
- 避免长时间等待不可用的服务

**代码示例**：
```javascript
// 从多个CDN获取资源，选择最快的
const cdnUrls = [
  'https://cdn1.example.com/script.js',
  'https://cdn2.example.com/script.js',
  'https://cdn3.example.com/script.js'
];

const promises = cdnUrls.map(url => fetch(url));

// 5秒内选择最快的CDN
try {
  const response = await raceWithTimeout(promises, 5000);
  console.log('从CDN获取资源成功:', response.url);
} catch (error) {
  console.log('所有CDN都超时，使用本地资源');
  // 使用本地备用资源
}

// API调用竞速
const apiEndpoints = [
  'https://api1.example.com/data',
  'https://api2.example.com/data',
  'https://api3.example.com/data'
];

const fastestResponse = await raceWithTimeout(
  apiEndpoints.map(url => fetch(url)),
  3000
);
```

**注意事项**：
- 超时时间应该根据网络状况合理设置
- 适用于对响应时间敏感的场景
- 需要确保所有Promise返回相同格式的数据

---

### 6. allSettledWithResults(promises)

**函数简介**：等待所有 Promise 完成，无论成功或失败，并返回详细结果

**使用场景**：
- **批量操作**：需要知道每个操作的具体结果
- **错误统计**：统计成功和失败的操作数量
- **日志记录**：记录所有操作的执行情况
- **用户反馈**：向用户展示详细的操作结果

**解决的问题**：
- 部分失败时不影响整体流程
- 获取详细的执行结果和错误信息
- 提供更好的用户反馈

**代码示例**：
```javascript
// 批量发送邮件
const emailTasks = [
  sendEmail('user1@example.com', 'Hello'),
  sendEmail('user2@example.com', 'Hi'),
  sendEmail('invalid-email', 'Test')
];

const results = await allSettledWithResults(emailTasks);

console.log('发送结果:');
console.log('成功:', results.fulfilled.length);
console.log('失败:', results.rejected.length);

// 详细结果
results.fulfilled.forEach(({ value, index }) => {
  console.log(`邮件 ${index + 1} 发送成功`);
});

results.rejected.forEach(({ reason, index }) => {
  console.log(`邮件 ${index + 1} 发送失败:`, reason.message);
});

// 批量文件处理
const fileProcessingTasks = files.map(file => processFile(file));
const processingResults = await allSettledWithResults(fileProcessingTasks);

// 生成处理报告
const report = {
  total: files.length,
  success: processingResults.fulfilled.length,
  failed: processingResults.rejected.length,
  details: processingResults
};
```

**注意事项**：
- 返回的结果包含成功和失败的详细信息
- 不会因为某个Promise失败而抛出异常
- 适合需要完整执行情况的场景

---

### 7. promiseWithCancellation(promise, cancelFn)

**函数简介**：创建可以取消的 Promise

**使用场景**：
- **用户取消操作**：用户主动取消长时间运行的任务
- **资源释放**：在不需要时及时释放资源
- **超时取消**：结合超时机制自动取消
- **重复请求**：取消之前的相同请求

**解决的问题**：
- 避免不必要的资源消耗
- 提供更好的用户控制
- 防止过时数据的处理

**代码示例**：
```javascript
// 可取消的文件上传
const uploadFile = (file) => {
  const controller = new AbortController();
  
  const uploadPromise = fetch('/api/upload', {
    method: 'POST',
    body: file,
    signal: controller.signal
  });
  
  return promiseWithCancellation(
    uploadPromise,
    () => controller.abort()
  );
};

// 使用示例
const uploadTask = uploadFile(largeFile);

// 用户点击取消按钮
document.getElementById('cancelBtn').addEventListener('click', () => {
  uploadTask.cancel();
  console.log('上传已取消');
});

// 可取消的数据加载
const loadData = () => {
  const timeoutId = setTimeout(() => {
    // 自动取消
  }, 10000);
  
  return promiseWithCancellation(
    fetch('/api/large-data'),
    () => clearTimeout(timeoutId)
  );
};
```

**注意事项**：
- 取消操作应该清理相关资源
- 取消后的Promise会拒绝
- 需要妥善处理取消后的状态

---

### 8. debouncePromise(fn, delay)

**函数简介**：创建防抖的 Promise 函数，避免频繁调用

**使用场景**：
- **搜索建议**：用户输入时的搜索建议
- **自动保存**：文档编辑时的自动保存
- **表单验证**：实时表单验证
- **窗口调整**：窗口大小改变时的处理

**解决的问题**：
- 减少不必要的API调用
- 提高性能和用户体验
- 避免重复处理相同操作

**代码示例**：
```javascript
// 搜索建议防抖
const debouncedSearch = debouncePromise(
  (keyword) => fetch(`/api/search?q=${keyword}`).then(res => res.json()),
  300 // 300ms防抖
);

// 用户输入时调用
searchInput.addEventListener('input', async (e) => {
  try {
    const suggestions = await debouncedSearch(e.target.value);
    displaySuggestions(suggestions);
  } catch (error) {
    console.log('搜索被取消或失败:', error);
  }
});

// 自动保存防抖
const debouncedSave = debouncePromise(
  (content) => saveToServer(content),
  1000 // 1秒防抖
);

// 文档编辑时自动保存
editor.addEventListener('input', async (e) => {
  try {
    await debouncedSave(e.target.value);
    showSaveIndicator();
  } catch (error) {
    console.log('保存被取消');
  }
});
```

**注意事项**：
- 防抖时间应根据用户体验调整
- 连续调用时，之前的调用会被取消
- 需要处理被取消的情况

---

### 9. throttlePromise(fn, limit)

**函数简介**：创建节流的 Promise 函数，限制调用频率

**使用场景**：
- **滚动加载**：滚动时的数据加载
- **实时更新**：实时数据的定时更新
- **按钮点击**：防止按钮重复点击
- **事件处理**：高频事件的处理

**解决的问题**：
- 控制函数调用频率
- 防止资源过度消耗
- 提供稳定的用户体验

**代码示例**：
```javascript
// 滚动加载节流
const throttledLoadMore = throttlePromise(
  () => loadMoreData(),
  1000 // 1秒节流
);

// 滚动事件
window.addEventListener('scroll', async () => {
  if (isNearBottom()) {
    try {
      const newData = await throttledLoadMore();
      appendData(newData);
    } catch (error) {
      console.log('加载被限制:', error);
    }
  }
});

// 实时状态更新节流
const throttledUpdateStatus = throttlePromise(
  (status) => updateServerStatus(status),
  2000 // 2秒节流
);

// 状态变化时更新
statusIndicator.addEventListener('change', async (e) => {
  try {
    await throttledUpdateStatus(e.target.value);
    showSuccessMessage();
  } catch (error) {
    console.log('更新被限制');
  }
});
```

**注意事项**：
- 节流时间应根据实际需求调整
- 在节流期间的调用会被拒绝
- 适合高频但需要控制的场景

## 最佳实践

1. **错误处理**：始终使用 try-catch 处理 Promise 的错误情况
2. **超时设置**：为网络请求等操作设置合理的超时时间
3. **资源清理**：在取消或超时时及时清理相关资源
4. **性能监控**：监控异步操作的执行时间和成功率
5. **用户体验**：提供加载状态和错误反馈

## 常见问题

**Q: 如何处理大量并发请求？**
A: 使用 `promiseAllInBatches` 分批处理，控制并发数量。

**Q: 网络请求不稳定怎么办？**
A: 使用 `promiseRetry` 添加重试机制，配合 `promiseTimeout` 设置超时。

**Q: 如何防止用户重复提交？**
A: 使用 `throttlePromise` 或 `debouncePromise` 控制调用频率。

**Q: 需要取消长时间运行的任务？**
A: 使用 `promiseWithCancellation` 创建可取消的 Promise。

**Q: 如何获取所有任务的执行结果？**
A: 使用 `allSettledWithResults` 获取详细的成功和失败信息。