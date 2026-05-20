import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Text, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { ComplaintCard } from "@/components/ComplaintCard";
import { GlassCard } from "@/components/GlassCard";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { Screen } from "@/components/Screen";
import { api } from "@/services/api";
import { mockComplaints, mockNotifications } from "@/data/mockData";

export default function CitizenHome() {
  const complaints = useQuery({ queryKey: ["complaints", "citizen"], queryFn: () => api.listComplaints() });
  const notifications = useQuery({ queryKey: ["notifications"], queryFn: api.listNotifications });
  const rows = complaints.data?.results || mockComplaints;

  return (
    <Screen>
      <View className="pt-8">
        <Text className="text-3xl font-black text-text">Citizen Dashboard</Text>
        <Text className="mt-1 text-muted">Submit, track, and resolve civic complaints.</Text>
      </View>
      <GlassCard className="gap-4">
        <Text className="text-xl font-bold text-text">Quick action</Text>
        <AppButton title="File New Complaint" icon="add" onPress={() => router.push("/(tabs)/citizen/submit")} />
      </GlassCard>
      <View className="gap-3">
        <Text className="text-lg font-bold text-text">Recent complaints</Text>
        {complaints.isLoading ? <LoadingSkeleton /> : rows.slice(0, 3).map((item) => <ComplaintCard key={item.id} complaint={item} />)}
      </View>
      <GlassCard className="gap-2">
        <Text className="text-lg font-bold text-text">Notifications</Text>
        {(notifications.data?.results || mockNotifications).slice(0, 3).map((item) => (
          <Text key={item.id} className="text-sm text-muted">{item.title}: {item.message}</Text>
        ))}
      </GlassCard>
    </Screen>
  );
}
