// Get template for content type
  getContentTemplate(type) {
    const templates = {
      stream: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}} - Luke Miller</title>
    <link rel="stylesheet" href="../styles.css">
</head>
<body>
    <header class="site-header">
        <nav class="site-nav">
            <a href="/">Home</a>
            <a href="/stream">Stream</a>
            <a href="/lab">Lab</a>
            <a href="/garden">Garden</a>
            <a href="/essays">Essays</a>
            <a href="/about">About</a>
        </nav>
    </header>
    <main>
        <article class="stream-post-single">
            <div class="post-header">
                <div class="breadcrumb"><a href="/stream">← Stream</a></div>
                <h1>{{title}}</h1>
            </div>
            <div class="post-meta">
                <time class="post-date">{{date}}</time>
                <div class="post-categories">{{categories}}</div>
                <div class="post-tags">{{tags}}</div>
            </div>
            <div class="post-content">{{content}}</div>
        </article>
    </main>
</body>
</html>`,

      lab: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}} - Luke Miller</title>
    <link rel="stylesheet" href="../styles.css">
</head>
<body>
    <header class="site-header">
        <nav class="site-nav">
            <a href="/">Home</a>
            <a href="/stream">Stream</a>
            <a href="/lab">Lab</a>
            <a href="/garden">Garden</a>
            <a href="/essays">Essays</a>
            <a href="/about">About</a>
        </nav>
    </header>
    <main>
        <article class="lab-pattern-single">
            <div class="pattern-header">
                <div class="breadcrumb"><a href="/lab">← Lab</a></div>
                <h1>{{title}}</h1>
            </div>
            <div class="pattern-meta">
                <time class="pattern-date">{{date}}</time>
                <div class="pattern-categories">{{categories}}</div>
                <div class="pattern-tags">{{tags}}</div>
            </div>
            <div class="pattern-content">{{content}}</div>
        </article>
    </main>
</body>
</html>`,

      essays: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}} - Luke Miller</title>
    <link rel="stylesheet" href="../styles.css">
</head>
<body>
    <header class="site-header">
        <nav class="site-nav">
            <a href="/">Home</a>
            <a href="/stream">Stream</a>
            <a href="/lab">Lab</a>
            <a href="/garden">Garden</a>
            <a href="/essays">Essays</a>
            <a href="/about">About</a>
        </nav>
    </header>
    <main>
        <article class="essay-single">
            <div class="essay-header">
                <div class="breadcrumb"><a href="/essays">← Essays</a></div>
                <h1>{{title}}</h1>
            </div>
            <div class="essay-meta">
                <div class="essay-dates">
                    <span class="date-created">Created: {{date_created}}</span>
                    <span class="date-updated">Updated: {{date_updated}}</span>
                </div>
                <div class="essay-categories">{{categories}}</div>
                <div class="essay-tags">{{tags}}</div>
            </div>
            <div class="essay-content">{{content}}</div>
        </article>
    </main>
