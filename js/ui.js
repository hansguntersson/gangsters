let callbacks = {};
let currentTab = 'map';
let logFilter = 'all';
let travelTotalMinutes = 0;

const PORTRAIT_HUES = [
  [45, 35, 28], [55, 42, 32], [38, 48, 42], [52, 38, 45], [42, 40, 50],
];

function portraitStyle(charId) {
  let hash = 0;
  for (let i = 0; i < charId.length; i++) hash = charId.charCodeAt(i) + ((hash << 5) - hash);
  const hue = PORTRAIT_HUES[Math.abs(hash) % PORTRAIT_HUES.length];
  return `background: linear-gradient(145deg, rgb(${hue[0]},${hue[1]},${hue[2]}) 0%, rgb(${hue[0]-12},${hue[1]-10},${hue[2]-8}) 100%)`;
}

function initUI(cbs = {}) {
  callbacks = cbs;
  bindStaticEvents();
  bindTimeControls();
}

function bindTimeControls() {
  document.querySelectorAll('.speed-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setTimeSpeed(parseInt(btn.dataset.speed, 10));
      renderTimeControls();
    });
  });
}

function renderTimeControls() {
  const speed = getTimeSpeed();
  document.querySelectorAll('.speed-btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.speed, 10) === speed);
  });
}

function bindStaticEvents() {
  document.getElementById('location-leave').addEventListener('click', closeLocationPanel);
  document.getElementById('location-back').addEventListener('click', closeLocationPanel);
  document.getElementById('character-leave').addEventListener('click', closeCharacterPanel);
  document.getElementById('character-back').addEventListener('click', closeCharacterPanel);
  document.getElementById('job-decline').addEventListener('click', closeJobPanel);
  document.getElementById('job-back').addEventListener('click', closeJobPanel);

  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.close;
      if (id) document.getElementById(id).classList.add('hidden');
      if (id === 'menu-drawer' || id === 'menu-screen') setInteractionPaused(false);
    });
  });

  document.getElementById('menu-btn').addEventListener('click', openMenuDrawer);
  document.getElementById('menu-back').addEventListener('click', () => {
    document.getElementById('menu-screen').classList.add('hidden');
    document.getElementById('menu-drawer').classList.remove('hidden');
  });

  document.querySelectorAll('.menu-item').forEach(btn => {
    btn.addEventListener('click', () => showMenuScreen(btn.dataset.screen));
  });

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      logFilter = btn.dataset.filter;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderLogTab();
    });
  });

  document.getElementById('travel-cancel').addEventListener('click', () => {
    if (callbacks.onCancelTravel) callbacks.onCancelTravel();
  });
}

function renderAll() {
  renderStatusBar();
  renderMap();
  renderInjuryBanner();
  if (currentTab === 'people') renderPeopleTab();
  if (currentTab === 'jobs') renderJobsTab();
  if (currentTab === 'log') renderLogTab();
  updateFooterCash();
}

function renderStatusBar() {
  document.getElementById('day-display').textContent = formatDay();
  document.getElementById('time-display').textContent = formatTime();
  document.getElementById('cash-display').textContent = `$${getState().player.cash}`;
}

function updateFooterCash() {
  const cash = `$${getState().player.cash}`;
  const encounterCash = document.getElementById('encounter-cash');
  if (encounterCash) encounterCash.textContent = cash;
}

function renderInjuryBanner() {
  const state = getState();
  let banner = document.getElementById('injury-banner');
  if (state.player.injury.injured) {
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'injury-banner';
      document.getElementById('status-bar').after(banner);
    }
    const hrs = Math.ceil(state.player.injury.recoveryHoursRemaining);
    banner.textContent = `Injured — ${hrs} hours until you can move`;
    banner.classList.remove('hidden');
  } else if (banner) {
    banner.remove();
  }
}

