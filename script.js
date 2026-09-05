/* =========================================================
   WILDEN — GAME CORE
   ========================================================= */

/* ==================== CHARACTER DATA ==================== */

const CHARACTERS = {
  wolf: {
    name: "WOLF",
    emoji: "🐺",
    hp: 90,
    description: "AGILE HUNTER",
    attacks: {
      J: 8,
      K: 7,
      I: 0,
      L: 15
    },
    defenseWindow: 0.3,
    knockback: 1
  },

  tiger: {
    name: "TIGER",
    emoji: "🐯",
    hp: 95,
    description: "POWERFUL FIGHTER",
    attacks: {
      J: 9,
      K: 8,
      I: 0,
      L: 12
    },
    defenseWindow: 0.5,
    knockback: 1
  },

  fox: {
    name: "FOX",
    emoji: "🦊",
    hp: 70,
    description: "TRICKSTER FIGHTER",
    attacks: {
      J: 7,
      K: 6,
      I: 1,
      L: 12
    },
    defenseWindow: 0.5,
    knockback: 1.5
  }
};

const CHARACTER_ORDER = ["wolf", "tiger", "fox"];

/* ==================== COMBOS ==================== */

const COMBOS = {
  wolf: [
    {
      input: ["I", "L"],
      name: "Pounce Breaker",
      damage: 17
    },
    {
      input: ["O", "K"],
      name: "Reflection Counter",
      damage: "REFLECT"
    },
    {
      input: ["W", "I", "J"],
      name: "Sky Fang",
      damage: 10
    },
    {
      input: ["W", "I", "K"],
      name: "Sky Claw",
      damage: 9
    }
  ],

  tiger: [
    {
      input: ["J", "J"],
      name: "Double Bite",
      damage: 20
    },
    {
      input: ["J", "K", "J"],
      name: "Savage Chain",
      damage: 30
    }
  ],

  fox: [
    {
      input: ["K", "I", "J"],
      name: "Trickster Rush",
      damage: 16
    },
    {
      input: ["J", "K"],
      name: "Fox Knockback",
      damage: 10,
      knockback: true
    }
  ]
};

/* ==================== ULTIMATES ==================== */

const ULTIMATES = {
  wolf: {
    name: "WOLF HOWL",
    input: ["STILL", "W", "O", "K", "J"],
    cooldown: 30,
    duration: 10
  },

  tiger: {
    name: "TIGER ROAR",
    input: ["J", "J", "K", "J", "J"],
    cooldown: 30
  },

  fox: {
    name: "SHADOW VANISH",
    input: ["S", "I", "K", "J"],
    cooldown: 30,
    duration: 13
  }
};

/* ==================== GAME STATE ==================== */

let account = null;
let guestMode = false;

let selectedCharacter = "wolf";
let showcaseCharacter = "wolf";

let battle = null;

let tutorialPage = 0;

let currentRecord = null;

/* ==================== STORAGE ==================== */

function storageKey() {
  return account ? `wilden_account_${account.username}` : null;
}

function loadAccount(username) {
  const data = localStorage.getItem(`wilden_account_${username}`);

  if (!data) return null;

  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

function saveAccount() {
  if (!account || guestMode) return;

  localStorage.setItem(storageKey(), JSON.stringify(account));
}

function createDefaultAccount(username, email, password) {
  return {
    username,
    email,
    password,
    profile: {
      animal: null,
      level: 1,
      points: 0,
      wins: 0,
      losses: 0
    },
    records: [],
    combos: [],
    settings: {
      volume: 80,
      sfx: true
    }
  };
}

/* ==================== SCREEN CONTROL ==================== */

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });

  const screen = document.getElementById(id);

  if (screen) {
    screen.classList.add("active");
  }
}

/* ==================== LOGIN ==================== */

function login() {
  const username = document.getElementById("usernameInput").value.trim();
  const password = document.getElementById("passwordInput").value;

  const message = document.getElementById("loginMessage");

  if (!username || !password) {
    message.textContent = "ENTER YOUR USERNAME AND PASSWORD.";
    return;
  }

  const saved = loadAccount(username);

  if (!saved) {
    message.textContent = "ACCOUNT NOT FOUND.";
    return;
  }

  if (saved.password !== password) {
    message.textContent = "INCORRECT PASSWORD.";
    return;
  }

  account = saved;
  guestMode = false;

  enterGame();
}

