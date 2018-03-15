import { createAction } from 'redux-actions';

const receiveEntities = createAction(
  'kubera/receiveEntities',
  entities => entities,
);

const setActiveStep = createAction(
  'kubera/setActiveStep',
  (number, shouldForce = false) => ({ number, shouldForce }),
);

const setConfiguration = createAction(
  'kubera/setConfiguration',
  configuration => configuration,
);

const setCredentials = createAction(
  'kubera/setCredentials',
  credentials => credentials,
);

const setError = createAction('kubera/setError', error => error);

const setLoading = createAction('kubera/setLoading', isLoading => isLoading);

export {
  receiveEntities,
  setActiveStep,
  setConfiguration,
  setCredentials,
  setError,
  setLoading,
};
