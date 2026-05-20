import { useState } from "react";
import * as Location from "expo-location";
import { LocationPoint } from "@/types/domain";

export function useCurrentLocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function getCurrentLocation(): Promise<LocationPoint | null> {
    setLoading(true);
    setError(null);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        setError("Location permission denied.");
        return null;
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not get location.");
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { getCurrentLocation, loading, error };
}
