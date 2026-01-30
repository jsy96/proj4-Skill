# Proj4 Coordinate Transformation Skill

A skill for defining coordinate reference systems and transforming coordinates between different coordinate systems using Proj4js.

## Installation

First, install the dependencies:

```bash
npm install
```

## Commands

### `transform <from> <to> <coordinates>`

Transform coordinates from one CRS to another.

**Parameters:**
- `from` - Source CRS (e.g., 'EPSG:4326', 'WGS84')
- `to` - Target CRS (e.g., 'EPSG:3857', 'GCJ02')
- `coordinates` - Coordinates to transform [x, y]

**Examples:**
```
transform EPSG:4326 EPSG:3857 [116.404, 39.915]
```

### `transform-china <from> <to> <coordinates>`

Transform Chinese coordinates (WGS84/GCJ02/BD09).

**Parameters:**
- `from` - Source CRS (WGS84, GCJ02, or BD09)
- `to` - Target CRS (WGS84, GCJ02, or BD09)
- `coordinates` - Coordinates [longitude, latitude]

**Examples:**
```
transform-china WGS84 GCJ02 [116.404, 39.915]
transform-china GCJ02 BD09 [116.404, 39.915]
```

### `batch-transform <from> <to> <coordinates>`

Transform multiple coordinates.

**Parameters:**
- `from` - Source CRS
- `to` - Target CRS
- `coordinates` - Array of coordinates [[x1, y1], [x2, y2], ...]

**Examples:**
```
batch-transform EPSG:4326 EPSG:3857 [[116.404, 39.915], [121.473, 31.230]]
```

### `list-crs`

List all available predefined coordinate reference systems.

### `define-crs <name> <proj4def>`

Define a custom Coordinate Reference System.

**Parameters:**
- `name` - Name/identifier for the CRS
- `proj4def` - Proj4 definition string

**Examples:**
```
define-crs MY_CRS "+proj=utm +zone=50 +datum=WGS84 +units=m +no_defs"
```

### `get-proj4-def <crs>`

Get the Proj4 definition string for a given CRS.

**Parameters:**
- `crs` - CRS identifier (e.g., 'EPSG:4326')

## Common CRS Codes

| Code | Name | Description |
|------|------|-------------|
| EPSG:4326 / WGS84 | World Geodetic System 1984 | GPS coordinates |
| EPSG:3857 | Web Mercator | Google Maps, OpenStreetMap |
| GCJ02 | GCJ-02 | Gaode/Tencent maps (China) |
| BD09 | BD-09 | Baidu maps (China) |
| EPSG:4490 | CGCS2000 | China 2000 CRS |
| EPSG:32650 | UTM Zone 50N | UTM projection for China area |

## Coordinate System Transformations

### International Systems
- WGS84 (GPS) ↔ Web Mercator (Google Maps)
- WGS84 ↔ UTM projections
- Any supported EPSG code

### Chinese Coordinate Systems
```
WGS84 (GPS)
    ↓
GCJ02 (Gaode/Tencent)
    ↓
BD09 (Baidu)
```

## Usage Examples

### Convert GPS to Web Mercator
```javascript
transform EPSG:4326 EPSG:3857 [116.404, 39.915]
// Result: [12958034.006, 4853597.988]
```

### Convert GPS to GCJ-02 (Gaode Maps)
```javascript
transform-china WGS84 GCJ02 [116.404, 39.915]
// Result: [116.410, 39.916]
```

### Batch transform multiple cities
```javascript
batch-transform EPSG:4326 EPSG:3857 [[116.404, 39.915], [121.473, 31.230]]
```

## API Reference

The skill exports the following functions for programmatic use:

```javascript
const {
  transform,           // Basic coordinate transformation
  transformChina,      // Chinese coordinate systems
  batchTransform,      // Batch transformation
  defineCRS,           // Define custom CRS
  listCRS,             // List all CRS
  getProj4Def,         // Get CRS definition
  getInverseTransform  // Get inverse transformation info
} = require('./index');
```

## Implementation Notes

This skill uses Proj4js (version 2.20.2) for coordinate transformations.

For Chinese coordinate systems (GCJ-02, BD-09), the skill implements the encryption/decryption algorithms as these are not natively supported by Proj4js due to China's coordinate obfuscation policy.

## Testing

Run tests with:
```bash
npm test
```

## License

MIT
