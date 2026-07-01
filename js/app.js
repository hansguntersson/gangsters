import { CONFIG } from './config.js';
import { LOCATIONS } from './data.js';
import {
  initEngine, getState, advanceClock, isPaused, setPaused, saveGame,
} from './engine.js';
import {
  calculateTravelMinutes, checkTraversalShakedown, canPlayerMove,
} from './world.js';
import {
  initUI, renderAll, openLocationPanel, showTravelOverlay,
  showShakedownPanel, isAnyPanelOpen,
} from './ui.js';

let clockInterval = null;
let transitInterval = null;
let transitRemainingMinutes = 0;

function init() {
  initEngine({
    onStateChange: () => renderAll(),
    onLog: () => renderAll(),
  });

  initUI({
    onLocationTap: handleLocationTap,
    onInjured: () => {
      closeAllPanels();
      openLocationPanel('home');
    },
  });

  renderAll();
  startClock();

  const state = getState();
  if (state.player.inTransit && state.player.transitTarget) {
    resumeTransit();
  } else if (state.player.position) {
    centerMapOnPlayer();
  }
}

function startClock() {
  if (clockInterval) clearInterval(clockInterval);

  const msPerMinute = (CONFIG.SECONDS_PER_GAME_HOUR * 1000) / 60;

  clockInterval = setInterval(() => {
    if (isPaused() || isAnyPanelOpen()) return;
    if (getState().player.inTransit) return;

    advanceClock(1);
    renderAll();
  }, msPerMinute);
}

function handleLocationTap(locationId) {
  const state = getState();

  if (!canPlayerMove()) {
    if (state.player.injury.injured) {
      openLocationPanel(state.player.position);
    }
    return;
  }

  if (locationId === state.player.position) {
    openLocationPanel(locationId);
    return;
  }

  startTravel(locationId);
}

function startTravel(targetId, skipShakedownCheck = false) {
  const state = getState();
  const fromId = state.player.position;

  if (!skipShakedownCheck) {
    const shakedownChar = checkTraversalShakedown(fromId, targetId);
    if (shakedownChar) {
      state.pendingShakedown = { characterId: shakedownChar.id, targetId };
      showShakedownPanel(shakedownChar, () => {
        if (!getState().player.injury.injured) {
          startTravel(targetId, true);
        }
      });
      return;
    }
  }

  const travelMinutes = calculateTravelMinutes(fromId, targetId);
  const targetName = LOCATIONS[targetId]?.name || targetId;

  state.player.inTransit = true;
  state.player.transitTarget = targetId;
  transitRemainingMinutes = travelMinutes;

  setPaused(true);
  showTravelOverlay(`Traveling to ${targetName}...`, true);
  renderAll();

  const msPerMinute = (CONFIG.SECONDS_PER_GAME_HOUR * 1000) / 60;

  if (transitInterval) clearInterval(transitInterval);

  transitInterval = setInterval(() => {
    transitRemainingMinutes -= 1;
    advanceClock(1);

    const remaining = Math.max(0, transitRemainingMinutes);
    showTravelOverlay(`Traveling to ${targetName}... (${remaining}m)`, true);

    if (transitRemainingMinutes <= 0) {
      completeTravel(targetId);
    }
  }, msPerMinute);
}

function completeTravel(targetId) {
  if (transitInterval) {
    clearInterval(transitInterval);
    transitInterval = null;
  }

  const state = getState();
  state.player.inTransit = false;
  state.player.transitTarget = null;
  state.player.transitEndTime = null;
  state.player.position = targetId;

  showTravelOverlay('', false);
  setPaused(false);
  saveGame();
  renderAll();
  centerMapOnPlayer();
  openLocationPanel(targetId);
}

function resumeTransit() {
  const state = getState();
  const targetId = state.player.transitTarget;
  if (!targetId) {
    state.player.inTransit = false;
    return;
  }

  const travelMinutes = calculateTravelMinutes(state.player.position, targetId);
  transitRemainingMinutes = travelMinutes;
  startTravel(targetId);
}

function centerMapOnPlayer() {
  const state = getState();
  const loc = LOCATIONS[state.player.position];
  if (!loc) return;

  const container = document.getElementById('map-container');
  const scrollX = Math.max(0, loc.x - container.clientWidth / 2);
  const scrollY = Math.max(0, loc.y - container.clientHeight / 2);
  container.scrollTo({ left: scrollX, top: scrollY, behavior: 'smooth' });
}

function closeAllPanels() {
  document.querySelectorAll('.panel').forEach(p => p.classList.add('hidden'));
  setPaused(false);
}

document.addEventListener('DOMContentLoaded', init);
