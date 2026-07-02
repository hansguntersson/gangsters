function canMugTarget(character) {
  if (character.type !== 'civilian' && character.type !== 'hustler') return false;
  if (character.isBusinessOwner) return false;
  if (character.sellsWeapons || character.sellsVehicles) return false;
  if (character.relationshipToPlayer === 'grudge') return false;
  const cooldown = CONFIG.MUG_COOLDOWN_HOURS || 18;
  if (character.lastMuggedAtHours !== undefined &&
      getTotalHours() - character.lastMuggedAtHours < cooldown) return false;
  return true;
}

function performMugging(targetId) {
  const state = getState();
  const target = state.characters[targetId];
  if (!target) return { success: false, message: 'Target not found.' };
  if (!canMugTarget(target)) {
    return { success: false, message: `Too risky — word's out about you. Give it time.` };
  }

  target.lastMuggedAtHours = getTotalHours();

  const modifiers = [];
  modifiers.push({ factor: getWeaponBonus(), weight: 1 });

  if (state.player.injury.injured) {
    modifiers.push({ factor: -0.3, weight: 1 });
  }

  const brawny = target.traits?.brainy_brawny || 0;
  if (brawny > 0) modifiers.push({ factor: -0.15 * brawny, weight: 1 });
  if (brawny < 0) modifiers.push({ factor: 0.05, weight: 1 });

  if (target.relationshipToPlayer === 'friendly') {
    modifiers.push({ factor: 0.1, weight: 1 });
  } else if (target.relationshipToPlayer === 'grudge') {
    modifiers.push({ factor: -0.1, weight: 1 });
  }

  const baseChance = state.player.weapon ? 0.65 : 0.4;
  const outcome = resolve(baseChance, modifiers);

  const witnesses = getCharactersAtLocation(state.player.position)
    .filter(c => c.id !== targetId && c.type === 'gang_member');

  if (outcome === 'success') {
    const amount = CONFIG.MUG_CASH_MIN +
      Math.floor(Math.random() * (CONFIG.MUG_CASH_MAX - CONFIG.MUG_CASH_MIN));
    modifyCash(amount);
    shiftRelationship(targetId, -1);
    addLog(`You took $${amount} from ${target.name}.`);

    const discreet = target.traits?.social_discreet || 0;
    const noticeChance = 0.7 - discreet * 0.1;
    for (const w of witnesses) {
      if (Math.random() < noticeChance) {
        shiftRelationship(w.id, -1);
        addLog(`${w.name} saw what you did.`);
      }
    }

    return { success: true, message: `You took $${amount}.`, amount };
  }

  const injuryChance = resolve(0.5, [
    { factor: getWeaponBonus(), weight: 1 },
    { factor: brawny > 0 ? -0.2 : 0, weight: 1 },
  ]);

  if (injuryChance === 'failure') {
    applyInjury(CONFIG.BASE_RECOVERY_HOURS / 2);
    return { success: false, message: `${target.name} fought back. You're hurt.`, injured: true };
  }

  shiftRelationship(targetId, -1);
  const discreet = target.traits?.social_discreet || 0;
  const noticeChance = 0.7 - discreet * 0.1;
  for (const w of witnesses) {
    if (Math.random() < noticeChance) {
      shiftRelationship(w.id, -1);
    }
  }
  addLog(`Failed to mug ${target.name}.`);
  return { success: false, message: `${target.name} got away.` };
}

function initiateExtortion(ownerId) {
  const state = getState();
  const owner = state.characters[ownerId];
  if (!owner?.isBusinessOwner) return null;

  const locationId = state.player.position;
  const existing = state.extortionAgreements.find(a => a.businessId === locationId);
  if (existing) {
    return { type: 'already', message: 'You already have an agreement here.' };
  }

  let acceptChance = 0.35;
  if (state.player.weapon) acceptChance += 0.25;
  if (owner.relationshipToPlayer === 'friendly') acceptChance += 0.2;
  if (owner.relationshipToPlayer === 'grudge') acceptChance -= 0.2;
  acceptChance += (owner.traits?.intimidating_diplomatic || 0) * 0.08;

  const outcome = resolve(acceptChance, []);

  if (outcome === 'success') {
    const weeklyAmount = CONFIG.EXTORTION_WEEKLY_MIN +
      Math.floor(Math.random() * (CONFIG.EXTORTION_WEEKLY_MAX - CONFIG.EXTORTION_WEEKLY_MIN));

    state.extortionAgreements.push({
      businessId: locationId,
      ownerId,
      weeklyAmount,
      lastCollectedDay: state.clock.day,
      establishedDay: state.clock.day,
    });

    addLog(`${owner.name} agreed to pay protection. $${weeklyAmount}/week.`);
    saveGame();
    return { type: 'accepted', message: `${owner.name} reluctantly agrees. $${weeklyAmount} per week.`, amount: weeklyAmount };
  }

  return { type: 'refused', message: `${owner.name} refuses. You can escalate or back down.`, ownerId };
}

