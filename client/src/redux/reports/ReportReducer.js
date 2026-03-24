import { RESET_ACCESSTOKEN, ADD_ACCESSTOKEN, RESET_INITIAL_STATE } from '../constants';

let INIT_STATE = {
    reportdetails: [],
    accesstoken: null,
    recordedtime: null,
};

function reportReducer(state = INIT_STATE, action) {
    switch (action.type) {
        case ADD_ACCESSTOKEN:

            return {
                ...state,
                accesstoken: action.payload.accesstoken,
                recordedtime: action.payload.recordedtime,
                reportdetails: action.payload.reportdetails,
            };

        case RESET_ACCESSTOKEN:
            return {
                ...state,
                accesstoken: null,
                recordedtime: null,
                reportdetails: [],
            };

        case RESET_INITIAL_STATE:
            return {
                ...INIT_STATE,
            };
        default:
            return state;
    }
}

export default reportReducer;
