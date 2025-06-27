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
  
  // Handle categories as comma-separated list
  if (frontmatter.categories && Array.isArray(frontmatter.categories)) {
    const categoriesList = frontmatter.categories.join(', ');
    html = html.replace(/\{\{CATEGORIES_LIST\}\}/g, categoriesList);
    html = html.replace(/\{\{#if CATEGORIES\}\}[\s\S]*?\{\{\/if\}\}/g, 
      `<div class="categories">
        <span class="label">Categories:</span><br>${categoriesList}
      </div>`);
  } else {
    html = html.replace(/\{\{#if CATEGORIES\}\}[\s\S]*?\{\{\/if\}\}/g, '');
    html = html.replace(/\{\{CATEGORIES_LIST\}\}/g, '');
  }
  
  // Handle tags as comma-separated list
  if (frontmatter.tags && Array.isArray(frontmatter.tags)) {
    const tagsList = frontmatter.tags.join(', ');
    html = html.replace(/\{\{TAGS_LIST\}\}/g, tagsList);
    html = html.replace(/\{\{#if TAGS\}\}[\s\S]*?\{\{\/if\}\}/g, 
      `<div class="tags">
        <span class="label">Tags:</span><br>${tagsList}
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
    ...frontmatter
  };
}

function updateIndex(posts) {
  // This would update your main index.html with the new posts
  // You'd need to implement this based on your index structure
  console.log('Posts to add to index:', posts);
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
  
  // Temporarily override shouldRebuild if force flag is set
  const originalShouldRebuild = shouldRebuild;
  if (forceRebuild) {
    global.shouldRebuild = () => true;
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
    
    const rebuiltCount = builtPosts.filter(post => post.rebuilt !== false).length;
    console.log(`\nCompleted! ${rebuiltCount} file(s) built, ${markdownFiles.length - rebuiltCount} skipped (up to date)`);
    
    updateIndex(builtPosts);
  } else {
    // Build single file
    const markdownFile = args[0];
    if (!fs.existsSync(markdownFile)) {
      console.error(`File ${markdownFile} does not exist`);
      process.exit(1);
    }
    
    const post = buildPost(markdownFile, templatePath, outputDir);
    console.log('Built post:', post);
  }
  
  // Restore original function
  if (forceRebuild) {
    global.shouldRebuild = originalShouldRebuild;
  }
}

module.exports = { buildPost, parseMarkdownPost };