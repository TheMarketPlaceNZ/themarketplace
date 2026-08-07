/* ============================================================
   THE MARKETPLACE NZ — CORE ENGINE v3
   Techniques: Lerp, MapRange, Text Splitting, Custom Cursor,
   Magnetic Buttons, Globe Canvas, Scroll Progress, Grain,
   Scroll Tracking (rAF), Viewport Detection, Sticky Slider
   ============================================================ */

'use strict';

/* ============================================================
   CORE MATH UTILITIES
   ============================================================ */
const lerp    = (a, b, t) => a + (b - a) * t;
const clamp   = (v, min, max) => Math.min(Math.max(v, min), max);
const mapRange = (v, inMin, inMax, outMin, outMax) =>
  outMin + ((v - inMin) / (inMax - inMin)) * (outMax - outMin);

/* ============================================================
   GLOBAL STATE
   ============================================================ */
let availableBookingDates = [];
let busySlots             = [];
let scrollY               = 0;
let rafRunning            = false;

/* ============================================================
   MAIN INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initScrollProgress();
  initGrainOverlay();
  initCustomCursor();
  initTextSplitting();
  initLaptopCanvas();
  initViewportDetection();
  initProofCounters();
  initHowItWorksSlider();
  initMagneticButtons();
  initMouseSpotlight();
  initCard3DTilt();
  initSectionTileTransitions();
  startRAFLoop();
  fetchBusySlots();

  /* Modal close on overlay click */
  const bookingOverlay = document.getElementById('modalOverlay');
  if (bookingOverlay) bookingOverlay.addEventListener('click', e => { if (e.target === bookingOverlay) closeBooking(); });
  const loginOverlay = document.getElementById('loginModalOverlay');
  if (loginOverlay) loginOverlay.addEventListener('click', e => { if (e.target === loginOverlay) closeLoginModal(); });
});

/* ============================================================
   RAF LOOP — single rAF driving everything scroll-driven
   ============================================================ */
