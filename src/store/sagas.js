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
