const fs = require('fs-extra');
const path = require('path');

class RoamBlogGenerator {
  constructor(roamDataPath) {
    this.roamData = JSON.parse(fs.readFileSync(roamDataPath, 'utf8'));
    this.pages = new Map();
    this.dailyNotes = new Map();
    this.backlinks = new Map();
    this.pageToSection = new Map();
    
    this.processRoamData();
  }

  processRoamData() {
    this.roamData.forEach(page => {
      this.pages.set(page.title, page);
      
      if (this.isDatePage(page.title)) {
        this.dailyNotes.set(page.title, page);
      }
      
      this.extractBacklinks(page);
    });
    
    this.buildPageSectionMap();
  }

  isDatePage(title) {
    const datePatterns = [
      /^\d{2}-\d{2}-\d{4}$/,
      /^[A-Za-z]+ \d{1,2}(?:st|nd|rd|th), \d{4}$/
    ];
    return datePatterns.some(pattern => pattern.test(title));
  }

  extractBacklinks(page) {
    // Skip creating backlinks for main index pages and daily notes pages
    const indexPages = ['Garden', 'Stream'];
    if (indexPages.includes(page.title) || this.isDatePage(page.title)) {
      return;
    }
    
    const findLinks = (obj) => {
      if (typeof obj === 'string') {
        const linkMatches = obj.match(/\[\[([^\]]+)\]\]/g);
        if (linkMatches) {
          linkMatches.forEach(match => {
            const linkTitle = match.slice(2, -2);
            // Don't create backlinks to index pages or daily notes pages
            if (!indexPages.includes(linkTitle) && !this.isDatePage(linkTitle)) {
              if (!this.backlinks.has(linkTitle)) {
                this.backlinks.set(linkTitle, []);
              }
              this.backlinks.get(linkTitle).push(page.title);
            }
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

  buildPageSectionMap() {
    const gardenPage = this.pages.get('Garden');
    
    if (gardenPage && gardenPage.children) {
      gardenPage.children.forEach(child => {
        if (child.string && child.string.includes('[[')) {
          const linkMatch = child.string.match(/\[\[([^\]]+)\]\]/);
          if (linkMatch) {
            this.pageToSection.set(linkMatch[1], 'garden');
          }
        }
      });
    }
    
    // Map daily note links to stream
    this.dailyNotes.forEach((dailyNote) => {
      if (dailyNote.children) {
        dailyNote.children.forEach(child => {
          if (child.string && child.string.includes('[[')) {
            const linkMatch = child.string.match(/\[\[([^\]]+)\]\]/);
            if (linkMatch && !this.pageToSection.has(linkMatch[1])) {
              this.pageToSection.set(linkMatch[1], 'stream');
            }
          }
        });
      }
    });
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

  getPageUrl(title, currentSection = '') {
    const slug = this.titleToSlug(title);
    const section = this.pageToSection.get(title);
    
    if (!section) {
      return currentSection ? `${slug}.html` : `${slug}.html`;
    }
    
    if (currentSection && currentSection !== 'root') {
      return `../${section}/${slug}.html`;
    } else {
      return `${section}/${slug}.html`;
    }
  }

  formatInlineContent(text, currentSection = '') {
    text = text.replace(/\[\[([^\]]+)\]\]/g, (match, title) => {
      const url = this.getPageUrl(title, currentSection);
      return `<a href="${url}">${title}</a>`;
    });
    
    text = text.replace(/\(\+(\d+)\s+([^)]+)\)/g, (match, num, content) => {
      const id = `sn-${Date.now()}-${num}`;
      return `<label for="${id}" class="margin-toggle sidenote-number"></label><input type="checkbox" id="${id}" class="margin-toggle"/><span class="sidenote">${content}</span>`;
    });
    
    text = text.replace(/\(\+\s+([^)]+)\)/g, (match, content) => {
      const id = `mn-${Date.now()}`;
      return `<label for="${id}" class="margin-toggle">⊕</label><input type="checkbox" id="${id}" class="margin-toggle"/><span class="marginnote">${content}</span>`;
    });
    
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    return text;
  }

  parseContent(children, level = 0, currentSection = '') {
    if (!children) return '';
    
    let html = '';
    
    children.forEach(child => {
      if (child.heading === 1 && child.string === 'Metadata') {
        return;
      }
      
      if (child.heading) {
        html += `<h${child.heading}>${this.formatInlineContent(child.string || '', currentSection)}</h${child.heading}>\n`;
      } else if (child.string && child.string.trim()) {
        html += `<p>${this.formatInlineContent(child.string.trim(), currentSection)}</p>\n`;
      }
      
      if (child.children && !(child.heading === 1 && child.string === 'Metadata')) {
        html += this.parseContent(child.children, level + 1, currentSection);
      }
    });
    
    return html;
  }

  extractMetadata(page) {
    const metadata = {};
    
    if (page.children) {
      const findMetadata = (children) => {
        children.forEach(child => {
          if (child.string) {
            const typeMatch = child.string.match(/Type::\s*(.+)/);
            const tagsMatch = child.string.match(/Tags::\s*(.+)/);
            const dateCreatedMatch = child.string.match(/Date Created::\s*\[\[([^\]]+)\]\]/);
            const dateUpdatedMatch = child.string.match(/Date Updated::\s*\[\[([^\]]+)\]\]/);
            const subtitleMatch = child.string.match(/Subtitle::\s*(.+)/);
            
            if (typeMatch) metadata.type = typeMatch[1];
            if (tagsMatch) metadata.tags = tagsMatch[1].split(',').map(t => t.trim());
            if (dateCreatedMatch) metadata.dateCreated = this.formatDate(dateCreatedMatch[1]);
            if (dateUpdatedMatch) metadata.dateUpdated = this.formatDate(dateUpdatedMatch[1]);
            if (subtitleMatch) metadata.subtitle = subtitleMatch[1];
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
                  slug: this.titleToSlug(linkedPageTitle),
                  date: this.formatDate(date),
                  content: this.parseContent(linkedPage.children, 0, 'stream'),
                  backlinks: this.backlinks.get(linkedPageTitle) || [],
                  ...metadata
                });
              }
            }
          }
        });
      }
    });
    
    streamPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
    return streamPosts;
  }

  generateGarden() {
    const gardenPage = this.pages.get('Garden');
    const gardenPosts = [];
    
    if (gardenPage && gardenPage.children) {
      gardenPage.children.forEach(child => {
        if (child.string && child.string.includes('[[')) {
          const linkMatch = child.string.match(/\[\[([^\]]+)\]\]/);
          if (linkMatch) {
            const postTitle = linkMatch[1];
            const postPage = this.pages.get(postTitle);
            
            if (postPage) {
              const metadata = this.extractMetadata(postPage);
              const content = this.parseContent(postPage.children, 0, 'garden');
              
              gardenPosts.push({
                title: postTitle,
                slug: this.titleToSlug(postTitle),
                content,
                backlinks: this.backlinks.get(postTitle) || [],
                ...metadata
              });
            }
          }
        }
      });
    }
    
    return gardenPosts;
  }

  generateHTML(template, data) {
    let html = template;
    
    Object.keys(data).forEach(key => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(placeholder, data[key] || '');
    });
    
    return html;
  }

  async updateIndexPages(streamPosts, gardenPosts) {
    // Create the garden posts data for JavaScript
    const gardenData = gardenPosts.map(post => ({
      title: post.title,
      slug: post.slug,
      type: post.type || '',
      tags: post.tags || [],
      dateCreated: post.dateCreated || '',
      dateUpdated: post.dateUpdated || ''
    }));

    const gardenIndexHTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8"/>
    <title>Garden - Luke Miller</title>
    <link rel="stylesheet" href="tufte-blog.css"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      .garden-controls {
        margin-bottom: 2rem;
        padding: 1rem;
        background-color: #fafafa;
        border: 1px solid #e6e6e6;
      }
      .garden-controls input, .garden-controls select {
        padding: 0.5rem;
        margin-right: 1rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 1rem;
      }
      .garden-controls input {
        width: 300px;
      }
      .garden-controls select {
        width: 150px;
      }
      .post-entry {
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #eee;
      }
      .post-entry.hidden {
        display: none;
      }
      .no-results {
        text-align: center;
        color: #666;
        font-style: italic;
        margin: 2rem 0;
        display: none;
      }
    </style>
  </head>
  <body>
    <nav>
      <ul>
        <li><a href="index.html">Home</a></li>
        <li><a href="stream.html">Stream</a></li>
        <li><a href="garden.html">Garden</a></li>
        <li><a href="about.html">About</a></li>
      </ul>
    </nav>
    <article>
      <h1>Garden</h1>
      
      <div class="garden-controls">
        <input type="text" id="searchInput" placeholder="Search posts..." />
        <select id="typeFilter">
          <option value="">All Types</option>
          <option value="Element">Element</option>
          <option value="Pattern">Pattern</option>
          <option value="Structure">Structure</option>
        </select>
        <span id="resultCount">${gardenPosts.length} posts</span>
      </div>

      <section id="gardenPosts">
        ${gardenPosts.map(post => 
          `<div class="post-entry" data-type="${post.type || ''}" data-title="${post.title.toLowerCase()}" data-tags="${(post.tags || []).join(' ').toLowerCase()}">
             <h3 class="post-title">
               <a href="garden/${post.slug}.html">${post.title}</a>
             </h3>
             <div class="post-meta">
               ${post.type ? `Type: ${post.type}` : ''}${post.type && (post.dateCreated || post.dateUpdated) ? ' | ' : ''}${post.dateCreated ? `Created: ${post.dateCreated}` : ''}${post.dateUpdated ? ` | Updated: ${post.dateUpdated}` : ''}
             </div>
           </div>`
        ).join('\n        ')}
      </section>
      
      <div class="no-results" id="noResults">
        No posts match your search criteria.
      </div>
    </article>

    <script>
      const searchInput = document.getElementById('searchInput');
      const typeFilter = document.getElementById('typeFilter');
      const resultCount = document.getElementById('resultCount');
      const noResults = document.getElementById('noResults');
      const postEntries = document.querySelectorAll('.post-entry');

      function filterPosts() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedType = typeFilter.value;
        let visibleCount = 0;

        postEntries.forEach(post => {
          const title = post.dataset.title;
          const tags = post.dataset.tags;
          const type = post.dataset.type;
          
          // Check if post matches search term (in title or tags)
          const matchesSearch = !searchTerm || 
            title.includes(searchTerm) || 
            tags.includes(searchTerm);
          
          // Check if post matches type filter
          const matchesType = !selectedType || type === selectedType;
          
          // Show post if it matches both criteria
          if (matchesSearch && matchesType) {
            post.classList.remove('hidden');
            visibleCount++;
          } else {
            post.classList.add('hidden');
          }
        });

        // Update result count and show/hide no results message
        resultCount.textContent = \`\${visibleCount} post\${visibleCount !== 1 ? 's' : ''}\`;
        
        if (visibleCount === 0) {
          noResults.style.display = 'block';
        } else {
          noResults.style.display = 'none';
        }
      }

      // Add event listeners
      searchInput.addEventListener('input', filterPosts);
      typeFilter.addEventListener('change', filterPosts);
      
      // Initial filter
      filterPosts();
    </script>
  </body>
</html>`;
    
    await fs.writeFile('dist/garden.html', gardenIndexHTML);
  }

  async buildSite() {
    console.log('🚀 Starting blog generation...');
    console.log(`📚 Total pages in Roam: ${this.pages.size}`);
    console.log(`📅 Daily notes found: ${this.dailyNotes.size}`);
    
    console.log('🔍 Key pages found:');
    ['Garden', 'Stream'].forEach(key => {
      console.log(`  - ${key}: ${this.pages.has(key) ? '✅' : '❌'}`);
    });
    
    await fs.ensureDir('dist');
    await fs.ensureDir('dist/garden');
    await fs.ensureDir('dist/stream');
    
    await fs.copy('tufte-blog.css', 'dist/tufte-blog.css');
    if (await fs.pathExists('et-book')) {
      await fs.copy('et-book', 'dist/et-book');
    }
    
    console.log('📝 Generating content...');
    const streamPosts = this.generateStream();
    console.log(`📰 Stream posts: ${streamPosts.length}`);
    
    const gardenPosts = this.generateGarden();
    console.log(`🌱 Garden posts: ${gardenPosts.length}`);
    
    console.log('📋 Loading templates...');
    const streamTemplate = await fs.readFile('templates/stream-post-template.html', 'utf8');
    console.log('✅ Templates loaded successfully');
    
    console.log('🌊 Generating stream.html...');
    let streamHTML = await fs.readFile('stream.html', 'utf8');
    const streamPostsHTML = streamPosts.map(post => {
      const tagsText = post.tags ? ` | Tags: ${post.tags.join(', ')}` : '';
      return `<div class="post-entry">
         <h3 class="post-title">
           <a href="stream/${post.slug}.html">${post.title}</a>
         </h3>
         <div class="post-meta">${post.date}${post.type ? ` | ${post.type}` : ''}${tagsText}</div>
         <div class="post-content">${post.content}</div>
       </div>`;
    }).join('\n');
    
    streamHTML = streamHTML.replace('{{stream-posts}}', streamPostsHTML);
    await fs.writeFile('dist/stream.html', streamHTML);
    console.log('✅ Stream.html generated');
    
    // Generate individual stream post pages
    console.log('🌊 Generating individual stream posts...');
    for (const post of streamPosts) {
      const tagsText = post.tags ? ` | Tags: ${post.tags.join(', ')}` : '';
      const metadata = `${post.date}${post.type ? ` | ${post.type}` : ''}${tagsText}`;
      
      let backlinksHTML = '';
      if (post.backlinks && post.backlinks.length > 0) {
        backlinksHTML = `
      <div class="backlinks">
        <h3>Referenced by</h3>
        <ul>
          ${post.backlinks.map(backlinkTitle => {
            const url = this.getPageUrl(backlinkTitle, 'stream');
            return `<li><a href="${url}">${backlinkTitle}</a></li>`;
          }).join('\n          ')}
        </ul>
      </div>`;
      }
      
      const html = this.generateHTML(streamTemplate, {
        title: post.title,
        metadata,
        content: post.content,
        backlinks: backlinksHTML
      });
      
      await fs.writeFile(`dist/stream/${post.slug}.html`, html);
    }
    console.log('✅ Individual stream posts generated');
    
    console.log('🌱 Generating garden posts...');
    for (const post of gardenPosts) {
      const typeText = post.type ? `Type: ${post.type}` : '';
      const tagsText = post.tags ? `Tags: ${post.tags.join(', ')}` : '';
      const dateText = `${post.dateCreated ? `Created: ${post.dateCreated}` : ''}${post.dateUpdated ? ` | Updated: ${post.dateUpdated}` : ''}`;
      
      // Combine metadata with proper separators
      const metadataParts = [dateText, typeText, tagsText].filter(part => part.trim());
      const metadata = metadataParts.join(' | ');
      
      let backlinksHTML = '';
      if (post.backlinks && post.backlinks.length > 0) {
        backlinksHTML = `
      <div class="backlinks">
        <h3>Referenced by</h3>
        <ul>
          ${post.backlinks.map(backlinkTitle => {
            const url = this.getPageUrl(backlinkTitle, 'garden');
            return `<li><a href="${url}">${backlinkTitle}</a></li>`;
          }).join('\n          ')}
        </ul>
      </div>`;
      }
      
      const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8"/>
    <title>${post.title} - Garden - Luke Miller</title>
    <link rel="stylesheet" href="../tufte-blog.css"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body>
    <nav>
      <ul>
        <li><a href="../index.html">Home</a></li>
        <li><a href="../stream.html">Stream</a></li>
        <li><a href="../garden.html">Garden</a></li>
        <li><a href="../about.html">About</a></li>
      </ul>
    </nav>
    <article>
      <h1>${post.title}</h1>
      ${metadata ? `<div class="post-meta">${metadata}</div>` : ''}
      <section>
        ${post.content}
      </section>
      ${backlinksHTML}
    </article>
  </body>
</html>`;
      
      await fs.writeFile(`dist/garden/${post.slug}.html`, html);
    }
    console.log('✅ Garden posts generated');
    
    await this.updateIndexPages(streamPosts, gardenPosts);
    
    const staticPages = ['index.html', 'about.html'];
    for (const page of staticPages) {
      if (await fs.pathExists(page)) {
        await fs.copy(page, `dist/${page}`);
      }
    }
    
    console.log('✅ Blog generated successfully!');
    console.log(`📊 Generated: ${streamPosts.length} stream posts, ${gardenPosts.length} garden posts`);
  }
}

async function main() {
  try {
    const generator = new RoamBlogGenerator('roam-export.json');
    await generator.buildSite();
  } catch (error) {
    console.error('❌ Error generating blog:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = RoamBlogGenerator;
