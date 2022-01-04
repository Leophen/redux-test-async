import React from 'react'
import './index.scss'
import { useSelector, useDispatch } from 'react-redux'

const App = () => {
  // 计数器
  const count = useSelector((state) => state.counter.count)
  const dispatch = useDispatch()

  const handleAddCount = () => {
    dispatch.counter.addCount()
  }

  const handleSubCount = () => {
    dispatch.counter.subCount()
  }

  const handleMultiCount = () => {
    dispatch.counter.multiCount(count)
  }

  // 查天气
  const temperature = useSelector((state) => state.temperature.data)
  const status = useSelector((state) => state.temperature.isFetching)

  const handleFetchTemperature = () => {
    dispatch.temperature.fetchingData('广州')
  }

  return (
    <>
      <div>
        <h3>计数器</h3>
        <button onClick={handleAddCount}>+1</button>
        <button onClick={handleSubCount}>-1</button>
        <button onClick={handleMultiCount}>× last</button>
        <span>{count}</span>
      </div>
      <div>
        <h3>查天气</h3>
        <button onClick={handleFetchTemperature}>获取广州温度</button>
        <span>今天广州的温度为{temperature}</span>
        <p>查询状态：{status}</p>
      </div>
    </>
  )
}

export default App
