import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import Kubera from './containers/Kubera';
import store from './redux';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
  <Provider store={store}>
    <Kubera />
  </Provider>,
  document.getElementById('root'),
);

registerServiceWorker();
