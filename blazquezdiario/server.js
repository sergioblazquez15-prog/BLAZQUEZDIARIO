// Blazquezdiario — servidor sin dependencias (solo Node.js)
// Guarda todo en data/db.json con copias de seguridad diarias.
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = parseInt(process.env.PORT || '3080', 10);
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const PUBLIC_DIR = path.join(__dirname, 'public');
const PASSWORD = process.env.APP_PASSWORD || '';
const SECRET = process.env.SESSION_SECRET || crypto.createHash('sha256').update('bd:' + PASSWORD).digest('hex');
const SESSION_DAYS = 180;

if (!PASSWORD) {
  console.error('⚠️  Falta APP_PASSWORD en el archivo .env. No arranco sin contraseña.');
  process.exit(1);
}

fs.mkdirSync(path.join(DATA_DIR, 'backups'), { recursive: true });
const DB_FILE = path.join(DATA_DIR, 'db.json');

// ---------- base de datos ----------
const EMPTY = () => ({
  version: 1,
  settings: { name: 'Sergio', focus: '', quote: '', quoteBy: '', budget: 0 },
  habits: [],
  habitLog: {},
  top3: {},
  notes: {},
  cats: { expense: [], income: [] },
  tx: [],
  recurring: [],
  goals: []
});

let db;
try {
  db = Object.assign(EMPTY(), JSON.parse(fs.readFileSync(DB_FILE, 'utf8')));
} catch (e) {
  if (fs.existsSync(DB_FILE)) {
    console.error('No he podido leer db.json. Lo copio a db.roto.json y empiezo con uno nuevo.');
    fs.copyFileSync(DB_FILE, path.join(DATA_DIR, 'db.roto-' + Date.now() + '.json'));
  }
  db = EMPTY();
  seed(db);
  writeNow();
}

function seed(d) {
  const today = new Date().toISOString().slice(0, 10);
  d.habits = [
    { id: 'h1', name: 'Entrenar fuerza', icon: 'dumbbell', color: '#e8875a', days: [0, 2, 4], since: today, cue: 'Al salir de MSH, antes de cenar' },
    { id: 'h2', name: '7.000 pasos', icon: 'run', color: '#74c69d', days: [], since: today, cue: '' },
    { id: 'h3', name: 'Proteína en cada comida', icon: 'food', color: '#e9b44c', days: [], since: today, cue: '' },
    { id: 'h4', name: 'Dormir 7 h o más', icon: 'moon', color: '#a99be8', days: [], since: today, cue: 'Móvil fuera del cuarto a las 23:30' },
    { id: 'h5', name: 'Planificar mañana (Las 3)', icon: 'pen', color: '#7aa7e8', days: [], since: today, cue: 'Antes de cerrar el día' },
    { id: 'h6', name: 'Bloque de foco 90 min', icon: 'briefcase', color: '#5fc4c0', days: [0, 1, 2, 3, 4], since: today, cue: 'Primera hora, sin WhatsApp' }
  ];
  d.cats = {
    expense: [
      { id: 'c1', name: 'Casa', color: '#7aa7e8', budget: 0 },
      { id: 'c2', name: 'Comida', color: '#e8798f', budget: 0 },
      { id: 'c3', name: 'Coche y gasolina', color: '#e9b44c', budget: 0 },
      { id: 'c4', name: 'Ocio', color: '#e8875a', budget: 0 },
      { id: 'c5', name: 'Suscripciones', color: '#a99be8', budget: 0 },
      { id: 'c6', name: 'Deporte y salud', color: '#74c69d', budget: 0 },
      { id: 'c7', name: 'Otros', color: '#c9a96e', budget: 0 }
    ],
    income: [
      { id: 'i1', name: 'Nómina MSH', color: '#74c69d' },
      { id: 'i2', name: 'ADNB', color: '#7aa7e8' },
      { id: 'i3', name: 'Villar del Olmo', color: '#e9b44c' },
      { id: 'i4', name: 'Extras', color: '#a99be8' }
    ]
  };
  const y = new Date().getFullYear();
  d.goals = [
    { id: 'g1', name: 'Fondo de emergencia', icon: 'piggy', color: '#74c69d', current: 0, target: 0, unit: '€', note: '', year: y },
    { id: 'g2', name: 'Lanzar el canal de entrenadores', icon: 'video', color: '#a99be8', current: 0, target: 1, unit: 'canal', note: '', year: y },
    { id: 'g3', name: 'Vacaciones planificadas fuera de agosto', icon: 'plane', color: '#5fc4c0', current: 0, target: 1, unit: 'plan', note: '', year: y }
  ];
}

