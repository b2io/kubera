import { applyMiddleware, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import ReduxThunk from 'redux-thunk';

// Actions:

const RESET_CREDENTIALS = 'kubera/RESET_CREDENTIALS';
const resetCredentials = () => ({ type: RESET_CREDENTIALS });

const SAVE_CREDENTIALS = 'kubera/SAVE_CREDENTIALS';
const saveCredentials = credentials => ({
  payload: credentials,
  type: SAVE_CREDENTIALS,
});

// Reducers:

function reduceResetCredentials(state, action) {
  return { ...state, credentials: {} };
}

function reduceSaveCredentials(state, action) {
  return { ...state, credentials: action.payload };
}

const defaultState = {
  credentials: {},
};

function rootReducer(state = defaultState, action) {
  switch (action.type) {
    case RESET_CREDENTIALS:
      return reduceResetCredentials(state, action);

    case SAVE_CREDENTIALS:
      return reduceSaveCredentials(state, action);

    default:
      return state;
  }
}

// Selectors:

const credentialsSelector = state => state.credentials;

// Utility:

function configureStore() {
  return createStore(
    rootReducer,
    composeWithDevTools(applyMiddleware(ReduxThunk)),
  );
}

export {
  configureStore,
  credentialsSelector,
  resetCredentials,
  saveCredentials,
};
