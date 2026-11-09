/* Интерфейс и хранение */
var S = {
  tab: 'build', lib: defaultExercises(), programs: [],
  form: { name: '', format: 'mine', goal: 'tone', level: 1, days: 3, minutes: 45, equip: ['t', 'd', 'r'], restr: [], pf: false, rounds: 3, variety: 2, focus: 'full' },
  history: [],
  lang: 'ru', progLang: '',
  current: null, armed: '', filter: { q: '', pat: '', vid: '' }, edit: null, text: null, status: 'local', canDownload: false
};
var Store = { ref: null, dl: null };
var $ = function (s) { return document.querySelector(s); };
function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function uid() { return 'p' + Date.now().toString(36) + Math.floor(Math.random() * 1000).toString(36); }

/* ---------- хранение ---------- */
var LIB_VER = 3;
var LANGS = [['ru', 'RU'], ['uk', 'UA'], ['fr', 'FR'], ['en', 'EN']];
var LOCALES = { ru: 'ru-RU', uk: 'uk-UA', fr: 'fr-FR', en: 'en-CA' };
function setLang(l) { S.lang = l; LANG = l; try { document.documentElement.lang = l; document.title = tr('app.title'); } catch (e) {} }
function serialize() { return JSON.stringify({ v: 1, libVer: LIB_VER, savedAt: Date.now(), lib: S.lib, programs: S.programs, form: S.form, lang: S.lang, history: S.history }); }
function applyData(raw) {
  var d = typeof raw === 'string' ? JSON.parse(raw) : raw;
  if (!d || !Array.isArray(d.lib) || !d.lib.length) return false;
  S.lib = d.lib; S.programs = Array.isArray(d.programs) ? d.programs : [];
  if ((d.libVer || 1) < LIB_VER) {
    var have = {}; S.lib.forEach(function (e) { have[e.id] = 1; });
    defaultExercises().forEach(function (e) { if (!have[e.id]) S.lib.push(e); });
  }
  var defs = {};
  defaultExercises().forEach(function (e) { defs[e.id] = e; });
  S.lib.forEach(function (e) {
    var df = defs[e.id];
    if (df) { ['n_uk', 'n_fr', 'n_en'].forEach(function (k) { if (e[k] == null || e[k] === '') e[k] = df[k]; }); }
    if (e.id === 'd117' && /^Планка с касанием плеч/.test(e.name) && e.name.indexOf('Погоны') < 0) e.name = df.name;
  });
  S.history = Array.isArray(d.history) ? d.history : [];
  if (d.form) S.form = Object.assign(S.form, d.form);
  if (d.lang && LANGS.some(function (l) { return l[0] === d.lang; })) setLang(d.lang);
  return true;
}
var saveTimer = null;
function persist() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(function () {
    var s = serialize();
    try { localStorage.setItem('trxbuilder.v1', s); } catch (e) {}
    if (Store.ref) { try { Promise.resolve(Store.ref.set({ json: s, savedAt: Date.now() })).catch(function () {}); } catch (e) {} }
  }, 350);
}
function loadLocal() {
  try { var r = localStorage.getItem('trxbuilder.v1'); if (r) return JSON.parse(r); } catch (e) {}
  return null;
}
async function initStore() {
  try {
    if (typeof claude === 'undefined' || !claude.use) return;
    var db = await claude.use('db'), user = await claude.use('user');
    if (db && user) {
      var id = await user.id();
      Store.ref = db.collection('data/users/' + id).doc('state');
      var snap = await Store.ref.get();
      var data = snap && (typeof snap.data === 'function' ? snap.data() : snap.data);
      if (snap && snap.exists === false) data = null;
      if (data && data.json) {
        var remote = JSON.parse(data.json), local = loadLocal();
        if (!local || (remote.savedAt || 0) >= (local.savedAt || 0)) { if (applyData(remote)) render(); }
      }
      S.status = 'account';
      persist();
    }
  } catch (e) { Store.ref = null; }
  try { var dl = await claude.use('downloads'); if (dl) { Store.dl = dl; S.canDownload = true; } } catch (e) {}
  render();
}

/* ---------- отрисовка ---------- */
var ICON = {
  t: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M2 2.5h12"/><path d="M5 2.5v7M11 2.5v7"/><rect x="3.4" y="9.5" width="3.2" height="4.5" rx="1.4"/><rect x="9.4" y="9.5" width="3.2" height="4.5" rx="1.4"/></svg>',
  d: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M5 8h6"/><rect x="2" y="5" width="3" height="6" rx="1"/><rect x="11" y="5" width="3" height="6" rx="1"/></svg>',
  r: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><ellipse cx="8" cy="8" rx="6" ry="3.6"/><ellipse cx="8" cy="8" rx="3" ry="1.5"/></svg>',
  b: ''
};
var ICO = {
  swap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h13l-3-3M20 16H7l3 3"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z"/></svg>'
};
function eqBadge(k) { return '<span class="eq ' + k + '">' + ICON[k] + esc(EQ_LABELS[k]) + '</span>'; }
function eqBadges(list) { return (list && list.length ? list : ['b']).map(eqBadge).join(''); }