</body>
</html>`
    };
    
    return templates[type] || templates.stream;
  }

  // Render template for specific content type
  renderContentTemplate(template, item, type) {
    let html = template;
    
    // Basic replacements
    html = html.replace(/{{title}}/g, item.title);
    html = html.replace(/{{content}}/g, item.content);
    html = html.replace(/{{date}}/g, this.formatDate(item.date));
    html = html.replace(/{{date_created}}/g, this.formatDate(item.date_created));
    html = html.replace(/{{date_updated}}/g, this.formatDate(item.date_updated));
    
    // Format categories and tags
    const categories = Array.isArray(item.categories) ? item.categories.join(', ') : item.categories;
    const tags = Array.isArray(item.tags) ? 
      item.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ') : '';
    
    html = html.replace(/{{categories}}/g, categories);
    html = html.replace(/{{tags}}/g, tags);
    
    return html;
  }

  // Generate main pages for each content type
  generateMainPages() {
    this.generateStreamMain();
    this.generateLabMain();
    this.generateEssaysMain();
    this.generateIndex();
  }

  // Generate stream main page
  generateStreamMain() {
    const streamPosts = this.contentByType.stream.map(post => `
      <article class="stream-post">
        <h2><a href="${post.url}">${post.title}</a></h2>
        <div class="stream-meta">
          <time class="post-date">${this.formatDate(post.date)}</time>
          <div class="post-categories">${Array.isArray(post.categories) ? post.categories.join(', ') : post.categories}</div>
          <div class="post-tags">
            ${Array.isArray(post.tags) ? post.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ') : ''}
          </div>
        </div>
        <div class="stream-content">${post.content}</div>
      </article>
    `).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Stream - Luke Miller</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header class="site-header">
        <nav class="site-nav">
            <a href="/">Home</a>
            <a href="/stream">Stream</a>
            <a href="/lab">Lab</a>
            <a href="/garden">Garden</a>
            <a href="/essays">Essays</a>
            <a href="/about">About</a>
        </nav>
    </header>
    <main>
        <article>
            <div class="content-header">
                <h1>Stream</h1>
                <p class="subtitle">Brief notes and observations in real time</p>
            </div>
            <section class="stream-feed">
                ${streamPosts}
            </section>
        </article>
    </main>
</body>
</html>`;

    fs.writeFileSync(path.join(this.config.output, 'stream.html'), html);
  }

  // Generate lab main page
  generateLabMain() {
    const labPatterns = this.contentByType.lab.map(pattern => `
      <div class="pattern-entry">
        <h2><a href="${pattern.url}">${pattern.title}</a></h2>
        <div class="pattern-meta">
          <time class="pattern-date">${this.formatDate(pattern.date)}</time>
          <div class="pattern-categories">${Array.isArray(pattern.categories) ? pattern.categories.join(', ') : pattern.categories}</div>
          <div class="pattern-tags">
            ${Array.isArray(pattern.tags) ? pattern.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ') : ''}
          </div>
        </div>
        <div class="pattern-preview">
          ${pattern.description || pattern.content.substring(0, 200) + '...'}
        </div>
      </div>
    `).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lab - Luke Miller</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header class="site-header">
        <nav class="site-nav">
            <a href="/">Home</a>
            <a href="/stream">Stream</a>
            <a href="/lab">Lab</a>
            <a href="/garden">Garden</a>
            <a href="/essays">Essays</a>
            <a href="/about">About</a>
        </nav>
    </header>
    <main>
        <article>
            <div class="content-header">
                <h1>Lab</h1>
                <p class="subtitle">Patterns, frameworks, and cognitive tools for thinking</p>
            </div>
            <section class="lab-patterns">
                ${labPatterns}
            </section>
        </article>
    </main>
</body>
</html>`;

    fs.writeFileSync(path.join(this.config.output, 'lab.html'), html);
  }

  // Generate essays main page
  generateEssaysMain() {
    const essays = this.contentByType.essays.map(essay => `
      <div class="essay-entry">
        <h2><a href="${essay.url}">${essay.title}</a></h2>
        <div class="essay-meta">
          <div class="essay-dates">
            <span class="date-created">Created: ${this.formatDate(essay.date_created)}</span>
            <span class="date-updated">Updated: ${this.formatDate(essay.date_updated)}</span>
          </div>
          <div class="essay-categories">${Array.isArray(essay.categories) ? essay.categories.join(', ') : essay.categories}</div>
          <div class="essay-tags">
            ${Array.isArray(essay.tags) ? essay.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ') : ''}
          </div>
        </div>
        <div class="essay-preview">
          ${essay.description || essay.content.substring(0, 200) + '...'}
        </div>
      </div>
    `).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Essays - Luke Miller</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header class="site-header">
        <nav class="site-nav">
            <a href="/">Home</a>
            <a href="/stream">Stream</a>
            <a href="/lab">Lab</a>
            <a href="/garden">Garden</a>
            <a href="/essays">Essays</a>
            <a href="/about">About</a>
        </nav>
    </header>
    <main>
        <article>
            <div class="content-header">
                <h1>Essays</h1>
                <p class="subtitle">Longer explorations of ideas and arguments</p>
            </div>
            <section class="essays-list">
                ${essays}
            </section>
        </article>
    </main>
</body>
</html>`;

    fs.writeFileSync(path.join(this.config.output, 'essays.html'), html);
  }

  // Parse frontmatter (existing method)
  parseFrontmatter(content) {
    const lines = content.split('\n');
    let frontmatterEnd = -1;
    let frontmatter = {};

    if (lines[0].trim() === '---') {
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '---') {
          frontmatterEnd = i;
          break;
        }
      }
    }

    if (frontmatterEnd > 0) {
      for (let i = 1; i < frontmatterEnd; i++) {
        const line = lines[i];
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          const key = line.substring(0, colonIndex).trim();
          let value = line.substring(colonIndex + 1).trim();
          
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

  // Legacy methods (maintain backward compatibility)
  generatePosts() {
    if (this.posts.length === 0) return;
    
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

  generateIndex() {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Luke Miller</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header class="site-header">
        <nav class="site-nav">
            <a href="/">Home</a>
            <a href="/stream">Stream</a>
            <a href="/lab">Lab</a>
            <a href="/garden">Garden</a>
            <a href="/essays">Essays</a>
            <a href="/about">About</a>
        </nav>
    </header>
    <main>
        <article>
            <div class="home-intro">
                <h1>Luke Miller</h1>
                <p class="subtitle">Tending my corner of the digital commons</p>
            </div>
        </article>
    </main>
</body>
</html>`;

    fs.writeFileSync(path.join(this.config.output, 'index.html'), html);
  }

  // Utility methods
  loadTemplate(filename) {
    const templatePath = path.join(this.config.templates, filename);
    if (fs.existsSync(templatePath)) {
      return fs.readFileSync(templatePath, 'utf8');
    }
    return this.getDefaultTemplate(filename);
  }

  renderTemplate(template, variables) {
    let html = template;
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(placeholder, value || '');
    });
    return html;
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

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

  getDefaultTemplate(filename) {
    return '<html><body><h1>Template not found</h1></body></html>';
  }
}

// CLI interface
if (require.main === module) {
  const builder = new EnhancedBlogBuilder();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'init':
      // Create enhanced directory structure
      const dirs = [
        'content', 'content/stream', 'content/lab', 'content/essays',
        'templates', 'templates/stream', 'templates/lab', 'templates/essays',
        'static', 'dist'
      ];
      
      dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
          console.log(`Created ${dir}/`);
        }
      });
      
      console.log('Enhanced blog structure created!');
      console.log('Add markdown files to content/stream/, content/lab/, and content/essays/');
      break;
      
    case 'new':
      const type = process.argv[3] || 'stream';
      const title = process.argv.slice(4).join(' ') // enhanced-build.js - Extended blog builder for multi-content types
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

class EnhancedBlogBuilder {
  constructor() {
    this.config = {
      source: './content',
      output: './dist',
      templates: './templates',
      static: './static'
    };
    
    // Content types configuration
    this.contentTypes = {
      stream: {
        source: './content/stream',
        output: './stream',
        template: 'stream-post.html',
        listTemplate: 'stream.html'
      },
      lab: {
        source: './content/lab', 
        output: './lab',
        template: 'lab-pattern.html',
        listTemplate: 'lab.html'
      },
      essays: {
        source: './content/essays',
        output: './essays', 
        template: 'essay.html',
        listTemplate: 'essays.html'
      }
    };
    
    this.posts = [];
    this.contentByType = {
      stream: [],
      lab: [],
      essays: []
    };
  }

  // Main build function
  async build() {
    console.log('🏗️  Building enhanced blog...');
    
    // 1. Clean and setup
    this.cleanOutput();
    this.copyStatic();
    
    // 2. Process all content types
    this.loadAllContent();
    this.generateAllContent();
    this.generateMainPages();
    
    console.log(`✅ Built successfully!`);
    console.log(`   Stream: ${this.contentByType.stream.length} posts`);
    console.log(`   Lab: ${this.contentByType.lab.length} patterns`);
    console.log(`   Essays: ${this.contentByType.essays.length} essays`);
    console.log(`   Legacy: ${this.posts.length} posts`);
  }

  // Clean output directory
  cleanOutput() {
    if (fs.existsSync(this.config.output)) {
      fs.rmSync(this.config.output, { recursive: true });
    }
    fs.mkdirSync(this.config.output, { recursive: true });
    
    // Create content type directories
    Object.values(this.contentTypes).forEach(type => {
      const outputDir = path.join(this.config.output, type.output.replace('./', ''));
      fs.mkdirSync(outputDir, { recursive: true });
    });
  }

  // Copy static files
  copyStatic() {
    if (fs.existsSync(this.config.static)) {
      this.copyDir(this.config.static, this.config.output);
    }
    
    // Copy main CSS and other root files
    const rootFiles = ['styles.css', 'garden.html'];
    rootFiles.forEach(file => {
      if (fs.existsSync(file)) {
        fs.copyFileSync(file, path.join(this.config.output, file));
      }
    });
  }

  // Load all content types
  loadAllContent() {
    // Load legacy content (existing behavior)
    this.loadPosts();
    
    // Load new content types
    Object.entries(this.contentTypes).forEach(([type, config]) => {
      this.loadContentType(type, config);
    });
  }

  // Load content for a specific type
  loadContentType(type, config) {
    if (!fs.existsSync(config.source)) {
      console.log(`No ${type} directory found at ${config.source}`);
      return;
    }

    const files = fs.readdirSync(config.source)
      .filter(file => file.endsWith('.md'))
      .sort();

    files.forEach(file => {
      const content = this.parsePost(path.join(config.source, file), type);
      if (content) {
        this.contentByType[type].push(content);
      }
    });

    // Sort by date (newest first)
    this.contentByType[type].sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  // Enhanced post parsing with content type awareness
  parsePost(filePath, contentType = 'post') {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const { frontmatter, body } = this.parseFrontmatter(content);
      
      const slug = path.basename(filePath, '.md');
      const html = marked(body);

      return {
        slug,
        title: frontmatter.title || 'Untitled',
        date: frontmatter.date || new Date().toISOString().split('T')[0],
        date_created: frontmatter.date_created || frontmatter.date || new Date().toISOString().split('T')[0],
        date_updated: frontmatter.date_updated || frontmatter.date || new Date().toISOString().split('T')[0],
        tags: frontmatter.tags || [],
        categories: frontmatter.categories || [],
        description: frontmatter.description || '',
        content: html,
        contentType: contentType,
        url: `/${contentType}/${slug}.html`,
        related_stream: frontmatter.related_stream || '',
        related_lab: frontmatter.related_lab || '',
        related_essays: frontmatter.related_essays || []
      };
    } catch (error) {
      console.error(`Error parsing ${filePath}:`, error);
      return null;
    }
  }

  // Legacy post loading (maintains backward compatibility)
  loadPosts() {
    if (!fs.existsSync(this.config.source)) {
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

    this.posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  // Generate all content
  generateAllContent() {
    // Generate legacy posts
    this.generatePosts();
    
    // Generate new content types
    Object.entries(this.contentTypes).forEach(([type, config]) => {
      this.generateContentType(type, config);
    });
  }

  // Generate content for a specific type
  generateContentType(type, config) {
    const template = this.getContentTemplate(type);
    
    this.contentByType[type].forEach(item => {
      const html = this.renderContentTemplate(template, item, type);
      
      const outputPath = path.join(
        this.config.output, 
        config.output.replace('./', ''), 
        `${item.slug}.html`
      );
      
      fs.writeFileSync(outputPath, html);
    });
  }

  // Get template for content type
  getContentTemplate(type) {
    const templates = {
      stream: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}} - Luke Miller</title>
    <link rel="stylesheet" href="../styles.css">
</head>
<body>
    <header class="site-header">
        <nav class="site-nav">
            <a href="/">Home</a>
            <a href="/stream">Stream</a>
            <a href="/lab">Lab</a>
            <a href="/garden">Garden</a>
            <a href="/essays">Essays</a>
            <a href="/about">About</a>
        </nav>
    </header>
    <main>
        <article class="stream-post-single">
            <div class="post-header">
                <div class="breadcrumb"><a href="/stream">← Stream</a></div>
                <h1
