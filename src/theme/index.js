import { DK, LT } from "./colors";

export const getTheme = (darkMode) => {
  return darkMode === "dark" ? DK : darkMode === "light" ? LT : DK;
};

export const themeDark = DK;
export const themeLight = LT;

export { DK, LT };
export default { getTheme, DK, LT, themeDark, themeLight };