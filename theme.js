(function () {
  var KEY = 'mech-bg', root = document.documentElement;
  var PRESETS = [['#ffffff', 'Біла'], ['#f4ecdc', 'Тепла'], ['#dfe3e8', 'Сіра'], ['#dcebdc', 'М’ятна'], ['#1a1a1a', 'Темна']];
  function rgb(h) { h = h.replace('#', ''); return [0, 2, 4].map(function (i) { return parseInt(h.substr(i, 2), 16); }); }
  function hex(c) { return '#' + c.map(function (v) { v = Math.round(v); return (v < 16 ? '0' : '') + v.toString(16); }).join(''); }
  function mix(a, b, t) { return hex(a.map(function (v, i) { return v + (b[i] - v) * t; })); }
  function lum(c) { var l = c.map(function (v) { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * l[0] + .7152 * l[1] + .0722 * l[2]; }
  function apply(color) {
    if (!color || color.toLowerCase() === '#ffffff') {
      root.classList.remove('themed', 't-dark');
      ['--t-bg', '--t-fg', '--t-mid', '--t-low', '--t-line', '--t-soft'].forEach(function (k) { root.style.removeProperty(k); });
      return;
    }
    var bg = rgb(color), L = lum(bg);
    var dark = (1.05 / (L + .05)) > ((L + .05) / .05); // чорний чи білий контрастніший
    var fg = dark ? [255, 255, 255] : [0, 0, 0];
    var s = root.style;
    s.setProperty('--t-bg', color);
    s.setProperty('--t-fg', hex(fg));
    s.setProperty('--t-mid', mix(fg, bg, .30));
    s.setProperty('--t-low', mix(fg, bg, .45));
    s.setProperty('--t-line', mix(fg, bg, .86));
    s.setProperty('--t-soft', mix(fg, bg, .93));
    root.classList.add('themed');
    root.classList.toggle('t-dark', dark);
  }
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  apply(saved);
  function build() {
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'th-btn'; btn.title = 'Колір фону'; btn.setAttribute('aria-label', 'Колір фону');
    var p = document.createElement('div'); p.className = 'th-panel'; p.hidden = true;
    p.innerHTML = '<b>Колір фону</b><div class="th-sw"></div><label class="th-own">Свій колір <input type="color"></label>';
    var sw = p.querySelector('.th-sw'), inp = p.querySelector('input');
    inp.value = saved || '#ffffff';
    function mark(c) { Array.prototype.forEach.call(sw.children, function (b) { b.classList.toggle('on', b.getAttribute('data-c') === (c || '#ffffff')); }); }
    function set(c) { apply(c); try { localStorage.setItem(KEY, c); } catch (e) {} mark(c); inp.value = c; }
    PRESETS.forEach(function (x) {
      var b = document.createElement('button'); b.type = 'button'; b.style.background = x[0]; b.title = x[1];
      b.setAttribute('data-c', x[0]); b.addEventListener('click', function () { set(x[0]); }); sw.appendChild(b);
    });
    inp.addEventListener('input', function () { set(inp.value); });
    mark(saved);
    btn.addEventListener('click', function () { p.hidden = !p.hidden; });
    document.addEventListener('click', function (e) { if (!p.hidden && !p.contains(e.target) && e.target !== btn) p.hidden = true; });
    document.body.appendChild(btn); document.body.appendChild(p);
  }
  if (document.body) build(); else document.addEventListener('DOMContentLoaded', build);
})();
