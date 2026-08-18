/**
 * MSG91 Secure OTP Web SDK Integration
 * Widget ID: 3668716a4864373039323834
 * Token Auth: 560885T2kcvOrbS46a82e3fcP1
 */

const WIDGET_ID = import.meta.env.VITE_MSG91_WIDGET_ID || '3668716a4864373039323834';
const TOKEN_AUTH = import.meta.env.VITE_MSG91_WIDGET_TOKEN || '560885T2kcvOrbS46a82e3fcP1';

/**
 * Format Indian mobile into 91XXXXXXXXXX
 */
export const formatIndianMobile = (mobile) => {
  if (!mobile) return '';
  let cleaned = String(mobile).replace(/\D/g, '');
  cleaned = cleaned.replace(/^0+/, '');
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    cleaned = cleaned.substring(2);
  }
  if (cleaned.length === 10) {
    return `91${cleaned}`;
  }
  return `91${cleaned.slice(-10)}`;
};

let isWidgetInitialized = false;

/**
 * Step 3.1 & 3.2: Wait for SDK and initialize window.configuration (Singleton)
 */
export const initSendOtpWidget = (mobile, { onSuccess, onFailure } = {}) => {
  return new Promise((resolve) => {
    const formattedMobile = formatIndianMobile(mobile);

    if (isWidgetInitialized && window.configuration) {
      window.configuration.identifier = formattedMobile;
      if (onSuccess) window.configuration.success = onSuccess;
      if (onFailure) window.configuration.failure = onFailure;
      resolve(true);
      return;
    }

    const checkSDK = () => {
      if (typeof window.initSendOTP === 'function') {
        window.configuration = {
          widgetId: WIDGET_ID,
          tokenAuth: TOKEN_AUTH,
          identifier: formattedMobile,
          exposeMethods: true, // MUST be a boolean true
          success: (data) => {
            console.log('[MSG91 Global Success Callback]:', data);
            if (onSuccess) onSuccess(data);
          },
          failure: (error) => {
            const errStr = String(error?.message || error || '');
            if (errStr.toLowerCase().includes('captcha') || errStr.toLowerCase().includes('already been rendered')) {
              return; // Ignore captcha duplicate warnings gracefully
            }
            console.warn('[MSG91 Global Failure Callback]:', error);
            if (onFailure) onFailure(error);
          },
        };

        try {
          window.initSendOTP(window.configuration);
          isWidgetInitialized = true;
        } catch (e) {
          console.error('[MSG91 initSendOTP error]:', e);
        }
        resolve(true);
      } else {
        setTimeout(checkSDK, 150);
      }
    };

    checkSDK();
  });
};

let lastReqId = null;

/**
 * Step 3.3: Sending OTP via window.sendOtp
 */
export const sendOtpViaWidget = async (mobile) => {
  const formattedMobile = formatIndianMobile(mobile);

  return new Promise(async (resolve) => {
    await initSendOtpWidget(formattedMobile);

    let attempts = 0;
    const checkMethod = () => {
      if (typeof window.sendOtp === 'function') {
        console.log(`[MSG91 SDK] Dispatching OTP SMS to ${formattedMobile}...`);
        window.sendOtp(
          formattedMobile,
          (successData) => {
            console.log('[MSG91 SDK sendOtp Success]:', successData);
            if (successData?.message && typeof successData.message === 'string') {
              lastReqId = successData.message;
            }
            resolve({ success: true, data: successData, reqId: lastReqId });
          },
          (errorData) => {
            console.warn('[MSG91 SDK sendOtp Callback Info]:', errorData);
            resolve({ success: true, info: errorData });
          }
        );
      } else if (attempts < 25) {
        attempts++;
        setTimeout(checkMethod, 150);
      } else {
        console.warn('[MSG91 SDK] window.sendOtp not bound within timeout.');
        resolve({ fallback: true });
      }
    };

    setTimeout(checkMethod, 100);
  });
};

/**
 * Step 3.4: Verifying OTP via window.verifyOtp
 */
export const verifyOtpViaWidget = (mobile, otp) => {
  const cleanOtp = String(otp || '').trim();

  return new Promise((resolve, reject) => {
    let resolved = false;

    // 15-second watchdog timer
    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        reject(new Error('OTP verification timed out. Please check your code or request a new OTP.'));
      }
    }, 15000);

    const handleSuccess = (data) => {
      if (resolved) return;
      if (data?.type === 'error' || data?.status === 'fail' || data?.hasError) {
        handleFailure(data);
        return;
      }
      resolved = true;
      clearTimeout(timer);
      console.log('[MSG91] Access token acquired successfully.');
      const token =
        data?.message ||
        data?.data?.token ||
        data?.token ||
        (typeof data === 'string' ? data : null);
      resolve({ success: true, accessToken: token, raw: data });
    };

    const handleFailure = (err) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timer);
      const msg = typeof err === 'string' ? err : err?.message || 'Invalid OTP. Please check and try again.';
      reject(new Error(msg));
    };

    // Attach callbacks to global configuration
    if (window.configuration) {
      window.configuration.success = handleSuccess;
      window.configuration.failure = handleFailure;
    }

    if (typeof window.verifyOtp === 'function') {
      try {
        // MSG91 Web SDK exact signature: verifyOtp(otp, successCallback, failureCallback, reqId)
        window.verifyOtp(cleanOtp, handleSuccess, handleFailure, lastReqId);
      } catch (err) {
        console.warn('[MSG91 verifyOtp invocation error]:', err);
        handleFailure(err);
      }
    } else {
      clearTimeout(timer);
      reject(new Error('MSG91 verification SDK is not ready.'));
    }
  });
};

/**
 * Retrying OTP via window.retryOtp
 */
export const retryOtpViaWidget = (mobile, channel = null) => {
  const formattedMobile = formatIndianMobile(mobile);

  return new Promise((resolve) => {
    if (typeof window.retryOtp === 'function') {
      try {
        window.retryOtp(
          channel,
          (success) => {
            console.log('[MSG91 Retry Success]:', success);
            resolve({ success: true, data: success });
          },
          (error) => {
            console.warn('[MSG91 retryOtp Info]:', error);
            sendOtpViaWidget(formattedMobile).then(resolve);
          }
        );
      } catch (e) {
        sendOtpViaWidget(formattedMobile).then(resolve);
      }
    } else {
      sendOtpViaWidget(formattedMobile).then(resolve);
    }
  });
};

export const loadMsg91Sdk = initSendOtpWidget;

