// Sprite indices: 0–7 on location-icons.PNG; 8 = intersection.png
var LOCATION_ICON = {
  HOME: 0,
  TENEMENT: 1,
  SHOPFRONT: 2,
  WAREHOUSE: 3,
  FACTORY: 4,
  CAR_PARK: 5,
  PARK: 6,
  PIER: 7,
  INTERSECTION: 8,
};

var LOCATIONS = buildAllLocations();

var TURF_ZONES = buildTurfZones();
// Individual portrait images: images/portrait_N.png
var PORTRAIT_MAP = {
  mickey:        'images/portrait_1.png',
  tony:          'images/portrait_2.png',
  maria:         'images/portrait_3.png',
  vinny:         'images/portrait_4.png',
  marco:         'images/portrait_5.png',
  eddie:         'images/portrait_6.png',
  slim:          'images/portrait_7.png',
  rico:          'images/portrait_8.png',
  sal:           'images/portrait_10.png',
  mrs_patterson: 'images/portrait_11.png',
  pete:          'images/portrait_12.png',
  jimmy:         'images/portrait_13.png',
  old_joe:       'images/portrait_14.png',
  frank:         'images/portrait_16.png',
  gus:           'images/portrait_17.png',
  tom:           'images/portrait_18.png',
};

function migratePortraitRef(portrait, charId) {
  if (!portrait) return PORTRAIT_MAP[charId] || null;
  if (typeof portrait === 'string') return portrait;
  if (portrait.src) return portrait.src;
  if (portrait.sheet != null && portrait.index != null) {
    const n = (portrait.sheet - 1) * 6 + portrait.index + 1;
    return `images/portrait_${n}.png`;
  }
  return PORTRAIT_MAP[charId] || null;
}

function npcTable(primaryLocationId, primaryWeight = 0.9, randomWeight = 0.1) {
  return {
    fixed: [{ locationId: primaryLocationId, weight: primaryWeight }],
    randomWeight,
    randomPool: 'neutral_and_home_turf',
  };
}

function npcTableMulti(fixedEntries, randomWeight = 0.05) {
  return {
    fixed: fixedEntries,
    randomWeight,
    randomPool: 'neutral_and_home_turf',
  };
}

function char(id, name, type, opts = {}) {
  return {
    id,
    name,
    type,
    role: opts.role || type,
    gangAffiliation: opts.gang || null,
    homeTurfId: opts.homeTurfId ?? opts.gang ?? null,
    locationTable: opts.locationTable || null,
    traits: opts.traits || {
      brainy_brawny: 0,
      indulgent_spartan: 0,
      restless_reliable: 0,
      social_discreet: 0,
      loyal_opportunistic: 0,
      ambitious_complacent: 0,
      intimidating_diplomatic: 0,
    },
    relationshipToPlayer: 'neutral',
    jobsOffered: opts.jobsOffered || [],
    sellsWeapons: opts.sellsWeapons || false,
    sellsVehicles: opts.sellsVehicles || false,
    isBusinessOwner: opts.isBusinessOwner || false,
    portrait: opts.portrait || PORTRAIT_MAP[id] || null,
    dialogue: opts.dialogue || {
      neutral: ['What do you want?', 'Can I help you?'],
      friendly: ['Good to see you.', 'Always a pleasure.'],
      grudge: ['Get lost.', "You've got nerve showing your face."],
    },
    revealsLocations: opts.revealsLocations || [],
  };
}

