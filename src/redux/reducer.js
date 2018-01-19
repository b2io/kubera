import {
  RECEIVE_ENTITIES,
  SET_ACTIVE_STEP,
  SET_CONFIGURATION,
  SET_CREDENTIALS,
  SET_LOADING,
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

function reduceSetLoading(state, action) {
  return { ...state, ui: { ...state.ui, loading: action.payload } };
}

function reduceSetActiveStep(state, action) {
  const { number, shouldForce } = action.payload;
  const nextSteps = state.ui.steps.map((step, i) => {
    if (!shouldForce) return { ...step, active: i === number };
    if (i === number) return { active: true, disabled: false };
    if (i > number) return { active: false, disabled: true };

    return { active: false, completed: true, disabled: false };
  });

  return { ...state, ui: { ...state.ui, steps: nextSteps } };
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
  ui: {
    loading: false,
    steps: [
      { active: true, completed: false, disabled: false },
      { active: false, completed: false, disabled: true },
      { active: false, completed: false, disabled: true },
    ],
  },
};

function reducer(state = defaultState, action) {
  switch (action.type) {
    case RECEIVE_ENTITIES:
      return reduceReceiveEntities(state, action);

    case SET_ACTIVE_STEP:
      return reduceSetActiveStep(state, action);

    case SET_CONFIGURATION:
      return reduceSetConfiguration(state, action);

    case SET_CREDENTIALS:
      return reduceSetCredentials(state, action);

    case SET_LOADING:
      return reduceSetLoading(state, action);

    default:
      return state;
  }
}

export default reducer;
