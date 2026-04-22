import { 
  FETCH_PROFILE_REQUEST, 
  FETCH_PROFILE_SUCCESS, 
  FETCH_PROFILE_FAILURE,
  UPDATE_PROFILE_DATA,
  RESET_INITIAL_STATE
} from "../constants";

const INIT_STATE = {
  loading: false,
  error: null,
  // Detailed profile structure as requested
  data: {
    personalDetails: {
      fullName: "",
      email: "",
      phone: "",
      website: "",
      summary: "",
      location: "",
      headline: ""
    },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    languages: []
  }
};

function ProfileReducer(state = INIT_STATE, action) {
  switch (action.type) {
    case FETCH_PROFILE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case FETCH_PROFILE_SUCCESS:
      return {
        ...state,
        loading: false,
        data: {
          ...state.data,
          ...action.payload
        },
        error: null
      };

    case FETCH_PROFILE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    case UPDATE_PROFILE_DATA:
      return {
        ...state,
        data: {
          ...state.data,
          ...action.payload
        }
      };

    case RESET_INITIAL_STATE:
      return INIT_STATE;

    default:
      return state;
  }
}

export default ProfileReducer;
