function getCharacterLocation(character, hour) {
  for (const slot of character.schedule) {
    if (LOCATIONS[slot.locationId]?.type === 'home') continue;
    const { fromHour, toHour } = slot;
    if (fromHour < toHour) {
      if (hour >= fromHour && hour < toHour) return slot.locationId;
    } else {
      if (hour >= fromHour || hour < toHour) return slot.locationId;
    }
  }
  return null;
}

function getCharactersAtLocation(locationId) {
  const state = getState();
  const hour = state.clock.hour;
  const present = [];

  for (const char of Object.values(state.characters)) {
    const loc = getCharacterLocation(char, hour);
    if (loc === locationId) {
      present.push(char);
    }
  }

  return present;
}

function distanceBetween(locA, locB) {
  const a = LOCATIONS[locA];
  const b = LOCATIONS[locB];
  if (!a || !b) return 100;
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function calculateTravelMinutes(fromId, toId) {
  const state = getState();
  const dist = distanceBetween(fromId, toId);
  const baseMinutes = Math.max(15, Math.round(dist / 8));
  const vehicleBonus = state.player.vehicle
    ? state.vehicles[state.player.vehicle]?.travelBonus || 0
    : 0;
  return Math.max(5, Math.round(baseMinutes * (1 - vehicleBonus)));
}

function getTurfZones() {
  return TURF_ZONES;
}

function checkTraversalShakedown(fromId, toId) {
  const state = getState();
  const hour = state.clock.hour;

  const pathTurf = new Set();
  const from = LOCATIONS[fromId];
  const to = LOCATIONS[toId];
  if (!from || !to) return null;

  if (from.turf) pathTurf.add(from.turf);
  if (to.turf) pathTurf.add(to.turf);

  for (const turf of pathTurf) {
    const gangMembers = Object.values(state.characters).filter(c => {
      if (c.gangAffiliation !== turf) return false;
      if (c.relationshipToPlayer !== 'grudge') return false;
      const loc = getCharacterLocation(c, hour);
      if (!loc) return false;
      const locData = LOCATIONS[loc];
      return locData?.turf === turf || locData?.type === 'gang';
    });

    if (gangMembers.length > 0) {
      return gangMembers[Math.floor(Math.random() * gangMembers.length)];
    }
  }

  return null;
}

function getLocationTypeClass(type) {
  const map = {
    home: 'type-home',
    gang: 'type-gang',
    neutral: 'type-neutral',
    corner: 'type-corner',
    garage: 'type-garage',
    pharmacy: 'type-pharmacy',
    industrial: 'type-industrial',
    residential: 'type-residential',
  };
  return map[type] || 'type-neutral';
}

function canPlayerMove() {
  const state = getState();
  if (state.player.injury.injured) return false;
  if (state.player.inTransit) return false;
  return true;
}

function isWithinTimeWindow(window, hour) {
  const { fromHour, toHour } = window;
  if (fromHour < toHour) {
    return hour >= fromHour && hour < toHour;
  }
  return hour >= fromHour || hour < toHour;
}

function getJobTimeRemaining(job) {
  if (!job.deadlineHours) return null;
  const remaining = job.deadlineHours - getTotalHours();
  return Math.max(0, Math.ceil(remaining));
}

function getExtortionStatus(agreement) {
  const state = getState();
  const daysSince = state.clock.day - agreement.lastCollectedDay;
  const due = daysSince >= CONFIG.EXTORTION_CADENCE_DAYS;
  return { daysSince, due, overdue: daysSince > CONFIG.EXTORTION_CADENCE_DAYS };
}

function getNextCollectionDay(agreement) {
  return agreement.lastCollectedDay + CONFIG.EXTORTION_CADENCE_DAYS;
}

function getTravelModeLabel() {
  const state = getState();
  if (state.player.vehicle) {
    return state.vehicles[state.player.vehicle]?.name || 'Vehicle';
  }
  return 'On Foot';
}

function getTravelRiskWarning(fromId, toId) {
  const state = getState();
  const from = LOCATIONS[fromId];
  const to = LOCATIONS[toId];
  if (!from || !to) return null;

  const turfs = new Set();
  if (from.turf) turfs.add(from.turf);
  if (to.turf) turfs.add(to.turf);

  for (const turf of turfs) {
    const hostile = Object.values(state.characters).some(c =>
      c.gangAffiliation === turf && c.relationshipToPlayer === 'grudge'
    );
    if (hostile) {
      const name = getGangName(turf);
      return `You're entering ${name} turf. Risk of shakedown.`;
    }
  }
  return null;
}
