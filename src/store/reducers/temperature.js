import * as actions from '../actions'

const defaultState = {
  data: '',
  status: '' // 正在查询 | 查询成功 | 查询失败
}

const temperature = {
  state: defaultState,
  reducers: {
    fetchingData: (state, payload) =>
      actions.handleFetchingData(state, payload),
    fetchingDataSuccess: (state, payload) =>
      actions.handleFetchingDataSuccess(state, payload),
    fetchingDataFailure: (state, payload) =>
      actions.handleFetchingDataFailure(state, payload)
  }
}

export default temperature
