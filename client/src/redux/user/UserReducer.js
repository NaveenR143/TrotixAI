import { ADD_USERDETAILS, RESET_INITIAL_STATE, UPDATE_USER_PROFILE, DEBIT_POINTS } from '../constants';

const INIT_STATE = {
	fullname: '', // User Name
	token: '', // User Api Token
	email: '', // User Email
	role: '', // User Role
	displayname: '', // User Display Name
	ip: '', // User Ip
	ri: '', // EsriAPI
	points: 100, // AI Credits
	mobile: '',
	userType: 'Candidate', // User Type: 'Candidate' or 'Recruiter'
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
				fullname: action.payload.fullname,
				token: action.payload.token,
				email: action.payload.email,
				role: action.payload.role,
				displayname: action.payload.displayname,
				ip: action.payload.ip,
				ri: action.payload.ri,
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
		case RESET_INITIAL_STATE:
			return {
				...INIT_STATE,
			};
		default:
			return state;
	}
}

export default UserReducer;
