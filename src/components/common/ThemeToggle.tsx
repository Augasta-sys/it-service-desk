import {
  Moon,
  Sun,
} from "lucide-react";

import { useContext } from "react";

import {
  ThemeContext,
} from "../../context/ThemeContext";

const ThemeToggle = () => {
  const themeContext =
    useContext(ThemeContext);

  if (!themeContext) {
    throw new Error(
      "ThemeToggle must be used inside ThemeProvider."
    );
  }

  const {
    theme,
    toggleTheme,
  } = themeContext;

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
     className="
  relative flex h-10 w-10 shrink-0 items-center justify-center
  rounded-xl border border-blue-200
  bg-white text-slate-700 shadow-sm
  transition-all duration-300
  hover:-translate-y-0.5
  hover:border-blue-300
  hover:bg-blue-900
  hover:text-white
  hover:shadow-md
  active:scale-95

  dark:border-slate-600
  dark:bg-[#E5E7EB]
  dark:text-slate-900
  dark:hover:border-white
  dark:hover:bg-white
  dark:hover:text-black
"
      aria-label={
        isDark
          ? "Switch to light mode"
          : "Switch to dark mode"
      }
      title={
        isDark
          ? "Switch to light mode"
          : "Switch to dark mode"
      }
    >
      {isDark ? (
        <Sun
          size={19}
          strokeWidth={2}
        />
      ) : (
        <Moon
          size={19}
          strokeWidth={2}
        />
      )}
    </button>
  );
};

export default ThemeToggle;