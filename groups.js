// Файл у UTF-8 (сторінки мають <meta charset="UTF-8">).
/* groups.js - study groups page: animated "city under construction" background + interactive cards.
   EDIT the studyGroups array below to add or change groups. */

const studyGroups = [
  { 
    id: "ap", 
    name: "АП", 
    specialty: "Архітектурне проектування та внутрішній інтер’єр", 
    courses: [3], 
    tower: 150,
    subjects: [{ course: 3, text: "Теоретична механіка" }],
    links: [{ course: 3, label: "Сторінка групи (3 курс)", page: "group-ap.html" }] 
  },
  { 
    id: "od", 
    name: "ОД", 
    specialty: "Опорядження будівель і споруд та будівельний дизайн", 
    courses: [3], 
    tower: 130,
    subjects: [{ course: 3, text: "Основи теоретичної механіки та опір матеріалів" }],
    links: [{ course: 3, label: "Сторінка групи (3 курс)", page: "group-od.html" }] 
  },
  { 
    id: "d", 
    name: "Д", 
    specialty: "Будівництво, експлуатація і ремонт автомобільних доріж і аеродромів", 
    courses: [2, 3], 
    tower: 175,
    subjects: [
      { course: 2, text: "Статика споруд" }, 
      { course: 3, text: "Теоретична механіка" }
    ],
    links: [
      { course: 2, label: "Група Д-2 (2 курс)", page: "group-d2.html" },
      { course: 3, label: "Група Д-3 (3 курс)", page: "group-d3.html" }
    ] 
  },
  { 
    id: "b", 
    name: "Б", 
    specialty: "Будівництво та експлуатація будівель і споруд", 
    courses: [2, 3], 
    tower: 200,
    subjects: [
      { course: 2, text: "Технічна механіка та опір матеріалів" }, 
      { course: 3, text: "Будівельна механіка" }
    ],
    links: [
      { course: 2, label: "Група Б-2 (2 курс)", page: "group-b2.html" },
      { course: 3, label: "Група Б-3 (3 курс)", page: "group-b3.html" }
    ] 
  }
];

const GROUP_ICON = { ap: "🏛️", od: "🎨", d: "🛣️", b: "🏗️" };

const cityFacts = [
  "Пантеон у Римі (бл. 126 р.) досі має найбільший у світі неармований бетонний купол діаметром близько 43 м.",
  "Бурдж-Халіфа заввишки 828 м — найвища споруда у світі.",
  "Арка передає навантаження на опори, працюючи переважно на стиск, тому її століттями муровали з каменю.",
  "Ферма — це система стержнів, які працюють на розтяг і стиск. Саме так її розраховують у будівельній механіці.",
  "Бетон набирає проєктну міцність приблизно за 28 діб твердіння.",
  "Двотавр економіює метал: матеріал зосереджений у полицях, де напруження від згину найбільші.",
  "Металеві конструкції влітку трохи розширюються від тепла, тому в мостах роблять деформаційні шви."
];

