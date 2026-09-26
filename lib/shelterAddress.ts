const coordinatesPattern = /\s*\(\s*พิกัด\s*:\s*([+-]?\d+(?:\.\d+)?)\s*,\s*([+-]?\d+(?:\.\d+)?)\s*\)/;

export function addressCoordinates(address: string) {
  const match = address.match(coordinatesPattern);
  if (!match) return null;
  const lat = Number(match[1]);
  const lng = Number(match[2]);
  return Math.abs(lat) <= 90 && Math.abs(lng) <= 180 ? { lat, lng } : null;
}

export function addressWithCoordinates(address: string, lat: number, lng: number) {
  const label = address.replace(new RegExp(coordinatesPattern.source, "g"), "").trim();
  return `${label}${label ? " " : ""}(พิกัด: ${lat.toFixed(6)}, ${lng.toFixed(6)})`;
}
