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
    BAD_EMAIL: 'Перевірте пошту: вона має виглядати як name@gmail.com.',
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

  /* Заставки завантаження з механіки: щоразу випадкова */
  function gearPath(cx, cy, r, n) {
    var pts = [], step = Math.PI * 2 / n, ri = r * 0.78;
    for (var i = 0; i < n; i++) {
      var a = i * step;
      [[0, ri], [0.18, r], [0.5, r], [0.68, ri]].forEach(function (p) {
        var ang = a + p[0] * step;
        pts.push((cx + Math.cos(ang) * p[1]).toFixed(1) + ',' + (cy + Math.sin(ang) * p[1]).toFixed(1));
      });
    }
    return 'M' + pts.join('L') + 'Z';
  }
  var LOADERS = [
    // ферма з точкою, що біжить по розкосах (чорно-біла)
    function () {
      return '<svg viewBox="4 38 112 34" fill="none" stroke="#000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M10 65H110M10 45H110M10 45V65M30 45V65M50 45V65M70 45V65M90 45V65M110 45V65"/>' +
        '<path d="M10 65L30 45L50 65L70 45L90 65L110 45"/>' +
        '<circle r="4.5" fill="#000" stroke="none"><animateMotion dur="1.6s" repeatCount="indefinite" calcMode="spline" keyTimes="0;1" keySplines=".45 0 .55 1" path="M10 65L30 45L50 65L70 45L90 65L110 45"/></circle></svg>';
    }
  ];
  var lastLoader = -1;
  function pickLoader() {
    var ico = $('#loader-ico');
    if (!ico) return;
    var k;
    do { k = Math.floor(Math.random() * LOADERS.length); } while (k === lastLoader && LOADERS.length > 1);
    lastLoader = k;
    ico.innerHTML = LOADERS[k]();
  }

  function loaderOn(action) {
    pending++;
    var lt = $('#loader-text'), lb = $('#loader');
    if (!lt || !lb) return;
    lt.textContent = LOADING[action] || 'Завантаження…';
    if (!loaderTimer) loaderTimer = setTimeout(function () { pickLoader(); lb.hidden = false; }, 200);
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
  var VIEWS = ['v-login', 'v-register', 'v-home', 'v-lecture', 'v-admin', 'v-rating', 'v-tasks', 'v-task'];

  var BG_THEME = { 'v-rating': 'city', 'v-tasks': 'gears', 'v-task': 'gears', 'v-admin': 'grid' };

  function show(id) {
    if (window.PortalBG) window.PortalBG.set(BG_THEME[id] || 'formulas');
    document.body.setAttribute('data-view', id);
    VIEWS.forEach(function (v) { $('#' + v).hidden = (v !== id); });
    var loggedIn = id !== 'v-login';
    $('#nav-home').hidden = !loggedIn || id === 'v-register';
    $('#nav-rating').hidden = !loggedIn || id === 'v-register';
    $('#nav-tasks').hidden = !loggedIn || id === 'v-register';
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
  // Google не пускає вхід усередині вбудованих браузерів месенджерів (Telegram, Viber, Instagram тощо)
  function loginHint() {
    var ua = navigator.userAgent || '';
    var ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && 'ontouchend' in document);
    // Telegram на iPhone відкриває сайт у власному вікні з «безпечним» User-Agent, тому шукаємо його сліди окремо
    var inApp = !!(window.TelegramWebviewProxy || window.TelegramWebviewProxyProto || window.TelegramGameProxy) ||
      /FBAN|FBAV|Instagram|Telegram|Viber|Line\/|MicroMessenger|TikTok|; wv\)|GSA\//.test(ua) ||
      (ios && !/Safari\//.test(ua));
    var el = $('#login-hint');
    if (!inApp && !ios) return;
    el.innerHTML = '';
    var t = document.createElement('span');
    t.textContent = inApp
      ? 'Сайт відкрито всередині месенджера (наприклад, Telegram). Google не дозволяє вхід у такому вікні: відкриється порожня сторінка. Скопіюйте адресу й відкрийте її в Safari або Chrome. '
      : 'На iPhone/iPad, якщо вхід не спрацьовує: у Налаштування → Safari вимкніть «Запобігати міжсайтовому відстеженню» та дозвольте спливаючі вікна, або відкрийте сайт у Chrome. ';
    el.appendChild(t);
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'btn btn-ghost'; btn.textContent = 'Скопіювати адресу';
    btn.addEventListener('click', function () {
      var url = location.href.split('#')[0];
      var done = function () { btn.textContent = 'Адресу скопійовано. Вставте її в Safari'; };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done, function () { window.prompt('Скопіюйте адресу:', url); });
      } else { window.prompt('Скопіюйте адресу:', url); }
    });
    el.appendChild(btn);
    if (inApp) el.classList.add('is-warn');
    el.hidden = false;
  }

  function initGoogle() {
    loginHint();
    var tries = 0;
    var timer = setInterval(function () {
      tries++;
      if (window.google && google.accounts && google.accounts.id) {
        clearInterval(timer);
        google.accounts.id.initialize({
          client_id: CFG.CLIENT_ID,
          callback: onCredential,
          auto_select: true,
          itp_support: true
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
    var vy = Math.min(0, top - 48);
    var s = '<svg viewBox="0 ' + vy + ' 170 ' + (270 - vy) + '" role="img" aria-label="Опрацьовано ' + done + ' з ' + total + '" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round">';
    s += '<line x1="8" y1="' + base + '" x2="162" y2="' + base + '" stroke-width="1.5"/>';
    for (var i = 0; i < n; i++) {
      var y = base - (i + 1) * fh;
      var ok = i < done;
      if (ok) {
        s += '<rect class="floor-done" style="animation-delay:' + (i * 90) + 'ms" x="25" y="' + y + '" width="' + w + '" height="' + (fh - 3) + '" fill="#000" stroke="none"/>' +
             '<line x1="40" y1="' + (y + (fh - 3) / 2) + '" x2="130" y2="' + (y + (fh - 3) / 2) + '" stroke="#fff" stroke-width="1" stroke-dasharray="8 6"/>';
      } else {
        s += '<rect x="25" y="' + y + '" width="' + w + '" height="' + (fh - 3) + '" stroke="#000" stroke-opacity=".45" stroke-width="1" stroke-dasharray="4 3"/>';
      }
    }
    /* тонкий баштовий кран праворуч */
    var cx = 156, ct = top - 40;
    s += '<path d="M' + cx + ' ' + base + 'V' + ct + 'M' + (cx - 26) + ' ' + ct + 'H' + (cx + 8) + 'M' + cx + ' ' + (ct + 14) + 'L' + (cx - 26) + ' ' + ct + '" stroke-width="1" stroke-opacity=".6"/>' +
         '<path d="M' + (cx - 22) + ' ' + ct + 'V' + (ct + 12) + '" stroke-width="1" stroke-opacity=".6"/>';
    var complete = total > 0 && done >= total;
    if (complete) {
      s += '<polygon points="25,' + top + ' 145,' + top + ' 85,' + (top - 26) + '" fill="#000" stroke="none"/>';
    } else {
      s += '<line x1="85" y1="' + top + '" x2="85" y2="' + (top - 26) + '" stroke-width="1.5"/>' +
           '<circle cx="85" cy="' + (top - 30) + '" r="4.5" fill="#fff" stroke-width="1.5"/>';
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
    prac: { all: 'Практичних', empty: 'Практичних робіт для цієї групи поки немає. Загляньте пізніше.' },
    extra: { all: 'Фантазер', empty: 'Матеріалів поки немає. Загляньте пізніше.' }
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
      b.textContent = (s === 'lec' ? 'Лекції' : s === 'prac' ? 'Практичні роботи' : 'Фантазер') + ' (' + n + ')';
      if (s === 'extra') b.hidden = !n;
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
    document.body.setAttribute('data-sec', section);
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
    var backText = '← До списку ' + ((it.section || 'lec') === 'prac' ? 'практичних робіт' : (it.section === 'extra' ? 'матеріалів «Фантазера»' : 'лекцій'));
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

  /* Оформлення тексту конспекту в стилі сайту: перекриває власні стилі файлу лекції */
  var NOTES_CSS = '<style id="portal-notes-style">' +
    "@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&family=Roboto:wght@300;400;500;700&display=swap&subset=cyrillic');" +
    'html{background:#fff}' +
    'body{font-family:Roboto,Arial,sans-serif!important;font-size:17px!important;line-height:1.75!important;color:#3b4046!important;max-width:760px!important;padding:6px 4px 40px!important;background:#fff!important}' +
    'h1{font-family:Manrope,Roboto,Arial,sans-serif!important;font-size:clamp(28px,5vw,42px)!important;font-weight:800!important;line-height:1.1!important;letter-spacing:-.02em!important;color:#000!important;margin:0 0 18px!important}' +
    'h2{font-family:Manrope,Roboto,Arial,sans-serif!important;font-size:clamp(21px,3vw,27px)!important;font-weight:800!important;letter-spacing:-.01em!important;color:#000!important;border:0!important;border-top:1px solid #000!important;padding:18px 0 0!important;margin:54px 0 14px!important}' +
    'h3{font-family:Manrope,Roboto,Arial,sans-serif!important;font-size:18px!important;font-weight:700!important;color:#000!important;margin:28px 0 6px!important}' +
    'p{margin:12px 0!important;color:#3b4046!important}' +
    '.write{background:#f6f6f6!important;border:0!important;border-left:2px solid #000!important;border-radius:0!important;padding:18px 22px!important;margin:22px 0!important;color:#1a1d20!important}' +
    '.write>b,.main>b{display:block;font-size:11px!important;font-weight:700!important;letter-spacing:.22em;text-transform:uppercase;margin-bottom:10px}' +
    '.write>b{color:#000!important}' +
    '.write ul{margin:0!important;padding-left:20px!important}.write li{margin:7px 0}' +
    '.main{background:#000!important;color:#fff!important;border-radius:0!important;padding:20px 24px!important;margin:22px 0 8px!important}' +
    '.main>b{color:#bdbdbd!important}.main p{color:#fff!important;font-family:Manrope,Roboto,Arial,sans-serif;font-size:19px;font-weight:700;line-height:1.4;margin:0!important}' +
    '.formula{background:#f6f6f6!important;border:0!important;border-left:2px solid #000!important;border-radius:0!important;color:#000!important;padding:12px 18px!important}' +
    '.fig{margin:26px 0!important}.fig img{border:1px solid #ececec}' +
    'a{color:#000!important}' +
    '</style>';

  function withReporter(html) {
    var hi = html.indexOf('</head>');
    if (hi >= 0) html = html.slice(0, hi) + NOTES_CSS + html.slice(hi); else html = NOTES_CSS + html;
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

  // Сервер склеює конспект, презентацію і PDF в одну сторінку; тут розбираємо її на рамки з вкладками кабінету
  function comboParts(html) {
    if (html.indexOf('id="pn"') < 0 && (html.indexOf('id="pd"') < 0 || html.indexOf('id="td"') < 0)) return null;
    try {
      var doc = new DOMParser().parseFromString(html, 'text/html');
      var n = doc.querySelector('#pn iframe'), d = doc.querySelector('#pd iframe'), p = doc.querySelector('#pp');
      if (!d && !n) return null;
      return {
        notes: n ? (n.getAttribute('srcdoc') || '') : '',
        deck: d ? (d.getAttribute('srcdoc') || '') : '',
        pdf: p ? (p.getAttribute('data-pdf') || '') : ''
      };
    } catch (err) { return null; }
  }

  function buildCombo(box, title, parts) {
    var tabs = document.createElement('div');
    tabs.className = 'tabs';
    var list = [];
    if (parts.notes) list.push({ label: 'Конспект', frame: makeFrame(title + ' (конспект)', withReporter(parts.notes), true) });
    if (parts.deck) list.push({ label: 'Презентація', frame: makeFrame(title + ' (презентація)', parts.deck, false) });
    if (parts.pdf) list.push({ label: 'PDF', pdf: parts.pdf });
    list.forEach(function (t, i) {
      t.btn = document.createElement('button');
      t.btn.type = 'button';
      t.btn.textContent = t.label;
      tabs.appendChild(t.btn);
      if (t.frame) { t.frame.hidden = i !== 0; }
    });
    function pdfFrame(t) {
      if (t.frame) return t.frame;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      var bin = atob(t.pdf), bytes = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      blobUrl = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
      var pf = document.createElement('iframe');
      pf.className = 'lec-frame';
      pf.title = title + ' (PDF)';
      pf.src = blobUrl;
      pf.setAttribute('allow', 'fullscreen');
      pf.setAttribute('allowfullscreen', '');
      box.appendChild(pf);
      t.frame = pf;
      return pf;
    }
    function pick(k) {
      exitFull();
      list.forEach(function (t, i) {
        if (i === k && t.pdf) pdfFrame(t);
        if (t.frame) t.frame.hidden = i !== k;
        t.btn.className = i === k ? 'on' : '';
      });
      lecFrame = list[k].frame;
      if (k > 0) { try { box.scrollIntoView({ block: 'start' }); } catch (err) {} }
    }
    list.forEach(function (t, i) { t.btn.addEventListener('click', function () { pick(i); }); });
    box.appendChild(tabs);
    list.forEach(function (t) { if (t.frame) box.appendChild(t.frame); });
    list[0].btn.className = 'on';
    lecFrame = list[0].frame;
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
  // Топ-5: каркас висотки, що будується. Кожен поверх = студент, заливка поверху = бали, на даху кран піднімає балку лідерові
  function topSvg(top, tmax) {
    var W = 560, H = 410, ground = 372, fh = 60, fx = 16, fw = 392, n = 5;
    var cut = function (t, m) { t = String(t); return t.length > m ? t.slice(0, m - 1) + '…' : t; };
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="rt-svg rt-top-svg" role="img" aria-label="Топ-5 студентів: ' +
      esc(top.map(function (x) { return x.place + '. ' + x.name + ' (' + x.group + ') ' + num(x.points); }).join('; ')) + '">' +
      '<defs><linearGradient id="sky2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f4f4"/><stop offset="1" stop-color="#ffffff"/></linearGradient>' +
      '<pattern id="haz2" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="16" fill="#000"/><rect x="8" width="8" height="16" fill="#fff"/></pattern>' +
      '<linearGradient id="glass2" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9a9a9a"/><stop offset="1" stop-color="#bdbdbd"/></linearGradient></defs>' +
      '<rect width="' + W + '" height="' + ground + '" fill="url(#sky2)"/>' +
      '<g fill="#fff" opacity="0"><ellipse cx="470" cy="46" rx="34" ry="9"/><ellipse cx="452" cy="40" rx="20" ry="8"/><ellipse cx="90" cy="30" rx="30" ry="8"/></g>' +
      '<rect y="' + ground + '" width="' + W + '" height="' + (H - ground) + '" fill="#f0f0f0"/><rect y="' + ground + '" width="' + W + '" height="8" fill="url(#haz2)"/>' +
      // кран (праворуч)
      '<g stroke="' + INK + '" stroke-width="2.4" fill="none"><rect x="470" y="40" width="22" height="' + (ground - 40) + '" fill="#fff"/>' +
      '<path d="M470 ' + (ground) + ' L492 ' + (ground - 40) + ' M492 ' + ground + ' L470 ' + (ground - 40) + ' M470 ' + (ground - 40) + ' L492 ' + (ground - 80) + ' M492 ' + (ground - 40) + ' L470 ' + (ground - 80) + '" stroke="' + INK + '" stroke-width="1.4"/>' +
      '<rect x="60" y="22" width="470" height="14" fill="#fff"/><path d="M60 36 L100 22 L140 36 L180 22 L220 36 L260 22 L300 36 L340 22 L380 36 L420 22 L460 36 L500 22" stroke-width="1.4"/>' +
      '<rect x="500" y="36" width="30" height="22" fill="#888"/></g>' +
      '<g class="rt-hook"><line x1="130" y1="36" x2="130" y2="' + (ground - fh * n - 28) + '" stroke="' + INK + '" stroke-width="2"/>' +
      '<rect x="92" y="' + (ground - fh * n - 28) + '" width="76" height="12" fill="url(#haz2)" stroke="' + INK + '" stroke-width="2"/></g>' +
      // фундамент
      '<rect x="' + (fx - 8) + '" y="' + (ground - 8) + '" width="' + (fw + 16) + '" height="10" fill="#888" stroke="' + INK + '" stroke-width="2"/>';
    for (var i = 0; i < n; i++) {
      var e = top[n - 1 - i];                       // знизу місце 5, нагорі місце 1
      var y = ground - 8 - (i + 1) * fh + 8;
      if (!top[n - 1 - i]) { // вільний поверх: лише каркас
        s += '<rect x="' + fx + '" y="' + y + '" width="' + fw + '" height="' + fh + '" fill="none" stroke="' + INK + '" stroke-width="1.6" stroke-dasharray="6 5" opacity="0.45"/>';
        continue;
      }
      var pw = tmax > 0 ? Math.max(14, Math.round(e.points / tmax * (fw - 8))) : 14;
      var mine = e.me;
      s += '<g class="rt-floor" style="animation-delay:' + (i * 120) + 'ms">' +
        '<rect x="' + fx + '" y="' + y + '" width="' + fw + '" height="' + fh + '" fill="#f4f4f4" stroke="' + INK + '" stroke-width="2"/>' +
        '<rect x="' + (fx + 4) + '" y="' + (y + 8) + '" width="' + pw + '" height="' + (fh - 16) + '" fill="' + (mine ? '#000' : 'url(#glass2)') + '"/>' +
        '<g stroke="rgba(255,255,255,.35)" stroke-width="1">' + [1, 2, 3, 4, 5, 6, 7].map(function (k) { return '<line x1="' + (fx + 4 + k * 48) + '" y1="' + (y + 8) + '" x2="' + (fx + 4 + k * 48) + '" y2="' + (y + fh - 8) + '"/>'; }).join('') + '</g>' +
        '<rect x="' + (fx - 4) + '" y="' + (y - 3) + '" width="' + (fw + 8) + '" height="7" fill="#d0d0d0" stroke="' + INK + '" stroke-width="1.6"/>' +
        '<text x="' + (fx + 14) + '" y="' + (y + 27) + '" font-size="17" font-weight="700" fill="#fff" style="paint-order:stroke;stroke:#000;stroke-width:3px">' + e.place + '. ' + esc(cut(e.name, 22)) + '</text>' +
        '<text x="' + (fx + 14) + '" y="' + (y + 47) + '" font-size="13" fill="#fff" style="paint-order:stroke;stroke:#000;stroke-width:2.5px">' + esc(e.group) + '</text>' +
        '<rect x="' + (fx + fw - 74) + '" y="' + (y + 14) + '" width="64" height="32" rx="4" fill="#fff" stroke="' + INK + '" stroke-width="2"/>' +
        '<text x="' + (fx + fw - 42) + '" y="' + (y + 36) + '" font-size="18" font-weight="800" text-anchor="middle" fill="' + INK + '">' + esc(num(e.points)) + '</text>';
      if (e.place === 1) {
        s += '<line x1="' + (fx + fw - 40) + '" y1="' + (y - 3) + '" x2="' + (fx + fw - 40) + '" y2="' + (y - 40) + '" stroke="' + INK + '" stroke-width="2.4"/>' +
          '<polygon points="' + (fx + fw - 40) + ',' + (y - 40) + ' ' + (fx + fw - 12) + ',' + (y - 32) + ' ' + (fx + fw - 40) + ',' + (y - 24) + '" fill="#000" stroke="' + INK + '" stroke-width="1.5"/>';
      }
      s += '</g>';
    }
    // каска на даху
    return s + '</svg>';
  }

  function ratingRow(place, label, value, max, me, extra) {
    var medal = place === 1 ? 'gold' : place === 2 ? 'silver' : place === 3 ? 'bronze' : '';
    var w = max > 0 ? Math.max(3, Math.round(Math.max(value, 0) / max * 100)) : 3;
    return '<li class="rt-row' + (me ? ' me' : '') + '"><span class="rt-place ' + medal + '">' + place + '</span>' +
      '<span class="rt-body"><span class="rt-name">' + esc(label) + (extra ? ' <small>' + esc(extra) + '</small>' : '') + '</span>' +
      '<span class="rt-bar"><i style="width:' + (value > 0 ? w : 0) + '%"></i></span></span>' +
      '<span class="rt-pts">' + esc(String(Math.round(value * 100) / 100)) + '</span></li>';
  }

  var MEDAL = { 1: '#000000', 2: '#9a9a9a', 3: '#d9d9d9' };
  var INK = '#000000';

  function num(v) { return String(Math.round(v * 100) / 100); }

  // Каска: колір за місцем, всередині ініціали
  function helmet(col, text, size) {
    return '<svg viewBox="0 0 64 56" width="' + size + '" height="' + (size * 56 / 64) + '" aria-hidden="true">' +
      '<path d="M8 38a24 24 0 0 1 48 0z" fill="' + col + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<rect x="27" y="10" width="10" height="28" fill="#fff" opacity="0.55"/>' +
      '<rect x="3" y="38" width="58" height="8" rx="3" fill="' + col + '" stroke="' + INK + '" stroke-width="3"/>' +
      (text ? '<text x="32" y="34" text-anchor="middle" font-size="13" font-weight="800" fill="' + (col === '#000000' ? '#fff' : INK) + '">' + esc(text) + '</text>' : '') +
      '</svg>';
  }

  // Будмайданчик: кожна група будує будинок, поверхи ростуть із балами; у лідера будинок уже з дахом
  function towersSvg(groups, gmax) {
    var cw = 92, W = groups.length * cw, H = 330, ground = 236, fh = 19, maxF = 9;
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Будівництво: рейтинг груп" class="rt-svg">' +
      '<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f4f4"/><stop offset="1" stop-color="#ffffff"/></linearGradient>' +
      '<pattern id="haz" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="16" fill="#000"/><rect x="8" width="8" height="16" fill="#fff"/></pattern></defs>' +
      '<rect width="' + W + '" height="' + ground + '" fill="url(#sky)"/>' +
      '<g fill="#fff" opacity="0"><ellipse cx="' + (W * 0.2) + '" cy="40" rx="30" ry="9"/><ellipse cx="' + (W * 0.2 + 18) + '" cy="34" rx="20" ry="8"/>' +
      '<ellipse cx="' + (W * 0.7) + '" cy="62" rx="34" ry="9"/><ellipse cx="' + (W * 0.7 - 20) + '" cy="56" rx="20" ry="8"/></g>' +
      '<rect y="' + ground + '" width="' + W + '" height="' + (H - ground) + '" fill="#f0f0f0"/>' +
      '<rect y="' + ground + '" width="' + W + '" height="7" fill="url(#haz)"/>';
    groups.forEach(function (g, i) {
      var x = i * cw + 10, w = 60, cx = x + w / 2;
      var fl = g.total > 0 && gmax > 0 ? Math.max(1, Math.round(g.total / gmax * maxF)) : 0;
      var done = g.place === 1 && fl > 0;
      var body = g.mine ? '#000' : '#bdbdbd';
      var top = ground - fl * fh;
      s += '<g class="rt-tower" style="animation-delay:' + (i * 130) + 'ms">';
      // фундамент
      s += '<rect x="' + (x - 5) + '" y="' + (ground - 5) + '" width="' + (w + 10) + '" height="6" fill="#888" stroke="' + INK + '" stroke-width="1.5"/>';
      for (var f = 0; f < fl; f++) {
        var y = ground - 5 - (f + 1) * fh + 5;
        s += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + fh + '" fill="' + body + '" stroke="' + INK + '" stroke-width="1.6"/>' +
             '<rect x="' + (x + 9) + '" y="' + (y + 5) + '" width="11" height="9" fill="#fff" stroke="' + INK + '" stroke-width="1"/>' +
             '<rect x="' + (x + 24) + '" y="' + (y + 5) + '" width="11" height="9" fill="#fff" stroke="' + INK + '" stroke-width="1"/>' +
             '<rect x="' + (x + 39) + '" y="' + (y + 5) + '" width="11" height="9" fill="#fff" stroke="' + INK + '" stroke-width="1"/>';
      }
      var t = ground - fl * fh;
      if (done) {
        s += '<polygon points="' + (x - 4) + ',' + t + ' ' + (x + w + 4) + ',' + t + ' ' + cx + ',' + (t - 22) + '" fill="#000" stroke="' + INK + '" stroke-width="1.6"/>' +
             '<line x1="' + cx + '" y1="' + (t - 22) + '" x2="' + cx + '" y2="' + (t - 46) + '" stroke="' + INK + '" stroke-width="2.4"/>' +
             '<polygon points="' + cx + ',' + (t - 46) + ' ' + (cx + 24) + ',' + (t - 39) + ' ' + cx + ',' + (t - 32) + '" fill="#000" stroke="' + INK + '" stroke-width="1.5"/>';
        top = t - 52;
      } else {
        // риштування над останнім поверхом і кран
        var sy = t - fh;
        if (fl > 0) {
          s += '<rect x="' + (x - 3) + '" y="' + sy + '" width="' + (w + 6) + '" height="' + fh + '" fill="none" stroke="' + INK + '" stroke-width="1.4"/>' +
               '<line x1="' + (x - 3) + '" y1="' + sy + '" x2="' + (x + w + 3) + '" y2="' + t + '" stroke="' + INK + '" stroke-width="1.1"/>' +
               '<line x1="' + (x + w + 3) + '" y1="' + sy + '" x2="' + (x - 3) + '" y2="' + t + '" stroke="' + INK + '" stroke-width="1.1"/>';
        }
        var cy = Math.min(t, ground - 20) - 54, mx = x + w + 9;
        s += '<line x1="' + mx + '" y1="' + ground + '" x2="' + mx + '" y2="' + cy + '" stroke="#000" stroke-width="4"/>' +
             '<line x1="' + (mx - 40) + '" y1="' + cy + '" x2="' + (mx + 9) + '" y2="' + cy + '" stroke="#000" stroke-width="4"/>' +
             '<polygon points="' + (mx - 3) + ',' + cy + ' ' + mx + ',' + (cy - 14) + ' ' + (mx + 3) + ',' + cy + '" fill="#000"/>' +
             '<rect x="' + (mx + 3) + '" y="' + (cy + 2) + '" width="8" height="8" fill="' + INK + '"/>' +
             '<line x1="' + (mx - 32) + '" y1="' + cy + '" x2="' + (mx - 32) + '" y2="' + (Math.min(t, ground) - 12) + '" stroke="' + INK + '" stroke-width="1.2"/>' +
             '<rect x="' + (mx - 37) + '" y="' + (Math.min(t, ground) - 12) + '" width="10" height="8" fill="#000" stroke="' + INK + '" stroke-width="1.2"/>';
        top = cy - 16;
      }
      s += '</g>';
      s += '<text x="' + cx + '" y="' + Math.max(16, top - 6) + '" text-anchor="middle" font-size="15" font-weight="800" fill="' + INK + '">' + num(g.total) + '</text>';
      // табличка групи на майданчику
      s += '<rect x="' + (x - 6) + '" y="' + (ground + 14) + '" width="' + (w + 12) + '" height="26" rx="3" fill="' + (g.mine ? '#000' : '#fff') + '" stroke="' + INK + '" stroke-width="2"/>' +
           '<text x="' + cx + '" y="' + (ground + 32) + '" text-anchor="middle" font-size="14" font-weight="800" fill="' + (g.mine ? '#fff' : INK) + '">' + esc(g.group) + '</text>';
      s += '<g transform="translate(' + (cx - 14) + ',' + (ground + 46) + ')">' + helmet(MEDAL[g.place] || '#ffffff', '', 28) + '</g>' +
           '<text x="' + (cx + 20) + '" y="' + (ground + 66) + '" font-size="13" font-weight="800" fill="' + INK + '">' + g.place + '</text>' +
           '<text x="' + cx + '" y="' + (ground + 84) + '" text-anchor="middle" font-size="10.5" fill="#666">' + g.count + ' студ.</text>';
    });
    return s + '</svg>';
  }

  function initials(name) {
    var p = String(name).trim().split(/\s+/);
    return ((p[0] || '').charAt(0) + (p[1] || '').charAt(0)).toUpperCase();
  }

  // Бригада: трійка найкращих у касках на цегляних стовпах, 2 - 1 - 3
  function podiumHtml(students) {
    var top = students.slice(0, 3);
    if (!top.length || top[0].points <= 0) return '';
    var order = top.length === 3 ? [1, 0, 2] : top.length === 2 ? [1, 0] : [0];
    var hs = [120, 92, 72];
    return order.map(function (idx) {
      var st = top[idx];
      return '<div class="pd-col' + (st.me ? ' me' : '') + '" style="animation-delay:' + (idx * 140) + 'ms">' +
        '<div class="pd-ava">' + helmet(MEDAL[st.place] || '#fbfcfe', initials(st.name), 64) + '</div>' +
        '<div class="pd-name">' + esc(st.name) + '</div>' +
        '<div class="pd-pts">' + num(st.points) + '</div>' +
        '<div class="pd-block" style="height:' + hs[idx] + 'px"><span>' + st.place + '</span></div></div>';
    }).join('');
  }

  /* ---------- таблиця лідерів у стилі «синька»: скошені рядки ---------- */
  var TROPHY = '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><path d="M7 4h10v5a5 5 0 0 1-10 0V4z"/><path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3"/><path d="M12 14v4M8 20h8"/></svg>';
  function lbRow(place, name, sub, score, me) {
    return '<li class="lb-row' + (me ? ' me' : '') + (place <= 3 ? ' p' + place : '') + '">' +
      '<span class="lb-rank">' + (place <= 3 ? TROPHY : '') + '<b>' + place + '</b></span>' +
      '<span class="lb-name">' + esc(name) + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</span>' +
      '<span class="lb-score"><b>' + esc(num(score)) + '</b></span></li>';
  }
  function topHtml(top) {
    return '<ol class="lb">' + top.map(function (e) { return lbRow(e.place, e.name, e.group, e.points, e.me); }).join('') + '</ol>';
  }
  function groupsHtml(groups) {
    return '<ol class="lb">' + groups.map(function (g) {
      return lbRow(g.place, 'Група ' + g.group, g.count + ' студ.', g.total, g.mine);
    }).join('') + '</ol>';
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
      : next === null ? 'Ви перший у своїй бригаді.'
      : 'До наступного місця в бригаді не вистачає ' + num(next - r.me.points) + ' балів.';
    return '<div class="rt-bigplace"><b>' + r.me.place + '</b><small>місце</small></div>' +
      '<div class="rt-hero-body"><div class="rt-hero-title">' + num(r.me.points) + ' балів</div>' +
      '<div class="rt-hero-sub">' + esc(hint) + '</div>' +
      '<div class="rt-hero-sub">Ваша група ' + esc(r.group) + ': ' + (myG ? myG.place + ' місце, ' + num(myG.total) + ' балів' : '') + '</div></div>';
  }

  function renderRating(r) {
    var gmax = Math.max.apply(null, r.groups.map(function (g) { return g.total; }).concat([0]));
    var smax = Math.max.apply(null, r.students.map(function (s) { return s.points; }).concat([0]));
    var gs = r.groups.slice().sort(function (a, b) { return a.place - b.place || a.group.localeCompare(b.group, 'uk'); });
    var myG = r.groups.filter(function (g) { return g.mine; })[0];
    var top = r.top || [], tmax = Math.max.apply(null, top.map(function (s) { return s.points; }).concat([0]));
    $('#rt-top').innerHTML = top.length ? topHtml(top.slice(0, 5)) : '';
    $('#rt-top-empty').hidden = top.length > 0;
    $('#rt-hero').innerHTML = heroHtml(r, myG);
    $('#rt-towers').innerHTML = groupsHtml(gs);
    $('#rt-title').textContent = 'Бригада ' + r.group;
    $('#rt-podium').innerHTML = '';
    $('#rt-podium').hidden = true;
    $('#rt-students').className = 'lb';
    $('#rt-students').innerHTML = r.students.map(function (s) {
      return lbRow(s.place, s.name, '', s.points, s.me);
    }).join('');
    $('#rt-empty').hidden = gmax > 0;
    show('v-rating');
  }

  function showRating() {
    api('rating', { group: viewGroup }).then(renderRating).catch(fail);
  }

  // Показ без входу на вигаданих даних: portal/?demo=rating (нічого не пишеться на сервер)
  function demoRating() {
    var names = ['Іваненко Іван', 'Коваль Марія', 'Мельник Тарас', 'Бондар Олена', 'Шевчук Дмитро', 'Ткач Андрій', 'Лисенко Катерина'];
    var pts = [86, 74, 61, 45, 32, 18, 6];
    renderRating({
      ok: true, group: 'АП-28',
      groups: [
        { group: 'АП-28', count: 7, total: 322, place: 1, mine: true }, { group: 'АП-29', count: 6, total: 251, place: 2, mine: false },
        { group: 'Б-21', count: 8, total: 251, place: 2, mine: false }, { group: 'Б-31', count: 5, total: 168, place: 4, mine: false },
        { group: 'Д-6', count: 4, total: 74, place: 5, mine: false }, { group: 'Д-7', count: 3, total: 0, place: 6, mine: false }
      ],
      students: names.map(function (n, i) { return { name: n, points: pts[i], place: i + 1, me: i === 1 }; }),
      me: { name: names[1], points: pts[1], place: 2, me: true },
      top: [{ name: 'Петренко Остап', group: 'Б-21', points: 112, place: 1 }, { name: names[0], group: 'АП-28', points: 86, place: 2, me: false },
        { name: 'Гнатюк Софія', group: 'АП-29', points: 80, place: 3 }, { name: names[1], group: 'АП-28', points: 74, place: 4, me: true },
        { name: 'Руденко Артем', group: 'Д-7', points: 70, place: 5 }]
    });
    say('Це демонстрація на вигаданих даних.');
  }

  $('#nav-rating').addEventListener('click', function (e) { e.preventDefault(); say(''); showRating(); });

  /* ---------- завдання ---------- */
  function mm(sec) { return window.PortalTasks.mmss(sec); }

  function renderTaskList(r) {
    var list = r.items || [];
    $('#tk-empty').hidden = true;
    $('#tk-list').innerHTML = list.map(function (t) {
      var st = t.done
        ? '<span class="tk-badge ok">Пройдено · ' + mm(t.seconds) + ' · ' + t.points + ' балів</span>'
        : '<span class="tk-badge">до ' + t.max + ' балів · ліміт ' + mm(t.limit) + '</span>';
      return '<li><button type="button" class="tk-card" data-task="' + esc(t.id) + '"><b>' + esc(t.name) + '</b>' + st + '</button></li>';
    }).join('') +
      '<li><button type="button" class="tk-card" data-hall="1"><b>Завдання 6 · Хол із п’яти кімнат</b><span class="tk-badge">ті самі 5 завдань у 3D · результати зберігаються</span></button></li>';
    show('v-tasks');
  }
  function showTasks() { api('tasks').then(renderTaskList).catch(fail); }

  var taskRun = null;
  function openTask(info, submit) {
    var box = $('#tk-box');
    $('#tk-title').textContent = info.name;
    show('v-task');
    taskRun = window.PortalTasks.run(box, info, { submit: submit, back: showTasks });
  }
  function startTask(id) {
    api('task_start', { task: id }).then(function (r) {
      r.id = id;
      openTask(r, function (answer) { return api('task_done', { task: id, answer: answer }, true); });
    }).catch(fail);
  }
  $('#tk-list').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-task]');
    if (b) startTask(b.getAttribute('data-task'));
  });
  // Завдання 6: 3D-хол із п'яти кімнат. Бали й час рахує сервер так само, як у списку завдань вище.
  window.PortalHall = {
    api: function (action, data) { return api(action, data, true); },
    token: function () { return token; },
    who: function () {
      var st = me && me.student;
      return { name: String((st && st.name) || 'Викладач').slice(0, 40), group: String((st && st.group) || '').slice(0, 12), owner: !!(me && me.isOwner) };
    },
    // теми для парт у кабінетах: назви лекцій і практичних групи поточного користувача
    lectures: function () {
      var strip = function (a) { return a.map(function (i) { return { id: i.id, title: String(i.title || ''), section: i.section || 'lec' }; }); };
      if (items && items.length) return Promise.resolve(strip(items));
      return api('lectures', { group: viewGroup }, true).then(function (r) { items = r.items || []; return strip(items); });
    },
    // частини теми для телевізора: {notes, deck, pdf(base64)}
    lectureParts: function (id) {
      var it = null; items.forEach(function (i) { if (i.id === id) it = i; });
      if (!it) return Promise.reject(new Error('no'));
      return getLecture(it, true).then(function (r) {
        if (r.kind === 'html') { var parts = comboParts(r.html); return parts ? { notes: parts.notes, deck: parts.deck, pdf: parts.pdf } : { notes: r.html, deck: '', pdf: '' }; }
        return { notes: '', deck: '', pdf: r.base64 || '' };
      });
    },
    // відкрити конспект/презентацію/PDF теми поверх хола
    openLecture: function (id) {
      var it = null; items.forEach(function (i) { if (i.id === id) it = i; });
      if (!it) return;
      var ov = document.getElementById('hall-lec');
      if (!ov) {
        ov = document.createElement('div'); ov.id = 'hall-lec';
        ov.style.cssText = 'position:fixed;inset:0;z-index:10000;background:#fff;overflow:auto;-webkit-overflow-scrolling:touch';
        ov.innerHTML = '<div style="position:sticky;top:0;z-index:2;display:flex;gap:10px;align-items:center;justify-content:space-between;padding:8px 12px;background:#111;color:#fff"><b id="hall-lec-t" style="font:600 15px/1.3 Georgia,serif"></b><button type="button" id="hall-lec-x" style="padding:8px 14px;font:15px Georgia,serif;background:#fff;color:#111;border:0;cursor:pointer">Закрити</button></div><div id="hall-lec-b" style="padding:10px 14px"></div>';
        document.body.appendChild(ov);
        ov.querySelector('#hall-lec-x').addEventListener('click', function () { ov.style.display = 'none'; ov.querySelector('#hall-lec-b').innerHTML = ''; });
      }
      ov.style.display = 'block'; ov.scrollTop = 0;
      ov.querySelector('#hall-lec-t').textContent = it.title;
      var box = ov.querySelector('#hall-lec-b'); box.innerHTML = '<p class="muted">Завантаження…</p>'; autoFrames = [];
      getLecture(it, true).then(function (r) {
        box.innerHTML = '';
        if (r.kind === 'html') {
          var parts = comboParts(r.html);
          if (parts) buildCombo(box, r.title, parts);
          else { var auto = /name=["']portal-height["']/.test(r.html); box.appendChild(makeFrame(r.title, auto ? withReporter(r.html) : r.html, auto)); }
        } else {
          if (blobUrl) URL.revokeObjectURL(blobUrl);
          var bin = atob(r.base64), bytes = new Uint8Array(bin.length);
          for (var k = 0; k < bin.length; k++) bytes[k] = bin.charCodeAt(k);
          blobUrl = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
          var pf = document.createElement('iframe'); pf.className = 'lec-frame'; pf.title = r.title; pf.src = blobUrl; box.appendChild(pf);
        }
      }).catch(function () { box.innerHTML = '<p class="muted">Не вдалося відкрити. Спробуйте ще раз.</p>'; });
    }
  };
  function openHall() {
    var ov = document.getElementById('hall-ov');
    if (!ov) {
      ov = document.createElement('div'); ov.id = 'hall-ov';
      ov.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#000';
      ov.innerHTML = '<iframe id="hall-frame" title="Хол" allow="fullscreen; microphone" style="display:block;width:100%;height:100%;border:0"></iframe>';
      document.body.appendChild(ov);
    }
    ov.hidden = false; ov.style.display = 'block';
    document.getElementById('hall-frame').src = 'hall/?v=29';
    // повний екран: запит іде з кліку студента; там, де браузер не дозволяє (iPhone), хол і так займає весь екран
    try { var rq = ov.requestFullscreen || ov.webkitRequestFullscreen; if (rq) { var pr = rq.call(ov); if (pr && pr.catch) pr.catch(function () {}); } } catch (e) { /* ігноруємо */ }
  }
  function closeHall() {
    var ov = document.getElementById('hall-ov');
    if (ov) { ov.style.display = 'none'; document.getElementById('hall-frame').src = 'about:blank'; }
    try { var fe = document.fullscreenElement || document.webkitFullscreenElement; if (fe) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); } } catch (e) { /* ігноруємо */ }
    showTasks();
  }
  $('#tk-list').addEventListener('click', function (e) {
    if (e.target.closest('button[data-hall]')) openHall();
  });
  window.addEventListener('message', function (e) {
    if (e.origin !== location.origin || !e.data || !e.data.hallExit) return;
    closeHall();
  });
  $('#tk-back').addEventListener('click', function () { showTasks(); });
  $('#nav-tasks').addEventListener('click', function (e) { e.preventDefault(); say(''); showTasks(); });

  // Показ без входу: portal/?demo=task (перевірка коду локально, на сервер нічого не йде)
  function demoTask() {
    var t0 = Date.now();
    var z6 = false, z5 = /[?&]demo=task5/.test(location.search), z4 = /[?&]demo=task4/.test(location.search), z3 = /[?&]demo=task3/.test(location.search), z2 = /[?&]demo=task2/.test(location.search), code = z5 ? '3472' : z4 ? '1001' : z3 ? '0302' : z2 ? '2016' : '84';
    openTask({ id: z6 ? 'z6' : z5 ? 'z5' : z4 ? 'z4' : z3 ? 'z3' : z2 ? 'z2' : 'z1', name: z5 ? 'Інженерна лабораторія' : z4 ? 'Склад' : z3 ? 'Лабораторія' : z2 ? 'Будмайданчик' : 'Майстерня', limit: (z5 || z6) ? 1080 : 600, max: 100, min: 10, elapsed: 0 }, function (answer) {
      return new Promise(function (res) {
        setTimeout(function () {
          var sec = Math.round((Date.now() - t0) / 1000);
          if (sec > ((z5 || z6) ? 1080 : 600)) { res({ ok: true, correct: false, expired: true, points: 0, seconds: sec }); return; }
          if (String(answer) !== code) { res({ ok: true, correct: false }); return; }
          res({ ok: true, correct: true, seconds: sec, points: window.PortalTasks.pointsNow({ limit: (z5 || z6) ? 1080 : 600, max: 100, min: 10 }, sec) });
        }, 300);
      });
    });
    say('Демонстрація: код ' + code + ', бали нікуди не записуються.');
  }

  /* ---------- кабінет викладача ---------- */
  var admStudents = [], admTasks = [];

  function fillAdminSelects() {
    var act = admStudents.filter(function (s) { return s.status === 'активний'; })
      .sort(function (a, b) { return (a.group + a.name).localeCompare(b.group + b.name, 'uk'); });
    var gopts = '<option value="">Усі групи</option>' + me.groups.map(function (g) { return '<option>' + esc(g) + '</option>'; }).join('');
    ['pts', 'rs'].forEach(function (p) {
      var gs = $('#' + p + '-group'), gk = gs.value, sel = $('#' + p + '-student'), keep = sel.value;
      gs.innerHTML = gopts;
      gs.value = me.groups.indexOf(gk) >= 0 ? gk : '';
      sel.innerHTML = act.filter(function (s) { return !gs.value || s.group === gs.value; }).map(function (s) {
        return '<option value="' + esc(s.email) + '">' + esc(s.group + ' · ' + s.name + ' · ' + s.points + ' б.') + '</option>';
      }).join('');
      if (keep) sel.value = keep;
    });
    var keepT = $('#rs-task').value;
    $('#rs-task').innerHTML = admTasks.map(function (t) { return '<option value="' + esc(t.id) + '">' + esc(t.name) + '</option>'; }).join('');
    if (keepT) $('#rs-task').value = keepT;
    showResetInfo();
  }

  function showResetInfo() {
    var em = $('#rs-student').value, id = $('#rs-task').value;
    var s = admStudents.filter(function (x) { return x.email === em; })[0];
    var d = s && s.tasks && s.tasks[id];
    $('#rs-btn').disabled = !d;
    var tv = $('#ts-val'); if (tv) tv.value = d ? d.points : '';
    $('#rs-info').textContent = !s || !id ? '' : d
      ? 'Пройдено: ' + window.PortalTasks.mmss(d.seconds) + ', ' + d.points + ' балів.'
      : 'Це завдання студент ще не здавав.';
  }
  $('#rs-student').addEventListener('change', showResetInfo);
  $('#rs-task').addEventListener('change', showResetInfo);

  var lastAdmin = null;
  function renderAdmin(r, tasks) {
    lastAdmin = { r: r, t: tasks };
    $('#adm-sheet').href = r.sheetUrl;
    $('#adm-folder').href = r.folderUrl;
    $('#adm-code').value = r.code;
    $('#adm-empty').hidden = r.students.length > 0;
    admStudents = r.students;
    admTasks = tasks || admTasks;
    fillAdminSelects();
    $('#add-group').innerHTML = me.groups.map(function (g) { return '<option>' + esc(g) + '</option>'; }).join('');
    var gsel = $('#adm-filter'), gkeep = gsel.value;
    gsel.innerHTML = '<option value="">Усі групи</option>' + me.groups.map(function (g) { return '<option>' + esc(g) + '</option>'; }).join('');
    gsel.value = me.groups.indexOf(gkeep) >= 0 ? gkeep : '';
    function gi(g) { var i = me.groups.indexOf(g); return i < 0 ? 999 : i; }
    var rows = r.students.filter(function (s) { return !gsel.value || s.group === gsel.value; })
      .sort(function (a, b) { return gi(a.group) - gi(b.group) || a.name.localeCompare(b.name, 'uk'); });
    $('#adm-body').innerHTML = rows.map(function (s) {
      var active = s.status === 'активний';
      return '<tr class="' + (active ? '' : 'blocked') + '"><td>' + esc(s.name) + '</td><td>' + esc(s.group) +
        '</td><td>' + esc(s.email) + '</td><td>' + s.done + '</td><td>' + s.points + '</td><td><button type="button" data-email="' +
        esc(s.email) + '" data-to="' + (active ? 'заблокований' : 'активний') + '">' +
        (active ? 'Закрити доступ' : 'Відновити') + '</button></td></tr>';
    }).join('');
    show('v-admin');
  }

  function showAdmin() {
    Promise.all([api('admin'), api('tasks', null, true).catch(function () { return { items: [] }; })])
      .then(function (a) { renderAdmin(a[0], a[1].items); }).catch(fail);
  }

  $('#adm-body').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-email]');
    if (!b) return;
    api('admin_status', { email: b.getAttribute('data-email'), status: b.getAttribute('data-to') })
      .then(showAdmin).catch(fail);
  });

  function refreshAdmin() {
    api('admin', null, true).then(function (r) { renderAdmin(r); }).catch(function () {});
  }

  // Змінити бали за одне завдання (решта балів студента не чіпається)
  $('#ts-btn').addEventListener('click', function () {
    var em = $('#rs-student').value, id = $('#rs-task').value, raw = $('#ts-val').value;
    var val = Number(raw);
    if (!em || !id || raw === '' || !isFinite(val) || val < 0 || val > 1000) { say('Оберіть студента й завдання та впишіть бали від 0 до 1000.', true); return; }
    var sel = $('#rs-student'), who = sel.options[sel.selectedIndex].textContent.split(' · ')[1];
    var old = ((admStudents.filter(function (x) { return x.email === em; })[0] || {}).tasks || {})[id];
    api('admin_task_set', { email: em, task: id, points: val }).then(function () {
      say('Бали змінено: ' + who + ', ' + val + '.'); refreshAdmin();
    }).catch(function (err) {
      // старий сервер ще не знає цієї дії: записуємо різницю окремим рядком (у рейтингу буде вірна сума)
      if (err && err.message === 'BAD_ACTION') {
        var delta = val - (old ? old.points : 0);
        if (!delta) { say('Бали вже такі.'); return; }
        api('admin_points', { email: em, task: 'Корекція: ' + ($('#rs-task').options[$('#rs-task').selectedIndex].textContent), points: delta })
          .then(function () { say('Бали змінено (сервер без оновлення: записано корекцію ' + (delta > 0 ? '+' : '') + delta + ').'); refreshAdmin(); }).catch(fail);
      } else fail(err);
    });
  });

  $('#rs-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var em = $('#rs-student').value, id = $('#rs-task').value;
    if (!em || !id) return;
    var who = $('#rs-student').options[$('#rs-student').selectedIndex].textContent.split(' · ')[1];
    api('admin_task_reset', { email: em, task: id }).then(function (r) {
      say('Результат скинуто: ' + who + '. Студент може пройти завдання знову.');
      refreshAdmin();
    }).catch(fail);
  });

  var ptsSign = 1;
  $('#pts-add').addEventListener('click', function () { ptsSign = 1; });
  $('#pts-sub').addEventListener('click', function () { ptsSign = -1; });
  $('#pts-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var sign = ptsSign; ptsSign = 1;
    var sel = $('#pts-student'), email = sel.value, task = $('#pts-task').value;
    var val = Math.abs(Number($('#pts-val').value));
    if (!email || !task.trim() || !(val > 0)) { say('Оберіть студента, напишіть завдання (або причину) і бали більше нуля.', true); return; }
    var who = sel.options[sel.selectedIndex].textContent.split(' · ').pop();
    api('admin_points', { email: email, task: task, points: sign * val }).then(function () {
      say((sign > 0 ? 'Додано ' : 'Знято ') + val + ' балів: ' + who + '.');
      $('#pts-val').value = '';
      refreshAdmin();
    }).catch(fail);
  });

  ['pts', 'rs'].forEach(function (p) {
    $('#' + p + '-group').addEventListener('change', function () { fillAdminSelects(); });
  });
  $('#adm-filter').addEventListener('change', function () { if (lastAdmin) renderAdmin(lastAdmin.r, lastAdmin.t); });
  $('#add-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var name = $('#add-name').value, email = $('#add-email').value, group = $('#add-group').value;
    if (!name.trim() || !email.trim()) { say('Впишіть ПІБ і пошту, оберіть групу.', true); return; }
    api('admin_add_student', { fullName: name, email: email, group: group }).then(function (r) {
      say((r.updated ? 'Дані оновлено: ' : 'Студента додано: ') + name.trim() + ', ' + group + '.');
      $('#add-name').value = ''; $('#add-email').value = '';
      refreshAdmin();
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
  if (/[?&]demo=loader/.test(location.search)) {
    var dl = 0;
    (function tick() {
      lastLoader = -1; var ico = $('#loader-ico'); ico.innerHTML = LOADERS[dl % LOADERS.length](); dl++;
      $('#loader').hidden = false; setTimeout(tick, 2500);
    })();
    show('v-login');
  } else if (/[?&]demo=task/.test(location.search)) {
    demoTask();
  } else if (/[?&]demo=rating/.test(location.search)) {
    demoRating();
  } else if (token) {
    boot();
    initGoogle();
  } else {
    show('v-login');
    initGoogle();
  }
})();
