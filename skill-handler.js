#!/usr/bin/env node

/**
 * Claude Code Skill Handler for Proj4 Coordinate Transformation
 * This file provides the standard skill interface for Claude Code
 */

const {
  transform,
  transformChina,
  batchTransform,
  defineCRS,
  listCRS,
  getProj4Def,
  getInverseTransform,
  blhToXYZ,
  xyzToBLH,
  batchBlhToXYZ,
  batchXyzToBLH,
  getEllipsoidInfo
} = require('./index');

/**
 * Parse coordinates from various formats
 * Supports: [x, y], "x,y", "x y"
 */
function parseCoordinates(coords) {
  if (Array.isArray(coords)) {
    return coords.map(c => typeof c === 'number' ? c : parseFloat(c));
  }
  if (typeof coords === 'string') {
    // Remove brackets and split
    const cleaned = coords.replace(/[\[\]]/g, '');
    return cleaned.split(/[,\s]+/).filter(s => s).map(s => parseFloat(s));
  }
  return coords;
}

/**
 * Handle skill commands
 */
async function handleCommand(command, args) {
  const result = { success: false, data: null, error: null };

  try {
    switch (command) {
      case 'transform':
      case 'transform-coordinates': {
        const { from, to, coordinates } = args;
        const coords = parseCoordinates(coordinates);
        result.data = transform(from, to, coords);
        result.success = result.data.success;
        if (!result.success) result.error = result.data.error;
        break;
      }

      case 'transform-china':
      case 'china-transform': {
        const { from, to, coordinates } = args;
        const coords = parseCoordinates(coordinates);
        result.data = transformChina(from, to, coords);
        result.success = result.data.success;
        if (!result.success) result.error = result.data.error;
        break;
      }

      case 'batch-transform':
      case 'batch': {
        const { from, to, coordinates } = args;
        result.data = batchTransform(from, to, coordinates);
        result.success = result.data.success;
        if (!result.success) result.error = result.data.error;
        break;
      }

      case 'list-crs':
      case 'list': {
        result.data = listCRS();
        result.success = true;
        break;
      }

      case 'define-crs':
      case 'define': {
        const { name, proj4def } = args;
        result.data = defineCRS(name, proj4def);
        result.success = result.data.success;
        if (!result.success) result.error = result.data.error;
        break;
      }

      case 'get-proj4-def':
      case 'crs-info': {
        const { crs } = args;
        result.data = getProj4Def(crs);
        result.success = result.data.success;
        if (!result.success) result.error = result.data.error;
        break;
      }

      case 'inverse-transform':
      case 'inverse': {
        const { from, to } = args;
        result.data = getInverseTransform(from, to);
        result.success = result.data.success;
        if (!result.success) result.error = result.data.error;
        break;
      }

      case 'blh-to-xyz':
      case 'blh-to-ecef': {
        const { lat, lon, height = 0 } = args;
        result.data = blhToXYZ(parseFloat(lat), parseFloat(lon), parseFloat(height));
        result.success = result.data.success;
        if (!result.success) result.error = result.data.error;
        break;
      }

      case 'xyz-to-blh':
      case 'ecef-to-blh': {
        const { X, Y, Z } = args;
        result.data = xyzToBLH(parseFloat(X), parseFloat(Y), parseFloat(Z));
        result.success = result.data.success;
        if (!result.success) result.error = result.data.error;
        break;
      }

      case 'batch-blh-to-xyz':
      case 'batch-blh-to-ecef': {
        const { coordinates } = args;
        result.data = batchBlhToXYZ(coordinates);
        result.success = result.data.success;
        if (!result.success) result.error = result.data.error;
        break;
      }

      case 'batch-xyz-to-blh':
      case 'batch-ecef-to-blh': {
        const { coordinates } = args;
        result.data = batchXyzToBLH(coordinates);
        result.success = result.data.success;
        if (!result.success) result.error = result.data.error;
        break;
      }

      case 'ellipsoid-info': {
        const { ellipsoid = 'WGS84' } = args;
        result.data = getEllipsoidInfo(ellipsoid);
        result.success = result.data.success;
        if (!result.success) result.error = result.data.error;
        break;
      }

      default:
        result.error = `Unknown command: ${command}. Available commands: transform, transform-china, batch-transform, list-crs, define-crs, get-proj4-def, inverse-transform, blh-to-xyz, xyz-to-blh, ellipsoid-info`;
    }
  } catch (error) {
    result.error = error.message;
  }

  return result;
}

