/* architect-bg.js - Professional Architectural Blueprint (Gray / Graphite Style) */
function applyArchitectBackground() {
  if (document.getElementById("architect-bg")) return;
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const c = document.createElement("canvas");
  c.id = "architect-bg";
  Object.assign(c.style, { position: "fixed", inset: "0", width: "100%", height: "100%", zIndex: "-1", pointerEvents: "none" });
  document.body.prepend(c);
  
  const ctx = c.getContext("2d");
  let W, H;

  // Елегантна сіра палітра: графіт, світло-сірий фон, контрастний темно-сірий та золотий акцент
  const BG_LIGHT = "#eef2f6", BG_DARK = "#e2e8f0";
  const GRID_FINE = "rgba(148, 163, 184, 0.18)";
  const GRID_MAIN = "rgba(100, 116, 139, 0.28)";
  const GRAPHITE = "rgba(51, 65, 85, 0.45)";
  const GOLD_ACCENT = "rgba(217, 119, 6, 0.75)";

  let particles = [], structures = [];

  function layout() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    c.width = W * dpr; c.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Графітовий пил / вузли вимірювань
    particles = Array.from({ length: Math.floor((W * H) / 16000) }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 2 + 1
    }));

    // Архітектурні каркаси з розмірними лініями
    structures = Array.from({ length: 6 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H * 0.7 + H * 0.2,
      w: Math.random() * 70 + 50,
      h: Math.random() * 90 + 60,
      rot: (Math.random() - 0.5) * 0.1,
      vRot: (Math.random() - 0.5) * 0.001,
      type: Math.floor(Math.random() * 3) // 0 - вежа, 1 - ферма/міст, 2 - арка
    }));
  }

  layout();
  addEventListener("resize", layout);

  // Малювання міліметрівки
  function drawEngineeringGrid() {
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = GRID_FINE;
    const fineStep = 15;
    ctx.beginPath();
    for (let x = 0; x <= W; x += fineStep) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
    for (let y = 0; y <= H; y += fineStep) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
    ctx.stroke();

    ctx.lineWidth = 1;
    ctx.strokeStyle = GRID_MAIN;
    const mainStep = 75;
    ctx.beginPath();
    for (let x = 0; x <= W; x += mainStep) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
    for (let y = 0; y <= H; y += mainStep) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
    ctx.stroke();
  }

  // Малювання об'єкта креслення з виносними розмірними лініями
  function drawStructure(st) {
    ctx.save();
    ctx.translate(st.x, st.y);
    ctx.rotate(st.rot);
    ctx.strokeStyle = GRAPHITE;
    ctx.lineWidth = 1.2;

    const w = st.w, h = st.h;

    ctx.beginPath();
    if (st.type === 0) {
      // Будівля з фасадними сітками
      ctx.rect(-w/2, -h/2, w, h);
      // Віконні пройми / модулі
      for (let ix = -w/2 + 10; ix < w/2 - 5; ix += 15) {
        for (let iy = -h/2 + 10; iy < h/2 - 5; iy += 20) {
          ctx.rect(ix, iy, 8, 12);
        }
      }
    } else if (st.type === 1) {
      // Ферма даху / мостова конструкція
      ctx.moveTo(-w/2, h/2); ctx.lineTo(0, -h/2); ctx.lineTo(w/2, h/2); ctx.closePath();
      ctx.moveTo(-w/4, h/2); ctx.lineTo(0, -h/4); ctx.lineTo(w/4, h/2);
      ctx.moveTo(0, -h/2); ctx.lineTo(0, h/2);
    } else {
      // Купол / арка
      ctx.arc(0, h/2, w/2, Math.PI, 0, false);
      ctx.moveTo(-w/2, h/2); ctx.lineTo(-w/2, -h/4);
      ctx.moveTo(w/2, h/2); ctx.lineTo(w/2, -h/4);
    }
    ctx.stroke();

    // Виносні розмірні лінії (акцент розробника/архітектора)
    ctx.strokeStyle = GOLD_ACCENT;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    // Виноска по ширині W
    ctx.moveTo(-w/2, h/2 + 12); ctx.lineTo(w/2, h/2 + 12);
    ctx.moveTo(-w/2, h/2 + 7); ctx.lineTo(-w/2, h/2 + 17);
    ctx.moveTo(w/2, h/2 + 7); ctx.lineTo(w/2, h/2 + 17);
    // Виноска по висоті H
    ctx.moveTo(-w/2 - 12, -h/2); ctx.lineTo(-w/2 - 12, h/2);
    ctx.moveTo(-w/2 - 17, -h/2); ctx.lineTo(-w/2 - 7, -h/2);
    ctx.moveTo(-w/2 - 17, h/2); ctx.lineTo(-w/2 - 7, h/2);
    ctx.stroke();

    ctx.restore();
  }

  function frame() {
    // Градієнтний сірий фон (ефект креслярського столу)
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, BG_LIGHT);
    g.addColorStop(1, BG_DARK);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    drawEngineeringGrid();

    // Рух та візуалізація архітектурних концепцій
    structures.forEach(st => {
      st.rot += st.vRot;
      st.y -= 0.12;
      if (st.y < -150) {
        st.y = H + 150;
        st.x = Math.random() * W;
      }
      drawStructure(st);
    });

    // Графітові лінії зв'язків між точки-вимірами
    for (let i = 0; i < particles.length; i++) {
      let p = particles[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

      ctx.fillStyle = GRAPHITE;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        let p2 = particles[j];
        let dx = p.x - p2.x, dy = p.y - p2.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 110) {
          ctx.strokeStyle = `rgba(71, 85, 105, ${(1 - dist / 110) * 0.25})`;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
        }
      }
    }

    if (!reduce) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

document.addEventListener("DOMContentLoaded", () => {
  applyArchitectBackground();
});
