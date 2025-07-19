// roam-blog-builder.js - Enhanced build system for Roam integration
const fs = require('fs');
const path = require('path');

class RoamBlogBuilder {
  constructor() {
    this.config = {
      output: './dist',
      roamExportPath: './roam-export.json'
    };
    this.roamData = null;
    this.processedContent = {
      stream: [],
      lab: [],
      garden: [],
      essays: []
    };
  }

  async build() {
    console.log('🏗️  Building blog from Roam data...');
    
    try {
      // 1. Load and parse Roam export
      await this.loadRoamData();
      
      // 2. Process content by type
      this.processRoamContent();
      
      // 3. Clean and setup output
      this.cleanOutput();
      
      // 4. Copy static files
      this.copyStaticFiles();
      
      // 5. Generate pages
      this.generateAllPages();
      
      console.log('✅ Build completed successfully!');
    } catch (error) {
      console.error('❌ Build failed:', error);
      process.exit(1);
    }
  }

  async loadRoamData() {
    console.log('Loading Roam export...');
    
    if (!fs.existsSync(this.config.roamExportPath)) {
      throw new Error('Roam export file not found. Please export your Roam graph as JSON.');
    }
    
    const rawData = fs.readFileSync(this.config.roamExportPath, 'utf8');
    this.roamData = JSON.parse(rawData);
    
    console.log(`Loaded ${this.roamData.length} pages from Roam export`);
  }

  processRoamContent() {
    console.log('Processing Roam content by type...');
    
    for (const page of this.roamData) {
      const pageType = this.identifyPageType(page);
      
      switch (pageType) {
        case 'stream':
          this.processedContent.stream.push(this.processStreamPost(page));
          break;
        case 'lab':
          this.processedContent.lab.push(this.processLabPattern(page));
          break;
        case 'garden':
          this.processedContent.garden.push(this.processGardenStructure(page));
          break;
      }
    }
    
    // Sort by date (most recent first)
    this.processedContent.stream.sort((a, b) => new Date(b.date) - new Date(a.date));
    this.processedContent.lab.sort((a, b) => new Date(b.date) - new Date(a.date));
    this.processedContent.garden.sort((a, b) => new Date(b.modified) - new Date(a.modified));
    
    console.log(`Processed: ${this.processedContent.stream.length} stream posts, ${this.processedContent.lab.length} lab patterns, ${this.processedContent.garden.length} garden structures`);
  }

  identifyPageType(page) {
    const content = this.getPageContent(page);
    
    // Check for blog tags
    if (content.includes('#blog/stream')) return 'stream';
    if (content.includes('#blog/lab')) return 'lab';
    if (content.includes('#blog/garden')) return 'garden';
    
    // Check if it's a daily note (stream content)
    if (this.isDailyNotePage(page.title)) return 'stream';
    
    return null;
  }

