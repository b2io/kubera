import { format, max, startOfDay } from 'date-fns';
import { first, last, sortBy } from 'lodash';
import React from 'react';
import {
  VictoryAxis,
  VictoryChart,
  VictoryLine,
  VictoryScatter,
} from 'victory';
import analyzeBurndown from '../services/analyzeBurndown';
import Alert from './Alert';

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

    const plannedData = data.filter(
      d => d.type === 'actual' || d.type === 'planned',
    );
    const projectedData = data.filter(d => d.type === 'projected');
    const asOfDate = startOfDay(asOf);

    // Chart Styles:

    const domainX = [first(data).date, max(asOfDate, last(data).date)];
    const domainY = [0, last(data).total];
    const ticksX = {
      format: d => {
        if ([asOfDate, first(data).date].includes(d)) return '';

        return data.findIndex(data => data.date === d);
      },
      values: sortBy([...data.map(d => d.date), asOfDate]),
    };

    const stylesX = {
      tickLabels: {
        fill: t => (projectedData.some(d => d.date === t) ? 'grey' : 'inherit'),
      },
      grid: {
        stroke: 'grey',
        strokeDasharray: t => (t === asOfDate ? '5, 5' : '0'),
      },
    };

    console.table(data);

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
          style={{ data: { stroke: 'lightGrey', strokeDasharray: '5, 5' } }}
          x="date"
          y="open"
        />
        <VictoryLine
          data={data}
          style={{ data: { stroke: 'grey' } }}
          x="date"
          y="total"
        />
        <VictoryScatter
          data={data}
          style={{ data: { fill: 'white', stroke: 'grey', strokeWidth: 1 } }}
          x="date"
          y="total"
        />
        <VictoryLine
          data={plannedData}
          style={{ data: { stroke: 'black' } }}
          x="date"
          y="open"
        />
        <VictoryScatter
          data={plannedData}
          style={{ data: { fill: 'black', stroke: 'black', strokeWidth: 1 } }}
          x="date"
          y="open"
        />
      </VictoryChart>
    );
  }
}

export default BurndownChart;
