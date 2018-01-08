import React from 'react';
import Table from './Table';

class Report extends React.Component {
  render() {
    const { sprints, stories, timeEntries } = this.props;

    return (
      <section>
        <h2>Report</h2>
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
          ]}
          rows={timeEntries}
        />
      </section>
    );
  }
}

export default Report;
