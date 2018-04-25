import { createStore } from 'redux';
import { applyMiddlewareWithBatching } from './redux-batch';

const add = (n, meta = false) => ({ meta, payload: n, type: 'ADD' });

const noop = () => ({ type: '@@SKIP' });

const reject = () => ({ type: '@@REJECT' });

const noopMiddleware = store => next => action =>
  action.type === '@@SKIP' ? null : next(action);

const rejectMiddleware = store => next => action => {
  if (action.type === '@@REJECT') throw new Error('@@REJECT');

  return next(action);
};

const reducer = (state = 0, action) =>
  action.type === 'ADD' ? state + action.payload : state;

const configureStore = () =>
  createStore(
    reducer,
    applyMiddlewareWithBatching(noopMiddleware, rejectMiddleware),
  );

test('should dispatch multiple actions notifying subscribers once', () => {
  const listener = jest.fn();
  const store = configureStore();

  store.subscribe(listener);
  store.dispatch([add(1), add(2), add(3)]);

  expect(listener).toHaveBeenCalledTimes(1);
  expect(store.getState()).toEqual(6);
});

test('should not affect normal actions', () => {
  const listener = jest.fn();
  const store = configureStore();

  store.subscribe(listener);
  store.dispatch(add(1));
  store.dispatch(add(2));
  store.dispatch(add(3));

  expect(listener).toHaveBeenCalledTimes(3);
  expect(store.getState()).toEqual(6);
});

test('should work with other middleware', () => {
  const listener = jest.fn();
  const store = configureStore();

  store.subscribe(listener);
  store.dispatch([add(1), noop(), add(2), add(3)]);
  store.dispatch(noop());

  expect(listener).toHaveBeenCalledTimes(1);
  expect(store.getState()).toEqual(6);
});

test('should abort batching if dispatch throws', () => {
  const listener = jest.fn();
  const store = configureStore();

  store.subscribe(listener);
  expect(() => store.dispatch([add(1), add(2), reject(), add(3)])).toThrow(
    new Error('@@REJECT'),
  );

  expect(listener).toHaveBeenCalledTimes(1);
  expect(store.getState()).toEqual(3);
});