function chips(list, selected, act, labels) {
  return list.map(function (k) {
    return '<button type="button" class="chip" data-act="' + act + '" data-k="' + esc(k) + '" aria-pressed="' + (selected.indexOf(k) >= 0) + '">' + esc(labels[k]) + '</button>';
  }).join('');
}
function segs(vals, cur, act, fmt) {
  return vals.map(function (v) {
    return '<button type="button" data-act="' + act + '" data-k="' + v + '" aria-pressed="' + (cur === v) + '">' + esc(fmt(v)) + '</button>';
  }).join('');
}
function opt(v, cur, label) { return '<option value="' + esc(v) + '"' + (String(cur) === String(v) ? ' selected' : '') + '>' + esc(label) + '</option>'; }
function buildView() {
  var f = S.form, mine = f.format === 'mine';
  var gopts = Object.keys(GOALS).map(function (k) { return opt(k, f.goal, GOALS[k].label); }).join('');
  var html = '<div class="card"><h2>' + esc(tr('f.title')) + '</h2>' +
    '<div class="field"><label for="f-name">' + esc(tr('f.name')) + '</label><input id="f-name" type="text" data-bind="name" value="' + esc(f.name) + '" placeholder="' + esc(tr('f.name.ph')) + '"></div>' +
    '<div class="field"><span class="lbl">' + esc(tr('f.format')) + '</span><div class="seg">' + ['mine', 'std'].map(function (k) { return '<button type="button" data-act="format" data-k="' + k + '" aria-pressed="' + (f.format === k) + '">' + esc(tr('f.format.' + k)) + '</button>'; }).join('') + '</div></div>' +
    (mine ? '<div class="field"><span class="lbl">' + esc(tr('f.focus')) + '</span><div class="seg">' + ['full', 'lower', 'upper'].map(function (k) { return '<button type="button" data-act="focus" data-k="' + k + '" aria-pressed="' + ((f.focus || 'full') === k) + '">' + esc(tr('focus.' + k)) + '</button>'; }).join('') + '</div></div>' : '') +
    (mine ? '<div class="field"><span class="lbl">' + esc(tr('f.rounds')) + '</span><div class="seg">' + segs([2, 3, 4], f.rounds || 3, 'rounds', String) + '</div></div>' +
      '<div class="field"><span class="lbl">' + esc(tr('f.variety')) + '</span><div class="seg">' + segs([1, 2, 3], f.variety || 2, 'variety', function (v) { return tr('var.' + v); }) + '</div><p class="hint" style="margin-top:8px">' + esc(tr('hint.variety')) + '</p></div>' : '') +
    '<div class="field"><label for="f-goal">' + esc(tr('f.goal')) + '</label><select id="f-goal" data-bind="goal">' + gopts + '</select></div>' +
    '<div class="field"><span class="lbl">' + esc(tr('f.level')) + '</span><div class="seg">' + segs([1, 2, 3], f.level, 'level', function (v) { return LEVELS[v]; }) + '</div></div>' +
    '<div class="field"><span class="lbl">' + esc(tr('f.days')) + '</span><div class="seg">' + segs([1, 2, 3, 4, 5], f.days, 'days', String) + '</div></div>' +
    '<div class="field"><span class="lbl">' + esc(tr('f.minutes')) + '</span><div class="seg">' + segs([30, 45, 60], f.minutes, 'minutes', String) + '</div></div>' +
    '<div class="field"><span class="lbl">' + esc(tr('f.equip')) + '</span><div class="seg">' + chips(['t', 'd', 'r'], f.equip, 'equip', EQ_LABELS) + '</div></div>' +
    '<div class="field"><span class="lbl">' + esc(tr('f.restr')) + '</span><div class="seg">' + chips(['k', 's', 'w', 'l', 'n', 'p'], f.restr, 'restr', CONTRA_LABELS) + '</div></div>' +
    '<div class="field"><span class="lbl">' + esc(tr('f.extra')) + '</span><div class="seg"><button type="button" class="chip" data-act="pf" aria-pressed="' + f.pf + '">' + esc(tr('f.pf')) + '</button></div></div>' +
    (S.history.length ? '<p class="hint" style="margin:0 0 12px">' + esc(tr('h.note', { n: S.history.length })) + '</p>' : '') +
    '<button type="button" class="btn primary" data-act="generate">' + esc(tr('f.generate')) + '</button></div>';
  if (S.current) html += programView(S.current);
  return html;
}
function textLang() { return S.progLang || S.lang; }
function programView(p) {
  var need = {};
  p.sessions.forEach(function (s) { s.blocks.forEach(function (b) { b.items.forEach(function (it) { (eqOf(it).length ? eqOf(it) : (it.eq || [])).forEach(function (k) { need[k] = 1; }); }); }); });
  var needList = ['t', 'd', 'r'].filter(function (k) { return need[k]; });
  var tl = textLang();
  var h = '<div class="card"><h2>' + esc(p.name || tr('p.default')) + '</h2>' +
    '<p class="hint">' + esc(tr('p.meta', { goal: GOALS[p.form.goal].label, level: LEVELS[p.form.level], days: p.form.days, min: p.form.minutes })) + '</p>' +
    '<div class="sum"><span class="lbl">' + esc(tr('p.need')) + '</span>' + eqBadges(needList) + '</div>' +
    '<p class="hint" style="margin-top:14px">' + esc(programHint(p)) + '</p>' +
    '<div class="row" style="margin-top:18px">' +
    '<button type="button" class="btn dark" data-act="save">' + esc(p.savedId ? tr('p.update') : tr('p.save')) + '</button>' +
    '<button type="button" class="btn" data-act="regen">' + esc(tr('p.regen')) + '</button>' +
    '<button type="button" class="btn" data-act="copy">' + esc(tr('p.copy')) + '</button>' +
    (S.canDownload ? '<button type="button" class="btn" data-act="download">' + esc(tr('p.dl')) + '</button>' : '') + '</div>' +
    '<div class="field" style="margin-top:14px"><span class="lbl">' + esc(tr('p.textlang')) + '</span><div class="seg">' + LANGS.map(function (l) { return '<button type="button" data-act="textlang" data-k="' + l[0] + '" aria-pressed="' + (tl === l[0]) + '">' + l[1] + '</button>'; }).join('') + '</div></div>';
  (p.warnings || []).forEach(function (w) { h += '<div class="warn">' + esc(warnText(w)) + '</div>'; });
  h += '</div>';
  p.sessions.forEach(function (s, si) {
    var title = sessionTitle(s).split('. ');
    h += '<div class="card sess"><div class="sess-h"><b>' + esc(title[0]) + '</b>' + (title[1] ? '<span>' + esc(title[1]) + '</span>' : '') + '</div><div class="sess-b">';
    s.blocks.forEach(function (b, bi) {
      var at0 = ' data-si="' + si + '" data-bi="' + bi + '"';
      h += '<div class="blk ' + esc(b.key) + '"><h4>' + esc(blockLabel(b)) + (b.rounds ? ' <span class="rnd">' + esc(tr('blk.rounds', { n: b.rounds })) + '</span>' : '') + '</h4>';
      if (b.style) h += '<div class="stl"><span class="stl-n">' + esc(styleLabel(b)) + '</span><span class="stl-d">' + esc(styleDesc(b)) + '</span>' +
        '<button type="button" class="ic" data-act="restyle"' + at0 + ' aria-label="' + esc(tr('a.style')) + '" title="' + esc(tr('a.style')) + '">' + ICO.swap + '</button></div>';
      b.items.forEach(function (it, ii) {
        var at = at0 + ' data-ii="' + ii + '"', eqs = eqOf(it).length ? eqOf(it) : (it.eq || []);
        h += '<div class="ex' + (eqs.indexOf('t') >= 0 ? ' trx' : '') + '"><span class="ex-n">' + (ii + 1) + '</span><div><div class="ex-name">' + esc(itemName(it, S.lib)) + '</div>' + proLine(it) +
          '<div class="ex-tags">' + eqBadges(eqs) + '</div><div class="ex-rx">' + esc(fmtItem(it, b)) + '</div>' +
          howLine(it) + (it.note ? '<div class="ex-note">' + esc(it.note) + '</div>' : '') + '</div><div class="ex-act">' +
          (it.url ? '<a class="ic vid" href="' + esc(it.url) + '" target="_blank" rel="noopener" aria-label="' + esc(tr('a.video')) + '">' + ICO.play + '</a>' : '') +
          '<button type="button" class="ic" data-act="swap"' + at + ' aria-label="' + esc(tr('a.swap')) + '">' + ICO.swap + '</button>' +
          '<button type="button" class="ic" data-act="remove"' + at + ' aria-label="' + esc(tr('a.remove')) + '">' + ICO.x + '</button></div></div>';
      });
      h += '</div>';
    });
    h += '</div></div>';
  });
  h += '<div class="card"><h2>' + esc(tr('prog.title')) + '</h2><ul class="prog">' +
    progression().map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('') + '</ul></div>';
  return h;
}
function proLine(it) {
  var ex = exByItem(it, S.lib), pro = ex ? exPro(ex) : '';
  if (!pro || pro.toLowerCase() === itemName(it, S.lib).toLowerCase()) return '';
  return '<div class="ex-pro">' + esc(pro) + '</div>';
}
function howLine(it) { var ex = exByItem(it, S.lib), h = ex ? exHow(ex) : ''; return h ? '<div class="ex-how">' + esc(h) + '</div>' : ''; }
function eqOf(it) { var e = S.lib.filter(function (x) { return x.id === it.exId; })[0]; return e ? e.eq : []; }
function historyCard() {
  var arm = S.armed === 'clearhist';
  var rows = S.history.slice(-5).reverse().map(function (h) {
    return '<div class="meta" style="padding:4px 0">' + esc(new Date(h.t).toLocaleDateString(LOCALES[S.lang]) + ' · ' + (h.focus === 'std' ? tr('f.format.std') : tr('focus.' + h.focus)) + (h.name ? ' · ' + h.name : '')) + '</div>';
  }).join('');
  return '<div class="card"><h2>' + esc(tr('h.title')) + '</h2><p class="hint">' + esc(tr('h.hint')) + '</p>' + (rows || '<div class="empty">' + esc(tr('h.empty')) + '</div>') +
    (S.history.length ? '<div class="row" style="margin-top:12px"><button type="button" class="btn danger' + (arm ? ' armed' : '') + '" data-act="clearhist">' + esc(arm ? tr('h.confirm') : tr('h.clear')) + '</button></div>' : '') + '</div>';
}
function clientsView() {
  if (!S.programs.length) return '<div class="card"><div class="empty">' + esc(tr('c.empty')) + '</div></div>' + historyCard();
  var list = S.programs.slice().sort(function (a, b) { return b.createdAt - a.createdAt; });
  return '<div class="card"><h2>' + esc(tr('c.title')) + '</h2>' + list.map(function (p) {
    var arm = S.armed === 'del:' + p.id;
    return '<div class="list-row" data-act="open" data-id="' + p.id + '"><div><div class="t">' + esc(p.name || tr('c.noname')) + '</div><div class="meta">' +
      esc(tr('c.meta', { goal: GOALS[p.form.goal].label, days: p.form.days, date: new Date(p.createdAt).toLocaleDateString(LOCALES[S.lang]) })) + '</div></div>' +
      '<button type="button" class="btn danger' + (arm ? ' armed' : '') + '" data-act="delprog" data-id="' + p.id + '">' + esc(arm ? tr('btn.confirmdel') : tr('btn.delete')) + '</button></div>';
  }).join('') + '</div>' + historyCard();
}
function baseView() {
  var withV = S.lib.filter(function (e) { return e.url; }).length;
  var pats = Object.keys(PAT_LABELS).map(function (k) { return opt(k, S.filter.pat, PAT_LABELS[k]); }).join('');
  return '<div class="card"><h2>' + esc(tr('b.title')) + '</h2><div class="stats"><div><b id="st-total">' + S.lib.length + '</b>' + esc(tr('b.total')) + '</div><div><b id="st-vid">' + withV + '</b>' + esc(tr('b.vid')) + '</div><div><b id="st-novid">' + (S.lib.length - withV) + '</b>' + esc(tr('b.novid')) + '</div></div>' +
    '<div class="field" style="margin-top:14px"><label for="b-q">' + esc(tr('b.search')) + '</label><input id="b-q" type="text" data-bind="fq" value="' + esc(S.filter.q) + '" placeholder="' + esc(tr('b.search.ph')) + '"></div>' +
    '<div class="row"><select id="b-pat" data-bind="fpat" aria-label="' + esc(tr('e.group')) + '" style="flex:1"><option value="">' + esc(tr('b.allgroups')) + '</option>' + pats + '</select>' +
    '<select id="b-vid" data-bind="fvid" aria-label="' + esc(tr('a.video')) + '" style="flex:1"><option value="">' + esc(tr('b.all')) + '</option>' + opt('no', S.filter.vid, tr('b.novidopt')) + opt('yes', S.filter.vid, tr('b.vidopt')) + '</select></div>' +
    '<div class="row" style="margin-top:12px"><button type="button" class="btn dark" data-act="addex">' + esc(tr('b.add')) + '</button></div></div>' +
    '<div class="card" id="base-list">' + baseRows() + '</div>';
}
function baseRows() {
  var q = S.filter.q.trim().toLowerCase();
  var rows = S.lib.filter(function (e) {
    if (q && [e.name, e.n_uk, e.n_fr, e.n_en].join('|').toLowerCase().indexOf(q) < 0) return false;
    if (S.filter.pat && e.pat !== S.filter.pat) return false;
    if (S.filter.vid === 'no' && e.url) return false;
    if (S.filter.vid === 'yes' && !e.url) return false;
    return true;
  });
  if (!rows.length) return '<div class="empty">' + esc(tr('b.none')) + '</div>';
  return rows.map(function (e) {
    var eq = '<div class="ex-tags" style="margin-top:6px">' + eqBadges(e.eq) + '</div>';
    var co = e.contra.map(function (k) { return '<span class="pill">' + esc(tr('b.without', { x: CONTRA_SHORT[k] })) + '</span>'; }).join('');
    return '<div class="list-row" data-act="editex" data-id="' + esc(e.id) + '"><div><div class="t">' + esc(exName(e)) + '</div><div class="meta">' + esc(PAT_LABELS[e.pat]) + ' · ' + esc(tr('b.level', { n: e.lvl })) + '</div>' + eq + '<div>' + co + '</div></div>' +
      '<span class="pill ' + (e.url ? 'ok' : 'none') + '">' + esc(e.url ? tr('b.hasvid') : tr('b.nov')) + '</span></div>';
  }).join('');
}
function backupView() {
  return '<div class="card"><h2>' + esc(tr('k.title')) + '</h2><p class="hint">' + esc(tr('k.hint', { status: tr('status.' + S.status) })) + '</p>' +
    '<div class="row" style="margin:12px 0"><button type="button" class="btn dark" data-act="exportcopy">' + esc(tr('k.copy')) + '</button>' +
    (S.canDownload ? '<button type="button" class="btn" data-act="exportdl">' + esc(tr('k.dl')) + '</button>' : '') + '</div>' +
    '<div class="field"><label for="imp">' + esc(tr('k.restore')) + '</label><textarea id="imp" placeholder="' + esc(tr('k.paste')) + '"></textarea></div>' +
    '<div class="row"><button type="button" class="btn' + (S.armed === 'import' ? ' armed' : '') + '" data-act="import">' + esc(S.armed === 'import' ? tr('k.confirmload') : tr('k.load')) + '</button></div></div>' +
    '<div class="card"><h2>' + esc(tr('k.reset.title')) + '</h2><p class="hint">' + esc(tr('k.reset.hint')) + '</p>' +
    '<div class="row" style="margin-top:12px"><button type="button" class="btn danger' + (S.armed === 'reset' ? ' armed' : '') + '" data-act="resetlib">' + esc(S.armed === 'reset' ? tr('k.confirmreset') : tr('k.reset')) + '</button></div></div>';
}
function modalHtml() {
  if (S.text) {
    return '<div class="modal-bg" data-act="closemodal"><div class="modal" role="dialog" aria-modal="true"><h2 style="margin-top:0">' + esc(S.text.title) + '</h2>' +
      '<p class="hint">' + esc(tr('modal.select')) + '</p><textarea id="modal-text" readonly style="min-height:260px">' + esc(S.text.body) + '</textarea>' +
      '<div class="row" style="margin-top:12px"><button type="button" class="btn dark" data-act="closemodal">' + esc(tr('btn.close')) + '</button></div></div></div>';
  }
  if (S.edit) {
    var d = S.edit.draft;
    var eqs = ['t', 'd', 'r'].map(function (k) { return '<label><input type="checkbox" data-bind="e-eq" data-k="' + k + '"' + (d.eq.indexOf(k) >= 0 ? ' checked' : '') + '>' + esc(EQ_LABELS[k]) + '</label>'; }).join('');
    var cos = Object.keys(CONTRA_SHORT).map(function (k) { return '<label><input type="checkbox" data-bind="e-co" data-k="' + k + '"' + (d.contra.indexOf(k) >= 0 ? ' checked' : '') + '>' + esc(tr('b.without', { x: CONTRA_SHORT[k] })) + '</label>'; }).join('');
    var pats = Object.keys(PAT_LABELS).map(function (k) { return opt(k, d.pat, PAT_LABELS[k]); }).join('');
    var lv = [1, 2, 3].map(function (k) { return opt(k, d.lvl, LEVELS[k]); }).join('');
    var un = Object.keys(UNIT_LABELS).map(function (k) { return opt(k, d.unit, UNIT_LABELS[k]); }).join('');
    var nm = function (id, bind, lab, val) { return '<div class="field"><label for="' + id + '">' + esc(lab) + '</label><input id="' + id + '" type="text" data-bind="' + bind + '" value="' + esc(val) + '"></div>'; };
    return '<div class="modal-bg" data-act="closemodal"><div class="modal" role="dialog" aria-modal="true"><h2 style="margin-top:0">' + esc(S.edit.id ? tr('e.title') : tr('e.new')) + '</h2>' +
      nm('e-name', 'e-name', tr('e.name') + ' (RU)', d.name) + nm('e-nuk', 'e-nuk', tr('e.name') + ' (UA)', d.n_uk || '') + nm('e-nfr', 'e-nfr', tr('e.name') + ' (FR)', d.n_fr || '') + nm('e-nen', 'e-nen', tr('e.name') + ' (EN)', d.n_en || '') +
      '<div class="field"><label for="e-pat">' + esc(tr('e.group')) + '</label><select id="e-pat" data-bind="e-pat">' + pats + '</select></div>' +
      '<div class="field"><span class="lbl">' + esc(tr('e.equip')) + '</span><div class="checks">' + eqs + '</div></div>' +
      '<div class="field"><label for="e-lvl">' + esc(tr('e.level')) + '</label><select id="e-lvl" data-bind="e-lvl">' + lv + '</select></div>' +
      '<div class="field"><label for="e-unit">' + esc(tr('e.unit')) + '</label><select id="e-unit" data-bind="e-unit">' + un + '</select></div>' +
      '<div class="field"><span class="lbl">' + esc(tr('e.contra')) + '</span><div class="checks">' + cos + '</div></div>' +
      '<div class="field"><label for="e-url">' + esc(tr('e.url')) + '</label><input id="e-url" type="url" data-bind="e-url" value="' + esc(d.url) + '" placeholder="https://"></div>' +
      '<div class="field"><label for="e-pro">' + esc(tr('e.pro')) + '</label><input id="e-pro" type="text" data-bind="e-pro" value="' + esc(d.pro || '') + '"></div>' +
      LANGS.map(function (l) { return '<div class="field"><label for="e-how-' + l[0] + '">' + esc(tr('e.how')) + ' (' + l[1] + ')</label><textarea id="e-how-' + l[0] + '" data-bind="e-how" data-k="' + l[0] + '" style="min-height:64px;font-family:inherit;font-size:16px">' + esc(d['how_' + l[0]] || '') + '</textarea></div>'; }).join('') +
      '<div class="field"><label for="e-note">' + esc(tr('e.note')) + '</label><textarea id="e-note" data-bind="e-note" style="min-height:70px;font-family:inherit;font-size:16px">' + esc(d.note) + '</textarea></div>' +
      '<div class="row between"><div class="row"><button type="button" class="btn dark" data-act="saveex">' + esc(tr('btn.save')) + '</button><button type="button" class="btn" data-act="closemodal">' + esc(tr('btn.cancel')) + '</button></div>' +
      (S.edit.id ? '<button type="button" class="btn danger' + (S.armed === 'delex' ? ' armed' : '') + '" data-act="delex">' + esc(S.armed === 'delex' ? tr('btn.confirmdel') : tr('btn.delete')) + '</button>' : '') + '</div></div></div>';
  }
  return '';
}
function render() {
  var tabs = ['build', 'clients', 'base', 'backup'];
  var body = S.tab === 'build' ? buildView() : S.tab === 'clients' ? clientsView() : S.tab === 'base' ? baseView() : backupView();
  var sw = '<div class="langs" role="group" aria-label="' + esc(tr('lang.label')) + '">' + LANGS.map(function (l) { return '<button type="button" data-act="lang" data-k="' + l[0] + '" aria-pressed="' + (S.lang === l[0]) + '">' + l[1] + '</button>'; }).join('') + '</div>';
  $('#hero').innerHTML = '<div class="hero"><svg class="straps" viewBox="0 0 200 200" fill="none" stroke="#B49CDB" stroke-width="3" stroke-linecap="round"><path d="M20 0h160" stroke-width="5"/><path d="M70 0C70 70 52 110 46 150"/><path d="M130 0c0 70 18 110 24 150"/><rect x="34" y="150" width="24" height="38" rx="12" stroke="#F0820B" stroke-width="4"/><rect x="142" y="150" width="24" height="38" rx="12" stroke="#F0820B" stroke-width="4"/></svg>' +
    '<div class="wrap">' + sw + '<p class="mark">TRX Flow.Her</p><h1 class="brand">' + esc(tr('app.title')) + '</h1><p class="sub">' + esc(tr('app.sub')) + '</p>' +
    '<div class="legend">' + eqBadge('t') + eqBadge('d') + eqBadge('r') + eqBadge('b') + '</div></div></div>';
  var nav = '<nav class="tabs" role="tablist">' + tabs.map(function (t) { return '<button type="button" role="tab" data-act="tab" data-k="' + t + '" aria-selected="' + (S.tab === t) + '">' + esc(tr('tab.' + t)) + '</button>'; }).join('') + '</nav>';
  $('#app').innerHTML = nav + body;
  $('#modal').innerHTML = modalHtml();
  if (S.text) { var ta = $('#modal-text'); if (ta) { ta.focus(); ta.select(); } }
}

