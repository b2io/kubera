import {
  getProjectReport,
  getProjects,
  getRepoReport,
  getRepos,
} from '../services';
import { projectSelector, repoSelector } from './selectors';

// Action Creators:

const RECEIVE_ENTITIES = 'kubera/RECEIVE_ENTITIES';
const receiveEntities = (type, entities) => ({
  payload: { entities, type },
  type: RECEIVE_ENTITIES,
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

// Thunks:

const saveCredentials = credentials => (dispatch, getState) => {
  dispatch(setCredentials(credentials));
  dispatch(clearConfiguration());

  Promise.all([getProjects(), getRepos()]).then(([projects, repos]) => {
    dispatch(receiveEntities('projects', projects));
    dispatch(receiveEntities('repos', repos));
  });
};

const saveConfiguration = configuration => (dispatch, getState) => {
  const state = getState();
  const project = projectSelector(configuration.project)(state);
  const repo = repoSelector(configuration.repo)(state);

  dispatch(setConfiguration(configuration));
  dispatch(clearReport());

  Promise.all([getProjectReport(project), getRepoReport(repo)]).then(
    ([projectReport, repoReport]) => {
      dispatch(receiveEntities('timeEntries', projectReport.timeEntries));
      dispatch(receiveEntities('sprints', repoReport.sprints));
      dispatch(receiveEntities('stories', repoReport.stories));
    },
  );
};

const clearConfiguration = () => dispatch => {
  dispatch(setConfiguration({}));
  dispatch(receiveEntities('projects', []));
  dispatch(receiveEntities('repos', []));
  dispatch(clearReport());
};

const clearReport = () => dispatch => {
  dispatch(receiveEntities('sprints', []));
  dispatch(receiveEntities('stories', []));
  dispatch(receiveEntities('timeEntries', []));
};

export {
  RECEIVE_ENTITIES,
  receiveEntities,
  SET_CONFIGURATION,
  setConfiguration,
  SET_CREDENTIALS,
  setCredentials,
  saveCredentials,
  saveConfiguration,
  clearConfiguration,
  clearReport,
};
