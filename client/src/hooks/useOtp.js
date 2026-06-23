import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendOTP as apiSendOTP, sendRegistrationOTP as apiSendRegistrationOTP } from "../api/jobpostingAPI";
import {
  OTP_SEND_REQUEST,
  OTP_TICK_COOLDOWN,
  OTP_DAILY_RESET
} from "../redux/constants";

export const useOtp = (flowType) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // Select the specific flow's state
  const flowState = useSelector((state) => state.OtpReducer?.flows?.[flowType]) || {
    resendAttempts: 0,
    lastOtpTimestamp: null,
    eligibility: true,
    lastRequestDate: null,
    remainingSeconds: 0,
  };

  const { resendAttempts, lastOtpTimestamp, eligibility, remainingSeconds } = flowState;

  // Countdown timer ticking logic
  useEffect(() => {
    if (!lastOtpTimestamp) return;

    // Check if cooldown is still active
    const elapsed = Date.now() - lastOtpTimestamp;
    if (elapsed >= 25000) {
      if (remainingSeconds > 0) {
        dispatch({ type: OTP_TICK_COOLDOWN });
      }
      return;
    }

    // Start interval to tick every second
    const interval = setInterval(() => {
      dispatch({ type: OTP_TICK_COOLDOWN });
    }, 1000);

    // Initial tick immediately
    dispatch({ type: OTP_TICK_COOLDOWN });

    return () => clearInterval(interval);
  }, [lastOtpTimestamp, remainingSeconds, dispatch]);

  // Method to send OTP
  const sendOtp = useCallback(async ({ name = "", phone, isResend = false, role = "Candidate" }) => {
    if (!phone) {
      setApiError("Phone number is required");
      return { error: true, message: "Phone number is required" };
    }

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      setApiError("Invalid phone number");
      return { error: true, message: "Invalid phone number" };
    }

    // Check if daily resends are exhausted
    if (isResend && resendAttempts >= 3) {
      setApiError("You have reached the maximum of 3 resends today. Please request a new OTP tomorrow.");
      return { error: true, message: "Daily resend limit reached" };
    }

    setLoading(true);
    setApiError("");

    try {
      // 1. Dispatch action to register the send request (and cooldown start) in Redux
      dispatch({
        type: OTP_SEND_REQUEST,
        payload: { flowType, isResend }
      });

      // 2. Call backend API
      let resp;
      if (flowType === "registration" || flowType === "signUp") {
        resp = await apiSendRegistrationOTP(name || "Candidate", cleanPhone, role);
      } else {
        // For login, phone_verification, general verification
        resp = await apiSendOTP(cleanPhone);
      }

      if (resp.error) {
        setApiError(resp.message);
        return resp;
      }

      return resp;
    } catch (err) {
      const msg = err.message || "Failed to send OTP. Please try again.";
      setApiError(msg);
      return { error: true, message: msg };
    } finally {
      setLoading(false);
    }
  }, [flowType, resendAttempts, dispatch]);

  const resetFlow = useCallback(() => {
    dispatch({
      type: OTP_DAILY_RESET,
      payload: { flowType }
    });
  }, [flowType, dispatch]);

  const isCooldownActive = remainingSeconds > 0;
  const isEligible = eligibility && resendAttempts < 3;

  return {
    resendAttempts,
    remainingSeconds,
    isCooldownActive,
    isEligible,
    loading,
    error: apiError,
    sendOtp,
    resetFlow,
  };
};