function startRAFLoop() {
  if (rafRunning) return;
  rafRunning = true;
  let lastScroll = -1;

  function tick(time) {
    scrollY = window.scrollY;

    if (scrollY !== lastScroll) {
      updateScrollProgress();
      updateLaptopScroll(scrollY);
      updateSectionTileDimming(scrollY);
      updateHeaderScroll(scrollY);
      lastScroll = scrollY;
    }

    updateCursorLerp();
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

/* ============================================================
   SCROLL PROGRESS BAR (thin gold line at top)
   ============================================================ */
function initScrollProgress() {
  const bar = document.createElement('div');
  bar.id = 'scrollProgressBar';
  bar.style.cssText = `
    position:fixed;top:0;left:0;height:2px;width:0%;
    background:linear-gradient(to right,#C5A059,#D4B068);
    z-index:9999;pointer-events:none;
    box-shadow:0 0 8px rgba(197,160,89,0.6);
    transition:width 0.05s linear;
  `;
  document.body.appendChild(bar);
}

function updateScrollProgress() {
  const bar = document.getElementById('scrollProgressBar');
  if (!bar) return;
  const total = document.documentElement.scrollHeight - window.innerHeight;
  const pct = clamp((scrollY / total) * 100, 0, 100);
  bar.style.width = pct + '%';
}

/* ============================================================
   GRAIN OVERLAY — subtle film grain texture
   ============================================================ */
function initGrainOverlay() {
  const grain = document.createElement('div');
  grain.id = 'grainOverlay';
  grain.style.cssText = `
    position:fixed;inset:0;z-index:9990;pointer-events:none;
    opacity:0.045;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size:256px 256px;
    animation:grainAnim 0.4s steps(3) infinite;
  `;
  document.body.appendChild(grain);

  const style = document.createElement('style');
  style.textContent = `
    @keyframes grainAnim {
      0%   { background-position: 0 0; }
      33%  { background-position: -3% -5%; }
      66%  { background-position: 5%  2%; }
      100% { background-position: -2%  4%; }
    }
  `;
  document.head.appendChild(style);
}

/* ============================================================
   CUSTOM CURSOR — gold dot + ring with lerp
   ============================================================ */
let mouseX = 0, mouseY = 0;
let dotX = 0,   dotY = 0;
let ringX = 0,  ringY = 0;
let cursorVisible = false;
let cursorHovered = false;
let cursorDot, cursorRing;

function initCustomCursor() {
  /* Only on non-touch devices */
  if (window.matchMedia('(hover: none)').matches) return;

  cursorDot = document.createElement('div');
  cursorDot.id = 'cursorDot';
  cursorDot.style.cssText = `
    position:fixed;top:0;left:0;width:8px;height:8px;
    background:#C5A059;border-radius:50%;pointer-events:none;
    z-index:99999;transform:translate(-50%,-50%) scale(0);
    transition:transform 0.15s ease,width 0.3s ease,height 0.3s ease,background 0.3s ease;
    will-change:transform,left,top;
  `;

  cursorRing = document.createElement('div');
  cursorRing.id = 'cursorRing';
  cursorRing.style.cssText = `
    position:fixed;top:0;left:0;width:38px;height:38px;
    border:1px solid rgba(197,160,89,0.45);border-radius:50%;
    pointer-events:none;z-index:99998;
    transform:translate(-50%,-50%) scale(0);
    transition:transform 0.3s ease,width 0.3s ease,height 0.3s ease,border-color 0.3s ease;
    will-change:transform,left,top;
  `;

  // Create text label inside cursor ring
  const label = document.createElement('span');
  label.id = 'cursorLabel';
  cursorRing.appendChild(label);

  document.body.appendChild(cursorDot);
  document.body.appendChild(cursorRing);

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!cursorVisible) {
      cursorVisible = true;
      cursorDot.style.transform = 'translate(-50%,-50%) scale(1)';
      cursorRing.style.transform = 'translate(-50%,-50%) scale(1)';
    }
  });

  document.addEventListener('mouseleave', () => {
    cursorVisible = false;
    cursorDot.style.transform = 'translate(-50%,-50%) scale(0)';
    cursorRing.style.transform = 'translate(-50%,-50%) scale(0)';
  });

  /* Hover state — enlarge ring on interactive elements and show label via event delegation */
  document.addEventListener('mouseover', e => {
    const el = e.target.closest('button, a, .accCard, .calendarDayCard, .calendarTimeSlot, .pillarCard, .painCard, .formInput');
    if (!el) return;

    cursorHovered = true;
    cursorRing.style.width  = '72px';
    cursorRing.style.height = '72px';
    cursorRing.style.borderColor = 'rgba(197,160,89,0.75)';
    cursorDot.style.background = '#D4B068';

    let text = '';
    if (el.classList.contains('closeModalButton')) {
      text = 'CLOSE';
    } else if (el.classList.contains('formInput')) {
      text = 'TYPE';
      cursorRing.style.borderColor = 'rgba(16,185,129,0.6)'; // emerald tint for inputs
    } else if (el.classList.contains('modalNextButton') || el.classList.contains('modalSubmitButton')) {
      text = 'NEXT';
    } else if (el.classList.contains('calendarDayCard') || el.classList.contains('calendarTimeSlot')) {
      text = 'SELECT';
    } else if (el.tagName === 'BUTTON' || el.classList.contains('loginLink')) {
      text = 'BOOK';
    } else if (el.classList.contains('accCard')) {
      text = 'OPEN';
    } else if (el.classList.contains('painCard') || el.classList.contains('pillarCard')) {
      text = 'TILT';
    }
    
    const labelEl = document.getElementById('cursorLabel');
    if (labelEl) {
      labelEl.textContent = text;
      labelEl.style.opacity = text ? '1' : '0';
    }
  });

  document.addEventListener('mouseout', e => {
    const el = e.target.closest('button, a, .accCard, .calendarDayCard, .calendarTimeSlot, .pillarCard, .painCard, .formInput');
    if (!el) return;

    cursorHovered = false;
    cursorRing.style.width  = '38px';
    cursorRing.style.height = '38px';
    cursorRing.style.borderColor = 'rgba(197,160,89,0.45)';
    cursorDot.style.background = '#C5A059';

    const labelEl = document.getElementById('cursorLabel');
    if (labelEl) {
      labelEl.style.opacity = '0';
    }
  });
}

function updateCursorLerp() {
  if (!cursorDot || !cursorRing) return;
  dotX  = lerp(dotX,  mouseX, 0.18);
  dotY  = lerp(dotY,  mouseY, 0.18);
  ringX = lerp(ringX, mouseX, 0.09);
  ringY = lerp(ringY, mouseY, 0.09);
  cursorDot.style.left  = dotX  + 'px';
  cursorDot.style.top   = dotY  + 'px';
  cursorRing.style.left = ringX + 'px';
  cursorRing.style.top  = ringY + 'px';
}

