/* ==========================================================
   ЖИВИЙ ФОН: ПРУЖНА ФЕРМА
   Сітка вузлів зі стержнями реагує на курсор, клік і скрол.
   Розтягнуті стержні світяться бурштином, стиснуті синіють,
   як на розрахунковій схемі ферми.

   Підключення: перед </body> на кожній сторінці додай
   <script src="background.js"></script>
   ========================================================== */
(function main() {
  'use strict';
  if (!document.body) { document.addEventListener('DOMContentLoaded', main, { once: true }); return; }

  /* Налаштування. Можна перекрити: window.MECH_BG = { R: 200 } до підключення скрипта */
  const CFG = Object.assign({
    cell: [56, 88],   // мін. і макс. розмір комірки, px
    R: 140,           // радіус дії курсору
    push: 0.3,        // сила відштовхування курсором
    damp: 0.985,      // згасання коливань
    anchor: 0.004,    // повернення вузла на місце
    stiff: 0.45,      // жорсткість стержнів
    iters: 3,         // точність розрахунку стержнів
    wave: 0.012,      // фонове «дихання» ферми
    blast: 9,         // сила хвилі від кліку
    arrows: true      // стрілки сил, що повертають вузли
  }, window.MECH_BG || {});

  /* Кольори беруться зі style.css (--ink, --amber ...) */
  const css = getComputedStyle(document.documentElement);
  const rgb = (name, fb) => {
    let h = (css.getPropertyValue(name).trim() || fb).replace('#', '');
    if (h.length === 3) h = [...h].map(c => c + c).join('');
    const n = parseInt(h, 16);
    return [n >> 16 & 255, n >> 8 & 255, n & 255].join(',');
  };
  const INK = rgb('--ink', '#12284a');
  const BLUE = rgb('--ink-soft', '#1d3f73');
  const AMB = rgb('--amber', '#f5a300');
  const AMBD = rgb('--amber-dark', '#b97800');

  const cv = document.createElement('canvas');
  cv.id = 'mech-bg';
  cv.setAttribute('aria-hidden', 'true');
  cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none';
  document.body.prepend(cv);
  const ctx = cv.getContext('2d');

  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mouse = { x: -1e4, y: -1e4, on: false };
  let W, H, nodes = [], edges = [], lastScroll = scrollY, last = performance.now();

  function build() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cell = Math.max(CFG.cell[0], Math.min(CFG.cell[1], W / 16));
    const cols = Math.ceil(W / cell) + 3, rows = Math.ceil(H / cell) + 3;
    const ox = (W - (cols - 1) * cell) / 2, oy = (H - (rows - 1) * cell) / 2;
    nodes = []; edges = [];

    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const x = ox + i * cell, y = oy + j * cell;
      nodes.push({ x, y, px: x, py: y, rx: x, ry: y, pin: i === 0 || j === 0 || i === cols - 1 || j === rows - 1 });
    }
    const id = (i, j) => nodes[j * cols + i];
    const link = (a, b) => edges.push({ a, b, len: Math.hypot(a.rx - b.rx, a.ry - b.ry) });
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      if (i < cols - 1) link(id(i, j), id(i + 1, j));
      if (j < rows - 1) link(id(i, j), id(i, j + 1));
      if (i < cols - 1 && j < rows - 1)           // розкоси, як у ферми Воррена
        (i + j) % 2 ? link(id(i, j), id(i + 1, j + 1)) : link(id(i + 1, j), id(i, j + 1));
    }
  }

  function physics(t) {
    for (const n of nodes) {
      if (n.pin) continue;
      const vx = (n.x - n.px) * CFG.damp, vy = (n.y - n.py) * CFG.damp;
      n.px = n.x; n.py = n.y;
      n.x += vx; n.y += vy;
      n.x += (n.rx - n.x) * CFG.anchor; n.y += (n.ry - n.y) * CFG.anchor;
      n.x += Math.sin(t * 0.0006 + n.ry * 0.012) * CFG.wave;
      n.y += Math.cos(t * 0.0005 + n.rx * 0.014) * CFG.wave;
      if (mouse.on) {
        const dx = n.x - mouse.x, dy = n.y - mouse.y, d = Math.hypot(dx, dy);
        if (d < CFG.R && d > 0.5) {
          const f = (1 - d / CFG.R) ** 2 * CFG.push;
          n.x += dx / d * f; n.y += dy / d * f;
        }
      }
    }
    for (let k = 0; k < CFG.iters; k++) for (const e of edges) {
      const { a, b } = e;
      let dx = b.x - a.x, dy = b.y - a.y;
      const d = Math.hypot(dx, dy) || 1, diff = (d - e.len) / d * CFG.stiff * 0.5;
      dx *= diff; dy *= diff;
      if (!a.pin) { a.x += dx; a.y += dy; }
      if (!b.pin) { b.x -= dx; b.y -= dy; }
    }
  }

  function arrow(x0, y0, x1, y1) {
    const a = Math.atan2(y1 - y0, x1 - x0);
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x1, y1);
    ctx.lineTo(x1 - 7 * Math.cos(a - 0.45), y1 - 7 * Math.sin(a - 0.45));
    ctx.lineTo(x1 - 7 * Math.cos(a + 0.45), y1 - 7 * Math.sin(a + 0.45));
    ctx.closePath(); ctx.fill();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = 'round';

    // спокійні стержні одним контуром
    ctx.beginPath();
    const loaded = [];
    for (const e of edges) {
      const s = (Math.hypot(e.b.x - e.a.x, e.b.y - e.a.y) - e.len) / e.len;
      if (Math.abs(s) < 0.012) { ctx.moveTo(e.a.x, e.a.y); ctx.lineTo(e.b.x, e.b.y); }
      else loaded.push([e, s]);
    }
    ctx.strokeStyle = `rgba(${INK},.22)`; ctx.lineWidth = 1; ctx.stroke();

    // навантажені стержні: розтяг бурштиновий, стиск синій
    for (const [e, s] of loaded) {
      const m = Math.min(Math.abs(s) * 14, 1);
      ctx.strokeStyle = s > 0 ? `rgba(${AMB},${0.3 + m * 0.65})` : `rgba(${BLUE},${0.25 + m * 0.6})`;
      ctx.lineWidth = 1.2 + m * 2;
      ctx.beginPath(); ctx.moveTo(e.a.x, e.a.y); ctx.lineTo(e.b.x, e.b.y); ctx.stroke();
    }

    // вузли та стрілки сил, що повертають вузол на місце
    for (const n of nodes) {
      const dx = n.rx - n.x, dy = n.ry - n.y, d = Math.hypot(dx, dy);
      if (d > 6 && !n.pin) {
        if (CFG.arrows) {
          const L = Math.min(d * 0.8, 38);
          ctx.strokeStyle = ctx.fillStyle = `rgba(${AMBD},.85)`; ctx.lineWidth = 1.6;
          arrow(n.x, n.y, n.x + dx / d * L, n.y + dy / d * L);
        }
        ctx.beginPath(); ctx.arc(n.x, n.y, 3.4, 0, 7);
        ctx.fillStyle = `rgb(${AMB})`; ctx.fill();
        ctx.strokeStyle = `rgb(${INK})`; ctx.lineWidth = 1.5; ctx.stroke();
      } else {
        ctx.beginPath(); ctx.arc(n.x, n.y, 2, 0, 7);
        ctx.fillStyle = `rgba(${INK},.5)`; ctx.fill();
      }
    }

    // зона дії курсору
    if (mouse.on) {
      ctx.setLineDash([5, 6]); ctx.lineWidth = 1.2; ctx.strokeStyle = `rgba(${AMBD},.4)`;
      ctx.beginPath(); ctx.arc(mouse.x, mouse.y, CFG.R, 0, 7); ctx.stroke(); ctx.setLineDash([]);
    }
  }

  function loop(now) {
    const steps = Math.max(1, Math.min(3, Math.round((now - last) / 16.67)));
    last = now;
    for (let i = 0; i < steps; i++) physics(now);
    draw();
    requestAnimationFrame(loop);
  }

  // хвиля від кліку: вузли отримують імпульс від точки удару
  function blast(x, y) {
    for (const n of nodes) {
      const dx = n.x - x, dy = n.y - y, d = Math.hypot(dx, dy);
      if (d < 340 && d > 1) {
        const f = (1 - d / 340) ** 1.5 * CFG.blast;
        n.px -= dx / d * f; n.py -= dy / d * f;
      }
    }
  }

  addEventListener('pointermove', e => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.on = true; });
  addEventListener('pointerdown', e => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.on = e.pointerType !== 'touch'; if (!still) blast(e.clientX, e.clientY); });
  addEventListener('pointerup', e => { if (e.pointerType === 'touch') mouse.on = false; });
  document.addEventListener('pointerleave', () => { mouse.on = false; });
  addEventListener('scroll', () => {
    const dy = Math.max(-200, Math.min(200, scrollY - lastScroll));
    lastScroll = scrollY;
    for (const n of nodes) n.py -= dy * 0.04 * (0.5 + 0.5 * Math.sin(n.rx * 0.01));
  }, { passive: true });

  let rt;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { build(); if (still) draw(); }, 150); });

  build();
  if (still) draw(); else requestAnimationFrame(loop);
  console.info('Фон «пружна ферма»: запущено');
})();
