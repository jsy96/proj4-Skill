/**
 * Tests for Proj4 Coordinate Transformation Skill
 * Run with: node test.js
 */

const {
  defineCRS,
  listCRS,
  transform,
  batchTransform,
  getProj4Def,
  getInverseTransform,
  transformChina,
  gcj02ToWgs84,
  wgs84ToGcj02,
  blhToXYZ,
  xyzToBLH,
  batchBlhToXYZ,
  batchXyzToBLH,
  getEllipsoidInfo
} = require('./index');

// Simple test runner
let testsPassed = 0;
let testsFailed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    testsPassed++;
  } catch (error) {
    console.error(`✗ ${name}`);
    console.error(`  ${error.message}`);
    testsFailed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertEqual(actual, expected, message) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(message || `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

console.log('Running Proj4 Coordinate Transformation Tests...\n');

// Test 1: List CRS
test('listCRS returns predefined systems', () => {
  const result = listCRS();
  assert(Array.isArray(result.predefined), 'predefined should be an array');
  assert(result.predefined.includes('EPSG:4326'), 'should include EPSG:4326');
  assert(result.predefined.includes('EPSG:3857'), 'should include EPSG:3857');
});

// Test 2: Define custom CRS
test('defineCRS creates a custom coordinate system', () => {
  const result = defineCRS('TEST_CRS', '+proj=longlat +datum=WGS84 +no_defs');
  assert(result.success === true, 'should return success');
  assert(result.name === 'TEST_CRS', 'should return the name');
});

// Test 3: Transform WGS84 to Web Mercator
test('transform from WGS84 to Web Mercator', () => {
  const result = transform('EPSG:4326', 'EPSG:3857', [116.404, 39.915]);
  assert(result.success === true, 'should return success');
  assert(Array.isArray(result.output), 'output should be an array');
  assert(result.output.length === 2, 'output should have 2 coordinates');
  // Beijing in Web Mercator - check values are reasonable
  assert(result.output[0] > 12000000 && result.output[0] < 14000000, 'x coordinate should be in valid range');
  assert(result.output[1] > 4000000 && result.output[1] < 6000000, 'y coordinate should be in valid range');
});

// Test 4: Transform Web Mercator back to WGS84
test('transform from Web Mercator to WGS84', () => {
  const mercatorCoords = [12958034.006300217, 4853597.9882998355];
  const result = transform('EPSG:3857', 'EPSG:4326', mercatorCoords);
  assert(result.success === true, 'should return success');
  // Should get back approximately the original coordinates
  assert(Math.abs(result.output[0] - 116.404) < 0.01, 'longitude should be correct');
  assert(Math.abs(result.output[1] - 39.915) < 0.01, 'latitude should be correct');
});

// Test 5: Batch transform
test('batchTransform transforms multiple coordinates', () => {
  const coordinates = [
    [116.404, 39.915],  // Beijing
    [121.473, 31.230],  // Shanghai
    [113.264, 23.129]   // Guangzhou
  ];
  const result = batchTransform('EPSG:4326', 'EPSG:3857', coordinates);
  assert(result.success === true, 'should return success');
  assert(result.count === 3, 'should transform 3 coordinates');
  assert(Array.isArray(result.results), 'results should be an array');
});

// Test 6: Get Proj4 definition
test('getProj4Def returns CRS definition', () => {
  const result = getProj4Def('EPSG:4326');
  assert(result.success === true, 'should return success');
  assert(result.crs === 'EPSG:4326', 'should return the CRS name');
  assert(result.definition, 'should return a definition');
});

// Test 7: Inverse transform
test('getInverseTransform provides inverse info', () => {
  const result = getInverseTransform('EPSG:4326', 'EPSG:3857');
  assert(result.success === true, 'should return success');
  assert(result.forward, 'should have forward transform');
  assert(result.inverse, 'should have inverse transform');
  assert(result.isAccurate === true, 'should be accurate');
});

// Test 8: WGS84 to GCJ02 conversion
test('wgs84ToGcj02 converts coordinates', () => {
  const result = wgs84ToGcj02(116.404, 39.915);
  assert(Array.isArray(result), 'should return an array');
  assert(result.length === 2, 'should have 2 coordinates');
  // GCJ02 should be slightly offset from WGS84
  assert(result[0] !== 116.404, 'longitude should be offset');
  assert(result[1] !== 39.915, 'latitude should be offset');
});

// Test 9: GCJ02 to WGS84 conversion
test('gcj02ToWgs84 converts back to WGS84', () => {
  const gcj = wgs84ToGcj02(116.404, 39.915);
  const result = gcj02ToWgs84(gcj[0], gcj[1]);
  // Round-trip should give approximately original values
  assert(Math.abs(result[0] - 116.404) < 0.0001, 'longitude should round-trip');
  assert(Math.abs(result[1] - 39.915) < 0.0001, 'latitude should round-trip');
});

// Test 10: China coordinate transform
test('transformChina handles WGS84 to GCJ02', () => {
  const result = transformChina('WGS84', 'GCJ02', [116.404, 39.915]);
  assert(result.success === true, 'should return success');
  assert(result.from === 'WGS84', 'should show source CRS');
  assert(result.to === 'GCJ02', 'should show target CRS');
});

// Test 11: China coordinate transform - GCJ02 to BD09
test('transformChina handles GCJ02 to BD09', () => {
  const result = transformChina('GCJ02', 'BD09', [116.404, 39.915]);
  assert(result.success === true, 'should return success');
});

// Test 12: Transform with invalid CRS
test('transform handles invalid CRS gracefully', () => {
  const result = transform('INVALID:1234', 'EPSG:4326', [0, 0]);
  assert(result.success === false, 'should return failure');
  assert(result.error, 'should have an error message');
});

// Test 13: Transform with invalid coordinates
test('transform handles invalid coordinates', () => {
  const result = transform('EPSG:4326', 'EPSG:3857', []);
  assert(result.success === false, 'should return failure');
});

// Test 14: UTM projection
test('transform to UTM projection', () => {
  const result = transform('EPSG:4326', 'EPSG:32650', [116.404, 39.915]);
  assert(result.success === true, 'should return success');
  assert(Array.isArray(result.output), 'output should be an array');
});

// Test 15: China 2000 CRS
test('transform with China 2000 CRS', () => {
  const result = getProj4Def('EPSG:4490');
  assert(result.success === true, 'should return success');
});

// Test 16: BLH to XYZ conversion
test('blhToXYZ converts geodetic to ECEF coordinates', () => {
  const result = blhToXYZ(39.915, 116.404, 100);
  assert(result.success === true, 'should return success');
  assert(typeof result.X === 'number', 'should have X coordinate');
  assert(typeof result.Y === 'number', 'should have Y coordinate');
  assert(typeof result.Z === 'number', 'should have Z coordinate');
  assert(Math.abs(result.X) > 0, 'X should not be zero');
  assert(Math.abs(result.Y) > 0, 'Y should not be zero');
  assert(Math.abs(result.Z) > 0, 'Z should not be zero');
});

// Test 17: XYZ to BLH conversion
test('xyzToBLH converts ECEF to geodetic coordinates', () => {
  const xyz = blhToXYZ(39.915, 116.404, 100);
  const result = xyzToBLH(xyz.X, xyz.Y, xyz.Z);
  assert(result.success === true, 'should return success');
  assert(typeof result.lat === 'number', 'should have latitude');
  assert(typeof result.lon === 'number', 'should have longitude');
  assert(typeof result.height === 'number', 'should have height');
  // Round-trip should give approximately original values
  assert(Math.abs(result.lat - 39.915) < 0.0001, 'latitude should round-trip');
  assert(Math.abs(result.lon - 116.404) < 0.0001, 'longitude should round-trip');
  assert(Math.abs(result.height - 100) < 0.1, 'height should round-trip');
});

// Test 18: BLH to XYZ with zero height
test('blhToXYZ works with zero height', () => {
  const result = blhToXYZ(0, 0, 0); // Equator at prime meridian
  assert(result.success === true, 'should return success');
  assert(result.X > 6370000 && result.X < 6380000, 'X should be close to Earth radius');
  assert(Math.abs(result.Y) < 1000, 'Y should be near zero at longitude 0');
  assert(Math.abs(result.Z) < 1000, 'Z should be near zero at equator');
});

// Test 19: XYZ to BLH at pole
test('xyzToBLH works at North Pole', () => {
  const result = xyzToBLH(0, 0, 6356752.314); // North Pole on WGS84
  assert(result.success === true, 'should return success');
  assert(Math.abs(result.lat - 90) < 0.1, 'latitude should be near 90°');
});

// Test 20: Batch BLH to XYZ
test('batchBlhToXYZ converts multiple coordinates', () => {
  const coordinates = [
    [39.915, 116.404, 100],
    [31.230, 121.473, 50],
    [23.129, 113.264, 0]
  ];
  const result = batchBlhToXYZ(coordinates);
  assert(result.success === true, 'should return success');
  assert(result.count === 3, 'should convert 3 coordinates');
  assert(Array.isArray(result.results), 'should return results array');
});

// Test 21: Batch XYZ to BLH
test('batchXyzToBLH converts multiple coordinates', () => {
  const xyz1 = blhToXYZ(39.915, 116.404, 100);
  const xyz2 = blhToXYZ(31.230, 121.473, 50);
  const coordinates = [
    [xyz1.X, xyz1.Y, xyz1.Z],
    [xyz2.X, xyz2.Y, xyz2.Z]
  ];
  const result = batchXyzToBLH(coordinates);
  assert(result.success === true, 'should return success');
  assert(result.count === 2, 'should convert 2 coordinates');
});

// Test 22: Get ellipsoid info
test('getEllipsoidInfo returns WGS84 parameters', () => {
  const result = getEllipsoidInfo('WGS84');
  assert(result.success === true, 'should return success');
  assert(result.name === 'WGS84', 'should have correct name');
  assert(result.a === 6378137.0, 'should have correct semi-major axis');
  assert(typeof result.f === 'number', 'should have flattening');
  assert(typeof result.e2 === 'number', 'should have eccentricity squared');
});

// Test 23: Degree/radian conversion
test('degToRad and radToDeg convert correctly', () => {
  const { degToRad, radToDeg } = require('./index');
  const degrees = 180;
  const radians = degToRad(degrees);
  assert(Math.abs(radians - Math.PI) < 0.0001, '180° should equal π radians');
  const back = radToDeg(radians);
  assert(Math.abs(back - degrees) < 0.0001, 'round-trip should preserve value');
});

// Test 24: BLH to XYZ with negative height
test('blhToXYZ handles negative height', () => {
  const result = blhToXYZ(39.915, 116.404, -100);
  assert(result.success === true, 'should return success');
  assert(typeof result.X === 'number', 'should have X coordinate');
});

// Test 25: XYZ to BLH with southern hemisphere
test('xyzToBLH handles southern hemisphere', () => {
  const xyz = blhToXYZ(-33.8688, 151.2093, 50); // Sydney
  const result = xyzToBLH(xyz.X, xyz.Y, xyz.Z);
  assert(result.success === true, 'should return success');
  assert(result.lat < 0, 'latitude should be negative (southern hemisphere)');
  assert(Math.abs(result.lat + 33.8688) < 0.0001, 'latitude should round-trip');
});

// Summary
console.log('\n' + '='.repeat(50));
console.log(`Tests passed: ${testsPassed}`);
console.log(`Tests failed: ${testsFailed}`);
console.log('='.repeat(50));

if (testsFailed > 0) {
  process.exit(1);
}
