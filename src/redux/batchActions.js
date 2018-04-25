import { applyMiddleware, compose } from 'redux';

const applyMiddlewareWithBatching = (...middleware) => {
  let isBatching = false;
  let handleBatch = () => {
    throw new Error('Dispatching during store creation is not allowed.');
  };

  const ReduxBatch = store => next => action => {
    if (Array.isArray(action)) {
      return handleBatch(action);
    }

    return next(action);
  };

  const enableBatching = () => createStore => (...args) => {
    const store = createStore(...args);
    const origSubscribe = store.subscribe;

    handleBatch = batchedActions => {
      try {
        isBatching = true;
        batchedActions.forEach((action, index) => {
          isBatching = index !== batchedActions.length - 1;

          store.dispatch(action);
        });
      } finally {
        isBatching = false;
      }
    };

    const subscribe = listener =>
      origSubscribe(() => {
        if (isBatching) return;

        listener();
      });

    return { ...store, subscribe };
  };

  return compose(enableBatching(), applyMiddleware(ReduxBatch, ...middleware));
};

export { applyMiddlewareWithBatching };
