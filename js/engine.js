let state = null;
let onStateChange = null;
let onLog = null;

function initEngine(callbacks = {}) {
  onStateChange = callbacks.onStateChange || (() => {});
  onLog = callbacks.onLog || (() => {});
  const saved = loadGame();
  state = saved || createInitialState();
  migrateSaveState();
  initNpcLocationState();
  return state;
}

function migrateSaveState() {
  if (state.timeSpeed === undefined) {
    state.timeSpeed = state.paused ? 0 : CONFIG.DEFAULT_TIME_SPEED;
    delete state.paused;
  }
  if (state.interactionPaused === undefined) {
    state.interactionPaused = false;
  }
  if (!state.knownCharacters) {
    state.knownCharacters = [];
  }
  if (!state.crew) {
    state.crew = [];
  }
  if (!state.knownLocations) {
    state.knownLocations = getInitialKnownLocations();
  }
  if (!state.heardRumorsFrom) {
    state.heardRumorsFrom = [];
  }
  if (!state.npcSightingLogs) {
    state.npcSightingLogs = {};
  }
  state.knownLocations = state.knownLocations.filter(id => LOCATIONS[id]?.type !== 'intersection');
  for (const c of Object.values(state.characters)) {
    syncNpcLocationData(c);
  }
  for (const [id, c] of Object.entries(state.characters)) {
    c.portrait = migratePortraitRef(c.portrait, id);
  }
  const weaponIdMigration = { cosh: 'brass_knuckles', knife: 'switchblade', pistol: 'revolver' };
  if (state.player.weapon && weaponIdMigration[state.player.weapon]) {
    state.player.weapon = weaponIdMigration[state.player.weapon];
  }
  state.weapons = { ...WEAPONS };

  const gangMigration = { gang_a: 'riverside_syndicate', gang_b: 'longshoremen' };
  const jobIdMigration = { delivery_a1: 'delivery_longshore', delivery_b1: 'delivery_factory' };

  if (state.player.position) {
    state.player.position = migrateLocationId(state.player.position);
  }
  if (state.player.transitTarget) {
    state.player.transitTarget = migrateLocationId(state.player.transitTarget);
  }
  if (state.player.inTransit && state.player.transitTarget) {
    state.player.position = state.player.transitTarget;
    state.player.inTransit = false;
    state.player.transitTarget = null;
  }

  for (const c of Object.values(state.characters)) {
    if (gangMigration[c.gangAffiliation]) {
      c.gangAffiliation = gangMigration[c.gangAffiliation];
    }
    if (CHARACTERS[c.id]?.gangAffiliation) {
      c.gangAffiliation = CHARACTERS[c.id].gangAffiliation;
    }
  }

  if (state.gangGrudgeCount) {
    const migrated = {
      longshoremen: (state.gangGrudgeCount.longshoremen || 0) + (state.gangGrudgeCount.gang_b || 0),
      factory_boys: state.gangGrudgeCount.factory_boys || 0,
      oakwood_crew: state.gangGrudgeCount.oakwood_crew || 0,
      riverside_syndicate: (state.gangGrudgeCount.riverside_syndicate || 0) + (state.gangGrudgeCount.gang_a || 0),
    };
    state.gangGrudgeCount = migrated;
  }

  for (const job of state.acceptedJobs || []) {
    if (jobIdMigration[job.id]) job.id = jobIdMigration[job.id];
    job.pickupLocation = migrateLocationId(job.pickupLocation);
    job.dropoffLocation = migrateLocationId(job.dropoffLocation);
    job.targetLocation = migrateLocationId(job.targetLocation);
  }

  for (const agreement of state.extortionAgreements || []) {
    agreement.businessId = migrateLocationId(agreement.businessId);
  }

  state.locations = { ...LOCATIONS };
}

function getState() {
  return state;
}

function setTimeSpeed(speed) {
  const clamped = Math.max(0, Math.min(3, speed));
  state.timeSpeed = clamped;
  saveGame();
  onStateChange();
}

