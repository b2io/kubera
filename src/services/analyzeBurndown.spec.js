import { format, parse } from 'date-fns';
import analyzeBurndown from './analyzeBurndown';

test('flags an error when no sprints are sent', () => {
  const analysis = analyzeBurndown([], [], format('2018-01-16'));

  expect(analysis).toEqual({ data: null, error: 'No sprints.' });
});

test('flags an error when no stories are sent', () => {
  const sprints = [
    {
      endsAt: format('2018-01-12'),
      id: 1,
      name: 'Sprint 1',
      number: 1,
      startsAt: format('2018-01-01'),
    },
  ];
  const analysis = analyzeBurndown(sprints, [], format('2018-01-16'));

  expect(analysis).toEqual({ data: null, error: 'No stories.' });
});

test('flags an error when no stories have been closed', () => {
  const sprints = [
    {
      endsAt: format('2018-01-12'),
      id: 1,
      name: 'Sprint 1',
      number: 1,
      startsAt: format('2018-01-01'),
    },
  ];
  const stories = [
    {
      closedAt: null,
      estimate: 2,
      id: 1,
      number: 1,
      openedAt: format('2017-12-29'),
      title: '#1: Open Issue',
    },
  ];
  const analysis = analyzeBurndown(sprints, stories, format('2018-01-16'));

  expect(analysis).toEqual({ data: null, error: 'No velocity.' });
});

test('flags an error when sprints overlap', () => {
  const sprints = [
    {
      endsAt: format('2018-01-12'),
      id: 1,
      name: 'Sprint 1',
      number: 1,
      startsAt: format('2018-01-01'),
    },
    {
      endsAt: format('2018-01-19'),
      id: 2,
      name: 'Sprint 2',
      number: 2,
      startsAt: format('2018-01-08'),
    },
  ];
  const stories = [
    {
      closedAt: format('2018-01-05'),
      estimate: 5,
      id: 2,
      number: 2,
      openedAt: format('2017-12-29'),
      title: '#2: Closed Issue',
    },
  ];

  const analysis = analyzeBurndown(sprints, stories, format('2018-01-16'));

  expect(analysis).toEqual({ data: null, error: 'Overlapping sprints.' });
});

test('analyzes a project', () => {
  const sprints = [
    {
      endsAt: format('2018-01-12'),
      id: 1,
      name: 'Sprint 1',
      number: 1,
      startsAt: format('2018-01-01'),
    },
    {
      endsAt: format('2018-01-26'),
      id: 2,
      name: 'Sprint 2',
      number: 2,
      startsAt: format('2018-01-15'),
    },
  ];
  const stories = [
    {
      closedAt: null,
      estimate: 2,
      id: 1,
      number: 1,
      openedAt: format('2017-12-29'),
      title: '#1: Open Issue',
    },
    {
      closedAt: format('2018-01-05'),
      estimate: 5,
      id: 2,
      number: 2,
      openedAt: format('2017-12-29'),
      title: '#2: Closed Issue',
    },
  ];
  const analysis = analyzeBurndown(sprints, stories, format('2018-01-16'));

  expect(analysis).toEqual({
    data: [
      { date: parse('2018-01-01'), open: 7, total: 7, type: 'actual' },
      { date: parse('2018-01-12'), open: 2, total: 7, type: 'actual' },
      { date: parse('2018-01-26'), open: 2, total: 7, type: 'planned' },
    ],
    error: null,
  });
});
