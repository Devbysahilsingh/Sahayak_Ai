import NetInfo from "@react-native-community/netinfo";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { AppInput } from "@/components/AppInput";
import { GlassCard } from "@/components/GlassCard";
import { LiveEvidenceCamera } from "@/components/LiveEvidenceCamera";
import { Screen } from "@/components/Screen";
import { useVoiceRecorder } from "@/features/voice/useVoiceRecorder";
import { useCurrentLocation } from "@/hooks/useCurrentLocation";
import { api } from "@/services/api";
import { queryClient } from "@/services/queryClient";
import { useOfflineStore } from "@/store/offlineStore";
import { LocationPoint } from "@/types/domain";
import { distanceMeters } from "@/utils/location";

const MATCH_METERS = Number(process.env.EXPO_PUBLIC_LOCATION_MATCH_METERS || 250);

export default function SubmitComplaint() {
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [complaintLocation, setComplaintLocation] = useState<LocationPoint | null>(null);
  const [proofLocation, setProofLocation] = useState<LocationPoint | null>(null);
  const [proofUri, setProofUri] = useState<string | null>(null);
  const [justification, setJustification] = useState("");
  const { getCurrentLocation, loading: locating } = useCurrentLocation();
  const voice = useVoiceRecorder();
  const addDraft = useOfflineStore((state) => state.addDraft);
  const distance = distanceMeters(complaintLocation, proofLocation);
  const mismatch = distance !== null && distance > MATCH_METERS;

  const mutation = useMutation({
    mutationFn: api.createComplaint,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      router.replace("/(tabs)/citizen/complaints");
    }
  });

  async function useGps() {
    const coords = await getCurrentLocation();
    if (coords) {
      setComplaintLocation(coords);
      setProofLocation(coords);
    }
  }

  async function submit() {
    const payload = {
      description,
      category,
      latitude: complaintLocation?.latitude,
      longitude: complaintLocation?.longitude,
      proof_latitude: proofLocation?.latitude,
      proof_longitude: proofLocation?.longitude,
      proof_location_match: !mismatch,
      proof_location_distance_meters: distance ?? "",
      proof_location_justification: mismatch ? justification : "",
      attachments: proofUri ? [{ uri: proofUri, name: "live-proof.jpg", type: "image/jpeg" }] : []
    };
    const net = await NetInfo.fetch();
    if (!net.isConnected) {
      addDraft(payload);
      router.replace("/(tabs)/citizen/complaints");
      return;
    }
    mutation.mutate(payload);
  }

  async function toggleVoice() {
    if (voice.recording) {
      const uri = await voice.stop();
      if (!uri) return;
      try {
        const data = await api.transcribeVoice({ uri, name: "complaint.m4a", type: "audio/m4a" });
        const text = data.text || data.transcript;
        if (text) setDescription((current) => `${current ? `${current}\n` : ""}${text}`);
      } catch {
        setDescription((current) => `${current ? `${current}\n` : ""}[Voice recorded: ${uri}]`);
      }
      return;
    }
    await voice.start();
  }

  return (
    <Screen>
      <Text className="pt-8 text-3xl font-black text-text">File Complaint</Text>
      <GlassCard className="gap-4">
        <AppInput label="Complaint Category" value={category} onChangeText={setCategory} placeholder="Sanitation, road, water..." />
        <AppInput label="Description" value={description} onChangeText={setDescription} multiline className="min-h-28 py-3" placeholder="Explain the issue clearly" />
        <AppButton title={voice.recording ? "Stop Voice Input" : "Start Voice Input"} variant="secondary" icon="mic" onPress={toggleVoice} />
        <AppButton title={complaintLocation ? "GPS Location Captured" : "Use Current GPS Location"} icon="location" loading={locating} onPress={useGps} />
        {complaintLocation ? <Text className="text-sm text-teal">{complaintLocation.latitude.toFixed(5)}, {complaintLocation.longitude.toFixed(5)}</Text> : null}
      </GlassCard>
      <LiveEvidenceCamera
        onCapture={({ uri }) => {
          setProofUri(uri);
          getCurrentLocation().then((coords) => coords && setProofLocation(coords));
        }}
      />
      {mismatch ? (
        <GlassCard className="gap-3 border-danger/60">
          <Text className="font-bold text-red-100">Photo and complaint location do not match</Text>
          <Text className="text-muted">Distance: {distance} meters. Please justify why this photo was taken elsewhere.</Text>
          <AppInput label="Justification" value={justification} onChangeText={setJustification} multiline className="min-h-24 py-3" />
        </GlassCard>
      ) : null}
      <View className="pb-4">
        <AppButton title="Submit Complaint" icon="send" loading={mutation.isPending} disabled={!description || !complaintLocation || (mismatch && !justification)} onPress={submit} />
      </View>
    </Screen>
  );
}
