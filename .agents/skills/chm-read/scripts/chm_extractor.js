const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

class CHMExtractor {
    constructor(chmPath, outputRoot = ".chm_output") {
        this.chmPath = path.resolve(chmPath);
        if (!fs.existsSync(this.chmPath)) {
            throw new Error(`CHM file not found: ${this.chmPath}`);
        }
        
        this.docName = path.parse(this.chmPath).name;
        this.outputDir = path.resolve(outputRoot, this.docName);
        this.extractedDir = path.join(this.outputDir, "extracted");
    }

    decompile() {
        console.log(`Decompiling ${this.chmPath} to ${this.extractedDir}...`);
        
        if (fs.existsSync(this.outputDir)) {
            console.log(`Output directory exists, cleaning up...`);
            fs.rmSync(this.outputDir, { recursive: true, force: true });
        }
        
        fs.mkdirSync(this.extractedDir, { recursive: true });
        
        // Strategy: copy CHM to a local temp file in the output dir to avoid path issues
        const tempChm = path.join(this.outputDir, "temp.chm");
        fs.copyFileSync(this.chmPath, tempChm);

        const baseDir = process.cwd();
        try {
            process.chdir(this.outputDir);
            // hh.exe -decompile <folder> <file>
            // Using relative paths to the current working directory (outputDir)
            const cmd = `hh.exe -decompile extracted temp.chm`;
            console.log(`Running: ${cmd}`);
            execSync(cmd, { stdio: 'inherit' });
        } catch (error) {
            console.error(`Failed to run hh.exe: ${error.message}`);
        } finally {
            if (fs.existsSync(tempChm)) fs.unlinkSync(tempChm);
            process.chdir(baseDir);
        }
        
        if (fs.existsSync(this.extractedDir) && fs.readdirSync(this.extractedDir).length > 0) {
            console.log(`Successfully decompiled to ${this.extractedDir}`);
            return true;
        } else {
            console.error("Decompilation failed: output directory is empty.");
            return false;
        }
    }
}

module.exports = CHMExtractor;

if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length > 0) {
        try {
            const extractor = new CHMExtractor(args[0]);
            extractor.decompile();
        } catch (e) {
            console.error(e.message);
        }
    } else {
        console.log("Usage: node chm_extractor.js <chm_file>");
    }
}
