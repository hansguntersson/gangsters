import { CONFIG } from './config.js';
import { LOCATIONS } from './data.js';
import {
  getState, formatClock, isNight, setPaused, getDialogue,
} from './engine.js';
import {
  getCharactersAtLocation, getLocationTypeClass, getTurfZones,
  getJobTimeRemaining, getExtortionStatus, getNextCollectionDay,
} from './world.js';
import {
  canMugTarget, performMugging, initiateExtortion, escalateExtortion,
  collectExtortion, acceptJob, executeHijackJob, executeDeliveryJob,
  buyWeapon, buyVehicle, buyMedicine, getAvailableJobsForCharacter,
  getWeaponShopItems, getVehicleShopItems,
  handleShakedownPay, handleShakedownFight, handleShakedownRun,
} from './actions.js';

let callbacks = {};

export function initUI(cbs = {}) {
  callbacks = cbs;
  bindStaticEvents();
}

function bindStaticEvents() {
  document.getElementById('location-leave').addEventListener('click', closeLocationPanel);
  document.getElementById('character-leave').addEventListener('click', closeCharacterPanel);
  document.getElementById('job-decline').addEventListener('click', closeJobPanel);
  document.getElementById('slide-close').addEventListener('click', closeSlidePanel);
  document.getElementById('help-close').addEventListener('click', () => {
    document.getElementById('help-panel').classList.add('hidden');
    setPaused(false);
  });

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const panel = btn.dataset.panel;
      if (panel === 'crew') return;
      if (panel === 'help') {
        showHelp();
        return;
      }
      showSlidePanel(panel);
    });
  });
}

export function renderAll() {
  renderStatusBar();
  renderEventLog();
  renderMap();
  renderInjuryBanner();
}

function renderStatusBar() {
  const state = getState();
  document.getElementById('clock-display').textContent = formatClock();
  document.getElementById('cash-display').textContent = `$${state.player.cash}`;
}

function renderEventLog() {
  const state = getState();
  const el = document.getElementById('event-log');
  const entries = state.log.slice(0, CONFIG.LOG_DISPLAY_COUNT);
  el.innerHTML = entries.map(e => `<div class="log-entry">${e}</div>`).join('');
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
    banner.textContent = `INJURED — ${hrs}h recovery remaining`;
    banner.classList.remove('hidden');
  } else if (banner) {
    banner.remove();
  }
}

export function renderMap() {
  const state = getState();
  const map = document.getElementById('map');
  map.className = isNight() ? 'night' : 'day';

  const turfLayer = document.getElementById('turf-layer');
  turfLayer.innerHTML = getTurfZones().map(z => `
    <div class="turf-zone ${z.gang === 'gang_a' ? 'gang-a' : 'gang-b'}"
         style="left:${z.x}px;top:${z.y}px;width:${z.w}px;height:${z.h}px"></div>
  `).join('');

  const locLayer = document.getElementById('locations-layer');
  const playerPos = state.player.position;
  const playerLoc = LOCATIONS[playerPos];

  locLayer.innerHTML = Object.values(LOCATIONS).map(loc => {
    const isCurrent = loc.id === playerPos;
    const typeClass = getLocationTypeClass(loc.type);
    return `
      <div class="location-node ${typeClass} ${isCurrent ? 'current' : ''}"
           data-location="${loc.id}"
           style="left:${loc.x}px;top:${loc.y}px">
        <div class="pin"><span class="pin-inner">${loc.icon}</span></div>
        <span class="label">${loc.name}</span>
      </div>
    `;
  }).join('');

  locLayer.querySelectorAll('.location-node').forEach(node => {
    node.addEventListener('click', () => {
      const locId = node.dataset.location;
      if (callbacks.onLocationTap) callbacks.onLocationTap(locId);
    });
  });

  const marker = document.getElementById('player-marker');
  if (playerLoc) {
    marker.style.left = `${playerLoc.x}px`;
    marker.style.top = `${playerLoc.y}px`;
    marker.classList.toggle('traveling', state.player.inTransit);
  }
}

export function showTravelOverlay(text, show) {
  const el = document.getElementById('travel-overlay');
  if (show) {
    document.getElementById('travel-text').textContent = text;
    el.classList.remove('hidden');
  } else {
    el.classList.add('hidden');
  }
}

