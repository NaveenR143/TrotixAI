/**
 * Profile API Service
 * Handles all block-by-block profile updates with Axios
 */

import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "../config/api.config";


// Helper function to get headers
const getHeaders = () => ({
  "Content-Type": "application/json",
  // Add auth token if available
});

// Helper function to handle API errors
const handleError = (error) => {
  let message = "An error occurred";

  if (error.response?.data?.detail) {
    const detail = error.response.data.detail;
    if (typeof detail === "string") {
      message = detail;
    } else if (Array.isArray(detail)) {
      // Handle Pydantic validation errors which are returned as a list of dicts {loc, msg, type...}
      message = detail.map((d) => d.msg || JSON.stringify(d)).join(", ");
    } else if (typeof detail === "object") {
      message = detail.msg || JSON.stringify(detail);
    }
  } else if (error.response?.data?.message) {
    message = error.response.data.message;
  } else if (error.message) {
    message = error.message;
  }

  return {
    error: true,
    message,
    status: error.response?.status,
  };
};

/**
 * Fetch Complete User Profile
 */
export const fetchProfile = async (phone = null, userId = null) => {
  try {
    const params = {};
    if (phone) {
      params.phone = phone;
    }
    if (userId) {
      params.user_id = userId;
    }

    const response = await axios.get(
      `${API_BASE_URL}${API_ENDPOINTS.USER_PROFILE}`,
      {
        params,
        headers: getHeaders(),
        timeout: 10000,
      }
    );

    return {
      error: false,
      data: response.data?.data || response.data,
      message: "Profile fetched successfully",
    };
  } catch (error) {
    console.error("Error fetching profile:", error);
    return handleError(error);
  }
};

/**
 * Update Personal Information
 */
export const updatePersonalInformation = async (userId, data) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}${API_ENDPOINTS.PROFILE}/update/personal-information/${userId}`,
      data,
      { headers: getHeaders(), timeout: 10000 }
    );

    return {
      error: false,
      data: response.data,
      message: response.data?.message || "Personal information updated successfully",
    };
  } catch (error) {
    console.error("Error updating personal information:", error);
    return handleError(error);
  }
};

/**
 * Update Personal Information
 */
export const updatePersonalInfo = async (userId, data) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}${API_ENDPOINTS.PROFILE}/update/personal-info/${userId}`,
      data,
      { headers: getHeaders(), timeout: 10000 }
    );

    return {
      error: false,
      data: response.data,
      message: response.data?.message || "Personal information updated successfully",
    };
  } catch (error) {
    console.error("Error updating personal information:", error);
    return handleError(error);
  }
};

/**
 * Update Summary
 */
export const updateUserSummary = async (userId, data) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}${API_ENDPOINTS.PROFILE}/update/profile-summary/${userId}`,
      data,
      { headers: getHeaders(), timeout: 10000 }
    );

    return {
      error: false,
      data: response.data,
      message: response.data?.message || "Summary updated successfully",
    };
  } catch (error) {
    console.error("Error updating summary:", error);
    return handleError(error);
  }
};


/**
 * Update Work Experience
 */
export const updateWorkExperience = async (userId, experienceData) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}${API_ENDPOINTS.PROFILE}/update/work-experience/${userId}`,
      experienceData,
      { headers: getHeaders(), timeout: 10000 }
    );

    return {
      error: false,
      data: response.data,
      message:
        response.data?.message ||
        "Work experience updated successfully",
    };
  } catch (error) {
    console.error("Error updating work experience:", error);
    return handleError(error);
  }
};

/**
 * Update Achievement
 */
export const updateAchievement = async (userId, achievementData) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}${API_ENDPOINTS.PROFILE}/update/achievement/${userId}`,
      achievementData,
      { headers: getHeaders(), timeout: 10000 }
    );

    return {
      error: false,
      data: response.data,
      message: response.data?.message || "Achievement updated successfully",
    };
  } catch (error) {
    console.error("Error updating achievement:", error);
    return handleError(error);
  }
};

/**
 * Delete Achievement
 */
export const deleteAchievement = async (userId, achievementId) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}${API_ENDPOINTS.PROFILE}/delete/achievement/${userId}/${achievementId}`,
      { headers: getHeaders(), timeout: 10000 }
    );

    return {
      error: false,
      data: response.data,
      message: response.data?.message || "Achievement deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting achievement:", error);
    return handleError(error);
  }
};

