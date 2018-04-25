import React from 'react';
import { Button, Icon, Menu, Tab } from 'semantic-ui-react';
import { shortDay } from '../util';
import BurndownChart from './BurndownChart';
import Table from './Table';
import TimeAgo from './TimeAgo';

const sprintColumns = [
  ['#', 'number'],
  ['Name', 'name'],
  ['Velocity', 'velocity'],
  ['Starts At', v => shortDay(v.startsAt)],
  ['Ends At', v => shortDay(v.endsAt)],
];

const storyColumns = [
  ['#', 'number'],
  ['Title', 'title'],
  ['Estimate', 'estimate'],
  ['Sprint', 'sprint'],
  ['Opened At', v => shortDay(v.openedAt)],
  ['Closed At', v => shortDay(v.closedAt)],
  ['Time Tracked', 'trackedHours'],
];

const timeEntryColumns = [
  ['Task', 'task'],
  ['User', 'user'],
  ['Hours', 'hours'],
  ['Recorded At', v => shortDay(v.recordedAt)],
  ['Reference', v => (v.reference ? `#${v.reference}` : '')],
];

const tr = (columns, rows) => () => <Table columns={columns} rows={rows} />;

class Report extends React.Component {
  render() {
    const { onRefresh, receivedAt, sprints, stories, timeEntries } = this.props;
    const panes = [
      { menuItem: 'Sprints', render: tr(sprintColumns, sprints) },
      { menuItem: 'Stories', render: tr(storyColumns, stories) },
      { menuItem: 'Time Entries', render: tr(timeEntryColumns, timeEntries) },
    ];
    const tabMenu = { pointing: true, secondary: true };

    return (
      <React.Fragment>
        <Menu secondary>
          <Menu.Item header>
            <TimeAgo date={receivedAt} />
          </Menu.Item>
          <Menu.Menu position="right">
            <Menu.Item>
              <Button icon labelPosition="right" onClick={onRefresh}>
                <Icon name="refresh" />
                Refresh
              </Button>
            </Menu.Item>
          </Menu.Menu>
        </Menu>

        <BurndownChart sprints={sprints} stories={stories} />
        <Tab menu={tabMenu} panes={panes} />
      </React.Fragment>
    );
  }
}

export default Report;
