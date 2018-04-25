import { find, get } from 'lodash';
import { isWithinDayRange } from '../util';

const getVelocity = (stories, sprint) =>
  stories.reduce((result, story) => {
    if (isWithinDayRange(story.closedAt, sprint.startsAt, sprint.endsAt)) {
      return result + story.estimate;
    }

    return result;
  }, 0);

const getSprint = (sprints, story) => {
  const storySprint = find(sprints, sprint =>
    isWithinDayRange(story.closedAt, sprint.startsAt, sprint.endsAt),
  );

  return storySprint ? storySprint.number : 'None';
};

const hoursByStoryIdSelector = state =>
  state.entities.timeEntries.reduce((result, entry) => {
    const storyId = parseInt(entry.reference, 10);
    const storyHours = result[storyId] || 0;

    return { ...result, [storyId]: storyHours + entry.hours };
  }, {});

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
  const hoursByStoryId = hoursByStoryIdSelector(state);
  const { receivedAt, sprints, stories, timeEntries } = state.entities;

  return {
    receivedAt,
    timeEntries,
    sprints: sprints.map(sprint => ({
      ...sprint,
      velocity: getVelocity(stories, sprint),
    })),
    stories: stories.map(story => ({
      ...story,
      sprint: getSprint(sprints, story),
      trackedHours: get(hoursByStoryId, story.number, 0),
    })),
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
