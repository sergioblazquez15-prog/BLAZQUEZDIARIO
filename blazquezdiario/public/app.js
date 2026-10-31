/* Blazquezdiario — app (sin librerías) */
(function () {
'use strict';

/* ================= utilidades ================= */
var $ = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function clone(o) { return o == null ? o : JSON.parse(JSON.stringify(o)); }
function pad(n) { return String(n).padStart(2, '0'); }
function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
function parseK(k) { var a = k.split('-').map(Number); return new Date(a[0], a[1] - 1, a[2]); }
function sod(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
function uid(p) { return (p || 'x') + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
var MES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
var MESC = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
var DL = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
var DLARGO = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábados', 'Domingos'];
var MOODS = ['😣', '😕', '😐', '🙂', '😄'];
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function fmt(n, dec) { dec = dec || 0; var neg = n < 0; n = Math.abs(n); var p = n.toFixed(dec).split('.'); var i = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.'); return (neg ? '−' : '') + i + (p[1] ? ',' + p[1] : ''); }
function eur(n, dec) { if (dec == null) dec = Math.abs(Math.round(n) - n) > 0.001 ? 2 : 0; return fmt(n, dec) + ' €'; }
function num(s) { s = String(s == null ? '' : s).trim().replace(/\s|€/g, ''); if (!s) return NaN; if (s.indexOf(',') >= 0) s = s.replace(/\./g, '').replace(',', '.'); return parseFloat(s); }
function tint(hex, a) { var n = parseInt(String(hex || '#888888').slice(1), 16); return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')'; }
function isoWeek(d) { var t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); var dn = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - dn); var y = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)); return Math.ceil(((t - y) / 864e5 + 1) / 7); }
function monthStart(off) { var n = new Date(); return new Date(n.getFullYear(), n.getMonth() + off, 1); }
function mprefix(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1); }
function dim(d) { return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(); }
function relDay(k) { var t = ymd(new Date()), y = ymd(addDays(new Date(), -1)); if (k === t) return 'hoy'; if (k === y) return 'ayer'; var d = parseK(k); return d.getDate() + ' ' + MESC[d.getMonth()]; }
function longDay(k) { var d = parseK(k); var r = relDay(k); var base = DIAS[d.getDay()] + ' ' + d.getDate() + ' de ' + MES[d.getMonth()]; return cap((r === 'hoy' || r === 'ayer') ? r + ' · ' + base : base); }

/* ================= iconos ================= */
var ICONS = {
  check: 'M5 12.5l4.5 4.5L19 7.5',
  flame: 'M12 3c.8 3.2 4.5 5.2 4.5 9.6a4.5 4.5 0 0 1-9 0c0-2 1-3.3 2.2-4.4.1 1.9 1 3 2.3 3.2-.2-2.9-.9-5.3 0-8.4z',
  dumbbell: 'M6.5 7v10M3.5 9.5v5M17.5 7v10M20.5 9.5v5M6.5 12h11',
  book: 'M5 4.5h10.5A3.5 3.5 0 0 1 19 8v12H8.5A3.5 3.5 0 0 1 5 16.5zM5 16.5A3.5 3.5 0 0 1 8.5 13H19',
  moon: 'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z',
  food: 'M12 7.5c-2-1.8-7-1.6-7 4 0 4.6 2.8 8.5 4.8 8.5 1 0 1.3-.5 2.2-.5s1.2.5 2.2.5c2 0 4.8-3.9 4.8-8.5 0-5.6-5-5.8-7-4zM12 7.5c0-2 .8-3.3 2.8-4',
  pill: 'M10.6 3.9a4.9 4.9 0 0 1 6.9 6.9l-6.7 6.7a4.9 4.9 0 0 1-6.9-6.9zM7.3 10.6l6.1 6.1',
  run: 'M14.5 4.5a1.5 1.5 0 1 0 0 .01M9 20.5l2.3-5 3 2.2v3.8M6.5 11.5l3.2-2.8 4.1 1 2 3h3.2M11.3 15.5l1.2-5.2',
  pen: 'M4 20h4.2L19.4 8.8a2.4 2.4 0 0 0-3.4-3.4L4.8 16.6z',
  lang: 'M4 5.5h9M8.5 3.5v2M6.3 5.5c.5 3.7 3 6.5 6.2 7.7M10.8 5.5c-.6 3.4-3.2 6.6-6.3 7.8M13.5 20.5l3.7-8.5 3.8 8.5M14.8 17.6h4.8',
  drop: 'M12 3.5s6 6.8 6 11a6 6 0 0 1-12 0c0-4.2 6-11 6-11z',
  ball: 'M12 3a9 9 0 1 0 .01 0M12 7.5l3.8 2.8-1.5 4.5H9.7l-1.5-4.5z',
  video: 'M3.5 6.5h11v11h-11zM14.5 10.5l6-3.2v9.4l-6-3.2',
  piggy: 'M4.8 11.2C4.8 7.8 8 5.5 11.8 5.5c2.7 0 5 1.1 6.1 2.8h2.1v4.4h-1.6a6 6 0 0 1-2.6 3.4V19h-3v-2.2h-3V19h-3v-3.4a5.8 5.8 0 0 1-2-4.4zM15.5 10.5h.01',
  plane: 'M3 13.5l18-8.5-5.5 15-3.2-6.3zM12.3 13.7L21 5',
  star: 'M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9l-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z',
  heart: 'M12 20s-7.5-4.6-7.5-10.2A4.2 4.2 0 0 1 12 7.3a4.2 4.2 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z',
  briefcase: 'M3.5 8h17v11.5h-17zM9 8V5h6v3M3.5 13h17',
  target: 'M12 3a9 9 0 1 0 .01 0M12 7.5a4.5 4.5 0 1 0 .01 0M12 11.5a.5.5 0 1 0 .01 0',
  wallet: 'M4 7.5h15.5v12H4zM4 7.5l11.5-3.5v3.5M15.5 13.5h1.5',
  checkc: 'M12 3a9 9 0 1 0 .01 0M8 12.3l2.8 2.8L16.2 9.6',
  calendar: 'M4 6h16v14H4zM4 10h16M8.5 3.5V7M15.5 3.5V7',
  edit: 'M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4',
  plus: 'M12 5v14M5 12h14',
  x: 'M6 6l12 12M18 6L6 18',
  gear: 'M12 9a3 3 0 1 0 .01 0M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1',
  arrowdown: 'M7 7l10 10M17 9v8H9',
  arrowup: 'M7 17L17 7M9 7h8v8',
  right: 'M9 6l6 6-6 6',
  music: 'M9 18V5l11-2v13M9 18a3 3 0 1 1-.01 0M20 16a3 3 0 1 1-.01 0',
  home: 'M4 11l8-6.5 8 6.5V20H4z',
  car: 'M5 16.5h14M5 16.5v-4l2-5h10l2 5v4M5 16.5v2.5M19 16.5v2.5M7.5 13h.01M16.5 13h.01',
  sun: 'M12 8a4 4 0 1 0 .01 0M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4',
  mail: 'M3.5 6h17v12h-17zM3.5 6l8.5 7 8.5-7',
  chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  bulb: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z',
  download: 'M12 4v11M7 10l5 5 5-5M4 20h16',
  upload: 'M12 20V9M7 14l5-5 5 5M4 4h16',
  logout: 'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10',
  phone: 'M7 3h10v18H7zM11 18h2',
  search: 'M11 4a7 7 0 1 0 .01 0M20 20l-4-4'
};
var ICON_KEYS = ['dumbbell', 'run', 'heart', 'food', 'pill', 'drop', 'moon', 'sun', 'book', 'pen', 'lang', 'ball', 'video', 'music', 'mail', 'bulb', 'piggy', 'wallet', 'briefcase', 'calendar', 'home', 'car', 'plane', 'star'];
var COLORS = ['#e8875a', '#e9b44c', '#74c69d', '#7aa7e8', '#a99be8', '#e8798f', '#5fc4c0', '#c9a96e'];
function ic(n, c) { return '<svg class="' + (c || 'i') + '" viewBox="0 0 24 24"><path d="' + (ICONS[n] || ICONS.star) + '"/></svg>'; }

/* ================= hábitos propuestos ================= */
var SRC = {
  oms: { t: 'OMS 2020 · actividad física', u: 'https://bjsm.bmj.com/content/54/24/1451' },
  pasos: { t: 'Lancet Public Health 2025 · pasos diarios', u: 'https://pubmed.ncbi.nlm.nih.gov/40713949/' },
  prote: { t: 'Br J Sports Med 2018 · proteína y fuerza', u: 'https://pubmed.ncbi.nlm.nih.gov/28698222/' },
  sueno: { t: 'AASM/SRS 2015 · horas de sueño', u: 'https://www.aasm.org/resources/pdf/adultsleepdurationconsensus.pdf' },
  plan: { t: 'Gollwitzer y Sheeran · planes «si… entonces…»', u: 'https://www.frontiersin.org/articles/10.3389/fpsyg.2021.565202/full' },
  foco: { t: 'Gloria Mark (UC Irvine) · interrupciones', u: 'https://www.rhythmsystems.com/blog/hold-on-the-productivity-and-employee-engagement-cost-of-interruptions' }
};
var SUG_CATS = [['fit', 'Forma física'], ['emp', 'Empresa'], ['mente', 'Cabeza y descanso']];
var SUGGESTIONS = [
  { id: 's_fuerza', cat: 'fit', name: 'Entrenar fuerza', icon: 'dumbbell', color: '#e8875a', days: [0, 2, 4], cue: 'Al salir de MSH, antes de cenar', why: 'La OMS recomienda trabajar fuerza con los grandes grupos musculares al menos 2 días por semana. Con lunes, miércoles y viernes vas sobrado.', src: 'oms' },
  { id: 's_pasos', cat: 'fit', name: '7.000 pasos', icon: 'run', color: '#74c69d', days: [], cue: '', why: 'Un meta-análisis de 57 estudios relacionó 7.000 pasos al día con bastante menos riesgo de muerte y de enfermedad cardiovascular que 2.000. A partir de ahí, la ganancia extra es pequeña: no hace falta obsesionarse con los 10.000.', src: 'pasos' },
  { id: 's_cardio', cat: 'fit', name: '30 min de cardio', icon: 'heart', color: '#e8798f', days: [0, 1, 2, 3, 4], cue: '', why: 'La OMS pide entre 150 y 300 minutos semanales de actividad moderada. 30 minutos cinco días cumple el mínimo (bici, correr, nadar o caminar rápido).', src: 'oms' },
  { id: 's_prote', cat: 'fit', name: 'Proteína en cada comida', icon: 'food', color: '#e9b44c', days: [], cue: '', why: 'Si entrenas fuerza, llegar a unos 1,6 g de proteína por kilo al día ayuda a ganar músculo; por encima de eso apenas suma. Repartirla en cada comida lo hace fácil.', src: 'prote' },
  { id: 's_sueno', cat: 'fit', name: 'Dormir 7 h o más', icon: 'moon', color: '#a99be8', days: [], cue: 'Móvil cargando fuera del cuarto', why: 'Los expertos en sueño recomiendan 7 horas o más a los adultos. Dormir menos se asocia a peor rendimiento, más errores y más riesgo de accidentes (vas mucho en coche).', src: 'sueno' },
  { id: 's_movil', cat: 'fit', name: 'Movilidad 10 min', icon: 'sun', color: '#5fc4c0', days: [], cue: 'Nada más levantarte', why: 'Caderas y espalda sueltas después de horas de coche, entregas y banquillo. Pegado a algo fijo de la mañana es difícil que se te olvide.' },
  { id: 's_alcohol', cat: 'fit', name: 'Sin alcohol entre semana', icon: 'drop', color: '#7aa7e8', days: [0, 1, 2, 3], cue: '', why: 'Duermes mejor, recuperas mejor del entreno y te ahorras calorías vacías. De lunes a jueves es un buen punto de partida.' },
  { id: 's_plan', cat: 'emp', name: 'Planificar mañana: Las 3', icon: 'pen', color: '#7aa7e8', days: [], cue: 'Antes de cerrar el portátil', why: 'Decidir qué harás, cuándo y dónde (un plan «si es X, entonces hago Y») tuvo un efecto medio-grande sobre conseguir objetivos en un meta-análisis de 94 estudios. Rellena Las 3 de mañana antes de acostarte.', src: 'plan' },
  { id: 's_foco', cat: 'emp', name: 'Bloque de foco 90 min', icon: 'briefcase', color: '#5fc4c0', days: [0, 1, 2, 3, 4], cue: 'Primera hora, WhatsApp en silencio', why: 'En un estudio con trabajadores de oficina, tras una interrupción se tardaba de media unos 23 minutos en volver a la tarea. Un bloque sin móvil para ofertas, diseño o números cunde muchísimo más.', src: 'foco' },
  { id: 's_msgs', cat: 'emp', name: 'WhatsApp y email en 3 franjas', icon: 'mail', color: '#e9b44c', days: [0, 1, 2, 3, 4], cue: '10:00 · 14:00 · 18:00', why: 'Agrupar los mensajes en franjas evita estar cambiando de tarea cada pocos minutos. Clientes y familias siguen teniendo respuesta en el día.' },
  { id: 's_prosp', cat: 'emp', name: '1 contacto comercial nuevo', icon: 'briefcase', color: '#e8875a', days: [0, 1, 2, 3, 4], cue: 'Justo después del bloque de foco', why: 'Un club o empresa nueva para MSH, o un posible patrocinador para ADNB, cada día laborable: unos 20 al mes. La constancia gana a los arreones.' },
  { id: 's_semana', cat: 'emp', name: 'Revisión semanal', icon: 'calendar', color: '#a99be8', days: [6], cue: 'Domingo por la tarde, 30 min', why: 'Pedidos y cobros de MSH, agenda de ADNB y Villar, cómo van los objetivos del año y Las 3 del lunes. La pestaña Resumen te lo da hecho.' },
  { id: 's_cobros', cat: 'emp', name: 'Revisar cobros pendientes', icon: 'piggy', color: '#74c69d', days: [4], cue: 'Viernes al cerrar', why: 'Una vez por semana, mirar qué falta por cobrar y reclamarlo. En una distribuidora, la caja manda.' },
  { id: 's_gastos', cat: 'emp', name: 'Apuntar los gastos del día', icon: 'wallet', color: '#c9a96e', days: [], cue: 'Al llegar a casa', why: 'Treinta segundos en la pestaña Dinero. Si lo apuntas a diario, a fin de mes no hay sorpresas.' },
  { id: 's_leer', cat: 'emp', name: 'Leer 20 min', icon: 'book', color: '#e9b44c', days: [], cue: 'En la cama, en vez del móvil', why: 'Negocio, liderazgo o entrenamiento. Veinte minutos al día dan para bastantes libros al año, y te ayuda a soltar pantallas antes de dormir.' },
  { id: 's_aprender', cat: 'emp', name: '15 min de formación', icon: 'bulb', color: '#7aa7e8', days: [0, 1, 2, 3, 4], cue: '', why: 'IA, ventas, inglés o metodología. Poco y a diario se acumula: te viene bien para Jarvis, los canales de YouTube y las apps.' },
  { id: 's_manana', cat: 'mente', name: 'Sin móvil la primera media hora', icon: 'sun', color: '#e8875a', days: [], cue: 'Móvil en modo avión hasta desayunar', why: 'Empiezas el día con tus prioridades y no con las de los demás. Primero Las 3, luego WhatsApp.' },
  { id: 's_noche', cat: 'mente', name: 'Pantallas fuera a las 23:30', icon: 'moon', color: '#a99be8', days: [], cue: 'Alarma a las 23:15', why: 'El mejor aliado de las 7 horas de sueño. Deja el móvil cargando fuera del cuarto.' },
  { id: 's_diario', cat: 'mente', name: 'Nota del día', icon: 'pen', color: '#c9a96e', days: [], cue: 'Antes de dormir', why: 'Tres líneas en la nota de la pestaña Hoy: qué salió bien, qué mejorar y cómo estás. Luego lo ves en el Resumen del mes.' },
  { id: 's_paseo', cat: 'mente', name: 'Paseo sin móvil 15 min', icon: 'run', color: '#74c69d', days: [], cue: 'Después de comer', why: 'Despejas la cabeza y sumas pasos a la vez. Muchas ideas salen andando.' },
  { id: 's_desc', cat: 'mente', name: 'Una tarde libre a la semana', icon: 'heart', color: '#e8798f', days: [6], cue: 'Elige tú el día', why: 'Descansar también se planifica: así no se acumula todo para agosto. Sin MSH, sin club, sin ordenador.' }
];

