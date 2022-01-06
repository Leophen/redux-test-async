# redux-test-async

redux 异步操作练手项目（redux-saga）

## 一、什么是 redux-saga

> **什么是 saga**
> <br/>
> 一个 saga 可以看作是应用程序中一个单独的线程，它独自负责处理副作用（异步获取数据、访问浏览器缓存等）

<img src="http://tva1.sinaimg.cn/large/0068vjfvgy1gy3z3vsmu1j30kc094gm5.jpg" width="600" referrerPolicy="no-referrer" />

[redux-saga](https://redux-saga.js.org/) 是一个 redux 中间件，使用了 ES6 Generator，通过创建 sagas 将所有的异步操作逻辑放在一个地方集中处理，可以无侵入的处理副作用（例如异步操作），具体过程是对 *Action* 进行拦截，然后在单独的 sagas 文件中对异步操作进行处理，最后返回一个新的 Action 传给 Reducer，再去更新 store。

## 二、watcher / worker saga

redux-saga 需要一个全局监听器 *watcher saga*，用于监听组件发出的 Action，将监听到的 Action 转发给对应的接收器 `worker saga`，再由接收器执行具体任务，副作用执行完后，再发出另一个 Action 交由 reducer 修改 state，因此 *watcher saga* 监听的 Action 与对应 `worker saga` 中发出的 Action 不能同名，否则会造成死循环。

### 1、watcher saga

```js
import { takeEvery } from 'redux-saga/effects'

// watcher saga
function* watchIncrementSaga() {
  yield takeEvery('increment', workIncrementSaga)
}
```

*watcher saga* 用于监听用户派发的 Action（只用于监听，具体操作交由 worker saga），这里使用 takeEvery 辅助方法，表示每次派发都会被监听到，第一个参数就是用户派发 Action 的类型，第二个参数就是指定交由哪个 worker saga 进行处理。

### 2、worker saga

因此需要再定义一个名为 workIncrementSaga 的 `worker saga`，在里面执行副作用操作，然后使用 *yield put(...)* 派发 action，让 reducer 去更新 state：

```js
import { call, put, takeEvery } from 'redux-saga/effects'

// watcher saga
function* watchIncrementSaga() {
  yield takeEvery('increment', workIncrementSaga)
}

// worker saga
function* workIncrementSaga() {
  function f() {
    return fetch('https://jsonplaceholder.typicode.com/posts')
      .then((res) => res.json())
      .then((data) => data)
  }
  const res = yield call(f)
  console.log(res)
  yield put({ type: 'INCREMENT' })
}
```

## 三、监听辅助函数 API

### 1、takeEvery

监听类型，同一时间允许多个处理函数同时进行，并发处理。

举个例子：这里在每次点击 “1秒后加1” 按钮时，发起一个 `incrementAsync` 的 action。

首先创建一个将执行异步 action 的任务：

```js
import { delay, put } from 'redux-saga/effects'

function* incrementAsync() {
  // 延迟 1s
  yield delay(1000)

  yield put({
    type: 'increment'
  })
}
```

然后在每次 `incrementAsync` action 被发起时启动上面的任务：

```js
import { takeEvery } from 'redux-saga'

function* watchIncrementAsync() {
  yield takeEvery('incrementAsync', incrementAsync)
}
```

### 2、takeLatest

监听类型，同一时间只能有一个处理函数在执行，后面开启的任务会执行，前面的会取消执行。

上面的例子中，takeEvery 是每次发起 `incrementAsync` action 时都会执行。如果只想得到最新请求的响应，可以使用 takeLatest 辅助函数：

```js
import { takeLatest } from 'redux-saga'

function* watchIncrementAsync() {
  yield takeLatest('incrementAsync', incrementAsync)
}
```

### 3、takeLeading

如果当前有一个处理函数正在执行，那么后面开启的任务都不会被执行，直到该任务执行完毕。

## 四、常见的声明式 Effect

> **什么是 Effect**
> <br/>
> 在 redux-saga 中，sagas 都用 Generator 函数实现（Generator 函数中 yield 右边的表达式会被求值），这里 yield 纯 JavaScript 对象以表达 Saga 逻辑，这些对象称为 Effect。

*Effect* 对象包含了一些给 middleware 解释执行的信息，可以把 *Effect* 看作是发送给 middleware 的指令以执行某些操作（调用异步函数、发起一个 action 到 store 等），可以使用 `redux-saga/effects` 包提供的函数来创建 *Effect*。

### 1、take(pattern)

take 函数可以理解为监听未来的 *action*，它创建了一个命令对象，告诉 middleware 等待一个特定的 *action*，直到一个与 pattern 匹配的 *action* 被发起，才会继续执行下面的语句。举个例子：

```js
function* watchDecrementSaga() {
  while (true) {
    yield take('decrement')
    const state = yield select()
    console.log(state, 'state')
    yield put({ type: 'DECREMENT' })
  }
}
```

此时用户派发一个 *{ type: 'decrement', payload }* 的 action，就会被上面的 `take` 拦截到，执行相应的代码，然后再去派发一个 action，通知 reducer 修改 state，如果没有 *put*，则不会通知 reducer 修改 state，注意需要使用 `while true` 一直监听，否则只有第一次派发 decrement 的 action 会被拦截，后面的都不会被拦截到。

其中，pattern 的匹配有以下几种形式：

- 如果是空参数或 `*` 将匹配所有发起的 action（例如，`take()` 将匹配所有 action）
- 如果是个函数，将匹配返回 true 的 action（例如，`take(action => action.entities)` 将匹配哪些 entities 字段为真的 action）
- 如果是个字符串，将匹配 `action.type === pattern` 的 action（例如，`take(INCREMENT_ASYNC)`）

take 可看作是上面几种辅助函数的底层实现 *▼*

### 2、put(action)

put 函数是用来发送 action 的 effect，可以理解为 Redux 中的 dispatch 函数，当 put 一个 action 后，reducer 会计算新的 state 并返回。

```js
function* incrementAsync() {
  // 延迟1s
  yield delay(1000)

  yield put({
    type: 'increment'
  })
}
```

### 3、call(fn, ...args)

call 用于调用其他函数，创建一个 *Effect* 描述信息，用来命令 middleware 以参数 args 调用函数 fn。

- `fn`: 一个 Generator 函数, 或返回 Promise 的普通函数；
- `args`: 传递给 fn 的参数数组。

### 4、fork(fn, ...args)

fork 与 call 用法一样，用于调用其他函数，唯一的区别就是 fork 是非阻塞的（执行完 `yield fork(fn， args)` 后会立即执行下一行代码），而 call 是阻塞的。

- `fn`: 一个 Generator 函数, 或返回 Promise 的普通函数；
- `args`: 传递给 fn 的参数数组。

### 5、select(selector, ...args)

select 用于返回 `selector(getState(), ...args)` 的结果，第一个参数是个函数，其参数是 state（当前状态），后面的参数依次传递给第一个函数，作为该函数的参数。

```js
function selector(state, index) {
  return state[index]
}

let state2 = yield select(selector, 0)
console.log(state2, 'select2')
```

select 可以不传任何参数，返回值就直接是当前的所有状态。

[点击查看更多声明式 Effect](https://redux-saga-in-chinese.js.org/docs/api/)

## 五、redux-saga 的安装

```bash
# npm
npm install redux-saga
# yarn
yarn add redux-saga
```

## 六、redux-saga 的使用

下面使用 redux-saga 替代 redux-thunk 改造上面的查询天气工具，在异步操作后执行 dispatch：

<img src="http://tva1.sinaimg.cn/large/0068vjfvgy1gy2swfxdn6g30ea098ab4.gif" width="260" referrerPolicy="no-referrer" />

首先新增 sagas 文件处理异步逻辑 *▼*

**src/store/sagas.js：**

```js
import { put, takeEvery, call } from 'redux-saga/effects'
import axios from 'axios'

const getData = (action) => {
  return axios
    .get(`http://wthrcdn.etouch.cn/weather_mini?city=${action.payload}`)
    .then((res) => {
      return res.data.data.wendu
    })
    .catch((error) => {
      console.log(error)
      return
    })
}

function* incrementAsync(payload) {
  // yield call 是阻塞的，会等里面的函数执行完再执行下一行代码
  const curTemperature = yield call(getData, payload)
  // 执行完上面的 yield call 拿到数据后，使用 put 执行新 Action
  yield put({
    type: 'temperature/fetchingDataSuccess',
    payload: curTemperature
  })
}

export default function* rootSaga() {
  // 监听 Action - temperature/fetchingData，触发上面的 incrementAsync
  yield takeEvery('temperature/fetchingData', incrementAsync)
}
```

然后添加中间件并引入写好的 sagas 文件 *▼*

**src/store/index.js：**

```diff
  import { init } from '@rematch/core'
  import counter from './reducers/counter'
  import temperature from './reducers/temperature'
+ import createSagaMiddleware from 'redux-saga'
+ import rootSaga from './sagas'

+ const sagaMiddleware = createSagaMiddleware()

  const store = init({
    models: {
      counter,
      temperature
    },
+   redux: {
+     middlewares: [sagaMiddleware]
+   }
  })

+ sagaMiddleware.run(rootSaga)

  export default store
```

修改 dispatch 触发的事件处理函数 *▼*

**src/store/actions.js：**

```diff
- import axios from 'axios'

  export const handleFetchingData = (state, payload) => {
-   axios
-     .get(`http://wthrcdn.etouch.cn/weather_mini?city=${payload}`)
-     .then((res) => {
-       console.log(res.data)
-     })
-     .catch((error) => {
-       console.log(error)
-     })
    return {
      ...state,
      status: '正在查询'
    }
  }

  export const handleFetchingDataSuccess = (state, payload) => {
    console.log('success', payload)
    return {
      data: payload,
      status: '查询成功'
    }
  }

  export const handleFetchingDataFailure = (state, payload) => {
    console.log('failure', payload)
    return {
      ...state,
      status: '查询失败'
    }
  }
```
