// File is pure ASCII (Cyrillic written as \uXXXX escapes) so it works in ANY encoding.
const mechanicsTextbooks = [
  {
    id: "building-mechanics-practical",
    title: "\u0411\u0443\u0434\u0456\u0432\u0435\u043b\u044c\u043d\u0430 \u043c\u0435\u0445\u0430\u043d\u0456\u043a\u0430. \u041f\u0440\u0430\u043a\u0442\u0438\u043a\u0443\u043c",
    authors: ["\u0422.\u0412. \u041a\u043e\u0441\u0435\u043d\u043a\u043e", "\u0421.\u041c. \u0421\u0442\u043e\u0432\u043f\u043d\u0438\u043a", "\u041b.\u0412. \u0428\u0430\u0439\u0434\u0435\u0446\u044c\u043a\u0430"],
    publisher: "\u041a\u041f\u0406 \u0456\u043c. \u0406\u0433\u043e\u0440\u044f \u0421\u0456\u043a\u043e\u0440\u0441\u044c\u043a\u043e\u0433\u043e",
    year: 2022,
    purpose: "\u0413\u043e\u043b\u043e\u0432\u043d\u0438\u0439 \u043f\u0440\u0430\u043a\u0442\u0438\u0447\u043d\u0438\u0439 \u043f\u043e\u0441\u0456\u0431\u043d\u0438\u043a \u0434\u043b\u044f \u043e\u0441\u0432\u043e\u0454\u043d\u043d\u044f \u043c\u0435\u0442\u043e\u0434\u0456\u0432 \u0440\u043e\u0437\u0440\u0430\u0445\u0443\u043d\u043a\u0443 \u0441\u0442\u0430\u0442\u0438\u0447\u043d\u043e \u0432\u0438\u0437\u043d\u0430\u0447\u0443\u0432\u0430\u043d\u0438\u0445 \u0441\u0442\u0435\u0440\u0436\u043d\u0435\u0432\u0438\u0445 \u0441\u0438\u0441\u0442\u0435\u043c.",
    topics: [
      "\u041a\u0456\u043d\u0435\u043c\u0430\u0442\u0438\u0447\u043d\u0438\u0439 \u0430\u043d\u0430\u043b\u0456\u0437 \u043f\u043b\u043e\u0441\u043a\u0438\u0445 \u0441\u0438\u0441\u0442\u0435\u043c \u0456 \u0432\u0438\u0437\u043d\u0430\u0447\u0435\u043d\u043d\u044f \u0441\u0442\u0443\u043f\u0435\u043d\u044f \u0441\u0432\u043e\u0431\u043e\u0434\u0438",
      "\u0420\u043e\u0437\u0440\u0430\u0445\u0443\u043d\u043e\u043a \u043e\u043f\u043e\u0440\u043d\u0438\u0445 \u0440\u0435\u0430\u043a\u0446\u0456\u0439 \u0434\u0432\u043e\u0445\u043e\u043f\u043e\u0440\u043d\u0438\u0445 \u0431\u0430\u043b\u043e\u043a",
      "\u041f\u043e\u0441\u0442\u0440\u043e\u0454\u043d\u043d\u044f \u0435\u043f\u044e\u0440 \u0432\u043d\u0443\u0442\u0440\u0456\u0448\u043d\u0456\u0445 \u0441\u0438\u043b\u043e\u0432\u0438\u0445 \u0444\u0430\u043a\u0442\u043e\u0440\u0456\u0432 (M, Q, N) \u0434\u043b\u044f \u043e\u0434\u043d\u043e\u043f\u0440\u043e\u043b\u044c\u043e\u0442\u043d\u0438\u0445 \u0442\u0430 \u0431\u0430\u0433\u0430\u0442\u043e\u043f\u0440\u043e\u043b\u044c\u043e\u0442\u043d\u0438\u0445 \u0431\u0430\u043b\u043e\u043a, \u0430 \u0442\u0430\u043a\u043e\u0436 \u043c\u0435\u0442\u043e\u0434 \u043b\u0456\u043d\u0456\u0439 \u0432\u043f\u043b\u0438\u0432\u0443",
      "\u0420\u043e\u0437\u0440\u0430\u0445\u0443\u043d\u043e\u043a \u0442\u0440\u0438\u0448\u0430\u0440\u043d\u0456\u0440\u043d\u0438\u0445 \u0430\u0440\u043e\u043a, \u043f\u043b\u043e\u0441\u043a\u0438\u0445 \u0440\u0430\u043c \u0456 \u0444\u0435\u0440\u043c (\u0441\u043f\u043e\u0441\u0456\u0431 \u0432\u0438\u0440\u0456\u0437\u0430\u043d\u043d\u044f \u0432\u0443\u0437\u043b\u0456\u0432)"
    ]
  },
  {
    id: "strength-of-materials",
    title: "\u041e\u043f\u0456\u0440 \u043c\u0430\u0442\u0435\u0440\u0456\u0430\u043b\u0456\u0432",
    authors: ["\u0410.\u0410. \u0421\u043a\u0440\u0435\u0431\u0446\u043e\u0432", "\u041f.\u041a. \u0428\u0442\u0430\u043d\u044c\u043a\u043e", "\u041e.\u0421. \u041e\u043c\u0435\u043b\u044c\u0447\u0435\u043d\u043a\u043e"],
    publisher: "\u041d\u0423 \u00ab\u0417\u0430\u043f\u043e\u0440\u0456\u0437\u044c\u043a\u0430 \u043f\u043e\u043b\u0456\u0442\u0435\u0445\u043d\u0456\u043a\u0430\u00bb / \u0421\u0422\u0410\u0422\u0423\u0421",
    year: 2022,
    purpose: "\u0424\u0443\u043d\u0434\u0430\u043c\u0435\u043d\u0442\u0430\u043b\u044c\u043d\u0438\u0439 \u043f\u043e\u0441\u0456\u0431\u043d\u0438\u043a \u0434\u043b\u044f \u0456\u043d\u0436\u0435\u043d\u0435\u0440\u043d\u0438\u0445 \u0440\u043e\u0437\u0440\u0430\u0445\u0443\u043d\u043a\u0456\u0432 \u043d\u0430 \u043c\u0456\u0446\u043d\u0456\u0441\u0442\u044c, \u0436\u043e\u0440\u0441\u0442\u043a\u0456\u0441\u0442\u044c \u0456 \u0441\u0442\u0456\u0439\u043a\u0456\u0441\u0442\u044c \u0435\u043b\u0435\u043c\u0435\u043d\u0442\u0456\u0432 \u043a\u043e\u043d\u0441\u0442\u0440\u0443\u043a\u0446\u0456\u0439.",
    topics: [
      "\u0413\u0435\u043e\u043c\u0435\u0442\u0440\u0438\u0447\u043d\u0456 \u0445\u0430\u0440\u0430\u043a\u0442\u0435\u0440\u0438\u0441\u0442\u0438\u043a\u0438 \u043f\u043b\u043e\u0441\u043a\u0438\u0445 \u043f\u0435\u0440\u0435\u0440\u0456\u0437\u0456\u0432 (\u0441\u0442\u0430\u0442\u0438\u0447\u043d\u0456 \u043c\u043e\u043c\u0435\u043d\u0442\u0438, \u043c\u043e\u043c\u0435\u043d\u0442\u0438 \u0456\u043d\u0435\u0440\u0446\u0456\u0457)",
      "\u0412\u043d\u0443\u0442\u0440\u0456\u0448\u043d\u0456 \u0441\u0438\u043b\u0438, \u043c\u0435\u0442\u043e\u0434 \u043f\u0435\u0440\u0435\u0440\u0456\u0437\u0456\u0432 \u0442\u0430 \u043d\u0430\u043f\u0440\u0443\u0436\u0435\u043d\u043d\u044f",
      "\u041e\u0441\u043d\u043e\u0432\u043d\u0456 \u0432\u0438\u0434\u0438 \u0434\u0435\u0444\u043e\u0440\u043c\u0430\u0446\u0456\u0439: \u0440\u043e\u0437\u0442\u044f\u0433\u0430\u043d\u043d\u044f/\u0441\u0442\u0438\u0441\u043a\u0430\u043d\u043d\u044f, \u0437\u0441\u0443\u0432, \u043a\u0440\u0443\u0447\u0435\u043d\u043d\u044f, \u0437\u0433\u0438\u043d\u0430\u043d\u043d\u044f",
      "\u0421\u043a\u043b\u0430\u0434\u043d\u0438\u0439 \u043e\u043f\u0456\u0440, \u0435\u043d\u0435\u0440\u0433\u0435\u0442\u0438\u0447\u043d\u0456 \u043c\u0435\u0442\u043e\u0434\u0438 \u0432\u0438\u0437\u043d\u0430\u0447\u0435\u043d\u043d\u044f \u043f\u0435\u0440\u0435\u043c\u0456\u0449\u0435\u043d\u044c, \u0441\u0442\u0456\u0439\u043a\u0456\u0441\u0442\u044c \u0441\u0442\u0438\u0441\u043d\u0443\u0442\u0438\u0445 \u0441\u0442\u0435\u0440\u0436\u043d\u0456\u0432 \u0442\u0430 \u0440\u043e\u0437\u0440\u0430\u0445\u0443\u043d\u043a\u0438 \u043f\u0440\u0438 \u0434\u0438\u043d\u0430\u043c\u0456\u0447\u043d\u0438\u0445 \u043d\u0430\u0432\u0430\u043d\u0442\u0430\u0436\u0435\u043d\u043d\u044f\u0445"
    ],
    features: "\u041c\u0456\u0441\u0442\u0438\u0442\u044c \u0434\u043e\u0432\u0456\u0434\u043a\u043e\u0432\u0456 \u043c\u0430\u0442\u0435\u0440\u0456\u0430\u043b\u0438: \u0442\u0430\u0431\u043b\u0438\u0446\u0456 \u0441\u043e\u0440\u0442\u0430\u043c\u0435\u043d\u0442\u0443 \u043f\u0440\u043e\u043a\u0430\u0442\u043d\u043e\u0457 \u0441\u0442\u0430\u043b\u0456 (\u0434\u0432\u043e\u0442\u0430\u0432\u0440\u0438, \u0448\u0432\u0435\u043b\u0435\u0440\u0438, \u043a\u0443\u0442\u043d\u0438\u043a\u0438) \u0442\u0430 \u0444\u043e\u0440\u043c\u0443\u043b\u0438 \u0437 \u043c\u0430\u0442\u0435\u043c\u0430\u0442\u0438\u043a\u0438."
  },
  {
    id: "theoretical-mechanics-part1",
    title: "\u0422\u0435\u043e\u0440\u0435\u0442\u0438\u0447\u043d\u0430 \u0442\u0430 \u043f\u0440\u0438\u043a\u043b\u0430\u0434\u043d\u0430 \u043c\u0435\u0445\u0430\u043d\u0456\u043a\u0430. \u0427\u0430\u0441\u0442\u0438\u043d\u0430 1. \u0422\u0435\u043e\u0440\u0435\u0442\u0438\u0447\u043d\u0430 \u043c\u0435\u0445\u0430\u043d\u0456\u043a\u0430",
    authors: ["\u0412.\u0413. \u0428\u0435\u0432\u0447\u0435\u043d\u043a\u043e", "\u0410.\u0414. \u0424\u0443\u0440\u0441\u0456\u043d\u0430", "\u0421.\u041e. \u0428\u0443\u043c\u0438\u043a\u0456\u043d", "\u0421.\u042e. \u041a\u0440\u0443\u0436\u043d\u043e\u0432\u0430"],
    publisher: "\u041d\u0423 \u00ab\u0417\u0430\u043f\u043e\u0440\u0456\u0437\u044c\u043a\u0430 \u043f\u043e\u043b\u0456\u0442\u0435\u0445\u043d\u0456\u043a\u0430\u00bb",
    year: 2022,
    purpose: "\u0411\u0430\u0437\u043e\u0432\u0430 \u0442\u0435\u043e\u0440\u0435\u0442\u0438\u0447\u043d\u0430 \u043f\u0456\u0434\u0433\u043e\u0442\u043e\u0432\u043a\u0430 \u0437 \u0440\u043e\u0437\u0434\u0456\u043b\u0456\u0432 \u0441\u0442\u0430\u0442\u0438\u043a\u0438 \u0442\u0430 \u043a\u0456\u043d\u0435\u043c\u0430\u0442\u0438\u043a\u0438.",
    topics: [
      "\u041e\u0441\u043d\u043e\u0432\u043d\u0456 \u043f\u043e\u043d\u044f\u0442\u0442\u044f \u0442\u0430 \u0430\u043a\u0441\u0456\u043e\u043c\u0438 \u0441\u0442\u0430\u0442\u0438\u043a\u0438, \u0437\u0430\u043a\u043e\u043d\u0438 \u041d\u044c\u044e\u0442\u043e\u043d\u0430",
      "\u0412\u0438\u0434\u0438 \u0432'\u044f\u0437\u0435\u0439, \u0441\u0438\u0441\u0442\u0435\u043c\u0430 \u0437\u0431\u0456\u0436\u043d\u0438\u0445 \u0441\u0438\u043b",
      "\u041f\u043e\u043d\u044f\u0442\u0442\u044f \u043f\u0430\u0440\u0438 \u0441\u0438\u043b, \u043c\u043e\u043c\u0435\u043d\u0442\u0438 \u0441\u0438\u043b \u0432\u0456\u0434\u043d\u043e\u0441\u043d\u043e \u0442\u043e\u0447\u043a\u0438",
      "\u0420\u0456\u0432\u043d\u044f\u043d\u043d\u044f \u0442\u0430 \u0443\u043c\u043e\u0432\u0438 \u0440\u0456\u0432\u043d\u043e\u0432\u0430\u0433\u0438 \u043f\u043b\u043e\u0441\u043a\u043e\u0457 \u0441\u0438\u0441\u0442\u0435\u043c\u0438 \u0441\u0438\u043b",
      "\u041a\u0456\u043d\u0435\u043c\u0430\u0442\u0438\u043a\u0430 \u0442\u043e\u0447\u043a\u0438 \u0456 \u0442\u0432\u0435\u0440\u0434\u043e\u0433\u043e \u0442\u0456\u043b\u0430 (\u0448\u0432\u0438\u0434\u043a\u0456\u0441\u0442\u044c, \u043f\u0440\u0438\u0441\u043a\u043e\u0440\u0435\u043d\u043d\u044f, \u043f\u043b\u043e\u0441\u043a\u043e\u043f\u0430\u0440\u0430\u043b\u0435\u043b\u044c\u043d\u0438\u0439 \u0440\u0443\u0445)"
    ],
    features: "\u0410\u0434\u0430\u043f\u0442\u043e\u0432\u0430\u043d\u043e \u0434\u043b\u044f \u0432\u0438\u0432\u0447\u0435\u043d\u043d\u044f \u043c\u0430\u0442\u0435\u0440\u0456\u0430\u043b\u0443 \u0443\u043a\u0440\u0430\u0457\u043d\u0441\u044c\u043a\u043e\u044e \u0442\u0430 \u0430\u043d\u0433\u043b\u0456\u0439\u0441\u044c\u043a\u043e\u044e \u043c\u043e\u0432\u0430\u043c\u0438."
  }
];

