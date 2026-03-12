const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'frontend/src/pages/public/InstitutePage.css');
const jsxPath = path.join(__dirname, 'frontend/src/pages/public/InstitutePage.jsx');

let css = fs.readFileSync(cssPath, 'utf8');
let jsx = fs.readFileSync(jsxPath, 'utf8');

const classes = [
  'btn-primary', 'btn-outline', 'submit-btn', 
  'nav', 'nav-brand', 'nav-name', 'nav-tagline', 'nav-logo', 'nav-links', 'nav-cta',
  'hero', 'hero-bg', 'hero-blob', 'hero-left', 'hero-badge', 'badge-dot', 'hero-title', 'hero-desc', 'hero-stats', 'stat-num', 'stat-label', 'hero-actions', 'hero-card', 'hero-img-wrap', 
  'quick-info-row', 'quick-icon', 'quick-text-title', 'quick-text-val',
  'section', 'section-title', 'section-label', 'reveal',
  'about-grid', 'about-images', 'about-img', 'about-img-label', 'value-list', 'value-item', 'value-icon', 'value-text',
  'courses-section', 'courses-grid', 'course-card', 'course-thumb', 'course-badge', 'course-content', 'course-name', 'course-class',
  'achievements-strip', 'ach-num', 'ach-label',
  'faculty-grid', 'faculty-card', 'faculty-avatar', 'fac-name', 'fac-sub',
  'gallery-grid', 'gallery-item', 'gallery-overlay',
  'reviews-grid', 'review-card', 'stars', 'review-text', 'reviewer-line', 'reviewer-avatar', 'reviewer-info',
  'enroll-cta', 'enroll-left', 'enroll-features',
  'form-card', 'form-row', 'form-group', 'form-label', 'form-input', 'form-select',
  'contact-grid', 'contact-info', 'contact-item', 'contact-icon', 'contact-text',
  'footer-grid', 'footer-brand', 'footer-brand-logo', 'social-links', 'social-btn', 'footer-col', 'footer-links', 'footer-bottom', 'powered-badge',
  'whatsapp-fab'
];

classes.forEach(cls => {
  // Replace in JSX: className="cls" -> className="pub-cls"
  // Needs to handle cases where it's part of a string like `pub-tab-btn ${...}`
  // Let's just blindly replace 'cls' with 'pub-cls' inside JSX strings if surrounded by space, quote, or backtick
  const jsxRegex = new RegExp(`(['"\`\\s])${cls}(['"\`\\s])`, 'g');
  jsx = jsx.replace(jsxRegex, `$1pub-${cls}$2`);
  // Run twice for adjacent matches
  jsx = jsx.replace(jsxRegex, `$1pub-${cls}$2`);
  
  // Replace in CSS: .cls -> .pub-cls
  const cssRegex = new RegExp(`\\.${cls}(?![a-zA-Z0-9_-])`, 'g');
  css = css.replace(cssRegex, `.pub-${cls}`);
});

fs.writeFileSync(cssPath, css);
fs.writeFileSync(jsxPath, jsx);

console.log('Successfully prefixed all CSS classes with pub-');