var CHARACTERS = {
  // The Longshoremen (waterfront)
  frank: char('frank', 'Frank O\'Malley', 'gang_member', {
    gang: 'longshoremen',
    role: 'crew',
    locationTable: npcTableMulti([
      { locationId: 'l030', weight: 0.55 },
      { locationId: 'l017', weight: 0.4 },
    ]),
    traits: { brainy_brawny: 2, intimidating_diplomatic: -2 },
    jobsOffered: ['delivery_longshore'],
    dialogue: {
      neutral: ['State your business.', 'This pier runs on our say-so.'],
      friendly: ['Good to see a reliable face.', 'Got a job for you.'],
      grudge: ['Wrong waterfront.', 'Pay up or swim home.'],
    },
  }),
  rico: char('rico', 'Rico Santos', 'gang_member', {
    gang: 'longshoremen',
    role: 'crew',
    locationTable: npcTableMulti([
      { locationId: 'l030', weight: 0.7 },
      { locationId: 'l040', weight: 0.25 },
    ]),
    traits: { brainy_brawny: 1, restless_reliable: 1 },
    dialogue: {
      neutral: ['What do you need?', 'Keep moving.'],
      friendly: ['Hey.', 'I might have something.'],
      grudge: ['Trouble follows you.', 'Get off the docks.'],
    },
  }),
  jimmy: char('jimmy', 'Jimmy Doyle', 'gang_member', {
    gang: 'longshoremen',
    role: 'crew',
    locationTable: npcTableMulti([
      { locationId: 'l014', weight: 0.55 },
      { locationId: 'l030', weight: 0.4 },
    ]),
    traits: { brainy_brawny: 0, ambitious_complacent: -1 },
    dialogue: {
      neutral: ['Yeah?', 'What?'],
      friendly: ['Good to see you.', 'Stick around.'],
      grudge: ['You.', 'Bad idea on the waterfront.'],
    },
  }),

  // Factory Boys
  tony: char('tony', 'Tony Russo', 'gang_member', {
    gang: 'factory_boys',
    role: 'crew',
    locationTable: npcTableMulti([
      { locationId: 'l031', weight: 0.6 },
      { locationId: 'l033', weight: 0.35 },
    ]),
    traits: { brainy_brawny: 2, intimidating_diplomatic: -2 },
    jobsOffered: ['delivery_factory'],
    dialogue: {
      neutral: ['What do you want?', 'Factory turf. Watch yourself.'],
      friendly: ['Good to see you.', "I've got work if you need it."],
      grudge: ["You've got nerve around here.", 'Empty your pockets or else.'],
    },
  }),
  vinny: char('vinny', 'Vinny Costa', 'gang_member', {
    gang: 'factory_boys',
    role: 'crew',
    locationTable: npcTableMulti([
      { locationId: 'l031', weight: 0.7 },
      { locationId: 'l033', weight: 0.25 },
    ]),
    traits: { brainy_brawny: 1, loyal_opportunistic: -1 },
    dialogue: {
      neutral: ['Yeah?', 'Make it quick.'],
      friendly: ['Hey, friend.', 'Need something?'],
      grudge: ['You again?', 'Walk away. Now.'],
    },
  }),
  marco: char('marco', 'Marco Bellini', 'gang_member', {
    gang: 'factory_boys',
    role: 'crew',
    locationTable: npcTableMulti([
      { locationId: 'l031', weight: 0.45 },
      { locationId: 'l024', weight: 0.3 },
      { locationId: 'l004', weight: 0.2 },
    ]),
    traits: { brainy_brawny: 1, social_discreet: 1 },
    dialogue: {
      neutral: ['What?', 'Busy.'],
      friendly: ['Good timing.', 'How can I help?'],
      grudge: ['Problem?', "Don't push your luck."],
    },
  }),

  // Riverside Syndicate
  pete: char('pete', 'Pete the Fence', 'hustler', {
    gang: 'riverside_syndicate',
    role: 'crew',
    locationTable: npcTableMulti([
      { locationId: 'l003', weight: 0.65 },
      { locationId: 'l014', weight: 0.3 },
    ]),
    traits: { brainy_brawny: 0, social_discreet: 2 },
    sellsWeapons: true,
    dialogue: {
      neutral: ['Looking for hardware?', 'Cash only.'],
      friendly: ['For you, I got options.', 'Best prices in town.'],
      grudge: ['No deals.', 'You bring too much heat.'],
    },
  }),

  // Oakwood Crew
  mickey: char('mickey', 'Mickey D', 'hustler', {
    gang: 'oakwood_crew',
    role: 'crew',
    locationTable: npcTableMulti([
      { locationId: 'l048', weight: 0.55 },
      { locationId: 'l010', weight: 0.4 },
    ]),
    traits: { brainy_brawny: -1, restless_reliable: 1 },
    jobsOffered: ['hijack_1', 'hijack_2'],
    revealsLocations: ['l014', 'l033'],
    dialogue: {
      neutral: ['What do you want?', 'I might have something for you.'],
      friendly: ['Good to see you.', "I've been saving this one for you."],
      grudge: ['Get lost before I make you.', "You've got nerve."],
    },
  }),
  eddie: char('eddie', 'Eddie Shaw', 'hustler', {
    gang: 'oakwood_crew',
    role: 'associate',
    locationTable: npcTableMulti([
      { locationId: 'l048', weight: 0.45 },
      { locationId: 'l010', weight: 0.35 },
      { locationId: 'l047', weight: 0.15 },
    ]),
    traits: { brainy_brawny: 0, social_discreet: -1 },
    jobsOffered: ['hijack_3', 'delivery_h1'],
    revealsLocations: ['l010', 'l041'],
    dialogue: {
      neutral: ['Need something?', 'Talk fast.'],
      friendly: ['Hey, reliable as always.', 'Got a proposition.'],
      grudge: ['Not interested.', 'Walk away.'],
    },
  }),
  slim: char('slim', 'Slim Jenkins', 'dealer', {
    gang: 'oakwood_crew',
    role: 'associate',
    locationTable: npcTableMulti([
      { locationId: 'l048', weight: 0.55 },
      { locationId: 'l047', weight: 0.4 },
    ]),
    traits: { brainy_brawny: -1, social_discreet: 2 },
    revealsLocations: ['l045', 'l046'],
    dialogue: {
      neutral: ['Keep it quiet.', 'What?'],
      friendly: ['Good to see a face I trust.', 'Business is good.'],
      grudge: ['You bring heat.', 'Not today.'],
    },
  }),

  // Business owners
  maria: char('maria', 'Maria Rossi', 'civilian', {
    role: 'storekeeper',
    locationTable: npcTable('l010', 0.92),
    traits: { brainy_brawny: -2, intimidating_diplomatic: -2 },
    isBusinessOwner: true,
    dialogue: {
      neutral: ['Can I help you?', 'Coffee or a sandwich?'],
      friendly: ['Welcome back.', 'What can I get you?'],
      grudge: ['I want you out of my place.', 'No trouble in here.'],
    },
  }),
  sal: char('sal', 'Sal Moretti', 'civilian', {
    role: 'storekeeper',
    locationTable: npcTable('l024', 0.95),
    traits: { brainy_brawny: -1, intimidating_diplomatic: -1 },
    isBusinessOwner: true,
    dialogue: {
      neutral: ['What can I get you?', 'Fresh bread today.'],
      friendly: ['Good to see you.', 'The usual?'],
      grudge: ['I don\'t want trouble.', 'Leave my shop alone.'],
    },
  }),

  // Civilians
  mrs_patterson: char('mrs_patterson', 'Mrs. Patterson', 'civilian', {
    role: 'law',
    locationTable: npcTableMulti([
      { locationId: 'l001', weight: 0.6 },
      { locationId: 'l047', weight: 0.35 },
    ]),
    traits: { brainy_brawny: -2, loyal_opportunistic: -1 },
    dialogue: {
      neutral: ['Good day.', 'Lovely weather.'],
      friendly: ['Hello, dear.', 'How are you?'],
      grudge: ['Stay away from me.', 'I\'ll call the police!'],
    },
  }),
  tom: char('tom', 'Tom the Clerk', 'civilian', {
    role: 'law',
    locationTable: npcTableMulti([
      { locationId: 'l033', weight: 0.65 },
      { locationId: 'l047', weight: 0.3 },
    ]),
    traits: { brainy_brawny: -1, ambitious_complacent: 1 },
    dialogue: {
      neutral: ['Excuse me.', 'Just passing through.'],
      friendly: ['Hey.', 'What\'s up?'],
      grudge: ['Leave me alone!', 'Help!'],
    },
  }),
  old_joe: char('old_joe', 'Old Joe', 'civilian', {
    role: 'civilian',
    locationTable: npcTableMulti([
      { locationId: 'l010', weight: 0.55 },
      { locationId: 'l047', weight: 0.4 },
    ]),
    traits: { brainy_brawny: -2, indulgent_spartan: 1 },
    dialogue: {
      neutral: ['Hmm?', 'Young fella.'],
      friendly: ['Sit down, kid.', 'Good to see you.'],
      grudge: ['Troublemaker.', 'Get away from me.'],
    },
  }),

  // Services
  gus: char('gus', 'Gus Kowalski', 'mechanic', {
    role: 'associate',
    homeTurfId: 'oakwood_crew',
    locationTable: npcTable('l043', 0.95),
    traits: { brainy_brawny: 1, loyal_opportunistic: 1 },
    sellsVehicles: true,
    revealsLocations: ['l044', 'l042'],
    dialogue: {
      neutral: ['Need wheels?', 'I fix \'em, I sell \'em.'],
      friendly: ['Good customer.', 'Got something nice for you.'],
      grudge: ['No service for you.', 'Get out of my garage.'],
    },
  }),
};

