import dateFns from 'date-fns';
import _ from 'lodash';
import React from 'react';
import {
  VictoryAxis,
  VictoryChart,
  VictoryLine,
  VictoryScatter,
} from 'victory';

const isBeforeOrEqual = (date, dateToCompare) =>
  dateFns.isBefore(date, dateToCompare) || dateFns.isEqual(date, dateToCompare);

const resolveSprintData = (sprint, stories) => {
  const allStories = stories.filter(story =>
    isBeforeOrEqual(story.openedAt, sprint.endsAt),
  );
  const openStories = allStories.filter(
    story => !story.closedAt || isBeforeOrEqual(sprint.endsAt, story.closedAt),
  );
  const closedStories = allStories.filter(
    story =>
      story.closedAt &&
      isBeforeOrEqual(sprint.startsAt, story.closedAt) &&
      isBeforeOrEqual(story.closedAt, sprint.endsAt),
  );

  return {
    all: _.sumBy(allStories, 'estimate'),
    closed: _.sumBy(closedStories, 'estimate'),
    date: dateFns.parse(sprint.endsAt),
    open: _.sumBy(openStories, 'estimate'),
  };
};

const resolveInitialData = (sprints, sprintData) => {
  const { startsAt } = _.first(sprints);
  const { all } = _.first(sprintData);

  return { all, closed: 0, date: dateFns.parse(startsAt), open: all };
};

const resolveData = (sprints, stories) => {
  const sprintData = sprints.map(sprint => resolveSprintData(sprint, stories));
  const initialData = resolveInitialData(sprints, sprintData);
  // TODO: We shouldn't show data points for sprints that haven't started.
  // TODO: If the last sprint doesn't have 0 open, determine the projected end date.

  return [initialData, ...sprintData];
};

class BurndownChart extends React.Component {
  render() {
    const { sprints, stories } = this.props;

    if (sprints.length <= 1 || stories.length <= 1) return null;

    const data = resolveData(sprints, stories);
    const domainY = [0, _.maxBy(data, 'open').open];
    // TODO: Set the ticks on the x-axis to be just sprint-end dates.

    return (
      <VictoryChart>
        <VictoryAxis scale="time" />
        <VictoryAxis dependentAxis domain={domainY} />
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
