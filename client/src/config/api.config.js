/**
 * API Configuration
 * Centralized configuration for all API endpoints
 * 
 * Usage:
 *   import { API_BASE_URL, API_ENDPOINTS } from '@/config/api.config';
 *   const url = `${API_BASE_URL}${API_ENDPOINTS.UPLOAD_RESUME}`;
 */

// ─── Base URL Configuration ────────────────────────────────────────────────────
// const API_BASE_URL = 'http://localhost:8000';
// const API_BASE_URL = 'http://192.168.1.7:8000';
const API_BASE_URL = 'https://rightnxtai-bkdudpehedfwffgy.centralindia-01.azurewebsites.net';

// ─── API Endpoints ────────────────────────────────────────────────────────────
const API_ENDPOINTS = {
  // Resume Upload & Parsing
  UPLOAD_RESUME: '/resume-process/upload-resume',
  RESUME_STATUS: '/resume-process/resume-status-wait',
  VERIFY_OTP_UPDATE: '/otp/verify-otp-update',
  VERIFY_OTP: '/otp/verify-otp',
  USER_PROFILE: '/profile/fetch',
  PROFILE: '/profile',
  DOWNLOAD_RESUME: '/profile/download-resume',
  UNLOCK_CANDIDATE: '/profile/unlock-candidate',
  CHECK_UNLOCK_STATUS: '/profile/unlock-status',
  SEND_OTP: '/otp/send-otp',
  NEW_RECRUITER_OTP: '/otp/new-recruiter-otp',
  NEW_CANDIDATE_OTP: '/otp/new-candidate-otp',
  JOB_FEEDS: '/jobs/fetch-jobs',
  JOB_METADATA: '/jobs/metadata',
  CREATE_JOB: '/jobs/create',
  CAREER_ADVICE: '/profile/career-advice',
  EXISTING_CAREER_ADVICE: '/profile/existing-career-advice',
  SKILL_DEVELOPMENT_ANALYSIS: '/profile/skill-development-analysis',
  EXISTING_SKILL_DEVELOPMENT_ANALYSIS: '/profile/existing-skill-analysis',
  ENHANCE_RESUME: '/profile/enhance-resume',
  AI_USAGE_STATUS: '/profile/ai-usage-status',
  POSTED_JOBS: '/jobs/fetch-recruiter-posted-jobs',
  JOB_MATCHING_CANDIDATES: '/jobs/fetch-job-matching-candidates',
  // JOB_MATCHING_CANDIDATES_TEST: '/jobs/fetch-job-matching-candidates-test',
  JOB_APPLICANTS: '/jobs/fetch-job-applicants',
  APPLY_JOB: '/jobs/apply-job',
  TAILORING_JOB_EMAIL: '/jobs/tailoring-job-email',
  GENERATE_ATS_CONTENT: '/jobs/generate-ats-content',
  MANUAL_SUBMISSION: '/profile/manual-submission',
  GET_JOB: '/jobs/',
  LOGOUT: '/otp/logout',
  DEACTIVATE_JOB: '/jobs/deactivate-job',
  GOVT_JOBS: '/jobs/govt-jobs',
  GOVT_JOB_DETAILS: '/jobs/govt-jobs/',
  UPDATE_PHOTO: '/profile/update-photo',
  ENHANCE_PHOTO: '/profile/enhance-photo',
  SAVE_ENHANCED_PHOTO: '/profile/save-enhanced-photo',
  GET_PHOTO: '/profile/get-photo',
  RECORD_VIEW: '/jobs/record-view',
  CREDITS_USE_FEATURE: '/credits/use-feature',
  CREDITS_WALLET: '/credits',
  ADD_CREDITS: '/credits/add',
  CREATE_PAYMENT_ORDER: '/credits/create-order',
  VERIFY_PAYMENT: '/credits/verify-payment',
  INITIATE_PAYU_PAYMENT: '/credits/payu/initiate',
  PAYU_PAYMENT_STATUS: '/credits/payu/status',
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
