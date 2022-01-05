import axios from 'axios'

export const handleAddCount = (state, payload) => {
  console.log(`传入的参数为 ${payload}`)
  return {
    // ...state,
    count: state.count + 1
  }
}

export const handleSubCount = (state, payload) => {
  console.log(`传入的参数为 ${payload}`)
  return {
    count: state.count - 1
  }
}

export const handleMultiCount = (state, payload) => {
  return {
    count: (state.count *= payload)
  }
}

export const handleFetchingData = (state, payload) => {
  // axios
  //   .get(`http://wthrcdn.etouch.cn/weather_mini?city=${payload}`)
  //   .then((res) => {
  //     console.log(res.data)
  //     // dispatch.temperature.fetchingDataSuccess()
  //   })
  //   .catch((error) => {
  //     console.log(error)
  //     // dispatch.temperature.fetchingDataFailure()
  //   })
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

export const getDataAction = (payload) => {
  return (dispatch) => {
    dispatch({ type: 'temperature/fetchingData' })
    axios
      .get(`http://wthrcdn.etouch.cn/weather_mini?city=${payload}`)
      .then((res) => {
        dispatch({
          type: 'temperature/fetchingDataSuccess',
          payload: res.data.data.wendu
        })
      })
      .catch((error) => {
        console.log(error)
        dispatch({ type: 'temperature/fetchingDataFailure' })
      })
  }
}
