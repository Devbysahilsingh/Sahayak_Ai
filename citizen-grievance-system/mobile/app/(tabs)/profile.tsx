import { router } from "expo-router";
import { Text } from "react-native";
import { AppButton } from "@/components/AppButton";
import { GlassCard } from "@/components/GlassCard";
import { Screen } from "@/components/Screen";
import { registerForPushNotifications } from "@/services/notifications";
import { useAuthStore } from "@/store/authStore";

export default function Profile() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <Screen>
      <Text className="pt-8 text-3xl font-black text-text">Profile</Text>
      <GlassCard className="gap-3">
        <Text className="text-xl font-bold text-text">{user?.name || "Sahayak user"}</Text>
        <Text className="text-muted">{user?.mobile_number || user?.mobile || "Mobile unavailable"}</Text>
        <Text className="text-muted">Role: {user?.role}</Text>
      </GlassCard>
      <GlassCard className="gap-3">
        <AppButton title="Enable Push Notifications" icon="notifications" onPress={registerForPushNotifications} />
        <AppButton
          title="Logout"
          variant="danger"
          icon="log-out"
          onPress={async () => {
            await logout();
            router.replace("/(auth)/login");
          }}
        />
      </GlassCard>
    </Screen>
  );
}