function getTimeSpeed() {
  return state.timeSpeed ?? CONFIG.DEFAULT_TIME_SPEED;
}

function setInteractionPaused(paused) {
  state.interactionPaused = paused;
}

function isInteractionPaused() {
  return !!state.interactionPaused;
}

function isClockBlocked() {
  return getTimeSpeed() === 0 || isInteractionPaused();
}

function getMsPerGameMinute() {
  return (CONFIG.SECONDS_PER_GAME_HOUR * 1000) / 60;
}

function addLog(message) {
  state.log.unshift(message);
  if (state.log.length > CONFIG.LOG_MAX_ENTRIES) {
    state.log.length = CONFIG.LOG_MAX_ENTRIES;
  }
  onLog(message);
  saveGame();
}

function saveGame() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Save failed:', e);
  }
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Load failed:', e);
  }
  return null;
}

function resetGame() {
  state = createInitialState();
  initNpcLocationState();
  saveGame();
  onStateChange();
  return state;
}

function formatClock() {
  const { day, hour, minute } = state.clock;
  const h = String(hour).padStart(2, '0');
  const m = String(minute || 0).padStart(2, '0');
  return `DAY ${day}  ${h}:${m}`;
}

function formatDay() {
  return `DAY ${state.clock.day}`;
}

function formatTime() {
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const weekday = days[(state.clock.day - 1) % 7];
  const { hour, minute } = state.clock;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h = hour % 12 || 12;
  const m = String(minute || 0).padStart(2, '0');
  return `${weekday} ${h}:${m} ${ampm}`;
}

function markCharacterKnown(characterId) {
  if (!state.knownCharacters.includes(characterId)) {
    state.knownCharacters.push(characterId);
    saveGame();
  }
}

function isCharacterKnown(characterId) {
  return (state.knownCharacters || []).includes(characterId);
}

function isLocationKnown(locationId) {
  if (!locationId) return false;
  const loc = LOCATIONS[locationId];
  if (loc?.type === 'intersection') return true;
  return (state.knownLocations || []).includes(locationId);
}

function markLocationKnown(locationId) {
  if (!locationId || !LOCATIONS[locationId]) return;
  if (LOCATIONS[locationId].type === 'intersection') return;
  if (!state.knownLocations) state.knownLocations = [];
  if (!state.knownLocations.includes(locationId)) {
    state.knownLocations.push(locationId);
    saveGame();
  }
}

function shareWordOfMouth(characterId) {
  if (!state.heardRumorsFrom) state.heardRumorsFrom = [];
  if (state.heardRumorsFrom.includes(characterId)) return [];

  const template = CHARACTERS[characterId];
  const locationIds = template?.revealsLocations || [];
  const newTips = [];

  for (const id of locationIds) {
    if (!LOCATIONS[id] || isLocationKnown(id)) continue;
    markLocationKnown(id);
    newTips.push(LOCATIONS[id].name);
  }

  if (locationIds.length > 0) {
    state.heardRumorsFrom.push(characterId);
    saveGame();
  }

  return newTips;
}

function isNight(hour = state.clock.hour) {
  return hour >= 20 || hour < 6;
}

function getTotalHours() {
  return (state.clock.day - 1) * CONFIG.HOURS_PER_DAY + state.clock.hour + (state.clock.minute || 0) / 60;
}

function advanceClock(minutes) {
  const prevDay = state.clock.day;
  let { day, hour, minute } = state.clock;
  minute += minutes;

  while (minute >= 60) {
    minute -= 60;
    hour += 1;
    if (hour >= CONFIG.HOURS_PER_DAY) {
      hour = 0;
      day += 1;
    }
  }

  state.clock = { day, hour, minute };

  if (state.clock.day > prevDay) {
    rollAllNpcLocations();
  }

  if (state.player.injury.injured && state.player.injury.recoveryHoursRemaining > 0) {
    const hoursPassed = minutes / 60;
    state.player.injury.recoveryHoursRemaining = Math.max(
      0,
      state.player.injury.recoveryHoursRemaining - hoursPassed
    );
    if (state.player.injury.recoveryHoursRemaining <= 0) {
      state.player.injury.injured = false;
      addLog('You\'ve recovered from your injuries.');
    }
  }

  checkJobExpiry();
  checkExtortionCadence();
  onStateChange();
}