var JOB_TEMPLATES = {
  hijack_1: {
    id: 'hijack_1',
    type: 'hijack',
    title: 'HIJACK JOB',
    description: 'Hit a delivery van at Riverside Warehouse Row.',
    targetLocation: 'l014',
    timeWindow: { fromHour: 20, toHour: 4 },
    reward: 45,
    risk: 'medium',
    vehicleRequired: false,
    baseChance: 0.55,
  },
  hijack_2: {
    id: 'hijack_2',
    type: 'hijack',
    title: 'HIJACK JOB',
    description: 'Snatch cargo off North Pier before dawn.',
    targetLocation: 'l017',
    timeWindow: { fromHour: 22, toHour: 5 },
    reward: 35,
    risk: 'low',
    vehicleRequired: false,
    baseChance: 0.65,
  },
  hijack_3: {
    id: 'hijack_3',
    type: 'hijack',
    title: 'HIJACK JOB',
    description: 'Grab a truck load from the factory yards.',
    targetLocation: 'l031',
    timeWindow: { fromHour: 21, toHour: 3 },
    reward: 60,
    risk: 'high',
    vehicleRequired: true,
    baseChance: 0.45,
  },
  delivery_longshore: {
    id: 'delivery_longshore',
    type: 'delivery',
    title: 'DELIVERY JOB',
    description: 'Move a package from Middle Pier to North Pier.',
    pickupLocation: 'l030',
    dropoffLocation: 'l017',
    timeLimitHours: 4,
    reward: 30,
    risk: 'low',
    vehicleRequired: false,
    baseChance: 0.8,
  },
  delivery_factory: {
    id: 'delivery_factory',
    type: 'delivery',
    title: 'DELIVERY JOB',
    description: 'Run goods from the factory to Jefferson Green.',
    pickupLocation: 'l031',
    dropoffLocation: 'l033',
    timeLimitHours: 5,
    reward: 35,
    risk: 'low',
    vehicleRequired: false,
    baseChance: 0.8,
  },
  delivery_h1: {
    id: 'delivery_h1',
    type: 'delivery',
    title: 'DELIVERY JOB',
    description: 'Haul contraband from the café to the warehouse row.',
    pickupLocation: 'l010',
    dropoffLocation: 'l014',
    timeLimitHours: 3,
    reward: 40,
    risk: 'medium',
    vehicleRequired: true,
    baseChance: 0.7,
  },
};

