/* Завдання-квести: графічна сцена, предмети, на які можна натискати, і таймер.
   Правильну відповідь у цьому файлі не зберігаємо: її перевіряє сервер і він же рахує час. */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var INK = '#12284a';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function mmss(sec) {
    sec = Math.max(0, Math.floor(sec));
    var m = Math.floor(sec / 60), s = sec % 60;
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }
  // Перша хвилина = максимум; далі лінійно до мінімуму на ліміті; після ліміту = 0 (як на сервері)
  function pointsNow(info, sec) {
    if (sec <= 60) return info.max;
    if (sec > info.limit) return 0;
    return Math.round(info.max - (info.max - info.min) * (sec - 60) / Math.max(1, info.limit - 60));
  }

  /* ---------- оболонка: таймер, підписи, результат ---------- */
  function run(box, info, ctx) {
    box.innerHTML =
      '<div class="tk-bar">' +
        '<div><small>Час</small><b class="tk-time">00:00</b></div>' +
        '<div><small>Ліміт</small><b>' + mmss(info.limit) + '</b></div>' +
        '<div><small>Бали зараз</small><b class="tk-pts">' + info.max + '</b></div>' +
      '</div>' +
      '<p class="tk-rule muted">' + (info.owner ? 'Режим викладача: без обмеження часу, бали не записуються. ' : '') + 'Перша хвилина: ' + info.max + ' балів, далі менше, на ліміті ' + info.min + ', після ліміту 0.</p>' +
      '<div class="tk-stage"></div>' +
      '<p class="tk-say" role="status" aria-live="polite"></p>' +
      '<div class="tk-modal" hidden><div class="tk-modal-box"><button type="button" class="tk-x" aria-label="Закрити">×</button><div class="tk-modal-body"></div></div></div>';

    var started = Date.now() - (info.elapsed || 0) * 1000;
    var stopped = false;
    var timeEl = box.querySelector('.tk-time'), ptsEl = box.querySelector('.tk-pts');
    var say = box.querySelector('.tk-say');
    var modal = box.querySelector('.tk-modal'), mbody = box.querySelector('.tk-modal-body');

    function elapsed() { return (Date.now() - started) / 1000; }
    function tick() {
      if (stopped) return;
      var e = elapsed();
      if (e > info.limit && !expiring && !info.owner) { expire(); return; }
      timeEl.textContent = mmss(e);
      ptsEl.textContent = pointsNow(info, e);
      box.classList.toggle('tk-late', e > 60);
    }
    var expiring = false;
    function expire() {
      expiring = true;
      var done = function (r) { api.finish({ seconds: (r && r.seconds) || info.limit, points: 0, expired: true, preview: r && r.preview }); };
      ctx.submit('').then(done).catch(function () { done(null); });
    }
    var timer = setInterval(function () { if (!box.isConnected) { clearInterval(timer); return; } tick(); }, 500);
    tick();

    var api = {
      info: info,
      elapsed: elapsed,
      say: function (t) { say.textContent = t || ''; },
      modal: function (html) { mbody.innerHTML = html; modal.hidden = false; return mbody; },
      close: function () { modal.hidden = true; mbody.innerHTML = ''; },
      stop: function () { stopped = true; clearInterval(timer); },
      stage: box.querySelector('.tk-stage'),
      submit: ctx.submit
    };
    box.querySelector('.tk-x').addEventListener('click', api.close);
    modal.addEventListener('click', function (e) { if (e.target === modal) api.close(); });

    api.finish = function (r) {
      api.stop();
      timeEl.textContent = mmss(r.seconds);
      ptsEl.textContent = r.points;
      var card = api.modal(
        (r.expired ? '<h3>Час вийшов</h3>' : '<h3>Готово!</h3>') +
        '<p class="tk-res">' + (r.expired ? 'Ліміт: ' : 'Ваш час: ') + '<b>' + mmss(r.seconds) + '</b></p>' +
        '<p class="tk-res">Бали: <b>' + r.points + '</b></p>' +
        (r.preview ? '<p class="muted">Це тестовий прохід викладача: бали не записано.</p>' : '<p class="muted">Бали вже в рейтингу. Повторно за цей квест бали не нараховуються.</p>') +
        '<button type="button" class="btn" data-act="list">До списку завдань</button>');
      card.querySelector('[data-act="list"]').addEventListener('click', function () { ctx.back(); });
      box.querySelector('.tk-x').hidden = true;
    };

    var scene = SCENES[info.id];
    if (!scene) { api.stage.innerHTML = '<p class="muted">Це завдання ще готується.</p>'; return api; }
    if (info.done) {
      api.stage.innerHTML = '<p class="muted">Ви вже пройшли це завдання.</p>';
      api.finish({ seconds: info.seconds, points: info.points });
      return api;
    }
    scene(api);
    return api;
  }

  /* ---------- завдання 1: «Майстерня» ---------- */
  var SCENES = {};

  SCENES.z1 = function (g) {
    var lit = false, opened = false;
    var h = '<svg viewBox="0 0 800 480" class="tk-svg" role="group" aria-label="Темна майстерня інженера">' +
      '<defs>' +
        '<radialGradient id="glow" cx="50%" cy="22%" r="62%"><stop offset="0" stop-color="#ffd98a" stop-opacity="0.55"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/></radialGradient>' +
        '<linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3c4e52"/><stop offset="1" stop-color="#2a383c"/></linearGradient>' +
      '</defs>' +
      // стіна й підлога
      '<rect width="800" height="480" fill="url(#wall)"/>' +
      '<rect y="360" width="800" height="120" fill="#4a3424"/>' +
      '<g stroke="#2e1f14" stroke-width="2"><line x1="0" y1="392" x2="800" y2="392"/><line x1="0" y1="428" x2="800" y2="428"/><line x1="0" y1="466" x2="800" y2="466"/>' +
      '<line x1="160" y1="360" x2="120" y2="480"/><line x1="360" y1="360" x2="350" y2="480"/><line x1="560" y1="360" x2="580" y2="480"/><line x1="720" y1="360" x2="760" y2="480"/></g>' +
      '<rect y="352" width="800" height="10" fill="#22302f"/>' +

      // вікно
      '<g class="tk-hot" data-id="window"><rect x="470" y="60" width="120" height="130" fill="#0b1830" stroke="#a9b6b0" stroke-width="6"/>' +
        '<line x1="530" y1="60" x2="530" y2="190" stroke="#a9b6b0" stroke-width="4"/><line x1="470" y1="125" x2="590" y2="125" stroke="#a9b6b0" stroke-width="4"/>' +
        '<circle cx="500" cy="95" r="14" fill="#f4eecb"/><circle cx="506" cy="91" r="12" fill="#0b1830"/>' +
        '<circle cx="560" cy="85" r="1.8" fill="#fff"/><circle cx="545" cy="160" r="1.8" fill="#fff"/><circle cx="575" cy="140" r="1.8" fill="#fff"/></g>' +

      // плакат-креслення
      '<g class="tk-hot" data-id="poster"><rect x="60" y="80" width="180" height="125" fill="#1d4e7a" stroke="#d9e6ef" stroke-width="3"/>' +
        '<g stroke="#d9e6ef" stroke-width="2" fill="none"><line x1="82" y1="150" x2="218" y2="150"/><polygon points="82,150 76,166 88,166" fill="#d9e6ef"/><polygon points="218,150 212,166 224,166" fill="#d9e6ef"/>' +
        '<line x1="128" y1="108" x2="128" y2="146"/><polygon points="128,148 123,138 133,138" fill="#d9e6ef"/><line x1="82" y1="182" x2="218" y2="182"/></g>' +
        '<text x="150" y="196" text-anchor="middle" font-size="11" fill="#d9e6ef">креслення</text></g>' +

      // годинник
      '<g class="tk-hot" data-id="clock"><circle cx="330" cy="120" r="36" fill="#e9e1c9" stroke="#5a3a1b" stroke-width="6"/>' +
        '<g stroke="#3a2a14" stroke-width="2"><line x1="330" y1="92" x2="330" y2="98"/><line x1="330" y1="142" x2="330" y2="148"/><line x1="302" y1="120" x2="308" y2="120"/><line x1="352" y1="120" x2="358" y2="120"/></g>' +
        '<line x1="330" y1="120" x2="330" y2="100" stroke="#3a2a14" stroke-width="3" stroke-linecap="round"/><line class="tk-hand" x1="330" y1="120" x2="346" y2="120" stroke="#3a2a14" stroke-width="2" stroke-linecap="round"/>' +
        '<g class="tk-pend"><line x1="330" y1="158" x2="330" y2="190" stroke="#5a3a1b" stroke-width="2"/><circle cx="330" cy="196" r="7" fill="#b88a2a" stroke="#5a3a1b" stroke-width="2"/></g></g>' +

      // шестерні на полиці
      '<g class="tk-hot" data-id="gears"><rect x="180" y="262" width="180" height="8" fill="#6b4a2a"/>' +
        '<circle cx="225" cy="244" r="17" fill="#7d8b8e" stroke="#2c3a3d" stroke-width="3"/><circle cx="225" cy="244" r="5" fill="#2c3a3d"/>' +
        '<circle cx="270" cy="250" r="11" fill="#9aa7a9" stroke="#2c3a3d" stroke-width="3"/><circle cx="270" cy="250" r="3.5" fill="#2c3a3d"/>' +
        '<rect x="300" y="238" width="34" height="24" fill="#8b6a3f" stroke="#3a2a14" stroke-width="2"/></g>' +

      // лампа
      '<g class="tk-lamp-g" data-id="lamp"><line x1="400" y1="0" x2="400" y2="70" stroke="#222" stroke-width="3"/>' +
        '<path d="M376 100 Q400 56 424 100 Z" fill="#6e7d4f" stroke="#222" stroke-width="3"/>' +
        '<circle class="tk-bulb" cx="400" cy="104" r="9" fill="#fff4bd"/></g>' +

      // сейф
      '<g data-id="safe"><rect x="520" y="248" width="150" height="120" fill="#58646a" stroke="#1d272c" stroke-width="4"/>' +
        '<g class="tk-hot" data-id="safe"><g class="tk-safe-door"><rect x="530" y="258" width="130" height="100" fill="#6c7a80" stroke="#1d272c" stroke-width="3"/>' +
        '<rect x="548" y="276" width="46" height="24" fill="#0e1a14" stroke="#1d272c" stroke-width="2"/><text class="tk-led" x="571" y="294" text-anchor="middle" font-size="16" font-family="monospace" fill="#5dff9a">----</text>' +
        '<circle cx="625" cy="320" r="17" fill="#8a989e" stroke="#1d272c" stroke-width="3"/><line x1="625" y1="320" x2="625" y2="305" stroke="#1d272c" stroke-width="4"/>' +
        '<g fill="#aab6bb"><circle cx="556" cy="318" r="4"/><circle cx="570" cy="318" r="4"/><circle cx="584" cy="318" r="4"/><circle cx="556" cy="332" r="4"/><circle cx="570" cy="332" r="4"/><circle cx="584" cy="332" r="4"/></g></g>' +
        '<g class="tk-safe-in" opacity="0"><rect x="532" y="260" width="126" height="96" fill="#151c1f"/>' +
        '<g transform="translate(560 300)" fill="#f5a300" stroke="#8a5a00" stroke-width="2"><circle cx="0" cy="0" r="9" fill="none" stroke-width="5"/><rect x="8" y="-3" width="34" height="6"/><rect x="30" y="3" width="5" height="9"/><rect x="38" y="3" width="5" height="12"/></g></g></g></g>' +

      // ящик з інструментами
      '<g class="tk-hot" data-id="toolbox"><rect x="210" y="392" width="150" height="62" rx="4" fill="#b5392b" stroke="#4e130d" stroke-width="4"/>' +
        '<rect x="205" y="384" width="160" height="14" rx="3" fill="#cf4b3b" stroke="#4e130d" stroke-width="3"/>' +
        '<path d="M255 384 q0 -22 20 -22 h20 q20 0 20 22" fill="none" stroke="#4e130d" stroke-width="5"/></g>' +

      // двері
      '<g class="tk-hot" data-id="door"><rect x="712" y="130" width="86" height="232" fill="#5f4529" stroke="#2c1d0e" stroke-width="5"/>' +
        '<rect class="tk-door-open" x="720" y="138" width="70" height="216" fill="#0b0f12"/>' +
        '<rect x="728" y="150" width="54" height="80" fill="none" stroke="#3a2a14" stroke-width="3"/><rect x="728" y="244" width="54" height="100" fill="none" stroke="#3a2a14" stroke-width="3"/>' +
        '<circle cx="730" cy="248" r="6" fill="#c9a24a" stroke="#4a3510" stroke-width="2"/>' +
        '<text x="755" y="122" text-anchor="middle" font-size="13" fill="#d9e6ef" font-weight="700">ВИХІД</text></g>' +

      // світло
      '<rect class="tk-glow" width="800" height="480" fill="url(#glow)" opacity="0" pointer-events="none"/>' +
      '<rect class="tk-dark" width="800" height="480" fill="#04080c" opacity="0.86" pointer-events="none"/>' +
      '<circle class="tk-lamp-halo" cx="400" cy="104" r="26" fill="#ffd98a" opacity="0.25" pointer-events="none"/>' +
      '</svg>';
    g.stage.innerHTML = h;
    var svg = g.stage.querySelector('svg');
    var dark = svg.querySelector('.tk-dark'), glow = svg.querySelector('.tk-glow'), halo = svg.querySelector('.tk-lamp-halo');
    g.say('Темно. Десь має бути вимикач або лампа. Спробуйте натиснути на предмети.');
    svg.classList.add('tk-off');

    function setLight(on) {
      lit = on;
      svg.classList.toggle('tk-off', !on);
      dark.setAttribute('opacity', on ? '0.08' : '0.86');
      glow.setAttribute('opacity', on ? '1' : '0');
      halo.setAttribute('opacity', on ? '0' : '0.25');
    }

    var CLOCK = null;
    function beamSvg() {
      return '<svg viewBox="0 0 420 200" class="tk-beam" role="img" aria-label="Балка на двох опорах із силою 12 кН на відстані 2 м від опори A">' +
        '<rect x="60" y="92" width="300" height="10" fill="#cfd9e6" stroke="' + INK + '" stroke-width="2"/>' +
        '<polygon points="60,102 46,128 74,128" fill="#fff" stroke="' + INK + '" stroke-width="2"/><line x1="40" y1="130" x2="80" y2="130" stroke="' + INK + '" stroke-width="3"/>' +
        '<polygon points="360,102 346,124 374,124" fill="#fff" stroke="' + INK + '" stroke-width="2"/><circle cx="360" cy="128" r="4" fill="#fff" stroke="' + INK + '" stroke-width="2"/><line x1="340" y1="134" x2="380" y2="134" stroke="' + INK + '" stroke-width="3"/>' +
        '<line x1="160" y1="30" x2="160" y2="88" stroke="#b5392b" stroke-width="4"/><polygon points="160,92 153,76 167,76" fill="#b5392b"/>' +
        '<text x="160" y="22" text-anchor="middle" font-size="15" font-weight="700" fill="#b5392b">F = 12 кН</text>' +
        '<text x="60" y="152" text-anchor="middle" font-size="16" font-weight="700" fill="' + INK + '">A</text><text x="360" y="152" text-anchor="middle" font-size="16" font-weight="700" fill="' + INK + '">B</text>' +
        '<line x1="60" y1="166" x2="160" y2="166" stroke="' + INK + '" stroke-width="1.5"/><line x1="60" y1="160" x2="60" y2="172" stroke="' + INK + '" stroke-width="1.5"/><line x1="160" y1="160" x2="160" y2="172" stroke="' + INK + '" stroke-width="1.5"/>' +
        '<text x="110" y="182" text-anchor="middle" font-size="13" fill="' + INK + '">2 м</text>' +
        '<line x1="60" y1="190" x2="360" y2="190" stroke="' + INK + '" stroke-width="1.5"/><line x1="60" y1="184" x2="60" y2="196" stroke="' + INK + '" stroke-width="1.5"/><line x1="360" y1="184" x2="360" y2="196" stroke="' + INK + '" stroke-width="1.5"/>' +
        '<text x="210" y="188" text-anchor="middle" font-size="13" fill="' + INK + '" style="paint-order:stroke" stroke="#fff" stroke-width="4">6 м</text></svg>';
    }

    function openKeypad() {
      var code = '';
      var busy = false;
      var body = g.modal(
        '<h3>Кодовий замок</h3>' +
        '<div class="kp-disp" aria-live="polite">----</div>' +
        '<div class="kp-grid">' + [1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (n) { return '<button type="button" data-k="' + n + '">' + n + '</button>'; }).join('') +
        '<button type="button" data-k="C">C</button><button type="button" data-k="0">0</button><button type="button" data-k="ok" class="kp-ok">OK</button></div>' +
        '<p class="kp-msg muted"></p>');
      var disp = body.querySelector('.kp-disp'), msg = body.querySelector('.kp-msg');
      function show() { disp.textContent = (code + '----').slice(0, 4).replace(/ /g, '-'); }
      body.querySelector('.kp-grid').addEventListener('click', function (e) {
        var b = e.target.closest('button[data-k]');
        if (!b || busy) return;
        var k = b.getAttribute('data-k');
        if (k === 'C') { code = ''; msg.textContent = ''; show(); return; }
        if (k === 'ok') {
          if (!code) { msg.textContent = 'Введіть код.'; return; }
          busy = true; msg.textContent = 'Перевіряємо…';
          g.submit(code).then(function (r) {
            busy = false;
            if (!r.correct) { msg.textContent = 'Замок не відкрився. Перевірте розрахунок.'; code = ''; show(); return; }
            opened = true;
            g.close();
            unlockFinale(r);
          }).catch(function (err) {
            busy = false; msg.textContent = err && err.message === 'NETWORK' ? 'Немає зв’язку. Спробуйте ще раз.' : 'Не вдалося перевірити (' + (err && err.message) + ').';
          });
          return;
        }
        if (code.length < 4) { code += k; show(); }
      });
    }

    function unlockFinale(r) {
      var door = svg.querySelector('.tk-safe-door'), inside = svg.querySelector('.tk-safe-in');
      svg.querySelector('.tk-led').textContent = 'OPEN';
      inside.setAttribute('opacity', '1');
      door.classList.add('tk-swing');
      g.say('Клац! Сейф відкрився, всередині ключ. Ключ підходить до дверей…');
      setTimeout(function () {
        svg.querySelector('.tk-door-open').classList.add('tk-lit');
        g.say('Двері відчинено. Ви вийшли з майстерні!');
      }, 1400);
      setTimeout(function () { g.finish(r); }, 2600);
    }

    var ACT = {
      lamp: function () {
        if (lit) { g.say('Світло вже горить. Огляньте кімнату.'); return; }
        setLight(true);
        g.say('Світло горить. На стіні креслення, в кутку ящик з інструментами, на столі сейф із кодовим замком.');
      },
      window: function () { g.say(lit ? 'За вікном ніч. Нічого цікавого.' : 'Темно.'); },
      clock: function () { g.say('Годинник: з початку завдання минуло ' + mmss(g.elapsed()) + '. Чим швидше, тим більше балів.'); },
      gears: function () { g.say('Великі й малі шестерні. Велика крутиться повільніше за малу, на цьому тримається редуктор. До сейфа відношення не має.'); },
      poster: function () {
        var b = g.modal('<h3>Креслення на стіні</h3>' + beamSvg() +
          '<p>Балка лежить на двох опорах: A (шарнірно-нерухома) і B (шарнірно-рухома). Сила 12 кН діє на відстані 2 м від опори A, довжина балки 6 м.</p>' +
          '<p>На кресленні нашкрябано: <b>«Код = реакція в A, потім реакція в B, у кН, без пробілів»</b>.</p>');
        return b;
      },
      toolbox: function () {
        g.modal('<h3>Ящик з інструментами</h3><p>У ящику лежить записка майстра:</p>' +
          '<div class="tk-note"><p><b>Щоб знайти реакції балки:</b></p>' +
          '<p>1. Візьміть моменти всіх сил відносно точки A. Сума моментів дорівнює нулю: <b>R<sub>B</sub> · L = F · a</b>.</p>' +
          '<p>2. Сума всіх вертикальних сил дорівнює нулю: <b>R<sub>A</sub> + R<sub>B</sub> = F</b>.</p>' +
          '<p>Тут L, F і a беріть із креслення. Докладніше про це в розділі «Практичні роботи».</p></div>');
      },
      safe: function () {
        if (opened) { g.say('Сейф уже відкритий.'); return; }
        openKeypad();
      },
      door: function () {
        g.say(opened ? 'Двері відчинені.' : 'Двері замкнені. Потрібен ключ. Можливо, він у сейфі.');
      }
    };

    svg.addEventListener('click', function (e) {
      var t = e.target.closest('[data-id]');
      if (!t) return;
      var id = t.getAttribute('data-id');
      if (id === 'lamp') { ACT.lamp(); return; }
      if (!lit) { g.say('Занадто темно, нічого не видно. Спершу потрібне світло.'); return; }
      if (ACT[id]) ACT[id]();
    });
  };


  /* ---------- завдання 2: «Будмайданчик» ---------- */
  SCENES.z2 = function (g) {
    var hasKey = false, opened = false;
    var h = '<svg viewBox="0 0 800 480" class="tk-svg" role="group" aria-label="Будівельний майданчик">' +
      '<defs><linearGradient id="sky2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fc4ee"/><stop offset="1" stop-color="#dff1fb"/></linearGradient></defs>' +
      '<rect width="800" height="480" fill="url(#sky2)"/>' +
      '<circle cx="90" cy="70" r="30" fill="#ffe27a"/>' +
      '<rect y="360" width="800" height="120" fill="#b49a6b"/><rect y="352" width="800" height="12" fill="#8c7a52"/>' +
      // будинок у будівництві
      '<g><rect x="300" y="190" width="150" height="170" fill="#c9c2b2" stroke="#6b6558" stroke-width="3"/>' +
        '<g fill="#8fb4cc" stroke="#6b6558" stroke-width="2"><rect x="318" y="210" width="30" height="34"/><rect x="368" y="210" width="30" height="34"/><rect x="318" y="270" width="30" height="34"/><rect x="368" y="270" width="30" height="34"/></g>' +
        '<g stroke="#8a5a2a" stroke-width="3"><line x1="290" y1="190" x2="460" y2="190"/></g></g>' +
      // кран
      '<g class="tk-hot" data-id="crane"><rect x="552" y="110" width="12" height="250" fill="#f0a500" stroke="#7a5200" stroke-width="2"/>' +
        '<g stroke="#7a5200" stroke-width="1.5"><line x1="552" y1="150" x2="564" y2="180"/><line x1="564" y1="150" x2="552" y2="180"/><line x1="552" y1="210" x2="564" y2="240"/><line x1="564" y1="210" x2="552" y2="240"/><line x1="552" y1="270" x2="564" y2="300"/><line x1="564" y1="270" x2="552" y2="300"/></g>' +
        '<rect x="410" y="100" width="230" height="10" fill="#f0a500" stroke="#7a5200" stroke-width="2"/>' +
        '<rect x="620" y="94" width="40" height="22" fill="#7a5200"/>' +
        '<line class="tk-cable" x1="440" y1="110" x2="440" y2="190" stroke="#222" stroke-width="2"/><rect class="tk-load" x="425" y="190" width="30" height="22" fill="#6d7b82" stroke="#222" stroke-width="2"/></g>' +
      // щит із кресленням
      '<g class="tk-hot" data-id="board"><rect x="110" y="232" width="170" height="110" fill="#fff" stroke="#6b4a1f" stroke-width="5"/>' +
        '<rect x="140" y="342" width="8" height="18" fill="#6b4a1f"/><rect x="242" y="342" width="8" height="18" fill="#6b4a1f"/>' +
        '<g stroke="#12284a" stroke-width="3" fill="none"><line x1="140" y1="252" x2="140" y2="326"/><line x1="140" y1="326" x2="238" y2="326"/><line x1="140" y1="252" x2="238" y2="326"/></g>' +
        '<g fill="#b5392b"><polygon points="238,326 228,320 228,332"/></g>' +
        '<text x="196" y="246" font-size="10" fill="#12284a" text-anchor="middle">кронштейн</text></g>' +
      // вагончик
      '<g class="tk-hot" data-id="trailer"><rect x="10" y="250" width="86" height="110" fill="#e0a52a" stroke="#6b4a10" stroke-width="3"/>' +
        '<rect x="22" y="268" width="26" height="26" fill="#cde6f2" stroke="#6b4a10" stroke-width="2"/><rect x="58" y="298" width="28" height="62" fill="#8b5d1a" stroke="#6b4a10" stroke-width="2"/>' +
        '<text x="53" y="262" font-size="9" fill="#4a3208" text-anchor="middle">ПРОРАБ</text></g>' +
      // бочка з ключем
      '<g class="tk-hot" data-id="barrel"><ellipse cx="330" cy="400" rx="30" ry="9" fill="#3a5a8a"/><rect x="300" y="400" width="60" height="50" fill="#3f64a0" stroke="#1b2f55" stroke-width="3"/>' +
        '<ellipse cx="330" cy="450" rx="30" ry="9" fill="#3f64a0" stroke="#1b2f55" stroke-width="3"/><ellipse cx="330" cy="400" rx="30" ry="9" fill="#5b82bd" stroke="#1b2f55" stroke-width="3"/>' +
        '<line x1="300" y1="418" x2="360" y2="418" stroke="#1b2f55" stroke-width="2"/><line x1="300" y1="436" x2="360" y2="436" stroke="#1b2f55" stroke-width="2"/></g>' +
      // каска
      '<g class="tk-hot" data-id="helmet"><path d="M150 430 q30 -40 60 0 z" fill="#f5c400" stroke="#7a5f00" stroke-width="3"/><rect x="144" y="428" width="72" height="8" rx="3" fill="#f5c400" stroke="#7a5f00" stroke-width="3"/></g>' +
      // ворота
      '<g class="tk-hot" data-id="gate"><rect x="676" y="220" width="12" height="140" fill="#555"/><rect x="760" y="220" width="12" height="140" fill="#555"/>' +
        '<g class="tk-gate"><rect x="688" y="236" width="72" height="110" fill="#d8dde0" stroke="#555" stroke-width="3"/>' +
        '<g stroke="#e3a21a" stroke-width="8"><line x1="692" y1="340" x2="756" y2="242"/><line x1="692" y1="290" x2="756" y2="242"/></g>' +
        '<rect x="708" y="280" width="32" height="26" rx="3" fill="#2a2f33" stroke="#111" stroke-width="2"/><text class="tk-led" x="724" y="298" text-anchor="middle" font-size="12" font-family="monospace" fill="#5dff9a">----</text></g></g>' +
      '</svg>';
    g.stage.innerHTML = h;
    var svg = g.stage.querySelector('svg');
    g.say('Ви на будмайданчику. Ворота замкнені кодовим замком. Огляньте все навколо.');

    function beam() {
      return '<svg viewBox="0 0 360 230" class="tk-beam" role="img" aria-label="Кронштейн: горизонтальний стержень 4 м, висота 3 м, сила 12 кН вниз у вузлі">' +
        '<rect x="30" y="20" width="14" height="190" fill="#9aa7b2"/><line x1="44" y1="40" x2="44" y2="190" stroke="#555" stroke-width="2"/>' +
        '<line x1="44" y1="50" x2="260" y2="50" stroke="' + INK + '" stroke-width="5"/>' +
        '<line x1="44" y1="170" x2="260" y2="50" stroke="' + INK + '" stroke-width="5"/>' +
        '<circle cx="260" cy="50" r="6" fill="#fff" stroke="' + INK + '" stroke-width="2"/>' +
        '<line x1="260" y1="56" x2="260" y2="120" stroke="#b5392b" stroke-width="4"/><polygon points="260,124 253,108 267,108" fill="#b5392b"/>' +
        '<text x="272" y="100" font-size="14" font-weight="700" fill="#b5392b">F = 12 кН</text>' +
        '<text x="150" y="40" text-anchor="middle" font-size="13" font-weight="700" fill="' + INK + '">1 (горизонтальний)</text>' +
        '<text x="165" y="146" text-anchor="middle" font-size="13" font-weight="700" fill="' + INK + '" transform="rotate(-29 165 146)">2 (похилий)</text>' +
        '<line x1="44" y1="205" x2="260" y2="205" stroke="' + INK + '" stroke-width="1.5"/><text x="152" y="222" text-anchor="middle" font-size="13" fill="' + INK + '">4 м</text>' +
        '<line x1="14" y1="50" x2="14" y2="170" stroke="' + INK + '" stroke-width="1.5"/><text x="8" y="115" font-size="13" fill="' + INK + '" transform="rotate(-90 8 115)">3 м</text></svg>';
    }

    function openKeypad() {
      var code = '', busy = false;
      var body = g.modal('<h3>Кодовий замок воріт</h3><div class="kp-disp">----</div>' +
        '<div class="kp-grid">' + [1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (n) { return '<button type="button" data-k="' + n + '">' + n + '</button>'; }).join('') +
        '<button type="button" data-k="C">C</button><button type="button" data-k="0">0</button><button type="button" data-k="ok" class="kp-ok">OK</button></div><p class="kp-msg muted"></p>');
      var disp = body.querySelector('.kp-disp'), msg = body.querySelector('.kp-msg');
      function showCode() { disp.textContent = (code + '----').slice(0, 4); }
      body.querySelector('.kp-grid').addEventListener('click', function (e) {
        var b = e.target.closest('button[data-k]'); if (!b || busy) return;
        var k = b.getAttribute('data-k');
        if (k === 'C') { code = ''; msg.textContent = ''; showCode(); return; }
        if (k === 'ok') {
          if (code.length < 4) { msg.textContent = 'Код має 4 цифри.'; return; }
          busy = true; msg.textContent = 'Перевіряємо…';
          g.submit(code).then(function (r) {
            busy = false;
            if (r.expired) { return; }
            if (!r.correct) { msg.textContent = 'Замок не відкрився. Перевірте розрахунок.'; code = ''; showCode(); return; }
            opened = true; g.close();
            svg.querySelector('.tk-led').textContent = 'OPEN';
            svg.querySelector('.tk-gate').classList.add('tk-slide');
            g.say('Ворота відчинено. Ви вийшли з майданчика!');
            setTimeout(function () { g.finish(r); }, 1800);
          }).catch(function (err) {
            busy = false; msg.textContent = err && err.message === 'NETWORK' ? 'Немає зв’язку. Спробуйте ще раз.' : 'Не вдалося перевірити (' + (err && err.message) + ').';
          });
          return;
        }
        if (code.length < 4) { code += k; showCode(); }
      });
    }

    var ACT = {
      crane: function () { g.say('Кран піднімає плиту. Його силу вам рахувати не треба, цікавіше кронштейн на щиті.'); },
      helmet: function () { g.say('Каска. Без неї на майданчику не можна, але до замка вона не має відношення.'); },
      barrel: function () {
        if (hasKey) { g.say('У бочці більше нічого немає.'); return; }
        hasKey = true;
        g.say('У бочці лежить ключ з написом «ПРОРАБ». Він має підходити до вагончика.');
      },
      trailer: function () {
        if (!hasKey) { g.say('Вагончик прораба зачинений. Шукайте ключ.'); return; }
        g.modal('<h3>Вагончик прораба</h3><p>На столі записка:</p><div class="tk-note">' +
          '<p><b>Вузол кронштейна в рівновазі.</b> Сили, що збігаються у вузлі, дають дві умови: сума проекцій на горизонталь = 0 і на вертикаль = 0.</p>' +
          '<p>Нехай α: кут похилого стержня 2 до горизонталі. З креслення: <b>sin α = 3/5</b>, <b>cos α = 4/5</b> (трикутник 3-4-5).</p>' +
          '<p>Вертикаль: <b>N<sub>2</sub> · sin α = F</b>. Горизонталь: <b>N<sub>1</sub> = N<sub>2</sub> · cos α</b>.</p>' +
          '<p>Код замка: <b>N<sub>2</sub>, потім N<sub>1</sub></b>, у кН, цілими числами, без пробілів.</p></div>');
      },
      board: function () {
        g.modal('<h3>Щит із кресленням</h3>' + beam() + '<p>Кронштейн: горизонтальний стержень 1 завдовжки 4 м, висота кріплення похилого стержня 2 дорівнює 3 м. У вузлі діє сила F = 12 кН.</p>');
      },
      gate: function () {
        if (opened) { g.say('Ворота відчинені.'); return; }
        openKeypad();
      }
    };

    svg.addEventListener('click', function (e) {
      var t = e.target.closest('[data-id]'); if (!t) return;
      var id = t.getAttribute('data-id');
      if (ACT[id]) ACT[id]();
    });
  };

  window.PortalTasks = { run: run, scenes: SCENES, mmss: mmss, pointsNow: pointsNow };
})();
