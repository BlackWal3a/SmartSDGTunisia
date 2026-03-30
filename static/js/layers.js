// ========================================
// LAYERS - Layer Management and Loading
// ========================================

// ========================================
// LAYER CATEGORIES
// ========================================

// All available layer categories and their layers
// Each category matches a sidebar icon
const categories = {
  'land-use': {
    title: 'Land Use / Land Cover',
    description: 'Land use and land cover classification layers',
    layers: [
      { 
        id: 'landuse-2019',
        name: 'Landuse/Landcover 2019',
        description: 'Land use and land cover classification for Tunisia (2019)',
        color: '#4CAF50'
      },
      { 
        id: 'land-cover-2020',
        name: 'Land Cover 2020',
        description: 'Detailed classification of land cover types',
        color: '#8BC34A'
      },
      { 
        id: 'land-use-change',
        name: 'Land Use Change (2015-2020)',
        description: 'Changes in land use over 5 years',
        color: '#CDDC39'
      }
    ]
  },
  'vegetation': {
    title: 'Vegetation / NDVI',
    description: 'Vegetation indices and health monitoring',
    layers: [
      { 
        id: 'ndvi-current',
        name: 'NDVI Current',
        description: 'Normalized Difference Vegetation Index',
        color: '#4CAF50'
      },
      { 
        id: 'ndvi-avg',
        name: 'NDVI Average',
        description: 'Average NDVI (single raster)',
        color: '#2E7D32'
      },
      { 
        id: 'vegetation-health',
        name: 'Vegetation Health Index',
        description: 'Health assessment of vegetation cover',
        color: '#8BC34A'
      }
    ]
  },
  'water': {
    title: 'Water Resources',
    description: 'Water bodies and resources monitoring',
    layers: [
      { 
        id: 'water-bodies',
        name: 'Water Bodies',
        description: 'Lakes, rivers, and other water bodies',
        color: '#2196F3'
      },
      { 
        id: 'water-quality',
        name: 'Water Quality Index',
        description: 'Water quality assessment',
        color: '#00BCD4'
      }
    ]
  },
  'biodiversity': {
    title: 'Biodiversity',
    description: 'Biodiversity and habitat information',
    layers: [
      { 
        id: 'protected-areas',
        name: 'Protected Areas',
        description: 'National parks and protected zones',
        color: '#9C27B0'
      }
    ]
  },
  'climate': {
    title: 'Climate / Weather',
    description: 'Climate and weather data',
    layers: [
      { 
        id: 'temperature',
        name: 'Temperature',
        description: 'Current temperature data',
        color: '#FF5722'
      },
      { 
        id: 'spi',
        name: 'SPI (Standardized Precipitation Index)',
        description: 'Monthly drought and precipitation index (2025 data available)',
        color: '#2196F3'
      }
    ]
  },
  'urban': {
    title: 'Human Pressure / Urbanization',
    description: 'Urban expansion and human impact',
    layers: [
      { 
        id: 'urban-areas',
        name: 'Urban Areas',
        description: 'Built-up and urbanized regions',
        color: '#795548'
      }
    ]
  },
  'fires': {
    title: 'Forest Fires',
    description: 'Fire incidents and risk assessment',
    layers: [
      { 
        id: 'fire-hotspots',
        name: 'Active Fire Hotspots',
        description: 'Current and recent fire incidents',
        color: '#F44336'
      }
    ]
  },
  'soil': {
    title: 'Soil & Agriculture',
    description: 'Soil properties and agricultural land use',
    layers: [
      { 
        id: 'soil-type',
        name: 'Soil Types',
        description: 'Soil classification and properties',
        color: '#8D6E63'
      }
    ]
  },
  'boundaries': {
    title: 'Boundaries / Administrative',
    description: 'Administrative and political boundaries',
    layers: [
      { 
        id: 'governorates',
        name: 'Delegations',
        description: 'Administrative boundaries of Tunisian delegations',
        color: '#FFD700'
      },
      { 
        id: 'sectors',
        name: 'Sectors',
        description: 'Detailed administrative boundaries of Tunisian sectors',
        color: '#FF9800'
      },
      { 
        id: 'admin-boundaries',
        name: 'Administrative Boundaries',
        description: 'Country, region, and district boundaries',
        color: '#9E9E9E'
      }
    ]
  }
};

// ========================================
// GEOJSON DATA LOADING
// ========================================

