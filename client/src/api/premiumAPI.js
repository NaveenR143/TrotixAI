import axios from "axios";
import { API_BASE_URL } from "../config/api.config";

const getHeaders = () => ({
  "Content-Type": "application/json",
});

const handleError = (error) => {
  let message = "An error occurred";
  if (error.response?.data?.detail) {
    const detail = error.response.data.detail;
    if (typeof detail === "string") message = detail;
    else if (Array.isArray(detail)) message = detail.map((d) => d.msg || JSON.stringify(d)).join(", ");
    else message = JSON.stringify(detail);
  } else if (error.response?.data?.message) {
    message = error.response.data.message;
  } else if (error.message) {
    message = error.message;
  }
  return { error: true, message, status: error.response?.status };
};

/**
 * Create Premium Checkout Session (₹99)
 * @param {string} gateway - 'razorpay' or 'payu'
 */
export const createPremiumCheckout = async (gateway) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/premium/checkout`,
      { gateway },
      { headers: getHeaders(), withCredentials: true }
    );
    return { error: false, data: response.data };
  } catch (error) {
    console.error("Error creating premium checkout:", error);
    return handleError(error);
  }
};

/**
 * Verify Direct Premium Payment (Razorpay or PayU redirect)
 * @param {object} payload - Payment details signature
 */
export const verifyPremiumPayment = async (payload) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/premium/verify`,
      payload,
      { headers: getHeaders(), withCredentials: true }
    );
    return { error: false, data: response.data };
  } catch (error) {
    console.error("Error verifying premium payment:", error);
    return handleError(error);
  }
};

/**
 * Get Order and Report Generation Status
 * @param {number} orderId - Order identifier
 */
export const getOrderStatus = async (orderId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/premium/orders/${orderId}`,
      { headers: getHeaders(), withCredentials: true }
    );
    return { error: false, data: response.data };
  } catch (error) {
    console.error("Error fetching order status:", error);
    return handleError(error);
  }
};

/**
 * Get Candidate's Premium Purchase Dashboard List
 */
export const getPremiumDashboard = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/premium/dashboard`,
      { headers: getHeaders(), withCredentials: true }
    );
    return { error: false, data: response.data };
  } catch (error) {
    console.error("Error fetching premium dashboard:", error);
    return handleError(error);
  }
};

/**
 * Trigger Retry for a Failed Report
 * @param {number} reportId - Report identifier
 */
export const retryPremiumReport = async (reportId) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/premium/reports/${reportId}/retry`,
      {},
      { headers: getHeaders(), withCredentials: true }
    );
    return { error: false, data: response.data };
  } catch (error) {
    console.error("Error retrying report generation:", error);
    return handleError(error);
  }
};
