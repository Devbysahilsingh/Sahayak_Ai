import { useQuery } from "@tanstack/react-query";
import { Text, View } from "react-native";
import { GlassCard } from "@/components/GlassCard";
import { Screen } from "@/components/Screen";
import { api } from "@/services/api";

export default function WorkerAnalytics() {
  const stats = useQuery({ queryKey: ["dashboardStats"], queryFn: api.dashboardStats });
  const data = stats.data || {};

  return (
    <Screen>
      <Text className="pt-8 text-3xl font-black text-text">Analytics</Text>
      <View className="flex-row flex-wrap gap-3">
        {[
          ["Total", data.total || 0],
          ["Pending", data.pending || 0],
          ["Assigned", data.assigned || 0],
          ["Resolved", data.resolved || 0],
          ["High Priority", data.high_priority || 0]
        ].map(([label, value]) => (
          <GlassCard key={label} className="min-w-[46%] flex-1">
            <Text className="text-3xl font-black text-text">{value}</Text>
            <Text className="text-muted">{label}</Text>
          </GlassCard>
        ))}
      </View>
    </Screen>
  );
}
