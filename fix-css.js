const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'frontend/src/pages/public/InstitutePage.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Replace standard variables with pub- variables
css = css.replace(/--primary/g, '--pub-primary');
css = css.replace(/--accent/g, '--pub-accent');
css = css.replace(/--accent2/g, '--pub-accent2');
css = css.replace(/--text/g, '--pub-text');
css = css.replace(/--muted/g, '--pub-muted');
css = css.replace(/--bg/g, '--pub-bg');
css = css.replace(/--border/g, '--pub-border');
css = css.replace(/--success/g, '--pub-success');
css = css.replace(/--radius/g, '--pub-radius');
css = css.replace(/--shadow-lg/g, '--pub-shadow-lg');
css = css.replace(/--shadow/g, '--pub-shadow');

// Change :root to .ipage-root wrapper to prevent leaking and enforce specificity
css = css.replace(/:root \s*\{/g, '.ipage-root {\n  --pub-primary: #1a3c5e;\n  --pub-accent: #f4a61d;\n  --pub-accent2: #e8f4fd;\n  --pub-text: #1c2b3a;\n  --pub-muted: #6b7e8f;\n  --pub-bg: #f8fbff;\n  --pub-border: #e2ecf5;\n  --pub-success: #22c55e;\n  --pub-radius: 16px;\n  --pub-shadow: 0 4px 32px rgba(26,60,94,0.10);\n  --pub-shadow-lg: 0 12px 60px rgba(26,60,94,0.16);\n');

// Clean up the original :root block which is now handled
css = css.replace(/\/\* 1\.1 Color Palette & Variables \*\/[\s\S]*?\.ipage-root \{/, '/* 1.1 Color Palette & Variables */\n.ipage-root {');

fs.writeFileSync(cssPath, css);
console.log('CSS Variables Isolated Successfully!');