let writeTimer = null;
function save() {
  clearTimeout(writeTimer);
  writeTimer = setTimeout(writeNow, 150);
}
function writeNow() {
  const tmp = DB_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db));
  fs.renameSync(tmp, DB_FILE);
  backup();
}
function backup() {
  const day = new Date().toISOString().slice(0, 10);
  const f = path.join(DATA_DIR, 'backups', 'db-' + day + '.json');
  if (!fs.existsSync(f)) {
    fs.copyFileSync(DB_FILE, f);
    const files = fs.readdirSync(path.join(DATA_DIR, 'backups')).filter(n => n.startsWith('db-')).sort();
    while (files.length > 60) fs.unlinkSync(path.join(DATA_DIR, 'backups', files.shift()));
  }
}

// ---------- sesiones ----------
function sign(v) { return crypto.createHmac('sha256', SECRET).update(v).digest('base64url'); }
function makeToken() {
  const exp = Date.now() + SESSION_DAYS * 864e5;
  const body = exp + '.' + crypto.randomBytes(8).toString('hex');
  return body + '.' + sign(body);
}
function validToken(t) {
  if (!t) return false;
  const i = t.lastIndexOf('.');
  if (i < 0) return false;
  const body = t.slice(0, i), sig = t.slice(i + 1);
  const good = sign(body);
  if (sig.length !== good.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(good))) return false;
  return parseInt(body.split('.')[0], 10) > Date.now();
}
function cookies(req) {
  const out = {};
  (req.headers.cookie || '').split(';').forEach(p => {
    const i = p.indexOf('=');
    if (i > 0) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  return out;
}
function authed(req) { return validToken(cookies(req).bd_s); }
function pwOk(p) {
  const a = crypto.createHash('sha256').update(String(p || '')).digest();
  const b = crypto.createHash('sha256').update(PASSWORD).digest();
  return crypto.timingSafeEqual(a, b);
}
const attempts = new Map();
function tooMany(ip) {
  const now = Date.now(), a = (attempts.get(ip) || []).filter(t => now - t < 15 * 60e3);
  attempts.set(ip, a);
  return a.length >= 10;
}

// ---------- utilidades ----------
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
function send(res, code, obj, headers) {
  const body = typeof obj === 'string' ? obj : JSON.stringify(obj);
  res.writeHead(code, Object.assign({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }, headers || {}));
  res.end(body);
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', c => { size += c.length; if (size > 5e6) { reject(new Error('too big')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => {
      if (!chunks.length) return resolve({});
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); } catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}
const isArr = Array.isArray;
const isObj = v => v && typeof v === 'object' && !isArr(v);

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.json': 'application/json', '.ico': 'image/x-icon' };
function serveStatic(req, res, p) {
  if (p === '/' || p === '') p = '/index.html';
  const f = path.normalize(path.join(PUBLIC_DIR, p));
  if (!f.startsWith(PUBLIC_DIR)) return send(res, 403, { error: 'no' });
  fs.readFile(f, (err, data) => {
    if (err) {
      // SPA: cualquier ruta desconocida devuelve la app
      return fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (e2, d2) => {
        if (e2) return send(res, 404, { error: 'not found' });
        res.writeHead(200, { 'Content-Type': MIME['.html'], 'Cache-Control': 'no-cache' }); res.end(d2);
      });
    }
    const ext = path.extname(f);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': ext === '.html' || p === '/sw.js' ? 'no-cache' : 'public, max-age=300' });
    res.end(data);
  });
}

// ---------- API ----------
const DOCS = ['settings', 'habits', 'cats', 'recurring', 'goals'];

