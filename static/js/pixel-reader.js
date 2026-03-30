// ========================================
// PIXEL READER - Generic PNG Pixel Value Reader
// ========================================

/**
 * Generic pixel reader for raster layers
 * Extracts pixel values from PNG images and maps them to values using color mappings
 */

class PixelReader {
    constructor(options = {}) {
        this.colorMap = options.colorMap || new Map();
        this.mode = options.mode || 'value'; // 'value' or 'color'
        this.onPixelRead = options.onPixelRead || null;
        this.onError = options.onError || null;
    }

    /**
     * Add click handler to map for pixel reading
     * @param {Object} map - Leaflet map instance
     * @param {Object} layer - Leaflet image overlay layer
     * @param {Object} config - Layer configuration with url, bounds, etc.
     */
    addClickHandler(map, layer, config) {
        // Remove existing click handler if any
        if (window.pixelClickHandler) {
            map.off('click', window.pixelClickHandler);
        }
        
        // Create new click handler
        window.pixelClickHandler = (e) => {
            console.log('Map clicked at:', e.latlng);
            this.readPixelValue(e.latlng, layer, config);
        };
        
        // Add click event to map
        map.on('click', window.pixelClickHandler);
        console.log('Pixel reader click handler added for layer:', config.name);
    }

    /**
     * Remove click handler from map
     * @param {Object} map - Leaflet map instance
     */
    removeClickHandler(map) {
        if (window.pixelClickHandler) {
            map.off('click', window.pixelClickHandler);
            window.pixelClickHandler = null;
        }
    }

    /**
     * Read pixel value at clicked coordinates
     * @param {Object} latlng - Latitude/longitude coordinates {lat, lng}
     * @param {Object} layer - Leaflet image overlay layer
     * @param {Object} config - Layer configuration
     */
    readPixelValue(latlng, layer, config) {
        console.log('Reading pixel at Lat/Lon:', latlng.lat, latlng.lng);
        
        // Load the original PNG image into a hidden canvas
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        
        img.onload = () => {
            console.log('Original PNG dimensions:', img.naturalWidth, 'x', img.naturalHeight);
            
            try {
                const pixelData = this.extractPixelData(img, latlng, layer);
                
                if (pixelData.alpha === 0) {
                    console.log('Transparent pixel detected');
                    this.handlePixelRead({
                        value: null,
                        color: null,
                        description: 'No data - transparent area',
                        coordinates: latlng,
                        pixel: pixelData,
                        config: config
                    });
                    return;
                }

                const result = this.processPixelColor(pixelData, config);
                this.handlePixelRead({
                    ...result,
                    coordinates: latlng,
                    pixel: pixelData,
                    config: config
                });
                
            } catch (error) {
                console.error('Error processing pixel:', error);
                this.handleError(error, latlng, config);
            }
        };
        
        img.onerror = () => {
            const error = new Error(`Failed to load PNG: ${config.url}`);
            this.handleError(error, latlng, config);
        };
        
        img.src = config.url;
    }

    /**
     * Extract raw pixel data from image at specific coordinates
     * @param {Image} img - HTML image element
     * @param {Object} latlng - Geographic coordinates
     * @param {Object} layer - Leaflet layer
     * @returns {Object} Pixel data {r, g, b, a, x, y}
     */
    extractPixelData(img, latlng, layer) {
        // Create canvas with exact pixel dimensions
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        
        // Draw the original image (no resampling, no scaling)
        ctx.drawImage(img, 0, 0);
        
        // Get the geographic bounds of the image
        const bounds = layer.getBounds();
        const minLon = bounds.getWest();
        const maxLon = bounds.getEast();
        const minLat = bounds.getSouth();
        const maxLat = bounds.getNorth();
        
        console.log('Image bounds: minLon=', minLon, 'maxLon=', maxLon, 'minLat=', minLat, 'maxLat=', maxLat);
        
        // Convert geographic coordinates to image pixel coordinates
        const xRatio = (latlng.lng - minLon) / (maxLon - minLon);
        const yRatio = (maxLat - latlng.lat) / (maxLat - minLat);
        
        console.log('Coordinate ratios: xRatio=', xRatio, 'yRatio=', yRatio);
        
        // Convert to pixel coordinates
        const px = Math.floor(xRatio * canvas.width);
        const py = Math.floor(yRatio * canvas.height);
        
        console.log('Lat/Lon → Pixel coordinates:', px, py);
        
        // Check if pixel is within image bounds
        if (px < 0 || px >= canvas.width || py < 0 || py >= canvas.height) {
            throw new Error(`Pixel outside image bounds: [${px}, ${py}] canvas size: ${canvas.width}x${canvas.height}`);
        }
        
        // Read pixel using getImageData
        const imageData = ctx.getImageData(px, py, 1, 1);
        const pixel = imageData.data;
        
        return {
            r: pixel[0],
            g: pixel[1],
            b: pixel[2],
            a: pixel[3],
            x: px,
            y: py
        };
    }

