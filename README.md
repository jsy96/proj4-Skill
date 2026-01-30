# Proj4 Coordinate Transformation Skill

一个基于 Proj4js 的坐标系定义和转换 Skill，支持多种坐标系之间的相互转换，包括中国常用的坐标系（WGS84、GCJ-02、BD-09），以及地心直角坐标系（ECEF XYZ）与大地坐标系（BLH）的相互转换。

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

- 🌐 **地心直角坐标系 (ECEF XYZ)**
  - BLH (经纬高) → XYZ (地心直角坐标)
  - XYZ (地心直角坐标) → BLH (经纬高)
  - 基于 WGS84 椭球模型
  - 支持批量转换

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

#### 地心直角坐标转换 (ECEF XYZ)

将大地坐标 (BLH) 转换为地心直角坐标 (XYZ):

```bash
node cli.js blh-to-xyz 39.915 116.404 100
# 输出: X=-2178505.3710, Y=4387801.4334, Z=4070815.4087
```

将地心直角坐标 (XYZ) 转换为大地坐标 (BLH):

```bash
node cli.js xyz-to-blh -2178505.3710 4387801.4334 4070815.4087
# 输出: lat=39.91500000°, lon=116.40400000°, height=99.9999m
```

查看椭球参数信息:

```bash
node cli.js ellipsoid WGS84
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
  blhToXYZ,
  xyzToBLH,
  batchBlhToXYZ,
  defineCRS,
  listCRS
} = require('./index');

// 基本坐标转换 - WGS84 转 Web Mercator
const result1 = transform('EPSG:4326', 'EPSG:3857', [116.404, 39.915]);
console.log(result1.output); // [12957296.19, 4835470.39]

// 中国坐标转换 - WGS84 转 GCJ-02
const result2 = transformChina('WGS84', 'GCJ02', [116.404, 39.915]);
console.log(result2.output); // [116.410, 39.920]

// BLH 转 XYZ - 大地坐标转地心直角坐标
const result3 = blhToXYZ(39.915, 116.404, 100);
console.log(`X=${result3.X}, Y=${result3.Y}, Z=${result3.Z}`);
// X=-2178505.3710, Y=4387801.4334, Z=4070815.4087

// XYZ 转 BLH - 地心直角坐标转大地坐标
const result4 = xyzToBLH(result3.X, result3.Y, result3.Z);
console.log(`lat=${result4.lat}, lon=${result4.lon}, height=${result4.height}`);
// lat=39.915, lon=116.404, height=100

// 批量 BLH 转 XYZ
const coordinates = [
  [39.915, 116.404, 100],
  [31.230, 121.473, 50],
  [23.129, 113.264, 0]
];
const result5 = batchBlhToXYZ(coordinates);
console.log(result5.results);

// 定义自定义坐标系
defineCRS('LOCAL', '+proj=utm +zone=50 +datum=WGS84 +units=m +no_defs');

// 列出所有可用坐标系
const crsList = listCRS();
console.log(crsList.predefined);
```

### 3. 作为 Claude Code Skill 使用

此项目可以作为 Claude Code 的 Skill 使用。

#### 安装 Skill

1. 克隆此仓库到本地：
```bash
git clone https://github.com/jsy96/proj4-Skill.git
cd proj4-Skill
npm install
```

2. 在 Claude Code 中配置 skill 路径

#### 在 Claude Code 中使用

在对话中直接使用 skill 命令：

```
# 坐标转换
请使用 proj4 skill 将坐标 [116.404, 39.915] 从 WGS84 转换为 Web Mercator

# 中国坐标转换
请使用 proj4 skill 将 GPS 坐标 [116.404, 39.915] 转换为高德地图坐标

# 地心直角坐标转换
请使用 proj4 skill 将大地坐标 (纬度=39.915, 经度=116.404, 高度=100) 转换为地心直角坐标 XYZ

# 列出所有坐标系
请使用 proj4 skill 列出所有可用的坐标系

# 批量转换
请使用 proj4 skill 批量转换以下坐标: [[116.404, 39.915], [121.473, 31.230]]
```

#### 可用的 Skill 命令

- `transform` - 坐标系转换
- `transform-china` - 中国坐标系转换 (WGS84/GCJ02/BD09)
- `blh-to-xyz` - 大地坐标转地心直角坐标
- `xyz-to-blh` - 地心直角坐标转大地坐标
- `batch-blh-to-xyz` - 批量大地坐标转地心直角坐标
- `batch-xyz-to-blh` - 批量地心直角坐标转大地坐标
- `batch-transform` - 批量坐标转换
- `list-crs` - 列出所有坐标系
- `define-crs` - 定义自定义坐标系
- `get-proj4-def` - 获取坐标系定义
- `inverse-transform` - 获取逆向转换信息
- `ellipsoid-info` - 获取椭球参数

#### 编程方式调用

```javascript
const skill = require('./skill-handler');

// 转换坐标
const result = await skill.execute('transform', {
  from: 'EPSG:4326',
  to: 'EPSG:3857',
  coordinates: [116.404, 39.915]
});
console.log(result);

// BLH 转 XYZ
const result2 = await skill.execute('blh-to-xyz', {
  lat: 39.915,
  lon: 116.404,
  height: 100
});
console.log(result2);

// 获取可用命令
const commands = skill.getCommands();
console.log(commands);
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
