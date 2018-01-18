import { format } from 'date-fns';
import { cond, constant, first, last } from 'lodash';
import React from 'react';
import {
  VictoryAxis,
  VictoryChart,
  VictoryLine,
  VictoryScatter,
} from 'victory';
import analyzeBurndown from '../services/analyzeBurndown';
import Alert from './Alert';

const lineStyles = (color, dashed) => ({
  data: { stroke: color, strokeDasharray: dashed ? '4, 2' : null },
});

const scatterStyles = (color, solid) => ({
  data: { fill: solid ? color : 'white', stroke: color, strokeWidth: 1 },
});

const hasDateInData = data => t => data.some(d => d.date === t);

class BurndownChart extends React.Component {
  static defaultProps = {
    asOf: format(Date.now()),
    sprints: [],
    stories: [],
  };

  render() {
    const { asOf, sprints, stories } = this.props;
    const { data, error } = analyzeBurndown(sprints, stories, asOf);

    if (error) {
      return <Alert>{error}</Alert>;
    }

    const actualData = data.filter(d => d.type === 'actual');
    const plannedData = data.filter(d => d.type === 'planned');
    const projectedData = data.filter(d => d.type === 'projected');
    const nonProjectedData = actualData.concat(plannedData);
    const { date: startDate } = first(data);
    const { date: endDate, total: maxTotal } = last(data);
    const domainX = [startDate, endDate];
    const domainY = [0, maxTotal];
    const ticksX = {
      format: d => data.findIndex(data => data.date === d),
      values: data.map(d => d.date),
    };
    const stylesX = {
      tickLabels: {
        fill: cond([
          [hasDateInData(projectedData), constant('silver')],
          [hasDateInData(plannedData), constant('lightSlateGray')],
          [hasDateInData(actualData), constant('darkSlateGray')],
        ]),
      },
      grid: { stroke: 'gainsboro' },
    };

    return (
      <VictoryChart>
        <VictoryAxis
          domain={domainX}
          scale="time"
          style={stylesX}
          tickFormat={ticksX.format}
          tickValues={ticksX.values}
        />
        <VictoryAxis dependentAxis domain={domainY} />
        <VictoryLine
          data={data}
          style={lineStyles('gray')}
          x="date"
          y="total"
        />
        <VictoryLine
          data={data}
          style={lineStyles('silver', true)}
          x="date"
          y="open"
        />
        <VictoryScatter
          data={data}
          style={scatterStyles('silver')}
          x="date"
          y="open"
        />
        <VictoryLine
          data={nonProjectedData}
          style={lineStyles('lightSlateGray', true)}
          x="date"
          y="open"
        />
        <VictoryScatter
          data={nonProjectedData}
          style={scatterStyles('lightSlateGray')}
          x="date"
          y="open"
        />
        <VictoryLine
          data={actualData}
          style={lineStyles('darkSlateGray')}
          x="date"
          y="open"
        />
        <VictoryScatter
          data={actualData}
          style={scatterStyles('darkSlateGray', true)}
          x="date"
          y="open"
        />
      </VictoryChart>
    );
  }
}

export default BurndownChart;
