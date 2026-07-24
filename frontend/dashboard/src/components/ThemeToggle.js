import React from "react";
import { Sun, Moon } from "lucide-react";
import "./ThemeToggle.css";

function ThemeToggle({ theme, toggleTheme }) {
  const isDark = theme === "dark";

  return (
    <button
      className={`theme-toggle ${isDark ? "is-dark" : "is-light"}`}
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {/* Sun icon — left side */}
      <Sun size={12} className="toggle-sun" />

      {/* Animated track + thumb */}
      <div className="toggle-track">
        <div className="toggle-thumb" />
      </div>

      {/* Moon icon — right side */}
      <Moon size={12} className="toggle-moon" />
    </button>
  );
}

export default ThemeToggle;