// Load governorates/delegations data
function loadGovernorates() {
  fetch('assets/data/Tun_Delegations/Tun_Del.geojson')
    .then(function(response) {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(function(data) {
      // Convert coordinates to regular lat/lng
      const transformedData = transformGeoJSON(data);
      
      // Create layer with styling and interactions
      governoratesLayer = L.geoJSON(transformedData, {
        style: styleGovernorate,
        onEachFeature: onEachFeature
      });
      
      // Store boundaries for later use
      governoratesLayerBounds = governoratesLayer.getBounds();
      
      // Check if we can hide loading screen
      if (sectorsLayer) {
        geoJSONLoaded = true;
        hideLoadingScreen();
      }
    })
    .catch(function(error) {
      console.error('Error loading GeoJSON:', error);
      // Still mark as loaded to prevent infinite loading
      if (sectorsLayer) {
        geoJSONLoaded = true;
        hideLoadingScreen();
      }
    });
}

// Load sectors data
function loadSectors() {
  fetch('assets/data/Tun_Sectors/Tun_Sec.geojson')
    .then(function(response) {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(function(data) {
      // Convert coordinates to regular lat/lng
      const transformedData = transformGeoJSON(data);
      
      // Create layer with styling and interactions
      sectorsLayer = L.geoJSON(transformedData, {
        style: styleSectors,
        onEachFeature: onEachSectorFeature
      });
      
      // Store boundaries for later use
      sectorsLayerBounds = sectorsLayer.getBounds();
      
      // Check if we can hide loading screen
      if (governoratesLayer) {
        geoJSONLoaded = true;
        hideLoadingScreen();
      }
    })
    .catch(function(error) {
      console.error('Error loading sectors GeoJSON:', error);
      // Still mark as loaded to prevent infinite loading
      if (governoratesLayer) {
        geoJSONLoaded = true;
        hideLoadingScreen();
      }
    });
}

// ========================================
// LAYER STYLING
// ========================================

// Style for governorates (delegations) - yellow borders
function styleGovernorate() {
  return {
    fillColor: '#FFFFFF',     // Transparent fill
    weight: 1.5,              // Border thickness
    opacity: 1,               // Solid border
    color: '#FFD700',         // Gold/yellow color
    fillOpacity: 0,           // No fill color
    className: 'governorate-layer'
  };
}

// Style for sectors - orange borders, thinner
function styleSectors() {
  return {
    fillColor: '#FFFFFF',     // Transparent fill
    weight: 1,                // Thinner border
    opacity: 1,               // Solid border
    color: '#FF9800',         // Orange color
    fillOpacity: 0,           // No fill color
    className: 'sectors-layer'
  };
}

// ========================================
// LAYER INTERACTIONS - Governorates
// ========================================

// Highlight governorate when mouse hovers
function highlightFeature(e) {
  const layer = e.target;
  
  // Make border thicker and yellow
  layer.setStyle({
    weight: 3,              // Thicker border
    color: '#FFFF00',       // Bright yellow
    dashArray: '',          // Solid line
    fillOpacity: 0          // Keep transparent
  });

  // Show tooltip with name
  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bindTooltip(layer.feature.properties.N_FR_DEL || layer.feature.properties.N_AR_DEL, {
      permanent: false,      // Only show on hover
      direction: 'auto',
      className: 'custom-tooltip'
    }).openTooltip(e.latlng);
  }
}

// Remove highlight when mouse leaves
function resetHighlight(e) {
  governoratesLayer.resetStyle(e.target);
  e.target.closeTooltip();
}

// Show information when governorate is clicked
function showGovernorateInfo(e) {
  const props = e.target.feature.properties;
  const infoPanel = document.createElement('div');
  
  // Build information display
  infoPanel.innerHTML = `
    <h4>${props.N_FR_DEL || props.N_AR_DEL || 'Delegation'}</h4>
    ${props.C_DEL ? `<p><strong>Delegation Code:</strong> ${props.C_DEL}</p>` : ''}
    ${props.C_GOUV ? `<p><strong>Governorate Code:</strong> ${props.C_GOUV}</p>` : ''}
    ${props.N_FR_GOUV ? `<p><strong>Governorate:</strong> ${props.N_FR_GOUV}</p>` : ''}
    ${props.SUPERFICIE ? `<p><strong>Area:</strong> ${props.SUPERFICIE.toLocaleString()} km²</p>` : ''}
  `;
  
  // Update side panel
  document.getElementById('panel-title').textContent = props.N_FR_DEL || props.N_AR_DEL || 'Delegation';
  document.getElementById('panel-description').innerHTML = infoPanel.innerHTML;
  document.getElementById('layer-panel').classList.add('active');
}

// ========================================
// LAYER INTERACTIONS - Sectors
// ========================================

// Highlight sector when mouse hovers
function highlightSectorFeature(e) {
  const layer = e.target;
  
  // Make border red-orange
  layer.setStyle({
    weight: 2,              // Medium thickness
    color: '#FF5722',       // Red-orange
    dashArray: '',          // Solid line
    fillOpacity: 0          // Keep transparent
  });

  // Show tooltip with name
  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bindTooltip(layer.feature.properties.NOM_FR_SE || layer.feature.properties.NOM_AR_SE, {
      permanent: false,      // Only show on hover
      direction: 'auto',
      className: 'custom-tooltip'
    }).openTooltip(e.latlng);
  }
}

// Remove sector highlight
function resetSectorHighlight(e) {
  sectorsLayer.resetStyle(e.target);
  e.target.closeTooltip();
}

// Show sector information when clicked
function showSectorInfo(e) {
  const props = e.target.feature.properties;
  const infoPanel = document.createElement('div');
  
  // Build information display
  infoPanel.innerHTML = `
    <h4>${props.NOM_FR_SE || props.NOM_AR_SE || 'Sector'}</h4>
    ${props.CODE_INS_S ? `<p><strong>Sector Code:</strong> ${props.CODE_INS_S}</p>` : ''}
    ${props.N_FR_DEL ? `<p><strong>Delegation:</strong> ${props.N_FR_DEL}</p>` : ''}
    ${props.N_GOUV ? `<p><strong>Governorate:</strong> ${props.N_GOUV}</p>` : ''}
    ${props.SUPERFICIE ? `<p><strong>Area:</strong> ${props.SUPERFICIE.toLocaleString()} km²</p>` : ''}
    ${props.PERIMETRE ? `<p><strong>Perimeter:</strong> ${props.PERIMETRE.toLocaleString()} km</p>` : ''}
  `;
  
  // Update side panel
  document.getElementById('panel-title').textContent = props.NOM_FR_SE || props.NOM_AR_SE || 'Sector';
  document.getElementById('panel-description').innerHTML = infoPanel.innerHTML;
  document.getElementById('layer-panel').classList.add('active');
}

// ========================================
// EVENT HANDLERS
// ========================================

// Attach events to governorate features
function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,      // Hover highlight
    mouseout: resetHighlight,        // Remove highlight
    click: showGovernorateInfo       // Show info
  });
}

