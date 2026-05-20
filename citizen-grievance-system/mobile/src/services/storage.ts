import AsyncStorage from "@react-native-async-storage/async-storage";

let mmkv: { getString: (key: string) => string | undefined; set: (key: string, value: string) => void; delete: (key: string) => void } | null = null;

try {
  // MMKV is fast in standalone/dev builds. AsyncStorage remains Expo Go-safe fallback.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { MMKV } = require("react-native-mmkv");
  mmkv = new MMKV({ id: "sahayak-mobile" });
} catch {
  mmkv = null;
}

export const storage = {
  async get(key: string) {
    return mmkv?.getString(key) ?? AsyncStorage.getItem(key);
  },
  async set(key: string, value: string) {
    if (mmkv) {
      mmkv.set(key, value);
      return;
    }
    await AsyncStorage.setItem(key, value);
  },
  async remove(key: string) {
    if (mmkv) {
      mmkv.delete(key);
      return;
    }
    await AsyncStorage.removeItem(key);
  }
};
