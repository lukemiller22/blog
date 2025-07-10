// generate-photos.js
const fs = require('fs').promises;
const path = require('path');
const ExifReader = require('exifreader');

class SimplePhotoGenerator {
    constructor() {
        this.photosDir = './photos';
        this.outputDir = './photos';
        this.indexFile = './photos.html';
        this.photos = [];
        this.supportedFormats = ['.jpg', '.jpeg', '.png', '.webp'];
    }

    async generate() {
        console.log('🔍 Scanning photos directory...');
        await this.scanPhotos();
        
        console.log('📅 Processing photo metadata...');
        this.organizePhotos();
        
        console.log('📝 Generating HTML files...');
        await this.generateAllPages();
        
        console.log(`✅ Generated photos index and ${this.getYears().length} year pages with ${this.photos.length} total photos`);
    }

    async scanPhotos() {
        try {
            const files = await fs.readdir(this.photosDir);
            
            for (const file of files) {
                if (this.isSupportedFormat(file)) {
                    await this.processPhoto(file);
                }
            }
        } catch (error) {
            console.error('Error scanning photos directory:', error);
            this.photos = [];
        }
    }

    isSupportedFormat(filename) {
        const ext = path.extname(filename).toLowerCase();
        return this.supportedFormats.includes(ext);
    }

    async processPhoto(filename) {
        try {
            const filePath = path.join(this.photosDir, filename);
            const buffer = await fs.readFile(filePath);
            
            console.log(`Processing ${filename} (${buffer.length} bytes)`);
            
            let tags = {};
            try {
                tags = ExifReader.load(buffer);
                console.log(`✅ Successfully loaded EXIF data for ${filename}`);
            } catch (exifError) {
                console.log(`⚠️ Could not read EXIF data from ${filename}: ${exifError.message}`);
                console.log('Proceeding without EXIF data...');
            }
            
            const date = this.extractCreationDate(tags, filename);
            const name = this.extractNameFromFilename(filename);
            const description = this.extractDescription(tags); // XMP Description only
            
            const photo = {
                filename,
                src: `${filename}`, // Same directory as the year page
                date,
                name,
                description, // Optional XMP description
                year: date.getFullYear(),
                month: date.getMonth(),
                monthName: new Intl.DateTimeFormat('en', { month: 'long' }).format(date)
            };

            this.photos.push(photo);
            const descText = description ? ` - "${description}"` : '';
            console.log(`  📸 ${filename} - ${photo.year} ${photo.monthName}${descText}`);
            
        } catch (error) {
            console.warn(`  ⚠️  Error processing ${filename}:`, error.message);
        }
    }

    extractCreationDate(tags, filename) {
        // First, try to extract date from filename in MM-DD-YYYY format
        const datePattern = /^(\d{2})-(\d{2})-(\d{4})/; // MM-DD-YYYY at start
        const match = filename.match(datePattern);
        
        if (match) {
            const month = parseInt(match[1]) - 1; // 0-indexed for JavaScript Date
            const day = parseInt(match[2]);
            const year = parseInt(match[3]);
            
            if (year >= 2000 && year <= new Date().getFullYear() && 
                month >= 0 && month <= 11 && day >= 1 && day <= 31) {
                const date = new Date(year, month, day);
                console.log(`✅ Found date in filename: ${month+1}/${day}/${year}`);
                return date;
            }
        }

        // If filename parsing fails, try EXIF (but don't expect it to work with GitHub uploads)
        const dateFields = ['Date taken', 'DateTimeOriginal', 'CreateDate', 'DateTime'];
        
        for (const field of dateFields) {
            if (tags[field]) {
                try {
                    let dateStr = tags[field].description || tags[field].value;
                    if (typeof dateStr === 'string') {
                        console.log(`✅ Found date in EXIF ${field}: ${dateStr}`);
                        
                        // Handle XnViewMP format: "9/29/23 - 1:25:09 PM PDT"
                        if (dateStr.includes('/') && dateStr.includes(' - ')) {
                            const datePart = dateStr.split(' - ')[0];
                            const date = new Date(datePart);
                            if (!isNaN(date.getTime())) {
                                return date;
                            }
                        }
                        
                        // Try direct parsing
                        const date = new Date(dateStr);
                        if (!isNaN(date.getTime()) && date.getFullYear() > 1990) {
                            return date;
                        }
                    }
                } catch (e) {
                    console.log(`❌ Error parsing ${field}: ${e.message}`);
                }
            }
        }

        // Last resort: use current date
        console.warn(`⚠️ No date found for ${filename}, using current date`);
        return new Date();
    }

