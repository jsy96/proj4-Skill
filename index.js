/**
 * Proj4 Coordinate Transformation Skill
 * A skill for defining coordinate reference systems and transforming coordinates
 * between different coordinate systems using Proj4js
 */

const proj4 = require('proj4');

// Custom CRS registry - stores user-defined coordinate systems
const customCRS = new Map();

/**
 * Common predefined Coordinate Reference Systems
 * These are widely used CRS definitions that can be used directly
 */
const PREDEFINED_CRS = {
  // WGS84 - World Geodetic System 1984 (GPS coordinates)
  'WGS84': '+proj=longlat +datum=WGS84 +no_defs',
  'EPSG:4326': '+proj=longlat +datum=WGS84 +no_defs',

  // Web Mercator (Google Maps, OpenStreetMap, etc.)
  'EPSG:3857': '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs',
  'WEB_MERCATOR': '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs',

  // GCJ-02 (China's encrypted coordinate system, used by Gaode, Baidu)
  // Note: This is an approximation for display purposes
  'GCJ02': '+proj=longlat +datum=WGS84 +no_defs',

  // BD-09 (Baidu's coordinate system)
  // Note: This is an approximation for display purposes
  'BD09': '+proj=longlat +datum=WGS84 +no_defs',

  // China 2000 CRS
  'EPSG:4490': '+proj=longlat +ellps=GRS80 +no_defs',

  // UTM Zones (common projections)
  'EPSG:32633': '+proj=utm +zone=33 +datum=WGS84 +units=m +no_defs', // UTM Zone 33N
  'EPSG:32650': '+proj=utm +zone=50 +datum=WGS84 +units=m +no_defs', // UTM Zone 50N (China area)

  // China specific CRS
  'EPSG:4214': '+proj=longlat +ellps=krass +towgs84=15.8,-154.4,-82.3,0,0,0,0 +no_defs', // Xian 1980
  'EPSG:4610': '+proj=longlat +ellps=krass +towgs84=24.5,-123.1,-94.2,0.11,-0.52,0.76,0.61 +no_defs', // Beijing 1954

  // Lambert Conformal Conic
  'EPSG:2154': '+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs', // France

  // Mercator
  'EPSG:3395': '+proj=merc +lon_0=0 +k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs',
};

/**
 * Register all predefined CRS with proj4
 */
function registerPredefinedCRS() {
  for (const [name, def] of Object.entries(PREDEFINED_CRS)) {
    proj4.defs(name, def);
  }
}

// Initialize predefined CRS on load
registerPredefinedCRS();

/**
 * Define a custom Coordinate Reference System
 * @param {string} name - Name/identifier for the CRS
 * @param {string} proj4def - Proj4 definition string
 * @returns {object} Result with success status and message
 */
function defineCRS(name, proj4def) {
  try {
    if (!name || !proj4def) {
      return {
        success: false,
        error: 'Both name and proj4def are required'
      };
    }

    // Validate proj4 definition by attempting to use it
    proj4.defs(name, proj4def);

    // Store in custom registry
    customCRS.set(name, proj4def);

    return {
      success: true,
      message: `CRS '${name}' defined successfully`,
      name: name,
      definition: proj4def
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to define CRS: ${error.message}`
    };
  }
}

/**
 * List all available coordinate reference systems
 * @returns {object} List of predefined and custom CRS
 */
function listCRS() {
  return {
    predefined: Object.keys(PREDEFINED_CRS),
    custom: Array.from(customCRS.keys()),
    all: [...Object.keys(PREDEFINED_CRS), ...customCRS.keys()]
  };
}

/**
 * Transform coordinates from one CRS to another
 * @param {string} from - Source CRS
 * @param {string} to - Target CRS
 * @param {Array} coordinates - Coordinates [x, y] or [longitude, latitude]
 * @returns {object} Transformed coordinates
 */
function transform(from, to, coordinates) {
  try {
    if (!from || !to || !coordinates) {
      return {
        success: false,
        error: 'from, to, and coordinates are required'
      };
    }

    if (!Array.isArray(coordinates) || coordinates.length < 2) {
      return {
        success: false,
        error: 'coordinates must be an array with at least 2 elements [x, y]'
      };
    }

    const result = proj4(from, to, coordinates);

    return {
      success: true,
      from: from,
      to: to,
      input: coordinates,
      output: result,
      x: result[0],
      y: result[1]
    };
  } catch (error) {
    return {
      success: false,
      error: `Transform failed: ${error.message}`,
      details: {
        from,
        to,
        coordinates
      }
    };
  }
}

/**
 * Transform multiple coordinates from one CRS to another
 * @param {string} from - Source CRS
 * @param {string} to - Target CRS
 * @param {Array} coordinates - Array of coordinates [[x1, y1], [x2, y2], ...]
 * @returns {object} Transformed coordinates
 */
function batchTransform(from, to, coordinates) {
  try {
    if (!from || !to || !coordinates) {
      return {
        success: false,
        error: 'from, to, and coordinates are required'
      };
    }

    if (!Array.isArray(coordinates)) {
      return {
        success: false,
        error: 'coordinates must be an array of coordinate arrays'
      };
    }

    const results = coordinates.map(coord => {
      const result = proj4(from, to, coord);
      return {
        input: coord,
        output: result,
        x: result[0],
        y: result[1]
      };
    });

    return {
      success: true,
      from: from,
      to: to,
      count: results.length,
      results: results
    };
  } catch (error) {
    return {
      success: false,
      error: `Batch transform failed: ${error.message}`
    };
  }
}

/**
 * Get the Proj4 definition string for a given CRS
 * @param {string} crs - CRS identifier
 * @returns {object} CRS definition
 */
function getProj4Def(crs) {
  try {
    const definition = proj4.defs(crs);

    if (!definition) {
      return {
        success: false,
        error: `CRS '${crs}' not found`
      };
    }

    return {
      success: true,
      crs: crs,
      definition: definition,
      name: definition.name || crs,
      units: definition.units,
      projName: definition.projName
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to get CRS definition: ${error.message}`
    };
  }
}

