const fs = require('fs');
const path = require('path');

class CHMReader {
    constructor(indexPath) {
        this.indexPath = path.resolve(indexPath);
        if (!fs.existsSync(this.indexPath)) {
            throw new Error(`Index file not found: ${this.indexPath}`);
        }
        
        const data = JSON.parse(fs.readFileSync(this.indexPath, 'utf8'));
        this.bookTitle = data.book_title;
        this.sections = data.sections || [];
        this.indexDir = path.dirname(this.indexPath);
        this.extractedDir = path.join(this.indexDir, "extracted");
    }

    getToc() {
        return this.sections.map(s => ({
            id: s.id,
            title: s.title,
            char_count: s.char_count
        }));
    }

    search(query) {
        const q = query.toLowerCase();
        const results = [];
        
        for (const s of this.sections) {
            let score = 0;
            const titleLow = s.title.toLowerCase();
            const summaryLow = s.summary.toLowerCase();
            const fullTextLow = (s.full_text || "").toLowerCase();
            
            if (titleLow.includes(q)) score += 20;
            if (s.keywords && s.keywords.some(kw => kw.toLowerCase().includes(q))) score += 10;
            if (summaryLow.includes(q)) score += 5;
            if (fullTextLow.includes(q)) score += 2;
            
            if (score > 0) {
                results.push({
                    id: s.id,
                    title: s.title,
                    summary: s.summary,
                    score: score
                });
            }
        }
        
        return results.sort((a, b) => b.score - a.score);
    }

    readSection(sectionId) {
        const s = this.sections.find(sec => sec.id === sectionId);
        if (!s) return "Section not found.";
        
        // If content is cached in index.json, return it directly
        if (s.full_text) return s.full_text;
        
        // Otherwise try to read from the generated Markdown file
        if (s.md_path) {
            const mdAbsPath = path.resolve(this.indexDir, s.md_path);
            if (fs.existsSync(mdAbsPath)) {
                return fs.readFileSync(mdAbsPath, 'utf8');
            }
        }
        
        return "Content file missing.";
    }
}

module.exports = CHMReader;
