import { ADD_ADVANCEDSEARCHDETAILS, SET_SEARCHTABPOSITION, SET_CURRENTSEARCHSAVED, QUICKSEARCH_RESET, RESET_INITIAL_STATE, ADD_SEARCHSTACKQUERY, REMOVE_SEARCHSTACKQUERY } from '../constants';

let INIT_STATE = {
    searchoption: '',
    searchvalues: [],
    tabposition: '',
    currentsearchname: '',
    searchstackquery: {}
};

function QuickSearchReducer(state = INIT_STATE, action) {
    switch (action.type) {
        case ADD_ADVANCEDSEARCHDETAILS:
            state.searchoption = action.payload.searchoption;
            state.searchvalues = action.payload.searchvalues;
            return state;
        case SET_SEARCHTABPOSITION:
            state.tabposition = action.payload.tabposition;
            return state;
        case SET_CURRENTSEARCHSAVED:
            state.currentsearchname = action.payload.currentsearchname;
            return state;
        case ADD_SEARCHSTACKQUERY:
            state.searchstackquery = action.payload.searchstackquery;
            return state;
        case REMOVE_SEARCHSTACKQUERY:
            state.searchstackquery = {};
            return state;
        case QUICKSEARCH_RESET:
            state = {
                searchoption: '',
                searchvalues: [],
                tabposition: '',
                currentsearchname: '',
                searchstackquery: {}
            };
            return state;
        case RESET_INITIAL_STATE:
            return {
                ...INIT_STATE,
            };
        default:
            return state;
    }
}

export default QuickSearchReducer;