function renderMap() {
  const state = getState();
  const map = document.getElementById('map');
  map.classList.toggle('show-turf', isNight());

  document.getElementById('turf-layer').innerHTML = getTurfZones().map(z => `
    <div class="turf-zone ${z.gang === 'gang_a' ? 'gang-a' : 'gang-b'}"
         style="left:${z.x}px;top:${z.y}px;width:${z.w}px;height:${z.h}px"></div>
  `).join('');

  const playerPos = state.player.position;
  const locLayer = document.getElementById('locations-layer');

  locLayer.innerHTML = Object.values(LOCATIONS).map(loc => {
    const isCurrent = loc.id === playerPos;
    const hasBusiness = state.extortionAgreements.some(a => a.businessId === loc.id);
    const turfCls = loc.turf === 'gang_a' ? 'turf-a' : (loc.turf === 'gang_b' ? 'turf-b' : '');
    return `
      <div class="location-node ${isCurrent ? 'current' : ''} ${hasBusiness ? 'has-business' : ''} ${turfCls}"
           data-location="${loc.id}"
           style="left:${loc.x}px;top:${loc.y}px">
        <div class="location-pill">
          <span class="loc-icon">${loc.icon}</span>
          <span class="loc-name">${loc.name}</span>
        </div>
      </div>`;
  }).join('');

  locLayer.querySelectorAll('.location-node').forEach(node => {
    node.addEventListener('click', (e) => {
      e.stopPropagation();
      if (shouldIgnoreMapTap()) return;
      if (callbacks.onLocationTap) callbacks.onLocationTap(node.dataset.location);
    });
  });

  const playerLoc = LOCATIONS[playerPos];
  const marker = document.getElementById('player-marker');
  if (playerLoc) {
    marker.style.left = `${playerLoc.x}px`;
    marker.style.top = `${playerLoc.y}px`;
    marker.classList.toggle('traveling', state.player.inTransit);
  }
}

function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.tab-view').forEach(v => v.classList.remove('active'));
  document.getElementById(`tab-${tab}`).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tab);
  });
  if (tab === 'people') renderPeopleTab();
  if (tab === 'jobs') renderJobsTab();
  if (tab === 'log') renderLogTab();
}

function renderPeopleTab() {
  const state = getState();
  const el = document.getElementById('people-content');
  const known = state.knownCharacters.length > 0
    ? state.knownCharacters.map(id => state.characters[id]).filter(Boolean)
    : Object.values(state.characters).filter(c => getCharacterLocation(c, state.clock.hour));

  if (known.length === 0) {
    el.innerHTML = '<p class="stub-notice">Nobody on your radar yet. Hit the map and make contacts.</p>';
    return;
  }

  let html = '<div class="section-block"><h3>Contacts</h3><ul class="list-rows">';
  known.forEach(c => { html += renderListRowHTML(c); });
  html += '</ul></div><div class="section-block"><h3>Crew</h3>';
  html += '<p class="stub-notice">Crew hiring coming soon.</p></div>';
  el.innerHTML = html;
  bindListRows(el);
}

function renderJobsTab() {
  const state = getState();
  const el = document.getElementById('jobs-content');
  const weapon = state.player.weapon ? state.weapons[state.player.weapon]?.name : 'None';
  const vehicle = state.player.vehicle ? state.vehicles[state.player.vehicle]?.name : 'None';

  let html = `<div class="section-block"><h3>Loadout</h3>
    <div class="section-item">Weapon: <strong>${weapon}</strong></div>
    <div class="section-item">Vehicle: <strong>${vehicle}</strong></div></div>`;

  if (state.extortionAgreements.length > 0) {
    html += '<div class="section-block"><h3>Protection Rackets</h3>';
    state.extortionAgreements.forEach(a => {
      const loc = LOCATIONS[a.businessId];
      const status = getExtortionStatus(a);
      const word = status.due ? (status.overdue ? 'Overdue' : 'Ready to collect') : 'Running smooth';
      html += `<div class="section-item">${loc?.name || a.businessId}
        <div class="dim">${word} — $${a.weeklyAmount}/week</div></div>`;
    });
    html += '</div>';
  }

  html += '<div class="section-block"><h3>Active Jobs</h3>';
  if (state.acceptedJobs.length === 0) {
    html += '<p class="stub-notice">No active jobs. Talk to hustlers and gang members on the map.</p>';
  } else {
    state.acceptedJobs.forEach(j => {
      let status = 'In progress';
      if (j.type === 'delivery') {
        const remaining = getJobTimeRemaining(j);
        status = remaining <= 1 ? "Something's off — time's almost up" : 'Running smooth';
      }
      html += `<div class="section-item"><strong>${j.title}</strong>
        <div class="dim">${j.description}</div>
        <div class="dim">${status}</div></div>`;
    });
  }
  html += '</div>';
  el.innerHTML = html;
}