export function showResultToast(message, success) {
  const el = document.getElementById('result-toast');
  el.textContent = message;
  el.className = success ? 'success' : 'failure';
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 2500);
}

export function openLocationPanel(locationId) {
  const state = getState();
  const loc = LOCATIONS[locationId];
  if (!loc) return;

  setPaused(true);
  const panel = document.getElementById('location-panel');
  document.getElementById('location-name').textContent = loc.name;

  const chars = getCharactersAtLocation(locationId);
  const list = document.getElementById('location-characters');
  if (chars.length === 0) {
    list.innerHTML = '<li style="cursor:default;color:var(--text-dim)">Nobody around.</li>';
  } else {
    list.innerHTML = chars.map(c => `
      <li data-character="${c.id}">
        <span>${c.name}</span>
        <span class="char-type">${c.type.replace('_', ' ')}</span>
      </li>
    `).join('');

    list.querySelectorAll('li[data-character]').forEach(li => {
      li.addEventListener('click', () => openCharacterPanel(li.dataset.character));
    });
  }

  const actions = document.getElementById('location-actions');
  actions.innerHTML = '';

  const agreement = state.extortionAgreements.find(a => a.businessId === locationId);
  if (agreement) {
    const status = getExtortionStatus(agreement);
    if (status.due) {
      const btn = document.createElement('button');
      btn.className = 'btn btn-primary';
      btn.textContent = `COLLECT $${agreement.weeklyAmount}`;
      btn.addEventListener('click', () => {
        const result = collectExtortion(locationId);
        showResultToast(result.message, result.success);
        if (result.success) renderAll();
        closeLocationPanel();
      });
      actions.appendChild(btn);
    }
  }

  if (loc.type === 'pharmacy') {
    const btn = document.createElement('button');
    btn.className = 'btn btn-primary';
    btn.textContent = `BUY MEDICINE ($${CONFIG.MEDICINE_COST})`;
    btn.addEventListener('click', () => {
      const result = buyMedicine();
      showResultToast(result.message, result.success);
      renderAll();
    });
    actions.appendChild(btn);
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
    const btn = document.createElement('button');
    btn.className = 'btn btn-primary';
    btn.textContent = activeJob.type === 'hijack' ? 'EXECUTE HIJACK' :
      (activeJob.phase === 'pickup' ? 'PICK UP PACKAGE' : 'DELIVER PACKAGE');
    btn.addEventListener('click', () => {
      const result = activeJob.type === 'hijack'
        ? executeHijackJob(activeJob)
        : executeDeliveryJob(activeJob);
      showResultToast(result.message, result.success);
      renderAll();
      if (result.injured) closeLocationPanel();
    });
    actions.appendChild(btn);
  }

  panel.classList.remove('hidden');
  hideOtherPanels('location-panel');
}

export function closeLocationPanel() {
  document.getElementById('location-panel').classList.add('hidden');
  setPaused(false);
  renderAll();
}

let currentCharacterId = null;
let pendingJobTemplate = null;
let pendingJobIssuer = null;

