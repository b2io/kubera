import {
  RECEIVE_ENTITIES,
  SET_CONFIGURATION,
  SET_CREDENTIALS,
} from './actions';

function reduceReceiveEntities(state, action) {
  return {
    ...state,
    entities: {
      ...state.entities,
      ...action.payload,
    },
  };
}

function reduceSetConfiguration(state, action) {
  return { ...state, configuration: action.payload };
}

function reduceSetCredentials(state, action) {
  return { ...state, credentials: action.payload };
}

const defaultState = {
  credentials: {},
  configuration: {},
  entities: {
    projects: [],
    repos: [],
    sprints: [],
    stories: [],
    timeEntries: [],
  },
};

function reducer(state = defaultState, action) {
  switch (action.type) {
    case RECEIVE_ENTITIES:
      return reduceReceiveEntities(state, action);

    case SET_CONFIGURATION:
      return reduceSetConfiguration(state, action);

    case SET_CREDENTIALS:
      return reduceSetCredentials(state, action);

    default:
      return state;
  }
}

export default reducer;