/* ============================================================
   MAGNETIC BUTTONS — CTA buttons attract to cursor
   ============================================================ */
function initMagneticButtons() {
  if (window.matchMedia('(hover: none)').matches) return;

  document.querySelectorAll('.primaryHeroButton, .actionButton').forEach(btn => {
    btn.style.transition = 'transform 0.4s cubic-bezier(0.25,1,0.5,1), background 0.35s ease, box-shadow 0.35s ease';
    btn.style.willChange = 'transform';

    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) * 0.38;
      const dy = (e.clientY - cy) * 0.38;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0,0)';
    });
  });
}

/* ============================================================
   MOUSE SPOTLIGHT — Stripe/Linear signature radial follow
   Updates CSS custom properties --mx --my on spotlight sections
   ============================================================ */
function initMouseSpotlight() {
  const spotlightSections = [
    document.querySelector('.finalCTASection')
  ].filter(Boolean);

  document.addEventListener('mousemove', e => {
    spotlightSections.forEach(section => {
      const rect = section.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      section.style.setProperty('--mx', `${x}px`);
      section.style.setProperty('--my', `${y}px`);
    });
  });
}

/* ============================================================
   HEADER SCROLL ANIMATION
   ============================================================ */
function updateHeaderScroll(sy) {
  const header = document.querySelector('.mainHeader');
  if (header) {
    header.classList.toggle('scrolled', sy > 40);
  }
}

/* ============================================================
   3D CARD TILT PHYSICS & SPOTLIGHT TRACKING
   ============================================================ */