function getInitialKnownCharacters() {
  return ['gus', 'slim', 'eddie'];
}

function createInitialState() {
  const characters = {};
  for (const [id, template] of Object.entries(CHARACTERS)) {
    characters[id] = {
      ...template,
      relationshipToPlayer: 'neutral',
    };
  }

  for (const id of getInitialKnownCharacters()) {
    if (characters[id]) {
      characters[id].relationshipToPlayer = 'friendly';
    }
  }

  return {
    clock: { day: 1, hour: 6, minute: 0 },
    player: {
      position: 'l047',
      cash: 25,
      weapon: null,
      vehicle: null,
      injury: { injured: false, recoveryHoursRemaining: 0 },
      inTransit: false,
      transitTarget: null,
      transitEndTime: null,
    },
    characters,
    locations: { ...LOCATIONS },
    activeJobs: {},
    acceptedJobs: [],
    extortionAgreements: [],
    vehicles: { ...VEHICLES },
    weapons: { ...WEAPONS },
    log: ['You wake up in your apartment. Gus, Slim, and Eddie are the only faces you trust. The corner store and the garage are on your map — talk to people to hear about other spots.'],
    timeSpeed: 0,
    interactionPaused: false,
    knownCharacters: getInitialKnownCharacters(),
    knownLocations: getInitialKnownLocations(),
    heardRumorsFrom: [],
    npcSightingLogs: getInitialNpcSightingLogs(characters, getInitialKnownCharacters()),
    crew: [],
    pendingShakedown: null,
    gangGrudgeCount: {
      longshoremen: 0,
      factory_boys: 0,
      oakwood_crew: 0,
      riverside_syndicate: 0,
    },
  };
}
