import dateFns from 'date-fns';
import _ from 'lodash';

const roundUpToNearest = (n, toValue) => Math.ceil(n / toValue) * toValue;

const valueBy = (comparator, array, path, defaultValue) =>
  _.get(comparator(array, path), path, defaultValue);

const minValueBy = (...args) => valueBy(_.minBy, ...args);

const maxValueBy = (...args) => valueBy(_.maxBy, ...args);

const isBeforeOrEqual = (date, dateToCompare) =>
  dateFns.isBefore(date, dateToCompare) || dateFns.isEqual(date, dateToCompare);

const afterParam = value => (value ? `, after: "${value}"` : '');

const someHasNextPage = (res, paths) =>
  paths.some(path => _.get(res.data, [path, 'pageInfo.hasNextPage'].join('.')));

const resolveCursors = (res, paths) =>
  paths.map(path => _.get(res.data, [path, 'pageInfo.endCursor'].join('.')));

const concatMerge = (object, other) =>
  _.mergeWith(
    object,
    other,
    (objectValue, sourceValue) =>
      _.isArray(objectValue) ? objectValue.concat(sourceValue) : undefined,
  );

export {
  afterParam,
  concatMerge,
  isBeforeOrEqual,
  maxValueBy,
  minValueBy,
  resolveCursors,
  roundUpToNearest,
  someHasNextPage,
};
