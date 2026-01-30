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
  wgs84ToGcj02
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

// Summary
console.log('\n' + '='.repeat(50));
console.log(`Tests passed: ${testsPassed}`);
console.log(`Tests failed: ${testsFailed}`);
console.log('='.repeat(50));

if (testsFailed > 0) {
  process.exit(1);
}
