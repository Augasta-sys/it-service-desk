import api from "./api";
import type { Comment } from "../types/comment";

export const getCommentsByTicket = async (
  ticketId: string
): Promise<Comment[]> => {
  const response = await api.get<Comment[]>(
    `/comments?ticketId=${ticketId}`
  );

  return response.data;
};

export const createComment = async (
  comment: Comment
): Promise<Comment> => {
  const response = await api.post<Comment>(
    "/comments",
    comment
  );

  return response.data;
};

export const deleteComment = async (
  id: string
): Promise<void> => {
  await api.delete(`/comments/${id}`);
};