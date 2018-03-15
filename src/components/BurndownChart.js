import { format } from 'date-fns';
import { cond, constant, first, last } from 'lodash';
import React from 'react';
import { Message } from 'semantic-ui-react';
import VictoryAxis from 'victory-chart/es/components/victory-axis/victory-axis';
import VictoryChart from 'victory-chart/es/components/victory-chart/victory-chart';
import VictoryLine from 'victory-chart/es/components/victory-line/victory-line';
import VictoryScatter from 'victory-chart/es/components/victory-scatter/victory-scatter';
import VictoryTooltip from 'victory-core/es/victory-tooltip/victory-tooltip';
import analyzeBurndown from '../services/analyzeBurndown';
import { shortDay } from '../util';

const lineStyles = (color, dashed) => ({
  data: { stroke: color, strokeDasharray: dashed ? '4, 2' : null },
});

const scatterStyles = (color, solid) => ({
  data: { fill: solid ? color : 'white', stroke: color, strokeWidth: 1 },
});

const scatterLabel = d =>
  [`${shortDay(d.date)}:`, `${d.open} open`, `${d.closed} closed`].join('\n');

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
      return (
        <Message negative>
          <Message.Header>{error}</Message.Header>
        </Message>
      );
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
      format: d => data.findIndex(data => data.date === d) || '',
      values: data.map(d => d.date),
    };
    const stylesX = {
      axisLabel: { padding: 30 },
      grid: { stroke: 'gainsboro' },
      tickLabels: {
        fill: cond([
          [hasDateInData(projectedData), constant('silver')],
          [hasDateInData(plannedData), constant('lightSlateGray')],
          [hasDateInData(actualData), constant('darkSlateGray')],
        ]),
      },
    };
    const stylesY = {
      axisLabel: { padding: 40 },
      grid: { stroke: 'gainsboro' },
    };
    const chartProps = {
      domainPadding: { y: 1 },
      padding: { bottom: 45, left: 55, right: 10, top: 10 },
    };

    return (
      <React.Fragment>
        <VictoryChart {...chartProps}>
          <VictoryAxis
            domain={domainX}
            label="Sprint #"
            scale="time"
            style={stylesX}
            tickFormat={ticksX.format}
            tickValues={ticksX.values}
          />
          <VictoryAxis
            dependentAxis
            domain={domainY}
            label="Story Points"
            style={stylesY}
          />
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
            labelComponent={<VictoryTooltip />}
            labels={scatterLabel}
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
            labelComponent={<VictoryTooltip />}
            labels={scatterLabel}
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
            labelComponent={<VictoryTooltip />}
            labels={scatterLabel}
            style={scatterStyles('darkSlateGray', true)}
            x="date"
            y="open"
          />
        </VictoryChart>
      </React.Fragment>
    );
  }
}

export default BurndownChart;
