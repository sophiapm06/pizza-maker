// Toggle nav
const nav = document.querySelector('.nav');
const toggle = document.querySelector('.nav-toggle');
toggle?.addEventListener('click', () => nav.classList.toggle('open'));

// Contact form (client-side only)
const form = document.getElementById('contactForm');
const formMsg = document.getElementById('formMsg');
form?.addEventListener('submit', (ev) => {
  ev.preventDefault();
  const data = new FormData(form);
  const name = data.get('name');
  formMsg.textContent = `Thanks, ${name}! Your message was captured locally.`;
});

// Pizza modal
const pizzaModal = document.getElementById('pizzaModal');
const launchPizza = document.getElementById('launchPizza');
const closePizza = document.getElementById('closePizza');
launchPizza?.addEventListener('click', () => pizzaModal.showModal());
closePizza?.addEventListener('click', () => pizzaModal.close());
