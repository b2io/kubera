import React from 'react';
import BurndownChart from './BurndownChart';
import Table from './Table';

class Report extends React.Component {
  render() {
    const { sprints, stories, timeEntries } = this.props;

    return (
      <section>
        <h2>Report</h2>
        <h3>Burndown</h3>
        <BurndownChart sprints={sprints} stories={stories} />
        <h3>Sprints</h3>
        <Table
          columns={[
            ['Name', 'name'],
            ['Number', 'number'],
            ['Starts At', 'startsAt'],
            ['Ends At', 'endsAt'],
          ]}
          rows={sprints}
        />
        <h3>Stories</h3>
        <Table
          columns={[
            ['Number', v => `#${v.number}`],
            ['Title', 'title'],
            ['Estimate', 'estimate'],
            ['Opened At', 'openedAt'],
            ['Closed At', 'closedAt'],
          ]}
          rows={stories}
        />
        <h3>Time Entries</h3>
        <Table
          columns={[
            ['Task', 'task'],
            ['User', 'user'],
            ['Hours', 'hours'],
            ['Recorded At', 'recordedAt'],
            ['Reference', v => v.reference ? `#${v.reference}` : ''],
          ]}
          rows={timeEntries}
        />
      </section>
    );
  }
}

export default Report;
