let callbacks = {};
let currentTab = 'map';
const PEOPLE_FILTERS = ['crew', 'associates', 'rivals', 'law', 'contacts'];
let peopleFilter = 'all';
let showGangTurf = false;
let travelTotalMinutes = 0;

const PORTRAIT_HUES = [
  [45, 35, 28], [55, 42, 32], [38, 48, 42], [52, 38, 45], [42, 40, 50],
];

function getPortraitInitials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function portraitFallbackStyle(charId) {
  let hash = 0;
  for (let i = 0; i < charId.length; i++) hash = charId.charCodeAt(i) + ((hash << 5) - hash);
  const hue = PORTRAIT_HUES[Math.abs(hash) % PORTRAIT_HUES.length];
  return `background: linear-gradient(145deg, rgb(${hue[0]},${hue[1]},${hue[2]}) 0%, rgb(${hue[0]-12},${hue[1]-10},${hue[2]-8}) 100%)`;
}

function applyPortraitToElement(el, character, sizeClass) {
  if (!el || !character) return;

  el.classList.remove('has-sprite', 'portrait-lg', 'portrait-hero', 'sheet-1', 'sheet-2', 'sheet-3',
    'idx-0', 'idx-1', 'idx-2', 'idx-3', 'idx-4', 'idx-5');
  el.style.backgroundImage = '';
  el.style.backgroundPosition = '';
  el.style.backgroundSize = '';

  if (sizeClass) el.classList.add(sizeClass);

  if (character.portrait) {
    const { sheet, index } = character.portrait;
    el.classList.add('portrait', 'has-sprite', `sheet-${sheet}`, `idx-${index}`);
    el.textContent = '';
    el.removeAttribute('style');
    return;
  }

  el.textContent = getPortraitInitials(character.name);
  el.style.cssText = portraitFallbackStyle(character.id);
}

function portraitHTML(character, sizeClass) {
  if (character.portrait) {
    const { sheet, index } = character.portrait;
    const extra = sizeClass ? ` ${sizeClass}` : '';
    return `<div class="portrait has-sprite sheet-${sheet} idx-${index}${extra}"></div>`;
  }
  const style = portraitFallbackStyle(character.id);
  const extra = sizeClass ? ` ${sizeClass}` : '';
  return `<div class="portrait${extra}" style="${style}">${getPortraitInitials(character.name)}</div>`;
}

function weaponIconHTML(weapon, sizeClass) {
  if (!weapon) return '';
  const idx = weapon.iconIndex ?? 0;
  const extra = sizeClass ? ` ${sizeClass}` : '';
  return `<div class="weapon-icon has-sprite idx-${idx}${extra}" aria-hidden="true"></div>`;
}

function initUI(cbs = {}) {
  callbacks = cbs;
  bindStaticEvents();
  bindTimeControls();
  renderTimeControls();
}

function bindTimeControls() {
  document.querySelectorAll('#time-controls .speed-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setTimeSpeed(parseInt(btn.dataset.speed, 10));
      renderTimeControls();
    });
  });
}

function renderTimeControls() {
  const speed = getTimeSpeed();
  document.querySelectorAll('#time-controls .speed-btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.speed, 10) === speed);
  });
}

function bindStaticEvents() {
  document.getElementById('location-leave').addEventListener('click', closeLocationPanel);
  document.getElementById('character-leave').addEventListener('click', closeCharacterPanel);
  document.getElementById('job-decline').addEventListener('click', closeJobPanel);
  document.getElementById('job-back').addEventListener('click', closeJobPanel);

  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.close;
      if (id) document.getElementById(id).classList.add('hidden');
      if (id === 'menu-screen') {
        setInteractionPaused(false);
        setMenuBtnExpanded(false);
      }
    });
  });

  document.getElementById('menu-btn').addEventListener('click', toggleSettings);

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  document.querySelectorAll('#people-filters .filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      peopleFilter = btn.dataset.filter;
      syncPeopleFilterButtons();
      renderPeopleTab();
    });
  });

  const turfToggle = document.getElementById('turf-toggle');
  if (turfToggle) {
    turfToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      showGangTurf = !showGangTurf;
      renderTurfToggle();
      document.getElementById('map')?.classList.toggle('show-turf', showGangTurf);
    });
  }
}

