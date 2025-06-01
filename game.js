
// ============================
// Full Tower Defense Game.js
// ============================

// Enemy Types Configuration
const ENEMY_STATS = {
    basic:   { health: 100, speed: 1.2, reward: 10, livesLost: 1 },
    fast:    { health: 60,  speed: 2.0, reward: 15, livesLost: 1 },
    tank:    { health: 1000, speed: 0.6, reward: 30, livesLost: 3 },
    boss:    { health: 7000, speed: 0.4, reward: 200, livesLost: 99 },
    splitter:{ health: 200, speed: 1.1, reward: 20, livesLost: 1 },
    mini:    { health: 40,  speed: 1.8, reward: 5, livesLost: 1 },
    healer:  { health: 120, speed: 1.0, reward: 15, livesLost: 1 },
    stealth: { health: 80,  speed: 1.5, reward: 12, livesLost: 1 },
    megaBoss: {health: 20000, speed: 0.5, reward: 1000, livesLost: 99}
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
        generateWaves(35) // dynamically generating waves
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
        generateWaves(40)
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
  3: 40
};
/* dynamic way to unlock levels
 const LEVEL_UNLOCKS = {};
    const totalLevels = Object.keys(MAPS).length;
    for (let i = 2; i <= totalLevels; i++) {
        LEVEL_UNLOCKS[i] = (i - 1) * 30; // e.g., level 2 unlocks at 30, 3 at 60, etc.
    }
 */


renderLevelButtons();
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
let wave = 0, gold = 250, lives = 10;
let towers = [], enemies = [], bullets = [], splitQueue = [];
let gameWon = false, gameOver = false, paused = false, isWaveActive = false;
let waveQueue = [], waveTimer = 0, currentMap = [], waves = [], enemyPath = [];
let damageNumbers = [], floatingMessages = [], seenEnemyTypes = new Set();
let selectedTowerType = null, selectedTower = null, hoveredTower = null;
let waveIntroQueue = [], introMessage = null, introTimer = 0, bossWarning = null;
let totalGoldEarned = 0, enemyKillCount = 0, towerActionUI = null;
let gameSpeed = 1;
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


let playerPoints = parseInt(localStorage.getItem("playerPoints")) || 0;
let playerRank = parseInt(localStorage.getItem("playerRank")) || 1;

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
    addFloatingMessage("🏅 Rank Up!", canvas.width / 2, 60, "yellow");
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


// Points awarded
function handleEnemyKill(enemyType) {
  let points = 1;
  if (enemyType === "boss") points += 25;
  gainPoints(points);
}

