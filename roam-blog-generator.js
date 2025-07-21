const fs = require('fs-extra');
const path = require('path');

class RoamBlogGenerator {
  constructor(roamDataPath) {
    this.roamData = JSON.parse(fs.readFileSync(roamDataPath, 'utf8'));
    this.pages = new Map();
    this.dailyNotes = new Map();
    this.backlinks = new Map();
    
    // Initialize data structures
    this.processRoamData();
  }

  processRoamData() {
    // Process all pages and build lookup maps
    this.roamData.forEach(page => {
      this.pages.set(page.title, page);
      
      // Track daily notes (date format pages)
      if (this.isDatePage(page.title)) {
        this.dailyNotes.set(page.title, page);
      }
      
      // Build backlinks
      this.extractBacklinks(page);
    });
  }

  isDatePage(title) {
    // Match formats like "March 7th, 2024", "07-19-2025", etc.
    const datePatterns = [
      /^\d{2}-\d{2}-\d{4}$/,
      /^[A-Za-z]+ \d{1,2}(?:st|nd|rd|th), \d{4}$/
    ];
    return datePatterns.some(pattern => pattern.test(title));
  }

  extractBacklinks(page) {
    // Recursively find all [[links]] in content
    const findLinks = (obj) => {
      if (typeof obj === 'string') {
        const linkMatches = obj.match(/\[\[([^\]]+)\]\]/g);
        if (linkMatches) {
          linkMatches.forEach(match => {
            const linkTitle = match.slice(2, -2);
            if (!this.backlinks.has(linkTitle)) {
              this.backlinks.set(linkTitle, []);
            }
            this.backlinks.get(linkTitle).push(page.title);
          });
        }
      } else if (Array.isArray(obj)) {
        obj.forEach(findLinks);
      } else if (obj && typeof obj === 'object') {
        Object.values(obj).forEach(findLinks);
      }
    };
    