function showSignup() {
  showScreen("signupScreen");
}

function signup() {
  const username = document.getElementById("signupUsername").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;

  const message = document.getElementById("signupMessage");

  if (!username || !email || !password) {
    message.textContent = "COMPLETE ALL FIELDS.";
    return;
  }

  if (loadAccount(username)) {
    message.textContent = "USERNAME ALREADY EXISTS.";
    return;
  }

  account = createDefaultAccount(username, email, password);
  guestMode = false;

  saveAccount();
  enterGame();
}

function guestLogin() {
  account = {
    username: "GUEST",
    profile: {
      animal: null,
      level: 1,
      points: 0,
      wins: 0,
      losses: 0
    },
    records: [],
    combos: [],
    settings: {
      volume: 80,
      sfx: true
    }
  };

  guestMode = true;

  enterGame();
}

function logout() {
  account = null;
  guestMode = false;

  document.getElementById("usernameInput").value = "";
  document.getElementById("passwordInput").value = "";

  showScreen("loginScreen");
}

/* ==================== GAME ENTRY ==================== */

function enterGame() {
  if (!account.profile.animal) {
    showScreen("newGameScreen");
  } else {
    openMainMenu();
  }
}

/* ==================== CHARACTER SHOWCASE ==================== */

function startCharacterShowcase() {
  showcaseCharacter = "wolf";
  document.querySelectorAll(".character-card").forEach(card => {
    card.classList.remove("selected");
  });

  document
    .querySelector('.character-card[data-animal="wolf"]')
    .classList.add("selected");

  showScreen("showcaseScreen");
}

function previewCharacter(animal) {
  showcaseCharacter = animal;

  document.querySelectorAll(".character-card").forEach(card => {
    card.classList.remove("selected");
  });

  const card = document.querySelector(
    `.character-card[data-animal="${animal}"]`
  );

  if (card) card.classList.add("selected");
}

function openCharacterSelection() {
  selectedCharacter = showcaseCharacter;
  updateCharacterSelection();
  showScreen("characterScreen");
}

function cycleCharacter(direction) {
  let index = CHARACTER_ORDER.indexOf(selectedCharacter);

  index += direction;

  if (index < 0) {
    index = CHARACTER_ORDER.length - 1;
  }

  if (index >= CHARACTER_ORDER.length) {
    index = 0;
  }

  selectedCharacter = CHARACTER_ORDER[index];

  updateCharacterSelection();
}

function updateCharacterSelection() {
  const data = CHARACTERS[selectedCharacter];

  document.getElementById("selectionName").textContent = data.name;
  document.getElementById("selectionAnimal").textContent = data.emoji;
  document.getElementById("selectionDescription").textContent =
    data.description;
}

function confirmCharacter() {
  account.profile.animal = selectedCharacter;

  saveAccount();

  startTutorial();
}

/* ==================== TUTORIAL ==================== */

function startTutorial() {
  tutorialPage = 0;
  updateTutorial();
  showScreen("tutorialScreen");
}

function updateTutorial() {
  const steps = document.querySelectorAll(".tutorial-step");

  steps.forEach((step, index) => {
    step.classList.toggle("active", index === tutorialPage);
  });

  document.getElementById("tutorialPage").textContent =
    `${tutorialPage + 1} / ${steps.length}`;
}

function tutorialPrevious() {
  if (tutorialPage > 0) {
    tutorialPage--;
    updateTutorial();
  }
}

function tutorialNext() {
  const total = document.querySelectorAll(".tutorial-step").length;

  if (tutorialPage < total - 1) {
    tutorialPage++;
    updateTutorial();
    return;
  }

  startFirstBattle();
}

function startFirstBattle() {
  startAIBattle(true);
}

/* ==================== MAIN MENU ==================== */

function openMainMenu() {
  document.getElementById("menuUsername").textContent =
    guestMode ? "GUEST MODE — PROGRESS NOT SAVED" : account.username;

  showScreen("menuScreen");
}

function openCharacters() {
  updateCharacterDisplay();
  showScreen("charactersScreen");
}

function updateCharacterDisplay() {
  const animal = account.profile.animal;
  const data = CHARACTERS[animal];

  document.getElementById("characterDisplayEmoji").textContent = data.emoji;
  document.getElementById("characterDisplayName").textContent = data.name;
}

/* ==================== PVP ==================== */

function openPvpMenu() {
  updateProfileUI();
  showScreen("pvpMenuScreen");
}

