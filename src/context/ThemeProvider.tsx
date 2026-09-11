import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  ThemeContext,
  type Theme,
} from "./ThemeContext";

interface ThemeProviderProps {
  children: ReactNode;
}

const getInitialTheme = (): Theme => {
  const storedTheme =
    localStorage.getItem("serviceDeskTheme");

  if (
    storedTheme === "light" ||
    storedTheme === "dark"
  ) {
    return storedTheme;
  }

  return "light";
};

export const ThemeProvider = ({
  children,
}: ThemeProviderProps) => {
  const [theme, setTheme] =
    useState<Theme>(getInitialTheme);

  useEffect(() => {
    const root =
      document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    localStorage.setItem(
      "serviceDeskTheme",
      theme
    );
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) =>
      currentTheme === "light"
        ? "dark"
        : "light"
    );
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};