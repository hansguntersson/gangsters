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
    revealsLocations: opts.revealsLocations || [],
  };
}

var CHARACTERS = {
  // The Longshoremen (waterfront)
  frank: char('frank', 'Frank O\'Malley', 'gang_member', {
    gang: 'longshoremen',
    schedule: [
      { fromHour: 6, toHour: 14, locationId: 'l030' },
      { fromHour: 14, toHour: 22, locationId: 'l017' },
      { fromHour: 22, toHour: 6, locationId: 'l030' },
    ],
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
    schedule: [
      { fromHour: 8, toHour: 20, locationId: 'l030' },
      { fromHour: 20, toHour: 8, locationId: 'l040' },
    ],
    traits: { brainy_brawny: 1, restless_reliable: 1 },
    dialogue: {
      neutral: ['What do you need?', 'Keep moving.'],
      friendly: ['Hey.', 'I might have something.'],
      grudge: ['Trouble follows you.', 'Get off the docks.'],
    },
  }),
  jimmy: char('jimmy', 'Jimmy Doyle', 'gang_member', {
    gang: 'longshoremen',
    schedule: [
      { fromHour: 12, toHour: 22, locationId: 'l014' },
      { fromHour: 22, toHour: 12, locationId: 'l030' },
    ],
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
    schedule: [
      { fromHour: 6, toHour: 14, locationId: 'l031' },
      { fromHour: 14, toHour: 22, locationId: 'l033' },
      { fromHour: 22, toHour: 6, locationId: 'l031' },
    ],
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
    schedule: [
      { fromHour: 8, toHour: 20, locationId: 'l031' },
      { fromHour: 20, toHour: 8, locationId: 'l033' },
    ],
    traits: { brainy_brawny: 1, loyal_opportunistic: -1 },
    dialogue: {
      neutral: ['Yeah?', 'Make it quick.'],
      friendly: ['Hey, friend.', 'Need something?'],
      grudge: ['You again?', 'Walk away. Now.'],
    },
  }),
  marco: char('marco', 'Marco Bellini', 'gang_member', {
    gang: 'factory_boys',
    schedule: [
      { fromHour: 10, toHour: 18, locationId: 'l024' },
      { fromHour: 18, toHour: 4, locationId: 'l031' },
      { fromHour: 4, toHour: 10, locationId: 'l004' },
    ],
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
    schedule: [
      { fromHour: 14, toHour: 22, locationId: 'l003' },
      { fromHour: 22, toHour: 6, locationId: 'l003' },
      { fromHour: 6, toHour: 14, locationId: 'l014' },
    ],
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
    schedule: [
      { fromHour: 6, toHour: 12, locationId: 'l010' },
      { fromHour: 12, toHour: 20, locationId: 'l048' },
      { fromHour: 20, toHour: 6, locationId: 'l048' },
    ],
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
    schedule: [
      { fromHour: 8, toHour: 18, locationId: 'l010' },
      { fromHour: 18, toHour: 4, locationId: 'l048' },
      { fromHour: 4, toHour: 8, locationId: 'l047' },
    ],
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
    schedule: [
      { fromHour: 20, toHour: 6, locationId: 'l048' },
      { fromHour: 6, toHour: 20, locationId: 'l047' },
    ],
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
    schedule: [
      { fromHour: 6, toHour: 22, locationId: 'l010' },
      { fromHour: 22, toHour: 6, locationId: 'l047' },
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
      { fromHour: 5, toHour: 21, locationId: 'l024' },
      { fromHour: 21, toHour: 5, locationId: 'l047' },
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
      { fromHour: 8, toHour: 18, locationId: 'l001' },
      { fromHour: 18, toHour: 8, locationId: 'l047' },
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
      { fromHour: 9, toHour: 17, locationId: 'l033' },
      { fromHour: 17, toHour: 9, locationId: 'l047' },
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
      { fromHour: 10, toHour: 16, locationId: 'l010' },
      { fromHour: 16, toHour: 10, locationId: 'l047' },
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
      { fromHour: 7, toHour: 19, locationId: 'l043' },
      { fromHour: 19, toHour: 7, locationId: 'l047' },
    ],
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
