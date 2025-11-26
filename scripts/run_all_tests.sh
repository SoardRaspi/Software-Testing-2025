#!/bin/bash
set -e

# Configuration
MUTATION_THRESHOLD=${MUTATION_THRESHOLD:-80}
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "=========================================="
echo "Starting Test Suite Execution"
echo "=========================================="
echo "Project Root: $PROJECT_ROOT"
echo "Mutation Threshold: ${MUTATION_THRESHOLD}%"
echo ""

# Step 1: Install dependencies
echo "[1/6] Installing dependencies..."
npm ci
if [ $? -ne 0 ]; then
    echo "ERROR: npm ci failed"
    exit 1
fi
echo "✓ Dependencies installed"
echo ""

# Step 2: Run tests and generate JSON output
echo "[2/6] Running unit and integration tests..."
mkdir -p test/results
npm test -- --reporter json > test/results/mocha-results.json
TEST_EXIT_CODE=$?
if [ $TEST_EXIT_CODE -ne 0 ]; then
    echo "ERROR: Tests failed with exit code $TEST_EXIT_CODE"
    # Still write results even if tests fail
    echo '{"stats":{"tests":0,"passes":0,"failures":1},"tests":[{"title":"Test Suite Failed","fullTitle":"Test execution failed","err":{"message":"Tests did not complete successfully"}}]}' > test/results/mocha-results.json
    exit 1
fi
echo "✓ All tests passed"
echo ""

# Step 3: Run code coverage
echo "[3/6] Running code coverage analysis..."
npm run test:coverage
if [ $? -ne 0 ]; then
    echo "ERROR: Coverage analysis failed"
    exit 1
fi
# Move coverage to test/results/
mkdir -p test/results/coverage
if [ -d "coverage" ]; then
    cp -r coverage/* test/results/coverage/ 2>/dev/null || true
fi
echo "✓ Coverage report generated at test/results/coverage/"
echo ""

# Step 4: Run mutation testing
echo "[4/6] Running mutation testing with Stryker..."
npm run mutation
MUTATION_EXIT_CODE=$?
if [ $MUTATION_EXIT_CODE -ne 0 ]; then
    echo "WARNING: Mutation testing completed with warnings (exit code: $MUTATION_EXIT_CODE)"
fi
echo "✓ Mutation testing completed"
echo ""

# Step 5: Extract mutation score and create summary
echo "[5/6] Extracting mutation score..."
MUTATION_SCORE=0

# Try to find Stryker JSON report first
if [ -f "reports/mutation/mutation.json" ]; then
    MUTATION_SCORE=$(node -e "
        try {
            const fs = require('fs');
            const data = JSON.parse(fs.readFileSync('reports/mutation/mutation.json', 'utf8'));
            const score = data.mutationScore || data.metrics?.mutationScore || 0;
            console.log(Math.round(score * 100) / 100);
        } catch(e) {
            console.log(0);
        }
    ")
elif [ -f "reports/mutation/stryker.json" ]; then
    MUTATION_SCORE=$(node -e "
        try {
            const fs = require('fs');
            const data = JSON.parse(fs.readFileSync('reports/mutation/stryker.json', 'utf8'));
            const score = data.mutationScore || 0;
            console.log(Math.round(score * 100) / 100);
        } catch(e) {
            console.log(0);
        }
    ")
elif [ -f "reports/mutation/index.html" ]; then
    # Fallback: parse HTML for mutation score
    MUTATION_SCORE=$(grep -oP 'mutation-score["\s>:]+\K[\d.]+' reports/mutation/index.html | head -1 || echo "0")
fi

# Ensure we have a valid number
if ! [[ "$MUTATION_SCORE" =~ ^[0-9]+\.?[0-9]*$ ]]; then
    MUTATION_SCORE=0
fi

# Write mutation summary JSON
cat > test/results/mutation-summary.json <<EOF
{
  "mutationScore": $MUTATION_SCORE,
  "threshold": $MUTATION_THRESHOLD,
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "reportPath": "reports/mutation/index.html"
}
EOF

echo "✓ Mutation score: ${MUTATION_SCORE}%"
echo "✓ Mutation summary saved to test/results/mutation-summary.json"
echo ""

# Step 6: Generate placeholder screenshots
echo "[6/6] Generating placeholder screenshots..."
node scripts/take_placeholder_screenshots.js
if [ $? -ne 0 ]; then
    echo "WARNING: Screenshot generation failed (non-critical)"
else
    echo "✓ Placeholder screenshots created"
fi
echo ""

# Final validation
echo "=========================================="
echo "Test Suite Execution Complete"
echo "=========================================="
echo "Test Results: test/results/mocha-results.json"
echo "Coverage Report: test/results/coverage/index.html"
echo "Mutation Report: reports/mutation/index.html"
echo "Mutation Score: ${MUTATION_SCORE}%"
echo "Mutation Threshold: ${MUTATION_THRESHOLD}%"
echo ""

# Check mutation score threshold
if (( $(echo "$MUTATION_SCORE < $MUTATION_THRESHOLD" | bc -l) )); then
    echo "❌ FAILED: Mutation score (${MUTATION_SCORE}%) is below threshold (${MUTATION_THRESHOLD}%)"
    exit 1
fi

echo "✓ All checks passed!"
echo "✓ Mutation score meets threshold requirement"
exit 0