function findPvPMatch() {
  /*
    Foundation version:
    A real online matchmaking backend will replace this
    simulated opponent later.
  */

  showVS("pvp");
}

/* ==================== VS SCREEN ==================== */

function showVS(mode = "ai", opponent = null) {
  const playerAnimal = account.profile.animal;

  let opponentAnimal;

  if (opponent) {
    opponentAnimal = opponent;
  } else {
    const available = CHARACTER_ORDER.filter(a => a !== playerAnimal);
    opponentAnimal = available[
      Math.floor(Math.random() * available.length)
    ];
  }

  battle = {
    mode,
    opponentAnimal
  };

  const player = CHARACTERS[playerAnimal];
  const enemy = CHARACTERS[opponentAnimal];

  document.getElementById("vsPlayerAnimal").textContent = player.emoji;
  document.getElementById("vsPlayerName").textContent = player.name;

  document.getElementById("vsOpponentAnimal").textContent = enemy.emoji;
  document.getElementById("vsOpponentName").textContent = enemy.name;

  document.getElementById("vsText").style.display = "block";
  document.getElementById("readyText").style.display = "none";
  document.getElementById("fightText").style.display = "none";

  showScreen("vsScreen");

  setTimeout(() => {
    document.getElementById("vsText").style.display = "none";
    document.getElementById("readyText").style.display = "block";
  }, 700);

  setTimeout(() => {
    document.getElementById("readyText").style.display = "none";
    document.getElementById("fightText").style.display = "block";
  }, 1600);

  setTimeout(() => {
    document.getElementById("fightText").style.display = "none";
    initializeBattle(mode, opponentAnimal);
  }, 2400);
}

/* ==================== BATTLE START ==================== */

function startAIBattle(fromTutorial = false) {
  showVS("ai");

  if (fromTutorial) {
    battle = battle || {};
    battle.fromTutorial = true;
  }
}

function initializeBattle(mode, opponentAnimal) {
  const playerAnimal = account.profile.animal;

  const playerData = CHARACTERS[playerAnimal];
  const enemyData = CHARACTERS[opponentAnimal];

  battle = {
    ...battle,

    mode,
    playerAnimal,
    opponentAnimal,

    playerHp: playerData.hp,
    opponentHp: enemyData.hp,

    playerMaxHp: playerData.hp,
    opponentMaxHp: enemyData.hp,

    playerX: 18,
    opponentX: 72,

    playerY: 0,
    opponentY: 0,

    playerDirection: 1,
    opponentDirection: -1,

    startTime: Date.now(),
    paused: false,
    finished: false,

    damageDealt: 0,
    combosUsed: 0,

    comboBuffer: [],
    comboTimes: [],

    lastAction: null,
    lastActionTime: 0,

    comboCooldowns: {},
    ultimateCooldown: 0,

    defending: false,
    dodgeUntil: 0,

    keys: {},

    aiTimer: null
  };

  updateBattleUI();

  setFighterEmoji(
    "playerFighter",
    playerData.emoji
  );

  setFighterEmoji(
    "opponentFighter",
    enemyData.emoji
  );

  showScreen("battleScreen");

  document.addEventListener("keydown", handleBattleKey);
  document.addEventListener("keyup", handleBattleKeyUp);

  startBattleLoop();
}

/* ==================== BATTLE LOOP ==================== */

function startBattleLoop() {
  if (battle.aiTimer) {
    clearInterval(battle.aiTimer);
  }

  battle.aiTimer = setInterval(aiAction, 850);

  requestAnimationFrame(battleLoop);
}

function battleLoop() {
  if (!battle || battle.finished) return;

  if (!battle.paused) {
    updateMovement();
    updateUltimateCooldown();
  }

  requestAnimationFrame(battleLoop);
}

/* ==================== INPUT ==================== */

function handleBattleKey(event) {
  if (!battle || battle.finished || battle.paused) return;

  const key = event.key.toUpperCase();

  if (
    [
      "A",
      "D",
      "W",
      "S",
      "J",
      "K",
      "I",
      "L",
      "O"
    ].includes(key) ||
    event.code === "Space"
  ) {
    event.preventDefault();
  }

  if (event.repeat && ["J", "K", "I", "L", "O"].includes(key)) {
    return;
  }

  battle.keys[key] = true;

  if (event.code === "Space") {
    performDash();
    return;
  }

  if (key === "A" || key === "D") {
    return;
  }

  if (key === "W") {
    performAction("W");
    return;
  }

  if (key === "S") {
    return;
  }

  if (key === "J") {
    performAction("J");
    return;
  }

  if (key === "K") {
    performAction("K");
    return;
  }

  if (key === "I") {
    performAction("I");
    return;
  }

  if (key === "L") {
    performAction("L");
    return;
  }

  if (key === "O") {
    performDefense();
  }
}

