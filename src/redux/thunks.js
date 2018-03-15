import {
  receiveEntities,
  setActiveStep,
  setCredentials,
  setConfiguration,
  setError,
  setLoading,
} from './actions';
import { projectSelector, repoSelector } from './selectors';
import {
  getProjectReport,
  getProjects,
  getRepoReport,
  getRepos,
} from '../services';

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

export { clearConfiguration, clearReport, saveCredentials, saveConfiguration };
