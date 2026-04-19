import React, { createContext, useContext, useState, useEffect } from "react";
import { Appearance } from "react-native";
import { DK, LT } from "../theme/colors";

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(Appearance.getColorScheme() || "dark");

  const theme = themeMode === "light" ? LT : DK;
  const isDark = themeMode === "dark";

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const setTheme = (mode) => {
    if (mode === "dark" || mode === "light" || mode === "auto") {
      setThemeMode(mode === "auto" ? "dark" : mode);
    }
  };

  const value = {
    theme,
    themeMode,
    isDark,
    toggleTheme,
    setTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

export default ThemeContext;