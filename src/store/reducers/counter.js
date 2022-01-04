import * as actions from '../actions'

const defaultState = {
  count: 0
}

const counter = {
  state: defaultState,
  reducers: {
    addCount: (state, payload) => actions.handleAddCount(state, payload),
    subCount: (state, payload) => actions.handleSubCount(state, payload),
    multiCount: (state, payload) => actions.handleMultiCount(state, payload)
  }
}

export default counter
