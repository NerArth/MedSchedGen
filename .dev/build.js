const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load configuration from package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const config = packageJson.build;
const version = packageJson.version;

// Paths
const srcDir = 'src';
const distDir = 'dist';
const tempDir = path.join(distDir, 'temp');

// 1. Clean and create directories
if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(tempDir, { recursive: true });

// 2. Compile TypeScript
console.log('Compiling TypeScript...');
try {
    execSync('npx tsc', { stdio: 'inherit' });
} catch (error) {
    console.error('Compilation failed');
    process.exit(1);
}

// 3. Read source files
const htmlPath = path.join(srcDir, config.source.html);
const cssPath = path.join(srcDir, config.source.css);
const jsPath = path.join(tempDir, 'main.js');

let htmlContent = fs.readFileSync(htmlPath, 'utf8');
const cssContent = fs.readFileSync(cssPath, 'utf8');
const jsContent = fs.readFileSync(jsPath, 'utf8');

// 4. Inject CSS
console.log('Injecting CSS...');
const styleTag = `<style>\n${cssContent}\n</style>`;
htmlContent = htmlContent.replace(/<link rel="stylesheet" href="style\.css"\s*\/?>/, styleTag);

// 5. Inject JS
console.log('Injecting JS...');
const scriptTag = `<script>\n${jsContent}\n</script>`;
htmlContent = htmlContent.replace(/<script src="main\.js"><\/script>/, scriptTag);

// 6. Write output file
const outFileName = config.output.nameFormat.replace('{version}', version);
const outPath = path.join(distDir, outFileName);

fs.writeFileSync(outPath, htmlContent, 'utf8');

// 7. Cleanup
fs.rmSync(tempDir, { recursive: true, force: true });

console.log(`\x1b[32mBuild successful: ${outPath}\x1b[0m`);
