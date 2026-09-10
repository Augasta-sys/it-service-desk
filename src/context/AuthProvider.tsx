import { useState, type ReactNode } from "react";

import type { User } from "../types/user";

import { getUsers } from "../services/userService";

import { AuthContext } from "./AuthContext";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({
  children,
}: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser =
      localStorage.getItem("serviceDeskUser");

    return storedUser
      ? JSON.parse(storedUser)
      : null;
  });

  const login = async (
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      const users = await getUsers();

      const matchedUser = users.find(
        (item) =>
          item.email.toLowerCase() ===
            email.toLowerCase() &&
          item.password === password &&
          item.status === "active"
      );

      if (!matchedUser) {
        return false;
      }

      setUser(matchedUser);

      localStorage.setItem(
        "serviceDeskUser",
        JSON.stringify(matchedUser)
      );

      return true;
    } catch (error) {
      console.error("Login failed:", error);

      return false;
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);

    localStorage.setItem(
      "serviceDeskUser",
      JSON.stringify(updatedUser)
    );
  };

  const logout = () => {
    setUser(null);

    localStorage.removeItem(
      "serviceDeskUser"
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};