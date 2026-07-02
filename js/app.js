let clockInterval = null;

function init() {
  initEngine({
    onStateChange: () => renderAll(),
    onLog: () => renderAll(),
  });

  initUI({
    onLocationTap: handleLocationTap,
    onInjured: () => {
      closeAllPanels();
      openLocationPanel('l047');
    },
    onResetGame: handleResetGame,
  });

  initMapViewport();
  renderAll();
  startClock();

  const state = getState();
  if (state.player.position) {
    centerMapOnPlayer();
  }
}

function startClock() {
  if (clockInterval) clearInterval(clockInterval);

  const msPerMinute = getMsPerGameMinute();

  clockInterval = setInterval(() => {
    if (isClockBlocked() || isAnyPanelOpen()) return;
    advanceClock(getTimeSpeed());
    renderAll();
  }, msPerMinute);
}

function handleLocationTap(locationId) {
  openLocationPanel(locationId);
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
  advanceClock(travelMinutes);

  state.player.position = targetId;
  state.player.inTransit = false;
  state.player.transitTarget = null;

  saveGame();
  renderAll();
  centerMapOnPlayer();
  openLocationPanel(targetId);
}

function centerMapOnPlayer() {
  const state = getState();
  const loc = LOCATIONS[state.player.position];
  if (!loc) return;
  centerMapOnPoint(loc.x, loc.y, true);
}

function handleResetGame() {
  resetGame();
  closeAllPanels();
  switchTab('map');
  centerMapOnPlayer();
  renderAll();
}

function closeAllPanels() {
  document.querySelectorAll('.modal-sheet, .modal-full').forEach(p => {
    p.classList.add('hidden');
  });
  setInteractionPaused(false);
}

document.addEventListener('DOMContentLoaded', init);
