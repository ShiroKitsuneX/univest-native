import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "univest_user";

export const loadLocalUserData = async () => {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return null;
};

export const saveLocalUserData = async (data) => {
  try { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
};
