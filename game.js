
// ============================
// Full Tower Defense Game.js
// ============================

// Enemy Types Configuration
const ENEMY_STATS = {
    basic:   { health: 100, speed: 1.2, reward: 10, livesLost: 1 },
    fast:    { health: 60,  speed: 2.0, reward: 15, livesLost: 1 },
    rusher:  { health: 50,  speed: 2.9, reward: 16, livesLost: 1 },
    tank:    { health: 1000, speed: 0.6, reward: 30, livesLost: 3 },
    bruiser: { health: 2600, speed: 0.5, reward: 42, livesLost: 4 },
    shield:  { health: 180, speed: 1.0, reward: 22, livesLost: 1, shield: 120 },
    resistant: { health: 340, speed: 1.05, reward: 26, livesLost: 1, resistances: { spread: 0.38, lightning: 0.52, splash: 0.72 } },
    phaser: { health: 210, speed: 1.25, reward: 30, livesLost: 2, phaseCooldown: 150, phaseDuration: 34, phaseSpeedMultiplier: 1.65, phaseJump: 1 },
    commander: { health: 220, speed: 1.15, reward: 28, livesLost: 2, auraRange: 2.2, auraBoost: 0.16 },
    bulwark: { health: 260, speed: 0.92, reward: 32, livesLost: 2, auraRange: 2.3, damageReduction: 0.22 },
    relay: { health: 280, speed: 0.95, reward: 34, livesLost: 2, relayRange: 2.3, relayShieldAmount: 34, relayShieldCap: 90, relayPulse: 55 },
    boss:    { health: 7000, speed: 0.4, reward: 200, livesLost: 99 },
    splitter:{ health: 200, speed: 1.1, reward: 20, livesLost: 1 },
    mini:    { health: 40,  speed: 1.8, reward: 5, livesLost: 1 },
    healer:  { health: 120, speed: 1.0, reward: 15, livesLost: 1, cleansePulse: 90 },
    stealth: { health: 80,  speed: 1.5, reward: 12, livesLost: 1 },
    megaBoss: {health: 20000, speed: 0.5, reward: 1000, livesLost: 99}
};

const ENEMY_GUIDE = {
    basic: { label: "basic", intro: "Standard enemy. No special abilities.", counter: "Any early tower handles these." },
    fast: { label: "fast", intro: "Moves quickly. Can slip through defenses!", counter: "Use broad coverage or slow support." },
    rusher: { label: "rusher", intro: "Extremely fast but fragile. Punishes weak lane coverage.", counter: "Spread, lightning, or good map coverage." },
    tank: { label: "tank", intro: "High health. Slow but dangerous.", counter: "Sniper and poison are your best answers." },
    bruiser: { label: "bruiser", intro: "Massive health and heavy leaks. Demands real single-target damage.", counter: "Sniper, poison, and focused support are the cleanest answers." },
    shield: { label: "shield", intro: "Starts with a shield that shrugs off weak hits. Burst it down.", counter: "Sniper, splash, and lightning break shields faster." },
    resistant: { label: "resistant", intro: "Shrugs off anti-swarm damage and punishes one-note builds.", counter: "Sniper, poison, and basic towers handle it better than spread or lightning." },
    phaser: { label: "phaser", intro: "Briefly phases out, dashes ahead, and ignores damage while intangible.", counter: "Catch it with overlapping coverage or hit it hard between phase windows." },
    commander: { label: "commander", intro: "Boosts nearby enemies. A dangerous priority target.", counter: "Pick it off quickly with sniper or focused burst." },
    bulwark: { label: "bulwark", intro: "Projects a damage-reduction aura that protects nearby enemies.", counter: "Focus the bulwark first or your lane damage will feel muted." },
    relay: { label: "relay", intro: "Pulses shared shields onto nearby allies, extending the frontline.", counter: "Kill the relay before it keeps re-shielding the pack." },
    boss: { label: "boss", intro: "Massive health. Reaching the end means game over!", counter: "Single-target damage and attrition both matter." },
    megaBoss: { label: "mega boss", intro: "Enormous and slow. Spawns two Bosses when killed!", counter: "Bring stacked boss damage and support." },
    splitter: { label: "splitter", intro: "Splits into two mini enemies when killed.", counter: "Splash and lightning help contain the spawn burst." },
    mini: { label: "mini", intro: "Small, fast offspring of a splitter.", counter: "Use anti-swarm towers or broad coverage." },
    healer: { label: "healer", intro: "Heals nearby enemies and periodically cleanses poison or slows.", counter: "Prioritize it before the whole wave thickens up or shrugs off your control." },
    stealth: { label: "stealth", intro: "Can only be targeted by upgraded towers.", counter: "Upgrade key towers before stealth-heavy rounds." }
};

const SPECIAL_ROUNDS = {
    rush_hour: {
        name: "Rush Hour",
        short: "Fast lanes",
        intro: "Enemy movement speed ramps up sharply this round.",
        counter: "Lean on broad coverage, slows, and quick redeploys.",
        enemySpeedMultiplier: 1.22
    },
    fortified: {
        name: "Fortified",
        short: "More armor",
        intro: "Every enemy enters with heavier health and stronger shields.",
        counter: "Single-target damage and attrition matter more than chip fire.",
        enemyHealthMultiplier: 1.28,
        shieldMultiplier: 1.35
    },
    bounty: {
        name: "Bounty Window",
        short: "More gold",
        intro: "Command is paying extra for every takedown this round.",
        counter: "Push tempo and farm the wave cleanly for a bigger spike.",
        rewardMultiplier: 1.35
    },
    no_sell: {
        name: "No-Sell Lock",
        short: "Hold your line",
        intro: "Field command disables liquidation for the duration of the round.",
        counter: "Commit before you start. Mid-wave repositioning is off the table.",
        disableSell: true
    }
};

// Map/Level 12 cols x 16 rows
const MAPS = {
    1: {
        map: [  
         ['S',  'P1',  'P2',  'P3',  'P4',  'P5',  'G',    'G',    'G', 'G', 'G', 'G'],
         ['G',  'G',   'G',   'G',   'G',   'P6',  'G',    'G',    'G', 'G', 'G', 'G'],
         ['G',  'G',   'G',   'G',   'G',   'P7',  'G',    'G',    'G', 'G', 'G', 'G'],
         ['G',  'G',   'G',   'G',   'G',   'P8',  'G',    'G',    'G', 'G', 'G', 'G'],
         ['G',  'P17', 'P18', 'P19', 'P20', 'P9',  'P21',  'P22',  'G', 'G', 'G', 'G'],
         ['T',  'P16', 'G',   'G',   'G',   'P10', 'G',    'P23',  'G', 'G', 'G', 'T'],
         ['G',  'P15', 'P14', 'P13', 'P12', 'P11', 'G',    'P24',  'G', 'G', 'G', 'G'],
         ['G',  'G',   'G',   'G',   'G',   'G',   'G',    'P25',  'G', 'G', 'G', 'G'],
         ['G',  'G',   'G',   'G',   'G',   'G',   'G',    'P26',  'G', 'G', 'G', 'G'],
         ['G',  'G',   'G',   'G',   'G',   'G',   'G',    'P27',  'G', 'G', 'G', 'G'],
         ['G',  'G',   'G',   'G',   'G',   'G',   'G',    'P28',  'G', 'G', 'G', 'G'],
         ['G',  'G',   'G',   'G',   'G',   'G',   'G',    'P29',  'G', 'G', 'G', 'G'],
         ['G',  'G',   'G',   'G',   'G',   'G',   'G',    'P30',  'G', 'G', 'G', 'G'],
         ['G',  'G',   'G',   'G',   'G',   'G',   'T',    'P31',  'T', 'G', 'G', 'G'],
         ['G',  'G',   'G',   'G',   'G',   'G',   'T',    'P32',  'T', 'G', 'G', 'G'],
         ['G',  'G',   'G',   'G',   'G',   'G',   'T',    'E',    'T', 'G', 'G', 'G']
        ],
        waves: 
        generateWaves(45) // dynamically generating waves
    },
    2: {
        map: [
            ['G', 'T', 'G',  'G',  'G',  'G',  'G',  'G',  'T',  'G', 'G', 'G'],
            ['S', 'P1','P2', 'P3', 'P4', 'P5', 'P6', 'P8', 'P9', 'G', 'G', 'G'],
            ['G', 'G', 'G',  'G',  'G',  'G',  'G',  'G',  'P10','G', 'G', 'G'],
            ['G', 'G', 'G',  'G',  'G',  'G',  'G',  'G',  'P11','T', 'G', 'G'],
            ['G', 'G', 'G',  'G',  'G',  'G',  'G',  'G',  'P12','G', 'G', 'G'],
            ['G', 'T', 'G',  'G',  'G',  'G',  'G',  'G',  'P13','G', 'G', 'G'],
            ['G', 'G', 'P22','P21','P20','P17','P16','P15','P14','G', 'G', 'G'],
            ['G', 'G', 'P23','G',  'G',  'G',  'G',  'G',  'G',  'T', 'G', 'G'],
            ['G', 'G', 'P24','G',  'G',  'G',  'G',  'G',  'G',  'G', 'G', 'G'],
            ['G', 'G', 'P25','G',  'G',  'G',  'G',  'G',  'G',  'G', 'G', 'G'],
            ['G', 'T', 'P26','T',  'G',  'G',  'G',  'G',  'G',  'G', 'G', 'G'],
            ['G', 'T', 'P27','T',  'G',  'G',  'G',  'G',  'G',  'G', 'G', 'G'],
            ['G', 'G', 'P28','G',  'G',  'G',  'G',  'G',  'G',  'G', 'G', 'G'],
            ['G', 'G', 'P29','G',  'G',  'G',  'G',  'G',  'G',  'G', 'G', 'G'],
            ['G', 'G', 'P30','G',  'G',  'G',  'G',  'G',  'G',  'G', 'G', 'G'],
            ['G', 'G', 'E',  'G',  'G',  'G',  'G',  'G',  'G',  'G', 'G', 'G']
        ],
        waves: 
        generateWaves(50)
    },
    3: {
        map: [
        ['G','G', 'G', 'G','G','G','G','G','G','G','G','G'],
        ['G','G', 'G', 'G','G','G','G','G','G','G','G','G'],
        ['G','G', 'G', 'G','G','G','G','G','G','G','G','G'],
        ['G','G', 'G', 'P21','P22','P23','P24','P25','P26','G','G','G'],
        ['G','G', 'G', 'P20','G','G','G','G','P27','G','G','G'],
        ['G','G', 'G', 'P16','G','G','G','G','P28','G','G','G'],
        ['G','G', 'G', 'P15','P14','P13','G','G','P29','G','G','G'],
        ['G','G', 'G', 'G','G','P12','G','G','P30','G','G','G'],
        ['G','G', 'G', 'G','G','P11','G','G','P31','G','G','G'],
        ['G','G', 'G', 'G','G','P10','G','G','P32','G','G','G'],
        ['S','P1','P2','G','G','P9','G','G','P33','G','G','G'],
        ['G','G', 'P3','G','G','P8','G','G','P34','G','G','G'],
        ['G','G', 'P4','P5','P6','P7','G','G','P35','G','G','G'],
        ['G','G', 'G', 'G','G','G','G','G','P36','G','G','G'],
        ['G','G', 'G', 'G','G','G','G','G','P37','G','G','G'],
        ['G','G', 'G', 'G','G','G','G','G','E','G','G','G']
        ],
        waves: 
        generateWaves(55)
    },
    4: {
        map: [
        ['S','P1','P2','P3','P4','P5','P6','P7','P8','P9','P10','G'],
        ['G','G','G','G','G','G','G','G','G','G','P11','G'],
        ['G','T','G','G','G','G','G','G','G','G','P12','G'],
        ['G','G','G','G','G','G','G','G','G','T','P13','G'],
        ['G','G','G','G','G','G','G','G','G','G','P14','G'],
        ['G','G','G','G','G','G','G','G','G','G','P15','G'],
        ['G','T','G','G','G','G','G','G','G','G','P16','G'],
        ['G','G','G','G','G','G','G','G','G','T','P17','G'],
        ['G','G','G','G','G','G','G','G','G','G','P18','G'],
        ['G','G','G','G','G','G','G','G','G','G','P19','G'],
        ['G','T','G','G','G','G','G','G','G','G','P20','G'],
        ['G','G','G','G','G','G','G','G','G','T','P21','G'],
        ['G','G','G','G','G','G','G','G','G','G','P22','G'],
        ['G','G','G','G','G','G','G','G','G','G','P23','G'],
        ['G','T','G','G','G','G','G','G','G','T','P24','G'],
        ['E','P34','P33','P32','P31','P30','P29','P28','P27','P26','P25','G']
        ],
        waves:
        generateWaves(60)
    },
    5: {
        map: [
        ['G','G','S','G','G','G','G','G','G','G','G','G'],
        ['G','G','P1','P2','P3','P4','P5','P6','P7','P8','G','G'],
        ['G','T','G','G','G','G','G','G','G','P9','G','G'],
        ['G','G','G','G','G','G','G','G','G','P10','T','G'],
        ['G','G','P18','P17','P16','P15','P14','P13','P12','P11','G','G'],
        ['G','G','P19','G','T','G','G','T','G','G','G','G'],
        ['G','G','P20','G','G','G','G','G','G','G','T','G'],
        ['G','G','P21','P22','P23','P24','P25','P26','P27','G','G','G'],
        ['G','T','G','G','G','G','G','G','P28','G','G','G'],
        ['G','G','G','T','G','G','T','G','P29','G','G','G'],
        ['G','G','P37','P36','P35','P34','P33','P32','P31','P30','G','G'],
        ['G','G','P38','G','G','G','G','G','G','G','T','G'],
        ['G','T','P39','G','G','T','G','G','G','G','G','G'],
        ['G','G','P40','P41','P42','P43','P44','P45','P46','G','G','G'],
        ['G','G','G','G','G','G','G','G','P47','G','T','G'],
        ['G','G','G','G','G','G','G','G','E','G','G','G']
        ],
        waves:
        generateWaves(65)
    }
};

// DEV_MODE Panel
let DEV_MODE = false;
const DEV_PASSWORD = "secretsauce"; // Change this

document.getElementById("darkOpsBtn").addEventListener("click", () => {
    const input = prompt("Enter Dev Password:");
    if (input === DEV_PASSWORD) {
        DEV_MODE = true;
        //alert("✅ DEV MODE UNLOCKED");
        showDevMenu();
    } else {
        alert("❌ Incorrect password");
    }
});

let wavesCompleted = parseInt(localStorage.getItem("wavesCompleted")) || 0;

const LEVEL_UNLOCKS = {
  2: 30, // add more levels as needed
  3: 40,
  4: 50,
  5: 60
};

const LEVEL_META = {
  1: { name: "Green Line", blurb: "Balanced opener with simple coverage tests.", focus: "Balanced", waves: 45, intro: "Straightforward lanes ease you into mixed tower coverage.", tactic: "Open with flexible towers, then branch into anti-tank or anti-swarm as waves specialize.", modifier: "supply_cache" },
  2: { name: "Crosswind", blurb: "Long side lane rewards steady range and timing.", focus: "Reach", waves: 50, intro: "A long outer lane gives range towers time to work before enemies turn the corner.", tactic: "Sniper and poison get extra value here, but keep one coverage tower near the turn.", modifier: "high_ground" },
  3: { name: "Split March", blurb: "Weaving route favors coverage over tunnel vision.", focus: "Coverage", waves: 55, intro: "The path loops across the map and punishes overcommitting to one firing lane.", tactic: "Build overlapping coverage and let support towers amplify several lanes at once.", modifier: "field_salvage" },
  4: { name: "Kill Box", blurb: "Huge sightlines reward sniper, poison, and support stacking.", focus: "Long lanes", waves: 60, intro: "Long horizontal and vertical lanes let single-target towers fire for extended windows.", tactic: "Lean into sniper, poison, and slow support, then add just enough anti-swarm near the exit.", modifier: "bounty_contract" },
  5: { name: "Switchback", blurb: "Tight turns and repeated corners reward anti-swarm control.", focus: "Corners", waves: 65, intro: "Compact turns keep enemies clumped and repeatedly re-entering tower arcs.", tactic: "Spread, splash, and lightning thrive here. Prioritize broad coverage over isolated boss lanes.", modifier: "shock_corridor" }
};

const MAP_MODIFIERS = {
  supply_cache: {
    name: "Supply Cache",
    short: "+$35 start",
    description: "Start with extra gold so you can establish your first lane faster.",
    startingGoldBonus: 35
  },
  high_ground: {
    name: "High Ground",
    short: "Reach boost",
    description: "Basic, sniper, and poison towers gain extra sightlines here, but sniper setups cost a little more.",
    rangeBonusByType: { basic: 0.08, sniper: 0.18, poison: 0.12 },
    towerCostMultipliers: { sniper: 1.08 }
  },
  field_salvage: {
    name: "Field Salvage",
    short: "Better sells",
    description: "Repositioning is safer here thanks to improved sell returns and a slight wave payout bonus.",
    rewardBonusMultiplier: 1.06,
    sellMultiplierBonus: 0.1
  },
  bounty_contract: {
    name: "Bounty Contract",
    short: "More rewards",
    description: "Long-lane specialists cost more, but kills pay better across the entire map.",
    rewardBonusMultiplier: 1.18,
    towerCostMultipliers: { sniper: 1.1, poison: 1.08, slow: 1.08 }
  },
  shock_corridor: {
    name: "Shock Corridor",
    short: "AoE discount",
    description: "Corners favor anti-pack control. Spread, splash, and lightning are cheaper and cover a little better.",
    towerCostMultipliers: { spread: 0.92, splash: 0.9, lightning: 0.9 },
    rangeBonusByType: { spread: 0.08, lightning: 0.1 }
  }
};
/* dynamic way to unlock levels
 const LEVEL_UNLOCKS = {};
    const totalLevels = Object.keys(MAPS).length;
    for (let i = 2; i <= totalLevels; i++) {
        LEVEL_UNLOCKS[i] = (i - 1) * 30; // e.g., level 2 unlocks at 30, 3 at 60, etc.
    }
 */

// Toggle dev panel on/off
let showDebugStats = false; 

let mapOffsetX = 0;
let mapOffsetY = 0;


// Required UI Elements
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const speedBtn = document.getElementById("speedToggleBtn");
const pauseBtn = document.getElementById("pauseBtn");
const achievementBox = document.getElementById("achievements");

// Game Variables
let pausedForIntro = false;
let TILE_SIZE = 64;
const STARTING_GOLD = 275;
var currentLevel = 1;
let wave = 0, gold = STARTING_GOLD, lives = 10;
let towers = [], enemies = [], bullets = [], splitQueue = [];
let gameWon = false, gameOver = false, paused = false, isWaveActive = false;
let waveQueue = [], waveTimer = 0, currentMap = [], waves = [], enemyPath = [];
let damageNumbers = [], floatingMessages = [], seenEnemyTypes = new Set();
let selectedTowerType = null, selectedTower = null, hoveredTower = null;
let hoveredBuildTile = null;
let waveIntroQueue = [], introMessage = null, introTimer = 0, bossWarning = null;
let totalGoldEarned = 0, enemyKillCount = 0, towerActionUI = null;
let gameSpeed = 1;
let currentWaveStartLives = 10;
let waveReadyAt = 0;
let pendingRushBonus = 0;
let runQuickStarts = 0;
let runRushBonusTotal = 0;
let leakEvents = [];
let leakFlashEffects = [];
let towerIdCounter = 1;
let activeMapModifier = null;
let activeWaveRules = null;
let towerDrawerState = null;
let mapProgressRecords = {};
let screenShake = 0;
let screenFlash = { color: "255,255,255", alpha: 0 };
let waveBanner = null;
const lightningAnimations = [];
const LIGHTNING_FRAMES = [];
for (let i = 1; i <= 11; i++) {
  const img = new Image();
  img.src = `images/effects/lightning_${i}.png`;
  LIGHTNING_FRAMES.push(img);
}

const damageNumberPool = [];

const particlePool = new ParticlePool(100); // Preallocate 100 particles

// Rank based tower unlock 
const rankTable = [
  { level: 1, title: "Recruit", points: 0 },
  { level: 2, title: "Scout", points: 500 },
  { level: 3, title: "Private", points: 1200 },
  { level: 4, title: "Corporal", points: 2000 },
  { level: 5, title: "Sergeant", points: 3000 },
  { level: 6, title: "Lieutenant", points: 4200 },
  { level: 7, title: "Captain", points: 5700 },
  { level: 8, title: "Major", points: 7500 },
  { level: 9, title: "Colonel", points: 9600 },
  { level: 10, title: "General", points: 12000 },
  { level: 11, title: "Warlord", points: 14700 },
  { level: 12, title: "Hero", points: 17700 },
  { level: 13, title: "Champion", points: 21000 },
  { level: 14, title: "Master", points: 24600 },
  { level: 15, title: "Legend", points: 28500 },
  { level: 16, title: "Sentinel", points: 32700 },
  { level: 17, title: "Overseer", points: 37200 },
  { level: 18, title: "Commander", points: 42000 },
  { level: 19, title: "Mythic", points: 47100 },
  { level: 20, title: "Godlike", points: 52500 }
];

const MAP_MEDALS = {
  clear: {
    icon: "◆",
    name: "Sector Clear",
    points: 90,
    description: "Complete the map."
  },
  perfect: {
    icon: "♥",
    name: "Perfect Defense",
    points: 140,
    description: "Finish the map without losing any lives."
  },
  tempo: {
    icon: "⚡",
    name: "Rapid Command",
    points: 110,
    description: "Claim quick-start bonuses on at least 60% of the map's waves."
  }
};


