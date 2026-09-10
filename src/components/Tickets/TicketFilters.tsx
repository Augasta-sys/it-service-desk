import {
  X,
  SlidersHorizontal,
} from "lucide-react";

import type {
  TicketPriority,
  TicketStatus,
} from "../../types/ticket";

import type { Category } from "../../types/category";

interface TicketFiltersProps {
  search: string;
  status: TicketStatus | "all";
  priority: TicketPriority | "all";
  category: string;
  sortBy: "newest" | "oldest" | "priority";
  categories: Category[];
  onSearchChange: (value: string) => void;
  onStatusChange: (
    value: TicketStatus | "all"
  ) => void;
  onPriorityChange: (
    value: TicketPriority | "all"
  ) => void;
  onCategoryChange: (value: string) => void;
  onSortChange: (
    value: "newest" | "oldest" | "priority"
  ) => void;
  onClear: () => void;
}

const TicketFilters = ({
  search,
  status,
  priority,
  category,
  sortBy,
  categories,
  onStatusChange,
  onPriorityChange,
  onCategoryChange,
  onSortChange,
  onClear,
}: TicketFiltersProps) => {
  const hasFilters =
    search ||
    status !== "all" ||
    priority !== "all" ||
    category !== "all";

  const selectClassName = `
    w-full
    appearance-none
    rounded-xl
    border border-slate-200
    bg-white
    px-3.5 py-2.5
    pr-9
    text-sm font-medium
    text-slate-700
    outline-none
    shadow-sm
    cursor-pointer
    transition-all duration-300
    hover:border-slate-300
    hover:bg-slate-50
    hover:shadow-md
    focus:border-blue-400
    focus:bg-white
    focus:ring-4
    focus:ring-blue-50
  `;

  return (
    <div className="w-full">

      {/* =====================================================
          FILTER HEADER
      ====================================================== */}
      <div className="mb-4 flex items-center justify-between">

        <div className="flex items-center gap-2">
          <div
            className="
              flex h-8 w-8
              items-center justify-center
              rounded-lg
              bg-blue-50
              text-blue-600
            "
          >
            <SlidersHorizontal
              size={16}
              strokeWidth={2.2}
            />
          </div>

          <div>
            <p className="text-sm font-bold text-slate-800">
              Ticket Filters
            </p>

            <p className="hidden text-xs text-slate-400 sm:block">
              Filter and organize tickets
            </p>
          </div>
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="
              inline-flex
              items-center
              gap-1.5
              rounded-lg
              border border-slate-200
              bg-white
              px-3 py-2
              text-xs
              font-semibold
              text-slate-500
              shadow-sm
              transition-all duration-300
              hover:border-red-200
              hover:bg-red-50
              hover:text-red-600
              hover:shadow-md
              active:scale-[0.98]
            "
          >
            <X size={14} />
            Clear Filters
          </button>
        )}
      </div>

      {/* =====================================================
          TOP ROW
          Status / Priority / Category / Sort
      ====================================================== */}
      <div
        className="
          grid
          grid-cols-1
          gap-3
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >

        {/* Status */}
        <div className="group">
          <label
            htmlFor="ticket-status"
            className="
              mb-1.5
              block
              text-[11px]
              font-bold
              uppercase
              tracking-wider
              text-slate-400
              transition-colors duration-300
              group-focus-within:text-blue-600
            "
          >
            Status
          </label>

          <div className="relative">
            <select
              id="ticket-status"
              value={status}
              onChange={(event) =>
                onStatusChange(
                  event.target.value as
                    | TicketStatus
                    | "all"
                )
              }
              className={selectClassName}
            >
              <option value="all">
                All Statuses
              </option>

              <option value="open">
                Open
              </option>

              <option value="assigned">
                Assigned
              </option>

              <option value="in_progress">
                In Progress
              </option>

              <option value="pending">
                Pending
              </option>

              <option value="resolved">
                Resolved
              </option>

              <option value="closed">
                Closed
              </option>

              <option value="cancelled">
                Cancelled
              </option>

              <option value="reopened">
                Reopened
              </option>
            </select>

            <div
              className="
                pointer-events-none
                absolute
                right-3
                top-1/2
                -translate-y-1/2
                text-slate-400
              "
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Priority */}
        <div className="group">
          <label
            htmlFor="ticket-priority"
            className="
              mb-1.5
              block
              text-[11px]
              font-bold
              uppercase
              tracking-wider
              text-slate-400
              transition-colors duration-300
              group-focus-within:text-blue-600
            "
          >
            Priority
          </label>

          <div className="relative">
            <select
              id="ticket-priority"
              value={priority}
              onChange={(event) =>
                onPriorityChange(
                  event.target.value as
                    | TicketPriority
                    | "all"
                )
              }
              className={selectClassName}
            >
              <option value="all">
                All Priorities
              </option>

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

            <div
              className="
                pointer-events-none
                absolute
                right-3
                top-1/2
                -translate-y-1/2
                text-slate-400
              "
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Category */}
        <div className="group">
          <label
            htmlFor="ticket-category"
            className="
              mb-1.5
              block
              text-[11px]
              font-bold
              uppercase
              tracking-wider
              text-slate-400
              transition-colors duration-300
              group-focus-within:text-blue-600
            "
          >
            Category
          </label>

          <div className="relative">
            <select
              id="ticket-category"
              value={category}
              onChange={(event) =>
                onCategoryChange(
                  event.target.value
                )
              }
              className={selectClassName}
            >
              <option value="all">
                All Categories
              </option>

              {categories.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.name}
                </option>
              ))}
            </select>

            <div
              className="
                pointer-events-none
                absolute
                right-3
                top-1/2
                -translate-y-1/2
                text-slate-400
              "
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Sort */}
        <div className="group">
          <label
            htmlFor="ticket-sort"
            className="
              mb-1.5
              block
              text-[11px]
              font-bold
              uppercase
              tracking-wider
              text-slate-400
              transition-colors duration-300
              group-focus-within:text-blue-600
            "
          >
            Sort By
          </label>

          <div className="relative">
            <select
              id="ticket-sort"
              value={sortBy}
              onChange={(event) =>
                onSortChange(
                  event.target.value as
                    | "newest"
                    | "oldest"
                    | "priority"
                )
              }
              className={selectClassName}
            >
              <option value="newest">
                Newest First
              </option>

              <option value="oldest">
                Oldest First
              </option>

              <option value="priority">
                Priority
              </option>
            </select>

            <div
              className="
                pointer-events-none
                absolute
                right-3
                top-1/2
                -translate-y-1/2
                text-slate-400
              "
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      </div>
  );
};

export default TicketFilters;