/* ---------------- ANIMATED CONSTRUCTION BACKGROUND ---------------- */
function applyCityBackground() {
  if (document.getElementById("city-bg")) return;
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const c = document.createElement("canvas");
  c.id = "city-bg";
  Object.assign(c.style, { position: "fixed", inset: "0", width: "100%", height: "100%", zIndex: "-1", pointerEvents: "none" });
  document.body.prepend(c);
  document.body.style.background = "transparent";
  document.documentElement.style.backgroundColor = "#e9f2fb";
  const ctx = c.getContext("2d");
  const BLUE = "43,108,176", ORANGE = "240,165,0";
  let W, H, buildings = [], cranes = [], floaters = [];

  const rnd = (a, b) => a + Math.random() * (b - a);
  const ease = x => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
  const hash = (a, b, d) => { const v = Math.sin(a * 127.1 + b * 311.7 + d * 74.7) * 43758.5453; return v - Math.floor(v); };

  function layout() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    c.width = W * dpr; c.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildings = [];
    let x = -10, i = 0;
    while (x < W) {
      const w = rnd(44, 92);
      buildings.push({ i: i++, x, w, h: rnd(H * 0.10, H * 0.38), delay: rnd(0, 3800), far: Math.random() < 0.4 });
      x += w + rnd(2, 12);
    }
    cranes = [0.16, 0.5, 0.84].map(f => ({ x: W * f, h: rnd(H * 0.5, H * 0.62), jib: rnd(110, 170), ph: rnd(0, 6.28) }));
    floaters = Array.from({ length: 16 }, (_, k) => ({
      kind: ["arch", "truss", "column"][k % 3], x: Math.random(), y: Math.random(), s: rnd(26, 60),
      r: rnd(-0.4, 0.4), vy: -rnd(0.00002, 0.00006), vx: rnd(-0.00002, 0.00002), a: rnd(0.10, 0.22)
    }));
  }
  layout();
  addEventListener("resize", layout);

  function drawGrid() {
    for (const [step, col] of [[20, "rgba(49,130,206,0.06)"], [100, "rgba(49,130,206,0.12)"]]) {
      ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.beginPath();
      for (let x = 0; x <= W; x += step) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, H); }
      for (let y = 0; y <= H; y += step) { ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5); }
      ctx.stroke();
    }
  }

  function drawBuilding(b, t) {
    const k = reduce ? 1 : ease((t - b.delay) / 3600);
    const h = b.h * k;
    if (h < 1) return;
    const y0 = H - h;
    ctx.fillStyle = `rgba(${BLUE},${b.far ? 0.07 : 0.13})`;
    ctx.fillRect(b.x, y0, b.w, h);
    ctx.strokeStyle = `rgba(${BLUE},${b.far ? 0.15 : 0.28})`; ctx.lineWidth = 1;
    ctx.strokeRect(b.x + 0.5, y0 + 0.5, b.w - 1, h);
    if (k < 1) { ctx.fillStyle = `rgba(${ORANGE},0.55)`; ctx.fillRect(b.x, y0 - 2, b.w, 3); }   // fresh floor
    if (b.far) return;
    const cols = Math.floor((b.w - 6) / 14), step = 18, tick = Math.floor(t / 2600);
    for (let f = 0, y = H - step; y > y0 + 4; y -= step, f++) {
      for (let j = 0; j < cols; j++) {
        const lit = hash(b.i, f * 13 + j, tick) > 0.86;
        ctx.fillStyle = lit ? `rgba(${ORANGE},0.40)` : `rgba(${BLUE},0.10)`;
        ctx.fillRect(b.x + 6 + j * 14, y - 9, 7, 9);
      }
    }
  }

  function drawCrane(cr, t) {
    const top = H - cr.h, x = cr.x, sw = Math.sin(t * 0.0004 + cr.ph);
    ctx.strokeStyle = `rgba(${BLUE},0.42)`; ctx.lineWidth = 1.5;
    ctx.beginPath();                                            // lattice mast
    ctx.moveTo(x - 6, H); ctx.lineTo(x - 6, top); ctx.moveTo(x + 6, H); ctx.lineTo(x + 6, top);
    for (let y = H; y > top + 12; y -= 12) {
      ctx.moveTo(x - 6, y); ctx.lineTo(x + 6, y - 12); ctx.moveTo(x + 6, y); ctx.lineTo(x - 6, y - 12);
    }
    ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - 6, top); ctx.lineTo(x, top - 22); ctx.lineTo(x + 6, top); ctx.stroke();
    const tip = x + cr.jib * sw, back = x - cr.jib * 0.35 * sw;
    ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(back, top); ctx.lineTo(tip, top); ctx.stroke();
    ctx.lineWidth = 1; ctx.beginPath();
    ctx.moveTo(x, top - 22); ctx.lineTo(tip, top); ctx.moveTo(x, top - 22); ctx.lineTo(back, top); ctx.stroke();
    ctx.fillStyle = `rgba(${BLUE},0.4)`; ctx.fillRect(back - 7, top, 14, 12);   // counterweight
    const tr = x + (tip - x) * (0.55 + 0.25 * Math.sin(t * 0.0007 + cr.ph));   // trolley
    const drop = 50 + 40 * (0.5 + 0.5 * Math.sin(t * 0.0009 + cr.ph * 2));
    ctx.strokeStyle = `rgba(${BLUE},0.4)`; ctx.beginPath();
    ctx.moveTo(tr, top); ctx.lineTo(tr, top + drop);
    ctx.moveTo(tr, top + drop); ctx.lineTo(tr - 14, top + drop + 8); ctx.moveTo(tr, top + drop); ctx.lineTo(tr + 14, top + drop + 8);
    ctx.stroke();
    ctx.fillStyle = `rgba(${ORANGE},0.6)`; ctx.fillRect(tr - 14, top + drop + 8, 28, 8);   // lifted beam
  }

  function drawFloater(f) {
    ctx.save();
    ctx.translate(f.x * W, f.y * H); ctx.rotate(f.r);
    ctx.strokeStyle = `rgba(${BLUE},${f.a})`; ctx.lineWidth = 1.6;
    const s = f.s;
    ctx.beginPath();
    if (f.kind === "arch") {
      ctx.moveTo(-s / 2, s * 0.5); ctx.lineTo(-s / 2, 0); ctx.arc(0, 0, s / 2, Math.PI, 0); ctx.lineTo(s / 2, s * 0.5);
      ctx.moveTo(-s * 0.7, s * 0.5); ctx.lineTo(s * 0.7, s * 0.5);
    } else if (f.kind === "truss") {
      ctx.moveTo(-s, 0); ctx.lineTo(s, 0); ctx.lineTo(0, -s * 0.55); ctx.closePath();
      ctx.moveTo(0, -s * 0.55); ctx.lineTo(0, 0);
      ctx.moveTo(-s * 0.5, 0); ctx.lineTo(0, -s * 0.55); ctx.moveTo(s * 0.5, 0); ctx.lineTo(0, -s * 0.55);
    } else {
      ctx.rect(-s * 0.18, -s * 0.6, s * 0.36, s * 1.2);
      ctx.rect(-s * 0.3, -s * 0.72, s * 0.6, s * 0.12); ctx.rect(-s * 0.3, s * 0.6, s * 0.6, s * 0.12);
      for (let k = -1; k <= 1; k++) { ctx.moveTo(k * s * 0.09, -s * 0.6); ctx.lineTo(k * s * 0.09, s * 0.6); }
    }
    ctx.stroke();
    ctx.restore();
  }

  function frame(t) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#dcebfa"); g.addColorStop(1, "#f4f9fd");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const glow = ctx.createRadialGradient(W * 0.85, H * 0.12, 0, W * 0.85, H * 0.12, W * 0.45);
    glow.addColorStop(0, "rgba(240,165,0,0.16)"); glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
    drawGrid();
    for (const f of floaters) {
      if (!reduce) {
        f.y += f.vy; f.x += f.vx;
        if (f.y < -0.1) f.y = 1.1; if (f.x < -0.1) f.x = 1.1; if (f.x > 1.1) f.x = -0.1;
      }
      drawFloater(f);
    }
    for (const b of buildings) drawBuilding(b, t);
    for (const cr of cranes) drawCrane(cr, t);
    ctx.fillStyle = `rgba(${BLUE},0.22)`; ctx.fillRect(0, H - 4, W, 4);
    if (!reduce) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ---------------- GROUP CARDS, CITY OF TOWERS, FILTERS ---------------- */
