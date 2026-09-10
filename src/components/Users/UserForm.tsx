import {
  useState,
  type ChangeEvent,
  type SubmitEvent,
} from "react";

import {
  Eye,
  EyeOff,
  UserRound,
  Mail,
  LockKeyhole,
  Phone,
  Building2,
  ShieldCheck,
  CircleCheck,
  Pencil,
  UserPlus,
} from "lucide-react";

import type {
  User,
  UserRole,
  UserStatus,
} from "../../types/user";

interface UserFormProps {
  initialUser?: User | null;
  onSubmit: (user: User) => void;
  onCancel: () => void;
}

interface FormData {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  department: string;
  role: UserRole;
  status: UserStatus;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  phone?: string;
  department?: string;
}

const UserForm = ({
  initialUser,
  onSubmit,
  onCancel,
}: UserFormProps) => {
  const isEditMode = Boolean(initialUser);

const [formData, setFormData] = useState<FormData>(() => ({
  fullName: initialUser?.fullName ?? "",
  email: initialUser?.email ?? "",
  password: initialUser?.password ?? "",
  phone: initialUser?.phone ?? "",
  department: initialUser?.department ?? "",
  role: initialUser?.role ?? "employee",
  status: initialUser?.status ?? "active",
}));

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  /*
   * Handle input changes
   */
  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;

    if (name === "fullName") {
      const alphabetOnly = value.replace(
        /[^a-zA-Z\s]/g,
        ""
      );

      setFormData((previous) => ({
        ...previous,
        fullName: alphabetOnly,
      }));
    } else if (name === "email") {
      setFormData((previous) => ({
        ...previous,
        email: value.toLowerCase(),
      }));
    } else if (name === "phone") {
      const numbersOnly = value
        .replace(/\D/g, "")
        .slice(0, 10);

      setFormData((previous) => ({
        ...previous,
        phone: numbersOnly,
      }));
    } else {
      setFormData((previous) => ({
        ...previous,
        [name]: value,
      }));
    }

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  /*
   * Validate form
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName =
        "Full name is required.";
    } else if (
      formData.fullName.trim().length < 3
    ) {
      newErrors.fullName =
        "Full name must be at least 3 characters.";
    }

    if (!formData.email.trim()) {
      newErrors.email =
        "Email is required.";
    } else if (
      !/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(
        formData.email
      )
    ) {
      newErrors.email =
        "Please enter a valid email address.";
    }

    if (!formData.password) {
      newErrors.password =
        "Password is required.";
    } else if (
      formData.password.length < 6
    ) {
      newErrors.password =
        "Password must be at least 6 characters.";
    }

    if (!formData.phone.trim()) {
      newErrors.phone =
        "Phone number is required.";
    } else if (
      !/^\d{10}$/.test(formData.phone)
    ) {
      newErrors.phone =
        "Phone number must contain exactly 10 digits.";
    }

    if (!formData.department.trim()) {
      newErrors.department =
        "Department is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /*
   * Submit form
   */
  const handleSubmit = (
    event: SubmitEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const newUser: User = {
      id: initialUser?.id ?? "",
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      password: formData.password,
      phone: formData.phone.trim(),
      department: formData.department.trim(),
      role: formData.role,
      status: formData.status,
      createdDate:
        initialUser?.createdDate ??
        new Date().toISOString().split("T")[0],
    };

    onSubmit(newUser);
  };

  /*
   * Input styles
   */
  const getInputClass = (
    fieldError?: string
  ) =>
    `w-full rounded-xl border bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 ${
      fieldError
        ? "border-red-400 hover:border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
        : "border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
    }`;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >

      {/* Basic Information */}
      <div className="rounded-2xl border border-slate-100 border-t-4 border-t-indigo-500 bg-slate-50/50 p-4 transition-all duration-300 hover:border-slate-200 hover:border-t-indigo-600 hover:shadow-sm sm:p-5">

        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <UserRound size={17} />
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Basic Information
            </h3>

            <p className="mt-0.5 text-[11px] text-slate-500">
              Enter the user's contact and account details.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

          {/* Full Name */}
          <div>
            <label
              htmlFor="fullName"
              className="mb-1.5 block text-xs font-bold text-slate-700"
            >
              Full Name
            </label>

            <div className="relative">
              <UserRound
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter full name"
                autoComplete="name"
                className={getInputClass(
                  errors.fullName
                )}
              />
            </div>

            {errors.fullName && (
              <p className="mt-1.5 text-[11px] font-medium text-red-500">
                {errors.fullName}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-xs font-bold text-slate-700"
            >
              Email
            </label>

            <div className="relative">
              <Mail
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                autoComplete="email"
                className={getInputClass(
                  errors.email
                )}
              />
            </div>

            {errors.email && (
              <p className="mt-1.5 text-[11px] font-medium text-red-500">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-xs font-bold text-slate-700"
            >
              Password
            </label>

            <div className="relative">
              <LockKeyhole
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

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
                placeholder="Enter password"
                autoComplete="new-password"
                className={`${getInputClass(
                  errors.password
                )} pr-11`}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (previous) => !previous
                  )
                }
                className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition-all duration-300 hover:bg-slate-100 hover:text-slate-700 active:scale-90"
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
              </button>
            </div>

            {errors.password && (
              <p className="mt-1.5 text-[11px] font-medium text-red-500">
                {errors.password}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="phone"
              className="mb-1.5 block text-xs font-bold text-slate-700"
            >
              Phone Number
            </label>

            <div className="relative">
              <Phone
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter 10-digit phone number"
                maxLength={10}
                inputMode="numeric"
                autoComplete="tel"
                className={getInputClass(
                  errors.phone
                )}
              />
            </div>

            {errors.phone && (
              <p className="mt-1.5 text-[11px] font-medium text-red-500">
                {errors.phone}
              </p>
            )}
          </div>

        </div>
      </div>

      {/* Organization & Access */}
      <div className="rounded-2xl border border-slate-100 border-t-4 border-t-cyan-500 bg-slate-50/50 p-4 transition-all duration-300 hover:border-slate-200 hover:border-t-cyan-600 hover:shadow-sm sm:p-5">

        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
            <Building2 size={17} />
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Organization & Access
            </h3>

            <p className="mt-0.5 text-[11px] text-slate-500">
              Configure department, role and account status.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

          {/* Department */}
          <div>
            <label
              htmlFor="department"
              className="mb-1.5 block text-xs font-bold text-slate-700"
            >
              Department
            </label>

            <div className="relative">
              <Building2
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="department"
                name="department"
                type="text"
                value={formData.department}
                onChange={handleChange}
                placeholder="Enter department"
                className={getInputClass(
                  errors.department
                )}
              />
            </div>

            {errors.department && (
              <p className="mt-1.5 text-[11px] font-medium text-red-500">
                {errors.department}
              </p>
            )}
          </div>

          {/* Role */}
          <div>
            <label
              htmlFor="role"
              className="mb-1.5 block text-xs font-bold text-slate-700"
            >
              Role
            </label>

            <div className="relative">
              <ShieldCheck
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pl-10 pr-9 text-sm font-medium text-slate-900 outline-none transition-all duration-300 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              >
                <option value="employee">
                  Employee
                </option>

                <option value="support_agent">
                  Support Agent
                </option>

                <option value="admin">
                  Admin
                </option>
              </select>

              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                ▼
              </span>
            </div>
          </div>

          {/* Status */}
          <div>
            <label
              htmlFor="status"
              className="mb-1.5 block text-xs font-bold text-slate-700"
            >
              Status
            </label>

            <div className="relative">
              <CircleCheck
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pl-10 pr-9 text-sm font-medium text-slate-900 outline-none transition-all duration-300 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              >
                <option value="active">
                  Active
                </option>

                <option value="inactive">
                  Inactive
                </option>
              </select>

              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                ▼
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">

        <button
          type="button"
          onClick={onCancel}
          className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 hover:shadow-md active:translate-y-0 active:scale-[0.98] sm:w-auto"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-900 bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-700 hover:bg-slate-800 hover:shadow-lg active:translate-y-0 active:scale-[0.98] sm:w-auto"
        >
          {isEditMode ? (
            <>
              <Pencil size={15} />
              Save Changes
            </>
          ) : (
            <>
              <UserPlus size={15} />
              Create User
            </>
          )}
        </button>

      </div>
    </form>
  );
};

export default UserForm;