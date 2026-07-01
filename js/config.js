export const CONFIG = {
  SECONDS_PER_GAME_HOUR: 10,
  HOURS_PER_DAY: 24,
  BASE_RECOVERY_HOURS: 48,
  MEDICINE_COST: 15,
  MEDICINE_RECOVERY_HOURS: 24,
  EXTORTION_CADENCE_DAYS: 7,
  LOG_MAX_ENTRIES: 50,
  LOG_DISPLAY_COUNT: 3,
  STARTING_CASH: 25,
  SHAKEDOWN_PAY_MIN: 5,
  SHAKEDOWN_PAY_MAX: 20,
  MUG_CASH_MIN: 8,
  MUG_CASH_MAX: 35,
  EXTORTION_WEEKLY_MIN: 15,
  EXTORTION_WEEKLY_MAX: 40,
};

export const WEAPONS = {
  cosh: { id: 'cosh', name: 'Cosh', tier: 1, cost: 10, combatBonus: 1, heatOnUse: 1 },
  knife: { id: 'knife', name: 'Knife', tier: 2, cost: 30, combatBonus: 2, heatOnUse: 1 },
  pistol: { id: 'pistol', name: 'Pistol', tier: 3, cost: 75, combatBonus: 3, heatOnUse: 2 },
};

export const VEHICLES = {
  bicycle: { id: 'bicycle', name: 'Bicycle', cost: 15, travelBonus: 0.2, cargoCapacity: 0 },
  motorcycle: { id: 'motorcycle', name: 'Motorcycle', cost: 50, travelBonus: 0.4, cargoCapacity: 0 },
  truck: { id: 'truck', name: 'Truck', cost: 120, travelBonus: 0.3, cargoCapacity: 1 },
};

export const LOCATION_TYPES = {
  home: 'home',
  gang_hq: 'gang',
  neutral: 'neutral',
  corner: 'corner',
  garage: 'garage',
  pharmacy: 'pharmacy',
  industrial: 'industrial',
  residential: 'residential',
};

export const RELATIONSHIP = {
  NEUTRAL: 'neutral',
  FRIENDLY: 'friendly',
  GRUDGE: 'grudge',
};

export const JOB_TYPE = {
  HIJACK: 'hijack',
  DELIVERY: 'delivery',
};

export const SAVE_KEY = 'gangster-sim-save';
