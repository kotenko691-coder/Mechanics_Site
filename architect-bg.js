/* architect-bg.js - \u0410\u0440\u0445\u0456\u0442\u0435\u043a\u0442\u0443\u0440\u043d\u0435 \u043a\u0440\u0435\u0441\u043b\u0435\u043d\u043d\u044f (\u0441\u0456\u0440\u0438\u0439 / \u0433\u0440\u0430\u0444\u0456\u0442\u043e\u0432\u0438\u0439 \u0441\u0442\u0438\u043b\u044c) */
function applyArchitectBackground() {
  if (document.getElementById("architect-bg")) return;
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  const c = document.createElement("canvas");
  c.id = "architect-bg";
  Object.assign(c.style, {
    position: "fixed", top: "0", left: "0",
    width: "100%", height: "100%",
    zIndex: "-1", pointerEvents: "none"
  });
  document.body.prepend(c);

  const ctx = c.getContext("2d");
  let W, H;

  // \u041f\u0430\u043b\u0456\u0442\u0440\u0430: \u0433\u0440\u0430\u0444\u0456\u0442, \u0441\u0432\u0456\u0442\u043b\u043e-\u0441\u0456\u0440\u0438\u0439 \u0444\u043e\u043d, \u0437\u043e\u043b\u043e\u0442\u0438\u0439 \u0430\u043a\u0446\u0435\u043d\u0442
  const BG_LIGHT = "#eef2f6", BG_DARK = "#e2e8f0";
  const GRID_FINE = "rgba(148, 163, 184, 0.18)";
  const GRID_MAIN = "rgba(100, 116, 139, 0.28)";
  const GRAPHITE = "rgba(51, 65, 85, 0.45)";
  const GOLD_ACCENT = "rgba(217, 119, 6, 0.75)";

  let particles = [], structures = [];

  function layout() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    c.width = W * dpr; c.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // \u0413\u0440\u0430\u0444\u0456\u0442\u043e\u0432\u0456 \u0432\u0443\u0437\u043b\u0438 \u0432\u0438\u043c\u0456\u0440\u044e\u0432\u0430\u043d\u044c
    particles = Array.from({ length: Math.floor((W * H) / 16000) }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 2 + 1
    }));

    // \u0410\u0440\u0445\u0456\u0442\u0435\u043a\u0442\u0443\u0440\u043d\u0456 \u043a\u0430\u0440\u043a\u0430\u0441\u0438 \u0437 \u0440\u043e\u0437\u043c\u0456\u0440\u043d\u0438\u043c\u0438 \u043b\u0456\u043d\u0456\u044f\u043c\u0438
    structures = Array.from({ length: 6 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H * 0.7 + H * 0.2,
      w: Math.random() * 70 + 50,
      h: Math.random() * 90 + 60,
      rot: (Math.random() - 0.5) * 0.1,
      vRot: (Math.random() - 0.5) * 0.001,
      type: Math.floor(Math.random() * 3) // 0 - \u0431\u0443\u0434\u0456\u0432\u043b\u044f, 1 - \u0444\u0435\u0440\u043c\u0430, 2 - \u0430\u0440\u043a\u0430
    }));

    if (reduce) drawFrame(); // \u0431\u0435\u0437 \u0430\u043d\u0456\u043c\u0430\u0446\u0456\u0457 \u2014 \u043e\u0434\u043d\u043e\u0440\u0430\u0437\u043e\u0432\u0430 \u043f\u0435\u0440\u0435\u043c\u0430\u043b\u044c\u043e\u0432\u043a\u0430 \u043f\u0440\u0438 \u0437\u043c\u0456\u043d\u0456 \u0440\u043e\u0437\u043c\u0456\u0440\u0443
  }

  // \u041c\u0456\u043b\u0456\u043c\u0435\u0442\u0440\u0456\u0432\u043a\u0430
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

  // \u041e\u0431'\u0454\u043a\u0442 \u043a\u0440\u0435\u0441\u043b\u0435\u043d\u043d\u044f \u0437 \u0432\u0438\u043d\u043e\u0441\u043d\u0438\u043c\u0438 \u0440\u043e\u0437\u043c\u0456\u0440\u043d\u0438\u043c\u0438 \u043b\u0456\u043d\u0456\u044f\u043c\u0438
  function drawStructure(st) {
    ctx.save();
    ctx.translate(st.x, st.y);
    ctx.rotate(st.rot);
    ctx.strokeStyle = GRAPHITE;
    ctx.lineWidth = 1.2;

    const w = st.w, h = st.h;

    ctx.beginPath();
    if (st.type === 0) {
      // \u0411\u0443\u0434\u0456\u0432\u043b\u044f \u0437 \u0444\u0430\u0441\u0430\u0434\u043d\u043e\u044e \u0441\u0456\u0442\u043a\u043e\u044e
      ctx.rect(-w / 2, -h / 2, w, h);
      for (let ix = -w / 2 + 10; ix < w / 2 - 5; ix += 15) {
        for (let iy = -h / 2 + 10; iy < h / 2 - 5; iy += 20) {
          ctx.rect(ix, iy, 8, 12);
        }
      }
    } else if (st.type === 1) {
      // \u0424\u0435\u0440\u043c\u0430 \u0434\u0430\u0445\u0443
      ctx.moveTo(-w / 2, h / 2); ctx.lineTo(0, -h / 2); ctx.lineTo(w / 2, h / 2); ctx.closePath();
      ctx.moveTo(-w / 4, h / 2); ctx.lineTo(0, -h / 4); ctx.lineTo(w / 4, h / 2);
      ctx.moveTo(0, -h / 2); ctx.lineTo(0, h / 2);
    } else {
      // \u0410\u0440\u043a\u0430
      ctx.arc(0, h / 2, w / 2, Math.PI, 0, false);
      ctx.moveTo(-w / 2, h / 2); ctx.lineTo(-w / 2, -h / 4);
      ctx.moveTo(w / 2, h / 2); ctx.lineTo(w / 2, -h / 4);
    }
    ctx.stroke();

    // \u0420\u043e\u0437\u043c\u0456\u0440\u043d\u0456 \u043b\u0456\u043d\u0456\u0457
    ctx.strokeStyle = GOLD_ACCENT;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    // \u043f\u043e \u0448\u0438\u0440\u0438\u043d\u0456
    ctx.moveTo(-w / 2, h / 2 + 12); ctx.lineTo(w / 2, h / 2 + 12);
    ctx.moveTo(-w / 2, h / 2 + 7); ctx.lineTo(-w / 2, h / 2 + 17);
    ctx.moveTo(w / 2, h / 2 + 7); ctx.lineTo(w / 2, h / 2 + 17);
    // \u043f\u043e \u0432\u0438\u0441\u043e\u0442\u0456
    ctx.moveTo(-w / 2 - 12, -h / 2); ctx.lineTo(-w / 2 - 12, h / 2);
    ctx.moveTo(-w / 2 - 17, -h / 2); ctx.lineTo(-w / 2 - 7, -h / 2);
    ctx.moveTo(-w / 2 - 17, h / 2); ctx.lineTo(-w / 2 - 7, h / 2);
    ctx.stroke();

    ctx.restore();
  }

  function drawFrame() {
    // \u0413\u0440\u0430\u0434\u0456\u0454\u043d\u0442\u043d\u0438\u0439 \u0444\u043e\u043d (\u0435\u0444\u0435\u043a\u0442 \u043a\u0440\u0435\u0441\u043b\u044f\u0440\u0441\u044c\u043a\u043e\u0433\u043e \u0441\u0442\u043e\u043b\u0443)
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, BG_LIGHT);
    g.addColorStop(1, BG_DARK);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    drawEngineeringGrid();

    structures.forEach(st => {
      if (!reduce) {
        st.rot += st.vRot;
        st.y -= 0.12;
        if (st.y < -150) {
          st.y = H + 150;
          st.x = Math.random() * W;
        }
      }
      drawStructure(st);
    });

    // \u0412\u0443\u0437\u043b\u0438 \u0442\u0430 \u043b\u0456\u043d\u0456\u0457 \u0437\u0432'\u044f\u0437\u043a\u0456\u0432 \u043c\u0456\u0436 \u043d\u0438\u043c\u0438
    ctx.lineWidth = 0.8;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (!reduce) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
      }

      ctx.fillStyle = GRAPHITE;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x, dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 110) {
          ctx.strokeStyle = "rgba(71, 85, 105, " + ((1 - dist / 110) * 0.25) + ")";
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
        }
      }
    }
  }

  function loop() {
    drawFrame();
    if (!reduce) requestAnimationFrame(loop);
  }

  window.addEventListener("resize", layout);
  layout();
  if (!reduce) requestAnimationFrame(loop);
}

// \u0421\u043a\u0440\u0438\u043f\u0442 \u043f\u0456\u0434\u043a\u043b\u044e\u0447\u0435\u043d\u043e \u0437 defer, \u0442\u043e\u043c\u0443 DOM \u043c\u043e\u0436\u0435 \u0431\u0443\u0442\u0438 \u0432\u0436\u0435 \u0433\u043e\u0442\u043e\u0432\u0438\u0439
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", applyArchitectBackground);
} else {
  applyArchitectBackground();
}
