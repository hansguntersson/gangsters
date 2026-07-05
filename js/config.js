var CONFIG = {
  SECONDS_PER_GAME_HOUR: 10,
  HOURS_PER_DAY: 24,
  BASE_RECOVERY_HOURS: 48,
  MEDICINE_COST: 15,
  MEDICINE_RECOVERY_HOURS: 24,
  EXTORTION_CADENCE_DAYS: 7,
  LOG_MAX_ENTRIES: 50,
  LOG_DISPLAY_COUNT: 3,
  TIME_SPEEDS: [0, 1, 2, 3],
  DEFAULT_TIME_SPEED: 1,
  MAP_BACKGROUND: 'images/map-background.png',
  MAP_WIDTH: 1024,
  MAP_HEIGHT: 1536,
  MAP_MIN_ZOOM: 0.45,
  MAP_MAX_ZOOM: 2.5,
  MAP_DEFAULT_ZOOM: 0.85,
  MAP_START_ZOOM_FACTOR: 0.85,
  MAP_REFERENCE_BLOCK_ID: 'B3',
  LOCATION_ICON_SHEET: 'images/location-icons.PNG',
  LOCATION_ICON_COLS: 4,
  LOCATION_ICON_ROWS: 2,
  LOCATION_ICON_SHEET_W: 1424,
  LOCATION_ICON_SHEET_H: 706,
  LOCATION_ICON_CELL_W: 356,
  LOCATION_ICON_CELL_H: 353,
  WEAPON_ICON_SHEET: 'images/weapons.PNG',
  WEAPON_ICON_COLS: 3,
  WEAPON_ICON_ROWS: 3,
  WEAPON_ICON_SHEET_W: 1254,
  WEAPON_ICON_SHEET_H: 1254,
  SHAKEDOWN_PAY_MIN: 5,
  SHAKEDOWN_PAY_MAX: 20,
  MUG_CASH_MIN: 8,
  MUG_CASH_MAX: 35,
  MUG_COOLDOWN_HOURS: 18,
  EXTORTION_WEEKLY_MIN: 15,
  EXTORTION_WEEKLY_MAX: 40,
};

var WEAPONS = {
  brass_knuckles: { id: 'brass_knuckles', name: 'Brass Knuckles', iconIndex: 0, tier: 1, cost: 10, combatBonus: 1, heatOnUse: 1 },
  chain: { id: 'chain', name: 'Chain', iconIndex: 1, tier: 1, cost: 15, combatBonus: 1, heatOnUse: 1 },
  blackjack: { id: 'blackjack', name: 'Blackjack', iconIndex: 2, tier: 1, cost: 18, combatBonus: 2, heatOnUse: 1 },
  baseball_bat: { id: 'baseball_bat', name: 'Baseball Bat', iconIndex: 3, tier: 2, cost: 25, combatBonus: 2, heatOnUse: 1 },
  box_cutter: { id: 'box_cutter', name: 'Box Cutter', iconIndex: 4, tier: 2, cost: 28, combatBonus: 2, heatOnUse: 1 },
  lead_pipe: { id: 'lead_pipe', name: 'Lead Pipe', iconIndex: 5, tier: 2, cost: 30, combatBonus: 2, heatOnUse: 1 },
  switchblade: { id: 'switchblade', name: 'Switchblade', iconIndex: 6, tier: 2, cost: 35, combatBonus: 2, heatOnUse: 1 },
  straight_razor: { id: 'straight_razor', name: 'Straight Razor', iconIndex: 7, tier: 2, cost: 38, combatBonus: 2, heatOnUse: 1 },
  revolver: { id: 'revolver', name: 'Revolver', iconIndex: 8, tier: 3, cost: 75, combatBonus: 3, heatOnUse: 2 },
};

var VEHICLES = {
  bicycle: { id: 'bicycle', name: 'Bicycle', cost: 15, travelBonus: 0.2, cargoCapacity: 0 },
  motorcycle: { id: 'motorcycle', name: 'Motorcycle', cost: 50, travelBonus: 0.4, cargoCapacity: 0 },
  truck: { id: 'truck', name: 'Truck', cost: 120, travelBonus: 0.3, cargoCapacity: 1 },
};

var LOCATION_TYPES = {
  home: 'home',
  gang_hq: 'gang',
  neutral: 'neutral',
  corner: 'corner',
  garage: 'garage',
  pharmacy: 'pharmacy',
  industrial: 'industrial',
  residential: 'residential',
};

var RELATIONSHIP = {
  NEUTRAL: 'neutral',
  FRIENDLY: 'friendly',
  GRUDGE: 'grudge',
};

var JOB_TYPE = {
  HIJACK: 'hijack',
  DELIVERY: 'delivery',
};

var SAVE_KEY = 'gangster-sim-save';