/* ================= estado + API ================= */
var S = { db: null, route: 'hoy', gm: 0, gfilter: 'all', gq: '', rmode: 'mes', rm: -0, ry: new Date().getFullYear(), gy: new Date().getFullYear(), sgcat: 'fit', after: [] };

function api(method, url, body) {
  return fetch(url, { method: method, credentials: 'same-origin', headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined })
    .then(function (r) {
      if (r.status === 401 && url !== '/api/login') { showLogin(); throw new Error('login'); }
      return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || 'Error'); return j; });
    });
}
function failed(e) { if (e && e.message !== 'login') toast('No se pudo guardar: ' + (e.message || 'sin conexión')); }
function putDoc(name) { return api('PUT', '/api/doc/' + name, { value: S.db[name] }).catch(failed); }
var dayTimers = {};
function putDay(kind, date, value, delay) {
  var k = kind + date; clearTimeout(dayTimers[k]);
  dayTimers[k] = setTimeout(function () { api('PUT', '/api/day/' + kind + '/' + date, { value: value }).then(function () { var s = $('#noteSaved'); if (s && kind === 'notes') s.textContent = 'Guardado'; }).catch(failed); }, delay || 0);
}
function load() {
  return api('GET', '/api/state').then(function (d) {
    S.db = d;
    ['habits', 'tx', 'recurring', 'goals'].forEach(function (k) { if (!Array.isArray(S.db[k])) S.db[k] = []; });
    ['habitLog', 'top3', 'notes'].forEach(function (k) { if (!S.db[k] || typeof S.db[k] !== 'object') S.db[k] = {}; });
    S.db.cats = S.db.cats || { expense: [], income: [] };
    S.db.cats.expense = S.db.cats.expense || []; S.db.cats.income = S.db.cats.income || [];
    S.db.settings = S.db.settings || {};
    document.body.classList.remove('login');
    render();
  });
}

/* ================= lógica de hábitos ================= */
function habits() { return S.db.habits.filter(function (h) { return !h.archived; }); }
function done(k, id) { var a = S.db.habitLog[k]; return !!(a && a.indexOf(id) >= 0); }
function sched(h, d) { if (!h.days || !h.days.length) return true; return h.days.indexOf((d.getDay() + 6) % 7) >= 0; }
function active(h, k) { return !h.since || h.since <= k; }
function streak(h) {
  var today = sod(new Date()), d = today, n = 0, guard = 0, tk = ymd(today);
  while (guard++ < 3000) {
    var k = ymd(d);
    if (!active(h, k) && !done(k, h.id)) break;
    if (done(k, h.id)) n++;
    else if (sched(h, d) && k !== tk) break;
    d = addDays(d, -1);
  }
  return n;
}
function bestRun(h, from, to) {
  var d = from, run = 0, best = 0, tk = ymd(new Date());
  while (d <= to) { var k = ymd(d); if (done(k, h.id)) { run++; if (run > best) best = run; } else if (sched(h, d) && k !== tk && active(h, k)) run = 0; d = addDays(d, 1); }
  return best;
}
function record(h) {
  var ks = Object.keys(S.db.habitLog).filter(function (k) { return done(k, h.id); }).sort();
  if (!ks.length) return 0;
  return bestRun(h, parseK(ks[0]), sod(new Date()));
}
function dayFrac(d, list) {
  var k = ymd(d), hs = (list || habits()).filter(function (h) { return active(h, k) && sched(h, d); });
  if (!hs.length) return null;
  var n = hs.filter(function (h) { return done(k, h.id); }).length;
  return { n: n, t: hs.length, f: n / hs.length };
}
function rangeStats(from, to) {
  var today = sod(new Date()); if (to > today) to = today;
  var d = from, n = 0, t = 0, perfect = 0, days = 0, per = {};
  habits().forEach(function (h) { per[h.id] = { n: 0, t: 0 }; });
  while (d <= to) {
    var k = ymd(d), f = dayFrac(d);
    if (f) { n += f.n; t += f.t; days++; if (f.n === f.t) perfect++; }
    habits().forEach(function (h) { if (active(h, k) && sched(h, d)) { per[h.id].t++; if (done(k, h.id)) per[h.id].n++; } });
    d = addDays(d, 1);
  }
  return { n: n, t: t, pct: t ? Math.round(100 * n / t) : null, perfect: perfect, days: days, per: per };
}

/* ================= lógica de dinero ================= */
function catList(type) { return S.db.cats[type === 'income' ? 'income' : 'expense']; }
function catOf(id, type) { var c = catList(type).filter(function (x) { return x.id === id; })[0]; return c || { id: '_', name: type === 'income' ? 'Otros ingresos' : 'Otros', color: '#8f847c', budget: 0 }; }
function txIn(prefix) { return S.db.tx.filter(function (t) { return String(t.date).indexOf(prefix) === 0; }); }
function sums(list) { var e = 0, i = 0; list.forEach(function (t) { if (t.type === 'income') i += +t.amount || 0; else e += +t.amount || 0; }); return { exp: e, inc: i, bal: i - e }; }
function budget() { var b = +S.db.settings.budget || 0; return b || S.db.cats.expense.reduce(function (a, c) { return a + (+c.budget || 0); }, 0); }
function paidThisMonth(r) { var p = mprefix(new Date()); return S.db.tx.some(function (t) { return t.recId === r.id && String(t.date).indexOf(p) === 0; }); }

/* ================= render ================= */
function render() {
  if (!S.db) return;
  var r = (location.hash || '#hoy').slice(1) || 'hoy';
  if (['hoy', 'gastos', 'habitos', 'objetivos', 'resumen'].indexOf(r) < 0) r = 'hoy';
  S.route = r;
  $$('.tabs a').forEach(function (a) { a.classList.toggle('on', a.getAttribute('data-r') === r); });
  S.after = [];
  var html = r === 'hoy' ? viewHoy() : r === 'gastos' ? viewGastos() : r === 'habitos' ? viewHabitos() : r === 'objetivos' ? viewObjetivos() : viewResumen();
  $('#app').innerHTML = html;
  S.after.forEach(function (f) { try { f(); } catch (e) { console.error(e); } });
}

/* ---------- HOY ---------- */
function viewHoy() {
  var now = new Date(), tk = ymd(now), st = S.db.settings;
  var h = now.getHours(), sal = h < 6 ? 'Buenas noches' : h < 13 ? 'Buenos días' : h < 21 ? 'Buenas tardes' : 'Buenas noches';
  var hs = habits().filter(function (x) { return active(x, tk) && sched(x, now); });
  var dh = hs.filter(function (x) { return done(tk, x.id); }).length;
  var items = (S.db.top3[tk] || []).filter(function (x) { return x && x.text; });
  var dt = items.filter(function (x) { return x.done; }).length;
  var tot = hs.length + items.length, pct = tot ? Math.round(100 * (dh + dt) / tot) : 0;
  var word = tot === 0 ? 'Día en blanco' : pct === 0 ? 'A arrancar' : pct < 40 ? 'Poco a poco' : pct < 75 ? 'Buen ritmo' : pct < 100 ? 'Casi lo tienes' : 'Día redondo';
  var C = 2 * Math.PI * 31, off = C * (1 - pct / 100);
  var head = '<div class="top"><div><div class="date">' + cap(DIAS[now.getDay()]) + ', ' + now.getDate() + ' de ' + MES[now.getMonth()] + ' · semana ' + isoWeek(now) + '</div>' +
    '<h1>' + sal + ', <em>' + esc(st.name || 'Sergio') + '</em></h1>' +
    '<button class="focus" data-act="editHead">Foco de la semana: ' + (st.focus ? '<b>' + esc(st.focus) + '</b>' : '<span class="link">ponte uno</span>') + '</button></div>' +
    '<div class="ringcard"><div class="ringwrap"><svg width="76" height="76" viewBox="0 0 76 76"><circle cx="38" cy="38" r="31" fill="none" stroke="#2b2420" stroke-width="6"/>' +
    '<circle cx="38" cy="38" r="31" fill="none" stroke="#e8875a" stroke-width="6" stroke-linecap="round" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '" transform="rotate(-90 38 38)"/></svg>' +
    '<span>' + pct + '<small>%</small></span></div><div class="ringtxt"><div class="k">Tu día</div><div class="v">' + word + '</div><div class="s">' + (dh + dt) + ' de ' + tot + ' cosas hechas</div></div></div></div>';

  // las 3
  var raw = S.db.top3[tk] || [], arr = [0, 1, 2].map(function (i) { return raw[i] || { text: '', done: false }; });
  var filled = arr.filter(function (x) { return x.text; }).length, n3 = arr.filter(function (x) { return x.text && x.done; }).length;
  var t3 = arr.map(function (it, i) {
    var d = it.text && it.done;
    return '<div class="t3' + (d ? ' done' : '') + '"><span class="num">' + (i + 1) + '</span>' +
      (d ? '<span class="t3t">' + esc(it.text) + '</span>' : '<input class="t3in" data-i="' + i + '" data-date="' + tk + '" value="' + esc(it.text) + '" placeholder="Escribe una prioridad…" maxlength="90" enterkeyhint="done">') +
      '<button class="chk' + (d ? ' on' : '') + '" data-act="t3done" data-i="' + i + '" data-date="' + tk + '"' + (it.text ? '' : ' disabled') + ' aria-label="Hecho">' + ic('check') + '</button></div>';
  }).join('');
  var q = st.quote || 'Lo que haces cada día pesa más que lo que haces de vez en cuando.';
  var tomorrow = ymd(addDays(now, 1)), tmr = (S.db.top3[tomorrow] || []).filter(function (x) { return x && x.text; }).length;
  var cardT3 = '<section class="card c5"><div class="ch">' + ic('target') + '<h2>Las 3 de hoy</h2><span class="pill ml' + (filled && n3 === filled ? ' ok' : '') + '">' + n3 + ' de ' + (filled || 3) + '</span></div>' +
    '<p class="sub">Si solo haces esto, el día ha valido la pena.</p>' + t3 +
    '<button class="more" data-act="planTomorrow">' + ic('calendar') + (tmr ? 'Mañana ya tienes ' + tmr + ' planificada' + (tmr === 1 ? '' : 's') : 'Planificar Las 3 de mañana') + '</button>' +
    '<div class="quote" data-act="editHead">«' + esc(q) + '»' + (st.quoteBy ? '<small>' + esc(st.quoteBy) + '</small>' : '') + '</div></section>';

  // hábitos de hoy
  var all = habits();
  var hl = all.length ? all.map(function (x) {
    var on = done(tk, x.id), sc = sched(x, now), cur = streak(x);
    return '<div class="th"' + (sc ? '' : ' style="opacity:.5"') + '><span class="hico" style="background:' + tint(x.color, .16) + ';color:' + x.color + '">' + ic(x.icon) + '</span>' +
      '<div class="hn"><b>' + esc(x.name) + '</b><small>' + (sc ? (x.cue ? esc(x.cue) : (cur ? 'Racha de ' + cur + ' día' + (cur === 1 ? '' : 's') : 'Hoy toca')) : 'Hoy descansa') + '</small></div>' +
      '<span class="streak' + (cur > 0 ? ' hot' : '') + '">' + ic('flame') + cur + '</span>' +
      '<button class="bigchk" style="' + (on ? 'background:' + x.color + ';border-color:' + x.color + ';color:#1a1410' : '') + '" data-act="hab" data-h="' + esc(x.id) + '" data-k="' + tk + '" aria-label="' + esc(x.name) + '">' + ic('check') + '</button></div>';
  }).join('') : '<div class="empty">Aún no tienes hábitos.<br><a class="link" href="#habitos">Mira los que te propongo</a></div>';
  var cardH = '<section class="card c7"><div class="ch">' + ic('checkc') + '<h2>Hábitos de hoy</h2><span class="pill ml' + (hs.length && dh === hs.length ? ' ok' : '') + '">' + dh + ' de ' + hs.length + '</span></div>' + hl +
    '<a class="more" href="#habitos">Ver semana, rachas y propuestas ' + ic('right') + '</a></section>';

  // dinero del mes (mini)
  var mp = mprefix(now), sm = sums(txIn(mp)), b = budget(), dm = dim(now), dl = dm - now.getDate() + 1;
  var mline = b ? (b - sm.exp >= 0 ? 'Te quedan <b>' + eur(b - sm.exp) + '</b> · unos <b>' + eur(Math.floor((b - sm.exp) / dl)) + '/día</b>' : 'Te has pasado <b>' + eur(sm.exp - b) + '</b>') : '<span class="link" data-act="moneySettings">Pon tu presupuesto</span>';
  var cardM = '<section class="card c5"><div class="ch">' + ic('wallet') + '<h2>Dinero de ' + MES[now.getMonth()] + '</h2></div>' +
    '<div class="big">' + eur(sm.exp) + (b ? '<small>de ' + eur(b) + '</small>' : '') + '</div><div class="mline">' + mline + '</div>' +
    (b ? '<div class="bar" style="height:8px;margin-bottom:14px"><i style="width:' + Math.min(100, sm.exp / b * 100).toFixed(1) + '%;background:' + (sm.exp > b ? 'var(--bad)' : 'var(--acc)') + '"></i></div>' : '') +
    '<div class="stat" style="margin-bottom:8px">Ingresos <b class="okc">' + eur(sm.inc) + '</b></div><div class="stat">Balance <b class="' + (sm.bal >= 0 ? 'okc' : 'badc') + '">' + (sm.bal >= 0 ? '+' : '') + eur(sm.bal) + '</b></div>' +
    '<div class="row" style="margin-top:14px"><button class="wbtn" data-act="addTx" data-type="expense">' + ic('plus') + 'Gasto</button><button class="obtn" data-act="addTx" data-type="income">' + ic('plus') + 'Ingreso</button><a class="more ml" style="margin-top:0" href="#gastos">Ver todo ' + ic('right') + '</a></div></section>';

  // objetivos (mini)
  var y = now.getFullYear(), gs = S.db.goals.filter(function (g) { return (g.year || y) === y; }).slice(0, 4);
  var cardG = '<section class="card c7"><div class="ch">' + ic('target') + '<h2>Objetivos ' + y + '</h2><span class="pill ml">Llevas el ' + Math.round(yearFrac(y, now) * 100) + ' % del año</span></div>' +
    (gs.length ? gs.map(function (g) { return goalRow(g, now, true); }).join('') : '<div class="empty"><span class="link" data-act="addGoal">Añade tu primer objetivo</span></div>') +
    '<a class="more" href="#objetivos">Todos los objetivos ' + ic('right') + '</a></section>';

  // nota del día
  var note = S.db.notes[tk] || {};
  var cardN = '<section class="card c12"><div class="ch">' + ic('pen') + '<h2>¿Cómo ha ido el día?</h2><span class="mutc ml" style="font-size:12px">Se guarda solo</span></div>' +
    '<div class="moods">' + MOODS.map(function (m, i) { return '<button class="' + (note.mood === i + 1 ? 'on' : '') + '" data-act="mood" data-v="' + (i + 1) + '" data-date="' + tk + '" aria-label="Ánimo ' + (i + 1) + '">' + m + '</button>'; }).join('') + '</div>' +
    '<textarea class="in" id="noteText" data-date="' + tk + '" placeholder="Qué ha salido bien, qué mejorarías mañana…">' + esc(note.text || '') + '</textarea><div class="saved" id="noteSaved"></div></section>';

  return head + '<div class="grid">' + cardT3 + cardH + cardM + cardG + cardN + '</div>';
}

