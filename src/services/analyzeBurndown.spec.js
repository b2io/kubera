import { format, parse } from 'date-fns';
import analyzeBurndown from './analyzeBurndown';

const buildSprint = (number, startsAt, endsAt) => ({
  number,
  endsAt: format(endsAt),
  id: number,
  name: `Sprint ${number}`,
  startsAt: format(startsAt),
});

const buildStory = (number, estimate, openedAt, closedAt) => ({
  estimate,
  number,
  closedAt: closedAt ? format(closedAt) : null,
  openedAt: format(openedAt),
  title: `#${number}: ${closedAt ? 'Closed' : 'Open'}`,
});

const buildData = (date, open, closed, type) => ({
  closed,
  open,
  type,
  date: parse(date),
  total: closed + open,
});

test('flags an error when no sprints are sent', () => {
  const sprints = [];
  const stories = [buildStory(1, 2, '2017-12-29', null)];
  const asOf = format('2018-01-16');

  const analysis = analyzeBurndown(sprints, stories, asOf);

  expect(analysis).toEqual({ data: null, error: 'No sprints.' });
});

test('flags an error when no stories are sent', () => {
  const sprints = [buildSprint(1, '2018-01-01', '2018-01-12')];
  const stories = [];
  const asOf = format('2018-01-16');

  const analysis = analyzeBurndown(sprints, stories, asOf);

  expect(analysis).toEqual({ data: null, error: 'No stories.' });
});

test('flags an error when no stories have been closed', () => {
  const sprints = [buildSprint(1, '2018-01-01', '2018-01-12')];
  const stories = [buildStory(1, 2, '2017-12-29', null)];
  const asOf = format('2018-01-16');

  const analysis = analyzeBurndown(sprints, stories, asOf);

  expect(analysis).toEqual({ data: null, error: 'No velocity.' });
});

test('flags an error when sprints overlap', () => {
  const sprints = [
    buildSprint(1, '2018-01-01', '2018-01-12'),
    buildSprint(2, '2018-01-08', '2018-01-19'),
  ];
  const stories = [buildStory(1, 2, '2017-12-29', '2018-01-05')];
  const asOf = format('2018-01-16');

  const analysis = analyzeBurndown(sprints, stories, asOf);

  expect(analysis).toEqual({ data: null, error: 'Overlapping sprints.' });
});

test('analyzes a completed on-target project', () => {
  const sprints = [buildSprint(1, '2018-01-01', '2018-01-12')];
  const stories = [buildStory(1, 5, '2017-12-29', '2018-01-05')];
  const asOf = format('2018-01-16');

  const analysis = analyzeBurndown(sprints, stories, asOf);

  expect(analysis).toEqual({
    data: [
      buildData('2018-01-01', 5, 0, 'actual'),
      buildData('2018-01-12', 0, 5, 'actual'),
    ],
    error: null,
  });
});

test('analyzes a planned on-target project', () => {
  const sprints = [
    buildSprint(1, '2018-01-01', '2018-01-12'),
    buildSprint(2, '2018-01-15', '2018-01-26'),
    buildSprint(3, '2018-01-29', '2018-02-09'),
  ];
  const stories = [
    buildStory(1, 5, '2017-12-29', '2018-01-05'),
    buildStory(2, 2, '2017-12-29', null),
  ];
  const asOf = format('2018-01-16');

  const analysis = analyzeBurndown(sprints, stories, asOf);

  expect(analysis).toEqual({
    data: [
      buildData('2018-01-01', 7, 0, 'actual'),
      buildData('2018-01-12', 2, 5, 'actual'),
      buildData('2018-01-26', 0, 7, 'planned'),
      buildData('2018-02-09', 0, 7, 'planned'),
    ],
    error: null,
  });
});

test('handle stories that close in the gap between sprints', () => {
  const sprints = [
    buildSprint(1, '2018-01-01', '2018-01-12'),
    buildSprint(2, '2018-01-15', '2018-01-26'),
  ];
  const stories = [
    buildStory(1, 5, '2017-12-29', '2018-01-05'),
    buildStory(2, 2, '2017-12-29', '2018-01-14'),
  ];
  const asOf = format('2018-01-30');

  const analysis = analyzeBurndown(sprints, stories, asOf);

  expect(analysis).toEqual({
    data: [
      buildData('2018-01-01', 7, 0, 'actual'),
      buildData('2018-01-12', 2, 5, 'actual'),
      buildData('2018-01-26', 0, 7, 'actual'),
    ],
    error: null,
  });
});

test('handle stories closed before the first sprint', () => {
  const sprints = [buildSprint(1, '2018-01-01', '2018-01-12')];
  const stories = [buildStory(1, 5, '2017-12-29', '2017-12-29')];
  const asOf = format('2018-01-13');

  const analysis = analyzeBurndown(sprints, stories, asOf);

  expect(analysis).toEqual({
    data: [
      buildData('2018-01-01', 0, 5, 'actual'),
      buildData('2018-01-12', 0, 5, 'actual'),
    ],
    error: null,
  });
});

test('analyzes an planned off-target project', () => {
  const sprints = [
    buildSprint(1, '2018-01-01', '2018-01-12'),
    buildSprint(2, '2018-01-15', '2018-01-26'),
  ];
  const stories = [
    buildStory(1, 5, '2017-12-29', null),
    buildStory(2, 3, '2017-12-29', '2018-01-10'),
    buildStory(3, 2, '2017-12-29', null),
  ];
  const asOf = format('2018-01-16');

  const analysis = analyzeBurndown(sprints, stories, asOf);

  expect(analysis).toEqual({
    data: [
      buildData('2018-01-01', 10, 0, 'actual'),
      buildData('2018-01-12', 7, 3, 'actual'),
      buildData('2018-01-26', 4, 6, 'planned'),
      buildData('2018-02-09', 1, 9, 'projected'),
      buildData('2018-02-23', 0, 10, 'projected'),
    ],
    error: null,
  });
});

test('analyzes a actual off-target project');