    findLinks(page);
  }

  titleToSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  formatDate(dateString) {
    // Handle various date formats from Roam
    if (dateString.match(/^\d{2}-\d{2}-\d{4}$/)) {
      const [month, day, year] = dateString.split('-');
      return new Date(year, month - 1, day).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    
    if (dateString.match(/^[A-Za-z]+ \d{1,2}(?:st|nd|rd|th), \d{4}$/)) {
      return new Date(dateString.replace(/(\d+)(?:st|nd|rd|th)/, '$1')).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    
    return dateString;
  }

  parseContent(children, level = 0) {
    if (!children) return '';
    
    let html = '';
    let currentParagraph = '';
    
    children.forEach(child => {
      if (child.heading) {
        // Close any open paragraph
        if (currentParagraph.trim()) {
          html += `<p>${this.formatInlineContent(currentParagraph.trim())}</p>\n`;
          currentParagraph = '';
        }
        // Add heading
        html += `<h${child.heading}>${this.formatInlineContent(child.string || '')}</h${child.heading}>\n`;
      } else if (child.string) {
        // Add to current paragraph
        currentParagraph += (currentParagraph ? ' ' : '') + child.string;
      }
      
      // Process nested children
      if (child.children) {
        if (currentParagraph.trim()) {
          html += `<p>${this.formatInlineContent(currentParagraph.trim())}</p>\n`;
          currentParagraph = '';
        }
        html += this.parseContent(child.children, level + 1);
      }
    });
    
    // Close final paragraph
    if (currentParagraph.trim()) {
      html += `<p>${this.formatInlineContent(currentParagraph.trim())}</p>\n`;
    }
    
    return html;
  }

  formatInlineContent(text) {
    // Handle Roam links [[Page Title]]
    text = text.replace(/\[\[([^\]]+)\]\]/g, (match, title) => {
      const slug = this.titleToSlug(title);
      return `<a href="${slug}.html">${title}</a>`;
    });
    
    // Handle Tufte CSS sidenotes (+1 content)
    text = text.replace(/\(\+(\d+)\s+([^)]+)\)/g, (match, num, content) => {
      const id = `sn-${Date.now()}-${num}`;
      return `<label for="${id}" class="margin-toggle sidenote-number"></label><input type="checkbox" id="${id}" class="margin-toggle"/><span class="sidenote">${content}</span>`;
    });
    
    // Handle Tufte CSS margin notes (+ content)
    text = text.replace(/\(\+\s+([^)]+)\)/g, (match, content) => {
      const id = `mn-${Date.now()}`;
      return `<label for="${id}" class="margin-toggle">⊕</label><input type="checkbox" id="${id}" class="margin-toggle"/><span class="marginnote">${content}</span>`;
    });
    
    // Handle basic formatting
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    return text;
  }

  extractMetadata(page) {
    const metadata = {};
    
    if (page.children) {
      const findMetadata = (children) => {
        children.forEach(child => {
          if (child.string) {
            // Extract Category, Tags, Date Created, Date Updated
            const categoryMatch = child.string.match(/Category::\s*(.+)/);
            const tagsMatch = child.string.match(/Tags::\s*(.+)/);
            const dateCreatedMatch = child.string.match(/Date Created::\s*\[\[([^\]]+)\]\]/);
            const dateUpdatedMatch = child.string.match(/Date Updated::\s*\[\[([^\]]+)\]\]/);
            
            if (categoryMatch) metadata.category = categoryMatch[1];
            if (tagsMatch) metadata.tags = tagsMatch[1].split(',').map(t => t.trim());
            if (dateCreatedMatch) metadata.dateCreated = this.formatDate(dateCreatedMatch[1]);
            if (dateUpdatedMatch) metadata.dateUpdated = this.formatDate(dateUpdatedMatch[1]);
          }
          
          if (child.children) findMetadata(child.children);
        });
      };
      
      findMetadata(page.children);
    }
    
    return metadata;
  }

  generateStream() {
    const streamPosts = [];
    
    // Iterate through daily notes to find linked posts
    this.dailyNotes.forEach((dailyNote, date) => {
      if (dailyNote.children) {
        dailyNote.children.forEach(child => {
          if (child.string && child.string.includes('[[')) {
            const linkMatch = child.string.match(/\[\[([^\]]+)\]\]/);
            if (linkMatch) {
              const linkedPageTitle = linkMatch[1];
              const linkedPage = this.pages.get(linkedPageTitle);
              
              if (linkedPage) {
                const metadata = this.extractMetadata(linkedPage);
                streamPosts.push({
                  title: linkedPageTitle,
                  date: this.formatDate(date),
                  content: this.parseContent(linkedPage.children),
                  ...metadata
                });
              }
            }
          }
        });
      }
    });
    
    // Sort by date (newest first)
    streamPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return streamPosts;
  }

  generateLab() {
    const labPage = this.pages.get('Lab');
    const labPosts = [];
    
    if (labPage && labPage.children) {
      labPage.children.forEach(child => {
        if (child.string && child.string.includes('[[')) {
          const linkMatch = child.string.match(/\[\[([^\]]+)\]\]/);
          if (linkMatch) {
            const linkedPageTitle = linkMatch[1];
            const linkedPage = this.pages.get(linkedPageTitle);
            
            if (linkedPage) {
              const metadata = this.extractMetadata(linkedPage);
              const content = this.parseContent(linkedPage.children);
              
              labPosts.push({
                title: linkedPageTitle,
                slug: this.titleToSlug(linkedPageTitle),
                content,
                backlinks: this.backlinks.get(linkedPageTitle) || [],
                ...metadata
              });
            }
          }
        }
      });
    }
    
    return labPosts;
  }

  generateGarden() {
    const gardenPage = this.pages.get('Garden');
    const gardenArtifacts = [];
    
    if (gardenPage && gardenPage.children) {
      gardenPage.children.forEach(child => {
        if (child.string && child.string.includes('[[')) {
          const linkMatch = child.string.match(/\[\[([^\]]+)\]\]/);
          if (linkMatch) {
            const artifactTitle = linkMatch[1];
            const artifactPage = this.pages.get(artifactTitle);
            
            // Get subtitle from nested content
            let subtitle = '';
            if (child.children && child.children[0] && child.children[0].string) {
              subtitle = child.children[0].string;
            }
            
            if (artifactPage) {
              const content = this.parseContent(artifactPage.children);
              
              gardenArtifacts.push({
                title: artifactTitle,
                slug: this.titleToSlug(artifactTitle),
                subtitle,
                content,
                backlinks: this.backlinks.get(artifactTitle) || []
              });
            }
          }
        }
      });
    }
    
    return gardenArtifacts;
  }

  generateEssays() {
    const essaysPage = this.pages.get('Essays');
    const essays = [];
    
    if (essaysPage && essaysPage.children) {
      essaysPage.children.forEach(child => {
        if (child.string && child.string.includes('[[')) {
          const linkMatch = child.string.match(/\[\[([^\]]+)\]\]/);
          if (linkMatch) {
            const essayTitle = linkMatch[1];
            const essayPage = this.pages.get(essayTitle);
            
            if (essayPage) {
              const metadata = this.extractMetadata(essayPage);
              const content = this.parseContent(essayPage.children);
              
              essays.push({
                title: essayTitle,
                slug: this.titleToSlug(essayTitle),
                content,
                backlinks: this.backlinks.get(essayTitle) || [],
                ...metadata
              });
            }
          }
        }
      });
    }
    
    return essays;
  }

  generateHTML(template, data) {
    let html = template;
    
    // Simple template replacement
    Object.keys(data).forEach(key => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(placeholder, data[key] || '');
    });
    
    return html;
  }

  async buildSite() {
    // Ensure directories exist
    await fs.ensureDir('dist');
    await fs.ensureDir('dist/lab');
    await fs.ensureDir('dist/garden');
    await fs.ensureDir('dist/essays');
    
    // Copy static assets
    await fs.copy('tufte-blog.css', 'dist/tufte-blog.css');
    if (await fs.pathExists('et-book')) {
      await fs.copy('et-book', 'dist/et-book');
    }
    
    // Generate content
    const streamPosts = this.generateStream();
    const labPosts = this.generateLab();
    const gardenArtifacts = this.generateGarden();
    const essays = this.generateEssays();
    
    // Load templates
    const labTemplate = await fs.readFile('templates/lab-post-template.html', 'utf8');
    const essayTemplate = await fs.readFile('templates/essay-template.html', 'utf8');
    
    // Generate stream.html
    let streamHTML = await fs.readFile('stream.html', 'utf8');
    const streamPostsHTML = streamPosts.map(post => 
      `<div class="post-entry">
         <h3 class="post-title">${post.title}</h3>
         <div class="post-meta">${post.date}${post.category ? ` | ${post.category}` : ''}</div>
         <div class="post-content">${post.content}</div>
       </div>`
    ).join('\n');
    
    // Replace placeholder in stream.html (you'll need to add this)
    streamHTML = streamHTML.replace('{{stream-posts}}', streamPostsHTML);
    await fs.writeFile('dist/stream.html', streamHTML);
    
    // Generate lab posts
    for (const post of labPosts) {
      const metadata = `${post.dateCreated ? `Created: ${post.dateCreated}` : ''}${post.dateUpdated ? ` | Updated: ${post.dateUpdated}` : ''}${post.category ? ` | ${post.category}` : ''}`;
      
      const html = this.generateHTML(labTemplate, {
        title: post.title,
        metadata,
        content: post.content
      });
      
      await fs.writeFile(`dist/lab/${post.slug}.html`, html);
    }
    
    // Generate garden artifacts
    for (const artifact of gardenArtifacts) {
      // Use a simplified template for garden artifacts
      const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8"/>
    <title>${artifact.title} - Garden - Luke Miller</title>
    <link rel="stylesheet" href="../tufte-blog.css"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body>
    <nav>
      <ul>
        <li><a href="../index.html">Home</a></li>
        <li><a href="../stream.html">Stream</a></li>
        <li><a href="../lab.html">Lab</a></li>
        <li><a href="../garden.html">Garden</a></li>
        <li><a href="../essays.html">Essays</a></li>
        <li><a href="../about.html">About</a></li>
      </ul>
    </nav>
    <article>
      <h1>${artifact.title}</h1>
      <section>
        ${artifact.content}
      </section>
    </article>
  </body>
</html>`;
      
      await fs.writeFile(`dist/garden/${artifact.slug}.html`, html);
    }
    
    // Generate essays
    for (const essay of essays) {
      const metadata = `${essay.dateCreated ? `Created: ${essay.dateCreated}` : ''}${essay.dateUpdated ? ` | Updated: ${essay.dateUpdated}` : ''}${essay.category ? ` | ${essay.category}` : ''}`;
      
      const html = this.generateHTML(essayTemplate, {
        title: essay.title,
        metadata,
        content: essay.content
      });
      
      await fs.writeFile(`dist/essays/${essay.slug}.html`, html);
    }
    
    // Update index pages with generated content
    await this.updateIndexPages(streamPosts, labPosts, gardenArtifacts, essays);
    
    // Copy remaining static pages
    const staticPages = ['index.html', 'about.html'];
    for (const page of staticPages) {
      if (await fs.pathExists(page)) {
        await fs.copy(page, `dist/${page}`);
      }
    }
    
    console.log('✅ Blog generated successfully!');
    console.log(`📊 Generated: ${streamPosts.length} stream posts, ${labPosts.length} lab posts, ${gardenArtifacts.length} garden artifacts, ${essays.length} essays`);
  }

  async updateIndexPages(streamPosts, labPosts, gardenArtifacts, essays) {
    // Update lab.html
    const labIndexHTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8"/>
    <title>Lab - Luke Miller</title>
    <link rel="stylesheet" href="tufte-blog.css"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body>
    <nav>
      <ul>
        <li><a href="index.html">Home</a></li>
        <li><a href="stream.html">Stream</a></li>
        <li><a href="lab.html">Lab</a></li>
        <li><a href="garden.html">Garden</a></li>
        <li><a href="essays.html">Essays</a></li>
        <li><a href="about.html">About</a></li>
      </ul>
    </nav>
    <article>
      <h1>Lab</h1>
      <section>
        ${labPosts.map(post => 
          `<div class="post-entry">
             <h3 class="post-title">
               <a href="lab/${post.slug}.html">${post.title}</a>
             </h3>
             <div class="post-meta">
               ${post.dateCreated ? `Created: ${post.dateCreated}` : ''}${post.dateUpdated ? ` | Updated: ${post.dateUpdated}` : ''}
             </div>
           </div>`
        ).join('\n        ')}
      </section>
    </article>
  </body>
</html>`;
    
    await fs.writeFile('dist/lab.html', labIndexHTML);
    
    // Update garden.html
    const gardenIndexHTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8"/>
    <title>Garden - Luke Miller</title>
    <link rel="stylesheet" href="tufte-blog.css"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body>
    <nav>
      <ul>
        <li><a href="index.html">Home</a></li>
        <li><a href="stream.html">Stream</a></li>
        <li><a href="lab.html">Lab</a></li>
        <li><a href="garden.html">Garden</a></li>
        <li><a href="essays.html">Essays</a></li>
        <li><a href="about.html">About</a></li>
      </ul>
    </nav>
    <article>
      <h1>Garden</h1>
      <section>
        ${gardenArtifacts.map(artifact => 
          `<div class="post-entry">
             <h3 class="post-title">
               <a href="garden/${artifact.slug}.html">${artifact.title}</a>
             </h3>
             <p class="garden-subtitle">${artifact.subtitle}</p>
           </div>`
        ).join('\n        ')}
      </section>
    </article>
  </body>
</html>`;
    
    await fs.writeFile('dist/garden.html', gardenIndexHTML);
    
    // Update essays.html
    const essaysIndexHTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8"/>
    <title>Essays - Luke Miller</title>
    <link rel="stylesheet" href="tufte-blog.css"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body>
    <nav>
      <ul>
        <li><a href="index.html">Home</a></li>
        <li><a href="stream.html">Stream</a></li>
        <li><a href="lab.html">Lab</a></li>
        <li><a href="garden.html">Garden</a></li>
        <li><a href="essays.html">Essays</a></li>
        <li><a href="about.html">About</a></li>
      </ul>
    </nav>
    <article>
      <h1>Essays</h1>
      <section>
        ${essays.map(essay => 
          `<div class="post-entry">
             <h3 class="post-title">
               <a href="essays/${essay.slug}.html">${essay.title}</a>
             </h3>
             <div class="post-meta">
               ${essay.dateCreated ? `Created: ${essay.dateCreated}` : ''}${essay.dateUpdated ? ` | Updated: ${essay.dateUpdated}` : ''}
             </div>
           </div>`
        ).join('\n        ')}
      </section>
    </article>
  </body>
</html>`;
    
    await fs.writeFile('dist/essays.html', essaysIndexHTML);
  }
}

// Usage
async function main() {
  try {
    const generator = new RoamBlogGenerator('roam-export.json');
    await generator.buildSite();
  } catch (error) {
    console.error('❌ Error generating blog:', error);
    process.exit(1);
  }
}

// Export for use as module or run directly
if (require.main === module) {
  main();
}

module.exports = RoamBlogGenerator;