function syncPeopleFilterButtons() {
  document.querySelectorAll('#people-filters .filter-btn').forEach(btn => {
    const on = btn.dataset.filter === peopleFilter;
    btn.classList.toggle('active', on);
    btn.setAttribute('aria-pressed', String(on));
  });
}

function renderAll() {
  renderStatusBar();
  renderTimeControls();
  renderMap();
  renderInjuryBanner();
  if (currentTab === 'people') renderPeopleTab();
  if (currentTab === 'jobs') renderJobsTab();
  if (currentTab === 'profile') renderProfileTab();
  updateFooterCash();
}

function renderStatusBar() {
  const state = getState();
  document.getElementById('time-display').textContent = formatTime();
  document.getElementById('cash-display').textContent = `$${state.player.cash}`;

  const injuryEl = document.getElementById('injury-indicator');
  if (!injuryEl) return;

  const injured = state.player.injury.injured;
  injuryEl.classList.toggle('hidden', !injured);
  injuryEl.setAttribute('aria-hidden', injured ? 'false' : 'true');
  if (injured) {
    const hrs = Math.ceil(state.player.injury.recoveryHoursRemaining);
    const label = `Injured — ${hrs}h until you can move`;
    injuryEl.title = label;
    injuryEl.setAttribute('aria-label', label);
  } else {
    injuryEl.removeAttribute('title');
    injuryEl.removeAttribute('aria-label');
  }
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
      document.getElementById('app-header').after(banner);
    }
    const hrs = Math.ceil(state.player.injury.recoveryHoursRemaining);
    banner.textContent = `Injured — ${hrs} hours until you can move`;
    banner.classList.remove('hidden');
  } else if (banner) {
    banner.remove();
  }
}

function turfZoneClass(gangId) {
  return gangId ? `gang-${gangId.replace(/_/g, '-')}` : '';
}

function renderLocationNode(loc, state, playerPos) {
  const isCurrent = loc.id === playerPos;
  const isIntersection = loc.type === 'intersection';

  if (isIntersection) {
    return `
      <div class="location-node intersection ${isCurrent ? 'current' : ''}"
           data-location="${loc.id}"
           style="left:${loc.x}px;top:${loc.y}px">
        <div class="location-marker">
          <div class="location-pin-shell${isCurrent ? ' is-here' : ''}">
            ${isCurrent
              ? '<div class="location-pin current-location-marker" role="img" aria-label="You are here"></div>'
              : `<div class="location-pin intersection-icon" role="img" aria-label="${loc.name}"></div>`}
          </div>
        </div>
        <span class="location-label">${loc.name}</span>
      </div>`;
  }

  const hasBusiness = state.extortionAgreements.some(a => a.businessId === loc.id);
  const turfCls = turfZoneClass(loc.turf);
  const iconIdx = loc.iconIndex ?? 0;
  const showLabel = isCurrent || hasBusiness || loc.type !== 'building';
  return `
    <div class="location-node building ${isCurrent ? 'current' : ''} ${hasBusiness ? 'has-business' : ''} ${showLabel ? 'show-label' : ''} ${turfCls}"
         data-location="${loc.id}"
         style="left:${loc.x}px;top:${loc.y}px">
      <div class="location-marker">
        <div class="location-pin-shell${isCurrent ? ' is-here' : ''}">
          ${isCurrent
            ? '<div class="location-pin current-location-marker" role="img" aria-label="You are here"></div>'
            : `<div class="location-pin has-sprite idx-${iconIdx}" role="img" aria-label="${loc.name}"></div>`}
        </div>
      </div>
      <span class="location-label">${loc.name}</span>
    </div>`;
}

