import { ADD_USERDETAILS, RESET_INITIAL_STATE } from '../constants';

const INIT_STATE = {
	username: '', // User Name
	token: '', // User Api Token
	useremail: '', // User Email
	usercode: '', // User Code
	userrole: '', // User Role
	displayname: '', // User Display Name
	ip: '', // User Ip
	ri:''// EsriAPI

};

function UserReducer(state = INIT_STATE, action) {
	switch (action.type) {
		case ADD_USERDETAILS:

			state.username = action.payload.username;
			state.token = action.payload.token;
			state.usercode = action.payload.usercode;
			state.userrole = action.payload.userrole;
			state.useremail = action.payload.useremail;
			state.displayname = action.payload.displayname;
			state.ip = action.payload.ip;
			state.ri = action.payload.ri;
			return state;
		case RESET_INITIAL_STATE:
			return {
				...INIT_STATE,
			};
		default:
			return state;
	}
}

export default UserReducer;
