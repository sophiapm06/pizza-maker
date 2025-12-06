
// === Intro photo parallax (unchanged) ===
const start = document.getElementById('startScreen');
const img = document.querySelector('.avatar-img');
if (start && img) {
  start.addEventListener('mousemove', (e) => {
    const r = start.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    img.style.transform = `rotate(${x*3}deg) translateY(${y*-6}px)`;
  });
  start.addEventListener('mouseleave', () => { img.style.transform = ''; });
}

// === Screen handles & HUD ===
const startScreen = document.getElementById('startScreen');
const customerScreen = document.getElementById('customerScreen');
const hud = document.getElementById('hud');
const gameEl = document.getElementById('game');
const levelEl = document.getElementById('level');
const timeEl = document.getElementById('time');
const tipsEl = document.getElementById('tips');
const streakEl = document.getElementById('streak');

// Buttons
const btnPlay = document.getElementById('btnPlay');
const btnSpeakOrder = document.getElementById('btnSpeakOrder');
const btnContinue = document.getElementById('btnContinue');
const btnUndo = document.getElementById('btnUndo');
const btnBake = document.getElementById('btnBake');
const btnClear = document.getElementById('btnClear');
const btnRestart = document.getElementById('btnRestart');

// Kitchen nodes
const orderList = document.getElementById('orderList');
const orderNotes = document.getElementById('orderNotes');
const pizzaArea = document.getElementById('pizzaArea');
const toppingListEl = document.getElementById('toppingList');
const feedbackEl = document.getElementById('feedback');

// End screen
const finalTipsEl = document.getElementById('finalTips');
const finalMsgEl  = document.getElementById('finalMsg');

// Customer bubble
const customerBubble = document.getElementById('customerBubble');

// === TOPPINGS (no olives/onions) ===
const masterToppings = [
  { key:'cheese', name:'Cheese', class:'top-cheese', icon:'ico-cheese', min:1, max:3 },
  { key:'pepperoni', name:'Pepperoni', class:'top-pepperoni', icon:'ico-pepperoni', min:2, max:6 },
  { key:'mushroom', name:'Mushroom', class:'top-mushroom', icon:'ico-mushroom', min:2, max:6 },
  { key:'pepper', name:'Bell Pepper', class:'top-pepper', icon:'ico-pepper', min:2, max:6 },
  { key:'pineapple', name:'Pineapple', class:'top-pineapple', icon:'ico-pineapple', min:1, max:4 },
  { key:'ham', name:'Ham', class:'top-ham', icon:'ico-ham', min:1, max:4 },
  { key:'sausage', name:'Sausage', class:'top-sausage', icon:'ico-sausage', min:2, max:7 },
  { key:'tomato', name:'Tomato', class:'top-tomato', icon:'ico-tomato', min:2, max:6 },
  { key:'bacon', name:'Bacon', class:'top-bacon', icon:'ico-bacon', min:2, max:6 },
  { key:'basil', name:'Basil', class:'top-basil', icon:'ico-basil', min:2, max:5 },
  { key:'jalapeno', name:'Jalapeño', class:'top-jalapeno', icon:'ico-jalapeno', min:2, max:6 },
  { key:'corn', name:'Corn', class:'top-corn', icon:'ico-corn', min:2, max:6 },
  { key:'anchovy', name:'Anchovy', class:'top-anchovy', icon:'ico-anchovy', min:1, max:4 },
];

// === LEVEL TIMES UPDATED ===
// Level 1: 60s, Level 2: 30s, Level 3: 15s
const levels = [ { time:60, allow:4 }, { time:30, allow:8 }, { time:15, allow:12 } ];
let levelIdx = 0;
let toppings = [];
let required = {};
let placed = [];
let timeLeft = levels[0].time;
let timerId = null;
let tipsTotal = 0; let matchedPiecesTotal = 0; let neededPiecesTotal = 0; let streak = 0;

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function setupLevel(idx){
  levelIdx = idx; const cfg = levels[idx];
  timeLeft = cfg.time; timeEl.textContent = timeLeft; levelEl.textContent = (idx+1);
  const others = masterToppings.filter(t => t.key !== 'cheese').slice(0, cfg.allow);
  toppings = [ masterToppings.find(t=>t.key==='cheese'), ...others ];
  renderPalette();
}

