const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const TurndownService = require('turndown');
const iconv = require('iconv-lite');
const jschardet = require('jschardet');

// --- Worker Logic ---
if (!isMainThread) {
    const { htmlFiles, extractedDir, markdownDir } = workerData;
    const turndown = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
    const results = [];

    htmlFiles.forEach(htmlPath => {
        try {
            const buffer = fs.readFileSync(htmlPath);
            const detected = jschardet.detect(buffer);
            let encoding = detected.encoding || 'utf-8';
            if (detected.confidence < 0.8 && encoding.toLowerCase().includes('windows')) encoding = 'gbk';

            let content = iconv.decode(buffer, encoding);
            const metaCharsetMatch = content.match(/<meta[^>]*charset=["']?([^"'>]*)["']?/i);
            if (metaCharsetMatch && metaCharsetMatch[1]) {
                const metaEncoding = metaCharsetMatch[1].toLowerCase();
                if (metaEncoding !== encoding.toLowerCase() && metaEncoding !== 'utf-8') {
                    content = iconv.decode(buffer, metaEncoding);
                }
            }

            const $ = cheerio.load(content);
            $('script, style, iframe, noscript').remove();
            const title = ($('title').text() || path.basename(htmlPath)).trim();
            const bodyHtml = $('body').html() || "";
            const text = $('body').text();
            const markdown = turndown.turndown(bodyHtml);
            const cleanText = text.replace(/\s+/g, ' ').trim();
            const summary = cleanText.length > 300 ? cleanText.substring(0, 300) + "..." : cleanText;

            const relPath = path.relative(extractedDir, htmlPath);
            const mdFileName = relPath.replace(/[\\/]/g, '_').replace(/\.html?$/i, '.md');
            const mdPath = path.join(markdownDir, mdFileName);

            fs.mkdirSync(path.dirname(mdPath), { recursive: true });
            fs.writeFileSync(mdPath, `# ${title}\n\n${markdown}`, 'utf8');

            results.push({
                title,
                summary,
                char_count: cleanText.length,
                html_path: relPath,
                md_path: path.relative(path.dirname(markdownDir), mdPath),
                full_text: cleanText
            });
        } catch (e) {
            console.error(`Worker error parsing ${htmlPath}: ${e.message}`);
        }
    });

    parentPort.postMessage(results);
}

// --- Main Thread Logic ---
class IndexBuilder {
    constructor(extractedDir, outputFile) {
        this.extractedDir = path.resolve(extractedDir);
        this.outputFile = path.resolve(outputFile);
        this.outputDir = path.dirname(this.outputFile);
        this.markdownDir = path.join(this.outputDir, "markdown");
        this.sections = [];
        this.numWorkers = require('os').cpus().length || 4;
    }

    walk(dir, callback) {
        if (!fs.existsSync(dir)) return;
        fs.readdirSync(dir).forEach(file => {
            let fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                this.walk(fullPath, callback);
            } else {
                callback(fullPath);
            }
        });
    }

    async build() {
        console.log(`Building index (Parallel) from ${this.extractedDir} using ${this.numWorkers} workers...`);
        
        if (fs.existsSync(this.markdownDir)) {
            fs.rmSync(this.markdownDir, { recursive: true, force: true });
        }
        fs.mkdirSync(this.markdownDir, { recursive: true });

        const htmlFiles = [];
        this.walk(this.extractedDir, (file) => {
            if (file.toLowerCase().endsWith('.htm') || file.toLowerCase().endsWith('.html')) {
                htmlFiles.push(file);
            }
        });

        console.log(`Found ${htmlFiles.length} HTML files.`);
        if (htmlFiles.length === 0) return;

        // Split files into chunks for workers
        const chunkSize = Math.ceil(htmlFiles.length / this.numWorkers);
        const workerPromises = [];

        for (let i = 0; i < this.numWorkers; i++) {
            const chunk = htmlFiles.slice(i * chunkSize, (i + 1) * chunkSize);
            if (chunk.length === 0) continue;

            workerPromises.push(new Promise((resolve, reject) => {
                const worker = new Worker(__filename, {
                    workerData: {
                        htmlFiles: chunk,
                        extractedDir: this.extractedDir,
                        markdownDir: this.markdownDir
                    }
                });
                worker.on('message', resolve);
                worker.on('error', reject);
                worker.on('exit', (code) => {
                    if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
                });
            }));
        }

        const resultsArray = await Promise.all(workerPromises);
        let idCounter = 1;
        resultsArray.forEach(workerResults => {
            workerResults.forEach(res => {
                res.id = idCounter++;
                this.sections.push(res);
            });
        });

        const indexData = {
            book_title: path.basename(this.outputDir),
            total_sections: this.sections.length,
            sections: this.sections
        };

        fs.mkdirSync(path.dirname(this.outputFile), { recursive: true });
        fs.writeFileSync(this.outputFile, JSON.stringify(indexData, null, 2), 'utf8');
        
        console.log(`Index built (Parallel) and Markdown files saved to ${this.markdownDir}`);
        console.log(`Index JSON saved to ${this.outputFile}`);
    }
}

module.exports = IndexBuilder;