let playerPoints = parseInt(localStorage.getItem("playerPoints")) || 0;
let playerRank = parseInt(localStorage.getItem("playerRank")) || 1;

function getStoredNumber(key, fallback = 0) {
  const raw = localStorage.getItem(key);
  if (raw === null) return fallback;
  const value = parseInt(raw, 10);
  return Number.isFinite(value) ? value : fallback;
}

function getUnlockedLevels() {
  try {
    const parsed = JSON.parse(localStorage.getItem("unlockedLevels") || "[1]");
    const normalized = Array.isArray(parsed) ? parsed.map(level => parseInt(level, 10)).filter(Number.isFinite) : [1];
    if (!normalized.includes(1)) normalized.push(1);
    return [...new Set(normalized)].sort((a, b) => a - b);
  } catch {
    return [1];
  }
}

function normalizeMapProgressRecord(record = {}) {
  const medals = record.medals || {};
  return {
    completed: Boolean(record.completed),
    completions: Math.max(0, parseInt(record.completions, 10) || 0),
    bestLives: Math.max(0, parseInt(record.bestLives, 10) || 0),
    bestQuickStarts: Math.max(0, parseInt(record.bestQuickStarts, 10) || 0),
    medals: {
      clear: Boolean(medals.clear),
      perfect: Boolean(medals.perfect),
      tempo: Boolean(medals.tempo)
    }
  };
}

function getStoredMapProgressRecords() {
  try {
    const parsed = JSON.parse(localStorage.getItem("mapProgressRecords") || "{}");
    if (!parsed || typeof parsed !== "object") return {};
    const normalized = {};
    Object.entries(parsed).forEach(([level, record]) => {
      normalized[level] = normalizeMapProgressRecord(record);
    });
    return normalized;
  } catch {
    return {};
  }
}

function saveMapProgressRecords() {
  localStorage.setItem("mapProgressRecords", JSON.stringify(mapProgressRecords));
}

function getLevelProgressRecord(level) {
  const key = String(level);
  if (!mapProgressRecords[key]) {
    mapProgressRecords[key] = normalizeMapProgressRecord();
  }
  return mapProgressRecords[key];
}

function getTempoRequirement(level) {
  const totalWaves = LEVEL_META[level]?.waves || MAPS[level]?.waves?.length || waves.length || 0;
  return Math.max(5, Math.ceil(totalWaves * 0.6));
}

function getEarnedMapMedalCount(record) {
  return Object.values(record?.medals || {}).filter(Boolean).length;
}

function getTotalEarnedMedals() {
  return Object.values(mapProgressRecords).reduce((sum, record) => sum + getEarnedMapMedalCount(record), 0);
}

function formatMedalStrip(record) {
  return Object.entries(MAP_MEDALS)
    .map(([key, medal]) => `${medal.icon}${record?.medals?.[key] ? "" : "○"}`)
    .join(" ");
}

function summarizeNewMedals(newlyEarned) {
  if (!newlyEarned.length) return "No new honors this run.";
  return newlyEarned.map(medal => `${medal.icon} ${medal.name} +${medal.points}`).join(" | ");
}

function awardLevelCompletionRewards(level) {
  const key = String(level);
  const record = normalizeMapProgressRecord(getLevelProgressRecord(level));
  const nextRecord = {
    ...record,
    completed: true,
    completions: record.completions + 1,
    bestLives: Math.max(record.bestLives, lives),
    bestQuickStarts: Math.max(record.bestQuickStarts, runQuickStarts),
    medals: { ...record.medals }
  };

  const newlyEarned = [];
  const pointsBreakdown = [{ label: "Mission Debrief", points: 25 }];
  const tempoRequirement = getTempoRequirement(level);
  const unlockedMedals = {
    clear: true,
    perfect: lives === 10,
    tempo: runQuickStarts >= tempoRequirement
  };

  Object.entries(unlockedMedals).forEach(([keyName, unlocked]) => {
    if (!unlocked || nextRecord.medals[keyName]) return;
    nextRecord.medals[keyName] = true;
    const medal = MAP_MEDALS[keyName];
    newlyEarned.push({ key: keyName, ...medal });
    pointsBreakdown.push({ label: medal.name, points: medal.points });
  });

  mapProgressRecords[key] = nextRecord;
  saveMapProgressRecords();

  const totalPointsAwarded = pointsBreakdown.reduce((sum, entry) => sum + entry.points, 0);
  gainPoints(totalPointsAwarded);

  return {
    record: nextRecord,
    newlyEarned,
    pointsBreakdown,
    totalPointsAwarded,
    tempoRequirement
  };
}

function buildLevelCompleteSummary(level, rewardResult) {
  const levelMeta = LEVEL_META[level] || { name: `Level ${level}` };
  const honorCount = getEarnedMapMedalCount(rewardResult.record);
  return [
    `${levelMeta.name} secured.`,
    `Lives remaining: ${lives}/10`,
    `Fast starts: ${runQuickStarts}/${rewardResult.tempoRequirement} | Rush bonus banked: $${runRushBonusTotal}`,
    `Sector honors: ${honorCount}/3 | ${formatMedalStrip(rewardResult.record)}`,
    `Rank points earned: +${rewardResult.totalPointsAwarded}`,
    `New rewards: ${summarizeNewMedals(rewardResult.newlyEarned)}`
  ];
}

function setUnlockedLevels(levels) {
  const normalized = [...new Set(levels.map(level => parseInt(level, 10)).filter(Number.isFinite))].sort((a, b) => a - b);
  if (!normalized.includes(1)) normalized.unshift(1);
  localStorage.setItem("unlockedLevels", JSON.stringify(normalized));
  return normalized;
}

function unlockLevel(level) {
  const unlocked = getUnlockedLevels();
  if (!unlocked.includes(level)) {
    unlocked.push(level);
    return setUnlockedLevels(unlocked);
  }
  return unlocked;
}

function evaluateLevelUnlocks(wavesCompleted) {
  for (const [level, requiredWaves] of Object.entries(LEVEL_UNLOCKS)) {
    if (wavesCompleted >= requiredWaves) {
      unlockLevel(parseInt(level));
    }
  }
}

function initializeProgressState() {
  wavesCompleted = getStoredNumber("wavesCompleted", 0);
  playerPoints = getStoredNumber("playerPoints", 0);
  playerRank = Math.max(1, getStoredNumber("playerRank", 1));
  mapProgressRecords = getStoredMapProgressRecords();
  saveMapProgressRecords();
  setUnlockedLevels(getUnlockedLevels());
  evaluateLevelUnlocks(wavesCompleted);
}

function saveProgress() {
  localStorage.setItem("playerPoints", playerPoints);
  localStorage.setItem("playerRank", playerRank);
  updateRankDisplay();
}

function gainPoints(amount) {
  playerPoints += amount;

  let nextRank = playerRank;
  while (nextRank < rankTable.length && playerPoints >= rankTable[nextRank].points) {
    nextRank++;
  }

  if (nextRank !== playerRank) {
    playerRank = nextRank;
    addFloatingMessage("🏅 Rank Up!", canvas.width / 2, 60, "yellow", true);
    showWaveBanner(`Rank ${rankTable[playerRank - 1]?.level || playerRank}`, rankTable[playerRank - 1]?.title || "Promotion", "#ffe07a", 92);
    triggerScreenFlash("255,224,122", 0.18);
  }

  saveProgress();
}

function updateRankDisplay() {
  const rankEl = document.getElementById("rankDisplay");
  if (rankEl) {
    const rankData = rankTable[playerRank - 1];
    rankEl.textContent = `Rank ${rankData.level}: ${rankData.title} (${playerPoints}/${rankTable[playerRank]?.points || "MAX"})`;
  }
}

function spawnLightningAnimation(x, y) {
  lightningAnimations.push({
    x,
    y,
    frame: 0,
    totalFrames: 11, // # of frames
    frameDelay: 4,
    timer: 0
  });
}

function triggerScreenShake(intensity = 6) {
  screenShake = Math.max(screenShake, intensity);
}

function triggerScreenFlash(color = "255,255,255", alpha = 0.18) {
  screenFlash.color = color;
  screenFlash.alpha = Math.max(screenFlash.alpha, alpha);
}

function showWaveBanner(title, subtitle = "", accent = "#ffd166", duration = 96) {
  waveBanner = {
    title,
    subtitle,
    accent,
    duration,
    maxDuration: duration
  };
}

function addDamageNumber(text, x, y, color = "#ffd166", lifetime = 34) {
  const damageNumber = damageNumberPool.pop() || {};
  damageNumber.text = text;
  damageNumber.x = x + (Math.random() - 0.5) * 10;
  damageNumber.y = y - 8;
  damageNumber.color = color;
  damageNumber.opacity = 1;
  damageNumber.lifetime = lifetime;
  damageNumbers.push(damageNumber);
}


// Points awarded
function handleEnemyKill(enemyType) {
  let points = 1;
  if (enemyType === "boss") points += 25;
  gainPoints(points);
}

function handleWaveComplete() {
  const perfectWave = lives === currentWaveStartLives;
  const rewardMultiplier = getActiveWaveRewardMultiplier();
  const survivalBonus = Math.round(Math.max(8, 6 + wave * 2) * rewardMultiplier);
  const perfectBonusBase = perfectWave ? 12 + wave * 3 : 0;
  const perfectBonus = Math.round(perfectBonusBase * (activeMapModifier?.perfectBonusMultiplier || rewardMultiplier));
  gold += survivalBonus + perfectBonus;
  addFloatingMessage(`Wave Bonus +$${survivalBonus}`, canvas.width / 2, 82, "#ffd166", true);
  if (perfectBonus > 0) {
    addFloatingMessage(`Perfect Defense +$${perfectBonus}`, canvas.width / 2, 102, "#8cffb5", true);
  }
  showWaveBanner(perfectBonus > 0 ? "Perfect Defense" : "Wave Cleared", `+$${survivalBonus + perfectBonus} field payout`, perfectBonus > 0 ? "#8cffb5" : "#ffd166", 82);
  triggerScreenFlash(perfectBonus > 0 ? "140,255,181" : "255,214,102", perfectBonus > 0 ? 0.18 : 0.12);
  gainPoints(lives); // +5 for wave, +1 per life
    // ✅ Update wave progress
    const maxWaves = Math.max(wavesCompleted, wave + 1); // wave is 0-indexed
    if (maxWaves > wavesCompleted) {
        wavesCompleted = maxWaves;
        localStorage.setItem("wavesCompleted", wavesCompleted);
        evaluateLevelUnlocks(wavesCompleted);
        renderLevelButtons();
    }
}

function handleLevelComplete() {
    const rewardResult = awardLevelCompletionRewards(currentLevel);
    renderLevelButtons();
    return buildLevelCompleteSummary(currentLevel, rewardResult);
}

function calculateRushBonus() {
    if (!waveReadyAt || wave >= waves.length) return 0;
    const elapsedSeconds = (Date.now() - waveReadyAt) / 1000;
    const baseBonus = 18 + wave * 2;
    const decay = Math.min(baseBonus, Math.floor(elapsedSeconds * 3));
    return Math.max(0, baseBonus - decay);
}

function refreshStartWaveButton() {
    if (!startWaveBtn) return;
    pendingRushBonus = calculateRushBonus();
    startWaveBtn.textContent = pendingRushBonus > 0 ? `Start Wave (+$${pendingRushBonus})` : "Start Wave";
}

// Unlocks based on new ranks
const towerUnlocks = {
  basic: 1,
  spread: 3,
  sniper: 5,
  poison: 7,
  splash: 10,
  lightning: 12,
  slow: 14
};

function createWaveData(label, advisory, enemies, specialRound = null) {
    return { label, advisory, enemies, specialRound };
}

function getBaseWaveLabel(waveNumber) {
    if (waveNumber < 4) return { label: "Opening Line", advisory: "Baseline pressure to establish your first defenses." };
    if (waveNumber < 8) return { label: "Field Pressure", advisory: "Mixed movement pressure starts testing lane coverage." };
    if (waveNumber < 14) return { label: "Armor Probe", advisory: "Expect tougher targets mixed into the line." };
    if (waveNumber < 20) return { label: "Midwave Escalation", advisory: "Waves start combining support and speed threats." };
    return { label: "Latewave Surge", advisory: "Sustained combined-arms pressure. Weak spots get punished fast." };
}

function buildWaveScenario(waveNumber, totalWaves) {
    const enemyQueue = [];
    let specialRound = null;
    const basicCount = Math.floor(5 + waveNumber * 1.05);
    for (let j = 0; j < basicCount; j++) enemyQueue.push("basic");

    if (waveNumber >= 3) {
        const fastCount = Math.floor(waveNumber / 2.2);
        for (let j = 0; j < fastCount; j++) enemyQueue.push("fast");
    }
    if (waveNumber >= 5) {
        const tankCount = Math.floor(waveNumber / 4.2);
        for (let j = 0; j < tankCount; j++) enemyQueue.push("tank");
    }
    if (waveNumber >= 9) {
        const bruiserCount = Math.floor(waveNumber / 9);
        for (let j = 0; j < bruiserCount; j++) enemyQueue.push("bruiser");
    }
    if (waveNumber >= 6) {
        const rusherCount = Math.floor(waveNumber / 3.6);
        for (let j = 0; j < rusherCount; j++) enemyQueue.push("rusher");
    }
    if (waveNumber >= 8) {
        const shieldCount = Math.max(1, Math.floor(waveNumber / 6));
        for (let j = 0; j < shieldCount; j++) enemyQueue.push("shield");
    }
    if (waveNumber >= 11) {
        const resistantCount = Math.max(1, Math.floor(waveNumber / 7));
        for (let j = 0; j < resistantCount; j++) enemyQueue.push("resistant");
    }
    if (waveNumber >= 13) {
        const phaserCount = Math.max(1, Math.floor(waveNumber / 9));
        for (let j = 0; j < phaserCount; j++) enemyQueue.push("phaser");
    }
    if (waveNumber >= 10) {
        const splitterCount = Math.floor(waveNumber / 5);
        for (let j = 0; j < splitterCount; j++) enemyQueue.push("splitter");
    }
    if (waveNumber >= 12 && waveNumber % 3 === 0) {
        const stealthCount = Math.floor(waveNumber / 4);
        for (let j = 0; j < stealthCount; j++) enemyQueue.push("stealth");
    }
    if (waveNumber >= 12 && (waveNumber % 6 === 0 || waveNumber >= 24)) {
        const healerCount = Math.max(1, Math.floor(waveNumber / 7));
        for (let j = 0; j < healerCount; j++) enemyQueue.push("healer");
    }
    if (waveNumber >= 15 && (waveNumber % 5 === 0 || waveNumber >= 28)) {
        const commanderCount = Math.max(1, Math.floor(waveNumber / 10));
        for (let j = 0; j < commanderCount; j++) enemyQueue.push("commander");
    }
    if (waveNumber >= 13 && (waveNumber % 5 === 3 || waveNumber >= 26)) {
        const bulwarkCount = Math.max(1, Math.floor(waveNumber / 11));
        for (let j = 0; j < bulwarkCount; j++) enemyQueue.push("bulwark");
    }
    if (waveNumber >= 16 && (waveNumber % 4 === 1 || waveNumber >= 30)) {
        const relayCount = Math.max(1, Math.floor(waveNumber / 12));
        for (let j = 0; j < relayCount; j++) enemyQueue.push("relay");
    }
    if (waveNumber >= 16 && waveNumber % 2 === 0) {
        const miniCount = Math.floor(waveNumber * 1.3);
        for (let j = 0; j < miniCount; j++) enemyQueue.push("mini");
    }
    if (waveNumber >= 20 && waveNumber % 2 === 0) {
        const bossCount = Math.floor(waveNumber / 12);
        for (let j = 0; j < bossCount; j++) enemyQueue.push("boss");
    }

    let scenario = getBaseWaveLabel(waveNumber);

    if (waveNumber === totalWaves) {
        enemyQueue.length = 0;
        enemyQueue.push(
            "shield", "fast", "rusher",
            "tank", "basic", "basic",
            "relay", "healer",
            "megaBoss",
            "bulwark", "commander",
            "shield", "tank", "phaser"
        );
        scenario = {
            label: "Final Stand",
            advisory: "Mega boss pressure with a compact support escort. Bring boss damage and enough control to survive the split."
        };
    } else if (waveNumber >= 20 && waveNumber % 10 === 0) {
        enemyQueue.push("boss", "shield", "tank");
        scenario = {
            label: "Boss Detachment",
            advisory: "A boss arrives with frontline cover. Burst and anti-armor both matter."
        };
    } else if (waveNumber >= 15 && waveNumber % 6 === 0) {
        enemyQueue.push("commander", "shield", "rusher", "fast", "fast");
        scenario = {
            label: "Commander Escort",
            advisory: "Support aura behind a fast screen. Pick the commander off before the lane snowballs."
        };
    } else if (waveNumber >= 18 && waveNumber % 7 === 0) {
        enemyQueue.push("bulwark", "shield", "resistant", "basic", "fast");
        scenario = {
            label: "Bulwark Phalanx",
            advisory: "A support bulwark blunts your damage output. Remove it before the frontline overwhelms you."
        };
    } else if (waveNumber >= 17 && waveNumber % 6 === 5) {
        enemyQueue.push("phaser", "phaser", "rusher", "fast");
        scenario = {
            label: "Phase Break",
            advisory: "Phasers surge ahead during invulnerability windows. Coverage gaps get punished fast."
        };
    } else if (waveNumber >= 19 && waveNumber % 7 === 3) {
        enemyQueue.push("relay", "shield", "relay", "basic", "fast");
        scenario = {
            label: "Shield Network",
            advisory: "Relay supports keep re-shielding the pack. Delete them before your lane gets dragged out."
        };
    } else if (waveNumber >= 14 && waveNumber % 5 === 2) {
        enemyQueue.push("resistant", "resistant", "fast", "rusher", "basic");
        scenario = {
            label: "Resistance Screen",
            advisory: "Anti-swarm towers get checked hard here. Bring single-target answers behind your coverage."
        };
    } else if (waveNumber >= 10 && waveNumber % 6 === 1) {
        enemyQueue.push("bruiser", "tank", "basic", "basic");
        scenario = {
            label: "Bruiser Check",
            advisory: "A heavy body enters the lane. If you lack real anti-tank damage, leaks get expensive."
        };
    } else if (waveNumber >= 12 && waveNumber % 5 === 0) {
        enemyQueue.push("shield", "shield", "tank", "basic", "basic");
        scenario = {
            label: "Shielded Front",
            advisory: "A protected frontline tests burst damage and anti-armor coverage."
        };
    } else if (waveNumber >= 10 && waveNumber % 4 === 0) {
        enemyQueue.push("rusher", "rusher", "rusher", "fast", "fast", "mini");
        scenario = {
            label: "Rusher Burst",
            advisory: "Fast lane pressure. Broad coverage beats tunnel vision here."
        };
    } else if (waveNumber >= 14 && waveNumber % 7 === 0) {
        enemyQueue.push("stealth", "stealth", "fast", "rusher");
        scenario = {
            label: "Stealth Sweep",
            advisory: "Hidden pressure checks your upgraded coverage and map awareness."
        };
    } else if (waveNumber >= 16 && waveNumber % 5 === 1) {
        enemyQueue.push("splitter", "splitter", "mini", "mini", "fast");
        scenario = {
            label: "Splitter Spill",
            advisory: "Death spawns can overflow weak lanes. Splash and chain damage shine here."
        };
    } else if (waveNumber >= 18 && waveNumber % 6 === 3) {
        enemyQueue.push("tank", "tank", "healer", "shield");
        scenario = {
            label: "Attrition Test",
            advisory: "Durable enemies with sustain punish low single-target damage."
        };
    }

    if (waveNumber >= 6 && waveNumber % 11 === 0) {
        specialRound = "rush_hour";
    } else if (waveNumber >= 9 && waveNumber % 13 === 0) {
        specialRound = "fortified";
    } else if (waveNumber >= 7 && waveNumber % 9 === 0) {
        specialRound = "bounty";
    } else if (waveNumber >= 10 && waveNumber % 8 === 0) {
        specialRound = "no_sell";
    }

    if (specialRound) {
        const roundRule = SPECIAL_ROUNDS[specialRound];
        scenario = {
            label: `${scenario.label} • ${roundRule.name}`,
            advisory: `${scenario.advisory} ${roundRule.short}.`
        };
    }

    shuffleArray(enemyQueue);
    return createWaveData(scenario.label, scenario.advisory, enemyQueue, specialRound);
}