/**
 * Update Education
 */
export const updateEducation = async (userId, educationData) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}${API_ENDPOINTS.PROFILE}/update/education/${userId}`,
      educationData,
      { headers: getHeaders(), timeout: 10000 }
    );

    return {
      error: false,
      data: response.data,
      message: response.data?.message || "Education updated successfully",
    };
  } catch (error) {
    console.error("Error updating education:", error);
    return handleError(error);
  }
};

/**
 * Update Project
 */
export const updateProject = async (userId, projectData) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}${API_ENDPOINTS.PROFILE}/update/project/${userId}`,
      projectData,
      { headers: getHeaders(), timeout: 10000 }
    );

    return {
      error: false,
      data: response.data,
      message: response.data?.message || "Project updated successfully",
    };
  } catch (error) {
    console.error("Error updating project:", error);
    return handleError(error);
  }
};

/**
 * Update Skills
 */
export const updateSkills = async (userId, skills) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}${API_ENDPOINTS.PROFILE}/update/skills/${userId}`,
      { skills },
      { headers: getHeaders(), timeout: 10000 }
    );

    return {
      error: false,
      data: response.data,
      message: response.data?.message || "Skills updated successfully",
    };
  } catch (error) {
    console.error("Error updating skills:", error);
    return handleError(error);
  }
};

/**
 * Update Languages
 */
export const updateLanguages = async (userId, languages) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}${API_ENDPOINTS.PROFILE}/update/languages/${userId}`,
      { languages },
      { headers: getHeaders(), timeout: 10000 }
    );

    return {
      error: false,
      data: response.data,
      message: response.data?.message || "Languages updated successfully",
    };
  } catch (error) {
    console.error("Error updating languages:", error);
    return handleError(error);
  }
};

/**
 * Fetch Skills Dropdown
 */
export const fetchSkillsDropdown = async (search = "") => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}${API_ENDPOINTS.PROFILE}/dropdowns/skills`,
      {
        params: { search, limit: 100 },
        headers: getHeaders(),
        timeout: 10000
      }
    );

    return {
      error: false,
      data: response.data?.data || [],
      message: "Skills dropdown fetched successfully",
    };
  } catch (error) {
    console.error("Error fetching skills dropdown:", error);
    return handleError(error);
  }
};

export const fetchLanguagesDropdown = async (search = "") => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}${API_ENDPOINTS.PROFILE}/dropdowns/languages`,
      {
        params: { search, limit: 100 },
        headers: getHeaders(),
        timeout: 10000
      }
    );

    return {
      error: false,
      data: response.data?.data || [],
      message: "Languages dropdown fetched successfully",
    };
  } catch (error) {
    console.error("Error fetching languages dropdown:", error);
    return handleError(error);
  }
};


/**
 * Fetch Career Advice
 */
export const fetchCareerAdvice = async (phone, userId = null) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}${API_ENDPOINTS.CAREER_ADVICE}`,
      {
        params: {
          phone,
          user_id: userId,
        },
        headers: getHeaders(),
      }
    );

    return {
      error: false,
      data: response.data?.data || response.data,
      message: "Career Advice fetched successfully",
    };
  } catch (error) {
    console.error("Error fetching career advice:", error);
    return handleError(error);
  }
};

/**
 * Fetch Existing Career Advice
 */
export const fetchExistingCareerAdvice = async (phone, userId = null) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}${API_ENDPOINTS.EXISTING_CAREER_ADVICE}`,
      {
        params: {
          user_id: userId,
        },
        headers: getHeaders(),
      }
    );

    return {
      error: false,
      data: response.data?.data || response.data,
      message: "Existing Career Advice fetched successfully",
    };
  } catch (error) {
    console.error("Error fetching existing career advice:", error);
    return handleError(error);
  }
};

/**
 * Fetch Existing Skill Analysis
 */

