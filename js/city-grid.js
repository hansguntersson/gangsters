var MAP_IMAGE = { file: 'map-background.png', width: 1024, height: 1536 };

var STREET_CENTERLINES = {
  vertical: {
    'West St': 52,
    'Pine St': 315,
    'Elm St': 558,
  },
  riverX: {
    'Riverside Ave': 800,
    'Harrison Ave': 865,
    'Madison Ave': 860,
    'Jefferson Ave': 868,
    'Franklin Ave': 900,
    'Oakwood Ave': 910,
  },
  horizontal: {
    'Riverside Ave': 50,
    'Harrison Ave': 260,
    'Madison Ave': 557,
    'Jefferson Ave': 860,
    'Franklin Ave': 1113,
    'Oakwood Ave': 1428,
  },
};

var BLOCK_ROWS = [
  { north: 'Riverside Ave', south: 'Harrison Ave' },
  { north: 'Harrison Ave', south: 'Madison Ave' },
  { north: 'Madison Ave', south: 'Jefferson Ave' },
  { north: 'Jefferson Ave', south: 'Franklin Ave' },
  { north: 'Franklin Ave', south: 'Oakwood Ave' },
];

var BLOCK_CENTERS = {
  A1: { x: 183, y: 155 },
  B1: { x: 436, y: 155 },
  C1: { x: 679, y: 155 },
  A2: { x: 183, y: 408 },
  B2: { x: 436, y: 408 },
  C2: { x: 711, y: 408 },
  A3: { x: 183, y: 708 },
  B3: { x: 436, y: 708 },
  C3: { x: 709, y: 708 },
  A4: { x: 183, y: 986 },
  B4: { x: 436, y: 986 },
  C4: { x: 713, y: 986 },
  A5: { x: 183, y: 1270 },
  B5: { x: 436, y: 1270 },
  C5: { x: 729, y: 1270 },
};

var BLOCK_GANG = {
  A1: 'riverside_syndicate',
  A2: 'riverside_syndicate',
  A3: null,
  A4: 'factory_boys',
  A5: 'oakwood_crew',
  B1: 'riverside_syndicate',
  B2: 'riverside_syndicate',
  B3: null,
  B4: 'factory_boys',
  B5: 'oakwood_crew',
  C1: 'longshoremen',
  C2: 'longshoremen',
  C3: 'longshoremen',
  C4: 'longshoremen',
  C5: 'oakwood_crew',
};

var GANGS = {
  longshoremen: {
    id: 'longshoremen',
    name: 'The Longshoremen',
    hubBlock: 'C3',
    turf: ['C1', 'C2', 'C3', 'C4'],
    rivals: ['factory_boys'],
  },
  factory_boys: {
    id: 'factory_boys',
    name: 'Factory Boys',
    hubBlock: 'A4',
    turf: ['A4', 'B4'],
    rivals: ['longshoremen', 'oakwood_crew'],
  },
  oakwood_crew: {
    id: 'oakwood_crew',
    name: 'Oakwood Crew',
    hubBlock: 'B5',
    turf: ['A5', 'B5', 'C5'],
    rivals: ['factory_boys'],
  },
  riverside_syndicate: {
    id: 'riverside_syndicate',
    name: 'Riverside Syndicate',
    hubBlock: 'B1',
    turf: ['A1', 'A2', 'B1', 'B2'],
    rivals: ['longshoremen'],
  },
};

var GANG_LABEL_TO_ID = {
  'The Longshoremen': 'longshoremen',
  'Factory Boys': 'factory_boys',
  'Oakwood Crew': 'oakwood_crew',
  'Riverside Syndicate': 'riverside_syndicate',
};

var CATEGORY_ICON = {
  'House': 1,
  'Tenement': 1,
  'Shopfront / mixed-use': 2,
  'Warehouse': 3,
  'Factory': 4,
  'Car park': 5,
  'Park': 6,
  'Pier': 7,
};

var MAP_LOCATION_OVERRIDES = {
  L004: { name: 'City Pharmacy', type: 'pharmacy' },
  L010: { name: "Maria's Café", type: 'neutral', extortable: true, businessOwner: 'maria' },
  L017: { name: 'North Pier', type: 'pier' },
  L024: { name: "Sal's Deli", type: 'neutral', extortable: true, businessOwner: 'sal', iconIndex: 2 },
  L030: { name: 'Middle Pier', type: 'gang' },
  L031: { name: 'West Side Factory', type: 'gang' },
  L040: { name: 'South Pier', type: 'pier' },
  L043: { name: "Gus's Garage", type: 'garage', startsKnown: true },
  L047: { name: 'Your Apartment', type: 'home', iconIndex: 0, startsKnown: true },
  L048: { name: 'Oakwood Store', type: 'neutral', iconIndex: 2, startsKnown: true, extortable: true },
};

