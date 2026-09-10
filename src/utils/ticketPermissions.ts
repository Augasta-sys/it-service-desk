import type { Ticket } from "../types/ticket";
import type { User } from "../types/user";

/**
 * Admin can work with every ticket.
 * Support agents can work only with tickets assigned to them.
 * Employees can work only with tickets they created.
 */

export const canViewTicket = (
  ticket: Ticket,
  user: User
): boolean => {
  if (user.role === "admin") {
    return true;
  }

  if (user.role === "support_agent") {
    return ticket.assignedAgent === user.id;
  }

  if (user.role === "employee") {
    return ticket.createdBy === user.id;
  }

  return false;
};


export const canEditTicket = (
  ticket: Ticket,
  user: User
): boolean => {
  if (user.role === "admin") {
    return true;
  }

  if (user.role === "support_agent") {
    return ticket.assignedAgent === user.id;
  }

  if (user.role === "employee") {
    return (
      ticket.createdBy === user.id &&
      ticket.status === "open"
    );
  }

  return false;
};


export const canUpdateStatus = (
  ticket: Ticket,
  user: User
): boolean => {
  if (user.role === "admin") {
    return true;
  }

  if (user.role === "support_agent") {
    return ticket.assignedAgent === user.id;
  }

  if (user.role === "employee") {
    return ticket.createdBy === user.id;
  }

  return false;
};


export const canUpdatePriority = (
  ticket: Ticket,
  user: User
): boolean => {
  if (user.role === "admin") {
    return true;
  }

  if (user.role === "support_agent") {
    return ticket.assignedAgent === user.id;
  }

  return false;
};


export const canAssignTicket = (
  user: User
): boolean => {
  return user.role === "admin";
};


export const canAddResolution = (
  ticket: Ticket,
  user: User
): boolean => {
  if (user.role === "admin") {
    return true;
  }

  if (user.role === "support_agent") {
    return ticket.assignedAgent === user.id;
  }

  return false;
};


export const canCommentOnTicket = (
  ticket: Ticket,
  user: User
): boolean => {
  if (user.role === "admin") {
    return true;
  }

  if (user.role === "support_agent") {
    return ticket.assignedAgent === user.id;
  }

  if (user.role === "employee") {
    return ticket.createdBy === user.id;
  }

  return false;
};


export const canCancelTicket = (
  ticket: Ticket,
  user: User
): boolean => {
  return (
    user.role === "employee" &&
    ticket.createdBy === user.id &&
    ticket.status === "open"
  );
};


export const canReopenTicket = (
  ticket: Ticket,
  user: User
): boolean => {
  if (user.role === "admin") {
    return ticket.status === "resolved";
  }

  if (user.role === "support_agent") {
    return (
      ticket.assignedAgent === user.id &&
      ticket.status === "resolved"
    );
  }

  if (user.role === "employee") {
    return (
      ticket.createdBy === user.id &&
      ticket.status === "resolved"
    );
  }

  return false;
};


export const canDeleteTicket = (
  user: User
): boolean => {
  return user.role === "admin";
};