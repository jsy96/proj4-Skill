#!/usr/bin/env node

/**
 * CLI for Proj4 Coordinate Transformation Skill
 * Usage: node cli.js <command> [options]
 */

const {
  defineCRS,
  listCRS,
  transform,
  batchTransform,
  getProj4Def,
  getInverseTransform,
  transformChina,
  blhToXYZ,
  xyzToBLH,
  batchBlhToXYZ,
  batchXyzToBLH,
  getEllipsoidInfo,
  PREDEFINED_CRS
} = require('./index');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m'
};

function printSuccess(message) {
  console.log(`${colors.green}✓${colors.reset} ${message}`);
}

function printError(message) {
  console.log(`${colors.red}✗${colors.reset} ${message}`);
}

function printInfo(message) {
  console.log(`${colors.cyan}ℹ${colors.reset} ${message}`);
}

function printHeader(title) {
  console.log(`\n${colors.bright}${colors.cyan}${'='.repeat(50)}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${title}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${'='.repeat(50)}${colors.reset}\n`);
}

/**
 * Parse coordinate string to array
 * Supports: "x,y", "x y", "[x, y]", "[x,y]"
 */
function parseCoordinates(coordStr) {
  // Remove brackets if present
  coordStr = coordStr.replace(/[\[\]]/g, '');
  // Split by comma or space
  const parts = coordStr.split(/[,\s]+/).filter(s => s.trim());
  return parts.map(p => parseFloat(p.trim()));
}

/**
 * Parse multiple coordinates from string
 * Supports: "[x1,y1];[x2,y2]" or "x1,y1;x2,y2"
 */
function parseMultipleCoordinates(coordStr) {
  const coords = coordStr.split(';').map(parseCoordinates);
  return coords;
}

function showHelp() {
  printHeader('Proj4 Coordinate Transformation CLI');
  console.log(`Usage: node cli.js <command> [options]

${colors.bright}Available Commands:${colors.reset}

  ${colors.green}list${colors.reset}                          List all available coordinate reference systems
  ${colors.green}define <name> <def>${colors.reset}            Define a custom CRS
  ${colors.green}transform <from> <to> <coords>${colors.reset}  Transform coordinates
  ${colors.green}batch <from> <to> <coords>${colors.reset}      Transform multiple coordinates
  ${colors.green}info <crs>${colors.reset}                     Get CRS definition information
  ${colors.green}inverse <from> <to>${colors.reset}            Get inverse transformation info
  ${colors.green}china <from> <to> <coords>${colors.reset}     Transform Chinese coordinates (WGS84/GCJ02/BD09)
  ${colors.green}blh-to-xyz <lat> <lon> [height]${colors.reset} Convert BLH to ECEF XYZ
  ${colors.green}xyz-to-blh <X> <Y> <Z>${colors.reset}         Convert ECEF XYZ to BLH
  ${colors.green}ellipsoid [name]${colors.reset}               Show ellipsoid information
  ${colors.green}examples${colors.reset}                       Show usage examples
  ${colors.green}help${colors.reset}                           Show this help message

${colors.bright}Common CRS Codes:${colors.reset}
  EPSG:4326   - WGS84 (GPS coordinates, longitude/latitude)
  EPSG:3857   - Web Mercator (Google Maps, OpenStreetMap)
  EPSG:4490   - CGCS2000 (China 2000)
  EPSG:32650  - UTM Zone 50N (China area)

${colors.bright}Chinese Coordinate Systems:${colors.reset}
  WGS84      - GPS coordinates (international)
  GCJ02      - Gaode/Tencent maps (encrypted)
  BD09       - Baidu maps (encrypted)

${colors.bright}ECEF/BLH Conversions:${colors.reset}
  BLH        - Latitude, Longitude, Height (geodetic)
  ECEF XYZ   - Earth-Centered Earth-Fixed coordinates

${colors.bright}Coordinate Format:${colors.reset}
  Single:   116.404,39.915  or  [116.404,39.915]
  Multiple: 116.404,39.915;121.473,31.230

${colors.bright}Examples:${colors.reset}
  node cli.js transform EPSG:4326 EPSG:3857 "116.404,39.915"
  node cli.js china WGS84 GCJ02 "116.404,39.915"
  node cli.js blh-to-xyz 39.915 116.404 100
  node cli.js xyz-to-blh -2185238.6 4384248.9 4076894.5
  node cli.js list
  node cli.js info EPSG:4326
`);
}

