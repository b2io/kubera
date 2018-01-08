const credentialsSelector = state => state.credentials;

const configurationSelector = state => ({
  project: state.configuration.project,
  projects: state.entities.projects,
  repo: state.configuration.repo,
  repos: state.entities.repos,
});

const projectSelector = id => state =>
  state.entities.projects.find(p => p.id === id);

const reportSelector = state => ({
  sprints: state.entities.sprints,
  stories: state.entities.stories,
  timeEntries: state.entities.timeEntries,
});

const repoSelector = id => state =>
  state.entities.repos.find(r => r.id === id);

export {
  configurationSelector,
  credentialsSelector,
  projectSelector,
  reportSelector,
  repoSelector,
};