/* ---------- действия ---------- */
function arm(key, fn) {
  if (S.armed === key) { S.armed = ''; fn(); return; }
  S.armed = key; render();
  setTimeout(function () { if (S.armed === key) { S.armed = ''; render(); } }, 4000);
}
function toggle(arr, k) { var i = arr.indexOf(k); if (i >= 0) arr.splice(i, 1); else arr.push(k); }
function generate(seed, isRegen) {
  var f = JSON.parse(JSON.stringify(S.form));
  var keep = S.current && S.current.savedId;
  var base = S.history.slice();
  if (isRegen && S.lastLogged && base.length && base[base.length - 1].t === S.lastLogged) base.pop();
  var res = generateProgram(S.lib, f, seed || Date.now(), base);
  S.current = { name: f.name.trim(), form: f, sessions: res.sessions, warnings: res.warnings, savedId: keep ? S.current.savedId : null, createdAt: Date.now() };
  var he = historyEntry(S.current, f); S.history = base.concat([he]).slice(-30); S.lastLogged = he.t;
  S.armed = ''; persist(); render();
}
function openText(title, body) { S.text = { title: title, body: body }; render(); }
async function copyOrShow(title, text) {
  try { await navigator.clipboard.writeText(text); toast(tr('toast.copied')); }
  catch (e) { openText(title, text); }
}
function toast(msg) {
  var t = document.createElement('div'); t.textContent = msg; t.setAttribute('role', 'status');
  t.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:var(--primary);color:var(--on-primary);padding:10px 16px;border-radius:999px;font-weight:600;z-index:30';
  document.body.appendChild(t); setTimeout(function () { t.remove(); }, 1800);
}
async function saveFile(name, text, fallbackTitle) {
  try { await Store.dl.save({ filename: name, data: new Blob([text], { type: 'text/plain;charset=utf-8' }) }); }
  catch (e) { openText(fallbackTitle, text); }
}
function newDraft() { return { pro: '', how_ru: '', how_uk: '', how_fr: '', how_en: '', name: '', n_uk: '', n_fr: '', n_en: '', eq: [], pat: 'squat', lvl: 1, unit: 'r', contra: [], url: '', note: '' }; }

