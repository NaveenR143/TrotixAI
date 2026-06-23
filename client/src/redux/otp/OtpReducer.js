import {
  OTP_SEND_REQUEST,
  OTP_SEND_SUCCESS,
  OTP_SEND_FAILURE,
  OTP_TICK_COOLDOWN,
  OTP_DAILY_RESET
} from '../constants';

const getLocalDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const INIT_STATE = {
  flows: {}
};

function OtpReducer(state = INIT_STATE, action) {
  const today = getLocalDateString();

  // Safety fallback for old persisted state structures
  if (!state || !state.flows) {
    state = { flows: {} };
  }

  // Pre-process all existing flows to perform daily limit resets if date changed
  let hasDateChanged = false;
  const processedFlows = {};
  Object.keys(state.flows).forEach((flowType) => {
    const flow = state.flows[flowType];
    if (flow && flow.lastRequestDate !== today) {
      processedFlows[flowType] = {
        ...flow,
        resendAttempts: 0,
        eligibility: true,
        lastRequestDate: today,
        remainingSeconds: 0,
        lastOtpTimestamp: null,
      };
      hasDateChanged = true;
    } else {
      processedFlows[flowType] = flow;
    }
  });

  const activeState = hasDateChanged ? { ...state, flows: processedFlows } : state;

  switch (action.type) {
    case OTP_SEND_REQUEST: {
      const { flowType, isResend } = action.payload;
      const currentFlow = activeState.flows[flowType] || {
        resendAttempts: 0,
        lastOtpTimestamp: null,
        eligibility: true,
        lastRequestDate: today,
        remainingSeconds: 0,
      };

      // If attempts >= 3 for today and it's a resend, block it
      if (isResend && currentFlow.resendAttempts >= 3 && currentFlow.lastRequestDate === today) {
        return {
          ...activeState,
          flows: {
            ...activeState.flows,
            [flowType]: {
              ...currentFlow,
              eligibility: false,
              lastRequestDate: today,
            }
          }
        };
      }

      const attempts = isResend ? currentFlow.resendAttempts + 1 : currentFlow.resendAttempts;
      const eligible = attempts < 3;

      return {
        ...activeState,
        flows: {
          ...activeState.flows,
          [flowType]: {
            resendAttempts: attempts,
            lastOtpTimestamp: Date.now(),
            eligibility: eligible,
            lastRequestDate: today,
            remainingSeconds: 25,
          }
        }
      };
    }
    case OTP_TICK_COOLDOWN: {
      const nextFlows = { ...activeState.flows };
      let changed = false;
      Object.keys(nextFlows).forEach((flowType) => {
        const flow = nextFlows[flowType];
        if (flow && flow.lastOtpTimestamp) {
          const remaining = Math.max(0, Math.ceil((25000 - (Date.now() - flow.lastOtpTimestamp)) / 1000));
          if (flow.remainingSeconds !== remaining) {
            nextFlows[flowType] = {
              ...flow,
              remainingSeconds: remaining,
            };
            changed = true;
          }
        }
      });
      if (changed) {
        return {
          ...activeState,
          flows: nextFlows
        };
      }
      return activeState;
    }
    case OTP_DAILY_RESET: {
      const { flowType } = action.payload;
      return {
        ...activeState,
        flows: {
          ...activeState.flows,
          [flowType]: {
            resendAttempts: 0,
            eligibility: true,
            lastRequestDate: today,
            remainingSeconds: 0,
            lastOtpTimestamp: null,
          }
        }
      };
    }
    default:
      return activeState;
  }
}

export default OtpReducer;
