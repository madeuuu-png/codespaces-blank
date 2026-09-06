// ============ CONFETI ============
const confettiLayer = document.getElementById('confettiLayer');
const colores = ['#FF6B9D','#FFC15E','#3D7BD9','#3ED98E','#B569F0','#FF9F5A'];

function lanzarConfeti(cantidad = 40) {
  for (let i = 0; i < cantidad; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.background = colores[Math.floor(Math.random() * colores.length)];
    piece.style.animationDuration = (2 + Math.random() * 1.5) + 's';
    piece.style.borderRadius = Math.random() > .5 ? '50%' : '2px';
    confettiLayer.appendChild(piece);
    setTimeout(() => piece.remove(), 4000);
  }
}

// ============ CARRUSEL DE DIAPOSITIVAS ============
const slides = document.querySelectorAll('.slide');
const dotsWrap = document.getElementById('dots');
const counter = document.getElementById('counter');
let current = 0;

slides.forEach((_, i) => {
  const dot = document.createElement('div');
  dot.className = 'dot';
  dot.addEventListener('click', () => goTo(i));
  dotsWrap.appendChild(dot);
});
const dots = document.querySelectorAll('.dot');

// Vuelve a disparar las animaciones "pop" cada vez que entras a una diapositiva
function reiniciarAnimaciones(slide) {
  const elementos = slide.querySelectorAll('.pop, .pop-big');
  elementos.forEach(el => {
    el.style.animation = 'none';
    void el.offsetWidth; // fuerza el reinicio
    el.style.animation = '';
  });
}

function goTo(index) {
  if (index < 0 || index >= slides.length) return;
  slides[current].classList.remove('active');
  dots[current].classList.remove('active');
  current = index;
  slides[current].classList.add('active');
  dots[current].classList.add('active');
  counter.textContent = `${current + 1} / ${slides.length}`;
  document.body.dataset.theme = slides[current].dataset.theme || 'cover';
  const progress = document.getElementById('slideProgress');
  if (progress) progress.style.setProperty('--progress', `${((current + 1) / slides.length) * 100}%`);
  reiniciarAnimaciones(slides[current]);
}

document.getElementById('prevBtn').addEventListener('click', () => goTo(current - 1));
document.getElementById('nextBtn').addEventListener('click', () => goTo(current + 1));
document.getElementById('startBtn').addEventListener('click', () => { lanzarConfeti(30); goTo(current + 1); });
document.getElementById('celebrateBtn').addEventListener('click', () => lanzarConfeti(60));

// Flechas del teclado
document.addEventListener('keydown', (e) => {
  if (document.body.classList.contains('portal-active')) return;
  if (e.key === 'ArrowRight') goTo(current + 1);
  if (e.key === 'ArrowLeft') goTo(current - 1);
});

// Deslizar con el dedo (celular / tablet)
let touchStartX = 0;
document.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; });
document.addEventListener('touchend', (e) => {
  if (document.body.classList.contains('portal-active')) return;
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) diff > 0 ? goTo(current + 1) : goTo(current - 1);
});

goTo(0);
lanzarConfeti(20);

// ============ CAJA MISTERIOSA (ROMPEHIELOS) ============
// Puedes cambiar, quitar o añadir preguntas aquí. Cada una tiene su propio color y emoji.
const preguntas = [
  { texto: '¿Qué cosa pequeña te hace sonreír muchísimo?', emoji: '😄', color: '#ffcc4d' },
  { texto: 'Si pudieras tener un superpoder para hacer el bien, ¿cuál sería?', emoji: '🦸', color: '#ff7aa8' },
  { texto: '¿Qué te gusta compartir con tus amigos?', emoji: '🤝', color: '#66d7c0' },
  { texto: '¿Qué lugar te gustaría conocer y por qué?', emoji: '🗺️', color: '#7cb8ff' },
  { texto: 'Dile algo bonito a una persona de este salón.', emoji: '💛', color: '#c99aff' },
  { texto: '¿Qué te gustaría aprender o intentar este año?', emoji: '🚀', color: '#ff9b70' }
];

const mysteryBtn = document.getElementById('mysteryBtn');
const mysteryQuestion = document.getElementById('mysteryQuestion');
const boxIcon = document.getElementById('boxIcon');
mysteryBtn.textContent = '✨ Abrir la caja secreta ✨';
let preguntaActual = -1;
let portalPregunta;
let revealTimer;

function elegirPregunta() {
  const disponibles = preguntas.length > 1
    ? preguntas.map((_, indice) => indice).filter(indice => indice !== preguntaActual)
    : [0];
  preguntaActual = disponibles[Math.floor(Math.random() * disponibles.length)];
  return preguntas[preguntaActual];
}

function reproducirSonidoSorpresa() {
  // Sonido corto creado en el navegador: no necesita archivos de audio ni conexión.
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const audio = new AudioContext();
    const ahora = audio.currentTime;
    [523.25, 659.25, 783.99].forEach((frecuencia, indice) => {
      const oscilador = audio.createOscillator();
      const volumen = audio.createGain();
      oscilador.type = 'sine';
      oscilador.frequency.value = frecuencia;
      volumen.gain.setValueAtTime(0.0001, ahora + indice * 0.08);
      volumen.gain.exponentialRampToValueAtTime(0.08, ahora + indice * 0.08 + 0.03);
      volumen.gain.exponentialRampToValueAtTime(0.0001, ahora + indice * 0.08 + 0.34);
      oscilador.connect(volumen);
      volumen.connect(audio.destination);
      oscilador.start(ahora + indice * 0.08);
      oscilador.stop(ahora + indice * 0.08 + 0.36);
    });
    setTimeout(() => audio.close(), 700);
  } catch (error) {
    // Si el navegador bloquea el audio, la animación sigue funcionando normalmente.
  }
}

function crearPortalPregunta() {
  if (portalPregunta) return portalPregunta;

  portalPregunta = document.createElement('div');
  portalPregunta.className = 'question-portal';
  portalPregunta.setAttribute('aria-hidden', 'true');
  portalPregunta.innerHTML = `
    <div class="portal-stars" aria-hidden="true">✦　✧　✦　✧　✦　✧　✦</div>
    <div class="portal-dialog" role="dialog" aria-modal="true" aria-labelledby="portalTitle">
      <button class="portal-close" type="button" aria-label="Cerrar la pregunta">×</button>
      <div class="portal-kicker">🎁 CAJA MISTERIOSA · ROMPEHIELOS</div>
      <h2 id="portalTitle" class="portal-title">¿Qué habrá dentro?</h2>
      <div class="portal-orbit" aria-hidden="true">
        <div class="portal-rays"></div>
        <div class="portal-chest">🎁</div>
      </div>
      <div class="portal-question-card" hidden>
        <div class="portal-question-emoji" aria-hidden="true"></div>
        <p class="portal-card-label">✨ ¡Pregunta desbloqueada! ✨</p>
        <p class="portal-question" id="portalQuestionText" aria-live="polite"></p>
        <p class="portal-turn" id="portalTurn"></p>
        <div class="portal-actions">
          <button class="portal-again" id="portalAgain" type="button">🔄 Sacar otra</button>
          <button class="portal-exit" id="portalExit" type="button">Listo, volvamos →</button>
        </div>
      </div>
      <p class="portal-hint">Piensa, levanta la mano y comparte tu respuesta con alegría 💫</p>
    </div>
  `;
  document.body.appendChild(portalPregunta);

  portalPregunta.querySelector('.portal-close').addEventListener('click', cerrarPortalPregunta);
  portalPregunta.querySelector('#portalExit').addEventListener('click', cerrarPortalPregunta);
  portalPregunta.querySelector('#portalAgain').addEventListener('click', () => iniciarRevelacion(true));
  portalPregunta.addEventListener('click', (evento) => {
    if (evento.target === portalPregunta) cerrarPortalPregunta();
  });

  return portalPregunta;
}

function actualizarPreguntaEnPantalla(pregunta) {
  const tarjeta = portalPregunta.querySelector('.portal-question-card');
  const emoji = portalPregunta.querySelector('.portal-question-emoji');
  const texto = portalPregunta.querySelector('#portalQuestionText');
  const turno = portalPregunta.querySelector('#portalTurn');
  const titulo = portalPregunta.querySelector('#portalTitle');

  portalPregunta.style.setProperty('--question-color', pregunta.color);
  emoji.textContent = pregunta.emoji;
  texto.textContent = pregunta.texto;
  turno.textContent = `Reto ${preguntaActual + 1} de ${preguntas.length} · ¡Ahora te toca a ti!`;
  titulo.textContent = '¡Pregunta desbloqueada!';
  mysteryQuestion.textContent = pregunta.texto;
  mysteryQuestion.classList.remove('hidden', 'show');
  void mysteryQuestion.offsetWidth;
  mysteryQuestion.classList.add('show');
  tarjeta.hidden = false;
}

function iniciarRevelacion(esOtra = false) {
  clearTimeout(revealTimer);
  const portal = crearPortalPregunta();
  const tarjeta = portal.querySelector('.portal-question-card');
  const titulo = portal.querySelector('#portalTitle');
  const pregunta = elegirPregunta();

  portal.classList.remove('is-revealed');
  portal.classList.add('is-open', 'is-revealing');
  portal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('portal-active');
  tarjeta.hidden = true;
  titulo.textContent = esOtra ? '¡Otra sorpresa viene en camino!' : '¿Qué habrá dentro?';
  boxIcon.classList.remove('open');
  boxIcon.classList.add('shake');
  boxIcon.textContent = '🎁';

  const demora = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 100 : 850;
  revealTimer = setTimeout(() => {
    portal.classList.remove('is-revealing');
    portal.classList.add('is-revealed');
    boxIcon.classList.remove('shake');
    boxIcon.classList.add('open');
    boxIcon.textContent = '✨';
    actualizarPreguntaEnPantalla(pregunta);
    lanzarConfeti(38);
    reproducirSonidoSorpresa();
    portal.querySelector('#portalAgain').focus({ preventScroll: true });
  }, demora);
}

function cerrarPortalPregunta() {
  if (!portalPregunta) return;
  clearTimeout(revealTimer);
  portalPregunta.classList.remove('is-open', 'is-revealing', 'is-revealed');
  portalPregunta.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('portal-active');
  mysteryBtn.focus({ preventScroll: true });
}

mysteryBtn.addEventListener('click', () => iniciarRevelacion());

document.addEventListener('keydown', (evento) => {
  if (evento.key === 'Escape' && portalPregunta?.classList.contains('is-open')) {
    cerrarPortalPregunta();
  }
});

// ============ REGLAS / COMPROMISOS ============
const rulesList = document.getElementById('rulesList');
const newRuleInput = document.getElementById('newRuleInput');
const addRuleBtn = document.getElementById('addRuleBtn');

function cargarReglasGuardadas() {
  const guardadas = JSON.parse(localStorage.getItem('reglasExtra') || '[]');
  guardadas.forEach(texto => agregarRegla(texto, false));
}

function agregarRegla(texto, guardar = true) {
  const li = document.createElement('li');
  li.textContent = texto;
  li.setAttribute('tabindex', '0');
  rulesList.appendChild(li);

  if (guardar) {
    const guardadas = JSON.parse(localStorage.getItem('reglasExtra') || '[]');
    guardadas.push(texto);
    localStorage.setItem('reglasExtra', JSON.stringify(guardadas));
    lanzarConfeti(15);
  }
}

addRuleBtn.addEventListener('click', () => {
  const texto = newRuleInput.value.trim();
  if (texto === '') return;
  agregarRegla(texto);
  newRuleInput.value = '';
});

newRuleInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addRuleBtn.click();
});

cargarReglasGuardadas();

// ============ CAPA CREATIVA PARA TODAS LAS SECCIONES ============
// Estos elementos se crean desde JS para que el index.html pueda quedarse igual.
const ambientIcons = {
  cover: ['🎈', '⭐', '☁️', '✨', '🌈'],
  familia: ['💙', '🌟', '🕊️', '💛', '🌼'],
  bienvenida: ['👋', '🎵', '🌈', '💛', '🎈'],
  rompehielos: ['❓', '🎁', '✨', '🧩', '🎉'],
  oracion: ['🙏', '🕯️', '✨', '💙', '🌙'],
  presentacion: ['📸', '💖', '🌈', '✨', '😊'],
  reglas: ['🤝', '✅', '🌱', '⭐', '💚'],
  despedida: ['🎨', '🎉', '💫', '🎵', '💜']
};

