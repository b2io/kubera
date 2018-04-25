import { applyMiddleware, compose } from 'redux';

const applyMiddlewareWithBatching = (...otherMiddleware) => {
  let isBatching = false;
  let handleBatch = () => {
    throw new Error('Dispatching during store creation is not allowed.');
  };

  const middleware = store => next => action =>
    Array.isArray(action) ? handleBatch(action) : next(action);

  const enhancer = createStore => (...args) => {
    const store = createStore(...args);
    const origSubscribe = store.subscribe;

    handleBatch = batchedActions => {
      try {
        isBatching = true;
        batchedActions.forEach((action, index) => {
          isBatching = index !== batchedActions.length - 1;

          store.dispatch(action);
        });
      } catch (error) {
        isBatching = false;
        store.dispatch({ type: '@@BATCH_FAILED' });

        throw error;
      }
    };

    const subscribe = listener =>
      origSubscribe(() => {
        if (!isBatching) listener();
      });

    return { ...store, subscribe };
  };

  return compose(enhancer, applyMiddleware(middleware, ...otherMiddleware));
};

export { applyMiddlewareWithBatching };
