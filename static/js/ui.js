// ========================================
// UI - User interface interactions and controls
// ========================================

// ========================================
// DOM ELEMENT REFERENCES
// ========================================

// Panel elements
const layerPanel = document.getElementById('layer-panel');
const panelTitle = document.getElementById('panel-title');
const panelDescription = document.getElementById('panel-description');
const layerList = document.getElementById('layer-list');
const closePanelBtn = document.querySelector('.panel-close');

// Sidebar elements
const sidebarIcons = document.querySelectorAll('.sidebar-icon');

// Map control buttons
const zoomInBtn = document.getElementById('zoom-in');
const zoomOutBtn = document.getElementById('zoom-out');
const currentLocationBtn = document.getElementById('current-location');
const measureToolBtn = document.getElementById('measure-tool');
const fullscreenBtn = document.getElementById('fullscreen');
const layerControlBtn = document.getElementById('layer-control');
const navMenuToggle = document.getElementById('nav-menu-toggle');
const topNav = document.querySelector('.top-nav');

// ========================================
// SIDEBAR AND PANEL INTERACTIONS
// ========================================

// Handle sidebar icon clicks
sidebarIcons.forEach(function(icon) {
  icon.addEventListener('click', function() {
    const category = this.getAttribute('data-category');
    const categoryData = categories[category];
    
    console.log('Category clicked:', category);
    console.log('Category data:', categoryData);
    
    // Update panel header
    panelTitle.textContent = categoryData.title;
    panelDescription.textContent = categoryData.description;
    
    // Clear previous layers
    layerList.innerHTML = '';
    
    // Add layers for this category
    categoryData.layers.forEach(function(layer) {
      console.log('Adding layer:', layer);
      const layerElement = document.createElement('div');
      layerElement.className = 'layer-item';
      
      // Check if layer is currently active
      const isChecked = layerStates[layer.id] || false;
      
      layerElement.innerHTML = `
        <div class="layer-title">
          <div>
            <span class="layer-color" style="background-color: ${layer.color};"></span>
            ${layer.name}
          </div>
          <div class="form-check form-switch">
            <input class="form-check-input toggle-switch" type="checkbox" 
                   id="${layer.id}" data-layer-id="${layer.id}" ${isChecked ? 'checked' : ''}>
          </div>
        </div>
        <div class="layer-description">${layer.description}</div>
      `;
      layerList.appendChild(layerElement);
    });
    
    // Update active icon
    sidebarIcons.forEach(function(icon) {
      icon.classList.remove('active');
    });
    this.classList.add('active');
    
    // Show panel
    layerPanel.classList.add('active');
  });
});

// Close panel button
closePanelBtn.addEventListener('click', function() {
  layerPanel.classList.remove('active');
  sidebarIcons.forEach(function(icon) {
    icon.classList.remove('active');
  });
});

// ========================================
// MAP CONTROLS
// ========================================

// Zoom controls
zoomInBtn.addEventListener('click', function() {
  map.zoomIn();
});

zoomOutBtn.addEventListener('click', function() {
  map.zoomOut();
});

// Current location button
currentLocationBtn.addEventListener('click', function() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      map.setView([position.coords.latitude, position.coords.longitude], 13);
    });
  } else {
    alert('Geolocation is not supported by your browser');
  }
});

// ========================================
// BASE MAP LAYER CONTROL
// ========================================