function generateWaves(totalWaves = 50) {
    const waves = [];

    for (let i = 1; i <= totalWaves; i++) {
        waves.push(buildWaveScenario(i, totalWaves));
    }

    return waves;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function playHitSound() {
    if (soundPlayBudget <= 0) return;
    soundPlayBudget--;
    
    const sfx = sounds.hit;
    sfx.rate(0.9 + Math.random() * 0.2); // Optional pitch variety
    sfx.volume(0.3 + Math.random() * 0.1); // Optional volume variety
    sfx.play();
}


// Update tower buttons visually
function updateTowerButtons() {
    document.querySelectorAll("#towerPanel button").forEach(btn => {
        const type = btn.dataset.type;

        // Remove selected & locked styling each pass
        btn.classList.remove("locked", "selected");

        // LOCKED BUTTON
        if (!DEV_MODE && playerRank < towerUnlocks[type]) {
            btn.style.opacity = 0.4;

            if (!btn.querySelector(".lock-icon")) {
                const lockIcon = document.createElement("div");
                lockIcon.className = "lock-icon";
                btn.appendChild(lockIcon);
            }

        } else {
            // UNLOCKED BUTTON
            btn.style.opacity = 1;

            // Remove lock icon if exists
            const lockIcon = btn.querySelector(".lock-icon");
            if (lockIcon) lockIcon.remove();

            // ✅ If currently selected, visually mark it
            if (selectedTowerType === type) {
                btn.classList.add("selected");
            }
        }
    });
}


// Tower Cost
const towerCosts = {
    basic: 90,
    spread: 130,
    sniper: 180,
    poison: 195,
    splash: 290,
    lightning: 285,
    slow: 255
};

const towerInfo = {
    basic: {
        name: "Basic Tower",
        cost: towerCosts.basic,
        unlock: towerUnlocks.basic,
        image: "images/basictower.png",
        role: "All-rounder",
        weakness: "Falls off against armored late-wave targets.",
        baseDamage: 16,
        damageScale: 3,
        description: "Cheap reliable tower that covers early waves, but struggles to scale into tanky rounds.",
        upgrades: [
            "Lv2: Better stealth coverage",
            "Lv3: Faster combat cadence",
            "Lv4: Finisher bonus on weakened enemies",
            "Lv5: Stronger cleanup pressure"
        ]
    },
    spread: {
        name: "Spread Tower",
        cost: towerCosts.spread,
        unlock: towerUnlocks.spread,
        image: "images/spreadtower.png",
        role: "Anti-swarm",
        weakness: "Poor into tanks and bosses.",
        baseDamage: 13,
        damageScale: 2,
        description: "Covers short-range lanes with multiple pellets and shreds light enemies in groups.",
        upgrades: [
            "Lv2: Extra pellet spread",
            "Lv3: Longer pellet reach",
            "Lv4: Wider cone coverage",
            "Lv5: Pellets pierce one extra target"
        ]
    },
    sniper: {
        name: "Sniper Tower",
        cost: towerCosts.sniper,
        unlock: towerUnlocks.sniper,
        image: "images/snipertower.png",
        role: "Single-target",
        weakness: "Can be overwhelmed by swarms.",
        baseDamage: 84,
        damageScale: 12,
        description: "Deletes priority targets at long range, but only fires one slow shot at a time.",
        upgrades: [
            "Lv2: Better stealth coverage",
            "Lv3: Shots pierce a second target",
            "Lv4: Faster reload on priority kills",
            "Lv5: Boss hunter bonus damage"
        ]
    },
    splash: {
        name: "Splash Tower",
        cost: towerCosts.splash,
        unlock: towerUnlocks.splash,
        image: "images/splashtower.png",
        role: "Anti-clump",
        weakness: "Slow attack speed.",
        baseDamage: 36,
        damageScale: 7,
        description: "Punishes tightly packed enemies with area damage, but reloads slowly between shots.",
        upgrades: [
            "Lv2: Larger blast radius",
            "Lv3: Heavier anti-pack splash",
            "Lv4: Concussive slow on impact",
            "Lv5: Bigger control radius"
        ]
    },
    poison: {
        name: "Poison Tower",
        cost: towerCosts.poison,
        unlock: towerUnlocks.poison,
        image: "images/poisontower.png",
        role: "High-health attrition",
        weakness: "Low burst damage.",
        baseDamage: 11,
        damageScale: 2,
        description: "Melts durable enemies over time and gets more value the longer targets stay alive.",
        upgrades: [
          "Lv2: Better stealth coverage",
          "Lv3: Longer venom duration",
          "Lv4: Faster poison ticking",
          "Lv5: Venom jumps to a nearby target"
        ]
    },
    lightning: {
        name: "Lightning Tower",
        cost: towerCosts.lightning,
        unlock: towerUnlocks.lightning,
        image: "images/lightningtower.png",
        role: "Chain control",
        weakness: "Less efficient on isolated tanks.",
        baseDamage: 26,
        damageScale: 5,
        description: "Excels when enemies arrive in medium packs by chaining damage around the impact point.",
        upgrades: [
          "Lv2: Larger chain radius",
          "Lv3: Stronger pack damage",
          "Lv4: Shock briefly slows struck enemies",
          "Lv5: Better chain follow-through"
        ]
    },
    slow: {
        name: "Slow Tower",
        cost: towerCosts.slow,
        unlock: towerUnlocks.slow,
        image: "images/slowtower.png",
        slowAmount: 0.54,  // Reduces speed by 54%
        slowScale: 0.018,  // Extra slow per level
        duration: 145,    // Duration of slow in frames
        durationScale: 18, // Extra duration per level
        role: "Support",
        weakness: "Almost no direct damage.",
        description: "Slows enemies so your other towers have more time to finish them off.",
        upgrades: [
          "Lv2: Better stealth coverage",
          "Lv3: Slow pulse affects nearby enemies",
          "Lv4: Larger support radius",
          "Lv5: Primary target gets crippled harder"
        ]
    }
};
const towerTypes = Object.keys(towerInfo);

function getLevelModifier(level = currentLevel) {
    const modifierId = LEVEL_META[level]?.modifier;
    return modifierId ? MAP_MODIFIERS[modifierId] || null : null;
}

function getMapModifierText(level = currentLevel) {
    const modifier = getLevelModifier(level);
    return modifier ? `${modifier.name}: ${modifier.description}` : "No active modifier.";
}

function getTowerCost(type, modifier = activeMapModifier) {
    const baseCost = towerCosts[type] || 0;
    const multiplier = modifier?.towerCostMultipliers?.[type] || 1;
    return Math.round(baseCost * multiplier);
}

const TOWER_BRANCHES = {
    basic: {
        alpha: {
            name: "Vanguard",
            summary: "Harder finishers and better armored cleanup.",
            levels: ["Armor Pressure", "Heavy Finish", "Breakline", "Execution Burst"]
        },
        beta: {
            name: "Spotter",
            summary: "Longer reach and steadier lane coverage.",
            levels: ["Range Uplink", "Quick Cadence", "Lane Sight", "Overwatch"]
        }
    },
    spread: {
        alpha: {
            name: "Shredder",
            summary: "More pellets and better body-block shredding.",
            levels: ["Extra Buckshot", "Dense Spread", "Pierce Prep", "Full Tear"]
        },
        beta: {
            name: "Gale",
            summary: "Wider cone and longer anti-swarm coverage.",
            levels: ["Wider Fan", "Reach Boost", "Lane Sweep", "Crosswind"]
        }
    },
    sniper: {
        alpha: {
            name: "Deadeye",
            summary: "Leans hard into bosses, shields, and bruisers.",
            levels: ["Armor Focus", "Heavy Round", "Kill Confirm", "Boss Breaker"]
        },
        beta: {
            name: "Watcher",
            summary: "More uptime, more sightlines, and steadier pressure.",
            levels: ["Scout Scope", "Fast Cycle", "Follow-through", "Long Watch"]
        }
    },
    splash: {
        alpha: {
            name: "Siege",
            summary: "Bigger blasts and more burst into packed lanes.",
            levels: ["Payload Shells", "Blast Push", "Crater Shot", "Siege Radius"]
        },
        beta: {
            name: "Quake",
            summary: "More shells, stronger control, better crowd disruption.",
            levels: ["Fast Loader", "Shockwave", "Deep Stagger", "Aftershock"]
        }
    },
    poison: {
        alpha: {
            name: "Venom",
            summary: "Stronger ticking damage and wider infection spread.",
            levels: ["Hot Venom", "Long Burn", "Fast Ticks", "Spillover"]
        },
        beta: {
            name: "Corrosion",
            summary: "Better into shields, armor, and resistant targets.",
            levels: ["Shield Etch", "Armor Melt", "Resistance Bite", "Caustic Finish"]
        }
    },
    lightning: {
        alpha: {
            name: "Storm",
            summary: "Larger arcs and better multi-target pressure.",
            levels: ["Arc Reach", "Pack Surge", "Storm Chain", "Wide Tempest"]
        },
        beta: {
            name: "Static",
            summary: "Faster casts and stronger shock control.",
            levels: ["Quick Charge", "Deeper Shock", "Hold Current", "Static Lock"]
        }
    },
    slow: {
        alpha: {
            name: "Frostwell",
            summary: "Wider support field for lane-wide control.",
            levels: ["Field Bloom", "Slow Pulse", "Wide Aura", "Cold Front"]
        },
        beta: {
            name: "Crippler",
            summary: "Harder single-target slow and longer holds.",
            levels: ["Target Lock", "Deep Cripple", "Long Hold", "Frozen Anchor"]
        }
    }
};

function getTowerRange(type, level, branch = null, modifier = activeMapModifier) {
    const rangeTiles = {
        basic: 1.9,
        spread: 1.55,
        sniper: 4.65,
        splash: 2.2,
        poison: 2.1,
        lightning: 2.4,
        slow: 2.65
    };
    const perLevelTiles = {
        basic: 0.04,
        spread: 0.02,
        sniper: 0.12,
        splash: 0.05,
        poison: 0.06,
        lightning: 0.05,
        slow: 0.08
    };
    let totalTiles = (rangeTiles[type] || 1.8) + (perLevelTiles[type] || 0.04) * (level - 1);

    if (branch === "beta") {
        if (type === "basic") totalTiles += 0.18 + Math.max(0, level - 2) * 0.03;
        if (type === "spread") totalTiles += 0.22 + Math.max(0, level - 2) * 0.04;
        if (type === "sniper") totalTiles += 0.22 + Math.max(0, level - 2) * 0.05;
        if (type === "lightning") totalTiles += 0.08;
    }

    if (branch === "alpha" && type === "slow") {
        totalTiles += 0.24 + Math.max(0, level - 2) * 0.05;
    }

    totalTiles += modifier?.rangeBonusByType?.[type] || 0;

    return TILE_SIZE * totalTiles;
}

function getTowerCooldown(type, level, branch = null, modifier = activeMapModifier) {
    const baseCooldown = {
        basic: 24,
        spread: 34,
        sniper: 96,
        splash: 60,
        poison: 42,
        lightning: 40,
        slow: 56
    };
    const cooldownStep = {
        basic: 1.4,
        spread: 1.0,
        sniper: 3.0,
        splash: 2.0,
        poison: 1.2,
        lightning: 1.4,
        slow: 1.2
    };
    let cooldown = Math.max(14, (baseCooldown[type] || 30) - (cooldownStep[type] || 1) * (level - 1));

    if (branch === "beta") {
        if (type === "basic") cooldown *= 0.88;
        if (type === "sniper") cooldown *= 0.86;
        if (type === "splash") cooldown *= 0.87;
        if (type === "lightning") cooldown *= 0.88;
        if (type === "slow") cooldown *= 0.92;
    }

    if (branch === "alpha") {
        if (type === "spread") cooldown *= 0.94;
        if (type === "poison") cooldown *= 0.93;
    }

    cooldown *= modifier?.cooldownMultiplierByType?.[type] || 1;

    return Math.max(12, Math.round(cooldown));
}

function getTowerDamageMultiplier(towerType, enemyType) {
    switch (towerType) {
        case "basic":
            if (["tank", "boss", "megaBoss"].includes(enemyType)) return 0.72;
            return 1;
        case "spread":
            if (["tank", "boss", "megaBoss"].includes(enemyType)) return 0.45;
            if (["fast", "mini", "splitter", "stealth"].includes(enemyType)) return 1.25;
            return 1;
        case "sniper":
            if (["tank", "boss", "megaBoss", "healer", "bulwark"].includes(enemyType)) return 1.28;
            if (["mini", "fast", "rusher"].includes(enemyType)) return 0.82;
            return 1;
        case "splash":
            if (["fast", "mini", "splitter"].includes(enemyType)) return 1.18;
            if (["boss", "megaBoss"].includes(enemyType)) return 0.72;
            return 1;
        case "poison":
            if (["tank", "boss", "megaBoss", "bruiser"].includes(enemyType)) return 1.22;
            return 0.8;
        case "lightning":
            if (["fast", "splitter", "healer", "stealth"].includes(enemyType)) return 1.15;
            if (["tank", "boss", "megaBoss", "bruiser"].includes(enemyType)) return 0.76;
            return 1;
        case "slow":
            return 0;
        default:
            return 1;
    }
}

function getAdjustedTowerDamage(baseDamage, towerType, enemy, level = 1, branch = null) {
    if (!enemy) return baseDamage;
    const multiplier = getTowerDamageMultiplier(towerType, enemy.type);
    let scaled = baseDamage * multiplier;

    if (branch === "alpha") {
        if (towerType === "basic") scaled *= enemy.type === "tank" || enemy.type === "bruiser" ? 1.18 : 1.08;
        if (towerType === "sniper") scaled *= 1.12;
        if (towerType === "splash") scaled *= 1.14;
        if (towerType === "poison") scaled *= 1.04;
        if (towerType === "lightning") scaled *= 1.08;
    }

    if (branch === "beta") {
        if (towerType === "poison" && ["shield", "tank", "bruiser", "resistant"].includes(enemy.type)) scaled *= 1.16;
        if (towerType === "lightning" && ["fast", "rusher", "mini"].includes(enemy.type)) scaled *= 1.08;
    }

    if (enemy.type === "stealth" && towerType !== "sniper" && level < 2) {
        return 0;
    }
    return Math.max(0, Math.round(scaled));
}

function getPoisonTickDamage(target, level, branch = null) {
    const percentDamage = target.maxHealth * (0.012 + level * 0.0035);
    const flatDamage = 8 + level * 3;
    let tick = Math.max(flatDamage, percentDamage);
    if (branch === "alpha") tick *= 1.18;
    if (branch === "beta" && ["shield", "tank", "bruiser", "boss", "megaBoss", "resistant"].includes(target.type)) tick *= 1.1;
    return Math.round(tick);
}

function getTowerSpecials(type, level, branch = null) {
    switch (type) {
        case "basic":
            return {
                executeThreshold: level >= 4 ? (branch === "alpha" ? 0.4 : 0.35) : 0,
                executeBonus: level >= 5 ? (branch === "alpha" ? 1.65 : 1.45) : (branch === "alpha" ? 1.34 : 1.25)
            };
        case "spread":
            return {
                pelletCount: 3 + level + (level >= 4 ? 1 : 0) + (branch === "alpha" ? 1 : 0),
                coneWidth: level >= 4 ? (branch === "beta" ? Math.PI / 1.75 : Math.PI / 2) : (branch === "beta" ? Math.PI / 2 : Math.PI / 2.4),
                maxDistance: TILE_SIZE * (level >= 3 ? 3.8 : 3) + (branch === "beta" ? TILE_SIZE * 0.55 : 0),
                pierce: level >= 5 ? (branch === "alpha" ? 2 : 1) : (branch === "alpha" && level >= 4 ? 1 : 0)
            };
        case "sniper":
            return {
                pierceTargets: level >= 3 ? (branch === "beta" && level >= 5 ? 2 : 1) : 0,
                bossBonus: level >= 5 ? (branch === "alpha" ? 1.72 : 1.42) : (branch === "alpha" && level >= 3 ? 1.12 : 1),
                killReloadMultiplier: level >= 4 ? (branch === "beta" ? 0.58 : branch === "alpha" ? 0.68 : 0.72) : 1
            };
        case "splash":
            return {
                impactSlowFactor: level >= 4 ? (branch === "beta" ? 0.62 : 0.75) : 1,
                impactSlowDuration: level >= 4 ? 55 + level * 8 + (branch === "beta" ? 20 : 0) : 0,
                blastRadiusBonus: level >= 5 ? TILE_SIZE * (branch === "alpha" ? 0.32 : 0.18) : (branch === "alpha" && level >= 3 ? TILE_SIZE * 0.14 : 0)
            };
        case "poison":
            return {
                durationBonus: level >= 3 ? 40 + (branch === "alpha" ? 24 : 0) : (branch === "alpha" && level >= 2 ? 16 : 0),
                tickRateBonus: level >= 4 ? 6 + (branch === "alpha" ? 3 : 0) : 0,
                spreadOnHit: level >= 5 ? (branch === "alpha" ? 2 : 1) : 0,
                corrosionPenetration: branch === "beta" && level >= 3 ? 0.28 : branch === "beta" ? 0.14 : 0
            };
        case "lightning":
            return {
                shockSlowFactor: level >= 4 ? (branch === "beta" ? 0.68 : 0.82) : 1,
                shockDuration: level >= 4 ? 45 + level * 6 + (branch === "beta" ? 18 : 0) : 0,
                radiusBonus: level >= 5 ? TILE_SIZE * (branch === "alpha" ? 0.28 : 0.12) : (branch === "alpha" && level >= 3 ? TILE_SIZE * 0.14 : 0)
            };
        case "slow":
            return {
                splashRadius: level >= 3 ? TILE_SIZE * (0.58 + level * 0.07 + (branch === "alpha" ? 0.26 : 0)) : (branch === "alpha" && level >= 2 ? TILE_SIZE * 0.38 : 0),
                primarySlowFactor: level >= 5 ? (branch === "beta" ? 0.12 : 0.18) : (branch === "beta" && level >= 3 ? 0.22 : 0.28)
            };
        default:
            return {};
    }
}

function handleEnemyDefeatState(enemy) {
    if (!enemy || enemy.defeated) return;
    enemy.defeated = true;

    if (enemy.type === "boss" || enemy.type === "megaBoss" || enemy.type === "bruiser") {
        showWaveBanner(
            enemy.type === "megaBoss" ? "Mega Boss Down" : enemy.type === "boss" ? "Boss Down" : "Bruiser Down",
            enemy.type === "megaBoss" ? "Brace for the split." : "Lane pressure broken.",
            enemy.type === "megaBoss" ? "#ff8a7a" : "#ffd166",
            enemy.type === "megaBoss" ? 84 : 58
        );
        triggerScreenFlash(enemy.type === "megaBoss" ? "255,90,70" : "255,209,102", enemy.type === "megaBoss" ? 0.24 : 0.14);
        if (enemy.type === "megaBoss" || enemy.type === "boss") {
            triggerScreenShake(enemy.type === "megaBoss" ? 12 : 8);
        }
    }

    if (enemy.type === "megaBoss") {
        for (let i = 0; i < 2; i++) {
            const boss = getEnemy(enemy.path, "boss");
            boss.x = enemy.x + Math.random() * 40 - 20;
            boss.y = enemy.y + Math.random() * 40 - 20;
            boss.pathIndex = enemy.pathIndex;
            enemies.push(boss);
        }
    }

    if (enemy.type === "splitter") {
        splitQueue.push({
            x: enemy.x,
            y: enemy.y,
            path: enemy.path,
            pathIndex: enemy.pathIndex
        });
    }

    const rewardMultiplier = getActiveWaveRewardMultiplier();
    const reward = Math.round(ENEMY_STATS[enemy.type].reward * rewardMultiplier);
    gold += reward;
    totalGoldEarned += reward;
    handleEnemyKill(enemy.type);
    enemyKillCount++;

    if (totalGoldEarned >= 500) unlockAchievement("gold_500", "Earned 500 Gold");
    if (enemyKillCount >= 100) unlockAchievement("kill_100", "100 Enemies Defeated");
}

function applyDamageToEnemy(enemy, amount, sourceType = "basic", level = 1, sourceTower = null) {
    if (!enemy || enemy.defeated || amount <= 0) return 0;
    if (enemy.type === "phaser" && enemy.phaseTimer > 0) return 0;

    let remainingDamage = amount;
    let healthDamage = 0;
    const sourceBranch = sourceTower?.branch || null;

    if (enemy.shield > 0) {
        let shieldMultiplier = 1;
        if (sourceType === "sniper") shieldMultiplier = sourceBranch === "alpha" ? 2.15 : 1.9;
        else if (sourceType === "splash") shieldMultiplier = 1.5;
        else if (sourceType === "lightning") shieldMultiplier = 1.25;
        else if (sourceType === "poison" && sourceBranch === "beta") shieldMultiplier = 1.55;

        const shieldDamage = remainingDamage * shieldMultiplier;
        const shieldBefore = enemy.shield;
        enemy.shield -= shieldDamage;
        const shieldLost = Math.min(shieldBefore, shieldDamage);
        if (shieldLost > 0) {
            addDamageNumber(`-${Math.round(shieldLost)}`, enemy.x, enemy.y - 12, "#79beff", 26);
        }

        if (enemy.shield >= 0) {
            if (shieldBefore > 0 && enemy.shield <= 0) {
                triggerScreenFlash("121,190,255", 0.08);
            }
            return 0;
        }

        remainingDamage = Math.abs(enemy.shield) / shieldMultiplier;
        enemy.shield = 0;
    }

    const enemyResistances = ENEMY_STATS[enemy.type]?.resistances || {};
    if (enemyResistances[sourceType]) {
        let resistanceMultiplier = enemyResistances[sourceType];
        if (sourceType === "poison" && sourceBranch === "beta") {
            const penetration = getTowerSpecials(sourceType, level, sourceBranch).corrosionPenetration || 0;
            resistanceMultiplier += (1 - resistanceMultiplier) * penetration;
        }
        remainingDamage *= resistanceMultiplier;
    }

    const bulwarkReduction = enemies.reduce((reduction, other) => {
        if (other === enemy || other.defeated || other.type !== "bulwark") return reduction;
        const auraRange = TILE_SIZE * (ENEMY_STATS.bulwark.auraRange || 2.3);
        const distToBulwark = Math.hypot(enemy.x - other.x, enemy.y - other.y);
        if (distToBulwark <= auraRange) {
            return Math.max(reduction, ENEMY_STATS.bulwark.damageReduction || 0);
        }
        return reduction;
    }, 0);

    if (bulwarkReduction > 0) {
        remainingDamage *= (1 - bulwarkReduction);
    }

    healthDamage = Math.min(enemy.health, remainingDamage);
    enemy.health -= remainingDamage;
    if (sourceTower?.stats && healthDamage > 0) {
        sourceTower.stats.damageDealt += healthDamage;
    }
    if (healthDamage > 0) {
        addDamageNumber(`-${Math.round(healthDamage)}`, enemy.x, enemy.y - 4, sourceType === "poison" ? "#80ff8a" : sourceType === "lightning" ? "#9fe8ff" : "#ffd166");
        if (enemy.type === "boss" || enemy.type === "megaBoss") {
            triggerScreenShake(enemy.type === "megaBoss" ? 8 : 6);
        }
    }
    if (enemy.health <= 0) {
        spawnExplosion(enemy.x, enemy.y, enemy.type === "boss" || enemy.type === "megaBoss" ? 14 : 6);
        handleEnemyDefeatState(enemy);
        if (sourceTower?.stats) {
            sourceTower.stats.kills++;
        }
    }
    return remainingDamage;
}

function applySlowEffect(enemy, slowFactor, duration, source = "slow") {
    if (!enemy || enemy.defeated) return;
    enemy.statusEffects.push({
        type: "slow",
        slowFactor,
        duration,
        source
    });
}

function grantRelayShield(enemy, amount) {
    if (!enemy || enemy.defeated || amount <= 0) return;
    const stats = ENEMY_STATS.relay || {};
    const baseShield = ENEMY_STATS[enemy.type]?.shield || 0;
    const relayCap = baseShield + (stats.relayShieldCap || 90);
    enemy.shield = Math.min(relayCap, enemy.shield + amount);
    enemy.maxShield = Math.max(enemy.maxShield, enemy.shield, relayCap);
    enemy.relayShieldGlow = 18;
}

function recordLeakEvent(enemy) {
    const livesLost = ENEMY_STATS[enemy.type].livesLost || 1;
    leakEvents.push({
        type: enemy.type,
        livesLost,
        wave,
        at: Date.now()
    });

    const flashRadius = TILE_SIZE * 0.7;
    leakFlashEffects.push({
        x: enemy.x,
        y: enemy.y,
        radius: flashRadius,
        color: "rgba(255,80,80,0.9)",
        lifetime: 28,
        maxLifetime: 28
    });

    addFloatingMessage(`-${livesLost}❤ ${enemy.type} leaked`, enemy.x, enemy.y - 12, "#ff7b7b");
}

function getLeakSummaryLines() {
    if (leakEvents.length === 0) {
        return ["No leaks recorded."];
    }

    const grouped = {};
    leakEvents.forEach(event => {
        grouped[event.type] = grouped[event.type] || { count: 0, livesLost: 0 };
        grouped[event.type].count++;
        grouped[event.type].livesLost += event.livesLost;
    });

    return Object.entries(grouped)
        .sort((a, b) => b[1].livesLost - a[1].livesLost)
        .slice(0, 3)
        .map(([type, info]) => `${type}: ${info.count} leaks, ${info.livesLost} lives lost`);
}

function getTopTowerSummary() {
    if (towers.length === 0) return "No towers deployed";

    const topTower = towers
        .slice()
        .sort((a, b) => {
            const damageDiff = (b.stats?.damageDealt || 0) - (a.stats?.damageDealt || 0);
            if (damageDiff !== 0) return damageDiff;
            return (b.stats?.kills || 0) - (a.stats?.kills || 0);
        })[0];

    if (!topTower || !topTower.stats) return "No tower data";
    return `${topTower.type} Lv${topTower.level} | ${Math.round(topTower.stats.damageDealt)} dmg | ${topTower.stats.kills} kills`;
}

function buildGameOverSummary() {
    const leakLines = getLeakSummaryLines();
    const summary = [
        `Wave reached: ${Math.min(wave, waves.length)} / ${waves.length}`,
        `Gold earned: $${totalGoldEarned}`,
        `Enemies defeated: ${enemyKillCount}`,
        `Top tower: ${getTopTowerSummary()}`,
        "",
        "Biggest leaks:",
        ...leakLines
    ];
    return summary;
}

// Preload Tile Images
const tileImages = {
    G: new Image(), P: new Image(), T: new Image(), C: new Image(), S: new Image(), E: new Image()
};
tileImages.G.src = 'images/grass.png';
tileImages.P.src = 'images/path.png';
tileImages.T.src = 'images/tree.png';
tileImages.C.src = 'images/grass.png';
tileImages.S = tileImages.P;
tileImages.E = tileImages.P;

// Tower images
const towerImages = {
    basic: new Image(),
    spread: new Image(),
    sniper: new Image(),
    poison: new Image(),
    splash: new Image(),
    lightning: new Image(),
    slow: new Image()
};

towerImages.basic.src = "images/basictower.png";
towerImages.spread.src = "images/spreadtower.png";
towerImages.sniper.src = "images/snipertower.png";
towerImages.poison.src = "images/poisontower.png";
towerImages.splash.src = "images/splashtower.png";
towerImages.lightning.src = "images/lightningtower.png";
towerImages.slow.src = "images/slowtower.png";

// sniper tower barrel for rotation
const towerBarrels = {
    sniper: new Image()
};
towerBarrels.sniper.src = "images/sniperbarrel.png";

// pagination system
let currentPage = 0;
const towersPerPage = 3;

function renderTowerButtons() {
  const container = document.getElementById("towerPages");
  container.innerHTML = "";

  const start = currentPage * towersPerPage;
  const visibleTowers = towerTypes.slice(start, start + towersPerPage);

    visibleTowers.forEach(type => {
        const btn = document.createElement("button");
        btn.className = "tower-button";
        btn.dataset.type = type;
        btn.title = towerInfo[type].name;

    const img = document.createElement("img");
    img.src = towerInfo[type].image;
    img.alt = type;
    btn.appendChild(img);

    const label = document.createElement("small");
    label.textContent = `$${getTowerCost(type)}`;
    btn.appendChild(document.createElement("br"));
    btn.appendChild(label);

    btn.onclick = () => {
      if (!DEV_MODE && playerRank < towerUnlocks[type]) {
        addFloatingMessage(`🔒 Unlocks at Rank ${towerUnlocks[type]}`, canvas.width / 2, 80, "orange", true);
        selectedTower = null;
        selectedTowerType = type;
        updateTowerButtons();
        showTowerTypeDrawer(type);
        return;
      }
      selectedTower = null;
      selectedTowerType = selectedTowerType === type ? null : type;
      updateTowerButtons();
      if (selectedTowerType) {
        showTowerTypeDrawer(type);
      } else {
        hideTowerActionUI();
      }
    };

    container.appendChild(btn);
  });

  // ✅ Update tower button visual states
  updateTowerButtons();

  // ✅ Enable/disable arrow buttons
  const maxPage = Math.floor((towerTypes.length - 1) / towersPerPage);
  document.getElementById("prevPageBtn").disabled = currentPage === 0;
  document.getElementById("nextPageBtn").disabled = currentPage >= maxPage;
}


document.getElementById("prevPageBtn").onclick = () => {
  currentPage = Math.max(0, currentPage - 1);
  renderTowerButtons();
};

document.getElementById("nextPageBtn").onclick = () => {
  const maxPage = Math.floor((towerTypes.length - 1) / towersPerPage);
  currentPage = Math.min(maxPage, currentPage + 1);
  renderTowerButtons();
};


// enemies
const ENEMY_IMAGES = {
    basic: new Image(),
    fast: new Image(),
    rusher: null,
    tank: new Image(),
    bruiser: null,
    shield: null,
    resistant: null,
    phaser: null,
    commander: null,
    bulwark: null,
    relay: null,
    splitter: new Image(),
    mini: new Image(),
    stealth: new Image(),
    healer: new Image(),
    boss: new Image(),
    megaBoss: new Image()
};

for (let key in ENEMY_IMAGES) {
    if (ENEMY_IMAGES[key]) {
        ENEMY_IMAGES[key].src = `images/enemies/${key}.png`;
    }
}

// Bullets
const BULLET_IMAGES = {
    basic: new Image(),
    spread: new Image(),
    splash: new Image(),
    poison: new Image(),
    lightning: new Image(),
    slow: new Image()
};

BULLET_IMAGES.basic.src = "images/bullets/basic.png";
BULLET_IMAGES.spread.src = "images/bullets/spread.png";
BULLET_IMAGES.splash.src = "images/bullets/splash.png";
BULLET_IMAGES.poison.src = "images/bullets/poison.png";
BULLET_IMAGES.lightning.src = "images/bullets/lightning.png";
BULLET_IMAGES.slow.src = "images/bullets/slow.png";


// Load Sounds (Howler.js)
const sounds = {
    hit: new Howl({ src: ['sounds/hit.m4a'], pool: 2, rate: 1.0, volume: 0.21, html5: false, preload: true }),
    poison: new Howl({ src: ['sounds/poison.m4a'], pool: 2, rate: 1.0, volume: 0.21, html5: false, preload: true }),
    bg: new Howl({src: ['sounds/BG.mp3'],  loop: true, volume: 0.4, html5: false, preload: true }) 
};

let soundPlayBudget = 0; // how many hit sounds we allow per frame
const MAX_SOUNDS_PER_FRAME = 0.5; // or 0.5

let lastHitSoundTime = 0;

function queueHitSound() {
    const now = performance.now();
    if (now - lastHitSoundTime > 50 && soundPlayBudget > 0) {
        lastHitSoundTime = now;
        soundPlayBudget--;

        sounds.hit.rate(0.9 + Math.random() * 0.2);  // Optional pitch variety
        sounds.hit.volume(0.3 + Math.random() * 0.1); // Optional volume variety
        sounds.hit.play();
    }
}


function queuePoisonSound() {
  if (soundPlayBudget > 0) {
    soundPlayBudget--;
    sounds.poison.play();
  }
}

const towerDrawer = document.getElementById("towerDrawer");
const towerDrawerTitle = document.getElementById("towerDrawerTitle");
const towerDrawerMeta = document.getElementById("towerDrawerMeta");
const towerDrawerStats = document.getElementById("towerDrawerStats");
const towerDrawerPerks = document.getElementById("towerDrawerPerks");
const towerDrawerNext = document.getElementById("towerDrawerNext");
const towerDrawerUpgradeBtn = document.getElementById("towerDrawerUpgradeBtn");
const towerDrawerSellBtn = document.getElementById("towerDrawerSellBtn");

function getTowerSellValue(tower) {
    const baseCost = tower.purchaseCost || getTowerCost(tower.type);
    let totalCostInvested = baseCost;
    for (let level = 1; level < tower.level; level++) {
        totalCostInvested += towerUpgradeCost({ type: tower.type, level });
    }
    const sellRate = 0.55 + (activeMapModifier?.sellMultiplierBonus || 0);
    return Math.floor(totalCostInvested * sellRate);
}

function getTowerBranchData(type, branch) {
    return TOWER_BRANCHES[type]?.[branch] || null;
}

function getTowerBranchChoiceText(type) {
    const branches = TOWER_BRANCHES[type];
    if (!branches) return "Choose a specialization.";
    return `Choose at Lv2: ${branches.alpha.name} or ${branches.beta.name}.`;
}

function getTowerNextUpgradeText(type, level, branch = null) {
    if (level >= 5) return "Max level reached.";
    if (!branch && level === 1) return getTowerBranchChoiceText(type);

    const branchData = getTowerBranchData(type, branch);
    if (branchData?.levels?.[level - 1]) {
        return `Lv${level + 1}: ${branchData.levels[level - 1]}`;
    }

    return towerInfo[type]?.upgrades?.[level - 1] || "Upgrade available.";
}

function getTowerPerkSummary(type, level, branch = null) {
    const perks = [];
    const next = [];
    const branchData = getTowerBranchData(type, branch);

    switch (type) {
        case "basic":
            perks.push("All-rounder");
            if (level >= 2) perks.push("Stealth Sight");
            if (level >= 3) perks.push("Fast Cadence");
            if (level >= 4) perks.push("Execute");
            if (level >= 5) perks.push("Heavy Cleanup");
            if (level < 2) next.push("Stealth Sight");
            else if (level < 3) next.push("Fast Cadence");
            else if (level < 4) next.push("Execute");
            else if (level < 5) next.push("Heavy Cleanup");
            break;
        case "spread":
            perks.push("Anti-swarm");
            if (level >= 2) perks.push("Extra Pellets");
            if (level >= 3) perks.push("Longer Reach");
            if (level >= 4) perks.push("Wide Cone");
            if (level >= 5) perks.push("Pierce");
            if (level < 2) next.push("Extra Pellets");
            else if (level < 3) next.push("Longer Reach");
            else if (level < 4) next.push("Wide Cone");
            else if (level < 5) next.push("Pierce");
            break;
        case "sniper":
            perks.push("Priority Fire");
            if (level >= 2) perks.push("Stealth Sight");
            if (level >= 3) perks.push("Second Pierce");
            if (level >= 4) perks.push("Kill Reload");
            if (level >= 5) perks.push("Boss Hunter");
            if (level < 2) next.push("Stealth Sight");
            else if (level < 3) next.push("Second Pierce");
            else if (level < 4) next.push("Kill Reload");
            else if (level < 5) next.push("Boss Hunter");
            break;
        case "splash":
            perks.push("Area Damage");
            if (level >= 2) perks.push("Larger Blast");
            if (level >= 3) perks.push("Pack Punish");
            if (level >= 4) perks.push("Concussive Slow");
            if (level >= 5) perks.push("Big Radius");
            if (level < 2) next.push("Larger Blast");
            else if (level < 3) next.push("Pack Punish");
            else if (level < 4) next.push("Concussive Slow");
            else if (level < 5) next.push("Big Radius");
            break;
        case "poison":
            perks.push("Tank Attrition");
            if (level >= 2) perks.push("Stealth Sight");
            if (level >= 3) perks.push("Long Venom");
            if (level >= 4) perks.push("Fast Ticks");
            if (level >= 5) perks.push("Venom Spread");
            if (level < 2) next.push("Stealth Sight");
            else if (level < 3) next.push("Long Venom");
            else if (level < 4) next.push("Fast Ticks");
            else if (level < 5) next.push("Venom Spread");
            break;
        case "lightning":
            perks.push("Chain Control");
            if (level >= 2) perks.push("Longer Chain");
            if (level >= 3) perks.push("Pack Damage");
            if (level >= 4) perks.push("Shock Slow");
            if (level >= 5) perks.push("Arc Radius");
            if (level < 2) next.push("Longer Chain");
            else if (level < 3) next.push("Pack Damage");
            else if (level < 4) next.push("Shock Slow");
            else if (level < 5) next.push("Arc Radius");
            break;
        case "slow":
            perks.push("Support");
            if (level >= 2) perks.push("Stealth Sight");
            if (level >= 3) perks.push("Slow Pulse");
            if (level >= 4) perks.push("Wider Aura");
            if (level >= 5) perks.push("Cripple");
            if (level < 2) next.push("Stealth Sight");
            else if (level < 3) next.push("Slow Pulse");
            else if (level < 4) next.push("Wider Aura");
            else if (level < 5) next.push("Cripple");
            break;
    }

    if (!branch && level === 1) {
        const branches = TOWER_BRANCHES[type];
        if (branches) {
            next.length = 0;
            next.push(branches.alpha.name, branches.beta.name);
        }
    } else if (branchData) {
        perks.push(branchData.name);
        const unlocked = Math.max(0, level - 1);
        for (let i = 0; i < unlocked; i++) {
            if (branchData.levels[i]) perks.push(branchData.levels[i]);
        }
        if (level < 5 && branchData.levels[level - 1]) {
            next.unshift(branchData.levels[level - 1]);
        }
    }

    return { active: perks, next };
}

function renderTowerDrawerPerks(activePerks = [], nextPerks = []) {
    if (!towerDrawerPerks) return;
    towerDrawerPerks.innerHTML = "";

    activePerks.forEach(label => {
        const chip = document.createElement("span");
        chip.className = "tower-drawer__perk";
        chip.textContent = label;
        towerDrawerPerks.appendChild(chip);
    });

    nextPerks.forEach(label => {
        const chip = document.createElement("span");
        chip.className = "tower-drawer__perk tower-drawer__perk--next";
        chip.textContent = `Next: ${label}`;
        towerDrawerPerks.appendChild(chip);
    });
}

function updateTowerDrawer() {
    if (!towerDrawer) return;

    if (!towerDrawerState) {
        towerDrawer.classList.remove("is-open");
        towerDrawer.setAttribute("aria-hidden", "true");
        return;
    }

    if (towerDrawerState.kind === "tower") {
        const tower = towerDrawerState.tower;
        const info = towerInfo[tower.type];
        const upgradeCost = towerUpgradeCost(tower);
        const nextUpgrade = getTowerNextUpgradeText(tower.type, tower.level, tower.branch);
        const sellValue = getTowerSellValue(tower);
        const perkSummary = getTowerPerkSummary(tower.type, tower.level, tower.branch);

        towerDrawerTitle.textContent = `${info.name} Lv${tower.level}`;
        towerDrawerMeta.textContent = `${info.role} | ${tower.branch ? getTowerBranchData(tower.type, tower.branch)?.name : "Unbranched"} | Weakness: ${info.weakness}`;
        towerDrawerStats.textContent = `Range ${Math.round(tower.range / TILE_SIZE * 10) / 10} | Kills ${tower.stats.kills} | Damage ${Math.round(tower.stats.damageDealt)}`;
        renderTowerDrawerPerks(perkSummary.active, tower.level >= 5 ? [] : perkSummary.next.slice(0, tower.branch ? 1 : 2));
        towerDrawerNext.textContent = `Next: ${nextUpgrade}`;

        towerDrawerUpgradeBtn.textContent = tower.level >= 5 ? `Max Level (${tower.level})` : `Upgrade ($${upgradeCost})`;
        towerDrawerUpgradeBtn.disabled = tower.level >= 5;
        towerDrawerUpgradeBtn.onclick = () => {
            if (tower.level >= 5) return;
            if (gold >= upgradeCost) {
                if (!tower.branch && tower.level === 1) {
                    towerDrawerState = { kind: "branch", tower };
                    updateTowerDrawer();
                } else if (tower.upgrade()) {
                    gold -= upgradeCost;
                    updateTowerDrawer();
                    updateHUD();
                }
            } else {
                addFloatingMessage("Not enough gold!", tower.x, tower.y, "red");
            }
        };

        towerDrawerSellBtn.textContent = `Sell (+$${sellValue})`;
        towerDrawerSellBtn.disabled = !!activeWaveRules?.disableSell;
        towerDrawerSellBtn.onclick = () => {
            if (activeWaveRules?.disableSell) {
                addFloatingMessage("Sell locked this round!", tower.x, tower.y, "orange");
                return;
            }
            gold += sellValue;
            towers = towers.filter(t => t !== tower);
            selectedTower = null;
            hideTowerActionUI();
            updateHUD();
        };
    } else if (towerDrawerState.kind === "branch") {
        const tower = towerDrawerState.tower;
        const info = towerInfo[tower.type];
        const branches = TOWER_BRANCHES[tower.type];
        const upgradeCost = towerUpgradeCost(tower);

        towerDrawerTitle.textContent = `Choose ${info.name} Path`;
        towerDrawerMeta.textContent = `${info.role} | First upgrade costs $${upgradeCost}`;
        towerDrawerStats.textContent = `${branches.alpha.name}: ${branches.alpha.summary}`;
        renderTowerDrawerPerks(
            [branches.alpha.name, branches.beta.name],
            [branches.alpha.levels[0], branches.beta.levels[0]]
        );
        towerDrawerNext.textContent = `${branches.beta.name}: ${branches.beta.summary} Tap outside the drawer to cancel.`;

        towerDrawerUpgradeBtn.textContent = branches.alpha.name;
        towerDrawerUpgradeBtn.disabled = false;
        towerDrawerUpgradeBtn.onclick = () => {
            if (gold < upgradeCost) {
                addFloatingMessage("Not enough gold!", tower.x, tower.y, "red");
                return;
            }
            if (tower.upgrade("alpha")) {
                gold -= upgradeCost;
                towerDrawerState = { kind: "tower", tower };
                updateTowerDrawer();
                updateHUD();
            }
        };

        towerDrawerSellBtn.textContent = branches.beta.name;
        towerDrawerSellBtn.disabled = false;
        towerDrawerSellBtn.onclick = () => {
            if (gold < upgradeCost) {
                addFloatingMessage("Not enough gold!", tower.x, tower.y, "red");
                return;
            }
            if (tower.upgrade("beta")) {
                gold -= upgradeCost;
                towerDrawerState = { kind: "tower", tower };
                updateTowerDrawer();
                updateHUD();
            }
        };
    } else if (towerDrawerState.kind === "type") {
        const type = towerDrawerState.type;
        const info = towerInfo[type];
        const unlockRank = towerUnlocks[type];
        const isUnlocked = DEV_MODE || playerRank >= unlockRank;
        const firstUpgrade = getTowerNextUpgradeText(type, 1, null);
        const perkSummary = getTowerPerkSummary(type, 1, null);
        const branches = TOWER_BRANCHES[type];

        towerDrawerTitle.textContent = `${info.name} $${getTowerCost(type)}`;
        towerDrawerMeta.textContent = `${info.role} | Weakness: ${info.weakness}`;
        towerDrawerStats.textContent = isUnlocked
            ? info.description
            : `Unlocks at Rank ${unlockRank}. Current Rank ${playerRank}.`;
        renderTowerDrawerPerks(perkSummary.active, perkSummary.next.slice(0, 2));
        towerDrawerNext.textContent = branches
            ? `${firstUpgrade} ${branches.alpha.name}: ${branches.alpha.summary} ${branches.beta.name}: ${branches.beta.summary}`
            : `Upgrades start: ${firstUpgrade}`;

        towerDrawerUpgradeBtn.textContent = isUnlocked ? `Ready: Tap Map ($${getTowerCost(type)})` : `Locked Until Rank ${unlockRank}`;
        towerDrawerUpgradeBtn.disabled = !isUnlocked;
        towerDrawerUpgradeBtn.onclick = () => {};

        towerDrawerSellBtn.textContent = "Cancel";
        towerDrawerSellBtn.disabled = false;
        towerDrawerSellBtn.onclick = () => {
            selectedTowerType = null;
            updateTowerButtons();
            hideTowerActionUI();
        };
    }

    towerDrawer.classList.add("is-open");
    towerDrawer.setAttribute("aria-hidden", "false");
}

function showTowerTypeDrawer(type) {
    towerDrawerState = { kind: "type", type };
    updateTowerDrawer();
}


updateTowerButtons();

document.getElementById("startWaveBtn").onclick = () => {
    const rushBonus = calculateRushBonus();
    if (rushBonus > 0) {
        gold += rushBonus;
        runRushBonusTotal += rushBonus;
        if (rushBonus >= 8) {
            runQuickStarts++;
        }
        addFloatingMessage(`Quick Deploy +$${rushBonus}`, canvas.width / 2, 82, "#7ce8ff", true);
    }
    currentWaveStartLives = lives;
    waveReadyAt = 0;
    pendingRushBonus = 0;
    startNextWave();
    document.getElementById("startWaveBtn").style.display = "none";
};

const enemyPool = [];
const bulletPool = [];
const splashBulletPool = [];
const poisonBulletPool = [];
const spreadBulletPool = [];
const lightningBulletPool = [];
const slowBulletPool = [];

function preallocateEnemies(count = 200) {
    const dummyPath = [{ x: 0, y: 0 }];
    for (let i = 0; i < count; i++) {
        enemyPool.push(new Enemy(dummyPath, "basic"));
    }
}


function preallocateAllBulletTypes(basic = 300, special = 300) {
    for (let i = 0; i < basic; i++) {
        bulletPool.push(new Bullet(0, 0, null, 1));
    }
    for (let i = 0; i < special; i++) {
        splashBulletPool.push(new SplashBullet(0, 0, null, 1));
        poisonBulletPool.push(new PoisonBullet(0, 0, null, 1));
        spreadBulletPool.push(new Bullet(0, 0, null, 1, 0));
    }
}


// Get a bullet from the pool or create a new one
function getBullet(x, y, target, level, angle = null, type = "basic") {
    const bullet = bulletPool.pop() || new Bullet(x, y, target, level, angle, type);
    bullet.reset(x, y, target, level, angle, type);
    return bullet;
}

// When done (bullet hit or expired), return to pool:
function releaseBullet(bullet) {
    bulletPool.push(bullet);
}

function getSplashBullet(x, y, target, level, type = "splash") {
    const bullet = splashBulletPool.pop() || new SplashBullet(x, y, target, level, type);
    bullet.reset(x, y, target, level, type);
    return bullet;
}

function releaseSplashBullet(bullet) {
    splashBulletPool.push(bullet);
}

function getPoisonBullet(x, y, target, level, type = "poison") {
    const bullet = poisonBulletPool.pop() || new PoisonBullet(x, y, target, level, type);
    bullet.reset(x, y, target, level, type);
    return bullet;
}

function releasePoisonBullet(bullet) {
    poisonBulletPool.push(bullet);
}

function getSpreadBullet(x, y, level, angle, type = "spread") {
    const bullet = spreadBulletPool.pop() || new Bullet(x, y, null, level, angle, type);
    bullet.reset(x, y, null, level, angle, type);
    const specials = getTowerSpecials(type, level);
    bullet.speed = 4; // 🔹 Make spread slower
    bullet.maxDistance = specials.maxDistance || TILE_SIZE * 3;
    bullet.pierceRemaining = specials.pierce || 0;
    return bullet;
}

function releaseSpreadBullet(bullet) {
    spreadBulletPool.push(bullet);
}

function getLightningBullet(x, y, target, level, type = "lightning") {
  const bullet = lightningBulletPool.pop() || new LightningBullet(x, y, target, level, type);
  bullet.reset(x, y, target, level, type);
  return bullet;
}

function releaseLightningBullet(bullet) {
  lightningBulletPool.push(bullet);
}

function getSlowBullet(x, y, target, level, type = "slow") {
  const bullet = slowBulletPool.pop() || new SlowBullet(x, y, target, level, type);
  bullet.reset(x, y, target, level, type);
  return bullet;
}

function releaseSlowBullet(bullet) {
  slowBulletPool.push(bullet);
}

function getEnemy(path, type = "basic") {
    const enemy = enemyPool.pop() || new Enemy(path, type);
    enemy.reset(path, type);
    return enemy;
}

function releaseEnemy(enemy) {
    enemy.statusEffects = [];
    enemy.statusTimers = {};

    if (!enemyPool.includes(enemy)) {
        enemyPool.push(enemy);
    }
}


function calculateTileSize() {
    if (!Array.isArray(currentMap) || !currentMap.length || !Array.isArray(currentMap[0])) return;
    const cols = currentMap[0].length;
    const rows = currentMap.length;

    const tileW = canvas.width / cols;
    const tileH = canvas.height / rows;

    TILE_SIZE = Math.floor(Math.min(tileW, tileH));
}

function updateMapOffsets() {
    if (!Array.isArray(currentMap) || !currentMap.length || !Array.isArray(currentMap[0])) {
        mapOffsetX = 0;
        mapOffsetY = 0;
        return;
    }

    const mapWidth = currentMap[0].length * TILE_SIZE;
    const mapHeight = currentMap.length * TILE_SIZE;
    mapOffsetX = Math.floor((canvas.width - mapWidth) / 2);
    mapOffsetY = Math.floor((canvas.height - mapHeight) / 2);
}

function isInsideMap(x, y) {
    if (!Array.isArray(currentMap) || !currentMap.length || !Array.isArray(currentMap[0])) return false;

    const mapWidth = currentMap[0].length * TILE_SIZE;
    const mapHeight = currentMap.length * TILE_SIZE;
    return x >= 0 && y >= 0 && x < mapWidth && y < mapHeight;
}

function resizeCanvas() {
    const hud = document.getElementById("hudBar");
    const panel = document.getElementById("towerPanel");
    const hudHeight = hud?.offsetHeight || 60;
    const panelHeight = panel?.offsetHeight || 76;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - hudHeight - panelHeight;

    calculateTileSize();
    updateMapOffsets();
}

window.addEventListener('resize', resizeCanvas);


// Classes
class Tower {
    constructor(x, y, type = "basic") {
        this.x = x;
        this.y = y;
        this.type = type;
        this.purchaseCost = getTowerCost(type);
        this.id = towerIdCounter++;
        this.cooldown = 0;
        this.level = 1;
        this.branch = null;
        this.angle = 0; // 🆕 Track facing direction
        this.stats = {
            damageDealt: 0,
            kills: 0
        };
        this.refreshStats();
    }

    refreshStats() {
        this.range = getTowerRange(this.type, this.level, this.branch);
        this.fireCooldown = getTowerCooldown(this.type, this.level, this.branch);
        this.specials = getTowerSpecials(this.type, this.level, this.branch);
    }

    upgrade(branchChoice = null) {
        if (this.level >= 5) return false;
        if (!this.branch && this.level === 1) {
            if (!branchChoice) return false;
            this.branch = branchChoice;
        }
        this.level++;
        this.refreshStats();
        return true;
    }

    getPackPressureTarget(enemies, inRange, radius) {
        let best = null;
        let bestScore = -1;
        for (const enemy of enemies) {
            if (!inRange(enemy)) continue;
            const nearby = enemies.filter(other => inRange(other) && Math.hypot(enemy.x - other.x, enemy.y - other.y) <= radius).length;
            if (nearby > bestScore || (nearby === bestScore && (!best || enemy.pathIndex > best.pathIndex))) {
                best = enemy;
                bestScore = nearby;
            }
        }
        return best;
    }

    update(enemies, bullets, delta = 1) {
        if (this.cooldown > 0) {
            this.cooldown -= delta;
            return;
        }

        const inRange = (e) => {
            if (e.type === "stealth" && this.level < 2) return false;
            return Math.hypot(this.x - e.x, this.y - e.y) < this.range;
        };

        let didFire = false;

        if (this.type === "poison") {
            const target = enemies
                .filter(inRange)
                .sort((a, b) => (b.maxHealth - a.maxHealth) || (b.pathIndex - a.pathIndex))[0];
            if (target) {
                bullets.push(getPoisonBullet(this.x, this.y, target, this.level, this.type));
                bullets[bullets.length - 1].sourceTower = this;
                queuePoisonSound?.();
                this.cooldown = this.fireCooldown;
                didFire = true;
            }
        } else if (this.type === "sniper") {
            let best = null;
            for (const e of enemies) {
                if (inRange(e) && (!best || e.pathIndex > best.pathIndex || (e.pathIndex === best.pathIndex && e.maxHealth > best.maxHealth))) {
                    best = e;
                }
            }
            const target = best;
            if (target) {
                const dx = target.x - this.x;
                const dy = target.y - this.y;
                this.angle = Math.atan2(dy, dx) + Math.PI / 2;

                const barrelLength = 12;
                const tipX = this.x + Math.cos(this.angle - Math.PI / 2) * barrelLength;
                const tipY = this.y + Math.sin(this.angle - Math.PI / 2) * barrelLength;

                const bullet = getBullet(tipX, tipY, target, this.level, null, this.type);
                bullet.sourceTower = this;
                bullets.push(bullet);
                queueHitSound();
                this.cooldown = this.fireCooldown;
                didFire = true;
            }
        } else if (this.type === "splash") {
            const target = this.getPackPressureTarget(enemies, inRange, TILE_SIZE * (1.1 + this.level * 0.05));
            if (target) {
                const bullet = getSplashBullet(this.x, this.y, target, this.level, this.type);
                bullet.sourceTower = this;
                bullets.push(bullet);
                queueHitSound();
                this.cooldown = this.fireCooldown;
                didFire = true;
            }
        } else if (this.type === "basic") {
            const target = enemies
                .filter(inRange)
                .sort((a, b) => b.pathIndex - a.pathIndex)[0];
            if (target) {
                const b = getBullet(this.x, this.y, target, this.level, null, this.type);
                b.sourceTower = this;
                bullets.push(b);
                queueHitSound();
                this.cooldown = this.fireCooldown;
                didFire = true;
            }
        } else if (this.type === "spread") {
            const target = this.getPackPressureTarget(enemies, inRange, TILE_SIZE * 1.15);
            if (target) {
                const angleToTarget = Math.atan2(target.y - this.y, target.x - this.x);
                const spread = this.specials.coneWidth;
                const numBullets = this.specials.pelletCount;

                for (let i = 0; i < numBullets; i++) {
                    const offset = (-spread / 2) + (spread * i) / (numBullets - 1);
                    const angle = angleToTarget + offset;
                    const bullet = getSpreadBullet(this.x, this.y, this.level, angle, this.type);
                    bullet.sourceTower = this;
                    bullet.pierceRemaining = this.specials.pierce;
                    bullet.maxDistance = this.specials.maxDistance;
                    bullets.push(bullet);
                }

                queueHitSound();
                this.cooldown = this.fireCooldown;
                didFire = true;
            }
        } else if (this.type === "lightning") {
              const target = this.getPackPressureTarget(enemies, inRange, TILE_SIZE * (1.4 + this.level * 0.08));
              if (target) {
                const bullet = getLightningBullet(this.x, this.y, target, this.level, this.type);
                bullet.sourceTower = this;
                bullets.push(bullet);
                queueHitSound?.();
                this.cooldown = this.fireCooldown;
                didFire = true;
              }
        }else if (this.type === "slow") {
          const target = enemies
            .filter(inRange)
            .sort((a, b) => ENEMY_STATS[b.type].speed - ENEMY_STATS[a.type].speed || b.pathIndex - a.pathIndex)[0];
          if (target) {
            const bullet = getSlowBullet(this.x, this.y, target, this.level, this.type);
            bullet.sourceTower = this;
            bullets.push(bullet);
            queueHitSound?.();
            this.cooldown = this.fireCooldown;
            didFire = true;
          }
        }
        
        if (didFire) {
            this.cooldown *= (1 / delta); // Adjust cooldown to remain consistent
        }
    }
    

    draw(){
        const baseImg = towerImages[this.type];
        const barrelImg = towerBarrels[this.type]; // 🆕
        const size = TILE_SIZE * 0.8;
        const offset = size / 2;

        // Draw base image (no rotation)
        if (baseImg?.complete) {
            ctx.drawImage(baseImg, this.x - offset, this.y - offset, size, size);
        } else {
            ctx.fillStyle = "gray";
            ctx.fillRect(this.x - offset, this.y - offset, size, size);
        }

        // Rotate and draw barrel (only for sniper)
        if (this.type === "sniper" && barrelImg?.complete) {
            const barrelW = 14 * 0.9;
            const barrelH = 62 * 0.9;

            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle); // barrel faces up by default

            // ✅ Shift barrel upward so it pivots from the bottom-center
            ctx.drawImage(
                barrelImg,
                -barrelW / 2,
                -barrelH + 10, // adjust anchor upward
                barrelW,
                barrelH
            );

            ctx.restore();
        }


        // Range on hover
        if (hoveredTower === this) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(255,255,255,0.2)";
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Selection indicator
        if (selectedTower === this) {
            const padding = 4;
            ctx.strokeStyle = "yellow";
            ctx.lineWidth = 2;
            ctx.strokeRect(
                this.x - offset - padding / 2,
                this.y - offset - padding / 2,
                size + padding,
                size + padding
            );
        }

        // Tower level
        ctx.fillStyle = "white";
        ctx.font = "10px monospace";
        ctx.fillText(`Lv${this.level}`, this.x - 10, this.y + TILE_SIZE / 2);
    }
    
    getBarrelEnd() {
        if (this.type !== "sniper") return { x: this.x, y: this.y };

        const barrelLength = 62 * 0.9; // match scaled barrel height
        const offset = barrelLength - 10; // adjust if needed

        return {
            x: this.x + Math.cos(this.angle) * offset,
            y: this.y + Math.sin(this.angle) * offset
        };
    }


}


