const { ArgumentParser } = require('argparse');
const path = require('path');
const fs = require('fs');
const CHMExtractor = require('./chm_extractor');
const IndexBuilder = require('./index_builder');
const CHMReader = require('./reader');

async function main() {
    const parser = new ArgumentParser({
        description: 'CHM AI Progressive Reader Tool (Node.js)'
    });
    parser.add_argument('-v', '--version', { action: 'version', version: '0.1.0' });
    
    const subparsers = parser.add_subparsers({
        title: 'commands',
        dest: 'command'
    });

    const build = subparsers.add_parser('build', { help: 'Decompile CHM and build index' });
    build.add_argument('chm_file', { help: 'Path to CHM file' });
    build.add_argument('--force', { action: 'store_true', help: 'Force rebuild even if index exists' });

    const toc = subparsers.add_parser('toc', { help: 'Show table of contents' });
    toc.add_argument('index_file', { help: 'Path to index.json' });

    const search = subparsers.add_parser('search', { help: 'Search index' });
    search.add_argument('index_file', { help: 'Path to index.json' });
    search.add_argument('query', { help: 'Search query' });

    const read = subparsers.add_parser('read', { help: 'Read section' });
    read.add_argument('index_file', { help: 'Path to index.json' });
    read.add_argument('section_id', { type: 'int', help: 'Section ID' });

    const args = parser.parse_args();

    if (args.command === 'build') {
        try {
            const extractor = new CHMExtractor(args.chm_file);
            const indexPath = path.join(extractor.outputDir, "index.json");

            if (!args.force && fs.existsSync(indexPath)) {
                console.log(`[SKIP] Index already exists for ${args.chm_file}. Use --force to rebuild.`);
                console.log(`[DONE] Existing index: ${indexPath}`);
                return;
            }
            
            console.log(`[START] Processing ${args.chm_file}...`);
            const startTime = Date.now();
            
            const decompileStartTime = Date.now();
            const decompileSuccess = extractor.decompile();
            const decompileEndTime = Date.now();
            
            if (decompileSuccess) {
                const indexPath = path.join(extractor.outputDir, "index.json");
                const builder = new IndexBuilder(extractor.extractedDir, indexPath);
                const indexStartTime = Date.now();
                await builder.build();
                const indexEndTime = Date.now();
                
                const totalTime = (Date.now() - startTime) / 1000;
                const decompileTime = (decompileEndTime - decompileStartTime) / 1000;
                const indexTime = (indexEndTime - indexStartTime) / 1000;
                
                console.log(`\n--- Performance Summary ---`);
                console.log(`Decompilation: ${decompileTime.toFixed(2)}s`);
                console.log(`Indexing & MD: ${indexTime.toFixed(2)}s`);
                console.log(`Total Time:     ${totalTime.toFixed(2)}s`);
                console.log(`Sections:       ${builder.sections.length}`);
                console.log(`Avg per Sec:    ${(builder.sections.length / indexTime).toFixed(2)} sections/s`);
                
                console.log(`\n[DONE] Index created at: ${indexPath}`);
            }
        } catch (e) {
            console.error(`[ERROR] ${e.message}`);
        }
    } else if (args.command === 'toc') {
        const reader = new CHMReader(args.index_file);
        const list = reader.getToc();
        console.log(`\n--- Table of Contents (${list.length} sections) ---`);
        list.forEach(item => {
            console.log(`[${item.id}] ${item.title} (${item.char_count} chars)`);
        });
    } else if (args.command === 'search') {
        const reader = new CHMReader(args.index_file);
        const results = reader.search(args.query);
        console.log(`\n--- Search results for '${args.query}' ---`);
        results.slice(0, 10).forEach(res => {
            console.log(`[${res.id}] ${res.title}`);
            console.log(`   Summary: ${res.summary}\n`);
        });
    } else if (args.command === 'read') {
        const reader = new CHMReader(args.index_file);
        const text = reader.readSection(args.section_id);
        console.log(`\n--- Content of Section ${args.section_id} ---`);
        console.log(text);
    } else {
        console.log("Use --help for usage information.");
    }
}

main();
