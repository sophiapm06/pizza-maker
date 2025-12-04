
// Sophia's Pizzariea — a tiny drag-and-drop pizza game
// No frameworks, pure DOM/JS.

const toppings = [
  { key: 'cheese', name: 'Cheese', emoji: '🧀', min: 1, max: 3 },
  { key: 'pepperoni', name: 'Pepperoni', emoji: '🍖', min: 0, max: 5 },
  { key: 'mushroom', name: 'Mushroom', emoji: '🍄', min: 0, max: 4 },
  { key: 'pepper', name: 'Bell Pepper', emoji: '🫑', min: 0, max: 4 },
  { key: 'onion', name: 'Onion', emoji: '🧅', min: 0, max: 3 },
  { key: 'olive', name: 'Olive', emoji: '🫒', min: 0, max: 6 },
  { key: 'pineapple', name: 'Pineapple', emoji: '🍍', min: 0, max: 3 },
];

// State
let required = {};      // order requirements by topping key
let placed = [];        // { key, x, y, rot }
let score = 0;
let streak = 0;
let timeLeft = 60;
let timerId = null;

// Elements
const startScreen = document.getElementById('startScreen');
const btnPlay = document.getElementById('btnPlay');
const hud = document.getElementById('hud');
const timeEl = document.getElementById('time');
const scoreEl = document.getElementById('score');
const streakEl = document.getElementById('streak');
const gameEl = document.getElementById('game');
const orderList = document.getElementById('orderList');
const orderNotes = document.getElementById('orderNotes');
const pizzaArea = document.getElementById('pizzaArea');
const toppingListEl = document.getElementById('toppingList');
const feedbackEl = document.getElementById('feedback');
const btnUndo = document.getElementById('btnUndo');
const btnBake = document.getElementById('btnBake');
const btnClear = document.getElementById('btnClear');
const endScreen = document.getElementById('endScreen');
const finalScoreEl = document.getElementById('finalScore');
const btnRestart = document.getElementById('btnRestart');

// Util
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function makeOrder() {
  // Base: cheese always appears
  const req = {};
  toppings.forEach(t => req[t.key] = 0);
  req.cheese = rand(1, 3);
  // Randomly choose 3-5 other toppings
  const others = toppings.filter(t => t.key !== 'cheese');
  const howMany = rand(3, 5);
  const chosen = others.slice().sort(() => Math.random() - 0.5).slice(0, howMany);
  chosen.forEach(t => { req[t.key] = rand(t.min, t.max); });
  // Notes
  const notes = [
    'Make it snappy!', 'Extra tasty please.', 'For a hungry cadet.', 'Keep it balanced.', 'No burnt crust!'
  ];
  return { req, note: pick(notes) };
}

function renderOrder() {
  orderList.innerHTML = '';
  Object.keys(required).forEach(key => {
    const count = required[key];
    const t = toppings.find(x => x.key === key);
    const li = document.createElement('li');
    li.innerHTML = '<span class="emoji">' + t.emoji + '</span> <span class="name">' + t.name + '</span> <span class="count">x ' + count + '</span>';
    orderList.appendChild(li);
  });
}

function renderPalette() {
  toppingListEl.innerHTML = '';
  toppings.forEach(t => {
    const div = document.createElement('div');
    div.className = 'topping';
    div.draggable = true;
    div.dataset.key = t.key;
    div.innerHTML = '<span class="emoji">' + t.emoji + '</span><span class="name">' + t.name + '</span>';

    // Drag handlers
    div.addEventListener('dragstart', (ev) => {
      ev.dataTransfer.setData('text/plain', t.key);
    });

    // Click to auto-place
    div.addEventListener('click', () => {
      const rect = pizzaArea.getBoundingClientRect();
      const x = rand(40, rect.width - 40);
      const y = rand(40, rect.height - 40);
      placeTopping(t.key, x, y);
    });

    toppingListEl.appendChild(div);
  });
}

function placeTopping(key, x, y) {
  const rot = rand(-35, 35);
  const span = document.createElement('span');
  span.className = 'topping-placed';
  span.textContent = toppings.find(t => t.key === key).emoji;
  span.style.left = x + 'px';
  span.style.top = y + 'px';
  span.style.transform = 'rotate(' + rot + 'deg)';
  span.dataset.key = key;
  pizzaArea.appendChild(span);
  placed.push({ key: key, x: x, y: y, rot: rot, el: span });
  speakTick();
}

// Drag target
pizzaArea.addEventListener('dragover', (ev) => { ev.preventDefault(); });
pizzaArea.addEventListener('drop', (ev) => {
  ev.preventDefault();
  const key = ev.dataTransfer.getData('text/plain');
  const rect = pizzaArea.getBoundingClientRect();
  const x = ev.clientX - rect.left; // relative to pizza area
  const y = ev.clientY - rect.top;
  placeTopping(key, x, y);
});