export function openCharacterPanel(characterId) {
  const state = getState();
  const char = state.characters[characterId];
  if (!char) return;

  currentCharacterId = characterId;
  setPaused(true);

  const panel = document.getElementById('character-panel');
  document.getElementById('character-name').textContent = char.name;
  document.getElementById('character-dialogue').textContent = `"${getDialogue(char)}"`;

  const actions = document.getElementById('character-actions');
  actions.innerHTML = '';

  addActionButton(actions, 'Talk', () => {
    document.getElementById('character-dialogue').textContent = `"${getDialogue(char)}"`;
  });

  const jobs = getAvailableJobsForCharacter(char);
  if (jobs.length > 0 && char.relationshipToPlayer !== 'grudge') {
    addActionButton(actions, 'Jobs', () => {
      if (jobs.length === 1) {
        showJobPanel(jobs[0], characterId);
      } else {
        jobs.forEach(job => {
          addActionButton(actions, job.description, () => showJobPanel(job, characterId));
        });
      }
    });
  }

  if (canMugTarget(char)) {
    addActionButton(actions, 'Mug', () => {
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
      addActionButton(actions, 'Extort', () => {
        const result = initiateExtortion(characterId);
        if (result.type === 'accepted') {
          showResultToast(result.message, true);
          renderAll();
        } else if (result.type === 'refused') {
          showChoicePanel('Extortion', result.message, [
            { label: 'Escalate (fight)', action: () => {
              const esc = escalateExtortion(characterId);
              showResultToast(esc.message, esc.success);
              renderAll();
              closeChoicePanel();
              closeCharacterPanel();
            }},
            { label: 'Back down', action: () => {
              showResultToast('You walked away.', true);
              closeChoicePanel();
            }},
          ]);
        } else {
          showResultToast(result.message, false);
        }
      });
    }
  }

  if (char.sellsWeapons && char.relationshipToPlayer !== 'grudge') {
    addActionButton(actions, 'Buy Weapon', () => {
      getWeaponShopItems().forEach(w => {
        addActionButton(actions, `${w.name} — $${w.cost}`, () => {
          const result = buyWeapon(w.id);
          showResultToast(result.message, result.success);
          renderAll();
        });
      });
    });
  }

  if (char.sellsVehicles && char.relationshipToPlayer !== 'grudge') {
    addActionButton(actions, 'Buy Vehicle', () => {
      getVehicleShopItems().forEach(v => {
        addActionButton(actions, `${v.name} — $${v.cost}`, () => {
          const result = buyVehicle(v.id);
          showResultToast(result.message, result.success);
          renderAll();
        });
      });
    });
  }

  panel.classList.remove('hidden');
  hideOtherPanels('character-panel');
}

export function closeCharacterPanel() {
  document.getElementById('character-panel').classList.add('hidden');
  currentCharacterId = null;
  setPaused(false);
  renderAll();
}

function showJobPanel(template, issuedBy) {
  pendingJobTemplate = template;
  pendingJobIssuer = issuedBy;

  const panel = document.getElementById('job-panel');
  document.getElementById('job-title').textContent = template.title;

  let details = `<p>${template.description}</p>`;
  if (template.type === 'hijack') {
    details += `<p><span class="label">Where: </span>${LOCATIONS[template.targetLocation]?.name}</p>`;
    details += `<p><span class="label">Window: </span>${template.timeWindow.fromHour}:00 – ${template.timeWindow.toHour}:00</p>`;
    details += `<p><span class="label">Reward: </span>$${template.reward}</p>`;
    details += `<p><span class="label">Risk: </span>${template.risk}</p>`;
    details += `<p><span class="label">Vehicle: </span>${template.vehicleRequired ? 'Required' : 'No'}</p>`;
  } else {
    details += `<p><span class="label">From: </span>${LOCATIONS[template.pickupLocation]?.name}</p>`;
    details += `<p><span class="label">To: </span>${LOCATIONS[template.dropoffLocation]?.name}</p>`;
    details += `<p><span class="label">Time limit: </span>${template.timeLimitHours} hours</p>`;
    details += `<p><span class="label">Reward: </span>$${template.reward}</p>`;
    details += `<p><span class="label">Vehicle: </span>${template.vehicleRequired ? 'Required' : 'No'}</p>`;
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
  pendingJobTemplate = null;
  pendingJobIssuer = null;
}

export function showShakedownPanel(character, onResolved) {
  setPaused(true);
  const finish = (result) => {
    showResultToast(result.message, result.success);
    closeChoicePanel();
    renderAll();
    if (result.injured && callbacks.onInjured) {
      callbacks.onInjured();
    } else if (onResolved) {
      onResolved();
    }
  };

  showChoicePanel(
    'Shakedown',
    `${character.name} steps out: "You've got some nerve around here. Empty your pockets."`,
    [
      { label: 'Stand your ground', action: () => finish(handleShakedownFight(character.id)) },
      { label: 'Pay up', action: () => finish(handleShakedownPay(character.id)) },
      { label: 'Run', action: () => finish(handleShakedownRun(character.id)) },
    ]
  );
}

function showChoicePanel(title, text, choices) {
  const panel = document.getElementById('choice-panel');
  document.getElementById('choice-title').textContent = title;
  document.getElementById('choice-text').textContent = text;

  const actions = document.getElementById('choice-actions');
  actions.innerHTML = '';
  choices.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'btn btn-choice';
    btn.textContent = `> ${c.label}`;
    btn.addEventListener('click', c.action);
    actions.appendChild(btn);
  });

  panel.classList.remove('hidden');
  hideOtherPanels('choice-panel');
}

export function closeChoicePanel() {
  document.getElementById('choice-panel').classList.add('hidden');
  setPaused(false);
}

