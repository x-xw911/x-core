
/**
 * @fileoverview A comprehensive utility library for JavaScript.
 * Contains tools for handling tree data structures, advanced Promise operations, and flow control.
 */

// --- Tree Utils ---

/**
 * Finds a node in a tree structure based on a predicate function.
 * @param {Array<Object>} tree - The tree structure to search. Each node must have a 'children' property (even if empty).
 * @param {Function} predicate - A function that returns true for the desired node.
 * @returns {Object|null} The found node or null if not found.
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
 * Traverses a tree and applies a callback to each node.
 * @param {Array<Object>} tree - The tree structure to traverse.
 * @param {Function} callback - The function to apply to each node.
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
 * Flattens a tree structure into a one-dimensional array.
 * @param {Array<Object>} tree - The tree structure to flatten.
 * @returns {Array<Object>} A flat array of all nodes.
 */
function flattenTree(tree) {
    const flattened = [];
    traverseTree(tree, (node) => {
        flattened.push(node);
    });
    return flattened;
}

/**
 * Gets the path from the root to a node that satisfies the predicate.
 * @param {Array<Object>} tree - The tree structure to search.
 * @param {Function} predicate - A function that returns true for the target node.
 * @returns {Array<Object>|null} An array of nodes representing the path, or null if not found.
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


// --- Promise Utils ---

/**
 * Executes promises in batches to control concurrency.
 * Ideal for bulk API calls.
 * @param {Array<Function>} tasks - An array of functions that return a Promise.
 * @param {number} batchSize - The number of promises to execute concurrently in each batch.
 * @returns {Promise<Array<any>>} A promise that resolves with an array of all results.
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
 * Retries a promise-returning function upon failure.
 * @param {Function} task - A function that returns a Promise.
 * @param {number} retries - The maximum number of retries.
 * @param {number} delay - The delay in ms between retries.
 * @returns {Promise<any>} A promise that resolves with the result of the task.
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
 * Chains a sequence of promise-returning functions, so they execute sequentially.
 * @param {Array<Function>} tasks - An array of functions that return a Promise.
 * @returns {Promise<any>} A promise that resolves with the result of the last task.
 */
function chainPromises(tasks) {
    return tasks.reduce((promise, task) => {
        return promise.then(result => task(result));
    }, Promise.resolve());
}


/**
 * Sets a timeout for a promise. If the promise doesn't resolve/reject in time, it's rejected.
 * @param {Promise<any>} promise - The promise to add a timeout to.
 * @param {number} ms - The timeout duration in milliseconds.
 * @returns {Promise<any>} The wrapped promise.
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


// --- Flow Control Utils ---

/**
 * Creates a debounced function that delays invoking `fn` until after `delay` milliseconds
 * have elapsed since the last time the debounced function was invoked.
 * @param {Function} fn - The function to debounce.
 * @param {number} delay - The number of milliseconds to delay.
 * @returns {Function} The new debounced function.
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
 * Creates a throttled function that only invokes `fn` at most once per every `limit` milliseconds.
 * @param {Function} fn - The function to throttle.
 * @param {number} limit - The- The throttle duration in milliseconds.
 * @returns {Function} The new throttled function.
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
 * Runs async tasks from an iterable with a concurrency limit.
 * @param {number} poolLimit - The maximum number of promises to run concurrently.
 * @param {Array<any>} iterable - An array of items to iterate over.
 * @param {Function} iteratorFn - A function that returns a promise for each item.
 * @returns {Promise<Array<any>>} A promise that resolves with an array of all results.
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
