
/* ---------- Elements ---------- */
// Screens
const welcomeScreen = document.getElementById('welcomeScreen');
const orderScreen   = document.getElementById('orderScreen');
const kitchenScreen = document.getElementById('kitchenScreen');

// Order + feedback
const orderHeading  = document.getElementById('orderHeading');
const orderText     = document.getElementById('orderText');
const feedbackText  = document.getElementById('feedbackText');

// Buttons
const playBtn       = document.getElementById('playBtn');
const startBtn      = document.getElementById('startBtn');
const nextOrderBtn  = document.getElementById('nextOrderBtn');
const backToOrderBtn= document.getElementById('backToOrderBtn');
const clearBtn      = document.getElementById('clearBtn');
const bakeBtn       = document.getElementById('bakeBtn');

// Bake time
const bakeTimeInput = document.getElementById('bakeTime');
const bakeDisplay   = document.getElementById('bakeDisplay');

// Pizza + palette
const pizzaArea     = document.getElementById('pizzaArea');
const palette       = document.getElementById('palette');

// Toast
const toast = document.getElementById('toast');
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1400);
}

/* ---------- Data ---------- */
const INGREDIENTS = [
  { key: 'cheese', label: 'Cheese' },
  { key: 'pepperoni', label: 'Pepperoni' },
  { key: 'mushroom', label: 'Mushrooms' },
  { key: 'olive', label: 'Olives' },
  { key: 'pepper', label: 'Peppers' },
  { key: 'onion', label: 'Onions' },
];

let requiredToppings = [];   // array of keys
let requiredBakeTime = 10;   // seconds
let placed = [];             // topping elements

/* ---------- Order generation ---------- */
function generateOrder() {
  // Always include cheese; add 1–3 unique toppings
  requiredToppings = ['cheese'];
  const extras = INGREDIENTS.map(i => i.key).filter(k => k !== 'cheese');
  const extraCount = 1 + Math.floor(Math.random() * 3); // 1..3

  while (requiredToppings.length < extraCount + 1) {
    const pick = extras[Math.floor(Math.random() * extras.length)];
    if (!requiredToppings.includes(pick)) requiredToppings.push(pick);
  }

  requiredBakeTime = 10 + Math.floor(Math.random() * 21); // 10..30

  orderHeading.textContent = 'Customer Order';
  feedbackText.classList.add('hidden');
  nextOrderBtn.classList.add('hidden');

  orderText.textContent = `Toppings: ${requiredToppings
    .map(k => INGREDIENTS.find(i => i.key === k).label).join(', ')} · Bake Time: ${requiredBakeTime}s`;
}

/* ---------- Palette ---------- */
function renderPalette() {
  palette.innerHTML = '';
  INGREDIENTS.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'tbtn';
    btn.textContent = item.label;
    btn.addEventListener('click', () => addTopping(item.key));
    palette.appendChild(btn);
  });
}

/* ---------- Toppings ---------- */
function addTopping(type) {
  const rect = pizzaArea.getBoundingClientRect();
  const size = 28;
  const x = Math.random() * (rect.width - size - 12) + 6;
  const y = Math.random() * (rect.height - size - 12) + 6;

  const el = document.createElement('div');
  el.className = `topping ${type}`;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.dataset.type = type;

  el.title = 'Double-click to remove';
  el.addEventListener('dblclick', () => {
    const idx = placed.indexOf(el);
    if (idx >= 0) placed.splice(idx, 1);
    el.remove();
  });

  pizzaArea.appendChild(el);
  placed.push(el);
}

/* ---------- Evaluation ---------- */
function evaluatePizza() {
  const placedTypes = new Set(placed.map(el => el.dataset.type));
  const requiredSet = new Set(requiredToppings);

  const missing = [...requiredSet].filter(x => !placedTypes.has(x));
  const extra   = [...placedTypes].filter(x => !requiredSet.has(x));

  const userBake = parseInt(bakeTimeInput.value, 10);
  const timeOK   = userBake === requiredBakeTime;
  const toppingsOK = missing.length === 0 && extra.length === 0;

  return { toppingsOK, timeOK, missing, extra, userBake };
}

/* ---------- Navigation ---------- */
playBtn.addEventListener('click', () => {
  welcomeScreen.classList.add('hidden');
  orderScreen.classList.remove('hidden');
  showToast('New customer arrived! 👋');
  generateOrder();
});

startBtn.addEventListener('click', () => {
  orderScreen.classList.add('hidden');
  kitchenScreen.classList.remove('hidden');
  showToast('Into the kitchen! 🍳');
});

backToOrderBtn.addEventListener('click', () => {
  kitchenScreen.classList.add('hidden');
  orderScreen.classList.remove('hidden');
});

nextOrderBtn.addEventListener('click', () => {
  // reset pizza
  pizzaArea.innerHTML = '';
  placed = [];
  bakeTimeInput.value = 10;
  bakeDisplay.textContent = bakeTimeInput.value;

  generateOrder(); // new order
});

/* ---------- Actions ---------- */
clearBtn.addEventListener('click', () => {
  pizzaArea.innerHTML = '';
  placed = [];
  showToast('Cleared!');
});

bakeBtn.addEventListener('click', () => {
  const { toppingsOK, timeOK, missing, extra, userBake } = evaluatePizza();

  // Build feedback message
  let msg;
  if (toppingsOK && timeOK) {
    msg = 'Perfect! You nailed the order! 🎉';
  } else {
    const parts = [];
    if (!toppingsOK) {
      if (missing.length) parts.push(`Missing: ${missing.map(k => INGREDIENTS.find(i => i.key === k).label).join(', ')}`);
      if (extra.length)   parts.push(`Extra: ${extra.map(k => INGREDIENTS.find(i => i.key === k).label).join(', ')}`);
    }
    if (!timeOK) parts.push(`Bake time was ${userBake}s (needed ${requiredBakeTime}s)`);
    msg = parts.join(' • ');
  }

  // Show feedback on ORDER screen
  feedbackText.textContent = msg;
  feedbackText.classList.remove('hidden');
  orderHeading.textContent = 'Customer Feedback';

  kitchenScreen.classList.add('hidden');
  orderScreen.classList.remove('hidden');
  nextOrderBtn.classList.remove('hidden');
});

/* ---------- Bake time display ---------- */
bakeTimeInput.addEventListener('input', () => {
  bakeDisplay.textContent = bakeTimeInput.value;
});

/* ---------- Init ---------- */
renderPalette();
bakeDisplay.textContent = bakeTimeInput.value;