/* ===== ANIMATED BACKGROUND ===== */
// Usage: applyBeautifulBackground('light') or applyBeautifulBackground('dark')
const BG_THEMES = {
  light: { g: ['#eaf3fc', '#dcebfa', '#eef7f1'], grid: 'rgba(49,130,206,0.08)', gridBig: 'rgba(49,130,206,0.15)',
           shape: '43,108,176', beam: '43,108,176', text: '#1a365d', card: 'rgba(255,255,255,0.82)', sub: '#4a5568' },
  dark:  { g: ['#0b1f3a', '#16396b', '#1f2f5c'], grid: 'rgba(120,180,255,0.07)', gridBig: 'rgba(120,180,255,0.15)',
           shape: '160,205,255', beam: '140,200,255', text: '#e6f0ff', card: 'rgba(20,40,80,0.65)', sub: '#a9c2e6' }
};

function applyBeautifulBackground(theme = 'light') {
  if (document.getElementById('bg-canvas')) return;
  const T = BG_THEMES[theme] || BG_THEMES.light;
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  const c = document.createElement('canvas');
  c.id = 'bg-canvas';
  Object.assign(c.style, { position: 'fixed', inset: '0', width: '100%', height: '100%', zIndex: '-1', pointerEvents: 'none' });
  document.body.prepend(c);
  document.body.style.background = 'transparent';
  document.documentElement.style.backgroundColor = T.g[0];
  const glass = document.createElement('style');
  glass.textContent = `.card { background: ${T.card}; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }`;
  document.head.appendChild(glass);
  const ctx = c.getContext('2d');
  let W, H;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    c.width = W * dpr; c.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  addEventListener('resize', resize);

  // Drifting elements: I-beams, channels, formulas, gears and flying books
  const FORMULAS = [
    '\u03c3 = M / W', 'v = 5qL\u2074 / 384EI', '\u03a3F = 0', '\u03a3M = 0', '\u03c4 = QS / Ib',
    'M = qL\u00b2 / 8', 'E = \u03c3 / \u03b5', 'F = m\u00b7a', '\u03b4 = FL / EA',
    'P = \u03c0\u00b2EI / L\u00b2', 'RA + RB = qL', 'I = bh\u00b3 / 12', 'W = I / y',
    '\u03c3 \u2264 [\u03c3]', 'v \u2264 L / 250', '\u03b5 = \u0394L / L', 'M = F\u00b7d'
  ];
  const KINDS = ['beam', 'channel', 'formula', 'formula', 'formula', 'book', 'gear', 'formula', 'book'];
  const shapes = Array.from({ length: 48 }, (_, i) => {
    const kind = KINDS[i % KINDS.length];
    const z = 0.45 + Math.random() * 0.85;                    // depth: far = smaller, fainter, slower
    const boost = (kind === 'formula' || kind === 'book') ? 1.6 : 1;
    return {
      kind, z, ph: Math.random() * 6.28,
      x: Math.random(), y: Math.random(),
      s: (20 + Math.random() * 26) * z,
      r: kind === 'formula' ? (Math.random() - 0.5) * 0.6 : Math.random() * 6.28,
      vr: (Math.random() - 0.5) * 0.003,
      vx: (Math.random() - 0.5) * 0.00008 * z,
      vy: (-0.00003 - Math.random() * 0.00007) * z,
      a: Math.min(0.5, (0.10 + Math.random() * 0.14) * boost * Math.min(1, z + 0.2)),
      txt: FORMULAS[Math.floor(Math.random() * FORMULAS.length)]
    };
  });

  function drawShape(s, type) {
    const b = s * 0.5, t = s * 0.12, w = s * 0.09;
    ctx.fillRect(-b / 2, -s / 2, b, t);
    ctx.fillRect(-b / 2, s / 2 - t, b, t);
    if (type === 0) ctx.fillRect(-w / 2, -s / 2, w, s);       // I-beam
    else ctx.fillRect(-b / 2, -s / 2, w * 1.4, s);            // channel
  }

  function drawGear(s) {
    const r = s * 0.42, teeth = 8;
    ctx.lineWidth = s * 0.16;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
    for (let i = 0; i < teeth; i++) {
      ctx.save(); ctx.rotate(i * 2 * Math.PI / teeth);
      ctx.fillRect(-s * 0.07, -r - s * 0.17, s * 0.14, s * 0.2);
      ctx.restore();
    }
    ctx.beginPath(); ctx.arc(0, 0, s * 0.08, 0, Math.PI * 2); ctx.fill();
  }

  // open book with two flapping wings
  function drawBook(s, flap) {
    const w = s * 0.95, h = s * 0.6, lift = flap * s * 0.38;
    ctx.translate(0, -h / 2);
    ctx.lineWidth = Math.max(1, s * 0.04);
    for (const d of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(d * w, -lift);
      ctx.lineTo(d * w, h - lift); ctx.lineTo(0, h); ctx.closePath();
      ctx.fill(); ctx.stroke();
      for (let k = 1; k <= 3; k++) {                          // lines of text on the pages
        const f = k / 4;
        ctx.beginPath();
        ctx.moveTo(d * w * 0.15, h * f + (-lift) * 0.15 * 0 + 0);
        ctx.lineTo(d * w * 0.85, h * f - lift * 0.85);
        ctx.stroke();
      }
    }
  }

  function drawGrid() {
    for (const [step, col] of [[20, T.grid], [100, T.gridBig]]) {
      ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.beginPath();
      for (let x = 0; x <= W; x += step) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, H); }
      for (let y = 0; y <= H; y += step) { ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5); }
      ctx.stroke();
    }
  }

  function arrow(x, y1, y2, a) {
    ctx.strokeStyle = ctx.fillStyle = `rgba(${T.beam},${a})`; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x, y2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y2); ctx.lineTo(x - 6, y2 - 11); ctx.lineTo(x + 6, y2 - 11); ctx.fill();
  }

  // Beam that periodically sags under load
  function drawBeam(t) {
    const x0 = W * 0.1, x1 = W * 0.9, L = x1 - x0, baseY = H - 80, h = 10;
    const amp = reduce ? 28 : (0.5 - 0.5 * Math.cos(t * 0.0012)) * 42;
    const yAt = x => baseY + amp * Math.sin(Math.PI * (x - x0) / L);
    const N = 60;
    ctx.beginPath();
    for (let i = 0; i <= N; i++) { const x = x0 + L * i / N; i ? ctx.lineTo(x, yAt(x) - h) : ctx.moveTo(x, yAt(x) - h); }
    for (let i = N; i >= 0; i--) { const x = x0 + L * i / N; ctx.lineTo(x, yAt(x) + h); }
    ctx.closePath();
    ctx.fillStyle = `rgba(${T.beam},0.16)`; ctx.fill();
    ctx.strokeStyle = `rgba(${T.beam},0.55)`; ctx.lineWidth = 2.5; ctx.stroke();

    for (let k = 1; k <= 7; k++) {                              // load arrows q
      const x = x0 + L * k / 8;
      arrow(x, baseY - 85, yAt(x) - h - 2, 0.45);
    }
    ctx.strokeStyle = `rgba(${T.beam},0.45)`; ctx.beginPath();
    ctx.moveTo(x0 + L / 8, baseY - 85); ctx.lineTo(x0 + L * 7 / 8, baseY - 85); ctx.stroke();

    for (const x of [x0, x1]) {                                 // supports
      ctx.fillStyle = `rgba(${T.beam},0.25)`; ctx.strokeStyle = `rgba(${T.beam},0.6)`;
      ctx.beginPath(); ctx.moveTo(x, baseY + h); ctx.lineTo(x - 14, baseY + h + 24); ctx.lineTo(x + 14, baseY + h + 24);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }
  }

  function frame(t) {
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, T.g[0]); g.addColorStop(0.55, T.g[1]); g.addColorStop(1, T.g[2]);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    const glow = ctx.createRadialGradient(W * 0.15, H * 0.1, 0, W * 0.15, H * 0.1, W * 0.5);
    glow.addColorStop(0, `rgba(${T.shape},0.22)`); glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);

    drawGrid();

    for (const e of shapes) {
      if (!reduce) {
        e.x += e.vx + (e.kind === 'book' ? 0.00014 * e.z : 0);
        e.y += e.vy + (e.kind === 'book' ? Math.sin(t * 0.0007 + e.ph) * 0.00007 : 0);
        e.r += e.kind === 'gear' ? e.vr * 3 : (e.kind === 'formula' || e.kind === 'book' ? 0 : e.vr);
        if (e.y < -0.12) e.y = 1.12; if (e.y > 1.12) e.y = -0.12;
        if (e.x < -0.15) e.x = 1.15; if (e.x > 1.15) e.x = -0.15;
      }
      ctx.save();
      ctx.translate(e.x * W, e.y * H);
      const col = `rgba(${T.shape},${e.a})`;
      ctx.fillStyle = col; ctx.strokeStyle = `rgba(${T.shape},${Math.min(0.7, e.a * 1.8)})`;
      if (e.kind === 'formula') {
        ctx.rotate(e.r + Math.sin(t * 0.0005 + e.ph) * 0.05);
        ctx.font = `italic ${Math.round(12 + e.s * 0.75)}px "Cambria Math","Times New Roman",serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(e.txt, 0, 0);
      } else if (e.kind === 'book') {
        ctx.rotate(Math.sin(t * 0.0008 + e.ph) * 0.18);
        drawBook(e.s * 1.2, reduce ? 0.3 : Math.sin(t * 0.004 + e.ph));
      } else if (e.kind === 'gear') {
        ctx.rotate(e.r); drawGear(e.s);
      } else {
        ctx.rotate(e.r); drawShape(e.s, e.kind === 'beam' ? 0 : 1);
      }
      ctx.restore();
    }
    drawBeam(t);
    if (!reduce) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ===== TEXTBOOK CARDS ===== */
function renderTextbooks(containerId = 'textbooks', theme = 'light') {
  const T = BG_THEMES[theme] || BG_THEMES.light;
  let box = document.getElementById(containerId);
  if (!box) { box = document.createElement('main'); box.id = containerId; document.body.appendChild(box); }

  const css = document.createElement('style');
  css.textContent = `
    #${containerId} { max-width: 960px; margin: 0 auto; padding: 24px 16px 140px; font-family: 'Segoe UI', Arial, sans-serif; color: ${T.text}; }
    #${containerId} h1 { text-align: center; margin: 10px 0 26px; font-size: 30px; }
    .tb-card { background: ${T.card}; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,.35); border-radius: 14px; padding: 20px 24px; margin-bottom: 18px;
      box-shadow: 0 10px 30px rgba(43,108,176,.18); transition: transform .25s, box-shadow .25s; }
    .tb-card:hover { transform: translateY(-4px); box-shadow: 0 16px 38px rgba(43,108,176,.28); }
    .tb-card h2 { margin: 0 0 6px; font-size: 20px; }
    .tb-meta { color: ${T.sub}; font-size: 13px; margin-bottom: 10px; }
    .tb-card p { margin: 6px 0; font-size: 14px; line-height: 1.5; }
    .tb-card ul { margin: 8px 0 0; padding-left: 20px; font-size: 14px; line-height: 1.55; }
    .tb-feat { margin-top: 10px; padding: 8px 12px; border-left: 4px solid #3182ce; background: rgba(49,130,206,.1); border-radius: 6px; font-size: 13px; }`;
  document.head.appendChild(css);

  box.innerHTML = '<h1>\u041b\u0456\u0442\u0435\u0440\u0430\u0442\u0443\u0440\u0430 \u0437 \u043c\u0435\u0445\u0430\u043d\u0456\u043a\u0438</h1>' + mechanicsTextbooks.map(b => `
    <section class="tb-card" id="${b.id}">
      <h2>${b.title}</h2>
      <div class="tb-meta">${b.authors.join(', ')} \u00b7 ${b.publisher}, ${b.year}</div>
      <p>${b.purpose}</p>
      <ul>${b.topics.map(t => `<li>${t}</li>`).join('')}</ul>
      ${b.features ? `<div class="tb-feat">${b.features}</div>` : ''}
    </section>`).join('');
}

// Autostart: change 'light' to 'dark' for the dark theme
document.addEventListener('DOMContentLoaded', () => {
  applyBeautifulBackground('light');
  // If the page has #textbooks-container (literature.html), the page renders the cards itself
  if (!document.getElementById('textbooks-container')) renderTextbooks('textbooks', 'light');
});
