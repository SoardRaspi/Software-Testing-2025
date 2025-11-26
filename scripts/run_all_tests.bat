@echo off
setlocal enabledelayedexpansion

REM Configuration
if "%MUTATION_THRESHOLD%"=="" set MUTATION_THRESHOLD=80
set PROJECT_ROOT=%~dp0..
cd /d "%PROJECT_ROOT%"

echo ==========================================
echo Starting Test Suite Execution
echo ==========================================
echo Project Root: %PROJECT_ROOT%
echo Mutation Threshold: %MUTATION_THRESHOLD%%%
echo.

REM Step 1: Install dependencies
echo [1/6] Installing dependencies...
call npm ci
if errorlevel 1 (
    echo ERROR: npm ci failed
    exit /b 1
)
echo ✓ Dependencies installed
echo.

REM Step 2: Run tests and generate JSON output
echo [2/6] Running unit and integration tests...
if not exist test\results mkdir test\results
call npm test -- --reporter json > test\results\mocha-results.json
if errorlevel 1 (
    echo ERROR: Tests failed
    echo {"stats":{"tests":0,"passes":0,"failures":1},"tests":[{"title":"Test Suite Failed","fullTitle":"Test execution failed","err":{"message":"Tests did not complete successfully"}}]} > test\results\mocha-results.json
    exit /b 1
)
echo ✓ All tests passed
echo.

REM Step 3: Run code coverage
echo [3/6] Running code coverage analysis...
call npm run test:coverage
if errorlevel 1 (
    echo ERROR: Coverage analysis failed
    exit /b 1
)
REM Move coverage to test/results/
if not exist test\results\coverage mkdir test\results\coverage
if exist coverage (
    xcopy /s /y /q coverage test\results\coverage\ >nul 2>&1
)
echo ✓ Coverage report generated at test\results\coverage\
echo.

REM Step 4: Run mutation testing
echo [4/6] Running mutation testing with Stryker...
call npm run mutation
if errorlevel 1 (
    echo WARNING: Mutation testing completed with warnings
)
echo ✓ Mutation testing completed
echo.

REM Step 5: Extract mutation score and create summary
echo [5/6] Extracting mutation score...
set MUTATION_SCORE=0

REM Try to extract from JSON report
if exist reports\mutation\mutation.json (
    for /f "delims=" %%i in ('node -e "try{const fs=require('fs');const d=JSON.parse(fs.readFileSync('reports/mutation/mutation.json','utf8'));console.log(Math.round((d.mutationScore||d.metrics?.mutationScore||0)*100)/100);}catch(e){console.log(0);}"') do set MUTATION_SCORE=%%i
) else if exist reports\mutation\stryker.json (
    for /f "delims=" %%i in ('node -e "try{const fs=require('fs');const d=JSON.parse(fs.readFileSync('reports/mutation/stryker.json','utf8'));console.log(Math.round((d.mutationScore||0)*100)/100);}catch(e){console.log(0);}"') do set MUTATION_SCORE=%%i
) else if exist reports\mutation\index.html (
    REM Fallback: try to parse HTML (basic approach)
    for /f "tokens=*" %%i in ('powershell -Command "if(Test-Path 'reports/mutation/index.html'){$c=Get-Content 'reports/mutation/index.html' -Raw; if($c -match 'mutation-score[^0-9]*([0-9.]+)'){$matches[1]}else{'0'}}else{'0'}"') do set MUTATION_SCORE=%%i
)

REM Write mutation summary JSON
(
echo {
echo   "mutationScore": %MUTATION_SCORE%,
echo   "threshold": %MUTATION_THRESHOLD%,
echo   "timestamp": "%date:~-4%-%date:~4,2%-%date:~7,2%T%time:~0,2%:%time:~3,2%:%time:~6,2%Z",
echo   "reportPath": "reports/mutation/index.html"
echo }
) > test\results\mutation-summary.json

echo ✓ Mutation score: %MUTATION_SCORE%%%
echo ✓ Mutation summary saved to test\results\mutation-summary.json
echo.

REM Step 6: Generate placeholder screenshots
echo [6/6] Generating placeholder screenshots...
call node scripts\take_placeholder_screenshots.js
if errorlevel 1 (
    echo WARNING: Screenshot generation failed ^(non-critical^)
) else (
    echo ✓ Placeholder screenshots created
)
echo.

REM Final validation
echo ==========================================
echo Test Suite Execution Complete
echo ==========================================
echo Test Results: test\results\mocha-results.json
echo Coverage Report: test\results\coverage\index.html
echo Mutation Report: reports\mutation\index.html
echo Mutation Score: %MUTATION_SCORE%%%
echo Mutation Threshold: %MUTATION_THRESHOLD%%%
echo.

REM Check mutation score threshold (using PowerShell for floating point comparison)
powershell -Command "if ([double]%MUTATION_SCORE% -lt [double]%MUTATION_THRESHOLD%) { exit 1 } else { exit 0 }"
if errorlevel 1 (
    echo ❌ FAILED: Mutation score ^(%MUTATION_SCORE%%%^) is below threshold ^(%MUTATION_THRESHOLD%%%^)
    exit /b 1
)

echo ✓ All checks passed!
echo ✓ Mutation score meets threshold requirement
exit /b 0