function initCard3DTilt() {
  if (window.matchMedia('(hover: none)').matches) return;

  const cards = document.querySelectorAll('.painCard, .pillarCard, .valueCard, .accCard');

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--cx', `${x}px`);
      card.style.setProperty('--cy', `${y}px`);

      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const dx = x - cx;
      const dy = y - cy;

      const tiltX = -(dy / cy) * 8;
      const tiltY = (dx / cx) * 8;

      const isLiftCard = card.classList.contains('painCard') || card.classList.contains('pillarCard');
      const liftTranslate = isLiftCard ? 'translateY(-6px)' : '';

      card.style.transform = `perspective(1000px) ${liftTranslate} rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
      card.style.transition = 'transform 0.05s ease';
    });

    card.addEventListener('mouseleave', () => {
      const isLiftCard = card.classList.contains('painCard') || card.classList.contains('pillarCard');
      card.style.transform = isLiftCard ? 'translateY(0)' : '';
      card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
    });
  });
}



function initTextSplitting() {
  document.querySelectorAll('.splitText').forEach(el => {
    const isH = ['H2','H3','H4'].includes(el.tagName);
    let wordIndex = 0;

    function splitNode(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        const words = text.split(/(\s+)/);
        const fragment = document.createDocumentFragment();

        words.forEach(word => {
          if (word.trim() === '') {
            fragment.appendChild(document.createTextNode(word));
          } else {
            const wrapper = document.createElement('span');
            wrapper.style.cssText = `display:inline-block;overflow:hidden;vertical-align:bottom;margin-right:${isH ? '0.28em' : '0.22em'}`;
            
            const inner = document.createElement('span');
            inner.className = 'splitWord';
            inner.style.cssText = `display:inline-block;transform:translateY(110%);opacity:0;
              transition:transform 0.75s cubic-bezier(0.22,1,0.36,1) ${(wordIndex * 0.055).toFixed(3)}s,
                         opacity    0.6s  ease                        ${(wordIndex * 0.055).toFixed(3)}s;`;
            inner.textContent = word;
            
            wrapper.appendChild(inner);
            fragment.appendChild(wrapper);
            wordIndex++;
          }
        });
        node.parentNode.replaceChild(fragment, node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const children = Array.from(node.childNodes);
        children.forEach(child => splitNode(child));
      }
    }

    splitNode(el);
  });
}

function revealSplitText(el) {
  el.querySelectorAll('.splitWord').forEach(w => {
    w.style.transform = 'translateY(0)';
    w.style.opacity   = '1';
  });
}

/* ============================================================
   VIEWPORT DETECTION — IntersectionObserver
   ============================================================ */
function initViewportDetection() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;

      if (el.classList.contains('splitText')) {
        revealSplitText(el);
      } else {
        el.classList.add('visible');
      }

      observer.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  /* Section headers */
  document.querySelectorAll('.revealOnScroll').forEach(el => observer.observe(el));

  /* Split text elements */
  document.querySelectorAll('.splitText').forEach(el => observer.observe(el));

  /* Stagger items with delay based on sibling index */
  document.querySelectorAll('.staggerItem').forEach((el, i) => {
    const siblings = Array.from(el.parentElement.children).filter(c => c.classList.contains('staggerItem'));
    const idx = siblings.indexOf(el);
    el.style.transitionDelay = `${idx * 0.13}s`;
    observer.observe(el);
  });
}

/* ============================================================
   SECTION TILE DIMMING — sections darken when next slides over
   ============================================================ */
function initSectionTileTransitions() {
  /* Observer: when a tile section is >= 40% visible, dim the one before */
  const sections = document.querySelectorAll('.tileSection');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.target.dataset.dimTarget) return;
      const targetEl = document.getElementById(entry.target.dataset.dimTarget);
      if (!targetEl) return;
      if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
        targetEl.classList.add('dimming');
      } else if (!entry.isIntersecting) {
        targetEl.classList.remove('dimming');
      }
    });
  }, { threshold: [0.1, 0.3, 0.6] });

  sections.forEach(el => observer.observe(el));
}

function updateSectionTileDimming(sy) {
  /* Additional scroll-driven brightness on pain section as pillars enters */
  const pillars = document.getElementById('pillarsSection');
  const pain    = document.getElementById('painSection');
  if (!pillars || !pain) return;

  const rect  = pillars.getBoundingClientRect();
  const prog  = clamp(mapRange(rect.top, window.innerHeight, 0, 0, 1), 0, 1);
  const scale = lerp(1, 0.91, prog);
  const bright = lerp(1, 0.35, prog);
  const translateY = lerp(0, -40, prog);

  pain.style.transform = `scale(${scale}) translateY(${translateY}px)`;
  pain.style.filter    = `brightness(${bright})`;
  pain.style.transformOrigin = 'center bottom';
}

/* ============================================================
   GLOBE CANVAS — sphere with city lights morphing to network
   ============================================================ */
let laptopInstance = null;

function initLaptopCanvas() {
  const canvas = document.getElementById('laptopCanvas');
  if (!canvas) return;

  laptopInstance = new LaptopNetworkRenderer(canvas);
  laptopInstance.resize();
  laptopInstance.start();

  window.addEventListener('resize', () => {
    if (laptopInstance) laptopInstance.resize();
  });
}

function updateLaptopScroll(sy) {
  const start = window.innerHeight * 0.1;
  const end   = window.innerHeight * 0.8;
  const target = clamp(mapRange(sy, start, end, 0, 1), 0, 1);
  if (laptopInstance) {
    laptopInstance.scrollVal = target;
  }
}

class LaptopNetworkRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.nodes = [];
    this.connections = [];
    this.rafId = null;
    this.width = 0;
    this.height = 0;
    this.time = 0;
    this.scrollVal = 0;
    this.currentScroll = 0;
    
    this.initNetwork();
  }

  initNetwork() {
    this.nodes = [];
    const numSatellites = 40;
    
    // Core node
    this.coreNode = {
      x: 0,
      y: 0,
      baseRadius: 45,
      pulseSpeed: 0.04,
      pulseOffset: 0
    };

    // Satellite orbital nodes
    for (let i = 0; i < numSatellites; i++) {
      const angle = (i / numSatellites) * Math.PI * 2;
      const baseDist = 90 + Math.random() * 80;
      this.nodes.push({
        angle: angle,
        baseDist: baseDist,
        size: Math.random() * 2 + 1,
        speed: 0.003 + Math.random() * 0.005,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        pulseOffset: Math.random() * Math.PI * 2,
        // Drift directions for when core breaks apart on scroll
        driftX: (Math.random() - 0.5) * 350,
        driftY: 200 + Math.random() * 400
      });
    }
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    this.width = this.canvas.offsetWidth;
    this.height = this.canvas.offsetHeight;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);
  }

  start() {
    const tick = () => {
      this.currentScroll = lerp(this.currentScroll, this.scrollVal, 0.07);
      this.draw();
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  stop() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }

  draw() {
    const { ctx, width, height, currentScroll } = this;
    ctx.clearRect(0, 0, width, height);

    this.time += 1;

    // Center coordinates
    const cx = width / 2;
    const cy = height / 2;

    // Faint tech grid in background
    ctx.strokeStyle = 'rgba(197, 160, 89, 0.012)';
    ctx.lineWidth = 0.5;
    const gridSpacing = 45;
    for (let x = 0; x < width; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 1. Draw central Jarvis Core Sphere (Concept 3A)
    // As scroll progression (currentScroll) increases, core shrinks, dims, and drifts down
    const coreScale = clamp(1 - currentScroll * 1.5, 0, 1);
    if (coreScale > 0) {
      const coreY = cy + currentScroll * height * 0.4;
      const corePulse = Math.sin(this.time * this.coreNode.pulseSpeed) * 4 + this.coreNode.baseRadius;
      const coreR = corePulse * coreScale;
      const coreAlpha = (0.7 - currentScroll * 0.6) * (Math.sin(this.time * 0.02) * 0.15 + 0.85);

      // Central gold glow
      const radialGlow = ctx.createRadialGradient(cx, coreY, 0, cx, coreY, coreR * 2.8);
      radialGlow.addColorStop(0, `rgba(197, 160, 89, ${coreAlpha * 0.4})`);
      radialGlow.addColorStop(0.4, `rgba(197, 160, 89, ${coreAlpha * 0.15})`);
      radialGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = radialGlow;
      ctx.beginPath();
      ctx.arc(cx, coreY, coreR * 2.8, 0, Math.PI * 2);
      ctx.fill();

      // Core outer tech rings
      ctx.strokeStyle = `rgba(197, 160, 89, ${coreAlpha * 0.4})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, coreY, coreR * 1.2, this.time * 0.015, this.time * 0.015 + Math.PI * 1.3);
      ctx.stroke();

      ctx.strokeStyle = `rgba(212, 176, 104, ${coreAlpha * 0.25})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, coreY, coreR * 1.5, -this.time * 0.01, -this.time * 0.01 + Math.PI * 0.8);
      ctx.stroke();

      // Solid central orb
      ctx.fillStyle = `rgba(197, 160, 89, ${coreAlpha})`;
      ctx.beginPath();
      ctx.arc(cx, coreY, coreR * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Draw satellite orbital nodes & connection lines
    this.nodes.forEach(node => {
      // Rotation angle
      node.angle += node.speed * (1 - currentScroll * 0.8);
      
      // Calculate positions
      // Un-scrolled: pure orbit. Scrolled: nodes drift apart, dropping downward out of the scene
      const orbitX = cx + Math.cos(node.angle) * node.baseDist;
      const orbitY = cy + Math.sin(node.angle) * node.baseDist;
      
      const x = lerp(orbitX, orbitX + node.driftX, currentScroll);
      const y = lerp(orbitY, orbitY + node.driftY, currentScroll);

      // Node size & opacity
      const pulse = Math.sin(this.time * node.pulseSpeed + node.pulseOffset) * 0.4 + 0.6;
      const size = node.size * pulse;
      const alpha = (0.6 - currentScroll * 0.4) * pulse;

      if (alpha <= 0) return;

      // Connections back to the central core (only visible in early scroll stages)
      if (currentScroll < 0.6) {
        const coreY = cy + currentScroll * height * 0.4;
        const lineAlpha = (1 - currentScroll * 1.6) * 0.18;
        ctx.strokeStyle = `rgba(197, 160, 89, ${lineAlpha})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(cx, coreY);
        ctx.stroke();
      }

      // Draw node circle
      ctx.fillStyle = `rgba(212, 176, 104, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}

/* ============================================================
   PROOF SECTION — ANIMATED COUNTERS
   ============================================================ */
function initProofCounters() {
  const proofSection = document.getElementById('proofSection');
  if (!proofSection) return;

  let fired = false;

  function animateCount(el) {
    const target   = parseInt(el.dataset.target, 10);
    const suffix   = el.dataset.suffix || '+';
    const duration = 1800;
    const start    = performance.now();

    function update(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      const value    = Math.round(eased * target);
      // For large numbers, format cleanly
      const display  = target >= 1000 ? value.toLocaleString() : value;
      el.textContent = display + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !fired) {
        fired = true;
        document.querySelectorAll('.proofNumber').forEach(el => animateCount(el));
        observer.disconnect();
      }
    });
  }, { threshold: 0.35 });

  observer.observe(proofSection);
}

/* ============================================================
   HOW IT WORKS — STICKY SCROLL SLIDER
   ============================================================ */
let howCurrentSlide   = 0;

function initHowItWorksSlider() {
  goToHowStep(0);
}

function goToHowStep(idx) {
  const section = document.getElementById('howSection');
  if (!section) return;

  const slides = section.querySelectorAll('.howSlide');
  const dots = section.querySelectorAll('.hwDot');
  const fill = document.getElementById('howProgressFill');
  const total = slides.length;

  if (idx < 0 || idx >= total) return;

  slides.forEach((slide, i) => {
    slide.classList.toggle('active', i === idx);
  });

  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === idx);
  });

  if (fill) {
    fill.style.width = `${((idx + 1) / total) * 100}%`;
  }

  howCurrentSlide = idx;
}

function nextHowSlide() {
  const section = document.getElementById('howSection');
  if (!section) return;
  const slides = section.querySelectorAll('.howSlide');
  const nextIdx = (howCurrentSlide + 1) % slides.length;
  goToHowStep(nextIdx);
}

function prevHowSlide() {
  const section = document.getElementById('howSection');
  if (!section) return;
  const slides = section.querySelectorAll('.howSlide');
  const prevIdx = (howCurrentSlide - 1 + slides.length) % slides.length;
  goToHowStep(prevIdx);
}

/* ============================================================
   BOOKING MODAL — Open / Close / Steps
   ============================================================ */
function openBooking() {
  window.location.href = "https://n8n.themarketplace.co.nz/form/tmp-book-a-time";
}

function closeBooking() {
  const overlay = document.getElementById('modalOverlay');
  const video = document.getElementById('modalTransitionVideo');
  const modal = document.querySelector('.bookingModal');

  if (overlay) {
    overlay.style.display = 'none';
    overlay.classList.remove('active-blur');
    resetBookingSteps();

    if (video) {
      video.pause();
      video.style.opacity = '0';
    }
    if (modal) {
      modal.style.opacity = '0';
      modal.style.transform = 'scale(0.88)';
      modal.style.pointerEvents = 'none';
    }
  }
}

function resetBookingSteps() {
  showStep(1);
  ['leadName','leadEmail','leadCompany','leadUrl','selectedBookingDate','selectedBookingTime']
    .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
}

function showStep(n) {
  [1,2,3].forEach(i => {
    const el = document.getElementById(`modalStep${i}`);
    if (el) el.style.display = i === n ? 'block' : 'none';
  });
  [1,2,3].forEach(i => {
    const dot = document.getElementById(`dot${i}`);
    if (dot) dot.classList.toggle('active', i === n);
  });
}

function nextStep(n) {
  if (n === 2) {
    const name  = (document.getElementById('leadName')  || {}).value?.trim();
    const email = (document.getElementById('leadEmail') || {}).value?.trim();
    if (!name || !email)          return showFieldError('Please enter your name and email to continue.');
    if (!isValidEmail(email))     return showFieldError('Please enter a valid email address.');
  }
  if (n === 3) {
    const company = (document.getElementById('leadCompany') || {}).value?.trim();
    if (!company) return showFieldError('Please enter your business name to continue.');
    buildUrgencyCalendar();
  }
  showStep(n);
}

function isValidEmail(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

function showFieldError(msg) {
  let el = document.getElementById('fieldErrorMsg');
  if (!el) {
    el = document.createElement('p');
    el.id = 'fieldErrorMsg';
    el.style.cssText = 'color:#A0392A;font-size:13px;margin-top:10px;text-align:center;';
  }
  el.textContent = msg;
  const active = document.querySelector('.modalStep[style*="block"]') || document.getElementById('modalStep1');
  if (active && !active.contains(el)) active.appendChild(el);
  setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 3500);
}

/* ============================================================
   URGENCY CALENDAR
   ============================================================ */
function buildUrgencyCalendar() {
  const datesRow  = document.getElementById('calendarDaysRow');
  const slotsGrid = document.getElementById('calendarSlotsGrid');
  if (!datesRow || !slotsGrid) return;

  datesRow.innerHTML  = '';
  slotsGrid.innerHTML = '';
  availableBookingDates = [];

  let cursor = new Date();
  cursor.setDate(cursor.getDate() + 1);
  while (availableBookingDates.length < 3) {
    const d = cursor.getDay();
    if (d !== 0 && d !== 5 && d !== 6) availableBookingDates.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  availableBookingDates.forEach((date, i) => {
    const card = document.createElement('div');
    card.className = `calendarDayCard${i === 0 ? ' active' : ''}`;
    card.onclick   = () => selectBookingDate(i, card);
    card.innerHTML = `
      <span class="calendarDayName">${date.toLocaleDateString('en-NZ',{weekday:'short'})} ${date.toLocaleDateString('en-NZ',{month:'short'})}</span>
      <span class="calendarDayNumber">${date.getDate()}</span>`;
    datesRow.appendChild(card);
  });

  selectBookingDate(0);
}

function selectBookingDate(idx, cardEl) {
  document.querySelectorAll('.calendarDayCard').forEach(c => c.classList.remove('active'));
  if (cardEl) cardEl.classList.add('active');
  else { const fc = document.querySelector('.calendarDayCard'); if (fc) fc.classList.add('active'); }

  const chosen     = availableBookingDates[idx];
  const dateString = chosen.toLocaleDateString('en-NZ',{year:'numeric',month:'long',day:'numeric'});
  const dateEl     = document.getElementById('selectedBookingDate');
  if (dateEl) dateEl.value = dateString;

  const slotsGrid = document.getElementById('calendarSlotsGrid');
  if (!slotsGrid) return;
  slotsGrid.innerHTML = '';

  const times     = ['9:00 AM','10:30 AM','12:00 PM','2:00 PM','3:30 PM'];
  const fallback  = { 0:[1,3], 1:[0,4], 2:[2] };

  times.forEach((slot, si) => {
    let busy = busySlots.length
      ? busySlots.some(s => s.date === dateString && s.time === slot)
      : (fallback[idx] || []).includes(si);

    const el = document.createElement('div');
    el.className = `calendarTimeSlot${busy ? ' allocated' : ''}`;
    el.textContent = slot;
    if (!busy) el.onclick = () => selectBookingTime(slot, el);
    else el.title = 'Already allocated';
    slotsGrid.appendChild(el);
  });

  const timeEl = document.getElementById('selectedBookingTime');
  if (timeEl) timeEl.value = '';
}

function selectBookingTime(t, el) {
  document.querySelectorAll('.calendarTimeSlot').forEach(s => s.classList.remove('active'));
  el.classList.add('active');
  const timeEl = document.getElementById('selectedBookingTime');
  if (timeEl) timeEl.value = t;
}

/* ============================================================
   SUBMIT BOOKING
   ============================================================ */
function submitBooking() {
  const get = id => (document.getElementById(id) || {}).value?.trim() || '';
  const name        = get('leadName');
  const email       = get('leadEmail');
  const company     = get('leadCompany');
  const url         = get('leadUrl');
  const bookingDate = get('selectedBookingDate');
  const bookingTime = get('selectedBookingTime');

  if (!bookingDate || !bookingTime) return showFieldError('Please select a date and time to confirm your call.');

  const payload = {
    name, email, company,
    website: url,
    packageSelection: 'Strategy Call',
    allocatedDate: bookingDate,
    allocatedTime: bookingTime,
    source: 'TMP Website',
    location: 'Hamilton, NZ'
  };

  closeBooking();
  showBookingConfirmation(name, bookingDate, bookingTime);

  fetch('https://hook.us2.make.com/t2glxhhce8zfnnyxny1ipk3cjz1iy9m6', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(r => console.log('Lead routed:', r.status))
  .catch(e => console.warn('Webhook queued for retry:', e.message));
}

function showBookingConfirmation(name, date, time) {
  const overlay = document.createElement('div');
  overlay.style.cssText = `position:fixed;inset:0;z-index:9100;background:rgba(0,0,0,0.92);
    backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;padding:20px;`;
  overlay.innerHTML = `
    <div style="background:rgba(20,20,24,0.98);border:1px solid rgba(197,160,89,0.18);
      border-radius:20px;padding:52px 44px;max-width:440px;width:100%;text-align:center;font-family:'Inter',sans-serif;">
      <div style="width:56px;height:56px;border:2px solid #C5A059;border-radius:50%;
        display:flex;align-items:center;justify-content:center;margin:0 auto 28px;font-size:22px;color:#C5A059;">
        &#10003;
      </div>
      <h3 style="font-family:'Playfair Display',serif;font-size:24px;color:#F0F0F0;margin-bottom:12px;">
        Confirmed, ${name}
      </h3>
      <div style="width:40px;height:2px;background:#C5A059;margin:0 auto 20px;"></div>
      <p style="color:#9CA3AF;font-size:15px;line-height:1.7;margin-bottom:6px;">Your strategy call is locked in for</p>
      <p style="color:#C5A059;font-size:16px;font-weight:600;margin-bottom:24px;">${date} at ${time}</p>
      <p style="color:#6B7280;font-size:13px;line-height:1.65;">
        A confirmation email is on its way. We will research your business before we speak.
      </p>
      <button onclick="this.closest('div[style]').remove()" style="margin-top:28px;padding:13px 36px;
        background:#C5A059;color:#0A0A0C;font-weight:700;border:none;border-radius:10px;cursor:pointer;
        font-size:13px;text-transform:uppercase;letter-spacing:1.5px;font-family:'Inter',sans-serif;">
        Done
      </button>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
}