function clearPizza() {
  placed.forEach(p => p.el.remove());
  placed = [];
}

function undoLast() {
  const last = placed.pop();
  if (last && last.el) last.el.remove();
}

function countsByKey(arr) {
  const map = {}; toppings.forEach(t => map[t.key] = 0);
  arr.forEach(p => { map[p.key] = (map[p.key] || 0) + 1; });
  return map;
}

function evaluateOrder() {
  const have = countsByKey(placed);
  let perfect = true;
  const diffs = [];
  Object.keys(required).forEach(function(k) {
    const need = required[k];
    const got = have[k] || 0;
    if (need !== got) {
      perfect = false;
      const delta = got - need;
      if (delta > 0) diffs.push('-' + delta + ' ' + k);
      else if (delta < 0) diffs.push('+' + Math.abs(delta) + ' ' + k);
    }
  });

  if (perfect) {
    const bonus = 100 + streak * 25 + Math.max(0, timeLeft - 40);
    score += bonus;
    streak += 1;
    scoreEl.textContent = score;
    streakEl.textContent = streak;
    feedbackEl.textContent = 'Perfect! +' + bonus + ' points';
    confettiBurst();
    nextOrder();
  } else {
    const penalty = 30;
    streak = 0;
    score = Math.max(0, score - penalty);
    scoreEl.textContent = score;
    streakEl.textContent = streak;
    feedbackEl.textContent = 'Not quite: ' + diffs.join(', ') + ' (−' + penalty + ')';
  }
}

function nextOrder() {
  clearPizza();
  const o = makeOrder();
  required = o.req;
  renderOrder();
  orderNotes.textContent = o.note;
}

function startGame() {
  startScreen.classList.add('hidden');
  hud.classList.remove('hidden');
  gameEl.classList.remove('hidden');
  score = 0; streak = 0; timeLeft = 60; placed = [];
  scoreEl.textContent = score; streakEl.textContent = streak; timeEl.textContent = timeLeft;
  renderPalette();
  nextOrder();
  if (timerId) clearInterval(timerId);
  timerId = setInterval(() => {
    timeLeft -= 1; timeEl.textContent = timeLeft;
    if (timeLeft <= 0) endGame();
  }, 1000);
}

function endGame() {
  if (timerId) clearInterval(timerId);
  hud.classList.add('hidden');
  gameEl.classList.add('hidden');
  endScreen.classList.remove('hidden');
  finalScoreEl.textContent = score;
}

btnPlay.addEventListener('click', startGame);
btnBake.addEventListener('click', evaluateOrder);
btnClear.addEventListener('click', () => { clearPizza(); feedbackEl.textContent = 'Cleared.'; });
btnUndo.addEventListener('click', () => { undoLast(); feedbackEl.textContent = 'Undid last topping.'; });
btnRestart.addEventListener('click', () => { endScreen.classList.add('hidden'); startGame(); });

// Simple celebratory confetti
function confettiBurst() {
  const colors = ['#e63946', '#1d3557', '#2a9d8f', '#f4a261', '#e9c46a'];
  const rect = pizzaArea.getBoundingClientRect();
  for (let i = 0; i < 24; i++) {
    const c = document.createElement('div');
    c.className = 'confetti';
    c.style.left = rand(0, rect.width) + 'px';
    c.style.top = rand(0, 40) + 'px';
    c.style.background = pick(colors);
    c.style.transform = 'translateY(-20px) rotate(' + rand(-90,90) + 'deg)';
    pizzaArea.appendChild(c);
    setTimeout(() => c.remove(), 1000);
  }
  speakWin();
}

// Sounds via Web Audio (no external files)
let audioCtx = null;
function ensureAudio() { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
function beep(freq = 880, ms = 80, type = 'sine', vol = 0.05) {
  ensureAudio();
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.value = vol;
  o.connect(g); g.connect(audioCtx.destination);
  o.start();
  setTimeout(() => { o.stop(); }, ms);
}
function speakTick(){ beep(660, 50, 'square', 0.03); }
function speakWin(){ beep(880, 120, 'triangle', 0.05); setTimeout(() => beep(1200, 140, 'triangle', 0.05), 120); }

// Accessibility: keyboard add with focus
pizzaArea.tabIndex = 0;
pizzaArea.addEventListener('keydown', (ev) => {
  const keys = {
    '1': 'cheese', '2': 'pepperoni', '3': 'mushroom', '4': 'pepper', '5': 'onion', '6': 'olive', '7': 'pineapple'
  };
  if (keys[ev.key]) {
    const rect = pizzaArea.getBoundingClientRect();
    placeTopping(keys[ev.key], rand(40, rect.width-40), rand(40, rect.height-40));
  }
});