function handleBattleKeyUp(event) {
  if (!battle) return;

  const key = event.key.toUpperCase();
  battle.keys[key] = false;
}

/* ==================== MOVEMENT ==================== */

function updateMovement() {
  if (!battle) return;

  let moved = false;

  if (battle.keys.A) {
    battle.playerX -= 0.75;
    battle.playerDirection = -1;
    moved = true;
  }

  if (battle.keys.D) {
    battle.playerX += 0.75;
    battle.playerDirection = 1;
    moved = true;
  }

  battle.playerX = clamp(battle.playerX, 5, 90);

  const player = document.getElementById("playerFighter");

  player.style.left = `${battle.playerX}%`;

  if (moved) {
    player.style.transform =
      battle.playerDirection === -1 ? "scaleX(-1)" : "scaleX(1)";
  }

  if (battle.playerY > 0) {
    battle.playerY -= 1.4;

    if (battle.playerY <= 0) {
      battle.playerY = 0;
    }

    player.style.bottom = `${22 + battle.playerY}%`;
  }
}

/* ==================== ACTIONS ==================== */

function performAction(action) {
  if (!battle || battle.finished) return;

  if (action === "W") {
    if (battle.playerY === 0) {
      battle.playerY = 18;
      recordInput("W");
    }

    return;
  }

  const now = Date.now();

  if (
    battle.lastAction &&
    now - battle.lastActionTime <= 1000
  ) {
    battle.comboBuffer.push(action);
  } else {
    battle.comboBuffer = [action];
  }

  battle.lastAction = action;
  battle.lastActionTime = now;

  ordinaryAttack(action);

  checkCombos();
}

function ordinaryAttack(action) {
  if (!["J", "K", "I", "L"].includes(action)) return;

  const data = CHARACTERS[battle.playerAnimal];

  animateFighter("playerFighter", "attack-animation");

  const distance = Math.abs(
    battle.playerX - battle.opponentX
  );

  let range = 8;

  if (action === "K") range = 13;
  if (action === "I") range = 28;
  if (action === "L") range = 9;

  if (distance <= range) {
    const damage = data.attacks[action];

    if (damage > 0) {
      dealDamageToOpponent(damage, data.knockback);
    }
  }
}

function dealDamageToOpponent(damage, knockback = 1) {
  if (!battle || battle.finished) return;

  if (
  battle.playerInvulnerableUntil &&
  battle.playerInvulnerableUntil > Date.now()
) {
  return;
}

  battle.opponentHp -= damage;
  battle.damageDealt += damage;

  applyHitAnimation("opponentFighter");

  battle.opponentX +=
    battle.playerDirection * 2.2 * knockback;

  battle.opponentX = clamp(
    battle.opponentX,
    5,
    90
  );

  updateBattleUI();

  if (battle.opponentHp <= 0) {
    finishBattle(true);
  }
}

function dealDamageToPlayer(damage, knockback = 1) {
  if (!battle || battle.finished) return;

  if (battle.playerInvulnerableUntil > Date.now()) {
    return;
  }

  if (battle.defending) {
    return;
  }

  battle.playerHp -= damage;

  applyHitAnimation("playerFighter");

  battle.playerX +=
    battle.opponentDirection * 2.2 * knockback;

  battle.playerX = clamp(
    battle.playerX,
    5,
    90
  );

  updateBattleUI();

  if (battle.playerHp <= 0) {
    finishBattle(false);
  }
}

/* ==================== DEFENSE ==================== */

function performDefense() {
  if (!battle || battle.finished) return;

  if (battle.playerY > 0) {
    return;
  }

  battle.defending = true;

  recordInput("O");

  setTimeout(() => {
    if (battle) {
      battle.defending = false;
    }
  }, 350);
}

function tryWolfReflection(opponentDamage) {
  if (battle.playerAnimal !== "wolf") return;

  if (!battle.defending) return;

  dealDamageToOpponent(opponentDamage);

  recordCombo(["O", "K"], "Reflection Counter", opponentDamage);
}

