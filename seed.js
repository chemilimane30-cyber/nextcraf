// Demo data. Runs automatically on first start when the database is empty.
//   npm run seed    -> add demo data if the database is empty
//   npm run reset   -> wipe ALL data and reload the demo data
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db');

const DEMO_PASSWORD = 'Password123!';

const trainers = [
  { key: 'elena', name: 'Elena Rostova', email: 'trainer@nextcraft.test', expertise: 'Lead UI/UX & Digital Product Instructor', experience: '7+ Years', location: 'Algiers / Remote', bio: 'Product designer turned mentor. I help students go from first wireframe to a portfolio-ready design system.' },
  { key: 'kareem', name: 'Kareem Hassan', email: 'kareem@nextcraft.test', expertise: 'Full-Stack JavaScript Engineer', experience: '9 Years', location: 'Constantine', bio: 'I build web and mobile products with React and Node, and teach the way teams actually ship.' },
  { key: 'aris', name: 'Dr. Aris Thorne', email: 'aris@nextcraft.test', expertise: 'Data Scientist', experience: '10 Years', location: 'Online', bio: 'Statistics, Python and SQL for people who want answers from data.' },
  { key: 'marcus', name: 'Marcus Vance', email: 'marcus@nextcraft.test', expertise: 'Brand Designer', experience: '8 Years', location: 'Oran', bio: 'Brand identity and visual systems for startups.' },
  { key: 'sarah', name: 'Sarah Jenkins', email: 'sarah@nextcraft.test', expertise: 'Growth Marketer', experience: '6 Years', location: 'Online', bio: 'Performance marketing and SEO.' },
  { key: 'devon', name: 'Devon Vance', email: 'devon@nextcraft.test', expertise: 'Security Engineer', experience: '11 Years', location: 'Online', bio: 'Network defence and ethical hacking fundamentals.' },
  { key: 'klara', name: 'Klara Lindqvist', email: 'klara@nextcraft.test', expertise: 'Agile Coach', experience: '9 Years', location: 'Algiers', bio: 'Scrum, planning and leading product teams.' },
  { key: 'lucas', name: 'Lucas Silva', email: 'lucas@nextcraft.test', expertise: 'Video Editor & Motion Designer', experience: '7 Years', location: 'Online', bio: 'Editing, colour grading and motion graphics.' },
];

