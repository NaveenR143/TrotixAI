import { LOADING_SPINNER } from '../constants';

export const displaySpinner = (payload) => ({
  type: LOADING_SPINNER,
  payload,
});