    extractNameFromFilename(filename) {
        // Extract clean name from filename, removing MM-DD-YYYY prefix
        let name = filename
            .replace(/\.[^/.]+$/, '')  // Remove extension
            .replace(/^\d{2}-\d{2}-\d{2,4}-?/, '')  // Remove MM-DD-YY or MM-DD-YYYY prefix
            .replace(/[_-]/g, ' ')  // Replace underscores/hyphens with spaces
            .replace(/\b\w/g, l => l.toUpperCase());  // Title case

        // If nothing left after removing date, use a generic name
        if (!name || name.trim() === '') {
            name = 'Untitled Photo';
        }

        return name;
    }

    extractDescription(tags) {
        // XnViewMP stores description in the "description" field under dc namespace
        const descriptionFields = [
            'description',          // XnViewMP specific field from dc namespace
            'Description',
            'dc:description',
            'dc.description', 
            'XMP.dc.description',
            'ImageDescription',
            'Caption-Abstract',
            'UserComment'
        ];

        for (const field of descriptionFields) {
            if (tags[field]) {
                const desc = tags[field].description || tags[field].value;
                if (desc && desc.trim()) {
                    console.log(`✅ Found description in ${field}: ${desc.trim()}`);
                    return desc.trim();
                }
            }
        }

        console.log('❌ No description found');
        return null;
    }

    organizePhotos() {
        // Sort photos by date (newest first)
        this.photos.sort((a, b) => b.date - a.date);
    }

    getYears() {
        const years = [...new Set(this.photos.map(photo => photo.year))];
        return years.sort((a, b) => b - a); // Newest first
    }

    getPhotosForYear(year) {
        return this.photos.filter(photo => photo.year === year);
    }

    async generateAllPages() {
        // Ensure output directory exists
        await this.ensureDirectoryExists(this.outputDir);
        
        // Generate index page
        await this.generateIndexPage();
        
        // Generate year pages
        const years = this.getYears();
        for (const year of years) {
            await this.generateYearPage(year);
        }
    }

    async ensureDirectoryExists(dir) {
        try {
            await fs.access(dir);
        } catch {
            await fs.mkdir(dir, { recursive: true });
        }
    }

    async generateIndexPage() {
        const years = this.getYears();
        const yearCounts = {};
        
        // Count photos per year
        years.forEach(year => {
            yearCounts[year] = this.getPhotosForYear(year).length;
        });

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Photos - Luke Miller</title>
    <link rel="stylesheet" href="tufte-css/tufte.css" />
    <link rel="stylesheet" href="universal-styles.css" />
</head>
<body>
  <!-- Top Navigation -->
  <nav class="nav-top">
    <div class="nav-container">
      <ul class="nav-list">
        <li><a href="index.html">Home</a></li>
        <li><a href="writing.html">Writing</a></li>
        <li><a href="reading.html">Reading</a></li>
        <li><a href="photos.html">Photos</a></li>
        <li><a href="glossary.html">Glossary</a></li>
        <li><a href="chrestomathy.html">Chrestomathy</a></li>
        <li><a href="about.html">About</a></li>
      </ul>
    </div>
  </nav>

  <!-- Main Content -->
  <div class="container">
    <main class="content-main">            
      <h1>Photos</h1>
      
      <ul class="year-list">
${years.map(year => `          <li class="year-item">
              <a href="photos/${year}.html" class="year-link">
                  <div class="year-title">${year}</div>
                  <div class="year-count">${yearCounts[year]} photo${yearCounts[year] !== 1 ? 's' : ''}</div>
              </a>
          </li>`).join('\n')}
      </ul>
      
      <div class="total-count">
          ${this.photos.length} total photo${this.photos.length !== 1 ? 's' : ''} • Last updated: ${new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })}
      </div>
    </main>
  </div>
