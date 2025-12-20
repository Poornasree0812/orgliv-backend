// backend/src/utils/geo.js
const DeliveryContainer = require("../models/DeliveryContainer");

// Haversine distance in kilometers
function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371; // Earth radius km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Return nearest container object within radius (or null)
async function findNearestContainer(lat, lng) {
  const containers = await DeliveryContainer.find({ active: true });
  let nearest = null;
  let nearestDist = Infinity;

  for (const c of containers) {
    const dist = haversineDistanceKm(lat, lng, c.lat, c.lng);
    if (dist <= c.radiusKm && dist < nearestDist) {
      nearestDist = dist;
      nearest = { container: c, distanceKm: dist };
    }
  }
  return nearest; // { container, distanceKm } or null
}

module.exports = { haversineDistanceKm, findNearestContainer };
