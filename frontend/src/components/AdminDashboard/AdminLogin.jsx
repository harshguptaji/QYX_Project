import { useEffect, useId, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";

import {
  clearAdminAuthFeedback,
  getCurrentAdmin,
  loginAdmin,
} from "../../features/admin/auth/adminAuthSlice";

import logoImg from "../../assets/logo.png";
import "./AdminLogin.css";

export default function AdminLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const id = useId();

  const [showPassword, setShowPassword] = useState(false);

  const emailRef = useRef(null);
  const submittingRef = useRef(false);

  const {
    admin,
    isAuthChecked,
    loginStatus,
    loginError,
    sessionStatus,
    sessionError,
  } = useSelector((state) => state.adminAuth);

  const loading = loginStatus === "loading";
  const checking = !isAuthChecked || sessionStatus === "loading";

  useEffect(() => {
    dispatch(clearAdminAuthFeedback());

    const request = dispatch(getCurrentAdmin());

    return () => request.abort();
  }, [dispatch]);

  useEffect(() => {
    if (admin) {
      navigate("/accios", { replace: true });
    }
  }, [admin, navigate]);

  useEffect(() => {
    if (!checking && !admin) {
      emailRef.current?.focus();
    }
  }, [checking, admin]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading || checking || submittingRef.current) return;

    const form = event.currentTarget;
    const data = new FormData(form);

    submittingRef.current = true;

    try {
      await dispatch(
        loginAdmin({
          adminEmail: String(data.get("adminEmail") || "")
            .trim()
            .toLowerCase(),
          adminPassword: String(data.get("adminPassword") || ""),
        })
      ).unwrap();

      // The admin-state effect navigates after successful login.
    } catch {
      // Redux displays the backend error.
    } finally {
      submittingRef.current = false;
    }
  };

  return (
    <main className="qyx-admin-login">
      <div className="qyx-admin-login__container">
        <Link to="/" className="qyx-admin-login__back">
          <ArrowLeft aria-hidden="true" />
          Back to website
        </Link>

        <section
          className="qyx-admin-login__card"
          aria-labelledby={`${id}-title`}
          aria-busy={checking || loading}
        >
          <Link to="/" className="qyx-admin-login__logo">
            <img src={logoImg} alt="QYX MedTech home" />
          </Link>

          <div className="qyx-admin-login__icon" aria-hidden="true">
            <ShieldCheck />
          </div>

          <p className="qyx-admin-login__eyebrow">
            ADMIN WORKSPACE
          </p>

          <h1 id={`${id}-title`}>Welcome to your workspace.</h1>

          <p className="qyx-admin-login__description">
            Sign in with your admin credentials to manage QYX.
          </p>

          {checking || admin ? (
            <p className="qyx-admin-login__message" role="status">
              {admin ? "Opening dashboard…" : "Checking admin session…"}
            </p>
          ) : (
            <>
              {sessionError && (
                <p
                  className="qyx-admin-login__error"
                  role="alert"
                >
                  {sessionError} You can try signing in below.
                </p>
              )}

              <form
                className="qyx-admin-login__form"
                onSubmit={handleSubmit}
              >
                <div className="qyx-admin-login__field">
                  <label htmlFor={`${id}-email`}>Admin email</label>

                  <input
                    ref={emailRef}
                    id={`${id}-email`}
                    name="adminEmail"
                    type="email"
                    placeholder="admin@example.com"
                    autoComplete="username"
                    maxLength={254}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="qyx-admin-login__field">
                  <label htmlFor={`${id}-password`}>Password</label>

                  <div className="qyx-admin-login__password">
                    <input
                      id={`${id}-password`}
                      name="adminPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your admin password"
                      autoComplete="current-password"
                      disabled={loading}
                      required
                    />

                    <button
                      type="button"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      aria-pressed={showPassword}
                      aria-controls={`${id}-password`}
                      onClick={() => setShowPassword((value) => !value)}
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff aria-hidden="true" />
                      ) : (
                        <Eye aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>

                {loginError && (
                  <p className="qyx-admin-login__error" role="alert">
                    {loginError}
                  </p>
                )}

                <button
                  type="submit"
                  className="qyx-admin-login__submit"
                  disabled={loading}
                >
                  {loading ? "Signing in…" : "Sign in to dashboard"}
                  <ArrowRight aria-hidden="true" />
                </button>
              </form>
            </>
          )}

          <div className="qyx-admin-login__note">
            <ShieldCheck aria-hidden="true" />
            <p>For authorized QYX administrators.</p>
          </div>
        </section>
      </div>
    </main>
  );
}