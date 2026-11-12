/* Квест z5 «Інспекція об’єкта»: теорія механіки без розрахунків.
   Дев’ять станцій. Правильні відповіді тут не зберігаються: з усіх станцій складається «паспорт» (рядок),
   який перевіряє сервер. Студент може будь-коли повернутися на станцію й змінити відповідь. */
(function () {
  'use strict';
  if (!window.PortalTasks) return;
  var INK = '#12284a';

  function tag(name, attrs, inner) { return '<' + name + (attrs ? ' ' + attrs : '') + '>' + (inner || '') + '</' + name + '>'; }

  /* ---------- малюнки-деталі ---------- */
  var ARW = '<defs><marker id="qa" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill="#b5392b"/></marker></defs>';
  function hatch(x, y, n, dx, dy, step) {
    var s = '';
    for (var i = 0; i < n; i++) s += '<line x1="' + (x + i * step) + '" y1="' + y + '" x2="' + (x + i * step + dx) + '" y2="' + (y + dy) + '" stroke="' + INK + '" stroke-width="1.5"/>';
    return s;
  }
  function pinSvg() {
    return '<svg viewBox="0 0 120 90" class="st-pic"><line x1="10" y1="20" x2="110" y2="20" stroke="' + INK + '" stroke-width="7"/>' +
      '<polygon points="60,24 44,56 76,56" fill="#fff" stroke="' + INK + '" stroke-width="2.5"/>' +
      '<line x1="34" y1="58" x2="86" y2="58" stroke="' + INK + '" stroke-width="3"/>' + hatch(38, 58, 6, -7, 9, 9) + '</svg>';
  }
  function rollerSvg() {
    return '<svg viewBox="0 0 120 90" class="st-pic"><line x1="10" y1="20" x2="110" y2="20" stroke="' + INK + '" stroke-width="7"/>' +
      '<polygon points="60,24 44,54 76,54" fill="#fff" stroke="' + INK + '" stroke-width="2.5"/>' +
      '<circle cx="50" cy="60" r="5" fill="#fff" stroke="' + INK + '" stroke-width="2"/><circle cx="70" cy="60" r="5" fill="#fff" stroke="' + INK + '" stroke-width="2"/>' +
      '<line x1="34" y1="66" x2="86" y2="66" stroke="' + INK + '" stroke-width="3"/></svg>';
  }
  function wallSvg() {
    return '<svg viewBox="0 0 120 90" class="st-pic"><rect x="20" y="8" width="12" height="74" fill="#cfd9e6" stroke="' + INK + '" stroke-width="2"/>' +
      hatch(20, 18, 6, -8, 8, 12) + '<line x1="32" y1="45" x2="112" y2="45" stroke="' + INK + '" stroke-width="7"/></svg>';
  }

  // епюра моментів (форма) під лінією балки
  function epureMini(kind) {
    var s = '<svg viewBox="0 0 160 90" class="st-pic"><line x1="10" y1="20" x2="150" y2="20" stroke="' + INK + '" stroke-width="2"/>';
    var shape = {
      rect: '<polygon points="10,20 10,66 150,66 150,20" ',
      tri: '<polygon points="10,20 80,68 150,20" ',
      par: '<path d="M10 20 Q80 116 150 20 Z" ',
      trap: '<polygon points="10,20 45,66 115,66 150,20" '
    }[kind];
    return s + shape + 'fill="rgba(237,137,54,.28)" stroke="#c05621" stroke-width="2.5"/></svg>';
  }

  /* ---------- станції ---------- */
  var TITLES = ['Опори', 'Епюри', 'Шарнір', 'Центр ваги', 'Тертя', 'Ферма', 'Рух', 'Момент сили', 'Правда чи ні'];

  window.PortalTasks.scenes.z5 = function (g) {
    var S = {
      s1: [null, null, null], s2: [null, null], s3: {}, s4: null, s5: [], s6: { a: null, b: null, c: null, d: null, e: null },
      s7: [null, null, null], s8: [null, null], s9: [null, null, null, null, null, null]
    };

    function tokens() {
      var t = [];
      t[0] = S.s1.indexOf(null) < 0 ? S.s1.join('') : '';
      t[1] = S.s2.indexOf(null) < 0 ? S.s2.join('') : '';
      var k3 = Object.keys(S.s3).filter(function (k) { return S.s3[k]; }).sort().join('');
      t[2] = k3;
      t[3] = S.s4 || '';
      t[4] = S.s5.length === 3 ? S.s5.join('') : '';
      var six = S.s6;
      t[5] = ['a', 'b', 'c', 'd', 'e'].every(function (k) { return six[k]; }) ? six.a + six.b + six.c + '/' + six.d + six.e : '';
      t[6] = S.s7.indexOf(null) < 0 ? S.s7.join('') : '';
      t[7] = S.s8.indexOf(null) < 0 ? S.s8.join('') : '';
      t[8] = S.s9.indexOf(null) < 0 ? S.s9.join('') : '';
      return t;
    }
    function done(i) { return tokens()[i] !== ''; }

    /* --- сцена: карта об’єкта --- */
    var tiles = [
      ['Опори', function () { return '<g transform="translate(45 20) scale(.55)"><polygon points="60,10 36,56 84,56" fill="#fff" stroke="' + INK + '" stroke-width="4"/><line x1="26" y1="60" x2="94" y2="60" stroke="' + INK + '" stroke-width="5"/></g>'; }],
      ['Епюри', function () { return '<g transform="translate(25 28)"><line x1="0" y1="0" x2="90" y2="0" stroke="' + INK + '" stroke-width="4"/><polygon points="0,0 45,36 90,0" fill="rgba(237,137,54,.4)" stroke="#c05621" stroke-width="3"/></g>'; }],
      ['Шарнір', function () { return '<g transform="translate(18 40)"><line x1="0" y1="0" x2="95" y2="0" stroke="' + INK + '" stroke-width="7"/><circle cx="48" cy="0" r="9" fill="#fff" stroke="' + INK + '" stroke-width="4"/></g>'; }],
      ['Центр ваги', function () { return '<g transform="translate(40 14)"><polygon points="0,0 16,0 16,34 46,34 46,50 0,50" fill="#cfd9e6" stroke="' + INK + '" stroke-width="3"/><circle cx="21" cy="40" r="4" fill="#b5392b"/></g>'; }],
      ['Тертя', function () { return '<g transform="translate(20 20)"><polygon points="0,56 100,56 100,6" fill="#e6dcc4" stroke="' + INK + '" stroke-width="3"/><rect x="50" y="18" width="18" height="14" fill="#6aa7d9" stroke="' + INK + '" stroke-width="2" transform="rotate(-27 59 25)"/></g>'; }],
      ['Ферма', function () { return '<g transform="translate(20 28)" fill="none" stroke="' + INK + '" stroke-width="4"><polygon points="0,52 100,52 50,6"/><line x1="50" y1="6" x2="50" y2="52"/></g>'; }],
      ['Рух', function () { return '<g transform="translate(22 20)" fill="none"><polyline points="0,60 20,50 40,32 60,18 90,10" stroke="' + INK + '" stroke-width="4"/><line x1="0" y1="62" x2="100" y2="62" stroke="#778" stroke-width="2"/></g>'; }],
      ['Момент сили', function () { return '<g transform="translate(26 22)"><line x1="0" y1="30" x2="86" y2="30" stroke="' + INK + '" stroke-width="7"/><circle cx="12" cy="30" r="9" fill="#fff" stroke="' + INK + '" stroke-width="3"/><path d="M60 8 A22 22 0 0 1 82 30" fill="none" stroke="#805ad5" stroke-width="4"/></g>'; }],
      ['Правда чи ні', function () { return '<g transform="translate(30 16)"><rect width="76" height="62" rx="6" fill="#fffbe8" stroke="' + INK + '" stroke-width="3"/><g stroke="#8a7a4a" stroke-width="3"><line x1="12" y1="18" x2="64" y2="18"/><line x1="12" y1="32" x2="64" y2="32"/><line x1="12" y1="46" x2="44" y2="46"/></g></g>'; }]
    ];
    var h = '<svg viewBox="0 0 800 560" class="tk-svg" role="group" aria-label="Карта будівельного об’єкта з дев’ятьма станціями">' +
      '<rect width="800" height="560" fill="#dfe8d4"/>' +
      '<rect y="440" width="800" height="120" fill="#c9d4b8"/>' +
      '<path d="M0 100 Q200 70 400 100 T800 90" fill="none" stroke="#b7c4a3" stroke-width="2"/>';
    for (var i = 0; i < 9; i++) {
      var cx = 30 + (i % 3) * 255, cy = 18 + Math.floor(i / 3) * 140;
      h += '<g class="tk-hot st-tile" data-id="s' + (i + 1) + '">' +
        '<rect x="' + cx + '" y="' + cy + '" width="235" height="122" rx="12" fill="#fff" stroke="' + INK + '" stroke-width="3"/>' +
        '<g transform="translate(' + (cx + 40) + ' ' + (cy + 8) + ')">' + tiles[i][1]() + '</g>' +
        '<circle cx="' + (cx + 24) + '" cy="' + (cy + 24) + '" r="15" fill="' + INK + '"/><text x="' + (cx + 24) + '" y="' + (cy + 30) + '" text-anchor="middle" font-size="17" font-weight="700" fill="#fff">' + (i + 1) + '</text>' +
        '<text x="' + (cx + 117) + '" y="' + (cy + 112) + '" text-anchor="middle" font-size="18" font-weight="700" fill="' + INK + '">' + tiles[i][0] + '</text>' +
        '<g class="st-badge" data-n="' + i + '" opacity="0"><circle cx="' + (cx + 208) + '" cy="' + (cy + 24) + '" r="14" fill="#2f855a"/><path d="M' + (cx + 201) + ' ' + (cy + 24) + ' l5 6 l9 -12" fill="none" stroke="#fff" stroke-width="3.5"/></g>' +
        '</g>';
    }
    h += '<g class="tk-hot" data-id="gate"><rect x="180" y="450" width="440" height="88" rx="14" fill="' + INK + '" stroke="#0a1730" stroke-width="3"/>' +
      '<text x="400" y="488" text-anchor="middle" font-size="22" font-weight="700" fill="#fff">Здати паспорт об’єкта</text>' +
      '<text x="400" y="516" text-anchor="middle" font-size="14" fill="#cfe0ff" class="st-count">Пройдено станцій: 0 з 9</text></g></svg>';
    g.stage.innerHTML = h;
    var svg = g.stage.querySelector('svg');
    g.say('Карта об’єкта. Відкрийте кожну з дев’яти станцій, дайте відповіді, а потім натисніть «Здати паспорт». Рахувати нічого не треба, потрібно розуміти.');

    function refresh() {
      var t = tokens(), n = 0;
      t.forEach(function (x, i) {
        var b = svg.querySelector('.st-badge[data-n="' + i + '"]');
        b.setAttribute('opacity', x ? '1' : '0');
        if (x) n++;
      });
      svg.querySelector('.st-count').textContent = 'Пройдено станцій: ' + n + ' з 9';
    }

    function head(n, text) { return '<h3>Станція ' + n + '. ' + TITLES[n - 1] + '</h3><p>' + text + '</p>'; }
    function btnRow(items, cur, attr) {
      return '<div class="st-row">' + items.map(function (it) {
        return '<button type="button" class="st-opt' + (cur === it[0] ? ' on' : '') + '" ' + attr + '="' + it[0] + '">' + it[1] + '</button>';
      }).join('') + '</div>';
    }
    function mark(body, sel, val, attr) {
      [].forEach.call(body.querySelectorAll(sel), function (b) { b.classList.toggle('on', b.getAttribute(attr) === String(val)); });
    }

    /* 1. Опори */
    function st1() {
      var items = [['Шарнірно-нерухома опора', pinSvg()], ['Шарнірно-рухома опора (на котках)', rollerSvg()], ['Жорстке защемлення (заробка)', wallSvg()]];
      var html = head(1, 'Скільки опорних реакцій дає кожна опора? Вважайте і сили в різних напрямках, і реактивний момент, якщо він є.');
      items.forEach(function (it, i) {
        html += '<div class="st-item">' + it[1] + '<div><b>' + it[0] + '</b>' + btnRow([[1, '1'], [2, '2'], [3, '3']], S.s1[i], 'data-i="' + i + '" data-v') + '</div></div>';
      });
      var body = g.modal(html);
      body.onclick = function (e) {
        var b = e.target.closest('button[data-v]'); if (!b) return;
        var i = +b.getAttribute('data-i'); S.s1[i] = +b.getAttribute('data-v');
        [].forEach.call(body.querySelectorAll('button[data-i="' + i + '"]'), function (x) { x.classList.toggle('on', x === b); });
        refresh();
      };
    }

    /* 2. Епюри */
    function st2() {
      var beamF = '<svg viewBox="0 0 220 90" class="st-pic">' + ARW + '<line x1="20" y1="40" x2="200" y2="40" stroke="' + INK + '" stroke-width="7"/><polygon points="20,44 8,68 32,68" fill="#fff" stroke="' + INK + '" stroke-width="2"/><polygon points="200,44 188,64 212,64" fill="#fff" stroke="' + INK + '" stroke-width="2"/><circle cx="200" cy="68" r="3.5" fill="#fff" stroke="' + INK + '" stroke-width="2"/><line x1="110" y1="4" x2="110" y2="34" stroke="#b5392b" stroke-width="3" marker-end="url(#qa)"/><text x="122" y="16" font-size="13" fill="#b5392b" font-weight="700">F</text></svg>';
      var beamQ = '<svg viewBox="0 0 220 90" class="st-pic">' + ARW + '<line x1="20" y1="40" x2="200" y2="40" stroke="' + INK + '" stroke-width="7"/><polygon points="20,44 8,68 32,68" fill="#fff" stroke="' + INK + '" stroke-width="2"/><polygon points="200,44 188,64 212,64" fill="#fff" stroke="' + INK + '" stroke-width="2"/><circle cx="200" cy="68" r="3.5" fill="#fff" stroke="' + INK + '" stroke-width="2"/><rect x="20" y="14" width="180" height="20" fill="rgba(66,153,225,.15)" stroke="#3182ce"/>' +
        [0, 1, 2, 3, 4, 5, 6, 7, 8].map(function (k) { return '<line x1="' + (28 + k * 20) + '" y1="14" x2="' + (28 + k * 20) + '" y2="36" stroke="#3182ce" stroke-width="2" marker-end="url(#qa)"/>'; }).join('') + '</svg>';
      var optsA = [['a', 'rect'], ['b', 'tri'], ['c', 'par'], ['d', 'trap']];
      var optsB = [['a', 'tri'], ['b', 'rect'], ['c', 'par'], ['d', 'trap']];
      function grid(opts, cur, q) {
        return '<div class="st-grid">' + opts.map(function (o) {
          return '<button type="button" class="st-opt st-card' + (cur === o[0] ? ' on' : '') + '" data-q="' + q + '" data-v="' + o[0] + '">' + epureMini(o[1]) + '<span>' + o[0].toUpperCase() + '</span></button>';
        }).join('') + '</div>';
      }
      var html = head(2, 'Епюру згинального моменту малюють з боку розтягнутих волокон. Для кожної балки оберіть правильну форму епюри.') +
        '<p><b>Балка 1.</b> Сила посередині.</p>' + beamF + grid(optsA, S.s2[0], 0) +
        '<p><b>Балка 2.</b> Рівномірне навантаження по всій довжині.</p>' + beamQ + grid(optsB, S.s2[1], 1);
      var body = g.modal(html);
      body.onclick = function (e) {
        var b = e.target.closest('button[data-q]'); if (!b) return;
        var q = +b.getAttribute('data-q'); S.s2[q] = b.getAttribute('data-v');
        [].forEach.call(body.querySelectorAll('button[data-q="' + q + '"]'), function (x) { x.classList.toggle('on', x === b); });
        refresh();
      };
    }

    /* 3. Шарнір */
    function st3() {
      var pts = [['a', 50, 'A'], ['b', 150, 'B'], ['c', 250, 'C'], ['d', 330, 'D'], ['e', 410, 'E']];
      var svg3 = '<svg viewBox="0 0 470 170" class="st-pic st-wide">' + ARW +
        '<rect x="34" y="40" width="12" height="90" fill="#cfd9e6" stroke="' + INK + '" stroke-width="2"/>' + hatch(34, 52, 6, -8, 8, 14) +
        '<line x1="46" y1="84" x2="410" y2="84" stroke="' + INK + '" stroke-width="7"/>' +
        '<circle cx="250" cy="84" r="8" fill="#fff" stroke="' + INK + '" stroke-width="3.5"/>' +
        '<polygon points="410,88 396,112 424,112" fill="#fff" stroke="' + INK + '" stroke-width="2"/><circle cx="403" cy="118" r="4" fill="#fff" stroke="' + INK + '" stroke-width="2"/><circle cx="417" cy="118" r="4" fill="#fff" stroke="' + INK + '" stroke-width="2"/>' +
        '<line x1="150" y1="30" x2="150" y2="76" stroke="#b5392b" stroke-width="3.5" marker-end="url(#qa)"/><text x="162" y="42" font-size="14" fill="#b5392b" font-weight="700">F</text>' +
        '<rect x="250" y="52" width="160" height="22" fill="rgba(66,153,225,.15)" stroke="#3182ce"/>' +
        [0, 1, 2, 3, 4, 5, 6, 7].map(function (k) { return '<line x1="' + (258 + k * 20) + '" y1="52" x2="' + (258 + k * 20) + '" y2="78" stroke="#3182ce" stroke-width="2" marker-end="url(#qa)"/>'; }).join('') +
        '<text x="330" y="44" text-anchor="middle" font-size="14" fill="#2b6cb0" font-weight="700">q</text>' +
        pts.map(function (p) {
          return '<g class="st-pt' + (S.s3[p[0]] ? ' on' : '') + '" data-p="' + p[0] + '"><circle cx="' + p[1] + '" cy="84" r="15"/><text x="' + p[1] + '" y="146" text-anchor="middle" font-size="16" font-weight="700" fill="' + INK + '">' + p[2] + '</text></g>';
        }).join('') + '</svg>';
      var html = head(3, 'Це балка із защемленням у стіні (зліва), шарніром у точці C і опорою на котках справа. Натисніть усі точки, у яких згинальний момент точно дорівнює нулю. Точок може бути кілька.') + svg3 +
        '<p class="muted">Підказка: де балка не може передати момент?</p>';
      var body = g.modal(html);
      body.onclick = function (e) {
        var t = e.target.closest('.st-pt'); if (!t) return;
        var k = t.getAttribute('data-p'); S.s3[k] = !S.s3[k];
        t.classList.toggle('on', !!S.s3[k]);
        refresh();
      };
    }

    /* 4. Центр ваги */
    function st4() {
      var X = function (x) { return 60 + 38 * x; }, Y = function (y) { return 230 - 38 * y; };
      var dots = [['a', 1, 4.5], ['b', 1, 1], ['c', 2.2, 2.2], ['d', 4.5, 1], ['e', 3.6, 3.6]];
      var shape = '<polygon points="' + [[0, 0], [6, 0], [6, 2], [2, 2], [2, 6], [0, 6]].map(function (p) { return X(p[0]) + ',' + Y(p[1]); }).join(' ') + '" fill="#cfd9e6" stroke="' + INK + '" stroke-width="3"/>';
      var svg4 = '<svg viewBox="0 0 320 250" class="st-pic st-wide">' + shape +
        dots.map(function (d) {
          return '<g class="st-pt' + (S.s4 === d[0] ? ' on' : '') + '" data-p="' + d[0] + '"><circle cx="' + X(d[1]) + '" cy="' + Y(d[2]) + '" r="11"/><text x="' + (X(d[1]) + 15) + '" y="' + (Y(d[2]) - 9) + '" font-size="15" font-weight="700" fill="#b5392b">' + d[0].toUpperCase() + '</text></g>';
        }).join('') + '</svg>';
      var html = head(4, 'Це плоска пластина однакової товщини з однорідного матеріалу, вирізана літерою «Г». Куди треба поставити вістря голки, щоб пластина не нахилялась? Натисніть одну точку.') + svg4 +
        '<p class="muted">Не поспішайте: центр ваги не завжди лежить усередині самого матеріалу.</p>';
      var body = g.modal(html);
      body.onclick = function (e) {
        var t = e.target.closest('.st-pt'); if (!t) return;
        S.s4 = t.getAttribute('data-p');
        [].forEach.call(body.querySelectorAll('.st-pt'), function (x) { x.classList.toggle('on', x === t); });
        refresh();
      };
    }

    /* 5. Тертя */
    var TH = { a: 5.7, b: 24.2, c: 42 };
    function st5() {
      var mats = [['a', 'Лід', '#bfe3f5'], ['b', 'Дерево', '#c28b4c'], ['c', 'Гума', '#333']];
      var lanes = mats.map(function (m, i) {
        return '<svg viewBox="0 -10 160 185" class="st-lane" style="overflow:visible"><g class="st-plank" data-m="' + m[0] + '" style="transform-origin:140px 140px"><rect x="20" y="140" width="130" height="8" fill="#8b6a3f" stroke="' + INK + '" stroke-width="2"/>' +
          '<g class="st-blk" style="transition:transform .8s ease-in"><rect x="26" y="122" width="26" height="18" fill="' + m[2] + '" stroke="' + INK + '" stroke-width="2"/></g></g>' +
          '<text x="80" y="165" text-anchor="middle" font-size="14" font-weight="700" fill="' + INK + '">' + m[1] + '</text></svg>';
      }).join('');
      var shuffled = [mats[2], mats[0], mats[1]];
      var html = head(5, 'Три однакові бруски стоять на однакових похилих дошках, але зроблені з різних матеріалів. Повільно піднімайте дошки повзунком і спостерігайте. Потім натискайте матеріали в порядку, в якому бруски починають ковзати вниз.') +
        '<div class="st-lanes">' + lanes + '</div>' +
        '<label class="st-slide">Кут нахилу: <b class="st-ang">0°</b><input type="range" min="0" max="60" step="0.5" value="0" class="st-range"></label>' +
        '<p><b>Порядок ковзання:</b> <span class="st-ord"></span> <button type="button" class="st-opt st-small" data-reset="1">Скинути</button></p>' +
        '<div class="st-row">' + shuffled.map(function (m) { return '<button type="button" class="st-opt" data-m="' + m[0] + '">' + m[1] + '</button>'; }).join('') + '</div>';
      var body = g.modal(html);
      var range = body.querySelector('.st-range'), ang = body.querySelector('.st-ang'), ord = body.querySelector('.st-ord');
      var NAME = { a: 'лід', b: 'дерево', c: 'гума' };
      function upd() {
        var a = +range.value; ang.textContent = a + '°';
        [].forEach.call(body.querySelectorAll('.st-plank'), function (p) {
          var m = p.getAttribute('data-m');
          p.style.transition = 'transform .25s';
          p.style.transform = 'rotate(' + a + 'deg)';
          p.querySelector('.st-blk').style.transform = a > TH[m] ? 'translateX(98px)' : 'translateX(0)';
        });
      }
      function showOrd() {
        ord.textContent = S.s5.length ? S.s5.map(function (k, i) { return (i + 1) + ') ' + NAME[k]; }).join(', ') : 'ще не вибрано';
        [].forEach.call(body.querySelectorAll('button[data-m]'), function (b) { b.classList.toggle('on', S.s5.indexOf(b.getAttribute('data-m')) >= 0); });
      }
      range.addEventListener('input', upd);
      body.onclick = function (e) {
        if (e.target.closest('[data-reset]')) { S.s5 = []; showOrd(); refresh(); return; }
        var b = e.target.closest('button[data-m]'); if (!b) return;
        var m = b.getAttribute('data-m');
        if (S.s5.indexOf(m) < 0 && S.s5.length < 3) S.s5.push(m);
        showOrd(); refresh();
      };
      upd(); showOrd();
    }

    /* 6. Ферма */
    var RS = { r: 'розтяг', s: 'стиск' };
    function st6() {
      function rod(id, x1, y1, x2, y2) {
        var v = S.s6[id];
        return '<g class="st-rod' + (v ? ' ' + v : '') + '" data-r="' + id + '"><line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" class="st-hit"/><line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" class="st-line"/>' +
          '<text x="' + ((x1 + x2) / 2) + '" y="' + ((y1 + y2) / 2 - 8) + '" text-anchor="middle" class="st-rl">' + (v ? RS[v] : 'натисніть') + '</text></g>';
      }
      var t1 = '<svg viewBox="0 0 300 190" class="st-pic st-wide">' + ARW +
        rod('a', 40, 150, 150, 40) + rod('b', 150, 40, 260, 150) + rod('c', 40, 150, 260, 150) +
        '<polygon points="40,154 26,176 54,176" fill="#fff" stroke="' + INK + '" stroke-width="2"/><polygon points="260,154 246,172 274,172" fill="#fff" stroke="' + INK + '" stroke-width="2"/><circle cx="260" cy="177" r="3.5" fill="#fff" stroke="' + INK + '" stroke-width="2"/>' +
        '<line x1="150" y1="2" x2="150" y2="34" stroke="#b5392b" stroke-width="3.5" marker-end="url(#qa)"/><text x="162" y="18" font-size="14" fill="#b5392b" font-weight="700">F</text></svg>';
      var t2 = '<svg viewBox="0 0 300 190" class="st-pic st-wide">' + ARW +
        '<rect x="20" y="20" width="12" height="150" fill="#cfd9e6" stroke="' + INK + '" stroke-width="2"/>' + hatch(20, 32, 8, -8, 8, 18) +
        rod('d', 32, 50, 230, 50) + rod('e', 32, 150, 230, 50) +
        '<line x1="230" y1="52" x2="230" y2="110" stroke="#b5392b" stroke-width="3.5" marker-end="url(#qa)"/><text x="242" y="96" font-size="14" fill="#b5392b" font-weight="700">F</text></svg>';
      var html = head(6, 'Стержні ферми працюють лише на розтяг або на стиск. Натискайте на стержень, щоб змінити його стан: розтяг (синій) або стиск (червоний). Сили F спрямовані вниз.') +
        '<p><b>Дах: дві опори, сила на вершині.</b></p>' + t1 + '<p><b>Кронштейн на стіні: сила на кінці.</b></p>' + t2;
      var body = g.modal(html);
      body.onclick = function (e) {
        var r = e.target.closest('.st-rod'); if (!r) return;
        var id = r.getAttribute('data-r'), cur = S.s6[id];
        S.s6[id] = cur === null ? 'r' : cur === 'r' ? 's' : 'r';
        r.setAttribute('class', 'st-rod ' + S.s6[id]);
        r.querySelector('.st-rl').textContent = RS[S.s6[id]];
        refresh();
      };
    }

    /* 7. Рух (графіки швидкості) */
    function st7() {
      var graphs = [
        ['1', '<polyline points="20,20 140,90" fill="none" stroke="#c05621" stroke-width="4"/>'],
        ['2', '<polyline points="20,90 140,20" fill="none" stroke="#c05621" stroke-width="4"/>'],
        ['3', '<polyline points="20,40 140,40" fill="none" stroke="#c05621" stroke-width="4"/>']
      ];
      var gsvg = graphs.map(function (gr) {
        return '<div class="st-gr"><svg viewBox="0 0 160 110" class="st-pic"><line x1="20" y1="95" x2="150" y2="95" stroke="' + INK + '" stroke-width="2"/><line x1="20" y1="95" x2="20" y2="8" stroke="' + INK + '" stroke-width="2"/>' +
          '<text x="148" y="108" font-size="11" fill="' + INK + '">t</text><text x="4" y="14" font-size="11" fill="' + INK + '">v</text>' + gr[1] + '</svg><b>Графік ' + gr[0] + '</b></div>';
      }).join('');
      var qs = ['Автомобіль їде рівномірно, з постійною швидкістю.', 'Автомобіль рушає зі стану спокою й розганяється рівномірно.', 'Автомобіль гальмує рівномірно аж до повної зупинки.'];
      var html = head(7, 'Графіки показують, як швидкість v залежить від часу t. До кожного опису руху оберіть свій графік.') +
        '<div class="st-grs">' + gsvg + '</div>' +
        qs.map(function (q, i) {
          return '<div class="st-q"><p>' + (i + 1) + '. ' + q + '</p>' + btnRow([['1', 'Графік 1'], ['2', 'Графік 2'], ['3', 'Графік 3']], S.s7[i], 'data-i="' + i + '" data-v') + '</div>';
        }).join('');
      var body = g.modal(html);
      body.onclick = function (e) {
        var b = e.target.closest('button[data-v]'); if (!b) return;
        var i = +b.getAttribute('data-i'); S.s7[i] = b.getAttribute('data-v');
        [].forEach.call(body.querySelectorAll('button[data-i="' + i + '"]'), function (x) { x.classList.toggle('on', x === b); });
        refresh();
      };
    }

    /* 8. Момент сили */
    function st8() {
      var door = '<svg viewBox="0 0 260 110" class="st-pic st-wide">' + ARW +
        '<rect x="30" y="50" width="200" height="12" fill="#c28b4c" stroke="' + INK + '" stroke-width="2"/><circle cx="34" cy="56" r="8" fill="#fff" stroke="' + INK + '" stroke-width="3"/>' +
        '<text x="34" y="88" text-anchor="middle" font-size="12" fill="' + INK + '">петлі</text>' +
        [['a', 70], ['b', 130], ['c', 214]].map(function (p) {
          return '<g class="st-pt" data-p="' + p[0] + '"><line x1="' + p[1] + '" y1="14" x2="' + p[1] + '" y2="46" stroke="#b5392b" stroke-width="3.5" marker-end="url(#qa)"/><circle cx="' + p[1] + '" cy="56" r="13" fill="rgba(197,48,48,.12)" stroke="none"/><text x="' + (p[1] + 12) + '" y="24" font-size="15" font-weight="700" fill="#b5392b">' + p[0].toUpperCase() + '</text></g>';
        }).join('') + '</svg>';
      var html = head(8, 'Момент сили залежить від сили та від плеча.') +
        '<p><b>Двері, вид зверху.</b> У яку точку треба штовхнути з однаковою силою, щоб двері відчинити найлегше?</p>' + door +
        '<p><b>Гойдалка.</b> Важкий хлопчик і легкий хлопчик хочуть зрівноважити гойдалку. Де має сидіти важкий хлопчик?</p>' +
        btnRow([['a', 'Ближче до опори, ніж легкий'], ['b', 'Далі від опори, ніж легкий'], ['c', 'На такій самій відстані']], S.s8[1], 'data-sw');
      var body = g.modal(html);
      if (S.s8[0]) mark(body, '.st-pt', S.s8[0], 'data-p');
      [].forEach.call(body.querySelectorAll('.st-pt'), function (x) { x.classList.toggle('on', x.getAttribute('data-p') === S.s8[0]); });
      body.onclick = function (e) {
        var t = e.target.closest('.st-pt');
        if (t) {
          S.s8[0] = t.getAttribute('data-p');
          [].forEach.call(body.querySelectorAll('.st-pt'), function (x) { x.classList.toggle('on', x === t); });
          refresh(); return;
        }
        var b = e.target.closest('button[data-sw]'); if (!b) return;
        S.s8[1] = b.getAttribute('data-sw');
        [].forEach.call(body.querySelectorAll('button[data-sw]'), function (x) { x.classList.toggle('on', x === b); });
        refresh();
      };
    }

    /* 9. Правда чи ні */
    function st9() {
      var qs = [
        'Шарнір у балці передає і силу, і згинальний момент.',
        'Реакція рухомої опори спрямована перпендикулярно до опорної поверхні.',
        'Сила, лінія дії якої проходить через точку, дає відносно цієї точки нульовий момент.',
        'Центр ваги тіла завжди лежить усередині самого тіла.',
        'Балка статично визначувана, якщо кількість невідомих дорівнює кількості рівнянь статики.',
        'Що менша площа перерізу, то менше напруження при тій самій силі розтягу.'
      ];
      var html = head(9, 'Оцініть кожне твердження.') + qs.map(function (q, i) {
        return '<div class="st-q"><p>' + (i + 1) + '. ' + q + '</p>' + btnRow([['t', 'Правда'], ['f', 'Неправда']], S.s9[i], 'data-i="' + i + '" data-v') + '</div>';
      }).join('');
      var body = g.modal(html);
      body.onclick = function (e) {
        var b = e.target.closest('button[data-v]'); if (!b) return;
        var i = +b.getAttribute('data-i'); S.s9[i] = b.getAttribute('data-v');
        [].forEach.call(body.querySelectorAll('button[data-i="' + i + '"]'), function (x) { x.classList.toggle('on', x === b); });
        refresh();
      };
    }

    /* Здача паспорта */
    var sent = false;
    function gate() {
      var t = tokens(), left = [];
      t.forEach(function (x, i) { if (!x) left.push(i + 1); });
      var html = '<h3>Паспорт об’єкта</h3>' + t.map(function (x, i) {
        return '<p class="st-line-r">' + (x ? '✓' : '—') + ' Станція ' + (i + 1) + '. ' + TITLES[i] + '</p>';
      }).join('');
      if (left.length) {
        html += '<p class="kp-msg">Ще не всі станції заповнені: ' + left.join(', ') + '.</p>';
        g.modal(html); return;
      }
      html += '<p class="muted">Усі станції заповнені. Паспорт можна здавати скільки завгодно разів, поки не вийде час. Якщо відповідь неправильна, я не скажу, на якій станції помилка.</p>' +
        '<button type="button" class="btn st-send">Здати паспорт</button><p class="kp-msg muted st-msg"></p>';
      var body = g.modal(html);
      var btn = body.querySelector('.st-send'), msg = body.querySelector('.st-msg');
      btn.addEventListener('click', function () {
        if (sent) return;
        sent = true; btn.disabled = true; msg.textContent = 'Перевіряємо…';
        g.submit(tokens().join('-')).then(function (r) {
          sent = false; btn.disabled = false;
          if (r.expired) { return; }
          if (!r.correct) { msg.textContent = 'Паспорт не прийнято: десь є помилка. Поверніться на станції й перевірте відповіді.'; return; }
          g.close();
          g.say('Паспорт прийнято. Об’єкт допущено до роботи!');
          setTimeout(function () { g.finish(r); }, 1200);
        }).catch(function (err) {
          sent = false; btn.disabled = false;
          msg.textContent = err && err.message === 'NETWORK' ? 'Немає зв’язку. Спробуйте ще раз.' : 'Не вдалося перевірити (' + (err && err.message) + ').';
        });
      });
    }

    var OPEN = { s1: st1, s2: st2, s3: st3, s4: st4, s5: st5, s6: st6, s7: st7, s8: st8, s9: st9, gate: gate };
    svg.addEventListener('click', function (e) {
      var t = e.target.closest('[data-id]'); if (!t) return;
      var f = OPEN[t.getAttribute('data-id')]; if (f) f();
    });
  };
})();
