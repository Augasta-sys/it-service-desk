import api from "./api";
import type { TicketActivity } from "../types/activity";

export const getActivities = async (): Promise<TicketActivity[]> => {
  const response = await api.get<TicketActivity[]>("/activities");
  return response.data;
};

export const getActivitiesByTicket = async (
  ticketId: string
): Promise<TicketActivity[]> => {
  const response = await api.get<TicketActivity[]>(
    `/activities?ticketId=${ticketId}`
  );

  return response.data;
};

export const createActivity = async (
  activity: TicketActivity
): Promise<TicketActivity> => {
  const response = await api.post<TicketActivity>(
    "/activities",
    activity
  );

  return response.data;
};