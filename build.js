const fs = require('fs-extra');
const path = require('path');

// Ensure dist directory exists
fs.ensureDirSync('dist');

// Copy all HTML files
fs.copySync('index.html', 'dist/index.html');
fs.copySync('stream.html', 'dist/stream.html');
fs.copySync('lab.html', 'dist/lab.html');
fs.copySync('garden.html', 'dist/garden.html');
fs.copySync('essays.html', 'dist/essays.html');
fs.copySync('about.html', 'dist/about.html');

// Copy CSS and other assets
fs.copySync('tufte-blog.css', 'dist/tufte-blog.css');

// Copy folders if they exist
if (fs.existsSync('garden')) fs.copySync('garden', 'dist/garden');
if (fs.existsSync('lab')) fs.copySync('lab', 'dist/lab');
if (fs.existsSync('essays')) fs.copySync('essays', 'dist/essays');
if (fs.existsSync('et-book')) fs.copySync('et-book', 'dist/et-book');

console.log('✅ Blog built successfully!');
