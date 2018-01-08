import eachDay from 'date-fns/each_day';
import isBefore from 'date-fns/is_before';
import flatMap from 'lodash/flatMap';
import maxBy from 'lodash/maxBy';
import React from 'react';
import {
  VictoryAxis,
  VictoryChart,
  VictoryGroup,
  VictoryLegend,
  VictoryLine,
} from 'victory';

const sumBy = (list, key) => list.reduce((sum, item) => (sum += item[key]), 0);

const resolveData = (sprints, stories) => {
  return flatMap(sprints, sprint => {
    const allStories = stories.filter(story =>
      isBefore(story.openedAt, sprint.endsAt),
    );

    return eachDay(sprint.startsAt, sprint.endsAt).map(date => {
      const openStories = allStories.filter(
        story => !story.closedAt || isBefore(date, story.closedAt),
      );

      return {
        date,
        open: sumBy(openStories, 'estimate'),
      };
    });
  });
};

const resolveGuideline = (sprints, data, maxOpen) =>
  data.map((d, i) => ({
    date: d.date,
    open: maxOpen - maxOpen / data.length * i,
  }));

class BurndownChart extends React.Component {
  render() {
    const { sprints, stories } = this.props;

    if (sprints.length <= 1 || stories.length <= 1) return null;

    const legendData = [
      { name: 'Open', symbol: { fill: 'tomato' } },
      { name: 'Guideline', symbol: { fill: 'grey' } },
    ];
    const legendStyles = { border: { stroke: 'black' } };
    const openData = resolveData(sprints, stories);
    const openStyles = { data: { stroke: 'tomato' } };
    const maxOpen = maxBy(openData, 'open').open;
    const domainY = [0, maxOpen];
    const guidelineData = resolveGuideline(sprints, openData, maxOpen);
    const guidelineStyles = { data: { stroke: 'grey' } };

    return (
      <VictoryChart padding={70}>
        <VictoryAxis dependentAxis domain={domainY} label="Story Points" />
        <VictoryAxis label="Time" scale="time" />
        <VictoryLegend
          centerTitle
          data={legendData}
          gutter={20}
          orientation="horizontal"
          style={legendStyles}
          title="Legend"
          x={70}
        />
        <VictoryGroup>
          <VictoryLine
            data={openData}
            interpolation="step"
            style={openStyles}
            x="date"
            y="open"
          />
          <VictoryLine
            data={guidelineData}
            style={guidelineStyles}
            x="date"
            y="open"
          />
        </VictoryGroup>
      </VictoryChart>
    );
  }
}

export default BurndownChart;
