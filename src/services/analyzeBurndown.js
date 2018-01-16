import { isBefore, isEqual, parse, startOfDay } from 'date-fns';
import { find, isEmpty, negate, overSome, sortBy, sumBy } from 'lodash';

const alignToDay = f => (...dates) => f(...dates.map(startOfDay));
const isBeforeDay = alignToDay(isBefore);
const isEqualDay = alignToDay(isEqual);
const isBeforeOrEqualDay = overSome(isBeforeDay, isEqualDay);

const hasOverlaps = sprints =>
  sortBy(sprints, 'startsAt').some((sprint, i) =>
    find(
      sprints,
      comparisonSprint =>
        isBeforeOrEqualDay(sprint.startsAt, comparisonSprint.startsAt) &&
        isBeforeOrEqualDay(comparisonSprint.startsAt, sprint.endsAt),
      i + 1,
    ),
  );

const hasVelocity = (stories, asOf) =>
  stories.some(
    story => story.closedAt && isBeforeOrEqualDay(story.closedAt, asOf),
  );

const resolveError = error => ({ error, data: null });

const resolveData = (sprint, stories, asOf, dateKey = 'endsAt') => {
  const date = parse(sprint[dateKey]);
  const type = isBeforeDay(date, asOf) ? 'actual' : 'planned';
  const totalStories = stories.filter(story =>
    isBeforeOrEqualDay(story.openedAt, sprint.endsAt),
  );
  const openStories = totalStories.filter(
    story => !story.closedAt || isBeforeDay(date, story.closedAt),
  );

  return {
    date,
    type,
    open: sumBy(openStories, 'estimate'),
    total: sumBy(totalStories, 'estimate'),
  };
};

function analyzeBurndown(sprints, stories, asOf) {
  if (isEmpty(sprints)) return resolveError('No sprints.');
  if (hasOverlaps(sprints)) return resolveError('Overlapping sprints.');
  if (isEmpty(stories)) return resolveError('No stories.');
  if (!hasVelocity(stories, asOf)) return resolveError('No velocity.');

  const data = [resolveData(sprints[0], stories, asOf, 'startsAt')].concat(
    sprints.map(sprint => resolveData(sprint, stories, asOf)),
  );

  return {
    data,
    error: null,
  };
}

export default analyzeBurndown;