    /**
     * Process pixel color to get value based on mode
     * @param {Object} pixelData - Pixel data {r, g, b, a, x, y}
     * @param {Object} config - Layer configuration
     * @returns {Object} Result with value, color, description
     */
    processPixelColor(pixelData, config) {
        const { r, g, b } = pixelData;
        const hexColor = this.rgbToHex(r, g, b);
        console.log('Pixel RGB values:', r, g, b, '→ HEX:', hexColor);

        if (this.mode === 'color') {
            return {
                value: hexColor,
                color: hexColor,
                description: 'Pixel Color'
            };
        }

        // Find value using color map
        let value = null;
        let description = 'Unknown color';
        
        // First try exact match
        if (this.colorMap.has(hexColor)) {
            value = this.colorMap.get(hexColor);
            description = this.getValueDescription(value, config);
            console.log('Exact color match:', hexColor, '→', value, description);
        } else {
            // Find closest color using Euclidean RGB distance
            console.log('No exact match found, searching for closest color...');
            const closestMatch = this.findClosestColor(r, g, b);
            value = closestMatch.value;
            description = this.getValueDescription(value, config);
            console.log('Closest color match:', closestMatch.hex, '→', value, description, 'distance:', closestMatch.distance);
        }
        
        return {
            value: value,
            color: hexColor,
            description: description
        };
    }

    /**
     * Find closest color in color map using Euclidean RGB distance
     * @param {number} r - Red value (0-255)
     * @param {number} g - Green value (0-255)
     * @param {number} b - Blue value (0-255)
     * @returns {Object} Closest match {value, hex, distance}
     */
    findClosestColor(r, g, b) {
        let closestValue = null;
        let closestHex = '';
        let minDistance = Infinity;
        
        this.colorMap.forEach((value, hex) => {
            const rgb = this.hexToRgb(hex);
            if (!rgb) return;
            
            const distance = Math.sqrt(
                Math.pow(r - rgb.r, 2) + 
                Math.pow(g - rgb.g, 2) + 
                Math.pow(b - rgb.b, 2)
            );
            
            if (distance < minDistance) {
                minDistance = distance;
                closestValue = value;
                closestHex = hex;
            }
        });
        
        return {
            value: closestValue,
            hex: closestHex,
            distance: minDistance
        };
    }

    /**
     * Get description for a value (can be overridden)
     * @param {*} value - The value to describe
     * @param {Object} config - Layer configuration
     * @returns {string} Description
     */
    getValueDescription(value, config) {
        // Default implementation - can be overridden by subclasses
        return `Value: ${value}`;
    }

    /**
     * Handle successful pixel read
     * @param {Object} result - Pixel read result
     */
    handlePixelRead(result) {
        if (this.onPixelRead) {
            this.onPixelRead(result);
        } else {
            console.log('Pixel read result:', result);
        }
    }

    /**
     * Handle errors during pixel reading
     * @param {Error} error - The error that occurred
     * @param {Object} latlng - Coordinates where error occurred
     * @param {Object} config - Layer configuration
     */
    handleError(error, latlng, config) {
        console.error('Pixel reader error:', error);
        
        const errorResult = {
            value: null,
            color: null,
            description: `Error: ${error.message}`,
            coordinates: latlng,
            pixel: null,
            config: config,
            error: error
        };
        
        if (this.onError) {
            this.onError(errorResult);
        } else {
            console.error('Unhandled pixel reader error:', errorResult);
        }
    }