// Attach events to sector features
function onEachSectorFeature(feature, layer) {
  layer.on({
    mouseover: highlightSectorFeature,    // Hover highlight
    mouseout: resetSectorHighlight,        // Remove highlight
    click: showSectorInfo                 // Show info
  });
}

// ========================================
// COORDINATE TRANSFORMATION
// ========================================

// Convert UTM coordinates to regular lat/lng
function utmToLatLong(easting, northing, zoneNumber) {
  // Define coordinate systems
  const utm32n = '+proj=utm +zone=32 +datum=WGS84 +units=m +no_defs';  // Tunisia UTM
  const wgs84 = '+proj=longlat +datum=WGS84 +no_defs';                  // Regular coordinates
  
  // Convert using proj4js
  const result = proj4(utm32n, wgs84, [easting, northing]);
  
  return [result[1], result[0]]; // Return [latitude, longitude]
}

// Transform entire GeoJSON from UTM to regular coordinates
function transformGeoJSON(geojson) {
  // Make a copy to avoid changing original
  const transformed = JSON.parse(JSON.stringify(geojson));
  
  // Process each feature
  transformed.features.forEach(function(feature) {
    if (feature.geometry.type === 'MultiPolygon') {
      // Handle multiple polygons
      feature.geometry.coordinates = feature.geometry.coordinates.map(function(polygon) {
        return polygon.map(function(ring) {
          return ring.map(function(coord) {
            // Convert each coordinate
            const [lat, lon] = utmToLatLong(coord[0], coord[1], 32);
            return [lon, lat];  // Leaflet needs [longitude, latitude]
          });
        });
      });
    } else if (feature.geometry.type === 'Polygon') {
      // Handle single polygon
      feature.geometry.coordinates = feature.geometry.coordinates.map(function(ring) {
        return ring.map(function(coord) {
          const [lat, lon] = utmToLatLong(coord[0], coord[1], 32);
          return [lon, lat];
        });
      });
    }
  });
  
  // Update coordinate system
  transformed.crs = {
    "type": "name",
    "properties": {
      "name": "urn:ogc:def:crs:EPSG::4326"  // WGS84
    }
  };
  
  return transformed;
}

// ========================================
// PIXEL READER INTEGRATION
// ========================================