/* ==================== DODGE ==================== */

function performDodge(direction) {
  if (!battle || battle.finished) return;

  battle.playerInvulnerableUntil =
    Date.now() + 400;

  battle.playerX += direction * 7;

  battle.playerX = clamp(
    battle.playerX,
    5,
    90
  );

  updateBattleUI();
}

/* ==================== DASH ==================== */

function performDash() {
  if (!battle || battle.finished) return;

  const direction =
    battle.playerDirection || 1;

  battle.playerInvulnerableUntil =
    Date.now() + 180;

  battle.playerX += direction * 9;

  battle.playerX = clamp(
    battle.playerX,
    5,
    90
  );

  updateBattleUI();
}

/* ==================== COMBOS ==================== */

function checkCombos() {
  const animal = battle.playerAnimal;
  const available = COMBOS[animal];

  if (!available) return;

  for (const combo of available) {
    const input = combo.input;

    if (battle.comboBuffer.length < input.length) {
      continue;
    }

    const recent = battle.comboBuffer.slice(
      -input.length
    );

    if (!arraysEqual(recent, input)) {
      continue;
    }

    if (isComboCooling(combo.name)) {
      showCooldown();
      battle.comboBuffer = [];
      return;
    }

    startCombo(combo);

    battle.comboBuffer = [];
    return;
  }
}

function startCombo(combo) {
  battle.combosUsed++;

  battle.comboCooldowns[combo.name] =
    Date.now() + 7000;

  comboAnimation(combo);
}

function comboAnimation(combo) {
  const feedback = document.getElementById("comboFeedback");

  document.getElementById("comboName").textContent =
    combo.name;

  const damage =
    combo.damage === "REFLECT"
      ? 0
      : combo.damage;

  document.getElementById("comboDamage").textContent =
    `${damage} DAMAGE`;

  feedback.classList.remove("show");

  void feedback.offsetWidth;

  feedback.classList.add("show");

  /*
    Foundation animation:
    In the final combat engine this becomes a full
    locked cinematic sequence.
  */

  const duration =
    combo.input.length === 2
      ? 850
      : combo.input.length === 3
        ? 1150
        : 1450;

  battle.comboLocked = true;

  setTimeout(() => {
    if (!battle || battle.finished) return;

    if (combo.damage === "REFLECT") {
      return;
    }

    if (combo.damage > 0) {
      dealDamageToOpponent(
        combo.damage,
        combo.knockback ? 2 : 1
      );
    }

    discoverCombo(combo);

    setTimeout(() => {
      if (battle) {
        battle.comboLocked = false;
      }
    }, 500);

  }, duration);
}

function recordCombo(input, name, damage) {
  battle.combosUsed++;

  discoverCombo({
    input,
    name,
    damage
  });
}

function discoverCombo(combo) {
  if (guestMode) return;

  const exists = account.combos.some(
    saved => saved.name === combo.name
  );

  if (!exists) {
    account.combos.push({
      name: combo.name,
      input: combo.input,
      damage: combo.damage
    });

    saveAccount();
  }
}

function isComboCooling(name) {
  return (
    battle.comboCooldowns[name] &&
    battle.comboCooldowns[name] > Date.now()
  );
}

function showCooldown() {
  const element =
    document.getElementById("cooldownMessage");

  element.classList.remove("show");

  void element.offsetWidth;

  element.classList.add("show");
}

/* ==================== INPUT RECORDING ==================== */

function recordInput(input) {
  if (!battle) return;

  battle.lastRecordedInput = input;
}

/* ==================== ULTIMATE ==================== */

function attemptUltimate() {
  /*
    Foundation hook.
    The final input recognizer will use the exact
    character-specific sequences.
  */
}

function useWolfUltimate() {
  if (!canUseUltimate()) return;

  battle.ultimateCooldown =
    Date.now() + 30000;

  battle.ultimateActiveUntil =
    Date.now() + 10000;

  battle.wolfUltimate = true;

  showUltimateFeedback("WOLF HOWL");

  setTimeout(() => {
    if (battle) {
      battle.wolfUltimate = false;
    }
  }, 10000);
}

function useTigerUltimate() {
  if (!canUseUltimate()) return;

  battle.ultimateCooldown =
    Date.now() + 30000;

  showUltimateFeedback("TIGER ROAR");

  dealDamageToOpponent(30, 2);
}