function renderLogTab() {
  const state = getState();
  const el = document.getElementById('log-content');
  const entries = state.log.filter(e => matchLogFilter(e, logFilter));

  if (entries.length === 0) {
    el.innerHTML = '<p class="stub-notice">Nothing logged yet.</p>';
    return;
  }

  el.innerHTML = entries.map(e => `
    <div class="log-feed-item">
      <div class="log-time">${formatDay()} · ${formatTime()}</div>
      ${e}
    </div>`).join('');
}

function matchLogFilter(entry, filter) {
  if (filter === 'all') return true;
  const lower = entry.toLowerCase();
  const rules = {
    crew: ['job', 'deliver', 'hijack', 'accepted', 'package'],
    business: ['extort', 'collect', 'deli', 'cafe', 'protection', 'agreed'],
    law: ['injur', 'police', 'medicine', 'recover', 'hurt'],
    rivals: ['gang', 'shakedown', 'turf', 'hostile', 'north side', 'south side', 'stood your ground'],
  };
  return (rules[filter] || []).some(kw => lower.includes(kw));
}

function getPortraitInitials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function getCharacterRoleLabel(char) {
  const roles = {
    gang_member: 'Gang Member',
    hustler: 'Hustler',
    dealer: 'Dealer',
    civilian: char.isBusinessOwner ? 'Business Owner' : 'Civilian',
    mechanic: 'Mechanic',
  };
  return roles[char.type] || char.type;
}

function getGangLabel(char) {
  if (char.gangAffiliation === 'gang_a') return { text: '♛ Gang A', cls: 'tag-gang-a' };
  if (char.gangAffiliation === 'gang_b') return { text: '♛ Gang B', cls: 'tag-gang-b' };
  return null;
}

function getRoleTag(char) {
  const gang = getGangLabel(char);
  if (gang) return gang;
  const map = {
    hustler: { text: 'Hustler', cls: 'tag-hustler' },
    dealer: { text: 'Dealer', cls: 'tag-dealer' },
    civilian: { text: 'Civilian', cls: 'tag-civilian' },
    mechanic: { text: 'Mechanic', cls: 'tag-mechanic' },
    gang_member: { text: 'Gang Member', cls: 'tag-gang-a' },
  };
  return map[char.type] || { text: char.type, cls: 'tag-neutral' };
}

function formatRelationshipWord(rel) {
  if (rel === 'friendly') return 'Friendly';
  if (rel === 'grudge') return 'Hostile';
  return 'Neutral';
}

function renderListRowHTML(char) {
  const role = getCharacterRoleLabel(char);
  const gang = getGangLabel(char);
  const relCls = char.relationshipToPlayer || 'neutral';
  const gangHtml = gang ? `<span class="tag ${gang.cls}">${gang.text}</span>` : '';
  return `
    <li class="list-row" data-character="${char.id}">
      <div class="portrait" style="${portraitStyle(char.id)}">${getPortraitInitials(char.name)}</div>
      <div class="list-row-info">
        <div class="list-row-name">${char.name}</div>
        <div class="list-row-role">${role}</div>
        ${gangHtml}
        <span class="status-word ${relCls}">${formatRelationshipWord(char.relationshipToPlayer)}</span>
      </div>
      <span class="list-row-chevron">›</span>
    </li>`;
}

function bindListRows(container) {
  container.querySelectorAll('.list-row[data-character]').forEach(row => {
    row.addEventListener('click', () => openCharacterPanel(row.dataset.character));
  });
}

