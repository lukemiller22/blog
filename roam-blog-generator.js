const fs = require('fs-extra');
const path = require('path');

class RoamBlogGenerator {
  constructor(roamDataPath) {
    this.roamData = JSON.parse(fs.readFileSync(roamDataPath, 'utf8'));
    this.pages = new Map();
    this.dailyNotes = new Map();
    this.backlinks = new Map();
    this.pageToSection = new Map();
    this.uidMap = new Map(); // Map from uid -> { string, pageTitle }
    this.cssVersion = Date.now(); // Cache busting for CSS

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
    this.buildUidMap();
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
            if (linkMatch && this.pages.has(linkMatch[1])) {
              this.pageToSection.set(linkMatch[1], sectionName.toLowerCase());
            }
          }
        });
      }
    });

    // Map daily note links to stream
    this.dailyNotes.forEach((dailyNote) => {
      (dailyNote.children || []).forEach(child => {
        const postTitle = this.getStreamPostTitle(child);
        if (postTitle && !this.pageToSection.has(postTitle)) {
          this.pageToSection.set(postTitle, 'stream');
        }
      });
    });
  }

  // A top-level daily note block publishes the first page it links to, but only
  // if that page is a post (has a Type:: attribute). This keeps incidental links
  // like "Talked with [[Someone]]" or {{[[TODO]]}} from publishing pages.
  getStreamPostTitle(block) {
    if (!block.string) return null;
    const linkMatch = block.string.match(/\[\[([^\]]+)\]\]/);
    if (!linkMatch) return null;
    const page = this.pages.get(linkMatch[1]);
    if (!page || !this.extractMetadata(page).typeForCategorization) return null;
    return linkMatch[1];
  }

  isPublished(pageTitle) {
    return this.pageToSection.has(pageTitle);
  }

  // Unique backlinks, limited to pages that are actually published
  getBacklinks(pageTitle) {
    const titles = this.backlinks.get(pageTitle) || [];
    return [...new Set(titles)].filter(title => this.isPublished(title));
  }

  buildUidMap() {
    const walkBlocks = (blocks, pageTitle) => {
      if (!blocks) return;
      blocks.forEach(block => {
        if (block.uid && block.string) {
          this.uidMap.set(block.uid, {
            string: block.string,
            pageTitle: pageTitle
          });
        }
        if (block.children) {
          walkBlocks(block.children, pageTitle);
        }
      });
    };

    this.pages.forEach((page, title) => {
      walkBlocks(page.children, title);
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

  parseDateString(dateString) {
    if (!dateString) return new Date('1900-01-01'); // fallback for missing dates
    
    // Remove the ordinal suffix (st, nd, rd, th) and parse
    const cleanDate = dateString.replace(/(\d+)(?:st|nd|rd|th)/, '$1');
    return new Date(cleanDate);
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

  resolveBlockRefs(text, currentSection, depth = 0, visited = new Set()) {
    if (!text || depth > 5) return text;

    // Handle embeds first: {{[[embed]]: ((uid))}} or {{embed: ((uid))}}
    text = text.replace(/\{\{(?:\[\[embed\]\]:\s*|\bembed:\s*)\(\(([a-zA-Z0-9_-]+)\)\)\}\}/g, (match, uid) => {
      return `((${uid}))`; // Convert to simple block ref for processing
    });

    // Replace block references: ((uid))
    return text.replace(/\(\(([a-zA-Z0-9_-]+)\)\)/g, (match, uid) => {
      // Prevent cycles
      if (visited.has(uid)) {
        return '[circular reference]';
      }

      const refData = this.uidMap.get(uid);
      if (!refData) {
        return '[missing reference]';
      }

      // Recursively resolve nested block refs
      visited.add(uid);
      let resolvedText = this.resolveBlockRefs(refData.string, currentSection, depth + 1, new Set(visited));
      visited.delete(uid);

      // Wrap in span and add source link if page is published
      const sourcePageSection = this.pageToSection.get(refData.pageTitle);
      if (sourcePageSection) {
        const sourceUrl = this.getPageUrl(refData.pageTitle, currentSection);
        return `<span class="block-ref">${resolvedText} <a class="block-ref-source" href="${sourceUrl}">↗</a></span>`;
      } else {
        return `<span class="block-ref">${resolvedText}</span>`;
      }
    });
  }

  // A block has content if it has text or content nested under it. A heading's
  // own text doesn't count: it only has content if there's something below it.
  hasMeaningfulContent(block) {
    if (!block.heading && block.string && block.string.trim()) {
      return true;
    }
    return (block.children || []).some(child => this.hasMeaningfulContent(child));
  }

  // A heading is shown only if something is nested under it, or if a following
  // sibling (before the next heading of the same or higher level) has content.
  // This lets unfilled template sections stay in Roam without showing on the site.
  headingHasContent(siblings, index) {
    const heading = siblings[index];
    if (this.hasMeaningfulContent(heading)) return true;

    for (let i = index + 1; i < siblings.length; i++) {
      const sibling = siblings[i];
      if (sibling.heading && sibling.heading <= heading.heading) break;
      if (this.hasMeaningfulContent(sibling)) return true;
    }
    return false;
  }

  parseContent(children, level = 0, currentSection = 'stream') {
    if (!children) return '';

    let html = '';

    children.forEach((child, index) => {
      if (child.heading && child.heading === 1 && child.string === 'Metadata') {
        return;
      }

      // Skip heading blocks that have no meaningful content
      if (child.heading && !this.headingHasContent(children, index)) {
        return;
      }

      if (child.string && child.string.trim()) {
        // Check if this is a Roam table
        if (child.string.includes('{{[[table]]}}')) {
          // Find the table content (should be in the children)
          if (child.children && child.children.length > 0) {
            html += this.parseRoamTable(child, currentSection);
          }
          return; // Skip normal processing for table blocks
        }

        // Check if this is a blockquote with potential citation
      if (child.string.trim().startsWith('>')) {
        // Split on newlines followed by "> " to handle multi-paragraph quotes in the same string
        const textContent = child.string.trim();
        const paragraphTexts = textContent.split(/\n\s*>\s*/);

        // Process each paragraph
        const paragraphs = paragraphTexts.map(p => {
          const cleaned = p.replace(/^>\s*/, '').trim();
          return this.formatInlineContent(cleaned, currentSection);
        });

        let paragraphsHTML = paragraphs.map(p => `<p>${p}</p>`).join('\n');
        let citationHTML = '';

        // Check if there are children
        if (child.children && child.children.length > 0) {
          // Separate blockquote paragraphs from citations
          const quoteParagraphs = [];
          const citations = [];

          child.children.forEach(c => {
            if (c.string && c.string.trim()) {
              if (c.string.trim().startsWith('>')) {
                // This is a continuation paragraph of the blockquote
                const paragraphContent = c.string.replace(/^>\s*/, '').trim();
                quoteParagraphs.push(this.formatInlineContent(paragraphContent, currentSection));
                c._processed = true;
              } else {
                // This is a citation
                citations.push(this.formatInlineContent(c.string.trim(), currentSection));
                c._processed = true;
              }
            }
          });

          // Add continuation paragraphs to the blockquote
          if (quoteParagraphs.length > 0) {
            paragraphsHTML += '\n' + quoteParagraphs.map(p => `<p>${p}</p>`).join('\n');
          }

          // Add citations if present
          if (citations.length > 0) {
            citationHTML = `<footer>${citations.join(' ')}</footer>`;
          }
        }

        html += `<blockquote>${paragraphsHTML}${citationHTML}</blockquote>\n`;
        return; // Skip normal processing for blockquote
      }
        
        // Check if this is an image with a link in the next child
        const hasImage = child.string.includes('![](');
        const nextChild = child.children && child.children[0];

        // Check if next child is a bare URL or a wiki-link
        const nextChildString = nextChild && nextChild.string ? nextChild.string.trim() : '';
        const isBareUrl = nextChildString.startsWith('http://') || nextChildString.startsWith('https://');
        const wikiLinkMatch = nextChildString.match(/^\[\[([^\]]+)\]\]$/);
        const isWikiLink = wikiLinkMatch !== null;
        const nextChildIsLink = isBareUrl || isWikiLink;

        let content;

        if (hasImage && nextChildIsLink) {
          // Handle clickable image case
          let linkUrl;
          let isExternalLink = false;
          if (isBareUrl) {
            // Use bare URL as-is
            linkUrl = nextChildString;
            isExternalLink = true;
          } else if (isWikiLink && this.isPublished(wikiLinkMatch[1])) {
            // Resolve wiki-link to page URL (unpublished pages leave the image unlinked)
            linkUrl = this.getPageUrl(wikiLinkMatch[1], currentSection);
            isExternalLink = false;
          }

          content = this.formatInlineContent(child.string, currentSection);

          if (linkUrl) {
            // Only open external links in new tab; internal wiki links navigate normally
            const targetAttr = isExternalLink ? ' target="_blank"' : '';
            content = content.replace(
              /<img src="([^"]+)" alt="([^"]*)" style="([^"]*)" \/>/g,
              `<a href="${linkUrl}"${targetAttr}><img src="$1" alt="$2" style="$3 cursor: pointer;" /></a>`
            );
          }

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
    // Resolve block references first
    text = this.resolveBlockRefs(text, currentSection);

    // Handle images: ![](URL) -> <img> tags
    text = text.replace(/!\[\]\(([^)]+)\)/g, '<img src="$1" alt="" style="max-width: 100%; max-height: 1086px; height: auto; object-fit: contain;" />');

    // Handle Roam blockquotes (lines starting with >)
    if (text.trim().startsWith('>')) {
      const blockquoteContent = text.replace(/^\s*>\s*/, '').trim();
      return `<blockquote><p>${this.formatText(blockquoteContent, currentSection)}</p></blockquote>`;
    }

    return this.formatText(text, currentSection);
  }

  formatText(text, currentSection) {
    // Handle sidenotes (+1 content) and margin notes (+ content)
    text = this.replaceSidenotes(text);

    // Handle markdown links: [text](url) -> <a> tags (external links open in new tab)
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

    // Handle wiki links
    text = text.replace(/\[\[([^\]]+)\]\]/g, (match, linkText) => {
      // Extract display text: if there's a namespace (contains '/'),
      // show only the part after the last '/'
      const displayText = linkText.includes('/')
        ? linkText.split('/').pop()
        : linkText;

      // Unpublished pages render as plain text rather than a dead link
      if (!this.isPublished(linkText)) return displayText;

      return `<a href="${this.getPageUrl(linkText, currentSection)}">${displayText}</a>`;
    });

    // Handle bold, italic (*text* or Roam's __text__), and highlighting
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    text = text.replace(/__(.+?)__/g, '<em>$1</em>');
    text = text.replace(/\^\^([^^]+)\^\^/g, '<mark>$1</mark>');

    return text;
  }

  // Replace (+1 content) with a numbered sidenote and (+ content) with a margin note.
  // Parentheses are matched by depth, so notes can contain (parentheses) and [links](url).
  replaceSidenotes(text) {
    let result = '';
    let pos = 0;

    while (true) {
      const start = text.indexOf('(+', pos);
      if (start === -1) break;

      const opener = text.slice(start).match(/^\(\+(\d*)\s+/);
      let end = -1;
      if (opener) {
        let depth = 1;
        for (let i = start + opener[0].length; i < text.length; i++) {
          if (text[i] === '(') depth++;
          else if (text[i] === ')' && --depth === 0) { end = i; break; }
        }
      }

      // Not a sidenote, or never closed: leave the text as-is
      if (end === -1) {
        result += text.slice(pos, start + 2);
        pos = start + 2;
        continue;
      }

      const content = text.slice(start + opener[0].length, end);
      const isNumbered = opener[1] !== '';
      const id = `${isNumbered ? 'sn' : 'mn'}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const label = isNumbered
        ? `<label for="${id}" class="margin-toggle sidenote-number"></label>`
        : `<label for="${id}" class="margin-toggle">⊕</label>`;

      result += text.slice(pos, start) +
        `${label}<input type="checkbox" id="${id}" class="margin-toggle"/><span class="${isNumbered ? 'sidenote' : 'marginnote'}">${content}</span>`;
      pos = end + 1;
    }

    return result + text.slice(pos);
  }

  parseRoamTable(tableChild, currentSection = 'stream') {
    if (!tableChild.children || tableChild.children.length === 0) {
      return '<p>Empty table</p>';
    }

    const rows = [];
    let isFirstRow = true;
    let maxColumns = 0;

    // First pass: collect all rows and find max columns
    tableChild.children.forEach(child => {
      if (child.string || (child.children && child.children.length > 0)) {
        const row = this.parseTableRow(child, currentSection);
        if (row.length > 0) {
          maxColumns = Math.max(maxColumns, row.length);
          rows.push({ cells: row, isHeader: isFirstRow });
          isFirstRow = false;
        }
      }
    });

    if (rows.length === 0) {
      return '<p>Empty table</p>';
    }

    // Second pass: pad all rows to have the same number of columns
    rows.forEach(row => {
      while (row.cells.length < maxColumns) {
        row.cells.push(''); // Add empty cells to fill the row
      }
    });

    // Generate table HTML with constrained width
    let tableHTML = `
      <div style="overflow-x: auto; margin: 1rem 0;">
        <table style="width: 100%; max-width: 55rem; border-collapse: collapse; font-size: 0.9rem;">
    `;

    rows.forEach((row, rowIndex) => {
      const rowStyle = row.isHeader 
        ? 'border-bottom: 2px solid #333; background-color: #f5f5f5;' 
        : (rowIndex % 2 === 1 ? 'background-color: #fafafa;' : ''); // Fixed alternating rows
      
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

    tableHTML += `
        </table>
      </div>
    `;
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
      if (child.string && child.string.trim()) {
        let content = child.string;
        
        // Special handling for review links - convert to simple "Review" text
        const linkMatch = content.match(/\[\[([^\]]+)\]\]/);
        if (linkMatch && linkMatch[1].toLowerCase().includes('review') && this.isPublished(linkMatch[1])) {
          const reviewTitle = linkMatch[1];
          const reviewUrl = this.getPageUrl(reviewTitle, currentSection);
          content = `<a href="${reviewUrl}">Review</a>`;
        } else {
          content = this.formatInlineContent(content, currentSection);
        }
        
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
            
            // Store type for internal categorization but don't display it
            if (typeMatch) {
              metadata.type = typeMatch[1];
              metadata.typeForCategorization = typeMatch[1]; // Keep for internal use
              // Don't set type for display purposes
              delete metadata.type; 
            }
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
    // Keyed by title so a page linked from several daily notes appears once,
    // dated by the earliest daily note that links it
    const streamPosts = new Map();

    this.dailyNotes.forEach((dailyNote, date) => {
      (dailyNote.children || []).forEach(child => {
        const linkedPageTitle = this.getStreamPostTitle(child);
        if (!linkedPageTitle) return;

        const formattedDate = this.formatDate(date);
        const existing = streamPosts.get(linkedPageTitle);
        if (existing && new Date(existing.date) <= new Date(formattedDate)) return;

        const linkedPage = this.pages.get(linkedPageTitle);
        const metadata = this.extractMetadata(linkedPage);
        streamPosts.set(linkedPageTitle, {
          title: linkedPageTitle,
          slug: this.titleToSlug(linkedPageTitle),
          date: formattedDate,
          content: this.parseContent(linkedPage.children, 0, 'stream'),
          backlinks: this.getBacklinks(linkedPageTitle),
          ...metadata
        });
      });
    });

    return [...streamPosts.values()].sort((a, b) => new Date(b.date) - new Date(a.date));
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
                backlinks: this.getBacklinks(postTitle),
                ...metadata
              });
            }
          }
        }
      });
    }
    
    // Sort posts by Date Updated (most recent first)
    posts.sort((a, b) => {
      const dateA = this.parseDateString(a.dateUpdated || a.dateCreated);
      const dateB = this.parseDateString(b.dateUpdated || b.dateCreated);
      return dateB - dateA; // Most recent first
    });
    
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
    <link rel="stylesheet" href="tufte-blog.${this.cssVersion}.css"/>
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
        text-align: left;
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
        <li><a href="index.html">Stream</a></li>
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

    // Copy CSS with versioned filename AND keep non-versioned for compatibility
    const cssFilename = `tufte-blog.${this.cssVersion}.css`;
    await fs.copy('tufte-blog.css', `dist/${cssFilename}`);
    await fs.copy('tufte-blog.css', 'dist/tufte-blog.css'); // Keep for direct access
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
    
    // Generate stream pages (now index.html)
    console.log('🌊 Generating index.html (Stream)...');
    let streamHTML = await fs.readFile('index.html', 'utf8');
    const streamPostsHTML = streamPosts.map(post => {
      const tagsText = post.tagsRaw ? ` | Tags: ${this.formatTags(post.tagsRaw, 'root')}` : '';
      return `<div class="post-entry">
         <h3 class="post-title">
           <a href="stream/${post.slug}.html">${post.title}</a>
         </h3>
         <div class="post-meta">${post.date}${tagsText}</div>
         <div class="post-content stream-preview">${post.content}</div>
       </div>`;
    }).join('\n');

    streamHTML = streamHTML.replace('{{stream-posts}}', streamPostsHTML);
    streamHTML = streamHTML.replace('tufte-blog.css', `tufte-blog.${this.cssVersion}.css`);
    await fs.writeFile('dist/index.html', streamHTML);
    console.log('✅ Index.html (Stream) generated');
    
    // Generate individual stream post pages
console.log('🌊 Generating individual stream posts...');
for (const post of streamPosts) {
  const tagsText = post.tagsRaw ? ` | Tags: ${this.formatTags(post.tagsRaw, 'stream')}` : '';
  const metadata = `${post.date}${tagsText}`;
  
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
        <link rel="stylesheet" href="../tufte-blog.${this.cssVersion}.css"/>
        <meta name="viewport" content="width=device-width, initial-scale=1">
      </head>
      <body>
        <nav>
          <ul>
            <li><a href="../index.html">Stream</a></li>
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
    <link rel="stylesheet" href="../tufte-blog.${this.cssVersion}.css"/>
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
        <li><a href="../index.html">Stream</a></li>
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
    
    // Copy static pages with updated navigation (index.html is generated above with stream content)
    const staticPages = ['about.html'];
    for (const page of staticPages) {
      if (await fs.pathExists(page)) {
        let content = await fs.readFile(page, 'utf8');
        // Update navigation in static pages
        content = content.replace(
          /<nav>[\s\S]*?<\/nav>/,
          `<nav>
      <ul>
        <li><a href="index.html">Stream</a></li>
        <li><a href="lab.html">Lab</a></li>
        <li><a href="garden.html">Garden</a></li>
        <li><a href="essays.html">Essays</a></li>
        <li><a href="about.html">About</a></li>
      </ul>
    </nav>`
        );
        content = content.replace('tufte-blog.css', `tufte-blog.${this.cssVersion}.css`);
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
