// Enhanced build system for Luke Miller's blog
const fs = require('fs');
const path = require('path');
const http = require('http');
const url = require('url');
const { marked } = require('marked');

class BlogBuilder {
  constructor() {
    this.config = {
      output: './dist',
      contentDir: './content',
      templatesDir: './templates'
    };
    this.processedContent = {
      stream: [],
      lab: [],
      garden: [],
      essays: []
    };
  }

  async build() {
    console.log('🏗️  Building blog...');
    
    try {
      // 1. Process content files
      this.processMarkdownContent();
      
      // 2. Clean and setup output
      this.cleanOutput();
      
      // 3. Copy static files
      this.copyStaticFiles();
      
      // 4. Generate pages
      this.generateAllPages();
      
      console.log('✅ Build completed successfully!');
    } catch (error) {
      console.error('❌ Build failed:', error);
      process.exit(1);
    }
  }

  processMarkdownContent() {
    console.log('Processing content files...');
    
    const contentTypes = ['stream', 'lab', 'essays'];
    
    for (const type of contentTypes) {
      const contentPath = path.join(this.config.contentDir, type);
      if (fs.existsSync(contentPath)) {
        const files = fs.readdirSync(contentPath).filter(file => file.endsWith('.md'));
        
        for (const file of files) {
          const filePath = path.join(contentPath, file);
          const content = this.processMarkdownFile(filePath, type);
          if (content) {
            this.processedContent[type].push(content);
          }
        }
      }
    }
    
    // Sort by date (most recent first)
    Object.keys(this.processedContent).forEach(type => {
      this.processedContent[type].sort((a, b) => new Date(b.date) - new Date(a.date));
    });
    
    console.log(`Processed: ${this.processedContent.stream.length} stream posts, ${this.processedContent.lab.length} lab patterns, ${this.processedContent.essays.length} essays`);
  }

  processMarkdownFile(filePath, type) {
    const content = fs.readFileSync(filePath, 'utf8');
    const { frontmatter, body } = this.parseFrontmatter(content);
    
    if (!frontmatter.title) return null;
    
    return {
      ...frontmatter,
      slug: this.generateSlug(frontmatter.title),
      content: marked(body),
      type: type,
      filename: path.basename(filePath, '.md')
    };
  }

  parseFrontmatter(content) {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);
    
    if (!match) {
      return { frontmatter: {}, body: content };
    }
    
    const frontmatterText = match[1];
    const body = match[2];
    
    const frontmatter = {};
    const lines = frontmatterText.split('\n');
    
    for (const line of lines) {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length) {
        let value = valueParts.join(':').trim();
        
        // Parse arrays
        if (value.startsWith('[') && value.endsWith(']')) {
          value = value.slice(1, -1).split(',').map(v => v.trim().replace(/"/g, ''));
        }
        // Remove quotes
        else if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        
        frontmatter[key.trim()] = value;
      }
    }
    
    return { frontmatter, body };
  }

  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  cleanOutput() {
    console.log('Cleaning output directory...');
    if (fs.existsSync(this.config.output)) {
      fs.rmSync(this.config.output, { recursive: true });
    }
    fs.mkdirSync(this.config.output, { recursive: true });
    
    ['stream', 'lab', 'garden', 'essays'].forEach(dir => {
      fs.mkdirSync(path.join(this.config.output, dir), { recursive: true });
    });
  }

  copyStaticFiles() {
    console.log('Copying static files...');
    
    // Copy styles.css
    if (fs.existsSync('styles.css')) {
      fs.copyFileSync('styles.css', path.join(this.config.output, 'styles.css'));
    }
    
    // Copy any other static files (images, etc.)
    if (fs.existsSync('static')) {
      this.copyDirectory('static', this.config.output);
    }
  }

