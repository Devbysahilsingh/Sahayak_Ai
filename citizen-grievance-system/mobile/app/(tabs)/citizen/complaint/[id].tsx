import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { GlassCard } from "@/components/GlassCard";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { Screen } from "@/components/Screen";
import { StatusPill } from "@/components/StatusPill";
import { api } from "@/services/api";
import { queryClient } from "@/services/queryClient";

export default function CitizenComplaintDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useQuery({ queryKey: ["complaint", id], queryFn: () => api.getComplaint(id) });
  const feedback = useMutation({
    mutationFn: (resolved: boolean) => api.submitComplaintFeedback(id, { is_resolved: resolved, rating: resolved ? 5 : 2 }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["complaint", id] })
  });
  const complaint = query.data?.complaint;

  return (
    <Screen>
      <Text className="pt-8 text-3xl font-black text-text">Complaint Details</Text>
      {query.isLoading || !complaint ? (
        <LoadingSkeleton className="h-72 rounded-3xl" />
      ) : (
        <>
          <GlassCard className="gap-4">
            <View className="flex-row items-start justify-between">
              <Text className="flex-1 text-2xl font-bold text-text">{complaint.title || complaint.category || complaint.id}</Text>
              <StatusPill status={complaint.status} />
            </View>
            <Text className="leading-6 text-muted">{complaint.description}</Text>
            <Text className="text-sm text-teal">Department: {complaint.department || "Pending"}</Text>
            <Text className="text-sm text-muted">Priority: {complaint.priority || "normal"}</Text>
            <Text className="text-sm text-muted">Location: {complaint.location?.address || `${complaint.location?.latitude || ""}, ${complaint.location?.longitude || ""}`}</Text>
          </GlassCard>
          <GlassCard className="gap-3">
            <Text className="text-lg font-bold text-text">Live Tracking</Text>
            <Text className="text-muted">Socket-ready status updates will appear here. Current backend status: {complaint.status}</Text>
            {complaint.worker_location ? (
              <Text className="text-teal">Worker: {complaint.worker_location.latitude}, {complaint.worker_location.longitude}</Text>
            ) : (
              <Text className="text-muted">Worker location not available yet.</Text>
            )}
          </GlassCard>
          <GlassCard className="gap-3">
            <Text className="text-lg font-bold text-text">Feedback</Text>
            <View className="flex-row gap-3">
              <View className="flex-1"><AppButton title="Resolved" onPress={() => feedback.mutate(true)} /></View>
              <View className="flex-1"><AppButton title="Not Resolved" variant="secondary" onPress={() => feedback.mutate(false)} /></View>
            </View>
          </GlassCard>
        </>
      )}
    </Screen>
  );
}
