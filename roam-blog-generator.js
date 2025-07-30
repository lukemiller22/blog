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
    const indexPages = ['Garden', 'Stream', 'Lab', 'Essays'];
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
    const sectionPages = ['Garden', 'Lab', 'Essays'];
    
    sectionPages.forEach(sectionName => {
      const sectionPage = this.pages.get(sectionName);
      if (sectionPage && sectionPage.children) {
        sectionPage.children.forEach(child => {
          if (child.string && child.string.includes('[[')) {
            const linkMatch = child.string.match(/\[\[([^\]]+)\]\]/);
            if (linkMatch) {
              this.pageToSection.set(linkMatch[1], sectionName.toLowerCase());
            }
          }
        });
      }
    });
    
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

  getPageUrl(pageTitle, currentSection) {
    const section = this.pageToSection.get(pageTitle) || 'stream';
    const slug = this.titleToSlug(pageTitle);
    
    if (currentSection === section) {
      return `${slug}.html`;
    } else {
      return `../${section}/${slug}.html`;
    }
  }

  parseContent(children, level = 0, currentSection = 'stream') {
    if (!children) return '';
    
    let html = '';
    
    children.forEach((child, index) => {
      if (child.heading && child.heading === 1 && child.string === 'Metadata') {
        return;
      }
      
      if (child.string) {
        // Check if this is a Roam table
        if (child.string.includes('{{[[table]]}}')) {
          // Find the table content (should be in the children)
          if (child.children && child.children.length > 0) {
            html += this.parseRoamTable(child, currentSection);
          }
          return; // Skip normal processing for table blocks
        }
        
        // Check if this is an image with a link in the next child
        const hasImage = child.string.includes('![](');
        const nextChild = child.children && child.children[0];
        const nextChildIsLink = nextChild && nextChild.string && 
          (nextChild.string.startsWith('http://') || nextChild.string.startsWith('https://'));
        
        let content;
        
        if (hasImage && nextChildIsLink) {
          // Handle clickable image case
          const linkUrl = nextChild.string.trim();
          content = this.formatInlineContent(child.string, currentSection);
          
          content = content.replace(
            /<img src="([^"]+)" alt="([^"]*)" style="([^"]*)" \/>/g,
            `<a href="${linkUrl}" target="_blank"><img src="$1" alt="$2" style="$3 cursor: pointer;" /></a>`
          );
          
          if (nextChild) nextChild._processed = true;
        } else {
          content = this.formatInlineContent(child.string, currentSection);
        }
        
        if (child.heading) {
          const headingLevel = Math.min(child.heading + level, 6);
          html += `<h${headingLevel}>${content}</h${headingLevel}>\n`;
        } else {
          html += `<p>${content}</p>\n`;
        }
      }
      
      if (child.children && !(child.heading === 1 && child.string === 'Metadata')) {
        // Filter out processed children
        const unprocessedChildren = child.children.filter(c => !c._processed);
        if (unprocessedChildren.length > 0) {
          html += this.parseContent(unprocessedChildren, level + 1, currentSection);
        }
      }
    });
    
    return html;
  }

  formatInlineContent(text, currentSection = '') {
    // Handle images: ![](URL) -> <img> tags
    text = text.replace(/!\[\]\(([^)]+)\)/g, '<img src="$1" alt="" style="max-width: 100%; height: auto;" />');
    
    // Handle sidenotes: (+1 content) -> numbered sidenote
    text = text.replace(/\(\+(\d+)\s+([^)]+)\)/g, (match, num, content) => {
      const id = `sn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      return `<label for="${id}" class="margin-toggle sidenote-number"></label><input type="checkbox" id="${id}" class="margin-toggle"/><span class="sidenote">${content}</span>`;
    });
    
    // Handle margin notes: (+ content) -> margin note with symbol
    text = text.replace(/\(\+\s+([^)]+)\)/g, (match, content) => {
      const id = `mn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      return `<label for="${id}" class="margin-toggle">⊕</label><input type="checkbox" id="${id}" class="margin-toggle"/><span class="marginnote">${content}</span>`;
    });

    // Handle markdown links: [text](url) -> <a> tags (external links open in new tab)
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    // Handle wiki links
    text = text.replace(/\[\[([^\]]+)\]\]/g, (match, linkText) => {
      const url = this.getPageUrl(linkText, currentSection);
      return `<a href="${url}">${linkText}</a>`;
    });
    
    // Handle bold and italic
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    return text;
  }

  parseRoamTable(tableChild, currentSection = 'stream') {
    if (!tableChild.children || tableChild.children.length === 0) {
      return '<p>Empty table</p>';
    }

    const rows = [];
    let isFirstRow = true;

    tableChild.children.forEach(child => {
      if (child.string || (child.children && child.children.length > 0)) {
        const row = this.parseTableRow(child, currentSection);
        if (row.length > 0) {
          rows.push({ cells: row, isHeader: isFirstRow });
          isFirstRow = false;
        }
      }
    });

    if (rows.length === 0) {
      return '<p>Empty table</p>';
    }

    // Generate table HTML
    let tableHTML = `
      <table style="width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.9rem;">
    `;

    rows.forEach((row, rowIndex) => {
      const rowStyle = row.isHeader 
        ? 'border-bottom: 2px solid #333; background-color: #f5f5f5;' 
        : (rowIndex % 2 === 0 ? 'background-color: #fafafa;' : '');
      
      tableHTML += `<tr style="${rowStyle}">`;
      
      row.cells.forEach(cell => {
        const cellTag = row.isHeader ? 'th' : 'td';
        const cellStyle = row.isHeader 
          ? 'text-align: left; padding: 0.75rem 0.5rem; font-weight: bold;'
          : 'padding: 0.75rem 0.5rem; border-bottom: 1px solid #eee; vertical-align: top;';
        
        tableHTML += `<${cellTag} style="${cellStyle}">${cell}</${cellTag}>`;
      });
      
      tableHTML += '</tr>';
    });

    tableHTML += '</table>';
    return tableHTML;
  }

  parseTableRow(rowChild, currentSection) {
    const cells = [];
    
    // First cell is the row child's string content
    if (rowChild.string) {
      const content = this.formatInlineContent(rowChild.string, currentSection);
      cells.push(content);
    } else {
      cells.push(''); // Empty first cell
    }
    
    // Subsequent cells are nested children
    if (rowChild.children) {
      this.extractTableCells(rowChild.children, cells, currentSection);
    }
    
    return cells;
  }

  extractTableCells(children, cells, currentSection) {
    children.forEach(child => {
      if (child.string) {
        const content = this.formatInlineContent(child.string, currentSection);
        cells.push(content);
      } else {
        cells.push(''); // Empty cell
      }
      
      // Recursively extract nested cells
      if (child.children) {
        this.extractTableCells(child.children, cells, currentSection);
      }
    });
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
            if (tagsMatch) {
              metadata.tagsRaw = tagsMatch[1];
              metadata.tags = tagsMatch[1]
                .split(',')
                .map(t => t.replace(/\[\[([^\]]+)\]\]/g, '$1').trim());
            }
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

  formatTags(tagsRaw, currentSection = '') {
    if (!tagsRaw) return '';
    
    const tagLinks = tagsRaw.split(',').map(tag => {
      const trimmedTag = tag.trim();
      if (trimmedTag.includes('[[')) {
        return this.formatInlineContent(trimmedTag, currentSection);
      } else {
        return trimmedTag;
      }
    });
    
    return tagLinks.join(', ');
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

  generateSectionPosts(sectionName) {
    const sectionPage = this.pages.get(sectionName);
    const posts = [];
    
    if (sectionPage && sectionPage.children) {
      sectionPage.children.forEach(child => {
        if (child.string && child.string.includes('[[')) {
          const linkMatch = child.string.match(/\[\[([^\]]+)\]\]/);
          if (linkMatch) {
            const postTitle = linkMatch[1];
            const postPage = this.pages.get(postTitle);
            
            if (postPage) {
              const metadata = this.extractMetadata(postPage);
              const content = this.parseContent(postPage.children, 0, sectionName.toLowerCase());
              
              posts.push({
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
    
    return posts;
  }

  generateGarden() {
    return this.generateSectionPosts('Garden');
  }

  generateLab() {
    return this.generateSectionPosts('Lab');
  }

  generateEssays() {
    return this.generateSectionPosts('Essays');
  }

  createSectionIndexHTML(sectionName, posts) {
    const stripHtml = (html) => {
      return html.replace(/<[^>]*>/g, ' ')
                 .replace(/&[^;]+;/g, ' ')
                 .replace(/\s+/g, ' ')
                 .trim()
                 .toLowerCase();
    };

    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8"/>
    <title>${sectionName} - Luke Miller</title>
    <link rel="stylesheet" href="tufte-blog.css"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      article {
        position: relative;
      }
      .section-controls {
        margin-bottom: 2rem;
        padding: 0;
        width: 100%;
        box-sizing: border-box;
      }
      .section-controls input {
        padding: 0.5rem;
        margin-right: 1rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 1rem;
        background-color: white;
        width: 300px;
      }
      .post-entry {
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #eee;
      }
      .post-entry.hidden {
        display: none;
      }
      .post-title {
        margin: 0 0 0.5rem 0;
        font-size: 1.2rem;
      }
      .post-title a {
        text-decoration: none;
        color: #333;
      }
      .post-title a:hover {
        text-decoration: underline;
      }
      .post-subtitle {
        font-size: 1rem;
        color: #666;
        font-style: italic;
        margin: 0.25rem 0 0.5rem 0;
      }
      .post-meta {
        font-size: 0.9rem;
        color: #666;
        margin-bottom: 0.5rem;
      }
      .no-results {
        text-align: center;
        color: #666;
        font-style: italic;
        margin: 2rem 0;
        display: none;
      }
      @media (max-width: 760px) {
        .section-controls input {
          width: 100%;
          margin-bottom: 0.5rem;
        }
      }
    </style>
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
      <h1>${sectionName}</h1>
      
      <div class="section-controls">
        <input type="text" id="searchInput" placeholder="Search posts..." />
        <span id="resultCount">${posts.length} posts</span>
      </div>

      <section id="sectionPosts">
        ${posts.map(post => {
          const searchableContent = stripHtml(post.content);
          const subtitleHTML = (sectionName === 'Garden' && post.subtitle) ? 
            `<div class="post-subtitle">${post.subtitle}</div>` : '';
          
          return `<div class="post-entry" data-title="${post.title.toLowerCase()}">
             <h3 class="post-title">
               <a href="${sectionName.toLowerCase()}/${post.slug}.html">${post.title}</a>
             </h3>
             ${subtitleHTML}
             <div class="post-meta">
               ${post.dateCreated ? `Created: ${post.dateCreated}` : ''}${post.dateUpdated ? ` | Updated: ${post.dateUpdated}` : ''}${post.tagsRaw ? ` | Tags: ${this.formatTags(post.tagsRaw, 'root')}` : ''}
             </div>
             <div class="hidden-content" style="display: none;">${searchableContent}</div>
           </div>`;
        }).join('\n        ')}
      </section>
      
      <div class="no-results" id="noResults">
        No posts match your search criteria.
      </div>
    </article>

    <script>
      const searchInput = document.getElementById('searchInput');
      const resultCount = document.getElementById('resultCount');
      const noResults = document.getElementById('noResults');
      const allPosts = document.querySelectorAll('.post-entry');

      function filterPosts() {
        const searchTerm = searchInput.value.toLowerCase();
        let visibleCount = 0;

        allPosts.forEach(post => {
          const title = post.dataset.title;
          const content = post.querySelector('.hidden-content').textContent.toLowerCase();
          
          const matchesSearch = !searchTerm || title.includes(searchTerm) || content.includes(searchTerm);
          
          if (matchesSearch) {
            post.classList.remove('hidden');
            visibleCount++;
          } else {
            post.classList.add('hidden');
          }
        });

        resultCount.textContent = \`\${visibleCount} post\${visibleCount !== 1 ? 's' : ''}\`;
        
        if (visibleCount === 0) {
          noResults.style.display = 'block';
        } else {
          noResults.style.display = 'none';
        }
      }

      searchInput.addEventListener('input', filterPosts);
      
      // Initial filter
      filterPosts();
    </script>
  </body>
</html>`;
  }

  async buildSite() {
    console.log('🚀 Starting blog generation...');
    console.log(`📚 Total pages in Roam: ${this.pages.size}`);
    console.log(`📅 Daily notes found: ${this.dailyNotes.size}`);
    
    console.log('🔍 Key pages found:');
    ['Garden', 'Stream', 'Lab', 'Essays'].forEach(key => {
      console.log(`  - ${key}: ${this.pages.has(key) ? '✅' : '❌'}`);
    });
    
    await fs.ensureDir('dist');
    await fs.ensureDir('dist/garden');
    await fs.ensureDir('dist/stream');
    await fs.ensureDir('dist/lab');
    await fs.ensureDir('dist/essays');
    
    await fs.copy('tufte-blog.css', 'dist/tufte-blog.css');
    if (await fs.pathExists('et-book')) {
      await fs.copy('et-book', 'dist/et-book');
    }
    
    console.log('📝 Generating content...');
    const streamPosts = this.generateStream();
    const gardenPosts = this.generateGarden();
    const labPosts = this.generateLab();
    const essayPosts = this.generateEssays();
    
    console.log(`📰 Stream posts: ${streamPosts.length}`);
    console.log(`🌱 Garden posts: ${gardenPosts.length}`);
    console.log(`🔬 Lab posts: ${labPosts.length}`);
    console.log(`📝 Essay posts: ${essayPosts.length}`);
    
    // Generate stream pages
    console.log('🌊 Generating stream.html...');
    let streamHTML = await fs.readFile('stream.html', 'utf8');
    const streamPostsHTML = streamPosts.map(post => {
      const tagsText = post.tagsRaw ? ` | Tags: ${this.formatTags(post.tagsRaw, 'root')}` : '';
      return `<div class="post-entry">
         <h3 class="post-title">
           <a href="stream/${post.slug}.html">${post.title}</a>
         </h3>
         <div class="post-meta">${post.date}${post.type ? ` | ${post.type}` : ''}${tagsText}</div>
         <div class="post-content stream-preview">${post.content}</div>
       </div>`;
    }).join('\n');
    
    streamHTML = streamHTML.replace('{{stream-posts}}', streamPostsHTML);
    await fs.writeFile('dist/stream.html', streamHTML);
    console.log('✅ Stream.html generated');
    
    // Generate individual stream post pages
console.log('🌊 Generating individual stream posts...');
for (const post of streamPosts) {
  const tagsText = post.tagsRaw ? ` | Tags: ${this.formatTags(post.tagsRaw, 'stream')}` : '';
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
  
    const html = `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8"/>
        <title>${post.title} - Stream - Luke Miller</title>
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
          <h1>${post.title}</h1>
          <div class="post-meta">${metadata}</div>
          <section>
            ${post.content}
          </section>
          ${backlinksHTML}
        </article>
      </body>
    </html>`;
      
      await fs.writeFile(`dist/stream/${post.slug}.html`, html);
    }
    
    console.log('✅ Individual stream posts generated');
    
    // Generate section pages and individual posts
    const sections = [
      { name: 'Garden', posts: gardenPosts },
      { name: 'Lab', posts: labPosts },
      { name: 'Essays', posts: essayPosts }
    ];

    for (const section of sections) {
      console.log(`🎯 Generating ${section.name.toLowerCase()} posts...`);
      
      // Generate index page
      const indexHTML = this.createSectionIndexHTML(section.name, section.posts);
      await fs.writeFile(`dist/${section.name.toLowerCase()}.html`, indexHTML);
      
      // Generate individual posts
      for (const post of section.posts) {
        const tagsText = post.tagsRaw ? `Tags: ${this.formatTags(post.tagsRaw, section.name.toLowerCase())}` : '';
        const dateText = `${post.dateCreated ? `Created: ${post.dateCreated}` : ''}${post.dateUpdated ? ` | Updated: ${post.dateUpdated}` : ''}`;
        
        const metadataParts = [dateText, tagsText].filter(part => part.trim());
        const metadata = metadataParts.join(' | ');
        
        let backlinksHTML = '';
        if (post.backlinks && post.backlinks.length > 0) {
          backlinksHTML = `
      <div class="backlinks">
        <h3>Referenced by</h3>
        <ul>
          ${post.backlinks.map(backlinkTitle => {
            const url = this.getPageUrl(backlinkTitle, section.name.toLowerCase());
            return `<li><a href="${url}">${backlinkTitle}</a></li>`;
          }).join('\n          ')}
        </ul>
      </div>`;
        }
        
        const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8"/>
    <title>${post.title} - ${section.name} - Luke Miller</title>
    <link rel="stylesheet" href="../tufte-blog.css"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      .post-subtitle {
        font-size: 1.2rem;
        color: #666;
        font-style: italic;
        margin: 0.5rem 0 1rem 0;
      }
    </style>
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
      <h1>${post.title}</h1>
      ${section.name === 'Garden' && post.subtitle ? `<div class="post-subtitle">${post.subtitle}</div>` : ''}
      ${metadata ? `<div class="post-meta">${metadata}</div>` : ''}
      <section>
        ${post.content}
      </section>
      ${backlinksHTML}
    </article>
  </body>
</html>`;
        
        await fs.writeFile(`dist/${section.name.toLowerCase()}/${post.slug}.html`, html);
      }
      console.log(`✅ ${section.name} posts generated`);
    }
    
    // Copy static pages with updated navigation
    const staticPages = ['index.html', 'about.html'];
    for (const page of staticPages) {
      if (await fs.pathExists(page)) {
        let content = await fs.readFile(page, 'utf8');
        // Update navigation in static pages
        content = content.replace(
          /<nav>[\s\S]*?<\/nav>/,
          `<nav>
      <ul>
        <li><a href="index.html">Home</a></li>
        <li><a href="stream.html">Stream</a></li>
        <li><a href="lab.html">Lab</a></li>
        <li><a href="garden.html">Garden</a></li>
        <li><a href="essays.html">Essays</a></li>
        <li><a href="about.html">About</a></li>
      </ul>
    </nav>`
        );
        await fs.writeFile(`dist/${page}`, content);
      }
    }
    
    console.log('✅ Blog generated successfully!');
    console.log(`📊 Generated: ${streamPosts.length} stream posts, ${gardenPosts.length} garden posts, ${labPosts.length} lab posts, ${essayPosts.length} essay posts`);
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