var LEGACY_LOCATION_IDS = {
  home: 'l047',
  west_homes: 'l001',
  riverside_lot: 'l003',
  riverside_row: 'l014',
  north_pier: 'l017',
  middle_pier: 'l030',
  south_pier: 'l040',
  west_factory: 'l031',
  jefferson_green: 'l033',
  garage: 'l043',
  cafe: 'l010',
  deli: 'l024',
  pharmacy: 'l004',
  oakwood_corner: 'l048',
  gang_a_hq: 'l030',
  gang_b_hq: 'l031',
  corner_a: 'l048',
  corner_b: 'l017',
  warehouse_district: 'l014',
  residential: 'l001',
};

var MAP_LOCATIONS_BY_ID = {};
var MAP_LOCATIONS_LIST = [];

function initMapLocationIndex() {
  if (typeof MAP_LOCATIONS_DATA === 'undefined') return;

  const data = MAP_LOCATIONS_DATA;
  MAP_IMAGE = data.image;
  MAP_LOCATIONS_LIST = data.locations || [];
  MAP_LOCATIONS_BY_ID = {};

  for (const loc of MAP_LOCATIONS_LIST) {
    MAP_LOCATIONS_BY_ID[loc.id] = loc;
  }

  if (data.block_centers) {
    for (const block of data.block_centers) {
      BLOCK_CENTERS[block.id] = { x: block.x, y: block.y };
      if (block.gang !== undefined) {
        BLOCK_GANG[block.id] = block.gang ? GANG_LABEL_TO_ID[block.gang] : null;
      }
    }
  }
}

function getMapLocation(mapId) {
  return MAP_LOCATIONS_BY_ID[mapId] || null;
}

function getAllMapLocations() {
  return MAP_LOCATIONS_LIST;
}

function gangIdFromLabel(label) {
  if (!label) return null;
  return GANG_LABEL_TO_ID[label] || null;
}

function categoryToIcon(category) {
  return CATEGORY_ICON[category] != null ? CATEGORY_ICON[category] : 1;
}

function defaultTypeForCategory(category) {
  if (category === 'Pier') return 'pier';
  return 'building';
}

function migrateLocationId(id) {
  if (!id) return id;
  return LEGACY_LOCATION_IDS[id] || id;
}

function mapBuildingLoc(mapLoc) {
  const overrides = MAP_LOCATION_OVERRIDES[mapLoc.id] || {};
  const id = mapLoc.id.toLowerCase();
  const block = mapLoc.block;
  const gangId = gangIdFromLabel(mapLoc.gang) || BLOCK_GANG[block] || null;

  return {
    id,
    name: overrides.name || mapLoc.name,
    mapLocationId: mapLoc.id,
    block,
    x: mapLoc.x,
    y: mapLoc.y,
    bounds: mapLoc.bounds,
    category: mapLoc.category,
    iconIndex: overrides.iconIndex !== undefined ? overrides.iconIndex : categoryToIcon(mapLoc.category),
    type: overrides.type || defaultTypeForCategory(mapLoc.category),
    extortable: !!overrides.extortable,
    businessOwner: overrides.businessOwner || null,
    startsKnown: !!overrides.startsKnown,
    streets: mapLoc.streets || [],
    avenues: mapLoc.avenues || [],
    turf: gangId,
    gang: gangId,
  };
}

function buildAllBuildingLocations() {
  const locs = {};
  for (const mapLoc of MAP_LOCATIONS_LIST) {
    const loc = mapBuildingLoc(mapLoc);
    locs[loc.id] = loc;
  }
  return locs;
}

function buildAllLocations() {
  return Object.assign({}, buildAllBuildingLocations(), buildIntersectionLocations());
}

function getInitialKnownLocations() {
  return Object.values(LOCATIONS).filter(loc => loc.startsKnown).map(loc => loc.id);
}

function streetsFromIntersectionName(name) {
  if (!name || !name.includes(' & ')) return [];
  return name.split(' & ').map(s => s.trim());
}

function blockColRow(blockId) {
  return { col: blockId.charCodeAt(0) - 65, row: parseInt(blockId[1], 10) - 1 };
}

function riverXAtY(y) {
  const h = STREET_CENTERLINES.horizontal;
  const rx = STREET_CENTERLINES.riverX;
  const avenues = Object.keys(h).sort((a, b) => h[a] - h[b]);
  if (y <= h[avenues[0]]) return rx[avenues[0]];
  if (y >= h[avenues[avenues.length - 1]]) return rx[avenues[avenues.length - 1]];
  for (let i = 0; i < avenues.length - 1; i++) {
    const north = avenues[i];
    const south = avenues[i + 1];
    const y0 = h[north];
    const y1 = h[south];
    if (y >= y0 && y <= y1) {
      const t = (y - y0) / (y1 - y0);
      return rx[north] + t * (rx[south] - rx[north]);
    }
  }
  return rx['Riverside Ave'];
}

