// simple-build.js - Streamlined blog builder
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

class SimpleBlogBuilder {
  constructor() {
    this.config = {
      source: './content',        // All markdown files in one place
      output: './dist',           // All generated files in one place  
      templates: './templates',   // Simple templates
      static: './static'          // CSS, images, etc.
    };
    
    this.posts = [];
  }

  // Main build function - does everything in logical order
  async build() {
    console.log('🏗️  Building blog...');
    
    // 1. Clean and setup
    this.cleanOutput();
    this.copyStatic();
    
    // 2. Process content
    this.loadPosts();
    this.generatePosts();
    this.generateIndex();
    this.generateArchive();
    
    console.log(`✅ Built ${this.posts.length} posts successfully!`);
  }

  // Clean output directory
  cleanOutput() {
    if (fs.existsSync(this.config.output)) {
      fs.rmSync(this.config.output, { recursive: true });
    }
    fs.mkdirSync(this.config.output, { recursive: true });
  }

  // Copy static files (CSS, images, etc.)
  copyStatic() {
    if (fs.existsSync(this.config.static)) {
      this.copyDir(this.config.static, this.config.output);
    }
  }

  // Load and parse all markdown posts
  loadPosts() {
    if (!fs.existsSync(this.config.source)) {
      console.log('No content directory found');
      return;
    }

    const files = fs.readdirSync(this.config.source)
      .filter(file => file.endsWith('.md'))
      .sort();

    files.forEach(file => {
      const post = this.parsePost(path.join(this.config.source, file));
      if (post) {
        this.posts.push(post);
      }
    });

    // Sort by date (newest first)
    this.posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  // Parse individual markdown post
  parsePost(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const { frontmatter, body } = this.parseFrontmatter(content);
      
      const slug = path.basename(filePath, '.md');
      const html = marked(body);

      return {
        slug,
        title: frontmatter.title || 'Untitled',
        date: frontmatter.date || new Date().toISOString().split('T')[0],
        tags: frontmatter.tags || [],
        categories: frontmatter.categories || [],
        description: frontmatter.description || '',
        content: html,
        url: `/${slug}.html`
      };
    } catch (error) {
      console.error(`Error parsing ${filePath}:`, error);
      return null;
    }
  }

