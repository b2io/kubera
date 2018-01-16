import {
  eachDay,
  isBefore,
  isEqual,
  isWeekend,
  parse,
  startOfDay,
} from 'date-fns';
import {
  difference,
  find,
  isEmpty,
  last,
  negate,
  overSome,
  rearg,
  sortBy,
  sumBy,
} from 'lodash';

const alignToDay = f => (...dates) => f(...dates.map(startOfDay));
const isBeforeDay = alignToDay(isBefore);
const isAfterDay = rearg(isBeforeDay, [1, 0]);
const isEqualDay = alignToDay(isEqual);
const isBeforeOrEqualDay = overSome(isBeforeDay, isEqualDay);
const isWeekday = negate(isWeekend);

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

const isCompleted = (sprint, asOf) => isAfterDay(asOf, sprint.endsAt);

const workingDays = (...sprints) =>
  sprints.reduce(
    (sum, sprint) =>
      (sum += eachDay(sprint.startsAt, sprint.endsAt).filter(isWeekday).length),
    0,
  );

const resolveError = error => ({ error, data: null });

const resolveActualData = (sprint, stories, asOf, dateKey = 'endsAt') => {
  const date = parse(sprint[dateKey]);
  const totalStories = stories.filter(story =>
    isBeforeOrEqualDay(story.openedAt, sprint.endsAt),
  );
  const total = sumBy(totalStories, 'estimate');
  const openStories = totalStories.filter(
    story => !story.closedAt || isBeforeDay(date, story.closedAt),
  );
  const open = sumBy(openStories, 'estimate');
  const closed = total - open;

  return { closed, date, open, total, type: 'actual' };
};

const resolvePlannedData = (sprint, i, lastActual, velocity) => {
  const plannedWorkedDays = workingDays(sprint);
  const closing = Math.floor(plannedWorkedDays * velocity * (i + 1));
  const closed = Math.min(lastActual.closed + closing, lastActual.total);
  const open = Math.max(lastActual.open - closing, 0);

  return {
    closed,
    open,
    date: parse(sprint.endsAt),
    total: lastActual.total,
    type: 'planned',
  };
};

function analyzeBurndown(sprints, stories, asOf) {
  if (isEmpty(sprints)) return resolveError('No sprints.');
  if (hasOverlaps(sprints)) return resolveError('Overlapping sprints.');
  if (isEmpty(stories)) return resolveError('No stories.');
  if (!hasVelocity(stories, asOf)) return resolveError('No velocity.');

  // Actuals:

  const completedSprints = sprints.filter(sprint => isCompleted(sprint, asOf));
  const actualData = [
    resolveActualData(completedSprints[0], stories, asOf, 'startsAt'),
  ].concat(
    completedSprints.map(sprint => resolveActualData(sprint, stories, asOf)),
  );
  const lastActual = last(actualData);
  const actualWorkedDays = workingDays(...completedSprints);
  const actualVelocity = lastActual.closed / actualWorkedDays;

  // Planned:

  const plannedSprints = difference(sprints, completedSprints);
  const plannedData = plannedSprints.map((sprint, i) =>
    resolvePlannedData(sprint, i, lastActual, actualVelocity),
  );

  // Projected:
  // TODO: Analyze projected data.
  const projectedData = [];

  const data = sortBy(actualData.concat(plannedData, projectedData), 'date');

  return {
    data,
    error: null,
  };
}

export default analyzeBurndown;