/* ============================================================
   BUSY SLOTS FROM GOOGLE SHEET
   ============================================================ */
function fetchBusySlots() {
  const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQVeZa6G3lgVY7gtODdNDBmwl33TGJLmaakKJeJjY-EqYkWiR1QIPLCSVLDfsaqjQPoNr8M2WjZm1_I/pub?gid=0&single=true&output=csv';
  fetch(url)
    .then(r => { if (!r.ok) throw new Error('Sheet unavailable'); return r.text(); })
    .then(csv => { busySlots = parseCSV(csv); })
    .catch(() => { /* fall through to fallback pattern */ });
}

function parseCSV(text) {
  if (!text) return [];
  const lines = text.split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = csvLine(lines[0]);
  const di = headers.findIndex(h => h.toLowerCase().trim() === 'allocateddate');
  const ti = headers.findIndex(h => h.toLowerCase().trim() === 'allocatedtime');
  if (di === -1 || ti === -1) return [];
  return lines.slice(1).filter(l => l.trim()).map(l => {
    const row = csvLine(l);
    return row[di] && row[ti] ? { date: row[di].trim(), time: row[ti].trim() } : null;
  }).filter(Boolean);
}

function csvLine(line) {
  const res = []; let cur = ''; let inQ = false;
  for (const ch of line) {
    if (ch === '"') { inQ = !inQ; }
    else if (ch === ',' && !inQ) { res.push(cur); cur = ''; }
    else { cur += ch; }
  }
  res.push(cur);
  return res;
}