// Convert RGB color to hex string
function rgbToHex(r, g, b) {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Convert hex to RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// Global pixel reader instances
let spiPixelReader = null;
let ndviPixelReader = null;
let landusePixelReader = null;

// Initialize pixel readers
function initializePixelReaders() {
    // Initialize SPI pixel reader (will load metadata automatically)
    spiPixelReader = createPixelReader('spi', {
        onPixelRead: showSPIValueInfo,
        onError: handlePixelReadError
    });
    
    // Initialize NDVI pixel reader
    ndviPixelReader = createPixelReader('ndvi', {
        onPixelRead: showSPIValueInfo,
        onError: handlePixelReadError
    });
    
    // Initialize Landuse pixel reader
    landusePixelReader = createPixelReader('landuse', {
        onPixelRead: showSPIValueInfo,
        onError: handlePixelReadError
    });
    
    console.log('Pixel readers initialized');
}

// Handle pixel read errors
function handlePixelReadError(result) {
    showSPIValueInfo(
        'No data',
        result.description,
        result.coordinates,
        result.pixel ? result.pixel.x : 0,
        result.pixel ? result.pixel.y : 0,
        null, null, null
    );
}

// Add click handler to read pixel values from PNG layer (using new pixel reader)
function addPixelClickHandler(layer, config) {
    // Remove existing click handler if any
    if (window.pixelClickHandler) {
        map.off('click', window.pixelClickHandler);
    }
    
    // Choose appropriate pixel reader based on active mode
    let pixelReader;
    switch (activeRasterMode) {
        case 'spi':
            pixelReader = spiPixelReader;
            break;
        case 'ndvi':
            pixelReader = ndviPixelReader;
            break;
        case 'landuse':
            pixelReader = landusePixelReader;
            break;
        default:
            pixelReader = spiPixelReader;
    }
    
    if (pixelReader) {
        pixelReader.addClickHandler(map, layer, config);
        console.log('Click handler added for layer:', config.name, 'mode:', activeRasterMode);
    } else {
        console.error('Pixel reader not initialized for mode:', activeRasterMode);
    }
}

// Legacy function - kept for compatibility but now uses pixel reader
function readPixelValue(latlng, layer, config) {
    let pixelReader;
    switch (activeRasterMode) {
        case 'spi':
            pixelReader = spiPixelReader;
            break;
        case 'ndvi':
            pixelReader = ndviPixelReader;
            break;
        case 'landuse':
            pixelReader = landusePixelReader;
            break;
        default:
            pixelReader = spiPixelReader;
    }
    
    if (pixelReader) {
        pixelReader.readPixelValue(latlng, layer, config);
    } else {
        console.error('Pixel reader not initialized for mode:', activeRasterMode);
    }
}

// Legacy function - now handled by pixel reader utility
function findClosestColor(r, g, b) {
    if (spiPixelReader) {
        return spiPixelReader.findClosestColor(r, g, b);
    }
    return { value: 0, hex: '#000000', distance: Infinity };
}

// Get SPI description based on value
function getSPIDescription(spiValue) {
    if (spiValue <= -2.0) return 'Extreme Drought';
    if (spiValue <= -1.5) return 'Severe Drought';
    if (spiValue <= -1.0) return 'Moderate Drought';
    if (spiValue <= -0.5) return 'Mild Drought';
    if (spiValue <= 0.5) return 'Near Normal';
    if (spiValue <= 1.0) return 'Normal Conditions';
    if (spiValue <= 1.5) return 'Moderately Wet';
    if (spiValue <= 2.0) return 'Very Wet';
    return 'Extremely Wet';
}

let activeRasterMode = 'spi';

function setRasterMode(mode, title) {
    activeRasterMode = mode;
    const panel = document.getElementById('spi-panel') || ensureSPIPanel();

    const headerTitle = panel.querySelector('#spi-panel-title');
    if (headerTitle) {
        headerTitle.textContent = title;
    }

    const navRow = panel.querySelector('#spi-nav-row');
    if (navRow) {
        navRow.style.display = mode === 'spi' ? 'flex' : 'none';
    }

    const log = panel.querySelector('#spi-panel-log');
    if (log) {
        const placeholder = mode === 'spi'
            ? 'Click the map to add SPI readings here.'
            : mode === 'ndvi'
            ? 'Click the map to add NDVI pixel readings here.'
            : 'Click the map to add landuse class readings here.';

        const firstDiv = log.querySelector('div');
        if (firstDiv && firstDiv.textContent && (firstDiv.textContent.includes('Click the map') || firstDiv.textContent.includes('No SPI PNG'))) {
            log.innerHTML = `<div style="font-size: 12px; color: #6b7280;">${placeholder}</div>`;
        }
    }

    updateSPIPanelLayerInfo();
}

function ensureSPIPanel() {
    const legacySelector = document.getElementById('png-layer-selector');
    if (legacySelector) {
        legacySelector.remove();
    }

    const existingPanel = document.getElementById('spi-panel');
    if (existingPanel) {
        // Force recreate panel to ensure new structure
        console.log('Removing old SPI panel to recreate with date selector');
        existingPanel.remove();
    }

    const panel = document.createElement('div');
    panel.id = 'spi-panel';
    panel.style.cssText = `
        position: absolute;
        top: 20px;
        right: 90px;
        width: 360px;
        max-height: 60vh;
        background: white;
        border-radius: 10px;
        box-shadow: 0 6px 24px rgba(0,0,0,0.25);
        z-index: 1000;
        font-family: Arial, sans-serif;
        border-left: 4px solid #2196F3;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    `;

    panel.innerHTML = `
        <div id="spi-panel-header" style="padding: 12px 12px 10px 12px; border-bottom: 1px solid #eee;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                <div id="spi-panel-title" style="font-weight: 700; color: #2196F3; font-size: 14px;">SPI Panel</div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <button id="spi-panel-clear" style="background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 6px; padding: 4px 8px; cursor: pointer; font-size: 12px;">Clear</button>
                    <button id="spi-panel-close" style="background: none; border: none; font-size: 18px; cursor: pointer; color: #999; line-height: 1;">×</button>
                </div>
            </div>

            <div style="margin-top: 10px; display: grid; grid-template-columns: 1fr; gap: 10px;">
                <div id="spi-nav-row" style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                    <div style="flex: 1; min-width: 0;">
                        <select id="spi-date-selector" style="width: 100%; background: #ffffff; border: 1px solid #d1d5db; border-radius: 8px; padding: 6px 10px; cursor: pointer; font-size: 12px; font-weight: 700; color: #111827;">
                            <option value="">Select Date</option>
                        </select>
                        <div id="spi-layer-meta" style="font-size: 11px; color: #6b7280; margin-top: 4px;"></div>
                    </div>
                </div>

                <div>
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                        <div style="font-size: 12px; font-weight: 700; color: #111827;">Opacity</div>
                        <button id="spi-opacity-toggle" style="background: #ffffff; border: 1px solid #d1d5db; border-radius: 8px; padding: 6px 10px; cursor: pointer; font-size: 12px;">Adjust</button>
                    </div>
                    <div id="spi-opacity-wrap" style="margin-top: 8px; display: none;">
                        <input id="spi-opacity" type="range" min="0" max="1" step="0.05" value="0.8" style="width: 100%;" />
                    </div>
                </div>
            </div>
        </div>

        <div id="spi-panel-log" style="padding: 12px; overflow: auto;">
            <div style="font-size: 12px; color: #6b7280;">Click the map to add SPI readings here.</div>
        </div>
    `;

    const closeBtn = panel.querySelector('#spi-panel-close');
    closeBtn.addEventListener('click', () => panel.remove());

    const clearBtn = panel.querySelector('#spi-panel-clear');
    clearBtn.addEventListener('click', () => {
        const log = panel.querySelector('#spi-panel-log');
        log.innerHTML = '<div style="font-size: 12px; color: #6b7280;">Click the map to add SPI readings here.</div>';
    });

    // Populate date selector
    const dateSelector = panel.querySelector('#spi-date-selector');
    if (dateSelector) {
        console.log('Creating date selector with', imageConfigs.length, 'options');
        imageConfigs.forEach((config, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = config.name.replace('Tunisia SPI ', '');
            dateSelector.appendChild(option);
        });
    } else {
        console.error('Date selector not found in panel!');
    }

    // Handle date selection
    dateSelector.addEventListener('change', (e) => {
        const selectedIndex = parseInt(e.target.value);
        if (!isNaN(selectedIndex)) {
            loadPNGLayer(selectedIndex);
        }
    });

    const opacityWrap = panel.querySelector('#spi-opacity-wrap');
    panel.querySelector('#spi-opacity-toggle').addEventListener('click', () => {
        opacityWrap.style.display = opacityWrap.style.display === 'none' ? 'block' : 'none';
    });

    panel.querySelector('#spi-opacity').addEventListener('input', (e) => {
        const val = Number(e.target.value);
        if (activeRasterMode === 'spi') {
            setPNGLayerOpacity(val);
        } else if (activeRasterMode === 'ndvi') {
            setNDVILayerOpacity(val);
        } else if (activeRasterMode === 'landuse') {
            setLanduseLayerOpacity(val);
        }
    });

    document.querySelector('.map-container').appendChild(panel);
    return panel;
}

function updateSPIPanelLayerInfo() {
    const panel = document.getElementById('spi-panel');
    if (!panel) return;

    let info;
    switch (activeRasterMode) {
        case 'spi':
            info = getCurrentPNGLayerInfo();
            break;
        case 'ndvi':
            info = getNDVILayerInfo();
            break;
        case 'landuse':
            info = getLanduseLayerInfo();
            break;
        default:
            info = null;
    }
    
    const dateSelector = panel.querySelector('#spi-date-selector');
    const metaEl = panel.querySelector('#spi-layer-meta');

    if (!info) {
        if (dateSelector) dateSelector.value = '';
        if (metaEl) metaEl.textContent = '';
        return;
    }

    // Update date selector
    if (dateSelector) {
        dateSelector.value = activeRasterMode === 'spi' ? currentPNGLayerIndex : '';
    }

    // Update meta info
    if (metaEl) {
        metaEl.textContent = activeRasterMode === 'spi'
            ? `Time series: ${info.index + 1} / ${info.total}`
            : 'Single raster';
    }
}

function showSPIValueInfo(result) {
    // Handle both old format and new pixel reader format
    let spiValue, description, latlng, pixelX, pixelY, r, g, b;
    
    if (typeof result === 'object' && result.coordinates) {
        // New pixel reader format
        spiValue = result.value !== null ? (typeof result.value === 'number' ? result.value.toFixed(2) : result.value) : 'No data';
        description = result.description;
        latlng = result.coordinates;
        pixelX = result.pixel ? result.pixel.x : 0;
        pixelY = result.pixel ? result.pixel.y : 0;
        r = result.pixel ? result.pixel.r : null;
        g = result.pixel ? result.pixel.g : null;
        b = result.pixel ? result.pixel.b : null;
    } else {
        // Legacy format - handle parameters directly
        spiValue = arguments[0];
        description = arguments[1];
        latlng = arguments[2];
        pixelX = arguments[3];
        pixelY = arguments[4];
        r = arguments[5];
        g = arguments[6];
        b = arguments[7];
    }
    
    const panel = ensureSPIPanel();
    const log = panel.querySelector('#spi-panel-log');

    const time = new Date();
    const t = time.toLocaleString();

    let colorHtml = '<div style="font-size: 11px; color: #9ca3af; font-style: italic;">No pixel data</div>';
    if (r !== null && g !== null && b !== null) {
        const hexColor = rgbToHex(r, g, b);
        colorHtml = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 16px; height: 16px; background: ${hexColor}; border: 1px solid #d1d5db; border-radius: 3px;"></div>
                <div style="font-size: 11px; font-family: monospace; color: #374151;">RGB(${r}, ${g}, ${b}) = ${hexColor}</div>
            </div>
        `;
    }

    const entry = document.createElement('div');
    entry.style.cssText = `
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        padding: 10px;
        margin-bottom: 10px;
        background: #ffffff;
    `;

    const valueLabel = activeRasterMode === 'spi' ? 'SPI' : 
                      activeRasterMode === 'ndvi' ? 'NDVI' : 'Landuse';

    entry.innerHTML = `
        <div style="display: flex; align-items: baseline; justify-content: space-between; gap: 10px;">
            <div style="font-size: 12px; font-weight: 800; color: #111827;">${valueLabel}: ${spiValue} <span style="font-weight: 600; color: #2563eb;">${description}</span></div>
            <div style="font-size: 11px; color: #9ca3af;">${t}</div>
        </div>
        <div style="margin-top: 6px;">${colorHtml}</div>
        <div style="margin-top: 8px; font-size: 11px; color: #6b7280; line-height: 1.4;">
            <div><strong>Lat/Lon:</strong> ${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}</div>
            <div><strong>Pixel:</strong> [${pixelX}, ${pixelY}]</div>
        </div>
    `;

    const placeholder = log.querySelector('div');
    if (placeholder && placeholder.textContent && placeholder.textContent.includes('Click the map')) {
        log.innerHTML = '';
    }

    log.prepend(entry);
}

// Hide SPI value info box
function hideSPIValueInfo() {
    const panel = document.getElementById('spi-panel');
    if (panel) panel.remove();
}

// Global PNG layer references
let pngLayers = [];
let currentPNGLayerIndex = 0;

// Configuration for PNG layers - using existing PNG files
const imageConfigs = [
    {
        name: "Tunisia SPI 2024-01",
        url: "./assets/data/Tun_SPI_png/Tunisia_SPI_2024_01_1.png",
        extent: [837000, 3531773, 1292000, 4515990]
    },
    {
        name: "Tunisia SPI 2024-02", 
        url: "./assets/data/Tun_SPI_png/Tunisia_SPI_2024_02_2.png",
        extent: [837000, 3531773, 1292000, 4515990]
    },
    {
        name: "Tunisia SPI 2024-03", 
        url: "./assets/data/Tun_SPI_png/Tunisia_SPI_2024_03_3.png",
        extent: [837000, 3531773, 1292000, 4515990]
    },
    {
        name: "Tunisia SPI 2024-04", 
        url: "./assets/data/Tun_SPI_png/Tunisia_SPI_2024_04_4.png",
        extent: [837000, 3531773, 1292000, 4515990]
    },
    {
        name: "Tunisia SPI 2024-05", 
        url: "./assets/data/Tun_SPI_png/Tunisia_SPI_2024_05_5.png",
        extent: [837000, 3531773, 1292000, 4515990]
    },
    {
        name: "Tunisia SPI 2024-06", 
        url: "./assets/data/Tun_SPI_png/Tunisia_SPI_2024_06_6.png",
        extent: [837000, 3531773, 1292000, 4515990]
    },
    {
        name: "Tunisia SPI 2024-07", 
        url: "./assets/data/Tun_SPI_png/Tunisia_SPI_2024_07_7.png",
        extent: [837000, 3531773, 1292000, 4515990]
    },
    {
        name: "Tunisia SPI 2024-08", 
        url: "./assets/data/Tun_SPI_png/Tunisia_SPI_2024_08_8.png",
        extent: [837000, 3531773, 1292000, 4515990]
    },
    {
        name: "Tunisia SPI 2024-09", 
        url: "./assets/data/Tun_SPI_png/Tunisia_SPI_2024_09_9.png",
        extent: [837000, 3531773, 1292000, 4515990]
    },
    {
        name: "Tunisia SPI 2024-10", 
        url: "./assets/data/Tun_SPI_png/Tunisia_SPI_2024_10_10.png",
        extent: [837000, 3531773, 1292000, 4515990]
    },
    {
        name: "Tunisia SPI 2024-11", 
        url: "./assets/data/Tun_SPI_png/Tunisia_SPI_2024_11_11.png",
        extent: [837000, 3531773, 1292000, 4515990]
    },
    {
        name: "Tunisia SPI 2024-12", 
        url: "./assets/data/Tun_SPI_png/Tunisia_SPI_2024_12_12.png",
        extent: [837000, 3531773, 1292000, 4515990]
    },
    {
        name: "Tunisia SPI 2025-01", 
        url: "./assets/data/Tun_SPI_png/Tunisia_SPI_2025_01_13.png",
        extent: [837000, 3531773, 1292000, 4515990]
    },
    {
        name: "Tunisia SPI 2025-02", 
        url: "./assets/data/Tun_SPI_png/Tunisia_SPI_2025_02_14.png",
        extent: [837000, 3531773, 1292000, 4515990]
    },
    {
        name: "Tunisia SPI 2025-03", 
        url: "./assets/data/Tun_SPI_png/Tunisia_SPI_2025_03_15.png",
        extent: [837000, 3531773, 1292000, 4515990]
    }
];

// Tunisia bounds in lat/lng for testing
const tunisiaLatLngBounds = [
    [30.219326158, 7.518898928],   // Southwest
    [37.549578876, 11.606233471]   // Northeast
];

// Initialize PNG layers
function initializePNGLayers() {
    console.log('Initializing PNG layers...');
    
    // Initialize pixel readers first
    initializePixelReaders();
    
    // Clear existing layers
    pngLayers.forEach(layer => {
        if (map.hasLayer(layer)) {
            map.removeLayer(layer);
        }
    });
    pngLayers = [];

    // Create Leaflet image overlay layers
    imageConfigs.forEach((config, index) => {
        // Use Tunisia bounds directly
        const bounds = tunisiaLatLngBounds;

        const layer = L.imageOverlay(config.url, bounds, {
            opacity: 0.8,
            className: 'png-layer'
        });

        // Add event listeners for debugging
        layer.on('load', function() {
            console.log('Layer loaded successfully:', config.name);
        });
        
        layer.on('error', function(e) {
            console.error('Layer error:', config.name, e);
        });

        pngLayers.push(layer);
    });

    console.log('PNG layers initialized:', pngLayers.length, 'layers');
    updateSPIPanelLayerInfo();
}

// Load specific PNG layer by index
function loadPNGLayer(index) {
    if (index < 0 || index >= pngLayers.length) {
        console.error('Invalid PNG layer index:', index);
        return;
    }

    // Remove current PNG layer
    if (pngLayers[currentPNGLayerIndex] && map.hasLayer(pngLayers[currentPNGLayerIndex])) {
        map.removeLayer(pngLayers[currentPNGLayerIndex]);
    }

    // Add new layer
    currentPNGLayerIndex = index;
    const layer = pngLayers[index];
    
    try {
        layer.addTo(map);
        console.log('Loaded PNG layer:', imageConfigs[index].name);

        setRasterMode('spi', 'SPI Panel');

        ensureSPIPanel();
        updateSPIPanelLayerInfo();
        
        // Fit map to show the layer
        map.fitBounds(layer.getBounds(), { padding: [20, 20] });
        
        // Add click handler for this layer
        addPixelClickHandler(layer, imageConfigs[index]);
        
    } catch (error) {
        console.error('Error loading PNG layer:', error);
    }
}

// Switch to next PNG layer
function nextPNGLayer() {
    const nextIndex = (currentPNGLayerIndex + 1) % pngLayers.length;
    loadPNGLayer(nextIndex);
}

// Switch to previous PNG layer
function previousPNGLayer() {
    const prevIndex = (currentPNGLayerIndex - 1 + pngLayers.length) % pngLayers.length;
    loadPNGLayer(prevIndex);
}

// Set opacity of current PNG layer
function setPNGLayerOpacity(opacity) {
    if (pngLayers[currentPNGLayerIndex]) {
        pngLayers[currentPNGLayerIndex].setOpacity(opacity);
    }
}

// Remove all PNG layers
function removePNGLayers() {
    // Remove click handler
    if (window.pixelClickHandler) {
        map.off('click', window.pixelClickHandler);
        window.pixelClickHandler = null;
    }
    
    // Hide SPI value info box
    hideSPIValueInfo();

    const legacySelector = document.getElementById('png-layer-selector');
    if (legacySelector) {
        legacySelector.remove();
    }
    
    // Remove all layers
    pngLayers.forEach(layer => {
        if (map.hasLayer(layer)) {
            map.removeLayer(layer);
        }
    });
    currentPNGLayerIndex = 0;
}

// Get current PNG layer info
function getCurrentPNGLayerInfo() {
    if (currentPNGLayerIndex >= 0 && currentPNGLayerIndex < imageConfigs.length) {
        return {
            index: currentPNGLayerIndex,
            name: imageConfigs[currentPNGLayerIndex].name,
            total: imageConfigs.length
        };
    }
    return null;
}

// NDVI single raster layer
let ndviLayer = null;

const ndviConfig = {
    name: 'Tunisia NDVI Avg',
    url: './assets/data/Tun_NDVI/Tunisia_NDVI_Avg.png',
    extent: [837000, 3531773, 1292000, 4515990]
};

// Landuse/Landcover layer configuration
let landuseLayer = null;

const landuseConfig = {
    name: 'Tunisia Landuse/Landcover 2019',
    url: './assets/data/Tun_landuse_landcover/landuse_landcover_2019.png',
    extent: [837000, 3531773, 1292000, 4515990]
};

function setNDVILayerOpacity(opacity) {
    if (ndviLayer) {
        ndviLayer.setOpacity(opacity);
    }
}

function initializeNDVILayer() {
    if (ndviLayer) {
        if (map.hasLayer(ndviLayer)) {
            map.removeLayer(ndviLayer);
        }
        ndviLayer = null;
    }

    ndviLayer = L.imageOverlay(ndviConfig.url, tunisiaLatLngBounds, {
        opacity: 0.8,
        className: 'ndvi-layer'
    });

    ndviLayer.on('load', function() {
        console.log('NDVI layer loaded successfully:', ndviConfig.name);
    });

    ndviLayer.on('error', function(e) {
        console.error('NDVI layer error:', ndviConfig.name, e);
    });
}

function loadNDVILayer() {
    if (!ndviLayer) {
        initializeNDVILayer();
    }

    if (!ndviLayer) return;

    // Ensure pixel readers are initialized
    if (!ndviPixelReader) {
        initializePixelReaders();
    }

    try {
        ndviLayer.addTo(map);
        console.log('Loaded NDVI layer:', ndviConfig.name);

        setRasterMode('ndvi', 'NDVI Panel');
        updateSPIPanelLayerInfo();

        map.fitBounds(ndviLayer.getBounds(), { padding: [20, 20] });
        addPixelClickHandler(ndviLayer, ndviConfig);
    } catch (error) {
        console.error('Error loading NDVI layer:', error);
    }
}

function removeNDVILayer() {
    if (window.pixelClickHandler) {
        map.off('click', window.pixelClickHandler);
        window.pixelClickHandler = null;
    }

    hideSPIValueInfo();

    if (ndviLayer && map.hasLayer(ndviLayer)) {
        map.removeLayer(ndviLayer);
    }
    ndviLayer = null;
}

function getNDVILayerInfo() {
    return {
        index: 0,
        name: ndviConfig.name,
        total: 1
    };
}

// ========================================
// LANDUSE LAYER FUNCTIONS
// ========================================

function initializeLanduseLayer() {
    if (landuseLayer) {
        if (map.hasLayer(landuseLayer)) {
            map.removeLayer(landuseLayer);
        }
        landuseLayer = null;
    }

    landuseLayer = L.imageOverlay(landuseConfig.url, tunisiaLatLngBounds, {
        opacity: 0.8,
        className: 'landuse-layer'
    });

    landuseLayer.on('load', function() {
        console.log('Landuse layer loaded successfully:', landuseConfig.name);
    });

    landuseLayer.on('error', function(e) {
        console.error('Landuse layer error:', landuseConfig.name, e);
    });
}

function loadLanduseLayer() {
    if (!landuseLayer) {
        initializeLanduseLayer();
    }

    if (!landuseLayer) return;

    // Ensure pixel readers are initialized
    if (!landusePixelReader) {
        initializePixelReaders();
    }

    try {
        landuseLayer.addTo(map);
        console.log('Loaded Landuse layer:', landuseConfig.name);

        setRasterMode('landuse', 'Landuse Panel');
        updateSPIPanelLayerInfo();

        map.fitBounds(landuseLayer.getBounds(), { padding: [20, 20] });
        addPixelClickHandler(landuseLayer, landuseConfig);
    } catch (error) {
        console.error('Error loading Landuse layer:', error);
    }
}

function removeLanduseLayer() {
    if (window.pixelClickHandler) {
        map.off('click', window.pixelClickHandler);
        window.pixelClickHandler = null;
    }

    hideSPIValueInfo();

    if (landuseLayer && map.hasLayer(landuseLayer)) {
        map.removeLayer(landuseLayer);
    }
    landuseLayer = null;
}

function setLanduseLayerOpacity(opacity) {
    if (landuseLayer) {
        landuseLayer.setOpacity(opacity);
    }
}

function getLanduseLayerInfo() {
    return {
        index: 0,
        name: landuseConfig.name,
        total: 1
    };
}

// ========================================
// INITIALIZATION
// ========================================

// Start loading both datasets
loadGovernorates();
loadSectors();