</body>
</html>`;

        await fs.writeFile(this.indexFile, html, 'utf8');
        console.log(`  📄 Generated photos index`);
    }

    async generateYearPage(year) {
        const yearPhotos = this.getPhotosForYear(year);
        const photosByMonth = this.groupPhotosByMonth(yearPhotos);
        
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Photos - ${year} - Luke Miller</title>
    <link rel="stylesheet" href="../tufte-css/tufte.css" />
    <link rel="stylesheet" href="../universal-styles.css" />
</head>
<body>
  <!-- Top Navigation -->
  <nav class="nav-top">
    <div class="nav-container">
      <ul class="nav-list">
        <li><a href="../index.html">Home</a></li>
        <li><a href="../writing.html">Writing</a></li>
        <li><a href="../reading.html">Reading</a></li>
        <li><a href="../photos.html">Photos</a></li>
        <li><a href="../glossary.html">Glossary</a></li>
        <li><a href="../chrestomathy.html">Chrestomathy</a></li>
        <li><a href="../about.html">About</a></li>
      </ul>
    </div>
  </nav>

  <!-- Main Content -->
  <div class="container">
    <main class="content-main">
      <h1>${year}</h1>
      
${this.generateYearPhotosHTML(photosByMonth)}
      
      <div class="year-stats">
          ${yearPhotos.length} photo${yearPhotos.length !== 1 ? 's' : ''} from ${year}
      </div>
    </main>
  </div>
</body>
</html>`;

        const yearFile = path.join(this.outputDir, `${year}.html`);
        await fs.writeFile(yearFile, html, 'utf8');
        console.log(`  📄 Generated ${year}.html (${yearPhotos.length} photos)`);
    }

    generateYearPhotosHTML(photosByMonth) {
        let html = '';

        // Sort months in reverse chronological order
        const monthOrder = [
            'December', 'November', 'October', 'September', 
            'August', 'July', 'June', 'May', 
            'April', 'March', 'February', 'January'
        ];

        monthOrder.forEach(month => {
            if (photosByMonth[month]) {
                html += `      <div class="month-section">\n`;
                html += `          <div class="month-header">${month}</div>\n`;

                // Sort photos within month by date (newest first)
                const monthPhotos = photosByMonth[month].sort((a, b) => b.date - a.date);

                monthPhotos.forEach(photo => {
                    html += `          <div class="photo-entry">\n`;
                    html += `              <img src="${photo.src}" alt="${this.escapeHtml(photo.name)}" loading="lazy">\n`;
                    html += `              <div class="photo-caption-container">\n`;
                    html += `                  <div class="photo-name">${this.escapeHtml(photo.name)}</div>\n`;
                    
                    const dateStr = photo.date.toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long',
                        day: 'numeric'
                    });
                    html += `                  <div class="photo-date">${dateStr}</div>\n`;
                    
                    // Only add description if it exists
                    if (photo.description) {
                        html += `                  <div class="photo-description">${this.escapeHtml(photo.description)}</div>\n`;
                    }
                    
                    html += `              </div>\n`;
                    html += `          </div>\n`;
                });

                html += `      </div>\n`;
            }
        });

        return html;
    }

    groupPhotosByMonth(photos) {
        const grouped = {};
        
        photos.forEach(photo => {
            const month = photo.monthName;
            if (!grouped[month]) {
                grouped[month] = [];
            }
            grouped[month].push(photo);
        });

        return grouped;
    }

    escapeHtml(text) {
        const div = { textContent: text };
        return div.innerHTML || text.replace(/[&<>"']/g, (m) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[m]);
    }
}

// Run the generator
if (require.main === module) {
    const generator = new SimplePhotoGenerator();
    generator.generate().catch(error => {
        console.error('Failed to generate photos pages:', error);
        process.exit(1);
    });
}

module.exports = SimplePhotoGenerator;
