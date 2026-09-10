import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Headphones } from "lucide-react";
import { getUsers, updateUser } from "../services/userService";

interface LocationState {
  email?: string;
}

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as LocationState | null;
  const email = state?.email || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

const handleSubmit = async (event: {
  preventDefault: () => void;
}) => {
  event.preventDefault();

    setError("");
    setSuccess("");

    if (!email) {
      setError("Invalid password reset request.");
      return;
    }

    if (!password) {
      setError("New password is required.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!confirmPassword) {
      setError("Please confirm your new password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const users = await getUsers();

      const user = users.find(
        (item) => item.email.toLowerCase() === email.toLowerCase()
      );

      if (!user) {
        setError("Account not found.");
        return;
      }

      await updateUser(user.id, {
        password,
      });

      setSuccess("Password reset successfully. Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error("Password reset failed:", error);
      setError("Unable to reset your password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page reset-password-page">
      <div className="auth-card reset-password-card">
        <div className="auth-content reset-password-content">
          {/* Logo / Icon */}
            <div className="auth-header signup-header">
                                <div className="auth-logo">
                                  <Headphones
                                    size={21}
                                    strokeWidth={2.2}
                                  />
                                </div>

            <h1 className="auth-title">Reset Password</h1>

            <p className="auth-description">
              Create a new password to securely access your account.
            </p>

            {email && (
              <div className="reset-email">
                <ShieldCheck size={16} />
                <span>{email}</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="reset-password-form">
            {/* New Password */}
            <div className="auth-field">
              <label htmlFor="password" className="auth-label">
                New Password
              </label>

              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                    setSuccess("");
                  }}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  className="auth-input password-input"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  className="password-toggle"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="auth-field">
              <label htmlFor="confirmPassword" className="auth-label">
                Confirm Password
              </label>

              <div className="password-input-wrapper">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    setError("");
                    setSuccess("");
                  }}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  className="auth-input password-input"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((previous) => !previous)
                  }
                  className="password-toggle"
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {/* Password requirement */}
            <p className="password-hint">
              Password must contain at least 6 characters.
            </p>

            {/* Error */}
            {error && (
              <div className="auth-error reset-message" role="alert">
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="auth-success reset-message" role="status">
                {success}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="auth-button reset-password-button"
            >
              {loading ? (
                <>
                  <span className="button-spinner" />
                  Resetting Password...
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>

          {/* Login */}
          <p className="auth-footer-text reset-footer">
            Remember your password?{" "}
            <Link to="/login" className="auth-link">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;