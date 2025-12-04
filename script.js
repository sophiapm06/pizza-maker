
// Sophia's Pizzariea — streamlined layout & 90s timer

const toppings = [
  { key: 'cheese', name: 'Cheese', emoji: '\uD83E\uDDC0', min: 1, max: 3 },
  { key: 'pepperoni', name: 'Pepperoni', emoji: '\uD83C\uDF56', min: 0, max: 5 },
  { key: 'mushroom', name: 'Mushroom', emoji: '\uD83C\uDF44', min: 0, max: 4 },
  { key: 'pepper', name: 'Bell Pepper', emoji: '\uD83E\uDED1', min: 0, max: 4 },
  { key: 'onion', name: 'Onion', emoji: '\uD83E\uDDC5', min: 0, max: 3 },
  { key: 'olive', name: 'Olive', emoji: '\uD83E\uDED2', min: 0, max: 6 },
  { key: 'pineapple', name: 'Pineapple', emoji: '\uD83C\uDF4D', min: 0, max: 3 },
];

let required = {};
let placed = [];
let score = 0;
let streak = 0;
let timeLeft = 90;          // 90-second shift
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

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function makeOrder(){
  const req = {}; toppings.forEach(t => req[t.key] = 0);
  req.cheese = rand(1, 3);
  const others = toppings.filter(t => t.key !== 'cheese');
  const howMany = rand(3, 5);
  const chosen = others.slice().sort(() => Math.random() - 0.5).slice(0, howMany);
  chosen.forEach(t => { req[t.key] = rand(t.min, t.max); });
  const notes = ['Make it snappy!', 'Extra tasty please.', 'For a hungry cadet.', 'Keep it balanced.', 'No burnt crust!'];
  return { req, note: pick(notes) };
}

function renderOrder(){
  orderList.innerHTML = '';
  Object.keys(required).forEach(key => {
    const count = required[key];
    const t = toppings.find(x => x.key === key);
    const li = document.createElement('li');
    li.innerHTML = '<span class="emoji">' + t.emoji + '</span> <span class="name">' + t.name + '</span> <span class="count">x ' + count + '</span>';
    orderList.appendChild(li);
  });
}

function renderPalette(){
  toppingListEl.innerHTML = '';
  toppings.forEach(t => {
    const div = document.createElement('div');
    div.className = 'topping';
    div.draggable = true;
    div.dataset.key = t.key;
    div.innerHTML = '<span class="emoji">' + t.emoji + '</span><span class="name">' + t.name + '</span>';
    div.addEventListener('dragstart', ev => ev.dataTransfer.setData('text/plain', t.key));
    div.addEventListener('click', () => {
      const rect = pizzaArea.getBoundingClientRect();
      const x = rand(40, rect.width - 40);
      const y = rand(40, rect.height - 40);
      placeTopping(t.key, x, y);
    });
    toppingListEl.appendChild(div);
  });
}

function placeTopping(key, x, y){
  const rot = rand(-35, 35);
  const span = document.createElement('span');
  span.className = 'topping-placed';
  span.textContent = toppings.find(t => t.key === key).emoji;
  span.style.left = x + 'px';
  span.style.top  = y + 'px';
  span.style.transform = 'rotate(' + rot + 'deg)';
  span.dataset.key = key;
  pizzaArea.appendChild(span);
  placed.push({ key, x, y, rot, el: span });
}

pizzaArea.addEventListener('dragover', ev => ev.preventDefault());
pizzaArea.addEventListener('drop', ev => {
  ev.preventDefault();
  const key = ev.dataTransfer.getData('text/plain');
  const rect = pizzaArea.getBoundingClientRect();
  const x = ev.clientX - rect.left;
  const y = ev.clientY - rect.top;
  placeTopping(key, x, y);
});

function clearPizza(){ placed.forEach(p => p.el.remove()); placed = []; }
function undoLast(){ const last = placed.pop(); if(last && last.el) last.el.remove(); }

function countsByKey(arr){ const map = {}; toppings.forEach(t => map[t.key] = 0); arr.forEach(p => { map[p.key] = (map[p.key] || 0) + 1; }); return map; }

function evaluateOrder(){
  const have = countsByKey(placed);
  let perfect = true; const diffs = [];
  Object.keys(required).forEach(k => {
    const need = required[k]; const got = have[k] || 0;
    if (need !== got){
      perfect = false; const d = got - need; if (d > 0) diffs.push('-' + d + ' ' + k); else if (d < 0) diffs.push('+' + Math.abs(d) + ' ' + k);
    }
  });
  if (perfect){
    const bonus = 100 + streak * 25 + Math.max(0, timeLeft - 60); // slight bonus for speed
    score += bonus; streak += 1; scoreEl.textContent = score; streakEl.textContent = streak;
    feedbackEl.textContent = 'Perfect! +' + bonus + ' points';
    nextOrder();
  } else {
    const penalty = 30;
    streak = 0; score = Math.max(0, score - penalty);
    scoreEl.textContent = score; streakEl.textContent = streak;
    feedbackEl.textContent = 'Not quite: ' + diffs.join(', ') + ' (−' + penalty + ')';
  }
}

function nextOrder(){
  clearPizza(); const o = makeOrder(); required = o.req; renderOrder(); orderNotes.textContent = o.note;
}

function startGame(){
  startScreen.classList.add('hidden'); hud.classList.remove('hidden'); gameEl.classList.remove('hidden');
  score = 0; streak = 0; timeLeft = 90; placed = []; scoreEl.textContent = score; streakEl.textContent = streak; timeEl.textContent = timeLeft;
  renderPalette(); nextOrder(); if (timerId) clearInterval(timerId);
  timerId = setInterval(() => { timeLeft -= 1; timeEl.textContent = timeLeft; if (timeLeft <= 0) endGame(); }, 1000);
}

function endGame(){ if (timerId) clearInterval(timerId); hud.classList.add('hidden'); gameEl.classList.add('hidden'); endScreen.classList.remove('hidden'); finalScoreEl.textContent = score; }

btnPlay.addEventListener('click', startGame);
btnBake.addEventListener('click', evaluateOrder);
btnClear.addEventListener('click', () => { clearPizza(); feedbackEl.textContent = 'Cleared.'; });
btnUndo.addEventListener('click', () => { undoLast(); feedbackEl.textContent = 'Undid last topping.'; });
btnRestart.addEventListener('click', () => { endScreen.classList.add('hidden'); startGame(); });

// Accessibility: keyboard quick add
pizzaArea.tabIndex = 0;
pizzaArea.addEventListener('keydown', (ev) => {
  const keys = { '1':'cheese','2':'pepperoni','3':'mushroom','4':'pepper','5':'onion','6':'olive','7':'pineapple' };
  if (keys[ev.key]){
    const rect = pizzaArea.getBoundingClientRect();
    const x = rand(40, rect.width - 40);
    const y = rand(40, rect.height - 40);
    placeTopping(keys[ev.key], x, y);
  }
});
