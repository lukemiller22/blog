#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// Configure marked for better output
marked.setOptions({
  breaks: false,
  gfm: true,
  headerIds: false,
  mangle: false
});

function parseMarkdownPost(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Extract frontmatter
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    throw new Error(`Invalid frontmatter in ${filePath}`);
  }
  
  const [, frontmatterText, markdownContent] = match;
  
  // Parse frontmatter (simple YAML-like parsing)
  const frontmatter = {};
  frontmatterText.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      let value = valueParts.join(':').trim();
      
      // Handle arrays (categories and tags)
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map(item => item.trim().replace(/['"]/g, ''));
      }
      
      frontmatter[key.trim()] = value;
    }
  });
  
  // Process sidenotes and margin notes before converting markdown
  const processedMarkdown = processSidenotes(markdownContent);
  
  // Convert markdown to HTML
  const htmlContent = marked(processedMarkdown);
  
  return {
    frontmatter,
    content: htmlContent
  };
}

function processSidenotes(markdown) {
  let sidenoteCounter = 0;
  let marginNoteCounter = 0;
  
  // Process numbered sidenotes: {^This is a sidenote}
  markdown = markdown.replace(/\{\^([^}]+)\}/g, (match, noteContent) => {
    sidenoteCounter++;
    const id = `sn-${sidenoteCounter}`;
    return `<label for="${id}" class="margin-toggle sidenote-number"></label><input type="checkbox" id="${id}" class="margin-toggle"/><span class="sidenote">${noteContent.trim()}</span>`;
  });
  
  // Process margin notes: {+This is a margin note}
  markdown = markdown.replace(/\{\+([^}]+)\}/g, (match, noteContent) => {
    marginNoteCounter++;
    const id = `mn-${marginNoteCounter}`;
    return `<label for="${id}" class="margin-toggle">&#8853;</label><input type="checkbox" id="${id}" class="margin-toggle"/><span class="marginnote">${noteContent.trim()}</span>`;
  });
  
  return markdown;
}

function shouldRebuild(markdownFile, outputFile, templatePath) {
  // If output doesn't exist, definitely rebuild
  if (!fs.existsSync(outputFile)) {
    return true;
  }
  
  // Get modification times
  const markdownTime = fs.statSync(markdownFile).mtime;
  const outputTime = fs.statSync(outputFile).mtime;
  const templateTime = fs.statSync(templatePath).mtime;
  
  // Rebuild if markdown or template is newer than output
  return markdownTime > outputTime || templateTime > outputTime;
}

function createTagCategoryLinks(items, type) {
  if (!items || !Array.isArray(items)) return '';
  
  return items.map(item => {
    const slug = item.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return `<a href="../${type}/${slug}.html">${item}</a>`;
  }).join(', ');
}

