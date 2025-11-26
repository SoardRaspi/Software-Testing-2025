# Test Automation Scripts

This directory contains scripts for running the complete test suite with coverage and mutation testing.

## Scripts

### `run_all_tests.sh` (Linux/macOS/Git Bash)
Bash script that executes the complete test pipeline:
- Installs dependencies with `npm ci`
- Runs all tests with JSON output
- Generates code coverage report
- Runs Stryker mutation testing
- Extracts mutation score and creates summary JSON
- Generates placeholder screenshots
- Validates mutation score against threshold (default: 80%)

**Usage**:
```bash
bash scripts/run_all_tests.sh
```

**With custom threshold**:
```bash
MUTATION_THRESHOLD=75 bash scripts/run_all_tests.sh
```

### `run_all_tests.bat` (Windows)
Windows batch script with identical functionality to the bash version.

**Usage**:
```cmd
scripts\run_all_tests.bat
```

**With custom threshold**:
```cmd
set MUTATION_THRESHOLD=75
scripts\run_all_tests.bat
```

### `take_placeholder_screenshots.js`
Node.js script that generates placeholder PNG files for documentation purposes.

Creates:
- `screenshots/mutation-report-1.png`
- `screenshots/mutation-summary.png`
- `screenshots/coverage-report.png`
- `screenshots/test-execution.png`
- `screenshots/README.md` (instructions)
- `screenshots/manifest.json` (metadata)

**Usage**:
```bash
node scripts/take_placeholder_screenshots.js
```

## Quick Start

### Windows:
```cmd
npm install
scripts\run_all_tests.bat
```

### Linux/macOS:
```bash
npm install
bash scripts/run_all_tests.sh
```

### NPM scripts:
```bash
# Windows
npm run test:all:windows

# Linux/macOS/Git Bash
npm run test:all
```

## Output Locations

After running the test scripts:

- **Test Results**: `test/results/mocha-results.json`
- **Coverage Report**: `test/results/coverage/index.html`
- **Mutation Report**: `reports/mutation/index.html`
- **Mutation Summary**: `test/results/mutation-summary.json`
- **Screenshots**: `screenshots/*.png`

## Exit Codes

- `0`: All tests passed and mutation score ≥ threshold
- `1`: Tests failed or mutation score < threshold

## Configuration

### Environment Variables

- **MUTATION_THRESHOLD**: Minimum required mutation score (default: 80)
  ```bash
  export MUTATION_THRESHOLD=75  # Linux/macOS
  set MUTATION_THRESHOLD=75     # Windows
  ```

## CI/CD Integration

The scripts are designed for CI/CD pipelines. See `.github/workflows/ci.yml` for GitHub Actions integration.

### Example Jenkins Pipeline:
```groovy
pipeline {
    agent any
    environment {
        MUTATION_THRESHOLD = '80'
    }
    stages {
        stage('Test') {
            steps {
                sh 'bash scripts/run_all_tests.sh'
            }
        }
    }
    post {
        always {
            publishHTML([
                reportDir: 'reports/mutation',
                reportFiles: 'index.html',
                reportName: 'Mutation Report'
            ])
        }
    }
}
```

## Troubleshooting

### Script fails with "npm ci" error
- Delete `node_modules` and `package-lock.json`
- Run `npm install` manually first

### Mutation score extraction fails
- Check `reports/mutation/` for Stryker output
- Verify Stryker configuration in `stryker.conf.js`
- Look for JSON report files: `mutation.json` or `stryker.json`

### Screenshots not generated
- Non-critical error, tests still succeed
- Check `scripts/take_placeholder_screenshots.js` for errors
- Run manually: `node scripts/take_placeholder_screenshots.js`

### Permission denied (Linux/macOS)
```bash
chmod +x scripts/run_all_tests.sh
```

### bc command not found (Linux)
Install bc for floating-point comparison:
```bash
sudo apt-get install bc  # Debian/Ubuntu
sudo yum install bc      # RedHat/CentOS
```

## Development

To modify the scripts:

1. **run_all_tests.sh**: Edit bash script for Linux/macOS
2. **run_all_tests.bat**: Keep Windows version in sync
3. Test both versions when making changes
4. Update this README with any new features

---

For more information, see the main [TESTING_GUIDE.md](../TESTING_GUIDE.md).
