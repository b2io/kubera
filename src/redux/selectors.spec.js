import { receiveEntities } from './actions';
import reducer from './reducer';
import { reportSelector } from './selectors';

const reduceActions = (actions = [], reducer) =>
  [{ type: '@@INIT' }, ...actions].reduce(reducer, undefined);

describe('reportSelector', () => {
  test('should return empty arrays when nothing received', () => {
    const state = reduceActions([], reducer);

    const report = reportSelector(state);

    expect(report).toEqual({ sprints: [], stories: [], timeEntries: [] });
  });

  test('should include all received sprints', () => {
    const state = reduceActions(
      [receiveEntities({ sprints: [{ id: 'SP1' }, { id: 'SP2' }] })],
      reducer,
    );

    const report = reportSelector(state);

    expect(report.sprints).toEqual([
      { id: 'SP1', velocity: 0 },
      { id: 'SP2', velocity: 0 },
    ]);
  });

  test('should include the velocity for each sprint', () => {
    const state = reduceActions(
      [
        receiveEntities({
          sprints: [
            {
              endsAt: '2018-01-19T00:00:00.000-05:00',
              id: 'SP1',
              startsAt: '2018-01-15T00:00:00.000-05:00',
            },
          ],
          stories: [
            {
              closedAt: '2018-01-16T11:13:44.000-05:00',
              estimate: 8,
              id: 'ST1',
            },
            {
              closedAt: null,
              estimate: 2,
              id: 'ST2',
            },
            {
              closedAt: '2018-01-14T00:00:00.000-05:00',
              estimate: 4,
              id: 'ST3',
            },
          ],
        }),
      ],
      reducer,
    );

    const report = reportSelector(state);

    expect(report.sprints).toEqual([
      {
        endsAt: '2018-01-19T00:00:00.000-05:00',
        id: 'SP1',
        startsAt: '2018-01-15T00:00:00.000-05:00',
        velocity: 8,
      },
    ]);
  });

  test('should include all received stories', () => {
    const state = reduceActions(
      [receiveEntities({ stories: [{ id: 'ST1' }, { id: 'ST2' }] })],
      reducer,
    );

    const report = reportSelector(state);

    expect(report.stories).toEqual([
      { id: 'ST1', sprint: 'None', trackedHours: 0 },
      { id: 'ST2', sprint: 'None', trackedHours: 0 },
    ]);
  });

  test('should include the sprint associated with a story', () => {
    const state = reduceActions(
      [
        receiveEntities({
          sprints: [
            {
              endsAt: '2018-01-19T00:00:00.000-05:00',
              id: 'SP1',
              number: 1,
              startsAt: '2018-01-15T00:00:00.000-05:00',
            },
          ],
          stories: [
            {
              closedAt: '2018-01-16T11:13:44.000-05:00',
              estimate: 8,
              id: 'ST1',
            },
            {
              closedAt: null,
              estimate: 2,
              id: 'ST2',
            },
            {
              closedAt: '2018-01-14T00:00:00.000-05:00',
              estimate: 4,
              id: 'ST3',
            },
          ],
        }),
      ],
      reducer,
    );

    const report = reportSelector(state);

    expect(report.stories).toEqual([
      {
        closedAt: '2018-01-16T11:13:44.000-05:00',
        estimate: 8,
        id: 'ST1',
        sprint: 1,
        trackedHours: 0,
      },
      {
        closedAt: null,
        estimate: 2,
        id: 'ST2',
        sprint: 'None',
        trackedHours: 0,
      },
      {
        closedAt: '2018-01-14T00:00:00.000-05:00',
        estimate: 4,
        id: 'ST3',
        sprint: 'None',
        trackedHours: 0,
      },
    ]);
  });

  test('should inlcude tracked hours for each story', () => {
    const state = reduceActions(
      [
        receiveEntities({
          sprints: [
            {
              endsAt: '2018-01-19T00:00:00.000-05:00',
              id: 'SP1',
              number: 1,
              startsAt: '2018-01-15T00:00:00.000-05:00',
            },
          ],
          stories: [
            {
              closedAt: '2018-01-16T11:13:44.000-05:00',
              estimate: 8,
              id: 'ST1',
              number: 1,
            },
            {
              closedAt: null,
              estimate: 2,
              id: 'ST2',
              number: 2,
            },
            {
              closedAt: '2018-01-14T00:00:00.000-05:00',
              estimate: 4,
              id: 'ST3',
              number: 3,
            },
          ],
          timeEntries: [
            {
              hours: 0.25,
              reference: '1'
            },
            {
              hours: 0.5,
              reference: '2'
            },
          ]
        }),
      ],
      reducer,
    );

    const report = reportSelector(state);

    expect(report.stories).toEqual([
      {
        closedAt: '2018-01-16T11:13:44.000-05:00',
        estimate: 8,
        id: 'ST1',
        number: 1,
        sprint: 1,
        trackedHours: 0.25,
      },
      {
        closedAt: null,
        estimate: 2,
        id: 'ST2',
        number: 2,
        sprint: 'None',
        trackedHours: 0.5,
      },
      {
        closedAt: '2018-01-14T00:00:00.000-05:00',
        estimate: 4,
        id: 'ST3',
        number: 3,
        sprint: 'None',
        trackedHours: 0,
      },
    ]);
  });

  test('should include all received time-entries', () => {
    const state = reduceActions(
      [receiveEntities({ timeEntries: [{ id: 'TE1' }, { id: 'TE2' }] })],
      reducer,
    );

    const report = reportSelector(state);

    expect(report.timeEntries).toEqual([{ id: 'TE1' }, { id: 'TE2' }]);
  });
});
