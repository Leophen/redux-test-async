import React, { useState } from 'react'
import './index.scss'
import { useSelector, useDispatch } from 'react-redux'
import {getDataAction} from './store/actions'

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
  const [curCity, setCurCity] = useState('')
  const temperature = useSelector((state) => state.temperature.data)
  const getStatus = useSelector((state) => state.temperature.status)

  const handleFetchTemperature = () => {
    // dispatch.temperature.fetchingData(curCity)
    dispatch(getDataAction(curCity))
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
        <input
          placeholder="请输入城市名"
          type="text"
          value={curCity}
          onChange={(e) => setCurCity(e.target.value)}
        />
        <button onClick={handleFetchTemperature}>获取温度</button>
        <p>
          今天{curCity || '__'}的温度为{temperature || '__'}
        </p>
        <p>查询状态：{getStatus || '__'}</p>
      </div>
    </>
  )
}

export default App
