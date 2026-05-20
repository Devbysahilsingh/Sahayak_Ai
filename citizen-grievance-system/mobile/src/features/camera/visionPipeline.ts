export type Detection = {
  label: string;
  confidence: number;
  box?: { x: number; y: number; width: number; height: number };
};

export async function scanEvidenceFrame(_uri: string): Promise<Detection[]> {
  // Expo Go cannot load native OpenCV frame processors. This keeps the app runnable
  // while preserving the production contract for a dev-build OpenCV adapter.
  await new Promise((resolve) => setTimeout(resolve, 500));
  return [
    { label: "possible civic defect", confidence: 0.82, box: { x: 48, y: 72, width: 180, height: 140 } },
    { label: "location evidence quality ok", confidence: 0.91 }
  ];
}
