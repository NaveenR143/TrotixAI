// services/jobService.js
import { mockJobs } from "./mockData";

/**
 * Service to handle job-related operations.
 */
export const jobService = {
  /**
   * Fetches the recommended jobs for a user.
   * @returns {Promise<Array>}
   */
  getRecommendedJobs: async () => {
    // Simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockJobs), 800);
    });
  },

  /**
   * Fetches a single job by ID.
   * @param {string|number} id 
   * @returns {Promise<Object|null>}
   */
  getJobById: async (id) => {
    return new Promise((resolve) => {
      const job = mockJobs.find(j => j.id.toString() === id.toString());
      setTimeout(() => resolve(job || null), 400);
    });
  }
};
