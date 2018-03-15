import { applyMiddleware, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import * as storage from 'redux-storage';
import filter from 'redux-storage-decorator-filter';
import createEngine from 'redux-storage-engine-localstorage';
import ReduxThunk from 'redux-thunk';
import reducer from './reducer';

const STORAGE_KEY = 'kubera';

function configureStore() {
  const rootReducer = storage.reducer(reducer);
  const storageEngine = filter(
    createEngine(STORAGE_KEY),
    [],
    [['ui', 'error'], ['ui', 'loading']],
  );
  const storageMiddleware = storage.createMiddleware(storageEngine);
  const storageLoader = storage.createLoader(storageEngine);

  const store = createStore(
    rootReducer,
    composeWithDevTools(applyMiddleware(ReduxThunk, storageMiddleware)),
  );

  storageLoader(store);

  return store;
}

function getStoredState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch (e) {
    return {};
  }
}

export default configureStore;
export { getStoredState };
