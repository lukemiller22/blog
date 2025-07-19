// simplified-build.js - Debugging version
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

class SimpleBlogBuilder {
  constructor() {
    this.config = {
      output: './dist'
    };
  }

  // Main build function
  async build() {
    console.log('🏗️  Building blog...');
    
    try {
      // 1. Clean and setup
      this.cleanOutput();
      
      // 2. Copy static files
      this.copyStaticFiles();
      
      // 3. Generate main pages
      this.generateMainPages();
      
      console.log('✅ Build completed successfully!');
    } catch (error) {
      console.error('❌ Build failed:', error);
      process.exit(1);
    }
  }

  // Clean output directory
  cleanOutput() {
    console.log('Cleaning output directory...');
    if (fs.existsSync(this.config.output)) {
      fs.rmSync(this.config.output, { recursive: true });
    }
    fs.mkdirSync(this.config.output, { recursive: true });
    
    // Create subdirectories
    ['stream', 'lab', 'garden', 'essays'].forEach(dir => {
      fs.mkdirSync(path.join(this.config.output, dir), { recursive: true });
    });
  }

  // Copy static files
  copyStaticFiles() {
    console.log('Copying static files...');
    
    // Copy CSS
    if (fs.existsSync('styles.css')) {
      fs.copyFileSync('styles.css', path.join(this.config.output, 'styles.css'));
    }
    
    // Copy other static files if they exist
    const staticFiles = ['garden.html', 'about.html'];
    staticFiles.forEach(file => {
      if (fs.existsSync(file)) {
        fs.copyFileSync(file, path.join(this.config.output, file));
      }
    });
  }

  // Generate main pages
  generateMainPages() {
    console.log('Generating main pages...');
    
    this.generateIndex();
    this.generateStream();
    this.generateLab();
    this.generateGarden();
    this.generateEssays();
  }

  generateIndex() {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Luke Miller</title>
    <link rel="stylesheet" href="styles.css">
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
        <article>
            <div class="home-intro">
                <h1>Luke Miller</h1>
                <p class="subtitle">Tending my corner of the digital commons</p>
            </div>
        </article>
    </main>
</body>
</html>`;

    fs.writeFileSync(path.join(this.config.output, 'index.html'), html);
  }

  generateStream() {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Stream - Luke Miller</title>
    <link rel="stylesheet" href="styles.css">
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
        <article>
            <div class="content-header">
                <h1>Stream</h1>
                <p class="subtitle">Brief notes and observations in real time</p>
            </div>
            <section class="stream-feed">
                <p>Stream content will appear here when you add markdown files to content/stream/</p>
            </section>
        </article>
    </main>
</body>
</html>`;

    fs.writeFileSync(path.join(this.config.output, 'stream.html'), html);
  }

  generateLab() {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lab - Luke Miller</title>
    <link rel="stylesheet" href="styles.css">
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
        <article>
            <div class="content-header">
                <h1>Lab</h1>
                <p class="subtitle">Patterns, frameworks, and cognitive tools for thinking</p>
            </div>
            <section class="lab-patterns">
                <p>Lab patterns will appear here when you add markdown files to content/lab/</p>
            </section>
        </article>
    </main>
</body>
</html>`;

    fs.writeFileSync(path.join(this.config.output, 'lab.html'), html);
  }

  generateGarden() {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Garden - Luke Miller</title>
    <link rel="stylesheet" href="styles.css">
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
        <article>
            <div class="content-header">
                <h1>Garden</h1>
                <p class="subtitle">Living documents and evolving structures of knowledge</p>
            </div>
            <section class="garden-structures">
                <p>This garden contains structures that grow and evolve over time—documents that are meant to be revisited, updated, and refined rather than published once and forgotten.</p>
                <div class="structure-list">
                    <p>Garden structures will appear here.</p>
                </div>
            </section>
        </article>
    </main>
</body>
</html>`;

    fs.writeFileSync(path.join(this.config.output, 'garden.html'), html);
  }

  generateEssays() {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Essays - Luke Miller</title>
    <link rel="stylesheet" href="styles.css">
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
        <article>
            <div class="content-header">
                <h1>Essays</h1>
                <p class="subtitle">Longer explorations of ideas and arguments</p>
            </div>
            <section class="essays-list">
                <p>Essays will appear here when you add markdown files to content/essays/</p>
            </section>
        </article>
    </main>
</body>
</html>`;

    fs.writeFileSync(path.join(this.config.output, 'essays.html'), html);
  }
}

// CLI interface
if (require.main === module) {
  const builder = new SimpleBlogBuilder();
  builder.build();
}

module.exports = SimpleBlogBuilder;
