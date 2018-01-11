import dateFns from 'date-fns';
import _ from 'lodash';
import React from 'react';
import {
  VictoryAxis,
  VictoryChart,
  VictoryLine,
  VictoryScatter,
} from 'victory';

const roundUpToNearest = (n, toValue) => Math.ceil(n / toValue) * toValue;

const valueBy = (comparator, array, path, defaultValue) =>
  _.get(comparator(array, path), path, defaultValue);

const minValueBy = (...args) => valueBy(_.minBy, ...args);

const maxValueBy = (...args) => valueBy(_.maxBy, ...args);

const isBeforeOrEqual = (date, dateToCompare) =>
  dateFns.isBefore(date, dateToCompare) || dateFns.isEqual(date, dateToCompare);

const resolveSprintData = (sprint, stories, reportedAt) => {
  const endsAt = dateFns.min(reportedAt, sprint.endsAt);
  const isProjected = dateFns.isBefore(reportedAt, sprint.endsAt);

  const allStories = stories.filter(story =>
    isBeforeOrEqual(story.openedAt, sprint.endsAt),
  );
  const openStories = allStories.filter(
    story => !story.closedAt || isBeforeOrEqual(endsAt, story.closedAt),
  );
  const closedStories = allStories.filter(
    story =>
      story.closedAt &&
      isBeforeOrEqual(sprint.startsAt, story.closedAt) &&
      isBeforeOrEqual(story.closedAt, endsAt),
  );

  return {
    isProjected,
    sprint,
    all: _.sumBy(allStories, 'estimate'),
    closed: _.sumBy(closedStories, 'estimate'),
    date: dateFns.parse(sprint.endsAt),
    open: _.sumBy(openStories, 'estimate'),
  };
};

const resolveInitialData = (sprints, sprintsData) => {
  const { startsAt } = _.first(sprints);
  const { all, isProjected, sprint } = _.first(sprintsData);

  return {
    all,
    isProjected,
    sprint,
    closed: 0,
    date: dateFns.parse(startsAt),
    open: all,
  };
};

const resolveSprintsData = (sprints, stories, reportedAt) =>
  sprints.map(sprint => resolveSprintData(sprint, stories, reportedAt));

class BurndownChart extends React.Component {
  static defaultProps = {
    reportedAt: dateFns.format(Date.now()),
    sprints: [],
    stories: [],
  };

  render() {
    const { reportedAt, sprints, stories } = this.props;

    if (sprints.length <= 1 || stories.length <= 1) return null;

    const projectStartDate = dateFns.parse(minValueBy(sprints, 'startsAt'));
    const projectEndDate = dateFns.parse(maxValueBy(sprints, 'endsAt'));

    const reportedDate = dateFns.parse(reportedAt);
    const sprintsData = resolveSprintsData(sprints, stories, reportedAt);
    const data = [resolveInitialData(sprints, sprintsData), ...sprintsData];
    const totalPoints = maxValueBy(data, 'all');

    const stylesX = {
      grid: { stroke: 'grey' },
      ticks: { stroke: 'grey', size: 5 },
    };
    const domainY = [0, totalPoints];

    const actualsData = sprintsData.filter(d => !d.isProjected);
    const actualClosedPoints = _.sumBy(actualsData, 'closed');
    const actualDays = dateFns.differenceInCalendarDays(
      maxValueBy(actualsData, 'sprint.endsAt'),
      minValueBy(actualsData, 'sprint.startsAt'),
    );
    const actualPointsPerDay = _.round(actualClosedPoints / actualDays, 2);
    const lastSprint = _.last(sprints);
    const lastSprintDuration = dateFns.differenceInCalendarDays(
      lastSprint.endsAt,
      lastSprint.startsAt,
    );
    const openPoints = totalPoints - actualClosedPoints;
    const roundedSprintDuration = roundUpToNearest(lastSprintDuration, 7);
    const projectedSprintsCount = sprints.length - actualsData.length;
    const missingSprintCount = Math.ceil(
      openPoints / actualPointsPerDay / roundedSprintDuration -
        projectedSprintsCount,
    );
    const missingSprints = _.times(missingSprintCount, n => {
      const offsetDays = (n + 1) * roundUpToNearest(lastSprintDuration, 7);
      const number = lastSprint.number + n + 1;

      return {
        number,
        endsAt: dateFns.format(dateFns.addDays(lastSprint.endsAt, offsetDays)),
        id: `ms${number}`,
        name: `(Missing) Sprint ${number}`,
        startsAt: dateFns.format(
          dateFns.addDays(lastSprint.startsAt, offsetDays),
        ),
      };
    });
    const projectedEndDate = maxValueBy(missingSprints, 'endsAt');

    const domainX = [
      projectStartDate,
      dateFns.max(projectEndDate, reportedDate, projectedEndDate),
    ];
    const ticksX = {
      format: d => {
        if (dateFns.isEqual(d, projectStartDate)) return '';
        if (dateFns.isEqual(d, reportedDate)) return '';

        const sprint = sprints.find(s => dateFns.isEqual(d, s.endsAt));
        if (sprint) return sprint.number;

        const missingSprint = missingSprints.find(s =>
          dateFns.isEqual(d, s.endsAt),
        );
        return `${missingSprint.number}*`;
      },
      values: _.sortBy([
        projectStartDate,
        ...sprints.map(s => dateFns.parse(s.endsAt)),
        ...missingSprints.map(s => dateFns.parse(s.endsAt)),
        reportedDate,
      ]),
    };
    const projectedData = dateFns
      .eachDay(projectStartDate, projectedEndDate)
      .map((date, i) => {
        return { date, open: totalPoints - actualPointsPerDay * i };
      });

    // TODO: Clean this mess up.
    // TODO: What if there are enough planned sprints to cover the backlog?
    // TODO: Style the tick for the reportedAtDate differently.
    // TODO: Remove the * from missing-sprint ticks, style the label differently.

    return (
      <VictoryChart domainPadding={{ y: 10 }}>
        <VictoryAxis
          domain={domainX}
          scale="time"
          style={stylesX}
          tickFormat={ticksX.format}
          tickValues={ticksX.values}
        />
        <VictoryAxis dependentAxis domain={domainY} />
        <VictoryLine
          data={projectedData}
          style={{ data: { stroke: 'lightGrey', strokeDasharray: '5, 5' } }}
          x="date"
          y="open"
        />
        <VictoryLine
          data={data}
          style={{ data: { stroke: 'grey' } }}
          x="date"
          y="all"
        />
        <VictoryScatter
          data={data}
          style={{ data: { fill: 'grey' } }}
          x="date"
          y="all"
        />
        <VictoryLine
          data={data}
          style={{ data: { stroke: 'black' } }}
          x="date"
          y="open"
        />
        <VictoryScatter
          data={data}
          style={{ data: { fill: 'black' } }}
          x="date"
          y="open"
        />
      </VictoryChart>
    );
  }
}

export default BurndownChart;