function useFoxUltimate() {
  if (!canUseUltimate()) return;

  battle.ultimateCooldown =
    Date.now() + 30000;

  battle.foxInvisibleUntil =
    Date.now() + 13000;

  showUltimateFeedback("SHADOW VANISH");

  setTimeout(() => {
    if (battle) {
      battle.foxInvisibleUntil = 0;
    }
  }, 13000);
}

function canUseUltimate() {
  if (!battle || battle.finished) return false;

  if (battle.playerY > 0) return false;

  return !battle.ultimateCooldown ||
    battle.ultimateCooldown <= Date.now();
}

function showUltimateFeedback(name) {
  const feedback =
    document.getElementById("comboFeedback");

  document.getElementById("comboName").textContent =
    name;

  document.getElementById("comboDamage").textContent =
    "ULTIMATE";

  feedback.classList.remove("show");

  void feedback.offsetWidth;

  feedback.classList.add("show");
}

function updateUltimateCooldown() {
  if (!battle) return;

  const ready =
    !battle.ultimateCooldown ||
    battle.ultimateCooldown <= Date.now();

  document.getElementById("playerUltimate").textContent =
    ready
      ? "ULTIMATE READY"
      : `ULTIMATE ${Math.ceil(
          (battle.ultimateCooldown - Date.now()) / 1000
        )}s`;
}

/* ==================== AI ==================== */

function aiAction() {
  if (
    !battle ||
    battle.finished ||
    battle.paused ||
    battle.comboLocked
  ) {
    return;
  }

  const distance = Math.abs(
    battle.playerX - battle.opponentX
  );

  const enemy = CHARACTERS[battle.opponentAnimal];

  /*
    Basic AI:
    move closer, then attack.
  */

  if (distance > 12) {
    const direction =
      battle.playerX > battle.opponentX
        ? 1
        : -1;

    battle.opponentX += direction * 3;
    battle.opponentDirection = direction;

    battle.opponentX =
      clamp(battle.opponentX, 5, 90);

    updateBattleUI();
    return;
  }

  const actions = ["J", "K", "L"];

  if (Math.random() < 0.18) {
    aiDefend();
    return;
  }

  const action =
    actions[Math.floor(Math.random() * actions.length)];

  aiAttack(action);
}

function aiAttack(action) {
  if (!battle || battle.finished) return;

  const enemy = CHARACTERS[battle.opponentAnimal];

  animateFighter(
    "opponentFighter",
    "attack-animation"
  );

  const distance = Math.abs(
    battle.playerX - battle.opponentX
  );

  let range = 8;

  if (action === "K") range = 13;
  if (action === "I") range = 28;

  if (distance <= range) {
    let damage = enemy.attacks[action];

    if (damage > 0) {
      if (
        battle.playerAnimal === "wolf" &&
        battle.defending
      ) {
        tryWolfReflection(damage);
        return;
      }

      dealDamageToPlayer(
        damage,
        enemy.knockback
      );
    }
  }
}

function aiDefend() {
  if (!battle) return;

  battle.aiDefendingUntil =
    Date.now() + 350;
}

/* ==================== BATTLE UI ==================== */

function updateBattleUI() {
  if (!battle) return;

  const playerData =
    CHARACTERS[battle.playerAnimal];

  const enemyData =
    CHARACTERS[battle.opponentAnimal];

  const playerPercent =
    Math.max(
      0,
      battle.playerHp / battle.playerMaxHp * 100
    );

  const enemyPercent =
    Math.max(
      0,
      battle.opponentHp / battle.opponentMaxHp * 100
    );

  document.getElementById("playerHpBar").style.width =
    `${playerPercent}%`;

  document.getElementById("opponentHpBar").style.width =
    `${enemyPercent}%`;

  document.getElementById("playerHpText").textContent =
    `${Math.max(0, Math.ceil(battle.playerHp))} / ${battle.playerMaxHp}`;

  document.getElementById("opponentHpText").textContent =
    `${Math.max(0, Math.ceil(battle.opponentHp))} / ${battle.opponentMaxHp}`;

  document.getElementById("playerBattleName").textContent =
    playerData.name;

  document.getElementById("opponentBattleName").textContent =
    enemyData.name;

  document.getElementById("playerBattleLevel").textContent =
    `LV. ${account.profile.level}`;

  document.getElementById("playerFighter").style.left =
    `${battle.playerX}%`;

  document.getElementById("opponentFighter").style.left =
    `${battle.opponentX}%`;

  updateUltimateCooldown();
}

