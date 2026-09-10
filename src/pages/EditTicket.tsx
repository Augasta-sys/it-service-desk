import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

import {
  ArrowLeft,
  Save,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

import {
  getTicketById,
  updateTicket,
} from "../services/ticketService";

import { getCategories } from "../services/categoryService";

import type { Category } from "../types/category";

import type {
  ContactMethod,
  Ticket,
  TicketPriority,
} from "../types/ticket";

import {
  canEditTicket,
} from "../utils/ticketPermissions";


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


const EditTicket = () => {
  const navigate = useNavigate();

  const { id } = useParams();

  const { user } = useAuth();


  const [ticket, setTicket] = useState<Ticket | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [errors, setErrors] =
    useState<FormErrors>({});


  const [formData, setFormData] =
    useState<FormData>({
      subject: "",
      description: "",
      category: "",
      priority: "medium",
      preferredContactMethod: "email",
    });


  /*
   * Load ticket and categories
   */
  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        setError("Ticket ID is missing.");
        setLoading(false);
        return;
      }

      if (!user) {
        setError("You must be logged in.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [ticketData, categoryData] =
          await Promise.all([
            getTicketById(id),
            getCategories(),
          ]);


        /*
         * Check whether the current user
         * has permission to edit this ticket.
         */
        if (!canEditTicket(ticketData, user)) {
          setError(
            "You do not have permission to edit this ticket."
          );

          setTicket(ticketData);

          return;
        }


        setTicket(ticketData);


        setCategories(
          categoryData.filter(
            (category) =>
              category.status === "active"
          )
        );


        setFormData({
          subject: ticketData.subject,
          description: ticketData.description,
          category: ticketData.category,
          priority: ticketData.priority,
          preferredContactMethod:
            ticketData.preferredContactMethod,
        });

      } catch (error) {
        console.error(
          "Failed to load ticket:",
          error
        );

        setError(
          "Unable to load ticket. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };


    loadData();
  }, [id, user]);


  /*
   * Handle form changes
   */
  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement |
      HTMLSelectElement
    >
  ) => {
    const {
      name,
      value,
    } = event.target;


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
      newErrors.subject =
        "Subject is required.";
    } else if (
      formData.subject.trim().length < 5
    ) {
      newErrors.subject =
        "Subject must contain at least 5 characters.";
    }


    if (!formData.description.trim()) {
      newErrors.description =
        "Description is required.";
    } else if (
      formData.description.trim().length < 10
    ) {
      newErrors.description =
        "Description must contain at least 10 characters.";
    }


    if (!formData.category) {
      newErrors.category =
        "Please select a category.";
    }


    if (!formData.priority) {
      newErrors.priority =
        "Please select a priority.";
    }


    if (!formData.preferredContactMethod) {
      newErrors.preferredContactMethod =
        "Please select a contact method.";
    }


    setErrors(newErrors);


    return Object.keys(newErrors).length === 0;
  };


  /*
   * Save changes
   */
  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();


    if (!ticket || !user) {
      setError(
        "Unable to update this ticket."
      );

      return;
    }


    /*
     * Double-check permissions before updating.
     */
    if (!canEditTicket(ticket, user)) {
      setError(
        "You do not have permission to edit this ticket."
      );

      return;
    }


    const isValid = validateForm();


    if (!isValid) {
      return;
    }


    try {
      setSaving(true);
      setError("");


      const updatedDate = new Date()
        .toISOString()
        .split("T")[0];


      await updateTicket(ticket.id, {
        subject: formData.subject.trim(),

        description:
          formData.description.trim(),

        category: formData.category,

        priority: formData.priority,

        preferredContactMethod:
          formData.preferredContactMethod,

        updatedDate,
      });


      navigate(`/tickets/${ticket.id}`, {
        replace: true,
        state: {
          successMessage:
            "Ticket updated successfully.",
        },
      });

    } catch (error) {
      console.error(
        "Failed to update ticket:",
        error
      );

      setError(
        "Unable to update ticket. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };


  /*
   * Loading state
   */
  if (loading) {
    return (
      <div className="flex min-h-80 items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <p className="text-sm font-medium text-slate-500">
          Loading ticket...
        </p>
      </div>
    );
  }


  /*
   * Ticket not found
   */
  if (!ticket) {
    return (
      <div className="rounded-2xl border border-red-200 bg-white p-8 text-center">
        <h1 className="text-xl font-bold text-slate-900">
          Ticket Not Found
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          The requested ticket could not be found.
        </p>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <ArrowLeft size={17} />
          Go Back
        </button>
      </div>
    );
  }


  /*
   * Permission error
   */
  if (error && !canEditTicket(ticket, user!)) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <button
          type="button"
          onClick={() =>
            navigate(`/tickets/${ticket.id}`)
          }
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeft size={17} />
          Back to Ticket
        </button>


        <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">
            Access Denied
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(`/tickets/${ticket.id}`)
            }
            className="mt-5 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Back to Ticket
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="mx-auto w-full max-w-4xl">

      {/* Back button */}
      <button
        type="button"
        onClick={() =>
          navigate(`/tickets/${ticket.id}`)
        }
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
      >
        <ArrowLeft size={17} />
        Back to Ticket
      </button>


      {/* Header */}
      <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {ticket.id}
        </p>

        <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
          Edit Ticket
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Update the ticket information below and
          save your changes.
        </p>

      </div>


      {/* Form */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-2xl border border-slate-200 bg-white shadow-sm"
      >

        <div className="space-y-6 p-5 sm:p-6 lg:p-8">

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-medium text-red-700">
                {error}
              </p>
            </div>
          )}


          {/* Subject */}
          <div>
            <label
              htmlFor="subject"
              className="mb-2 block text-sm font-semibold text-slate-700"
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
              placeholder="Enter ticket subject"
              className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
                errors.subject
                  ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                  : "border-slate-200 focus:border-slate-400 focus:ring-slate-100"
              }`}
            />


            {errors.subject && (
              <p className="mt-2 text-xs font-medium text-red-600">
                {errors.subject}
              </p>
            )}
          </div>


          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Description

              <span className="ml-1 text-red-500">
                *
              </span>
            </label>


            <textarea
              id="description"
              name="description"
              rows={7}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the issue in detail..."
              className={`w-full resize-y rounded-lg border bg-white px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
                errors.description
                  ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                  : "border-slate-200 focus:border-slate-400 focus:ring-slate-100"
              }`}
            />


            {errors.description && (
              <p className="mt-2 text-xs font-medium text-red-600">
                {errors.description}
              </p>
            )}
          </div>


          {/* Category + Priority */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

            {/* Category */}
            <div>
              <label
                htmlFor="category"
                className="mb-2 block text-sm font-semibold text-slate-700"
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
                className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:ring-2 ${
                  errors.category
                    ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                    : "border-slate-200 focus:border-slate-400 focus:ring-slate-100"
                }`}
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
                <p className="mt-2 text-xs font-medium text-red-600">
                  {errors.category}
                </p>
              )}
            </div>


            {/* Priority */}
            <div>
              <label
                htmlFor="priority"
                className="mb-2 block text-sm font-semibold text-slate-700"
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
                className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:ring-2 ${
                  errors.priority
                    ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                    : "border-slate-200 focus:border-slate-400 focus:ring-slate-100"
                }`}
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
                <p className="mt-2 text-xs font-medium text-red-600">
                  {errors.priority}
                </p>
              )}
            </div>

          </div>


          {/* Preferred Contact Method */}
          <div>
            <label
              htmlFor="preferredContactMethod"
              className="mb-2 block text-sm font-semibold text-slate-700"
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
              className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:ring-2 ${
                errors.preferredContactMethod
                  ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                  : "border-slate-200 focus:border-slate-400 focus:ring-slate-100"
              }`}
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
              <p className="mt-2 text-xs font-medium text-red-600">
                {errors.preferredContactMethod}
              </p>
            )}
          </div>


          {/* Information */}
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-700">
              Editing information
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Your changes will update the ticket
              information and the updated date. Ticket
              status is managed separately through the
              ticket lifecycle.
            </p>
          </div>

        </div>


        {/* Footer */}
        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-end sm:p-6">

          <button
            type="button"
            onClick={() =>
              navigate(`/tickets/${ticket.id}`)
            }
            disabled={saving}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>


          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={17} />

            {saving
              ? "Saving Changes..."
              : "Save Changes"}
          </button>

        </div>

      </form>

    </div>
  );
};


export default EditTicket;