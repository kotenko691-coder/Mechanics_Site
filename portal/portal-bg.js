/* Живий фон кабінету студента: для кожного розділу своя тема.
   formulas — формули механіки плавають на кресленні (вхід, лекції)
   city     — міські будівлі й баштовий кран (рейтинг)
   gears    — шестерні, що крутяться (завдання)
   grid     — спокійна технічна сітка з лінійками (кабінет викладача)
   Головна сторінка сайту має власний фон (background.js), цей файл її не чіпає. */
(function () {
  'use strict';
  if (!document.body) return;
  var css = getComputedStyle(document.documentElement);
  function rgb(name, fb) {
    var h = (css.getPropertyValue(name).trim() || fb).replace('#', '');
    if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
    var n = parseInt(h, 16);
    return [n >> 16 & 255, n >> 8 & 255, n & 255].join(',');
  }
  var INK = rgb('--ink', '#12284a'), AMB = rgb('--amber', '#f5a300'), STEEL = rgb('--steel', '#556580');

  var cv = document.createElement('canvas');
  cv.id = 'portal-bg';
  cv.setAttribute('aria-hidden', 'true');
  cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none;transition:opacity .35s';
  document.body.prepend(cv);
  var ctx = cv.getContext('2d');
  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W = 0, H = 0, theme = 'formulas', t0 = performance.now(), raf = 0, items = [];

  function rand(a, b) { return a + Math.random() * (b - a); }

  /* ---------- побудова елементів теми ---------- */
  var FORMULAS = ['F = m·a', 'ΣM = 0', 'ΣF = 0', 'σ = N / A', 'M = F·d', 'R_A + R_B = F', 'Δl = N·l / E·A', 'x_c = ΣA·x / ΣA', 'τ = Q / A', 'W = b·h² / 6'];
  function build() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    items = [];
    var n, i;
    if (theme === 'formulas') {
      n = Math.max(8, Math.round(W * H / 90000));
      for (i = 0; i < n; i++) items.push({ x: rand(0, W), y: rand(0, H), s: rand(15, 24), v: rand(6, 14), a: rand(0.07, 0.14), f: FORMULAS[i % FORMULAS.length], k: i % 3 });
    } else if (theme === 'gears') {
      n = Math.max(6, Math.round(W * H / 110000));
      for (i = 0; i < n; i++) {
        var r = rand(26, 90);
        items.push({ x: rand(0, W), y: rand(0, H), r: r, teeth: Math.round(r / 5) + 6, w: rand(0.12, 0.3) * (i % 2 ? 1 : -1), ph: rand(0, 6.28), a: rand(0.06, 0.12), amb: i % 4 === 0 });
      }
    } else if (theme === 'city') {
      var x = -20;
      while (x < W + 40) {
        var bw = rand(46, 110), bh = rand(H * 0.12, H * 0.42);
        items.push({ x: x, w: bw, h: bh, rows: Math.floor(bh / 22), cols: Math.max(2, Math.floor(bw / 22)), seed: Math.random() });
        x += bw + rand(4, 18);
      }
    }
  }

  /* ---------- малювання ---------- */
  function gearPath(c, r, teeth) {
    var inner = r * 0.78, step = Math.PI * 2 / teeth;
    c.beginPath();
    for (var i = 0; i < teeth; i++) {
      var a = i * step;
      c.lineTo(Math.cos(a - step * 0.28) * inner, Math.sin(a - step * 0.28) * inner);
      c.lineTo(Math.cos(a - step * 0.16) * r, Math.sin(a - step * 0.16) * r);
      c.lineTo(Math.cos(a + step * 0.16) * r, Math.sin(a + step * 0.16) * r);
      c.lineTo(Math.cos(a + step * 0.28) * inner, Math.sin(a + step * 0.28) * inner);
    }
    c.closePath();
  }

  function drawFormulas(t, dt) {
    ctx.textBaseline = 'middle';
    items.forEach(function (it) {
      it.y -= it.v * dt; it.x += Math.sin(t * 0.4 + it.s) * 3 * dt;
      if (it.y < -40) { it.y = H + 40; it.x = rand(0, W); }
      ctx.font = '600 ' + it.s + 'px "IBM Plex Sans", sans-serif';
      ctx.fillStyle = 'rgba(' + (it.k === 0 ? AMB : INK) + ',' + it.a + ')';
      ctx.fillText(it.f, it.x, it.y);
      if (it.k === 1) { // стрілка сили поруч
        ctx.strokeStyle = 'rgba(' + AMB + ',' + it.a + ')'; ctx.lineWidth = 2;
        var ax = it.x - 18, ay = it.y;
        ctx.beginPath(); ctx.moveTo(ax, ay + 18); ctx.lineTo(ax, ay - 12); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ax - 5, ay - 5); ctx.lineTo(ax, ay - 13); ctx.lineTo(ax + 5, ay - 5); ctx.stroke();
      }
    });
  }

  function drawGears(t) {
    items.forEach(function (g) {
      ctx.save(); ctx.translate(g.x, g.y); ctx.rotate(g.ph + t * g.w);
      gearPath(ctx, g.r, g.teeth);
      ctx.fillStyle = 'rgba(' + (g.amb ? AMB : STEEL) + ',' + (g.a * 0.7) + ')';
      ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(' + (g.amb ? AMB : INK) + ',' + (g.a + 0.06) + ')'; ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, g.r * 0.28, 0, 6.283); ctx.stroke();
      ctx.restore();
    });
  }

  function drawCity(t) {
    var base = H;
    // небо: легка смуга на горизонті
    var grad = ctx.createLinearGradient(0, H * 0.45, 0, H);
    grad.addColorStop(0, 'rgba(' + AMB + ',0)'); grad.addColorStop(1, 'rgba(' + AMB + ',0.10)');
    ctx.fillStyle = grad; ctx.fillRect(0, H * 0.45, W, H * 0.55);
    items.forEach(function (b) {
      var y = base - b.h;
      ctx.fillStyle = 'rgba(' + INK + ',0.10)'; ctx.fillRect(b.x, y, b.w, b.h);
      ctx.strokeStyle = 'rgba(' + INK + ',0.18)'; ctx.lineWidth = 1.5; ctx.strokeRect(b.x, y, b.w, b.h);
      for (var r = 0; r < b.rows; r++) for (var c = 0; c < b.cols; c++) {
        var wx = b.x + 8 + c * ((b.w - 16) / b.cols), wy = y + 10 + r * 22;
        var on = ((Math.sin(b.seed * 100 + r * 7.3 + c * 3.1) + 1) / 2) > 0.62;
        ctx.fillStyle = on ? 'rgba(' + AMB + ',' + (0.22 + 0.08 * Math.sin(t * 0.8 + r + c)) + ')' : 'rgba(' + INK + ',0.07)';
        ctx.fillRect(wx, wy, Math.max(6, (b.w - 16) / b.cols - 6), 12);
      }
    });
    // баштовий кран
    var cx = W * 0.8, top = H * 0.2, bot = H;
    ctx.strokeStyle = 'rgba(' + AMB + ',0.45)'; ctx.fillStyle = 'rgba(' + AMB + ',0.45)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(cx, bot); ctx.lineTo(cx, top); ctx.stroke();
    for (var y2 = top; y2 < bot; y2 += 26) { ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(cx - 7, y2); ctx.lineTo(cx + 7, y2 + 26); ctx.moveTo(cx + 7, y2); ctx.lineTo(cx - 7, y2 + 26); ctx.stroke(); }
    var sway = Math.sin(t * 0.35) * 0.035;
    ctx.save(); ctx.translate(cx, top); ctx.rotate(sway);
    ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-W * 0.14, 0); ctx.lineTo(W * 0.1, 0); ctx.stroke();
    ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, -34); ctx.lineTo(-W * 0.14, 0); ctx.moveTo(0, -34); ctx.lineTo(W * 0.1, 0); ctx.moveTo(0, 0); ctx.lineTo(0, -34); ctx.stroke();
    var lx = -W * 0.1, ly = 70 + Math.sin(t * 0.6) * 22;
    ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx, ly); ctx.stroke();
    ctx.fillRect(lx - 14, ly, 28, 20);
    ctx.restore();
  }

  function drawGrid(t) {
    ctx.strokeStyle = 'rgba(' + INK + ',0.10)'; ctx.lineWidth = 1;
    var step = 40, off = (t * 6) % step;
    for (var x = -off; x < W; x += step) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (var y = 0; y < H; y += step) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    // лінійки по краях
    ctx.strokeStyle = 'rgba(' + AMB + ',0.5)'; ctx.lineWidth = 2;
    for (var k = 0; k < W; k += 20) { ctx.beginPath(); ctx.moveTo(k, 0); ctx.lineTo(k, k % 100 === 0 ? 18 : 9); ctx.stroke(); }
    for (var j = 0; j < H; j += 20) { ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(j % 100 === 0 ? 18 : 9, j); ctx.stroke(); }
  }

  function frame(now) {
    var t = (now - t0) / 1000, dt = Math.min(0.1, (now - (frame.last || now)) / 1000); frame.last = now;
    ctx.clearRect(0, 0, W, H);
    if (theme === 'formulas') drawFormulas(t, dt);
    else if (theme === 'gears') drawGears(t);
    else if (theme === 'city') drawCity(t);
    else drawGrid(t);
    if (!still && !document.hidden) raf = requestAnimationFrame(frame); else raf = 0;
  }
  function start() { if (!raf) raf = requestAnimationFrame(frame); }

  var resizeT;
  addEventListener('resize', function () { clearTimeout(resizeT); resizeT = setTimeout(function () { build(); if (still || !raf) { frame.last = 0; raf = requestAnimationFrame(frame); } }, 150); });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) start(); });

  function set(name) {
    if (name === theme && items.length) return;
    theme = name;
    cv.style.opacity = '0';
    setTimeout(function () { build(); frame.last = 0; cv.style.opacity = '1'; if (!raf) start(); }, 180);
  }

  build(); start();
  window.PortalBG = { set: set };
})();
