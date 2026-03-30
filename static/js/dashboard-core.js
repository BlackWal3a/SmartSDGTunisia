// ========================================
// DASHBOARD CORE - Main initialization and setup
// ========================================

// Global variables - track loading state
let mapLoaded = false;
let geoJSONLoaded = false;

// Global variables - layer instances
let governoratesLayer;
let sectorsLayer;
let governoratesLayerBounds;
let sectorsLayerBounds;

// Layer visibility states
const layerStates = {
  governorates: false,
  sectors: false,
  spi: false,
  'ndvi-avg': false,
  'ndvi-current': false,
  'landuse-2019': false
};

// ========================================
// LOADING SCREEN FUNCTIONS
// ========================================

// Hide loading screen when everything is ready
function hideLoadingScreen() {
  // Only hide when both map and data are loaded
  if (mapLoaded && geoJSONLoaded) {
    const loadingScreen = document.getElementById('loading-screen');
    
    // Fade out effect
    loadingScreen.style.opacity = '0';
    loadingScreen.style.visibility = 'hidden';
    
    // Remove from screen after fade
    setTimeout(function() {
      loadingScreen.style.display = 'none';
    }, 800);
  }
}

// Show rotating loading messages
const loadingMessages = [
  "Initializing Tunisia geospatial data",
  "Loading administrative boundaries",
  "Processing geographic coordinates",
  "Setting up interactive map",
  "Almost ready..."
];

let messageIndex = 0;

function updateLoadingMessage() {
  const loadingSubtitle = document.querySelector('.loading-subtitle');
  
  if (loadingSubtitle && messageIndex < loadingMessages.length) {
    loadingSubtitle.textContent = loadingMessages[messageIndex];
    messageIndex++;
    setTimeout(updateLoadingMessage, 800);
  }
}

// Start message rotation
updateLoadingMessage();

// ========================================
// MAP SETUP
// ========================================

// Tunisia boundaries - keep map focused on study area
const tunisiaBounds = [
  [30.2, 7.5],   // Southwest corner
  [37.4, 11.6]   // Northeast corner
];

// Base map options - different styles users can choose from
const baseLayers = {
  // Light map - good for data overlay
  cartodbLight: L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap contributors © CARTO',
    subdomains: 'abcd',
    maxZoom: 20,
    name: 'CartoDB Light'
  }),
  
  // Dark map - good contrast
  cartodbDark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap contributors © CARTO',
    subdomains: 'abcd',
    maxZoom: 20,
    name: 'CartoDB Dark'
  }),
  
  // Standard OpenStreetMap
  osmStandard: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
    name: 'OpenStreetMap'
  }),
  
  // Satellite view
  satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '© Esri © Earthstar Geographics',
    maxZoom: 19,
    name: 'Satellite'
  }),
  
  // Terrain with elevation
  terrain: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors © OpenTopoMap',
    maxZoom: 17,
    name: 'Terrain'
  })
};

// Track current base map
let currentBaseLayer = baseLayers.cartodbLight;

// Create the map
const map = L.map('map', {
  center: [33.8, 9.5],     // Center of Tunisia
  zoom: 7,                 // Initial zoom level
  minZoom: 6,              // Don't zoom out too far
  maxZoom: 20,             // Don't zoom in too far
  maxBounds: tunisiaBounds,    // Keep map within Tunisia
  maxBoundsViscosity: 1.0      // Make boundaries sticky
});

// Add default base map
baseLayers.cartodbLight.addTo(map);

// Map is loaded - check if we can hide loading screen
mapLoaded = true;
hideLoadingScreen();
