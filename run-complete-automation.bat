@echo off
REM ============================================
REM LightDom Complete Automation Runner
REM ============================================

echo.
echo ========================================
echo  LightDom Complete Automation System
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check Node version
echo Checking Node.js version...
node --version

REM Check if npm is available
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not found
    pause
    exit /b 1
)

REM Display options
echo.
echo Select automation mode:
echo 1. Complete Automation (Recommended) - Runs all fixes automatically
echo 2. Workflow-based Automation - Uses YAML workflow configuration
echo 3. Master Automation - Original master automation system
echo 4. Single Round - Run one automation round only
echo 5. Exit
echo.

set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" (
    echo.
    echo Starting Complete Automation System...
    echo This will automatically fix all issues and complete the project.
    echo.
    pause
    npm run automation:complete
) else if "%choice%"=="2" (
    echo.
    echo Starting Workflow-based Automation...
    echo This uses the YAML workflow configuration.
    echo.
    pause
    npm run automation:workflow:complete
) else if "%choice%"=="3" (
    echo.
    echo Starting Master Automation...
    echo This runs the original master automation system.
    echo.
    pause
    npm run automation:master
) else if "%choice%"=="4" (
    echo.
    set /p round="Enter round number (default 1): "
    if "%round%"=="" set round=1
    echo Starting Automation Round %round%...
    pause
    node scripts/automation/automation-round.js %round%
) else if "%choice%"=="5" (
    echo Exiting...
    exit /b 0
) else (
    echo Invalid choice!
    pause
    exit /b 1
)

echo.
echo ========================================
echo  Automation Complete!
echo ========================================
echo.
echo Check the generated reports for details:
echo - automation-complete-report-*.md
echo - workflow-report-*.json
echo - logs/automation-*.log
echo.

pause
