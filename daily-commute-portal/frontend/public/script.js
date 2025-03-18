let map;
let routeLayer;
let userLatLng = null;
let trafficLayer;

// Initialize Leaflet map
function initMap() {
  map = L.map("map").setView([22.9734, 78.6569], 5);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);
}

// Initialize the traffic layer using Mapbox Traffic tiles
function initTrafficLayer() {
  const mapboxToken = "YOUR_MAPBOX_ACCESS_TOKEN";
  trafficLayer = L.tileLayer(
    `https://api.mapbox.com/styles/v1/mapbox/traffic-day-v2/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`,
    {
      tileSize: 512,
      zoomOffset: -1,
      attribution: "Traffic data © Mapbox",
    }
  );
}

// Use browser's geolocation
function useCurrentLocation() {
  if (!navigator.geolocation) {
    showAlert("Geolocation not supported by your browser.");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      userLatLng = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      };
      map.setView([userLatLng.lat, userLatLng.lng], 13);
      showAlert("", false);
    },
    (err) => {
      console.error(err);
      showAlert("Could not get your location.");
    }
  );
}

// Plan route from user's location to a destination
async function planRoute() {
  if (!userLatLng) {
    showAlert("Please click 'Use My Current Location' first.");
    return;
  }
  const destQuery = document.getElementById("destInput").value.trim();
  if (!destQuery) {
    showAlert("Please enter a destination name.");
    return;
  }

  try {
    const geoData = await geocodeNominatim(destQuery);
    if (!geoData) {
      showAlert("Destination not found.");
      return;
    }
    const destLat = parseFloat(geoData.lat);
    const destLng = parseFloat(geoData.lon);

    const routeGeoJSON = await fetchOSRMRoute(
      userLatLng.lat,
      userLatLng.lng,
      destLat,
      destLng
    );

    if (routeLayer) {
      map.removeLayer(routeLayer);
    }
    routeLayer = L.geoJSON(routeGeoJSON, {
      style: { color: "#A84332", weight: 4 },
    }).addTo(map);

    const coords = routeGeoJSON.coordinates.map(([lng, lat]) => [lat, lng]);
    const bounds = L.latLngBounds(coords);
    map.fitBounds(bounds);

    showAlert("", false);
  } catch (err) {
    console.error(err);
    showAlert("Error fetching route. Check console.");
  }
}

// Geocode with Nominatim
async function geocodeNominatim(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    query
  )}`;
  const resp = await fetch(url);
  const data = await resp.json();
  if (!data || data.length === 0) return null;
  return data[0];
}

// Fetch OSRM route
async function fetchOSRMRoute(startLat, startLng, endLat, endLng) {
  const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
  const resp = await fetch(osrmUrl);
  const json = await resp.json();
  if (!json.routes || !json.routes[0]) {
    throw new Error("No routes found in OSRM response");
  }
  return json.routes[0].geometry;
}

// Show or hide alert
function showAlert(msg, isError = true) {
  const alertBox = document.getElementById("alertBox");
  if (!msg) {
    alertBox.style.display = "none";
    return;
  }
  alertBox.textContent = msg;
  alertBox.style.display = "block";
  alertBox.style.backgroundColor = isError
    ? "rgba(255, 0, 0, 0.7)"
    : "rgba(0,128,0,0.7)";
}

// Initialize map and listeners
window.addEventListener("load", () => {
  initMap();
  document.getElementById("locBtn").addEventListener("click", useCurrentLocation);
  document.getElementById("routeBtn").addEventListener("click", planRoute);
});