export const fetchExistingSkillAnalysis = async (userId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}${API_ENDPOINTS.EXISTING_SKILL_DEVELOPMENT_ANALYSIS}`,
      {
        params: {
          user_id: userId,
        },
        headers: getHeaders(),
      }
    );

    return {
      error: false,
      data: response.data?.data || response.data,
      message: "Existing Skill Analysis fetched successfully",
    };
  } catch (error) {
    console.error("Error fetching Existing Skill Analysis:", error);
    return handleError(error);
  }
};


/**
 * Fetch Missing Skills and Enhancement
 */
export const fetchMissingSkills = async (userId, forceRefresh = false) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}${API_ENDPOINTS.SKILL_DEVELOPMENT_ANALYSIS}`,
      {
        params: {
          user_id: userId,
          force_refresh: forceRefresh
        },
        headers: getHeaders(),
      }
    );

    return {
      error: false,
      data: response.data?.data || response.data,
      message: "Missing Skills fetched successfully",
    };
  } catch (error) {
    console.error("Error fetching missing skills:", error);
    return handleError(error);
  }
};

/**
 * Fetch Enhance Resume Post API
 */
export const fetchEnhanceResume = async (userId) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}${API_ENDPOINTS.ENHANCE_RESUME}`,
      {
        user_id: userId,
      },
      { headers: getHeaders() }
    );

    return {
      error: false,
      data: response.data?.data || response.data,
      message: "Resume Enhanced successfully",
    };
  } catch (error) {
    console.error("Error enhancing resume:", error);
    return handleError(error);
  }
};

/**
 * Fetch Daily AI Usage Status
 */
export const fetchAIUsageStatus = async (userId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}${API_ENDPOINTS.AI_USAGE_STATUS}`,
      {
        params: { user_id: userId },
        headers: getHeaders(),
      }
    );

    return {
      error: false,
      data: response.data?.data || response.data,
      message: "AI usage status fetched successfully",
    };
  } catch (error) {
    console.error("Error fetching AI usage status:", error);
    return handleError(error);
  }
};

/**
 * Logout User
 */
export const logout = async () => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}${API_ENDPOINTS.LOGOUT}`,
      {},
      { headers: getHeaders(), timeout: 10000 }
    );

    return {
      error: false,
      data: response.data,
      message: "Logged out successfully",
    };
  } catch (error) {
    console.error("Error logging out:", error);
    return handleError(error);
  }
};

/**
 * Submit Complete Manual Profile
 */
export const submitManualProfile = async (profileData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}${API_ENDPOINTS.MANUAL_SUBMISSION}`,
      profileData,
      { headers: getHeaders(), timeout: 20000 }
    );

    return {
      error: false,
      data: response.data?.data || response.data,
      message: response.data?.message || "Profile submitted successfully",
    };
  } catch (error) {
    console.error("Error submitting manual profile:", error);
    return handleError(error);
  }
};

/**
 * Update Profile Photo
 */
export const updateProfilePhoto = async (userId, file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(
      `${API_BASE_URL}${API_ENDPOINTS.PROFILE}/update-photo/${userId}`,
      formData,
      {
        headers: {
          ...getHeaders(),
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000,
      }
    );

    return {
      error: false,
      data: response.data,
      message: response.data?.message || "Profile photo updated successfully",
    };
  } catch (error) {
    console.error("Error updating profile photo:", error);
    return handleError(error);
  }
};

/**
 * Fetch Profile Photo from Azure Blob
 */
export const fetchProfilePhoto = async (avatarUrl) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}${API_ENDPOINTS.GET_PHOTO}`,
      {
        params: { avatar_url: avatarUrl },
        headers: getHeaders(),
        responseType: "blob", // Important for image data
        timeout: 20000,
      }
    );

    return {
      error: false,
      data: response.data,
      message: "Photo fetched successfully",
    };
  } catch (error) {
    console.error("Error fetching profile photo:", error);
    return handleError(error);
  }
};

/**
 * Record Job View
 */
export const recordJobView = async (jobId, userId) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}${API_ENDPOINTS.RECORD_VIEW}`,
      { job_id: jobId, user_id: userId },
      { headers: getHeaders(), timeout: 10000 }
    );

    return {
      error: false,
      data: response.data,
      message: "Job view recorded successfully",
    };
  } catch (error) {
    // Fail silently in the background as per requirements
    console.warn("Background Error: Failed to record job view:", error.message);
    return { error: true, message: error.message };
  }
};

/**
 * Deduct credits for AI feature usage
 * @param {string} userId - User UUID
 * @param {string} feature - Feature name: enhance_resume, skill_analysis, learning_path, or resume_download
 */
