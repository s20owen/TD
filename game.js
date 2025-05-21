
// ============================
// Full Tower Defense Game.js
// ============================

// Enemy Types Configuration
const ENEMY_STATS = {
    basic:   { health: 100, speed: 1.2, reward: 10, livesLost: 1 },
    fast:    { health: 60,  speed: 2.0, reward: 15, livesLost: 1 },
    tank:    { health: 1000, speed: 0.6, reward: 30, livesLost: 3 },
    boss:    { health: 5000, speed: 0.4, reward: 200, livesLost: 99 },
    splitter:{ health: 150, speed: 1.1, reward: 20, livesLost: 1 },
    mini:    { health: 40,  speed: 1.8, reward: 5, livesLost: 1 },
    healer:  { health: 120, speed: 1.0, reward: 15, livesLost: 1 },
    stealth: { health: 70,  speed: 1.5, reward: 12, livesLost: 1 },
    megaBoss: {health: 20000, speed: 0.5, reward: 1000, livesLost: 99}
};

const towerTypes = ["basic", "spread", "sniper", "splash", "poison"];

// Map/Level
const MAPS = {
    1: {
        map: [  
         ['P1', 'P2',  'P3',  'P4',  'P5',  'P6',  'G',    'G',    'G'],
         ['G',  'G',   'G',   'G',   'G',   'P7',  'G',    'G',    'G'],
         ['G',  'G',   'G',   'G',   'G',   'P8',  'G',    'G',    'G'],
         ['G',  'P19', 'P20', 'P21', 'P22', 'P9',  'P23',  'P24',  'G'],
         ['G',  'P18', 'G',   'G',   'G',   'P10', 'G',    'P25',  'G'],
         ['G',  'P17', 'G',   'G',   'G',   'P11', 'G',    'P26',  'G'],
         ['G',  'P16', 'P15', 'P14', 'P13', 'P12', 'G',    'P27',  'G'],
         ['G',  'G',   'G',   'G',   'G',   'G',   'G',    'P28',  'G'],
         ['G',  'G',   'G',   'G',   'G',   'G',   'G',    'P29',  'G'],
         ['G',  'G',   'G',   'G',   'G',   'G',   'G',    'P30',  'G'],
         ['G',  'G',   'G',   'G',   'G',   'G',   'G',    'P31',  'G'],
         ['G',  'G',   'G',   'G',   'G',   'G',   'G',    'P32',  'G'],
         ['G',  'G',   'G',   'G',   'G',   'G',   'G',    'E',    'G']

        ],
        waves: 
        generateWaves(30) // dynamically generating waves
    },
    2: {
        map: [
            ['G','G','G','P','P','P','P','G','G','G','G','G','G','G','G'],
            ['G','G','G','G','G','G','P','G','G','G','G','G','G','G','G'],
            ['G','G','G','G','G','G','P','G','G','G','G','G','G','G','G'],
            ['G','G','G','G','G','G','P','G','G','G','G','G','G','G','G'],
            ['G','G','G','G','G','G','P','P','P','P','P','G','G','G','G'],
            ['G','G','G','G','G','G','G','G','G','G','P','G','G','G','G'],
            ['G','G','G','G','G','G','G','G','G','G','P','G','G','G','G'],
            ['G','G','G','G','G','G','G','G','G','G','P','G','G','G','G'],
            ['G','G','G','G','G','G','G','G','G','G','P','G','G','G','G'],
            ['G','G','G','G','G','G','G','G','G','G','P','G','G','G','G']
        ],
        waves: [
            [{type: "fast", count: 5}],
            [{type: "basic", count: 10}],
            [{type: "tank", count: 3}, {type: "fast", count: 5}],
            [{type: "fast", count: 8}, {type: "tank", count: 4}]
        ]
    }
};

// Toggle dev panel on/off
let showDebugStats = false; 

// Required UI Elements
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const speedBtn = document.getElementById("speedToggleBtn");
const pauseBtn = document.getElementById("pauseBtn");
const achievementBox = document.getElementById("achievements");