function añadirDecoracionAmbiental(slide, index) {
  if (slide.querySelector('.ambient-decor')) return;
  const theme = slide.dataset.theme || 'cover';
  const iconos = ambientIcons[theme] || ambientIcons.cover;
  const decor = document.createElement('div');
  decor.className = 'ambient-decor';
  decor.setAttribute('aria-hidden', 'true');

  for (let i = 0; i < 9; i++) {
    const bit = document.createElement('span');
    bit.className = 'ambient-bit';
    bit.textContent = iconos[(i + index) % iconos.length];
    bit.style.left = `${7 + ((i * 13 + index * 5) % 86)}%`;
    bit.style.top = `${8 + ((i * 19 + index * 7) % 78)}%`;
    bit.style.setProperty('--float-time', `${5.5 + (i % 4) * 1.2}s`);
    bit.style.setProperty('--float-delay', `${-(i * .55 + index * .2)}s`);
    bit.style.setProperty('--float-size', `${.8 + (i % 3) * .22}rem`);
    bit.style.setProperty('--float-rotate', `${i % 2 ? 8 : -8}deg`);
    decor.appendChild(bit);
  }
  slide.appendChild(decor);
}

function prepararEntradas(slide) {
  const elementos = slide.querySelectorAll(
    '.tip, .grid-2, .song-box, .mystery-box, .chalkboard, .collage, .rules-list, .add-rule, .mascots, .mascot-wrap, .badge-frame, .placeholder, .photo, .the-end, #celebrateBtn'
  );
  elementos.forEach((elemento, i) => {
    elemento.classList.add('reveal-item');
    elemento.style.setProperty('--reveal-delay', `${Math.min(i * 75, 600)}ms`);
  });
}

function activarTarjetasInteracticas() {
  document.querySelectorAll('.photo').forEach(photo => {
    photo.addEventListener('pointerenter', () => photo.classList.add('photo-focus'));
    photo.addEventListener('pointerleave', () => photo.classList.remove('photo-focus'));
  });

  const chalkboard = document.querySelector('.chalkboard');
  if (chalkboard) {
    chalkboard.setAttribute('title', 'Toca la pizarra para encender una sorpresa ✨');
    chalkboard.addEventListener('click', () => chalkboard.classList.toggle('is-lit'));
  }

  const rules = document.getElementById('rulesList');
  if (rules) {
    rules.querySelectorAll('li').forEach(li => li.setAttribute('tabindex', '0'));
    rules.addEventListener('click', evento => {
      const li = evento.target.closest('li');
      if (li) li.classList.toggle('is-checked');
    });
    rules.addEventListener('keydown', evento => {
      if ((evento.key === 'Enter' || evento.key === ' ') && evento.target.matches('li')) {
        evento.preventDefault();
        evento.target.classList.toggle('is-checked');
      }
    });
  }
}

function añadirBarraDeProgreso() {
  const controls = document.querySelector('.controls');
  if (!controls || document.getElementById('slideProgress')) return;
  const track = document.createElement('div');
  track.className = 'slide-progress';
  track.id = 'slideProgress';
  track.setAttribute('aria-hidden', 'true');
  controls.appendChild(track);
}

function activarParallaxSuave() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.addEventListener('pointermove', evento => {
    const activa = document.querySelector('.slide.active');
    if (!activa || evento.pointerType === 'touch') return;
    activa.style.setProperty('--pointer-x', `${(evento.clientX / window.innerWidth) * 100}%`);
    activa.style.setProperty('--pointer-y', `${(evento.clientY / window.innerHeight) * 100}%`);
  }, { passive: true });
}

slides.forEach((slide, index) => {
  añadirDecoracionAmbiental(slide, index);
  prepararEntradas(slide);
});
añadirBarraDeProgreso();
activarTarjetasInteracticas();
activarParallaxSuave();
goTo(current);