function showTravelModal(targetName, remainingMinutes, totalMinutes, fromId, toId) {
  travelTotalMinutes = totalMinutes;
  document.getElementById('travel-bar-title').textContent = `TRAVELING TO ${targetName.toUpperCase()}`;
  document.getElementById('travel-bar-time').textContent = formatTime();
  document.getElementById('travel-time').textContent = `${remainingMinutes} MIN`;
  document.getElementById('travel-mode').textContent = getTravelModeLabel().toUpperCase();

  const risk = getTravelRiskWarning(fromId, toId);
  const riskEl = document.getElementById('travel-risk');
  if (risk) {
    document.getElementById('travel-risk-text').textContent = risk;
    riskEl.classList.remove('hidden');
  } else {
    riskEl.classList.add('hidden');
  }

  const pct = totalMinutes > 0 ? ((totalMinutes - remainingMinutes) / totalMinutes) * 100 : 0;
  document.getElementById('travel-progress-bar').style.width = `${pct}%`;

  const preview = document.getElementById('travel-map-preview');
  const from = LOCATIONS[fromId];
  const to = LOCATIONS[toId];
  if (from && to && preview) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    preview.innerHTML = `
      <div style="position:absolute;left:15%;top:50%;width:12px;height:12px;background:#fff;border-radius:50%"></div>
      <div class="travel-route-line" style="left:15%;top:50%;width:${Math.min(len * 0.5, 200)}px;transform:rotate(${angle}deg)"></div>
      <div style="position:absolute;left:75%;top:40%;font-size:16px">${to.icon}</div>`;
  }

  document.getElementById('travel-modal').classList.remove('hidden');
}

function updateTravelModal(remainingMinutes) {
  document.getElementById('travel-time').textContent = `${Math.max(0, remainingMinutes)} MIN`;
  document.getElementById('travel-bar-time').textContent = formatTime();
  const pct = travelTotalMinutes > 0
    ? ((travelTotalMinutes - remainingMinutes) / travelTotalMinutes) * 100
    : 0;
  document.getElementById('travel-progress-bar').style.width = `${Math.min(100, pct)}%`;
}

function hideTravelModal() {
  document.getElementById('travel-modal').classList.add('hidden');
}

function showEncounterModal(title, character, text, choices, isDanger) {
  setInteractionPaused(true);
  const modal = document.getElementById('encounter-modal');
  document.getElementById('encounter-bar').classList.toggle('danger', !!isDanger);
  document.getElementById('encounter-title').textContent = title.toUpperCase();
  document.getElementById('encounter-bar-time').textContent = formatTime();
  document.getElementById('encounter-text').textContent = `"${text.replace(/^"|"$/g, '')}"`;

  const portrait = document.getElementById('encounter-portrait');
  if (character) {
    portrait.textContent = getPortraitInitials(character.name);
    portrait.style.cssText = portraitStyle(character.id);
    portrait.classList.remove('hidden');
  } else {
    portrait.classList.add('hidden');
  }

  const actions = document.getElementById('encounter-actions');
  actions.innerHTML = '';
  choices.forEach(c => {
    addActionRow(actions, c.label, c.sub || '', c.action, c.danger);
  });

  updateFooterCash();
  modal.classList.remove('hidden');
  hideOtherPanels('encounter-modal');
}

function closeEncounterModal() {
  document.getElementById('encounter-modal').classList.add('hidden');
  setInteractionPaused(false);
}

