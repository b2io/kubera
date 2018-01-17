import {
  addDays,
  differenceInCalendarDays,
  eachDay,
  format,
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
  sumBy,
  times,
} from 'lodash';

const alignToDay = f => (...dates) => f(...dates.map(startOfDay));
const isBeforeDay = alignToDay(isBefore);
const isAfterDay = rearg(isBeforeDay, [1, 0]);
const isEqualDay = alignToDay(isEqual);
const isBeforeOrEqualDay = overSome(isBeforeDay, isEqualDay);
const isWeekday = negate(isWeekend);

const roundUpToNearest = (n, toValue) => Math.ceil(n / toValue) * toValue;

const hasOverlaps = sprints =>
  sprints.some((sprint, i) =>
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

const resolvePlannedData = (sprint, i, lastData, pointsPerWorkedDay) => {
  const plannedWorkedDays = workingDays(sprint);
  const closing = Math.floor(plannedWorkedDays * pointsPerWorkedDay * (i + 1));
  const closed = Math.min(lastData.closed + closing, lastData.total);
  const open = Math.max(lastData.open - closing, 0);

  return {
    closed,
    open,
    date: parse(sprint.endsAt),
    total: lastData.total,
    type: 'planned',
  };
};

const resolveProjectedSprint = (i, lastSprint) => {
  const lastDuration = differenceInCalendarDays(
    lastSprint.endsAt,
    lastSprint.startsAt,
  );
  const lastRoundedDuration = roundUpToNearest(lastDuration, 7);
  const offsetDays = (i + 1) * lastRoundedDuration;
  const number = lastSprint.number + i + 1;

  return {
    number,
    endsAt: format(addDays(lastSprint.endsAt, offsetDays)),
    id: `PS${number}`,
    name: `Projected Sprint ${number}`,
    startsAt: format(addDays(lastSprint.startsAt, offsetDays)),
  };
};

const resolveFutureData = (sprint, i, lastData, pointsPerWorkedDay, type) => {
  const plannedWorkedDays = workingDays(sprint);
  const closing = Math.floor(plannedWorkedDays * pointsPerWorkedDay * (i + 1));
  const closed = Math.min(lastData.closed + closing, lastData.total);
  const open = Math.max(lastData.open - closing, 0);

  return {
    closed,
    open,
    type,
    date: parse(sprint.endsAt),
    total: lastData.total,
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
  const lastActualData = last(actualData);
  const actualWorkedDays = workingDays(...completedSprints);
  const actualPointsPerWorkedDay = lastActualData.closed / actualWorkedDays;

  // Planned:

  let plannedData = [];
  const plannedSprints = difference(sprints, completedSprints);

  if (!isEmpty(plannedSprints)) {
    plannedData = plannedSprints.map((sprint, i) =>
      resolveFutureData(
        sprint,
        i,
        lastActualData,
        actualPointsPerWorkedDay,
        'planned',
      ),
    );
  }

  // Projected:

  let projectedData = [];
  const lastPlannedData = last(plannedData);
  const lastPlannedSprint = last(plannedSprints);

  if (lastPlannedData && lastPlannedSprint) {
    const plannedWorkedDays = workingDays(lastPlannedSprint);
    const projectedSprintCount = Math.ceil(
      lastPlannedData.open / (plannedWorkedDays * actualPointsPerWorkedDay),
    );
    const projectedSprints = times(projectedSprintCount, n =>
      resolveProjectedSprint(n, lastPlannedSprint),
    );

    projectedData = projectedSprints.map((sprint, i) =>
      resolveFutureData(
        sprint,
        i,
        lastPlannedData,
        actualPointsPerWorkedDay,
        'projected',
      ),
    );
  }

  return {
    data: actualData.concat(plannedData, projectedData),
    error: null,
  };
}

export default analyzeBurndown;
