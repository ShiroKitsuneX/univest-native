import { useColorScheme } from "react-native";
import { useProfileStore } from "@/stores/profileStore";
import { DK, LT } from "@/theme/palette";

export function useIsDark() {
  const colorScheme = useColorScheme();
  const theme = useProfileStore(s => s.theme);
  return theme === "auto" ? colorScheme === "dark" : theme === "dark";
}

export function useTheme() {
  const isDark = useIsDark();
  return {
    T: isDark ? DK : LT,
    isDark,
    AT: isDark ? "#000" : "#fff",
  };
}