  // Parse frontmatter (YAML-like header)
  parseFrontmatter(content) {
    const lines = content.split('\n');
    let frontmatterEnd = -1;
    let frontmatter = {};

    // Check for frontmatter
    if (lines[0].trim() === '---') {
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '---') {
          frontmatterEnd = i;
          break;
        }
      }
    }

    if (frontmatterEnd > 0) {
      // Parse simple frontmatter
      for (let i = 1; i < frontmatterEnd; i++) {
        const line = lines[i];
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          const key = line.substring(0, colonIndex).trim();
          let value = line.substring(colonIndex + 1).trim();
          
          // Handle arrays (tags, categories)
          if (value.startsWith('[') && value.endsWith(']')) {
            value = value.slice(1, -1).split(',').map(v => v.trim().replace(/"/g, ''));
          } else {
            value = value.replace(/"/g, '');
          }
          
          frontmatter[key] = value;
        }
      }
      
      return {
        frontmatter,
        body: lines.slice(frontmatterEnd + 1).join('\n')
      };
    }

    return { frontmatter: {}, body: content };
  }

  // Generate individual post pages
  generatePosts() {
    const template = this.loadTemplate('post.html');
    
    this.posts.forEach(post => {
      const html = this.renderTemplate(template, {
        title: post.title,
        date: this.formatDate(post.date),
        content: post.content,
        tags: post.tags.map(tag => `<a href="/archive.html#${tag}">${tag}</a>`).join(', '),
        categories: post.categories.join(', ')
      });
      
      fs.writeFileSync(
        path.join(this.config.output, `${post.slug}.html`),
        html
      );
    });
  }

  // Generate home page
  generateIndex() {
    const template = this.loadTemplate('index.html');
    const recentPosts = this.posts.slice(0, 5);
    
    const postsHtml = recentPosts.map(post => `
      <article class="post-preview">
        <h2><a href="${post.url}">${post.title}</a></h2>
        <time>${this.formatDate(post.date)}</time>
        ${post.description ? `<p>${post.description}</p>` : ''}
      </article>
    `).join('');

    const html = this.renderTemplate(template, {
      title: 'Luke Miller',
      posts: postsHtml,
      totalPosts: this.posts.length
    });

    fs.writeFileSync(path.join(this.config.output, 'index.html'), html);
  }

  // Generate archive page with all posts
  generateArchive() {
    const template = this.loadTemplate('archive.html');
    
    // Group by year
    const postsByYear = {};
    this.posts.forEach(post => {
      const year = new Date(post.date).getFullYear();
      if (!postsByYear[year]) postsByYear[year] = [];
      postsByYear[year].push(post);
    });

    let archiveHtml = '';
    Object.keys(postsByYear)
      .sort((a, b) => b - a)
      .forEach(year => {
        archiveHtml += `<h2>${year}</h2>\n<ul class="post-list">\n`;
        postsByYear[year].forEach(post => {
          const date = new Date(post.date);
          const formattedDate = date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          });
          archiveHtml += `  <li>
            <span class="date">${formattedDate}</span>
            <a href="${post.url}">${post.title}</a>
          </li>\n`;
        });
        archiveHtml += '</ul>\n';
      });

    // Get all unique tags
    const allTags = [...new Set(this.posts.flatMap(post => post.tags))].sort();
    const tagsHtml = allTags.map(tag => `<span class="tag">${tag}</span>`).join(' ');

    const html = this.renderTemplate(template, {
      title: 'Archive',
      posts: archiveHtml,
      tags: tagsHtml,
      totalPosts: this.posts.length
    });

    fs.writeFileSync(path.join(this.config.output, 'archive.html'), html);
  }

  // Load template file
  loadTemplate(filename) {
    const templatePath = path.join(this.config.templates, filename);
    if (fs.existsSync(templatePath)) {
      return fs.readFileSync(templatePath, 'utf8');
    }
    
    // Return basic template if file doesn't exist
    return this.getDefaultTemplate(filename);
  }

  // Simple template rendering (replace {{variable}} placeholders)
  renderTemplate(template, variables) {
    let html = template;
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(placeholder, value || '');
    });
    return html;
  }

  // Format date for display
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Copy directory recursively
  copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const items = fs.readdirSync(src);
    items.forEach(item => {
      const srcPath = path.join(src, item);
      const destPath = path.join(dest, item);
      
      if (fs.statSync(srcPath).isDirectory()) {
        this.copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    });
  }

  // Default templates if none exist
  getDefaultTemplate(filename) {
    const templates = {
      'post.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>{{title}} - Luke Miller</title>
  <link rel="stylesheet" href="/tufte.css">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  <article>
    <nav><a href="/">← Home</a> | <a href="/archive.html">Archive</a></nav>
    <h1>{{title}}</h1>
    <time>{{date}}</time>
    {{content}}
    <footer>
      ${this.posts && this.posts.length > 0 ? '<p>Tags: {{tags}}</p>' : ''}
    </footer>
  </article>
</body>
</html>`,

      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>{{title}}</title>
  <link rel="stylesheet" href="/tufte.css">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  <main>
    <h1>{{title}}</h1>
    <p>Christian, husband, father of three, and co-founder at <a href="https://buildonline.io">Buildonline</a>.</p>
    
    <nav>
      <a href="/archive.html">All Posts ({{totalPosts}})</a>
    </nav>

    <section class="recent-posts">
      <h2>Recent Writing</h2>
      {{posts}}
    </section>
  </main>
</body>
</html>`,

      'archive.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>{{title}} - Luke Miller</title>
  <link rel="stylesheet" href="/tufte.css">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  <main>
    <nav><a href="/">← Home</a></nav>
    <h1>{{title}} ({{totalPosts}} posts)</h1>
    
    <section class="tags">
      {{tags}}
    </section>
    
    <section class="posts">
      {{posts}}
    </section>
  </main>
</body>
</html>`
    };
    
    return templates[filename] || '<html><body><h1>Template not found</h1></body></html>';
  }
}

// CLI interface
if (require.main === module) {
  const builder = new SimpleBlogBuilder();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'init':
      // Create directory structure
      ['content', 'templates', 'static', 'dist'].forEach(dir => {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
          console.log(`Created ${dir}/`);
        }
      });
      
      // Create sample post
      const samplePost = `---
title: "Welcome to Your New Blog"
date: "2025-01-15"
tags: ["blogging", "simple"]
description: "Getting started with the simplified blog builder"
---

# Welcome!

This is your first post. Write in **Markdown** and build with \`node simple-build.js\`.

The system is designed to be simple and maintainable:
- All content goes in \`content/\`
- Templates in \`templates/\`
- CSS and images in \`static/\`
- Generated site in \`dist/\`
`;
      
      fs.writeFileSync('content/welcome.md', samplePost);
      console.log('Created sample post: content/welcome.md');
      console.log('\nTo build: node simple-build.js');
      break;
      
    case 'new':
      const title = process.argv.slice(3).join(' ') || 'New Post';
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const today = new Date().toISOString().split('T')[0];
      
      const newPost = `---
title: "${title}"
date: "${today}"
tags: []
description: ""
---

# ${title}

Write your post here...
`;
      
      fs.writeFileSync(`content/${slug}.md`, newPost);
      console.log(`Created new post: content/${slug}.md`);
      break;
      
    case 'serve':
      // Simple dev server
      const http = require('http');
      const url = require('url');
      const port = process.argv[3] || 3000;
      
      const server = http.createServer((req, res) => {
        const pathname = url.parse(req.url).pathname;
        let filePath = path.join(__dirname, 'dist', pathname);
        
        if (pathname === '/') filePath = path.join(__dirname, 'dist/index.html');
        
        fs.readFile(filePath, (err, data) => {
          if (err) {
            res.writeHead(404);
            res.end('Not found');
            return;
          }
          
          const ext = path.extname(filePath);
          const contentType = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'text/javascript',
            '.jpg': 'image/jpeg',
            '.png': 'image/png'
          }[ext] || 'text/plain';
          
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(data);
        });
      });
      
      server.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
      });
      break;
      
    default:
      builder.build();
  }
}

module.exports = SimpleBlogBuilder;