  copyDirectory(src, dest) {
    if (!fs.existsSync(src)) return;
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        fs.mkdirSync(destPath, { recursive: true });
        this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  generateAllPages() {
    console.log('Generating all pages...');
    
    this.generateIndex();
    this.generateStreamPages();
    this.generateLabPages();
    this.generateGardenPages();
    this.generateEssaysPages();
  }

  generateIndex() {
    const template = `<!DOCTYPE html>
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
    
    fs.writeFileSync(path.join(this.config.output, 'index.html'), template);
  }

  generateStreamPages() {
    // Generate stream index
    const streamPosts = this.processedContent.stream.map(post => `
      <article class="stream-post">
          <h2><a href="/stream/${post.slug}.html">${post.title}</a></h2>
          
          <div class="stream-meta">
              <time class="post-date">${post.date}</time>
              <div class="post-categories">${(post.categories || []).join(', ')}</div>
              <div class="post-tags">
                  ${(post.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
              </div>
          </div>
          
          <div class="stream-content">
              ${post.content.substring(0, 500)}...
          </div>
      </article>
    `).join('');

    const streamIndexHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Stream - Luke Miller</title>
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
    
    fs.writeFileSync(path.join(this.config.output, 'stream.html'), streamIndexHTML);
    
    // Generate individual stream posts
    for (const post of this.processedContent.stream) {
      const postHTML = this.generateStreamPost(post);
      fs.writeFileSync(path.join(this.config.output, 'stream', `${post.slug}.html`), postHTML);
    }
  }

  generateStreamPost(post) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${post.title} - Luke Miller</title>
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
                <div class="breadcrumb">
                    <a href="/stream">← Stream</a>
                </div>
                <h1>${post.title}</h1>
            </div>

            <div class="post-meta">
                <time class="post-date">${post.date}</time>
                <div class="post-categories">${(post.categories || []).join(', ')}</div>
                <div class="post-tags">
                    ${(post.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>

            <div class="post-content">
                ${post.content}
            </div>

            ${post.connections ? `
            <div class="post-connections">
                <h3>Connected</h3>
                <ul>
                    ${post.connections.map(conn => `<li><a href="${conn}">${conn}</a></li>`).join('')}
                </ul>
            </div>
            ` : ''}
        </article>
    </main>
</body>
</html>`;
  }

  generateLabPages() {
    // Generate lab index
    const labPatterns = this.processedContent.lab.map(pattern => `
      <div class="pattern-entry">
          <h2><a href="/lab/${pattern.slug}.html">${pattern.title}</a></h2>
          
          <div class="pattern-meta">
              <time class="pattern-date">${pattern.date}</time>
              <div class="pattern-categories">${(pattern.categories || []).join(', ')}</div>
              <div class="pattern-tags">
                  ${(pattern.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
              </div>
          </div>
          
          <div class="pattern-preview">
              ${pattern.content.substring(0, 300)}...
          </div>
      </div>
    `).join('');

    const labIndexHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lab - Luke Miller</title>
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
    
    fs.writeFileSync(path.join(this.config.output, 'lab.html'), labIndexHTML);
    
    // Generate individual lab patterns
    for (const pattern of this.processedContent.lab) {
      const patternHTML = this.generateLabPattern(pattern);
      fs.writeFileSync(path.join(this.config.output, 'lab', `${pattern.slug}.html`), patternHTML);
    }
  }

  generateLabPattern(pattern) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pattern.title} - Luke Miller</title>
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
                <div class="breadcrumb">
                    <a href="/lab">← Lab</a>
                </div>
                <h1>${pattern.title}</h1>
                ${pattern.pronunciation ? `<div class="pattern-pronunciation">${pattern.pronunciation}</div>` : ''}
            </div>

            <div class="pattern-meta">
                <time class="pattern-date">${pattern.date}</time>
                <div class="pattern-categories">${(pattern.categories || []).join(', ')}</div>
                <div class="pattern-tags">
                    ${(pattern.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>

            <div class="pattern-content">
                ${pattern.content}
            </div>

            ${pattern.connections ? `
            <div class="pattern-connections">
                <h2>Connected</h2>
                <ul>
                    ${pattern.connections.map(conn => `<li><a href="${conn}">${conn}</a></li>`).join('')}
                </ul>
            </div>
            ` : ''}
        </article>
    </main>
</body>
</html>`;
  }

  generateGardenPages() {
    // For now, just copy the existing garden structure
    const gardenIndexHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Garden - Luke Miller</title>
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
        <article>
            <div class="content-header">
                <h1>Garden</h1>
                <p class="subtitle">Living documents and evolving structures of knowledge</p>
            </div>

            <section class="garden-structures">
                <p>This garden contains structures that grow and evolve over time—documents that are meant to be revisited, updated, and refined rather than published once and forgotten.</p>
                
                <div class="structure-list">
                    <div class="structure-item">
                        <h2><a href="/garden/lexicon.html">Lexicon</a></h2>
                        <p class="structure-summary">A personal dictionary of terms, concepts, and ideas worth preserving</p>
                        <div class="structure-dates">
                            <span class="date-created">Created: January 15, 2025</span>
                            <span class="date-updated">Updated: January 22, 2025</span>
                        </div>
                    </div>
                </div>
            </section>
        </article>
    </main>
</body>
</html>`;
    
    fs.writeFileSync(path.join(this.config.output, 'garden.html'), gardenIndexHTML);
    
    // Copy existing garden files if they exist
    if (fs.existsSync('garden')) {
      this.copyDirectory('garden', path.join(this.config.output, 'garden'));
    }
  }

  generateEssaysPages() {
    // Generate essays index
    const essayEntries = this.processedContent.essays.map(essay => `
      <div class="essay-entry">
          <h2><a href="/essays/${essay.slug}.html">${essay.title}</a></h2>
          
          <div class="essay-meta">
              <div class="essay-dates">
                  <span class="date-created">Created: ${essay.date_created || essay.date}</span>
                  ${essay.date_updated ? `<span class="date-updated">Updated: ${essay.date_updated}</span>` : ''}
              </div>
              <div class="essay-categories">${(essay.categories || []).join(', ')}</div>
              <div class="essay-tags">
                  ${(essay.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
              </div>
          </div>
          
          <div class="essay-preview">
              ${essay.content.substring(0, 300)}...
          </div>
      </div>
    `).join('');

    const essaysIndexHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Essays - Luke Miller</title>
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
        <article>
            <div class="content-header">
                <h1>Essays</h1>
                <p class="subtitle">Longer explorations of ideas and arguments</p>
            </div>

            <section class="essays-list">
                ${essayEntries}
            </section>
        </article>
    </main>
</body>
</html>`;
    
    fs.writeFileSync(path.join(this.config.output, 'essays.html'), essaysIndexHTML);
    
    // Generate individual essay pages
    for (const essay of this.processedContent.essays) {
      const essayHTML = this.generateEssayPage(essay);
      fs.writeFileSync(path.join(this.config.output, 'essays', `${essay.slug}.html`), essayHTML);
    }
  }

  generateEssayPage(essay) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${essay.title} - Luke Miller</title>
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
                <div class="breadcrumb">
                    <a href="/essays">← Essays</a>
                </div>
                <h1>${essay.title}</h1>
            </div>

            <div class="essay-meta">
                <div class="essay-dates">
                    <span class="date-created">Created: ${essay.date_created || essay.date}</span>
                    ${essay.date_updated ? `<span class="date-updated">Updated: ${essay.date_updated}</span>` : ''}
                </div>
                <div class="essay-categories">${(essay.categories || []).join(', ')}</div>
                <div class="essay-tags">
                    ${(essay.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>

            <div class="essay-content">
                ${essay.content}
            </div>

            ${essay.connections ? `
            <div class="essay-connections">
                <h2>Connected</h2>
                <ul>
                    ${essay.connections.map(conn => `<li><a href="${conn}">${conn}</a></li>`).join('')}
                </ul>
            </div>
            ` : ''}
        </article>
    </main>
</body>
</html>`;
  }

  // Development server
  serve(port = 3000) {
    const server = http.createServer((req, res) => {
      const parsedUrl = url.parse(req.url, true);
      let pathname = parsedUrl.pathname;
      
      // Handle root
      if (pathname === '/') {
        pathname = '/index.html';
      }
      
      // Add .html extension if missing
      if (!path.extname(pathname) && pathname !== '/') {
        pathname += '.html';
      }
      
      const filePath = path.join(this.config.output, pathname);
      
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
          '.json': 'application/json'
        }[ext] || 'text/plain';
        
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      });
    });
    
    server.listen(port, () => {
      console.log(`🚀 Development server running at http://localhost:${port}`);
    });
  }

