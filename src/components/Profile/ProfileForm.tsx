import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import {
  Eye,
  EyeOff,
  X,
} from "lucide-react";

import type { User } from "../../types/user";

interface ProfileFormProps {
  user: User;
  onSubmit: (user: User) => void;
  onCancel: () => void;
  loading?: boolean;
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  department: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  department?: string;
  password?: string;
  confirmPassword?: string;
}

const ProfileForm = ({
  user,
  onSubmit,
  onCancel,
  loading = false,
}: ProfileFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    department: user.department,
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  /*
   * Prevent the background page from scrolling
   * while the Edit Profile popup is open.
   */
  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalBodyOverflow;
    };
  }, []);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email
      )
    ) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    }

    if (!formData.department.trim()) {
      newErrors.department =
        "Department is required.";
    }

    if (formData.password) {
      if (formData.password.length < 6) {
        newErrors.password =
          "Password must be at least 6 characters.";
      }

      if (
        formData.password !==
        formData.confirmPassword
      ) {
        newErrors.confirmPassword =
          "Passwords do not match.";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const updatedUser: User = {
      ...user,
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      department: formData.department.trim(),
      password: formData.password
        ? formData.password
        : user.password,
      role: user.role,
      status: user.status,
    };

    onSubmit(updatedUser);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-form-title"
    >
      {/* =====================================================
          EDIT PROFILE POPUP
      ====================================================== */}
      <div
        className="
          profile-edit-popup
          flex
          max-h-[92vh]
          w-full
          max-w-2xl
          flex-col
          overflow-y-auto
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-2xl
        "
      >
        {/* =====================================================
            HEADER
        ====================================================== */}
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-slate-50/70 px-5 py-4 sm:px-6">
          <div>
            <h2
              id="profile-form-title"
              className="text-lg font-bold text-slate-900 sm:text-xl"
            >
              Edit Profile
            </h2>

            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Update your profile information below.
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            aria-label="Close"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* =====================================================
            FORM
        ====================================================== */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex min-h-0 flex-col"
        >
          <div className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">

            {/* Full Name */}
            <div>
              <label
                htmlFor="profile-fullName"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Full Name
              </label>

              <input
                id="profile-fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                disabled={loading}
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:ring-4 ${
                  errors.fullName
                    ? "border-red-400 focus:border-red-500 focus:ring-red-50"
                    : "border-slate-200 focus:border-blue-500 focus:ring-blue-50"
                }`}
              />

              {errors.fullName && (
                <p className="mt-1.5 text-xs text-red-500">
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="profile-email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email
              </label>

              <input
                id="profile-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:ring-4 ${
                  errors.email
                    ? "border-red-400 focus:border-red-500 focus:ring-red-50"
                    : "border-slate-200 focus:border-blue-500 focus:ring-blue-50"
                }`}
              />

              {errors.email && (
                <p className="mt-1.5 text-xs text-red-500">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="profile-phone"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Phone
              </label>

              <input
                id="profile-phone"
                name="phone"
                type="text"
                value={formData.phone}
                onChange={handleChange}
                disabled={loading}
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:ring-4 ${
                  errors.phone
                    ? "border-red-400 focus:border-red-500 focus:ring-red-50"
                    : "border-slate-200 focus:border-blue-500 focus:ring-blue-50"
                }`}
              />

              {errors.phone && (
                <p className="mt-1.5 text-xs text-red-500">
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Department */}
            <div>
              <label
                htmlFor="profile-department"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Department
              </label>

              <input
                id="profile-department"
                name="department"
                type="text"
                value={formData.department}
                onChange={handleChange}
                disabled={loading}
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:ring-4 ${
                  errors.department
                    ? "border-red-400 focus:border-red-500 focus:ring-red-50"
                    : "border-slate-200 focus:border-blue-500 focus:ring-blue-50"
                }`}
              />

              {errors.department && (
                <p className="mt-1.5 text-xs text-red-500">
                  {errors.department}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="profile-password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                New Password
              </label>

              <div className="relative">
                <input
                  id="profile-password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Leave blank to keep current password"
                  className={`w-full rounded-xl border bg-white px-4 py-3 pr-12 text-sm text-slate-700 outline-none transition focus:ring-4 ${
                    errors.password
                      ? "border-red-400 focus:border-red-500 focus:ring-red-50"
                      : "border-slate-200 focus:border-blue-500 focus:ring-blue-50"
                  }`}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (previous) => !previous
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
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

              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="profile-confirmPassword"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Confirm New Password
              </label>

              <div className="relative">
                <input
                  id="profile-confirmPassword"
                  name="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Confirm new password"
                  className={`w-full rounded-xl border bg-white px-4 py-3 pr-12 text-sm text-slate-700 outline-none transition focus:ring-4 ${
                    errors.confirmPassword
                      ? "border-red-400 focus:border-red-500 focus:ring-red-50"
                      : "border-slate-200 focus:border-blue-500 focus:ring-blue-50"
                  }`}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (previous) => !previous
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-red-500">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          {/* =====================================================
              FOOTER
          ====================================================== */}
          <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50/70 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileForm;