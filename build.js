// build.js - Clean, simple blog builder
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

class CleanBlogBuilder {
  constructor() {
    this.postsDir = './posts-markdown';
    this.outputDir = './posts';
    this.templatePath = './post-template.html';
  }

  // Build all posts
  buildAll(force = false) {
    console.log('🏗️  Building blog...');
    
    if (!fs.existsSync(this.postsDir)) {
      console.log('No posts-markdown directory found');
      return;
    }

    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    const files = fs.readdirSync(this.postsDir)
      .filter(file => file.endsWith('.md'))
      .sort();

    const posts = [];

    files.forEach(file => {
      const post = this.buildPost(file, force);
      if (post) posts.push(post);
    });

    this.updateWritingPage(posts);
    
    console.log(`✅ Built ${posts.length} posts successfully!`);
  }

  // Build individual post
  buildPost(filename, force = false) {
    const markdownPath = path.join(this.postsDir, filename);
    const htmlPath = path.join(this.outputDir, filename.replace('.md', '.html'));
    
    // Check if we need to rebuild (skip if not forced and file is up to date)
    if (!force && fs.existsSync(htmlPath)) {
      const markdownTime = fs.statSync(markdownPath).mtime;
      const htmlTime = fs.statSync(htmlPath).mtime;
      const templateTime = fs.statSync(this.templatePath).mtime;
      
      if (markdownTime <= htmlTime && templateTime <= htmlTime) {
        console.log(`Skipping ${filename} (up to date)`);
        // Still need to return post data for writing.html update
        try {
          const content = fs.readFileSync(markdownPath, 'utf8');
          const { frontmatter } = this.parseFrontmatter(content);
          return {
            filename: filename.replace('.md', '.html'),
            title: frontmatter.title || 'Untitled',
            date: frontmatter.date || '',
            tags: frontmatter.tags || [],
            categories: frontmatter.categories || []
          };
        } catch (error) {
          console.error(`Error reading ${filename} for metadata:`, error);
          return null;
        }
      }
    }
    
    try {
      const content = fs.readFileSync(markdownPath, 'utf8');
      const { frontmatter, body } = this.parseFrontmatter(content);
      
      const html = marked(body);
      const template = fs.readFileSync(this.templatePath, 'utf8');
      
      const finalHtml = template
        .replace(/\{\{TITLE\}\}/g, frontmatter.title || 'Untitled')
        .replace(/\{\{DATE\}\}/g, frontmatter.date || '')
        .replace(/\{\{CONTENT\}\}/g, html)
        .replace(/\{\{TAGS_SECTION\}\}/g, this.createTagsSection(frontmatter.tags))
        .replace(/\{\{CATEGORIES_SECTION\}\}/g, this.createCategoriesSection(frontmatter.categories));
      
      fs.writeFileSync(htmlPath, finalHtml);
      console.log(`Built ${filename}`);
      
      return {
        filename: filename.replace('.md', '.html'),
        title: frontmatter.title || 'Untitled',
        date: frontmatter.date || '',
        tags: frontmatter.tags || [],
        categories: frontmatter.categories || []
      };
    } catch (error) {
      console.error(`Error building ${filename}:`, error);
      return null;
    }
  }

  // Parse frontmatter
  parseFrontmatter(content) {
    const lines = content.split('\n');
    let frontmatter = {};
    let frontmatterEnd = -1;

    if (lines[0].trim() === '---') {
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '---') {
          frontmatterEnd = i;
          break;
        }
        
        const line = lines[i];
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          const key = line.substring(0, colonIndex).trim();
          let value = line.substring(colonIndex + 1).trim();
          
          // Handle arrays
          if (value.startsWith('[') && value.endsWith(']')) {
            value = value.slice(1, -1).split(',').map(v => v.trim().replace(/"/g, ''));
          } else {
            value = value.replace(/"/g, '');
          }
          
          frontmatter[key] = value;
        }
      }
    }

    const body = frontmatterEnd > 0 
      ? lines.slice(frontmatterEnd + 1).join('\n')
      : content;

    return { frontmatter, body };
  }

  // Create tags section for post footer
  createTagsSection(tags) {
    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return '';
    }
    
