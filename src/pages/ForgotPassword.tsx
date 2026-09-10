import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Headphones } from "lucide-react";
import { getUsers } from "../services/userService";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    const enteredEmail = email.trim().toLowerCase();

    // Email required
    if (!enteredEmail) {
      setError("Email is required.");
      return;
    }

    // Email validation
    if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(enteredEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      const users = await getUsers();

      const userExists = users.find(
        (user) => user.email.toLowerCase() === enteredEmail
      );

      if (!userExists) {
        setError("No account found with this email address.");
        return;
      }

      navigate("/reset-password", {
        state: {
          email: enteredEmail,
        },
      });
    } catch (error) {
      console.error("Forgot password failed:", error);
      setError("Unable to verify your email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form
        onSubmit={handleSubmit}
        className="auth-card login-card"
      >
        <div className="auth-content">

          {/* Header */}
          <div className="auth-header signup-header">
                      <div className="auth-logo">
                        <Headphones
                          size={21}
                          strokeWidth={2.2}
                        />
                      </div>

            <h1 className="auth-title">
              Forgot Password?
            </h1>

            <p className="auth-description">
              Enter your registered email address to reset your password.
            </p>
          </div>

          {/* Email */}
          <div className="auth-field">
            <label
              htmlFor="email"
              className="auth-label"
            >
              Email Address
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value.toLowerCase());
                setError("");
              }}
              placeholder="Enter your email"
              autoComplete="email"
              className="auth-input"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="auth-error">
              <p>{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="auth-button"
          >
            {loading ? "Checking Email..." : "Continue"}
          </button>

          {/* Back to Login */}
          <p className="auth-footer-text">
            Remember your password?{" "}
            <Link
              to="/login"
              className="auth-link"
            >
              Login
            </Link>
          </p>

        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;