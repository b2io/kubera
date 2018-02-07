import { isWithinRange } from 'date-fns';
import { find } from 'lodash';

const getVelocity = (stories, sprint) =>
  stories.reduce((result, story) => {
    if (isWithinRange(story.closedAt, sprint.startsAt, sprint.endsAt)) {
      return result + story.estimate;
    }

    return result;
  }, 0);

const getSprint = (sprints, story) => {
  const storySprint = find(sprints, sprint =>
    isWithinRange(story.closedAt, sprint.startsAt, sprint.endsAt),
  );

  return storySprint ? storySprint.number : 'None';
};

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
  sprints: state.entities.sprints.map(sprint => ({
    ...sprint,
    velocity: getVelocity(state.entities.stories, sprint),
  })),
  stories: state.entities.stories.map(story => ({
    ...story,
    sprint: getSprint(state.entities.sprints, story),
  })),
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
