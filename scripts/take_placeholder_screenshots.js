#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');
const SCREENSHOTS_DIR = path.join(PROJECT_ROOT, 'screenshots');

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

console.log('Creating placeholder screenshots...');

// Minimal 1x1 PNG in base64 (transparent pixel)
const PLACEHOLDER_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// Create a more visible placeholder (100x100 with text simulation)
// This is a simple gray 100x100 PNG with minimal data
const GRAY_100x100_PNG = `iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAABmJLR0QA/wD/AP+gvaeTAAAA
CXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5QsWFRUaCqQN6gAAAB1pVFh0Q29tbWVudAAA
AAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAA0klEQVR42u3SMQ0AAAjAMPiXbji5BAEAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgMwMnAAFsnbYPAAAAAElFTkSuQmCC`;

const placeholderPNG = Buffer.from(GRAY_100x100_PNG.replace(/\s/g, ''), 'base64');

// Create placeholder screenshots
const screenshots = [
  {
    filename: 'mutation-report-1.png',
    description: 'Mutation Testing Report - Main Dashboard'
  },
  {
    filename: 'mutation-summary.png',
    description: 'Mutation Testing Summary Statistics'
  },
  {
    filename: 'coverage-report.png',
    description: 'Code Coverage Report Overview'
  },
  {
    filename: 'test-execution.png',
    description: 'Test Execution Console Output'
  }
];

screenshots.forEach(({ filename, description }) => {
  const filepath = path.join(SCREENSHOTS_DIR, filename);
  fs.writeFileSync(filepath, placeholderPNG);
  console.log(`✓ Created ${filename}`);
});

// Create README with instructions
const readmeContent = `# Screenshots Directory

This directory contains placeholder screenshots for the test reports.

## Placeholder Files

${screenshots.map(s => `- **${s.filename}**: ${s.description}`).join('\n')}

## How to Replace with Real Screenshots

1. **Run the complete test suite**:
   \`\`\`bash
   npm test
   npm run test:coverage
   npm run mutation
   \`\`\`

2. **Open the HTML reports**:
   - Coverage: \`test/results/coverage/index.html\`
   - Mutation: \`reports/mutation/index.html\`

3. **Take screenshots**:
   - Use your system's screenshot tool (Snipping Tool, macOS Screenshot, etc.)
   - Capture relevant portions of the reports
   - Save with the same filenames as the placeholders

4. **Replace the placeholder files**:
   - Copy your screenshots to this directory
   - Overwrite the placeholder PNG files

## Screenshot Guidelines

### mutation-report-1.png
Capture the main Stryker mutation testing dashboard showing:
- Overall mutation score percentage
- Number of mutants (killed, survived, no coverage)
- Breakdown by file/module

### mutation-summary.png
Capture a detailed view showing:
- Mutation operators applied
- Specific mutants and their status
- Code snippets with highlighted mutations

### coverage-report.png
Capture the c8/nyc coverage report showing:
- Overall coverage percentages (line, branch, function, statement)
- Coverage by module/file
- Highlighted coverage metrics

### test-execution.png
Capture the terminal/console output showing:
- Test suite execution
- All tests passing (green checkmarks)
- Test count and timing
- Final success message

## Automated Screenshot Tools (Optional)

For automated screenshot capture, consider:
- **Puppeteer**: Headless browser automation
- **Playwright**: Cross-browser automation
- **capture-website-cli**: CLI screenshot tool

Example with Puppeteer:
\`\`\`bash
npm install --save-dev puppeteer
node -e "const puppeteer = require('puppeteer'); (async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('file://' + require('path').resolve('reports/mutation/index.html'));
  await page.screenshot({ path: 'screenshots/mutation-report-1.png', fullPage: true });
  await browser.close();
})()"
\`\`\`

---

**Note**: The current PNG files are minimal placeholders. Replace them with actual
screenshots from your test reports for documentation purposes.
`;

fs.writeFileSync(path.join(SCREENSHOTS_DIR, 'README.md'), readmeContent);
console.log('✓ Created README.md with instructions');

// Create a JSON manifest
const manifest = {
  generated: new Date().toISOString(),
  type: 'placeholder',
  screenshots: screenshots.map(s => ({
    filename: s.filename,
    description: s.description,
    status: 'placeholder',
    path: path.relative(PROJECT_ROOT, path.join(SCREENSHOTS_DIR, s.filename))
  })),
  instructions: 'Replace placeholder PNG files with actual screenshots from test reports'
};

fs.writeFileSync(
  path.join(SCREENSHOTS_DIR, 'manifest.json'),
  JSON.stringify(manifest, null, 2)
);
console.log('✓ Created manifest.json');

console.log('\n✓ All placeholder screenshots created successfully');
console.log(`  Location: ${SCREENSHOTS_DIR}`);
console.log('  See screenshots/README.md for instructions on replacing with real screenshots');

process.exit(0);
