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

test('analyzes a completed on-target project', () => {
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
      closedAt: format('2018-01-05'),
      estimate: 5,
      id: 1,
      number: 1,
      openedAt: format('2017-12-29'),
      title: '#1: Closed',
    },
  ];

  const analysis = analyzeBurndown(sprints, stories, format('2018-01-16'));

  expect(analysis).toEqual({
    data: [
      { closed: 0, date: parse('2018-01-01'), open: 5, total: 5, type: 'actual' },
      { closed: 5, date: parse('2018-01-12'), open: 0, total: 5, type: 'actual' },
    ],
    error: null,
  });
});

test('analyzes a planned on-target project', () => {
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
    {
      endsAt: format('2018-02-09'),
      id: 3,
      name: 'Sprint 3',
      number: 3,
      startsAt: format('2018-01-29'),
    },
  ];
  const stories = [
    {
      closedAt: format('2018-01-05'),
      estimate: 5,
      id: 1,
      number: 1,
      openedAt: format('2017-12-29'),
      title: '#1: Closed',
    },
    {
      closedAt: null,
      estimate: 2,
      id: 2,
      number: 2,
      openedAt: format('2017-12-29'),
      title: '#2: Open',
    },
  ];

  const analysis = analyzeBurndown(sprints, stories, format('2018-01-16'));

  expect(analysis).toEqual({
    data: [
      { closed: 0, date: parse('2018-01-01'), open: 7, total: 7, type: 'actual' },
      { closed: 5, date: parse('2018-01-12'), open: 2, total: 7, type: 'actual' },
      { closed: 7, date: parse('2018-01-26'), open: 0, total: 7, type: 'planned' },
      { closed: 7, date: parse('2018-02-09'), open: 0, total: 7, type: 'planned' },
    ],
    error: null,
  })
});

test('analyzes an actual off-target project');
test('analyzes a planned off-target project');
test('handle stories closed before the first sprint');
test('handle stories that close in the gap between sprints');
