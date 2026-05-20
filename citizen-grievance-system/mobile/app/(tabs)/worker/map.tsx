import { useQuery } from "@tanstack/react-query";
import { Text } from "react-native";
import { GlassCard } from "@/components/GlassCard";
import { Screen } from "@/components/Screen";
import { api } from "@/services/api";
import { mockComplaints } from "@/data/mockData";

export default function WorkerMap() {
  const query = useQuery({ queryKey: ["workerComplaints"], queryFn: () => api.listWorkerComplaints() });
  const rows = query.data?.results || mockComplaints;

  return (
    <Screen>
      <Text className="pt-8 text-3xl font-black text-text">Complaint Map</Text>
      <GlassCard className="h-80 items-center justify-center">
        <Text className="text-center text-muted">Map-ready view. Use `react-native-maps` in a development build for live native maps, markers, and navigation overlays.</Text>
      </GlassCard>
      {rows.map((item) => (
        <GlassCard key={item.id} className="gap-1">
          <Text className="font-bold text-text">{item.title || item.category || item.id}</Text>
          <Text className="text-sm text-muted">{item.location?.address || `${item.location?.latitude || ""}, ${item.location?.longitude || ""}`}</Text>
        </GlassCard>
      ))}
    </Screen>
  );
}