function makeOrder(){
  const req = {}; toppings.forEach(t => req[t.key] = 0);
  req.cheese = rand(1, 3);
  const nonCheese = toppings.filter(t => t.key !== 'cheese');
  const howMany = rand(Math.min(2, nonCheese.length), Math.min(4, nonCheese.length));
  const chosen = nonCheese.slice().sort(() => Math.random() - 0.5).slice(0, howMany);
  chosen.forEach(t => req[t.key] = rand(t.min, t.max));
  const polite = ['Could I have ', 'May I get ', 'Could you make '];
  const end = [' on my pizza, please?', ' on my pie, please?', ' please.'];
  return { req, opening: pick(polite), ending: pick(end), note: pick(['Make it snappy!','Extra tasty please.','For a hungry cadet.','Keep it balanced.','No burnt crust!']) };
}

function orderToText(req){
  const parts = [];
  Object.keys(req).forEach(k => { const c = req[k]; if (c > 0) { const name = toppings.find(t => t.key === k).name; parts.push(name + ' x' + c); } });
  return parts.length ? parts.join(', ') : 'Cheese only';
}

function renderOrder(){
  orderList.innerHTML = '';
  Object.keys(required).forEach(key => {
    const count = required[key]; const t = toppings.find(x => x.key === key);
    const li = document.createElement('li');
    li.innerHTML = '<span class="name">' + t.name + '</span> <span class="count">x ' + count + '</span>';
    orderList.appendChild(li);
  });
}

function renderPalette(){
  toppingListEl.innerHTML = '';
  toppings.forEach(t => {
    const div = document.createElement('div');
    div.className = 'topping'; div.draggable = true; div.dataset.key = t.key;
    div.innerHTML = `<span class="ico ${t.icon}"></span><span class="name">${t.name}</span>`;
    div.addEventListener('dragstart', ev => ev.dataTransfer.setData('text/plain', t.key));
    div.addEventListener('click', () => quickPlace(t.key));
    toppingListEl.appendChild(div);
  });
}

function quickPlace(key){
  const rect = pizzaArea.getBoundingClientRect();
  const x = rand(40, rect.width - 40); const y = rand(40, rect.height - 40);
  placeTopping(key, x, y);
}

function placeTopping(key, x, y){
  const t = toppings.find(tt => tt.key === key);
  const rot = rand(-25, 25);
  const span = document.createElement('span');
  span.className = 'topping-placed ' + t.class;
  span.style.left = x + 'px'; span.style.top = y + 'px'; span.style.transform = 'rotate(' + rot + 'deg)';
  span.dataset.key = key; pizzaArea.appendChild(span); placed.push({ key, x, y, rot, el: span });
}

pizzaArea.addEventListener('dragover', ev => ev.preventDefault());
pizzaArea.addEventListener('drop', ev => { ev.preventDefault(); const key = ev.dataTransfer.getData('text/plain'); const rect = pizzaArea.getBoundingClientRect(); placeTopping(key, ev.clientX - rect.left, ev.clientY - rect.top); });

function clearPizza(){ placed.forEach(p => p.el.remove()); placed = []; }
function undoLast(){ const last = placed.pop(); if(last && last.el) last.el.remove(); }

function countsByKey(arr){ const map = {}; toppings.forEach(t => map[t.key] = 0); arr.forEach(p => { map[p.key] = (map[p.key] || 0) + 1; }); return map; }

function evaluateOrder(){
  const have = countsByKey(placed);
  let matched = 0, needed = 0, over = 0;
  Object.keys(required).forEach(k => { const need = required[k]; const got = have[k] || 0; matched += Math.min(need, got); needed += need; if (got>need) over += (got-need); });
  const accuracy = needed ? matched/needed : 1; matchedPiecesTotal += matched; neededPiecesTotal += needed;
  let tips = matched - over; if (matched === needed && over === 0) tips += 5; if (tips < 0) tips = 0; tipsTotal += tips; tipsEl.textContent = Math.round(tipsTotal);
  if (matched === needed && over === 0){ streak += 1; feedbackEl.textContent = 'Perfect order! +$' + tips; } else { streak = 0; feedbackEl.textContent = 'Accuracy ' + Math.round(accuracy*100) + '% • Tips +$' + Math.round(tips); }
  streakEl.textContent = streak;
  nextOrderCutscene();
}

function nextOrderCutscene(){ clearPizza(); const o = makeOrder(); required = o.req; setCustomerLine(o); showScreen(gameEl, customerScreen); customerScreen.classList.add('speaking'); speak(customerBubble.textContent); const ms = Math.min(2200, Math.max(1200, customerBubble.textContent.length * 28)); setTimeout(() => { customerScreen.classList.remove('speaking'); continueToKitchen(o); }, ms+150); }

