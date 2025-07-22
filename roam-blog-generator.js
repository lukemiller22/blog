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
    // Skip creating backlinks for main index pages
    const indexPages = ['Lab', 'Garden', 'Essays', 'Stream'];
    if (indexPages.includes(page.title)) {
      return;
    }
    
    const findLinks = (obj) => {
      if (typeof obj === 'string') {
        const linkMatches = obj.match(/\[\[([^\]]+)\]\]/g);
        if (linkMatches) {
          linkMatches.forEach(match => {
            const linkTitle = match.slice(2, -2);
            // Don't create backlinks to index pages
            if (!indexPages.includes(linkTitle)) {
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
    const labPage = this.pages.get('Lab');
    const gardenPage = this.pages.get('Garden');
    const essaysPage = this.pages.get('Essays');
    
    if (labPage && labPage.children) {
      labPage.children.forEach(child => {
        if (child.string && child.string.includes('[[')) {
          const linkMatch = child.string.match(/\[\[([^\]]+)\]\]/);
          if (linkMatch) {
            this.pageToSection.set(linkMatch[1], 'lab');
          }
        }
      });
    }
    
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
    
    if (essaysPage && essaysPage.children) {
      essaysPage.children.forEach(child => {
        if (child.string && child.string.includes('[[')) {
          const linkMatch = child.string.match(/\[\[([^\]]+)\]\]/);
          if (linkMatch) {
            this.pageToSection.set(linkMatch[1], 'essays');
          }
        }
      });
    }
    
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
      if (section === 'stream') {
        return `#`;
      }
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
            const categoryMatch = child.string.match(/Category::\s*(.+)/);
            const tagsMatch = child.string.match(/Tags::\s*(.+)/);
            const dateCreatedMatch = child.string.match(/Date Created::\s*\[\[([^\]]+)\]\]/);
            const dateUpdatedMatch = child.string.match(/Date Updated::\s*\[\[([^\]]+)\]\]/);
            const subtitleMatch = child.string.match(/Subtitle::\s*(.+)/);
            
            if (categoryMatch) metadata.category = categoryMatch[1];
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
                  date: this.formatDate(date),
                  content: this.parseContent(linkedPage.children, 0, 'root'),
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
              const content = this.parseContent(linkedPage.children, 0, 'lab');
              
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
            
            let subtitle = '';
            if (child.children && child.children[0] && child.children[0].string) {
              subtitle = child.children[0].string;
            }
            
            if (artifactPage) {
              const metadata = this.extractMetadata(artifactPage);
              const content = this.parseContent(artifactPage.children, 0, 'garden');
              
              gardenArtifacts.push({
                title: artifactTitle,
                slug: this.titleToSlug(artifactTitle),
                subtitle: subtitle || metadata.subtitle || '',
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
              const content = this.parseContent(essayPage.children, 0, 'essays');
              
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
    
    Object.keys(data).forEach(key => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(placeholder, data[key] || '');
    });
    
    return html;
  }

  async buildSite() {
    console.log('🚀 Starting blog generation...');
    console.log(`📚 Total pages in Roam: ${this.pages.size}`);
    console.log(`📅 Daily notes found: ${this.dailyNotes.size}`);
    
    console.log('🔍 Key pages found:');
    ['Lab', 'Garden', 'Essays', 'Personal Lexicon', 'Chronological Snobbery'].forEach(key => {
      console.log(`  - ${key}: ${this.pages.has(key) ? '✅' : '❌'}`);
    });
    
    await fs.ensureDir('dist');
    await fs.ensureDir('dist/lab');
    await fs.ensureDir('dist/garden');
    await fs.ensureDir('dist/essays');
    
    await fs.copy('tufte-blog.css', 'dist/tufte-blog.css');
    if (await fs.pathExists('et-book')) {
      await fs.copy('et-book', 'dist/et-book');
    }
    
    console.log('📝 Generating content...');
    const streamPosts = this.generateStream();
    console.log(`📰 Stream posts: ${streamPosts.length}`);
    
    const labPosts = this.generateLab();
    console.log(`🧪 Lab posts: ${labPosts.length}`);
    
    const gardenArtifacts = this.generateGarden();
    console.log(`🌱 Garden artifacts: ${gardenArtifacts.length}`);
    
    const essays = this.generateEssays();
    console.log(`📖 Essays: ${essays.length}`);
    
    console.log('📋 Loading templates...');
    const labTemplate = await fs.readFile('templates/lab-post-template.html', 'utf8');
    const essayTemplate = await fs.readFile('templates/essay-template.html', 'utf8');
    console.log('✅ Templates loaded successfully');
    
    console.log('🌊 Generating stream.html...');
    let streamHTML = await fs.readFile('stream.html', 'utf8');
    const streamPostsHTML = streamPosts.map(post => 
      `<div class="post-entry">
         <h3 class="post-title">${post.title}</h3>
         <div class="post-meta">${post.date}${post.category ? ` | ${post.category}` : ''}</div>
         <div class="post-content">${post.content}</div>
       </div>`
    ).join('\n');
    
    streamHTML = streamHTML.replace('{{stream-posts}}', streamPostsHTML);
    await fs.writeFile('dist/stream.html', streamHTML);
    console.log('✅ Stream.html generated');
    
    console.log('🧪 Generating lab posts...');
    for (const post of labPosts) {
      const metadata = `${post.dateCreated ? `Created: ${post.dateCreated}` : ''}${post.dateUpdated ? ` | Updated: ${post.dateUpdated}` : ''}${post.category ? ` | ${post.category}` : ''}`;
      
      let backlinksHTML = '';
      if (post.backlinks && post.backlinks.length > 0) {
        backlinksHTML = `
      <div class="backlinks">
        <h3>Referenced by</h3>
        <ul>
          ${post.backlinks.map(backlinkTitle => {
            const url = this.getPageUrl(backlinkTitle, 'lab');
            return `<li><a href="${url}">${backlinkTitle}</a></li>`;
          }).join('\n          ')}
        </ul>
      </div>`;
      }
      
      const html = this.generateHTML(labTemplate, {
        title: post.title,
        metadata,
        content: post.content,
        backlinks: backlinksHTML
      });
      
      await fs.writeFile(`dist/lab/${post.slug}.html`, html);
    }
    console.log('✅ Lab posts generated');
    
    console.log('🌱 Generating garden artifacts...');
    for (const artifact of gardenArtifacts) {
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
      ${artifact.subtitle ? `<p class="subtitle">${artifact.subtitle}</p>` : ''}
      <section>
        ${artifact.content}
      </section>
    </article>
  </body>
</html>`;
      
      await fs.writeFile(`dist/garden/${artifact.slug}.html`, html);
    }
    console.log('✅ Garden artifacts generated');
    
    console.log('📖 Generating essays...');
    for (const essay of essays) {
      const metadata = `${essay.dateCreated ? `Created: ${essay.dateCreated}` : ''}${essay.dateUpdated ? ` | Updated: ${essay.dateUpdated}` : ''}${essay.category ? ` | ${essay.category}` : ''}`;
      
      let backlinksHTML = '';
      if (essay.backlinks && essay.backlinks.length > 0) {
        backlinksHTML = `
      <div class="backlinks">
        <h3>Referenced by</h3>
        <ul>
          ${essay.backlinks.map(backlinkTitle => {
            const url = this.getPageUrl(backlinkTitle, 'essays');
            return `<li><a href="${url}">${backlinkTitle}</a></li>`;
          }).join('\n          ')}
        </ul>
      </div>`;
      }
      
      const html = this.generateHTML(essayTemplate, {
        title: essay.title,
        metadata,
        content: essay.content,
        backlinks: backlinksHTML
      });
      
      await fs.writeFile(`dist/essays/${essay.slug}.html`, html);
    }
    console.log('✅ Essays generated');
    
    await this.updateIndexPages(streamPosts, labPosts, gardenArtifacts, essays);
    
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
