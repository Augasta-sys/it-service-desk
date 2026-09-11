import { useState } from "react";
import { CheckCircle } from "lucide-react";

import type { Ticket } from "../../types/ticket";
import type { User } from "../../types/user";

import { updateTicket } from "../../services/ticketService";
import { createActivity } from "../../services/activityService";
import { canAddResolution } from "../../utils/ticketPermissions";

interface ResolutionSectionProps {
  ticket: Ticket;
  user: User;
  onUpdated: (ticket: Ticket) => void;
}

const ResolutionSection = ({
  ticket,
  user,
  onUpdated,
}: ResolutionSectionProps) => {
  const [resolution, setResolution] = useState(
    ticket.resolution || ""
  );

  const [resolutionNotes, setResolutionNotes] = useState(
    ticket.resolutionNotes || ""
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canResolve = canAddResolution(ticket, user);

  const handleSubmit = async (
    event: React.SubmitEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const trimmedResolution = resolution.trim();
    const trimmedNotes = resolutionNotes.trim();

    if (!trimmedResolution) {
      setError("Please enter the resolution.");
      return;
    }

    if (!trimmedNotes) {
      setError("Please enter the resolution notes.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const now = new Date();

      const today = now.toISOString().split("T")[0];

      const currentTime = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      /*
       * 1. Update the ticket with the resolution
       */
      const updatedTicket = await updateTicket(ticket.id, {
        resolution: trimmedResolution,
        resolutionNotes: trimmedNotes,
        resolutionDate: today,
        status: "resolved",
        updatedDate: today,
      });

      /*
       * 2. Record resolution activity
       */
      try {
        await createActivity({
          id: `ACT${Date.now()}`,
          ticketId: ticket.id,
          type: "resolution_added",
          description: `${user.fullName} added a resolution.`,
          performedBy: user.id,
          createdDate: today,
          createdTime: currentTime,
        });
      } catch (activityError) {
        console.error(
          "Failed to create resolution activity:",
          activityError
        );
      }

      /*
       * 3. Record resolved activity
       */
      try {
        await createActivity({
          id: `ACT${Date.now() + 1}`,
          ticketId: ticket.id,
          type: "resolved",
          description: `${user.fullName} resolved this ticket.`,
          performedBy: user.id,
          createdDate: today,
          createdTime: currentTime,
        });
      } catch (activityError) {
        console.error(
          "Failed to create resolved activity:",
          activityError
        );
      }

      /*
       * 4. Update the parent TicketDetails component
       */
      onUpdated(updatedTicket);

      /*
       * 5. Show success message
       */
      setSuccess("Resolution added successfully.");

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(
        "Failed to update resolution:",
        err
      );

      setError(
        "Failed to save the resolution. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="group min-h-[520px] rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 dark:border-slate-600 dark:bg-[#404040] dark:text-white dark:hover:bg-white dark:hover:text-black">
      <div className="mb-5 flex items-center gap-2">
        <CheckCircle
          size={20}
          className="text-green-600"
        />

        <h2 className="text-lg font-semibold text-gray-900 dark:text-white dark:group-hover:text-black">
          Resolution
        </h2>
      </div>

      {ticket.resolutionDate && (
        <div className="mb-5 rounded-lg bg-green-50 px-4 py-3 dark:bg-green-900/30 dark:group-hover:bg-green-50">
          <p className="text-sm font-medium text-green-800 dark:text-green-200 dark:group-hover:text-green-800">
            Resolved on
          </p>

          <p className="mt-1 text-sm text-green-700 dark:text-green-300 dark:group-hover:text-green-700">
            {ticket.resolutionDate}
          </p>
        </div>
      )}

      {canResolve ? (
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="resolution"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-white dark:group-hover:text-black"
            >
              Resolution
            </label>

            <textarea
              id="resolution"
              value={resolution}
              onChange={(event) =>
                setResolution(event.target.value)
              }
              placeholder="Describe how the issue was resolved..."
              rows={4}
              disabled={submitting}
              className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100 dark:border-slate-500 dark:bg-[#404040] dark:text-white dark:placeholder:text-slate-300 dark:focus:bg-[#404040] dark:group-hover:bg-white dark:group-hover:text-black dark:group-hover:placeholder:text-slate-500"
            />
          </div>

          <div>
            <label
              htmlFor="resolution-notes"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-white dark:group-hover:text-black"
            >
              Resolution Notes
            </label>

            <textarea
              id="resolution-notes"
              value={resolutionNotes}
              onChange={(event) =>
                setResolutionNotes(event.target.value)
              }
              placeholder="Add any additional resolution notes..."
              rows={4}
              disabled={submitting}
              className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100 dark:border-slate-500 dark:bg-[#404040] dark:text-white dark:placeholder:text-slate-300 dark:focus:bg-[#404040] dark:group-hover:bg-white dark:group-hover:text-black dark:group-hover:placeholder:text-slate-500"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          {success && (
            <p className="text-sm text-green-600">
              {success}
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={
                submitting ||
                !resolution.trim() ||
                !resolutionNotes.trim()
              }
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCircle size={16} />

              {submitting
                ? "Saving..."
                : "Save Resolution"}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="mb-1 text-sm font-medium text-gray-500 dark:text-white dark:group-hover:text-black">
              Resolution
            </p>

            <p className="text-sm leading-6 text-gray-700 dark:text-white dark:group-hover:text-black">
              {ticket.resolution ||
                "No resolution added yet."}
            </p>
          </div>

          <div>
            <p className="mb-1 text-sm font-medium text-gray-500 dark:text-white dark:group-hover:text-black">
              Resolution Notes
            </p>

            <p className="text-sm leading-6 text-gray-700 dark:text-white dark:group-hover:text-black">
              {ticket.resolutionNotes ||
                "No resolution notes added yet."}
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

export default ResolutionSection;