function checkJobExpiry() {
  const now = getTotalHours();
  state.acceptedJobs = state.acceptedJobs.filter(job => {
    if (job.deadlineHours && now > job.deadlineHours) {
      addLog(`Job expired: ${job.description}`);
      if (job.issuedBy) {
        shiftRelationship(job.issuedBy, -1);
      }
      return false;
    }
    return true;
  });
}

function checkExtortionCadence() {
  const { day } = state.clock;
  const toRemove = [];

  for (const agreement of state.extortionAgreements) {
    const daysSince = day - agreement.lastCollectedDay;
    if (daysSince > CONFIG.EXTORTION_CADENCE_DAYS + 2 && !agreement.warned) {
      agreement.warned = true;
      const loc = state.locations[agreement.businessId];
      addLog(`You missed collection at ${loc?.name || agreement.businessId}. The owner is getting bold.`);
    }
    if (daysSince > CONFIG.EXTORTION_CADENCE_DAYS + 5) {
      toRemove.push(agreement);
    }
  }

  for (const agreement of toRemove) {
    addLog(`Extortion agreement at ${state.locations[agreement.businessId]?.name} fell apart.`);
    if (agreement.ownerId) shiftRelationship(agreement.ownerId, -1);
  }
  state.extortionAgreements = state.extortionAgreements.filter(a => !toRemove.includes(a));
}

function resolve(baseChance, modifiers = []) {
  let chance = baseChance;
  for (const m of modifiers) {
    chance += m.factor * m.weight;
  }
  chance = Math.max(0.05, Math.min(0.95, chance));
  return Math.random() < chance ? 'success' : 'failure';
}

function getWeaponBonus() {
  if (!state.player.weapon) return 0;
  const w = state.weapons[state.player.weapon];
  if (!w) return 0;
  return w.combatBonus * 0.1;
}

function getVehicleBonus() {
  if (!state.player.vehicle) return 0;
  const v = state.vehicles[state.player.vehicle];
  if (!v) return 0;
  return v.travelBonus;
}

function shiftRelationship(characterId, direction) {
  const char = state.characters[characterId];
  if (!char) return;

  const levels = ['grudge', 'neutral', 'friendly'];
  let idx = levels.indexOf(char.relationshipToPlayer);

  if (direction > 0 && idx < levels.length - 1) idx += 1;
  if (direction < 0 && idx > 0) idx -= 1;

  char.relationshipToPlayer = levels[idx];

  if (char.gangAffiliation && direction < 0) {
    state.gangGrudgeCount[char.gangAffiliation] =
      (state.gangGrudgeCount[char.gangAffiliation] || 0) + 1;

    if (state.gangGrudgeCount[char.gangAffiliation] >= 2) {
      for (const c of Object.values(state.characters)) {
        if (c.gangAffiliation === char.gangAffiliation && c.relationshipToPlayer === 'neutral') {
          c.relationshipToPlayer = 'grudge';
        }
      }
      addLog(`Word spreads — ${getGangName(char.gangAffiliation)} members are hostile.`);
    }
  }

  saveGame();
}

function modifyCash(amount) {
  state.player.cash = Math.max(0, state.player.cash + amount);
  saveGame();
}

function applyInjury(hours = CONFIG.BASE_RECOVERY_HOURS) {
  state.player.injury = { injured: true, recoveryHoursRemaining: hours };
  state.player.position = 'l047';
  markLocationKnown('l047');
  state.player.inTransit = false;
  addLog(`You're injured. Rest at home for ${Math.ceil(hours)} hours.`);
  saveGame();
}

function getDialogue(character) {
  const rel = character.relationshipToPlayer || 'neutral';
  const lines = character.dialogue?.[rel] || character.dialogue?.neutral || ['...'];
  return lines[Math.floor(Math.random() * lines.length)];
}
