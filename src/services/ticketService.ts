import api from "./api";
import type { Ticket } from "../types/ticket";

export const getTickets = async (): Promise<Ticket[]> => {
  const response = await api.get<Ticket[]>("/tickets");
  return response.data;
};

export const getTicketById = async (id: string): Promise<Ticket> => {
  const response = await api.get<Ticket>(`/tickets/${id}`);
  return response.data;
};

export const createTicket = async (
  ticket: Ticket
): Promise<Ticket> => {
  const response = await api.post<Ticket>(
    "/tickets",
    ticket
  );

  return response.data;
};

export const updateTicket = async (
  id: string,
  ticket: Partial<Ticket>
): Promise<Ticket> => {
  const response = await api.patch<Ticket>(
    `/tickets/${id}`,
    ticket
  );

  return response.data;
};

export const deleteTicket = async (
  id: string
): Promise<void> => {
  await api.delete(`/tickets/${id}`);
};