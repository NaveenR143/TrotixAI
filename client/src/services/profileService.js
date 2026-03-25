// services/profileService.js
import { mockProfileData } from "./mockData";

/**
 * Service to handle profile-related operations.
 */
export const profileService = {
  /**
   * Fetches the current user's profile.
   * @returns {Promise<Object>}
   */
  getProfile: async () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockProfileData), 500);
    });
  },

  /**
   * Updates the user's profile.
   * @param {Object} profileData 
   * @returns {Promise<Object>}
   */
  updateProfile: async (profileData) => {
    console.log("[profileService] Updating profile:", profileData);
    return new Promise((resolve) => {
      setTimeout(() => resolve({ success: true, profile: profileData }), 1000);
    });
  }
};
