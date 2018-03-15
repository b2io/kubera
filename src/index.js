import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import 'semantic-ui-css/semantic.min.css';
import Kubera from './containers/Kubera';
import configureStore from './redux';

const store = configureStore();

ReactDOM.render(
  <Provider store={store}>
    <Kubera />
  </Provider>,
  document.getElementById('root'),
);