// Game Variables
let pausedForIntro = false;
let TILE_SIZE = 64;
let wave = 0, gold = 100, lives = 10;
let towers = [], enemies = [], bullets = [], splitQueue = [];
let gameWon = false, gameOver = false, paused = false, isWaveActive = false;
let waveQueue = [], waveTimer = 0, currentMap = [], waves = [], enemyPath = [];
let damageNumbers = [], floatingMessages = [], seenEnemyTypes = new Set();
let selectedTowerType = null, selectedTower = null, hoveredTower = null;
let waveIntroQueue = [], introMessage = null, introTimer = 0, bossWarning = null;
let totalGoldEarned = 0, enemyKillCount = 0, towerActionUI = null;
let gameSpeed = 1;

const particlePool = new ParticlePool(100); // Preallocate 100 particles

// Rank based tower unlock 
const rankTable = [
  { level: 1, title: "Recruit", points: 0 },
  { level: 2, title: "Scout", points: 550 },
  { level: 3, title: "Private", points: 1150 },
  { level: 4, title: "Corporal", points: 1800 },
  { level: 5, title: "Sergeant", points: 2500 },
  { level: 6, title: "Lieutenant", points: 3250 },
  { level: 7, title: "Captain", points: 4050 },
  { level: 8, title: "Major", points: 4900 },
  { level: 9, title: "Colonel", points: 5800 },
  { level: 10, title: "General", points: 6750 },
  { level: 11, title: "Warlord", points: 7750 },
  { level: 12, title: "Hero", points: 8800 },
  { level: 13, title: "Champion", points: 9900 },
  { level: 14, title: "Master", points: 11050 },
  { level: 15, title: "Legend", points: 12250 },
  { level: 16, title: "Sentinel", points: 13500 },
  { level: 17, title: "Overseer", points: 14800 },
  { level: 18, title: "Commander", points: 16150 },
  { level: 19, title: "Mythic", points: 17550 },
  { level: 20, title: "Godlike", points: 19000 }
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

// Points awarded
function handleEnemyKill(enemyType) {
  let points = 1;
  if (enemyType === "boss") points += 25;
  gainPoints(points);
}

function handleWaveComplete() {
  gainPoints(5 + lives); // +5 for wave, +1 per life
}

function handleLevelComplete() {
  gainPoints(50);
}

// Unlocks based on new ranks
const towerUnlocks = {
  basic: 1,
  spread: 3,
  sniper: 5,
  poison: 7,
  splash: 10,
  
};

function generateWaves(totalWaves = 50) {
    const waves = [];

    for (let i = 1; i <= totalWaves; i++) {
        const enemyQueue = [];

        const difficultyMultiplier = 1 + i * 0.1;

        // Core enemy: always basics
        const basicCount = Math.floor((5 + i * 1.2) * difficultyMultiplier);
        for (let j = 0; j < basicCount; j++) enemyQueue.push("basic");

        // Fast enemies appear more often after wave 4
        if (i >= 4) {
            const fastCount = Math.floor((i / 2) * difficultyMultiplier);
            for (let j = 0; j < fastCount; j++) enemyQueue.push("fast");
        }

        // Add tanks starting wave 8
        if (i >= 8) {
            const tankCount = Math.floor(i / 4);
            for (let j = 0; j < tankCount; j++) enemyQueue.push("tank");
        }

        // Add healers every 5th wave
        if (i % 5 === 0) {
            const healers = 2 + Math.floor(i / 5);
            for (let j = 0; j < healers; j++) enemyQueue.push("healer");
        }

        // Splitters from wave 10+
        if (i >= 10 && i % 3 === 0) {
            const splitterCount = Math.floor(i / 4);
            for (let j = 0; j < splitterCount; j++) enemyQueue.push("splitter");
        }

        // Stealth from wave 12+
        if (i >= 12 && i % 4 === 0) {
            const stealthCount = Math.floor(i / 3);
            for (let j = 0; j < stealthCount; j++) enemyQueue.push("basic");
        }

        // Boss every 25 waves
        if (i % 15 === 0) {
            enemyQueue.push("boss");
        }
        // mega boss
        if (i % 30 === 0) {
          enemyQueue.push("megaBoss");
        }

        // Shuffle enemy order starting after wave 5
        if (i <= 5) {
            waves.push(enemyQueue); // early waves stay structured
        } else {
            shuffleArray(enemyQueue);
            waves.push(enemyQueue);
        }
    }

    return waves;
}

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = (Math.random() * (i + 1)) | 0; // Faster bitwise floor
        [arr[i], arr[j]] = [arr[j], arr[i]];
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
        if (playerRank < towerUnlocks[type]) {
            btn.style.opacity = 0.4;

            if (!btn.querySelector(".lock-icon")) {
                const lockSpan = document.createElement("span");
                lockSpan.textContent = " 🔒";
                lockSpan.className = "lock-icon";
                btn.appendChild(lockSpan);
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
    basic: 50,
    spread: 60,
    sniper: 80,
    poison: 60,
    splash: 70
};

const towerInfo = {
    basic: {
        name: "Basic Tower",
        cost: towerCosts.basic,
        unlock: towerUnlocks.basic,
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


// Preload Tile Images
const tileImages = {
    G: new Image(), P: new Image(), T: new Image(), C: new Image(), S: new Image(), E: new Image()
};
tileImages.G.src = 'images/grass.png';
tileImages.P.src = 'images/path.png';
tileImages.T.src = 'images/tree.png';
tileImages.C.src = 'images/curve.png';
tileImages.S = tileImages.P;
tileImages.E = tileImages.P;

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

document.querySelectorAll("#towerPanel button").forEach(btn => {
    const type = btn.dataset.type; // ✅ move this outside the individual event listeners

    btn.addEventListener("click", () => {
        if (playerRank < towerUnlocks[type]) {
            addFloatingMessage(`🔒 Unlocks at Rank ${towerUnlocks[type]}`, canvas.width - 150, 80 + towerTypes.indexOf(type) * 70, "orange");
            return;
        }

        selectedTowerType = (selectedTowerType === type) ? null : type;
        updateTowerButtons();
    });

    btn.addEventListener("mouseenter", (e) => {
        const type = btn.dataset.type;
        const info = towerInfo[type];
        if (!info) return;

        let html = `<strong style="font-size:13px">${info.name}</strong><br>`;
        html += `Cost: $${info.cost}<br>`;
        html += `Unlocks at Rank: ${info.unlock}<br>`;
        html += `<em>${info.description}</em><br><br>`;
        html += `<u>Upgrades:</u><ul style="padding-left:16px;">`;
        info.upgrades.forEach(up => html += `<li>${up}</li>`);
        html += `</ul>`;

        tooltip.innerHTML = html;
        tooltip.style.display = "block";
        tooltip.style.left = `${e.pageX - tooltip.offsetWidth - 10}px`;
        tooltip.style.top = `${e.pageY + 10}px`;
    });

    btn.addEventListener("mousemove", (e) => {
        tooltip.style.left = `${e.pageX - tooltip.offsetWidth - 10}px`;
        tooltip.style.top = `${e.pageY + 10}px`;
    });

    btn.addEventListener("mouseleave", () => {
        tooltip.style.display = "none";
    });
});


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
function getBullet(x, y, target, level, angle = null) {
    const bullet = bulletPool.pop() || new Bullet(x, y, target, level);
    bullet.reset(x, y, target, level, angle);
    return bullet;
}

// When done (bullet hit or expired), return to pool:
function releaseBullet(bullet) {
    bulletPool.push(bullet);
}

function getSplashBullet(x, y, target, level) {
    const bullet = splashBulletPool.pop() || new SplashBullet(x, y, target, level);
    bullet.reset(x, y, target, level);
    return bullet;
}

function releaseSplashBullet(bullet) {
    splashBulletPool.push(bullet);
}

function getPoisonBullet(x, y, target, level) {
    const bullet = poisonBulletPool.pop() || new PoisonBullet(x, y, target, level);
    bullet.reset(x, y, target, level);
    return bullet;
}

function releasePoisonBullet(bullet) {
    poisonBulletPool.push(bullet);
}

function getSpreadBullet(x, y, level, angle) {
    const bullet = spreadBulletPool.pop() || new Bullet(x, y, null, level, angle);
    bullet.reset(x, y, null, level, angle);
    bullet.speed = 3; // 🔹 Make spread slower
    bullet.maxDistance = TILE_SIZE * 3;
    return bullet;
}

function releaseSpreadBullet(bullet) {
    spreadBulletPool.push(bullet);
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
    const uiHeight = 180; // Reserve space at bottom for UI
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - uiHeight;
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
    }

    upgrade() {
        if (this.level < 5) {
            this.level++;
            this.range += 10;
        }
    }

    update(enemies, bullets, delta = 1) {
        if(this.cooldown > 0){
            this.cooldown -= delta;
            return;
        }

        const inRange = (e) => {
            if (e.type === "stealth" && this.level < 2) return false;
            return Math.hypot(this.x - e.x, this.y - e.y) < this.range;
        };
        
         // POISON TOWER LOGIC
        if (this.type === "poison") {
            const target = enemies.find(inRange);
            if (target) {
                bullets.push(getPoisonBullet(this.x, this.y, target, this.level));
                queuePoisonSound?.(); // if sound logic added
                this.cooldown = 45;
            }
        }

        if (this.type === "sniper") {
            let best = null;
            for (const e of enemies) {
                if (inRange(e) && (!best || e.pathIndex > best.pathIndex)) {
                    best = e;
                }
            }
            const target = best;

            if (target) {
                bullets.push(getBullet(this.x, this.y, target, this.level));
                queueHitSound(); // 🔊 just queue
                this.cooldown = 90;
            }
        } else if (this.type === "splash") {
            const target = enemies.find(inRange);
            if (target) {
                bullets.push(getSplashBullet(this.x, this.y, target, this.level));
                queueHitSound(); // 🔊
                this.cooldown = 40;
            }
        }else if (this.type === "basic") {
            const target = enemies.find(inRange);
            if (target) {
                const b = getBullet(this.x, this.y, target, this.level);
                b.angle = null; // ✅ Clear angle to force target-based logic
                bullets.push(b);
                queueHitSound();
                this.cooldown = 30;
            }
        }
        else if (this.type === "spread") {
            const target = enemies.find(inRange);
            if (target) {
                const angleToTarget = Math.atan2(target.y - this.y, target.x - this.x);
                const spread = Math.PI / 3;
                const numBullets = 2 + this.level;
                let fired = false;

                for (let i = 0; i < numBullets; i++) {
                    const offset = (-spread / 2) + (spread * i) / (numBullets - 1);
                    const angle = angleToTarget + offset;
                    const bullet = getSpreadBullet(this.x, this.y, this.level, angle);
                    bullets.push(bullet);
                    fired = true;
                }

                if (fired) queueHitSound();
                this.cooldown = 50;
            }
        }


    }

    draw() {
        const size = TILE_SIZE / 2.5;
        const offset = TILE_SIZE / 5;

        ctx.fillStyle = this.type === "basic" ? "cyan" :
                        this.type === "spread" ? "magenta" :
                        this.type === "sniper" ? "blue" :
                        this.type === "poison" ? "limegreen" :
                        "orange";

        ctx.fillRect(this.x - offset, this.y - offset, size, size);

        if (hoveredTower === this) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(255,255,255,0.2)";
            ctx.lineWidth = 1;
            ctx.stroke();
        }

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

        ctx.fillStyle = "white";
        ctx.font = "10px monospace";
        ctx.fillText(`Lv${this.level}`, this.x - 10, this.y + TILE_SIZE / 2 );
    }
}



class Bullet {
    constructor(x, y, target, level, angle = null) {
        this.reset(x, y, target, level, angle);
    }

    reset(x, y, target, level, angle = null) {
        this.x = x;
        this.y = y;
        this.target = target;
        this.level = level;
        this.angle = angle;
        this.speed = (angle !== null ? 4 : 5 + level); // Slower if spread
        this.damage = Math.floor(20 + 8 * Math.sqrt(level - 1));
        this.hit = false; // ✅ ONLY reset here
        this.traveled = 0;
        this.maxDistance = TILE_SIZE * 6;
    }

    update() {
        if (this.hit) return;

        // 🔸 Targeted bullets
        if (this.target) {
            if (!enemies.includes(this.target) || this.target.health <= 0) {
                this.markForRelease();
                return;
            }

            const dx = this.target.x - this.x;
            const dy = this.target.y - this.y;
            const dist = Math.hypot(dx, dy);

            if (dist < this.speed) {
                this.target.health -= this.damage;
                spawnExplosion(this.target.x, this.target.y);
                this.handleEnemyKill(this.target);
                this.markForRelease();
            } else {
                this.x += (dx / dist) * this.speed;
                this.y += (dy / dist) * this.speed;
            }
        }

        // 🔸 Angle-based (spread) bullets
        else if (this.angle !== null) {
            const dx = Math.cos(this.angle) * this.speed;
            const dy = Math.sin(this.angle) * this.speed;
            this.x += dx;
            this.y += dy;
            this.traveled += Math.hypot(dx, dy);

            for (let enemy of enemies) {
                if (enemy.type === "stealth" && this.level < 2) continue;

                const dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
                if (dist < TILE_SIZE / 5) {
                    enemy.health -= this.damage;
                    spawnExplosion(enemy.x, enemy.y);
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

        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(this.x, this.y, TILE_SIZE / 16, 0, Math.PI * 2);
        ctx.fill();
    }
}



class SplashBullet {
    constructor(x, y, target, level) {
        this.reset(x, y, target, level);
    }

    reset(x, y, target, level) {
        this.x = x;
        this.y = y;
        this.target = target;
        this.level = level;
        this.speed = 4 + level;
        this.damage = Math.floor(15 + 6 * Math.sqrt(level - 1));
        this.explosionRadius = TILE_SIZE * 1.2;
        this.hit = false;
    }

    update() {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist < this.speed) {
            for (let enemy of enemies) {
                const d = Math.hypot(enemy.x - this.x, enemy.y - this.y);
                if (d < this.explosionRadius) {
                    if (enemy.type === "stealth" && this.level < 2) continue;
                    enemy.health -= this.damage;
                    spawnExplosion(enemy.x, enemy.y);

                    if (enemy.health <= 0) {
                        handleEnemyKill(enemy.type);
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
            releaseSplashBullet(this); // ✅ release it
        } else {
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed;
        }
    }

    draw() {
        ctx.fillStyle = "orange";
        ctx.beginPath();
        ctx.arc(this.x, this.y, TILE_SIZE / 12, 0, Math.PI * 2);
        ctx.fill();
    }
}


class PoisonBullet {
    constructor(x, y, target, level) {
        this.reset(x, y, target, level);
    }

    reset(x, y, target, level) {
        this.x = x;
        this.y = y;
        this.target = target;
        this.level = level;
        this.speed = 4 + level;
        this.hit = false;
    }

    update() {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist < this.speed) {
            this.target.statusEffects.push({
                type: "poison",
                damage: Math.floor(1 + this.level),
                tickRate: 30,
                duration: 120
            });

            spawnExplosion(this.target.x, this.target.y, 4);

            this.hit = true;
            releasePoisonBullet(this); // ✅ release it
        } else {
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed;
        }
    }

    draw() {
        ctx.fillStyle = "limegreen";
        ctx.beginPath();
        ctx.arc(this.x, this.y, TILE_SIZE / 16, 0, Math.PI * 2);
        ctx.fill();
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

    update() {
        // Leak check
        if (this.pathIndex >= this.path.length - 1) {
            // Enemy leaked — handle lives and remove
            lives -= ENEMY_STATS[this.type].livesLost || 1;
            releaseEnemy(this);
            return;
        }

        const next = this.path[this.pathIndex + 1];
        const dx = next.x - this.x;
        const dy = next.y - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist < this.speed) {
            this.x = next.x;
            this.y = next.y;
            this.pathIndex++;
        } else {
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed;
        }

        // Healer logic: heal nearby enemies gradually
        if (this.type === "healer") {
            for (let other of enemies) {
                if (other === this || other.health <= 0 || other.health >= other.maxHealth) continue;
                const d = Math.hypot(this.x - other.x, this.y - other.y);
                if (d < TILE_SIZE * 2) {
                    other.health += 0.3;
                    if (other.health > other.maxHealth) other.health = other.maxHealth;
                }
            }
        }

        // Apply status effects
        this.statusEffects = this.statusEffects.filter(effect => {
            if (effect.type === "poison") {
                this.statusTimers[effect] = (this.statusTimers[effect] || 0) + 1;

                if (this.statusTimers[effect] % effect.tickRate === 0) {
                    this.health -= effect.damage;

                    if (this.health <= 0) {
                        if (this.type === "megaBoss") {
                            for (let i = 0; i < 2; i++) {
                                const boss = getEnemy(enemy.path, "boss");
                                boss.x = this.x + Math.random() * 40 - 20;
                                boss.y = this.y + Math.random() * 40 - 20;
                                boss.pathIndex = enemy.pathIndex;
                                enemies.push(boss);
                            }
                        }

                        spawnExplosion(this.x, this.y, 5);
                        releaseEnemy(this); // ✅ Pool this enemy
                        return false; // Don't keep processing this effect
                    }

                    spawnExplosion(this.x, this.y, 5);
                }

                effect.duration--;
                return effect.duration > 0;
            }

            return true;
        });
    }


    draw() {
    // Set base color
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

    // Poison aura
    const isPoisoned = this.statusEffects.some(e => e.type === "poison");
    if (isPoisoned) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, TILE_SIZE * 0.5 + Math.sin(Date.now() / 150) * 2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,255,0,0.15)";
        ctx.fill();
        ctx.restore();
    }

    // Choose radius
    let radius = TILE_SIZE / 5;
    if (this.type === "megaBoss") radius = TILE_SIZE * 0.5;

    // Draw body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Animate health bar
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

/*
function findPath(map) {
    const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    const visited = new Set();
    const path = [];
    let start;

    function isPathTile(tile) {
        return tile === 'P' || tile === 'C'; // Allow curves as part of path
    }

    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            if (isPathTile(map[y][x])) {
                start = { x, y };
                break;
            }
        }
        if (start) break;
    }

    function key(x, y) {
        return `${x},${y}`;
    }

    function dfs(x, y) {
        visited.add(key(x, y));
        path.push({ x: x * TILE_SIZE + TILE_SIZE / 2, y: y * TILE_SIZE + TILE_SIZE / 2 });

        for (let [dx, dy] of dirs) {
            const nx = x + dx, ny = y + dy;
            if (
                ny >= 0 && ny < map.length &&
                nx >= 0 && nx < map[ny].length &&
                isPathTile(map[ny][nx]) &&
                !visited.has(key(nx, ny))
            ) {
                dfs(nx, ny);
                break;
            }
        }
    }

    if (start) dfs(start.x, start.y);
    return path;
}
*/
/*
function findPath(map) {
    const rows = map.length;
    const cols = map[0].length;

    const isPathTile = (x, y) =>
        x >= 0 && y >= 0 && x < cols && y < rows &&
        ['S', 'P', 'C', 'E'].includes(map[y][x]);

    const directions = [
        { dx: 0, dy: -1 }, // up
        { dx: 1, dy: 0 },  // right
        { dx: 0, dy: 1 },  // down
        { dx: -1, dy: 0 }  // left
    ];

    let start = null;
    for (let y = 0; y < rows && !start; y++) {
        for (let x = 0; x < cols; x++) {
            if (map[y][x] === 'S') {
                start = { x, y };
                break;
            }
        }
    }

    if (!start) return [];

    const key = (x, y) => `${x},${y}`;
    let longestPath = [];

    function dfs(x, y, path, visited) {
        const k = key(x, y);
        if (visited.has(k)) return;
        visited.add(k);
        path.push({ x: x * TILE_SIZE + TILE_SIZE / 2, y: y * TILE_SIZE + TILE_SIZE / 2 });

        if (map[y][x] === 'E') {
            if (path.length > longestPath.length) {
                longestPath = [...path];
            }
        } else {
            for (let { dx, dy } of directions) {
                const nx = x + dx;
                const ny = y + dy;
                if (isPathTile(nx, ny)) {
                    dfs(nx, ny, path, new Set(visited));
                }
            }
        }

        path.pop();
    }

    dfs(start.x, start.y, [], new Set());

    return longestPath;
}
*/
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
    enemies.forEach(e => e.draw());
    bullets.forEach(b => b.draw());

    particlePool.drawAll(ctx);

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
        const boxWidth = textWidth + 40;
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
    ctx.font = "14px monospace";
    ctx.fillText(`FPS: ${fps}`, 10, 20);

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
        enemies.push(getEnemy(enemyPath, nextType)); // 🔁 uses enemy pool
        waveTimer = Math.max(10, 30 - wave * 2);

        if (nextType === "boss" || nextType === "megaBoss") {
            bossWarning = {
                text: nextType === "megaBoss" ? "💀 MEGA BOSS INCOMING!" : "⚠ Incoming Boss!",
                time: 90
            };
        }

       
    }
    
    particlePool.updateAll();
    bullets.forEach(b => b.update());
    enemies.forEach(e => e.update());
    towers.forEach(t => t.update(enemies, bullets, gameSpeed));

    bullets = bullets.filter(b => !b.hit);
    enemies = enemies.filter(e => {
        if (e.health <= 0) {
            releaseEnemy(e);
            return false;
        }
        return true;
    });


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
/*
    // Damage numbers
    damageNumbers.forEach(d => {
        d.y -= 0.5;
        d.opacity -= 1 / d.lifetime;
    });
    damageNumbers = damageNumbers.filter(d => d.opacity > 0);
*/
    // Floating messages
    floatingMessages.forEach(msg => {
        msg.y -= 0.5;
        msg.lifetime--;
        msg.opacity = msg.lifetime / 60;
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
    gold = 100;
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



function updateHUD() {
    document.getElementById("goldDisplay").textContent = `💰 ${gold}`;
    document.getElementById("waveDisplay").textContent = `Wave ${wave}`;
    document.getElementById("livesDisplay").textContent = `❤️ ${lives}`;
}

function towerUpgradeCost(tower) {
    const base = towerCosts[tower.type] || 50;
    return Math.floor(base * (0.5 + tower.level * 0.5));
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
    const sellValue = Math.floor((towerCosts[tower.type] || 50) * (0.5 + (tower.level - 1) * 0.25));
    towerActionUI = document.createElement("div");
    towerActionUI.style.position = "absolute";
    towerActionUI.style.left = `${canvasRect.left + tower.x - 80}px`;
    towerActionUI.style.top = `${canvasRect.top + tower.y + TILE_SIZE / 2}px`;
    towerActionUI.style.padding = "6px";
    towerActionUI.style.background = "#222";
    towerActionUI.style.border = "1px solid #888";
    towerActionUI.style.borderRadius = "6px";
    towerActionUI.style.color = "#fff";
    towerActionUI.style.fontFamily = "monospace";
    towerActionUI.style.fontSize = "14px";
    towerActionUI.style.zIndex = "1000";

    const upgradeBtn = document.createElement("button");
    upgradeBtn.textContent = tower.level >= 5 ? `Max Level (${tower.level})` : `Upgrade ($${upgradeCost})`;
    upgradeBtn.disabled = tower.level >= 5;
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

    // Check if user clicked the tower panel (right-hand side)
    const panelWidth = 120;
    const startX = canvas.width - panelWidth;
    if (x >= startX) {
        const index = Math.floor((y - 100) / 70);
        if (towerTypes[index]) {
            selectedTowerType = towerTypes[index];

            // Visually mark it selected
            document.querySelectorAll("#towerPanel button").forEach(b => b.classList.remove("selected"));
            document.querySelector(`#towerPanel button[data-type="${selectedTowerType}"]`)?.classList.add("selected");
        }
        return;
    }

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

    const cost = towerCosts[selectedTowerType];
    if (gold >= cost) {
        const tileX = Math.floor(x / TILE_SIZE);
        const tileY = Math.floor(y / TILE_SIZE);
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


gameLoop();
