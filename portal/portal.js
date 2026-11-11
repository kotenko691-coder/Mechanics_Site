/* Кабінет студента: вхід через Google, реєстрація, лекції, прогрес, кабінет викладача.
   Усі дані та лекції приходять із сервера Apps Script тільки після перевірки входу. */
(function () {
  'use strict';

  var CFG = window.PORTAL || {};
  var $ = function (s) { return document.querySelector(s); };

  var token = '';
  try { token = sessionStorage.getItem('portalToken') || ''; } catch (e) { /* без сховища теж працює */ }

  var me = null;          // відповідь сервера на «me»
  var items = [];         // лекції поточної групи
  var viewGroup = '';     // група, яку дивиться викладач
  var current = null;     // відкрита лекція
  var blobUrl = null;

  var ERR = {
    AUTH: 'Сеанс завершився. Увійдіть знову.',
    BAD_POINTS: 'Перевірте бали: потрібне число від -1000 до 1000 і назва завдання.',
    BAD_NAME: 'Напишіть прізвище та ім’я (не менше 3 символів).',
    BAD_GROUP: 'Оберіть групу зі списку.',
    BAD_CODE: 'Невірний код семестру. Запитайте його у викладача.',
    BLOCKED: 'Доступ закрито. Зверніться до викладача.',
    NOT_REGISTERED: 'Спочатку пройдіть реєстрацію.',
    FORBIDDEN: 'Ця дія недоступна.',
    TOO_BIG: 'Файл завеликий для перегляду тут.',
    NETWORK: 'Немає зв’язку із сервером. Спробуйте ще раз.'
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------- запити до сервера ---------- */
  var LOADING = {
    me: 'Входимо в кабінет…', register: 'Реєструємо…', lectures: 'Завантажуємо лекції…',
    lecture: 'Відкриваємо лекцію…', done: 'Зберігаємо…', admin: 'Завантажуємо список студентів…',
    admin_status: 'Зберігаємо…', admin_code: 'Зберігаємо…', admin_points: 'Зберігаємо…', rating: 'Рахуємо рейтинг…'
  };
  var pending = 0, loaderTimer = null;

  function loaderOn(action) {
    pending++;
    var lt = $('#loader-text'), lb = $('#loader');
    if (!lt || !lb) return;
    lt.textContent = LOADING[action] || 'Завантаження…';
    if (!loaderTimer) loaderTimer = setTimeout(function () { lb.hidden = false; }, 200);
  }

  function loaderOff() {
    pending = Math.max(0, pending - 1);
    if (pending === 0) {
      clearTimeout(loaderTimer); loaderTimer = null;
      var lb = $('#loader');
      if (lb) lb.hidden = true;
    }
  }

  function api(action, data, quiet) {
    var body = JSON.stringify(Object.assign({ token: token, action: action }, data || {}));
    if (!quiet) loaderOn(action);
    var p = fetch(CFG.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: body
    }).then(function (r) { return r.json(); }, function () {
      throw new Error('NETWORK');
    }).then(function (j) {
      if (!j.ok) throw new Error(j.error || 'NETWORK');
      return j;
    });
    if (!quiet) p.then(loaderOff, loaderOff);
    return p;
  }

  /* ---------- кеш: список лекцій у пам'яті пристрою, вміст лекцій у пам'яті сторінки ---------- */
  var LS_KEY = 'portalCache1';
  function cacheLoad() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || 'null'); } catch (e) { return null; }
  }
  function cacheSave() {
    try {
      if (!me) return;
      localStorage.setItem(LS_KEY, JSON.stringify({ me: me, items: items, group: viewGroup, t: Date.now() }));
    } catch (e) { /* не страшно */ }
  }
  function cacheClear() { try { localStorage.removeItem(LS_KEY); } catch (e) { /* ігноруємо */ } }

  var lecCache = {};      // ключ -> {t, p: Promise}
  var LEC_TTL = 10 * 60 * 1000;
  function lecKey(it) { return (viewGroup || '') + '|' + it.id; }
  function getLecture(it, quiet) {
    var k = lecKey(it), c = lecCache[k];
    if (c && Date.now() - c.t < LEC_TTL) return c.p;
    var p = api('lecture', { id: it.id, group: viewGroup }, quiet);
    lecCache[k] = { t: Date.now(), p: p };
    p.catch(function () { if (lecCache[k] && lecCache[k].p === p) delete lecCache[k]; });
    return p;
  }
  var prefetchTimer = null;
  function prefetchAll() {
    clearTimeout(prefetchTimer);
    var queue = items.filter(function (it) { return it.kind !== 'pdf' && !lecCache[lecKey(it)]; });
    (function next() {
      var it = queue.shift();
      if (!it) return;
      if (!$('#v-lecture').hidden) { prefetchTimer = setTimeout(next, 1500); return; }
      getLecture(it, true).then(function () { prefetchTimer = setTimeout(next, 300); },
        function () { prefetchTimer = setTimeout(next, 300); });
    })();
  }
  $('#lec-list').addEventListener('mouseover', function (e) {
    var b = e.target.closest('button[data-i]');
    if (b && items[+b.getAttribute('data-i')]) getLecture(items[+b.getAttribute('data-i')], true);
  });

  /* ---------- показ екранів і повідомлень ---------- */
  var VIEWS = ['v-login', 'v-register', 'v-home', 'v-lecture', 'v-admin', 'v-rating'];

  function show(id) {
    VIEWS.forEach(function (v) { $('#' + v).hidden = (v !== id); });
    var loggedIn = id !== 'v-login';
    $('#nav-home').hidden = !loggedIn || id === 'v-register';
    $('#nav-rating').hidden = !loggedIn || id === 'v-register';
    $('#nav-logout').hidden = !loggedIn;
    $('#nav-admin').hidden = !(me && me.isOwner);
    window.scrollTo(0, 0);
  }

  function say(text, isError) {
    var m = $('#msg');
    if (!text) { m.hidden = true; return; }
    m.textContent = text;
    m.className = 'msg' + (isError ? ' error' : '');
    m.hidden = false;
  }

  function fail(err) {
    var code = err && err.message;
    if (code === 'AUTH') { logout(ERR.AUTH); return; }
    say(ERR[code] || ('Помилка: ' + code), true);
  }

  /* ---------- вхід Google ---------- */
  function initGoogle() {
    var tries = 0;
    var timer = setInterval(function () {
      tries++;
      if (window.google && google.accounts && google.accounts.id) {
        clearInterval(timer);
        google.accounts.id.initialize({
          client_id: CFG.CLIENT_ID,
          callback: onCredential,
          auto_select: true
        });
        google.accounts.id.renderButton($('#gbtn'), {
          theme: 'filled_blue', size: 'large', text: 'signin_with', locale: 'uk'
        });
        $('#login-wait').hidden = true;
      } else if (tries > 80) {
        clearInterval(timer);
        $('#login-wait').textContent = 'Не вдалося завантажити вхід Google. Оновіть сторінку.';
      }
    }, 150);
  }

  function onCredential(resp) {
    token = resp.credential;
    try { sessionStorage.setItem('portalToken', token); } catch (e) { /* ігноруємо */ }
    say('');
    boot();
  }

  function logout(message) {
    token = '';
    me = null; items = []; lecCache = {}; cacheClear();
    try { sessionStorage.removeItem('portalToken'); } catch (e) { /* ігноруємо */ }
    if (window.google && google.accounts && google.accounts.id) {
      google.accounts.id.disableAutoSelect();
    }
    say(message || '', !!message);
    show('v-login');
    initGoogle();
  }

  /* ---------- старт ---------- */
  var early = null;
  function boot() {
    // кеш із попереднього візиту: показуємо одразу, перевіряємо у фоні
    var c = cacheLoad();
    if (c && c.me && c.items && (c.me.registered || c.me.isOwner) && !c.me.blocked && token) {
      me = c.me; items = c.items; viewGroup = c.group || '';
      showHomeShell();
      renderHome();
      show('v-home');
      api('me', null, true).then(function (r) {
        me = r;
        if (r.blocked) { say(ERR.BLOCKED, true); cacheClear(); show('v-login'); return; }
        if (!r.registered && !r.isOwner) { cacheClear(); showRegister(); return; }
        showHomeShell();
        refreshLectures();
      }).catch(function (err) { if (err && err.message === 'AUTH') fail(err); });
      return;
    }
    // перший вхід: список лекцій просимо одночасно з «me»
    early = (c && c.me && !c.me.isOwner) ? api('lectures', { group: '' }, true) : null;
    if (early) early.catch(function () {});
    api('me').then(function (r) {
      me = r;
      if (r.blocked) { say(ERR.BLOCKED, true); show('v-login'); return; }
      if (!r.registered && !r.isOwner) { showRegister(); return; }
      showHome();
    }).catch(fail);
  }

  /* ---------- реєстрація ---------- */
  function showRegister() {
    $('#reg-email').textContent = me.email;
    $('#reg-name').value = me.googleName || '';
    $('#reg-group').innerHTML = '<option value="">Оберіть групу</option>' +
      me.groups.map(function (g) { return '<option>' + esc(g) + '</option>'; }).join('');
    show('v-register');
  }

  $('#reg-form').addEventListener('submit', function (e) {
    e.preventDefault();
    say('');
    api('register', {
      fullName: $('#reg-name').value,
      group: $('#reg-group').value,
      code: $('#reg-code').value
    }).then(function (r) { me = r; showHome(); }).catch(fail);
  });

  /* ---------- головна: вежа й список лекцій ---------- */
  function tower(done, total) {
    var n = Math.max(total, 1);
    var fh = Math.min(30, Math.floor(230 / n));
    var w = 120, base = 250, top = base - n * fh;
    var s = '<svg viewBox="0 0 170 290" role="img" aria-label="Опрацьовано ' + done + ' з ' + total + '">';
    s += '<line x1="10" y1="' + base + '" x2="160" y2="' + base + '" stroke="#12284a" stroke-width="4"/>';
    for (var i = 0; i < n; i++) {
      var y = base - (i + 1) * fh;
      var ok = i < done;
      s += '<rect class="' + (ok ? 'floor-done' : '') + '" style="animation-delay:' + (i * 90) + 'ms" x="25" y="' + y +
        '" width="' + w + '" height="' + (fh - 3) + '" fill="' + (ok ? '#f5a300' : '#fbfcfe') +
        '" stroke="#12284a" stroke-width="2"/>';
      if (ok) {
        s += '<rect x="45" y="' + (y + 5) + '" width="14" height="' + Math.max(4, fh - 13) + '" fill="#fff" opacity="0.7"/>' +
             '<rect x="95" y="' + (y + 5) + '" width="14" height="' + Math.max(4, fh - 13) + '" fill="#fff" opacity="0.7"/>';
      }
    }
    var complete = total > 0 && done >= total;
    if (complete) {
      s += '<polygon points="25,' + top + ' 145,' + top + ' 85,' + (top - 26) + '" fill="#12284a"/>';
    } else {
      s += '<line x1="85" y1="' + top + '" x2="85" y2="' + (top - 26) + '" stroke="#12284a" stroke-width="3"/>' +
           '<circle cx="85" cy="' + (top - 30) + '" r="5" fill="#f5a300" stroke="#12284a" stroke-width="2"/>';
    }
    return s + '</svg>';
  }

  function showHome() {
    showHomeShell();
    if (early) {
      var e = early; early = null;
      e.then(function (r) { items = r.items; cacheSave(); renderHome(); show('v-home'); prefetchAll(); })
        .catch(function () { loadLectures(); });
      return;
    }
    loadLectures();
  }

  function showHomeShell() {
    say('');
    var owner = me.isOwner;
    $('#owner-bar').hidden = !owner;
    if (owner) {
      if (!viewGroup) viewGroup = me.groups[0] || '';
      $('#owner-group').innerHTML = me.groups.map(function (g) {
        return '<option' + (g === viewGroup ? ' selected' : '') + '>' + esc(g) + '</option>';
      }).join('');
    }
    $('#home-title').textContent = me.student
      ? 'Вітаємо, ' + me.student.name + ' · ' + me.student.group
      : 'Лекції (перегляд викладача)';
  }

  function loadLectures(fresh) {
    if (fresh) lecCache = {};
    api('lectures', { group: viewGroup, fresh: fresh ? true : undefined }).then(function (r) {
      items = r.items;
      cacheSave();
      renderHome();
      show('v-home');
      prefetchAll();
    }).catch(fail);
  }

  function refreshLectures() {
    api('lectures', { group: viewGroup }, true).then(function (r) {
      items = r.items;
      cacheSave();
      if (!$('#v-home').hidden) renderHome();
      prefetchAll();
    }).catch(function (err) { if (err && err.message === 'AUTH') fail(err); });
  }

  var SEC_NAME = {
    lec: { all: 'Лекцій', empty: 'Лекцій для цієї групи поки немає. Загляньте пізніше.' },
    prac: { all: 'Практичних', empty: 'Практичних робіт для цієї групи поки немає. Загляньте пізніше.' }
  };
  var section = 'lec';

  function renderHome() {
    var doneAll = items.filter(function (i) { return i.done; }).length;
    $('#tower').innerHTML = tower(doneAll, items.length);
    var tabs = $('#tabs').querySelectorAll('button');
    Array.prototype.forEach.call(tabs, function (b) {
      var s = b.getAttribute('data-sec');
      var n = items.filter(function (i) { return (i.section || 'lec') === s; }).length;
      b.classList.toggle('on', s === section);
      b.setAttribute('aria-selected', s === section ? 'true' : 'false');
      b.textContent = (s === 'lec' ? 'Лекції' : 'Практичні роботи') + ' (' + n + ')';
    });
    var cur = items.filter(function (i) { return (i.section || 'lec') === section; });
    var done = cur.filter(function (i) { return i.done; }).length;
    $('#progress-text').textContent = cur.length
      ? 'Опрацьовано: ' + done + ' з ' + cur.length
      : '';
    var list = $('#lec-list');
    if (!cur.length) {
      list.innerHTML = '<li class="lec-empty">' + SEC_NAME[section].empty + '</li>';
      return;
    }
    list.innerHTML = items.map(function (it, i) {
      if ((it.section || 'lec') !== section) return '';
      return '<li class="' + (it.done ? 'done' : '') + '"><button type="button" data-i="' + i + '">' +
        '<span>' + esc(it.title) + '</span>' +
        '<span class="mark">' + (it.done ? 'опрацьовано' : 'не опрацьовано') + '</span></button></li>';
    }).join('');
  }

  $('#tabs').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-sec]');
    if (!b) return;
    section = b.getAttribute('data-sec');
    renderHome();
  });

  $('#lec-list').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-i]');
    if (b) openLecture(items[+b.getAttribute('data-i')]);
  });

  $('#owner-refresh').addEventListener('click', function () { loadLectures(true); });

  $('#owner-group').addEventListener('change', function (e) {
    viewGroup = e.target.value;
    loadLectures();
  });

  /* ---------- перегляд лекції ---------- */
  function openLecture(it) {
    say('');
    current = it;
    $('#lec-title').textContent = it.title;
    var backText = '← До списку ' + ((it.section || 'lec') === 'prac' ? 'практичних робіт' : 'лекцій');
    $('#lec-back-top').textContent = backText;
    $('#lec-back').textContent = backText.replace('← ', '');
    $('#lec-body').innerHTML = '<p class="muted">Завантаження лекції…</p>';
    $('#lec-done').hidden = !!it.done;
    $('#lec-done-top').hidden = !!it.done;
    $('#lec-full').hidden = true;
    $('#lec-full-top').hidden = true;
    lecFrame = null;
    exitFull();
    show('v-lecture');
    autoFrames = [];
    getLecture(it).then(function (r) {
      var box = $('#lec-body');
      box.innerHTML = '';
      if (r.kind === 'html') {
        var parts = comboParts(r.html);
        if (parts) { buildCombo(box, r.title, parts); }
        else {
          var auto = /name=["']portal-height["']/.test(r.html);
          var f = makeFrame(r.title, auto ? withReporter(r.html) : r.html, auto);
          box.appendChild(f);
          lecFrame = f;
        }
      } else {
        if (blobUrl) URL.revokeObjectURL(blobUrl);
        var bin = atob(r.base64), bytes = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        blobUrl = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
        var a = document.createElement('p');
        a.className = 'muted';
        a.innerHTML = 'Якщо файл не відкрився на телефоні, <a target="_blank" rel="noopener" href="' + blobUrl + '">відкрийте його в новій вкладці</a>.';
        box.appendChild(a);
        var pf = document.createElement('iframe');
        pf.className = 'lec-frame';
        pf.title = r.title;
        pf.src = blobUrl;
        pf.setAttribute('allow', 'fullscreen');
        pf.setAttribute('allowfullscreen', '');
        box.appendChild(pf);
        lecFrame = pf;
      }
      $('#lec-full').hidden = false;
      $('#lec-full-top').hidden = false;
    }).catch(fail);
  }

  /* ---------- рамка лекції: одна прокрутка на всій сторінці ---------- */
  var autoFrames = [];

  // Текст у рамці повідомляє свою висоту, і рамка стає такою ж високою: прокручується лише сторінка кабінету.
  var REPORTER = '<script>(function(){function h(){var b=document.body,c=getComputedStyle(b);' +
    'return Math.ceil(b.getBoundingClientRect().height+(parseFloat(c.marginTop)||0)+(parseFloat(c.marginBottom)||0));}' +
    'function s(){parent.postMessage({portalHeight:h()},"*");}' +
    'addEventListener("load",s);addEventListener("resize",s);' +
    'if(window.ResizeObserver)new ResizeObserver(s).observe(document.body);setTimeout(s,300);})();<\/script>';

  function withReporter(html) {
    var i = html.lastIndexOf('</body>');
    return i < 0 ? html + REPORTER : html.slice(0, i) + REPORTER + html.slice(i);
  }

  function makeFrame(title, html, auto) {
    var f = document.createElement('iframe');
    f.className = 'lec-frame' + (auto ? ' auto' : '');
    f.title = title;
    // sandbox без allow-same-origin: скрипти лекції не бачать ні токен, ні сторінку кабінету
    f.setAttribute('sandbox', 'allow-scripts allow-popups');
    f.setAttribute('allow', 'fullscreen');
    f.setAttribute('allowfullscreen', '');
    f.srcdoc = html;
    if (auto) autoFrames.push(f);
    return f;
  }

  window.addEventListener('message', function (e) {
    var d = e.data;
    if (!d || typeof d.portalHeight !== 'number') return;
    for (var i = 0; i < autoFrames.length; i++) {
      if (autoFrames[i].contentWindow === e.source) {
        if (autoFrames[i].classList.contains('is-full')) return;
        autoFrames[i].style.height = Math.min(Math.max(d.portalHeight, 120), 30000) + 'px';
      }
    }
  });

  // Сервер склеює конспект із презентацією в одну сторінку; тут розбираємо її на дві рамки з вкладками кабінету
  function comboParts(html) {
    if (html.indexOf('id="tn"') < 0 || html.indexOf('id="pd"') < 0) return null;
    try {
      var doc = new DOMParser().parseFromString(html, 'text/html');
      var n = doc.querySelector('#pn iframe'), d = doc.querySelector('#pd iframe');
      if (!n || !d) return null;
      return { notes: n.getAttribute('srcdoc') || '', deck: d.getAttribute('srcdoc') || '' };
    } catch (err) { return null; }
  }

  function buildCombo(box, title, parts) {
    var tabs = document.createElement('div');
    tabs.className = 'tabs';
    var bn = document.createElement('button'); bn.type = 'button'; bn.textContent = 'Конспект'; bn.className = 'on';
    var bd = document.createElement('button'); bd.type = 'button'; bd.textContent = 'Презентація';
    tabs.appendChild(bn); tabs.appendChild(bd);
    var fn = makeFrame(title + ' (конспект)', withReporter(parts.notes), true);
    var fd = makeFrame(title + ' (презентація)', parts.deck, false);
    fd.hidden = true;
    function pick(deck) {
      exitFull();
      fn.hidden = deck; fd.hidden = !deck;
      bn.className = deck ? '' : 'on'; bd.className = deck ? 'on' : '';
      lecFrame = deck ? fd : fn;
      if (deck) { try { box.scrollIntoView({ block: 'start' }); } catch (err) {} }
    }
    bn.addEventListener('click', function () { pick(false); });
    bd.addEventListener('click', function () { pick(true); });
    box.appendChild(tabs); box.appendChild(fn); box.appendChild(fd);
    lecFrame = fn;
  }

  /* ---------- на весь екран ---------- */
  var lecFrame = null;

  function exitFull() {
    document.body.classList.remove('pseudo-full');
    if (lecFrame) lecFrame.classList.remove('is-full');
    $('#lec-full').textContent = '⛶ На весь екран';
    $('#lec-full-top').textContent = '⛶ На весь екран';
  }

  function onFullClick() {
    if (!lecFrame) return;
    if (document.fullscreenElement || lecFrame.classList.contains('is-full')) {
      if (document.fullscreenElement) document.exitFullscreen();
      exitFull();
      return;
    }
    if (lecFrame.requestFullscreen) {
      lecFrame.requestFullscreen().catch(function () { pseudoFull(); });
    } else {
      pseudoFull(); // iPhone та інші браузери без повного екрана для елементів
    }
  }
  $('#lec-full').addEventListener('click', onFullClick);
  $('#lec-full-top').addEventListener('click', onFullClick);

  function pseudoFull() {
    document.body.classList.add('pseudo-full');
    lecFrame.classList.add('is-full');
    $('#lec-full').textContent = '✕ Закрити повний екран';
    $('#lec-full-top').textContent = '✕ Закрити повний екран';
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lecFrame && lecFrame.classList.contains('is-full')) exitFull();
  });

  /* Повернення до списку: показуємо вже завантажене одразу, а свіжі дані підтягуємо у фоні */
  function backToList() {
    if (items.length) { renderHome(); show('v-home'); refreshLectures(); }
    else { loadLectures(); }
  }
  $('#lec-back').addEventListener('click', backToList);
  $('#lec-back-top').addEventListener('click', backToList);

  function onDoneClick() {
    if (!current) return;
    api('done', { id: current.id, title: current.title }).then(function () {
      current.done = true;
      say('Тему відмічено. Вежа виросла на поверх.');
      renderHome();
      show('v-home');
      refreshLectures();
    }).catch(fail);
  }
  $('#lec-done').addEventListener('click', onDoneClick);
  $('#lec-done-top').addEventListener('click', onDoneClick);

  /* ---------- рейтинг ---------- */
  function ratingRow(place, label, value, max, me, extra) {
    var medal = place === 1 ? 'gold' : place === 2 ? 'silver' : place === 3 ? 'bronze' : '';
    var w = max > 0 ? Math.max(3, Math.round(Math.max(value, 0) / max * 100)) : 3;
    return '<li class="rt-row' + (me ? ' me' : '') + '"><span class="rt-place ' + medal + '">' + place + '</span>' +
      '<span class="rt-body"><span class="rt-name">' + esc(label) + (extra ? ' <small>' + esc(extra) + '</small>' : '') + '</span>' +
      '<span class="rt-bar"><i style="width:' + (value > 0 ? w : 0) + '%"></i></span></span>' +
      '<span class="rt-pts">' + esc(String(Math.round(value * 100) / 100)) + '</span></li>';
  }

  var MEDAL = { 1: '#f5c542', 2: '#d5dbe3', 3: '#e0a572' };

  function num(v) { return String(Math.round(v * 100) / 100); }

  // Змагання груп: вежі, висота залежить від суми балів
  function towersSvg(groups, gmax) {
    var cw = 78, W = groups.length * cw, H = 262, base = 196, fh = 17, maxF = 8;
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Рейтинг груп" class="rt-svg">';
    s += '<line x1="2" y1="' + base + '" x2="' + (W - 2) + '" y2="' + base + '" stroke="#12284a" stroke-width="3"/>';
    groups.forEach(function (g, i) {
      var x = i * cw + 11, w = 56;
      var fl = g.total > 0 && gmax > 0 ? Math.max(1, Math.round(g.total / gmax * maxF)) : 0;
      var fill = g.mine ? '#f5a300' : '#6c86ad';
      var top = base - fl * fh;
      s += '<g class="rt-tower" style="animation-delay:' + (i * 120) + 'ms">';
      for (var f = 0; f < fl; f++) {
        var y = base - (f + 1) * fh;
        s += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + (fh - 2) + '" fill="' + fill + '" stroke="#12284a" stroke-width="1.6"/>' +
             '<rect x="' + (x + 12) + '" y="' + (y + 4) + '" width="9" height="' + (fh - 10) + '" fill="#fff" opacity="0.7"/>' +
             '<rect x="' + (x + 35) + '" y="' + (y + 4) + '" width="9" height="' + (fh - 10) + '" fill="#fff" opacity="0.7"/>';
      }
      if (fl > 0) {
        if (g.place === 1) {
          s += '<line x1="' + (x + w / 2) + '" y1="' + top + '" x2="' + (x + w / 2) + '" y2="' + (top - 26) + '" stroke="#12284a" stroke-width="2.5"/>' +
               '<polygon points="' + (x + w / 2) + ',' + (top - 26) + ' ' + (x + w / 2 + 20) + ',' + (top - 19) + ' ' + (x + w / 2) + ',' + (top - 12) + '" fill="#f5a300" stroke="#12284a" stroke-width="1.6"/>';
        } else {
          s += '<polygon points="' + x + ',' + top + ' ' + (x + w) + ',' + top + ' ' + (x + w / 2) + ',' + (top - 13) + '" fill="#12284a"/>';
        }
      }
      s += '<text x="' + (x + w / 2) + '" y="' + (top - (g.place === 1 && fl > 0 ? 34 : 20)) + '" text-anchor="middle" font-size="15" font-weight="800" fill="#12284a">' + num(g.total) + '</text></g>';
      s += '<text x="' + (x + w / 2) + '" y="' + (base + 20) + '" text-anchor="middle" font-size="14" font-weight="700" fill="#12284a">' + esc(g.group) + '</text>';
      s += '<circle cx="' + (x + w / 2) + '" cy="' + (base + 44) + '" r="12" fill="' + (MEDAL[g.place] || '#fbfcfe') + '" stroke="#12284a" stroke-width="2"/>' +
           '<text x="' + (x + w / 2) + '" y="' + (base + 49) + '" text-anchor="middle" font-size="13" font-weight="800" fill="#12284a">' + g.place + '</text>';
      s += '<text x="' + (x + w / 2) + '" y="' + (base + 66) + '" text-anchor="middle" font-size="10.5" fill="#5b6b82">' + g.count + ' студ.</text>';
    });
    return s + '</svg>';
  }

  function initials(name) {
    var p = String(name).trim().split(/\s+/);
    return ((p[0] || '').charAt(0) + (p[1] || '').charAt(0)).toUpperCase();
  }

  // Подіум трійки найкращих у групі: 2 - 1 - 3
  function podiumHtml(students) {
    var top = students.slice(0, 3);
    if (!top.length || top[0].points <= 0) return '';
    var order = top.length === 3 ? [1, 0, 2] : top.length === 2 ? [1, 0] : [0];
    var hs = [120, 92, 72];
    return order.map(function (idx) {
      var st = top[idx];
      return '<div class="pd-col' + (st.me ? ' me' : '') + '" style="animation-delay:' + (idx * 140) + 'ms">' +
        '<div class="pd-ava" style="background:' + (MEDAL[st.place] || '#fbfcfe') + '">' + esc(initials(st.name)) + '</div>' +
        '<div class="pd-name">' + esc(st.name) + '</div>' +
        '<div class="pd-pts">' + num(st.points) + '</div>' +
        '<div class="pd-block" style="height:' + hs[idx] + 'px"><span>' + st.place + '</span></div></div>';
    }).join('');
  }

  function heroHtml(r, myG) {
    if (!r.me) {
      return '<div class="rt-hero-body"><div class="rt-hero-title">Група ' + esc(r.group) + '</div>' +
        '<div class="rt-hero-sub">' + (myG ? myG.place + ' місце · ' + num(myG.total) + ' балів' : '') + '</div></div>';
    }
    var higher = r.students.filter(function (s) { return s.points > r.me.points; })
      .map(function (s) { return s.points; });
    var next = higher.length ? Math.min.apply(null, higher) : null;
    var hint = r.me.points <= 0 ? 'Бали з’являться після перших завдань.'
      : next === null ? 'Ви лідер своєї групи.'
      : 'До наступного місця в групі не вистачає ' + num(next - r.me.points) + ' балів.';
    return '<div class="rt-bigplace" style="background:' + (MEDAL[r.me.place] || '#fbfcfe') + '"><small>місце</small><b>' + r.me.place + '</b></div>' +
      '<div class="rt-hero-body"><div class="rt-hero-title">' + num(r.me.points) + ' балів</div>' +
      '<div class="rt-hero-sub">' + esc(hint) + '</div>' +
      '<div class="rt-hero-sub">Ваша група ' + esc(r.group) + ': ' + (myG ? myG.place + ' місце, ' + num(myG.total) + ' балів' : '') + '</div></div>';
  }

  function showRating() {
    api('rating', { group: viewGroup }).then(function (r) {
      var gmax = Math.max.apply(null, r.groups.map(function (g) { return g.total; }).concat([0]));
      var smax = Math.max.apply(null, r.students.map(function (s) { return s.points; }).concat([0]));
      var gs = r.groups.slice().sort(function (a, b) { return a.place - b.place || a.group.localeCompare(b.group, 'uk'); });
      var myG = r.groups.filter(function (g) { return g.mine; })[0];
      $('#rt-hero').innerHTML = heroHtml(r, myG);
      $('#rt-towers').innerHTML = towersSvg(gs, gmax);
      $('#rt-title').textContent = 'Група ' + r.group;
      var pod = podiumHtml(r.students);
      $('#rt-podium').innerHTML = pod;
      $('#rt-podium').hidden = !pod;
      var rest = pod ? r.students.slice(3) : r.students;
      $('#rt-students').innerHTML = rest.map(function (s) {
        return ratingRow(s.place, s.name, s.points, smax, s.me, '');
      }).join('');
      $('#rt-empty').hidden = gmax > 0;
      show('v-rating');
    }).catch(fail);
  }

  $('#nav-rating').addEventListener('click', function (e) { e.preventDefault(); say(''); showRating(); });

  /* ---------- кабінет викладача ---------- */
  function showAdmin() {
    api('admin').then(function (r) {
      $('#adm-sheet').href = r.sheetUrl;
      $('#adm-folder').href = r.folderUrl;
      $('#adm-code').value = r.code;
      $('#adm-empty').hidden = r.students.length > 0;
      $('#pts-student').innerHTML = r.students.filter(function (s) { return s.status === 'активний'; })
        .sort(function (a, b) { return (a.group + a.name).localeCompare(b.group + b.name, 'uk'); })
        .map(function (s) { return '<option value="' + esc(s.email) + '">' + esc(s.group + ' · ' + s.name) + '</option>'; }).join('');
      $('#adm-body').innerHTML = r.students.map(function (s) {
        var active = s.status === 'активний';
        return '<tr class="' + (active ? '' : 'blocked') + '"><td>' + esc(s.name) + '</td><td>' + esc(s.group) +
          '</td><td>' + esc(s.email) + '</td><td>' + s.done + '</td><td><button type="button" data-email="' +
          esc(s.email) + '" data-to="' + (active ? 'заблокований' : 'активний') + '">' +
          (active ? 'Закрити доступ' : 'Відновити') + '</button></td></tr>';
      }).join('');
      show('v-admin');
    }).catch(fail);
  }

  $('#adm-body').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-email]');
    if (!b) return;
    api('admin_status', { email: b.getAttribute('data-email'), status: b.getAttribute('data-to') })
      .then(showAdmin).catch(fail);
  });

  $('#pts-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var email = $('#pts-student').value, task = $('#pts-task').value, val = $('#pts-val').value;
    if (!email || !task.trim() || val === '') { say('Оберіть студента, напишіть завдання і бали.', true); return; }
    api('admin_points', { email: email, task: task, points: Number(val) }).then(function () {
      say('Бали додано.');
      $('#pts-val').value = '';
    }).catch(fail);
  });

  $('#code-form').addEventListener('submit', function (e) {
    e.preventDefault();
    api('admin_code', { code: $('#adm-code').value }).then(function () {
      say('Код семестру змінено.');
    }).catch(fail);
  });

  /* ---------- меню ---------- */
  $('#nav-home').addEventListener('click', function (e) { e.preventDefault(); loadLectures(); });
  $('#nav-admin').addEventListener('click', function (e) { e.preventDefault(); showAdmin(); });
  $('#nav-logout').addEventListener('click', function (e) { e.preventDefault(); logout(''); });

  /* ---------- запуск ---------- */
  if (token) {
    boot();
    initGoogle();
  } else {
    show('v-login');
    initGoogle();
  }
})();
