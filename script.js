
// Basic pizza-making game logic
const scoreEl = document.getElementById('score');
const timeEl = document.getElementById('time');
const orderList = document.getElementById('orderList');
const newOrderBtn = document.getElementById('newOrderBtn');
const bakeBtn = document.getElementById('bakeBtn');
const undoBtn = document.getElementById('undoBtn');
const clearBtn = document.getElementById('clearBtn');
const restartBtn = document.getElementById('restartBtn');
const pizzaArea = document.getElementById('pizzaArea');
const palette = document.getElementById('palette');
const toast = document.getElementById('toast');

const INGREDIENTS = [
  { key: 'cheese', label: 'Cheese', color: '#ffd84e' },
  { key: 'pepperoni', label: 'Pepperoni', color: '#b12626' },
  { key: 'mushroom', label: 'Mushrooms', color: '#c9b097' },
  { key: 'olive', label: 'Olives', color: '#141414' },
  { key: 'pepper', label: 'Peppers', color: '#2ecc71' },
  { key: 'onion', label: 'Onions', color: '#a064c4' },
];

let score = 0;
let time = 60; // seconds
let timerId = null;
let currentOrder = [];
let placed = []; // stack of placed topping elements

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1500);
}

function formatOrder(order) {
  return order.map(k => INGREDIENTS.find(i => i.key === k).label);
}

function randomOrder() {
  // Always include cheese; plus 2-4 random toppings
  const keys = INGREDIENTS.map(i => i.key);
  const extraKeys = keys.filter(k => k !== 'cheese');
  const count = Math.floor(Math.random() * 3) + 2; // 2..4
  const order = new Set(['cheese']);
  while (order.size < count + 1) {
    order.add(extraKeys[Math.floor(Math.random() * extraKeys.length)]);
  }
  return Array.from(order);
}

function renderOrder() {
  orderList.innerHTML = '';
  formatOrder(currentOrder).forEach(label => {
    const li = document.createElement('li');
    li.textContent = label;
    orderList.appendChild(li);
  });
}

function startTimer() {
  clearInterval(timerId);
  time = 60;
  timeEl.textContent = time;
  timerId = setInterval(() => {
    time--;
    timeEl.textContent = time;
    if (time <= 0) {
      clearInterval(timerId);
      gameOver();
    }
  }, 1000);
}

function gameOver() {
  bakeBtn.disabled = true;
  newOrderBtn.disabled = true;
  showToast(`Time! Final score: ${score}`);
}

function resetBoard() {
  placed.forEach(el => el.remove());
  placed = [];
}

function undoLast() {
  const el = placed.pop();
  if (el) el.remove();
}

function addTopping(type, x, y) {
  // Clamp within pizza area
  const rect = pizzaArea.getBoundingClientRect();
  const size = 28;
  const px = Math.min(Math.max(x - rect.left - size/2, 6), rect.width - size - 6);
  const py = Math.min(Math.max(y - rect.top - size/2, 6), rect.height - size - 6);

  const el = document.createElement('div');
  el.className = `topping ${type}`;
  el.style.left = `${px}px`;
  el.style.top = `${py}px`;
  el.dataset.type = type;
  el.title = 'Double‑click to remove';
  el.addEventListener('dblclick', () => {
    const idx = placed.indexOf(el);
    if (idx >= 0) placed.splice(idx, 1);
    el.remove();
  });
  pizzaArea.appendChild(el);
  placed.push(el);
}

function evaluatePizza() {
  const onPizza = new Set(placed.map(el => el.dataset.type));
  const required = new Set(currentOrder);
  // exact set match (duplicates ignored)
  const extra = [...onPizza].filter(x => !required.has(x));
  const missing = [...required].filter(x => !onPizza.has(x));
  const ok = extra.length === 0 && missing.length === 0;
  return { ok, extra, missing };
}

function bake() {
  const { ok, extra, missing } = evaluatePizza();
  if (ok) {
    score += 10;
    scoreEl.textContent = score;
    showToast('Perfect! +10');
    // new order
    currentOrder = randomOrder();
    renderOrder();
    resetBoard();
  } else {
    let msg = '';
    if (missing.length) {
      msg += 'Missing: ' + formatOrder(missing).join(', ');
    }
    if (extra.length) {
      msg += (msg ? ' | ' : '') + 'Extra: ' + formatOrder(extra).join(', ');
    }
    showToast(msg || 'Not quite!');
  }
}

function renderPalette() {
  INGREDIENTS.forEach(item => {
    const row = document.createElement('div');
    row.className = 'item';
    row.draggable = true;

    const sw = document.createElement('div');
    sw.className = 'swatch';
    sw.style.background = item.color;

    const lab = document.createElement('div');
    lab.className = 'label';
    lab.textContent = item.label;

    const addBtn = document.createElement('button');
    addBtn.className = 'secondary';
    addBtn.textContent = 'Add';

    row.append(sw, lab, addBtn);
    palette.appendChild(row);

    // Drag & drop
    row.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', item.key);
    });

    // Click to auto-place at random location
    addBtn.addEventListener('click', () => {
      const rect = pizzaArea.getBoundingClientRect();
      const x = rect.left + 20 + Math.random() * (rect.width - 40);
      const y = rect.top + 20 + Math.random() * (rect.height - 40);
      addTopping(item.key, x, y);
    });
  });
}

function enableDrop() {
  pizzaArea.addEventListener('dragover', e => e.preventDefault());
  pizzaArea.addEventListener('drop', e => {
    e.preventDefault();
    const type = e.dataTransfer.getData('text/plain');
    if (!type) return;
    addTopping(type, e.clientX, e.clientY);
  });
}

function newOrder() {
  currentOrder = randomOrder();
  renderOrder();
  resetBoard();
}

function restart() {
  score = 0; scoreEl.textContent = score;
  startTimer();
  newOrder();
  bakeBtn.disabled = false;
  newOrderBtn.disabled = false;
}

// Init
renderPalette();
enableDrop();
newOrder();
startTimer();

// Wire up buttons
bakeBtn.addEventListener('click', bake);
undoBtn.addEventListener('click', undoLast);
clearBtn.addEventListener('click', resetBoard);
newOrderBtn.addEventListener('click', newOrder);
restartBtn.addEventListener('click', restart);
