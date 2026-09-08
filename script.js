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
document.getElementById('celebrateBtn').addEventListener('click', () => {
  lanzarConfeti(75);
  abrirCelebracionFinal();
});

// Flechas del teclado
document.addEventListener('keydown', (e) => {
  if (document.body.classList.contains('portal-active') || document.body.classList.contains('celebration-active')) return;
  if (e.key === 'ArrowRight') goTo(current + 1);
  if (e.key === 'ArrowLeft') goTo(current - 1);
});

// Deslizar con el dedo (celular / tablet)
let touchStartX = 0;
document.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; });
document.addEventListener('touchend', (e) => {
  if (document.body.classList.contains('portal-active') || document.body.classList.contains('celebration-active')) return;
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
  { texto: '¿Qué te gustaría aprender o intentar este año?', emoji: '🚀', color: '#ff9b70' },
  { texto: '¿Cual es tu canción favorita?', emoji: '🎶', color: '#42008d' },
  { texto: '¿Tienes Mascotas?', emoji: '🐾', color: '#ac793f' },
  { texto: '¿Cual es tu materia favorita?', emoji: '👀', color: '#00597c' },
  { texto: '¿Cual es tu color favorito?', emoji: '🟣', color: '#8d3fac' },
  { texto: '¿Cual es tu pelicula o serie favorita?', emoji: '🎞', color: '#8f2323' },
  { texto: '¿Te gusta leer?', emoji: '📖', color: '#8bf072' },
  { texto: '¿Que te gustaria ser de grande?', emoji: '👔', color: '#edff49' }
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

// ============ MODO CÓMIC · INSIGNIAS Y ACUERDOS COMO MISIÓN ============
const comicThemes = {
  familia: { kicker: 'NUESTRA FAMILIA', title: '¡Juntos brillamos!', sticker: '💙', color: '#3977d5' },
  bienvenida: { kicker: 'HOLA, HOLA', title: '¡Qué alegría!', sticker: '👋', color: '#ef8b2d' },
  rompehielos: { kicker: 'MISIÓN SECRETA', title: '¡Atrévete!', sticker: '🎁', color: '#b24ec4' },
  oracion: { kicker: 'MOMENTO ESPECIAL', title: 'Paz y luz', sticker: '✨', color: '#326ca8' },
  presentacion: { kicker: 'ÁLBUM DE RECUERDOS', title: 'Conóceme', sticker: '📸', color: '#dc688c' },
  reglas: { kicker: 'MISIÓN DEL SALÓN', title: '¡Lo hacemos juntos!', sticker: '🤝', color: '#287d57' },
  despedida: { kicker: 'GRAN FINAL', title: '¡Celebramos!', sticker: '🎉', color: '#873fc1' }
};

function añadirInsigniasComic() {
  slides.forEach(slide => {
    const theme = slide.dataset.theme;
    const datos = comicThemes[theme];
    if (!datos || slide.querySelector('.comic-badge')) return;

    const badge = document.createElement('div');
    badge.className = 'comic-badge';
    badge.style.setProperty('--badge-color', datos.color);
    badge.innerHTML = `
      <span class="comic-badge-sticker" aria-hidden="true">${datos.sticker}</span>
      <small>${datos.kicker}</small>
      <strong>${datos.title}</strong>
    `;
    badge.setAttribute('aria-hidden', 'true');
    slide.appendChild(badge);
  });
}

function decorarRegla(li, indice) {
  const iconos = ['👂', '💬', '📚', '💛', '🙌', '🌟'];
  const colores = ['#ffcf4c', '#ff85a5', '#73c8ff', '#87dfaa', '#c59aff', '#ff9a6b'];
  li.classList.add('rule-mission');
  li.style.setProperty('--rule-color', colores[indice % colores.length]);
  li.style.setProperty('--rule-icon', `'${iconos[indice % iconos.length]}'`);
  li.setAttribute('role', 'button');
  li.setAttribute('aria-pressed', li.classList.contains('is-checked') ? 'true' : 'false');
}

function prepararAcuerdosComic() {
  const slide = document.querySelector('.slide[data-theme="reglas"]');
  const list = document.getElementById('rulesList');
  if (!slide || !list || slide.classList.contains('rules-comic')) return;
  slide.classList.add('rules-comic');

  const hero = document.createElement('div');
  hero.className = 'rules-hero';
  hero.innerHTML = `
    <span class="rules-hero-sticker" aria-hidden="true">🏆</span>
    <div>
      <strong>¡Equipo Cuartos!</strong>
      <span>Cada acuerdo nos ayuda a crecer y a cuidarnos.</span>
    </div>
  `;
  list.insertAdjacentElement('beforebegin', hero);

  const progress = document.createElement('div');
  progress.className = 'rules-progress';
  progress.innerHTML = `
    <div class="rules-progress-top">
      <strong id="rulesProgressText">0 acuerdos completados</strong>
      <span id="rulesProgressFace">🚀</span>
    </div>
    <div class="rules-progress-track"><span id="rulesProgressBar"></span></div>
  `;
  list.insertAdjacentElement('afterend', progress);

  const actualizarProgreso = () => {
    const reglas = [...list.querySelectorAll('li')];
    const completadas = reglas.filter(li => li.classList.contains('is-checked')).length;
    const porcentaje = reglas.length ? (completadas / reglas.length) * 100 : 0;
    const texto = document.getElementById('rulesProgressText');
    const barra = document.getElementById('rulesProgressBar');
    const cara = document.getElementById('rulesProgressFace');
    if (!texto || !barra || !cara) return;
    texto.textContent = completadas === reglas.length && reglas.length
      ? '¡Misión cumplida! Todos los acuerdos listos 🎉'
      : `${completadas} de ${reglas.length} acuerdos completados`;
    barra.style.width = `${porcentaje}%`;
    cara.textContent = completadas === reglas.length && reglas.length ? '🏆' : completadas ? '⭐' : '🚀';
    reglas.forEach(li => li.setAttribute('aria-pressed', li.classList.contains('is-checked') ? 'true' : 'false'));
  };

  list.querySelectorAll('li').forEach((li, indice) => decorarRegla(li, indice));
  list.addEventListener('click', evento => {
    const li = evento.target.closest('li');
    if (!li) return;
    requestAnimationFrame(() => {
      li.classList.toggle('is-complete', li.classList.contains('is-checked'));
      actualizarProgreso();
      if (li.classList.contains('is-checked')) lanzarConfeti(8);
    });
  });
  list.addEventListener('keydown', evento => {
    if ((evento.key === 'Enter' || evento.key === ' ') && evento.target.matches('li')) {
      requestAnimationFrame(() => {
        evento.target.classList.toggle('is-complete', evento.target.classList.contains('is-checked'));
        actualizarProgreso();
      });
    }
  });

  const observer = new MutationObserver(() => {
    list.querySelectorAll('li:not(.rule-mission)').forEach((li, indice) => decorarRegla(li, indice));
    actualizarProgreso();
  });
  observer.observe(list, { childList: true });
  actualizarProgreso();
}

añadirInsigniasComic();
prepararAcuerdosComic();

// ============ FAMILIA SALESIANA · ESCENA INTERACTIVA ============
function prepararFamiliaSalesiana() {
  const slide = document.querySelector('.slide[data-theme="familia"]');
  const mascots = slide?.querySelector('.mascots');
  if (!slide || !mascots || slide.classList.contains('familia-comic')) return;
  slide.classList.add('familia-comic');

  const hero = document.createElement('div');
  hero.className = 'family-hero reveal-item';
  hero.style.setProperty('--reveal-delay', '80ms');
  hero.innerHTML = `
    <span class="family-hero-sun" aria-hidden="true">☀️</span>
    <div>
      <strong>Una familia que acompaña</strong>
      <span>Con alegría, cuidado y esperanza caminamos juntos.</span>
    </div>
    <span class="family-hero-sticker" aria-hidden="true">¡Juntos!</span>
  `;
  mascots.insertAdjacentElement('beforebegin', hero);

  const connector = document.createElement('div');
  connector.className = 'family-connector reveal-item';
  connector.style.setProperty('--reveal-delay', '280ms');
  connector.innerHTML = '<span>💙</span><i></i><b>✦</b><i></i><span>💛</span>';
  mascots.insertAdjacentElement('afterend', connector);

  const values = document.createElement('div');
  values.className = 'family-values reveal-item';
  values.style.setProperty('--reveal-delay', '360ms');
  values.innerHTML = `
    <div class="family-value"><span>💛</span><strong>AMOR</strong><small>Nos cuidamos</small></div>
    <div class="family-value"><span>🎈</span><strong>ALEGRÍA</strong><small>Compartimos sonrisas</small></div>
    <div class="family-value"><span>🤝</span><strong>SERVICIO</strong><small>Ayudamos con el corazón</small></div>
  `;
  connector.insertAdjacentElement('afterend', values);

  const messages = [
    'Nos enseña a acompañar con alegría y a mirar a cada niño con cariño.',
    'Nos recuerda que nunca caminamos solos y que siempre podemos confiar.'
  ];
  mascots.querySelectorAll('.mascot-wrap').forEach((card, indice) => {
    card.classList.add('family-card');
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-expanded', 'false');
    const note = document.createElement('span');
    note.className = 'family-card-note';
    note.textContent = messages[indice] || messages[0];
    card.appendChild(note);
    const alternar = () => {
      const abierto = card.classList.toggle('is-open');
      card.setAttribute('aria-expanded', abierto ? 'true' : 'false');
    };
    card.addEventListener('click', alternar);
    card.addEventListener('keydown', evento => {
      if (evento.key === 'Enter' || evento.key === ' ') {
        evento.preventDefault();
        alternar();
      }
    });
  });

  const messageBox = slide.querySelector('.text-placeholder.filled');
  if (messageBox) {
    const mensaje = messageBox.textContent.trim();
    messageBox.classList.add('family-message', 'reveal-item');
    messageBox.innerHTML = '';
    const label = document.createElement('span');
    label.className = 'family-message-label';
    label.textContent = '💌 Un mensaje para nuestra familia';
    const copy = document.createElement('p');
    copy.textContent = mensaje;
    messageBox.append(label, copy);
  }
}

// ============ CIERRE · GRAN CELEBRACIÓN ============
function prepararCierreCreativo() {
  const slide = document.querySelector('.slide[data-theme="despedida"]');
  const grid = slide?.querySelector('.grid-2');
  if (!slide || !grid || slide.classList.contains('closing-comic')) return;
  slide.classList.add('closing-comic');

  const hero = document.createElement('div');
  hero.className = 'closing-hero reveal-item';
  hero.style.setProperty('--reveal-delay', '80ms');
  hero.innerHTML = `
    <span class="closing-hero-spark" aria-hidden="true">🌟</span>
    <div><strong>¡Mira todo lo que descubrimos!</strong><span>Hoy cada nombre, cada sonrisa y cada corazón tuvo un lugar especial.</span></div>
    <span class="closing-hero-stamp" aria-hidden="true">¡WOW!</span>
  `;
  grid.insertAdjacentElement('beforebegin', hero);

  const message = grid.querySelector('.text-placeholder');
  if (message) {
    message.classList.add('closing-message-card');
    message.innerHTML = `
      <span class="closing-card-kicker">💙 Nuestra huella de hoy</span>
      <strong>Somos una gran familia cuando nos conocemos, nos escuchamos y nos cuidamos.</strong>
      <small>Gracias por compartir tu alegría y tu corazón.</small>
    `;
  }

  const artwork = grid.querySelector('.img-placeholder');
  if (artwork) {
    artwork.classList.add('closing-art-card');
    artwork.innerHTML = `
      <span class="closing-art" aria-hidden="true">🎨</span>
      <strong>Tu nombre es un regalo</strong>
      <small>¡Déjalo llenar el mundo de color!</small>
    `;
  }

  const stamps = document.createElement('div');
  stamps.className = 'closing-stamps reveal-item';
  stamps.style.setProperty('--reveal-delay', '300ms');
  stamps.innerHTML = `
    <span><b>01</b> CONOCER</span>
    <i>➜</i>
    <span><b>02</b> COMPARTIR</span>
    <i>➜</i>
    <span><b>03</b> CELEBRAR</span>
  `;
  grid.insertAdjacentElement('afterend', stamps);
}

let finalCelebrationOverlay;
function crearCelebracionFinal() {
  if (finalCelebrationOverlay) return finalCelebrationOverlay;
  finalCelebrationOverlay = document.createElement('div');
  finalCelebrationOverlay.className = 'final-celebration';
  finalCelebrationOverlay.setAttribute('aria-hidden', 'true');
  finalCelebrationOverlay.innerHTML = `
    <div class="finale-confetti-word" aria-hidden="true">✦　🎈　✦　🎉　✦　🎈　✦</div>
    <div class="finale-dialog" role="dialog" aria-modal="true" aria-labelledby="finaleTitle">
      <button class="finale-close" type="button" aria-label="Cerrar celebración">×</button>
      <div class="finale-crown" aria-hidden="true">🏆</div>
      <p class="finale-kicker">🎉 MISIÓN DEL DÍA COMPLETADA 🎉</p>
      <h2 id="finaleTitle">¡Lo logramos!</h2>
      <p class="finale-copy">Hoy comenzamos a conocernos y descubrimos que cada uno es un regalo único para esta gran familia.</p>
      <div class="finale-quote">“Donde hay alegría, hay un corazón que comparte.” 💙</div>
      <button class="finale-back" type="button">Volver a la clase ✨</button>
    </div>
  `;
  document.body.appendChild(finalCelebrationOverlay);
  finalCelebrationOverlay.querySelector('.finale-close').addEventListener('click', cerrarCelebracionFinal);
  finalCelebrationOverlay.querySelector('.finale-back').addEventListener('click', cerrarCelebracionFinal);
  finalCelebrationOverlay.addEventListener('click', evento => {
    if (evento.target === finalCelebrationOverlay) cerrarCelebracionFinal();
  });
  return finalCelebrationOverlay;
}

function abrirCelebracionFinal() {
  const overlay = crearCelebracionFinal();
  overlay.classList.add('is-open');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('celebration-active');
  reproducirSonidoSorpresa();
  requestAnimationFrame(() => overlay.querySelector('.finale-back').focus({ preventScroll: true }));
}

function cerrarCelebracionFinal() {
  if (!finalCelebrationOverlay) return;
  finalCelebrationOverlay.classList.remove('is-open');
  finalCelebrationOverlay.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('celebration-active');
  document.getElementById('celebrateBtn')?.focus({ preventScroll: true });
}

document.addEventListener('keydown', evento => {
  if (evento.key === 'Escape' && finalCelebrationOverlay?.classList.contains('is-open')) {
    cerrarCelebracionFinal();
  }
});

prepararFamiliaSalesiana();
prepararCierreCreativo();
goTo(current);