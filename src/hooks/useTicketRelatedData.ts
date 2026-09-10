import { useEffect, useState } from "react";

import type { User } from "../types/user";
import type { Category } from "../types/category";

import { getUsers } from "../services/userService";
import { getCategories } from "../services/categoryService";

interface TicketRelatedData {
  users: User[];
  categories: Category[];
  loading: boolean;
  error: string;
}

const useTicketRelatedData = (): TicketRelatedData => {
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRelatedData = async () => {
      try {
        setLoading(true);
        setError("");

        const [usersData, categoriesData] =
          await Promise.all([
            getUsers(),
            getCategories(),
          ]);

        setUsers(usersData);
        setCategories(categoriesData);
      } catch (error) {
        console.error(
          "Failed to load ticket related data:",
          error
        );

        setError(
          "Unable to load users and categories."
        );
      } finally {
        setLoading(false);
      }
    };

    loadRelatedData();
  }, []);

  return {
    users,
    categories,
    loading,
    error,
  };
};

export default useTicketRelatedData;