  isDailyNotePage(title) {
    // Check if title matches date formats: "January 1st, 2025", "2025-01-01", etc.
    const datePatterns = [
      /^(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(st|nd|rd|th),?\s+\d{4}$/,
      /^\d{4}-\d{2}-\d{2}$/,
      /^\d{2}-\d{2}-\d{4}$/
    ];
    
    return datePatterns.some(pattern => pattern.test(title));
  }

  processStreamPost(page) {
    const content = this.getPageContent(page);
    const blogContent = this.extractBlogContent(content);
    
    return {
      title: this.generateStreamTitle(blogContent) || page.title,
      slug: this.generateSlug(page.title),
      date: this.formatDate(page['create-time'] || page['edit-time']),
      created: this.formatDate(page['create-time']),
      modified: this.formatDate(page['edit-time']),
      content: this.convertRoamToHTML(blogContent),
      categories: this.extractCategories(content),
      tags: this.extractTags(content),
      connections: this.extractConnections(content)
    };
  }

  processLabPattern(page) {
    const content = this.getPageContent(page);
    
    return {
      title: page.title,
      slug: this.generateSlug(page.title),
      date: this.formatDate(page['create-time'] || page['edit-time']),
      created: this.formatDate(page['create-time']),
      modified: this.formatDate(page['edit-time']),
      content: this.convertRoamToHTML(content),
      definition: this.extractDefinition(content),
      etymology: this.extractEtymology(content),
      examples: this.extractExamples(content),
      categories: this.extractCategories(content),
      tags: this.extractTags(content),
      connections: this.extractConnections(content)
    };
  }

  processGardenStructure(page) {
    const content = this.getPageContent(page);
    
    return {
      title: page.title,
      slug: this.generateSlug(page.title),
      created: this.formatDate(page['create-time']),
      modified: this.formatDate(page['edit-time']),
      content: this.convertRoamToHTML(content),
      summary: this.extractSummary(content),
      categories: this.extractCategories(content),
      tags: this.extractTags(content),
      connections: this.extractConnections(content)
    };
  }

  getPageContent(page) {
    // Recursively extract all text content from page children
    if (!page.children) return '';
    
    return page.children.map(child => this.extractBlockText(child)).join('\n');
  }

  extractBlockText(block) {
    let text = block.string || '';
    
    if (block.children) {
      const childText = block.children.map(child => this.extractBlockText(child)).join('\n');
      text += '\n' + childText;
    }
    
    return text;
  }

  extractBlogContent(content) {
    // Extract content marked for blog from daily notes
    const lines = content.split('\n');
    const blogLines = [];
    let inBlogSection = false;
    
    for (const line of lines) {
      if (line.includes('#blog/stream')) {
        inBlogSection = true;
        continue;
      }
      if (inBlogSection && line.trim()) {
        blogLines.push(line);
      }
      if (inBlogSection && !line.trim() && blogLines.length > 0) {
        // End of blog section on empty line
        break;
      }
    }
    
    return blogLines.join('\n');
  }

  generateStreamTitle(content) {
    // Extract title from first line or generate from content
    const firstLine = content.split('\n')[0];
    if (firstLine && firstLine.length < 100) {
      return firstLine.replace(/[#*_]/g, '').trim();
    }
    
    // Generate title from content
    const words = content.replace(/[#*_]/g, '').split(' ').slice(0, 8);
    return words.join(' ') + (content.split(' ').length > 8 ? '...' : '');
  }

  convertRoamToHTML(content) {
    return content
      // Convert internal links [[Page Name]] to proper HTML links
      .replace(/\[\[([^\]]+)\]\]/g, (match, pageName) => {
        const slug = this.generateSlug(pageName);
        const section = this.findPageSection(pageName);
        return `<a href="/${section}/${slug}.html">${pageName}</a>`;
      })
      // Convert block references ((block-id)) to anchor links
      .replace(/\(\(([^)]+)\)\)/g, '<a href="#$1" class="block-ref">Reference</a>')
      // Convert tags #tag to styled spans
      .replace(/#([a-zA-Z0-9_-]+)/g, '<span class="tag">$1</span>')
      // Convert bold **text** to <strong>
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      // Convert italic __text__ to <em>
      .replace(/__([^_]+)__/g, '<em>$1</em>')
      // Convert line breaks to paragraphs
      .split('\n\n').map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`).join('');
  }

  findPageSection(pageName) {
    // Determine which section a page belongs to
    const page = this.roamData.find(p => p.title === pageName);
    if (!page) return 'lab'; // Default to lab for unknown pages
    
    const pageType = this.identifyPageType(page);
    return pageType || 'lab';
  }

  extractCategories(content) {
    const matches = content.match(/#blog\/categories\s+\[\[([^\]]+)\]\]/g);
    if (!matches) return [];
    
    return matches.map(match => {
      const categoryMatch = match.match(/\[\[([^\]]+)\]\]/);
      return categoryMatch ? categoryMatch[1] : '';
    }).filter(Boolean);
  }

  extractTags(content) {
    const matches = content.match(/#blog\/tags\s+((?:#\w+\s*)+)/g);
    if (!matches) return [];
    
    return matches.flatMap(match => {
      const tagMatches = match.match(/#(\w+)/g);
      return tagMatches ? tagMatches.map(tag => tag.substring(1)) : [];
    });
  }

  extractConnections(content) {
    // Extract all internal links as connections
    const matches = content.match(/\[\[([^\]]+)\]\]/g);
    if (!matches) return [];
    
    return [...new Set(matches.map(match => {
      const linkMatch = match.match(/\[\[([^\]]+)\]\]/);
      return linkMatch ? linkMatch[1] : '';
    }).filter(Boolean))];
  }

  extractDefinition(content) {
    const definitionMatch = content.match(/Definition:?\s*([^\n]+)/i);
    return definitionMatch ? definitionMatch[1] : '';
  }

  extractEtymology(content) {
    const etymologyMatch = content.match(/Etymology:?\s*([^\n]+)/i);
    return etymologyMatch ? etymologyMatch[1] : '';
  }

  extractExamples(content) {
    const examplesMatch = content.match(/Examples?:?\s*((?:.|\n)*?)(?=\n\n|\n[A-Z]|$)/i);
    if (!examplesMatch) return [];
    
    return examplesMatch[1].split('\n').filter(line => line.trim()).map(line => line.trim());
  }

  extractSummary(content) {
    // Use first paragraph as summary
    const firstPara = content.split('\n\n')[0];
    return firstPara ? firstPara.replace(/[#*_]/g, '').trim() : '';
  }

  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  formatDate(timestamp) {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Rest of the build system methods (cleanOutput, copyStaticFiles, etc.)
  // would be similar to your existing build system but use the processed content

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
    
    if (fs.existsSync('styles.css')) {
      fs.copyFileSync('styles.css', path.join(this.config.output, 'styles.css'));
    }
  }

  generateAllPages() {
    console.log('Generating all pages...');
    
    this.generateIndex();
    this.generateStreamPages();
    this.generateLabPages();
    this.generateGardenPages();
    this.generateEssaysPage();
  }

  generateStreamPages() {
    // Generate stream index
    const streamIndexHTML = this.generateStreamIndex();
    fs.writeFileSync(path.join(this.config.output, 'stream.html'), streamIndexHTML);
    
    // Generate individual stream posts
    for (const post of this.processedContent.stream) {
      const postHTML = this.generateStreamPost(post);
      fs.writeFileSync(path.join(this.config.output, 'stream', `${post.slug}.html`), postHTML);
    }
  }

  generateLabPages() {
    // Generate lab index
    const labIndexHTML = this.generateLabIndex();
    fs.writeFileSync(path.join(this.config.output, 'lab.html'), labIndexHTML);
    
    // Generate individual lab patterns
    for (const pattern of this.processedContent.lab) {
      const patternHTML = this.generateLabPattern(pattern);
      fs.writeFileSync(path.join(this.config.output, 'lab', `${pattern.slug}.html`), patternHTML);
    }
  }

  generateGardenPages() {
    // Generate garden index
    const gardenIndexHTML = this.generateGardenIndex();
    fs.writeFileSync(path.join(this.config.output, 'garden.html'), gardenIndexHTML);
    
    // Generate individual garden structures
    for (const structure of this.processedContent.garden) {
      const structureHTML = this.generateGardenStructure(structure);
      fs.writeFileSync(path.join(this.config.output, 'garden', `${structure.slug}.html`), structureHTML);
    }
  }

  // Template generation methods would follow similar patterns to your existing code
  // but use the processed Roam content...
}

// CLI interface
if (require.main === module) {
  const builder = new RoamBlogBuilder();
  
  const command = process.argv[2];
  
  if (command === 'serve') {
    // Development server logic
    console.log('Starting development server...');
    builder.build().then(() => {
      // Serve the dist directory
    });
  } else {
    // Build command
    builder.build();
  }
}

module.exports = RoamBlogBuilder;
