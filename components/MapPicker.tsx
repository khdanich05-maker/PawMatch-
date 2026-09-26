"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icon issue in Next.js
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number) => void;
  instruction?: string;
}

export default function MapPicker({
  initialLat = 8.6408,
  initialLng = 99.8953,
  onLocationSelect,
  instruction = "คลิกบนแผนที่หรือลากหมุดเพื่อระบุตำแหน่งที่พบสัตว์",
}: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const initialPosition = useRef({ lat: initialLat, lng: initialLng });
  const onSelectRef = useRef(onLocationSelect);

  useEffect(() => {
    onSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize Map only once
    if (!mapInstanceRef.current) {
      const { lat, lng } = initialPosition.current;
      const map = L.map(mapRef.current).setView([lat, lng], 15);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Add initial marker
      const marker = L.marker([lat, lng], {
        icon: defaultIcon,
        draggable: true,
      }).addTo(map);
      markerRef.current = marker;

      // Handle marker drag
      marker.on("dragend", () => {
        const position = marker.getLatLng();
        onSelectRef.current(position.lat, position.lng);
      });

      // Handle map click
      map.on("click", (e: L.LeafletMouseEvent) => {
        marker.setLatLng(e.latlng);
        onSelectRef.current(e.latlng.lat, e.latlng.lng);
      });
    }

    const resizeObserver = new ResizeObserver(() => mapInstanceRef.current?.invalidateSize());
    resizeObserver.observe(mapRef.current);

    return () => {
      resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  const handleGetCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          if (mapInstanceRef.current && markerRef.current) {
            mapInstanceRef.current.setView([latitude, longitude], 15);
            markerRef.current.setLatLng([latitude, longitude]);
            onSelectRef.current(latitude, longitude);
          }
        },
        (err) => {
          console.warn("Geolocation error:", err.message);
          alert("ไม่สามารถดึงตำแหน่งปัจจุบันได้ กรุณาคลิกเลือกตำแหน่งบนแผนที่ด้วยตนเอง");
        },
        { enableHighAccuracy: true }
      );
    } else {
      alert("เบราว์เซอร์นี้ไม่รองรับการระบุตำแหน่ง GPS");
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
      <div ref={mapRef} className="w-full h-80 z-10" />
      <button
        type="button"
        onClick={handleGetCurrentLocation}
        className="absolute top-3 right-3 z-20 bg-white/90 backdrop-blur-sm hover:bg-white text-textMain text-xs font-prompt px-3 py-2 rounded-xl shadow-md border border-gray-200 flex items-center gap-1.5 transition active:scale-95"
      >
        <i className="fa-solid fa-location-crosshairs text-primary"></i>
        ใช้ตำแหน่งปัจจุบันของฉัน
      </button>
      <div className="bg-bgAccent/80 px-4 py-2 text-xs text-textMain font-prompt flex items-center gap-2 border-t border-gray-200">
        <i className="fa-solid fa-circle-info text-primary"></i>
        <span>{instruction}</span>
      </div>
    </div>
  );
}
