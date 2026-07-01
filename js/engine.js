import { CONFIG, SAVE_KEY } from './config.js';
import { createInitialState } from './data.js';

let state = null;
let onStateChange = null;
let onLog = null;

export function initEngine(callbacks = {}) {
  onStateChange = callbacks.onStateChange || (() => {});
  onLog = callbacks.onLog || (() => {});
  const saved = loadGame();
  state = saved || createInitialState();
  return state;
}

export function getState() {
  return state;
}

export function setPaused(paused) {
  state.paused = paused;
  saveGame();
}

export function isPaused() {
  return state.paused || state.player.inTransit;
}

export function addLog(message) {
  state.log.unshift(message);
  if (state.log.length > CONFIG.LOG_MAX_ENTRIES) {
    state.log.length = CONFIG.LOG_MAX_ENTRIES;
  }
  onLog(message);
  saveGame();
}

export function saveGame() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Save failed:', e);
  }
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Load failed:', e);
  }
  return null;
}

export function resetGame() {
  state = createInitialState();
  saveGame();
  onStateChange();
  return state;
}

export function formatClock() {
  const { day, hour, minute } = state.clock;
  const h = String(hour).padStart(2, '0');
  const m = String(minute || 0).padStart(2, '0');
  return `DAY ${day}  ${h}:${m}`;
}

export function isNight(hour = state.clock.hour) {
  return hour >= 20 || hour < 6;
}

export function getTotalHours() {
  return (state.clock.day - 1) * CONFIG.HOURS_PER_DAY + state.clock.hour + (state.clock.minute || 0) / 60;
}

export function advanceClock(minutes) {
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

export function checkJobExpiry() {
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

export function checkExtortionCadence() {
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

export function resolve(baseChance, modifiers = []) {
  let chance = baseChance;
  for (const m of modifiers) {
    chance += m.factor * m.weight;
  }
  chance = Math.max(0.05, Math.min(0.95, chance));
  return Math.random() < chance ? 'success' : 'failure';
}

export function getWeaponBonus() {
  if (!state.player.weapon) return 0;
  const w = state.weapons[state.player.weapon];
  if (!w) return 0;
  return w.combatBonus * 0.1;
}

export function getVehicleBonus() {
  if (!state.player.vehicle) return 0;
  const v = state.vehicles[state.player.vehicle];
  if (!v) return 0;
  return v.travelBonus;
}

export function shiftRelationship(characterId, direction) {
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
      addLog(`Word spreads — ${char.gangAffiliation === 'gang_a' ? 'North Side' : 'South Side'} gang members are hostile.`);
    }
  }

  saveGame();
}

export function modifyCash(amount) {
  state.player.cash = Math.max(0, state.player.cash + amount);
  saveGame();
}

export function applyInjury(hours = CONFIG.BASE_RECOVERY_HOURS) {
  state.player.injury = { injured: true, recoveryHoursRemaining: hours };
  state.player.position = 'home';
  state.player.inTransit = false;
  addLog(`You're injured. Rest at home for ${Math.ceil(hours)} hours.`);
  saveGame();
}

export function getDialogue(character) {
  const rel = character.relationshipToPlayer || 'neutral';
  const lines = character.dialogue?.[rel] || character.dialogue?.neutral || ['...'];
  return lines[Math.floor(Math.random() * lines.length)];
}