/* ==================== HIT EFFECT ==================== */

function applyHitAnimation(id) {
  const fighter = document.getElementById(id);

  fighter.classList.remove("hit");

  void fighter.offsetWidth;

  fighter.classList.add("hit");
}

function animateFighter(id, animationClass) {
  const fighter = document.getElementById(id);

  fighter.classList.remove(animationClass);

  void fighter.offsetWidth;

  fighter.classList.add(animationClass);
}

function setFighterEmoji(id, emoji) {
  const fighter = document.getElementById(id);

  const element =
    fighter.querySelector(".fighter-emoji");

  element.textContent = emoji;
}

/* ==================== BATTLE END ==================== */

function finishBattle(playerWon) {
  if (!battle || battle.finished) return;

  battle.finished = true;

  if (battle.aiTimer) {
    clearInterval(battle.aiTimer);
  }

  document.removeEventListener("keydown", handleBattleKey);
  document.removeEventListener("keyup", handleBattleKeyUp);

  const timeSeconds =
    Math.floor(
      (Date.now() - battle.startTime) / 1000
    );

  const progressGain =
    playerWon
      ? battle.mode === "pvp"
        ? 20
        : 10
      : 0;

  const record = {
    result: playerWon ? "VICTORY" : "DEFEATED",
    mode: battle.mode === "pvp"
      ? "VS PLAYER"
      : "VS AI",
    opponent:
      battle.mode === "pvp"
        ? CHARACTERS[battle.opponentAnimal].name
        : null,
    damage: battle.damageDealt,
    combos: battle.combosUsed,
    time: timeSeconds,
    date: new Date().toLocaleString(),
    progress: progressGain
  };

  currentRecord = record;

  if (playerWon) {
    account.profile.wins++;
    addProgress(progressGain);
  } else {
    account.profile.losses++;
  }

  if (!guestMode) {
    account.records.unshift(record);

    if (account.records.length > 10) {
      account.records =
        account.records.slice(0, 10);
    }

    saveAccount();
  }

  setTimeout(() => {
    showResults(record);
  }, 900);
}

/* ==================== PROGRESSION ==================== */

function addProgress(points) {
  account.profile.points += points;

  while (account.profile.points >= 100) {
    account.profile.points -= 100;
    account.profile.level++;
  }
}

/* ==================== RESULTS ==================== */

function showResults(record) {
  document.getElementById("resultTitle").textContent =
    record.result === "VICTORY"
      ? "VICTORY!"
      : "DEFEATED";

  document.getElementById("resultTitle").style.color =
    record.result === "VICTORY"
      ? "#76e08b"
      : "#ff7777";

  document.getElementById("resultDamage").textContent =
    record.damage;

  document.getElementById("resultCombos").textContent =
    record.combos;

  document.getElementById("resultTime").textContent =
    formatTime(record.time);

  document.getElementById("resultProgress").textContent =
    record.progress > 0
      ? `+${record.progress}`
      : "+0";

  showScreen("resultsScreen");
}

function continueFromResults() {
  if (battle && battle.fromTutorial) {
    battle.fromTutorial = false;
  }

  openMainMenu();
}

/* ==================== PROFILE ==================== */

function openProfile() {
  updateProfileUI();
  showScreen("profileScreen");
}

function updateProfileUI() {
  const profile = account.profile;
  const animal = profile.animal;

  document.getElementById("profileUsername").textContent =
    account.username;

  document.getElementById("profileLevel").textContent =
    `LV. ${profile.level}`;

  document.getElementById("profilePoints").textContent =
    `${profile.points} / 100`;

  document.getElementById("profileWins").textContent =
    profile.wins;

  document.getElementById("profileLosses").textContent =
    profile.losses;

  document.getElementById("profileProgressBar").style.width =
    `${profile.points}%`;

  if (animal && CHARACTERS[animal]) {
    document.getElementById("profileAnimal").textContent =
      CHARACTERS[animal].emoji;
  }

  document.getElementById("pvpLevel").textContent =
    `LV. ${profile.level}`;
}

/* ==================== BATTLE RECORDS ==================== */

function openBattleRecords() {
  renderRecords();
  showScreen("recordsScreen");
}

