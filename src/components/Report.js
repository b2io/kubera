import React from 'react';
import { Tab } from 'semantic-ui-react';
import { shortDay } from '../util';
import BurndownChart from './BurndownChart';
import Table from './Table';

const sprintsColumns = [
  ['#', 'number'],
  ['Name', 'name'],
  ['Starts At', v => shortDay(v.startsAt)],
  ['Ends At', v => shortDay(v.endsAt)],
];

const storiesColumns = [
  ['#', 'number'],
  ['Title', 'title'],
  ['Estimate', 'estimate'],
  ['Opened At', v => shortDay(v.openedAt)],
  ['Closed At', v => shortDay(v.closedAt)],
];

const timeEntriesColumns = [
  ['Task', 'task'],
  ['User', 'user'],
  ['Hours', 'hours'],
  ['Recorded At', v => shortDay(v.recordedAt)],
  ['Reference', v => (v.reference ? `#${v.reference}` : '')],
];

const tableRenderer = (columns, rows) => () => (
  <Table columns={columns} rows={rows} />
);

class Report extends React.Component {
  render() {
    const { sprints, stories, timeEntries } = this.props;
    const panes = [
      {
        menuItem: 'Sprints',
        render: tableRenderer(sprintsColumns, sprints),
      },
      {
        menuItem: 'Stories',
        render: tableRenderer(storiesColumns, stories),
      },
      {
        menuItem: 'Time Entries',
        render: tableRenderer(timeEntriesColumns, timeEntries),
      },
    ];
    const tabMenu = { pointing: true, secondary: true };

    return (
      <React.Fragment>
        <BurndownChart sprints={sprints} stories={stories} />
        <Tab menu={tabMenu} panes={panes} />
      </React.Fragment>
    );
  }
}

export default Report;
