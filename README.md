# redux-test-async

redux 异步操作练手项目（redux-thunk）

## 一、什么是 redux-thunk

> **什么是 thunk**
> <br/>
> thunk 是一个延时的函数，与函数式编程中的惰性相似，编译器的"传名调用"实现，往往是将参数放到一个临时函数之中，再将这个临时函数传入函数体。这个临时函数就叫做 Thunk 函数。

redux-thunk 是 redux 官方建议的异步处理中间件，可以让同步操作与异步操作以同一种方式来 dispatch:

- `dispatch(action)`
- `dispatch(thunk)`

redux-thunk 会判断 `store.dispatch` 传递进来的参数，如果是一个 thunk（延时函数），就处理 thunk 里面的东西，完事之后执行这个函数。例如：

```js
store.dispatch(dispatch => {
  dispatch({
    action: 'FETCH_START',
    text: ''
  })
  // 下面的 thunk 完成后再执行 Action FETCH_END
  fetch(...)
    .then(data) {
      dispatch({
        action: 'FETCH_END',
        text: JSON.parse(data)
      })
    }
})
```

上面分别设置两个 Action 来标记异步是否实现：

## 二、redux-thunk 源码

redux-thunk 的源码如下：

```js
function createThunkMiddleware(extraArgument) {
  return ({ dispatch, getState }) =>
    (next) =>
    (action) => {
      if (typeof action === 'function') {
        return action(dispatch, getState, extraArgument)
      }

      return next(action)
    }
}

const thunk = createThunkMiddleware()
thunk.withExtraArgument = createThunkMiddleware

export default thunk
```

## 三、redux-thunk 的安装

```bash
# npm
npm install redux-thunk
# yarn
yarn add redux-thunk
```

## 四、redux-thunk 的使用

首先添加中间件 *▼*

**src/store/index.js：**

```diff
  import { init } from '@rematch/core'
  import temperature from './reducers/temperature'
+ import thunk from 'redux-thunk'

  const store = init({
    models: {
      temperature
    },
+   redux: {
+     middlewares: [thunk]
+   }
  })

  export default store
```

然后添加新的 dispatch 触发的事件处理函数 *▼*

**src/store/actions.js：**

```diff
  import axios from 'axios'

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

# 新添加的事件处理函数
+ export const getDataAction = (payload) => {
+   return (dispatch) => {
+     dispatch({ type: 'temperature/fetchingData' })
+     axios
+       .get(`http://wthrcdn.etouch.cn/weather_mini?city=${payload}`)
+       .then((res) => {
+         dispatch({
+           type: 'temperature/fetchingDataSuccess',
+           payload: res.data.data.wendu
+         })
+       })
+       .catch((error) => {
+         console.log(error)
+         dispatch({ type: 'temperature/fetchingDataFailure' })
+       })
+   }
+ }
```

上面新增的事件处理函数 `getDataAction` 中返回了一个函数，该函数的参数是 *dispatch* 和 *getState* 这两个 Redux 方法。

该函数做了以下事情：

- 先发出一个 Action `{ type: 'temperature/fetchingData' }` 表示操作开始，触发该 Action 去改变查询状态为*正在查询*；
- 然后进行异步操作：
  - 如果成功则再发出一个 Action `{ type: 'temperature/fetchingDataSuccess' }` 并传入拿到的温度值，触发该 Action 去改变查询状态为*查询成功*；
  - 如果失败则再发出一个 Action `{ type: 'temperature/fetchingDataFailure' }`，触发该 Action 去改变查询状态为*查询失败*。

最后引入新的 dispatch 触发的事件处理函数 *▼*

**src/App.jsx：**

```diff
  import React, { useState } from 'react'
  import { useSelector, useDispatch } from 'react-redux'
+ import { getDataAction } from './store/actions'

  const App = () => {
    const [curCity, setCurCity] = useState('')
    const curTemperature = useSelector((state) => state.temperature.data)
    const curStatus = useSelector((state) => state.temperature.status)

    const dispatch = useDispatch()

    const handleFetchTemperature = () => {
-     dispatch.temperature.fetchingData(curCity)
+     dispatch(getDataAction(curCity))
    }

    return (
      <div>
        <h3>查天气</h3>
        <input
          placeholder="请输入城市名"
          type="text"
          value={curCity}
          onChange={(e) => setCurCity(e.target.value)}
        />
        <button onClick={handleFetchTemperature}>获取温度</button>
        <p>
          今天{curCity || '__'}的温度为{curTemperature || '__'}
        </p>
        <p>查询状态：{curStatus || '__'}</p>
      </div>
    )
  }

  export default App
```

实现效果如下：

<img src="http://tva1.sinaimg.cn/large/0068vjfvgy1gy2swfxdn6g30ea098ab4.gif" width="260" referrerPolicy="no-referrer" />
