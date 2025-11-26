# Test Results

This directory contains test execution results and reports.

## Structure

```
test/results/
├── coverage/          # Code coverage reports (HTML)
├── mutation/          # Mutation testing reports
├── screenshots/       # Screenshots of test reports for documentation
└── logs/             # Test execution logs
```

## Running Tests

### Unit Tests
```bash
npm run test:unit
```

### Integration Tests
```bash
npm run test:integration
```

### All Tests
```bash
npm test
```

### Coverage Report
```bash
npm run test:coverage
```
Open `test/results/coverage/index.html` in browser.

### Mutation Testing
```bash
npm run mutation
```
Open `reports/mutation/index.html` in browser.

## Expected Results

### Code Coverage Goals
- Line Coverage: 85%+
- Branch Coverage: 80%+
- Function Coverage: 90%+

### Mutation Score Goals
- Overall: 70-85%
- Validators: 80-90%
- Pricing: 75-85%
- Services: 65-75%

## Saving Results

1. Run tests with coverage: `npm run test:coverage`
2. Take screenshot of coverage report
3. Run mutation tests: `npm run mutation`
4. Take screenshot of mutation report
5. Save screenshots to `test/results/screenshots/`
