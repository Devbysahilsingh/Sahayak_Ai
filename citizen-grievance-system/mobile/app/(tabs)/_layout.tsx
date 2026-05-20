import { Ionicons } from "@expo/vector-icons";
import { Tabs, Redirect } from "expo-router";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { useAuthStore } from "@/store/authStore";

export default function TabsLayout() {
  const role = useAuthStore((state) => state.role);
  useOfflineSync();
  if (!role) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: "#0f172a", borderTopColor: "rgba(148,163,184,0.18)" },
        tabBarActiveTintColor: "#14b8a6",
        tabBarInactiveTintColor: "#94a3b8"
      }}
    >
      <Tabs.Screen name="citizen/index" options={{ title: "Home", href: role === "citizen" ? undefined : null, tabBarIcon: ({ color }) => <Ionicons name="home" color={color} size={22} /> }} />
      <Tabs.Screen name="citizen/submit" options={{ title: "Submit", href: role === "citizen" ? undefined : null, tabBarIcon: ({ color }) => <Ionicons name="add-circle" color={color} size={22} /> }} />
      <Tabs.Screen name="citizen/complaints" options={{ title: "History", href: role === "citizen" ? undefined : null, tabBarIcon: ({ color }) => <Ionicons name="time" color={color} size={22} /> }} />
      <Tabs.Screen name="worker/index" options={{ title: "Jobs", href: role !== "citizen" ? undefined : null, tabBarIcon: ({ color }) => <Ionicons name="briefcase" color={color} size={22} /> }} />
      <Tabs.Screen name="worker/map" options={{ title: "Map", href: role !== "citizen" ? undefined : null, tabBarIcon: ({ color }) => <Ionicons name="map" color={color} size={22} /> }} />
      <Tabs.Screen name="worker/analytics" options={{ title: "Analytics", href: role !== "citizen" ? undefined : null, tabBarIcon: ({ color }) => <Ionicons name="stats-chart" color={color} size={22} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: ({ color }) => <Ionicons name="person" color={color} size={22} /> }} />
      <Tabs.Screen name="citizen/complaint/[id]" options={{ href: null }} />
      <Tabs.Screen name="worker/complaint/[id]" options={{ href: null }} />
    </Tabs>
  );
}
