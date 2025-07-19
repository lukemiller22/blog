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
    this.generateSamplePages();
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

  // Generate sample individual pages
  generateSamplePages() {
    console.log('Generating sample individual pages...');
    
    // Generate stream post
    const streamPost = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reading C.S. Lewis on Chronological Snobbery - Luke Miller</title>
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
                <div class="breadcrumb">
                    <a href="/stream">← Stream</a>
                </div>
                <h1>Reading C.S. Lewis on Chronological Snobbery</h1>
            </div>

            <div class="post-meta">
                <time class="post-date">January 20, 2025</time>
                <div class="post-categories">Reading Notes</div>
                <div class="post-tags">
                    <span class="tag">C.S. Lewis</span>
                    <span class="tag">Critical Thinking</span>
                    <span class="tag">Intellectual Humility</span>
                </div>
            </div>

            <div class="post-content">
                <p>Just finished Lewis's essay "De Descriptione Temporum" where he coins the term "chronological snobbery" - the uncritical acceptance that newer is automatically better.</p>
                
                <p>He defines it as "the assumption that whatever has gone out of date is on that account discredited." The temptation to dismiss older ideas simply because they're old, without examining their actual merit.</p>
                
                <p>What strikes me is how this applies beyond just intellectual history. We see it in technology adoption, cultural criticism, even personal relationships. The newest framework, the latest methodology, the most recent theory - all presumed superior by virtue of recency.</p>
                
                <p>Lewis suggests the antidote is asking not "when was this believed?" but "why did intelligent people believe this, and what evidence convinced them?" A much harder but more honest question.</p>
                
                <p>Worth noting: this doesn't mean older is better either. Just that age alone - whether great or small - tells us nothing about truth value.</p>
            </div>

            <div class="post-connections">
                <h3>Connected</h3>
                <ul>
                    <li><a href="/lab/chronological-snobbery.html">Pattern: Chronological Snobbery</a></li>
                    <li><a href="/garden/lexicon.html#chronological-snobbery">Lexicon: Chronological Snobbery</a></li>
                </ul>
            </div>
        </article>
    </main>
</body>
</html>`;
    
    fs.writeFileSync(path.join(this.config.output, 'stream', 'reading-cs-lewis-chronological-snobbery.html'), streamPost);

    // Generate lab pattern
    const labPattern = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chronological Snobbery - Luke Miller</title>
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
        <article class="lab-pattern-single">
            <div class="pattern-header">
                <div class="breadcrumb">
                    <a href="/lab">← Lab</a>
                </div>
                <h1>Chronological Snobbery</h1>
                <div class="pattern-pronunciation">/ˌkrɒnəˈlɒdʒɪkəl ˈsnɒbəri/</div>
            </div>

            <div class="pattern-meta">
                <time class="pattern-date">January 21, 2025</time>
                <div class="pattern-categories">Cognitive Patterns</div>
                <div class="pattern-tags">
                    <span class="tag">Logic</span>
                    <span class="tag">Bias</span>
                    <span class="tag">Critical Thinking</span>
                </div>
            </div>

            <div class="pattern-definition">
                <h2>Definition</h2>
                <p>The logical fallacy of assuming that whatever is newer in time is necessarily superior in quality, truth, or value; conversely, the automatic dismissal of older ideas, practices, or beliefs solely on the basis of their age.</p>
            </div>

            <div class="pattern-etymology">
                <h2>Etymology</h2>
                <p>Coined by C.S. Lewis in his 1955 Cambridge inaugural lecture "De Descriptione Temporum." Lewis attributes the concept to discussions with Owen Barfield, who helped him recognize this pattern in his own thinking.</p>
            </div>

            <div class="pattern-examples">
                <h2>Examples</h2>
                <p><strong>In Technology:</strong> "Why would anyone use vim when VS Code exists?"</p>
                <p><strong>In Philosophy:</strong> "Medieval scholastics were obviously wrong because they lived before the Enlightenment."</p>
                <p><strong>In Design:</strong> "That website looks terrible - it's from 2010."</p>
                <p><strong>In Business:</strong> "We need to modernize our approach; this strategy is five years old."</p>
            </div>

            <div class="pattern-connections">
                <h2>Connected</h2>
                <ul>
                    <li><a href="/stream/reading-cs-lewis-chronological-snobbery.html">Stream: Reading C.S. Lewis on Chronological Snobbery</a></li>
                    <li><a href="/garden/lexicon.html#chronological-snobbery">Lexicon: Chronological Snobbery</a></li>
                    <li><a href="/essays/chronological-snobbery-tyranny-of-calendar.html">Essay: Chronological Snobbery: The Tyranny of the Calendar</a></li>
                </ul>
            </div>
        </article>
    </main>
</body>
</html>`;
    
    fs.writeFileSync(path.join(this.config.output, 'lab', 'chronological-snobbery.html'), labPattern);

    // Generate essay
    const essay = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chronological Snobbery: The Tyranny of the Calendar - Luke Miller</title>
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
        <article class="essay-single">
            <div class="essay-header">
                <div class="breadcrumb">
                    <a href="/essays">← Essays</a>
                </div>
                <h1>Chronological Snobbery: The Tyranny of the Calendar</h1>
            </div>

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

            <div class="essay-content">
                <p>We live under a strange dictatorship—the tyranny of the calendar. This despot whispers that whatever bears a recent date stamp must be superior to whatever came before, that time itself serves as a reliable judge of truth and value. C.S. Lewis named this peculiar form of intellectual arrogance <a href="/lab/chronological-snobbery.html">"chronological snobbery,"</a> and once you see it, you cannot unsee its influence everywhere.</p>

                <p>The technology sector offers the most obvious examples. How often do we hear that a programming language, framework, or methodology is outdated simply because it's five years old? Never mind that COBOL still powers global banking systems, or that Unix principles from the 1970s remain foundational to modern computing. The mere fact of age becomes sufficient grounds for dismissal.</p>

                <p>But chronological snobbery extends far beyond technology. In education, we assume newer pedagogical theories must be improvements over older ones, despite mixed evidence. In design, we dismiss Victorian aesthetics as "cluttered" without considering the cultural and functional contexts that made such richness meaningful. In philosophy, students learn to view medieval scholastics as quaint curiosities rather than sophisticated thinkers grappling with enduring questions.</p>

                <p>This temporal prejudice operates through a curious inversion of the burden of proof. Normally, new ideas must prove themselves against established ones. But chronological snobbery flips this relationship: old ideas must justify their continued existence against the simple fact of their age. It's intellectual guilty-until-proven-innocent.</p>

                <p>The antidote to chronological snobbery requires what Lewis called "chronological humility"—the recognition that every era produces both wisdom and folly, insights and errors. Before dismissing something as outdated, we must ask harder questions: What problems was this designed to solve? What evidence convinced intelligent people this was valuable? What has actually changed to make this obsolete?</p>

                <p>The calendar makes a poor philosopher. Time may be the medium in which ideas develop, but it is not their judge. That responsibility belongs to reason, evidence, and careful thought—tools that work as well today as they did centuries ago, and will work as well centuries hence.</p>
            </div>

            <div class="essay-connections">
                <h2>Connected</h2>
                <ul>
                    <li><a href="/lab/chronological-snobbery.html">Pattern: Chronological Snobbery</a></li>
                    <li><a href="/stream/reading-cs-lewis-chronological-snobbery.html">Stream: Reading C.S. Lewis on Chronological Snobbery</a></li>
                    <li><a href="/garden/lexicon.html#chronological-snobbery">Lexicon: Chronological Snobbery</a></li>
                </ul>
            </div>
        </article>
    </main>
</body>
</html>`;
    
    fs.writeFileSync(path.join(this.config.output, 'essays', 'chronological-snobbery-tyranny-of-calendar.html'), essay);

    // Generate lexicon (garden structure)
    const lexicon = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lexicon - Luke Miller</title>
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
        <article>
            <div class="structure-header">
                <h1>Lexicon</h1>
                <p class="subtitle">A personal dictionary of terms, concepts, and ideas worth preserving</p>
                <div class="structure-meta">
                    <span class="meta-item">Created: January 15, 2025</span>
                    <span class="meta-item">Updated: January 22, 2025</span>
                </div>
            </div>

            <section class="lexicon-intro">
                <p>This lexicon serves as a living repository of concepts, terms, and ideas that shape how I understand the world. Influenced by C.S. Lewis's <em>Studies in Words</em> and Ambrose Bierce's <em>Devil's Dictionary</em>, each entry attempts to capture not just definitions but the texture and nuance of meaning.</p>
            </section>

            <section class="lexicon-entries">
                <h2 id="c">C</h2>
                
                <div class="lexicon-entry" id="chronological-snobbery">
                    <h3>Chronological Snobbery</h3>
                    <span class="pronunciation">/ˌkrɒnəˈlɒdʒɪkəl ˈsnɒbəri/</span>
                    
                    <div class="definition">
                        <p><strong>Definition:</strong> The logical fallacy of assuming that whatever is newer in time is necessarily superior in quality, truth, or value; conversely, the automatic dismissal of older ideas, practices, or beliefs solely on the basis of their age.</p>
                    </div>
                    
                    <div class="etymology">
                        <p><strong>Etymology:</strong> Coined by C.S. Lewis in his 1955 Cambridge inaugural lecture "De Descriptione Temporum." Lewis attributes the concept to discussions with Owen Barfield, who helped him recognize this pattern in his own thinking.</p>
                    </div>
                    
                    <div class="examples">
                        <p><strong>Examples:</strong></p>
                        <ul>
                            <li><em>In Technology:</em> "Why would anyone use vim when VS Code exists?"</li>
                            <li><em>In Philosophy:</em> "Medieval scholastics were obviously wrong because they lived before the Enlightenment."</li>
                            <li><em>In Design:</em> "That website looks terrible - it's from 2010."</li>
                        </ul>
                    </div>
                    
                    <div class="entry-meta">
                        <p><em>Related pattern:</em> <a href="/lab/chronological-snobbery.html">Chronological Snobbery</a></p>
                    </div>
                </div>
            </section>
        </article>
    </main>
</body>
</html>`;
    
    fs.writeFileSync(path.join(this.config.output, 'garden', 'lexicon.html'), lexicon);
  }
}

// CLI interface
if (require.main === module) {
  const builder = new SimpleBlogBuilder();
  builder.build();
}

module.exports = SimpleBlogBuilder;