/* ---------- DINERO ---------- */
function viewGastos() {
  var now = new Date(), base = monthStart(S.gm), isCur = S.gm === 0, mp = mprefix(base), d = dim(base);
  var day = isCur ? now.getDate() : (S.gm > 0 ? 0 : d);
  var list = txIn(mp), sm = sums(list), b = budget();
  var prev = sums(txIn(mprefix(monthStart(S.gm - 1))));
  function delta(a, bb, invert) { if (!bb) return ''; var p = Math.round((a - bb) / bb * 100); if (!isFinite(p) || p === 0) return '<div class="d">Igual que el mes anterior</div>'; var good = invert ? p < 0 : p > 0; return '<div class="d ' + (good ? 'okc' : 'badc') + '">' + (p > 0 ? '+' : '') + p + ' % vs mes anterior</div>'; }
  var savings = sm.inc ? Math.round(sm.bal / sm.inc * 100) : null;
  var kpis = '<div class="kpis">' +
    '<div class="kpi"><div class="k"><span class="dot" style="background:var(--ok)"></span>Ingresos</div><div class="v">' + eur(sm.inc) + '</div>' + delta(sm.inc, prev.inc) + '</div>' +
    '<div class="kpi"><div class="k"><span class="dot" style="background:var(--bad)"></span>Gastos</div><div class="v">' + eur(sm.exp) + '</div>' + delta(sm.exp, prev.exp, true) + '</div>' +
    '<div class="kpi"><div class="k">Balance</div><div class="v ' + (sm.bal >= 0 ? 'okc' : 'badc') + '">' + (sm.bal > 0 ? '+' : '') + eur(sm.bal) + '</div></div>' +
    '<div class="kpi"><div class="k">Ahorro</div><div class="v">' + (savings == null ? '—' : savings + ' %') + '</div><div class="d">de lo que entra</div></div></div>';

  // presupuesto + gráfico
  var unpaid = isCur ? S.db.recurring.filter(function (r) { return r.type !== 'income' && !paidThisMonth(r); }) : [];
  var forecast = sm.exp + unpaid.reduce(function (a, r) { return a + (+r.amount || 0); }, 0);
  var line;
  if (isCur && b) { var left = b - sm.exp, dl = d - day + 1; line = left >= 0 ? 'Te quedan <b>' + eur(left) + '</b> para ' + dl + ' día' + (dl === 1 ? '' : 's') + ' · unos <b>' + eur(Math.floor(left / dl)) + ' al día</b>.' : 'Te has pasado <b>' + eur(-left) + '</b> del presupuesto.'; }
  else if (isCur) line = '<span class="link" data-act="moneySettings">Pon tu presupuesto</span> y te digo cuánto te queda cada día.';
  else line = (S.gm > 0 ? 'Mes futuro' : 'Mes cerrado') + (b && S.gm < 0 ? ' · ' + (sm.exp <= b ? 'te sobraron ' + eur(b - sm.exp) : 'te pasaste ' + eur(sm.exp - b)) : '');
  var fc = isCur && (b || unpaid.length) ? '<span class="fc' + (b && forecast > b ? ' bad' : '') + '">' + ic(b && forecast > b ? 'arrowup' : 'arrowdown') + 'Previsión: ' + eur(forecast) + '</span>' : '';
  var perDay = []; for (var i = 0; i < d; i++) perDay.push(0);
  list.forEach(function (t) { if (t.type === 'income') return; var dd = parseInt(String(t.date).slice(8, 10), 10); if (dd >= 1 && dd <= d) perDay[dd - 1] += +t.amount || 0; });
  var cum = [], acc = 0; for (i = 0; i < Math.max(day, 0); i++) { acc += perDay[i]; cum.push(acc); }
  var chartData = { dim: d, day: day, cum: cum, budget: b, forecast: forecast, isCur: isCur, mon: MESC[base.getMonth()] };
  S.after.push(function () { drawCum($('#cumChart'), chartData); });

  // categorías
  var by = {}; list.forEach(function (t) { if (t.type === 'income') return; var c = catOf(t.cat, 'expense').id; by[c] = (by[c] || 0) + (+t.amount || 0); });
  var cl = S.db.cats.expense.slice(); if (by._) cl.push(catOf('_', 'expense'));
  cl.sort(function (a, c) { return (by[c.id] || 0) - (by[a.id] || 0); });
  var catHTML = cl.map(function (c) {
    var s = by[c.id] || 0, bb = +c.budget || 0, over = bb && s > bb, w = bb ? Math.min(100, s / bb * 100) : (sm.exp ? s / sm.exp * 100 : 0);
    return '<div class="cat"><div class="top1"><span class="dot" style="background:' + c.color + '"></span>' + esc(c.name) + '<span class="amt' + (over ? ' over' : '') + '">' + eur(s) + (bb ? ' <small>/ ' + eur(bb) + '</small>' : '') + '</span></div><div class="bar"><i style="width:' + w.toFixed(1) + '%;background:' + (over ? 'var(--bad)' : c.color) + '"></i></div></div>';
  }).join('') || '<div class="empty"><span class="link" data-act="moneySettings">Crea tus categorías</span></div>';
  var incBy = {}; list.forEach(function (t) { if (t.type !== 'income') return; var c = catOf(t.cat, 'income'); incBy[c.id] = incBy[c.id] || { c: c, v: 0 }; incBy[c.id].v += +t.amount || 0; });
  var incHTML = Object.keys(incBy).map(function (k) { var o = incBy[k]; return '<div class="cat"><div class="top1"><span class="dot" style="background:' + o.c.color + '"></span>' + esc(o.c.name) + '<span class="amt okc">' + eur(o.v) + '</span></div><div class="bar"><i style="width:' + (sm.inc ? o.v / sm.inc * 100 : 0).toFixed(1) + '%;background:' + o.c.color + '"></i></div></div>'; }).join('');

  var main = '<section class="card c12"><div class="mtop"><div class="mleft"><div class="lbl">Gastado</div><div class="big">' + eur(sm.exp) + (b ? '<small>de ' + eur(b) + '</small>' : '') + '</div><div class="mline">' + line + '</div>' + fc + '<div class="chart" id="cumChart"></div></div>' +
    '<div class="mright"><div class="lbl">Gastos por categoría</div>' + catHTML + (incHTML ? '<div class="lbl" style="margin-top:20px">Ingresos</div>' + incHTML : '') + '</div></div></section>';

  // fijos
  var recs = S.db.recurring.slice().sort(function (a, c) { return (a.day || 1) - (c.day || 1); });
  var recHTML = recs.length ? recs.map(function (r) {
    var pd = paidThisMonth(r), late = !pd && (r.day || 1) < now.getDate(), cc = catOf(r.cat, r.type);
    return '<div class="rec"><span class="d"><b>' + (r.day || 1) + '</b><small>' + MESC[now.getMonth()] + '</small></span><span class="n">' + esc(r.name) + '<small>' + esc(cc.name) + '</small>' + (late ? '<em>pendiente</em>' : '') + '</span><span class="a' + (r.type === 'income' ? ' okc' : '') + '">' + (r.type === 'income' ? '+' : '') + eur(+r.amount || 0, 2) + '</span>' +
      (pd ? '<span class="chk on" title="Apuntado este mes">' + ic('check') + '</span>' : '<button class="chk" data-act="payRec" data-id="' + esc(r.id) + '" title="Apuntar este mes">' + ic('check') + '</button>') + '</div>';
  }).join('') : '<div class="mutc" style="font-size:13px;line-height:1.5">Añade lo que se repite cada mes (alquiler, nómina, gasolina fija, Spotify…) en <span class="link" data-act="moneySettings">ajustes</span>. Luego lo apuntas con un toque.</div>';
  var cardRec = '<section class="card c4"><div class="ch">' + ic('calendar') + '<h2>Fijos del mes</h2><button class="ibtn ml" data-act="moneySettings" aria-label="Ajustes">' + ic('gear') + '</button></div>' + recHTML + '</section>';

  // movimientos
  var q = S.gq.toLowerCase();
  var fl = list.filter(function (t) { return (S.gfilter === 'all' || (S.gfilter === 'income' ? t.type === 'income' : t.type !== 'income')) && (!q || (String(t.concept || '') + ' ' + catOf(t.cat, t.type).name).toLowerCase().indexOf(q) >= 0); })
    .sort(function (a, c) { return a.date < c.date ? 1 : a.date > c.date ? -1 : (c.ts || 0) - (a.ts || 0); });
  var groups = {}, order = [];
  fl.forEach(function (t) { if (!groups[t.date]) { groups[t.date] = []; order.push(t.date); } groups[t.date].push(t); });
  var mvHTML = order.map(function (k) {
    var g = groups[k], s = sums(g);
    return '<div class="dayg"><div class="dayh"><span>' + longDay(k) + '</span><span>' + (s.exp ? '−' + eur(s.exp, 2) : '') + (s.inc ? (s.exp ? ' · ' : '') + '<span class="okc">+' + eur(s.inc, 2) + '</span>' : '') + '</span></div>' +
      g.map(function (t) { var c = catOf(t.cat, t.type), inc = t.type === 'income';
        return '<div class="mv" data-act="editTx" data-id="' + esc(t.id) + '"><span class="ci" style="background:' + tint(c.color, .16) + ';color:' + c.color + '">' + esc(c.name.charAt(0)) + '</span><span class="n"><b>' + esc(t.concept || c.name) + '</b><small>' + esc(c.name) + (t.recId ? ' · fijo' : '') + '</small></span><span class="a' + (inc ? ' inc' : '') + '">' + (inc ? '+' : '−') + eur(+t.amount || 0, 2) + '</span></div>'; }).join('') + '</div>';
  }).join('') || '<div class="empty">' + (list.length ? 'Nada con ese filtro.' : 'Sin movimientos este mes. Empieza con <b>+ Gasto</b> o <b>+ Ingreso</b>.') + '</div>';
  var cardMv = '<section class="card c8"><div class="ch">' + ic('wallet') + '<h2>Movimientos</h2><span class="pill">' + list.length + '</span></div>' +
    '<div class="search"><div class="seg"><button class="' + (S.gfilter === 'all' ? 'on' : '') + '" data-act="gfilter" data-v="all">Todos</button><button class="' + (S.gfilter === 'expense' ? 'on' : '') + '" data-act="gfilter" data-v="expense">Gastos</button><button class="' + (S.gfilter === 'income' ? 'on' : '') + '" data-act="gfilter" data-v="income">Ingresos</button></div>' +
    '<input class="in" id="gq" placeholder="Buscar…" value="' + esc(S.gq) + '"></div>' + mvHTML + '</section>';

  var title = '<div class="ptitle"><span class="mnav"><button data-act="gm" data-d="-1" aria-label="Mes anterior">‹</button><b>' + cap(MES[base.getMonth()]) + ' ' + base.getFullYear() + '</b><button data-act="gm" data-d="1" aria-label="Mes siguiente">›</button></span>' +
    '<span class="ml row" style="margin:0 0 0 auto"><button class="wbtn" data-act="addTx" data-type="expense">' + ic('plus') + 'Gasto</button><button class="obtn" data-act="addTx" data-type="income">' + ic('plus') + 'Ingreso</button><button class="ibtn" data-act="moneySettings" aria-label="Ajustes de dinero">' + ic('gear') + '</button></span></div>';
  return title + kpis + '<div class="grid">' + main + cardMv + cardRec + '</div>';
}

