var LOCATIONS = {
  home: {
    id: 'home',
    name: 'Your Apartment',
    type: 'home',
    x: 136,
    y: 1237,
    icon: '🏠',
    extortable: false,
    businessOwner: null,
  },
  gang_a_hq: {
    id: 'gang_a_hq',
    name: 'North Side HQ',
    type: 'gang',
    gang: 'gang_a',
    x: 205,
    y: 256,
    icon: '🔴',
    extortable: false,
    turf: 'gang_a',
  },
  gang_b_hq: {
    id: 'gang_b_hq',
    name: 'South Side HQ',
    type: 'gang',
    gang: 'gang_b',
    x: 819,
    y: 1237,
    icon: '🟢',
    extortable: false,
    turf: 'gang_b',
  },
  cafe: {
    id: 'cafe',
    name: "Maria's Café",
    type: 'neutral',
    x: 512,
    y: 597,
    icon: '☕',
    extortable: true,
    businessOwner: 'maria',
    turf: null,
  },
  deli: {
    id: 'deli',
    name: "Sal's Deli",
    type: 'neutral',
    x: 341,
    y: 811,
    icon: '🥪',
    extortable: true,
    businessOwner: 'sal',
    turf: 'gang_a',
  },
  corner_a: {
    id: 'corner_a',
    name: 'Corner A',
    type: 'corner',
    x: 273,
    y: 469,
    icon: '📍',
    extortable: false,
    turf: 'gang_a',
  },
  corner_b: {
    id: 'corner_b',
    name: 'Corner B',
    type: 'corner',
    x: 751,
    y: 683,
    icon: '📍',
    extortable: false,
    turf: 'gang_b',
  },
  garage: {
    id: 'garage',
    name: "Gus's Garage",
    type: 'garage',
    x: 649,
    y: 1024,
    icon: '🔧',
    extortable: false,
  },
  pharmacy: {
    id: 'pharmacy',
    name: 'City Pharmacy',
    type: 'pharmacy',
    x: 512,
    y: 1024,
    icon: '💊',
    extortable: false,
  },
  warehouse_district: {
    id: 'warehouse_district',
    name: 'Warehouse District',
    type: 'industrial',
    x: 853,
    y: 384,
    icon: '🏭',
    extortable: false,
    turf: 'gang_b',
  },
  residential: {
    id: 'residential',
    name: 'Elm Street',
    type: 'residential',
    x: 171,
    y: 896,
    icon: '🏘️',
    extortable: false,
    turf: 'gang_a',
  },
};

var TURF_ZONES = [
  { gang: 'gang_a', x: 68, y: 171, w: 375, h: 853 },
  { gang: 'gang_b', x: 614, y: 256, w: 375, h: 1109 },
];

// Portrait sprites: sheet 1–3, index 0–5 (3×2 grid, left-to-right, top-to-bottom)
var PORTRAIT_MAP = {
  mickey:        { sheet: 1, index: 0 },
  tony:          { sheet: 1, index: 1 },
  maria:         { sheet: 1, index: 2 },
  vinny:         { sheet: 1, index: 3 },
  marco:         { sheet: 1, index: 4 },
  eddie:         { sheet: 1, index: 5 },
  slim:          { sheet: 2, index: 0 },
  rico:          { sheet: 2, index: 1 },
  sal:           { sheet: 2, index: 3 },
  mrs_patterson: { sheet: 2, index: 4 },
  pete:          { sheet: 2, index: 5 },
  jimmy:         { sheet: 3, index: 0 },
  old_joe:       { sheet: 3, index: 1 },
  gus:           { sheet: 3, index: 4 },
  frank:         { sheet: 3, index: 3 },
  tom:           { sheet: 3, index: 5 },
};

function char(id, name, type, opts = {}) {
  return {
    id,
    name,
    type,
    gangAffiliation: opts.gang || null,
    schedule: opts.schedule || [],
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
  };
}