    const tagLinks = tags.map(tag => {
      // You can manually link these to tag pages later if you want
      return `<span class="tag">${tag}</span>`;
    }).join(' ');
    
    return `<p><strong>Tags:</strong> ${tagLinks}</p>`;
  }

  // Create categories section for post footer  
  createCategoriesSection(categories) {
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return '';
    }
    
    const categoryLinks = categories.map(category => {
      // You can manually link these to category pages later if you want
      return `<span class="category">${category}</span>`;
    }).join(' ');
    
    return `<p><strong>Categories:</strong> ${categoryLinks}</p>`;
  }

  // Update writing.html with post list
  updateWritingPage(posts) {
    // Sort by date (newest first)
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Group by year
    const postsByYear = {};
    posts.forEach(post => {
      const year = post.date ? new Date(post.date).getFullYear() : 2025;
      if (!postsByYear[year]) postsByYear[year] = [];
      postsByYear[year].push(post);
    });

    // Generate HTML
    let postsHtml = '';
    Object.keys(postsByYear)
      .sort((a, b) => b - a)
      .forEach(year => {
        postsHtml += `      <h2>${year}</h2>\n`;
        postsHtml += `      <ul class="post-list">\n`;
        
        postsByYear[year].forEach(post => {
          const date = new Date(post.date);
          const formattedDate = date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          });
          
          postsHtml += `        <li><span class="date">${formattedDate}</span> <a href="posts/${post.filename}">${post.title}</a></li>\n`;
        });
        
        postsHtml += `      </ul>\n`;
      });

    // Read current writing.html and update the post list section
    let writingHtml = fs.readFileSync('./writing.html', 'utf8');
    
    // Replace content between post list markers
    const startMarker = '<!-- POST_LIST_START -->';
    const endMarker = '<!-- POST_LIST_END -->';
    
    const startIndex = writingHtml.indexOf(startMarker);
    const endIndex = writingHtml.indexOf(endMarker);
    
    if (startIndex !== -1 && endIndex !== -1) {
      writingHtml = writingHtml.substring(0, startIndex + startMarker.length) +
        '\n' + postsHtml +
        '      ' + writingHtml.substring(endIndex);
      
      // Update post count
      const totalCount = posts.length;
      const lastUpdated = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      writingHtml = writingHtml.replace(
        /\d+ total posts? • Last updated: [^<]+/,
        `${totalCount} total post${totalCount !== 1 ? 's' : ''} • Last updated: ${lastUpdated}`
      );
      
      fs.writeFileSync('./writing.html', writingHtml);
      console.log('Updated writing.html');
    }
  }

  // Create new post
  newPost(title) {
    if (!title) {
      console.log('Usage: node build.js new "Post Title"');
      return;
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const today = new Date().toISOString().split('T')[0];
    
    const content = `---
title: "${title}"
date: "${today}"
tags: []
categories: []
---

# ${title}

Write your post here...
`;

    if (!fs.existsSync(this.postsDir)) {
      fs.mkdirSync(this.postsDir, { recursive: true });
    }

    const filename = `${slug}.md`;
    fs.writeFileSync(path.join(this.postsDir, filename), content);
    console.log(`Created new post: ${this.postsDir}/${filename}`);
  }

  // Development server
  serve(port = 3000) {
    const http = require('http');
    const url = require('url');
    
    const server = http.createServer((req, res) => {
      const pathname = url.parse(req.url).pathname;
      let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname.slice(1));
      
      // Handle common file types
      const ext = path.extname(filePath);
      const mimeTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'text/javascript',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2'
      };
      
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        
        const contentType = mimeTypes[ext] || 'text/plain';
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      });
    });
    
    server.listen(port, () => {
      console.log(`Dev server running at http://localhost:${port}`);
      console.log('Press Ctrl+C to stop');
    });
  }
}

// CLI
if (require.main === module) {
  const builder = new CleanBlogBuilder();
  const command = process.argv[2];
  
      switch (command) {
    case 'new':
      const title = process.argv.slice(3).join(' ');
      builder.newPost(title);
      break;
    case 'serve':
      const port = process.argv[3] || 3000;
      builder.serve(port);
      break;
    case 'force':
      builder.buildAll(true);
      break;
    default:
      builder.buildAll();
  }
}

module.exports = CleanBlogBuilder;
