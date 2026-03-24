import { ADD_RECENTSEARCH, SET_RECENTSEARCHES } from "../constants";

let INIT_STATE = {
  recentsearches: [],
};

function RecentSearchesReducer(state = INIT_STATE, action) {
  switch (action.type) {
    case ADD_RECENTSEARCH:
      const searchTerm = action.payload;

      // Remove existing occurrence of the search term
      const filteredSearches = state.recentsearches.filter(
        (term) => term !== searchTerm
      );

      // Add the new term at the beginning
      return {
        ...state,
        recentsearches: [searchTerm, ...filteredSearches],
      };

    case SET_RECENTSEARCHES:
      return {
        ...state,
        recentsearches: action.payload, // directly set array from DB
      };
    default:
      return state;
  }
}

export default RecentSearchesReducer;
