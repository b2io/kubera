import {
  getProjectReport,
  getProjects,
  getRepoReport,
  getRepos,
} from '../services';
import {
  receiveEntities,
  setActiveStep,
  setCredentials,
  setConfiguration,
  setError,
  setLoading,
} from './actions';
import {
  configurationSelector,
  projectSelector,
  repoSelector,
} from './selectors';

const refreshReport = () => (dispatch, getState) => {
  const configuration = configurationSelector(getState());

  dispatch(saveConfiguration(configuration));
};

const saveCredentials = credentials => (dispatch, getState) => {
  dispatch([
    setLoading(true),
    setError(null),
    setCredentials(credentials),
    clearConfiguration(),
  ]);

  Promise.all([getProjects(), getRepos()])
    .then(([projects, repos]) => {
      dispatch([
        receiveEntities({ projects, repos }),
        setActiveStep(1, true),
        setLoading(false),
      ]);
    })
    .catch(error => {
      dispatch([setError(error), setLoading(false)]);
    });
};

const saveConfiguration = configuration => (dispatch, getState) => {
  const state = getState();
  const project = projectSelector(configuration.project)(state);
  const repo = repoSelector(configuration.repo)(state);

  dispatch([
    setLoading(true),
    setError(null),
    setConfiguration(configuration),
    clearReport(),
  ]);

  Promise.all([getProjectReport(project), getRepoReport(repo)])
    .then(([projectReport, repoReport]) => {
      dispatch([
        receiveEntities({
          sprints: repoReport.sprints,
          stories: repoReport.stories,
          timeEntries: projectReport.timeEntries,
        }),
        setActiveStep(2, true),
        setLoading(false),
      ]);
    })
    .catch(error => {
      dispatch([setError(error), setLoading(false)]);
    });
};

const clearReport = () => dispatch => {
  dispatch(receiveEntities({ sprints: [], stories: [], timeEntries: [] }));
};

const clearConfiguration = () => dispatch => {
  dispatch([
    setConfiguration({}),
    receiveEntities({ projects: [], repos: [] }),
    clearReport(),
  ]);
};

export { refreshReport, saveCredentials, saveConfiguration };
