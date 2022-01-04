import { init } from '@rematch/core'
import counter from './reducers/counter'
import temperature from './reducers/temperature'

const store = init({
  models: {
    counter,
    temperature
  }
})

export default store