/* ---------- HÁBITOS ---------- */
function viewHabitos() {
  var now = new Date(), hs = habits(), today = sod(now), tk = ymd(today), dow = (today.getDay() + 6) % 7, mon = addDays(today, -dow);
  var week = [0, 1, 2, 3, 4, 5, 6].map(function (i) { return addDays(mon, i); });
  var act = hs.filter(function (h) { return active(h, tk) && sched(h, today); }), dt = act.filter(function (h) { return done(tk, h.id); }).length;
  var head = '<div class="hrow head"><span></span>' + DL.map(function (l, i) { return '<span class="' + (i === dow ? 'now' : '') + '">' + l + '</span>'; }).join('') + '<span style="text-align:right">Racha</span></div>';
  var rows = hs.map(function (h) {
    var cur = streak(h), rec = Math.max(record(h), cur);
    var sub = rec === 0 ? '<small>' + (h.cue ? esc(h.cue) : 'Empieza hoy') + '</small>' : (cur > 0 && cur >= rec ? '<small class="best">¡Tu mejor racha!</small>' : '<small>Récord: ' + rec + ' día' + (rec === 1 ? '' : 's') + '</small>');
    var cells = week.map(function (d) {
      var k = ymd(d), fut = d > today, on = done(k, h.id), isT = k === tk, sc = sched(h, d), stl = '';
      if (on) stl = 'background:' + h.color + ';border-color:' + h.color; else if (isT) stl = 'border-color:' + h.color + ';background:' + tint(h.color, .12);
      return '<button class="cell' + (on ? ' on' : '') + (fut ? ' fut' : '') + (!sc && !on && !fut ? ' off' : '') + '" style="' + stl + '"' + (fut ? ' disabled' : '') + ' data-act="hab" data-h="' + esc(h.id) + '" data-k="' + k + '" aria-label="' + esc(h.name) + ' ' + k + '">' + (on ? ic('check') : '') + '</button>';
    }).join('');
    return '<div class="hrow"><button class="hname" data-act="editHabit" data-id="' + esc(h.id) + '"><span class="hico" style="background:' + tint(h.color, .16) + ';color:' + h.color + '">' + ic(h.icon) + '</span><div class="hn"><b>' + esc(h.name) + '</b>' + sub + '</div></button>' + cells +
      '<span class="streak' + (cur > 0 ? ' hot' : '') + '">' + ic('flame') + cur + '</span></div>';
  }).join('');
  if (!hs.length) rows = '<div class="empty">Aún no tienes hábitos. Elige alguno de los propuestos de abajo o crea el tuyo.</div>';

  // heatmap 20 semanas + stats
  var end = addDays(mon, 6), start = addDays(mon, -19 * 7), cells = '', d = start, byW = [[], [], [], [], [], [], []];
  while (d <= end) {
    var k = ymd(d), cl = '', fr = null;
    if (d > today) cl = 'fut'; else { fr = dayFrac(d); if (fr) { cl = 'l' + (fr.f === 0 ? 0 : fr.f < .34 ? 1 : fr.f < .67 ? 2 : fr.f < 1 ? 3 : 4); byW[(d.getDay() + 6) % 7].push(fr.f); } }
    if (k === tk) cl += ' today';
    cells += '<i class="' + cl + '" title="' + d.getDate() + ' ' + MESC[d.getMonth()] + (fr ? ' · ' + fr.n + '/' + fr.t : '') + '"></i>';
    d = addDays(d, 1);
  }
  var ms = rangeStats(new Date(today.getFullYear(), today.getMonth(), 1), today);
  var best = '—', bv = -1;
  if (Object.keys(S.db.habitLog).length) byW.forEach(function (a, i) { if (!a.length) return; var av = a.reduce(function (x, y) { return x + y; }, 0) / a.length; if (av > bv && av > 0) { bv = av; best = DLARGO[i]; } });
  var cardWeek = '<section class="card c12"><div class="ch">' + ic('checkc') + '<h2>Esta semana</h2><span class="pill ml' + (act.length && dt === act.length ? ' ok' : '') + '">' + dt + ' de ' + act.length + ' hoy</span><button class="obtn" data-act="newHabit">' + ic('plus') + 'Crear hábito</button></div>' +
    '<p class="sub">Toca un día para marcarlo (también los pasados). Toca el nombre para editar el hábito.</p>' + (hs.length ? head : '') + rows +
    (hs.length ? '<div class="hbottom"><div class="heatbox"><div class="heathead"><span>Últimas 20 semanas</span><span class="legend">Menos <i style="background:#2a2320"></i><i style="background:#2c5440"></i><i style="background:#3f7a5a"></i><i style="background:#58a37b"></i><i style="background:#7ed0a2"></i> Más</span></div><div class="heat">' + cells + '</div></div>' +
      '<div class="stats"><div class="stat">Cumplido este mes <b>' + (ms.pct == null ? '—' : ms.pct) + '<small>%</small></b></div><div class="stat">Días perfectos <b>' + ms.perfect + '<small>días</small></b></div><div class="stat">Tu mejor día <b>' + best + '</b></div></div></div>' : '') + '</section>';

  // propuestas
  var mine = {}; S.db.habits.forEach(function (h) { if (h.sug) mine[h.sug] = h; mine['n:' + h.name.toLowerCase()] = h; });
  var sl = SUGGESTIONS.filter(function (s) { return s.cat === S.sgcat; });
  var sgHTML = sl.map(function (s) {
    var have = mine[s.id] || mine['n:' + s.name.toLowerCase()], src = s.src && SRC[s.src];
    var dtxt = s.days && s.days.length ? s.days.map(function (j) { return DL[j]; }).join('·') : 'Cada día';
    return '<div class="sg"><span class="hico" style="background:' + tint(s.color, .16) + ';color:' + s.color + '">' + ic(s.icon) + '</span><div class="txt"><b>' + esc(s.name) + ' <span class="mutc" style="font-weight:400;font-size:12px">· ' + dtxt + '</span></b><p>' + esc(s.why) + '</p>' +
      (src ? '<a href="' + src.u + '" target="_blank" rel="noopener">Fuente: ' + esc(src.t) + '</a>' : '') + '</div>' +
      (have && !have.archived ? '<span class="added">' + ic('check') + 'Lo tienes</span>' : '<button class="obtn" data-act="addSug" data-id="' + s.id + '">' + ic('plus') + 'Añadir</button>') + '</div>';
  }).join('');
  var cardSug = '<section class="card c8"><div class="ch">' + ic('bulb') + '<h2>Propuestos para ti</h2></div>' +
    '<p class="sub">Pensados para un empresario que quiere ponerse en forma sin vivir en el gimnasio. Añade los que quieras y luego ajusta días y momento.</p>' +
    '<div class="sgcats">' + SUG_CATS.map(function (c) { return '<button class="chip' + (S.sgcat === c[0] ? ' on' : '') + '" data-act="sgcat" data-v="' + c[0] + '">' + c[1] + '</button>'; }).join('') + '</div>' + sgHTML + '</section>';

  var cardTips = '<section class="card c4"><div class="ch">' + ic('star') + '<h2>Cómo hacer que se queden</h2></div>' +
    '<div class="nlist">' +
    '<div class="nitem"><div class="nd">Paciencia</div><p>En el estudio de Lally (UCL), un hábito sencillo tardó de media 66 días en volverse automático, con casos de 18 a 254. <a class="link" href="https://www.spring.org.uk/2023/01/form-a-habit.php" target="_blank" rel="noopener">Más</a></p></div>' +
    '<div class="nitem"><div class="nd">Fallar un día no pasa nada</div><p>En ese mismo estudio, saltarse un día suelto apenas afectó. Lo que estropea es encadenar varios. Regla: nunca dos seguidos.</p></div>' +
    '<div class="nitem"><div class="nd">Ponle un «cuándo»</div><p>Rellena el campo «Cuándo y dónde» de cada hábito («al salir de MSH», «antes de cenar»). Un disparador fijo ayuda mucho más que la fuerza de voluntad.</p></div>' +
    '<div class="nitem"><div class="nd">Pocos y bien</div><p>Mejor 4–6 hábitos que cumples que 12 que te agobian. Usa el archivo para aparcar los que no tocan ahora.</p></div></div></section>';

  var archived = S.db.habits.filter(function (h) { return h.archived; });
  var cardArch = archived.length ? '<section class="card c12"><div class="ch">' + ic('calendar') + '<h2>Archivados</h2></div>' + archived.map(function (h) { return '<div class="th"><span class="hico" style="background:' + tint(h.color, .16) + ';color:' + h.color + '">' + ic(h.icon) + '</span><div class="hn"><b>' + esc(h.name) + '</b><small>Récord: ' + record(h) + ' días</small></div><button class="obtn" data-act="unarchive" data-id="' + esc(h.id) + '">Recuperar</button></div>'; }).join('') + '</section>' : '';

  return '<div class="ptitle">Hábitos</div><div class="grid">' + cardWeek + cardSug + cardTips + cardArch + '</div>';
}

/* ---------- OBJETIVOS ---------- */
function yearFrac(y, now) { if (y < now.getFullYear()) return 1; if (y > now.getFullYear()) return 0; var a = new Date(y, 0, 1), b = new Date(y + 1, 0, 1); return (now - a) / (b - a); }
function gfmt(v, unit) { return unit === '€' ? eur(v) : fmt(v, Math.abs(Math.round(v) - v) > 0.001 ? 1 : 0); }
function goalStatus(g, now) {
  var y = g.year || now.getFullYear(), yf = yearFrac(y, now), cur = +g.current || 0, tg = +g.target || 0, unit = g.unit || '', u = unit && unit !== '€' ? ' ' + unit : '';
  if (!tg) return { t: 'Ponle una meta', c: 'mutc', yf: yf };
  if (cur >= tg) return { t: '¡Conseguido!', c: 'okc', yf: yf };
  if (yf >= 1) return { t: 'Se quedó en el ' + Math.round(cur / tg * 100) + ' %', c: 'warnc', yf: yf };
  var exp = tg * yf, diff = cur - exp;
  if (diff >= tg * 0.04) return { t: 'Vas por delante: +' + gfmt(Math.round(diff * 10) / 10, unit) + u, c: 'okc', yf: yf };
  if (diff >= -tg * 0.02) return { t: 'Vas al día', c: 'okc', yf: yf };
  return { t: 'Te faltan ' + gfmt(Math.ceil(-diff), unit) + u + ' para ir al día', c: 'warnc', yf: yf };
}
function goalRow(g, now, compact) {
  var cur = +g.current || 0, tg = +g.target || 0, unit = g.unit || '', st = goalStatus(g, now), w = tg ? Math.min(100, cur / tg * 100) : 0;
  return '<div class="goal' + (compact ? ' compact' : '') + '" data-act="goal" data-id="' + esc(g.id) + '"><div class="gtop"><span class="hico" style="background:' + tint(g.color, .16) + ';color:' + g.color + '">' + ic(g.icon) + '</span>' +
    '<div class="gname"><b>' + esc(g.name) + '</b><small class="' + st.c + '">' + esc(st.t) + '</small>' + (g.note && !compact ? '<small class="mutc"> · ' + esc(g.note) + '</small>' : '') + '</div>' +
    '<div class="gnum"><b>' + gfmt(cur, unit) + '</b>' + (tg ? '<small>de ' + gfmt(tg, unit) + (unit && unit !== '€' ? ' ' + esc(unit) : '') + '</small>' : '') + '</div></div>' +
    '<div class="gbar"><i style="width:' + w.toFixed(1) + '%;background:' + g.color + '"></i>' + (tg && st.yf > 0 && st.yf < 1 ? '<u style="left:' + (st.yf * 100).toFixed(1) + '%"></u>' : '') + '</div></div>';
}
function viewObjetivos() {
  var now = new Date(), y = S.gy, yf = yearFrac(y, now);
  var gs = S.db.goals.filter(function (g) { return (g.year || now.getFullYear()) === y; });
  var ok = gs.filter(function (g) { return +g.target && +g.current >= +g.target; }).length;
  var onTrack = gs.filter(function (g) { var s = goalStatus(g, now); return s.c === 'okc'; }).length;
  var rows = gs.map(function (g) { return goalRow(g, now); }).join('') || '<div class="empty">Sin objetivos para ' + y + '. <span class="link" data-act="addGoal">Añade uno</span></div>';
  return '<div class="ptitle">Objetivos <span class="mnav"><button data-act="gy" data-d="-1" aria-label="Año anterior">‹</button><b style="min-width:80px">' + y + '</b><button data-act="gy" data-d="1" aria-label="Año siguiente">›</button></span><button class="wbtn ml" data-act="addGoal">' + ic('plus') + 'Objetivo</button></div>' +
    '<div class="kpis"><div class="kpi"><div class="k">Año transcurrido</div><div class="v">' + Math.round(yf * 100) + ' %</div></div><div class="kpi"><div class="k">Objetivos</div><div class="v">' + gs.length + '</div></div><div class="kpi"><div class="k">Conseguidos</div><div class="v okc">' + ok + '</div></div><div class="kpi"><div class="k">Al día o por delante</div><div class="v">' + onTrack + '</div></div></div>' +
    '<div class="grid"><section class="card c12"><div class="ch">' + ic('target') + '<h2>Tus objetivos de ' + y + '</h2></div><p class="sub">La rayita blanca marca dónde deberías ir hoy para llegar a final de año. Toca un objetivo para actualizar cuánto llevas.</p>' + rows + '</section></div>';
}

