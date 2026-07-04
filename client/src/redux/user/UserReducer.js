import { ADD_USERDETAILS, RESET_INITIAL_STATE, UPDATE_USER_PROFILE, DEBIT_POINTS, UPDATE_MEMBERSHIP } from '../constants';

const INIT_STATE = {
	userid: '',
	fullname: '', // User Name
	token: '', // User Api Token
	email: '', // User Email
	role: '', // User Role
	displayname: '', // User Display Name
	ip: '', // User Ip
	ri: '', // EsriAPI
	points: 0, // AI Credits
	membership: 'Free', // Membership Plan
	mobile: null,
	skills: '',
	preferredLocation: '',
	latitude: null,
	longitude: null,
	experience: '',
	website: '',
	city: '', // City from IP geolocation
	state: '', // State/Province from IP geolocation
	country: '', // Country from IP geolocation
	district: '', // District from IP geolocation
	zipcode: '', // Zipcode from IP geolocation
	hasEnhancedToday: false, // AI Usage Tracking
	hasAnalyzedToday: false,
	hasSuggestedToday: false,
	profile_viewed: true,
};

function UserReducer(state = INIT_STATE, action) {
	// Safety check for points (handles old persisted states)
	if (state && state.points === undefined) {
		state = { ...state, points: INIT_STATE.points };
	}

	switch (action.type) {
		case ADD_USERDETAILS:
			return {
				...state,
				...action.payload
			};
		case UPDATE_USER_PROFILE:
			return {
				...state,
				...action.payload
			};
		case DEBIT_POINTS:
			return {
				...state,
				points: state.points - action.payload
			};
		case UPDATE_MEMBERSHIP:
			return {
				...state,
				membership: action.payload
			};
		case RESET_INITIAL_STATE:
			return {
				...INIT_STATE,
			};
		default:
			return state;
	}
}

export default UserReducer;
