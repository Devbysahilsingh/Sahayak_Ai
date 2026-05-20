import { Platform } from "react-native";

export async function registerForPushNotifications() {
  const Device = await import("expo-device");
  const Notifications = await import("expo-notifications");

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false
    })
  });

  if (!Device.isDevice) return null;
  const current = await Notifications.getPermissionsAsync();
  let status = current.status;
  if (status !== "granted") {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }
  if (status !== "granted") return null;
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("complaints", {
      name: "Complaints",
      importance: Notifications.AndroidImportance.HIGH
    });
  }
  const token = await Notifications.getExpoPushTokenAsync();
  return token.data;
}

export async function notifyLocal(title: string, body: string) {
  const Notifications = await import("expo-notifications");
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: null
  });
}