/* ---------- RESUMEN ---------- */
function viewResumen() {
  var seg = '<div class="seg"><button class="' + (S.rmode === 'mes' ? 'on' : '') + '" data-act="rmode" data-v="mes">Mes</button><button class="' + (S.rmode === 'año' ? 'on' : '') + '" data-act="rmode" data-v="año">Año</button></div>';
  return S.rmode === 'mes' ? resumenMes(seg) : resumenAno(seg);
}
function resumenMes(seg) {
  var now = new Date(), base = monthStart(S.rm), last = new Date(base.getFullYear(), base.getMonth(), dim(base)), mp = mprefix(base);
  var st = rangeStats(base, last), list = txIn(mp), sm = sums(list), prev = sums(txIn(mprefix(monthStart(S.rm - 1))));
  var t3n = 0, t3d = 0, notes = [], moodS = 0, moodN = 0;
  for (var d = new Date(base); d <= last && d <= now; d = addDays(d, 1)) {
    var k = ymd(d);
    (S.db.top3[k] || []).forEach(function (x) { if (x && x.text) { t3n++; if (x.done) t3d++; } });
    var n = S.db.notes[k]; if (n) { if (n.mood) { moodS += n.mood; moodN++; } if (n.text) notes.push([k, n]); }
  }
  var moodAvg = moodN ? moodS / moodN : null;
  var savings = sm.inc ? Math.round(sm.bal / sm.inc * 100) : null;
  var kpis = '<div class="kpis"><div class="kpi"><div class="k">Hábitos cumplidos</div><div class="v">' + (st.pct == null ? '—' : st.pct + ' %') + '</div><div class="d">' + st.perfect + ' días perfectos</div></div>' +
    '<div class="kpi"><div class="k">Balance</div><div class="v ' + (sm.bal >= 0 ? 'okc' : 'badc') + '">' + (sm.bal > 0 ? '+' : '') + eur(sm.bal) + '</div><div class="d">Ahorro ' + (savings == null ? '—' : savings + ' %') + '</div></div>' +
    '<div class="kpi"><div class="k">Las 3 completadas</div><div class="v">' + (t3n ? Math.round(t3d / t3n * 100) + ' %' : '—') + '</div><div class="d">' + t3d + ' de ' + t3n + '</div></div>' +
    '<div class="kpi"><div class="k">Ánimo medio</div><div class="v">' + (moodAvg ? MOODS[Math.round(moodAvg) - 1] + ' ' + fmt(moodAvg, 1) : '—') + '</div><div class="d">' + moodN + ' día' + (moodN === 1 ? '' : 's') + ' con nota</div></div></div>';
  var hb = habits().map(function (h) { var p = st.per[h.id] || { n: 0, t: 0 }, pc = p.t ? Math.round(p.n / p.t * 100) : 0; var br = bestRun(h, base, last > now ? sod(now) : last);
    return '<div class="pbar"><span class="nm">' + esc(h.name) + ' <span class="mutc" style="font-size:12px">· mejor racha ' + br + '</span></span><span class="bar"><i style="width:' + pc + '%;background:' + h.color + '"></i></span><span class="vv">' + (p.t ? pc + '%' : '—') + '</span></div>'; }).join('') || '<div class="empty">Sin hábitos.</div>';
  var by = {}; list.forEach(function (t) { if (t.type === 'income') return; var c = catOf(t.cat, 'expense'); by[c.id] = by[c.id] || { c: c, v: 0 }; by[c.id].v += +t.amount || 0; });
  var cats = Object.keys(by).map(function (k) { return by[k]; }).sort(function (a, b) { return b.v - a.v; });
  var catHTML = cats.map(function (o) { return '<div class="pbar"><span class="nm">' + esc(o.c.name) + '</span><span class="bar"><i style="width:' + (sm.exp ? o.v / sm.exp * 100 : 0).toFixed(1) + '%;background:' + o.c.color + '"></i></span><span class="vv" style="width:80px">' + eur(o.v) + '</span></div>'; }).join('') || '<div class="empty">Sin gastos.</div>';
  function cmp(a, b, invert) { if (!b) return ''; var dd = a - b; if (Math.abs(dd) < 0.5) return ''; var good = invert ? dd < 0 : dd > 0; return ' <span class="' + (good ? 'okc' : 'badc') + '" style="font-size:12px">' + (dd > 0 ? '+' : '−') + eur(Math.abs(dd)) + '</span>'; }
  var money = '<div class="stat" style="margin-bottom:8px">Ingresos <b>' + eur(sm.inc) + cmp(sm.inc, prev.inc) + '</b></div><div class="stat" style="margin-bottom:16px">Gastos <b>' + eur(sm.exp) + cmp(sm.exp, prev.exp, true) + '</b></div>' + catHTML;
  var notesHTML = notes.length ? '<div class="nlist">' + notes.reverse().map(function (x) { return '<div class="nitem"><div class="nd">' + (x[1].mood ? MOODS[x[1].mood - 1] + ' ' : '') + longDay(x[0]) + '</div><p>' + esc(x[1].text) + '</p></div>'; }).join('') + '</div>' : '<div class="empty">No escribiste notas este mes. Se escriben en la pestaña Hoy.</div>';
  // mini heatmap del mes
  var cells = '', lead = (base.getDay() + 6) % 7; for (var i = 0; i < lead; i++) cells += '<i class="none"></i>';
  for (d = new Date(base); d <= last; d = addDays(d, 1)) { var fr = d <= now ? dayFrac(d) : null, cl = d > now ? 'fut' : fr ? 'l' + (fr.f === 0 ? 0 : fr.f < .34 ? 1 : fr.f < .67 ? 2 : fr.f < 1 ? 3 : 4) : ''; cells += '<i class="' + cl + '" title="' + d.getDate() + (fr ? ' · ' + fr.n + '/' + fr.t : '') + '"></i>'; }
  var title = '<div class="ptitle">Resumen <span class="mnav"><button data-act="rm" data-d="-1">‹</button><b>' + cap(MES[base.getMonth()]) + ' ' + base.getFullYear() + '</b><button data-act="rm" data-d="1">›</button></span><span class="ml">' + seg + '</span></div>';
  return title + kpis + '<div class="grid">' +
    '<section class="card c7"><div class="ch">' + ic('checkc') + '<h2>Hábitos del mes</h2></div>' + hb + '</section>' +
    '<section class="card c5"><div class="ch">' + ic('calendar') + '<h2>Mapa del mes</h2></div><div class="heat" style="grid-template-rows:none;grid-auto-flow:row;grid-template-columns:repeat(7,1fr);max-width:320px">' + DL.map(function (l) { return '<span class="mutc" style="font-size:11px;text-align:center">' + l + '</span>'; }).join('') + cells + '</div></section>' +
    '<section class="card c5"><div class="ch">' + ic('wallet') + '<h2>Dinero</h2><a class="more ml" style="margin-top:0" href="#gastos" data-act="gotoMonth" data-off="' + S.rm + '">Ver movimientos ' + ic('right') + '</a></div>' + money + '</section>' +
    '<section class="card c7"><div class="ch">' + ic('pen') + '<h2>Tu diario del mes</h2></div>' + notesHTML + '</section></div>';
}
function resumenAno(seg) {
  var now = new Date(), y = S.ry, months = [], i;
  for (i = 0; i < 12; i++) {
    var b = new Date(y, i, 1), l = new Date(y, i, dim(b)), s = sums(txIn(mprefix(b))), hs = b <= now ? rangeStats(b, l) : { pct: null };
    months.push({ m: i, inc: s.inc, exp: s.exp, bal: s.bal, hp: hs.pct });
  }
  var tot = months.reduce(function (a, m) { a.inc += m.inc; a.exp += m.exp; return a; }, { inc: 0, exp: 0 }); tot.bal = tot.inc - tot.exp;
  var ys = rangeStats(new Date(y, 0, 1), new Date(y, 11, 31));
  var bestM = null; months.forEach(function (m) { if (m.hp != null && (!bestM || m.hp > bestM.hp)) bestM = m; });
  var gs = S.db.goals.filter(function (g) { return (g.year || now.getFullYear()) === y; });
  var gok = gs.filter(function (g) { return +g.target && +g.current >= +g.target; }).length;
  var kpis = '<div class="kpis"><div class="kpi"><div class="k">Ingresos del año</div><div class="v okc">' + eur(tot.inc) + '</div></div><div class="kpi"><div class="k">Gastos del año</div><div class="v">' + eur(tot.exp) + '</div></div>' +
    '<div class="kpi"><div class="k">Ahorrado</div><div class="v ' + (tot.bal >= 0 ? 'okc' : 'badc') + '">' + (tot.bal > 0 ? '+' : '') + eur(tot.bal) + '</div><div class="d">' + (tot.inc ? Math.round(tot.bal / tot.inc * 100) + ' % de lo que entró' : '') + '</div></div>' +
    '<div class="kpi"><div class="k">Hábitos cumplidos</div><div class="v">' + (ys.pct == null ? '—' : ys.pct + ' %') + '</div><div class="d">' + ys.perfect + ' días perfectos' + (bestM ? ' · mejor mes: ' + MES[bestM.m] : '') + '</div></div></div>';
  S.after.push(function () { drawYearMoney($('#yMoney'), months); drawYearHabits($('#yHab'), months); });
  // heatmap anual
  var start = new Date(y, 0, 1), lead = (start.getDay() + 6) % 7, cells = '', d;
  for (i = 0; i < lead; i++) cells += '<i class="none"></i>';
  for (d = new Date(start); d.getFullYear() === y; d = addDays(d, 1)) { var fr = d <= now ? dayFrac(d) : null, cl = d > now ? 'fut' : fr ? 'l' + (fr.f === 0 ? 0 : fr.f < .34 ? 1 : fr.f < .67 ? 2 : fr.f < 1 ? 3 : 4) : ''; if (ymd(d) === ymd(now)) cl += ' today'; cells += '<i class="' + cl + '" title="' + d.getDate() + ' ' + MESC[d.getMonth()] + (fr ? ' · ' + fr.n + '/' + fr.t : '') + '"></i>'; }
  var hb = habits().map(function (h) { var p = ys.per[h.id] || { n: 0, t: 0 }, pc = p.t ? Math.round(p.n / p.t * 100) : 0; return '<div class="pbar"><span class="nm">' + esc(h.name) + ' <span class="mutc" style="font-size:12px">· ' + p.n + ' veces</span></span><span class="bar"><i style="width:' + pc + '%;background:' + h.color + '"></i></span><span class="vv">' + (p.t ? pc + '%' : '—') + '</span></div>'; }).join('') || '<div class="empty">Sin hábitos.</div>';
  var by = {}; S.db.tx.forEach(function (t) { if (t.type === 'income' || String(t.date).slice(0, 4) !== String(y)) return; var c = catOf(t.cat, 'expense'); by[c.id] = by[c.id] || { c: c, v: 0 }; by[c.id].v += +t.amount || 0; });
  var cats = Object.keys(by).map(function (k) { return by[k]; }).sort(function (a, b) { return b.v - a.v; });
  var catHTML = cats.map(function (o) { return '<div class="pbar"><span class="nm">' + esc(o.c.name) + '</span><span class="bar"><i style="width:' + (tot.exp ? o.v / tot.exp * 100 : 0).toFixed(1) + '%;background:' + o.c.color + '"></i></span><span class="vv" style="width:84px">' + eur(o.v) + '</span></div>'; }).join('') || '<div class="empty">Sin gastos este año.</div>';
  var title = '<div class="ptitle">Resumen <span class="mnav"><button data-act="ry" data-d="-1">‹</button><b style="min-width:80px">' + y + '</b><button data-act="ry" data-d="1">›</button></span><span class="ml">' + seg + '</span></div>';
  return title + kpis + '<div class="grid">' +
    '<section class="card c12"><div class="ch">' + ic('chart') + '<h2>Ingresos y gastos por mes</h2></div><div class="legend2"><span><i class="dot" style="background:#74c69d"></i>Ingresos</span><span><i class="dot" style="background:#e8798f"></i>Gastos</span><span><i class="dot" style="background:#efe8e2"></i>Ahorro acumulado</span></div><div class="chart" id="yMoney"></div></section>' +
    '<section class="card c12"><div class="ch">' + ic('calendar') + '<h2>Tu año en hábitos</h2><span class="pill ml">' + ys.perfect + ' días perfectos</span></div><div class="heat year">' + cells + '</div></section>' +
    '<section class="card c6"><div class="ch">' + ic('checkc') + '<h2>% de hábitos por mes</h2></div><div class="chart" id="yHab"></div></section>' +
    '<section class="card c6"><div class="ch">' + ic('target') + '<h2>Objetivos</h2><span class="pill ml">' + gok + ' de ' + gs.length + ' conseguidos</span></div>' + (gs.map(function (g) { return goalRow(g, now, true); }).join('') || '<div class="empty">Sin objetivos ese año.</div>') + '</section>' +
    '<section class="card c6"><div class="ch">' + ic('checkc') + '<h2>Cada hábito en el año</h2></div>' + hb + '</section>' +
    '<section class="card c6"><div class="ch">' + ic('wallet') + '<h2>En qué se fue el dinero</h2></div>' + catHTML + '</section></div>';
}

