import { SEARCHING } from "../constants";

let INIT_STATE = {
  searching: false,
};

function SearchingReducer(state = INIT_STATE, action) {
  switch (action.type) {
    case SEARCHING:
      return {
        ...state,
        searching: action.payload,
      };

    default:
      return state;
  }
}

export default SearchingReducer;
