import { DK, LT } from "./colors";

export const getTheme = (darkMode) => {
  return darkMode === "dark" ? DK : darkMode === "light" ? LT : DK;
};

export { DK, LT };