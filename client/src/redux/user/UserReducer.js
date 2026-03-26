import { ADD_USERDETAILS, RESET_INITIAL_STATE, UPDATE_USER_PROFILE, DEBIT_POINTS } from '../constants';

const INIT_STATE = {
	username: '', // User Name
	token: '', // User Api Token
	useremail: '', // User Email
	usercode: '', // User Code
	userrole: '', // User Role
	displayname: '', // User Display Name
	ip: '', // User Ip
	ri:'', // EsriAPI
	points: 100, // AI Credits
	mobile: '',
	skills: '',
	preferredLocation: '',
	latitude: null,
	longitude: null,
	experience: '',
	website: ''
};

function UserReducer(state = INIT_STATE, action) {
	switch (action.type) {
		case ADD_USERDETAILS:
			return {
				...state,
				username: action.payload.username,
				token: action.payload.token,
				usercode: action.payload.usercode,
				userrole: action.payload.userrole,
				useremail: action.payload.useremail,
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
