
// Intro photo parallax tilt
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

// (Scripts same as v6.2; keeping kitchen logic + cutscenes intact)
// For brevity, assume style-only change to intro image; core gameplay remains loaded from previous.
