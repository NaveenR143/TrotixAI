import { SEARCHING } from "../constants";

export const displaySearching = (payload) => ({
  type: SEARCHING,
  payload,
});