function showSlidePanel(type) {
  setPaused(true);
  const panel = document.getElementById('slide-panel');
  const title = document.getElementById('slide-title');
  const content = document.getElementById('slide-content');
  const state = getState();

  if (type === 'inventory') {
    title.textContent = 'INVENTORY';
    const weapon = state.player.weapon ? state.weapons[state.player.weapon]?.name : 'None';
    const vehicle = state.player.vehicle ? state.vehicles[state.player.vehicle]?.name : 'None';

    let html = `<div class="slide-section">
      <p>Weapon: <strong>${weapon}</strong></p>
      <p>Vehicle: <strong>${vehicle}</strong></p>
    </div>`;

    if (state.extortionAgreements.length > 0) {
      html += `<div class="slide-section"><h3>Extortion</h3>`;
      state.extortionAgreements.forEach(a => {
        const loc = LOCATIONS[a.businessId];
        const nextDay = getNextCollectionDay(a);
        const status = getExtortionStatus(a);
        const mark = status.due ? (status.overdue ? '⚠' : '✓') : '—';
        html += `<div class="slide-item">${loc?.name || a.businessId} — Day ${nextDay} ${mark}
          <div class="dim">$${a.weeklyAmount}/week</div></div>`;
      });
      html += '</div>';
    }

    if (state.acceptedJobs.length > 0) {
      html += `<div class="slide-section"><h3>Active Jobs</h3>`;
      state.acceptedJobs.forEach(j => {
        let sub = j.description;
        if (j.type === 'delivery') {
          const remaining = getJobTimeRemaining(j);
          sub += `<div class="dim">Time left: ${remaining}h — Phase: ${j.phase}</div>`;
        } else {
          sub += `<div class="dim">Target: ${LOCATIONS[j.targetLocation]?.name}</div>`;
        }
        html += `<div class="slide-item">${sub}</div>`;
      });
      html += '</div>';
    }

    content.innerHTML = html;
  } else if (type === 'jobs') {
    title.textContent = 'JOBS';
    if (state.acceptedJobs.length === 0) {
      content.innerHTML = '<p class="dialogue">No active jobs. Talk to hustlers and gang members for work.</p>';
    } else {
      content.innerHTML = state.acceptedJobs.map(j => {
        let info = `<strong>${j.title}</strong><br>${j.description}`;
        if (j.type === 'delivery') {
          info += `<div class="dim">Pickup: ${LOCATIONS[j.pickupLocation]?.name} → ${LOCATIONS[j.dropoffLocation]?.name}</div>`;
          info += `<div class="dim">Time left: ${getJobTimeRemaining(j)}h | Phase: ${j.phase}</div>`;
        } else {
          info += `<div class="dim">Go to ${LOCATIONS[j.targetLocation]?.name} (${j.timeWindow.fromHour}:00–${j.timeWindow.toHour}:00)</div>`;
        }
        return `<div class="slide-item">${info}</div>`;
      }).join('');
    }
  }

  panel.classList.remove('hidden');
  hideOtherPanels('slide-panel');

  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.nav-btn[data-panel="${type}"]`)?.classList.add('active');
}

function closeSlidePanel() {
  document.getElementById('slide-panel').classList.add('hidden');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  setPaused(false);
}

function showHelp() {
  setPaused(true);
  document.getElementById('help-panel').classList.remove('hidden');
  hideOtherPanels('help-panel');
}

function addActionButton(container, label, handler) {
  const btn = document.createElement('button');
  btn.className = 'btn btn-choice';
  btn.textContent = `> ${label}`;
  btn.addEventListener('click', handler);
  container.appendChild(btn);
}

function hideOtherPanels(exceptId) {
  ['location-panel', 'character-panel', 'job-panel', 'choice-panel', 'slide-panel', 'help-panel']
    .filter(id => id !== exceptId)
    .forEach(id => document.getElementById(id).classList.add('hidden'));
}

export function isAnyPanelOpen() {
  return !document.getElementById('location-panel').classList.contains('hidden') ||
    !document.getElementById('character-panel').classList.contains('hidden') ||
    !document.getElementById('job-panel').classList.contains('hidden') ||
    !document.getElementById('choice-panel').classList.contains('hidden') ||
    !document.getElementById('slide-panel').classList.contains('hidden') ||
    !document.getElementById('help-panel').classList.contains('hidden');
}
