import { handleActions } from 'redux-actions';
import {
  receiveEntities,
  setActiveStep,
  setConfiguration,
  setCredentials,
  setError,
  setLoading,
} from './actions';

const initialState = {
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
    error: null,
    loading: false,
    steps: [
      { active: true, completed: false, disabled: false },
      { active: false, completed: false, disabled: true },
      { active: false, completed: false, disabled: true },
    ],
  },
};

const reducer = handleActions(
  {
    [receiveEntities]: (state, action) => ({
      ...state,
      entities: {
        ...state.entities,
        ...action.payload,
      },
    }),

    [setActiveStep]: (state, action) => {
      const { number, shouldForce } = action.payload;
      const nextSteps = state.ui.steps.map((step, i) => {
        if (!shouldForce) return { ...step, active: i === number };
        if (i === number) return { active: true, disabled: false };
        if (i > number) return { active: false, disabled: true };

        return { active: false, completed: true, disabled: false };
      });

      return { ...state, ui: { ...state.ui, steps: nextSteps } };
    },

    [setConfiguration]: (state, action) => ({
      ...state,
      configuration: action.payload,
    }),

    [setCredentials]: (state, action) => ({
      ...state,
      credentials: action.payload,
    }),

    [setError]: (state, action) => ({
      ...state,
      ui: { ...state.ui, error: action.payload },
    }),

    [setLoading]: (state, action) => ({
      ...state,
      ui: { ...state.ui, loading: action.payload },
    }),
  },
  initialState,
);

export default reducer;