function showScreen(hideEl, showEl){ if (!hideEl.classList.contains('hidden')){ hideEl.classList.add('fade-exit'); setTimeout(() => { hideEl.classList.add('hidden'); hideEl.classList.remove('fade-exit'); showEl.classList.remove('hidden'); showEl.classList.add('fade-enter'); setTimeout(() => showEl.classList.remove('fade-enter'), 360); }, 280); } else { hideEl.classList.add('hidden'); showEl.classList.remove('hidden'); } }
function speak(text){ try { const u = new SpeechSynthesisUtterance(text); u.rate=1.0; u.pitch=1.05; u.lang='en-US'; speechSynthesis.speak(u); } catch(e){} }
function setCustomerLine(order){ customerBubble.textContent = order.opening + orderToText(order.req) + order.ending; }

function continueToKitchen(order){ showScreen(customerScreen, gameEl); hud.classList.remove('hidden'); required = order.req; renderOrder(); orderNotes.textContent = order.note; }

function startFlow(){ setupLevel(0); const first = makeOrder(); setCustomerLine(first); showScreen(startScreen, customerScreen); customerScreen.classList.add('speaking'); speak(customerBubble.textContent); setTimeout(() => customerScreen.classList.remove('speaking'), Math.min(3000, Math.max(1600, customerBubble.textContent.length * 32))); btnContinue.onclick = () => { continueToKitchen(first); if (timerId) clearInterval(timerId); timerId = setInterval(() => { timeLeft -= 1; timeEl.textContent = timeLeft; if (timeLeft <= 0) endLevel(); }, 1000); }; }

function endLevel(){ if (timerId) clearInterval(timerId); timerId = null; if (levelIdx < levels.length - 1){ setupLevel(levelIdx + 1); const o = makeOrder(); setCustomerLine(o); showScreen(gameEl, customerScreen); customerScreen.classList.add('speaking'); speak(customerBubble.textContent); setTimeout(() => { customerScreen.classList.remove('speaking'); continueToKitchen(o); }, 1800); timeLeft = levels[levelIdx].time; timeEl.textContent = timeLeft; timerId = setInterval(() => { timeLeft -= 1; timeEl.textContent = timeLeft; if (timeLeft <= 0) endLevel(); }, 1000); } else { endGame(); } }

function endGame(){ if (timerId) clearInterval(timerId); timerId = null; hud.classList.add('hidden'); gameEl.classList.add('hidden'); document.getElementById('endScreen').classList.remove('hidden'); finalTipsEl.textContent = Math.round(tipsTotal); const avgAcc = neededPiecesTotal ? (matchedPiecesTotal / neededPiecesTotal) : 1; finalMsgEl.textContent = (avgAcc >= 0.7) ? 'they loved their pizzas! PROMOTED' : "they threw up after eating the pizza's YOUR FIRED"; }

// Events
btnPlay.addEventListener('click', startFlow);
btnSpeakOrder.addEventListener('click', () => { speak(customerBubble.textContent); customerScreen.classList.add('speaking'); setTimeout(()=>customerScreen.classList.remove('speaking'), 1600); });
btnBake.addEventListener('click', evaluateOrder);
btnClear.addEventListener('click', () => { clearPizza(); feedbackEl.textContent = 'Cleared.'; });
btnUndo.addEventListener('click', () => { undoLast(); feedbackEl.textContent = 'Undid last topping.'; });
btnRestart.addEventListener('click', () => { document.getElementById('endScreen').classList.add('hidden'); showScreen(document.getElementById('endScreen'), startScreen); required = {}; placed = []; tipsTotal = 0; matchedPiecesTotal = 0; neededPiecesTotal = 0; streak = 0; tipsEl.textContent = 0; streakEl.textContent = 0; setupLevel(0); });

// Keyboard quick add
pizzaArea.tabIndex = 0;
pizzaArea.addEventListener('keydown', (ev) => {
  const keys = { '1':'cheese','2':'pepperoni','3':'mushroom','4':'pepper','5':'pineapple','6':'ham','7':'sausage','8':'tomato','9':'bacon','0':'basil' };
  if (keys[ev.key]){ const rect = pizzaArea.getBoundingClientRect(); placeTopping(keys[ev.key], rand(40, rect.width - 40), rand(40, rect.height - 40)); }
});