function showExamples() {
  printHeader('Proj4 Coordinate Transformation Examples');
  console.log(`
${colors.bright}1. Basic Coordinate Transformation${colors.reset}
   Transform WGS84 (GPS) to Web Mercator (Google Maps):

   ${colors.cyan}node cli.js transform EPSG:4326 EPSG:3857 "116.404,39.915"${colors.reset}

   Result: [12957296.19, 4835470.39]

${colors.bright}2. Chinese Coordinate System Conversion${colors.reset}
   Convert WGS84 (GPS) to GCJ-02 (Gaode Maps):

   ${colors.cyan}node cli.js china WGS84 GCJ02 "116.404,39.915"${colors.reset}

   Result: [116.410, 39.920]

${colors.bright}3. BLH to ECEF XYZ Conversion${colors.reset}
   Convert geodetic coordinates to Earth-Centered Earth-Fixed:

   ${colors.cyan}node cli.js blh-to-xyz 39.915 116.404 100${colors.reset}

   Result: X=-2185238.6, Y=4384248.9, Z=4076894.5

${colors.bright}4. ECEF XYZ to BLH Conversion${colors.reset}
   Convert Earth-Centered Earth-Fixed to geodetic coordinates:

   ${colors.cyan}node cli.js xyz-to-blh -2185238.6 4384248.9 4076894.5${colors.reset}

   Result: lat=39.915, lon=116.404, height=100.0

${colors.bright}5. Batch Transform Multiple Coordinates${colors.reset}
   Transform multiple Beijing locations:

   ${colors.cyan}node cli.js batch EPSG:4326 EPSG:3857 "116.404,39.915;121.473,31.230"${colors.reset}

${colors.bright}6. Define Custom CRS${colors.reset}
   Define a custom projection for a local coordinate system:

   ${colors.cyan}node cli.js define "LOCAL" "+proj=utm +zone=50 +datum=WGS84 +units=m +no_defs"${colors.reset}

${colors.bright}7. Get CRS Information${colors.reset}
   View the definition of a coordinate system:

   ${colors.cyan}node cli.js info EPSG:4326${colors.reset}

${colors.bright}8. List All Available CRS${colors.reset}
   Show all predefined coordinate systems:

   ${colors.cyan}node cli.js list${colors.reset}

${colors.bright}9. Show Ellipsoid Information${colors.reset}
   Display WGS84 ellipsoid parameters:

   ${colors.cyan}node cli.js ellipsoid WGS84${colors.reset}

${colors.bright}Common Use Cases:${colors.reset}
  • GPS to Web Map:      EPSG:4326 → EPSG:3857
  • GPS to China:        WGS84 → GCJ02 (Gaode/Tencent)
  • GPS to Baidu:        WGS84 → BD09
  • Gaode to Baidu:      GCJ02 → BD09
  • Web Map to GPS:      EPSG:3857 → EPSG:4326
  • BLH to ECEF XYZ:     lat,lon,height → X,Y,Z
  • ECEF XYZ to BLH:     X,Y,Z → lat,lon,height
`);
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0]?.toLowerCase();

  switch (command) {
    case 'list': {
      printHeader('Available Coordinate Reference Systems');
      const crs = listCRS();
      console.log(`${colors.bright}Predefined CRS (${crs.predefined.length}):${colors.reset}`);
      crs.predefined.forEach(name => {
        const def = PREDEFINED_CRS[name];
        console.log(`  ${colors.green}${name}${colors.reset}`);
        console.log(`    ${colors.cyan}${def}${colors.reset}`);
      });
      if (crs.custom.length > 0) {
        console.log(`\n${colors.bright}Custom CRS (${crs.custom.length}):${colors.reset}`);
        crs.custom.forEach(name => console.log(`  ${colors.yellow}${name}${colors.reset}`));
      }
      break;
    }

    case 'define': {
      const name = args[1];
      const def = args[2];
      if (!name || !def) {
        printError('Usage: node cli.js define <name> <proj4-definition>');
        return;
      }
      const result = defineCRS(name, def);
      if (result.success) {
        printSuccess(result.message);
        console.log(`  Name: ${result.name}`);
        console.log(`  Definition: ${result.definition}`);
      } else {
        printError(result.error);
      }
      break;
    }

    case 'transform': {
      const from = args[1];
      const to = args[2];
      const coordsStr = args[3];
      if (!from || !to || !coordsStr) {
        printError('Usage: node cli.js transform <from> <to> <coordinates>');
        return;
      }
      const coords = parseCoordinates(coordsStr);
      const result = transform(from, to, coords);
      if (result.success) {
        printSuccess('Transform completed');
        console.log(`  From: ${colors.cyan}${result.from}${colors.reset}`);
        console.log(`  To: ${colors.cyan}${result.to}${colors.reset}`);
        console.log(`  Input: [${colors.yellow}${result.input.join(', ')}${colors.reset}]`);
        console.log(`  Output: [${colors.green}${result.output.join(', ')}${colors.reset}]`);
      } else {
        printError(result.error);
      }
      break;
    }

    case 'batch': {
      const from = args[1];
      const to = args[2];
      const coordsStr = args[3];
      if (!from || !to || !coordsStr) {
        printError('Usage: node cli.js batch <from> <to> <coordinates>');
        return;
      }
      const coords = parseMultipleCoordinates(coordsStr);
      const result = batchTransform(from, to, coords);
      if (result.success) {
        printSuccess(`Batch transform completed (${result.count} coordinates)`);
        console.log(`  From: ${colors.cyan}${result.from}${colors.reset}`);
        console.log(`  To: ${colors.cyan}${result.to}${colors.reset}\n`);
        result.results.forEach((r, i) => {
          console.log(`  [${i + 1}] [${r.input.join(', ')}] → [${colors.green}${r.output.join(', ')}${colors.reset}]`);
        });
      } else {
        printError(result.error);
      }
      break;
    }

    case 'info': {
      const crs = args[1];
      if (!crs) {
        printError('Usage: node cli.js info <crs>');
        return;
      }
      const result = getProj4Def(crs);
      if (result.success) {
        printSuccess(`CRS Information: ${result.crs}`);
        console.log(`  Name: ${result.name}`);
        console.log(`  Projection: ${result.projName}`);
        console.log(`  Units: ${result.units}`);
        console.log(`  Definition: ${colors.cyan}${result.definition}${colors.reset}`);
      } else {
        printError(result.error);
      }
      break;
    }

    case 'inverse': {
      const from = args[1];
      const to = args[2];
      if (!from || !to) {
        printError('Usage: node cli.js inverse <from> <to>');
        return;
      }
      const result = getInverseTransform(from, to);
      if (result.success) {
        printSuccess('Inverse transformation available');
        console.log(`  Forward: ${colors.cyan}${result.forward.from}${colors.reset} → ${colors.cyan}${result.forward.to}${colors.reset}`);
        console.log(`  Inverse: ${colors.cyan}${result.inverse.from}${colors.reset} → ${colors.cyan}${result.inverse.to}${colors.reset}`);
        console.log(`  Round-trip accuracy: ${result.isAccurate ? '${colors.green}Accurate' : '${colors.yellow}May have precision loss'}${colors.reset}`);
      } else {
        printError(result.error);
      }
      break;
    }

    case 'china': {
      const from = args[1];
      const to = args[2];
      const coordsStr = args[3];
      if (!from || !to || !coordsStr) {
        printError('Usage: node cli.js china <from> <to> <coordinates>');
        printInfo('Supported: WGS84, GCJ02, BD09');
        return;
      }
      const coords = parseCoordinates(coordsStr);
      const result = transformChina(from, to, coords);
      if (result.success) {
        printSuccess('China coordinate transform completed');
        console.log(`  From: ${colors.cyan}${result.from}${colors.reset}`);
        console.log(`  To: ${colors.cyan}${result.to}${colors.reset}`);
        console.log(`  Input: [${colors.yellow}${result.input.join(', ')}${colors.reset}]`);
        console.log(`  Output: [${colors.green}${result.output.join(', ')}${colors.reset}]`);
      } else {
        printError(result.error);
      }
      break;
    }

    case 'blh-to-xyz': {
      const lat = parseFloat(args[1]);
      const lon = parseFloat(args[2]);
      const height = args[3] ? parseFloat(args[3]) : 0;
      if (isNaN(lat) || isNaN(lon)) {
        printError('Usage: node cli.js blh-to-xyz <lat> <lon> [height]');
        printInfo('Example: node cli.js blh-to-xyz 39.915 116.404 100');
        return;
      }
      const result = blhToXYZ(lat, lon, height);
      if (result.success) {
        printSuccess('BLH to ECEF XYZ conversion completed');
        console.log(`  Input:  lat=${colors.yellow}${lat}°${colors.reset}, lon=${colors.yellow}${lon}°${colors.reset}, height=${colors.yellow}${height}m${colors.reset}`);
        console.log(`  Output: X=${colors.green}${result.X.toFixed(4)}${colors.reset}, Y=${colors.green}${result.Y.toFixed(4)}${colors.reset}, Z=${colors.green}${result.Z.toFixed(4)}${colors.reset} meters`);
      } else {
        printError(result.error);
      }
      break;
    }

    case 'xyz-to-blh': {
      const X = parseFloat(args[1]);
      const Y = parseFloat(args[2]);
      const Z = parseFloat(args[3]);
      if (isNaN(X) || isNaN(Y) || isNaN(Z)) {
        printError('Usage: node cli.js xyz-to-blh <X> <Y> <Z>');
        printInfo('Example: node cli.js xyz-to-blh -2185238.6 4384248.9 4076894.5');
        return;
      }
      const result = xyzToBLH(X, Y, Z);
      if (result.success) {
        printSuccess('ECEF XYZ to BLH conversion completed');
        console.log(`  Input:  X=${colors.yellow}${X}${colors.reset}, Y=${colors.yellow}${Y}${colors.reset}, Z=${colors.yellow}${Z}${colors.reset} meters`);
        console.log(`  Output: lat=${colors.green}${result.lat.toFixed(8)}°${colors.reset}, lon=${colors.green}${result.lon.toFixed(8)}°${colors.reset}, height=${colors.green}${result.height.toFixed(4)}m${colors.reset}`);
      } else {
        printError(result.error);
      }
      break;
    }

    case 'ellipsoid': {
      const name = args[1] || 'WGS84';
      const result = getEllipsoidInfo(name);
      if (result.success) {
        printSuccess(`Ellipsoid Information: ${result.name}`);
        console.log(`  Description: ${result.description}`);
        console.log(`  Semi-major axis (a): ${colors.cyan}${result.a} meters${colors.reset}`);
        console.log(`  Semi-minor axis (b): ${colors.cyan}${result.b.toFixed(4)} meters${colors.reset}`);
        console.log(`  Flattening (f): ${colors.cyan}${result.f}${colors.reset}`);
        console.log(`  Eccentricity² (e²): ${colors.cyan}${result.e2}${colors.reset}`);
      } else {
        printError(result.error);
      }
      break;
    }

    case 'examples':
      showExamples();
      break;

    case 'help':
    case '-h':
    case '--help':
      showHelp();
      break;

    default:
      if (!command) {
        showHelp();
      } else {
        printError(`Unknown command: ${command}`);
        console.log('Run "node cli.js help" for usage information');
      }
  }
}

// Run CLI if executed directly
if (require.main === module) {
  main();
}

module.exports = { main };