function buildPost(markdownFile, templatePath, outputDir) {
  const basename = path.basename(markdownFile, '.md');
  const outputFile = path.join(outputDir, basename + '.html');
  
  // Check if we need to rebuild
  if (!shouldRebuild(markdownFile, outputFile, templatePath)) {
    console.log(`Skipping ${markdownFile} (up to date)`);
    // Still return the frontmatter for index updates
    const { frontmatter } = parseMarkdownPost(markdownFile);
    return {
      filename: basename + '.html',
      rebuilt: false,
      ...frontmatter
    };
  }
  
  console.log(`Building ${markdownFile}...`);
  
  const { frontmatter, content } = parseMarkdownPost(markdownFile);
  const template = fs.readFileSync(templatePath, 'utf8');
  
  // Replace template variables
  let html = template
    .replace(/\{\{TITLE\}\}/g, frontmatter.title || 'Untitled')
    .replace(/\{\{DATE\}\}/g, frontmatter.date || '')
    .replace(/\{\{CONTENT\}\}/g, content);
  
  // Handle categories with clickable links
  if (frontmatter.categories && Array.isArray(frontmatter.categories)) {
    const categoriesLinks = createTagCategoryLinks(frontmatter.categories, 'categories');
    html = html.replace(/\{\{CATEGORIES_LIST\}\}/g, categoriesLinks);
    html = html.replace(/\{\{#if CATEGORIES\}\}[\s\S]*?\{\{\/if\}\}/g, 
      `<div class="categories">
        <span class="label">Categories:</span><br>${categoriesLinks}
      </div>`);
  } else {
    html = html.replace(/\{\{#if CATEGORIES\}\}[\s\S]*?\{\{\/if\}\}/g, '');
    html = html.replace(/\{\{CATEGORIES_LIST\}\}/g, '');
  }
  
  // Handle tags with clickable links
  if (frontmatter.tags && Array.isArray(frontmatter.tags)) {
    const tagsLinks = createTagCategoryLinks(frontmatter.tags, 'tags');
    html = html.replace(/\{\{TAGS_LIST\}\}/g, tagsLinks);
    html = html.replace(/\{\{#if TAGS\}\}[\s\S]*?\{\{\/if\}\}/g, 
      `<div class="tags">
        <span class="label">Tags:</span><br>${tagsLinks}
      </div>`);
  } else {
    html = html.replace(/\{\{#if TAGS\}\}[\s\S]*?\{\{\/if\}\}/g, '');
    html = html.replace(/\{\{TAGS_LIST\}\}/g, '');
  }
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Write the output file
  fs.writeFileSync(outputFile, html);
  console.log(`Generated ${outputFile}`);
  
  return {
    filename: basename + '.html',
    rebuilt: true,
    ...frontmatter
  };
}

function cleanupOrphanedFiles(posts, outputDir) {
  // Clean up orphaned HTML posts
  if (fs.existsSync(outputDir)) {
    const htmlFiles = fs.readdirSync(outputDir).filter(file => file.endsWith('.html'));
    const markdownBasenames = posts.map(post => post.filename);
    
    htmlFiles.forEach(htmlFile => {
      if (!markdownBasenames.includes(htmlFile)) {
        const orphanPath = path.join(outputDir, htmlFile);
        fs.unlinkSync(orphanPath);
        console.log(`Deleted orphaned HTML file: ${orphanPath}`);
      }
    });
  }
}

function cleanupOrphanedTagCategoryPages(activeTags, activeCategories) {
  // Clean up orphaned tag pages
  if (fs.existsSync('tags')) {
    const tagFiles = fs.readdirSync('tags').filter(file => file.endsWith('.html'));
    const activeTagSlugs = activeTags.map(tag => 
      tag.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.html'
    );
    
    tagFiles.forEach(tagFile => {
      if (!activeTagSlugs.includes(tagFile)) {
        const orphanPath = path.join('tags', tagFile);
        fs.unlinkSync(orphanPath);
        console.log(`Deleted orphaned tag page: ${orphanPath}`);
      }
    });
  }
  
  // Clean up orphaned category pages
  if (fs.existsSync('categories')) {
    const categoryFiles = fs.readdirSync('categories').filter(file => file.endsWith('.html'));
    const activeCategorySlugs = activeCategories.map(category => 
      category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.html'
    );
    
    categoryFiles.forEach(categoryFile => {
      if (!activeCategorySlugs.includes(categoryFile)) {
        const orphanPath = path.join('categories', categoryFile);
        fs.unlinkSync(orphanPath);
        console.log(`Deleted orphaned category page: ${orphanPath}`);
      }
    });
  }
}

function generateTagCategoryPages(posts) {
  // Collect all tags and categories
  const tagPosts = {};
  const categoryPosts = {};
  const allActiveTags = new Set();
  const allActiveCategories = new Set();
  
  posts.forEach(post => {
    // Process tags
    if (post.tags && Array.isArray(post.tags)) {
      post.tags.forEach(tag => {
        allActiveTags.add(tag);
        const slug = tag.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        if (!tagPosts[slug]) {
          tagPosts[slug] = { name: tag, posts: [] };
        }
        tagPosts[slug].posts.push(post);
      });
    }
    
    // Process categories
    if (post.categories && Array.isArray(post.categories)) {
      post.categories.forEach(category => {
        allActiveCategories.add(category);
        const slug = category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        if (!categoryPosts[slug]) {
          categoryPosts[slug] = { name: category, posts: [] };
        }
        categoryPosts[slug].posts.push(post);
      });
    }
  });
  
  // Clean up orphaned tag/category pages before generating new ones
  cleanupOrphanedTagCategoryPages(Array.from(allActiveTags), Array.from(allActiveCategories));
  
  // Generate tag pages
  if (!fs.existsSync('tags')) {
    fs.mkdirSync('tags', { recursive: true });
  }
  
  Object.entries(tagPosts).forEach(([slug, data]) => {
    generateFilteredPostsPage(data.posts, `Posts tagged "${data.name}"`, `tags/${slug}.html`);
  });
  
  // Generate category pages
  if (!fs.existsSync('categories')) {
    fs.mkdirSync('categories', { recursive: true });
  }
  
  Object.entries(categoryPosts).forEach(([slug, data]) => {
    generateFilteredPostsPage(data.posts, `Posts in "${data.name}"`, `categories/${slug}.html`);
  });
  
  console.log(`Generated ${Object.keys(tagPosts).length} tag pages and ${Object.keys(categoryPosts).length} category pages`);
}

function generateFilteredPostsPage(posts, title, outputPath) {
  // Sort posts by date (most recent first)
  const sortedPosts = posts.sort((a, b) => {
    // You might need to adjust this based on your date format
    return new Date(b.date) - new Date(a.date);
  });
  
  // Group posts by year
  const postsByYear = {};
  sortedPosts.forEach(post => {
    // Extract year from date - you might need to adjust this based on your date format
    const year = post.date ? new Date(post.date).getFullYear() || '2025' : '2025';
    if (!postsByYear[year]) {
      postsByYear[year] = [];
    }
    postsByYear[year].push(post);
  });
  
  // Generate the HTML content
  let postsHtml = '';
  Object.keys(postsByYear)
    .sort((a, b) => b - a) // Sort years in descending order
    .forEach(year => {
      postsHtml += `<h2>${year}</h2>\n<ul class="post-list">\n`;
      postsByYear[year].forEach(post => {
        // Format the date for display (just month and day like Writing page)
        const dateObj = post.date ? new Date(post.date) : new Date();
        const formattedDate = dateObj.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
        
        postsHtml += `  <li>
          <span class="date">${formattedDate}</span>
          <a href="../posts/${post.filename}">${post.title || 'Untitled'}</a>
        </li>\n`;
      });
      postsHtml += '</ul>\n';
    });
  
  // Create the full HTML page
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Luke Miller</title>
  <link rel="stylesheet" href="../tufte-css/tufte.css" />
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #fffff8;
      font-family: et-book, serif;
      display: flex;
      justify-content: center;
      min-height: 100vh;
    }

    .container {
      display: flex;
      justify-content: center;
      align-items: flex-start;
      gap: 4rem;
      max-width: 1100px;
      width: 100%;
      padding: 3rem;
    }

    .content-left {
      flex: 1;
    }

    .content-left h1 {
      font-style: italic;
      font-weight: 400;
      margin-top: 0;
      margin-bottom: 1.5rem;
      font-size: 2.8rem;
      line-height: 1.2;
    }

    .content-left h2 {
      font-style: normal;
      font-weight: 400;
      margin-top: 2rem;
      margin-bottom: 1rem;
      font-size: 2rem;
      color: #333;
    }

    .post-list {
      list-style-type: none;
      padding-left: 0;
    }

    .post-list li {
      margin-bottom: 0.5rem;
    }

    .date {
      display: inline-block;
      width: 4rem;
      color: #888;
      font-variant: small-caps;
      font-size: 0.9rem;
    }

    .post-list a {
      color: inherit;
      text-decoration: none;
      line-height: 1.4;
    }

    .post-list a:hover {
      text-decoration: underline;
    }

    /* Ensure links follow Tufte CSS styling */
    a:link,
    a:visited {
      color: inherit;
      text-decoration: underline;
      text-underline-offset: 0.1em;
      text-decoration-thickness: 0.05em;
    }
  </style>
</head>

<body>
  <div class="container">
    <div class="content-left">
    
      <h1>${title}</h1>

      ${postsHtml}
    </div>
  </div>
</body>
</html>`;
  
  fs.writeFileSync(outputPath, html);
  console.log(`Generated ${outputPath}`);
}

function updateIndex(posts) {
  // Generate tag and category pages
  generateTagCategoryPages(posts);
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node build.js <markdown-file> [template] [output-dir]');
    console.log('  or: node build.js --all [--force]');
    console.log('');
    console.log('Options:');
    console.log('  --force    Rebuild all files even if they haven\'t changed');
    process.exit(1);
  }
  
  const templatePath = args.find(arg => !arg.startsWith('--') && arg !== '--all') || 'post-template.html';
  const outputDir = args[2] || 'posts';
  const forceRebuild = args.includes('--force');
  
  // Override shouldRebuild function if force flag is set
  if (forceRebuild) {
    // Override the shouldRebuild function to always return true
    shouldRebuild = () => true;
  }
  
  if (args[0] === '--all') {
    // Build all markdown files in the posts directory
    const postsDir = 'posts-markdown';
    if (!fs.existsSync(postsDir)) {
      console.error(`Directory ${postsDir} does not exist`);
      process.exit(1);
    }
    
    const markdownFiles = fs.readdirSync(postsDir)
      .filter(file => file.endsWith('.md'))
      .map(file => path.join(postsDir, file));
    
    if (markdownFiles.length === 0) {
      console.log('No markdown files found in posts-markdown/');
      process.exit(0);
    }
    
    console.log(`Found ${markdownFiles.length} markdown file(s)`);
    
    const builtPosts = markdownFiles.map(file => 
      buildPost(file, templatePath, outputDir)
    );
    
    // IMPORTANT: Generate tag and category pages after building all posts
    console.log('\nGenerating tag and category pages...');
    generateTagCategoryPages(builtPosts);
    
    // Clean up orphaned HTML posts
    console.log('\nCleaning up orphaned files...');
    cleanupOrphanedFiles(builtPosts, outputDir);
    
    const rebuiltCount = builtPosts.filter(post => post.rebuilt !== false).length;
    console.log(`\nCompleted! Built ${rebuiltCount} post(s)`);
    
  } else {
    // Build single file
    const result = buildPost(args[0], templatePath, outputDir);
    console.log(`Built: ${result.filename}`);
  }
}