function escalateExtortion(ownerId) {
  const state = getState();
  const owner = state.characters[ownerId];
  const modifiers = [{ factor: getWeaponBonus(), weight: 1 }];
  const outcome = resolve(0.55, modifiers);

  if (outcome === 'success') {
    const weeklyAmount = CONFIG.EXTORTION_WEEKLY_MIN +
      Math.floor(Math.random() * (CONFIG.EXTORTION_WEEKLY_MAX - CONFIG.EXTORTION_WEEKLY_MIN));
    const locationId = state.player.position;

    state.extortionAgreements.push({
      businessId: locationId,
      ownerId,
      weeklyAmount,
      lastCollectedDay: state.clock.day,
      establishedDay: state.clock.day,
    });

    shiftRelationship(ownerId, -1);
    addLog(`You forced ${owner.name} into paying $${weeklyAmount}/week.`);
    saveGame();
    return { success: true, message: `${owner.name} gives in under pressure.` };
  }

  const fightOutcome = resolve(0.45, [{ factor: getWeaponBonus(), weight: 1 }]);
  if (fightOutcome === 'failure') {
    applyInjury();
    shiftRelationship(ownerId, -1);
    return { success: false, message: `${owner.name}'s people got the better of you.`, injured: true };
  }

  shiftRelationship(ownerId, -1);
  addLog(`Extortion fight at ${LOCATIONS[state.player.position]?.name} — inconclusive.`);
  return { success: false, message: 'You backed off before it got worse.' };
}

function collectExtortion(businessId) {
  const state = getState();
  const agreement = state.extortionAgreements.find(a => a.businessId === businessId);
  if (!agreement) return { success: false, message: 'No agreement here.' };

  const daysSince = state.clock.day - agreement.lastCollectedDay;
  if (daysSince < CONFIG.EXTORTION_CADENCE_DAYS) {
    return {
      success: false,
      message: `Not due yet. Come back on day ${agreement.lastCollectedDay + CONFIG.EXTORTION_CADENCE_DAYS}.`,
    };
  }

  modifyCash(agreement.weeklyAmount);
  agreement.lastCollectedDay = state.clock.day;
  agreement.warned = false;
  const owner = state.characters[agreement.ownerId];
  addLog(`Collected $${agreement.weeklyAmount} from ${owner?.name || 'the owner'}.`);
  saveGame();
  return { success: true, message: `Collected $${agreement.weeklyAmount}.`, amount: agreement.weeklyAmount };
}

function acceptJob(templateId, issuedBy) {
  const state = getState();
  const template = JOB_TEMPLATES[templateId];
  if (!template) return null;

  const job = {
    ...template,
    instanceId: `job_${Date.now()}`,
    issuedBy,
    status: 'active',
    acceptedAtHours: getTotalHours(),
    deadlineHours: null,
    phase: template.type === 'delivery' ? 'pickup' : 'execute',
  };

  if (template.type === 'delivery') {
    job.deadlineHours = getTotalHours() + template.timeLimitHours;
  }

  state.acceptedJobs.push(job);

  if (template.pickupLocation) markLocationKnown(template.pickupLocation);
  if (template.dropoffLocation) markLocationKnown(template.dropoffLocation);
  if (template.targetLocation) markLocationKnown(template.targetLocation);

  addLog(`Accepted: ${template.description}`);
  saveGame();
  return job;
}

