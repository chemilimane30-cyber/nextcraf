// Small shared helpers: validation, course shaping, file uploads.
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');

const CATEGORIES = [
  'Data Analysis', 'UI/UX Design', 'Graphic Design & Branding', 'Digital Marketing & SEO',
  'Cybersecurity', 'Project Management', 'Web & Mobile Development', 'Video Editing',
];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const FORMATS = ['Online', 'In-person', 'Both'];

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

// Trimmed string, required or optional, with a max length.
function str(value, field, { required = false, max = 2000 } = {}) {
  const s = value === undefined || value === null ? '' : String(value).trim();
  if (required && !s) throw new HttpError(400, `${field} is required.`);
  if (s.length > max) throw new HttpError(400, `${field} is too long (max ${max} characters).`);
  return s;
}

function oneOf(value, field, allowed, fallback) {
  if ((value === undefined || value === '') && fallback !== undefined) return fallback;
  if (!allowed.includes(value)) throw new HttpError(400, `${field} must be one of: ${allowed.join(', ')}.`);
  return value;
}

function int(value, field, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < min || n > max) throw new HttpError(400, `${field} must be a number between ${min} and ${max}.`);
  return n;
}

function email(value) {
  const e = str(value, 'Email', { required: true, max: 200 }).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) throw new HttpError(400, 'Please enter a valid email address.');
  return e;
}

function password(value) {
  const p = value === undefined ? '' : String(value);
  if (p.length < 8) throw new HttpError(400, 'Password must be at least 8 characters.');
  if (p.length > 200) throw new HttpError(400, 'Password is too long.');
  return p;
}

// Wraps async/sync route handlers so thrown errors reach the error middleware.
const wrap = fn => (req, res, next) => {
  try { Promise.resolve(fn(req, res, next)).catch(next); } catch (e) { next(e); }
};

// Shape a course row (joined with trainer name + rating stats) for the front end.
function shapeCourse(row) {
  return {
    id: row.id,
    trainerId: row.trainer_id,
    trainer: row.trainer_name,
    trainerVerified: row.verification_status === 'verified',
    title: row.title,
    category: row.category,
    description: row.description,
    learnings: row.learnings ? row.learnings.split(',').map(s => s.trim()).filter(Boolean) : [],
    level: row.level,
    duration: row.duration,
    format: row.format,
    location: row.location,
    maxStudents: row.max_students,
    price: row.price,
    image: row.image,
    schedule: row.schedule,
    status: row.status,
    rating: row.rating ? Math.round(row.rating * 10) / 10 : 0,
    reviewsCount: row.reviews_count || 0,
    enrolledCount: row.enrolled_count || 0,
  };
}

// SELECT used everywhere a course is listed, so ratings/enrolment counts are consistent.
const COURSE_SELECT = `
  SELECT c.*, u.name AS trainer_name, tp.verification_status,
         (SELECT AVG(rating) FROM reviews r WHERE r.course_id = c.id) AS rating,
         (SELECT COUNT(*)    FROM reviews r WHERE r.course_id = c.id) AS reviews_count,
         (SELECT COUNT(*)    FROM enrollments e WHERE e.course_id = c.id) AS enrolled_count
  FROM courses c
  JOIN users u ON u.id = c.trainer_id
  LEFT JOIN trainer_profiles tp ON tp.user_id = c.trainer_id
`;

// ---- Uploads: stored privately in ./uploads with random names, never served statically ----
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_EXT = ['.pdf', '.jpg', '.jpeg', '.png'];
const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, crypto.randomBytes(16).toString('hex') + ext);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024, files: 3 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) return cb(new HttpError(400, 'Only PDF, JPG and PNG files are allowed.'));
    cb(null, true);
  },
});

module.exports = {
  CATEGORIES, LEVELS, FORMATS, HttpError, str, oneOf, int, email, password, wrap,
  shapeCourse, COURSE_SELECT, upload, UPLOAD_DIR,
};