const GP_CSS = `
[hidden] { display: none !important; }
.gp-wrap { max-width: 1100px; margin: 0 auto; }
.gp-stats { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; margin-bottom: 14px; }
.gp-stat { background: rgba(255,255,255,.85); backdrop-filter: blur(8px); border-radius: 14px; padding: 12px 26px; text-align: center;
  border-bottom: 4px solid #f0a500; box-shadow: 0 6px 18px rgba(43,108,176,.15); }
.gp-stat b { display: block; font-size: 30px; color: #1a365d; }
.gp-stat span { font-size: 13px; color: #4a5568; }
.gp-fact { display: flex; gap: 10px; align-items: center; justify-content: center; background: rgba(255,255,255,.8);
  border-left: 5px solid #f0a500; border-radius: 10px; padding: 10px 16px; margin: 0 auto 18px; max-width: 820px; font-size: 14px; color: #2d3748; }
#gp-fact-text { transition: opacity .5s; }
.gp-panel { background: rgba(255,255,255,.86); backdrop-filter: blur(8px); border-radius: 16px; padding: 14px 18px 10px;
  margin-bottom: 20px; border-top: 4px solid #1a365d; box-shadow: 0 10px 28px rgba(43,108,176,.16); }
.gp-panel h2 { margin: 4px 0 10px; font-size: 18px; color: #1a365d; text-align: center; }
.gp-city { display: flex; align-items: flex-end; justify-content: center; gap: 12px; min-height: 250px; padding: 28px 10px 0;
  overflow-x: auto; border-bottom: 6px solid #1a365d; background: linear-gradient(180deg, transparent 60%, rgba(240,165,0,.10)); }
.gp-tower { position: relative; width: 70px; height: 0; border: none; border-radius: 4px 4px 0 0; cursor: pointer; padding: 0; flex: 0 0 auto;
  background: repeating-linear-gradient(0deg, transparent 0 14px, rgba(255,255,255,.16) 14px 16px), linear-gradient(180deg, #2b6cb0, #1a365d);
  transition: height 1.2s cubic-bezier(.2,.8,.2,1), filter .2s; transition-delay: calc(var(--i) * 150ms), 0s; color: #fff; }
.gp-built .gp-tower { height: var(--h); }
.gp-tower:hover { filter: brightness(1.25); }
.gp-tower::before { content: ""; position: absolute; left: 50%; top: -18px; width: 2px; height: 18px; background: #1a365d; }
.gp-tower::after { content: ""; position: absolute; left: calc(50% - 4px); top: -24px; width: 8px; height: 8px; border-radius: 50%;
  background: #f0a500; animation: gp-blink 1.6s infinite; }
@keyframes gp-blink { 50% { opacity: .2; } }
.gp-tower-name { display: block; font-weight: 700; font-size: 14px; margin-top: 8px; }
.gp-tower-n { display: block; font-size: 11px; opacity: .85; }
.gp-note { text-align: center; font-size: 12px; color: #718096; margin: 8px 0 4px; }
.gp-toolbar { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: space-between; margin-bottom: 16px; }
#gp-search { flex: 1 1 260px; padding: 11px 16px; border-radius: 24px; border: 1px solid #cbd5e0; font-size: 14px; background: rgba(255,255,255,.92); }
#gp-search:focus { outline: 2px solid #f0a500; }
.gp-chips { display: flex; gap: 8px; flex-wrap: wrap; }
.gp-chip { border: 1px solid #1a365d; background: rgba(255,255,255,.9); color: #1a365d; padding: 7px 14px; border-radius: 20px;
  cursor: pointer; font-weight: 600; font-size: 13px; transition: all .2s; }
.gp-chip:hover { background: #ebf4ff; }
.gp-chip.active { background: #1a365d; color: #fff; }
.gp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: 20px; }
.gp-card { position: relative; background: rgba(255,255,255,.9); backdrop-filter: blur(8px); border-radius: 16px; padding: 20px 22px 18px;
  border-top: 5px solid #1a365d; box-shadow: 0 10px 26px rgba(43,108,176,.16); transition: transform .15s ease-out, box-shadow .25s;
  will-change: transform; animation: gp-rise .6s backwards; display: flex; flex-direction: column; }
.gp-card:hover { box-shadow: 0 18px 38px rgba(43,108,176,.28); }
@keyframes gp-rise { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: none; } }
.gp-pulse { animation: gp-pulse 1.5s; }
@keyframes gp-pulse { 0%,100% { box-shadow: 0 10px 26px rgba(43,108,176,.16); } 30% { box-shadow: 0 0 0 6px rgba(240,165,0,.6); } }
.gp-ico { position: absolute; top: -22px; right: 18px; width: 46px; height: 46px; border-radius: 50%; background: #f0a500;
  display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: 0 4px 10px rgba(0,0,0,.2); }
.gp-card h3 { margin: 0 0 2px; font-size: 24px; color: #1a365d; text-align: left; }
.gp-sub { font-size: 13px; color: #718096; margin-bottom: 10px; line-height: 1.35; }
.gp-meta { font-size: 13px; color: #4a5568; margin-bottom: 10px; }
.gp-subjects { list-style: none; margin: 0 0 14px; padding: 0; display: flex; flex-direction: column; gap: 8px; flex: 1; }
.gp-subjects li { background: #ebf4ff; border-left: 4px solid #2b6cb0; border-radius: 8px; padding: 8px 12px; font-size: 14px; color: #2d3748; line-height: 1.35; }
.gp-subjects li b { display: block; font-size: 12px; color: #2b6cb0; margin-bottom: 2px; }
.gp-links { display: flex; flex-wrap: wrap; gap: 8px; }
.gp-links a { background: #f0a500; color: #1a202c; text-decoration: none; font-weight: 700; font-size: 13px; padding: 8px 14px;
  border-radius: 8px; box-shadow: 0 3px 0 #b97f00; transition: transform .1s; }
.gp-links a:hover { transform: translateY(-2px); }
.gp-empty { text-align: center; padding: 30px; font-size: 16px; color: #4a5568; }
@media (prefers-reduced-motion: reduce) { .gp-card { animation: none; } .gp-tower { transition: none; } }
`;