function blockRect(blockId) {
  const col = blockId[0];
  const row = parseInt(blockId[1], 10) - 1;
  if (row < 0 || row >= BLOCK_ROWS.length) return null;

  const rowBand = BLOCK_ROWS[row];
  const h = STREET_CENTERLINES.horizontal;
  const v = STREET_CENTERLINES.vertical;
  const y = h[rowBand.north];
  const bottom = h[rowBand.south];
  const height = bottom - y;

  let left;
  let right;
  if (col === 'A') {
    left = v['West St'];
    right = v['Pine St'];
  } else if (col === 'B') {
    left = v['Pine St'];
    right = v['Elm St'];
  } else {
    left = v['Elm St'];
    right = riverXAtY(y + height / 2);
  }

  return { x: left, y, w: right - left, h: height };
}

function blockCenter(blockId, xOff, yOff) {
  const center = BLOCK_CENTERS[blockId];
  if (!center) return { x: 0, y: 0 };
  return {
    x: center.x + (xOff || 0),
    y: center.y + (yOff || 0),
  };
}

function buildTurfZones() {
  return Object.entries(BLOCK_GANG)
    .filter(([, gang]) => gang)
    .map(([blockId, gang]) => ({ gang, blockId, ...blockRect(blockId) }))
    .filter(z => z.w > 0);
}

function getGangName(gangId) {
  return GANGS[gangId]?.name || gangId;
}

function pointInBounds(x, y, bounds) {
  if (!bounds || bounds.length < 4) return false;
  return x >= bounds[0] && y >= bounds[1] && x <= bounds[2] && y <= bounds[3];
}

var INTERSECTIONS = [
  { id: 'I001', name: 'West St & Riverside Ave', x: 52, y: 50 },
  { id: 'I002', name: 'Pine St & Riverside Ave', x: 315, y: 50 },
  { id: 'I003', name: 'Elm St & Riverside Ave', x: 558, y: 50 },
  { id: 'I004', name: 'River St & Riverside Ave', x: 800, y: 50 },
  { id: 'I005', name: 'West St & Harrison Ave', x: 52, y: 260 },
  { id: 'I006', name: 'Pine St & Harrison Ave', x: 315, y: 260 },
  { id: 'I007', name: 'Elm St & Harrison Ave', x: 558, y: 260 },
  { id: 'I008', name: 'River St & Harrison Ave', x: 865, y: 260 },
  { id: 'I009', name: 'West St & Madison Ave', x: 52, y: 557 },
  { id: 'I010', name: 'Pine St & Madison Ave', x: 315, y: 557 },
  { id: 'I011', name: 'Elm St & Madison Ave', x: 558, y: 557 },
  { id: 'I012', name: 'River St & Madison Ave', x: 860, y: 557 },
  { id: 'I013', name: 'West St & Jefferson Ave', x: 52, y: 860 },
  { id: 'I014', name: 'Pine St & Jefferson Ave', x: 315, y: 860 },
  { id: 'I015', name: 'Elm St & Jefferson Ave', x: 558, y: 860 },
  { id: 'I016', name: 'River St & Jefferson Ave', x: 868, y: 860 },
  { id: 'I017', name: 'West St & Franklin Ave', x: 52, y: 1113 },
  { id: 'I018', name: 'Pine St & Franklin Ave', x: 315, y: 1113 },
  { id: 'I019', name: 'Elm St & Franklin Ave', x: 558, y: 1113 },
  { id: 'I020', name: 'River St & Franklin Ave', x: 900, y: 1113 },
  { id: 'I021', name: 'West St & Oakwood Ave', x: 52, y: 1428 },
  { id: 'I022', name: 'Pine St & Oakwood Ave', x: 315, y: 1428 },
  { id: 'I023', name: 'Elm St & Oakwood Ave', x: 558, y: 1428 },
  { id: 'I024', name: 'River St & Oakwood Ave', x: 910, y: 1428 },
];

function intersectionLoc(data) {
  return {
    id: data.id.toLowerCase(),
    name: data.name,
    type: 'intersection',
    x: data.x,
    y: data.y,
    iconIndex: LOCATION_ICON.INTERSECTION,
    extortable: false,
    businessOwner: null,
    streets: streetsFromIntersectionName(data.name),
    turf: null,
    gang: null,
    block: null,
  };
}

function buildIntersectionLocations() {
  const locs = {};
  for (const entry of INTERSECTIONS) {
    const loc = intersectionLoc(entry);
    locs[loc.id] = loc;
  }
  return locs;
}

function getAllIntersections() {
  return INTERSECTIONS;
}

initMapLocationIndex();
