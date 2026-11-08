# NextCraft

Course marketplace where **students** find and join practical courses and **trainers** publish courses, talk to their students and get verified.

- **Front end:** the original HTML pages in `public/` (landing page, student dashboard, trainer dashboard) plus a small admin page.
- **Back end:** Node.js + Express + SQLite (`better-sqlite3`). One server serves both the pages and the API, so there is no CORS setup and nothing to configure.

---

## 1. Run it locally

You need **Node.js 20 or 22 (LTS)**. Download it from <https://nodejs.org> if `node -v` doesn't print v20 or v22.

```bash
git clone https://github.com/chemilimane30-cyber/next.git
cd next
npm install
npm start
```

Then open **http://localhost:3000**.

On the first start the database is created in `data/nextcraft.db` and filled with demo data, so the dashboards aren't empty:

| Role    | Email                    | Password       |
|---------|--------------------------|----------------|
| Student | `student@nextcraft.test` | `Password123!` |
| Trainer | `trainer@nextcraft.test` | `Password123!` |
| Admin   | `admin@nextcraft.test`   | `Password123!` |

You can also just sign up with the forms on the landing page.

> ⚠️ Always open the site through `http://localhost:3000`. Double-clicking the `.html` files (`file://…`) will not work, because the pages talk to the API on the same server.

### Useful commands

| Command | What it does |
|---|---|
| `npm start` | Start the server |
| `npm run dev` | Start and auto-restart when you edit a server file |
| `npm run reset` | **Wipe all data** and reload the demo data |
| `npm run create-admin -- you@mail.com "StrongPass123" "Your Name"` | Create a real admin account |

To try two users talking to each other, log in as the student in a normal window and as the trainer in a private/incognito window. Messages appear on the other side within ~4 seconds.

---

## 2. How it fits together

```
Browser ──► Express server (server.js)
              ├─ /                       public/index.html (landing, sign-up, login)
              ├─ /student-dashboard.html  only for logged-in students
              ├─ /trainer-dashboard.html  only for logged-in trainers
              ├─ /admin.html              only for admins (approve trainers)
              └─ /api/...                 JSON API ──► SQLite (data/nextcraft.db)
                                                   └─ uploaded files (uploads/, private)
```

- **Login:** passwords are hashed with bcrypt. On login the server sets an `httpOnly` cookie containing a signed token (JWT, valid 7 days). Every page and API call uses that cookie automatically.
- **Roles:** each user is a `student`, `trainer` or `admin`. Opening a dashboard for the wrong role redirects you to your own.
- **Messaging:** a student can message the trainers of courses they're enrolled in, and vice versa.
- **Reviews:** only students enrolled in a course can review it. Course ratings are the average of their reviews.
- **Verification:** trainers upload certificates (PDF/JPG/PNG, max 10 MB). An admin approves or rejects them on `/admin.html`. Uploaded files are never publicly reachable; only the owner and admins can download them.

### Project layout

```
server.js            starts Express, page guards, error handling
db.js                SQLite connection + table definitions
lib.js               validation helpers, course formatting, upload settings
seed.js              demo data (auto-loaded on first start)
middleware/auth.js   login cookie, requireRole()
routes/
  auth.js            register (student/trainer), login, logout, me, profile, password
  courses.js         catalogue, enrol, saved courses, reviews
  trainer.js         trainer's courses, students, progress, reviews, stats, verification
  messages.js        conversations
  admin.js           trainer approvals, document downloads
scripts/create-admin.js
public/
  index.html, student-dashboard.html, trainer-dashboard.html, admin.html
  js/api.js          shared fetch helper used by all pages
```

### Database tables

`users`, `student_profiles`, `trainer_profiles`, `courses`, `enrollments`, `saved_courses`, `reviews`, `messages`, `verification_documents`. See `db.js`.

### API overview

All endpoints take and return JSON (uploads use `multipart/form-data`).

| Method & path | Who | Purpose |
|---|---|---|
| `POST /api/auth/register/student` | anyone | Create student account and log in |
| `POST /api/auth/register/trainer` | anyone | Create trainer account (+ optional `certificate` file) |
| `POST /api/auth/login` / `POST /api/auth/logout` | anyone | Log in / out |
| `GET /api/auth/me` · `PUT /api/auth/me` | logged in | Current user / update profile |
| `PUT /api/auth/password` | logged in | Change password |
| `GET /api/courses?search=&category=&level=&format=&minRating=` | anyone | Published courses |
| `GET /api/courses/:id` · `GET /api/courses/:id/reviews` | anyone | Course details / its reviews |
| `POST /api/courses/:id/enroll` | student | Enrol (respects max students) |
| `GET /api/student/enrollments` | student | My courses + progress |
| `GET/POST/DELETE /api/student/saved[/:courseId]` | student | Saved courses |
| `POST /api/courses/:id/reviews` | enrolled student | Add or update my review |
| `GET /api/reviews` | anyone | Latest reviews |
| `GET/POST /api/trainer/courses` · `PUT/DELETE /api/trainer/courses/:id` | trainer | Manage own courses |
| `GET /api/trainer/students` · `PATCH /api/trainer/enrollments/:id` | trainer | Enrolled students / set progress |
| `GET /api/trainer/reviews` · `POST /api/trainer/reviews/:id/reply` | trainer | Reviews on my courses / reply |
| `GET /api/trainer/stats` | trainer | Dashboard + earnings numbers |
| `GET/POST /api/trainer/verification` | trainer | Status / upload documents |
| `GET /api/messages/contacts` · `GET/POST /api/messages/:userId` | student, trainer | Conversations |
| `GET /api/admin/trainers?status=` · `POST /api/admin/trainers/:id/status` | admin | Review trainers |

---

## 3. Putting it online

SQLite stores everything in a file, so the host must give the app a **persistent disk**. Static hosts (GitHub Pages, Netlify) and serverless hosts (Vercel) won't work for this back end.

Good options: **Render** (Web Service + Disk), **Railway** (with a Volume), **Fly.io** (with a volume), or any small VPS.

Typical settings:

- Build command: `npm install`
- Start command: `npm start`
- Environment variables:
  - `NODE_ENV=production`
  - `JWT_SECRET=` a long random string (`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`)
  - `SEED_DEMO=false`
  - `DB_PATH` and `UPLOAD_DIR` pointing inside the mounted disk, e.g. `/var/data/nextcraft.db` and `/var/data/uploads`

Then create your admin with `npm run create-admin -- …` from the host's shell.

---

## 4. Not included yet

- **Payments:** courses have prices, and "earnings" are computed as enrolments × price, but there is no checkout. Stripe (or a local gateway such as CIB/Edahabia via a provider) would plug into the enrol step.
- **Email:** no email confirmation or "forgot password" yet (the links are still placeholders).
- **Course images** are URLs typed by the trainer; there's no image upload for courses yet.