/* ================= gráficos ================= */
function svgW(el) { return Math.max(260, el.clientWidth || 600); }
function tipFor(el) { var t = el.querySelector('.tip'); if (!t) { t = document.createElement('div'); t.className = 'tip'; el.appendChild(t); } return t; }
function drawCum(el, c) {
  if (!el) return;
  var W = svgW(el), H = 200, pl = 4, pr = 6, pt = 30, pb = 26;
  var last = c.cum.length ? c.cum[c.cum.length - 1] : 0;
  var maxV = Math.max(c.budget || 0, c.isCur ? c.forecast : 0, last, 1) * 1.1;
  function x(d) { return pl + (d - 1) / (c.dim - 1) * (W - pl - pr); }
  function y(v) { return pt + (1 - v / maxV) * (H - pt - pb); }
  var s = '<svg width="100%" viewBox="0 0 ' + W + ' ' + H + '" style="display:block"><defs><linearGradient id="mg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8875a" stop-opacity=".42"/><stop offset="1" stop-color="#e8875a" stop-opacity="0"/></linearGradient></defs>';
  if (c.budget) { var yb = y(c.budget); s += '<line x1="' + pl + '" x2="' + (W - pr) + '" y1="' + yb + '" y2="' + yb + '" stroke="#8f847c" stroke-dasharray="3 4"/><text x="' + (pl + 2) + '" y="' + (yb - 7) + '" fill="#8f847c" font-size="11.5">Presupuesto · ' + eur(c.budget) + '</text>'; }
  if (c.cum.length) {
    var p = 'M' + x(1) + ' ' + y(0);
    c.cum.forEach(function (v, i) { p += ' L' + x(i + 1).toFixed(1) + ' ' + y(v).toFixed(1); });
    var lx = x(c.cum.length), ly = y(last);
    s += '<path d="' + p + ' L' + lx.toFixed(1) + ' ' + y(0) + ' Z" fill="url(#mg)"/><path d="' + p + '" fill="none" stroke="#e8875a" stroke-width="2.2" stroke-linejoin="round"/>';
    if (c.isCur && c.day < c.dim) s += '<line x1="' + lx + '" y1="' + ly + '" x2="' + x(c.dim) + '" y2="' + y(c.forecast) + '" stroke="#e8875a" stroke-opacity=".55" stroke-dasharray="2 4" stroke-width="2"/>';
    if (c.isCur) { var an = lx > W - 110 ? 'end' : lx < 80 ? 'start' : 'middle';
      s += '<circle cx="' + lx + '" cy="' + ly + '" r="9" fill="#e8875a" fill-opacity=".25"/><circle cx="' + lx + '" cy="' + ly + '" r="5" fill="#e8875a"/><text x="' + (an === 'end' ? lx - 12 : an === 'start' ? lx + 12 : lx) + '" y="' + (ly - 14) + '" fill="#d9cfc8" font-size="12" text-anchor="' + an + '">Hoy · ' + eur(last) + '</text>'; }
  }
  [1, 8, 15, 22, c.dim].forEach(function (t, i, a) { var lab = (i === 0 || i === a.length - 1) ? t + ' ' + c.mon : String(t); var an = i === 0 ? 'start' : i === a.length - 1 ? 'end' : 'middle'; s += '<text x="' + x(t) + '" y="' + (H - 6) + '" fill="#6f655f" font-size="11" text-anchor="' + an + '">' + lab + '</text>'; });
  el.innerHTML = s + '</svg>';
  // tooltip
  var tip = tipFor(el);
  el.onpointermove = function (e) { var r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width * W, d = Math.round((px - pl) / (W - pl - pr) * (c.dim - 1)) + 1; if (d < 1 || d > c.cum.length) { tip.style.display = 'none'; return; } var v = c.cum[d - 1]; tip.innerHTML = '<b>' + d + ' ' + c.mon + '</b> · ' + eur(v, 2) + ' acumulado'; tip.style.display = 'block'; tip.style.left = (x(d) / W * r.width) + 'px'; tip.style.top = (y(v) / H * r.height) + 'px'; };
  el.onpointerleave = function () { tip.style.display = 'none'; };
}
function drawYearMoney(el, months) {
  if (!el) return;
  var W = svgW(el), H = 240, pl = 44, pr = 8, pt = 14, pb = 26, cw = (W - pl - pr) / 12;
  var cum = 0, nowD = new Date(), cums = months.map(function (m, i) { cum += m.bal; return cum; });
  var lastM = 11; if (S.ry === nowD.getFullYear()) lastM = nowD.getMonth(); else if (S.ry > nowD.getFullYear()) lastM = -1;
  var maxV = Math.max(1, Math.max.apply(null, months.map(function (m) { return Math.max(m.inc, m.exp); }).concat(cums)));
  var minV = Math.min(0, Math.min.apply(null, cums));
  function y(v) { return pt + (maxV - v) / (maxV - minV) * (H - pt - pb); }
  var s = '<svg width="100%" viewBox="0 0 ' + W + ' ' + H + '" style="display:block">';
  [0, .5, 1].forEach(function (f) { var v = minV + (maxV - minV) * f, yy = y(v); s += '<line x1="' + pl + '" x2="' + (W - pr) + '" y1="' + yy + '" y2="' + yy + '" stroke="#2b2420"/><text x="' + (pl - 6) + '" y="' + (yy + 4) + '" fill="#6f655f" font-size="10.5" text-anchor="end">' + (Math.abs(v) >= 1000 ? fmt(v / 1000, 1) + 'k' : fmt(v)) + '</text>'; });
  var bw = Math.min(16, cw * .32);
  months.forEach(function (m, i) {
    var cx = pl + cw * i + cw / 2;
    s += '<rect x="' + (cx - bw - 1) + '" y="' + y(m.inc) + '" width="' + bw + '" height="' + Math.max(0, y(0) - y(m.inc)) + '" rx="3" fill="#74c69d"/>';
    s += '<rect x="' + (cx + 1) + '" y="' + y(m.exp) + '" width="' + bw + '" height="' + Math.max(0, y(0) - y(m.exp)) + '" rx="3" fill="#e8798f"/>';
    s += '<text x="' + cx + '" y="' + (H - 6) + '" fill="#6f655f" font-size="11" text-anchor="middle">' + MESC[i] + '</text>';
  });
  var p = cums.slice(0, lastM + 1).map(function (v, i) { return (i ? 'L' : 'M') + (pl + cw * i + cw / 2).toFixed(1) + ' ' + y(v).toFixed(1); }).join(' ');
  if (p) s += '<path d="' + p + '" fill="none" stroke="#efe8e2" stroke-width="2" stroke-dasharray="1 0"/>';
  cums.slice(0, lastM + 1).forEach(function (v, i) { s += '<circle cx="' + (pl + cw * i + cw / 2) + '" cy="' + y(v) + '" r="3" fill="#efe8e2"/>'; });
  el.innerHTML = s + '</svg>';
  var tip = tipFor(el);
  el.onpointermove = function (e) { var r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width * W, i = Math.floor((px - pl) / cw); if (i < 0 || i > 11) { tip.style.display = 'none'; return; } var m = months[i]; tip.innerHTML = '<b>' + cap(MES[i]) + '</b><br><span class="okc">+' + eur(m.inc) + '</span> · <span class="badc">−' + eur(m.exp) + '</span><br>Balance ' + (m.bal >= 0 ? '+' : '') + eur(m.bal) + ' · acumulado ' + eur(cums[i]); tip.style.display = 'block'; tip.style.left = ((pl + cw * i + cw / 2) / W * r.width) + 'px'; tip.style.top = (y(Math.max(m.inc, m.exp, cums[i])) / H * r.height) + 'px'; };
  el.onpointerleave = function () { tip.style.display = 'none'; };
}
function drawYearHabits(el, months) {
  if (!el) return;
  var W = svgW(el), H = 190, pl = 30, pr = 6, pt = 18, pb = 24, cw = (W - pl - pr) / 12, bw = Math.min(26, cw * .6);
  function y(v) { return pt + (100 - v) / 100 * (H - pt - pb); }
  var s = '<svg width="100%" viewBox="0 0 ' + W + ' ' + H + '" style="display:block">';
  [0, 50, 100].forEach(function (v) { s += '<line x1="' + pl + '" x2="' + (W - pr) + '" y1="' + y(v) + '" y2="' + y(v) + '" stroke="#2b2420"/><text x="' + (pl - 6) + '" y="' + (y(v) + 4) + '" fill="#6f655f" font-size="10.5" text-anchor="end">' + v + '</text>'; });
  months.forEach(function (m, i) { var cx = pl + cw * i + cw / 2; if (m.hp != null) { s += '<rect x="' + (cx - bw / 2) + '" y="' + y(m.hp) + '" width="' + bw + '" height="' + (y(0) - y(m.hp)) + '" rx="4" fill="' + (m.hp >= 80 ? '#7ed0a2' : m.hp >= 50 ? '#58a37b' : '#3f7a5a') + '"/><text x="' + cx + '" y="' + (y(m.hp) - 5) + '" fill="#d9cfc8" font-size="10.5" text-anchor="middle">' + m.hp + '</text>'; } s += '<text x="' + cx + '" y="' + (H - 6) + '" fill="#6f655f" font-size="11" text-anchor="middle">' + MESC[i] + '</text>'; });
  el.innerHTML = s + '</svg>';
}

/* ================= acciones ================= */
function setTop(date, i, patch) {
  var items = clone(S.db.top3[date] || []);
  while (items.length < 3) items.push({ text: '', done: false });
  for (var k in patch) items[i][k] = patch[k];
  if (!items[i].text) items[i].done = false;
  if (items.every(function (x) { return !x.text; })) delete S.db.top3[date]; else S.db.top3[date] = items;
  putDay('top3', date, S.db.top3[date] || null);
}
function toggleHabit(hid, k) {
  var a = (S.db.habitLog[k] || []).slice(), ix = a.indexOf(hid);
  if (ix >= 0) a.splice(ix, 1); else a.push(hid);
  if (a.length) S.db.habitLog[k] = a; else delete S.db.habitLog[k];
  putDay('habits', k, a);
  render();
}
function addTx(t) {
  return api('POST', '/api/tx', t).then(function (saved) { S.db.tx.push(saved); render(); return saved; }).catch(failed);
}

