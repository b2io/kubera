import { applyMiddleware, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import * as storage from 'redux-storage';
import createEngine from 'redux-storage-engine-localstorage';
import ReduxThunk from 'redux-thunk';
import reducer from './reducer';

const rootReducer = storage.reducer(reducer);
const storageEngine = createEngine('kubera');
const storageMiddleware = storage.createMiddleware(storageEngine);
const storageLoader = storage.createLoader(storageEngine);

const store = createStore(
  rootReducer,
  composeWithDevTools(applyMiddleware(ReduxThunk, storageMiddleware)),
);

storageLoader(store);

export default store;
export * from './actions';
export * from './selectors';