var CHARACTERS = {
  // Gang A
  tony: char('tony', 'Tony Russo', 'gang_member', {
    gang: 'gang_a',
    schedule: [
      { fromHour: 6, toHour: 14, locationId: 'gang_a_hq' },
      { fromHour: 14, toHour: 22, locationId: 'corner_a' },
      { fromHour: 22, toHour: 6, locationId: 'gang_a_hq' },
    ],
    traits: { brainy_brawny: 2, intimidating_diplomatic: -2 },
    jobsOffered: ['delivery_a1'],
    dialogue: {
      neutral: ['What do you want?', 'This is our turf. Watch yourself.'],
      friendly: ['Good to see you.', "I've got work if you need it."],
      grudge: ["You've got nerve around here.", 'Empty your pockets or else.'],
    },
  }),
  vinny: char('vinny', 'Vinny Costa', 'gang_member', {
    gang: 'gang_a',
    schedule: [
      { fromHour: 8, toHour: 20, locationId: 'gang_a_hq' },
      { fromHour: 20, toHour: 8, locationId: 'corner_a' },
    ],
    traits: { brainy_brawny: 1, loyal_opportunistic: -1 },
    dialogue: {
      neutral: ['Yeah?', 'Make it quick.'],
      friendly: ['Hey, friend.', 'Need something?'],
      grudge: ['You again?', 'Walk away. Now.'],
    },
  }),
  marco: char('marco', 'Marco Bellini', 'gang_member', {
    gang: 'gang_a',
    schedule: [
      { fromHour: 10, toHour: 18, locationId: 'deli' },
      { fromHour: 18, toHour: 4, locationId: 'gang_a_hq' },
      { fromHour: 4, toHour: 10, locationId: 'residential' },
    ],
    traits: { brainy_brawny: 1, social_discreet: 1 },
    dialogue: {
      neutral: ['What?', 'Busy.'],
      friendly: ['Good timing.', 'How can I help?'],
      grudge: ['Problem?', "Don't push your luck."],
    },
  }),

  // Gang B
  frank: char('frank', 'Frank O\'Malley', 'gang_member', {
    gang: 'gang_b',
    schedule: [
      { fromHour: 6, toHour: 14, locationId: 'gang_b_hq' },
      { fromHour: 14, toHour: 22, locationId: 'corner_b' },
      { fromHour: 22, toHour: 6, locationId: 'gang_b_hq' },
    ],
    traits: { brainy_brawny: 2, intimidating_diplomatic: 1 },
    jobsOffered: ['delivery_b1'],
    dialogue: {
      neutral: ['State your business.', 'This is South Side territory.'],
      friendly: ['Good to see a reliable face.', 'Got a job for you.'],
      grudge: ['You picked the wrong turf.', 'Pay up or pay the price.'],
    },
  }),
  rico: char('rico', 'Rico Santos', 'gang_member', {
    gang: 'gang_b',
    schedule: [
      { fromHour: 8, toHour: 20, locationId: 'gang_b_hq' },
      { fromHour: 20, toHour: 8, locationId: 'corner_b' },
    ],
    traits: { brainy_brawny: 1, restless_reliable: 1 },
    dialogue: {
      neutral: ['What do you need?', 'Keep moving.'],
      friendly: ['Hey.', 'I might have something.'],
      grudge: ['Trouble follows you.', 'Get out of here.'],
    },
  }),
  jimmy: char('jimmy', 'Jimmy Doyle', 'gang_member', {
    gang: 'gang_b',
    schedule: [
      { fromHour: 12, toHour: 22, locationId: 'warehouse_district' },
      { fromHour: 22, toHour: 12, locationId: 'gang_b_hq' },
    ],
    traits: { brainy_brawny: 0, ambitious_complacent: -1 },
    dialogue: {
      neutral: ['Yeah?', 'What?'],
      friendly: ['Good to see you.', 'Stick around.'],
      grudge: ['You.', 'Bad idea coming here.'],
    },
  }),

  // Hustlers & dealers
  mickey: char('mickey', 'Mickey D', 'hustler', {
    schedule: [
      { fromHour: 6, toHour: 12, locationId: 'cafe' },
      { fromHour: 12, toHour: 20, locationId: 'corner_a' },
      { fromHour: 20, toHour: 6, locationId: 'corner_a' },
    ],
    traits: { brainy_brawny: -1, restless_reliable: 1 },
    jobsOffered: ['hijack_1', 'hijack_2'],
    dialogue: {
      neutral: ['What do you want?', 'I might have something for you.'],
      friendly: ['Good to see you.', "I've been saving this one for you."],
      grudge: ['Get lost before I make you.', "You've got nerve."],
    },
  }),
  eddie: char('eddie', 'Eddie Shaw', 'hustler', {
    schedule: [
      { fromHour: 8, toHour: 18, locationId: 'cafe' },
      { fromHour: 18, toHour: 4, locationId: 'corner_b' },
      { fromHour: 4, toHour: 8, locationId: 'residential' },
    ],
    traits: { brainy_brawny: 0, social_discreet: -1 },
    jobsOffered: ['hijack_3', 'delivery_h1'],
    dialogue: {
      neutral: ['Need something?', 'Talk fast.'],
      friendly: ['Hey, reliable as always.', 'Got a proposition.'],
      grudge: ['Not interested.', 'Walk away.'],
    },
  }),
  slim: char('slim', 'Slim Jenkins', 'dealer', {
    schedule: [
      { fromHour: 20, toHour: 6, locationId: 'corner_a' },
      { fromHour: 6, toHour: 20, locationId: 'corner_b' },
    ],
    traits: { brainy_brawny: -1, social_discreet: 2 },
    dialogue: {
      neutral: ['Keep it quiet.', 'What?'],
      friendly: ['Good to see a face I trust.', 'Business is good.'],
      grudge: ['You bring heat.', 'Not today.'],
    },
  }),

  // Business owners
  maria: char('maria', 'Maria Rossi', 'civilian', {
    schedule: [
      { fromHour: 6, toHour: 22, locationId: 'cafe' },
      { fromHour: 22, toHour: 6, locationId: 'home' },
    ],
    traits: { brainy_brawny: -2, intimidating_diplomatic: -2 },
    isBusinessOwner: true,
    dialogue: {
      neutral: ['Can I help you?', 'Coffee or a sandwich?'],
      friendly: ['Welcome back.', 'What can I get you?'],
      grudge: ['I want you out of my place.', 'No trouble in here.'],
    },
  }),
  sal: char('sal', 'Sal Moretti', 'civilian', {
    schedule: [
      { fromHour: 5, toHour: 21, locationId: 'deli' },
      { fromHour: 21, toHour: 5, locationId: 'home' },
    ],
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
    schedule: [
      { fromHour: 8, toHour: 18, locationId: 'residential' },
      { fromHour: 18, toHour: 8, locationId: 'home' },
    ],
    traits: { brainy_brawny: -2, loyal_opportunistic: -1 },
    dialogue: {
      neutral: ['Good day.', 'Lovely weather.'],
      friendly: ['Hello, dear.', 'How are you?'],
      grudge: ['Stay away from me.', 'I\'ll call the police!'],
    },
  }),
  tom: char('tom', 'Tom the Clerk', 'civilian', {
    schedule: [
      { fromHour: 9, toHour: 17, locationId: 'residential' },
      { fromHour: 17, toHour: 9, locationId: 'home' },
    ],
    traits: { brainy_brawny: -1, ambitious_complacent: 1 },
    dialogue: {
      neutral: ['Excuse me.', 'Just passing through.'],
      friendly: ['Hey.', 'What\'s up?'],
      grudge: ['Leave me alone!', 'Help!'],
    },
  }),
  old_joe: char('old_joe', 'Old Joe', 'civilian', {
    schedule: [
      { fromHour: 10, toHour: 16, locationId: 'cafe' },
      { fromHour: 16, toHour: 10, locationId: 'home' },
    ],
    traits: { brainy_brawny: -2, indulgent_spartan: 1 },
    dialogue: {
      neutral: ['Hmm?', 'Young fella.'],
      friendly: ['Sit down, kid.', 'Good to see you.'],
      grudge: ['Troublemaker.', 'Get away from me.'],
    },
  }),

  // Services
  gus: char('gus', 'Gus Kowalski', 'mechanic', {
    schedule: [
      { fromHour: 7, toHour: 19, locationId: 'garage' },
      { fromHour: 19, toHour: 7, locationId: 'home' },
    ],
    traits: { brainy_brawny: 1, loyal_opportunistic: 1 },
    sellsVehicles: true,
    dialogue: {
      neutral: ['Need wheels?', 'I fix \'em, I sell \'em.'],
      friendly: ['Good customer.', 'Got something nice for you.'],
      grudge: ['No service for you.', 'Get out of my garage.'],
    },
  }),
  pete: char('pete', 'Pete the Fence', 'hustler', {
    schedule: [
      { fromHour: 14, toHour: 22, locationId: 'corner_a' },
      { fromHour: 22, toHour: 6, locationId: 'corner_b' },
      { fromHour: 6, toHour: 14, locationId: 'warehouse_district' },
    ],
    traits: { brainy_brawny: 0, social_discreet: 2 },
    sellsWeapons: true,
    dialogue: {
      neutral: ['Looking for hardware?', 'Cash only.'],
      friendly: ['For you, I got options.', 'Best prices in town.'],
      grudge: ['No deals.', 'You bring too much heat.'],
    },
  }),
};

