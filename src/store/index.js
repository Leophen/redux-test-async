import { init } from '@rematch/core'
import counter from './reducers/counter'
import temperature from './reducers/temperature'
import thunk from 'redux-thunk'

const store = init({
  models: {
    counter,
    temperature
  },
  redux: {
    middlewares: [thunk]
  }
})

export default store