/**
 * Get inverse transformation information
 * @param {string} from - Source CRS
 * @param {string} to - Target CRS
 * @returns {object} Inverse transformation info
 */
function getInverseTransform(from, to) {
  try {
    // Test forward transformation
    const testPoint = [0, 0];
    const forward = proj4(from, to, testPoint);

    // Test inverse transformation
    const inverse = proj4(to, from, forward);

    // Verify round-trip accuracy
    const accuracy = {
      xDelta: Math.abs(testPoint[0] - inverse[0]),
      yDelta: Math.abs(testPoint[1] - inverse[1])
    };

    return {
      success: true,
      forward: {
        from: from,
        to: to,
        testPoint: testPoint,
        result: forward
      },
      inverse: {
        from: to,
        to: from,
        testPoint: forward,
        result: inverse
      },
      roundTripAccuracy: accuracy,
      isAccurate: accuracy.xDelta < 0.001 && accuracy.yDelta < 0.001
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to get inverse transformation: ${error.message}`
    };
  }
}

/**
 * Helper function for GCJ-02 to WGS84 conversion (approximate)
 * Note: For production use, consider using a dedicated library like coordtransform
 */
function gcj02ToWgs84(lon, lat) {
  const a = 6378245.0;
  const ee = 0.00669342162296594323;

  const transformLat = (lng, lat) => {
    let ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
    ret += (20.0 * Math.sin(6.0 * lng * Math.PI) + 20.0 * Math.sin(2.0 * lng * Math.PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(lat * Math.PI) + 40.0 * Math.sin(lat / 3.0 * Math.PI)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(lat / 12.0 * Math.PI) + 320 * Math.sin(lat * Math.PI / 30.0)) * 2.0 / 3.0;
    return ret;
  };

  const transformLon = (lng, lat) => {
    let ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
    ret += (20.0 * Math.sin(6.0 * lng * Math.PI) + 20.0 * Math.sin(2.0 * lng * Math.PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(lng * Math.PI) + 40.0 * Math.sin(lng / 3.0 * Math.PI)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin(lng / 12.0 * Math.PI) + 300.0 * Math.sin(lng / 30.0 * Math.PI)) * 2.0 / 3.0;
    return ret;
  };

  let dLat = transformLat(lon - 105.0, lat - 35.0);
  let dLon = transformLon(lon - 105.0, lat - 35.0);
  const radLat = lat / 180.0 * Math.PI;
  let magic = Math.sin(radLat);
  magic = 1 - ee * magic * magic;
  const sqrtMagic = Math.sqrt(magic);
  dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * Math.PI);
  dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * Math.PI);
  const mgLat = lat + dLat;
  const mgLon = lon + dLon;

  return [lon * 2 - mgLon, lat * 2 - mgLat];
}

/**
 * Helper function for WGS84 to GCJ-02 conversion (approximate)
 */
function wgs84ToGcj02(lon, lat) {
  const a = 6378245.0;
  const ee = 0.00669342162296594323;

  const transformLat = (lng, lat) => {
    let ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
    ret += (20.0 * Math.sin(6.0 * lng * Math.PI) + 20.0 * Math.sin(2.0 * lng * Math.PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(lat * Math.PI) + 40.0 * Math.sin(lat / 3.0 * Math.PI)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(lat / 12.0 * Math.PI) + 320 * Math.sin(lat * Math.PI / 30.0)) * 2.0 / 3.0;
    return ret;
  };

  const transformLon = (lng, lat) => {
    let ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
    ret += (20.0 * Math.sin(6.0 * lng * Math.PI) + 20.0 * Math.sin(2.0 * lng * Math.PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(lng * Math.PI) + 40.0 * Math.sin(lng / 3.0 * Math.PI)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin(lng / 12.0 * Math.PI) + 300.0 * Math.sin(lng / 30.0 * Math.PI)) * 2.0 / 3.0;
    return ret;
  };

  let dLat = transformLat(lon - 105.0, lat - 35.0);
  let dLon = transformLon(lon - 105.0, lat - 35.0);
  const radLat = lat / 180.0 * Math.PI;
  let magic = Math.sin(radLat);
  magic = 1 - ee * magic * magic;
  const sqrtMagic = Math.sqrt(magic);
  dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * Math.PI);
  dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * Math.PI);

  return [lon + dLon, lat + dLat];
}

/**
 * Transform coordinates with Chinese coordinate system support
 * @param {string} from - Source CRS (supports WGS84, GCJ02, BD09)
 * @param {string} to - Target CRS
 * @param {Array} coordinates - Coordinates [x, y]
 * @returns {object} Transformed coordinates
 */
function transformChina(from, to, coordinates) {
  try {
    const [lon, lat] = coordinates;
    let result = coordinates;

    // Handle Chinese coordinate system conversions
    if (from === 'GCJ02' && to === 'WGS84') {
      result = gcj02ToWgs84(lon, lat);
    } else if (from === 'WGS84' && to === 'GCJ02') {
      result = wgs84ToGcj02(lon, lat);
    } else if (from === 'GCJ02' && to === 'BD09') {
      // GCJ02 to BD09: directly transform GCJ02 to BD09
      const z = Math.sqrt(lon * lon + lat * lat) + 0.00002 * Math.sin(lat * Math.PI * 3000.0 / 180.0);
      const theta = Math.atan2(lat, lon) + 0.000003 * Math.cos(lon * Math.PI * 3000.0 / 180.0);
      result = [z * Math.cos(theta) + 0.0065, z * Math.sin(theta) + 0.006];
    } else if (from === 'BD09' && to === 'GCJ02') {
      // BD09 to GCJ02: inverse transform
      let x = lon - 0.0065, y = lat - 0.006;
      const z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * Math.PI * 3000.0 / 180.0);
      const theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * Math.PI * 3000.0 / 180.0);
      result = [z * Math.cos(theta), z * Math.sin(theta)];
    } else if (from === 'BD09' && to === 'WGS84') {
      // BD09 -> GCJ02 -> WGS84
      let x = lon - 0.0065, y = lat - 0.006;
      const z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * Math.PI * 3000.0 / 180.0);
      const theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * Math.PI * 3000.0 / 180.0);
      const gcj = [z * Math.cos(theta), z * Math.sin(theta)];
      result = gcj02ToWgs84(gcj[0], gcj[1]);
    } else if (from === 'WGS84' && to === 'BD09') {
      // WGS84 -> GCJ02 -> BD09
      const gcj = wgs84ToGcj02(lon, lat);
      const z = Math.sqrt(gcj[0] * gcj[0] + gcj[1] * gcj[1]) + 0.00002 * Math.sin(gcj[1] * Math.PI * 3000.0 / 180.0);
      const theta = Math.atan2(gcj[1], gcj[0]) + 0.000003 * Math.cos(gcj[0] * Math.PI * 3000.0 / 180.0);
      result = [z * Math.cos(theta) + 0.0065, z * Math.sin(theta) + 0.006];
    } else {
      // Use standard proj4 transformation
      return transform(from, to, coordinates);
    }

    return {
      success: true,
      from: from,
      to: to,
      input: coordinates,
      output: result,
      longitude: result[0],
      latitude: result[1]
    };
  } catch (error) {
    return {
      success: false,
      error: `China coordinate transform failed: ${error.message}`
    };
  }
}

// Export all functions
module.exports = {
  defineCRS,
  listCRS,
  transform,
  batchTransform,
  getProj4Def,
  getInverseTransform,
  transformChina,
  gcj02ToWgs84,
  wgs84ToGcj02,
  // Expose proj4 for advanced users
  proj4,
  // Export predefined CRS for reference
  PREDEFINED_CRS
};