export const deductFeatureCredits = async (userId, feature) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}${API_ENDPOINTS.CREDITS_USE_FEATURE}/${userId}`,
      { feature },
      { headers: getHeaders(), timeout: 10000 }
    );

    // Spread the response data into the result for easier access
    return {
      error: false,
      ...response.data,  // { success, message, balance, credits_deducted }
      message: response.data?.message || "Credits deducted successfully",
    };
  } catch (error) {
    console.error("Error deducting credits:", error);
    return handleError(error);
  }
};

/**
 * Fetch credit wallet balance
 * @param {string} userId - User UUID
 */
export const fetchWalletBalance = async (userId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}${API_ENDPOINTS.CREDITS_WALLET}/${userId}`,
      { headers: getHeaders(), timeout: 10000 }
    );

    return {
      error: false,
      data: response.data,
      message: "Wallet balance fetched successfully",
    };
  } catch (error) {
    console.error("Error fetching wallet balance:", error);
    return handleError(error);
  }
};


/**
 * Add credits to a user's wallet
 * @param {string} userId - User UUID
 * @param {number} amount - Amount of credits to add
 * @param {string} [type='purchase'] - Transaction type (string matching server enum)
 * @param {string} [description] - Optional description
 */
export const addFeatureCredits = async (userId, amount, type = "purchase", description = "Purchase credits") => {
  try {
    const payload = {
      amount,
      type,
      description,
    };

    const response = await axios.post(
      `${API_BASE_URL}${API_ENDPOINTS.ADD_CREDITS}/${userId}`,
      payload,
      { headers: getHeaders(), timeout: 10000 }
    );

    // Return structured result including overall balance
    return {
      error: false,
      success: response.data?.success ?? true,
      message: response.data?.message,
      balance: response.data?.balance,
      data: response.data,
    };
  } catch (error) {
    console.error("Error adding credits:", error);
    return handleError(error);
  }
};

/**
 * Create a Razorpay payment order on the backend
 * @param {string} userId - User UUID
 * @param {number} amount - Amount in INR (e.g., 99)
 * @param {number} creditsToAdd - Credits to be added (e.g., 100)
 * @param {string} packageName - Name of the package (e.g., "100 Credits")
 */
export const createPaymentOrder = async (userId, amount, creditsToAdd, packageName) => {
  try {
    const payload = {
      amount,
      credits_to_add: creditsToAdd,
      package_name: packageName,
    };

    const response = await axios.post(
      `${API_BASE_URL}${API_ENDPOINTS.CREATE_PAYMENT_ORDER}/${userId}`,
      payload,
      { headers: getHeaders(), timeout: 10000 }
    );

    return {
      error: false,
      success: response.data?.success ?? true,
      message: response.data?.message || "Order created successfully",
      order: response.data?.order,
      razorpay_key_id: response.data?.razorpay_key_id,
      data: response.data,
    };
  } catch (error) {
    console.error("Error creating payment order:", error);
    return handleError(error);
  }
};

/**
 * Verify Razorpay payment signature and credit the user wallet
 * @param {string} userId - User UUID
 * @param {string} razorpayOrderId - Razorpay Order ID
 * @param {string} razorpayPaymentId - Razorpay Payment ID
 * @param {string} razorpaySignature - Razorpay Signature
 */
export const verifyPayment = async (userId, razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  try {
    const payload = {
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
    };

    const response = await axios.post(
      `${API_BASE_URL}${API_ENDPOINTS.VERIFY_PAYMENT}/${userId}`,
      payload,
      { headers: getHeaders(), timeout: 15000 }
    );

    return {
      error: false,
      success: response.data?.success ?? true,
      message: response.data?.message || "Payment verified successfully",
      credits_added: response.data?.credits_added,
      balance: response.data?.balance,
      data: response.data,
    };
  } catch (error) {
    console.error("Error verifying payment:", error);
    return handleError(error);
  }
};

/**
 * Initiate a PayU payment on the backend
 * @param {string} userId - User UUID
 * @param {number} amount - Amount in INR (e.g., 99)
 * @param {number} creditsToAdd - Credits to be added (e.g., 100)
 * @param {string} packageName - Name of the package (e.g., "100 Credits")
 */
