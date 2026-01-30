# Proj4 Coordinate Transformation Skill

一个基于 Proj4js 的坐标系定义和转换 Skill，支持多种坐标系之间的相互转换，包括中国常用的坐标系（WGS84、GCJ-02、BD-09）。

## 功能特性

- 🌍 **支持多种国际标准坐标系**
  - WGS84 (EPSG:4326) - GPS坐标
  - Web Mercator (EPSG:3857) - Google Maps、OpenStreetMap
  - UTM 投影坐标系
  - 各种国家坐标系（法国、中国等）

- 🇨🇳 **支持中国坐标系**
  - WGS84 - GPS国际坐标
  - GCJ-02 - 火星坐标系（高德、腾讯地图）
  - BD-09 - 百度坐标系
  - CGCS2000 (EPSG:4490) - 中国2000坐标系

- 🔧 **自定义坐标系**
  - 支持定义自定义坐标系
  - 支持 Proj4 定义字符串

- 📦 **批量转换**
  - 支持单点坐标转换
  - 支持批量坐标转换

## 安装

```bash
npm install
```

## 使用方法

### 1. 命令行使用

#### 查看所有可用坐标系

```bash
node cli.js list
```

#### 坐标转换

将 GPS 坐标 (WGS84) 转换为 Web Mercator (Google Maps):

```bash
node cli.js transform EPSG:4326 EPSG:3857 "116.404,39.915"
```

#### 中国坐标系转换

将 WGS84 (GPS) 转换为 GCJ-02 (高德地图):

```bash
node cli.js china WGS84 GCJ02 "116.404,39.915"
```

将 GCJ-02 转换为 BD-09 (百度地图):

```bash
node cli.js china GCJ02 BD09 "116.404,39.915"
```

#### 批量转换

```bash
node cli.js batch EPSG:4326 EPSG:3857 "116.404,39.915;121.473,31.230"
```

#### 定义自定义坐标系

```bash
node cli.js define "MY_CRS" "+proj=utm +zone=50 +datum=WGS84 +units=m +no_defs"
```

#### 查看坐标系定义

```bash
node cli.js info EPSG:4326
```

#### 查看帮助

```bash
node cli.js help
node cli.js examples
```

### 2. 代码中使用

```javascript
const {
  transform,
  transformChina,
  defineCRS,
  listCRS
} = require('./index');

// 基本坐标转换 - WGS84 转 Web Mercator
const result1 = transform('EPSG:4326', 'EPSG:3857', [116.404, 39.915]);
console.log(result1.output); // [12957296.19, 4835470.39]

// 中国坐标转换 - WGS84 转 GCJ-02
const result2 = transformChina('WGS84', 'GCJ02', [116.404, 39.915]);
console.log(result2.output); // [116.410, 39.920]

// 定义自定义坐标系
defineCRS('LOCAL', '+proj=utm +zone=50 +datum=WGS84 +units=m +no_defs');

// 列出所有可用坐标系
const crsList = listCRS();
console.log(crsList.predefined);
```

### 3. 作为 Skill 使用

此项目可以集成到 Claude Code 中作为 Skill 使用：

```json
{
  "name": "proj4-coordinate-transform",
  "description": "Coordinate system transformation using Proj4js",
  "commands": [
    "define-crs",
    "list-crs",
    "transform",
    "batch-transform",
    "transform-china"
  ]
}
```

## 支持的坐标系

### 国际标准坐标系

| 代码 | 名称 | 说明 |
|------|------|------|
| EPSG:4326 / WGS84 | World Geodetic System 1984 | GPS坐标系统 |
| EPSG:3857 | Web Mercator | Google Maps、OpenStreetMap |
| EPSG:3395 | Mercator | 墨卡托投影 |
| EPSG:32633 | UTM Zone 33N | UTM北33区 |
| EPSG:32650 | UTM Zone 50N | UTM北50区（中国区域） |

### 中国坐标系

| 代码 | 名称 | 说明 |
|------|------|------|
| WGS84 | GPS坐标 | 国际通用GPS坐标 |
| GCJ02 | 火星坐标系 | 高德、腾讯地图 |
| BD09 | 百度坐标系 | 百度地图 |
| EPSG:4490 | CGCS2000 | 中国2000坐标系 |
| EPSG:4214 | Xian 1980 | 西安1980坐标系 |
| EPSG:4610 | Beijing 1954 | 北京1954坐标系 |

