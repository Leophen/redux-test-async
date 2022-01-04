import React from 'react';
import ReactDOM from 'react-dom';
import App from './App'
import store from './store'
import { Provider } from 'react-redux'

// ReactDOM.render(<App />, document.getElementById('root'));
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)

if (module.hot) {
  module.hot.accept(function () {
    console.log('Accepting the updated printMe module!')
  })
}