    /**
     * Convert RGB color to hex string
     * @param {number} r - Red value (0-255)
     * @param {number} g - Green value (0-255)
     * @param {number} b - Blue value (0-255)
     * @returns {string} Hex color string
     */
    rgbToHex(r, g, b) {
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    /**
     * Convert hex color string to RGB
     * @param {string} hex - Hex color string
     * @returns {Object|null} RGB object {r, g, b} or null if invalid
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    /**
     * Update color map
     * @param {Map} colorMap - New color map
     */
    setColorMap(colorMap) {
        this.colorMap = colorMap;
    }

    /**
     * Set reading mode
     * @param {string} mode - 'value' or 'color'
     */
    setMode(mode) {
        this.mode = mode;
    }
}

// ========================================
// SPECIALIZED PIXEL READERS
// ========================================

/**
 * SPI (Standardized Precipitation Index) Pixel Reader
 */
class SPIPixelReader extends PixelReader {
    constructor(options = {}) {
        super(options);
        this.mode = 'value';
        this.metadataUrl = options.metadataUrl || './assets/data/Tun_SPI_png/Tun_SPI_metadata.json';
        this.spiMetadata = new Map();
        this.loadMetadata();
    }

    /**
     * Load SPI metadata from JSON file
     */
    async loadMetadata() {
        try {
            const response = await fetch(this.metadataUrl);
            const metadata = await response.json();

            // Convert metadata array to Map for efficient lookup
            metadata.forEach(spiItem => {
                this.spiMetadata.set(spiItem.value, {
                    color: spiItem.color,
                    indication: spiItem.indication
                });
            });

            // Create color map for pixel reader
            const colorMap = new Map();
            this.spiMetadata.forEach((spiInfo, spiValue) => {
                colorMap.set(spiInfo.color, spiValue);
            });
            this.setColorMap(colorMap);

            console.log('SPI metadata loaded:', this.spiMetadata.size, 'SPI values');
        } catch (error) {
            console.error('Failed to load SPI metadata:', error);
        }
    }

    /**
     * Get description for SPI value
     * @param {number} spiValue - SPI value
     * @returns {string} Description
     */
    getValueDescription(spiValue) {
        const spiInfo = this.spiMetadata.get(spiValue);
        if (spiInfo) {
            return spiInfo.indication;
        }

        // Fallback to original logic if metadata not found
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

    /**
     * Get SPI information by SPI value
     * @param {number} spiValue - SPI value
     * @returns {Object|null} SPI information
     */
    getSPIInfo(spiValue) {
        return this.spiMetadata.get(spiValue) || null;
    }

    /**
     * Get all available SPI values
     * @returns {Array} Array of SPI information
     */
    getAllSPIValues() {
        return Array.from(this.spiMetadata.entries()).map(([spiValue, spiInfo]) => ({
            spiValue: spiValue,
            ...spiInfo
        }));
    }

    /**
     * Check if metadata is loaded
     * @returns {boolean} True if metadata is loaded
     */
    isMetadataLoaded() {
        return this.spiMetadata.size > 0;
    }
}

/**
 * NDVI Pixel Reader
 */
class NDVIPixelReader extends PixelReader {
    constructor(options = {}) {
        super(options);
        this.mode = 'value';
        this.metadataUrl = options.metadataUrl || './assets/data/Tun_NDVI/Tunisia_NDVI_metadata.json';
        this.ndviMetadata = new Map();
        this.loadMetadata();
    }

    /**
     * Load NDVI metadata from JSON file
     */
    async loadMetadata() {
        try {
            const response = await fetch(this.metadataUrl);
            const metadata = await response.json();
            
            // Convert metadata to Map for efficient lookup
            Object.entries(metadata).forEach(([ndviValue, ndviInfo]) => {
                this.ndviMetadata.set(ndviValue, {
                    label: ndviInfo.label,
                    color: ndviInfo.color,
                    alpha: ndviInfo.alpha
                });
            });
            
            // Create color map for pixel reader
            const colorMap = new Map();
            this.ndviMetadata.forEach((ndviInfo, ndviValue) => {
                colorMap.set(ndviInfo.color, parseFloat(ndviValue));
            });
            this.setColorMap(colorMap);
            
            console.log('NDVI metadata loaded:', this.ndviMetadata.size, 'NDVI values');
        } catch (error) {
            console.error('Failed to load NDVI metadata:', error);
        }
    }