function openLocationPanel(locationId) {
  const state = getState();
  const loc = LOCATIONS[locationId];
  if (!loc) return;

  setInteractionPaused(true);
  switchTab('map');

  document.getElementById('location-name').textContent = loc.name.toUpperCase();
  document.getElementById('location-time').textContent = `${formatTime()} · Currently here`;

  const chars = getCharactersAtLocation(locationId);
  const list = document.getElementById('location-characters');

  if (chars.length === 0) {
    list.innerHTML = '<li class="list-row" style="cursor:default"><div class="list-row-info"><div class="list-row-sub">Nobody around.</div></div></li>';
  } else {
    list.innerHTML = chars.map(c => renderListRowHTML(c)).join('');
    bindListRows(list);
  }

  const actions = document.getElementById('location-actions');
  actions.innerHTML = '';

  const agreement = state.extortionAgreements.find(a => a.businessId === locationId);
  if (agreement) {
    const status = getExtortionStatus(agreement);
    if (status.due) {
      addActionRow(actions, `Collect $${agreement.weeklyAmount}`, 'Protection money', () => {
        const result = collectExtortion(locationId);
        showResultToast(result.message, result.success);
        if (result.success) renderAll();
        closeLocationPanel();
      });
    }
  }

  if (loc.type === 'pharmacy') {
    addActionRow(actions, 'Buy medicine', `$${CONFIG.MEDICINE_COST}`, () => {
      const result = buyMedicine();
      showResultToast(result.message, result.success);
      renderAll();
    });
  }

  const activeJob = state.acceptedJobs.find(j => {
    if (j.type === 'hijack') return j.targetLocation === locationId;
    if (j.type === 'delivery') {
      if (j.phase === 'pickup') return j.pickupLocation === locationId;
      return j.dropoffLocation === locationId;
    }
    return false;
  });

  if (activeJob) {
    const label = activeJob.type === 'hijack' ? 'Execute hijack'
      : (activeJob.phase === 'pickup' ? 'Pick up package' : 'Deliver package');
    addActionRow(actions, label, '', () => {
      const result = activeJob.type === 'hijack'
        ? executeHijackJob(activeJob)
        : executeDeliveryJob(activeJob);
      showResultToast(result.message, result.success);
      renderAll();
      if (result.injured) closeLocationPanel();
    });
  }

  document.getElementById('location-panel').classList.remove('hidden');
  hideOtherPanels('location-panel');
}

function closeLocationPanel() {
  document.getElementById('location-panel').classList.add('hidden');
  setInteractionPaused(false);
  renderAll();
}

function openCharacterPanel(characterId) {
  const state = getState();
  const char = state.characters[characterId];
  if (!char) return;

  markCharacterKnown(characterId);
  setInteractionPaused(true);

  const tag = getRoleTag(char);
  const portraitEl = document.getElementById('character-portrait');
  portraitEl.textContent = getPortraitInitials(char.name);
  portraitEl.style.cssText = portraitStyle(char.id);
  document.getElementById('character-name').textContent = char.name;
  document.getElementById('character-role').textContent = tag.text;
  document.getElementById('character-role').className = `tag ${tag.cls}`;
  const relEl = document.getElementById('character-relationship');
  relEl.textContent = `Relationship: ${formatRelationshipWord(char.relationshipToPlayer)}`;
  relEl.className = `status-word ${char.relationshipToPlayer}`;
  document.getElementById('character-dialogue').textContent = getDialogue(char);

  const actions = document.getElementById('character-actions');
  actions.innerHTML = '';

  addActionRow(actions, 'Talk', 'See what they want', () => {
    document.getElementById('character-dialogue').textContent = getDialogue(char);
  });

  const jobs = getAvailableJobsForCharacter(char);
  if (jobs.length > 0 && char.relationshipToPlayer !== 'grudge') {
    addActionRow(actions, 'Jobs', 'See if they have work', () => {
      if (jobs.length === 1) {
        showJobPanel(jobs[0], characterId);
      } else {
        jobs.forEach(job => {
          addActionRow(actions, job.title, job.description, () => showJobPanel(job, characterId));
        });
      }
    });
  }

  if (canMugTarget(char)) {
    addActionRow(actions, 'Mug', 'Take their cash', () => {
      const result = performMugging(characterId);
      showResultToast(result.message, result.success);
      renderAll();
      if (result.injured) closeCharacterPanel();
    });
  }

  if (char.isBusinessOwner && char.relationshipToPlayer !== 'grudge') {
    const loc = LOCATIONS[state.player.position];
    const hasAgreement = state.extortionAgreements.some(a => a.businessId === state.player.position);
    if (loc?.extortable && !hasAgreement) {
      addActionRow(actions, 'Intimidate', 'Push your weight', () => {
        const result = initiateExtortion(characterId);
        if (result.type === 'accepted') {
          showResultToast(result.message, true);
          renderAll();
        } else if (result.type === 'refused') {
          showEncounterModal('Extortion', char, result.message, [
            { label: 'Escalate', sub: 'Risk a fight', action: () => {
              const esc = escalateExtortion(characterId);
              showResultToast(esc.message, esc.success);
              renderAll();
              closeEncounterModal();
              closeCharacterPanel();
            }, danger: true },
            { label: 'Back down', sub: 'Walk away', action: () => {
              showResultToast('You walked away.', true);
              closeEncounterModal();
            }},
          ], false);
        } else {
          showResultToast(result.message, false);
        }
      });
    }
  }

  if (char.sellsWeapons && char.relationshipToPlayer !== 'grudge') {
    addActionRow(actions, 'Buy weapon', 'Cash only', () => {
      getWeaponShopItems().forEach(w => {
        addActionRow(actions, w.name, `$${w.cost}`, () => {
          const result = buyWeapon(w.id);
          showResultToast(result.message, result.success);
          renderAll();
        });
      });
    });
  }

  if (char.sellsVehicles && char.relationshipToPlayer !== 'grudge') {
    addActionRow(actions, 'Buy vehicle', 'Cash only', () => {
      getVehicleShopItems().forEach(v => {
        addActionRow(actions, v.name, `$${v.cost}`, () => {
          const result = buyVehicle(v.id);
          showResultToast(result.message, result.success);
          renderAll();
        });
      });
    });
  }

  document.getElementById('character-panel').classList.remove('hidden');
  hideOtherPanels('character-panel');
}

