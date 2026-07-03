function getTypicalLocationIds(npc) {
  const table = npc.locationTable;
  if (!table?.fixed?.length) return [];
  return table.fixed.map(entry => entry.locationId);
}

function buildSeededSightingLog(locationIds) {
  const entries = [];
  for (const locationId of locationIds) {
    for (let i = 0; i < 3; i++) {
      entries.push({ locationId, day: 0 });
    }
  }
  return { entries };
}

function seedStartingContactSightings() {
  const state = getState();
  if (!state.npcSightingLogs) state.npcSightingLogs = {};

  for (const npcId of getInitialKnownCharacters()) {
    if (!isCharacterKnown(npcId)) continue;

    const npc = state.characters[npcId];
    if (!npc) continue;

    const typical = getTypicalLocationIds(npc);
    if (typical.length === 0) continue;

    const log = state.npcSightingLogs[npcId] ?? { entries: [] };
    let changed = !state.npcSightingLogs[npcId];

    for (const locationId of typical) {
      const count = log.entries.filter(entry => entry.locationId === locationId).length;
      for (let i = count; i < 3; i++) {
        log.entries.push({ locationId, day: 0 });
        changed = true;
      }
    }

    if (changed) state.npcSightingLogs[npcId] = log;
  }
}

function getInitialNpcSightingLogs(characters, knownCharacterIds) {
  const logs = {};
  for (const npcId of knownCharacterIds) {
    const npc = characters[npcId];
    if (!npc) continue;
    const typical = getTypicalLocationIds(npc);
    if (typical.length === 0) continue;
    logs[npcId] = buildSeededSightingLog(typical);
  }
  return logs;
}

function pickRandom(ids) {
  if (!ids.length) return null;
  return ids[Math.floor(Math.random() * ids.length)];
}

function getNeutralLocations() {
  return Object.values(LOCATIONS)
    .filter(loc => loc.type !== 'intersection' && !loc.turf)
    .map(loc => loc.id);
}

function getLocationsInTurf(turfId) {
  if (!turfId) return [];
  return Object.values(LOCATIONS)
    .filter(loc => loc.type !== 'intersection' && loc.turf === turfId)
    .map(loc => loc.id);
}

function resolveRandomLocation(npc, poolTag) {
  switch (poolTag) {
    case 'neutral_and_home_turf': {
      const pool = [
        ...getNeutralLocations(),
        ...getLocationsInTurf(npc.homeTurfId || npc.gangAffiliation),
      ];
      const unique = [...new Set(pool)];
      return pickRandom(unique) || pickRandom(getNeutralLocations());
    }
    default:
      return pickRandom(getNeutralLocations());
  }
}

function resolveDailyLocation(npc) {
  const table = npc.locationTable;
  if (!table || !table.fixed?.length) return null;

  const roll = Math.random();
  const totalWeight = table.fixed.reduce((sum, entry) => sum + entry.weight, 0) + (table.randomWeight || 0);
  if (totalWeight <= 0) return table.fixed[0].locationId;

  let cumulative = 0;
  for (const entry of table.fixed) {
    cumulative += entry.weight / totalWeight;
    if (roll <= cumulative) {
      return entry.locationId;
    }
  }

  return resolveRandomLocation(npc, table.randomPool || 'neutral_and_home_turf');
}

function rollAllNpcLocations() {
  const state = getState();
  for (const char of Object.values(state.characters)) {
    if (char.locationTable) {
      char.currentLocation = resolveDailyLocation(char);
    }
  }
  saveGame();
}

function logSighting(npcId, locationId, gameDay) {
  const state = getState();
  if (!state.npcSightingLogs) state.npcSightingLogs = {};

  const log = state.npcSightingLogs[npcId] ?? { entries: [] };
  const last = log.entries[log.entries.length - 1];
  if (last && last.locationId === locationId && last.day === gameDay) return;

  log.entries.push({ locationId, day: gameDay });
  state.npcSightingLogs[npcId] = log;
}

function getLastSeen(npcId) {
  const log = getState().npcSightingLogs?.[npcId];
  if (!log || log.entries.length === 0) return null;
  const observed = log.entries.filter(entry => entry.day > 0);
  if (observed.length === 0) return null;
  const latest = observed[observed.length - 1];
  return LOCATIONS[latest.locationId]?.name || latest.locationId;
}

function getSightingCountAt(npcId, locationId) {
  const log = getState().npcSightingLogs?.[npcId];
  if (!log) return 0;
  return log.entries.filter(entry => entry.locationId === locationId).length;
}

function isUsuallyFoundAt(npcId, locationId) {
  return getSightingCountAt(npcId, locationId) >= 3;
}

function getUsuallyFoundLocationIds(npcId) {
  const log = getState().npcSightingLogs?.[npcId];
  if (!log) return [];

  const counts = {};
  for (const entry of log.entries) {
    counts[entry.locationId] = (counts[entry.locationId] ?? 0) + 1;
  }

  return Object.entries(counts)
    .filter(([, count]) => count >= 3)
    .map(([locationId]) => locationId);
}

function getUsuallyFound(npcId) {
  return getUsuallyFoundLocationIds(npcId)
    .map(locationId => LOCATIONS[locationId]?.name || locationId);
}

function getKnownCharactersUsuallyAtLocation(locationId) {
  const state = getState();
  return state.knownCharacters
    .map(id => state.characters[id])
    .filter(char => char && isUsuallyFoundAt(char.id, locationId));
}

function observeNpcSightingsAtLocation(locationId) {
  const state = getState();
  const day = state.clock.day;
  let changed = false;

  for (const char of getCharactersAtLocation(locationId)) {
    const before = state.npcSightingLogs?.[char.id]?.entries?.length || 0;
    logSighting(char.id, locationId, day);
    const after = state.npcSightingLogs?.[char.id]?.entries?.length || 0;
    if (after > before) changed = true;
  }

  if (changed) saveGame();
}

function syncNpcLocationData(char) {
  const template = CHARACTERS[char.id];
  if (!template) return;
  if (template.locationTable) char.locationTable = template.locationTable;
  if (template.homeTurfId !== undefined) char.homeTurfId = template.homeTurfId;
  if (template.role) char.role = template.role;
}

function initNpcLocationState() {
  const state = getState();
  if (!state.npcSightingLogs) state.npcSightingLogs = {};

  for (const char of Object.values(state.characters)) {
    syncNpcLocationData(char);
    if (char.locationTable && !char.currentLocation) {
      char.currentLocation = resolveDailyLocation(char);
    }
  }

  seedStartingContactSightings();
}

function formatNpcSightingHTML(npcId) {
  if (!isCharacterKnown(npcId)) return '';

  const lastSeen = getLastSeen(npcId);
  const usuallyFound = getUsuallyFound(npcId);
  if (!lastSeen && usuallyFound.length === 0) return '';

  let html = '';
  if (lastSeen) {
    html += `<div class="list-row-sub">Last seen: ${lastSeen}</div>`;
  }
  if (usuallyFound.length > 0) {
    html += `<div class="list-row-sub">Usually found: ${usuallyFound.join(', ')}</div>`;
  }
  return html;
}
