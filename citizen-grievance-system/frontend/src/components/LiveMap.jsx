import { Circle, CircleMarker, MapContainer, Polyline, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER = [22.9734, 78.6569];

export default function LiveMap({ points = [], center, radiusKm, height = 320, label = "Map", zoom = 13, routeCoordinates = [], heatmap = false }) {
  const validPoints = points.filter((point) => point.latitude !== undefined && point.longitude !== undefined);
  const validRoute = routeCoordinates.filter((point) => point.latitude !== undefined && point.longitude !== undefined);
  const mapCenter = center
    ? [center.latitude, center.longitude]
    : validPoints.length
      ? [validPoints[0].latitude, validPoints[0].longitude]
      : DEFAULT_CENTER;

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <MapContainer key={`${mapCenter[0]}-${mapCenter[1]}-${zoom}-${validRoute.length}`} center={mapCenter} zoom={zoom} className="w-full" style={{ height }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {center && radiusKm ? (
          <Circle
            center={[center.latitude, center.longitude]}
            radius={radiusKm * 1000}
            pathOptions={{ color: "#168a8a", fillColor: "#168a8a", fillOpacity: 0.12 }}
          />
        ) : null}
        {heatmap ? (
          <>
            {validPoints.map((point) => (
              <Circle
                key={`heat-${point.id || `${point.latitude}-${point.longitude}`}`}
                center={[point.latitude, point.longitude]}
                radius={point.heatRadius || 1800}
                pathOptions={{
                  color: point.heatColor || "#d97706",
                  fillColor: point.heatColor || "#f97316",
                  fillOpacity: point.heatOpacity || 0.32,
                  opacity: 0.18,
                  weight: 1,
                }}
              />
            ))}
          </>
        ) : null}
        {validRoute.length ? (
          <Polyline
            positions={validRoute.map((point) => [point.latitude, point.longitude])}
            pathOptions={{ color: "#168a8a", weight: 5, opacity: 0.9 }}
          />
        ) : null}
        {!heatmap && validPoints.map((point) => (
          <CircleMarker
            key={point.id || `${point.latitude}-${point.longitude}`}
            center={[point.latitude, point.longitude]}
            radius={point.radius || 9}
            pathOptions={{
              color: point.priority === "Critical" ? "#c62828" : "#0f2a44",
              fillColor: point.priority === "High" ? "#f4a62a" : "#168a8a",
              fillOpacity: 0.85,
            }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{point.title || point.id || label}</p>
                <p>{point.address || point.ward || point.category || ""}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}


