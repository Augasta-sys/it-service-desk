import api from "./api";
import type { Category } from "../types/category";

export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get<Category[]>("/categories");
  return response.data;
};

export const getCategoryById = async (
  id: string
): Promise<Category> => {
  const response = await api.get<Category>(`/categories/${id}`);
  return response.data;
};

export const createCategory = async (
  category: Category
): Promise<Category> => {
  const response = await api.post<Category>(
    "/categories",
    category
  );

  return response.data;
};

export const updateCategory = async (
  id: string,
  category: Partial<Category>
): Promise<Category> => {
  const response = await api.patch<Category>(
    `/categories/${id}`,
    category
  );

  return response.data;
};

export const deleteCategory = async (
  id: string
): Promise<void> => {
  await api.delete(`/categories/${id}`);
};