// Show base map selection menu
function showLayerControlMenu() {
  // Remove existing menu if any
  const existingMenu = document.getElementById('layer-control-menu');
  if (existingMenu) {
    existingMenu.remove();
    return;
  }
  
  // Create menu container
  const menuContainer = document.createElement('div');
  menuContainer.id = 'layer-control-menu';
  menuContainer.style.cssText = `
    position: absolute;
    top: 40px;
    right: 0;
    background: white;
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    padding: 10px;
    min-width: 150px;
    z-index: 1001;
    font-size: 12px;
  `;
  
  // Add menu title
  const menuTitle = document.createElement('div');
  menuTitle.textContent = 'Base Map';
  menuTitle.style.cssText = `
    font-weight: bold;
    margin-bottom: 8px;
    color: #333;
    border-bottom: 1px solid #eee;
    padding-bottom: 5px;
  `;
  menuContainer.appendChild(menuTitle);
  
  // Add options for each base layer
  Object.entries(baseLayers).forEach(function([key, layer]) {
    const optionContainer = document.createElement('div');
    optionContainer.style.cssText = `
      margin: 5px 0;
      display: flex;
      align-items: center;
      cursor: pointer;
      padding: 3px;
      border-radius: 3px;
      transition: background-color 0.2s;
    `;
    
    // Create radio button
    const radioButton = document.createElement('input');
    radioButton.type = 'radio';
    radioButton.name = 'base-layer';
    radioButton.value = key;
    radioButton.checked = (layer === currentBaseLayer);
    radioButton.style.cssText = `
      margin-right: 8px;
      cursor: pointer;
    `;
    
    // Create label
    const label = document.createElement('label');
    label.textContent = layer.options.name;
    label.style.cssText = `
      cursor: pointer;
      flex: 1;
      margin: 0;
    `;
    
    // Add hover effect
    optionContainer.addEventListener('mouseenter', function() {
      optionContainer.style.backgroundColor = '#f5f5f5';
    });
    optionContainer.addEventListener('mouseleave', function() {
      optionContainer.style.backgroundColor = 'transparent';
    });
    
    // Handle selection
    optionContainer.addEventListener('click', function() {
      switchBaseLayer(key);
      menuContainer.remove();
    });
    
    radioButton.addEventListener('change', function() {
      if (radioButton.checked) {
        switchBaseLayer(key);
        menuContainer.remove();
      }
    });
    
    optionContainer.appendChild(radioButton);
    optionContainer.appendChild(label);
    menuContainer.appendChild(optionContainer);
  });
  
  // Position menu
  const buttonRect = layerControlBtn.getBoundingClientRect();
  const mapControlsRect = layerControlBtn.parentElement.getBoundingClientRect();
  menuContainer.style.top = (buttonRect.top - mapControlsRect.top + buttonRect.height + 5) + 'px';
  menuContainer.style.right = '0px';
  
  // Add to page
  layerControlBtn.parentElement.appendChild(menuContainer);
}

// Switch to different base map
function switchBaseLayer(layerKey) {
  const newLayer = baseLayers[layerKey];
  
  if (newLayer && newLayer !== currentBaseLayer) {
    // Remove current layer
    map.removeLayer(currentBaseLayer);
    
    // Add new layer
    newLayer.addTo(map);
    
    // Update current layer reference
    currentBaseLayer = newLayer;
    
    console.log('Switched to base layer: ' + newLayer.options.name);
  }
}

// Layer control button click
layerControlBtn.addEventListener('click', function(e) {
  e.stopPropagation();
  showLayerControlMenu();
});

// Close menu when clicking outside
document.addEventListener('click', function(e) {
  const menu = document.getElementById('layer-control-menu');
  if (menu && !menu.contains(e.target) && e.target !== layerControlBtn) {
    menu.remove();
  }
});

// ========================================
// FULLSCREEN CONTROL
// ========================================

fullscreenBtn.addEventListener('click', function() {
  const elem = document.documentElement;
  
  if (!document.fullscreenElement) {
    // Enter fullscreen
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
    this.innerHTML = '<i class="fa fa-compress"></i>';
  } else {
    // Exit fullscreen
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    this.innerHTML = '<i class="fa fa-expand"></i>';
  }
});

// ========================================
// NAVIGATION MENU
// ========================================

navMenuToggle.addEventListener('click', function(e) {
  e.stopPropagation();
  topNav.style.top = topNav.style.top === '0px' ? '-60px' : '0px';
});

// Close nav when clicking outside
document.addEventListener('click', function() {
  topNav.style.top = '-60px';
});

// Prevent nav from closing when clicking inside
topNav.addEventListener('click', function(e) {
  e.stopPropagation();
});

// ========================================
// LAYER TOGGLE HANDLING
// ========================================