export const initiatePayUPayment = async (userId, amount, creditsToAdd, packageName) => {
  try {
    const payload = {
      amount,
      credits_to_add: creditsToAdd,
      package_name: packageName,
    };

    const response = await axios.post(
      `${API_BASE_URL}${API_ENDPOINTS.INITIATE_PAYU_PAYMENT}/${userId}`,
      payload,
      { headers: getHeaders(), timeout: 10000 }
    );

    return {
      error: false,
      success: response.data?.success ?? true,
      message: response.data?.message || "PayU payment initiated successfully",
      payment_params: response.data?.payment_params,
      payment_url: response.data?.payment_url,
      data: response.data,
    };
  } catch (error) {
    console.error("Error initiating PayU payment:", error);
    return handleError(error);
  }
};

/**
 * Fetch PayU transaction status on the backend
 * @param {string} txnid - Unique transaction ID
 */
export const fetchPayUPaymentStatus = async (txnid) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}${API_ENDPOINTS.PAYU_PAYMENT_STATUS}/${txnid}`,
      { headers: getHeaders(), timeout: 10000 }
    );

    return {
      error: false,
      success: response.data?.success ?? true,
      status: response.data?.status,
      amount: response.data?.amount,
      credits_to_add: response.data?.credits_to_add,
      request_status: response.data?.request_status,
      data: response.data,
    };
  } catch (error) {
    console.error("Error fetching PayU payment status:", error);
    return handleError(error);
  }
};

/**
 * Download Candidate Resume Securely as Blob
 */
export const downloadResume = async (candidateId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}${API_ENDPOINTS.DOWNLOAD_RESUME}/${candidateId}`,
      {
        headers: getHeaders(),
        responseType: "blob",
        timeout: 30000,
      }
    );

    return {
      error: false,
      data: response.data,
      headers: response.headers,
      message: "Resume downloaded successfully",
    };
  } catch (error) {
    console.error("Error downloading resume:", error);
    if (error.response?.data instanceof Blob) {
      try {
        const text = await error.response.data.text();
        const parsed = JSON.parse(text);
        if (parsed.detail) {
          error.response.data = parsed;
        }
      } catch (e) {
        // ignore
      }
    }
    return handleError(error);
  }
};

/**
 * Unlock candidate contact details
 */
export const unlockCandidate = async (candidateId) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}${API_ENDPOINTS.UNLOCK_CANDIDATE}`,
      { candidate_id: candidateId },
      { headers: getHeaders(), timeout: 10000 }
    );
    return {
      error: false,
      ...response.data,
    };
  } catch (error) {
    console.error("Error unlocking candidate:", error);
    return handleError(error);
  }
};

/**
 * Check candidate unlock status
 */
export const checkUnlockStatus = async (candidateId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}${API_ENDPOINTS.CHECK_UNLOCK_STATUS}/${candidateId}`,
      { headers: getHeaders(), timeout: 10000 }
    );
    return {
      error: false,
      ...response.data,
    };
  } catch (error) {
    console.error("Error checking unlock status:", error);
    return handleError(error);
  }
};

/**
 * Update Profile Viewed Status to True
 * @param {string} userId - User UUID
 */
export const updateProfileViewed = async (userId) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}${API_ENDPOINTS.PROFILE}/update/viewed/${userId}`,
      {},
      { headers: getHeaders(), timeout: 10000 }
    );

    return {
      error: false,
      data: response.data,
      message: response.data?.message || "Profile viewed status updated successfully",
    };
  } catch (error) {
    console.error("Error updating profile viewed status:", error);
    return handleError(error);
  }
};


/**
 * Fetch Industries Dropdown
 */
export const fetchIndustriesDropdown = async (search = "") => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}${API_ENDPOINTS.PROFILE}/dropdowns/industries`,
      {
        params: { search, limit: 100 },
        headers: getHeaders(),
        timeout: 10000
      }
    );

    return {
      error: false,
      data: response.data?.data || [],
      message: "Industries dropdown fetched successfully",
    };
  } catch (error) {
    console.error("Error fetching industries dropdown:", error);
    return handleError(error);
  }
};

/**
 * Update User Industries
 */
export const updateUserIndustries = async (userId, industryIds) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}${API_ENDPOINTS.PROFILE}/update/industries/${userId}`,
      { industry_ids: industryIds },
      { headers: getHeaders(), timeout: 10000 }
    );

    return {
      error: false,
      data: response.data,
      message: response.data?.message || "Industries updated successfully",
    };
  } catch (error) {
    console.error("Error updating industries:", error);
    return handleError(error);
  }
};


