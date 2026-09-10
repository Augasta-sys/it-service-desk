import {
  useState,
  type ChangeEvent,
} from "react";

import {
  CheckCircle2,
  FileText,
  FolderKanban,
  Pencil,
  Plus,
  X,
} from "lucide-react";

import type { Category } from "../../types/category";

interface CategoryFormProps {
  initialCategory?: Category | null;
  onSubmit: (category: Category) => void;
  onCancel: () => void;
  loading?: boolean;
}

interface FormData {
  name: string;
  description: string;
  status: "active" | "inactive";
}

interface FormErrors {
  name?: string;
  description?: string;
}

const CategoryForm = ({
  initialCategory,
  onSubmit,
  onCancel,
  loading = false,
}: CategoryFormProps) => {
  const isEditMode = Boolean(initialCategory);

 const [formData, setFormData] = useState<FormData>(() => ({
  name: initialCategory?.name ?? "",
  description: initialCategory?.description ?? "",
  status: initialCategory?.status ?? "active",
}));

const [errors, setErrors] = useState<FormErrors>({});

  /*
   * Handle form fields
   */
  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement |
        HTMLTextAreaElement |
        HTMLSelectElement
    >
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

  /*
   * Validate form
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name =
        "Category name is required.";
    } else if (
      formData.name.trim().length < 2
    ) {
      newErrors.name =
        "Category name must be at least 2 characters.";
    }

    if (!formData.description.trim()) {
      newErrors.description =
        "Category description is required.";
    } else if (
      formData.description.trim().length < 10
    ) {
      newErrors.description =
        "Description must be at least 10 characters.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /*
   * Submit
   */
 const handleSubmit = (
  event: React.FormEvent<HTMLFormElement>
) => {
  event.preventDefault();

  if (!validateForm()) {
    return;
  }

  const category: Category = {
    id: initialCategory?.id ?? "",
    name: formData.name.trim(),
    description: formData.description.trim(),
    status: formData.status,
  };

  onSubmit(category);
};

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="category-form-title"
    >
      {/* Modal */}
     <div className="category-modal w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 border-t-4 border-t-slate-900 bg-white shadow-2xl transition-all duration-300">
        {/* =====================================================
            HEADER
        ====================================================== */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50/70 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex min-w-0 items-center gap-3">
            {/* Icon */}
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm ${
                isEditMode
                  ? "bg-blue-50 text-blue-600"
                  : "bg-slate-900 text-white"
              }`}
            >
              {isEditMode ? (
                <Pencil size={19} />
              ) : (
                <FolderKanban size={19} />
              )}
            </div>

            <div className="min-w-0">
              <h2
                id="category-form-title"
                className="truncate text-base font-bold text-slate-900 sm:text-lg"
              >
                {isEditMode
                  ? "Edit Category"
                  : "Add Category"}
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                {isEditMode
                  ? "Update the category information below."
                  : "Create a new category for organizing support tickets."}
              </p>
            </div>
          </div>

          {/* Close */}
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            aria-label="Close"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-50 hover:text-red-600 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
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
  className="category-form-scroll max-h-[calc(100vh-130px)] overflow-y-auto"
>
          <div className="space-y-5 px-4 py-5 sm:px-6 sm:py-6">
            {/* =================================================
                CATEGORY NAME
            ================================================== */}
            <div>
              <label
                htmlFor="category-name"
                className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-700 sm:text-sm"
              >
                <FolderKanban
                  size={15}
                  className="text-blue-500"
                />

                Category Name

                <span className="text-red-500">
                  *
                </span>
              </label>

              <input
                id="category-name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Hardware"
                disabled={loading}
                autoComplete="off"
                className={`w-full rounded-xl border bg-white px-3.5 py-3 text-sm text-slate-700 outline-none transition-all duration-300 placeholder:text-slate-400 hover:border-slate-300 focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-50 ${
                  errors.name
                    ? "border-red-400 focus:border-red-500 focus:ring-red-50"
                    : "border-slate-200 focus:border-blue-500 focus:ring-blue-50"
                }`}
              />

              {errors.name ? (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  {errors.name}
                </p>
              ) : (
                <p className="mt-1.5 text-[11px] text-slate-400">
                  Use a short and recognizable category name.
                </p>
              )}
            </div>

            {/* =================================================
                DESCRIPTION
            ================================================== */}
            <div>
              <label
                htmlFor="category-description"
                className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-700 sm:text-sm"
              >
                <FileText
                  size={15}
                  className="text-violet-500"
                />

                Description

                <span className="text-red-500">
                  *
                </span>
              </label>

              <textarea
                id="category-description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe what type of support requests belong to this category..."
                rows={5}
                disabled={loading}
                className={`w-full resize-none rounded-xl border bg-white px-3.5 py-3 text-sm leading-6 text-slate-700 outline-none transition-all duration-300 placeholder:text-slate-400 hover:border-slate-300 focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-50 ${
                  errors.description
                    ? "border-red-400 focus:border-red-500 focus:ring-red-50"
                    : "border-slate-200 focus:border-violet-500 focus:ring-violet-50"
                }`}
              />

              <div className="mt-1.5 flex items-center justify-between gap-3">
                {errors.description ? (
                  <p className="flex items-center gap-1.5 text-xs font-medium text-red-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    {errors.description}
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400">
                    Minimum 10 characters.
                  </p>
                )}

                <span className="shrink-0 text-[11px] font-medium text-slate-400">
                  {formData.description.length}
                  /500
                </span>
              </div>
            </div>

            {/* =================================================
                STATUS
            ================================================== */}
            <div>
              <label
                htmlFor="category-status"
                className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-700 sm:text-sm"
              >
                <CheckCircle2
                  size={15}
                  className="text-emerald-500"
                />

                Status
              </label>

              <div className="relative">
                <select
                  id="category-status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full appearance-none rounded-xl border bg-white px-3.5 py-3 pr-10 text-sm font-medium outline-none transition-all duration-300 hover:border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 disabled:cursor-not-allowed disabled:bg-slate-50 ${
                    formData.status ===
                    "active"
                      ? "text-emerald-700"
                      : "text-slate-600"
                  }`}
                >
                  <option value="active">
                    Active
                  </option>

                  <option value="inactive">
                    Inactive
                  </option>
                </select>

                {/* Custom arrow */}
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              {/* Status information */}
              <div
                className={`mt-3 flex items-start gap-2 rounded-xl border px-3 py-2.5 transition-all duration-300 ${
                  formData.status ===
                  "active"
                    ? "border-emerald-100 bg-emerald-50/70"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                    formData.status ===
                    "active"
                      ? "bg-emerald-500"
                      : "bg-slate-400"
                  }`}
                />

                <p
                  className={`text-[11px] leading-5 ${
                    formData.status ===
                    "active"
                      ? "text-emerald-700"
                      : "text-slate-500"
                  }`}
                >
                  {formData.status ===
                  "active"
                    ? "This category will be available when creating new support tickets."
                    : "This category will remain in the system but will not be available for new ticket creation."}
                </p>
              </div>
            </div>
          </div>

          {/* =====================================================
              FOOTER
          ====================================================== */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
            {/* Cancel */}
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-900 bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-700 hover:bg-slate-800 hover:shadow-lg active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                  Saving...
                </>
              ) : (
                <>
                  {isEditMode ? (
                    <Pencil size={15} />
                  ) : (
                    <Plus size={16} />
                  )}

                  {isEditMode
                    ? "Save Changes"
                    : "Create Category"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;