import { useEffect, useMemo, useState } from "react";
import { CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { api } from "../lib/api";
import { Button, Field, Icon, inputClass } from "./ui";

const DEFAULT_POSITION = { latitude: 28.6139, longitude: 77.209, label: "New Delhi" };

function Recenter({ position }) {
  const map = useMap();

  useEffect(() => {
    map.setView([position.latitude, position.longitude], 15);
  }, [map, position.latitude, position.longitude]);

  return null;
}

function ClickHandler({ onPick }) {
  useMapEvents({
    click(event) {
      onPick({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      });
    },
  });

  return null;
}

export default function LocationPicker({ value, onChange }) {
  const [mode, setMode] = useState("current");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [status, setStatus] = useState("");
  const position = value || DEFAULT_POSITION;

  const displayCoords = useMemo(
    () => `${Number(position.latitude).toFixed(5)}, ${Number(position.longitude).toFixed(5)}`,
    [position.latitude, position.longitude],
  );

  useEffect(() => {
    fetchCurrentLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 3) {
      return;
    }

    const timeout = window.setTimeout(async () => {
      try {
        const data = await api.geoSearch(trimmed);
        const nextSuggestions = (data.features || []).slice(0, 3).map((feature) => ({
          label: feature.properties?.formatted || feature.properties?.address_line1 || trimmed,
          latitude: feature.properties?.lat,
          longitude: feature.properties?.lon,
          address: feature.properties?.formatted || "",
          ward: feature.properties?.suburb || feature.properties?.district || "",
        }));
        setSuggestions(nextSuggestions.filter((item) => item.latitude && item.longitude));
      } catch (error) {
        setStatus(error.message || "Location suggestions unavailable.");
        setSuggestions([]);
      }
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [query]);

  function updateLocation(next) {
    onChange({
      ...position,
      ...next,
    });
  }

  async function reverseGeocode(latitude, longitude) {
    try {
      const data = await api.geoReverse(latitude, longitude);
      const feature = data.features?.[0];
      if (!feature) return;
      updateLocation({
        latitude,
        longitude,
        address: feature.properties?.formatted || "",
        ward: feature.properties?.suburb || feature.properties?.district || "",
      });
    } catch {
      updateLocation({ latitude, longitude });
    }
  }

  function fetchCurrentLocation() {
    setMode("current");
    setStatus("Fetching current location...");
    if (!navigator.geolocation) {
      setStatus("Current location is not supported in this browser.");
      updateLocation(DEFAULT_POSITION);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (geo) => {
        const latitude = geo.coords.latitude;
        const longitude = geo.coords.longitude;
        setStatus("Current location selected.");
        reverseGeocode(latitude, longitude);
      },
      () => {
        setStatus("Location permission denied. Select location from the map or search.");
        updateLocation(DEFAULT_POSITION);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }

  function pickMapLocation(next) {
    setMode("map");
    setStatus("Map location selected.");
    reverseGeocode(next.latitude, next.longitude);
  }

  function selectSuggestion(suggestion) {
    setMode("map");
    setQuery(suggestion.label);
    setSuggestions([]);
    setStatus("Search location selected.");
    updateLocation(suggestion);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Button type="button" variant={mode === "current" ? "primary" : "outline"} onClick={fetchCurrentLocation}>
          <Icon name="my_location" />
          Use Current Location
        </Button>
        <Button type="button" variant={mode === "map" ? "primary" : "outline"} onClick={() => setMode("map")}>
          <Icon name="map" />
          Pick From Map
        </Button>
      </div>

      <div className="relative">
        <Field label="Search complaint location">
          <input
            className={inputClass}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              if (event.target.value.trim().length < 3) {
                setSuggestions([]);
              }
            }}
            placeholder="Type area, road, ward, or landmark"
          />
        </Field>
        {suggestions.length > 0 ? (
          <div className="absolute z-[1000] mt-1 w-full overflow-hidden rounded-md border border-border bg-white shadow-lg">
            {suggestions.map((suggestion) => (
              <button
                key={`${suggestion.latitude}-${suggestion.longitude}`}
                type="button"
                className="block w-full px-4 py-3 text-left text-sm hover:bg-surface-soft"
                onClick={() => selectSuggestion(suggestion)}
              >
                {suggestion.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <MapContainer center={[position.latitude, position.longitude]} zoom={15} className="h-[360px] w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Recenter position={position} />
          <ClickHandler onPick={pickMapLocation} />
          <CircleMarker
            center={[position.latitude, position.longitude]}
            radius={10}
            pathOptions={{ color: "#0f2a44", fillColor: "#168a8a", fillOpacity: 0.9 }}
          />
        </MapContainer>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Address">
          <input
            className={inputClass}
            value={position.address || ""}
            onChange={(event) => updateLocation({ address: event.target.value })}
            placeholder="Address from Geoapify or manual entry"
          />
        </Field>
        <Field label="Ward / Zone">
          <input
            className={inputClass}
            value={position.ward || ""}
            onChange={(event) => updateLocation({ ward: event.target.value })}
            placeholder="Ward or zone"
          />
        </Field>
        <Field label="Landmark">
          <input
            className={inputClass}
            value={position.landmark || ""}
            onChange={(event) => updateLocation({ landmark: event.target.value })}
            placeholder="Nearby landmark"
          />
        </Field>
        <Field label="Coordinates">
          <input className={inputClass} value={displayCoords} readOnly />
        </Field>
      </div>

      {status ? <p className="text-sm text-text-muted">{status}</p> : null}
    </div>
  );
}
