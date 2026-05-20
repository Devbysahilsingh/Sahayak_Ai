import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { AppInput } from "@/components/AppInput";
import { GlassCard } from "@/components/GlassCard";
import { LiveEvidenceCamera } from "@/components/LiveEvidenceCamera";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { Screen } from "@/components/Screen";
import { StatusPill } from "@/components/StatusPill";
import { useCurrentLocation } from "@/hooks/useCurrentLocation";
import { api } from "@/services/api";
import { queryClient } from "@/services/queryClient";

export default function WorkerComplaintDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [note, setNote] = useState("");
  const [proofUri, setProofUri] = useState<string | null>(null);
  const { getCurrentLocation } = useCurrentLocation();
  const query = useQuery({ queryKey: ["complaint", id], queryFn: () => api.getComplaint(id) });
  const complaint = query.data?.complaint;
  const start = useMutation({ mutationFn: () => api.startWorkerComplaint(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["complaint", id] }) });
  const resolve = useMutation({
    mutationFn: () => api.resolveWorkerComplaint(id, note, proofUri ? { uri: proofUri, name: "completion-proof.jpg", type: "image/jpeg" } : undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["complaint", id] })
  });

  async function updateLocation() {
    const coords = await getCurrentLocation();
    if (coords) await api.updateWorkerLocation(coords);
  }

  return (
    <Screen>
      <Text className="pt-8 text-3xl font-black text-text">Job Details</Text>
      {!complaint || query.isLoading ? (
        <LoadingSkeleton className="h-72 rounded-3xl" />
      ) : (
        <>
          <GlassCard className="gap-4">
            <View className="flex-row items-start justify-between">
              <Text className="flex-1 text-2xl font-bold text-text">{complaint.title || complaint.category || complaint.id}</Text>
              <StatusPill status={complaint.status} />
            </View>
            <Text className="leading-6 text-muted">{complaint.description}</Text>
            <Text className="text-sm text-teal">Citizen: {complaint.citizen_name || complaint.citizen?.name || "Citizen"}</Text>
            <Text className="text-sm text-muted">Location: {complaint.location?.address || "Open map for coordinates"}</Text>
          </GlassCard>
          <View className="flex-row gap-3">
            <View className="flex-1"><AppButton title="Start" icon="play" loading={start.isPending} onPress={() => start.mutate()} /></View>
            <View className="flex-1"><AppButton title="Update GPS" variant="secondary" icon="navigate" onPress={updateLocation} /></View>
          </View>
          <LiveEvidenceCamera onCapture={({ uri }) => setProofUri(uri)} />
          <GlassCard className="gap-4">
            <AppInput label="Completion note / citizen chat" value={note} onChangeText={setNote} multiline className="min-h-24 py-3" />
            <View className="flex-row gap-3">
              <View className="flex-1"><AppButton title="Need Time" variant="secondary" onPress={() => api.requestWorkerMoreTime(id, note)} /></View>
              <View className="flex-1"><AppButton title="Resolve" icon="checkmark" loading={resolve.isPending} onPress={() => resolve.mutate()} /></View>
            </View>
          </GlassCard>
        </>
      )}
    </Screen>
  );
}