class Bullet {
    
    constructor(x, y, target, level, angle = null, type = "basic") {
        this.reset(x, y, target, level, angle, type);
    }

    reset(x, y, target, level, angle = null, type = "basic") {
        this.x = x;
        this.y = y;
        this.target = target;
        this.level = level;
        this.angle = angle;
        this.type = type;
        this.speed = (angle !== null ? 4 : 5 + level); // Slower if spread
        const info = towerInfo[this.type];
        this.damage = Math.floor(info.baseDamage + info.damageScale * Math.sqrt(level - 1));
        this.hit = false; // ✅ ONLY reset here
        this.traveled = 0;
        this.maxDistance = TILE_SIZE * 6;
        this.pierceRemaining = 0;
        this.sourceTower = null;
    }

    update(delta = 1) {
        if (this.hit) return;

        if (this.target) {
            if (!enemies.includes(this.target) || this.target.health <= 0) {
                this.markForRelease();
                return;
            }

            const dx = this.target.x - this.x;
            const dy = this.target.y - this.y;
            const dist = Math.hypot(dx, dy);
            const moveDist = this.speed * delta;

            if (dist < moveDist) {
                let damage = getAdjustedTowerDamage(this.damage, this.type, this.target, this.level, this.sourceTower?.branch || null);
                const specials = getTowerSpecials(this.type, this.level);
                if (this.type === "basic" && specials.executeThreshold > 0 && this.target.health / this.target.maxHealth <= specials.executeThreshold) {
                    damage = Math.round(damage * specials.executeBonus);
                }
                if (this.type === "sniper" && ["boss", "megaBoss", "tank", "shield"].includes(this.target.type)) {
                    damage = Math.round(damage * specials.bossBonus);
                }
                applyDamageToEnemy(this.target, damage, this.type, this.level, this.sourceTower);
                //spawnExplosion(this.target.x, this.target.y);
                this.handleEnemyKill(this.target);

                if (this.type === "sniper" && specials.pierceTargets > 0) {
                    const nearbyTargets = enemies
                        .filter(enemy => enemy !== this.target && !enemy.defeated && Math.hypot(enemy.x - this.target.x, enemy.y - this.target.y) <= TILE_SIZE * 0.9)
                        .sort((a, b) => b.pathIndex - a.pathIndex)
                        .slice(0, specials.pierceTargets);
                    nearbyTargets.forEach(enemy => {
                        const pierceDamage = Math.round(damage * 0.7);
                        applyDamageToEnemy(enemy, pierceDamage, this.type, this.level, this.sourceTower);
                        this.handleEnemyKill(enemy);
                    });
                }

                if (this.type === "sniper" && this.target.defeated) {
                    if (this.sourceTower) {
                        this.sourceTower.cooldown *= specials.killReloadMultiplier;
                    }
                }
                this.markForRelease();
            } else {
                this.x += (dx / dist) * moveDist;
                this.y += (dy / dist) * moveDist;
            }

        } else if (this.angle !== null) {
            const dx = Math.cos(this.angle) * this.speed * delta;
            const dy = Math.sin(this.angle) * this.speed * delta;
            this.x += dx;
            this.y += dy;
            this.traveled += Math.hypot(dx, dy);

            for (let enemy of enemies) {
                if (enemy.type === "stealth" && this.level < 2) continue;

                const dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
                if (dist < TILE_SIZE / 5) {
                    applyDamageToEnemy(enemy, getAdjustedTowerDamage(this.damage, this.type, enemy, this.level, this.sourceTower?.branch || null), this.type, this.level, this.sourceTower);
                    //spawnExplosion(enemy.x, enemy.y);
                    this.handleEnemyKill(enemy);
                    if (this.pierceRemaining > 0) {
                        this.pierceRemaining--;
                    } else {
                        this.markForRelease();
                        break;
                    }
                }
            }

            if (this.traveled >= this.maxDistance && !this.hit) {
                this.markForRelease();
            }
        }
    }


