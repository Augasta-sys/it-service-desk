import { useState } from "react";
import type { ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Headphones } from "lucide-react";

import {
  getUsers,
  createUser,
} from "../services/userService";

import type { User } from "../types/user";

type FocusedField =
  | "fullName"
  | "email"
  | "phone"
  | "password"
  | "confirmPassword"
  | "department"
  | null;

const SignUp = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    department: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [focusedField, setFocusedField] =
    useState<FocusedField>(null);

  const [pointerPosition, setPointerPosition] = useState({
    x: 0,
    y: 0,
  });

  /* =========================================
     MOUSE
  ========================================= */

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

  /* =========================================
     FORM CHANGE
  ========================================= */

  const handleChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;

    let updatedValue = value;

    if (name === "fullName") {
      updatedValue = value.replace(
        /[^a-zA-Z\s]/g,
        ""
      );
    }

    if (name === "email") {
      updatedValue = value.toLowerCase();
    }

    if (name === "phone") {
      updatedValue = value
        .replace(/\D/g, "")
        .slice(0, 10);
    }

    setFormData((previous) => ({
      ...previous,
      [name]: updatedValue,
    }));

    setError("");
  };

  /* =========================================
     SUBMIT
  ========================================= */

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const fullName =
      formData.fullName.trim();

    const email =
      formData.email.trim().toLowerCase();

    const phone =
      formData.phone.trim();

    const department =
      formData.department.trim();

    if (!fullName) {
      setError("Full name is required.");
      return;
    }

    if (!/^[a-zA-Z\s]+$/.test(fullName)) {
      setError(
        "Full name can contain only letters and spaces."
      );
      return;
    }

    if (fullName.length < 3) {
      setError(
        "Full name must be at least 3 characters."
      );
      return;
    }

    if (!email) {
      setError("Email is required.");
      return;
    }

    if (
      !/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(
        email
      )
    ) {
      setError(
        "Please enter a valid email address using lowercase letters."
      );
      return;
    }

    if (!formData.password) {
      setError("Password is required.");
      return;
    }

    if (formData.password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      setError("Passwords do not match.");
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      setError(
        "Phone number must contain exactly 10 digits."
      );
      return;
    }

    if (!department) {
      setError("Department is required.");
      return;
    }

    try {
      setLoading(true);

      const users = await getUsers();

      const emailExists = users.some(
        (user) =>
          user.email.toLowerCase() === email
      );

      if (emailExists) {
        setError(
          "An account with this email already exists."
        );
        return;
      }

      const newUser: User = {
        id: `USR${Date.now()}`,
        fullName,
        email,
        password: formData.password,
        phone,
        department,
        role: "employee",
        status: "active",
        createdDate: new Date()
          .toISOString()
          .split("T")[0],
      };

      await createUser(newUser);

      setSuccess(
        "Account created successfully. Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error(
        "Sign up failed:",
        error
      );

      setError(
        "Unable to create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================
     CHARACTER LOGIC
  ========================================= */

  const passwordHidden =
    (focusedField === "password" ||
      focusedField === "confirmPassword") &&
    !(
      focusedField === "password"
        ? showPassword
        : showConfirmPassword
    );

  const getPupilStyle = (
    awayDirection: number
  ) => {
    if (passwordHidden) {
      return {
        transform: `translate(
          calc(-50% + ${awayDirection * 5}px),
          calc(-50% + 1px)
        )`,
      };
    }

    const normalField =
      focusedField !== null;

    const lookX = normalField
      ? pointerPosition.x * 0.45
      : pointerPosition.x;

    const lookY = normalField
      ? 0.65
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
    focusedField &&
    focusedField !== "password" &&
    focusedField !== "confirmPassword"
      ? "signup-field-active"
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
        className="auth-card signup-card"
      >
        {/* =========================================
            CHARACTERS
        ========================================= */}

        <div className="character-peek-zone signup-character-zone">
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
            CONTENT
        ========================================= */}

        <div className="auth-content">
          {/* HEADER */}

          <div className="auth-header signup-header">
            <div className="auth-logo">
              <Headphones
                size={21}
                strokeWidth={2.2}
              />
            </div>

            <h1 className="auth-title">
              Create Account
            </h1>

            <p className="auth-description">
              Sign up to use the IT Service Desk
            </p>
          </div>

          {/* FIELDS */}

          <div className="signup-grid">
            {/* FULL NAME */}

            <div className="auth-field signup-full">
              <label
                htmlFor="fullName"
                className="auth-label"
              >
                Full Name
              </label>

              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                onFocus={() =>
                  setFocusedField("fullName")
                }
                onBlur={() =>
                  setFocusedField(null)
                }
                placeholder="Enter your full name"
                autoComplete="name"
                className="auth-input"
              />
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
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                onFocus={() =>
                  setFocusedField("email")
                }
                onBlur={() =>
                  setFocusedField(null)
                }
                placeholder="example@email.com"
                autoComplete="email"
                className="auth-input"
              />
            </div>

            {/* PHONE */}

            <div className="auth-field">
              <label
                htmlFor="phone"
                className="auth-label"
              >
                Phone Number
              </label>

              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={formData.phone}
                onChange={handleChange}
                onFocus={() =>
                  setFocusedField("phone")
                }
                onBlur={() =>
                  setFocusedField(null)
                }
                placeholder="10 digit number"
                autoComplete="tel"
                className="auth-input"
              />
            </div>

            {/* PASSWORD */}

            <div className="auth-field">
              <label
                htmlFor="password"
                className="auth-label"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() =>
                    setFocusedField("password")
                  }
                  onBlur={() =>
                    setFocusedField(null)
                  }
                  placeholder="Enter password"
                  autoComplete="new-password"
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
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD */}

            <div className="auth-field">
              <label
                htmlFor="confirmPassword"
                className="auth-label"
              >
                Confirm Password
              </label>

              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={
                    formData.confirmPassword
                  }
                  onChange={handleChange}
                  onFocus={() =>
                    setFocusedField(
                      "confirmPassword"
                    )
                  }
                  onBlur={() =>
                    setFocusedField(null)
                  }
                  placeholder="Confirm password"
                  autoComplete="new-password"
                  className="auth-input password-input"
                />

                <button
                  type="button"
                  onMouseDown={(event) =>
                    event.preventDefault()
                  }
                  onClick={() =>
                    setShowConfirmPassword(
                      (previous) => !previous
                    )
                  }
                  className="password-toggle"
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>
            </div>

            {/* DEPARTMENT */}

            <div className="auth-field signup-full">
              <label
                htmlFor="department"
                className="auth-label"
              >
                Department
              </label>

              <input
                id="department"
                name="department"
                type="text"
                value={formData.department}
                onChange={handleChange}
                onFocus={() =>
                  setFocusedField("department")
                }
                onBlur={() =>
                  setFocusedField(null)
                }
                placeholder="Enter your department"
                className="auth-input"
              />
            </div>
          </div>

          {/* ERROR */}

          {error && (
            <div className="auth-error">
              <p>{error}</p>
            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <div className="auth-success">
              <p>{success}</p>
            </div>
          )}

          {/* BUTTON */}

          <button
            type="submit"
            disabled={loading}
            className="auth-button signup-button"
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>

          {/* LOGIN */}

          <p className="auth-footer-text">
            Already have an account?{" "}
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

export default SignUp;