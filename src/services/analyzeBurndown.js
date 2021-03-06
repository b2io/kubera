import {
  addDays,
  differenceInCalendarDays,
  eachDay,
  format,
  parse,
} from 'date-fns';
import { difference, find, first, isEmpty, last, sumBy, times } from 'lodash';
import {
  isBeforeDay,
  isAfterDay,
  isBeforeOrEqualDay,
  isWeekday,
  roundUpToNearest,
} from '../util';

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

const resolveFutureData = (
  sprint,
  stories,
  i,
  lastData,
  pointsPerWorkedDay,
  type,
) => {
  const plannedWorkedDays = workingDays(sprint);
  const openingStories = stories.filter(
    story =>
      isAfterDay(story.openedAt, lastData.date) &&
      isBeforeOrEqualDay(story.openedAt, sprint.endsAt),
  );
  const opening = sumBy(openingStories, 'estimate');
  const closing = Math.floor(plannedWorkedDays * pointsPerWorkedDay * (i + 1));
  const total = lastData.total + opening;
  const closed = Math.min(lastData.closed + closing, total);
  const open = Math.max(total - closed, 0);

  return { closed, open, total, type, date: parse(sprint.endsAt) };
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

function analyzeBurndown(sprints, stories, asOf) {
  if (isEmpty(sprints)) return resolveError('No sprints.');
  if (hasOverlaps(sprints)) return resolveError('Overlapping sprints.');
  if (isEmpty(stories)) return resolveError('No stories.');

  // Actuals:

  const actualSprints = sprints.filter(sprint => isCompleted(sprint, asOf));

  if (isEmpty(actualSprints)) return resolveError('No sprints have ended.');

  const firstActualSprint = first(actualSprints);
  const relevantStories = stories.filter(
    story =>
      !story.closedAt ||
      isBeforeOrEqualDay(firstActualSprint.startsAt, story.closedAt),
  );
  const lastActualSprint = last(actualSprints);
  const actualData = [
    resolveActualData(firstActualSprint, relevantStories, asOf, 'startsAt'),
  ].concat(
    actualSprints.map(sprint =>
      resolveActualData(sprint, relevantStories, asOf),
    ),
  );
  const lastActualData = last(actualData);
  const actualWorkedDays = workingDays(...actualSprints);
  const actualPointsPerWorkedDay = lastActualData.closed / actualWorkedDays;

  if (actualPointsPerWorkedDay === 0) return resolveError('No velocity.');

  // Planned:

  const plannedSprints = difference(sprints, actualSprints);
  const lastPlannedSprint = last(plannedSprints);
  const plannedData = plannedSprints.map((sprint, i) =>
    resolveFutureData(
      sprint,
      relevantStories,
      i,
      lastActualData,
      actualPointsPerWorkedDay,
      'planned',
    ),
  );
  const lastPlannedData = last(plannedData);

  // Projected:

  const projectionData = lastPlannedData || lastActualData;
  const projectionSprint = lastPlannedSprint || lastActualSprint;
  const projectionWorkedDays = workingDays(projectionSprint);
  const projectedSprintCount = Math.ceil(
    projectionData.open / (projectionWorkedDays * actualPointsPerWorkedDay),
  );
  const projectedSprints = times(projectedSprintCount, n =>
    resolveProjectedSprint(n, projectionSprint),
  );
  const projectedData = projectedSprints.map((sprint, i) =>
    resolveFutureData(
      sprint,
      relevantStories,
      i,
      projectionData,
      actualPointsPerWorkedDay,
      'projected',
    ),
  );

  return {
    data: actualData.concat(plannedData, projectedData),
    error: null,
  };
}

export default analyzeBurndown;
