import { applyMiddleware, createStore, compose } from 'redux';
import { save, load } from "redux-localstorage-simple";
import reduxReset from 'redux-reset';
import RootReducers from './Rootreducers';

const composeEnhancers = (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

const PERSISTED_STATES = ["UserReducer", "CustomizerReducer", "RecentSearchesReducer"];

const enHanceCreateStore = composeEnhancers(
	applyMiddleware(save({ states: PERSISTED_STATES })),
	reduxReset() // Will use 'RESET' as default action.type to trigger reset
)(createStore);

const store = enHanceCreateStore(
	RootReducers,
	load({ states: PERSISTED_STATES })
);

export default store;

// export function configureStore(InitialState) {
// 	const Store = createStore(
// 	  RootReducers,
// 	  InitialState,
// 	  composeWithDevTools(applyMiddleware(thunk)),
// 	);
// 	return Store;
//   }
