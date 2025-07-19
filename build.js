// enhanced-build.js - Extended blog builder for multi-content types
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

class EnhancedBlogBuilder {
  constructor() {
    this.config = {
      source: './content',
      output: './dist',
      templates: './templates',
      static: './static'
    };
    
    // Content types configuration
    this.contentTypes = {
      stream: {
        source: './content/stream',
        output: './stream',
        template: 'stream-post.html',
        listTemplate: 'stream.html'
      },
      lab: {
        source: './content/lab', 
        output: './lab',
        template: 'lab-pattern.html',
        listTemplate: 'lab.html'
      },
      essays: {
        source: './content/essays',
        output: './essays', 
        template: 'essay.html',
        listTemplate: 'essays.html'
      }
    };
    
    this.posts = [];
    this.contentByType = {
      stream: [],
      lab: [],
      essays: []
    };
  }

  // Main build function
  async build() {
    console.log('🏗️  Building enhanced blog...');
    
    // 1. Clean and setup
    this.cleanOutput();
    this.copyStatic();
    
    // 2. Process all content types
    this.loadAllContent();
    this.generateAllContent();
    this.generateMainPages();
    
    console.log(`✅ Built successfully!`);
    console.log(`   Stream: ${this.contentByType.stream.length} posts`);
    console.log(`   Lab: ${this.contentByType.lab.length} patterns`);
    console.log(`   Essays: ${this.contentByType.essays.length} essays`);
    console.log(`   Legacy: ${this.posts.length} posts`);
  }

  // Clean output directory
  cleanOutput() {
    if (fs.existsSync(this.config.output)) {
      fs.rmSync(this.config.output, { recursive: true });
    }
    fs.mkdirSync(this.config.output, { recursive: true });
    
    // Create content type directories
    Object.values(this.contentTypes).forEach(type => {
      const outputDir = path.join(this.config.output, type.output.replace('./', ''));
      fs.mkdirSync(outputDir, { recursive: true });
    });
  }

  // Copy static files
  copyStatic() {
    if (fs.existsSync(this.config.static)) {
      this.copyDir(this.config.static, this.config.output);
    }
    
    // Copy main CSS and other root files
    const rootFiles = ['styles.css', 'garden.html'];
    rootFiles.forEach(file => {
      if (fs.existsSync(file)) {
        fs.copyFileSync(file, path.join(this.config.output, file));
      }
    });
  }

  // Load all content types
  loadAllContent() {
    // Load legacy content (existing behavior)
    this.loadPosts();
    
    // Load new content types
    Object.entries(this.contentTypes).forEach(([type, config]) => {
      this.loadContentType(type, config);
    });
  }

  // Load content for a specific type
  loadContentType(type, config) {
    if (!fs.existsSync(config.source)) {
      console.log(`No ${type} directory found at ${config.source}`);
      return;
    }

    const files = fs.readdirSync(config.source)
      .filter(file => file.endsWith('.md'))
      .sort();

    files.forEach(file => {
      const content = this.parsePost(path.join(config.source, file), type);
      if (content) {
        this.contentByType[type].push(content);
      }
    });

    // Sort by date (newest first)
    this.contentByType[type].sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  // Enhanced post parsing with content type awareness
  parsePost(filePath, contentType = 'post') {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const { frontmatter, body } = this.parseFrontmatter(content);
      
      const slug = path.basename(filePath, '.md');
      const html = marked(body);

      return {
        slug,
        title: frontmatter.title || 'Untitled',
        date: frontmatter.date || new Date().toISOString().split('T')[0],
        date_created: frontmatter.date_created || frontmatter.date || new Date().toISOString().split('T')[0],
        date_updated: frontmatter.date_updated || frontmatter.date || new Date().toISOString().split('T')[0],
        tags: frontmatter.tags || [],
        categories: frontmatter.categories || [],
        description: frontmatter.description || '',
        content: html,
        contentType: contentType,
        url: `/${contentType}/${slug}.html`,
        related_stream: frontmatter.related_stream || '',
        related_lab: frontmatter.related_lab || '',
        related_essays: frontmatter.related_essays || []
      };
    } catch (error) {
      console.error(`Error parsing ${filePath}:`, error);
      return null;
    }
  }

  // Legacy post loading (maintains backward compatibility)
  loadPosts() {
    if (!fs.existsSync(this.config.source)) {
      return;
    }

    const files = fs.readdirSync(this.config.source)
      .filter(file => file.endsWith('.md'))
      .sort();

    files.forEach(file => {
      const post = this.parsePost(path.join(this.config.source, file));
      if (post) {
        this.posts.push(post);
      }
    });

    this.posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  // Generate all content
  generateAllContent() {
    // Generate legacy posts
    this.generatePosts();
    
    // Generate new content types
    Object.entries(this.contentTypes).forEach(([type, config]) => {
      this.generateContentType(type, config);
    });
  }

  // Generate content for a specific type
  generateContentType(type, config) {
    const template = this.getContentTemplate(type);
    
    this.contentByType[type].forEach(item => {
      const html = this.renderContentTemplate(template, item, type);
      
      const outputPath = path.join(
        this.config.output, 
        config.output.replace('./', ''), 
        `${item.slug}.html`
      );
      
      fs.writeFileSync(outputPath, html);
    });
  }

  // Get template for content type
  getContentTemplate(type) {
    const templates = {
      stream: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}} - Luke Miller</title>
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
                <div class="breadcrumb"><a href="/stream">← Stream</a></div>
                <h1