async function api(req, res, p) {
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
  const https = (req.headers['x-forwarded-proto'] || '') === 'https';

  if (p === '/api/login' && req.method === 'POST') {
    if (tooMany(ip)) return send(res, 429, { error: 'Demasiados intentos. Espera 15 minutos.' });
    const b = await readBody(req).catch(() => ({}));
    if (!pwOk(b.password)) { attempts.get(ip).push(Date.now()); return send(res, 401, { error: 'Contraseña incorrecta' }); }
    const c = 'bd_s=' + makeToken() + '; Path=/; HttpOnly; SameSite=Lax; Max-Age=' + SESSION_DAYS * 86400 + (https ? '; Secure' : '');
    return send(res, 200, { ok: true }, { 'Set-Cookie': c });
  }
  if (p === '/api/logout' && req.method === 'POST') {
    return send(res, 200, { ok: true }, { 'Set-Cookie': 'bd_s=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax' });
  }
  if (p === '/api/health') return send(res, 200, { ok: true });
  if (!authed(req)) return send(res, 401, { error: 'login' });

  const m = req.method;
  let parts = p.split('/').filter(Boolean).slice(1); // sin "api"

  if (parts[0] === 'state' && m === 'GET') return send(res, 200, db);

  if (parts[0] === 'export' && m === 'GET') {
    return send(res, 200, JSON.stringify(db, null, 2), { 'Content-Disposition': 'attachment; filename="blazquezdiario-' + new Date().toISOString().slice(0, 10) + '.json"' });
  }
  if (parts[0] === 'import' && m === 'POST') {
    const b = await readBody(req);
    if (!isObj(b) || !isArr(b.habits) || !isObj(b.settings)) return send(res, 400, { error: 'Archivo no válido' });
    fs.copyFileSync(DB_FILE, path.join(DATA_DIR, 'backups', 'antes-de-importar-' + Date.now() + '.json'));
    db = Object.assign(EMPTY(), b); save();
    return send(res, 200, { ok: true });
  }

  // documentos completos: settings, habits, cats, recurring, goals
  if (parts[0] === 'doc' && DOCS.includes(parts[1]) && m === 'PUT') {
    const b = await readBody(req);
    const v = b.value;
    if (parts[1] === 'settings' || parts[1] === 'cats') { if (!isObj(v)) return send(res, 400, { error: 'formato' }); }
    else if (!isArr(v)) return send(res, 400, { error: 'formato' });
    db[parts[1]] = v; save();
    return send(res, 200, { ok: true });
  }

  // registros por día: habitLog, top3, notes
  const DAYMAP = { habits: 'habitLog', top3: 'top3', notes: 'notes' };
  if (parts[0] === 'day' && DAYMAP[parts[1]] && DATE_RE.test(parts[2] || '') && m === 'PUT') {
    const b = await readBody(req);
    const key = DAYMAP[parts[1]], v = b.value;
    const empty = v == null || (isArr(v) && v.length === 0) || (isObj(v) && !Object.keys(v).length);
    if (empty) delete db[key][parts[2]]; else db[key][parts[2]] = v;
    save();
    return send(res, 200, { ok: true });
  }

  // movimientos
  if (parts[0] === 'tx') {
    if (m === 'POST') {
      const t = await readBody(req);
      if (!DATE_RE.test(t.date || '') || !(+t.amount > 0) || !['expense', 'income'].includes(t.type)) return send(res, 400, { error: 'Movimiento no válido' });
      t.id = t.id || crypto.randomBytes(6).toString('hex');
      t.amount = Math.round(+t.amount * 100) / 100;
      t.ts = Date.now();
      db.tx.push(t); save();
      return send(res, 200, t);
    }
    const id = parts[1];
    const ix = db.tx.findIndex(t => t.id === id);
    if (ix < 0) return send(res, 404, { error: 'No existe' });
    if (m === 'PUT') {
      const t = await readBody(req);
      if (!DATE_RE.test(t.date || '') || !(+t.amount > 0)) return send(res, 400, { error: 'Movimiento no válido' });
      db.tx[ix] = Object.assign(db.tx[ix], t, { id, amount: Math.round(+t.amount * 100) / 100 }); save();
      return send(res, 200, db.tx[ix]);
    }
    if (m === 'DELETE') { const gone = db.tx.splice(ix, 1)[0]; save(); return send(res, 200, gone); }
  }

  return send(res, 404, { error: 'No encontrado' });
}

const server = http.createServer(async (req, res) => {
  const p = decodeURIComponent((req.url || '/').split('?')[0]);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'same-origin');
  try {
    if (p.startsWith('/api/')) return await api(req, res, p);
    return serveStatic(req, res, p);
  } catch (e) {
    console.error(e);
    send(res, 500, { error: 'Error del servidor' });
  }
});

server.listen(PORT, () => console.log('Blazquezdiario escuchando en el puerto ' + PORT));
process.on('SIGTERM', () => { clearTimeout(writeTimer); try { writeNow(); } catch (e) {} process.exit(0); });