document.addEventListener('click', function (ev) {
  var el = ev.target.closest('[data-act]'); if (!el) return;
  var act = el.getAttribute('data-act'), k = el.getAttribute('data-k'), id = el.getAttribute('data-id');
  if (el.tagName === 'A') return;
  if (act === 'closemodal') { if (ev.target !== el && el.classList.contains('modal-bg')) return; S.text = null; S.edit = null; S.armed = ''; render(); return; }
  if (act === 'delprog') { ev.stopPropagation(); arm('del:' + id, function () { S.programs = S.programs.filter(function (p) { return p.id !== id; }); if (S.current && S.current.savedId === id) S.current.savedId = null; persist(); render(); }); return; }
  switch (act) {
    case 'tab': S.tab = k; S.armed = ''; render(); window.scrollTo(0, 0); break;
    case 'format': S.form.format = k; persist(); render(); break;
    case 'focus': S.form.focus = k; persist(); render(); break;
    case 'clearhist': arm('clearhist', function () { S.history = []; S.lastLogged = 0; persist(); render(); }); break;
    case 'rounds': S.form.rounds = parseInt(k, 10); persist(); render(); break;
    case 'variety': S.form.variety = parseInt(k, 10); persist(); render(); break;
    case 'lang': setLang(k); persist(); render(); break;
    case 'textlang': S.progLang = k; render(); break;
    case 'restyle': if (!restyle(S.lib, S.current.form, S.current, +el.dataset.si, +el.dataset.bi, Date.now())) toast(tr('toast.noalt')); persist(); render(); break;
    case 'level': S.form.level = parseInt(k, 10); persist(); render(); break;
    case 'days': S.form.days = parseInt(k, 10); persist(); render(); break;
    case 'minutes': S.form.minutes = parseInt(k, 10); persist(); render(); break;
    case 'equip': toggle(S.form.equip, k); persist(); render(); break;
    case 'restr': toggle(S.form.restr, k); persist(); render(); break;
    case 'pf': S.form.pf = !S.form.pf; persist(); render(); break;
    case 'generate': S.lastLogged = 0; generate(); setTimeout(function () { var c = document.querySelector('.card + .card'); if (c && c.scrollIntoView) c.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 50); break;
    case 'regen': generate(0, true); break;
    case 'copy': copyOrShow(tr('modal.text'), programToText(S.current, S.lib, textLang())); break;
    case 'download': saveFile('programma-' + (S.current.name || 'trenirovok').replace(/[^\wа-яА-ЯёЁ-]+/g, '_') + '.txt', programToText(S.current, S.lib, textLang()), tr('modal.text')); break;
    case 'save':
      if (S.current.savedId) { S.programs = S.programs.map(function (p) { return p.id === S.current.savedId ? Object.assign({}, S.current, { id: p.id, createdAt: Date.now() }) : p; }); }
      else { var np = Object.assign({}, S.current, { id: uid(), createdAt: Date.now() }); S.current.savedId = np.id; S.programs.push(np); }
      persist(); render(); toast(tr('toast.saved')); break;
    case 'swap': var ok = swapItem(S.lib, S.current.form, S.current, +el.dataset.si, +el.dataset.bi, +el.dataset.ii, Date.now()); if (!ok) toast(tr('toast.noalt')); persist(); render(); break;
    case 'remove': S.current.sessions[+el.dataset.si].blocks[+el.dataset.bi].items.splice(+el.dataset.ii, 1); persist(); render(); break;
    case 'open': var pr = S.programs.filter(function (p) { return p.id === id; })[0]; if (pr) { S.current = JSON.parse(JSON.stringify(pr)); S.current.savedId = pr.id; S.form = Object.assign(S.form, JSON.parse(JSON.stringify(pr.form)), { name: pr.name || '' }); S.tab = 'build'; render(); window.scrollTo(0, 0); } break;
    case 'addex': S.edit = { id: null, draft: newDraft() }; render(); break;
    case 'editex': var ex = S.lib.filter(function (e) { return e.id === id; })[0]; if (ex) { var dr = JSON.parse(JSON.stringify(ex)); dr.pro = exPro(ex); LANGS.forEach(function (l) { dr['how_' + l[0]] = exHow(ex, l[0]); }); S.edit = { id: id, draft: dr }; render(); } break;
    case 'saveex':
      var d = S.edit.draft; if (!d.name.trim()) { toast(tr('toast.needname')); break; }
      d.name = d.name.trim();
      if (S.edit.id) { S.lib = S.lib.map(function (e) { return e.id === S.edit.id ? Object.assign({}, d, { id: e.id }) : e; }); }
      else { d.id = 'c' + Date.now().toString(36); S.lib.push(d); }
      S.edit = null; persist(); render(); break;
    case 'delex': arm('delex', function () { S.lib = S.lib.filter(function (e) { return e.id !== S.edit.id; }); S.edit = null; persist(); render(); }); break;
    case 'exportcopy': copyOrShow(tr('modal.backup'), serialize()); break;
    case 'exportdl': saveFile('konstruktor-kopiya.json', serialize(), tr('modal.backup')); break;
    case 'import': arm('import', function () {
      try { var raw = ($('#imp').value || '').trim(); if (!applyData(raw)) throw new Error('bad'); persist(); render(); toast(tr('toast.imported')); }
      catch (e) { render(); toast(tr('toast.badcode')); } }); break;
    case 'resetlib': arm('reset', function () { S.lib = defaultExercises(); persist(); render(); toast(tr('toast.reset')); }); break;
  }
});
document.addEventListener('input', function (ev) {
  var b = ev.target.getAttribute && ev.target.getAttribute('data-bind'); if (!b) return;
  var v = ev.target.value;
  if (b === 'name') { S.form.name = v; persist(); }
  else if (b === 'fq') { S.filter.q = v; $('#base-list').innerHTML = baseRows(); }
  else if (b === 'e-name') S.edit.draft.name = v;
  else if (b === 'e-pro') S.edit.draft.pro = v;
  else if (b === 'e-how') S.edit.draft['how_' + ev.target.getAttribute('data-k')] = v;
  else if (b === 'e-nuk') S.edit.draft.n_uk = v;
  else if (b === 'e-nfr') S.edit.draft.n_fr = v;
  else if (b === 'e-nen') S.edit.draft.n_en = v;
  else if (b === 'e-url') S.edit.draft.url = v.trim();
  else if (b === 'e-note') S.edit.draft.note = v;
});
document.addEventListener('change', function (ev) {
  var t = ev.target, b = t.getAttribute && t.getAttribute('data-bind'); if (!b) return;
  if (b === 'goal') { S.form.goal = t.value; persist(); }
  else if (b === 'fpat') { S.filter.pat = t.value; $('#base-list').innerHTML = baseRows(); }
  else if (b === 'fvid') { S.filter.vid = t.value; $('#base-list').innerHTML = baseRows(); }
  else if (b === 'e-pat') S.edit.draft.pat = t.value;
  else if (b === 'e-lvl') S.edit.draft.lvl = parseInt(t.value, 10);
  else if (b === 'e-unit') S.edit.draft.unit = t.value;
  else if (b === 'e-eq') toggle(S.edit.draft.eq, t.getAttribute('data-k'));
  else if (b === 'e-co') toggle(S.edit.draft.contra, t.getAttribute('data-k'));
});
document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && (S.edit || S.text)) { S.edit = null; S.text = null; render(); } });

(function boot() {
  var l = loadLocal(); if (l) { try { applyData(l); } catch (e) {} }
  setLang(S.lang);
  render();
  initStore();
})();
