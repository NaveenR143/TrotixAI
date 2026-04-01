import { ADD_USERDETAILS, UPDATE_USER_PROFILE, DEBIT_POINTS } from '../constants';

export const addUserDetails = (payload) => ({
  type: ADD_USERDETAILS,
  payload,
});

export const updateUserProfile = (payload) => ({
  type: UPDATE_USER_PROFILE,
  payload,
});

export const setUserType = (userType) => ({
  type: UPDATE_USER_PROFILE,
  payload: { userType },
});

export const debitPoints = (points) => ({
  type: DEBIT_POINTS,
  payload: points,
});

