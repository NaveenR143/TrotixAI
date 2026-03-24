import { applyMiddleware, createStore, compose } from 'redux';
import { save, load } from 'redux-localstorage-simple';
import reduxReset from 'redux-reset';
import RootReducers from './Rootreducers';

const enHanceCreateStore = compose(
	applyMiddleware(save()),
	reduxReset() // Will use 'RESET' as default action.type to trigger reset
)(createStore);

const store = enHanceCreateStore(RootReducers, load());

// const createStoreWithMiddleware = applyMiddleware(save())(createStore);

// const store = createStoreWithMiddleware(reducer, load());


export default store;

// export function configureStore(InitialState) {
// 	const Store = createStore(
// 	  RootReducers,
// 	  InitialState,
// 	  composeWithDevTools(applyMiddleware(thunk)),
// 	);
// 	return Store;
//   }