    markForRelease() {
        this.hit = true;
        if (this.angle !== null) {
            releaseSpreadBullet(this);
        } else {
            releaseBullet(this);
        }
    }

    handleEnemyKill(enemy) {
        if (enemy.health > 0 && !enemy.defeated) return;
        handleEnemyDefeatState(enemy);
    }

   draw() {
        if (this.hit) return;

        const img = this.angle !== null ? BULLET_IMAGES.spread : BULLET_IMAGES.basic;
        const size = TILE_SIZE * 0.25;

        if (img.complete) {
            ctx.drawImage(img, this.x - size / 2, this.y - size / 2, size, size);
        } else {
            ctx.fillStyle = "yellow";
            ctx.beginPath();
            ctx.arc(this.x, this.y, size / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

}


class SplashBullet {
    constructor(x, y, target, level, type = "splash") {
        this.reset(x, y, target, level, type);
    }

    reset(x, y, target, level, type = "splash") {
        this.x = x;
        this.y = y;
        this.target = target;
        this.level = level;
        this.speed = 4 + level;
        this.type = type;
        this.damage = Math.floor(22 + 5 * Math.sqrt(level));
        this.explosionRadius = TILE_SIZE * (1.15 + level * 0.08) + getTowerSpecials(type, level).blastRadiusBonus;
        this.hit = false;
        this.sourceTower = null;
    }

    update(delta = 1) {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const dist = Math.hypot(dx, dy);
        const moveDist = this.speed * delta;

        if (dist < moveDist) {
            for (let enemy of enemies) {
                const d = Math.hypot(enemy.x - this.x, enemy.y - this.y);
                if (d < this.explosionRadius) {
                    if (enemy.type === "stealth" && this.level < 2) continue;
                    applyDamageToEnemy(enemy, getAdjustedTowerDamage(this.damage, this.type, enemy, this.level, this.sourceTower?.branch || null), this.type, this.level, this.sourceTower);
                    //spawnExplosion(enemy.x, enemy.y);
                    this.handleEnemyKill?.(enemy); // Safe in case reused

                    const specials = getTowerSpecials(this.type, this.level);
                    if (specials.impactSlowDuration > 0) {
                        applySlowEffect(enemy, specials.impactSlowFactor, specials.impactSlowDuration, "concussive");
                    }
                    if (enemy.health <= 0 || enemy.defeated) this.handleEnemyKill?.(enemy);
                }
            }

            this.hit = true;
            releaseSplashBullet(this);
        } else {
            this.x += (dx / dist) * moveDist;
            this.y += (dy / dist) * moveDist;
        }
    }


    draw() {
        const img = BULLET_IMAGES.splash;
        const size = TILE_SIZE * 0.3;

        if (img.complete) {
            ctx.drawImage(img, this.x - size / 2, this.y - size / 2, size, size);
        } else {
            ctx.fillStyle = "orange";
            ctx.beginPath();
            ctx.arc(this.x, this.y, size / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

}


class PoisonBullet {
    constructor(x, y, target, level, type = "poison") {
        this.reset(x, y, target, level, type);
    }

    reset(x, y, target, level, type = "poison") {
        this.x = x;
        this.y = y;
        this.target = target;
        this.level = level;
        this.speed = 4 + level;
        this.hit = false;
        this.type = type;
        const info = towerInfo[this.type];
        this.damage = Math.floor(info.baseDamage + info.damageScale * Math.sqrt(level));
        this.sourceTower = null;

    }

    update(delta = 1) {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const dist = Math.hypot(dx, dy);
        const moveDist = this.speed * delta;

        if (dist < moveDist) {
                const poisonTick = getPoisonTickDamage(this.target, this.level, this.sourceTower?.branch || null);
            const specials = getTowerSpecials(this.type, this.level);
            this.target.statusEffects.push({
                type: "poison",
                damage: poisonTick,
                tickRate: Math.max(12, 30 - this.level * 2 - specials.tickRateBonus),
                duration: 120 + this.level * 20 + specials.durationBonus,
                sourceTower: this.sourceTower,
                sourceType: this.type,
                sourceLevel: this.level
            });

            if (specials.spreadOnHit > 0) {
                const secondaryTarget = enemies
                    .filter(enemy => enemy !== this.target && !enemy.defeated && Math.hypot(enemy.x - this.target.x, enemy.y - this.target.y) <= TILE_SIZE * 1.25)
                    .sort((a, b) => (b.maxHealth - a.maxHealth) || (b.pathIndex - a.pathIndex))[0];
                if (secondaryTarget) {
                    secondaryTarget.statusEffects.push({
                        type: "poison",
                        damage: Math.round(poisonTick * 0.7),
                        tickRate: Math.max(14, 32 - this.level * 2),
                        duration: 90 + this.level * 16,
                        sourceTower: this.sourceTower,
                        sourceType: this.type,
                        sourceLevel: this.level
                    });
                }
            }

            spawnExplosion(this.target.x, this.target.y, 4);
            this.hit = true;
            releasePoisonBullet(this);
        } else {
            this.x += (dx / dist) * moveDist;
            this.y += (dy / dist) * moveDist;
        }
    }


    draw() {
        const img = BULLET_IMAGES.poison;
        const size = TILE_SIZE * 0.25;

        if (img.complete) {
            ctx.drawImage(img, this.x - size / 2, this.y - size / 2, size, size);
        } else {
            ctx.fillStyle = "limegreen";
            ctx.beginPath();
            ctx.arc(this.x, this.y, size / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

}

// lightning bullet
class LightningBullet {
  constructor(x, y, target, level, type = "lightning") {
    this.reset(x, y, target, level, type);
  }

    reset(x, y, target, level, type = "lightning") {
    this.x = x;
    this.y = y;
    this.target = target;
    this.level = level;
    this.speed = 6;
    this.type = type;
    const info = towerInfo[this.type];
    this.damage = Math.floor(info.baseDamage + info.damageScale * Math.sqrt(level));
    this.radius = TILE_SIZE * (1.35 + level * 0.12) + getTowerSpecials(type, level).radiusBonus;
    this.hit = false;
    this.sourceTower = null;
  }

  update(delta = 1) {
      if (this.hit) return;

      const dx = this.target.x - this.x;
      const dy = this.target.y - this.y;
      const dist = Math.hypot(dx, dy);
      const step = this.speed * delta;

      if (dist < step) {
        const specials = getTowerSpecials(this.type, this.level);
        for (let e of enemies) {
          const d = Math.hypot(e.x - this.target.x, e.y - this.target.y);
          if (d <= this.radius) {
            applyDamageToEnemy(e, getAdjustedTowerDamage(this.damage, this.type, e, this.level, this.sourceTower?.branch || null), this.type, this.level, this.sourceTower);
            if (specials.shockDuration > 0) {
                applySlowEffect(e, specials.shockSlowFactor, specials.shockDuration, "shock");
            }
            
            if (e.health <= 0 || e.defeated) handleEnemyDefeatState(e);
          }
        }

        spawnLightningAnimation(this.target.x, this.target.y);
        releaseLightningBullet(this);
        this.hit = true;
      } else {
        this.x += (dx / dist) * step;
        this.y += (dy / dist) * step;
      }
    }


    draw() {
        const img = BULLET_IMAGES.lightning;
        const size = TILE_SIZE * 0.3;

        if (img?.complete) {
          ctx.drawImage(img, this.x - size / 2, this.y - size / 2, size, size);
        } else {
          ctx.fillStyle = "cyan";
          ctx.beginPath();
          ctx.arc(this.x, this.y, size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
    }
}

// slow bullet
class SlowBullet {
  constructor(x, y, target, level, type = "slow") {
    this.reset(x, y, target, level, type);
  }

  reset(x, y, target, level, type = "slow") {
    this.x = x;
    this.y = y;
    this.target = target;
    this.level = level;
    this.speed = 4 + level;
    this.type = type;
    this.hit = false;
    const info = towerInfo[this.type];
    this.slowAmount = info.slowAmount + info.slowScale * level;
    this.duration = info.duration + info.durationScale * level;
    this.sourceTower = null;

  }

  update(delta = 1) {
    if (this.hit) return;

    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist < this.speed * delta) {
      const specials = getTowerSpecials(this.type, this.level);
      applySlowEffect(this.target, specials.primarySlowFactor, this.duration, "slow");

      if (specials.splashRadius > 0) {
        enemies
          .filter(enemy => enemy !== this.target && !enemy.defeated && Math.hypot(enemy.x - this.target.x, enemy.y - this.target.y) <= specials.splashRadius)
          .forEach(enemy => applySlowEffect(enemy, Math.max(0.32, 1 - this.slowAmount * 0.65), Math.floor(this.duration * 0.7), "slow"));
      }

      releaseSlowBullet(this);
      //spawnExplosion(this.target.x, this.target.y, 2);
      this.hit = true;
    } else {
      this.x += (dx / dist) * this.speed * delta;
      this.y += (dy / dist) * this.speed * delta;
    }
  }

  draw() {
    const img = BULLET_IMAGES.slow;
    const size = TILE_SIZE * 0.3;

    if (img?.complete) {
      ctx.drawImage(img, this.x - size / 2, this.y - size / 2, size, size);
    } else {
      ctx.fillStyle = "lightblue";
      ctx.beginPath();
      ctx.arc(this.x, this.y, size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}



class Enemy {
    constructor(path, type = "basic") {
        this.reset(path, type);
    }
    
    reset(path, type = "basic") {
        this.path = path;
        this.pathIndex = 0;

        if (path && path.length > 0) {
            this.x = path[0].x;
            this.y = path[0].y;
        } else {
            this.x = 0;
            this.y = 0;
        }

        this.type = type;
        this.health = ENEMY_STATS[type].health;
        this.speed = ENEMY_STATS[type].speed;
        this.maxHealth = this.health;
        this.lastDrawnHp = this.health;
        this.shield = ENEMY_STATS[type].shield || 0;
        this.maxShield = this.shield;
        this.defeated = false;
        this.leaked = false;
        this.statusEffects = [];
        this.statusTimers = {};
        this.phaseCooldown = ENEMY_STATS[type].phaseCooldown || 0;
        this.phaseTimer = 0;
        this.phaseJumped = false;
        this.relayPulseTimer = ENEMY_STATS[type].relayPulse || 0;
        this.healerPulseTimer = ENEMY_STATS[type].cleansePulse || 0;
        this.relayShieldGlow = 0;
    }

    update(delta = 1) {
        if (this.defeated) return;

        // Check for leak
        if (this.pathIndex >= this.path.length - 1) {
            this.leaked = true;
            return;
        }

        // Compute next tile vector
        const next = this.path[this.pathIndex + 1];
        const dx = next.x - this.x;
        const dy = next.y - this.y;
        const dist = Math.hypot(dx, dy);

        // Default speed
        let actualSpeed = this.speed;

        if (this.type === "phaser") {
            if (this.phaseTimer > 0) {
                this.phaseTimer -= delta;
                actualSpeed *= ENEMY_STATS.phaser.phaseSpeedMultiplier || 1.55;
                if (!this.phaseJumped && this.pathIndex < this.path.length - 2) {
                    const jumpSteps = Math.min(ENEMY_STATS.phaser.phaseJump || 1, this.path.length - this.pathIndex - 2);
                    if (jumpSteps > 0) {
                        this.pathIndex += jumpSteps;
                        const jumpTarget = this.path[this.pathIndex];
                        this.x = jumpTarget.x;
                        this.y = jumpTarget.y;
                    }
                    this.phaseJumped = true;
                }
            } else if (this.phaseCooldown > 0) {
                this.phaseCooldown -= delta;
            } else {
                this.phaseTimer = ENEMY_STATS.phaser.phaseDuration || 30;
                this.phaseCooldown = ENEMY_STATS.phaser.phaseCooldown || 150;
                this.phaseJumped = false;
            }
        }

        // Apply slow if active
        const slowEffect = this.statusEffects
            .filter(effect => effect.type === "slow")
            .sort((a, b) => a.slowFactor - b.slowFactor)[0];
        if (slowEffect && this.phaseTimer <= 0) {
            actualSpeed *= slowEffect.slowFactor || 0.5; // e.g. 50% slow
        }

        if (this.type !== "commander") {
            const commanderBonus = enemies
                .filter(other => other !== this && !other.defeated && other.type === "commander")
                .reduce((bonus, commander) => {
                    const auraRange = TILE_SIZE * (ENEMY_STATS.commander.auraRange || 2);
                    const distToCommander = Math.hypot(this.x - commander.x, this.y - commander.y);
                    if (distToCommander <= auraRange) {
                        return bonus + (ENEMY_STATS.commander.auraBoost || 0.12);
                    }
                    return bonus;
                }, 0);
            actualSpeed *= Math.min(1.42, 1 + commanderBonus);
        }

        const moveDist = actualSpeed * delta;

        if (dist < moveDist) {
            this.x = next.x;
            this.y = next.y;
            this.pathIndex++;
        } else {
            this.x += (dx / dist) * moveDist;
            this.y += (dy / dist) * moveDist;
        }

        // Healer logic
        if (this.type === "healer") {
            for (let other of enemies) {
                if (other === this || other.health <= 0 || other.health >= other.maxHealth) continue;
                const d = Math.hypot(this.x - other.x, this.y - other.y);
                if (d < TILE_SIZE * 2) {
                    other.health += 0.3 * delta;
                    if (other.health > other.maxHealth) other.health = other.maxHealth;
                }
            }

            this.healerPulseTimer -= delta;
            if (this.healerPulseTimer <= 0) {
                this.healerPulseTimer = ENEMY_STATS.healer.cleansePulse || 90;
                const cleanseTarget = enemies
                    .filter(other => other !== this && !other.defeated && Math.hypot(this.x - other.x, this.y - other.y) < TILE_SIZE * 2.1)
                    .find(other => other.statusEffects.some(effect => effect.type === "poison" || effect.type === "slow"));
                if (cleanseTarget) {
                    const removableIndex = cleanseTarget.statusEffects.findIndex(effect => effect.type === "poison" || effect.type === "slow");
                    if (removableIndex >= 0) {
                        cleanseTarget.statusEffects.splice(removableIndex, 1);
                        cleanseTarget.statusTimers = {};
                    }
                }
            }
        }

        if (this.type === "relay") {
            this.relayPulseTimer -= delta;
            if (this.relayPulseTimer <= 0) {
                this.relayPulseTimer = ENEMY_STATS.relay.relayPulse || 55;
                const relayRange = TILE_SIZE * (ENEMY_STATS.relay.relayRange || 2.3);
                enemies.forEach(other => {
                    if (other === this || other.defeated) return;
                    if (Math.hypot(this.x - other.x, this.y - other.y) <= relayRange) {
                        grantRelayShield(other, ENEMY_STATS.relay.relayShieldAmount || 34);
                    }
                });
            }
        }

        // Status effects
        this.statusEffects = this.statusEffects.filter(effect => {
            if (effect.type === "poison") {
                this.statusTimers[effect] = (this.statusTimers[effect] || 0) + delta;
                while (this.statusTimers[effect] >= effect.tickRate) {
                    applyDamageToEnemy(
                        this,
                        effect.damage,
                        effect.sourceType || "poison",
                        effect.sourceLevel || 1,
                        effect.sourceTower || null
                    );
                    this.statusTimers[effect] -= effect.tickRate;

                    if (this.health <= 0 || this.defeated) {
                        handleEnemyDefeatState(this);
                        return false;
                    }
                }
                effect.duration -= delta;
                return effect.duration > 0;
            }

            if (effect.type === "slow") {
                effect.duration -= delta;
                return effect.duration > 0;
            }

            return true;
        });

        if (this.relayShieldGlow > 0) {
            this.relayShieldGlow = Math.max(0, this.relayShieldGlow - delta);
        }
    }




    draw(ctx) {
        const img = ENEMY_IMAGES[this.type];

        // Define per-enemy scale factor
        const scaleMap = {
            basic: 0.55,
            fast: 0.5,
            rusher: 0.45,
            tank: 0.65,
            bruiser: 0.72,
            shield: 0.58,
            resistant: 0.58,
            phaser: 0.54,
            commander: 0.6,
            bulwark: 0.62,
            relay: 0.62,
            splitter: 0.55,
            mini: 0.4,
            stealth: 0.5,
            healer: 0.55,
            boss: 0.7,
            megaBoss: 0.85
        };

        const scale = scaleMap[this.type] || 0.6;
        const size = TILE_SIZE * scale;

        // Poison aura effect
        const isPoisoned = this.statusEffects.some(e => e.type === "poison");
        const activeSlowEffects = this.statusEffects.filter(effect => effect.type === "slow");
        const strongestSlow = activeSlowEffects.sort((a, b) => a.slowFactor - b.slowFactor)[0] || null;
        const isShocked = activeSlowEffects.some(effect => effect.source === "shock");
        const isPhasing = this.type === "phaser" && this.phaseTimer > 0;
        if (isPoisoned) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(this.x, this.y, TILE_SIZE * 0.5 + Math.sin(Date.now() / 150) * 2, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(0,255,0,0.15)";
            ctx.fill();
            ctx.restore();
        }

        if (strongestSlow) {
            ctx.save();
            ctx.setLineDash(isShocked ? [5, 4] : [3, 4]);
            ctx.strokeStyle = isShocked ? "rgba(118, 240, 255, 0.95)" : "rgba(133, 214, 255, 0.85)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, size * 0.64, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        // Image-based rendering with fallback
        if (img && img.complete) {
            ctx.save();
            if (isPhasing) {
                ctx.globalAlpha = 0.38;
            }
            ctx.drawImage(img, this.x - size / 2, this.y - size / 2, size, size);
            ctx.restore();
        } else {
            // Fallback: colored circle
            let color = "red";
            switch (this.type) {
                case "fast":     color = "lime"; break;
                case "rusher":   color = "#ff8844"; break;
                case "tank":     color = "purple"; break;
                case "bruiser":  color = "#7f3a1c"; break;
                case "shield":   color = "#4488ff"; break;
                case "resistant": color = "#c2ff63"; break;
                case "phaser":   color = "#d98cff"; break;
                case "commander": color = "#ff66aa"; break;
                case "bulwark":  color = "#77c4ff"; break;
                case "relay":    color = "#8bf0ff"; break;
                case "boss":     color = "black"; break;
                case "splitter": color = "#aa5500"; break;
                case "mini":     color = "#ffaa00"; break;
                case "healer":   color = "#33ccee"; break;
                case "stealth":  color = "rgba(255,255,255,0.4)"; break;
                case "megaBoss": color = "darkred"; break;
            }

            const radius = this.type === "megaBoss" ? TILE_SIZE * 0.5 : TILE_SIZE / 5;
            ctx.save();
            if (isPhasing) {
                ctx.globalAlpha = 0.38;
            }
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        if (this.maxShield > 0 && this.shield > 0) {
            const shieldPct = Math.max(0, this.shield / this.maxShield);
            ctx.save();
            ctx.strokeStyle = "rgba(110,180,255,0.9)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, size * 0.58, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * shieldPct);
            ctx.stroke();
            ctx.restore();
        }

        if (this.relayShieldGlow > 0) {
            ctx.save();
            ctx.strokeStyle = "rgba(139, 240, 255, 0.75)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, size * 0.8 + Math.sin(Date.now() / 120) * 2, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        if (isPhasing) {
            ctx.save();
            ctx.setLineDash([6, 4]);
            ctx.strokeStyle = "rgba(217, 140, 255, 0.9)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, size * 0.76, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        if (this.type === "commander") {
            ctx.save();
            ctx.strokeStyle = "rgba(255,102,170,0.3)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(this.x, this.y, TILE_SIZE * (ENEMY_STATS.commander.auraRange || 2), 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        if (this.type === "bulwark") {
            ctx.save();
            ctx.strokeStyle = "rgba(119,196,255,0.34)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(this.x, this.y, TILE_SIZE * (ENEMY_STATS.bulwark.auraRange || 2.3), 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        if (this.type === "relay") {
            ctx.save();
            ctx.strokeStyle = "rgba(139,240,255,0.28)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(this.x, this.y, TILE_SIZE * (ENEMY_STATS.relay.relayRange || 2.3), 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        // Health bar
        this.lastDrawnHp += (this.health - this.lastDrawnHp) * 0.2;
        const hpPct = Math.max(0, this.lastDrawnHp / this.maxHealth);

        if (this.type === "megaBoss") {
            ctx.fillStyle = "black";
            ctx.fillRect(this.x - 30, this.y - 30, 60, 6);
            ctx.fillStyle = "red";
            ctx.fillRect(this.x - 30, this.y - 30, 60 * hpPct, 6);
        } else {
            ctx.fillStyle = "red";
            ctx.fillRect(this.x - 12, this.y - 20, 24, 4);
            ctx.fillStyle = "lime";
            ctx.fillRect(this.x - 12, this.y - 20, 24 * hpPct, 4);
        }

        const statusBadges = [];
        if (isPoisoned) {
            statusBadges.push({ color: "#5cff84" });
        }
        if (strongestSlow) {
            statusBadges.push({ color: isShocked ? "#79efff" : "#87cfff" });
        }
        if (this.maxShield > 0 && this.shield > 0) {
            statusBadges.push({ color: "#6aa7ff" });
        }
        if (isPhasing) {
            statusBadges.push({ color: "#d98cff" });
        }
        if (this.relayShieldGlow > 0) {
            statusBadges.push({ color: "#8bf0ff" });
        }

        statusBadges.forEach((badge, index) => {
            const badgeX = this.x - ((statusBadges.length - 1) * 5) + index * 10;
            const badgeY = this.y - size * 0.7 - 8;
            ctx.save();
            ctx.fillStyle = badge.color;
            ctx.beginPath();
            ctx.arc(badgeX, badgeY, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "rgba(8, 12, 16, 0.85)";
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.restore();
        });
    }



}

function findPath(map) {
    const rows = map.length;
    const cols = map[0].length;
    const pathMap = [];

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const tile = map[y][x];
            if (tile === 'S') {
                pathMap.push({ order: 0, x, y });
            } else if (tile === 'E') {
                pathMap.push({ order: Infinity, x, y });
            } else if (/^P\d+$/.test(tile)) {
                pathMap.push({
                    order: parseInt(tile.slice(1), 10),
                    x, y
                });
            }
        }
    }

    // Sort by path order
    pathMap.sort((a, b) => a.order - b.order);

    // Convert to pixel positions
    return pathMap.map(p => ({
        x: p.x * TILE_SIZE + TILE_SIZE / 2,
        y: p.y * TILE_SIZE + TILE_SIZE / 2
    }));
}

function isPathTile(tileType) {
    return ["P", "C", "S", "E", "T"].includes(tileType) || /^P\d+$/.test(tileType || "");
}

function getTileAtWorldPosition(x, y) {
    const tileX = Math.floor(x / TILE_SIZE);
    const tileY = Math.floor(y / TILE_SIZE);
    const tileType = currentMap?.[tileY]?.[tileX];
    return {
        tileX,
        tileY,
        tileType,
        inside: Number.isInteger(tileX) && Number.isInteger(tileY) && !!tileType
    };
}

function isTileOccupied(tileX, tileY) {
    return towers.some(tower =>
        Math.floor(tower.x / TILE_SIZE) === tileX &&
        Math.floor(tower.y / TILE_SIZE) === tileY
    );
}

function canBuildOnTile(tileX, tileY) {
    const tileType = currentMap?.[tileY]?.[tileX];
    if (!tileType) return false;
    if (isPathTile(tileType)) return false;
    if (isTileOccupied(tileX, tileY)) return false;
    return true;
}

function drawPathGuides() {
    if (!enemyPath || enemyPath.length < 2) return;

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.strokeStyle = "rgba(25, 16, 7, 0.26)";
    ctx.lineWidth = TILE_SIZE * 0.58;
    ctx.beginPath();
    ctx.moveTo(enemyPath[0].x, enemyPath[0].y);
    for (let i = 1; i < enemyPath.length; i++) {
        ctx.lineTo(enemyPath[i].x, enemyPath[i].y);
    }
    ctx.stroke();

    ctx.strokeStyle = "rgba(255, 230, 166, 0.24)";
    ctx.lineWidth = Math.max(3, TILE_SIZE * 0.18);
    ctx.beginPath();
    ctx.moveTo(enemyPath[0].x, enemyPath[0].y);
    for (let i = 1; i < enemyPath.length; i++) {
        ctx.lineTo(enemyPath[i].x, enemyPath[i].y);
    }
    ctx.stroke();

    ctx.fillStyle = "rgba(255, 229, 145, 0.55)";
    enemyPath.forEach((point, index) => {
        if (index === 0 || index === enemyPath.length - 1 || index % 5 === 0) {
            ctx.beginPath();
            ctx.arc(point.x, point.y, Math.max(2, TILE_SIZE * 0.07), 0, Math.PI * 2);
            ctx.fill();
        }
    });
    ctx.restore();
}

function drawPlacementOverlay() {
    if (!selectedTowerType || !hoveredBuildTile?.inside) return;

    const { tileX, tileY } = hoveredBuildTile;
    const centerX = tileX * TILE_SIZE + TILE_SIZE / 2;
    const centerY = tileY * TILE_SIZE + TILE_SIZE / 2;
    const buildable = canBuildOnTile(tileX, tileY);
    const range = getTowerRange(selectedTowerType, 1);

    ctx.save();
    ctx.fillStyle = buildable ? "rgba(74, 233, 155, 0.20)" : "rgba(255, 92, 92, 0.22)";
    ctx.strokeStyle = buildable ? "rgba(130, 255, 197, 0.92)" : "rgba(255, 156, 156, 0.95)";
    ctx.lineWidth = 2;
    ctx.fillRect(tileX * TILE_SIZE, tileY * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    ctx.strokeRect(tileX * TILE_SIZE + 1, tileY * TILE_SIZE + 1, TILE_SIZE - 2, TILE_SIZE - 2);

    if (!buildable) {
        ctx.beginPath();
        ctx.moveTo(tileX * TILE_SIZE + 4, tileY * TILE_SIZE + 4);
        ctx.lineTo((tileX + 1) * TILE_SIZE - 4, (tileY + 1) * TILE_SIZE - 4);
        ctx.moveTo((tileX + 1) * TILE_SIZE - 4, tileY * TILE_SIZE + 4);
        ctx.lineTo(tileX * TILE_SIZE + 4, (tileY + 1) * TILE_SIZE - 4);
        ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(centerX, centerY, range, 0, Math.PI * 2);
    ctx.fillStyle = buildable ? "rgba(104, 210, 255, 0.10)" : "rgba(255, 124, 124, 0.08)";
    ctx.fill();
    ctx.strokeStyle = buildable ? "rgba(120, 214, 255, 0.65)" : "rgba(255, 128, 128, 0.45)";
    ctx.setLineDash([7, 5]);
    ctx.stroke();
    ctx.restore();
}

function drawSelectedTowerOverlay() {
    if (!selectedTower) return;

    ctx.save();
    ctx.beginPath();
    ctx.arc(selectedTower.x, selectedTower.y, selectedTower.range, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(122, 198, 255, 0.10)";
    ctx.fill();
    ctx.setLineDash([8, 6]);
    ctx.strokeStyle = "rgba(155, 223, 255, 0.88)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.arc(selectedTower.x, selectedTower.y, TILE_SIZE * 0.16, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 241, 170, 0.92)";
    ctx.fill();
    ctx.restore();
}

function drawMap() {
    for (let y = 0; y < currentMap.length; y++) {
        for (let x = 0; x < currentMap[y].length; x++) {
            let tile = currentMap[y][x]; // use 'let' so we can reassign

            // Normalize "P1", "P2", ..., "P999" to "P"
            if (/^P\d+$/.test(tile)) tile = "P";

            const img = tileImages[tile];
            if (img && img.complete) {
                ctx.drawImage(img, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            } else {
                ctx.fillStyle = ["P", "C", "S", "E"].includes(tile) ? "orange" : "gray";
                ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }
    }

    drawPathGuides();
}

function wrapCanvasTextLines(text, maxWidth, font = "13px monospace") {
    if (!text) return [];
    ctx.save();
    ctx.font = font;
    const words = text.split(" ");
    const lines = [];
    let current = "";

    for (const word of words) {
        const candidate = current ? `${current} ${word}` : word;
        if (ctx.measureText(candidate).width <= maxWidth || !current) {
            current = candidate;
        } else {
            lines.push(current);
            current = word;
        }
    }

    if (current) lines.push(current);
    ctx.restore();
    return lines;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const shakeOffsetX = screenShake > 0 ? Math.round((Math.random() - 0.5) * screenShake) : 0;
    const shakeOffsetY = screenShake > 0 ? Math.round((Math.random() - 0.5) * screenShake) : 0;
    ctx.save();
    ctx.translate(shakeOffsetX, shakeOffsetY);
    ctx.translate(mapOffsetX, mapOffsetY);
    drawMap();
    drawPlacementOverlay();
    drawSelectedTowerOverlay();

    towers.forEach(t => t.draw());
    enemies.forEach(e => e.draw(ctx));
    bullets.forEach(b => b.draw());

    lightningAnimations.forEach(anim => {
      const frameImg = LIGHTNING_FRAMES[anim.frame];
      if (frameImg?.complete) {
        ctx.drawImage(frameImg, anim.x - 32, anim.y - 32, 64, 64);
      }
    });

    floatingMessages.forEach(msg => {
        if (msg.screenSpace) return;
        ctx.save();
        ctx.globalAlpha = msg.opacity;
        ctx.fillStyle = msg.color;
        ctx.font = "14px monospace";
        ctx.fillText(msg.text, msg.x, msg.y);
        ctx.restore();
    });

    damageNumbers.forEach(d => {
        ctx.save();
        ctx.globalAlpha = d.opacity;
        ctx.fillStyle = d.color || "yellow";
        ctx.font = "bold 12px monospace";
        ctx.fillText(d.text, d.x, d.y);
        ctx.restore();
    });

    particlePool.drawAll(ctx);

    leakFlashEffects.forEach(effect => {
        const lifePct = effect.lifetime / effect.maxLifetime;
        const radius = effect.radius + (1 - lifePct) * TILE_SIZE * 0.55;
        ctx.save();
        ctx.globalAlpha = Math.max(0, lifePct * 0.9);
        ctx.strokeStyle = effect.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    });
    ctx.restore();

    floatingMessages.forEach(msg => {
        if (!msg.screenSpace) return;
        ctx.save();
        ctx.globalAlpha = msg.opacity;
        ctx.fillStyle = msg.color;
        ctx.font = "14px monospace";
        ctx.fillText(msg.text, msg.x, msg.y);
        ctx.restore();
    });

    // Boss warning
    if (bossWarning && bossWarning.time > 0) {
        const shakeX = Math.random() * 4 - 2;
        const shakeY = Math.random() * 4 - 2;

        ctx.save();
        ctx.font = "bold 32px monospace";
        ctx.fillStyle = "red";
        ctx.textAlign = "center";
        ctx.fillText(bossWarning.text, canvas.width / 2 + shakeX, canvas.height / 2 + shakeY - 100);
        ctx.restore();

        bossWarning.time--;
    }

    if (waveBanner && waveBanner.duration > 0) {
        const lifePct = waveBanner.duration / waveBanner.maxDuration;
        const rise = (1 - lifePct) * 14;
        ctx.save();
        ctx.textAlign = "center";
        ctx.globalAlpha = Math.min(1, lifePct * 1.3);
        ctx.fillStyle = "rgba(6, 10, 14, 0.72)";
        ctx.fillRect(canvas.width / 2 - 168, 42 + rise, 336, 54);
        ctx.fillStyle = waveBanner.accent;
        ctx.font = "bold 20px monospace";
        ctx.fillText(waveBanner.title, canvas.width / 2, 64 + rise);
        if (waveBanner.subtitle) {
            ctx.fillStyle = "#dce7ee";
            ctx.font = "12px monospace";
            ctx.fillText(waveBanner.subtitle, canvas.width / 2, 82 + rise);
        }
        ctx.restore();
    }

    if (screenFlash.alpha > 0.01) {
        ctx.save();
        ctx.fillStyle = `rgba(${screenFlash.color}, ${screenFlash.alpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
    }

    // Intro enemy message
    if (introMessage) {
        ctx.save();
        ctx.textAlign = "center";
        const maxTextWidth = Math.min(canvas.width - 36, 340);
        const title = introMessage.title || "Sector Briefing";
        const primaryLines = wrapCanvasTextLines(introMessage.text, maxTextWidth, "14px monospace");
        const counterLines = wrapCanvasTextLines(introMessage.counter, maxTextWidth, "13px monospace");
        const footerLines = introMessage.footer
            ? wrapCanvasTextLines(introMessage.footer, maxTextWidth, "12px monospace")
            : [];
        const allLines = [...primaryLines, ...counterLines, ...footerLines];
        ctx.font = "16px monospace";
        const titleWidth = ctx.measureText(title).width;
        ctx.font = "14px monospace";
        const textWidth = Math.max(
            titleWidth,
            ...allLines.map(line => ctx.measureText(line).width)
        );
        const boxWidth = Math.min(canvas.width - 24, textWidth + 28);
        const boxHeight = 66 + primaryLines.length * 18 + counterLines.length * 16 + footerLines.length * 15;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        let cursorY = centerY - boxHeight / 2 + 28;

        // Background box
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.fillRect(centerX - boxWidth / 2, centerY - boxHeight / 2, boxWidth, boxHeight);

        // Text
        ctx.fillStyle = "white";
        ctx.font = "16px monospace";
        ctx.fillText(title, centerX, cursorY);
        cursorY += 22;

        ctx.fillStyle = introMessage.accent || "gold";
        ctx.font = "14px monospace";
        primaryLines.forEach(line => {
            ctx.fillText(line, centerX, cursorY);
            cursorY += 18;
        });

        ctx.fillStyle = "#8cd3ff";
        ctx.font = "13px monospace";
        counterLines.forEach(line => {
            ctx.fillText(line, centerX, cursorY);
            cursorY += 16;
        });
        if (footerLines.length > 0) {
            ctx.fillStyle = "#b9f6c8";
            ctx.font = "12px monospace";
            footerLines.forEach(line => {
                ctx.fillText(line, centerX, cursorY);
                cursorY += 15;
            });
        }
        ctx.restore();
    }

    // FPS Counter
    ctx.fillStyle = "white";
    ctx.font = "12px monospace";
    ctx.fillText(`FPS: ${fps}`, 330, 20);

    // DEV DEBUG PANEL
    if (showDebugStats) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(8, 30, 180, 110);

        ctx.fillStyle = "lime";
        ctx.font = "12px monospace";
        ctx.fillText(`Enemies: ${enemies.length}`, 12, 45);
        ctx.fillText(`Bullets: ${bullets.length}`, 12, 60);
        ctx.fillText(`Particles: ${particlePool.activeCount}`, 12, 75);
        ctx.fillText(`Enemy Pool: ${enemyPool.length}`, 12, 90);
        ctx.fillText(`Bullet Pool: ${bulletPool.length}`, 12, 105);
        ctx.fillText(`Active Bullets: ${bullets.filter(b => !b.hit).length}`, 12, 120);
        ctx.fillText(`Spread Pool: ${spreadBulletPool.length}`, 12, 135);

    }
}


function update() {
    if (paused || gameWon || gameOver) return;

    if (pausedForIntro) {
        if (introTimer-- <= 0) {
            showNextIntroMessage();
        }
        updateHUD();
        return;
    }

    if (isWaveActive && waveQueue.length > 0 && waveTimer-- <= 0) {
        const nextType = waveQueue.shift();
        const enemy = getEnemy(enemyPath, nextType);
        applyWaveRulesToEnemy(enemy);
        enemies.push(enemy); // 🔁 uses enemy pool
        waveTimer = Math.max(10, 30 - wave * 2);

        if (nextType === "boss" || nextType === "megaBoss") {
            bossWarning = {
                text: nextType === "megaBoss" ? "💀 MEGA BOSS INCOMING!" : "⚠ Incoming Boss!",
                time: 90
            };
            showWaveBanner(nextType === "megaBoss" ? "Mega Boss Inbound" : "Boss Wave", nextType === "megaBoss" ? "Prepare for the split." : "Heavy pressure entering the lane.", "#ff8b6e", 92);
            triggerScreenFlash(nextType === "megaBoss" ? "255,95,95" : "255,168,110", nextType === "megaBoss" ? 0.22 : 0.16);
            triggerScreenShake(nextType === "megaBoss" ? 10 : 6);
        }

       
    }
    
    particlePool.updateAll();
    bullets.forEach(b => b.update(gameSpeed));
    enemies.forEach(e => e.update(gameSpeed));
    towers.forEach(t => t.update(enemies, bullets, gameSpeed));

    bullets = bullets.filter(b => !b.hit);
    enemies = enemies.filter(e => {
        if (e.health <= 0 || e.defeated) {
            releaseEnemy(e);
            return false;
        }
        return true;
    });
    
    lightningAnimations.forEach(anim => {
      anim.timer++;
      if (anim.timer >= anim.frameDelay) {
        anim.frame++;
        anim.timer = 0;
      }
    });
    for (let i = lightningAnimations.length - 1; i >= 0; i--) {
        if (lightningAnimations[i].frame >= lightningAnimations[i].totalFrames) {
            lightningAnimations.splice(i, 1);
        }
    }




    // Handle splitQueue (splitter -> mini enemies)
    splitQueue.forEach(split => {
        for (let i = 0; i < 2; i++) {
            const mini = getEnemy(split.path, "mini");
            mini.x = split.x + (Math.random() - 0.5) * TILE_SIZE / 2;
            mini.y = split.y + (Math.random() - 0.5) * TILE_SIZE / 2;
            mini.pathIndex = split.pathIndex;
            enemies.push(mini);
        }
    });
    splitQueue = [];

    // Damage numbers
    damageNumbers.forEach(d => {
        d.y -= 0.5;
        d.opacity -= 1 / d.lifetime;
        d.lifetime--;

        if (d.lifetime <= 0) {
            damageNumberPool.push(d);
        }
    });

damageNumbers = damageNumbers.filter(d => d.lifetime > 0);

    if (screenShake > 0) {
        screenShake = Math.max(0, screenShake - 0.45 * gameSpeed);
    }
    if (screenFlash.alpha > 0) {
        screenFlash.alpha = Math.max(0, screenFlash.alpha - 0.018 * gameSpeed);
    }
    if (waveBanner) {
        waveBanner.duration -= gameSpeed;
        if (waveBanner.duration <= 0) {
            waveBanner = null;
        }
    }


    // Floating messages
    floatingMessages.forEach(msg => {
        msg.y -= 0.03 * gameSpeed; // vertical float speed
        msg.lifetime -= gameSpeed;
        msg.opacity = Math.max(0, msg.lifetime / 60);
    });
    floatingMessages = floatingMessages.filter(msg => msg.lifetime > 0);

    leakFlashEffects.forEach(effect => {
        effect.lifetime -= gameSpeed;
    });
    leakFlashEffects = leakFlashEffects.filter(effect => effect.lifetime > 0);

    // Leaks and lives deduction
    let leaked = enemies.filter(e => e.leaked || e.pathIndex >= e.path.length - 1);
    for (let e of leaked) {
        if (!e.leaked) {
            e.leaked = true;
        }
        recordLeakEvent(e);
        lives -= ENEMY_STATS[e.type].livesLost || 1;
        releaseEnemy(e); // 🔁 return to pool
    }
    enemies = enemies.filter(e => !e.leaked && e.pathIndex < e.path.length - 1);


    // Game Over
    if (lives <= 0 && !gameOver) {
        gameOver = true;
        showOverlay("💀 Game Over!", buildGameOverSummary());
        return;
    }

    // Check for wave end
    if (isWaveActive && waveQueue.length === 0 && enemies.length === 0) {
        isWaveActive = false;
        
        handleWaveComplete();
        if (wave >= waves.length && !gameWon) {
            gameWon = true;
            const victorySummary = handleLevelComplete();
            showOverlay("🎉 Level Complete!", victorySummary);
        }
    }

    // Re-enable start wave button if needed
    if (!isWaveActive && waveQueue.length === 0 && wave < waves.length) {
        startWaveBtn.style.display = "block";
        if (!waveReadyAt) waveReadyAt = Date.now();
        refreshStartWaveButton();
    }

    updateHUD();
}

// FPS
const FIXED_TIMESTEP = 1000 / 60; // 60 updates per second
let lastTime = performance.now();
let accumulator = 0;
let frameCount = 0;
let fpsUpdateTime = performance.now();
let fps = 0;

function gameLoop() {
    const now = performance.now();
    const delta = now - lastTime;
    lastTime = now;
    accumulator += delta;
    frameCount++;

    // Update FPS once per second
    if (now - fpsUpdateTime >= 1000) {
        fps = frameCount;
        frameCount = 0;
        fpsUpdateTime = now;
    }

    // Allow up to 5 catch-up updates max per frame to avoid spiral of death
    let updates = 0;
    while (accumulator >= FIXED_TIMESTEP && updates < 5) {
        for (let i = 0; i < gameSpeed; i++) update(); // Handle 1x or 2x speed
        accumulator -= FIXED_TIMESTEP;
        updates++;
    }

    soundPlayBudget = MAX_SOUNDS_PER_FRAME;
    draw();

    requestAnimationFrame(gameLoop);
}

function startNextWave() {
    if (isWaveActive || wave >= waves.length) return;

    const waveData = normalizeWaveData(waves[wave]);
    const newTypes = [];
    activeWaveRules = waveData.specialRound ? SPECIAL_ROUNDS[waveData.specialRound] : null;

    waveQueue = [...waveData.enemies];

    // Identify any new enemy types for the intro popup
    waveQueue.forEach(type => {
        if (!seenEnemyTypes.has(type)) {
            seenEnemyTypes.add(type);
            newTypes.push({ kind: "enemy", type });
        }
    });

    wave++; // Increment wave number

    // Boss warning logic
    if (waveQueue.includes("boss") || waveQueue.includes("megaBoss")) {
        bossWarning = {
            text: waveQueue.includes("megaBoss") ? "💀 MEGA BOSS INCOMING!" : "⚠ Incoming Boss!",
            time: 120,
            shake: true
        };
    }

    if (waveData.specialRound) {
        newTypes.unshift({ kind: "round", roundId: waveData.specialRound });
    }

    // If there are new enemies to show, pause for intro
    if (newTypes.length > 0) {
        waveIntroQueue = newTypes;
        introMessage = null;
        introTimer = 0;
        pausedForIntro = true;
        showNextIntroMessage();
    } else {
        isWaveActive = true;
        // ⏱ Dynamic spawn timing: faster each wave
        waveTimer = Math.max(3, 25 - Math.floor(wave * 1.2));
    }

    startWaveBtn.style.display = "none";
}


function showNextIntroMessage() {
    if (waveIntroQueue.length === 0) {
        introMessage = null;
        pausedForIntro = false;
        isWaveActive = waveQueue.length > 0;
        if (isWaveActive) {
            waveTimer = 0;
        }
        return;
    }

    const nextIntro = waveIntroQueue.shift();

    if (typeof nextIntro === "string") {
        waveIntroQueue.unshift({ kind: "enemy", type: nextIntro });
        showNextIntroMessage();
        return;
    }

    if (nextIntro.kind === "map") {
        introMessage = {
            title: `📍 ${nextIntro.name}`,
            text: nextIntro.text,
            counter: nextIntro.counter,
            footer: nextIntro.footer || "",
            accent: "#9dffbf"
        };
        introTimer = 150;
        return;
    }

    if (nextIntro.kind === "round") {
        const roundRule = SPECIAL_ROUNDS[nextIntro.roundId];
        introMessage = {
            title: `★ ${roundRule?.name || "Special Round"}`,
            text: roundRule?.intro || "Special conditions are active this round.",
            counter: `Best Answer: ${roundRule?.counter || "Adapt your defense."}`,
            footer: roundRule?.short || "",
            accent: "#ffd56b"
        };
        introTimer = 120;
        return;
    }

    const guide = ENEMY_GUIDE[nextIntro.type] || {
        intro: "A new foe approaches!",
        counter: "Adapt your defenses."
    };

    introMessage = {
        title: "⚠ New Enemy Incoming!",
        text: `${nextIntro.type.toUpperCase()}: ${guide.intro}`,
        counter: `Best Answer: ${guide.counter}`,
        footer: "",
        accent: "gold"
    };

    introTimer = 120; // Show for 2 seconds before moving to next
}

function addFloatingMessage(text, x, y, color = "white", screenSpace = false) {
    floatingMessages.push({
        text,
        x,
        y,
        color,
        screenSpace,
        lifetime: 60,
        opacity: 1
    });
}

function normalizeWaveData(waveData) {
    if (Array.isArray(waveData)) {
        return {
            label: "Enemy Surge",
            advisory: getWaveAdvisory(waveData),
            enemies: waveData,
            specialRound: null
        };
    }

    return {
        label: waveData?.label || "Enemy Surge",
        advisory: waveData?.advisory || getWaveAdvisory(waveData?.enemies || []),
        enemies: waveData?.enemies || [],
        specialRound: waveData?.specialRound || null
    };
}

function summarizeWaveTypes(types) {
    if (!types || types.length === 0) return "clear skies";

    const counts = {};
    types.forEach(type => {
        counts[type] = (counts[type] || 0) + 1;
    });

    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([type, count]) => `${count} ${ENEMY_GUIDE[type]?.label || type}`)
        .join(", ");
}

function summarizeWaveTypesCompact(types) {
    if (!types || types.length === 0) return "clear";

    const counts = {};
    types.forEach(type => {
        counts[type] = (counts[type] || 0) + 1;
    });

    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([type, count]) => `${count} ${ENEMY_GUIDE[type]?.label || type}`)
        .join(" | ");
}

function getWaveAdvisory(types) {
    if (!types || types.length === 0) return "Sector clear.";

    const unique = new Set(types);
    if (unique.has("relay")) return "Watch for shared shield pulses.";
    if (unique.has("phaser")) return "Watch for phase dashes and immunity windows.";
    if (unique.has("commander")) return "Watch for support auras.";
    if (unique.has("bulwark")) return "Watch for damage-reduction auras.";
    if (unique.has("shield")) return "Watch for shielded fronts.";
    if (unique.has("resistant")) return "Watch for tower-class resistance.";
    if (unique.has("stealth")) return "Watch for stealth coverage checks.";
    if (unique.has("tank") && unique.has("rusher")) return "Watch for split anti-tank and speed pressure.";
    if (unique.has("bruiser")) return "Watch for heavy anti-tank pressure.";
    if (unique.has("rusher") || unique.has("mini")) return "Watch for speed pressure.";
    if (unique.has("tank") || unique.has("boss") || unique.has("megaBoss")) return "Watch for high-health targets.";
    if (unique.has("splitter")) return "Watch for death spawns.";
    if (unique.has("healer")) return "Watch for sustain targets.";
    return "Balanced pressure incoming.";
}

function getWavePreviewPayload() {
    if (isWaveActive) {
        const activeTypes = [...enemies.map(enemy => enemy.type), ...waveQueue];
        const currentWaveData = normalizeWaveData(waves[Math.max(0, wave - 1)]);
        return {
            prefix: "Incoming",
            summary: `${currentWaveData.label}: ${summarizeWaveTypes(activeTypes)}`,
            advisory: currentWaveData.advisory || getWaveAdvisory(activeTypes)
        };
    }

    if (wave < waves.length) {
        const nextWave = normalizeWaveData(waves[wave]);
        return {
            prefix: "Next",
            summary: `${nextWave.label}: ${summarizeWaveTypes(nextWave.enemies)}`,
            advisory: nextWave.advisory
        };
    }

    return {
        prefix: "Status",
        summary: "final wave cleared",
        advisory: "Hold the line."
    };
}

function getWavePlannerEntries() {
    const entries = [];
    const showingCurrentWave = isWaveActive || (pausedForIntro && wave > 0 && waveQueue.length > 0);

    if (showingCurrentWave) {
        const currentWaveIndex = Math.max(0, wave - 1);
        const currentWaveData = normalizeWaveData(waves[currentWaveIndex]);
        const activeTypes = [...enemies.map(enemy => enemy.type), ...waveQueue];
        entries.push({
            step: `Now ${currentWaveIndex + 1}`,
            title: currentWaveData.label,
            mix: summarizeWaveTypesCompact(activeTypes),
            advisory: currentWaveData.advisory || getWaveAdvisory(activeTypes),
            state: "active",
            specialRound: currentWaveData.specialRound
        });

        for (let i = wave; i < Math.min(waves.length, wave + 2); i++) {
            const data = normalizeWaveData(waves[i]);
            entries.push({
                step: `Next ${i + 1}`,
                title: data.label,
                mix: summarizeWaveTypesCompact(data.enemies),
                advisory: data.advisory,
                state: "upcoming",
                specialRound: data.specialRound
            });
        }
    } else {
        for (let i = wave; i < Math.min(waves.length, wave + 3); i++) {
            const data = normalizeWaveData(waves[i]);
            entries.push({
                step: i === wave ? `Next ${i + 1}` : `Later ${i + 1}`,
                title: data.label,
                mix: summarizeWaveTypesCompact(data.enemies),
                advisory: data.advisory,
                state: i === wave ? "active" : "upcoming",
                specialRound: data.specialRound
            });
        }
    }

    return entries;
}

function getActiveWaveRewardMultiplier() {
    const mapReward = activeMapModifier?.rewardBonusMultiplier || 1;
    const specialReward = activeWaveRules?.rewardMultiplier || 1;
    return mapReward * specialReward;
}

function applyWaveRulesToEnemy(enemy) {
    if (!enemy || !activeWaveRules) return;

    if (activeWaveRules.enemyHealthMultiplier) {
        enemy.health = Math.round(enemy.health * activeWaveRules.enemyHealthMultiplier);
        enemy.maxHealth = enemy.health;
        enemy.lastDrawnHp = enemy.health;
    }

    if (activeWaveRules.shieldMultiplier && enemy.shield > 0) {
        enemy.shield = Math.round(enemy.shield * activeWaveRules.shieldMultiplier);
        enemy.maxShield = enemy.shield;
    }

    if (activeWaveRules.enemySpeedMultiplier) {
        enemy.speed *= activeWaveRules.enemySpeedMultiplier;
    }
}

function renderWavePlanner() {
    const planner = document.getElementById("wavePlanner");
    if (!planner) return;

    const entries = getWavePlannerEntries();
    planner.innerHTML = "";

    entries.forEach(entry => {
        const card = document.createElement("div");
        card.className = `wave-planner__item wave-planner__item--${entry.state}`;

        const step = document.createElement("div");
        step.className = "wave-planner__step";
        step.textContent = entry.step;

        const title = document.createElement("div");
        title.className = "wave-planner__title";
        title.textContent = entry.title;

        const special = document.createElement("div");
        special.className = "wave-planner__special";
        special.textContent = entry.specialRound ? `Special: ${SPECIAL_ROUNDS[entry.specialRound]?.name || entry.specialRound}` : "Standard Round";

        const mix = document.createElement("div");
        mix.className = "wave-planner__mix";
        mix.textContent = entry.mix;

        const advisory = document.createElement("div");
        advisory.className = "wave-planner__advisory";
        advisory.textContent = entry.advisory;

        card.appendChild(step);
        card.appendChild(title);
        card.appendChild(special);
        card.appendChild(mix);
        card.appendChild(advisory);
        planner.appendChild(card);
    });
}

function hideOverlay() {
    const overlay = document.getElementById("overlayMessage");
    if (overlay) {
        overlay.style.display = "none";
    }
}

function returnToMapSelect() {
    hideOverlay();
    document.getElementById("gameContainer").style.display = "none";
    document.getElementById("levelSelector").style.display = "flex";
    paused = false;
    pausedForIntro = false;
    isWaveActive = false;
    introMessage = null;
    waveIntroQueue = [];
    selectedTower = null;
    selectedTowerType = null;
    hoveredTower = null;
    hoveredBuildTile = null;
    hideTowerActionUI();
    renderLevelButtons();
    updateRankDisplay();
}

function retryCurrentLevel() {
    hideOverlay();
    loadLevel(currentLevel);
}



function loadLevel(level) {
    currentLevel = level;
    hideOverlay();
    
    document.getElementById("levelSelector").style.display = "none";
    document.getElementById("gameContainer").style.display = "block";

    const levelData = MAPS[level];
    const levelMeta = LEVEL_META[level] || { name: `Level ${level}`, intro: "Enemy movement confirmed.", tactic: "Adapt your defense layout." };
    activeMapModifier = getLevelModifier(level);
    currentMap = levelData.map;
    waves = levelData.waves;
    resizeCanvas(); // ✅ safe to call now that currentMap is defined
    enemyPath = findPath(currentMap);
    
    //console.log("Computed enemy path with length:", enemyPath.length);
    //enemyPath.forEach((p, i) => console.log(i, p));

    towers = [];
    enemies = [];
    bullets = [];
    splitQueue = [];
    wave = 0;
    gold = STARTING_GOLD + (activeMapModifier?.startingGoldBonus || 0);
    lives = 10;
    totalGoldEarned = 0;
    enemyKillCount = 0;
    leakEvents = [];
    leakFlashEffects = [];
    runQuickStarts = 0;
    runRushBonusTotal = 0;
    isWaveActive = false;
    paused = false;
    gameOver = false;
    gameWon = false;
    waveQueue = [];
    waveTimer = 0;
    seenEnemyTypes.clear();
    waveIntroQueue = [{
        kind: "map",
        name: levelMeta.name,
        text: levelMeta.intro,
        counter: levelMeta.tactic,
        footer: getMapModifierText(level)
    }];
    introMessage = null;
    introTimer = 0;
    pausedForIntro = true;
    selectedTower = null;
    selectedTowerType = null;
    hoveredTower = null;
    hoveredBuildTile = null;
    currentWaveStartLives = lives;
    waveReadyAt = Date.now();
    pendingRushBonus = calculateRushBonus();
    
    // DEV: Start at a specific wave for testing
    /*
    const DEV_START_WAVE = 20; // ← Change this to whatever wave you want to test
    const DEV_START_GOLD = 9999;
    gold = DEV_START_GOLD;
    if (DEV_START_WAVE > 1) {
        wave = DEV_START_WAVE - 1;
        seenEnemyTypes = new Set(); // Clear enemy types to avoid intros
    }*/

    startWaveBtn.style.display = "none";
    refreshStartWaveButton();
    updateHUD();
    hideTowerActionUI();
    updateRankDisplay();
    updateTowerButtons();
    renderTowerButtons();
    preallocateAllBulletTypes(250, 100); // More bullets for late-game testing
    preallocateEnemies(200);
    showNextIntroMessage();
}


// Utility Functions
function unlockAchievement(key, message) {
    if (localStorage.getItem(`achieved_${key}`)) return;

    localStorage.setItem(`achieved_${key}`, "true");
    addFloatingMessage(`🏆 ${message}`, canvas.width / 2, 100, "gold", true);

}

function updateHUD() {
    const displayWave = Math.min(wave, waves.length);
    const preview = getWavePreviewPayload();
    document.getElementById("goldDisplay").textContent = `💰 ${gold}`;
    document.getElementById("waveDisplay").textContent = `Wave ${displayWave} / ${waves.length}`;
    document.getElementById("livesDisplay").textContent = `❤️ ${lives}`;
    if (startWaveBtn?.style.display !== "none") {
        refreshStartWaveButton();
    }
    const previewEl = document.getElementById("wavePreviewDisplay");
    if (previewEl) {
        previewEl.textContent = `${preview.prefix}: ${preview.summary} | ${preview.advisory}`;
        previewEl.title = `${preview.prefix}: ${preview.summary}`;
    }
}

function towerUpgradeCost(tower) {
    const base = towerCosts[tower.type] || 50;
    return Math.floor(base * (0.9 + tower.level * 0.68));
}

function showOverlay(message, details = []) {
    const overlay = document.getElementById("overlayMessage");
    const text = document.getElementById("overlayText");
    const restartBtn = document.getElementById("restartBtn");
    const mapSelectBtn = document.getElementById("mapSelectBtn");
    const detailLines = Array.isArray(details) ? details.filter(Boolean) : [details].filter(Boolean);
    let html = `<div class="overlay-title">${message}</div>`;
    if (detailLines.length > 0) {
        html += `<div class="overlay-details">${detailLines.join("<br>")}</div>`;
    }
    text.innerHTML = html;
    overlay.style.display = "flex";
    if (restartBtn) {
        restartBtn.textContent = gameWon ? "Replay Map" : "Retry Map";
        restartBtn.onclick = () => retryCurrentLevel();
    }
    if (mapSelectBtn) {
        mapSelectBtn.textContent = gameWon ? "Choose Another Map" : "Back to Maps";
        mapSelectBtn.onclick = () => returnToMapSelect();
    }
}

function spawnExplosion(x, y, count = 5) {
    const colors = ["#ffd166", "#ff8b6e", "#fff0a6", "#79efff"];
    for (let i = 0; i < count; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        particlePool.spawn(x, y, color);
    }
}

function showTowerActionUI(tower) {
    towerDrawerState = { kind: "tower", tower };
    towerActionUI = tower;
    updateTowerDrawer();
}

function hideTowerActionUI() {
    towerDrawerState = null;
    towerActionUI = null;
    updateTowerDrawer();
}

function toggleSpeed() {
    gameSpeed = gameSpeed === 1 ? 2 : 1;
    document.getElementById("speedToggleBtn").textContent = gameSpeed === 2 ? "⏩" : "⏩";
}

function togglePause() {
    paused = !paused;
    const btn = document.getElementById("pauseBtn");
    if (btn) {
        btn.textContent = paused ? "▶️" : "⏸";
    }
}

document.addEventListener("keydown", e => {
    if (e.key === "`") showDebugStats = !showDebugStats;
});

// Start music on first user interaction
let bgStarted = false;
document.addEventListener("click", () => {
    if (!bgStarted && !sounds.bg.playing()) {
        sounds.bg.fade(0, 0.5, 1000); // from 0 to 0.5 volume in 1 second
        sounds.bg.loop(true);
        sounds.bg.play();
        bgStarted = true;
    }
}, { once: true });

function updatePointerHoverState(screenX, screenY) {
    const worldX = screenX - mapOffsetX;
    const worldY = screenY - mapOffsetY;

    if (!isInsideMap(worldX, worldY)) {
        hoveredTower = null;
        hoveredBuildTile = null;
        return;
    }

    hoveredTower = towers.find(t => Math.hypot(t.x - worldX, t.y - worldY) < TILE_SIZE / 2) || null;
    hoveredBuildTile = getTileAtWorldPosition(worldX, worldY);
}

// ✅ Add this fallback loop checker AFTER defining sounds.bg
setInterval(() => {
    if (bgStarted && !sounds.bg.playing()) {
        console.warn("Music not playing — forcing restart");
        sounds.bg.loop(true);
        sounds.bg.play();
    }
}, 3000); // Check every 3 seconds

// Init Events
canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const x = screenX - mapOffsetX;
    const y = screenY - mapOffsetY;

    const panel = document.getElementById("towerPanel");
    const panelTop = panel.getBoundingClientRect().top;
    if (screenY >= panelTop - rect.top) return; // ✅ Block clicks in tower panel area
    if (!isInsideMap(x, y)) return;

    // Interact with existing towers
    const clickedTower = towers.find(t => Math.hypot(t.x - x, t.y - y) < TILE_SIZE / 2);
    if (clickedTower) {
        selectedTowerType = null;
        updateTowerButtons();
        if (selectedTower === clickedTower) {
            selectedTower = null;
            hideTowerActionUI();
        } else {
            selectedTower = clickedTower;
            showTowerActionUI(clickedTower);
        }
        return;
    } else {
        selectedTower = null;
        hideTowerActionUI();
    }

    // ✅ Don't place if no tower is selected
    if (!selectedTowerType) return;

    // ✅ Prevent placing locked towers
    if (!DEV_MODE && playerRank < towerUnlocks[selectedTowerType]) {
        addFloatingMessage(`🔒 Unlocks at Rank ${towerUnlocks[selectedTowerType]}`, x, y, "orange");
        return;
    }

    const cost = getTowerCost(selectedTowerType);
    if (gold >= cost) {
        const { tileX, tileY } = getTileAtWorldPosition(x, y);

        if (!canBuildOnTile(tileX, tileY)) {
            const tileType = currentMap[tileY]?.[tileX];
            if (isPathTile(tileType)) {
            addFloatingMessage("❌ Can't build on path!", x, y, "orange");
            } else {
                addFloatingMessage("❌ Tile occupied!", x, y, "orange");
            }
            return;
        }

        const centerX = tileX * TILE_SIZE + TILE_SIZE / 2;
        const centerY = tileY * TILE_SIZE + TILE_SIZE / 2;

        towers.push(new Tower(centerX, centerY, selectedTowerType));
        gold -= cost;

        // Clear selection after placing
        selectedTowerType = null;
        updateTowerButtons();
        selectedTower = null;
        hideTowerActionUI();
        hoveredBuildTile = null;
    } else {
        addFloatingMessage("Not enough gold!", x, y, "red");
    }
});



canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    updatePointerHoverState(e.clientX - rect.left, e.clientY - rect.top);
});

canvas.addEventListener("pointermove", (e) => {
    const rect = canvas.getBoundingClientRect();
    updatePointerHoverState(e.clientX - rect.left, e.clientY - rect.top);
});

canvas.addEventListener("mouseleave", () => {
    hoveredTower = null;
    hoveredBuildTile = null;
});

canvas.addEventListener("pointerleave", () => {
    hoveredTower = null;
    hoveredBuildTile = null;
});

function showDevMenu() {
    document.getElementById("devMenu").style.display = "block";
}

function applyDevSettings() {
    const goldVal = parseInt(document.getElementById("devGold").value);
    const waveVal = parseInt(document.getElementById("devWave").value);
    gold = goldVal;
    wave = waveVal - 1;
    seenEnemyTypes.clear();
    //alert("⚙️ Settings applied. Start wave manually.");
}

function placeDevTowers() {
    const positions = [
        { x: 4, y: 4 },
        { x: 6, y: 6 },
        { x: 8, y: 8 },
        { x: 10, y: 5 }
    ];

    positions.forEach((pos, i) => {
        const centerX = pos.x * TILE_SIZE + TILE_SIZE / 2;
        const centerY = pos.y * TILE_SIZE + TILE_SIZE / 2;
        const type = towerTypes[i % towerTypes.length];
        const tower = new Tower(centerX, centerY, type);
        tower.level = 5;
        tower.branch = "alpha";
        tower.refreshStats();
        towers.push(tower);
    });

    alert("🏗️ Maxed towers placed.");
}

function resetDevProgress() {
    localStorage.clear();
    initializeProgressState();
    renderLevelButtons();
    updateRankDisplay();
    const status = document.getElementById("levelSelectStatus");
    if (status) {
      status.textContent = "Progress reset. Only Level 1 is currently available.";
    }
    alert("🧹 Local storage cleared.");
}

function createLevelPreviewDataUrl(map) {
  const rows = map.length;
  const cols = map[0].length;
  const previewCanvas = document.createElement("canvas");
  previewCanvas.width = 120;
  previewCanvas.height = 72;
  const previewCtx = previewCanvas.getContext("2d");
  const tileW = previewCanvas.width / cols;
  const tileH = previewCanvas.height / rows;

  const colors = {
    G: "#3fd37e",
    path: "#c6904d",
    T: "#2b8a57",
    S: "#f3d36c",
    E: "#ff8b6e"
  };

  previewCtx.fillStyle = "#1a1e1c";
  previewCtx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);

  map.forEach((row, y) => {
    row.forEach((tile, x) => {
      let fill = colors.G;
      if (/^P\d+$/.test(tile)) fill = colors.path;
      else if (tile === "T") fill = colors.T;
      else if (tile === "S") fill = colors.S;
      else if (tile === "E") fill = colors.E;

      previewCtx.fillStyle = fill;
      previewCtx.fillRect(x * tileW, y * tileH, tileW + 0.5, tileH + 0.5);
    });
  });

  previewCtx.strokeStyle = "rgba(255,255,255,0.18)";
  previewCtx.lineWidth = 2;
  previewCtx.strokeRect(1, 1, previewCanvas.width - 2, previewCanvas.height - 2);

  return previewCanvas.toDataURL("image/png");
}

function renderLevelButtons() {
  const container = document.getElementById("levelButtons");
  container.innerHTML = "";

  const unlocked = getUnlockedLevels();
  const status = document.getElementById("levelSelectStatus");
  if (status) {
    const totalMedals = getTotalEarnedMedals();
    const totalPossibleMedals = Object.keys(LEVEL_META).length * Object.keys(MAP_MEDALS).length;
    const nextUnlock = Object.entries(LEVEL_UNLOCKS)
      .map(([level, requirement]) => ({ level: parseInt(level, 10), requirement }))
      .find(entry => !unlocked.includes(entry.level));
    status.textContent = nextUnlock
      ? `${unlocked.length} sectors available. ${totalMedals}/${totalPossibleMedals} honors earned. ${Math.max(0, nextUnlock.requirement - wavesCompleted)} more waves unlock Level ${nextUnlock.level}.`
      : `All sectors unlocked. ${totalMedals}/${totalPossibleMedals} honors earned. Rank ${playerRank} ${rankTable[playerRank - 1]?.title || ""}`.trim();
  }

  Object.entries(MAPS).forEach(([level, mapData]) => {
    const levelNumber = parseInt(level, 10);
    const unlockedLevel = unlocked.includes(levelNumber);
    const meta = LEVEL_META[levelNumber] || { name: `Level ${level}`, blurb: "Engage enemy formations.", focus: "Defense", waves: mapData.waves.length };
    const modifier = getLevelModifier(levelNumber);
    const record = getLevelProgressRecord(levelNumber);
    const btn = document.createElement("button");
    btn.className = unlockedLevel ? "level-card" : "level-card level-card--locked";
    btn.setAttribute("aria-label", meta.name);

    const img = document.createElement("img");
    img.src = createLevelPreviewDataUrl(mapData.map);
    img.className = "level-thumbnail";
    img.style.width = "100px";
    img.style.height = "60px";
    img.style.borderRadius = "8px";
    img.style.objectFit = "cover";
    img.style.opacity = unlockedLevel ? "1" : "0.4";

    if (!unlockedLevel) {
      const lockIcon = document.createElement("div");
      lockIcon.className = "level-lock";
      lockIcon.textContent = "🔒";
      btn.appendChild(lockIcon);
    } else {
      btn.onclick = () => loadLevel(levelNumber);
    }

    const badge = document.createElement("div");
    badge.className = "level-card__badge";
    badge.textContent = `Lv ${level}`;

    const body = document.createElement("div");
    body.className = "level-card__body";

    const title = document.createElement("div");
    title.className = "level-card__title";
    title.textContent = meta.name;

    const desc = document.createElement("div");
    desc.className = "level-card__desc";
    desc.textContent = unlockedLevel ? meta.blurb : `Unlock at ${LEVEL_UNLOCKS[levelNumber]} completed waves.`;

    const modifierRow = document.createElement("div");
    modifierRow.className = "level-card__modifier";
    modifierRow.textContent = modifier
      ? `Modifier: ${modifier.name} | ${modifier.short}`
      : "Modifier: Standard sector rules";

    const honorsRow = document.createElement("div");
    honorsRow.className = "level-card__honors";
    honorsRow.innerHTML = `
      <span class="level-card__honors-label">Honors ${getEarnedMapMedalCount(record)}/3</span>
      <span class="level-card__honors-icons">${Object.entries(MAP_MEDALS).map(([key, medal]) => `<span class="${record.medals[key] ? "is-earned" : ""}" title="${medal.name}: ${medal.description}">${medal.icon}</span>`).join("")}</span>
    `;

    const recordRow = document.createElement("div");
    recordRow.className = "level-card__record";
    recordRow.textContent = record.completed
      ? `Best lives ${record.bestLives}/10 | Fast starts ${record.bestQuickStarts}/${getTempoRequirement(levelNumber)}`
      : "Complete the sector to start earning honors.";

    const metaRow = document.createElement("div");
    metaRow.className = "level-card__meta";
    metaRow.innerHTML = `<span>${meta.focus}</span><span>${meta.waves} waves</span>`;

    btn.appendChild(img);
    btn.appendChild(badge);
    body.appendChild(title);
    body.appendChild(desc);
    body.appendChild(modifierRow);
    body.appendChild(honorsRow);
    body.appendChild(recordRow);
    body.appendChild(metaRow);
    btn.appendChild(body);
    container.appendChild(btn);
  });
}

initializeProgressState();
renderLevelButtons();
updateRankDisplay();

gameLoop();
