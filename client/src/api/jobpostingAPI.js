/**
 * Job Posting API Service
 * Handles metadata fetching, OTP verification, and job creation
 */

import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "../config/api.config";

// Helper function to get headers
const getHeaders = () => ({
    "Content-Type": "application/json",
});

// Helper function to handle API errors
const handleError = (error) => {
    let message = "An error occurred";

    if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (typeof detail === "string") {
            message = detail;
        } else if (Array.isArray(detail)) {
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
 * Fetch Job Metadata
 * Returns industries, education levels, departments, work modes, and job types
 */
export const fetchJobMetadata = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}${API_ENDPOINTS.JOB_METADATA}`,
            { headers: getHeaders(), timeout: 10000 }
        );

        return {
            error: false,
            data: response.data,
            message: "Metadata fetched successfully",
        };
    } catch (error) {
        console.error("Error fetching job metadata:", error);
        return handleError(error);
    }
};

/**
 * Send Registration OTP for new users
 * @param {string} name - Full name of the user
 * @param {string} phone - Mobile number
 * @param {string} userType - 'Recruiter', 'Candidate', etc.
 */
export const sendRegistrationOTP = async (name, phone, userType = 'Recruiter') => {
    try {
        // Map userType to specific endpoint if needed in future
        const endpoint = userType === 'Recruiter' 
            ? API_ENDPOINTS.NEW_RECRUITER_OTP 
            : API_ENDPOINTS.SEND_OTP;

        const response = await axios.post(
            `${API_BASE_URL}${endpoint}`,
            { name, phone },
            { headers: getHeaders(), timeout: 10000 }
        );

        return {
            error: false,
            data: response.data,
            message: response.data?.message || "Registration OTP sent successfully",
        };
    } catch (error) {
        console.error("Error sending registration OTP:", error);
        return handleError(error);
    }
};

/**
 * Send OTP for verification
 */
export const sendOTP = async (phone) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}${API_ENDPOINTS.SEND_OTP}`,
            { phone },
            { headers: getHeaders(), timeout: 10000 }
        );

        return {
            error: false,
            data: response.data,
            message: response.data?.message || "OTP sent successfully",
        };
    } catch (error) {
        console.error("Error sending OTP:", error);
        return handleError(error);
    }
};

/**
 * Verify OTP and return user_id
 */
export const verifyOTP = async (phone, otp) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}${API_ENDPOINTS.VERIFY_OTP_UPDATE}`,
            { phone, otp },
            { headers: getHeaders(), timeout: 10000 }
        );

        return {
            error: false,
            data: response.data,
            message: response.data?.message || "OTP verified successfully",
        };
    } catch (error) {
        console.error("Error verifying OTP:", error);
        return handleError(error);
    }
};

/**
 * Create a new Job Posting
 */
export const createJob = async (jobData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}${API_ENDPOINTS.CREATE_JOB}`,
            jobData,
            { headers: getHeaders(), timeout: 15000 }
        );

        return {
            error: false,
            data: response.data,
            message: response.data?.message || "Job posted successfully",
        };
    } catch (error) {
        console.error("Error creating job posting:", error);
        return handleError(error);
    }
};