function renderRecords() {
  const list =
    document.getElementById("recordsList");

  list.innerHTML = "";

  if (guestMode || account.records.length === 0) {
    list.innerHTML = `
      <div class="subtitle">
        NO BATTLE RECORDS.
      </div>
    `;
    return;
  }

  account.records.forEach((record, index) => {
    const item = document.createElement("div");

    item.className = "record-item";

    item.innerHTML = `
      <div class="record-result ${
        record.result === "VICTORY"
          ? "win"
          : "loss"
      }">
        ${record.result === "VICTORY" ? "W" : "L"}
      </div>

      <div>
        <strong>${record.result}</strong>
        <div class="record-type">
          ${record.mode}
          ${
            record.opponent
              ? ` — ${record.opponent}`
              : ""
          }
        </div>
      </div>

      <div class="record-date">
        ${record.date}
      </div>
    `;

    item.onclick = () =>
      openRecordDetail(index);

    list.appendChild(item);
  });
}

function openRecordDetail(index) {
  const record = account.records[index];

  if (!record) return;

  currentRecord = record;

  document.getElementById("detailResult").textContent =
    record.result === "VICTORY"
      ? "VICTORY!"
      : "DEFEATED";

  const detail =
    document.getElementById("recordDetail");

  detail.innerHTML = `
    <div class="detail-row">
      <span>MODE</span>
      <strong>${record.mode}</strong>
    </div>

    ${
      record.opponent
        ? `
          <div class="detail-row">
            <span>OPPONENT</span>
            <strong>${record.opponent}</strong>
          </div>
        `
        : ""
    }

    <div class="detail-row">
      <span>DAMAGE DEALT</span>
      <strong>${record.damage}</strong>
    </div>

    <div class="detail-row">
      <span>COMBOS USED</span>
      <strong>${record.combos}</strong>
    </div>

    <div class="detail-row">
      <span>BATTLE TIME</span>
      <strong>${formatTime(record.time)}</strong>
    </div>

    <div class="detail-row">
      <span>BEAST KING PROGRESS</span>
      <strong>+${record.progress}</strong>
    </div>

    <div class="detail-row">
      <span>DATE</span>
      <strong>${record.date}</strong>
    </div>
  `;

  showScreen("recordDetailScreen");
}

/* ==================== SETTINGS ==================== */

function openSettings() {
  const settings =
    account.settings || {
      volume: 80,
      sfx: true
    };

  document.getElementById("volumeSetting").value =
    settings.volume;

  document.getElementById("sfxSetting").checked =
    settings.sfx;

  showScreen("settingsScreen");
}

function saveSettings() {
  if (!account) return;

  account.settings = {
    volume:
      Number(
        document.getElementById("volumeSetting").value
      ),
    sfx:
      document.getElementById("sfxSetting").checked
  };

  saveAccount();
}

/* ==================== PAUSE ==================== */

function pauseBattle() {
  if (!battle || battle.finished) return;

  if (battle.mode === "pvp") {
    return;
  }

  battle.paused = true;

  document
    .getElementById("pauseOverlay")
    .classList.add("active");
}

function resumeBattle() {
  if (!battle) return;

  battle.paused = false;

  document
    .getElementById("pauseOverlay")
    .classList.remove("active");
}

function exitBattle() {
  if (!battle) return;

  const confirmed =
    confirm("EXIT BATTLE?");

  if (!confirmed) return;

  battle.finished = true;

  if (battle.aiTimer) {
    clearInterval(battle.aiTimer);
  }

  openMainMenu();
}

/* ==================== SHADOW HUNTER ==================== */

function openShadowHunter() {
  const animal = account.profile.animal;

  document.getElementById("shadowAnimal").textContent =
    CHARACTERS[animal].emoji;

  document.getElementById("shadowText").textContent =
    `Your own ${CHARACTERS[animal].name.toLowerCase()} shadow has awakened.`;

  showScreen("shadowScreen");
}

function startShadowBattle() {
  showVS("shadow");
}

/* ==================== UTILITY ==================== */

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;

  return a.every(
    (value, index) => value === b[index]
  );
}

function formatTime(seconds) {
  const mins =
    Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");

  const secs =
    (seconds % 60)
      .toString()
      .padStart(2, "0");

  return `${mins}:${secs}`;
}

/* ==================== INITIAL STATE ==================== */

document.addEventListener("DOMContentLoaded", () => {
  showScreen("loginScreen");
});