function executeHijackJob(job) {
  const state = getState();
  const hour = state.clock.hour;

  if (state.player.position !== job.targetLocation) {
    return { success: false, message: `You need to be at ${LOCATIONS[job.targetLocation]?.name}.` };
  }

  if (!isWithinTimeWindow(job.timeWindow, hour)) {
    return { success: false, message: 'Wrong time — the target isn\'t here.' };
  }

  if (job.vehicleRequired && !state.player.vehicle) {
    return { success: false, message: 'This job requires a vehicle.' };
  }

  const riskMod = { low: 0.1, medium: 0, high: -0.15 }[job.risk] || 0;
  const modifiers = [
    { factor: getWeaponBonus(), weight: 1 },
    { factor: riskMod, weight: 1 },
  ];
  if (state.player.vehicle) modifiers.push({ factor: 0.1, weight: 1 });

  const outcome = resolve(job.baseChance, modifiers);

  if (outcome === 'success') {
    modifyCash(job.reward);
    if (job.issuedBy) shiftRelationship(job.issuedBy, 1);
    state.acceptedJobs = state.acceptedJobs.filter(j => j.instanceId !== job.instanceId);
    addLog(`Hijack successful. Earned $${job.reward}.`);
    saveGame();
    return { success: true, message: `Clean job. $${job.reward} in your pocket.`, amount: job.reward };
  }

  const injuryRoll = resolve(0.4, [{ factor: -getWeaponBonus(), weight: 1 }]);
  if (injuryRoll === 'failure') {
    applyInjury();
    if (job.issuedBy) shiftRelationship(job.issuedBy, -1);
    state.acceptedJobs = state.acceptedJobs.filter(j => j.instanceId !== job.instanceId);
    return { success: false, message: 'The job went bad. You\'re hurt.', injured: true };
  }

  if (job.issuedBy) shiftRelationship(job.issuedBy, -1);
  state.acceptedJobs = state.acceptedJobs.filter(j => j.instanceId !== job.instanceId);
  addLog('Hijack failed.');
  saveGame();
  return { success: false, message: 'You had to bail. No payday.' };
}

function executeDeliveryJob(job) {
  const state = getState();

  if (job.vehicleRequired && !state.player.vehicle) {
    return { success: false, message: 'This delivery requires a vehicle.' };
  }

  if (job.phase === 'pickup') {
    if (state.player.position !== job.pickupLocation) {
      return { success: false, message: `Pick up at ${LOCATIONS[job.pickupLocation]?.name} first.` };
    }
    job.phase = 'dropoff';
    addLog(`Package picked up. Deliver to ${LOCATIONS[job.dropoffLocation]?.name}.`);
    saveGame();
    return { success: true, message: 'Package secured. Get it to the drop-off.', phase: 'dropoff' };
  }

  if (state.player.position !== job.dropoffLocation) {
    return { success: false, message: `Deliver to ${LOCATIONS[job.dropoffLocation]?.name}.` };
  }

  const modifiers = [
    { factor: getWeaponBonus() * 0.5, weight: 1 },
  ];
  if (state.player.vehicle) modifiers.push({ factor: 0.2, weight: 1 });

  const outcome = resolve(job.baseChance, modifiers);

  if (outcome === 'success') {
    modifyCash(job.reward);
    if (job.issuedBy) shiftRelationship(job.issuedBy, 1);
    state.acceptedJobs = state.acceptedJobs.filter(j => j.instanceId !== job.instanceId);
    addLog(`Delivery complete. $${job.reward} earned.`);
    saveGame();
    return { success: true, message: `Delivered. $${job.reward}.`, amount: job.reward };
  }

  if (job.issuedBy) shiftRelationship(job.issuedBy, -1);
  state.acceptedJobs = state.acceptedJobs.filter(j => j.instanceId !== job.instanceId);
  addLog('Delivery failed.');
  saveGame();
  return { success: false, message: 'Something went wrong with the drop.' };
}

function buyWeapon(weaponId) {
  const state = getState();
  const weapon = WEAPONS[weaponId];
  if (!weapon) return { success: false, message: 'Unknown weapon.' };
  if (state.player.cash < weapon.cost) return { success: false, message: 'Not enough cash.' };

  modifyCash(-weapon.cost);
  state.player.weapon = weaponId;
  addLog(`Bought a ${weapon.name}.`);
  saveGame();
  return { success: true, message: `You now carry a ${weapon.name}.` };
}

