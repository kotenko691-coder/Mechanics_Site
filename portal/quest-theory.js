/* Квест z5 «Інженерна лабораторія»: вихід із кімнати за допомогою теорії механіки, без розрахунків.
   Чотири досліди дають чотири цифри коду. Код перевіряє сервер, у сторінці його немає:
   цифри відкриваються лише тоді, коли дослід виконано правильно. */
(function () {
  'use strict';
  if (!window.PortalTasks) return;
  var INK = '#12284a', RED = '#b5392b', BLUE = '#2b6cb0';

  var ARW = '<defs><marker id="qz" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill="' + RED + '"/></marker></defs>';
  function arrow(x1, y1, x2, y2) { return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + RED + '" stroke-width="3.5" marker-end="url(#qz)"/>'; }

  window.PortalTasks.scenes.z5 = function (g) {
    var has = { supports: false, weight: false, plumb: false };
    var digit = { bridge: null, seesaw: null, plate: null, ramp: null };
    var opened = false;
    var ORDER = ['bridge', 'seesaw', 'plate', 'ramp'];

    function code() { return ORDER.map(function (k) { return digit[k] === null ? '' : digit[k]; }).join(''); }

    /* ---------- сцена ---------- */
    var h = '<svg viewBox="0 0 800 560" class="tk-svg" role="group" aria-label="Інженерна лабораторія">' + ARW +
      '<rect width="800" height="560" fill="#e9e4d6"/><rect y="400" width="800" height="160" fill="#cfc6ad"/><line x1="0" y1="400" x2="800" y2="400" stroke="#a89f86" stroke-width="2"/>' +
      /* полиця з коробкою */
      '<g class="tk-hot" data-id="box"><rect x="30" y="132" width="190" height="10" fill="#8b6a3f" stroke="' + INK + '" stroke-width="2"/>' +
      '<g class="st-box"><rect x="60" y="82" width="86" height="50" fill="#c9a36a" stroke="' + INK + '" stroke-width="3"/><rect x="60" y="82" width="86" height="12" fill="#b78d52" stroke="' + INK + '" stroke-width="2"/><text x="103" y="119" text-anchor="middle" font-size="13" font-weight="700" fill="' + INK + '">ГИРЬКИ</text></g>' +
      '<g class="st-box-open" opacity="0"><rect x="60" y="102" width="86" height="30" fill="#c9a36a" stroke="' + INK + '" stroke-width="3"/><rect x="72" y="86" width="26" height="16" fill="#778" stroke="' + INK + '" stroke-width="2"/></g></g>' +
      /* модель пластини на стіні */
      '<g class="tk-hot" data-id="plate"><rect x="270" y="40" width="190" height="170" rx="6" fill="#fff" stroke="' + INK + '" stroke-width="3"/>' +
      '<polygon points="300,60 340,60 340,150 430,150 430,190 300,190" fill="#cfd9e6" stroke="' + INK + '" stroke-width="3"/><circle cx="320" cy="76" r="4" fill="' + INK + '"/>' +
      '<text x="365" y="86" font-size="13" font-weight="700" fill="' + INK + '">Модель</text><text x="365" y="102" font-size="13" font-weight="700" fill="' + INK + '">пластини</text></g>' +
      /* шафа з опорами */
      '<g class="tk-hot" data-id="cabinet"><rect x="490" y="50" width="100" height="160" fill="#a98b5f" stroke="' + INK + '" stroke-width="3"/><line x1="540" y1="50" x2="540" y2="210" stroke="' + INK + '" stroke-width="2"/>' +
      '<circle cx="530" cy="130" r="4" fill="' + INK + '"/><circle cx="550" cy="130" r="4" fill="' + INK + '"/><text x="540" y="40" text-anchor="middle" font-size="12" font-weight="700" fill="' + INK + '">Шафа</text>' +
      '<g class="st-cab-open" opacity="0"><rect x="500" y="62" width="80" height="136" fill="#4a3a22"/><polygon points="520,170 510,190 530,190" fill="#fff" stroke="#eee"/><polygon points="560,170 550,190 570,190" fill="#fff" stroke="#eee"/></g></g>' +
      /* двері з кодовим замком і табличка */
      '<rect x="670" y="50" width="110" height="260" fill="#8a9bb0" stroke="' + INK + '" stroke-width="4"/><rect x="680" y="62" width="90" height="238" fill="#7b8da4" stroke="' + INK + '" stroke-width="2"/><circle cx="690" cy="190" r="6" fill="#eee" stroke="' + INK + '" stroke-width="2"/>' +
      '<g class="st-door-open" opacity="0"><rect x="680" y="62" width="90" height="238" fill="#ffe9a8"/></g>' +
      '<g class="tk-hot" data-id="keypad"><rect x="625" y="150" width="34" height="50" rx="4" fill="#1b1b1b" stroke="#000" stroke-width="2"/><text x="642" y="170" text-anchor="middle" font-size="11" fill="#7ee08b" class="st-led">····</text><rect x="631" y="178" width="22" height="16" fill="#444"/></g>' +
      '<g class="tk-hot" data-id="plaque"><rect x="660" y="12" width="130" height="28" fill="#f0e6c8" stroke="' + INK + '" stroke-width="2"/><text x="725" y="31" text-anchor="middle" font-size="12" font-weight="700" fill="' + INK + '">Табличка</text></g>' +
      /* стіл з моделлю моста */
      '<g class="tk-hot" data-id="bridge"><rect x="30" y="236" width="300" height="12" fill="#8b6a3f" stroke="' + INK + '" stroke-width="2"/><rect x="40" y="248" width="10" height="100" fill="#8b6a3f"/><rect x="310" y="248" width="10" height="100" fill="#8b6a3f"/>' +
      '<rect x="60" y="214" width="42" height="22" fill="#7aa0c0" stroke="' + INK + '" stroke-width="2"/><rect x="256" y="214" width="42" height="22" fill="#7aa0c0" stroke="' + INK + '" stroke-width="2"/>' +
      '<rect x="80" y="202" width="200" height="12" fill="#c28b4c" stroke="' + INK + '" stroke-width="2"/><text x="180" y="268" text-anchor="middle" font-size="13" font-weight="700" fill="' + INK + '">Макет моста</text></g>' +
      /* шухляда */
      '<g class="tk-hot" data-id="drawer"><rect x="60" y="300" width="230" height="36" fill="#a98b5f" stroke="' + INK + '" stroke-width="3"/><rect x="155" y="312" width="40" height="10" rx="3" fill="#ddd" stroke="' + INK + '" stroke-width="2"/><text x="175" y="352" text-anchor="middle" font-size="11" fill="' + INK + '">шухляда</text></g>' +
      /* гойдалка */
      '<g class="tk-hot" data-id="seesaw"><polygon points="430,500 410,520 450,520" fill="#fff" stroke="' + INK + '" stroke-width="3"/><rect x="310" y="470" width="240" height="10" fill="#c28b4c" stroke="' + INK + '" stroke-width="2"/><text x="430" y="545" text-anchor="middle" font-size="13" font-weight="700" fill="' + INK + '">Лабораторна гойдалка</text></g>' +
      /* похила дошка */
      '<g class="tk-hot" data-id="ramp"><polygon points="580,500 780,500 780,430" fill="#d9ccae" stroke="' + INK + '" stroke-width="3"/><rect x="660" y="454" width="30" height="20" fill="#6aa7d9" stroke="' + INK + '" stroke-width="2" transform="rotate(-20 675 464)"/><text x="660" y="528" text-anchor="middle" font-size="13" font-weight="700" fill="' + INK + '">Похила дошка</text></g>' +
      /* знайдені цифри */
      '<g class="st-notes"></g></svg>';
    g.stage.innerHTML = h;
    var svg = g.stage.querySelector('svg');
    g.say('Інженерна лабораторія. Двері зачинені кодовим замком. Огляньте все навколо, робіть досліди, і кожен дослід дасть цифру коду.');

    function notes() {
      var n = svg.querySelector('.st-notes'), s = '', y = 340, names = { bridge: 'Міст', seesaw: 'Гойдалка', plate: 'Пластина', ramp: 'Схил' }, i = 0;
      ORDER.forEach(function (k) {
        if (digit[k] === null) return;
        s += '<g transform="translate(' + (340 + i * 0) + ' ' + (330 + i * 0) + ')"></g>';
      });
      var x = 340;
      s = '';
      ORDER.forEach(function (k) {
        if (digit[k] === null) return;
        s += '<g transform="translate(' + x + ' 300)"><rect width="56" height="62" fill="#fff59d" stroke="#c5b64a" stroke-width="2" transform="rotate(-3)"/><text x="28" y="22" text-anchor="middle" font-size="11" font-weight="700" fill="' + INK + '">' + names[k] + '</text><text x="28" y="52" text-anchor="middle" font-size="30" font-weight="700" fill="' + RED + '">' + digit[k] + '</text></g>';
        x += 62;
      });
      n.innerHTML = s;
    }
    function got(k, d, msg) {
      if (digit[k] === null) { digit[k] = d; notes(); g.say(msg); }
    }

    /* ---------- предмети ---------- */
    function takeBox() {
      if (has.weight) { g.say('Коробка порожня: гирьку ви вже забрали.'); return; }
      has.weight = true;
      svg.querySelector('.st-box').setAttribute('opacity', '0');
      svg.querySelector('.st-box-open').setAttribute('opacity', '1');
      g.say('У коробці лежала лабораторна гирька. Ви її забрали.');
    }
    function drawer() {
      if (has.plumb) { g.say('Шухляда порожня: виска вже у вас.'); return; }
      has.plumb = true;
      g.say('У шухляді лежала виска: шнурок із важком. Ви її забрали. Вона завжди показує вертикаль.');
    }
    function cabinet() {
      if (has.supports) { g.say('Шафа порожня: опори вже у вас.'); return; }
      has.supports = true;
      svg.querySelector('.st-cab-open').setAttribute('opacity', '1');
      g.say('У шафі лежав набір опор: шарнірно-нерухомі, шарнірно-рухомі й защемлення. Ви їх забрали.');
    }

    /* ---------- дослід 1: макет моста ---------- */
    var SUP = ['нема', 'нерухома', 'рухома', 'защемлення'];
    var supEnds = [0, 0];
    var reactCount = [0, 2, 1, 3];
    function bridgeModal() {
      if (!has.supports) { g.say('Макет моста лежить на столі без опор. Потрібні опори: пошукайте в шафі.'); return; }
      function supSvg(x, t) {
        var s = '';
        if (t === 1) s = '<polygon points="' + x + ',102 ' + (x - 18) + ',140 ' + (x + 18) + ',140" fill="#fff" stroke="' + INK + '" stroke-width="2.5"/><line x1="' + (x - 26) + '" y1="142" x2="' + (x + 26) + '" y2="142" stroke="' + INK + '" stroke-width="3"/>';
        else if (t === 2) s = '<polygon points="' + x + ',102 ' + (x - 18) + ',134 ' + (x + 18) + ',134" fill="#fff" stroke="' + INK + '" stroke-width="2.5"/><circle cx="' + (x - 9) + '" cy="140" r="5" fill="#fff" stroke="' + INK + '" stroke-width="2"/><circle cx="' + (x + 9) + '" cy="140" r="5" fill="#fff" stroke="' + INK + '" stroke-width="2"/><line x1="' + (x - 26) + '" y1="146" x2="' + (x + 26) + '" y2="146" stroke="' + INK + '" stroke-width="3"/>';
        else if (t === 3) s = '<rect x="' + (x - 7) + '" y="90" width="14" height="60" fill="#cfd9e6" stroke="' + INK + '" stroke-width="2.5"/>';
        else s = '<text x="' + x + '" y="130" text-anchor="middle" font-size="12" fill="#889">пусто</text>';
        return s;
      }
      function paint(body) {
        var L = supEnds[0], R = supEnds[1];
        body.querySelector('.st-bsvg').innerHTML = '<line x1="40" y1="96" x2="300" y2="96" stroke="' + INK + '" stroke-width="10"/>' + supSvg(50, L) + supSvg(290, R) + arrow(170, 40, 170, 88) +
          '<text x="184" y="56" font-size="14" font-weight="700" fill="' + RED + '">вантаж</text>';
        body.querySelector('.st-lbtn').textContent = 'Лівий кінець: ' + SUP[L];
        body.querySelector('.st-rbtn').textContent = 'Правий кінець: ' + SUP[R];
        var msg = body.querySelector('.st-bmsg'), ok = false;
        if (L === 0 || R === 0) msg.textContent = 'Міст має лежати на обох берегах: на кожному кінці має бути опора.';
        else if (L === 2 && R === 2) msg.textContent = 'Обидві опори рухомі: міст нічим не втримується від зсуву вздовж. Він «поїде» вбік.';
        else if (L === 1 && R === 1) msg.textContent = 'Дві нерухомі опори: тримає, але зайвих зв’язків більше, ніж потрібно. У мосту від нагріву з’являться розпірні сили. Інженери так не роблять.';
        else if (L === 3 || R === 3) msg.textContent = 'Защемлення на кінці мосту дає зайві зв’язки: міст важко розрахувати, а осідання берега ламає його. Потрібна простіша схема.';
        else { msg.textContent = 'Міст стоїть, тримається й легко розраховується: усе необхідне, нічого зайвого.'; ok = true; }
        body.querySelector('.st-bq').hidden = !ok;
        return ok;
      }
      var html = '<h3>Макет моста</h3><p>Поставте опори під кінці мосту. Натискайте кнопки: вони по черзі міняють тип опори. Потрібно підібрати найпростіше розв’язання: міст має стояти, не їхати вбік і не мати зайвих зв’язків.</p>' +
        '<svg viewBox="0 0 340 170" class="st-pic st-wide st-bsvg"></svg>' +
        '<div class="st-row"><button type="button" class="st-opt st-lbtn"></button><button type="button" class="st-opt st-rbtn"></button></div><p class="kp-msg st-bmsg"></p>' +
        '<div class="st-bq" hidden><p><b>На схемі в цих опорах разом виникає стільки опорних реакцій. Скільки?</b> Натисніть число, щоб вписати його на табличку макета.</p><div class="st-row">' +
        [1, 2, 3, 4, 5, 6].map(function (n) { return '<button type="button" class="st-opt" data-n="' + n + '">' + n + '</button>'; }).join('') + '</div></div>';
      var body = g.modal(html);
      paint(body);
      body.onclick = function (e) {
        var b = e.target.closest('button'); if (!b) return;
        if (b.classList.contains('st-lbtn')) { supEnds[0] = (supEnds[0] + 1) % 4; paint(body); return; }
        if (b.classList.contains('st-rbtn')) { supEnds[1] = (supEnds[1] + 1) % 4; paint(body); return; }
        var n = b.getAttribute('data-n'); if (!n) return;
        var real = reactCount[supEnds[0]] + reactCount[supEnds[1]];
        if (+n !== real) { body.querySelector('.st-bmsg').textContent = 'Табличка не підходить: порахуйте реакції кожної опори ще раз. Нерухома дає дві, рухома одну.'; return; }
        got('bridge', real, 'Табличка на макеті: «' + real + '». Ви записали цифру ' + real + ' у блокнот. Вона перша в коді.');
        g.close();
      };
    }

    /* ---------- дослід 2: гойдалка ---------- */
    function seesawModal() {
      if (!has.weight) { g.say('На гойдалці сидить важкий вантаж, а зрівноважити його нічим. Потрібна гирька.'); return; }
      var pos = 0;
      var html = '<h3>Лабораторна гойдалка</h3><p>Праворуч, біля позначки 2, закріплений важкий вантаж: він удвічі важчий за вашу гирьку. Ставте гирьку на ліве плече в позначки 1…6 і дивіться, куди хилиться гойдалка. Зрівноважте її.</p>' +
        '<svg viewBox="0 0 340 170" class="st-pic st-wide st-ssvg"></svg>' +
        '<div class="st-row">' + [1, 2, 3, 4, 5, 6].map(function (n) { return '<button type="button" class="st-opt" data-p="' + n + '">' + n + '</button>'; }).join('') + '</div><p class="kp-msg st-smsg">Оберіть позначку.</p>';
      var body = g.modal(html);
      function paint(p) {
        var tilt = p === 0 ? 0 : (p * 1 - 2 * 2); // момент гирьки мінус момент вантажу
        var ang = -Math.max(-14, Math.min(14, tilt * 5)); // ліва сторона важча: вона йде вниз (проти годинникової)
        var s = '<g transform="rotate(' + ang + ' 170 100)"><rect x="20" y="94" width="300" height="12" fill="#c28b4c" stroke="' + INK + '" stroke-width="2"/>';
        for (var k = 1; k <= 6; k++) s += '<line x1="' + (170 - k * 24) + '" y1="94" x2="' + (170 - k * 24) + '" y2="106" stroke="' + INK + '" stroke-width="2"/><text x="' + (170 - k * 24) + '" y="124" text-anchor="middle" font-size="12" font-weight="700" fill="' + INK + '">' + k + '</text>';
        for (k = 1; k <= 6; k++) s += '<text x="' + (170 + k * 24) + '" y="124" text-anchor="middle" font-size="12" fill="#889">' + k + '</text>';
        s += '<rect x="' + (170 + 2 * 24 - 15) + '" y="64" width="30" height="30" fill="#4a5568" stroke="' + INK + '" stroke-width="2"/><text x="' + (170 + 48) + '" y="84" text-anchor="middle" font-size="11" fill="#fff">2m</text>';
        if (p) s += '<rect x="' + (170 - p * 24 - 9) + '" y="76" width="18" height="18" fill="#a0aec0" stroke="' + INK + '" stroke-width="2"/><text x="' + (170 - p * 24) + '" y="89" text-anchor="middle" font-size="11" fill="' + INK + '">m</text>';
        s += '</g><polygon points="170,106 150,150 190,150" fill="#fff" stroke="' + INK + '" stroke-width="3"/>';
        body.querySelector('.st-ssvg').innerHTML = s;
      }
      paint(0);
      body.onclick = function (e) {
        var b = e.target.closest('button[data-p]'); if (!b) return;
        var p = +b.getAttribute('data-p'), m = body.querySelector('.st-smsg');
        paint(p);
        var d = p - 4;
        if (d < 0) m.textContent = 'Гойдалка хилиться вправо: гирька надто близько до опори, її момент замалий.';
        else if (d > 0) m.textContent = 'Гойдалка хилиться вліво: гирька надто далеко, її момент завеликий.';
        else {
          m.textContent = 'Рівновага! Момент гирьки (малий вантаж, велике плече) дорівнює моменту важкого вантажу (великий вантаж, мале плече).';
          got('seesaw', p, 'Гойдалка зрівноважена на позначці ' + p + '. Це друга цифра коду, її записано в блокнот.');
        }
      };
    }

    /* ---------- дослід 3: центр ваги пластини ---------- */
    function plateModal() {
      if (!has.plumb) { g.say('Модель пластини висить на цвяшку. Щоб знайти її центр ваги, потрібна виска.'); return; }
      var C = { x: 2.2, y: 2.2 }, S = 38, ox = 40, oy = 210;
      function X(x) { return ox + S * x; } function Y(y) { return oy - S * y; }
      var pts = [['a', 0, 6], ['b', 6, 0], ['c', 0, 0], ['d', 6, 2], ['e', 2, 6]];
      var picked = [];
      var html = '<h3>Модель пластини</h3><p>Пластина однорідна, вирізана літерою «Г». Центр ваги знаходять дослідом: пластину підвішують за точку, і виска показує вертикаль. Центр ваги завжди лежить на цій вертикалі під точкою підвісу. Підвісьте пластину за дві різні точки, і центр ваги буде там, де лінії перетнуться.</p>' +
        '<svg viewBox="0 0 300 250" class="st-pic st-wide st-psvg" style="max-width:300px"></svg><p class="kp-msg st-pmsg">Оберіть точку підвісу.</p>' +
        '<div class="st-row">' + pts.map(function (p) { return '<button type="button" class="st-opt st-small" data-p="' + p[0] + '">Підвіс ' + p[0].toUpperCase() + '</button>'; }).join('') + '</div>';
      var body = g.modal(html);
      function paint() {
        var s = '<polygon points="' + [[0, 0], [6, 0], [6, 2], [2, 2], [2, 6], [0, 6]].map(function (p) { return X(p[0]) + ',' + Y(p[1]); }).join(' ') + '" fill="#cfd9e6" stroke="' + INK + '" stroke-width="3"/>';
        pts.forEach(function (p) {
          s += '<circle cx="' + X(p[1]) + '" cy="' + Y(p[2]) + '" r="5" fill="' + (picked.indexOf(p[0]) >= 0 ? RED : INK) + '"/><text x="' + (X(p[1]) + (p[1] === 6 ? 8 : 8)) + '" y="' + (Y(p[2]) - 8) + '" font-size="13" font-weight="700" fill="' + RED + '">' + p[0].toUpperCase() + '</text>';
        });
        picked.forEach(function (k) {
          var p = pts.filter(function (q) { return q[0] === k; })[0];
          var dx = C.x - p[1], dy = C.y - p[2], len = Math.sqrt(dx * dx + dy * dy), t = 1.3;
          s += '<line x1="' + X(p[1]) + '" y1="' + Y(p[2]) + '" x2="' + X(p[1] + dx * t) + '" y2="' + Y(p[2] + dy * t) + '" stroke="' + BLUE + '" stroke-width="2.5" stroke-dasharray="6 4"/>';
        });
        if (picked.length >= 2) s += '<circle cx="' + X(C.x) + '" cy="' + Y(C.y) + '" r="9" fill="none" stroke="' + RED + '" stroke-width="3"/><text x="' + (X(C.x) + 14) + '" y="' + (Y(C.y) + 4) + '" font-size="26" font-weight="700" fill="' + RED + '">7</text>';
        body.querySelector('.st-psvg').innerHTML = s;
      }
      paint();
      body.onclick = function (e) {
        var b = e.target.closest('button[data-p]'); if (!b) return;
        var k = b.getAttribute('data-p'); if (picked.indexOf(k) < 0) picked.push(k);
        paint();
        var m = body.querySelector('.st-pmsg');
        if (picked.length < 2) { m.textContent = 'Виска показала першу вертикаль. Підвісьте пластину ще за одну точку.'; return; }
        m.textContent = 'Дві вертикалі перетнулися: це центр ваги. Зверніть увагу, він лежить поза металом, у «куті» літери. На цьому місці на пластині нанесена цифра 7.';
        got('plate', 7, 'Центр ваги пластини знайдено. На місці перетину виска показала цифру 7. Це третя цифра коду.');
      };
    }

    /* ---------- дослід 4: похила дошка ---------- */
    function rampModal() {
      var slid = false;
      var html = '<h3>Похила дошка</h3><p>Ящик стоїть на дошці. Повільно піднімайте дошку повзунком, доки ящик не поїде. Тертя утримує його, поки нахил малий. Запам’ятайте, біля якої цифри шкали (десятки градусів) ящик почав ковзати.</p>' +
        '<svg viewBox="0 0 340 190" class="st-pic st-wide st-rsvg"></svg>' +
        '<label class="st-slide">Нахил дошки<input type="range" min="0" max="60" step="0.5" value="0" class="st-range"></label><p class="kp-msg st-rmsg"></p>';
      var body = g.modal(html);
      var r = body.querySelector('.st-range');
      function paint(a, slidAt) {
        var rad = a * Math.PI / 180, L = 240;
        var px = 60, py = 160, ex = px + L * Math.cos(rad), ey = py - L * Math.sin(rad);
        var off = slidAt ? 150 : 40; // положення ящика вздовж дошки
        var s = '<line x1="' + px + '" y1="' + py + '" x2="' + ex + '" y2="' + ey + '" stroke="#8b6a3f" stroke-width="8"/>' +
          '<g transform="translate(' + px + ' ' + py + ') rotate(' + (-a) + ')"><rect x="' + off + '" y="-30" width="34" height="24" fill="#6aa7d9" stroke="' + INK + '" stroke-width="2"/></g>' +
          '<path d="M60 160 H300" stroke="#889" stroke-width="2"/>';
        for (var k = 0; k <= 6; k++) {
          var ang = k * 10 * Math.PI / 180, x = 60 + 270 * Math.cos(ang), y = 160 - 270 * Math.sin(ang);
          s += '<text x="' + (x > 320 ? 322 : x) + '" y="' + (y + 4) + '" font-size="13" font-weight="700" fill="' + RED + '">' + k + '</text>';
        }
        body.querySelector('.st-rsvg').innerHTML = s;
      }
      paint(0, false);
      r.addEventListener('input', function () {
        var a = +r.value;
        if (!slid && a > 26) { slid = true; }
        paint(a, slid);
        var m = body.querySelector('.st-rmsg');
        if (slid) {
          m.textContent = 'Ящик поїхав! Це сталося між цифрами 2 і 3 на шкалі, тобто дошка була нахилена на двадцять з чимось градусів.';
          got('ramp', 2, 'Ящик почав ковзати біля цифри 2 (двадцять із чимось градусів). Це четверта цифра коду.');
        } else m.textContent = a > 0 ? 'Тертя ще тримає ящик.' : '';
      });
    }

    /* ---------- табличка і замок ---------- */
    function plaque() {
      g.modal('<h3>Табличка над дверима</h3><p>Код складається з чотирьох цифр у такому порядку:</p><div class="tk-note"><p><b>1. Макет моста<br>2. Гойдалка<br>3. Пластина<br>4. Похила дошка</b></p></div><p class="muted">Кожну цифру дає свій дослід. Цифри з усіх дослідів зібрані на жовтих листочках унизу.</p>');
    }
    var code4 = '';
    var busy = false;
    function keypad() {
      if (opened) { g.say('Двері вже відчинені.'); return; }
      code4 = '';
      var html = '<h3>Кодовий замок</h3><p>Введіть чотири цифри (порядок на табличці над дверима).</p><div class="tk-led st-kled" style="font:700 28px monospace;letter-spacing:6px;text-align:center;background:#111;color:#7ee08b;padding:8px;border-radius:6px;min-height:44px">····</div>' +
        '<div class="st-pad" style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:8px 0">' +
        ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'ok'].map(function (k) { return '<button type="button" class="st-opt" data-k="' + k + '">' + (k === 'ok' ? 'OK' : k) + '</button>'; }).join('') + '</div><p class="kp-msg st-kmsg"></p>';
      var body = g.modal(html), led = body.querySelector('.st-kled'), msg = body.querySelector('.st-kmsg');
      function show() { led.textContent = (code4 + '····').slice(0, 4); }
      body.onclick = function (e) {
        var b = e.target.closest('button[data-k]'); if (!b || busy) return;
        var k = b.getAttribute('data-k');
        if (k === 'C') { code4 = ''; msg.textContent = ''; show(); return; }
        if (k === 'ok') {
          if (code4.length < 4) { msg.textContent = 'Потрібно чотири цифри.'; return; }
          busy = true; msg.textContent = 'Перевіряємо…';
          g.submit(code4).then(function (r) {
            busy = false;
            if (r.expired) return;
            if (!r.correct) { msg.textContent = 'Замок не відкрився. Перевірте, чи кожен дослід виконано правильно.'; code4 = ''; show(); return; }
            opened = true; g.close();
            svg.querySelector('.st-door-open').setAttribute('opacity', '1');
            svg.querySelector('.st-led').textContent = 'OPEN';
            g.say('Клац! Двері відчинено. Ви вийшли з лабораторії.');
            setTimeout(function () { g.finish(r); }, 1800);
          }).catch(function (err) { busy = false; msg.textContent = err && err.message === 'NETWORK' ? 'Немає зв’язку. Спробуйте ще раз.' : 'Не вдалося перевірити (' + (err && err.message) + ').'; });
          return;
        }
        if (code4.length < 4) { code4 += k; show(); }
      };
    }

    var OPEN = { box: takeBox, drawer: drawer, cabinet: cabinet, bridge: bridgeModal, seesaw: seesawModal, plate: plateModal, ramp: rampModal, plaque: plaque, keypad: keypad };
    svg.addEventListener('click', function (e) {
      var t = e.target.closest('[data-id]'); if (!t) return;
      var f = OPEN[t.getAttribute('data-id')]; if (f) f();
    });
  };
})();
