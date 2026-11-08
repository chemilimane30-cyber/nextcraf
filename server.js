// NextCraft server: serves the front end from ./public and the JSON API under /api.
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const cookieParser = require('cookie-parser');
const multer = require('multer');

const db = require('./db');
const { attachUser } = require('./middleware/auth');
const { HttpError } = require('./lib');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(attachUser);

// ---- API ----
app.use('/api/auth', require('./routes/auth').router);
app.use('/api', require('./routes/courses').router);
app.use('/api/trainer', require('./routes/trainer'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/admin', require('./routes/admin'));
app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found.' }));

// ---- Protected pages: redirect to the landing page if not logged in with the right role ----
const pageGuard = (page, role) => (req, res, next) => {
  if (!req.user) return res.redirect('/?login=1');
  if (req.user.role !== role) {
    const home = { student: '/student-dashboard.html', trainer: '/trainer-dashboard.html', admin: '/admin.html' }[req.user.role];
    return res.redirect(home);
  }
  res.set('Cache-Control', 'no-store');
  res.sendFile(path.join(PUBLIC_DIR, page));
};
app.get('/student-dashboard.html', pageGuard('student-dashboard.html', 'student'));
app.get('/trainer-dashboard.html', pageGuard('trainer-dashboard.html', 'trainer'));
app.get('/admin.html', pageGuard('admin.html', 'admin'));

app.use(express.static(PUBLIC_DIR, { extensions: ['html'] }));
app.get('/favicon.ico', (_req, res) => res.status(204).end());

// ---- Errors ----
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  // A request that failed after files were saved shouldn't leave them behind.
  const saved = [req.file, ...Object.values(req.files || {}).flat()].filter(Boolean);
  for (const f of saved) fs.unlink(f.path, () => {});

  let status = err instanceof HttpError ? err.status : 500;
  let message = err.message;
  if (err instanceof multer.MulterError) {
    status = 400;
    message = err.code === 'LIMIT_FILE_SIZE' ? 'File is larger than 10 MB.' : 'Upload failed: ' + err.message;
  } else if (err.type === 'entity.parse.failed') {
    status = 400; message = 'Invalid JSON body.';
  }
  if (status === 500) {
    console.error(err);
    message = 'Something went wrong on the server.';
  }
  res.status(status).json({ error: message });
});

// First run: fill an empty database with demo data so the dashboards aren't blank.
const userCount = db.prepare('SELECT COUNT(*) n FROM users').get().n;
if (userCount === 0 && process.env.SEED_DEMO !== 'false') {
  require('./seed').seed();
  console.log('Empty database: loaded demo data (set SEED_DEMO=false to skip).');
}

app.listen(PORT, () => {
  console.log(`NextCraft running at http://localhost:${PORT}`);
});
