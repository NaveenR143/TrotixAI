import { combineReducers } from "redux";
import CustomizerReducer from "./customizer/CustomizerReducer";
import SpinnerReducer from "./spinner/SpinnerReducer";
import ReportReducer from "./reports/ReportReducer";
import UserReducer from "./user/UserReducer";
import SearchingReducer from "./searching/SearchingReducer";
import RecentSearchesReducer from "./recentsearches/RecentSearchesReducer";
import ProfileReducer from "./profile/ProfileReducer";

const RootReducers = combineReducers({
  CustomizerReducer,
  SpinnerReducer,
  ReportReducer,
  UserReducer,
  SearchingReducer,
  RecentSearchesReducer,
  ProfileReducer
});

export default RootReducers;
