import { get, isEmpty } from 'lodash';

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

const reportSelector = state => {
  let stories = state.entities.stories;

  if (
    !isEmpty(state.entities.timeEntries) &&
    !isEmpty(state.entities.stories)
  ) {
    const hoursByStoryId = state.entities.timeEntries.reduce(
      (accumulator, entry) => {
        if (entry.reference) {
          const storyId = parseInt(entry.reference, 10);
          const storyHours = accumulator[storyId] || 0;
          accumulator[storyId] = storyHours + entry.hours;
        }

        return accumulator;
      },
      {},
    );

    stories = state.entities.stories.map(story => ({
      ...story,
      trackedHours: get(hoursByStoryId, story.number, 0),
    }));
  }

  return {
    sprints: state.entities.sprints,
    stories,
    timeEntries: state.entities.timeEntries,
  };
};

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
