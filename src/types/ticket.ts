export type TicketPriority =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type TicketStatus =
  | "open"
  | "assigned"
  | "in_progress"
  | "pending"
  | "resolved"
  | "closed"
  | "cancelled"
  | "reopened";

export type ContactMethod = "email" | "phone" | "chat";

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  createdBy: string;
  assignedAgent: string | null;
  assignmentDate: string | null;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdDate: string;
  updatedDate: string;
  dueDate: string;
  preferredContactMethod: ContactMethod;
  resolution: string;
  resolutionNotes: string;
  resolutionDate: string | null;
}