function closeCharacterPanel() {
  document.getElementById('character-panel').classList.add('hidden');
  setInteractionPaused(false);
  renderAll();
}

function showJobPanel(template, issuedBy) {
  const panel = document.getElementById('job-panel');
  document.getElementById('job-title').textContent = template.title;

  let details = `<p>${template.description}</p>`;
  if (template.type === 'hijack') {
    details += `<p><span class="label">Where: </span>${LOCATIONS[template.targetLocation]?.name}</p>`;
    details += `<p><span class="label">Window: </span>${template.timeWindow.fromHour}:00 – ${template.timeWindow.toHour}:00</p>`;
    details += `<p><span class="label">Reward: </span>$${template.reward}</p>`;
    details += `<p><span class="label">Risk: </span>${template.risk}</p>`;
  } else {
    details += `<p><span class="label">From: </span>${LOCATIONS[template.pickupLocation]?.name}</p>`;
    details += `<p><span class="label">To: </span>${LOCATIONS[template.dropoffLocation]?.name}</p>`;
    details += `<p><span class="label">Time limit: </span>${template.timeLimitHours} hours</p>`;
    details += `<p><span class="label">Reward: </span>$${template.reward}</p>`;
  }
  document.getElementById('job-details').innerHTML = details;

  document.getElementById('job-accept').onclick = () => {
    acceptJob(template.id, issuedBy);
    showResultToast('Job accepted.', true);
    closeJobPanel();
    closeCharacterPanel();
    renderAll();
  };

  panel.classList.remove('hidden');
  hideOtherPanels('job-panel');
}

function closeJobPanel() {
  document.getElementById('job-panel').classList.add('hidden');
}

function showShakedownPanel(character, onResolved) {
  const finish = (result) => {
    showResultToast(result.message, result.success);
    closeEncounterModal();
    renderAll();
    if (result.injured && callbacks.onInjured) {
      callbacks.onInjured();
    } else if (onResolved) {
      onResolved();
    }
  };

  showEncounterModal(
    'Shakedown',
    character,
    `${character.name} steps out: "You've got some nerve around here. Empty your pockets."`,
    [
      { label: 'Stand your ground', sub: 'Risk a fight', action: () => finish(handleShakedownFight(character.id)), danger: true },
      { label: 'Pay up', sub: 'Lose some cash', action: () => finish(handleShakedownPay(character.id)) },
      { label: 'Run', sub: 'Try to get away', action: () => finish(handleShakedownRun(character.id)) },
    ],
    true
  );
}

function openMenuDrawer() {
  setInteractionPaused(true);
  document.getElementById('menu-drawer').classList.remove('hidden');
  hideOtherPanels('menu-drawer');
}

