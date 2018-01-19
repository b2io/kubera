const activeStepSelector = state =>
  Math.max(state.ui.steps.findIndex(s => s.active), 0);

const credentialsSelector = state => state.credentials;

const configurationSelector = state => ({
  project: state.configuration.project,
  projects: state.entities.projects,
  repo: state.configuration.repo,
  repos: state.entities.repos,
});

const errorSelector = state => state.ui.error;

const loadingSelector = state => state.ui.loading;

const projectSelector = id => state =>
  state.entities.projects.find(p => p.id === id);

const reportSelector = state => ({
  sprints: state.entities.sprints,
  stories: state.entities.stories,
  timeEntries: state.entities.timeEntries,
});

const repoSelector = id => state => state.entities.repos.find(r => r.id === id);

const stepsConfigSelector = state => state.ui.steps;

export {
  activeStepSelector,
  configurationSelector,
  credentialsSelector,
  errorSelector,
  loadingSelector,
  projectSelector,
  reportSelector,
  repoSelector,
  stepsConfigSelector,
};
