import { 
  FETCH_PROFILE_REQUEST, 
  FETCH_PROFILE_SUCCESS, 
  FETCH_PROFILE_FAILURE,
  UPDATE_PROFILE_DATA
} from "../constants";
import { fetchProfile } from "../../api/profileAPI";
import { mapProfileData } from "../../utils/profileMapping";
import { updateUserProfile } from "../user/Action";

export const fetchProfileRequest = () => ({
  type: FETCH_PROFILE_REQUEST,
});

export const fetchProfileSuccess = (data) => ({
  type: FETCH_PROFILE_SUCCESS,
  payload: data,
});

export const fetchProfileFailure = (error) => ({
  type: FETCH_PROFILE_FAILURE,
  payload: error,
});

export const updateProfileData = (payload) => ({
  type: UPDATE_PROFILE_DATA,
  payload,
});

/**
 * Thunk action to fetch and store profile information
 * @param {string} identifier - User's phone or identifier
 */
export const fetchAndStoreProfile = (identifier) => async (dispatch) => {
  dispatch(fetchProfileRequest());

  const response = await fetchProfile(identifier);

  if (!response.error) {
    const mappedData = mapProfileData(response.data);
    dispatch(fetchProfileSuccess(mappedData));

    // Also update UserReducer for backward compatibility with UserProfile.js
    // We flatten the personalDetails for UserReducer as it expects them at the top level
    const flattenedData = {
      ...mappedData.personalDetails,
      id: mappedData.id,
      experience: mappedData.experience,
      education: mappedData.education,
      projects: mappedData.projects,
      skills: mappedData.skills,
      languages: mappedData.languages,
      fullname: mappedData.personalDetails.fullName, // UserReducer uses fullname
      mobile: mappedData.personalDetails.phone, // UserReducer uses mobile
    };
    dispatch(updateUserProfile(flattenedData));

    return { success: true, data: mappedData };
  } else {
    dispatch(fetchProfileFailure(response.message));
    return { success: false, message: response.message };
  }
};
