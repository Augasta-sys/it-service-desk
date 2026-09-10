import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

import {
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  FileText,
  Send,
  ShieldCheck,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { getCategories } from "../../services/categoryService";
import { createTicket } from "../../services/ticketService";
import { createActivity } from "../../services/activityService";

import type { Category } from "../../types/category";
import type {
  ContactMethod,
  TicketPriority,
  Ticket,
} from "../../types/ticket";

interface FormData {
  subject: string;
  description: string;
  category: string;
  priority: TicketPriority;
  preferredContactMethod: ContactMethod;
}

interface FormErrors {
  subject?: string;
  description?: string;
  category?: string;
  priority?: string;
  preferredContactMethod?: string;
}

const CreateTicket = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [formData, setFormData] = useState<FormData>({
    subject: "",
    description: "",
    category: "",
    priority: "medium",
    preferredContactMethod: "email",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  /*
   * Load active categories
   */
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        setError("");

        const data = await getCategories();

        setCategories(
          data.filter((category) => category.status === "active"),
        );
      } catch (error) {
        console.error("Failed to load categories:", error);

        setError("Unable to load categories. Please try again.");
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  /*
   * Handle input changes
   */
  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: undefined,
    }));

    setError("");
  };

  /*
   * Validate form
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required.";
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject =
        "Subject must contain at least 5 characters.";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required.";
    } else if (formData.description.trim().length < 10) {
      newErrors.description =
        "Description must contain at least 10 characters.";
    }

    if (!formData.category) {
      newErrors.category = "Please select a category.";
    }

    if (!formData.priority) {
      newErrors.priority = "Please select a priority.";
    }

    if (!formData.preferredContactMethod) {
      newErrors.preferredContactMethod =
        "Please select a contact method.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /*
   * Generate ticket ID
   */
  const generateTicketId = (): string => {
    return `TKT${Date.now()}`;
  };

  /*
   * Generate due date
   */
  const generateDueDate = (): string => {
    const dueDate = new Date();

    dueDate.setDate(dueDate.getDate() + 3);

    return dueDate.toISOString().split("T")[0];
  };

  /*
   * Submit ticket
   */
  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!user) {
      setError(
        "You must be logged in to create a ticket.",
      );
      return;
    }

    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const today = new Date()
        .toISOString()
        .split("T")[0];

      const newTicket: Ticket = {
        id: generateTicketId(),
        subject: formData.subject.trim(),
        description: formData.description.trim(),
        createdBy: user.id,
        assignedAgent: null,

        assignmentDate: null,

        category: formData.category,
        priority: formData.priority,
        status: "open",
        createdDate: today,
        updatedDate: today,
        dueDate: generateDueDate(),

        preferredContactMethod:
          formData.preferredContactMethod,

        resolution: "",
        resolutionNotes: "",
        resolutionDate: null,
      };

      // 1. Create the ticket
      await createTicket(newTicket);

      /*
       * 2. Record ticket creation in activity history
       */
      try {
        const now = new Date();

        await createActivity({
          id: `ACT${Date.now()}`,
          ticketId: newTicket.id,
          type: "created",
          description: `${user.fullName} created this ticket.`,
          performedBy: user.id,
          createdDate: today,
          createdTime: now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        });
      } catch (activityError) {
        console.error(
          "Failed to create ticket activity:",
          activityError,
        );
      }

      // 3. Go back to My Tickets
      navigate("/my-tickets", {
        replace: true,
        state: {
          successMessage:
            "Ticket created successfully.",
        },
      });
    } catch (error) {
      console.error(
        "Failed to create ticket:",
        error,
      );

      setError(
        "Unable to create ticket. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /*
   * Loading categories
   */
  if (loadingCategories) {
    return (
      <div className="flex min-h-80 w-full items-center justify-center rounded-2xl border border-slate-200 border-t-4 border-t-slate-900 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />

          <p className="text-sm font-medium text-slate-500">
            Loading categories...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl pb-8">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="
          group
          mb-5
          inline-flex
          items-center
          gap-2
          rounded-lg
          border
          border-transparent
          px-3
          py-2
          text-sm
          font-semibold
          text-slate-600
          transition-all
          duration-200
          hover:border-slate-200
          hover:bg-white
          hover:text-slate-900
          hover:shadow-sm
          active:scale-95
        "
      >
        <ArrowLeft
          size={17}
          className="transition-transform duration-200 group-hover:-translate-x-1"
        />

        Back
      </button>

      {/* Page Header */}
      <div
        className="
          group
          relative
          mb-5
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          border-t-4
          border-t-slate-900
          bg-white
          p-5
          shadow-sm
          transition-all
          duration-300
          hover:border-slate-300
          hover:border-t-slate-950
          hover:shadow-lg
          sm:p-6
        "
      >
        {/* Decorative background */}
        <div
          className="
            pointer-events-none
            absolute
            -right-12
            -top-12
            h-32
            w-32
            rounded-full
            bg-slate-900
            opacity-[0.035]
            transition-transform
            duration-500
            group-hover:scale-150
          "
        />

        <div className="relative flex items-start gap-4">
          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              text-slate-700
              shadow-sm
              transition-all
              duration-300
              group-hover:border-slate-300
              group-hover:bg-slate-100
              group-hover:shadow-md
            "
          >
            <FileText size={21} />
          </div>

          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Create Ticket
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Submit a new IT support request. Provide
              enough information so the support team can
              understand and resolve your issue.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="
          group/form
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          border-t-4
          border-t-blue-600
          bg-white
          shadow-sm
          transition-all
          duration-300
          hover:border-slate-300
          hover:border-t-blue-700
          hover:shadow-lg
        "
      >
        <div className="space-y-7 p-5 sm:p-6 lg:p-8">
          {/* General error */}
          {error && (
            <div
              className="
                flex
                items-start
                gap-3
                rounded-xl
                border
                border-red-200
                bg-red-50
                px-4
                py-3.5
                shadow-sm
                transition-all
                duration-200
              "
            >
              <CircleAlert
                size={19}
                className="mt-0.5 shrink-0 text-red-600"
              />

              <div>
                <p className="text-sm font-semibold text-red-800">
                  Something went wrong
                </p>

                <p className="mt-0.5 text-sm text-red-700">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Subject */}
          <div className="group/field">
            <label
              htmlFor="subject"
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-slate-700
                transition-colors
                group-focus-within/field:text-slate-900
              "
            >
              Subject

              <span className="ml-1 text-red-500">
                *
              </span>
            </label>

            <input
              id="subject"
              name="subject"
              type="text"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Enter a short description of the issue"
              className={`
                w-full
                rounded-xl
                border
                bg-white
                px-4
                py-3
                text-sm
                text-slate-700
                outline-none
                transition-all
                duration-200
                placeholder:text-slate-400
                hover:border-slate-300
                focus:ring-4
                ${
                  errors.subject
                    ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                    : "border-slate-200 focus:border-slate-500 focus:ring-slate-100"
                }
              `}
            />

            {errors.subject && (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600">
                <CircleAlert size={13} />
                {errors.subject}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="group/field">
            <label
              htmlFor="description"
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-slate-700
                transition-colors
                group-focus-within/field:text-slate-900
              "
            >
              Description

              <span className="ml-1 text-red-500">
                *
              </span>
            </label>

            <textarea
              id="description"
              name="description"
              rows={6}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the issue in detail..."
              className={`
                w-full
                resize-y
                rounded-xl
                border
                bg-white
                px-4
                py-3
                text-sm
                leading-6
                text-slate-700
                outline-none
                transition-all
                duration-200
                placeholder:text-slate-400
                hover:border-slate-300
                focus:ring-4
                ${
                  errors.description
                    ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                    : "border-slate-200 focus:border-slate-500 focus:ring-slate-100"
                }
              `}
            />

            {errors.description && (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600">
                <CircleAlert size={13} />
                {errors.description}
              </p>
            )}
          </div>

          {/* Category / Priority */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Category */}
            <div className="group/field">
              <label
                htmlFor="category"
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-slate-700
                  transition-colors
                  group-focus-within/field:text-slate-900
                "
              >
                Category

                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`
                  w-full
                  cursor-pointer
                  rounded-xl
                  border
                  bg-white
                  px-4
                  py-3
                  text-sm
                  text-slate-700
                  outline-none
                  transition-all
                  duration-200
                  hover:border-slate-300
                  focus:ring-4
                  ${
                    errors.category
                      ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                      : "border-slate-200 focus:border-slate-500 focus:ring-slate-100"
                  }
                `}
              >
                <option value="">
                  Select category
                </option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>

              {errors.category && (
                <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600">
                  <CircleAlert size={13} />
                  {errors.category}
                </p>
              )}
            </div>

            {/* Priority */}
            <div className="group/field">
              <label
                htmlFor="priority"
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-slate-700
                  transition-colors
                  group-focus-within/field:text-slate-900
                "
              >
                Priority

                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className={`
                  w-full
                  cursor-pointer
                  rounded-xl
                  border
                  bg-white
                  px-4
                  py-3
                  text-sm
                  text-slate-700
                  outline-none
                  transition-all
                  duration-200
                  hover:border-slate-300
                  focus:ring-4
                  ${
                    errors.priority
                      ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                      : "border-slate-200 focus:border-slate-500 focus:ring-slate-100"
                  }
                `}
              >
                <option value="low">
                  Low
                </option>

                <option value="medium">
                  Medium
                </option>

                <option value="high">
                  High
                </option>

                <option value="critical">
                  Critical
                </option>
              </select>

              {errors.priority && (
                <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600">
                  <CircleAlert size={13} />
                  {errors.priority}
                </p>
              )}
            </div>
          </div>

          {/* Preferred Contact Method */}
          <div className="group/field">
            <label
              htmlFor="preferredContactMethod"
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-slate-700
                transition-colors
                group-focus-within/field:text-slate-900
              "
            >
              Preferred Contact Method

              <span className="ml-1 text-red-500">
                *
              </span>
            </label>

            <select
              id="preferredContactMethod"
              name="preferredContactMethod"
              value={formData.preferredContactMethod}
              onChange={handleChange}
              className={`
                w-full
                cursor-pointer
                rounded-xl
                border
                bg-white
                px-4
                py-3
                text-sm
                text-slate-700
                outline-none
                transition-all
                duration-200
                hover:border-slate-300
                focus:ring-4
                ${
                  errors.preferredContactMethod
                    ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                    : "border-slate-200 focus:border-slate-500 focus:ring-slate-100"
                }
              `}
            >
              <option value="email">
                Email
              </option>

              <option value="phone">
                Phone
              </option>

              <option value="chat">
                Chat
              </option>
            </select>

            {errors.preferredContactMethod && (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600">
                <CircleAlert size={13} />
                {errors.preferredContactMethod}
              </p>
            )}
          </div>

          {/* Information Card */}
          <div
            className="
              group/info
              relative
              overflow-hidden
              rounded-xl
              border
              border-blue-100
              bg-blue-50/60
              p-4
              transition-all
              duration-300
              hover:border-blue-200
              hover:bg-blue-50
              hover:shadow-sm
              sm:p-5
            "
          >
            <div className="flex items-start gap-3">
              <div
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-blue-100
                  bg-white
                  text-blue-600
                  shadow-sm
                  transition-all
                  duration-300
                  group-hover/info:scale-105
                  group-hover/info:shadow
                "
              >
                <ShieldCheck size={18} />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-800">
                  Ticket information
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-600 sm:text-sm">
                  Your ticket will initially be created
                  with an{" "}
                  <span className="font-semibold text-slate-800">
                    Open
                  </span>{" "}
                  status. The support team will assign an
                  agent after reviewing it.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="
            flex
            flex-col-reverse
            gap-3
            border-t
            border-slate-200
            bg-slate-50/70
            p-5
            sm:flex-row
            sm:items-center
            sm:justify-end
            sm:p-6
          "
        >
          {/* Cancel */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={submitting}
            className="
              inline-flex
              items-center
              justify-center
              rounded-xl
              border
              border-slate-200
              bg-white
              px-5
              py-3
              text-sm
              font-semibold
              text-slate-700
              shadow-sm
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:border-slate-300
              hover:bg-slate-50
              hover:text-slate-900
              hover:shadow-md
              active:translate-y-0
              active:scale-[0.98]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            Cancel
          </button>

          {/* Create Ticket */}
          <button
            type="submit"
            disabled={submitting}
            className="
              group/submit
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-slate-900
              bg-slate-900
              px-5
              py-3
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:border-slate-800
              hover:bg-slate-800
              hover:shadow-lg
              active:translate-y-0
              active:scale-[0.98]
              disabled:cursor-not-allowed
              disabled:opacity-50
              disabled:hover:translate-y-0
              disabled:hover:shadow-sm
            "
          >
            {submitting ? (
              <span
                className="
                  h-4
                  w-4
                  animate-spin
                  rounded-full
                  border-2
                  border-white/30
                  border-t-white
                "
              />
            ) : (
              <Send
                size={17}
                className="
                  transition-transform
                  duration-200
                  group-hover/submit:translate-x-0.5
                "
              />
            )}

            {submitting
              ? "Creating Ticket..."
              : "Create Ticket"}
          </button>
        </div>
      </form>

      {/* Bottom reassurance */}
      <div className="mt-4 flex items-center justify-center gap-2 px-4 text-center text-[11px] text-slate-400 sm:text-xs">
        <CheckCircle2 size={14} />
        Your request will be securely submitted to the IT
        support team.
      </div>
    </div>
  );
};

export default CreateTicket;