function renderTurfToggle() {
  const btn = document.getElementById('turf-toggle');
  if (!btn) return;
  btn.classList.toggle('active', showGangTurf);
  btn.setAttribute('aria-pressed', showGangTurf ? 'true' : 'false');
  btn.setAttribute('aria-label', showGangTurf ? 'Hide gang turf' : 'Show gang turf');
  btn.title = showGangTurf ? 'Hide gang turf' : 'Show gang turf';
}

function renderMap() {
  const state = getState();
  const map = document.getElementById('map');
  map.classList.toggle('show-turf', showGangTurf);
  renderTurfToggle();

  document.getElementById('turf-layer').innerHTML = getTurfZones().map(z => `
    <div class="turf-zone ${turfZoneClass(z.gang)}"
         style="left:${z.x}px;top:${z.y}px;width:${z.w}px;height:${z.h}px"></div>
  `).join('');

  const playerPos = state.player.position;
  const locLayer = document.getElementById('locations-layer');
  const visible = Object.values(LOCATIONS).filter(loc => isLocationKnown(loc.id));
  const sorted = visible.sort((a, b) => {
    const rank = (loc) => {
      if (loc.type === 'intersection') return 0;
      if (loc.type === 'building') return 1;
      return 2;
    };
    return rank(a) - rank(b);
  });

  locLayer.innerHTML = sorted.map(loc => renderLocationNode(loc, state, playerPos)).join('');

  locLayer.querySelectorAll('.location-node').forEach(node => {
    node.addEventListener('click', (e) => {
      e.stopPropagation();
      if (shouldIgnoreMapTap()) return;
      if (callbacks.onLocationTap) callbacks.onLocationTap(node.dataset.location);
    });
  });
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
  if (tab === 'profile') renderProfileTab();
}

function getPeopleCategory(char, state) {
  if ((state.crew || []).includes(char.id)) return 'crew';
  if (char.relationshipToPlayer === 'grudge') return 'rivals';
  if (char.gangAffiliation) {
    const grudges = state.gangGrudgeCount?.[char.gangAffiliation] || 0;
    if (grudges >= 2) return 'rivals';
  }
  if (char.gangAffiliation && char.relationshipToPlayer === 'friendly') return 'associates';
  if (char.type === 'civilian' && !char.isBusinessOwner) return 'law';
  return 'contacts';
}

function renderPeopleTab() {
  const state = getState();
  const el = document.getElementById('people-content');
  const roster = state.knownCharacters
    .map(id => state.characters[id])
    .filter(Boolean);

  if (roster.length === 0) {
    el.innerHTML = '<p class="stub-notice">Nobody on your radar yet. Hit the map and make contacts.</p>';
    return;
  }

  const filtered = peopleFilter === 'all'
    ? PEOPLE_FILTERS.flatMap(cat => roster.filter(c => getPeopleCategory(c, state) === cat))
    : roster.filter(c => getPeopleCategory(c, state) === peopleFilter);

  if (filtered.length === 0) {
    el.innerHTML = '<p class="stub-notice">Nobody in this category yet.</p>';
    return;
  }

  const sectionLabels = {
    all: 'Everyone',
    crew: 'Crew',
    associates: 'Associates',
    rivals: 'Rivals',
    law: 'The Law',
    contacts: 'Other contacts',
  };

  let html = `<p class="people-list-label">${sectionLabels[peopleFilter] || 'People'}</p>`;
  html += '<ul class="list-rows people-list-rows">';
  filtered.forEach(c => { html += renderPeopleListRowHTML(c); });
  html += '</ul>';
  el.innerHTML = html;
  bindListRows(el);
}

