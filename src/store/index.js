import { init } from '@rematch/core'
import counter from './reducers/counter'
import temperature from './reducers/temperature'
import createSagaMiddleware from 'redux-saga'
import rootSaga from './sagas'

const sagaMiddleware = createSagaMiddleware()

const store = init({
  models: {
    counter,
    temperature
  },
  redux: {
    middlewares: [sagaMiddleware]
  }
})

sagaMiddleware.run(rootSaga)

export default store
