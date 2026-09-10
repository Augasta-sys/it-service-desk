import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Headphones } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import "../styles/auth.css";

type FocusedField = "email" | "password" | null;

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [focusedField, setFocusedField] =
    useState<FocusedField>(null);

  const [pointerPosition, setPointerPosition] = useState({
    x: 0,
    y: 0,
  });

  const handleMouseMove = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    const rect =
      event.currentTarget.getBoundingClientRect();

    const x =
      ((event.clientX - rect.left) / rect.width) * 2 - 1;

    const y =
      ((event.clientY - rect.top) / rect.height) * 2 - 1;

    setPointerPosition({
      x: Math.max(-1, Math.min(1, x)),
      y: Math.max(-1, Math.min(1, y)),
    });
  };

  const handleMouseLeave = () => {
    setPointerPosition({
      x: 0,
      y: 0,
    });
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    const success = await login(email, password);

    if (!success) {
      setError("Invalid email or password.");
      return;
    }

    navigate("/dashboard");
  };

  const passwordHidden =
    focusedField === "password" && !showPassword;

  const getPupilStyle = (awayDirection: number) => {
    if (passwordHidden) {
      return {
        transform: `translate(
          calc(-50% + ${awayDirection * 5}px),
          calc(-50% + 1px)
        )`,
      };
    }

    const lookX =
      focusedField === "email"
        ? pointerPosition.x * 0.35
        : pointerPosition.x;

    const lookY =
      focusedField === "email"
        ? 0.75
        : pointerPosition.y;

    return {
      transform: `translate(
        calc(-50% + ${lookX * 5}px),
        calc(-50% + ${lookY * 3}px)
      )`,
    };
  };

  const charactersClass = [
    "login-characters",
    focusedField === "email"
      ? "email-active"
      : "",
    passwordHidden
      ? "password-protection"
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className="auth-page"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <form
        onSubmit={handleSubmit}
        className="auth-card login-card"
      >
        {/* =========================================
            THREE CHARACTERS
        ========================================= */}

        <div className="character-peek-zone">
          <div className={charactersClass}>
            {/* LEFT */}
            <div className="login-character character-one">
              <div className="character-body">
                <div className="character-shirt" />
              </div>

              <div className="character-head">
                <div className="character-hair" />

                <div className="character-eye character-eye-left">
                  <span
                    className="character-pupil"
                    style={getPupilStyle(-1)}
                  />
                </div>

                <div className="character-eye character-eye-right">
                  <span
                    className="character-pupil"
                    style={getPupilStyle(-1)}
                  />
                </div>

                <div className="character-nose" />
                <div className="character-mouth" />
              </div>
            </div>

            {/* CENTER */}
            <div className="login-character character-two">
              <div className="character-body">
                <div className="character-shirt" />
              </div>

              <div className="character-head">
                <div className="character-hair" />

                <div className="character-eye character-eye-left">
                  <span
                    className="character-pupil"
                    style={getPupilStyle(-1)}
                  />
                </div>

                <div className="character-eye character-eye-right">
                  <span
                    className="character-pupil"
                    style={getPupilStyle(1)}
                  />
                </div>

                <div className="character-nose" />
                <div className="character-mouth" />
              </div>
            </div>

            {/* RIGHT */}
            <div className="login-character character-three">
              <div className="character-body">
                <div className="character-shirt" />
              </div>

              <div className="character-head">
                <div className="character-hair" />

                <div className="character-eye character-eye-left">
                  <span
                    className="character-pupil"
                    style={getPupilStyle(1)}
                  />
                </div>

                <div className="character-eye character-eye-right">
                  <span
                    className="character-pupil"
                    style={getPupilStyle(1)}
                  />
                </div>

                <div className="character-nose" />
                <div className="character-mouth" />
              </div>
            </div>
          </div>
        </div>

        {/* =========================================
            LOGIN CONTENT
        ========================================= */}

        <div className="auth-content">
          {/* HEADER */}

          <div className="auth-header">
            <div className="auth-logo">
              <Headphones
                size={22}
                strokeWidth={2.2}
              />
            </div>

            <h1 className="auth-title">
              IT Service Desk
            </h1>

            <p className="auth-description">
              Sign in to manage your tickets and support
              requests.
            </p>
          </div>

          {/* EMAIL */}

          <div className="auth-field">
            <label
              htmlFor="email"
              className="auth-label"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              onFocus={() =>
                setFocusedField("email")
              }
              onBlur={() =>
                setFocusedField(null)
              }
              placeholder="Enter your email"
              autoComplete="email"
              className="auth-input"
            />
          </div>

          {/* PASSWORD */}

          <div className="auth-field password-field">
            <div className="password-label-row">
              <label
                htmlFor="password"
                className="auth-label"
              >
                Password
              </label>

              <Link
                to="/forgot-password"
                className="auth-link auth-forgot"
              >
                Forgot Password?
              </Link>
            </div>

            <div className="relative">
              <input
                id="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                onFocus={() =>
                  setFocusedField("password")
                }
                onBlur={() =>
                  setFocusedField(null)
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                className="auth-input password-input"
              />

              <button
                type="button"
                onMouseDown={(event) =>
                  event.preventDefault()
                }
                onClick={() =>
                  setShowPassword(
                    (previous) => !previous
                  )
                }
                className="password-toggle"
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {/* ERROR */}

          {error && (
            <div className="auth-error">
              <p>{error}</p>
            </div>
          )}

          {/* LOGIN */}

          <button
            type="submit"
            className="auth-button"
          >
            Login
          </button>

          {/* SIGN UP */}

          <p className="auth-footer-text">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="auth-link"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;