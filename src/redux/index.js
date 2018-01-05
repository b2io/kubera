import { applyMiddleware, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import ReduxThunk from 'redux-thunk';
import reducer from './reducer';

const store = createStore(
  reducer,
  composeWithDevTools(applyMiddleware(ReduxThunk)),
);

export default store;
export * from './actions';
export * from './selectors';
