import { useEffect, useId, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowRight,
  BadgeCheck,
  RefreshCw,
  Smartphone,
} from "lucide-react";

import {
  clearMobileVerificationFeedback,
  sendMobileVerificationOtp,
  verifyMobileOtp,
} from "../../features/auth/authSlice";

import "./MobileVerification.css";

const FALLBACK_RESEND_SECONDS = 60;

export default function MobileVerification() {
  const user = useSelector((state) => state.auth.user);

  if (!user?.mobile) return null;

  return (
    <MobileVerificationPanel
      key={`${user.id}-${user.mobile}`}
      mobile={user.mobile}
      verified={Boolean(user.mobileVerified)}
    />
  );
}

function MobileVerificationPanel({ mobile, verified }) {
  const dispatch = useDispatch();
  const id = useId();

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [retryAt, setRetryAt] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [feedback, setFeedback] = useState(null);

  const otpRef = useRef(null);
  const activeRef = useRef(false);
  const requestRunningRef = useRef(false);

  const { mobileOtpSendStatus, mobileOtpVerifyStatus } = useSelector(
    (state) => state.auth
  );

  const sending = mobileOtpSendStatus === "loading";
  const verifying = mobileOtpVerifyStatus === "loading";
  const busy = sending || verifying;

  const digits = String(mobile).replace(/\D/g, "");

  const formattedMobile =
    digits.length === 10
      ? `+91 ${digits}`
      : digits.length === 12 && digits.startsWith("91")
      ? `+91 ${digits.slice(2)}`
      : mobile;

  useEffect(() => {
    activeRef.current = true;
    dispatch(clearMobileVerificationFeedback());

    return () => {
      activeRef.current = false;
    };
  }, [dispatch]);

  useEffect(() => {
    if (!retryAt) return;

    let intervalId;

    const updateCountdown = () => {
      const seconds = Math.max(
        0,
        Math.ceil((retryAt - Date.now()) / 1000)
      );

      setRemainingSeconds(seconds);

      if (seconds === 0) {
        clearInterval(intervalId);
        setRetryAt(0);
      }
    };

    updateCountdown();
    intervalId = window.setInterval(updateCountdown, 1000);

    return () => window.clearInterval(intervalId);
  }, [retryAt]);

  const startCooldown = (seconds) => {
    const duration = Math.max(0, Number(seconds) || 0);

    if (duration > 0) {
      setRemainingSeconds(Math.ceil(duration));
      setRetryAt(Date.now() + duration * 1000);
    }
  };

  const sendOtp = async () => {
    if (
      verified ||
      busy ||
      remainingSeconds > 0 ||
      requestRunningRef.current
    ) {
      return;
    }

    requestRunningRef.current = true;
    setFeedback(null);

    try {
      const result = await dispatch(
        sendMobileVerificationOtp()
      ).unwrap();

      if (!activeRef.current) return;

      if (result.mobileVerified === true) {
        setFeedback({
          type: "success",
          message: result.message || "Mobile number is verified.",
        });
        return;
      }

      setOtpSent(true);
      setOtp("");

      startCooldown(
        result.resendAfterSeconds ?? FALLBACK_RESEND_SECONDS
      );

      setFeedback({
        type: "success",
        message: result.message || "OTP sent to your mobile number.",
      });

      requestAnimationFrame(() => {
        if (activeRef.current) otpRef.current?.focus();
      });
    } catch (error) {
      if (!activeRef.current) return;

      startCooldown(error?.retryAfterSeconds);

      setFeedback({
        type: "error",
        message:
          typeof error === "string"
            ? error
            : error?.message || "Unable to send OTP. Please try again.",
      });
    } finally {
      requestRunningRef.current = false;
    }
  };

  const handleVerify = async (event) => {
    event.preventDefault();

    if (verified || busy || requestRunningRef.current) return;

    const submittedOtp = otp.trim();

    if (!/^\d+$/.test(submittedOtp)) {
      setFeedback({
        type: "error",
        message: "Please enter the OTP received on your mobile.",
      });
      return;
    }

    requestRunningRef.current = true;
    setFeedback(null);

    try {
      const result = await dispatch(
        verifyMobileOtp(submittedOtp)
      ).unwrap();

      if (!activeRef.current) return;

      setOtp("");

      setFeedback({
        type: "success",
        message:
          result.message || "Mobile number verified successfully.",
      });
    } catch (error) {
      if (!activeRef.current) return;

      startCooldown(error?.retryAfterSeconds);

      setFeedback({
        type: "error",
        message:
          typeof error === "string"
            ? error
            : error?.message || "Unable to verify OTP.",
      });
    } finally {
      requestRunningRef.current = false;
    }
  };

  return (
    <section
      className="qyx-mobile-verification"
      aria-labelledby={`${id}-title`}
      aria-busy={busy}
    >
      <header className="qyx-mobile-verification__heading">
        <div
          className="qyx-mobile-verification__icon"
          aria-hidden="true"
        >
          {verified ? <BadgeCheck /> : <Smartphone />}
        </div>

        <div>
          <p className="qyx-mobile-verification__eyebrow">
            ACCOUNT VERIFICATION
          </p>

          <h2 id={`${id}-title`}>
            {verified ? "Mobile number verified." : "Verify your mobile."}
          </h2>

          <p className="qyx-mobile-verification__description">
            {verified
              ? "Your mobile number has been confirmed."
              : "Confirm your number with a one-time code sent by SMS."}
          </p>
        </div>
      </header>

      <div className="qyx-mobile-verification__number">
        <div>
          <span>Registered mobile number</span>
          <strong>{formattedMobile}</strong>
        </div>

        {verified && (
          <span className="qyx-mobile-verification__badge">
            <BadgeCheck aria-hidden="true" />
            Verified
          </span>
        )}
      </div>

      {!verified && (
        <>
          {!otpSent ? (
            <button
              type="button"
              className="qyx-mobile-verification__primary"
              onClick={sendOtp}
              disabled={busy || remainingSeconds > 0}
            >
              {sending
                ? "Sending OTP…"
                : remainingSeconds > 0
                ? `Try again in ${remainingSeconds}s`
                : "Send verification OTP"}

              <ArrowRight aria-hidden="true" />
            </button>
          ) : (
            <form
              className="qyx-mobile-verification__form"
              onSubmit={handleVerify}
            >
              <div className="qyx-mobile-verification__field">
                <label htmlFor={`${id}-otp`}>Enter SMS OTP</label>

                <input
                  ref={otpRef}
                  id={`${id}-otp`}
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]+"
                  placeholder="Enter your OTP"
                  value={otp}
                  onChange={(event) =>
                    setOtp(event.target.value.replace(/\D/g, ""))
                  }
                  aria-describedby={`${id}-hint`}
                  disabled={busy}
                  required
                />

                <p id={`${id}-hint`}>
                  Use the latest code sent to your registered number.
                </p>
              </div>

              <div className="qyx-mobile-verification__actions">
                <button
                  type="submit"
                  className="qyx-mobile-verification__primary"
                  disabled={busy || !otp.trim()}
                >
                  {verifying ? "Verifying…" : "Verify mobile"}
                  <ArrowRight aria-hidden="true" />
                </button>

                <button
                  type="button"
                  className="qyx-mobile-verification__resend"
                  onClick={sendOtp}
                  disabled={busy || remainingSeconds > 0}
                >
                  <RefreshCw aria-hidden="true" />

                  {sending
                    ? "Sending…"
                    : remainingSeconds > 0
                    ? `Resend in ${remainingSeconds}s`
                    : "Resend OTP"}
                </button>
              </div>
            </form>
          )}

          <p className="qyx-mobile-verification__note">
            Need to change this number? Update it in your personal
            information, then verify the new number.
          </p>
        </>
      )}

      {feedback && (
        <p
          className={`qyx-mobile-verification__feedback qyx-mobile-verification__feedback--${feedback.type}`}
          role={feedback.type === "error" ? "alert" : "status"}
        >
          {feedback.message}
        </p>
      )}
    </section>
  );
}