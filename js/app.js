let clockInterval = null;
let transitInterval = null;
let transitRemainingMinutes = 0;
let transitFromId = null;
let transitToId = null;
let transitTargetName = '';

function init() {
  initEngine({
    onStateChange: () => renderAll(),
    onLog: () => {
      renderAll();
      if (currentTab === 'log') renderLogTab();
    },
  });

  initUI({
    onLocationTap: handleLocationTap,
    onInjured: () => {
      closeAllPanels();
      openLocationPanel('home');
    },
    onCancelTravel: cancelTravel,
    onResetGame: handleResetGame,
  });

  initMapViewport();
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

  const msPerMinute = getMsPerGameMinute();

  clockInterval = setInterval(() => {
    if (isClockBlocked() || isAnyPanelOpen()) return;
    if (getState().player.inTransit) return;

    advanceClock(getTimeSpeed());
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
  transitTargetName = LOCATIONS[targetId]?.name || targetId;
  transitFromId = fromId;
  transitToId = targetId;

  state.player.inTransit = true;
  state.player.transitTarget = targetId;
  transitRemainingMinutes = travelMinutes;

  showTravelModal(transitTargetName, travelMinutes, travelMinutes, fromId, targetId);
  renderAll();

  const msPerMinute = getMsPerGameMinute();
  if (transitInterval) clearInterval(transitInterval);

  transitInterval = setInterval(() => {
    if (isClockBlocked()) return;

    const speed = getTimeSpeed();
    transitRemainingMinutes -= speed;
    advanceClock(speed);
    updateTravelModal(transitRemainingMinutes);

    if (transitRemainingMinutes <= 0) {
      completeTravel(targetId);
    }
  }, msPerMinute);
}

function cancelTravel() {
  if (transitInterval) {
    clearInterval(transitInterval);
    transitInterval = null;
  }

  const state = getState();
  state.player.inTransit = false;
  state.player.transitTarget = null;
  transitRemainingMinutes = 0;

  hideTravelModal();
  saveGame();
  renderAll();
  addLog('Travel cancelled.');
}

function completeTravel(targetId) {
  if (transitInterval) {
    clearInterval(transitInterval);
    transitInterval = null;
  }

  const state = getState();
  state.player.inTransit = false;
  state.player.transitTarget = null;
  state.player.position = targetId;

  hideTravelModal();
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
  startTravel(targetId, true);
}

function centerMapOnPlayer() {
  const state = getState();
  const loc = LOCATIONS[state.player.position];
  if (!loc) return;
  centerMapOnPoint(loc.x, loc.y, true);
}

function handleResetGame() {
  if (transitInterval) {
    clearInterval(transitInterval);
    transitInterval = null;
  }

  const state = getState();
  state.player.inTransit = false;
  state.player.transitTarget = null;
  transitRemainingMinutes = 0;

  hideTravelModal();
  resetGame();
  closeAllPanels();
  switchTab('map');
  centerMapOnPlayer();
  renderAll();
}

function closeAllPanels() {
  document.querySelectorAll('.modal-sheet, .modal-full').forEach(p => {
    if (p.id !== 'travel-modal') p.classList.add('hidden');
  });
  setInteractionPaused(false);
}

document.addEventListener('DOMContentLoaded', init);