/**
 * Format result for display
 */
function formatResult(result) {
  if (result.success && result.data) {
    if (result.data.output !== undefined) {
      // Transform result
      return {
        success: true,
        from: result.data.from,
        to: result.data.to,
        input: result.data.input,
        output: result.data.output,
        x: result.data.x,
        y: result.data.y
      };
    }
    if (result.data.results !== undefined) {
      // Batch result
      return {
        success: true,
        count: result.data.count,
        results: result.data.results
      };
    }
    if (result.data.predefined !== undefined) {
      // List result
      return {
        success: true,
        predefined: result.data.predefined,
        custom: result.data.custom
      };
    }
    return result.data;
  }
  return { success: false, error: result.error };
}

// Export for Claude Code
module.exports = {
  /**
   * Main entry point for Claude Code skill
   */
  async execute(command, args) {
    const result = await handleCommand(command, args);
    return formatResult(result);
  },

  /**
   * Get available commands
   */
  getCommands() {
    return [
      { name: 'transform', description: 'Transform coordinates between CRS' },
      { name: 'transform-china', description: 'Transform Chinese coordinates (WGS84/GCJ02/BD09)' },
      { name: 'batch-transform', description: 'Transform multiple coordinates' },
      { name: 'list-crs', description: 'List all available coordinate systems' },
      { name: 'define-crs', description: 'Define a custom CRS' },
      { name: 'get-proj4-def', description: 'Get CRS definition' },
      { name: 'inverse-transform', description: 'Get inverse transformation info' },
      { name: 'blh-to-xyz', description: 'Convert BLH (lat,lon,height) to ECEF XYZ' },
      { name: 'xyz-to-blh', description: 'Convert ECEF XYZ to BLH (lat,lon,height)' },
      { name: 'batch-blh-to-xyz', description: 'Batch convert BLH to ECEF XYZ' },
      { name: 'batch-xyz-to-blh', description: 'Batch convert ECEF XYZ to BLH' },
      { name: 'ellipsoid-info', description: 'Get ellipsoid parameters' }
    ];
  },

  /**
   * Get skill metadata
   */
  getMetadata() {
    return {
      name: 'proj4-coordinate-transform',
      version: '1.0.0',
      description: 'Coordinate system transformation using Proj4js',
      author: 'Claude Code',
      license: 'MIT'
    };
  }
};

// CLI interface for direct execution
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('Proj4 Coordinate Transformation Skill');
    console.log('\nAvailable commands:');
    console.log('  transform <from> <to> <coordinates>');
    console.log('  transform-china <from> <to> <coordinates>');
    console.log('  batch-transform <from> <to> <coordinates>');
    console.log('  list-crs');
    console.log('  define-crs <name> <proj4def>');
    console.log('  get-proj4-def <crs>');
    console.log('  inverse-transform <from> <to>');
    console.log('  blh-to-xyz <lat> <lon> [height]');
    console.log('  xyz-to-blh <X> <Y> <Z>');
    console.log('  batch-blh-to-xyz <coordinates>');
    console.log('  batch-xyz-to-blh <coordinates>');
    console.log('  ellipsoid-info [ellipsoid]');
  } else {
    const command = args[0];
    const params = {};
    for (let i = 1; i < args.length; i += 2) {
      if (args[i + 1]) {
        params[args[i].replace(/^--/, '')] = args[i + 1];
      }
    }
    handleCommand(command, params).then(result => {
      console.log(JSON.stringify(formatResult(result), null, 2));
    });
  }
}
