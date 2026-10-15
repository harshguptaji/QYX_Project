import { useEffect, useId, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowRight,
  BadgeCheck,
  Mail,
  ShieldCheck,
} from "lucide-react";

import {
  sendEmailVerificationOtp,
  verifyEmailOtp,
  clearEmailVerificationFeedback,
} from "../../features/auth/authSlice";

import "./EmailVerification.css";

// Match this to your backend OTP_RESEND_SECONDS value.
const RESEND_SECONDS = 60;

function EmailVerificationForm({ email, verified }) {
  const dispatch = useDispatch();
  const id = useId();

  const {
    emailOtpSendStatus,
    emailOtpVerifyStatus,
  } = useSelector((state) => state.auth);

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [retryAt, setRetryAt] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [feedback, setFeedback] = useState(null);

  const otpRef = useRef(null);
  const requestRunningRef = useRef(false);
  const activeRef = useRef(false);

  const sending = emailOtpSendStatus === "loading";
  const verifying = emailOtpVerifyStatus === "loading";
  const busy = sending || verifying;

  useEffect(() => {
    activeRef.current = true;
    dispatch(clearEmailVerificationFeedback());

    return () => {
      activeRef.current = false;
    };
  }, [dispatch]);

  useEffect(() => {
    if (!retryAt) return;

    const updateCountdown = () => {
      setRemaining(
        Math.max(0, Math.ceil((retryAt - Date.now()) / 1000))
      );
    };

    updateCountdown();

    const timer = window.setInterval(updateCountdown, 1000);

    return () => window.clearInterval(timer);
  }, [retryAt]);

  useEffect(() => {
    if (verified) {
      setOtp("");
      setOtpSent(false);
    }
  }, [verified]);

  const sendOtp = async () => {
    if (
      busy ||
      verified ||
      remaining > 0 ||
      requestRunningRef.current
    ) {
      return;
    }

    requestRunningRef.current = true;
    setFeedback(null);

    try {
      const result = await dispatch(
        sendEmailVerificationOtp()
      ).unwrap();

      if (!activeRef.current) return;

      setOtpSent(true);
      setOtp("");

      const nextRetry = Date.now() + RESEND_SECONDS * 1000;
      setRetryAt(nextRetry);
      setRemaining(RESEND_SECONDS);

      setFeedback({
        type: "success",
        message: result.message,
      });

      requestAnimationFrame(() => otpRef.current?.focus());
    } catch (error) {
      if (!activeRef.current) return;

      setFeedback({
        type: "error",
        message:
          typeof error === "string"
            ? error
            : "Unable to send OTP.",
      });
    } finally {
      requestRunningRef.current = false;
    }
  };

  const handleVerify = async (event) => {
    event.preventDefault();

    if (busy || verified || requestRunningRef.current) return;

    if (!otp.trim()) {
      setFeedback({
        type: "error",
        message: "Please enter the OTP sent to your email.",
      });
      return;
    }

    requestRunningRef.current = true;
    setFeedback(null);

    try {
      const result = await dispatch(
        verifyEmailOtp(otp.trim())
      ).unwrap();

      if (!activeRef.current) return;

      setOtp("");
      setFeedback({
        type: "success",
        message: result.message,
      });
    } catch (error) {
      if (!activeRef.current) return;

      setFeedback({
        type: "error",
        message:
          typeof error === "string"
            ? error
            : "Unable to verify your email.",
      });
    } finally {
      requestRunningRef.current = false;
    }
  };

  return (
    <section
      className="qyx-email-verification"
      aria-labelledby={`${id}-title`}
    >
      <div className="qyx-email-verification__heading">
        <div className="qyx-email-verification__icon">
          {verified ? (
            <BadgeCheck aria-hidden="true" />
          ) : (
            <Mail aria-hidden="true" />
          )}
        </div>

        <div className="qyx-email-verification__heading-content">
          <p className="qyx-email-verification__eyebrow">
            ACCOUNT VERIFICATION
          </p>

          <h2 id={`${id}-title`}>
            {verified ? "Your email is verified." : "Verify your email."}
          </h2>

          <p>
            {verified
              ? "Your account’s email address has been confirmed."
              : "We’ll send a verification code to your registered email."}
          </p>
        </div>
      </div>

      <div className="qyx-email-verification__email">
        <span>Email address</span>
        <strong>{email}</strong>
      </div>

      {verified ? (
        <div className="qyx-email-verification__verified">
          <ShieldCheck aria-hidden="true" />
          <span>Verified</span>
        </div>
      ) : (
        <>
          {!otpSent ? (
            <button
              type="button"
              className="qyx-email-verification__primary"
              onClick={sendOtp}
              disabled={busy}
            >
              {sending ? "Sending OTP…" : "Send verification OTP"}
              {!sending && <ArrowRight aria-hidden="true" />}
            </button>
          ) : (
            <form
              className="qyx-email-verification__form"
              onSubmit={handleVerify}
              aria-busy={busy}
            >
              <label htmlFor={`${id}-otp`}>
                Verification code
              </label>

              <input
                ref={otpRef}
                id={`${id}-otp`}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="Enter your OTP"
                pattern="[0-9]+"
                value={otp}
                onChange={(event) =>
                  setOtp(event.target.value.replace(/\D/g, ""))
                }
                disabled={busy}
                required
              />

              <div className="qyx-email-verification__actions">
                <button
                  type="submit"
                  className="qyx-email-verification__primary"
                  disabled={busy}
                >
                  {verifying ? "Verifying…" : "Verify email"}
                  {!verifying && <ArrowRight aria-hidden="true" />}
                </button>

                <button
                  type="button"
                  className="qyx-email-verification__resend"
                  onClick={sendOtp}
                  disabled={busy || remaining > 0}
                >
                  {sending
                    ? "Sending…"
                    : remaining > 0
                    ? `Resend in ${remaining}s`
                    : "Resend OTP"}
                </button>
              </div>
            </form>
          )}

          <p className="qyx-email-verification__help">
            Check your inbox and spam folder. Requesting another code
            replaces the previous one.
          </p>
        </>
      )}

      {feedback && (
        <p
          className={`qyx-email-verification__feedback qyx-email-verification__feedback--${feedback.type}`}
          role={feedback.type === "error" ? "alert" : "status"}
        >
          {feedback.message}
        </p>
      )}
    </section>
  );
}

export default function EmailVerification() {
  const user = useSelector((state) => state.auth.user);

  if (!user?.email) return null;

  return (
    <EmailVerificationForm
      key={`${user.id}-${user.email}`}
      email={user.email}
      verified={Boolean(user.emailVerified)}
    />
  );
}