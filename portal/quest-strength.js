/* Квест z6 «Випробувальний полігон»: міцність матеріалів, динаміка, обертання. Без розрахунків.
   Дев’ять станцій, паспорт-код перевіряє сервер. Правильні відповіді тут не зберігаються. */
(function () {
  'use strict';
  if (!window.PortalTasks) return;
  var INK = '#12284a', RED = '#b5392b', BLUE = '#2b6cb0';

  var ARW = '<defs><marker id="qb" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill="' + RED + '"/></marker></defs>';
  function arrow(x1, y1, x2, y2) { return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + RED + '" stroke-width="3.5" marker-end="url(#qb)"/>'; }
  function hatchWall(x, y, h) {
    var s = '<rect x="' + x + '" y="' + y + '" width="10" height="' + h + '" fill="#cfd9e6" stroke="' + INK + '" stroke-width="2"/>';
    for (var i = 8; i < h; i += 12) s += '<line x1="' + x + '" y1="' + (y + i) + '" x2="' + (x - 8) + '" y2="' + (y + i + 8) + '" stroke="' + INK + '" stroke-width="1.5"/>';
    return s;
  }

  /* малюнки видів деформації */
  var DEF = {
    a: '<svg viewBox="0 0 160 90" class="st-pic">' + ARW + '<rect x="45" y="38" width="70" height="14" fill="#cfd9e6" stroke="' + INK + '" stroke-width="2"/>' + arrow(45, 45, 12, 45) + arrow(115, 45, 148, 45) + '</svg>',
    b: '<svg viewBox="0 0 160 90" class="st-pic">' + ARW + '<rect x="50" y="38" width="60" height="14" fill="#cfd9e6" stroke="' + INK + '" stroke-width="2"/>' + arrow(14, 45, 48, 45) + arrow(146, 45, 112, 45) + '</svg>',
    c: '<svg viewBox="0 0 160 90" class="st-pic">' + ARW + '<rect x="40" y="26" width="38" height="36" fill="#cfd9e6" stroke="' + INK + '" stroke-width="2"/><rect x="82" y="30" width="38" height="36" fill="#cfd9e6" stroke="' + INK + '" stroke-width="2"/>' + arrow(59, 4, 59, 24).replace('x2="59" y2="24"', 'x2="59" y2="24"') + arrow(101, 88, 101, 68) + '</svg>',
    d: '<svg viewBox="0 0 160 90" class="st-pic"><rect x="30" y="34" width="100" height="22" fill="#cfd9e6" stroke="' + INK + '" stroke-width="2"/><ellipse cx="130" cy="45" rx="6" ry="11" fill="#e8eef6" stroke="' + INK + '" stroke-width="2"/><path d="M142 26 A24 24 0 0 1 142 64" fill="none" stroke="' + RED + '" stroke-width="3.5" marker-end="url(#qb)"/>' + ARW + '<path d="M18 64 A24 24 0 0 1 18 26" fill="none" stroke="' + RED + '" stroke-width="3.5" marker-end="url(#qb)"/></svg>',
    e: '<svg viewBox="0 0 160 90" class="st-pic">' + ARW + hatchWall(18, 20, 50) + '<path d="M28 40 Q90 44 140 74" fill="none" stroke="' + INK + '" stroke-width="12"/>' + arrow(140, 18, 140, 62) + '</svg>'
  };
  var DEF_ORDER = ['e', 'a', 'd', 'b', 'c']; // порядок малюнків (відповіді: eadbc за назвами a..e)

  var NAMES = [['a', 'Розтяг'], ['b', 'Стиск'], ['c', 'Зріз'], ['d', 'Кручення'], ['e', 'Згин']];

  var TITLES = ['Види деформації', 'Діаграма розтягу', 'Напруження', 'Закон Гука', 'Згин', 'Кручення', 'Стійкість', 'Закони руху', 'Правда чи ні'];

  function opts(items) { return items; }

  window.PortalTasks.scenes.z6 = function (g) {
    var A = [[], [], [], [], [], [], [], [], []]; // відповіді по станціях
    var COUNT = [5, 3, 2, 2, 3, 2, 2, 3, 6];

    function tok(i) { var a = A[i]; for (var k = 0; k < COUNT[i]; k++) if (!a[k]) return ''; return a.join(''); }
    function tokens() { var t = []; for (var i = 0; i < 9; i++) t.push(tok(i)); return t; }

    /* карта */
    var icons = [
      '<g transform="translate(30 22)"><rect x="10" y="22" width="60" height="14" fill="#cfd9e6" stroke="' + INK + '" stroke-width="3"/><path d="M0 29 H10 M70 29 H82" stroke="' + RED + '" stroke-width="4"/></g>',
      '<g transform="translate(24 16)" fill="none" stroke="' + INK + '" stroke-width="3"><path d="M4 56 V6 M4 56 H90"/><path d="M4 56 L30 18 Q48 8 62 14 Q72 18 80 34" stroke="#c05621" stroke-width="4"/></g>',
      '<g transform="translate(34 18)"><rect x="0" y="20" width="22" height="34" fill="#cfd9e6" stroke="' + INK + '" stroke-width="3"/><rect x="42" y="30" width="22" height="24" fill="#cfd9e6" stroke="' + INK + '" stroke-width="3"/></g>',
      '<g transform="translate(40 12)" fill="none" stroke="' + INK + '" stroke-width="4"><path d="M20 0 q-14 8 0 16 q14 8 0 16 q-14 8 0 16 q-14 8 0 16"/><rect x="8" y="64" width="24" height="12" fill="#cfd9e6"/></g>',
      '<g transform="translate(24 20)"><path d="M0 12 Q50 20 90 50" fill="none" stroke="' + INK + '" stroke-width="9"/></g>',
      '<g transform="translate(36 14)"><circle cx="34" cy="34" r="30" fill="#cfd9e6" stroke="' + INK + '" stroke-width="3"/><path d="M34 6 A28 28 0 0 1 62 34" fill="none" stroke="#805ad5" stroke-width="4"/></g>',
      '<g transform="translate(50 8)" fill="none" stroke="' + INK + '" stroke-width="5"><path d="M14 4 Q24 40 14 76"/><path d="M0 4 H30"/></g>',
      '<g transform="translate(24 28)"><rect x="6" y="20" width="36" height="22" fill="#6aa7d9" stroke="' + INK + '" stroke-width="3"/><path d="M50 31 H88" stroke="' + RED + '" stroke-width="5"/></g>',
      '<g transform="translate(30 16)"><rect width="76" height="62" rx="6" fill="#fffbe8" stroke="' + INK + '" stroke-width="3"/><g stroke="#8a7a4a" stroke-width="3"><line x1="12" y1="18" x2="64" y2="18"/><line x1="12" y1="32" x2="64" y2="32"/><line x1="12" y1="46" x2="44" y2="46"/></g></g>'
    ];
    var h = '<svg viewBox="0 0 800 560" class="tk-svg" role="group" aria-label="Випробувальний полігон з дев’ятьма станціями"><rect width="800" height="560" fill="#e8e2d2"/><rect y="440" width="800" height="120" fill="#d6cdb4"/>';
    for (var i = 0; i < 9; i++) {
      var cx = 30 + (i % 3) * 255, cy = 18 + Math.floor(i / 3) * 140;
      h += '<g class="tk-hot st-tile" data-id="s' + (i + 1) + '"><rect x="' + cx + '" y="' + cy + '" width="235" height="122" rx="12" fill="#fff" stroke="' + INK + '" stroke-width="3"/>' +
        '<g transform="translate(' + (cx + 40) + ' ' + (cy + 8) + ')">' + icons[i] + '</g>' +
        '<circle cx="' + (cx + 24) + '" cy="' + (cy + 24) + '" r="15" fill="' + INK + '"/><text x="' + (cx + 24) + '" y="' + (cy + 30) + '" text-anchor="middle" font-size="17" font-weight="700" fill="#fff">' + (i + 1) + '</text>' +
        '<text x="' + (cx + 117) + '" y="' + (cy + 112) + '" text-anchor="middle" font-size="18" font-weight="700" fill="' + INK + '">' + TITLES[i] + '</text>' +
        '<g class="st-badge" data-n="' + i + '" opacity="0"><circle cx="' + (cx + 208) + '" cy="' + (cy + 24) + '" r="14" fill="#2f855a"/><path d="M' + (cx + 201) + ' ' + (cy + 24) + ' l5 6 l9 -12" fill="none" stroke="#fff" stroke-width="3.5"/></g></g>';
    }
    h += '<g class="tk-hot" data-id="gate"><rect x="180" y="450" width="440" height="88" rx="14" fill="' + INK + '" stroke="#0a1730" stroke-width="3"/>' +
      '<text x="400" y="488" text-anchor="middle" font-size="22" font-weight="700" fill="#fff">Здати протокол випробувань</text>' +
      '<text x="400" y="516" text-anchor="middle" font-size="14" fill="#cfe0ff" class="st-count">Пройдено станцій: 0 з 9</text></g></svg>';
    g.stage.innerHTML = h;
    var svg = g.stage.querySelector('svg');
    g.say('Випробувальний полігон. Відкрийте кожну з дев’яти станцій, дайте відповіді та здайте протокол. Рахувати нічого не треба, потрібно розуміти.');

    function refresh() {
      var t = tokens(), n = 0;
      t.forEach(function (x, i) { svg.querySelector('.st-badge[data-n="' + i + '"]').setAttribute('opacity', x ? '1' : '0'); if (x) n++; });
      svg.querySelector('.st-count').textContent = 'Пройдено станцій: ' + n + ' з 9';
    }

    /* загальні будівельні блоки */
    function head(n, text) { return '<h3>Станція ' + n + '. ' + TITLES[n - 1] + '</h3><p>' + text + '</p>'; }
    function qBlock(st, k, text, items, extra) {
      return '<div class="st-q"><p>' + text + '</p>' + (extra || '') + '<div class="st-row">' + items.map(function (it) {
        return '<button type="button" class="st-opt' + (A[st][k] === it[0] ? ' on' : '') + '" data-st="' + st + '" data-k="' + k + '" data-v="' + it[0] + '">' + it[1] + '</button>';
      }).join('') + '</div></div>';
    }
    function open(st, html, setup) {
      var body = g.modal(html);
      body.onclick = function (e) {
        var b = e.target.closest('button[data-st]'); if (!b) return;
        var s = +b.getAttribute('data-st'), k = +b.getAttribute('data-k');
        A[s][k] = b.getAttribute('data-v');
        [].forEach.call(body.querySelectorAll('button[data-st="' + s + '"][data-k="' + k + '"]'), function (x) { x.classList.toggle('on', x === b); });
        refresh();
      };
      if (setup) setup(body);
      return body;
    }
    function slider(label, id) { return '<label class="st-slide">' + label + '<input type="range" min="0" max="100" value="0" class="st-range" id="' + id + '"></label>'; }

    /* 1. Види деформації: п’ять малюнків, до кожного назва */
    function st1() {
      var html = head(1, 'Під дією сил брус по-різному деформується. До кожного малюнка оберіть назву деформації.');
      DEF_ORDER.forEach(function (key, i) {
        html += '<div class="st-item">' + DEF[key] + '<div><b>Малюнок ' + (i + 1) + '</b><div class="st-row">' + NAMES.map(function (n) {
          return '<button type="button" class="st-opt st-small' + (A[0][i] === n[0] ? ' on' : '') + '" data-st="0" data-k="' + i + '" data-v="' + n[0] + '">' + n[1] + '</button>';
        }).join('') + '</div></div></div>';
      });
      open(0, html);
    }

    /* 2. Діаграма розтягу */
    function st2() {
      var d = '<svg viewBox="0 0 320 210" class="st-pic st-wide"><path d="M30 180 V20 M30 180 H300" fill="none" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<text x="12" y="20" font-size="12" fill="' + INK + '">σ</text><text x="296" y="198" font-size="12" fill="' + INK + '">ε</text>' +
        '<path d="M30 180 L110 70 L132 62 C150 60 160 58 185 58 C210 60 235 40 255 38 C272 38 282 60 290 100" fill="none" stroke="#c05621" stroke-width="4"/>' +
        [['a', 110, 70, 'A'], ['b', 165, 58, 'B'], ['c', 255, 38, 'C'], ['d', 290, 100, 'D'], ['e', 70, 124, 'E']].map(function (p) {
          return '<circle cx="' + p[1] + '" cy="' + p[2] + '" r="6" fill="' + INK + '"/><text x="' + (p[1] + 10) + '" y="' + (p[2] + 20) + '" font-size="15" font-weight="700" fill="' + RED + '">' + p[3] + '</text>';
        }).join('') + '</svg>';
      var L = [['a', 'A'], ['b', 'B'], ['c', 'C'], ['d', 'D'], ['e', 'E']];
      var html = head(2, 'Це діаграма розтягу сталевого зразка: напруження σ залежить від відносного подовження ε. Станьте на місце лаборанта і знайдіть точки.') + d +
        qBlock(1, 0, 'Остання точка, до якої напруження точно пропорційне подовженню (закон Гука) і зразок повністю повертається в форму:', L.slice(0, 4)) +
        qBlock(1, 1, 'Ділянка, де зразок «тече»: подовжується майже без росту навантаження:', L.slice(0, 4)) +
        qBlock(1, 2, 'Точка найбільшого напруження (межа міцності), після неї утворюється «шийка»:', L.slice(0, 4));
      open(1, html);
    }

    /* 3. Напруження */
    function st3() {
      var html = head(3, 'Напруження показує, наскільки «щільно» сила розподілена по перерізу. Потягніть повзунок, змінюючи товщину стержня, і спостерігайте шкалу напруження. Сила не змінюється.') +
        '<svg viewBox="0 0 300 120" class="st-pic st-wide">' + ARW + '<rect class="st-rod-b" x="40" y="40" width="140" height="40" fill="#cfd9e6" stroke="' + INK + '" stroke-width="2.5"/>' + arrow(40, 60, 10, 60) + arrow(180, 60, 210, 60) +
        '<rect x="236" y="10" width="26" height="100" fill="#fff" stroke="' + INK + '" stroke-width="2"/><rect class="st-sig" x="238" y="60" width="22" height="48" fill="#c53030"/><text x="249" y="124" text-anchor="middle" font-size="11" fill="' + INK + '">σ</text></svg>' +
        slider('Товщина стержня: від тонкого до товстого', 'st-th') +
        qBlock(2, 0, 'Два стержні з одного матеріалу, тягнуть однаковою силою. Один тонкий, другий товстий. У якому напруження більше?', [['a', 'У тонкому'], ['b', 'У товстому'], ['c', 'Однакове']]) +
        qBlock(2, 1, 'Стержень зробили довшим, а переріз і силу залишили. Напруження в перерізі…', [['a', 'зросло'], ['b', 'зменшилось'], ['c', 'не змінилось']]);
      open(2, html, function (b) {
        var r = b.querySelector('#st-th'), rod = b.querySelector('.st-rod-b'), sig = b.querySelector('.st-sig');
        function upd() {
          var t = +r.value, hgt = 14 + t * 0.6; // 14..74
          rod.setAttribute('height', hgt); rod.setAttribute('y', 60 - hgt / 2);
          var s = 100 - 78 * (hgt - 14) / 60 * 0.9 - 4; // тонкий -> висока шкала
          var bar = Math.max(8, 14 + 86 * (14 / hgt));
          sig.setAttribute('height', bar); sig.setAttribute('y', 108 - bar);
        }
        r.addEventListener('input', upd); r.value = 20; upd();
      });
    }

    /* 4. Закон Гука */
    function st4() {
      var html = head(4, 'Пружина-модель стержня: подовження росте разом із вантажем. Потягніть повзунок і подивіться, як змінюється подовження.') +
        '<svg viewBox="0 0 220 220" class="st-pic st-wide" style="max-width:240px"><line x1="40" y1="10" x2="180" y2="10" stroke="' + INK + '" stroke-width="6"/>' +
        '<path class="st-spr" d="" fill="none" stroke="' + INK + '" stroke-width="3"/><rect class="st-wt" x="90" y="100" width="40" height="22" fill="#6aa7d9" stroke="' + INK + '" stroke-width="2"/>' +
        '<line x1="196" y1="30" x2="196" y2="30" class="st-ext" stroke="' + RED + '" stroke-width="3"/></svg>' +
        slider('Вантаж: від малого до великого', 'st-ld') +
        qBlock(3, 0, 'Вантаж збільшили вдвічі (в межах пружності). Подовження…', [['a', 'зменшиться'], ['b', 'збільшиться вдвічі'], ['c', 'збільшиться вчетверо']]) +
        qBlock(3, 1, 'Той самий вантаж чіпляють до стальної й до гумової смужки однакових розмірів. Менше розтягнеться…', [['a', 'сталева'], ['b', 'гумова']]);
      open(3, html, function (b) {
        var r = b.querySelector('#st-ld'), spr = b.querySelector('.st-spr'), wt = b.querySelector('.st-wt');
        function upd() {
          var len = 40 + r.value * 1.2, d = 'M110 10';
          for (var i = 0; i < 10; i++) { var y = 10 + (len - 10) * (i + 0.5) / 10; d += ' L' + (i % 2 ? 94 : 126) + ' ' + y; }
          d += ' L110 ' + (10 + len - 10) ;
          spr.setAttribute('d', d + ' L110 ' + (len + 10));
          wt.setAttribute('y', len + 10);
        }
        r.addEventListener('input', upd); r.value = 15; upd();
      });
    }

    /* 5. Згин */
    function st5() {
      var html = head(5, 'Дошку кладуть на дві опори й навантажують посередині. Перемикайте положення дошки: плиском або на ребро. Дивіться, наскільки вона прогинається.') +
        '<svg viewBox="0 0 300 150" class="st-pic st-wide">' + ARW + '<path class="st-bd" d="" fill="#e0c9a0" stroke="' + INK + '" stroke-width="2"/>' +
        '<polygon points="30,110 18,136 42,136" fill="#fff" stroke="' + INK + '" stroke-width="2"/><polygon points="270,110 258,136 282,136" fill="#fff" stroke="' + INK + '" stroke-width="2"/>' +
        '<g class="st-fa">' + arrow(150, 2, 150, 60) + '</g></svg>' +
        '<div class="st-row"><button type="button" class="st-opt on" data-flat="1">Плиском</button><button type="button" class="st-opt" data-flat="0">На ребро</button></div>' +
        qBlock(4, 0, 'Яке положення дошки жорсткіше (прогинається менше)?', [['a', 'Плиском'], ['b', 'На ребро'], ['c', 'Однаково']]) +
        qBlock(4, 1, 'Балка лежить на двох опорах, сила діє зверху. Які волокна розтягуються?', [['a', 'Верхні'], ['b', 'Нижні'], ['c', 'Усі однаково']]) +
        qBlock(4, 2, 'Де при згині напруження дорівнює нулю?', [['a', 'На верхній поверхні'], ['b', 'На нижній поверхні'], ['c', 'У нейтральному шарі посередині висоти']]);
      open(4, html, function (b) {
        var bd = b.querySelector('.st-bd'), fa = b.querySelector('.st-fa');
        function draw(flat) {
          var th = flat ? 12 : 44, sag = flat ? 38 : 6, yTop = 100 - (flat ? 0 : 32);
          var top = 'M30 ' + yTop + ' Q150 ' + (yTop + sag * 2) + ' 270 ' + yTop;
          var bot = ' L270 ' + (yTop + th) + ' Q150 ' + (yTop + th + sag * 2) + ' 30 ' + (yTop + th) + ' Z';
          bd.setAttribute('d', top + bot);
          fa.setAttribute('transform', 'translate(0 ' + (flat ? (sag * 1 - 0) : (sag - 0) - 24) + ')');
        }
        draw(true);
        [].forEach.call(b.querySelectorAll('button[data-flat]'), function (x) {
          x.addEventListener('click', function () {
            [].forEach.call(b.querySelectorAll('button[data-flat]'), function (y) { y.classList.toggle('on', y === x); });
            draw(x.getAttribute('data-flat') === '1');
          });
        });
      });
    }

    /* 6. Кручення */
    function st6() {
      var cir = '<svg viewBox="0 0 260 200" class="st-pic st-wide" style="max-width:260px"><circle cx="130" cy="100" r="80" fill="#cfd9e6" stroke="' + INK + '" stroke-width="3"/>' +
        '<path d="M130 8 A92 92 0 0 1 222 100" fill="none" stroke="' + RED + '" stroke-width="3.5" marker-end="url(#qb)"/>' + ARW +
        [['a', 130, 100, 'A'], ['b', 130, 148, 'B'], ['c', 130, 176, 'C']].map(function (p) {
          return '<circle cx="' + p[1] + '" cy="' + p[2] + '" r="7" fill="' + INK + '"/><text x="' + (p[1] + 14) + '" y="' + (p[2] + 5) + '" font-size="15" font-weight="700" fill="' + RED + '">' + p[3] + '</text>';
        }).join('') + '</svg>';
      var html = head(6, 'Вал передає крутний момент. Ось поперечний переріз круглого вала: A у центрі, C на самому краю, B посередині між ними.') + cir +
        qBlock(5, 0, 'У якій точці перерізу напруження при крученні найбільше?', [['a', 'A, у центрі'], ['b', 'B, посередині'], ['c', 'C, на краю']]) +
        qBlock(5, 1, 'Два вали з однакового матеріалу й однакового перерізу, однаковий момент. Один вдвічі довший. Який сильніше закрутиться?', [['a', 'Довший'], ['b', 'Коротший'], ['c', 'Однаково']]);
      open(5, html);
    }

    /* 7. Стійкість */
    function st7() {
      var html = head(7, 'Стиснутий стержень може не зламатись, а раптом вигнутись убік. Це втрата стійкості. Збільшуйте стискальну силу повзунком і дивіться, який стержень зігнеться першим.') +
        '<svg viewBox="0 0 300 200" class="st-pic st-wide">' + ARW +
        '<line x1="20" y1="190" x2="280" y2="190" stroke="' + INK + '" stroke-width="4"/>' +
        '<path class="st-c" data-h="70" data-th="90" d=""/><path class="st-c" data-h="120" data-th="60" d=""/><path class="st-c" data-h="170" data-th="30" d=""/>' +
        '<text x="70" y="14" text-anchor="middle" font-size="14" font-weight="700" fill="' + RED + '">A</text><text x="150" y="14" text-anchor="middle" font-size="14" font-weight="700" fill="' + RED + '">B</text><text x="230" y="14" text-anchor="middle" font-size="14" font-weight="700" fill="' + RED + '">C</text></svg>' +
        slider('Стискальна сила: від малої до великої', 'st-fo') +
        '<p class="muted">A: короткий і товстий. B: середній. C: довгий і тонкий.</p>' +
        qBlock(6, 0, 'Який стержень втратив стійкість першим?', [['a', 'A'], ['b', 'B'], ['c', 'C']]) +
        qBlock(6, 1, 'Що менш стійке за однакових розмірів: прапорець на жорстко закріпленому стовпі чи стержень з шарнірами на обох кінцях?', [['a', 'Шарнірний стержень'], ['b', 'Стовп, закріплений одним кінцем'], ['c', 'Однаково']]);
      open(6, html, function (b) {
        var cs = [].slice.call(b.querySelectorAll('.st-c')), r = b.querySelector('#st-fo');
        function upd() {
          cs.forEach(function (p, i) {
            var x = 70 + i * 80, hgt = +p.getAttribute('data-h'), th = +p.getAttribute('data-th'), lim = th;
            var bend = Math.max(0, r.value - lim * 0.9) * 1.2; // чим тонший і довший, тим раніше
            var thk = [14, 9, 5][i];
            var yt = 190 - hgt, mid = Math.min(bend * (hgt / 100), 40);
            p.setAttribute('d', 'M' + x + ' 190 Q' + (x + mid * 2) + ' ' + (190 - hgt / 2) + ' ' + x + ' ' + yt);
            p.setAttribute('fill', 'none'); p.setAttribute('stroke', i === 0 ? '#2b6cb0' : i === 1 ? '#805ad5' : '#c05621');
            p.setAttribute('stroke-width', thk); p.setAttribute('stroke-linecap', 'round');
          });
        }
        r.addEventListener('input', upd); r.value = 0; upd();
      });
    }

    /* 8. Закони руху */
    function st8() {
      var L = [['1', 'Перший закон (інерція)'], ['2', 'Другий закон (F = ma)'], ['3', 'Третій закон (дія й протидія)']];
      var html = head(8, 'Для кожної ситуації оберіть закон Ньютона, який її пояснює.') +
        qBlock(7, 0, 'Стрілець стріляє з рушниці, і рушниця б’є його в плече.', L) +
        qBlock(7, 1, 'Порожній візок легко розігнати, а повний вантажу майже не зрушує з місця при тій самій силі.', L) +
        qBlock(7, 2, 'Автобус різко загальмував, а пасажири хитнулись уперед.', L);
      open(7, html);
    }

    /* 9. Правда чи ні */
    function st9() {
      var qs = [
        'Пара сил обертає тіло, але не штовхає його вбік.',
        'Центр ваги плоскої симетричної фігури лежить на осі симетрії.',
        'Сталь при розтягу ламається без жодного подовження.',
        'Напруження в перерізі це сила, що припадає на одиницю площі.',
        'Прискорення і швидкість це одне й те саме.',
        'Метод перерізів дає змогу знайти внутрішні сили в брусі.'
      ];
      var html = head(9, 'Оцініть кожне твердження.') + qs.map(function (q, i) { return qBlock(8, i, (i + 1) + '. ' + q, [['t', 'Правда'], ['f', 'Неправда']]); }).join('');
      open(8, html);
    }

    var sent = false;
    function gate() {
      var t = tokens(), left = [];
      t.forEach(function (x, i) { if (!x) left.push(i + 1); });
      var html = '<h3>Протокол випробувань</h3>' + t.map(function (x, i) { return '<p class="st-line-r">' + (x ? '✓' : '—') + ' Станція ' + (i + 1) + '. ' + TITLES[i] + '</p>'; }).join('');
      if (left.length) { g.modal(html + '<p class="kp-msg">Ще не всі станції заповнені: ' + left.join(', ') + '.</p>'); return; }
      html += '<p class="muted">Усі станції заповнені. Протокол можна здавати знову, поки не вийде час. Якщо відповідь неправильна, я не скажу, на якій станції помилка.</p><button type="button" class="btn st-send">Здати протокол</button><p class="kp-msg muted st-msg"></p>';
      var body = g.modal(html), btn = body.querySelector('.st-send'), msg = body.querySelector('.st-msg');
      btn.addEventListener('click', function () {
        if (sent) return;
        sent = true; btn.disabled = true; msg.textContent = 'Перевіряємо…';
        g.submit(tokens().join('-')).then(function (r) {
          sent = false; btn.disabled = false;
          if (r.expired) return;
          if (!r.correct) { msg.textContent = 'Протокол не прийнято: десь є помилка. Поверніться на станції й перевірте відповіді.'; return; }
          g.close(); g.say('Протокол прийнято. Випробування пройдено!');
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
