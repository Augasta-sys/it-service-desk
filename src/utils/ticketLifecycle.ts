import type { TicketStatus } from "../types/ticket";

export const getAllowedNextStatuses = (
  currentStatus: TicketStatus
): TicketStatus[] => {
  switch (currentStatus) {
    case "open":
      return ["assigned", "cancelled"];

    case "assigned":
      return ["in_progress"];

    case "in_progress":
  return ["pending", "resolved"];

    case "pending":
      return ["in_progress", "resolved"];

    case "resolved":
      return ["closed", "reopened"];

    case "reopened":
      return ["assigned"];

    case "closed":
      return [];

    case "cancelled":
      return [];

    default:
      return [];
  }
};