  // Helper method to create new content
  createNewContent(type, title) {
    const slug = this.generateSlug(title);
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const templates = {
      stream: `---
title: "${title}"
date: "${date}"
categories: ["Notes"]
tags: []
---

Your content here...
`,
      lab: `---
title: "${title}"
date: "${date}"
categories: ["Cognitive Patterns"]
tags: []
---

# ${title}

**Definition:** 

## Examples

## Related Patterns

## Notes

Your pattern content here...
`,
      essays: `---
title: "${title}"
date: "${date}"
date_created: "${date}"
date_updated: "${date}"
categories: ["Essays"]
tags: []
---

# ${title}

Your essay content here...
`
    };
    
    const template = templates[type];
    if (!template) {
      console.error(`Unknown content type: ${type}`);
      return;
    }
    
    const contentDir = path.join(this.config.contentDir, type);
    if (!fs.existsSync(contentDir)) {
      fs.mkdirSync(contentDir, { recursive: true });
    }
    
    const filePath = path.join(contentDir, `${slug}.md`);
    fs.writeFileSync(filePath, template);
    
    console.log(`✅ Created new ${type}: ${filePath}`);
  }
}

// CLI interface
if (require.main === module) {
  const builder = new BlogBuilder();
  
  const [,, command, type, ...args] = process.argv;
  
  if (command === 'serve') {
    builder.build().then(() => {
      builder.serve();
    });
  } else if (command === 'new' && type) {
    const title = args.join(' ');
    if (!title) {
      console.error('Please provide a title for the new content');
      process.exit(1);
    }
    builder.createNewContent(type, title);
  } else {
    builder.build();
  }
}

module.exports = BlogBuilder;
