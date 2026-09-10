export type ActivityType =
  | "created"
  | "assigned"
  | "reassigned"
  | "unassigned"
  | "status_changed"
  | "priority_changed"
  | "comment_added"
  | "resolution_added"
  | "resolved"
  | "closed"
  | "cancelled"
  | "reopened"
  | "updated";

export interface TicketActivity {
  id: string;
  ticketId: string;
  type: ActivityType;
  description: string;
  performedBy: string;
  createdDate: string;
  createdTime: string;
}