
const orderScreen = document.getElementById('orderScreen');
const kitchenScreen = document.getElementById('kitchenScreen');
const feedbackScreen = document.getElementById('feedbackScreen');
const orderText = document.getElementById('orderText');
const feedbackText = document.getElementById('feedbackText');
const startBtn = document.getElementById('startBtn');
const bakeBtn = document.getElementById('bakeBtn');
const nextOrderBtn = document.getElementById('nextOrderBtn');
const bakeTimeInput = document.getElementById('bakeTime');
const pizzaArea = document.getElementById('pizzaArea');
const palette = document.getElementById('palette');

const INGREDIENTS = ['cheese', 'pepperoni', 'mushroom', 'olive', 'pepper', 'onion'];
let currentOrder = [];
let requiredBakeTime = 10;
let placed = [];

function generateOrder() {
  currentOrder = ['cheese'];
  const extraCount = Math.floor(Math.random() * 3) + 1;
  while (currentOrder.length < extraCount + 1) {
    const item = INGREDIENTS[Math.floor(Math.random() * INGREDIENTS.length)];
    if (!currentOrder.includes(item)) currentOrder.push(item);
  }
  requiredBakeTime = Math.floor(Math.random() * 20) + 10;
  orderText.textContent = `Toppings: ${currentOrder.join(', ')} | Bake Time: ${requiredBakeTime}s`;
}

function renderPalette() {
  palette.innerHTML = '';
  INGREDIENTS.forEach(item => {
    const btn = document.createElement('button');
    btn.textContent = item;
    btn.className = 'secondary';
    btn.addEventListener('click', () => addTopping(item));
    palette.appendChild(btn);
  });
}

function addTopping(type) {
  const el = document.createElement('div');
  el.className = 'topping';
  el.style.background = type === 'cheese' ? '#fffacd' : '#ff69b4';
  el.style.left = `${Math.random() * 250}px`;
  el.style.top = `${Math.random() * 250}px`;
  el.dataset.type = type;
  pizzaArea.appendChild(el);
  placed.push(type);
}

function checkPizza() {
  const toppingsMatch = currentOrder.every(t => placed.includes(t)) && placed.every(t => currentOrder.includes(t));
  const timeMatch = parseInt(bakeTimeInput.value) === requiredBakeTime;
  if (toppingsMatch && timeMatch) {
    feedbackText.textContent = 'Perfect! You nailed it! 🎉';
  } else {
    feedbackText.textContent = 'Oops! Something was off. Try again!';
  }
}

startBtn.addEventListener('click', () => {
  orderScreen.classList.add('hidden');
  kitchenScreen.classList.remove('hidden');
});

bakeBtn.addEventListener('click', () => {
  kitchenScreen.classList.add('hidden');
  feedbackScreen.classList.remove('hidden');
  checkPizza();
});

nextOrderBtn.addEventListener('click', () => {
  feedbackScreen.classList.add('hidden');
  orderScreen.classList.remove('hidden');
  pizzaArea.innerHTML = '';
  placed = [];
  generateOrder();
});

renderPalette();
generateOrder();
