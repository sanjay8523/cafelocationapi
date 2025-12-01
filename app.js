// 1. Check if Key is present
if (!CONFIG || CONFIG.API_KEY.includes("PASTE_YOUR")) {
  alert("STOP! You forgot to paste your API Key in config.js");
}

// 2. Select Elements
const els = {
  btn: document.getElementById("mainBtn"),
  map: document.getElementById("map"),
  status: document.getElementById("statusText"),
  distBox: document.getElementById("distanceDisplay"),
  distVal: document.getElementById("distanceVal"),
  msg: document.getElementById("message"),
};

let map = null;

// 3. Button Click
els.btn.addEventListener("click", () => {
  if (els.btn.innerText === "Enable Location") {
    startProcess();
  } else if (els.btn.innerText === "Place Order") {
    alert("Redirecting to Payment Gateway...");
  }
});

function startProcess() {
  els.btn.disabled = true;
  els.btn.innerText = "Locating...";

  if (!navigator.geolocation) {
    showError("Your browser does not support location.");
    return;
  }

  // Ask browser for location
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      getRoute(lat, lng);
    },
    () => {
      showError("Location access denied.");
    },
    { enableHighAccuracy: true }
  );
}

// 4. CALL GEOAPIFY API
async function getRoute(userLat, userLng) {
  els.btn.innerText = "Calculating Route...";

  // The API URL for Routing
  const url = `https://api.geoapify.com/v1/routing?waypoints=${userLat},${userLng}|${CONFIG.CAFE_LAT},${CONFIG.CAFE_LNG}&mode=drive&apiKey=${CONFIG.API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      // Geoapify returns meters, convert to KM
      const meters = data.features[0].properties.distance;
      const km = meters / 1000;

      updateUI(km, userLat, userLng, data.features[0]);
    } else {
      showError("Could not find a road route.");
    }
  } catch (error) {
    console.error(error);
    showError("API Error. Check your Key in config.js");
  }
}

// 5. Update Screen & Draw Map
function updateUI(km, lat, lng, routeGeoJSON) {
  els.status.innerText = "Route Found";
  els.distBox.style.display = "block";
  els.distVal.innerText = km.toFixed(2) + " km";

  // Draw Map
  initMap(lat, lng, routeGeoJSON);

  // Check if within 3km
  if (km <= CONFIG.MAX_DISTANCE_KM) {
    els.btn.innerText = "Place Order";
    els.btn.disabled = false;
    els.msg.className = "success-msg";
    els.msg.innerText = "✓ You are within the delivery zone!";
  } else {
    els.btn.innerText = "Outside Delivery Area";
    els.btn.disabled = true;
    els.msg.className = "error-msg";
    els.msg.innerText = `✗ Distance is ${km.toFixed(2)}km. We deliver within ${
      CONFIG.MAX_DISTANCE_KM
    }km.`;
  }
}

function initMap(lat, lng, routeData) {
  els.map.classList.add("active");

  if (map) map.remove(); // Reset map if it exists
  map = L.map("map").setView([lat, lng], 13);

  // Load Geoapify Map Tiles
  L.tileLayer(
    `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${CONFIG.API_KEY}`,
    {
      attribution: "Powered by Geoapify",
      maxZoom: 20,
    }
  ).addTo(map);

  // Add Markers
  // Cafe
  L.marker([CONFIG.CAFE_LAT, CONFIG.CAFE_LNG])
    .addTo(map)
    .bindPopup("<b>Yell-O-Houze</b>")
    .openPopup();

  // User
  L.marker([lat, lng]).addTo(map).bindPopup("<b>You</b>");

  // Draw Blue Route Line
  const routeLayer = L.geoJSON(routeData, {
    style: { color: "#6c5ce7", weight: 5, opacity: 0.8 },
  }).addTo(map);

  // Zoom to fit
  map.fitBounds(routeLayer.getBounds().pad(0.1));
}

function showError(text) {
  els.msg.innerText = text;
  els.msg.className = "error-msg";
  els.btn.disabled = false;
  els.btn.innerText = "Retry";
}
