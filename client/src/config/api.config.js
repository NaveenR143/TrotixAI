/**
 * API Configuration
 * Centralized configuration for all API endpoints
 * 
 * Usage:
 *   import { API_BASE_URL, API_ENDPOINTS } from '@/config/api.config';
 *   const url = `${API_BASE_URL}${API_ENDPOINTS.UPLOAD_RESUME}`;
 */

// ─── Base URL Configuration ────────────────────────────────────────────────────
const API_BASE_URL = 'http://127.0.0.1:8000';
// const API_BASE_URL = 'http://192.168.29.147:8000';

// ─── API Endpoints ────────────────────────────────────────────────────────────
const API_ENDPOINTS = {
  // Resume Upload & Parsing
  UPLOAD_RESUME: '/resume-process/upload-resume',
  RESUME_STATUS: '/resume-process/resume-status-wait',
  VERIFY_OTP_UPDATE: '/otp/verify-otp-update',
  VERIFY_OTP: '/otp/verify-otp',
  USER_PROFILE: '/profile/fetch',
  PROFILE: '/profile',
  SEND_OTP: '/otp/send-otp',
  NEW_RECRUITER_OTP: '/otp/new-recruiter-otp',
  JOB_FEEDS: '/jobs/fetch-jobs',
  JOB_METADATA: '/jobs/metadata',
  CREATE_JOB: '/jobs/create',
  CAREER_ADVICE: '/profile/career-advice',
  EXISTING_CAREER_ADVICE: '/profile/existing-career-advice',
  SKILL_DEVELOPMENT_ANALYSIS: '/profile/skill-development-analysis',
  ENHANCE_RESUME: '/profile/enhance-resume'
};

// ─── Helper Functions ─────────────────────────────────────────────────────────
/**
 * Build complete API URL
 * @param {string} endpoint - The endpoint from API_ENDPOINTS
 * @returns {string} - Complete URL
 */
const buildApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

/**
 * Get full URL for an endpoint
 * @param {string} key - Key from API_ENDPOINTS
 * @returns {string} - Complete URL or throws error if endpoint not found
 */
const getEndpointUrl = (key) => {
  if (!API_ENDPOINTS[key]) {
    throw new Error(`Endpoint not found: ${key}`);
  }
  return buildApiUrl(API_ENDPOINTS[key]);
};

// ─── Exports ──────────────────────────────────────────────────────────────────
export default {
  API_BASE_URL,
  API_ENDPOINTS,
  buildApiUrl,
  getEndpointUrl,
};

export {
  API_BASE_URL,
  API_ENDPOINTS,
  buildApiUrl,
  getEndpointUrl,
};
