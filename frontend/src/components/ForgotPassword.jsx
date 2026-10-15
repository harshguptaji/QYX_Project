import { useEffect, useId, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  RefreshCw,
} from "lucide-react";

import {
  clearPasswordResetFeedback,
  requestPasswordResetOtp,
  resetPassword,
  resetPasswordResetState,
} from "../features/auth/passwordResetSlice";

import "../style/ForgotPassword.css";

const MIN_PASSWORD_LENGTH = 8;
const DEFAULT_RESEND_SECONDS = 60;

export default function ForgotPassword() {
  const dispatch = useDispatch();
  const id = useId();

  const {
    sendStatus,
    sendError,
    sendMessage,
    resetStatus,
    resetError,
    resetMessage,
  } = useSelector((state) => state.passwordReset);

  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [sentEmail, setSentEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");

  const [retryAt, setRetryAt] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const emailRef = useRef(null);
  const otpRef = useRef(null);
  const mountedRef = useRef(false);
  const requestRunningRef = useRef(false);

  const sending = sendStatus === "loading";
  const resetting = resetStatus === "loading";
  const busy = sending || resetting;

  useEffect(() => {
    mountedRef.current = true;
    dispatch(resetPasswordResetState());
    emailRef.current?.focus();

    return () => {
      mountedRef.current = false;
      dispatch(resetPasswordResetState());
    };
  }, [dispatch]);

  useEffect(() => {
    if (!retryAt) return;

    const update = () => {
      const remaining = Math.max(
        0,
        Math.ceil((retryAt - Date.now()) / 1000)
      );

      setRemainingSeconds(remaining);

      if (remaining === 0) setRetryAt(0);
    };

    update();

    const interval = window.setInterval(update, 1000);

    return () => window.clearInterval(interval);
  }, [retryAt]);

  const startCooldown = (seconds) => {
    const duration = Math.max(0, Number(seconds) || 0);

    if (!duration) return;

    setRemainingSeconds(Math.ceil(duration));
    setRetryAt(Date.now() + duration * 1000);
  };

  const sendOtp = async (event) => {
    event?.preventDefault();

    if (
      busy ||
      requestRunningRef.current ||
      remainingSeconds > 0
    ) {
      return;
    }

    const targetEmail =
      step === "reset" ? sentEmail : email.trim().toLowerCase();

    if (!targetEmail) {
      setLocalError("Please enter your email address.");
      return;
    }

    requestRunningRef.current = true;
    setLocalError("");
    dispatch(clearPasswordResetFeedback());

    try {
      const result = await dispatch(
        requestPasswordResetOtp(targetEmail)
      ).unwrap();

      if (!mountedRef.current) return;

      setSentEmail(targetEmail);
      setStep("reset");
      setOtp("");

      startCooldown(
        result.resendAfterSeconds ?? DEFAULT_RESEND_SECONDS
      );

      requestAnimationFrame(() => {
        if (mountedRef.current) otpRef.current?.focus();
      });
    } catch (error) {
      if (mountedRef.current) {
        startCooldown(error?.retryAfterSeconds);
      }
    } finally {
      requestRunningRef.current = false;
    }
  };

  const handleReset = async (event) => {
    event.preventDefault();

    if (busy || requestRunningRef.current) return;

    setLocalError("");
    dispatch(clearPasswordResetFeedback());

    if (!/^\d+$/.test(otp.trim())) {
      setLocalError("Enter the OTP received in your email.");
      return;
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setLocalError(
        `Password must contain at least ${MIN_PASSWORD_LENGTH} characters.`
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setLocalError("The passwords do not match.");
      return;
    }

    requestRunningRef.current = true;

    try {
      await dispatch(
        resetPassword({
          userEmail: sentEmail,
          otp: otp.trim(),
          newPassword,
        })
      ).unwrap();

      if (!mountedRef.current) return;

      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPassword(false);
      setStep("success");
    } catch (error) {
      if (mountedRef.current) {
        startCooldown(error?.retryAfterSeconds);
      }
    } finally {
      requestRunningRef.current = false;
    }
  };

  const changeEmail = () => {
    if (busy || requestRunningRef.current) return;

    dispatch(clearPasswordResetFeedback());
    setLocalError("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setStep("email");

    requestAnimationFrame(() => emailRef.current?.focus());
  };

  const errorMessage = localError || resetError || sendError;

  return (
    <main className="qyx-forgot">
      <div className="qyx-forgot__container">
        <Link to="/" className="qyx-forgot__back">
          <ArrowLeft aria-hidden="true" />
          Back to website
        </Link>

        <section
          className="qyx-forgot__card"
          aria-labelledby={`${id}-title`}
          aria-busy={busy}
        >
          <Link to="/" className="qyx-forgot__brand">
            QYX<span>.</span>
          </Link>

          <div className="qyx-forgot__icon" aria-hidden="true">
            {step === "success" ? <CheckCircle2 /> : <LockKeyhole />}
          </div>

          <p className="qyx-forgot__eyebrow">
            YOUR PRIVATE SPACE
          </p>

          <h1 id={`${id}-title`}>
            {step === "email"
              ? "Forgot your password?"
              : step === "reset"
              ? "Set a new password."
              : "You’re ready to return."}
          </h1>

          <p className="qyx-forgot__description">
            {step === "email"
              ? "Enter your registered email address to request a password reset code."
              : step === "reset"
              ? "Enter the latest OTP from your email and choose a new password."
              : "Your password has been changed. Sign in again with your new password."}
          </p>

          {step === "email" && (
            <form className="qyx-forgot__form" onSubmit={sendOtp}>
              <div className="qyx-forgot__field">
                <label htmlFor={`${id}-email`}>
                  Registered email address
                </label>

                <input
                  ref={emailRef}
                  id={`${id}-email`}
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  maxLength={254}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={busy}
                  required
                />
              </div>

              <button
                type="submit"
                className="qyx-forgot__primary"
                disabled={busy || remainingSeconds > 0}
              >
                {sending
                  ? "Sending OTP…"
                  : remainingSeconds > 0
                  ? `Try again in ${remainingSeconds}s`
                  : "Send reset OTP"}

                <ArrowRight aria-hidden="true" />
              </button>
            </form>
          )}

          {step === "reset" && (
            <>
              <div className="qyx-forgot__destination">
                <Mail aria-hidden="true" />

                <div>
                  <span>Reset code requested for</span>
                  <strong>{sentEmail}</strong>
                </div>

                <button
                  type="button"
                  onClick={changeEmail}
                  disabled={busy}
                >
                  Change
                </button>
              </div>

              <form
                className="qyx-forgot__form"
                onSubmit={handleReset}
              >
                <div className="qyx-forgot__field">
                  <label htmlFor={`${id}-otp`}>Email OTP</label>

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
                    disabled={busy}
                    required
                  />
                </div>

                <div className="qyx-forgot__field">
                  <label htmlFor={`${id}-password`}>
                    New password
                  </label>

                  <div className="qyx-forgot__password">
                    <input
                      id={`${id}-password`}
                      name="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                      minLength={MIN_PASSWORD_LENGTH}
                      value={newPassword}
                      onChange={(event) =>
                        setNewPassword(event.target.value)
                      }
                      disabled={busy}
                      required
                    />

                    <button
                      type="button"
                      aria-label={
                        showPassword
                          ? "Hide passwords"
                          : "Show passwords"
                      }
                      aria-pressed={showPassword}
                      onClick={() => setShowPassword((value) => !value)}
                      disabled={busy}
                    >
                      {showPassword ? (
                        <EyeOff aria-hidden="true" />
                      ) : (
                        <Eye aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="qyx-forgot__field">
                  <label htmlFor={`${id}-confirm`}>
                    Confirm new password
                  </label>

                  <input
                    id={`${id}-confirm`}
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Enter the new password again"
                    minLength={MIN_PASSWORD_LENGTH}
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    disabled={busy}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="qyx-forgot__primary"
                  disabled={busy}
                >
                  {resetting ? "Resetting password…" : "Reset password"}
                  <ArrowRight aria-hidden="true" />
                </button>
              </form>

              <button
                type="button"
                className="qyx-forgot__resend"
                onClick={() => sendOtp()}
                disabled={busy || remainingSeconds > 0}
              >
                <RefreshCw aria-hidden="true" />

                {sending
                  ? "Sending…"
                  : remainingSeconds > 0
                  ? `Resend OTP in ${remainingSeconds}s`
                  : "Resend OTP"}
              </button>

              <p className="qyx-forgot__hint">
                Check your spam folder if you cannot find the email.
                Only the latest OTP is valid.
              </p>
            </>
          )}

          {step !== "success" && errorMessage && (
            <p
              className="qyx-forgot__feedback qyx-forgot__feedback--error"
              role="alert"
            >
              {errorMessage}
            </p>
          )}

          {step === "reset" && sendMessage && !errorMessage && (
            <p className="qyx-forgot__feedback" role="status">
              {sendMessage}
            </p>
          )}

          {step === "success" && (
            <div className="qyx-forgot__success">
              <p className="qyx-forgot__feedback" role="status">
                {resetMessage || "Password reset successfully."}
              </p>

              <Link to="/" className="qyx-forgot__primary">
                Return to home to sign in
                <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          )}

          <div className="qyx-forgot__note">
            <LockKeyhole aria-hidden="true" />
            <p>Keep your OTP and password private.</p>
          </div>
        </section>
      </div>
    </main>
  );
}