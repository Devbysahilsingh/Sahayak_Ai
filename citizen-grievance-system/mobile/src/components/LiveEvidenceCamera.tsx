import { CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";
import { Image, Text, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { GlassCard } from "@/components/GlassCard";
import { scanEvidenceFrame, Detection } from "@/features/camera/visionPipeline";

type Props = {
  onCapture: (asset: { uri: string; detections: Detection[] }) => void;
};

export function LiveEvidenceCamera({ onCapture }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [active, setActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const cameraRef = useRef<CameraView>(null);

  async function capture() {
    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.75 });
    if (!photo?.uri) return;
    setPreview(photo.uri);
    const nextDetections = await scanEvidenceFrame(photo.uri);
    setDetections(nextDetections);
    onCapture({ uri: photo.uri, detections: nextDetections });
  }

  if (!permission?.granted) {
    return (
      <GlassCard className="gap-3">
        <Text className="text-lg font-bold text-text">Live evidence camera</Text>
        <Text className="text-sm text-muted">Camera permission is needed for live complaint proof.</Text>
        <AppButton title="Allow Camera" icon="camera" onPress={requestPermission} />
      </GlassCard>
    );
  }

  return (
    <GlassCard className="gap-4">
      <View className="h-72 overflow-hidden rounded-3xl border border-stroke bg-black">
        {active ? <CameraView ref={cameraRef} className="flex-1" facing="back" animateShutter /> : null}
        {!active && preview ? <Image source={{ uri: preview }} className="h-full w-full" /> : null}
        {!active && !preview ? <View className="flex-1 items-center justify-center"><Text className="text-muted">Camera ready</Text></View> : null}
      </View>
      {detections.length > 0 ? (
        <View className="gap-1">
          {detections.map((item) => (
            <Text key={item.label} className="text-sm text-teal">
              {item.label} - {Math.round(item.confidence * 100)}%
            </Text>
          ))}
        </View>
      ) : null}
      <View className="flex-row gap-3">
        <View className="flex-1">
          <AppButton title={active ? "Stop" : "Open"} variant="secondary" icon="videocam" onPress={() => setActive((value) => !value)} />
        </View>
        <View className="flex-1">
          <AppButton title="Capture" icon="camera" disabled={!active} onPress={capture} />
        </View>
      </View>
    </GlassCard>
  );
}