document.addEventListener('click', function (e) {
  var b = e.target.closest('[data-act]'); if (!b || b.disabled || b.closest('#sheetCard')) return;
  var a = b.getAttribute('data-act');
  switch (a) {
    case 'hab': toggleHabit(b.getAttribute('data-h'), b.getAttribute('data-k')); break;
    case 't3done': { var dt = b.getAttribute('data-date'), i = +b.getAttribute('data-i'), it = (S.db.top3[dt] || [])[i] || {}; if (it.text) { setTop(dt, i, { done: !it.done }); render(); } break; }
    case 'planTomorrow': sheetTomorrow(); break;
    case 'editHead': sheetHead(); break;
    case 'mood': { var d = b.getAttribute('data-date'), n = clone(S.db.notes[d] || {}), v = +b.getAttribute('data-v'); n.mood = n.mood === v ? 0 : v; if (!n.mood) delete n.mood; S.db.notes[d] = n; putDay('notes', d, n); $$('.moods button').forEach(function (x) { x.classList.toggle('on', +x.getAttribute('data-v') === n.mood); }); break; }
    case 'addTx': sheetTx(null, b.getAttribute('data-type')); break;
    case 'editTx': sheetTx(b.getAttribute('data-id')); break;
    case 'moneySettings': sheetMoney(); break;
    case 'gm': S.gm += +b.getAttribute('data-d'); render(); break;
    case 'gfilter': S.gfilter = b.getAttribute('data-v'); render(); break;
    case 'payRec': { var r = S.db.recurring.filter(function (x) { return x.id === b.getAttribute('data-id'); })[0]; if (r) addTx({ type: r.type || 'expense', date: ymd(new Date()), amount: +r.amount, concept: r.name, cat: r.cat, recId: r.id }).then(function (s) { if (s) toast(r.name + ' apuntado'); }); break; }
    case 'newHabit': sheetHabit(null); break;
    case 'editHabit': sheetHabit(b.getAttribute('data-id')); break;
    case 'sgcat': S.sgcat = b.getAttribute('data-v'); render(); break;
    case 'addSug': { var s = SUGGESTIONS.filter(function (x) { return x.id === b.getAttribute('data-id'); })[0]; if (s) { S.db.habits.push({ id: uid('h'), sug: s.id, name: s.name, icon: s.icon, color: s.color, days: s.days.slice(), cue: s.cue || '', since: ymd(new Date()) }); putDoc('habits'); render(); toast('Añadido «' + s.name + '». Toca su nombre arriba para ajustarlo.'); } break; }
    case 'unarchive': { var h = S.db.habits.filter(function (x) { return x.id === b.getAttribute('data-id'); })[0]; if (h) { delete h.archived; putDoc('habits'); render(); } break; }
    case 'goal': sheetGoal(b.getAttribute('data-id')); break;
    case 'addGoal': sheetGoal(null); break;
    case 'gy': S.gy += +b.getAttribute('data-d'); render(); break;
    case 'rmode': S.rmode = b.getAttribute('data-v'); render(); break;
    case 'rm': S.rm += +b.getAttribute('data-d'); render(); break;
    case 'ry': S.ry += +b.getAttribute('data-d'); render(); break;
    case 'gotoMonth': S.gm = +b.getAttribute('data-off'); break;
  }
});
document.addEventListener('change', function (e) {
  if (e.target.classList.contains('t3in')) { setTop(e.target.getAttribute('data-date'), +e.target.getAttribute('data-i'), { text: e.target.value.trim() }); render(); }
});
document.addEventListener('keydown', function (e) { if (e.target.classList && e.target.classList.contains('t3in') && e.key === 'Enter') e.target.blur(); if (e.key === 'Escape') closeSheet(); });
document.addEventListener('input', function (e) {
  if (e.target.id === 'noteText') { var d = e.target.getAttribute('data-date'), n = clone(S.db.notes[d] || {}); n.text = e.target.value; if (!n.text) delete n.text; S.db.notes[d] = n; $('#noteSaved').textContent = 'Guardando…'; putDay('notes', d, n, 700); }
  if (e.target.id === 'gq') { S.gq = e.target.value; var pos = e.target.selectionStart; render(); var g = $('#gq'); if (g) { g.focus(); g.setSelectionRange(pos, pos); } }
});
$('#menuBtn').addEventListener('click', sheetMenu);
window.addEventListener('hashchange', function () { render(); window.scrollTo(0, 0); });
var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { if (S.route === 'gastos' || S.route === 'resumen') render(); }, 200); });
// refresca al volver a la app (por si apuntaste algo desde otro dispositivo)
var lastLoad = Date.now();
document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible' && S.db && Date.now() - lastLoad > 30000 && !document.activeElement.matches('input,textarea')) { lastLoad = Date.now(); load().catch(function () {}); } });
var lastDay = ymd(new Date());
setInterval(function () { var k = ymd(new Date()); if (k !== lastDay) { lastDay = k; if (!document.activeElement.matches('input,textarea')) render(); } }, 60000);

/* ================= hojas (modales) ================= */
var sheet = $('#sheet'), card = $('#sheetCard');
function openSheet() { sheet.classList.remove('hidden'); }
function closeSheet() { sheet.classList.add('hidden'); card.innerHTML = ''; card.onclick = card.oninput = card.onchange = null; }
sheet.addEventListener('click', function (e) { if (e.target.getAttribute('data-close')) closeSheet(); });
function btns(extra, label) { return '<div class="sbtns">' + (extra || '') + '<button class="gbtn" data-close="1">Cancelar</button><button class="abtn" data-s="save">' + (label || 'Guardar') + '</button></div>'; }
function onSheet(fn) { card.onclick = function (e) { if (e.target.getAttribute('data-close')) { closeSheet(); return; } var b = e.target.closest('[data-s]'); if (b) fn(b.getAttribute('data-s'), b, e); }; }

function sheetHead() {
  var st = S.db.settings;
  card.innerHTML = '<h3>Tu cabecera</h3><div class="f"><label>Cómo te saludo</label><input class="in" id="fName" value="' + esc(st.name || 'Sergio') + '"></div>' +
    '<div class="f"><label>Foco de la semana</label><input class="in" id="fFocus" placeholder="Ej.: cerrar la oferta de AD La Plata y entrenar 3 días" value="' + esc(st.focus || '') + '"></div>' +
    '<div class="f"><label>Frase de la tarjeta</label><input class="in" id="fQuote" value="' + esc(st.quote || '') + '"></div>' +
    '<div class="f"><label>Autor (opcional)</label><input class="in" id="fQBy" value="' + esc(st.quoteBy || '') + '"></div>' + btns();
  onSheet(function (s) { if (s === 'save') { st.name = $('#fName').value.trim() || 'Sergio'; st.focus = $('#fFocus').value.trim(); st.quote = $('#fQuote').value.trim(); st.quoteBy = $('#fQBy').value.trim(); putDoc('settings'); closeSheet(); render(); } });
  openSheet();
}

function sheetTomorrow() {
  var k = ymd(addDays(new Date(), 1)), items = S.db.top3[k] || [];
  card.innerHTML = '<h3>Las 3 de mañana</h3><p class="sub" style="margin:0 0 14px">Decide ahora qué harás mañana; por la mañana ya lo tendrás delante.</p>' + [0, 1, 2].map(function (i) { return '<div class="f"><input class="in" id="tm' + i + '" maxlength="90" placeholder="Prioridad ' + (i + 1) + '" value="' + esc((items[i] || {}).text || '') + '"></div>'; }).join('') + btns();
  onSheet(function (s) { if (s === 'save') { var arr = [0, 1, 2].map(function (i) { var old = items[i] || {}; var t = $('#tm' + i).value.trim(); return { text: t, done: !!(t && old.done && old.text === t) }; }); if (arr.every(function (x) { return !x.text; })) delete S.db.top3[k]; else S.db.top3[k] = arr; putDay('top3', k, S.db.top3[k] || null); closeSheet(); render(); toast('Mañana ya sabes por dónde empezar'); } });
  openSheet(); setTimeout(function () { var f = $('#tm0'); if (f) f.focus(); }, 60);
}

function sheetHabit(id) {
  var orig = id ? S.db.habits.filter(function (h) { return h.id === id; })[0] : null;
  var h = orig ? clone(orig) : { id: uid('h'), name: '', icon: 'star', color: COLORS[S.db.habits.length % COLORS.length], days: [], cue: '', since: ymd(new Date()) };
  function draw() {
    var all = !h.days || !h.days.length;
    card.innerHTML = '<h3>' + (orig ? 'Editar hábito' : 'Nuevo hábito') + '</h3>' +
      '<div class="f"><label>Hábito</label><input class="in" id="hName" value="' + esc(h.name) + '" placeholder="Ej.: Entrenar fuerza, 7.000 pasos…" maxlength="60"></div>' +
      '<div class="f"><label>Cuándo y dónde</label><input class="in" id="hCue" value="' + esc(h.cue || '') + '" placeholder="Ej.: al salir de MSH, antes de cenar" maxlength="80"><div class="hint">Un disparador concreto («si es X, entonces hago Y») ayuda mucho a que se quede.</div></div>' +
      '<div class="f"><label>Días que toca' + (all ? ' · todos' : '') + '</label><div class="days">' + DL.map(function (l, j) { var on = all || h.days.indexOf(j) >= 0; return '<button class="' + (on ? 'on' : '') + '" data-s="day" data-j="' + j + '">' + l + '</button>'; }).join('') + '</div><div class="hint">Los días que no toca no rompen la racha.</div></div>' +
      '<div class="f"><label>Icono</label><div class="icopick">' + ICON_KEYS.map(function (k) { return '<button class="' + (k === h.icon ? 'on' : '') + '" data-s="icon" data-k="' + k + '">' + ic(k) + '</button>'; }).join('') + '</div></div>' +
      '<div class="f"><label>Color</label><div class="chips">' + COLORS.map(function (c) { return '<button class="cdot' + (c === h.color ? ' on' : '') + '" style="background:' + c + '" data-s="color" data-c="' + c + '"></button>'; }).join('') + '</div></div>' +
      btns(orig ? '<button class="dbtn" data-s="archive">Archivar</button><button class="dbtn" style="margin-right:0" data-s="del">Borrar</button>' : '');
  }
  function sync() { h.name = $('#hName').value; h.cue = $('#hCue').value; }
  draw();
  onSheet(function (s, b) {
    sync();
    if (s === 'day') { var j = +b.getAttribute('data-j'), ds = (h.days && h.days.length) ? h.days.slice() : [0, 1, 2, 3, 4, 5, 6], ix = ds.indexOf(j); if (ix >= 0) { if (ds.length > 1) ds.splice(ix, 1); } else ds.push(j); ds.sort(); h.days = ds.length === 7 ? [] : ds; draw(); }
    else if (s === 'icon') { h.icon = b.getAttribute('data-k'); draw(); }
    else if (s === 'color') { h.color = b.getAttribute('data-c'); draw(); }
    else if (s === 'archive') { orig.archived = true; putDoc('habits'); closeSheet(); render(); toast('Archivado. Su historial se conserva.'); }
    else if (s === 'del') { if (b.getAttribute('data-sure')) { S.db.habits = S.db.habits.filter(function (x) { return x.id !== id; }); putDoc('habits'); closeSheet(); render(); toast('Hábito borrado'); } else { b.setAttribute('data-sure', '1'); b.textContent = '¿Seguro? Toca otra vez'; } }
    else if (s === 'save') { if (!h.name.trim()) { $('#hName').focus(); return; } h.name = h.name.trim(); h.cue = (h.cue || '').trim(); if (orig) { var i = S.db.habits.indexOf(orig); S.db.habits[i] = h; } else S.db.habits.push(h); putDoc('habits'); closeSheet(); render(); }
  });
  openSheet();
}

function sheetTx(id, type) {
  var orig = id ? S.db.tx.filter(function (t) { return t.id === id; })[0] : null;
  var t = orig ? clone(orig) : { type: type || 'expense', date: ymd(new Date()), amount: '', concept: '', cat: '' };
  if (!t.cat) { var l0 = catList(t.type); t.cat = l0[0] ? l0[0].id : '_'; }
  function draw() {
    var cats = catList(t.type), inc = t.type === 'income';
    card.innerHTML = '<h3>' + (orig ? 'Editar movimiento' : inc ? 'Nuevo ingreso' : 'Nuevo gasto') + '</h3>' +
      '<div class="typesw"><button class="ex' + (!inc ? ' on' : '') + '" data-s="type" data-v="expense">Gasto</button><button class="inc' + (inc ? ' on' : '') + '" data-s="type" data-v="income">Ingreso</button></div>' +
      '<div class="f"><label>Importe (€)</label><input class="in bigin" id="tAmt" inputmode="decimal" placeholder="0,00" value="' + esc(t.amount === '' ? '' : String(t.amount).replace('.', ',')) + '"></div>' +
      '<div class="f"><label>Concepto</label><input class="in" id="tCon" maxlength="60" placeholder="' + (inc ? 'Ej.: nómina, factura cobrada…' : 'Ej.: gasolina, Mercadona…') + '" value="' + esc(t.concept || '') + '"></div>' +
      '<div class="f"><label>Categoría</label><div class="chips">' + (cats.length ? cats.map(function (c) { return '<button class="chip' + (c.id === t.cat ? ' on' : '') + '" data-s="cat" data-id="' + esc(c.id) + '"><span class="dot" style="background:' + c.color + '"></span>' + esc(c.name) + '</button>'; }).join('') : '<span class="mutc">Sin categorías: crea alguna en ajustes.</span>') + '</div></div>' +
      '<div class="f"><label>Fecha</label><input class="in" type="date" id="tDate" value="' + esc(t.date) + '"></div>' +
      btns(orig ? '<button class="dbtn" data-s="del">Borrar</button>' : '');
  }
  function sync() { t.amount = $('#tAmt').value; t.concept = $('#tCon').value; t.date = $('#tDate').value || t.date; }
  draw();
  onSheet(function (s, b) {
    sync();
    if (s === 'type') { t.type = b.getAttribute('data-v'); var l = catList(t.type); t.cat = l[0] ? l[0].id : '_'; draw(); }
    else if (s === 'cat') { t.cat = b.getAttribute('data-id'); $$('.chip', card).forEach(function (c) { c.classList.toggle('on', c.getAttribute('data-id') === t.cat); }); }
    else if (s === 'del') {
      api('DELETE', '/api/tx/' + orig.id).then(function (gone) { S.db.tx = S.db.tx.filter(function (x) { return x.id !== orig.id; }); closeSheet(); render(); toast('Movimiento borrado', function () { delete gone.id; addTx(gone); }); }).catch(failed);
    }
    else if (s === 'save') {
      var v = num(t.amount); if (isNaN(v) || v <= 0) { $('#tAmt').focus(); toast('Pon un importe'); return; }
      var body = { type: t.type, date: t.date, amount: Math.round(v * 100) / 100, concept: t.concept.trim(), cat: t.cat };
      if (orig) { if (orig.recId) body.recId = orig.recId; api('PUT', '/api/tx/' + orig.id, body).then(function (sv) { var i = S.db.tx.indexOf(orig); S.db.tx[i] = sv; closeSheet(); render(); }).catch(failed); }
      else addTx(body).then(function (sv) { if (sv) { closeSheet(); toast(t.type === 'income' ? 'Ingreso apuntado' : 'Gasto apuntado'); } });
    }
  });
  openSheet(); setTimeout(function () { var a = $('#tAmt'); if (a && !orig) a.focus(); }, 60);
}

