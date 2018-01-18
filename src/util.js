import { isBefore, isEqual, isWeekend, startOfDay } from 'date-fns';
import {
  get,
  isArray,
  maxBy,
  mergeWith,
  minBy,
  negate,
  overSome,
  rearg,
} from 'lodash';

const roundUpToNearest = (n, toValue) => Math.ceil(n / toValue) * toValue;

const valueBy = (comparator, array, path, defaultValue) =>
  get(comparator(array, path), path, defaultValue);

const minValueBy = (...args) => valueBy(minBy, ...args);

const maxValueBy = (...args) => valueBy(maxBy, ...args);

const afterParam = value => (value ? `, after: "${value}"` : '');

const someHasNextPage = (res, paths) =>
  paths.some(path => get(res.data, [path, 'pageInfo.hasNextPage'].join('.')));

const resolveCursors = (res, paths) =>
  paths.map(path => get(res.data, [path, 'pageInfo.endCursor'].join('.')));

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

const isWeekday = negate(isWeekend);

export {
  afterParam,
  concatMerge,
  isAfterDay,
  isBeforeDay,
  isBeforeOrEqualDay,
  isEqualDay,
  isWeekday,
  maxValueBy,
  minValueBy,
  resolveCursors,
  roundUpToNearest,
  someHasNextPage,
};