function renderGroups(containerId = "groups-container") {
  const box = document.getElementById(containerId);
  if (!box) { console.error("Groups container not found: " + containerId); return; }
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ALL = "Усі";
  const allCourses = [...new Set(studyGroups.flatMap(g => g.courses))].sort();
  const chips = [ALL, ...allCourses.map(n => n + " курс")];
  const state = { q: "", chip: ALL };

  if (!document.getElementById("gp-style")) {
    const st = document.createElement("style");
    st.id = "gp-style"; st.textContent = GP_CSS;
    document.head.appendChild(st);
  }

  const courseLabel = g => g.courses.join(" і ") + " курс";

  const towers = studyGroups.map((g, i) => `
    <button class="gp-tower" style="--h:${g.tower || 140}px;--i:${i}" data-id="${g.id}" title="${g.name}: ${g.specialty}">
      <span class="gp-tower-name">${g.name}</span><span class="gp-tower-n">${courseLabel(g)}</span></button>`).join("");

  const cards = studyGroups.map((g, i) => {
    const linksHtml = g.links.map(l => `<a href="${l.page}">${l.label}</a>`).join("");
    return `
      <article class="gp-card" id="gp-${g.id}" data-id="${g.id}" style="animation-delay:${i * 90}ms">
        <div class="gp-ico">${GROUP_ICON[g.id] || "🏢"}</div>
        <h3>${g.name}</h3>
        <div class="gp-sub">${g.specialty}</div>
        <div class="gp-meta">🎓 ${courseLabel(g)}</div>
        <ul class="gp-subjects">
          ${g.subjects.map(s => `<li><b>${s.course} курс</b>${s.text}</li>`).join("")}
        </ul>
        <div class="gp-links">${linksHtml}</div>
      </article>`;
  }).join("");

  box.innerHTML = `
    <div class="gp-wrap">
      <div class="gp-stats">
        <div class="gp-stat"><b data-count="${studyGroups.length}">0</b><span>груп</span></div>
        <div class="gp-stat"><b data-count="${allCourses.length}">0</b><span>курси</span></div>
      </div>
      <div class="gp-fact"><span>💡</span><span id="gp-fact-text"></span></div>
      <div class="gp-panel">
        <h2>🏙️ Місто груп</h2>
        <div class="gp-city" id="gp-city">${towers}</div>
        <div class="gp-note">Натисніть на вежу, щоб перейти до групи.</div>
      </div>
      <div class="gp-toolbar">
        <input type="search" id="gp-search" placeholder="🔍 Пошук групи, напряму або предмета...">
        <div class="gp-chips" id="gp-chips">
          ${chips.map(s => `<button class="gp-chip${s === ALL ? " active" : ""}" data-chip="${s}">${s}</button>`).join("")}
        </div>
      </div>
      <div class="gp-grid" id="gp-grid">${cards}</div>
      <div class="gp-empty" id="gp-empty" hidden>🏚️ Нічого не знайдено. Спробуйте інший запит.</div>
    </div>`;

  // towers rise
  requestAnimationFrame(() => requestAnimationFrame(() => document.getElementById("gp-city").classList.add("gp-built")));

  // counters
  box.querySelectorAll("[data-count]").forEach(el => {
    const to = +el.dataset.count, t0 = performance.now(), dur = reduce ? 1 : 1200;
    (function step(now) {
      const p = Math.min(1, (now - t0) / dur);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  });

  // rotating facts
  const factEl = document.getElementById("gp-fact-text");
  let fi = Math.floor(Math.random() * cityFacts.length);
  factEl.textContent = cityFacts[fi];
  setInterval(() => {
    factEl.style.opacity = 0;
    setTimeout(() => { fi = (fi + 1) % cityFacts.length; factEl.textContent = cityFacts[fi]; factEl.style.opacity = 1; }, 500);
  }, 8000);

  // filters
  const cardEls = [...box.querySelectorAll(".gp-card")];
  const byId = Object.fromEntries(studyGroups.map(g => [g.id, g]));
  function applyFilters() {
    const q = state.q.toLowerCase().trim();
    let shown = 0;
    cardEls.forEach(el => {
      const g = byId[el.dataset.id];
      const hay = [g.name, g.specialty, ...g.subjects.map(s => s.text)].join(" ").toLowerCase();
      const okChip = state.chip === ALL || g.courses.some(n => n + " курс" === state.chip);
      const ok = okChip && (!q || hay.includes(q));
      el.hidden = !ok;
      if (ok) shown++;
    });
    document.getElementById("gp-empty").hidden = shown > 0;
  }
  document.getElementById("gp-search").addEventListener("input", e => { state.q = e.target.value; applyFilters(); });
  document.getElementById("gp-chips").addEventListener("click", e => {
    const b = e.target.closest(".gp-chip");
    if (!b) return;
    state.chip = b.dataset.chip;
    box.querySelectorAll(".gp-chip").forEach(x => x.classList.toggle("active", x === b));
    applyFilters();
  });

  // click on a tower -> scroll to the group card
  document.getElementById("gp-city").addEventListener("click", e => {
    const t = e.target.closest(".gp-tower");
    if (!t) return;
    state.q = ""; state.chip = ALL;
    document.getElementById("gp-search").value = "";
    box.querySelectorAll(".gp-chip").forEach(x => x.classList.toggle("active", x.dataset.chip === ALL));
    applyFilters();
    const card = document.getElementById("gp-" + t.dataset.id);
    card.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    card.classList.remove("gp-pulse"); void card.offsetWidth; card.classList.add("gp-pulse");
  });

  // 3D tilt on hover (mouse only)
  if (!reduce && window.matchMedia("(hover: hover)").matches) {
    cardEls.forEach(el => {
      el.addEventListener("mousemove", e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(800px) rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 9).toFixed(2)}deg) translateY(-4px)`;
      });
      el.addEventListener("mouseleave", () => { el.style.transform = ""; });
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  applyCityBackground();
  renderGroups("groups-container");
});