/* ============================================================
   MEMBER LOGIN PORTAL
   ============================================================ */
function openPortal() {
  const overlay = document.getElementById('loginModalOverlay');
  if (overlay) {
    overlay.style.display = 'flex';
    const inp = document.getElementById('memberPasscode');
    if (inp) { inp.value = ''; setTimeout(() => inp.focus(), 80); }
    const err = document.getElementById('loginError');
    if (err) err.style.display = 'none';
  }
}

function closeLoginModal() {
  const overlay = document.getElementById('loginModalOverlay');
  if (overlay) overlay.style.display = 'none';
}

function handleLoginKey(e) { if (e.key === 'Enter') submitMemberLogin(); }

function submitMemberLogin() {
  const passcode = (document.getElementById('memberPasscode') || {}).value?.trim();
  const err      = document.getElementById('loginError');
  if (!passcode) return;

  if (passcode === 'ledger-copper-9590') {
    if (err) err.style.display = 'none';
    closeLoginModal();
    window.open('sopo-studio/index.html', '_blank');
  } else if (passcode === 'ridge-brook-1021') {
    if (err) err.style.display = 'none';
    closeLoginModal();
    window.open('paddy-studio/index.html', '_blank');
  } else if (passcode === 'falcon-lantern-3463') {
    if (err) err.style.display = 'none';
    closeLoginModal();
    localStorage.setItem('jarvisGateUnlocked', 'true');
    window.open('command_station.html', '_blank');
  } else {
    if (err) err.style.display = 'block';
  }
}