function buyVehicle(vehicleId) {
  const state = getState();
  const vehicle = state.vehicles[vehicleId];
  if (!vehicle) return { success: false, message: 'Unknown vehicle.' };
  if (state.player.cash < vehicle.cost) return { success: false, message: 'Not enough cash.' };

  modifyCash(-vehicle.cost);
  state.player.vehicle = vehicleId;
  addLog(`Bought a ${vehicle.name}.`);
  saveGame();
  return { success: true, message: `You now own a ${vehicle.name}.` };
}

function buyMedicine() {
  const state = getState();
  if (!state.player.injury.injured) {
    return { success: false, message: 'You\'re not injured.' };
  }
  if (state.player.cash < CONFIG.MEDICINE_COST) {
    return { success: false, message: 'Not enough cash.' };
  }

  modifyCash(-CONFIG.MEDICINE_COST);
  state.player.injury.recoveryHoursRemaining = Math.max(
    0,
    state.player.injury.recoveryHoursRemaining - CONFIG.MEDICINE_RECOVERY_HOURS
  );

  if (state.player.injury.recoveryHoursRemaining <= 0) {
    state.player.injury.injured = false;
    addLog('Medicine helped. You\'re back on your feet.');
  } else {
    addLog('Medicine eases the pain. Recovery shortened.');
  }
  saveGame();
  return { success: true, message: 'You feel a bit better.' };
}

function handleShakedownPay(characterId) {
  const state = getState();
  const amount = CONFIG.SHAKEDOWN_PAY_MIN +
    Math.floor(Math.random() * (CONFIG.SHAKEDOWN_PAY_MAX - CONFIG.SHAKEDOWN_PAY_MIN));
  const payAmount = Math.min(amount, state.player.cash);

  modifyCash(-payAmount);
  shiftRelationship(characterId, 1);
  addLog(`Paid $${payAmount} to avoid trouble.`);
  state.pendingShakedown = null;
  saveGame();
  return { success: true, message: `You paid $${payAmount}.` };
}

function handleShakedownFight(characterId) {
  const state = getState();
  const char = state.characters[characterId];
  const modifiers = [{ factor: getWeaponBonus(), weight: 1 }];
  const brawny = char.traits?.brainy_brawny || 0;
  if (brawny > 0) modifiers.push({ factor: -0.1 * brawny, weight: 1 });
  const intim = char.traits?.intimidating_diplomatic || 0;
  if (intim < 0) modifiers.push({ factor: 0.08 * intim, weight: 1 });

  const outcome = resolve(0.5, modifiers);

  state.pendingShakedown = null;

  if (outcome === 'success') {
    shiftRelationship(characterId, -1);
    addLog(`You stood your ground against ${char.name}.`);
    saveGame();
    return { success: true, message: 'They backed off.' };
  }

  const injuryRoll = resolve(0.5, modifiers);
  if (injuryRoll === 'failure') {
    applyInjury(CONFIG.BASE_RECOVERY_HOURS / 2);
    return { success: false, message: 'You took a beating.', injured: true };
  }

  modifyCash(-Math.min(10, state.player.cash));
  shiftRelationship(characterId, -1);
  addLog(`${char.name} took some of your cash.`);
  saveGame();
  return { success: false, message: 'You lost the fight and some cash.' };
}

function handleShakedownRun(characterId) {
  shiftRelationship(characterId, -1);
  getState().pendingShakedown = null;
  addLog('You ran. They won\'t forget it.');
  saveGame();
  return { success: true, message: 'You got away, but they\'re angrier.' };
}

function getAvailableJobsForCharacter(character) {
  const state = getState();
  return (character.jobsOffered || [])
    .map(id => JOB_TEMPLATES[id])
    .filter(t => t && !state.acceptedJobs.some(j => j.id === t.id && j.issuedBy === character.id));
}

function getWeaponShopItems() {
  return Object.values(WEAPONS).sort((a, b) => a.cost - b.cost || a.iconIndex - b.iconIndex);
}

function getVehicleShopItems() {
  return Object.values(getState().vehicles);
}
