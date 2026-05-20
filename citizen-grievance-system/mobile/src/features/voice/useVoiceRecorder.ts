import { useState } from "react";
import { Audio } from "expo-av";

export function useVoiceRecorder() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [uri, setUri] = useState<string | null>(null);

  async function start() {
    const permission = await Audio.requestPermissionsAsync();
    if (permission.status !== "granted") throw new Error("Microphone permission denied.");
    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
    const next = new Audio.Recording();
    await next.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    await next.startAsync();
    setRecording(next);
  }

  async function stop() {
    if (!recording) return null;
    await recording.stopAndUnloadAsync();
    const nextUri = recording.getURI();
    setRecording(null);
    setUri(nextUri);
    return nextUri;
  }

  return { recording, uri, start, stop };
}
