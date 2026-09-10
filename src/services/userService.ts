import api from "./api";
import type { User } from "../types/user";

/*
 * Get all users
 */
export const getUsers = async (): Promise<User[]> => {
  const response = await api.get<User[]>("/users");

  return response.data;
};

/*
 * Get a single user by ID
 */
export const getUserById = async (
  id: string
): Promise<User> => {
  const response = await api.get<User>(`/users/${id}`);

  return response.data;
};

/*
 * Create a new user
 */
export const createUser = async (
  user: User
): Promise<User> => {
  const response = await api.post<User>("/users", user);

  return response.data;
};

/*
 * Update an existing user
 */
export const updateUser = async (
  id: string,
  user: Partial<User>
): Promise<User> => {
  const response = await api.patch<User>(
    `/users/${id}`,
    user
  );

  return response.data;
};

/*
 * Delete a user
 */
export const deleteUser = async (
  id: string
): Promise<void> => {
  await api.delete(`/users/${id}`);
};