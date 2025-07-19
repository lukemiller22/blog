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
                <article class="stream-post">
                    <h2><a href="/stream/reading-cs-lewis-chronological-snobbery.html">Reading C.S. Lewis on Chronological Snobbery</a></h2>
                    
                    <div class="stream-meta">
                        <time class="post-date">January 20, 2025</time>
                        <div class="post-categories">Reading Notes</div>
                        <div class="post-tags">
                            <span class="tag">C.S. Lewis</span>
                            <span class="tag">Critical Thinking</span>
                            <span class="tag">Intellectual Humility</span>
                        </div>
                    </div>
                    
                    <div class="stream-content">
                        <p>Just finished Lewis's essay "De Descriptione Temporum" where he coins the term "chronological snobbery" - the uncritical acceptance that newer is automatically better.</p>
                        
                        <p>He defines it as "the assumption that whatever has gone out of date is on that account discredited." The temptation to dismiss older ideas simply because they're old, without examining their actual merit.</p>
                        
                        <p>What strikes me is how this applies beyond just intellectual history. We see it in technology adoption, cultural criticism, even personal relationships. The newest framework, the latest methodology, the most recent theory - all presumed superior by virtue of recency.</p>
                        
                        <p>Lewis suggests the antidote is asking not "when was this believed?" but "why did intelligent people believe this, and what evidence convinced them?" A much harder but more honest question.</p>
                        
                        <p>Worth noting: this doesn't mean older is better either. Just that age alone - whether great or small - tells us nothing about truth value.</p>
                    </div>
                </article>
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
                <div class="pattern-entry">
                    <h2><a href="/lab/chronological-snobbery.html">Chronological Snobbery</a></h2>
                    
                    <div class="pattern-meta">
                        <time class="pattern-date">January 21, 2025</time>
                        <div class="pattern-categories">Cognitive Patterns</div>
                        <div class="pattern-tags">
                            <span class="tag">Logic</span>
                            <span class="tag">Bias</span>
                            <span class="tag">Critical Thinking</span>
                        </div>
                    </div>
                    
                    <div class="pattern-preview">
                        <p>The logical fallacy of assuming that whatever is newer in time is necessarily superior in quality, truth, or value; conversely, the automatic dismissal of older ideas, practices, or beliefs solely on the basis of their age.</p>
                        
                        <div class="pattern-connections">
                            <span class="connection-label">Connected to:</span>
                            <a href="/stream/reading-cs-lewis-chronological-snobbery.html" class="connection-link">Stream</a>
                            <a href="/garden/lexicon.html#chronological-snobbery" class="connection-link">Lexicon</a>
                        </div>
                    </div>
                </div>
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
                    <div class="structure-item">
                        <h2><a href="/garden/lexicon.html">Lexicon</a></h2>
                        <p class="structure-summary">A personal dictionary of terms, concepts, and ideas worth preserving</p>
                        <div class="structure-dates">
                            <span class="date-created">Created: January 15, 2025</span>
                            <span class="date-updated">Updated: January 22, 2025</span>
                        </div>
                    </div>
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
                <div class="essay-entry">
                    <h2><a href="/essays/chronological-snobbery-tyranny-of-calendar.html">Chronological Snobbery: The Tyranny of the Calendar</a></h2>
                    
                    <div class="essay-meta">
                        <div class="essay-dates">
                            <span class="date-created">Created: January 22, 2025</span>
                            <span class="date-updated">Updated: January 22, 2025</span>
                        </div>
                        <div class="essay-categories">Critical Thinking</div>
                        <div class="essay-tags">
                            <span class="tag">Philosophy</span>
                            <span class="tag">Logic</span>
                            <span class="tag">Intellectual Humility</span>
                        </div>
                    </div>
                    
                    <div class="essay-preview">
                        <p>We live under a strange dictatorship—the tyranny of the calendar. This despot whispers that whatever bears a recent date stamp must be superior to whatever came before, that time itself serves as a reliable judge of truth and value.</p>
                    </div>
                </div>
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