    /**
     * Get description for NDVI value
     * @param {number} ndviValue - NDVI value
     * @returns {string} Description
     */
    getValueDescription(ndviValue) {
        const ndviInfo = this.ndviMetadata.get(ndviValue.toString());
        if (ndviInfo) {
            return `NDVI: ${ndviInfo.label}`;
        }
        return `NDVI: ${ndviValue}`;
    }

    /**
     * Get NDVI information by NDVI value
     * @param {number} ndviValue - NDVI value
     * @returns {Object|null} NDVI information
     */
    getNDVIInfo(ndviValue) {
        return this.ndviMetadata.get(ndviValue.toString()) || null;
    }

    /**
     * Get all available NDVI values
     * @returns {Array} Array of NDVI information
     */
    getAllNDVIValues() {
        return Array.from(this.ndviMetadata.entries()).map(([ndviValue, ndviInfo]) => ({
            ndviValue: parseFloat(ndviValue),
            ...ndviInfo
        }));
    }

    /**
     * Check if metadata is loaded
     * @returns {boolean} True if metadata is loaded
     */
    isMetadataLoaded() {
        return this.ndviMetadata.size > 0;
    }
}

/**
 * Landuse/Landcover Pixel Reader
 */
class LandusePixelReader extends PixelReader {
    constructor(options = {}) {
        super(options);
        this.mode = 'value';
        this.metadataUrl = options.metadataUrl || './assets/data/Tun_landuse_landcover/landuse_landcover_metadata.json';
        this.classMetadata = new Map();
        this.loadMetadata();
    }

    /**
     * Load landuse class metadata from JSON file
     */
    async loadMetadata() {
        try {
            const response = await fetch(this.metadataUrl);
            const metadata = await response.json();
            
            // Convert metadata to Map for efficient lookup
            Object.entries(metadata).forEach(([classId, classInfo]) => {
                this.classMetadata.set(classId, {
                    label: classInfo.label,
                    color: classInfo.color,
                    alpha: classInfo.alpha
                });
            });
            
            // Create color map for pixel reader
            const colorMap = new Map();
            this.classMetadata.forEach((classInfo, classId) => {
                colorMap.set(classInfo.color, parseInt(classId));
            });
            this.setColorMap(colorMap);
            
            console.log('Landuse metadata loaded:', this.classMetadata.size, 'classes');
        } catch (error) {
            console.error('Failed to load landuse metadata:', error);
        }
    }

    /**
     * Get description for landuse class
     * @param {number} classId - Landuse class ID
     * @returns {string} Description
     */
    getValueDescription(classId) {
        const classInfo = this.classMetadata.get(classId.toString());
        if (classInfo) {
            return classInfo.label;
        }
        return `Unknown class: ${classId}`;
    }

    /**
     * Get class information by class ID
     * @param {number} classId - Landuse class ID
     * @returns {Object|null} Class information
     */
    getClassInfo(classId) {
        return this.classMetadata.get(classId.toString()) || null;
    }

    /**
     * Get all available classes
     * @returns {Array} Array of class information
     */
    getAllClasses() {
        return Array.from(this.classMetadata.entries()).map(([classId, classInfo]) => ({
            classId: parseInt(classId),
            ...classInfo
        }));
    }

    /**
     * Check if metadata is loaded
     * @returns {boolean} True if metadata is loaded
     */
    isMetadataLoaded() {
        return this.classMetadata.size > 0;
    }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Create a pixel reader instance for specific layer type
 * @param {string} type - Layer type ('spi', 'ndvi', 'landuse', 'generic')
 * @param {Object} options - Configuration options
 * @returns {PixelReader} Pixel reader instance
 */
function createPixelReader(type, options = {}) {
    switch (type.toLowerCase()) {
        case 'spi':
            return new SPIPixelReader(options);
        case 'ndvi':
            return new NDVIPixelReader(options);
        case 'landuse':
            return new LandusePixelReader(options);
        default:
            return new PixelReader(options);
    }
}

/**
 * Parse SLD color mappings from SLD content
 * @param {string} sldContent - SLD file content
 * @returns {Map} Color to value mapping
 */
function parseSLDColorMappings(sldContent) {
    const colorMap = new Map();
    
    // This is a placeholder for SLD parsing
    // In a real implementation, you would parse the SLD XML
    // to extract color-value mappings
    
    return colorMap;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PixelReader,
        SPIPixelReader,
        NDVIPixelReader,
        LandusePixelReader,
        createPixelReader,
        parseSLDColorMappings
    };
}