function showMenuScreen(screen) {
  document.getElementById('menu-drawer').classList.add('hidden');
  const content = document.getElementById('menu-screen-content');
  const titles = {
    turf: 'Turf Overview', storage: 'Storage & Warehouses', bribery: 'Bribery Network',
    prison: 'Prison & Court', garage: 'Garage', profile: 'Profile',
    settings: 'Settings', help: 'How to Play',
  };
  document.getElementById('menu-screen-title').textContent = titles[screen] || 'Menu';

  if (screen === 'garage') content.innerHTML = renderGarageScreen();
  else if (screen === 'settings') {
    content.innerHTML = renderSettingsScreen();
    bindTimeControls();
    renderTimeControls();
  } else if (screen === 'help') content.innerHTML = renderHelpScreen();
  else content.innerHTML = `<p class="stub-notice">${titles[screen]} — coming soon.</p>`;

  document.getElementById('menu-screen').classList.remove('hidden');
}

function renderGarageScreen() {
  const state = getState();
  const vehicle = state.player.vehicle ? state.vehicles[state.player.vehicle] : null;
  const weapon = state.player.weapon ? state.weapons[state.player.weapon] : null;
  return `
    <div class="section-block"><h3>Vehicle</h3>
      <div class="section-item">${vehicle ? vehicle.name : 'Nothing owned'}
        <div class="dim">${vehicle ? 'Assigned to you' : "Visit Gus's Garage to buy wheels"}</div>
      </div></div>
    <div class="section-block"><h3>Weapon</h3>
      <div class="section-item">${weapon ? weapon.name : 'Unarmed'}
        <div class="dim">${weapon ? 'On your person' : 'Find Pete for hardware'}</div>
      </div></div>`;
}

function renderSettingsScreen() {
  return `<div class="section-block"><h3>Time Speed</h3>
    <p class="dialogue" style="font-size:13px">Menus pause time automatically.</p>
    <div class="time-controls-row">
      <button class="speed-btn" data-speed="0">||</button>
      <button class="speed-btn" data-speed="1">&gt;</button>
      <button class="speed-btn" data-speed="2">&gt;&gt;</button>
      <button class="speed-btn" data-speed="3">&gt;&gt;&gt;</button>
    </div></div>`;
}

function renderHelpScreen() {
  return `<div class="help-content section-block">
    <p>Tap locations on the map to travel. Talk to people, take jobs, hustle for cash.</p>
    <p>Buy weapons and vehicles to improve your odds. Watch your relationships — people remember what you do.</p>
    <p>Collect extortion payments weekly. Miss a collection and agreements fall apart.</p>
    <p>If injured, rest at home or buy medicine at the pharmacy.</p>
    <p>Turf overlays appear at night — the city reveals itself when the sun goes down.</p>
  </div>`;
}

function showResultToast(message, success) {
  const el = document.getElementById('result-toast');
  el.textContent = message;
  el.className = success ? 'success' : 'failure';
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 2500);
}

function addActionRow(container, title, sub, handler, danger) {
  const btn = document.createElement('button');
  btn.className = `action-row${danger ? ' danger' : ''}`;
  btn.innerHTML = `<span class="action-title">${title}</span>${sub ? `<span class="action-sub">${sub}</span>` : ''}`;
  btn.addEventListener('click', handler);
  container.appendChild(btn);
}

function addActionButton(container, label, handler) {
  addActionRow(container, label, '', handler);
}

function hideOtherPanels(exceptId) {
  ['location-panel', 'character-panel', 'job-panel', 'encounter-modal', 'menu-drawer', 'menu-screen']
    .filter(id => id !== exceptId)
    .forEach(id => document.getElementById(id).classList.add('hidden'));
}

function isAnyPanelOpen() {
  return ['location-panel', 'character-panel', 'job-panel', 'encounter-modal',
    'travel-modal', 'menu-drawer', 'menu-screen']
    .some(id => !document.getElementById(id).classList.contains('hidden'));
}

function showTravelOverlay(text, show) {
  if (!show) hideTravelModal();
}
