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
  function api(action, data) {
    var body = JSON.stringify(Object.assign({ token: token, action: action }, data || {}));
    return fetch(CFG.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: body
    }).then(function (r) { return r.json(); }, function () {
      throw new Error('NETWORK');
    }).then(function (j) {
      if (!j.ok) throw new Error(j.error || 'NETWORK');
      return j;
    });
  }

  /* ---------- показ екранів і повідомлень ---------- */
  var VIEWS = ['v-login', 'v-register', 'v-home', 'v-lecture', 'v-admin'];

  function show(id) {
    VIEWS.forEach(function (v) { $('#' + v).hidden = (v !== id); });
    var loggedIn = id !== 'v-login';
    $('#nav-home').hidden = !loggedIn || id === 'v-register';
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
    me = null;
    try { sessionStorage.removeItem('portalToken'); } catch (e) { /* ігноруємо */ }
    if (window.google && google.accounts && google.accounts.id) {
      google.accounts.id.disableAutoSelect();
    }
    say(message || '', !!message);
    show('v-login');
    initGoogle();
  }

  /* ---------- старт ---------- */
  function boot() {
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
    loadLectures();
  }

  function loadLectures() {
    api('lectures', { group: viewGroup }).then(function (r) {
      items = r.items;
      renderHome();
      show('v-home');
    }).catch(fail);
  }

  function renderHome() {
    var done = items.filter(function (i) { return i.done; }).length;
    $('#tower').innerHTML = tower(done, items.length);
    $('#progress-text').textContent = items.length
      ? 'Опрацьовано тем: ' + done + ' з ' + items.length
      : '';
    var list = $('#lec-list');
    if (!items.length) {
      list.innerHTML = '<li class="lec-empty">Лекцій для цієї групи поки немає. Загляньте пізніше.</li>';
      return;
    }
    list.innerHTML = items.map(function (it, i) {
      return '<li class="' + (it.done ? 'done' : '') + '"><button type="button" data-i="' + i + '">' +
        '<span>' + esc(it.title) + '</span>' +
        '<span class="mark">' + (it.done ? 'опрацьовано' : 'не опрацьовано') + '</span></button></li>';
    }).join('');
  }

  $('#lec-list').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-i]');
    if (b) openLecture(items[+b.getAttribute('data-i')]);
  });

  $('#owner-group').addEventListener('change', function (e) {
    viewGroup = e.target.value;
    loadLectures();
  });

  /* ---------- перегляд лекції ---------- */
  function openLecture(it) {
    say('');
    current = it;
    $('#lec-title').textContent = it.title;
    $('#lec-body').innerHTML = '<p class="muted">Завантаження лекції…</p>';
    $('#lec-done').hidden = !!it.done;
    show('v-lecture');
    api('lecture', { id: it.id, group: viewGroup }).then(function (r) {
      var box = $('#lec-body');
      box.innerHTML = '';
      var frame = document.createElement('iframe');
      frame.className = 'lec-frame';
      frame.title = r.title;
      if (r.kind === 'html') {
        // sandbox без allow-same-origin: скрипти лекції не бачать ні токен, ні сторінку кабінету
        frame.setAttribute('sandbox', 'allow-scripts allow-popups');
        frame.srcdoc = r.html;
      } else {
        if (blobUrl) URL.revokeObjectURL(blobUrl);
        var bin = atob(r.base64), bytes = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        blobUrl = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
        frame.src = blobUrl;
        var a = document.createElement('p');
        a.className = 'muted';
        a.innerHTML = 'Якщо файл не відкрився на телефоні, <a target="_blank" rel="noopener" href="' + blobUrl + '">відкрийте його в новій вкладці</a>.';
        box.appendChild(a);
      }
      box.appendChild(frame);
    }).catch(fail);
  }

  $('#lec-back').addEventListener('click', function () { loadLectures(); });

  $('#lec-done').addEventListener('click', function () {
    if (!current) return;
    api('done', { id: current.id, title: current.title }).then(function () {
      current.done = true;
      say('Тему відмічено. Вежа виросла на поверх.');
      loadLectures();
    }).catch(fail);
  });

  /* ---------- кабінет викладача ---------- */
  function showAdmin() {
    api('admin').then(function (r) {
      $('#adm-sheet').href = r.sheetUrl;
      $('#adm-folder').href = r.folderUrl;
      $('#adm-code').value = r.code;
      $('#adm-empty').hidden = r.students.length > 0;
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