function sheetMoney() {
  var ex = clone(S.db.cats.expense), inc = clone(S.db.cats.income), rec = clone(S.db.recurring), bud = S.db.settings.budget || '';
  function opts(type, sel) { return (type === 'income' ? inc : ex).map(function (c) { return '<option value="' + esc(c.id) + '"' + (c.id === sel ? ' selected' : '') + '>' + esc(c.name || '—') + '</option>'; }).join(''); }
  function draw() {
    card.innerHTML = '<h3>Ajustes de dinero</h3><div class="f"><label>Presupuesto de gastos del mes (€)</label><input class="in" id="fBud" inputmode="decimal" value="' + esc(bud) + '" placeholder="Si lo dejas vacío, se suma el de las categorías"></div>' +
      '<div class="sect">CATEGORÍAS DE GASTO · PRESUPUESTO</div>' + ex.map(function (c, i) { return '<div class="row"><button class="cdot" style="background:' + c.color + '" data-s="ccolor" data-l="ex" data-i="' + i + '"></button><input class="in" data-l="ex" data-f="name" data-i="' + i + '" value="' + esc(c.name) + '" placeholder="Categoría"><input class="in" style="max-width:96px" inputmode="decimal" data-l="ex" data-f="budget" data-i="' + i + '" value="' + esc(c.budget || '') + '" placeholder="€"><button class="ibtn" data-s="cdel" data-l="ex" data-i="' + i + '">' + ic('x') + '</button></div>'; }).join('') +
      '<button class="addrow" data-s="cadd" data-l="ex">+ Categoría de gasto</button>' +
      '<div class="sect">CATEGORÍAS DE INGRESO</div>' + inc.map(function (c, i) { return '<div class="row"><button class="cdot" style="background:' + c.color + '" data-s="ccolor" data-l="inc" data-i="' + i + '"></button><input class="in" data-l="inc" data-f="name" data-i="' + i + '" value="' + esc(c.name) + '" placeholder="Categoría"><button class="ibtn" data-s="cdel" data-l="inc" data-i="' + i + '">' + ic('x') + '</button></div>'; }).join('') +
      '<button class="addrow" data-s="cadd" data-l="inc">+ Categoría de ingreso</button>' +
      '<div class="sect">FIJOS · CADA MES</div>' + rec.map(function (r, i) { var tp = r.type || 'expense'; return '<div class="hedit"><div class="row"><input class="in" data-l="rec" data-f="name" data-i="' + i + '" value="' + esc(r.name) + '" placeholder="Ej.: Alquiler, Nómina"><button class="ibtn" data-s="rdel" data-i="' + i + '">' + ic('x') + '</button></div><div class="row"><select class="in" style="max-width:110px" data-l="rec" data-f="type" data-i="' + i + '"><option value="expense"' + (tp === 'expense' ? ' selected' : '') + '>Gasto</option><option value="income"' + (tp === 'income' ? ' selected' : '') + '>Ingreso</option></select><input class="in" style="max-width:96px" inputmode="decimal" data-l="rec" data-f="amount" data-i="' + i + '" value="' + esc(r.amount || '') + '" placeholder="€"><input class="in" style="max-width:70px" inputmode="numeric" data-l="rec" data-f="day" data-i="' + i + '" value="' + esc(r.day || '') + '" placeholder="Día"><select class="in" data-l="rec" data-f="cat" data-i="' + i + '">' + opts(tp, r.cat) + '</select></div></div>'; }).join('') +
      '<button class="addrow" data-s="radd">+ Fijo mensual</button>' + btns();
  }
  draw();
  function onField(e) { var el = e.target, l = el.getAttribute('data-l'), f = el.getAttribute('data-f'), i = +el.getAttribute('data-i'); if (el.id === 'fBud') bud = el.value; else if (l && f) { var arr = l === 'ex' ? ex : l === 'inc' ? inc : rec; arr[i][f] = el.value; if (l === 'rec' && f === 'type') { var cl = el.value === 'income' ? inc : ex; arr[i].cat = cl[0] ? cl[0].id : ''; draw(); } } }
  card.oninput = onField; card.onchange = onField;
  onSheet(function (s, b) {
    var l = b.getAttribute('data-l'), i = +b.getAttribute('data-i'), arr = l === 'inc' ? inc : ex;
    if (s === 'ccolor') { arr[i].color = COLORS[(COLORS.indexOf(arr[i].color) + 1) % COLORS.length]; draw(); }
    else if (s === 'cdel') { arr.splice(i, 1); draw(); }
    else if (s === 'cadd') { arr.push({ id: uid('c'), name: '', color: COLORS[arr.length % COLORS.length], budget: '' }); draw(); var ins = $$('input[data-l="' + l + '"][data-f="name"]', card); if (ins.length) ins[ins.length - 1].focus(); }
    else if (s === 'rdel') { rec.splice(i, 1); draw(); }
    else if (s === 'radd') { rec.push({ id: uid('r'), name: '', type: 'expense', amount: '', day: '', cat: ex[0] ? ex[0].id : '' }); draw(); }
    else if (s === 'save') {
      var bv = num(bud); S.db.settings.budget = isNaN(bv) ? 0 : bv;
      S.db.cats = {
        expense: ex.filter(function (c) { return String(c.name).trim(); }).map(function (c) { var v = num(c.budget); return { id: c.id, name: c.name.trim(), color: c.color, budget: isNaN(v) ? 0 : v }; }),
        income: inc.filter(function (c) { return String(c.name).trim(); }).map(function (c) { return { id: c.id, name: c.name.trim(), color: c.color }; })
      };
      S.db.recurring = rec.filter(function (r) { return String(r.name).trim() && !isNaN(num(r.amount)); }).map(function (r) { var d = parseInt(r.day, 10); return { id: r.id, name: r.name.trim(), type: r.type || 'expense', amount: num(r.amount), day: isNaN(d) ? 1 : Math.max(1, Math.min(28, d)), cat: r.cat }; });
      Promise.all([putDoc('settings'), putDoc('cats'), putDoc('recurring')]); closeSheet(); render();
    }
  });
  openSheet();
}

function sheetGoal(id) {
  var now = new Date(), orig = id ? S.db.goals.filter(function (g) { return g.id === id; })[0] : null;
  var g = orig ? clone(orig) : { id: uid('g'), name: '', icon: 'star', color: COLORS[S.db.goals.length % COLORS.length], current: 0, target: '', unit: '', note: '', year: S.route === 'objetivos' ? S.gy : now.getFullYear() };
  function draw() {
    var step = (+g.target || 0) >= 1000 ? 50 : 1;
    card.innerHTML = '<h3>' + (orig ? esc(orig.name) : 'Nuevo objetivo') + '</h3>' +
      '<div class="f"><label>Llevas</label><div class="stepper"><button data-s="minus">−</button><input class="in bigin" id="gCur" inputmode="decimal" value="' + esc(String(g.current).replace('.', ',')) + '" style="text-align:center"><button data-s="plus">+</button></div><div class="hint">Los botones suman o restan ' + step + '.</div></div>' +
      '<div class="f"><label>Objetivo</label><input class="in" id="gName" value="' + esc(g.name) + '" placeholder="Ej.: Ahorrar 6.000 €, leer 20 libros…"></div>' +
      '<div class="row" style="align-items:flex-start"><div class="f" style="flex:1"><label>Meta</label><input class="in" id="gTgt" inputmode="decimal" value="' + esc(g.target) + '" placeholder="Ej.: 6000"></div><div class="f" style="flex:1"><label>Unidad</label><input class="in" id="gUnit" value="' + esc(g.unit) + '" placeholder="€, libros, km…"></div><div class="f" style="width:90px"><label>Año</label><input class="in" id="gYear" inputmode="numeric" value="' + esc(g.year) + '"></div></div>' +
      '<div class="f"><label>Nota (opcional)</label><input class="in" id="gNote" value="' + esc(g.note || '') + '" placeholder="Ej.: siguiente paso…"></div>' +
      '<div class="f"><label>Icono</label><div class="icopick">' + ICON_KEYS.map(function (k) { return '<button class="' + (k === g.icon ? 'on' : '') + '" data-s="icon" data-k="' + k + '">' + ic(k) + '</button>'; }).join('') + '</div></div>' +
      '<div class="f"><label>Color</label><div class="chips">' + COLORS.map(function (c) { return '<button class="cdot' + (c === g.color ? ' on' : '') + '" style="background:' + c + '" data-s="color" data-c="' + c + '"></button>'; }).join('') + '</div></div>' +
      btns(orig ? '<button class="dbtn" data-s="del">Borrar</button>' : '');
  }
  function sync() { var c = num($('#gCur').value); g.current = isNaN(c) ? 0 : c; g.name = $('#gName').value; var t = num($('#gTgt').value); g.target = isNaN(t) ? '' : t; g.unit = $('#gUnit').value.trim(); g.note = $('#gNote').value.trim(); var y = parseInt($('#gYear').value, 10); g.year = isNaN(y) ? now.getFullYear() : y; }
  draw();
  onSheet(function (s, b) {
    sync(); var step = (+g.target || 0) >= 1000 ? 50 : 1;
    if (s === 'minus') { g.current = Math.max(0, Math.round((g.current - step) * 100) / 100); draw(); }
    else if (s === 'plus') { g.current = Math.round((g.current + step) * 100) / 100; draw(); }
    else if (s === 'icon') { g.icon = b.getAttribute('data-k'); draw(); }
    else if (s === 'color') { g.color = b.getAttribute('data-c'); draw(); }
    else if (s === 'del') { var gone = orig; S.db.goals = S.db.goals.filter(function (x) { return x.id !== g.id; }); putDoc('goals'); closeSheet(); render(); toast('Objetivo borrado', function () { S.db.goals.push(gone); putDoc('goals'); render(); }); }
    else if (s === 'save') { if (!g.name.trim()) { $('#gName').focus(); return; } g.name = g.name.trim(); g.target = g.target === '' ? 0 : +g.target; var ix = S.db.goals.indexOf(orig); if (ix >= 0) S.db.goals[ix] = g; else S.db.goals.push(g); putDoc('goals'); closeSheet(); render(); }
  });
  openSheet();
}

function sheetMenu() {
  card.innerHTML = '<h3>Más</h3>' +
    '<button class="menuitem" data-s="head">' + ic('edit') + '<span>Nombre, foco y frase<small>Lo que ves arriba en Hoy</small></span></button>' +
    '<button class="menuitem" data-s="money">' + ic('wallet') + '<span>Presupuesto, categorías y fijos</span></button>' +
    '<a class="menuitem" href="/api/export">' + ic('download') + '<span>Descargar copia de seguridad<small>Todos tus datos en un archivo .json</small></span></a>' +
    '<label class="menuitem" style="cursor:pointer">' + ic('upload') + '<span>Restaurar una copia<small>Sustituye los datos actuales</small></span><input type="file" id="impFile" accept="application/json,.json" hidden></label>' +
    '<button class="menuitem" data-s="install">' + ic('phone') + '<span>Ponerla en la pantalla de inicio<small>Para que la abras como una app cada mañana</small></span></button>' +
    '<button class="menuitem" data-s="logout">' + ic('logout') + '<span>Cerrar sesión</span></button>' +
    '<div class="sbtns"><button class="gbtn" data-close="1">Cerrar</button></div>';
  onSheet(function (s) {
    if (s === 'head') { closeSheet(); sheetHead(); }
    else if (s === 'money') { closeSheet(); sheetMoney(); }
    else if (s === 'install') { card.innerHTML = '<h3>En tu pantalla de inicio</h3><div class="nlist"><div class="nitem"><div class="nd">Android (Chrome)</div><p>Menú ⋮ → «Añadir a pantalla de inicio» o «Instalar aplicación».</p></div><div class="nitem"><div class="nd">iPhone (Safari)</div><p>Botón compartir → «Añadir a pantalla de inicio».</p></div><div class="nitem"><div class="nd">Ordenador</div><p>En Chrome, el icono de instalar de la barra de direcciones; o ponla como página de inicio del navegador.</p></div></div><div class="sbtns"><button class="abtn" data-close="1">Entendido</button></div>'; }
    else if (s === 'logout') { api('POST', '/api/logout').then(function () { closeSheet(); showLogin(); }); }
  });
  card.onchange = function (e) {
    if (e.target.id !== 'impFile' || !e.target.files[0]) return;
    var fr = new FileReader();
    fr.onload = function () { try { var data = JSON.parse(fr.result); api('POST', '/api/import', data).then(function () { closeSheet(); toast('Copia restaurada'); load(); }).catch(failed); } catch (err) { toast('Ese archivo no es una copia válida'); } };
    fr.readAsText(e.target.files[0]);
  };
  openSheet();
}

/* ================= login ================= */
function showLogin() {
  document.body.classList.add('login'); closeSheet();
  $('#app').innerHTML = '<div class="loginbox"><h1>Blazquez<em>diario</em></h1><p>Tu día, tus hábitos, tu dinero y tu año.</p><form id="lf"><input class="in" type="password" id="lp" placeholder="Contraseña" autocomplete="current-password" autofocus><button class="abtn full" type="submit">Entrar</button><div class="err" id="lerr"></div></form></div>';
  $('#lf').addEventListener('submit', function (e) {
    e.preventDefault();
    api('POST', '/api/login', { password: $('#lp').value }).then(load).catch(function (err) { $('#lerr').textContent = err.message === 'login' ? 'Contraseña incorrecta' : err.message; });
  });
}

/* ================= toast ================= */
var toastT;
function toast(msg, undo) {
  var t = $('#toast'); t.innerHTML = '<span>' + esc(msg) + '</span>' + (undo ? '<button id="undoBtn">Deshacer</button>' : '');
  t.classList.add('show');
  if (undo) $('#undoBtn').onclick = function () { undo(); t.classList.remove('show'); };
  clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('show'); }, undo ? 5000 : 3000);
}

/* ================= arranque ================= */
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(function () {});
load().catch(function (e) { if (e.message !== 'login') $('#app').innerHTML = '<div class="loading">No llego al servidor. ¿Hay conexión?</div>'; });
})();
