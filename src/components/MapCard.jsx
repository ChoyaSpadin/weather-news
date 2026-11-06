import { useEffect } from "react";
import { CircleMarker, MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function FlyTo({ lat, lon }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lon], 10, { duration: 1.5 });
  }, [map, lat, lon]);
  return null;
}

/** Mapa do OpenStreetMap (sem chave de API), escurecido por CSS para combinar com o app. */
export default function MapCard({ lat, lon }) {
  return (
    <MapContainer
      center={[lat, lon]}
      zoom={10}
      scrollWheelZoom={false}
      zoomControl={false}
      className="h-full min-h-64 w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        className="map-tiles-dark"
      />
      <CircleMarker
        center={[lat, lon]}
        radius={10}
        pathOptions={{ color: "#fff", weight: 2, fillColor: "#38bdf8", fillOpacity: 0.9 }}
      />
      <FlyTo lat={lat} lon={lon} />
    </MapContainer>
  );
}
