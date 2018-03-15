import {
  format,
  isBefore,
  isEqual,
  isWeekend,
  isWithinRange,
  startOfDay,
} from 'date-fns';
import {
  get,
  isArray,
  isNil,
  maxBy,
  mergeWith,
  minBy,
  negate,
  overSome,
  rearg,
  zip,
} from 'lodash';

const roundUpToNearest = (n, toValue) => Math.ceil(n / toValue) * toValue;

const valueBy = (comparator, array, path, defaultValue) =>
  get(comparator(array, path), path, defaultValue);

const minValueBy = (...args) => valueBy(minBy, ...args);

const maxValueBy = (...args) => valueBy(maxBy, ...args);

const pageableQuery = (hasMore, cursor) => (strings, ...values) =>
  hasMore
    ? zip(strings, values)
        .join('')
        .replace(
          ', after: $cursor',
          isNil(cursor) ? '' : `, after: "${cursor}"`,
        )
    : '';

const someHasNextPage = (res, paths) =>
  paths.some(path => get(res.data, [path, 'pageInfo.hasNextPage'].join('.')));

const resolveCursors = (res, paths) =>
  paths.map(path => [
    get(res.data, [path, 'pageInfo.hasNextPage'].join('.'), false),
    get(res.data, [path, 'pageInfo.endCursor'].join('.'), null),
  ]);

const concatMerge = (object, other) =>
  mergeWith(
    object,
    other,
    (objectValue, sourceValue) =>
      isArray(objectValue) ? objectValue.concat(sourceValue) : undefined,
  );

const alignToDay = f => (...dates) => f(...dates.map(startOfDay));

const isBeforeDay = alignToDay(isBefore);

const isAfterDay = rearg(isBeforeDay, [1, 0]);

const isEqualDay = alignToDay(isEqual);

const isBeforeOrEqualDay = overSome(isBeforeDay, isEqualDay);

const isWithinDayRange = alignToDay(isWithinRange);

const isWeekday = negate(isWeekend);

const shortDay = d => isNil(d) ? '' : format(d, 'YYYY-MM-DD');

export {
  concatMerge,
  isAfterDay,
  isBeforeDay,
  isBeforeOrEqualDay,
  isEqualDay,
  isWeekday,
  isWithinDayRange,
  maxValueBy,
  minValueBy,
  pageableQuery,
  resolveCursors,
  roundUpToNearest,
  shortDay,
  someHasNextPage,
};