const img = id => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&q=80`;
const courses = [
  { key: 'data', trainer: 'aris', title: 'Data Analysis', category: 'Data Analysis', description: 'Master modern statistical analysis, data cleaning, and visualization using Python and SQL.', learnings: 'Data Wrangling with Pandas, Exploratory Data Analysis, SQL Query Optimization, Tableau Dashboard Creation', level: 'Intermediate', duration: '8 Weeks', format: 'Online', location: 'Zoom Live Sessions', max: 30, price: 179, image: img('photo-1551288049-bebda4e38f71'), schedule: 'Mon & Wed | 7:00 PM - 9:00 PM' },
  { key: 'uiux', trainer: 'elena', title: 'UI/UX Design', category: 'UI/UX Design', description: 'Design intuitive user experiences and high-fidelity wireframes using Figma and user psychology.', learnings: 'Figma Design Systems, User Research Methodologies, Interactive Prototyping, Usability Testing', level: 'Beginner', duration: '6 Weeks', format: 'Online', location: 'Zoom Live Sessions', max: 25, price: 149, image: img('photo-1581291518633-83b4ebd1d83e'), schedule: 'Tue & Thu | 6:00 PM - 8:00 PM' },
  { key: 'figma', trainer: 'elena', title: 'Master Figma & Design Systems', category: 'UI/UX Design', description: 'Comprehensive practical course designed to transition students into full design system architecture.', learnings: 'Figma Auto-Layout, Tokens, Interactive Prototypes, Design Systems', level: 'Intermediate', duration: '6 Weeks (24 Hrs)', format: 'Both', location: 'NextCraft Lab, Algiers / Zoom', max: 20, price: 199, image: img('photo-1542744094-3a3121699497'), schedule: 'Saturdays | 10:00 AM - 2:00 PM' },
  { key: 'brand', trainer: 'marcus', title: 'Graphic Design & Branding', category: 'Graphic Design & Branding', description: 'Build visual brand identities and compelling marketing assets from conceptual scratch.', learnings: 'Brand Identity Systems, Typography Principles, Adobe Illustrator Masterclass, Vector Design', level: 'Beginner', duration: '5 Weeks', format: 'In-person', location: 'NextCraft Studio, Oran', max: 15, price: 129, image: img('photo-1626785774573-4b799315345d'), schedule: 'Sundays | 9:00 AM - 1:00 PM' },
  { key: 'seo', trainer: 'sarah', title: 'Digital Marketing & SEO', category: 'Digital Marketing & SEO', description: 'Scale business reach using modern performance marketing strategies and search optimization.', learnings: 'Technical SEO Strategy, Google Ads Campaigns, Social Media Funnels, Conversion Optimization', level: 'Intermediate', duration: '4 Weeks', format: 'Online', location: 'Google Meet', max: 40, price: 99, image: img('photo-1460925895917-afdab827c52f'), schedule: 'Wed | 6:00 PM - 9:00 PM' },
  { key: 'cyber', trainer: 'devon', title: 'Cybersecurity Basics', category: 'Cybersecurity', description: 'Understand digital threat landscapes, network security defenses, and ethical hacking fundamentals.', learnings: 'Network Protocol Analysis, Ethical Hacking Basics, Security Architecture, Vulnerability Assessment', level: 'Advanced', duration: '10 Weeks', format: 'Online', location: 'Zoom Live Sessions', max: 25, price: 229, image: img('photo-1563986768609-322da13575f3'), schedule: 'Tue & Thu | 8:00 PM - 10:00 PM' },
  { key: 'pm', trainer: 'klara', title: 'Project Management', category: 'Project Management', description: 'Learn Agile and Scrum methodologies to lead cross-functional tech product teams.', learnings: 'Agile & Scrum Frameworks, Sprint Planning, Risk Assessment, Jira & Confluence Management', level: 'Intermediate', duration: '6 Weeks', format: 'In-person', location: 'NextCraft Lab, Algiers', max: 20, price: 159, image: img('photo-1552664730-d307ca884978'), schedule: 'Saturdays | 2:00 PM - 5:00 PM' },
  { key: 'web', trainer: 'kareem', title: 'Web & Mobile Development', category: 'Web & Mobile Development', description: 'Build modern full-stack web platforms and cross-platform mobile apps with JavaScript & React.', learnings: 'React & React Native, Node.js REST APIs, Database Schema Design, Git & Deployment Pipelines', level: 'Advanced', duration: '12 Weeks', format: 'Online', location: 'Zoom Live Sessions', max: 30, price: 249, image: img('photo-1498050108023-c5249f4df085'), schedule: 'Mon, Wed & Fri | 7:00 PM - 9:00 PM' },
  { key: 'video', trainer: 'lucas', title: 'Video Editing', category: 'Video Editing', description: 'Produce cinema-grade video content, motion graphics, and audio mastering with Premiere & After Effects.', learnings: 'Timeline Editing Efficiency, Color Grading with Resolve, After Effects Motion Graphics, Audio Engineering', level: 'Beginner', duration: '4 Weeks', format: 'Online', location: 'Zoom Live Sessions', max: 25, price: 119, image: img('photo-1574717024653-61fd2cf4d44d'), schedule: 'Thu | 6:00 PM - 9:00 PM' },
];

const students = [
  { key: 'alex', name: 'Alex Morgan', email: 'student@nextcraft.test', university: 'Université Constantine 1', field: 'Computer Science', year: '3rd Year / Bachelor' },
  { key: 'liam', name: 'Liam Vance', email: 'liam@nextcraft.test' },
  { key: 'sofia', name: 'Sofia Chen', email: 'sofia@nextcraft.test' },
  { key: 'omar', name: 'Omar Kadi', email: 'omar@nextcraft.test' },
  { key: 'maya', name: 'Maya Lin', email: 'maya@nextcraft.test' },
  { key: 'david', name: 'David Kim', email: 'david@nextcraft.test' },
];

// [student, course, progress, days ago]
const enrollments = [
  ['alex', 'uiux', 65, 40], ['alex', 'web', 20, 12],
  ['liam', 'figma', 75, 30], ['sofia', 'figma', 40, 25], ['omar', 'uiux', 90, 50],
  ['maya', 'uiux', 100, 60], ['david', 'web', 100, 70], ['maya', 'data', 55, 20], ['david', 'cyber', 30, 10],
  ['liam', 'seo', 80, 35], ['sofia', 'video', 60, 15], ['omar', 'brand', 45, 22], ['omar', 'pm', 10, 3],
];

// [student, course, rating, comment, trainer reply]
const reviews = [
  ['maya', 'uiux', 5, 'The Figma prototyping sessions transformed how I design. The trainer was incredibly responsive!', 'Thank you Maya! Excited to see your final portfolio project!'],
  ['david', 'web', 5, 'Direct feedback from Kareem helped me land my first junior developer contract in 8 weeks.', null],
  ['liam', 'figma', 5, 'Super practical and relevant to real design studio workflows.', null],
  ['omar', 'uiux', 4, 'Great structure. I would love one more session on usability testing.', null],
  ['maya', 'data', 5, 'Finally understand pandas properly. Clear and patient explanations.', null],
  ['liam', 'seo', 4, 'Very actionable — I applied the SEO checklist to my own site the same week.', null],
  ['sofia', 'video', 5, 'Colour grading module was worth the whole price.', null],
  ['omar', 'brand', 5, 'Marcus has a great eye. My logo work improved a lot.', null],
  ['david', 'cyber', 5, 'Hands-on labs make the theory stick.', null],
  ['omar', 'pm', 4, 'Good intro to Scrum with real examples.', null],
];

// [from, to, text]
const messages = [
  ['elena', 'alex', 'Hi Alex! How is the wireframing assignment coming along?'],
  ['alex', 'elena', 'Hey Elena! Just wrapping up the interactive prototypes right now.'],
  ['kareem', 'alex', 'Great work on your latest React state management submission!'],
  ['liam', 'elena', 'Hi! When will the Figma component assignment be graded?'],
  ['elena', 'liam', 'Hello Liam! I will be finishing all reviews by tomorrow evening.'],
  ['sofia', 'elena', 'Thanks for the feedback on module 2!'],
];

function seed() {
  const hash = bcrypt.hashSync(DEMO_PASSWORD, 10);
  const ids = {};
  const courseIds = {};

  db.transaction(() => {
    const insUser = db.prepare(`INSERT INTO users (role, name, email, phone, password_hash) VALUES (?, ?, ?, ?, ?)`);

    for (const t of trainers) {
      ids[t.key] = insUser.run('trainer', t.name, t.email, '+213 555 00 00 00', hash).lastInsertRowid;
      db.prepare(`INSERT INTO trainer_profiles (user_id, expertise, experience, format, location, bio, verification_status, reviewed_at)
                  VALUES (?, ?, ?, 'Hybrid (Online & In-person)', ?, ?, 'verified', datetime('now'))`)
        .run(ids[t.key], t.expertise, t.experience, t.location, t.bio);
    }
    for (const s of students) {
      ids[s.key] = insUser.run('student', s.name, s.email, '+213 666 00 00 00', hash).lastInsertRowid;
      db.prepare(`INSERT INTO student_profiles (user_id, university, field_of_study, year_of_study, skills, preferred_format)
                  VALUES (?, ?, ?, ?, '[]', 'Online')`).run(ids[s.key], s.university || '', s.field || '', s.year || '');
    }
    insUser.run('admin', 'NextCraft Admin', 'admin@nextcraft.test', '', hash);

    const insCourse = db.prepare(`INSERT INTO courses (trainer_id, title, category, description, learnings, level, duration, format,
                                  location, max_students, price, image, schedule, status) VALUES
                                  (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Published')`);
    for (const c of courses) {
      courseIds[c.key] = insCourse.run(ids[c.trainer], c.title, c.category, c.description, c.learnings, c.level, c.duration,
        c.format, c.location, c.max, c.price, c.image, c.schedule).lastInsertRowid;
    }

    const insEnr = db.prepare(`INSERT INTO enrollments (student_id, course_id, progress, enrolled_at)
                               VALUES (?, ?, ?, datetime('now', ?))`);
    for (const [s, c, p, d] of enrollments) insEnr.run(ids[s], courseIds[c], p, `-${d} days`);

    const insRev = db.prepare(`INSERT INTO reviews (student_id, course_id, rating, comment, reply, replied_at, created_at)
                               VALUES (?, ?, ?, ?, ?, CASE WHEN ? IS NULL THEN NULL ELSE datetime('now') END, datetime('now', ?))`);
    reviews.forEach(([s, c, r, text, reply], i) => insRev.run(ids[s], courseIds[c], r, text, reply, reply, `-${i + 1} days`));

    const insMsg = db.prepare(`INSERT INTO messages (sender_id, receiver_id, body, created_at, read_at)
                               VALUES (?, ?, ?, datetime('now', ?), datetime('now'))`);
    messages.forEach(([from, to, text], i) => insMsg.run(ids[from], ids[to], text, `-${(messages.length - i) * 7} minutes`));
  })();
}

function wipe() {
  db.transaction(() => {
    for (const t of ['messages', 'reviews', 'saved_courses', 'enrollments', 'verification_documents', 'courses',
      'student_profiles', 'trainer_profiles', 'users']) db.prepare(`DELETE FROM ${t}`).run();
    db.prepare(`DELETE FROM sqlite_sequence`).run();
  })();
}

if (require.main === module) {
  if (process.argv.includes('--reset')) {
    wipe();
    seed();
    console.log('Database wiped and demo data loaded.');
  } else if (db.prepare('SELECT COUNT(*) n FROM users').get().n > 0) {
    console.log('Database already has data. Use "npm run reset" to wipe it and reload the demo data.');
  } else {
    seed();
    console.log('Demo data loaded.');
  }
  console.log(`Demo logins (password: ${DEMO_PASSWORD}): student@nextcraft.test, trainer@nextcraft.test, admin@nextcraft.test`);
}

module.exports = { seed, DEMO_PASSWORD };