var JOB_TEMPLATES = {
  hijack_1: {
    id: 'hijack_1',
    type: 'hijack',
    title: 'HIJACK JOB',
    description: 'Hit a delivery van in the Warehouse District.',
    targetLocation: 'warehouse_district',
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
    description: 'Snatch cargo off Dock Street before dawn.',
    targetLocation: 'corner_b',
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
    description: 'Grab a truck load from the industrial yards.',
    targetLocation: 'warehouse_district',
    timeWindow: { fromHour: 21, toHour: 3 },
    reward: 60,
    risk: 'high',
    vehicleRequired: true,
    baseChance: 0.45,
  },
  delivery_a1: {
    id: 'delivery_a1',
    type: 'delivery',
    title: 'DELIVERY JOB',
    description: 'Move a package from North HQ to the corner.',
    pickupLocation: 'gang_a_hq',
    dropoffLocation: 'corner_a',
    timeLimitHours: 4,
    reward: 30,
    risk: 'low',
    vehicleRequired: false,
    baseChance: 0.8,
  },
  delivery_b1: {
    id: 'delivery_b1',
    type: 'delivery',
    title: 'DELIVERY JOB',
    description: 'Run goods from South HQ to the docks.',
    pickupLocation: 'gang_b_hq',
    dropoffLocation: 'corner_b',
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
    description: 'Haul contraband from the cafe to the warehouse.',
    pickupLocation: 'cafe',
    dropoffLocation: 'warehouse_district',
    timeLimitHours: 3,
    reward: 40,
    risk: 'medium',
    vehicleRequired: true,
    baseChance: 0.7,
  },
};

function createInitialState() {
  const characters = {};
  for (const [id, template] of Object.entries(CHARACTERS)) {
    characters[id] = {
      ...template,
      relationshipToPlayer: 'neutral',
    };
  }

  return {
    clock: { day: 1, hour: 6, minute: 0 },
    player: {
      position: 'home',
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
    log: ['You wake up in your apartment. Time to hustle.'],
    timeSpeed: CONFIG.DEFAULT_TIME_SPEED,
    interactionPaused: false,
    knownCharacters: [],
    pendingShakedown: null,
    gangGrudgeCount: { gang_a: 0, gang_b: 0 },
  };
}
