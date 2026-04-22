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
export const fetchProfile = async (phone) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}${API_ENDPOINTS.USER_PROFILE}`,
      {
        params: { phone },
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
export const fetchSkillsDropdown = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}${API_ENDPOINTS.PROFILE}/dropdowns/skills`,
      { headers: getHeaders(), timeout: 10000 }
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

/**
 * Fetch Languages Dropdown
 */
export const fetchLanguagesDropdown = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}${API_ENDPOINTS.PROFILE}/dropdowns/languages`,
      { headers: getHeaders(), timeout: 10000 }
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
 * Fetch Missing Skills and Enhancement
 */
export const fetchMissingSkills = async (userId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}${API_ENDPOINTS.SKILL_DEVELOPMENT_ANALYSIS}`,
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