function handleWaveComplete() {
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
    gainPoints(25);
    renderLevelButtons();
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

function generateWaves(totalWaves = 50) {
    const waves = [];

    for (let i = 1; i <= totalWaves; i++) {
        const enemyQueue = [];

        const difficulty = 1 + i * 0.12;

        // Always basic
        const basicCount = Math.floor(5 + i * 1.1);
        for (let j = 0; j < basicCount; j++) enemyQueue.push("basic");

        // Fast enemies after wave 3
        if (i >= 3) {
            const fastCount = Math.floor(i / 2);
            for (let j = 0; j < fastCount; j++) enemyQueue.push("fast");
        }

        // Tanks after wave 5, more as wave increases
        if (i >= 5) {
            const tankCount = Math.floor(i / 3.5);
            for (let j = 0; j < tankCount; j++) enemyQueue.push("tank");
        }

        // Healers every 6th wave, ramping after wave 20
        if (i % 6 === 0 || i >= 20) {
            const healerCount = i >= 20 ? Math.floor(Math.random() * (i / 5)) + 1 : Math.floor(i / 6);
            for (let j = 0; j < healerCount; j++) enemyQueue.push("healer");
        }

        // Splitters start from wave 10
        if (i >= 10) {
            const splitterCount = Math.floor(i / 4);
            for (let j = 0; j < splitterCount; j++) enemyQueue.push("splitter");
        }

        // Stealth units from wave 12+
        if (i >= 12 && i % 3 === 0) {
            const stealthCount = Math.floor(i / 3.5);
            for (let j = 0; j < stealthCount; j++) enemyQueue.push("stealth");
        }

        // Mini enemies swarm after wave 15
        if (i >= 15 && i % 2 === 0) {
            const miniCount = Math.floor(i * 1.5);
            for (let j = 0; j < miniCount; j++) enemyQueue.push("mini");
        }

        // Boss logic
        if (i >= 20 && i % 2 === 0) {
            const bossCount = Math.floor(i / 10);
            for (let j = 0; j < bossCount; j++) enemyQueue.push("boss");
        }

        // MegaBoss only at last wave
        if (i === totalWaves) {
            enemyQueue.push("megaBoss");
        }

        // Shuffle to add unpredictability
        shuffleArray(enemyQueue);
        waves.push(enemyQueue);
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
    basic: 100,
    spread: 120,
    sniper: 150,
    poison: 200,
    splash: 300,
    lightning: 300,
    slow: 250
};

const towerInfo = {
    basic: {
        name: "Basic Tower",
        cost: towerCosts.basic,
        unlock: towerUnlocks.basic,
        image: "images/basictower.png",
        baseDamage: 20,
        damageScale: 6,
        description: "Fires a single shot quickly at nearby enemies.",
        upgrades: [
            "Faster firing",
            "More damage",
            "Slight range boost"
        ]
    },
    spread: {
        name: "Spread Tower",
        cost: towerCosts.spread,
        unlock: towerUnlocks.spread,
        image: "images/spreadtower.png",
        baseDamage: 25,
        damageScale: 7,
        description: "Fires a spread of bullets at short range.",
        upgrades: [
            "More bullets",
            "Tighter spread",
            "Damage increase"
        ]
    },
    sniper: {
        name: "Sniper Tower",
        cost: towerCosts.sniper,
        unlock: towerUnlocks.sniper,
        image: "images/snipertower.png",
        baseDamage: 75,
        damageScale: 8,
        description: "High damage, long-range shots. Slow rate of fire.",
        upgrades: [
            "Even longer range",
            "Faster reload",
            "Extra damage"
        ]
    },
    splash: {
        name: "Splash Tower",
        cost: towerCosts.splash,
        unlock: towerUnlocks.splash,
        image: "images/splashtower.png",
        baseDamage: 55,
        damageScale: 9,
        description: "Deals area damage to groups of enemies.",
        upgrades: [
            "Larger explosion radius",
            "More damage",
            "Faster attack"
        ]
    },
    poison: {
        name: "Poison Tower",
        cost: towerCosts.poison,
        unlock: towerUnlocks.poison,
        image: "images/poisontower.png",
        baseDamage: 25,
        damageScale: 8,
        description: "Applies damage-over-time to enemies with a toxic projectile.",
        upgrades: [
          "Increases DoT duration",
          "Increases poison damage",
          "Fires faster",
          "Hits multiple targets",
          "Spreads poison on kill"
        ]
    },
    lightning: {
        name: "Lightning Tower",
        cost: towerCosts.lightning,
        unlock: towerUnlocks.lightning,
        image: "images/lightningtower.png",
        baseDamage: 60,
        damageScale: 8,
        description: "Applies damage-over-time to enemies with a toxic projectile.",
        upgrades: [
          "Increases DoT duration",
          "Increases poison damage",
          "Fires faster",
          "Hits multiple targets",
          "Spreads poison on kill"
        ]
    },
    slow: {
        name: "Slow Tower",
        cost: towerCosts.slow,
        unlock: towerUnlocks.slow,
        image: "images/slowtower.png",
        slowAmount: 0.6,  // Reduces speed by 60%
        slowScale: 0.02,  // Extra slow per level (e.g., +2% per level)
        duration: 160,    // Duration of slow in frames (2 seconds)
        durationScale: 20, // Extra duration per level
        description: "Applies damage-over-time to enemies with a toxic projectile.",
        upgrades: [
          "Increases DoT duration",
          "Increases poison damage",
          "Fires faster",
          "Hits multiple targets",
          "Spreads poison on kill"
        ]
    }
};
const towerTypes = Object.keys(towerInfo);

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

    const img = document.createElement("img");
    img.src = towerInfo[type].image;
    img.alt = type;
    btn.appendChild(img);

    const label = document.createElement("small");
    label.textContent = `$${towerCosts[type]}`;
    btn.appendChild(document.createElement("br"));
    btn.appendChild(label);

    btn.onclick = () => {
      if (!DEV_MODE && playerRank < towerUnlocks[type]) {
        addFloatingMessage(`🔒 Unlocks at Rank ${towerUnlocks[type]}`, canvas.width / 2, 80, "orange");
        return;
      }
      selectedTowerType = selectedTowerType === type ? null : type;
      updateTowerButtons();
    };

    btn.addEventListener("mouseenter", e => showTooltip(e, type));
    btn.addEventListener("mousemove", e => positionTooltip(e));
    btn.addEventListener("mouseleave", () => tooltip.style.display = "none");

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
    tank: new Image(),
    splitter: new Image(),
    mini: new Image(),
    stealth: new Image(),
    healer: new Image(),
    boss: new Image(),
    megaboss: new Image()
};

for (let key in ENEMY_IMAGES) {
    ENEMY_IMAGES[key].src = `images/enemies/${key}.png`;
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

const tooltip = document.getElementById("towerTooltip");

function showTooltip(e, type) {
  const info = towerInfo[type];
  if (!info) return;

  let html = `<strong style="font-size:12px">${info.name}</strong><br>`;
  html += `Cost: $${info.cost}<br>`;
  html += `Unlocks at Rank: ${info.unlock}<br>`;
  html += `<em>${info.description}</em><br><br>`;
  html += `<u>Upgrades:</u><ul style="padding-left:12px;">`;
  info.upgrades.forEach(up => html += `<li>${up}</li>`);
  html += `</ul>`;

  tooltip.innerHTML = html;
  tooltip.style.display = "block";

  positionTooltip(e);
}

function positionTooltip(e) {
  tooltip.style.left = `${e.pageX - tooltip.offsetWidth / 2}px`;
  tooltip.style.top = `${e.pageY - tooltip.offsetHeight - 12}px`;

  // Clamp to screen edges
  if (parseInt(tooltip.style.left) < 4) tooltip.style.left = "4px";
  const screenWidth = window.innerWidth;
  if (parseInt(tooltip.style.left) + tooltip.offsetWidth > screenWidth - 4) {
    tooltip.style.left = `${screenWidth - tooltip.offsetWidth - 4}px`;
  }
  if (parseInt(tooltip.style.top) < 0) tooltip.style.top = "4px";
}


updateTowerButtons();

document.getElementById("startWaveBtn").onclick = () => {
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
    const bullet = bulletPool.pop() || new Bullet(x, y, target, level, type);
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
    bullet.speed = 4; // 🔹 Make spread slower
    bullet.maxDistance = TILE_SIZE * 3;
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

function resizeCanvas() {
    const hud = document.getElementById("hudBar");
    const panel = document.getElementById("towerPanel");
    const hudHeight = hud?.offsetHeight || 60;
    const panelHeight = panel?.offsetHeight || 76;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - hudHeight - panelHeight;

    calculateTileSize();
}

window.addEventListener('resize', resizeCanvas);


// Classes
class Tower {
    constructor(x, y, type = "basic") {
        this.x = x;
        this.y = y;
        this.type = type;
        this.range = TILE_SIZE * (type === "sniper" ? 4 : 1.5);
        this.cooldown = 0;
        this.level = 1;
        this.angle = 0; // 🆕 Track facing direction
    }

    upgrade() {
        if (this.level < 5) {
            this.level++;
            this.range += 10;
        }
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
            const target = enemies.find(inRange);
            if (target) {
                bullets.push(getPoisonBullet(this.x, this.y, target, this.level, this.type));
                queuePoisonSound?.();
                this.cooldown = 50;
                didFire = true;
            }
        } else if (this.type === "sniper") {
            let best = null;
            for (const e of enemies) {
                if (inRange(e) && (!best || e.pathIndex > best.pathIndex)) {
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

                bullets.push(getBullet(tipX, tipY, target, this.level, this.type));
                queueHitSound();
                this.cooldown = 70;
                didFire = true;
            }
        } else if (this.type === "splash") {
            const target = enemies.find(inRange);
            if (target) {
                bullets.push(getSplashBullet(this.x, this.y, target, this.level, this.type, this.type));
                queueHitSound();
                this.cooldown = 40;
                didFire = true;
            }
        } else if (this.type === "basic") {
            const target = enemies.find(inRange);
            if (target) {
                const b = getBullet(this.x, this.y, target, this.level, this.type);
                b.angle = null;
                bullets.push(b);
                queueHitSound();
                this.cooldown = 30;
                didFire = true;
            }
        } else if (this.type === "spread") {
            const target = enemies.find(inRange);
            if (target) {
                const angleToTarget = Math.atan2(target.y - this.y, target.x - this.x);
                const spread = Math.PI / 3;
                const numBullets = 2 + this.level;

                for (let i = 0; i < numBullets; i++) {
                    const offset = (-spread / 2) + (spread * i) / (numBullets - 1);
                    const angle = angleToTarget + offset;
                    const bullet = getSpreadBullet(this.x, this.y, this.level, angle, this.type);
                    bullets.push(bullet);
                }

                queueHitSound();
                this.cooldown = 45;
                didFire = true;
            }
        } else if (this.type === "lightning") {
              const target = enemies.find(inRange);
              if (target) {
                bullets.push(getLightningBullet(this.x, this.y, target, this.level, this.type));
                queueHitSound?.();
                this.cooldown = 45;
                didFire = true;
              }
        }else if (this.type === "slow") {
          const target = enemies.find(inRange);
          if (target) {
            bullets.push(getSlowBullet(this.x, this.y, target, this.level, this.type));
            queueHitSound?.();
            this.cooldown = 50;
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
                this.target.health -= this.damage;
                //spawnExplosion(this.target.x, this.target.y);
                this.handleEnemyKill(this.target);
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
                    enemy.health -= this.damage;
                    //spawnExplosion(enemy.x, enemy.y);
                    this.handleEnemyKill(enemy);
                    this.markForRelease();
                    break;
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
        if (enemy.health > 0) return;

       if (enemy.type === "megaBoss") {
            for (let i = 0; i < 2; i++) {
                const boss = getEnemy(enemy.path, "boss");
                boss.x = enemy.x + Math.random() * 40 - 20;
                boss.y = enemy.y + Math.random() * 40 - 20;
                boss.pathIndex = enemy.pathIndex;
                enemies.push(boss);
            }
        }


        gold += ENEMY_STATS[enemy.type].reward;
        totalGoldEarned += ENEMY_STATS[enemy.type].reward;
        handleEnemyKill(enemy.type);
        enemyKillCount++;

        if (enemy.type === "splitter") {
            splitQueue.push({
                x: enemy.x,
                y: enemy.y,
                path: enemy.path,
                pathIndex: enemy.pathIndex
            });
        }

        if (totalGoldEarned >= 500) unlockAchievement("gold_500", "Earned 500 Gold");
        if (enemyKillCount >= 100) unlockAchievement("kill_100", "100 Enemies Defeated");
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
        this.damage = Math.floor(15 + 6 * Math.sqrt(level - 1));
        this.explosionRadius = TILE_SIZE * 1.2;
        this.hit = false;
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
                    enemy.health -= this.damage;
                    //spawnExplosion(enemy.x, enemy.y);
                    this.handleEnemyKill?.(enemy); // Safe in case reused

                    if (enemy.health <= 0) {
                        if (enemy.type === "splitter") {
                            splitQueue.push({ x: enemy.x, y: enemy.y, path: enemy.path, pathIndex: enemy.pathIndex });
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

                        gold += ENEMY_STATS[enemy.type].reward;
                        totalGoldEarned += ENEMY_STATS[enemy.type].reward;
                        enemyKillCount++;
                    }
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
        this.damage = Math.floor(info.baseDamage + info.damageScale * Math.sqrt(level - 1));

    }

    update(delta = 1) {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const dist = Math.hypot(dx, dy);
        const moveDist = this.speed * delta;

        if (dist < moveDist) {
            this.target.statusEffects.push({
                type: "poison",
                damage: this.damage,
                tickRate: 30,
                duration: 120
            });

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
    this.damage = Math.floor(info.baseDamage + info.damageScale * Math.sqrt(level - 1));
    this.radius = TILE_SIZE * 1.5;
    this.hit = false;
  }

  update(delta = 1) {
      if (this.hit) return;

      const dx = this.target.x - this.x;
      const dy = this.target.y - this.y;
      const dist = Math.hypot(dx, dy);
      const step = this.speed * delta;

      if (dist < step) {
        for (let e of enemies) {
          const d = Math.hypot(e.x - this.target.x, e.y - this.target.y);
          if (d <= this.radius) {
            e.health -= this.damage;
            
            if (e.health <= 0) {
                gold += ENEMY_STATS[e.type].reward;
                totalGoldEarned += ENEMY_STATS[e.type].reward;
                enemyKillCount++;
            }
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

  }

  update() {
    if (this.hit) return;

    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist < this.speed) {
      this.target.statusEffects.push({
        type: this.type,
        multiplier: 1 - this.slowAmount,
        duration: this.duration
      });
        releaseSlowBullet(this);
      //spawnExplosion(this.target.x, this.target.y, 2);
      this.hit = true;
    } else {
      this.x += (dx / dist) * this.speed;
      this.y += (dy / dist) * this.speed;
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
        this.statusEffects = [];
        this.statusTimers = {};
    }

    update(delta = 1) {
        // Check for leak
        if (this.pathIndex >= this.path.length - 1) {
            lives -= ENEMY_STATS[this.type].livesLost || 1;
            releaseEnemy(this);
            return;
        }

        // Compute next tile vector
        const next = this.path[this.pathIndex + 1];
        const dx = next.x - this.x;
        const dy = next.y - this.y;
        const dist = Math.hypot(dx, dy);

        // Default speed
        let actualSpeed = this.speed;

        // Apply slow if active
        const slowEffect = this.statusEffects.find(e => e.type === "slow");
        if (slowEffect) {
            actualSpeed *= slowEffect.slowFactor || 0.5; // e.g. 50% slow
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
        }

        // Status effects
        this.statusEffects = this.statusEffects.filter(effect => {
            if (effect.type === "poison") {
                this.statusTimers[effect] = (this.statusTimers[effect] || 0) + delta;
                while (this.statusTimers[effect] >= effect.tickRate) {
                    this.health -= effect.damage;
                    this.statusTimers[effect] -= effect.tickRate;

                    if (this.health <= 0) {
                        releaseEnemy(this);
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
    }




    draw(ctx) {
        const img = ENEMY_IMAGES[this.type];

        // Define per-enemy scale factor
        const scaleMap = {
            basic: 0.55,
            fast: 0.5,
            tank: 0.65,
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
        if (isPoisoned) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(this.x, this.y, TILE_SIZE * 0.5 + Math.sin(Date.now() / 150) * 2, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(0,255,0,0.15)";
            ctx.fill();
            ctx.restore();
        }

        // Image-based rendering with fallback
        if (img && img.complete) {
            ctx.drawImage(img, this.x - size / 2, this.y - size / 2, size, size);
        } else {
            // Fallback: colored circle
            let color = "red";
            switch (this.type) {
                case "fast":     color = "lime"; break;
                case "tank":     color = "purple"; break;
                case "boss":     color = "black"; break;
                case "splitter": color = "#aa5500"; break;
                case "mini":     color = "#ffaa00"; break;
                case "healer":   color = "#33ccee"; break;
                case "stealth":  color = "rgba(255,255,255,0.4)"; break;
                case "megaBoss": color = "darkred"; break;
            }

            const radius = this.type === "megaBoss" ? TILE_SIZE * 0.5 : TILE_SIZE / 5;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
            ctx.fill();
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
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMap();

    towers.forEach(t => t.draw());
    enemies.forEach(e => e.draw(ctx));
    bullets.forEach(b => b.draw());

    lightningAnimations.forEach(anim => {
      const frameImg = LIGHTNING_FRAMES[anim.frame];
      if (frameImg?.complete) {
        ctx.drawImage(frameImg, anim.x - 32, anim.y - 32, 64, 64);
      }
    });


    // Floating messages
    floatingMessages.forEach(msg => {
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

    // Intro enemy message
    if (introMessage) {
        ctx.save();
        ctx.font = "14px monospace";
        ctx.textAlign = "center";

        const fullText = `${introMessage.type.toUpperCase()}: ${introMessage.text}`;
        const textWidth = Math.max(
            ctx.measureText("⚠ New Enemy Incoming!").width,
            ctx.measureText(fullText).width
        );
        const boxWidth = textWidth + 20;
        const boxHeight = 100;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // Background box
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.fillRect(centerX - boxWidth / 2, centerY - boxHeight / 2, boxWidth, boxHeight);

        // Text
        ctx.fillStyle = "white";
        ctx.font = "16px monospace";
        ctx.fillText("⚠ New Enemy Incoming!", centerX, centerY - 20);

        ctx.fillStyle = "gold";
        ctx.font = "14px monospace";
        ctx.fillText(fullText, centerX, centerY + 10);
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
    
        damageNumbers.forEach(d => {
            ctx.save();
            ctx.globalAlpha = d.opacity;
            ctx.fillStyle = d.color || "yellow";
            ctx.font = "12px monospace";
            ctx.fillText(d.text, d.x, d.y);
            ctx.restore();
        });


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
        enemies.push(getEnemy(enemyPath, nextType)); // 🔁 uses enemy pool
        waveTimer = Math.max(10, 30 - wave * 2);

        if (nextType === "boss" || nextType === "megaBoss") {
            bossWarning = {
                text: nextType === "megaBoss" ? "💀 MEGA BOSS INCOMING!" : "⚠ Incoming Boss!",
                time: 90
            };
        }

       
    }
    
    //particlePool.updateAll();
    bullets.forEach(b => b.update(gameSpeed));
    enemies.forEach(e => e.update(gameSpeed));
    towers.forEach(t => t.update(enemies, bullets, gameSpeed));

    bullets = bullets.filter(b => !b.hit);
    enemies = enemies.filter(e => {
        if (e.health <= 0) {
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


    // Floating messages
    floatingMessages.forEach(msg => {
        msg.y -= 0.03 * gameSpeed; // vertical float speed
        msg.lifetime -= gameSpeed;
        msg.opacity = Math.max(0, msg.lifetime / 60);
    });
    floatingMessages = floatingMessages.filter(msg => msg.lifetime > 0);



    // Leaks and lives deduction
    let leaked = enemies.filter(e => e.pathIndex >= e.path.length - 1);
    for (let e of leaked) {
        lives -= ENEMY_STATS[e.type].livesLost || 1;
        releaseEnemy(e); // 🔁 return to pool
    }
    enemies = enemies.filter(e => e.pathIndex < e.path.length - 1);


    // Game Over
    if (lives <= 0 && !gameOver) {
        gameOver = true;
        showOverlay("💀 Game Over!");
        return;
    }

    // Check for wave end
    if (isWaveActive && waveQueue.length === 0 && enemies.length === 0) {
        isWaveActive = false;
        
        handleWaveComplete();
        if (wave >= waves.length && !gameWon) {
            gameWon = true;
            handleLevelComplete();
            showOverlay("🎉 Level Complete!");
        }
    }

    // Re-enable start wave button if needed
    if (!isWaveActive && waveQueue.length === 0 && wave < waves.length) {
        startWaveBtn.style.display = "block";
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

    const waveData = waves[wave]; // flat array like ["basic", "fast", "basic"]
    const newTypes = [];

    waveQueue = [...waveData]; // ✅ direct copy of flat array

    // Identify any new enemy types for the intro popup
    waveQueue.forEach(type => {
        if (!seenEnemyTypes.has(type)) {
            seenEnemyTypes.add(type);
            newTypes.push(type);
        }
    });

    wave++; // Increment wave number

    // Boss warning logic
    if (waveQueue.includes("boss")) {
        bossWarning = {
            text: "⚠ Incoming Boss!",
            time: 120,
            shake: true
        };
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
        isWaveActive = true;
        waveTimer = 0;
        return;
    }

    const nextType = waveIntroQueue.shift();

    const descriptions = {
        basic: "Standard enemy. No special abilities.",
        fast: "Moves quickly. Can slip through defenses!",
        tank: "High health. Slow but dangerous.",
        boss: "Massive health. Reaching the end means game over!",
        megaBoss: "Enormous and slow. Spawns two Bosses when killed!",
        splitter: "Splits into two mini enemies when killed.",
        mini: "Small, fast offspring of a splitter.",
        healer: "Heals nearby enemies slowly over time.",
        stealth: "Can only be targeted by upgraded towers."
    };

    introMessage = {
        type: nextType,
        text: descriptions[nextType] || "A new foe approaches!"
    };

    introTimer = 120; // Show for 2 seconds before moving to next
}

function addFloatingMessage(text, x, y, color = "white") {
    floatingMessages.push({
        text,
        x,
        y,
        color,
        lifetime: 60,
        opacity: 1
    });
}



function loadLevel(level) {
    
    document.getElementById("levelSelector").style.display = "none";
    document.getElementById("gameContainer").style.display = "block";

    const levelData = MAPS[level];
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
    lives = 10;
    isWaveActive = false;
    gameOver = false;
    gameWon = false;
    waveQueue = [];
    waveTimer = 0;
    seenEnemyTypes.clear();
    selectedTower = null;
    hoveredTower = null;
    
    // DEV: Start at a specific wave for testing
    /*
    const DEV_START_WAVE = 20; // ← Change this to whatever wave you want to test
    const DEV_START_GOLD = 9999;
    gold = DEV_START_GOLD;
    if (DEV_START_WAVE > 1) {
        wave = DEV_START_WAVE - 1;
        seenEnemyTypes = new Set(); // Clear enemy types to avoid intros
    }*/

    startWaveBtn.style.display = "block";
    updateHUD();
    updateRankDisplay();
    updateTowerButtons();
    renderTowerButtons();
    preallocateAllBulletTypes(250, 100); // More bullets for late-game testing
    preallocateEnemies(200);
    gameLoop();
}


// Utility Functions
function unlockAchievement(key, message) {
    if (localStorage.getItem(`achieved_${key}`)) return;

    localStorage.setItem(`achieved_${key}`, "true");
    addFloatingMessage(`🏆 ${message}`, canvas.width / 2, 100, "gold");

}

function getUnlockedLevels() {
  return JSON.parse(localStorage.getItem("unlockedLevels") || "[1]");
}

function unlockLevel(level) {
  const unlocked = getUnlockedLevels();
  if (!unlocked.includes(level)) {
    unlocked.push(level);
    localStorage.setItem("unlockedLevels", JSON.stringify(unlocked));
  }
}

function evaluateLevelUnlocks(wavesCompleted) {
  for (const [level, requiredWaves] of Object.entries(LEVEL_UNLOCKS)) {
    if (wavesCompleted >= requiredWaves) {
      unlockLevel(parseInt(level));
    }
  }
}

function updateHUD() {
    const displayWave = Math.min(wave, waves.length);
    document.getElementById("goldDisplay").textContent = `💰 ${gold}`;
    document.getElementById("waveDisplay").textContent = `Wave ${displayWave} / ${waves.length}`;
    document.getElementById("livesDisplay").textContent = `❤️ ${lives}`;
}

function towerUpgradeCost(tower) {
    const base = towerCosts[tower.type] || 50;
    return Math.floor(base * (0.5 + tower.level * 0.6));
}

function showOverlay(message) {
    const overlay = document.getElementById("overlayMessage");
    const text = document.getElementById("overlayText");
    const btn = document.getElementById("restartBtn");
    text.textContent = message;
    overlay.style.display = "flex";
    btn.onclick = () => location.reload();
}

function spawnExplosion(x, y, count = 5) {
    return;
    /*const colors = ["orange", "red", "yellow"];
    for (let i = 0; i < count; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        particlePool.spawn(x, y, color);
    }*/
}

function showTowerActionUI(tower) {
    hideTowerActionUI();

    const canvasRect = canvas.getBoundingClientRect();
    const upgradeCost = towerUpgradeCost(tower);
    const baseCost = towerCosts[tower.type] || 50;
    const totalCostInvested = baseCost + (tower.level - 1) * towerUpgradeCost({ type: tower.type, level: tower.level });
    const sellValue = Math.floor(totalCostInvested * 0.6);

    towerActionUI = document.createElement("div");
    towerActionUI.style.position = "absolute";
    towerActionUI.style.padding = "6px";
    towerActionUI.style.background = "#222";
    towerActionUI.style.border = "1px solid #888";
    towerActionUI.style.borderRadius = "6px";
    towerActionUI.style.color = "#fff";
    towerActionUI.style.fontFamily = "monospace";
    towerActionUI.style.fontSize = "12px";
    towerActionUI.style.zIndex = "1000";
    towerActionUI.style.maxWidth = "120px";

    // First, temporarily append to calculate size
    document.body.appendChild(towerActionUI);
    const panelWidth = towerActionUI.offsetWidth;
    const panelHeight = towerActionUI.offsetHeight;
    document.body.removeChild(towerActionUI); // we'll re-append after positioning

    // Default position
    let left = canvasRect.left + tower.x - panelWidth / 2;
    let top = canvasRect.top + tower.y + TILE_SIZE / 2;

    const padding = 8;
    // Clamp to screen edges
    left = Math.max(padding, Math.min(window.innerWidth - panelWidth - padding, left));
    top = Math.max(padding, Math.min(window.innerHeight - panelHeight - padding, top));

    towerActionUI.style.left = `${left}px`;
    towerActionUI.style.top = `${top}px`;
    
    const towerName = document.createElement("div");
    towerName.textContent = tower.type.charAt(0).toUpperCase() + tower.type.slice(1) + " Tower";
    towerName.style.marginBottom = "6px";
    towerName.style.fontWeight = "bold";
    towerName.style.color = "white";
    towerActionUI.appendChild(towerName);

    const upgradeBtn = document.createElement("button");
    upgradeBtn.textContent = tower.level >= 5 ? `Max Level (${tower.level})` : `Upgrade ($${upgradeCost})`;
    upgradeBtn.disabled = tower.level >= 5;
    upgradeBtn.style.fontSize = "12px";
    upgradeBtn.style.padding = "4px 6px";
    upgradeBtn.style.margin = "2px 0";
    upgradeBtn.onclick = () => {
        if (gold >= upgradeCost) {
            tower.upgrade();
            gold -= upgradeCost;
            hideTowerActionUI();
            selectedTower = null;
        } else {
            addFloatingMessage("Not enough gold!", tower.x, tower.y, "red");
        }
    };

    const sellBtn = document.createElement("button");
    sellBtn.textContent = `Sell (+$${sellValue})`;
    sellBtn.style.fontSize = "12px";
    sellBtn.style.padding = "4px 6px";
    sellBtn.style.margin = "2px 0";
    sellBtn.onclick = () => {
        gold += sellValue;
        towers = towers.filter(t => t !== tower);
        hideTowerActionUI();
    };

    towerActionUI.appendChild(upgradeBtn);
    towerActionUI.appendChild(sellBtn);
    document.body.appendChild(towerActionUI);
}

function hideTowerActionUI() {
    if (towerActionUI) {
        document.body.removeChild(towerActionUI);
        towerActionUI = null;
    }
}

function toggleSpeed() {
    gameSpeed = gameSpeed === 1 ? 2 : 1;
    document.getElementById("speedToggleBtn").textContent = gameSpeed === 2 ? "⏩" : "⏩";
}

function togglePause() {
    paused = !paused;
    const btn = document.getElementById("pauseToggleBtn");
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
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const panel = document.getElementById("towerPanel");
    const panelTop = panel.getBoundingClientRect().top;
    if (y >= panelTop - rect.top) return; // ✅ Block clicks in tower panel area

    // Interact with existing towers
    const clickedTower = towers.find(t => Math.hypot(t.x - x, t.y - y) < TILE_SIZE / 2);
    if (clickedTower) {
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

    const cost = towerCosts[selectedTowerType];
    if (gold >= cost) {
        const tileX = Math.floor(x / TILE_SIZE);
        const tileY = Math.floor(y / TILE_SIZE);
        const tileType = currentMap[tileY]?.[tileX];

        // Prevent placing on path tiles
        if (["P", "C", "S", "E", "T"].includes(tileType) || /^P\d+$/.test(tileType)) {
            addFloatingMessage("❌ Can't build on path!", x, y, "orange");
            return;
        }

        const centerX = tileX * TILE_SIZE + TILE_SIZE / 2;
        const centerY = tileY * TILE_SIZE + TILE_SIZE / 2;

        towers.push(new Tower(centerX, centerY, selectedTowerType));
        gold -= cost;

        // Clear selection after placing
        selectedTowerType = null;
        document.querySelectorAll("#towerPanel button").forEach(b => b.classList.remove("selected"));
        selectedTower = null;
        hideTowerActionUI();
    } else {
        addFloatingMessage("Not enough gold!", x, y, "red");
    }
});



canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    hoveredTower = towers.find(t => Math.hypot(t.x - x, t.y - y) < TILE_SIZE / 2) || null;
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
        towers.push(tower);
    });

    alert("🏗️ Maxed towers placed.");
}

function resetDevProgress() {
    localStorage.clear();
    alert("🧹 Local storage cleared.");
}

function renderLevelButtons() {
  const container = document.getElementById("levelButtons");
  container.innerHTML = "";

  const unlocked = getUnlockedLevels();

  Object.entries(MAPS).forEach(([level, mapData]) => {
    const btn = document.createElement("button");
    btn.style.background = "none";
    btn.style.border = "none";
    btn.style.position = "relative";

    const img = document.createElement("img");
    img.src = `images/maps/level${level}.png`; // You provide this
    img.style.width = "100px";
    img.style.height = "auto";
    img.style.borderRadius = "8px";
    img.style.opacity = unlocked.includes(parseInt(level)) ? "1" : "0.4";

    if (!unlocked.includes(parseInt(level))) {
      const lockIcon = document.createElement("div");
      lockIcon.textContent = "🔒";
      lockIcon.style.position = "absolute";
      lockIcon.style.top = "24px";
      lockIcon.style.right = "86px";
      lockIcon.style.fontSize = "18px";
      lockIcon.style.color = "red";
      btn.appendChild(lockIcon);
    } else {
      btn.onclick = () => loadLevel(parseInt(level));
    }

    btn.appendChild(img);
    container.appendChild(btn);
  });
}


gameLoop();
