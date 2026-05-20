import { useQuery } from "@tanstack/react-query";
import { Text, View } from "react-native";
import { ComplaintCard } from "@/components/ComplaintCard";
import { GlassCard } from "@/components/GlassCard";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { Screen } from "@/components/Screen";
import { api } from "@/services/api";
import { mockComplaints } from "@/data/mockData";

export default function WorkerDashboard() {
  const query = useQuery({ queryKey: ["workerComplaints"], queryFn: () => api.listWorkerComplaints() });
  const rows = query.data?.results || mockComplaints;

  return (
    <Screen>
      <View className="pt-8">
        <Text className="text-3xl font-black text-text">Worker Jobs</Text>
        <Text className="mt-1 text-muted">Assigned complaints, priority work, and field updates.</Text>
      </View>
      <View className="flex-row gap-3">
        <GlassCard className="flex-1"><Text className="text-3xl font-black text-text">{rows.length}</Text><Text className="text-muted">Assigned</Text></GlassCard>
        <GlassCard className="flex-1"><Text className="text-3xl font-black text-amber">{rows.filter((item) => item.priority === "high").length}</Text><Text className="text-muted">High</Text></GlassCard>
      </View>
      {query.isLoading ? <LoadingSkeleton /> : rows.map((item) => <ComplaintCard key={item.id} complaint={item} base="worker" />)}
    </Screen>
  );
}
