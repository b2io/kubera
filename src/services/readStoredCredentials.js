import { credentialsSelector, getStoredState } from '../redux';

const readStoredCredentials = () => credentialsSelector(getStoredState());

export default readStoredCredentials;