## 坐标系转换关系

```
                    ┌─────────────┐
                    │   WGS84     │ GPS (国际)
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   GCJ02     │ 火星坐标 (高德、腾讯)
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │    BD09     │ 百度坐标
                    └─────────────┘
```

## API 参考

### transform(from, to, coordinates)

转换坐标从一个坐标系到另一个坐标系。

**参数:**
- `from` (string) - 源坐标系
- `to` (string) - 目标坐标系
- `coordinates` (array) - 坐标 [x, y]

**返回:**
```javascript
{
  success: true,
  from: 'EPSG:4326',
  to: 'EPSG:3857',
  input: [116.404, 39.915],
  output: [12957296.19, 4835470.39],
  x: 12957296.19,
  y: 4835470.39
}
```

### transformChina(from, to, coordinates)

转换中国坐标系 (WGS84/GCJ02/BD09)。

**支持的转换:**
- WGS84 ↔ GCJ02
- WGS84 ↔ BD09
- GCJ02 ↔ BD09

### batchTransform(from, to, coordinates)

批量转换多个坐标。

**参数:**
- `from` (string) - 源坐标系
- `to` (string) - 目标坐标系
- `coordinates` (array) - 坐标数组 [[x1, y1], [x2, y2], ...]

### defineCRS(name, proj4def)

定义自定义坐标系。

**参数:**
- `name` (string) - 坐标系名称
- `proj4def` (string) - Proj4 定义字符串

### getProj4Def(crs)

获取坐标系的 Proj4 定义。

## 示例

### 示例 1: GPS坐标转Web地图坐标

```javascript
// 北京天安门 GPS 坐标
const beijingGPS = [116.404, 39.915];

// 转换为 Web Mercator (Google Maps)
const result = transform('EPSG:4326', 'EPSG:3857', beijingGPS);
console.log(result.output); // [12957296.19, 4835470.39]
```

### 示例 2: GPS坐标转高德地图坐标

```javascript
// GPS 坐标
const gps = [116.404, 39.915];

// 转换为 GCJ-02 (高德地图)
const result = transformChina('WGS84', 'GCJ02', gps);
console.log(result.output); // [116.410, 39.920]
```

### 示例 3: 批量转换多个城市坐标

```javascript
const cities = [
  [116.404, 39.915],  // 北京
  [121.473, 31.230],  // 上海
  [113.264, 23.129],  // 广州
  [114.057, 22.543]   // 深圳
];

const result = batchTransform('EPSG:4326', 'EPSG:3857', cities);
result.results.forEach((r, i) => {
  console.log(`城市 ${i + 1}: ${r.input} -> ${r.output}`);
});
```

### 示例 4: 百度坐标转GPS坐标

```javascript
// 百度地图坐标
const baiduCoord = [116.404, 39.915];

// 转换为 GPS 坐标
const result = transformChina('BD09', 'WGS84', baiduCoord);
console.log(result.output); // [116.397, 39.909]
```

## 运行测试

```bash
npm test
```

或直接运行测试文件:

```bash
node test.js
```

## 许可证

MIT

## 参考资料

- [Proj4js 官方文档](https://proj4js.org/)
- [EPSG 代码库](https://epsg.io/)
- [中国坐标系转换原理](https://github.com/ootaoshu/coordtransform)

## 常见问题

### Q: WGS84、GCJ-02、BD-09 有什么区别?

**A:**
- **WGS84**: 国际标准GPS坐标，Google Earth使用
- **GCJ-02**: 中国加密坐标，高德、腾讯地图使用
- **BD-09**: 百度在GCJ-02基础上再次加密的坐标

### Q: 为什么同一个地点在不同地图上坐标不一样?

**A:** 因为不同地图服务商使用不同的坐标系。在中国，出于安全考虑，大部分地图服务使用了加密的坐标系（GCJ-02或BD-09）。

### Q: 如何选择正确的坐标系?

**A:**
- GPS设备、Google Earth → WGS84 (EPSG:4326)
- Google Maps、OpenStreetMap → EPSG:3857
- 高德地图、腾讯地图 → GCJ-02
- 百度地图 → BD-09
- 中国官方测绘 → CGCS2000 (EPSG:4490)