// Handle layer toggle switches
document.addEventListener('change', function(e) {
  if (e.target.matches('.toggle-switch')) {
    const layerId = e.target.getAttribute('data-layer-id');
    const isChecked = e.target.checked;
    
    // Update layer state
    layerStates[layerId] = isChecked;
    
    // Handle governorates layer
    if (layerId === 'governorates' && governoratesLayer) {
      if (isChecked) {
        map.addLayer(governoratesLayer);
        if (governoratesLayerBounds) {
          map.fitBounds(governoratesLayerBounds);
        }
      } else {
        map.removeLayer(governoratesLayer);
      }
    }
    
    // Handle sectors layer
    if (layerId === 'sectors' && sectorsLayer) {
      if (isChecked) {
        map.addLayer(sectorsLayer);
        if (sectorsLayerBounds) {
          map.fitBounds(sectorsLayerBounds);
        }
      } else {
        map.removeLayer(sectorsLayer);
      }
    }
    
    // Handle PNG layer
    if (layerId === 'spi') {
      if (isChecked) {
        // Avoid conflicts: if NDVI is on, turn it off
        if (layerStates['ndvi-avg']) {
          layerStates['ndvi-avg'] = false;
          const ndviToggle = document.querySelector('.toggle-switch[data-layer-id="ndvi-avg"]');
          if (ndviToggle) ndviToggle.checked = false;
          if (typeof removeNDVILayer === 'function') {
            removeNDVILayer();
          }
        }

        // Always re-initialize so new entries added to imageConfigs are picked up
        initializePNGLayers();

        if (pngLayers.length > 0) {
          const safeIndex = Math.min(currentPNGLayerIndex || 0, pngLayers.length - 1);
          loadPNGLayer(safeIndex);
        } else {
          console.warn('No PNG layers available to load.');
        }
      } else {
        removePNGLayers();
      }
    }

    // Handle NDVI average raster
    if (layerId === 'ndvi-avg') {
      if (isChecked) {
        // Avoid conflicts: if SPI is on, turn it off
        if (layerStates['spi']) {
          layerStates['spi'] = false;
          const spiToggle = document.querySelector('.toggle-switch[data-layer-id="spi"]');
          if (spiToggle) spiToggle.checked = false;
          removePNGLayers();
        }

        // Avoid conflicts: if landuse is on, turn it off
        if (layerStates['landuse-2019']) {
          layerStates['landuse-2019'] = false;
          const landuseToggle = document.querySelector('.toggle-switch[data-layer-id="landuse-2019"]');
          if (landuseToggle) landuseToggle.checked = false;
          if (typeof removeLanduseLayer === 'function') {
            removeLanduseLayer();
          }
        }

        if (typeof loadNDVILayer === 'function') {
          loadNDVILayer();
        } else {
          console.error('loadNDVILayer is not available.');
        }
      } else {
        if (typeof removeNDVILayer === 'function') {
          removeNDVILayer();
        }
      }
    }

    // Handle Landuse layer
    if (layerId === 'landuse-2019') {
      if (isChecked) {
        // Avoid conflicts: if SPI is on, turn it off
        if (layerStates['spi']) {
          layerStates['spi'] = false;
          const spiToggle = document.querySelector('.toggle-switch[data-layer-id="spi"]');
          if (spiToggle) spiToggle.checked = false;
          removePNGLayers();
        }

        // Avoid conflicts: if NDVI is on, turn it off
        if (layerStates['ndvi-avg']) {
          layerStates['ndvi-avg'] = false;
          const ndviToggle = document.querySelector('.toggle-switch[data-layer-id="ndvi-avg"]');
          if (ndviToggle) ndviToggle.checked = false;
          if (typeof removeNDVILayer === 'function') {
            removeNDVILayer();
          }
        }

        if (typeof loadLanduseLayer === 'function') {
          loadLanduseLayer();
        } else {
          console.error('loadLanduseLayer is not available.');
        }
      } else {
        if (typeof removeLanduseLayer === 'function') {
          removeLanduseLayer();
        }
      }
    }

    console.log('Layer ' + layerId + ' ' + (isChecked ? 'enabled' : 'disabled'));
  }
});

// Close panel when clicking outside
document.addEventListener('click', function(e) {
  if (!layerPanel.contains(e.target) && !e.target.closest('.sidebar-icon')) {
    layerPanel.classList.remove('active');
    sidebarIcons.forEach(function(icon) {
      icon.classList.remove('active');
    });
  }
});

// ========================================
// TOOLTIPS
// ========================================

// Initialize Bootstrap tooltips
$(function() {
  $('[data-toggle="tooltip"]').tooltip();
});