function renderJobsTab() {
  const state = getState();
  const el = document.getElementById('jobs-content');
  const weapon = state.player.weapon ? state.weapons[state.player.weapon] : null;
  const vehicle = state.player.vehicle ? state.vehicles[state.player.vehicle]?.name : 'None';

  let html = `<div class="section-block"><h3>Loadout</h3>
    <div class="section-item loadout-row">${weapon ? weaponIconHTML(weapon, 'weapon-icon-sm') : ''}<div><strong>${weapon ? weapon.name : 'Unarmed'}</strong></div></div>
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

function renderProfileTab() {
  const state = getState();
  const el = document.getElementById('profile-content');
  const loc = LOCATIONS[state.player.position];
  const vehicle = state.player.vehicle ? state.vehicles[state.player.vehicle] : null;
  const weapon = state.player.weapon ? state.weapons[state.player.weapon] : null;
  const injury = state.player.injury.injured
    ? `Injured — ${Math.ceil(state.player.injury.recoveryHoursRemaining)}h to recover`
    : 'Healthy';

  el.innerHTML = `
    <div class="section-block"><h3>Status</h3>
      <div class="section-item">${formatDay()} · ${formatTime()}</div>
      <div class="section-item">Cash: <strong>$${state.player.cash}</strong></div>
      <div class="section-item">Location: <strong>${loc?.name || 'Unknown'}</strong></div>
      <div class="section-item">Condition: <strong>${injury}</strong></div>
      <div class="section-item">Contacts: <strong>${state.knownCharacters.length}</strong></div>
    </div>
    <div class="section-block"><h3>Weapon</h3>
      <div class="section-item loadout-row">
        ${weapon ? weaponIconHTML(weapon) : ''}
        <div>${weapon ? weapon.name : 'Unarmed'}
          <div class="dim">${weapon ? 'On your person' : 'Find Pete for hardware'}</div>
        </div>
      </div>
    </div>
    <div class="section-block"><h3>Vehicle</h3>
      <div class="section-item">${vehicle ? vehicle.name : 'Nothing owned'}
        <div class="dim">${vehicle ? 'Assigned to you' : "Visit Gus's Garage to buy wheels"}</div>
      </div>
    </div>
    <div class="section-block"><h3>Operations</h3>
      <div class="section-item">Active jobs: <strong>${state.acceptedJobs.length}</strong></div>
      <div class="section-item">Protection rackets: <strong>${state.extortionAgreements.length}</strong></div>
    </div>`;
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
  if (!char.gangAffiliation) return null;
  const name = getGangName(char.gangAffiliation);
  return { text: `♛ ${name}`, cls: `tag-${char.gangAffiliation.replace(/_/g, '-')}` };
}

function getRoleTag(char) {
  const gang = getGangLabel(char);
  if (gang) return gang;
  const map = {
    hustler: { text: 'Hustler', cls: 'tag-hustler' },
    dealer: { text: 'Dealer', cls: 'tag-dealer' },
    civilian: { text: 'Civilian', cls: 'tag-civilian' },
    mechanic: { text: 'Mechanic', cls: 'tag-mechanic' },
    gang_member: { text: 'Gang Member', cls: 'tag-neutral' },
  };
  return map[char.type] || { text: char.type, cls: 'tag-neutral' };
}

function formatRelationshipWord(rel) {
  if (rel === 'friendly') return 'Friendly';
  if (rel === 'grudge') return 'Hostile';
  return 'Neutral';
}

function relationshipStatusHTML(rel) {
  const word = formatRelationshipWord(rel);
  const cls = rel || 'neutral';
  let icon = '';
  if (rel === 'friendly') {
    icon = `<span class="status-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M7 12h2l1.5-2 2 4 2-3 1.5 1H17"/><path d="M5 12v5a1 1 0 0 0 1 1h2"/><path d="M19 12v5a1 1 0 0 1-1 1h-2"/><path d="M9 18h6"/></svg></span>`;
  }
  return `<span class="status-word ${cls}">${icon}${word}</span>`;
}

function renderPeopleListRowHTML(char) {
  const role = getCharacterRoleLabel(char);
  const gang = getGangLabel(char);
  let roleLine = role;
  let roleCls = '';
  if (gang) {
    roleLine = `${role} · ${gang.text}`;
    roleCls = turfZoneClass(char.gangAffiliation);
  }
  return `
    <li class="list-row people-list-row" data-character="${char.id}">
      <div class="people-list-portrait">
        ${portraitHTML(char, 'portrait-people')}
      </div>
      <div class="list-row-info">
        <div class="list-row-name">${char.name}</div>
        <div class="list-row-role ${roleCls}">${roleLine}</div>
        ${relationshipStatusHTML(char.relationshipToPlayer)}
      </div>
      <span class="list-row-chevron" aria-hidden="true">›</span>
    </li>`;
}

function renderListRowHTML(char) {
  const role = getCharacterRoleLabel(char);
  const gang = getGangLabel(char);
  const relCls = char.relationshipToPlayer || 'neutral';
  let roleLine = role;
  let roleCls = '';
  if (gang) {
    roleLine = `${role} · ${gang.text}`;
    roleCls = turfZoneClass(char.gangAffiliation);
  }
  return `
    <li class="list-row" data-character="${char.id}">
      ${portraitHTML(char)}
      <div class="list-row-info">
        <div class="list-row-name">${char.name}</div>
        <div class="list-row-role ${roleCls}">${roleLine}</div>
        <span class="status-word ${relCls}">${formatRelationshipWord(char.relationshipToPlayer)}</span>
        ${formatNpcSightingHTML(char.id)}
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
      <div style="position:absolute;left:15%;top:50%;width:12px;height:12px;background:#fff;border:2px solid #2a1f18;border-radius:50%"></div>
      <div class="travel-route-line" style="left:15%;top:50%;width:${Math.min(len * 0.5, 200)}px;transform:rotate(${angle}deg)"></div>
      <div class="location-pin has-sprite idx-${to.iconIndex ?? 0}" style="position:absolute;left:72%;top:36%"></div>`;
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
    applyPortraitToElement(portrait, character, 'portrait-lg');
    portrait.classList.remove('hidden');
  } else {
    portrait.classList.add('hidden');
  }

  const actions = document.getElementById('encounter-actions');
  actions.innerHTML = '';
  choices.forEach(c => {
    addActionRow(actions, c.label, c.sub || '', c.action, c.danger, c.icon);
  });

  updateFooterCash();
  modal.classList.remove('hidden');
  hideOtherPanels('encounter-modal');
}

function closeEncounterModal() {
  document.getElementById('encounter-modal').classList.add('hidden');
  setInteractionPaused(false);
}

function renderUsuallyHereRowHTML(char) {
  const role = getCharacterRoleLabel(char);
  const gang = getGangLabel(char);
  const roleLine = gang ? `${role} · ${gang.text}` : role;
  return `
    <li class="list-row list-row-static">
      ${portraitHTML(char)}
      <div class="list-row-info">
        <div class="list-row-name">${char.name}</div>
        <div class="list-row-sub">${roleLine}</div>
      </div>
    </li>`;
}

function openLocationPanel(locationId) {
  const state = getState();
  const loc = LOCATIONS[locationId];
  if (!loc) return;

  setInteractionPaused(true);
  switchTab('map');

  const isHere = locationId === state.player.position;
  const panel = document.getElementById('location-panel');
  panel.classList.toggle('location-panel--here', isHere);
  panel.classList.toggle('location-panel--remote', !isHere);

  if (isHere) {
    observeNpcSightingsAtLocation(locationId);
  }

  document.getElementById('location-name').textContent = loc.name.toUpperCase();

  const list = document.getElementById('location-characters');
  const actions = document.getElementById('location-actions');
  actions.innerHTML = '';

  if (isHere) {
    document.getElementById('location-people-label').textContent = 'People here';

    const chars = getCharactersAtLocation(locationId);
    if (chars.length === 0) {
      list.innerHTML = '<li class="list-row list-row-static"><div class="list-row-info"><div class="list-row-sub">Nobody around.</div></div></li>';
    } else {
      list.innerHTML = chars.map(c => renderListRowHTML(c)).join('');
      bindListRows(list);
    }

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
  } else {
    document.getElementById('location-people-label').textContent = 'Usually here';

    const usual = getKnownCharactersUsuallyAtLocation(locationId);
    if (usual.length === 0) {
      list.innerHTML = '<li class="list-row list-row-static"><div class="list-row-info"><div class="list-row-sub">Nobody you know well enough to say.</div></div></li>';
    } else {
      list.innerHTML = usual.map(c => renderUsuallyHereRowHTML(c)).join('');
    }
  }

  const travelBtn = document.getElementById('location-travel');
  const leaveBtn = document.getElementById('location-leave');
  const footer = document.querySelector('.location-sheet-footer');

  if (isHere) {
    travelBtn.classList.add('hidden');
    travelBtn.onclick = null;
    leaveBtn.textContent = 'Close';
    leaveBtn.classList.remove('hidden');
    footer.classList.remove('hidden');
  } else {
    footer.classList.remove('hidden');
    leaveBtn.textContent = 'Close';
    leaveBtn.classList.remove('hidden');
    if (canPlayerMove()) {
      const minutes = calculateTravelMinutes(state.player.position, locationId);
      const risk = getTravelRiskWarning(state.player.position, locationId);
      travelBtn.textContent = risk ? `Travel (${minutes} min) · Risky` : `Travel (${minutes} min)`;
      travelBtn.classList.remove('hidden');
      travelBtn.onclick = () => {
        closeLocationPanel();
        startTravel(locationId);
      };
    } else {
      travelBtn.classList.add('hidden');
      travelBtn.onclick = null;
    }
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
  const roleLabel = getCharacterRoleLabel(char);
  const gang = getGangLabel(char);
  applyPortraitToElement(document.getElementById('character-portrait'), char, 'portrait-hero');
  document.getElementById('character-sheet-title').textContent = '';
  document.getElementById('character-name').textContent = char.name;
  document.getElementById('character-role').textContent = gang ? `${roleLabel} · ${gang.text}` : tag.text;
  document.getElementById('character-role').className = `tag ${gang ? gang.cls : tag.cls}`;
  const relEl = document.getElementById('character-relationship');
  relEl.textContent = `Relationship: ${formatRelationshipWord(char.relationshipToPlayer)}`;
  relEl.className = `status-word ${char.relationshipToPlayer}`;
  document.getElementById('character-sightings').innerHTML = formatNpcSightingHTML(characterId);
  document.getElementById('character-dialogue').textContent = getDialogue(char);

  const actions = document.getElementById('character-actions');
  actions.innerHTML = '';

  addActionRow(actions, 'Talk', 'See what they know', () => {
    const tips = shareWordOfMouth(characterId);
    let line = getDialogue(char);
    if (tips.length === 1) {
      line += ` "You ought to check out ${tips[0]}."`;
      addLog(`${char.name} tells you about ${tips[0]}.`);
    } else if (tips.length > 1) {
      line += ` "I can point you to a few places around town."`;
      addLog(`${char.name} mentions ${tips.join(', ')}.`);
    }
    document.getElementById('character-dialogue').textContent = line;
    if (tips.length > 0) renderAll();
  }, false, '💬');

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
    }, false, '💼');
  }

  if (canMugTarget(char)) {
    addActionRow(actions, 'Mug', 'Take their cash', () => {
      const result = performMugging(characterId);
      showResultToast(result.message, result.success);
      renderAll();
      if (result.injured) {
        closeCharacterPanel();
      } else {
        openCharacterPanel(characterId);
      }
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
            { label: 'Escalate', sub: 'Risk a fight', icon: '⚠', action: () => {
              const esc = escalateExtortion(characterId);
              showResultToast(esc.message, esc.success);
              renderAll();
              closeEncounterModal();
              closeCharacterPanel();
            }, danger: true },
            { label: 'Back down', sub: 'Walk away', icon: '←', action: () => {
              showResultToast('You walked away.', true);
              closeEncounterModal();
            }},
          ], false);
        } else {
          showResultToast(result.message, false);
        }
      }, false, '✊');
    }
  }

  if (char.sellsWeapons && char.relationshipToPlayer !== 'grudge') {
    addActionRow(actions, 'Buy weapon', 'Cash only', () => {
      actions.innerHTML = '';
      getWeaponShopItems().forEach(w => {
        addWeaponShopRow(actions, w, () => {
          const result = buyWeapon(w.id);
          showResultToast(result.message, result.success);
          renderAll();
          if (result.success) openCharacterPanel(characterId);
        });
      });
      addActionRow(actions, 'Back', 'Return to actions', () => openCharacterPanel(characterId), false, '←');
    }, false, '🔫');
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
      { label: 'Stand your ground', sub: 'Risk a fight', icon: '⚠', action: () => finish(handleShakedownFight(character.id)), danger: true },
      { label: 'Pay up', sub: 'Lose some cash', icon: '✕', action: () => finish(handleShakedownPay(character.id)) },
      { label: 'Run', sub: 'Try to get away', icon: '🏃', action: () => finish(handleShakedownRun(character.id)) },
    ],
    true
  );
}

function setMenuBtnExpanded(open) {
  const btn = document.getElementById('menu-btn');
  btn.setAttribute('aria-expanded', open ? 'true' : 'false');
}

function closeAllMenus() {
  document.getElementById('menu-screen').classList.add('hidden');
  setInteractionPaused(false);
  setMenuBtnExpanded(false);
}

function toggleSettings() {
  const screen = document.getElementById('menu-screen');
  if (!screen.classList.contains('hidden')) {
    closeAllMenus();
    return;
  }
  openSettings();
}

function openSettings() {
  setInteractionPaused(true);
  const content = document.getElementById('menu-screen-content');
  content.innerHTML = renderSettingsScreen();
  document.getElementById('settings-reset')?.addEventListener('click', handleResetGame);
  document.getElementById('menu-screen').classList.remove('hidden');
  setMenuBtnExpanded(true);
  hideOtherPanels('menu-screen');
}

function renderSettingsScreen() {
  return `<div class="settings-page">
    <h1 class="settings-brand">Gangsters</h1>
    <div class="section-block">
      <p class="dialogue" style="font-size:14px">Use the time controls at the bottom of the screen to pause or change game speed. Opening this menu pauses time automatically.</p>
    </div>
    <div class="section-block">
      <button class="btn btn-danger-outline" id="settings-reset">Reset Game</button>
    </div>
  </div>`;
}

function handleResetGame() {
  if (!window.confirm('Start over? All progress will be lost.')) return;
  closeAllMenus();
  closeAllPanels();
  if (callbacks.onResetGame) callbacks.onResetGame();
  else {
    resetGame();
    renderAll();
  }
}

function showResultToast(message, success) {
  const el = document.getElementById('result-toast');
  el.textContent = message;
  el.className = success ? 'success' : 'failure';
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 2500);
}

function addWeaponShopRow(container, weapon, handler) {
  const btn = document.createElement('button');
  btn.className = 'shop-weapon-row';
  btn.innerHTML = `
    ${weaponIconHTML(weapon)}
    <span class="action-row-body">
      <span class="action-title">${weapon.name}</span>
      <span class="action-sub">$${weapon.cost}</span>
    </span>`;
  btn.addEventListener('click', handler);
  container.appendChild(btn);
}

function addActionRow(container, title, sub, handler, danger, icon) {
  const btn = document.createElement('button');
  btn.className = `action-row${danger ? ' danger' : ''}`;
  btn.innerHTML = `
    ${icon ? `<span class="action-row-icon">${icon}</span>` : ''}
    <span class="action-row-body">
      <span class="action-title">${title}</span>
      ${sub ? `<span class="action-sub">${sub}</span>` : ''}
    </span>`;
  btn.addEventListener('click', handler);
  container.appendChild(btn);
}

function addActionButton(container, label, handler) {
  addActionRow(container, label, '', handler);
}

function hideOtherPanels(exceptId) {
  ['location-panel', 'character-panel', 'job-panel', 'encounter-modal', 'menu-screen']
    .filter(id => id !== exceptId)
    .forEach(id => document.getElementById(id).classList.add('hidden'));
}

function isAnyPanelOpen() {
  return ['location-panel', 'character-panel', 'job-panel', 'encounter-modal',
    'travel-modal', 'menu-screen']
    .some(id => !document.getElementById(id).classList.contains('hidden'));
}

function showTravelOverlay(text, show) {
  if (!show) hideTravelModal();
}
