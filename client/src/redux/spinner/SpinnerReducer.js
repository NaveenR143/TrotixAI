import { LOADING_SPINNER } from "../constants";

let INIT_STATE = {
  loading: false,
};

function SpinnerReducer(state = INIT_STATE, action) {
  switch (action.type) {
    case LOADING_SPINNER:
      return {
        ...state,
        loading: action.payload,
      };

    default:
      return state;
  }
}

export default SpinnerReducer;
