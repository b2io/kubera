import {
  getProjectReport,
  getProjects,
  getRepoReport,
  getRepos,
} from '../services';
import { projectSelector, repoSelector } from './selectors';

// Action Creators:

const RECEIVE_ENTITIES = 'kubera/RECEIVE_ENTITIES';
const receiveEntities = entities => ({
  payload: entities,
  type: RECEIVE_ENTITIES,
});

const SET_ACTIVE_STEP = 'kubera/SET_ACTIVE_STEP';
const setActiveStep = (number, shouldForce = false) => ({
  payload: { number, shouldForce },
  type: SET_ACTIVE_STEP,
});

const SET_CONFIGURATION = 'kubera/SET_CONFIGURATION';
const setConfiguration = configuration => ({
  payload: configuration,
  type: SET_CONFIGURATION,
});

const SET_CREDENTIALS = 'kubera/SET_CREDENTIALS';
const setCredentials = credentials => ({
  payload: credentials,
  type: SET_CREDENTIALS,
});

const SET_ERROR = 'kubera/SET_ERROR';
const setError = error => ({
  payload: error,
  type: SET_ERROR,
});

const SET_LOADING = 'kubera/SET_LOADING';
const setLoading = isLoading => ({
  payload: isLoading,
  type: SET_LOADING,
});

// Thunks:

const saveCredentials = credentials => (dispatch, getState) => {
  dispatch(setLoading(true));
  dispatch(setError(null));
  dispatch(setCredentials(credentials));
  dispatch(clearConfiguration());

  Promise.all([getProjects(), getRepos()])
    .then(([projects, repos]) => {
      dispatch(receiveEntities({ projects, repos }));
      dispatch(setActiveStep(1, true));
      dispatch(setLoading(false));
    })
    .catch(error => {
      dispatch(setError(error));
      dispatch(setLoading(false));
    });
};

const saveConfiguration = configuration => (dispatch, getState) => {
  const state = getState();
  const project = projectSelector(configuration.project)(state);
  const repo = repoSelector(configuration.repo)(state);

  dispatch(setLoading(true));
  dispatch(setError(null));
  dispatch(setConfiguration(configuration));
  dispatch(clearReport());

  Promise.all([getProjectReport(project), getRepoReport(repo)])
    .then(([projectReport, repoReport]) => {
      dispatch(
        receiveEntities({
          sprints: repoReport.sprints,
          stories: repoReport.stories,
          timeEntries: projectReport.timeEntries,
        }),
      );
      dispatch(setActiveStep(2, true));
      dispatch(setLoading(false));
    })
    .catch(error => {
      dispatch(setError(error));
      dispatch(setLoading(false));
    });
};

const clearConfiguration = () => dispatch => {
  dispatch(setConfiguration({}));
  dispatch(receiveEntities({ projects: [], repos: [] }));
  dispatch(clearReport());
};

const clearReport = () => dispatch => {
  dispatch(receiveEntities({ sprints: [], stories: [], timeEntries: [] }));
};

export {
  RECEIVE_ENTITIES,
  receiveEntities,
  SET_CONFIGURATION,
  setConfiguration,
  SET_CREDENTIALS,
  setCredentials,
  SET_ACTIVE_STEP,
  setActiveStep,
  SET_LOADING,
  setLoading,
  SET_ERROR,
  setError,
  saveCredentials,
  saveConfiguration,
  clearConfiguration,
  clearReport,
};
