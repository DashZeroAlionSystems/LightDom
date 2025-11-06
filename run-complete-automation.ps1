#!/usr/bin/env pwsh
# ============================================
# LightDom Complete Automation Runner
# ============================================

Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host " LightDom Complete Automation System" -ForegroundColor Yellow
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if npm is available
try {
    $npmVersion = npm --version
    Write-Host "✓ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ ERROR: npm is not found" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Function to display menu
function Show-Menu {
    Write-Host ""
    Write-Host "Select automation mode:" -ForegroundColor Yellow
    Write-Host "1. Complete Automation (Recommended)" -ForegroundColor Green -NoNewline
    Write-Host " - Runs all fixes automatically"
    Write-Host "2. Workflow-based Automation" -ForegroundColor Cyan -NoNewline
    Write-Host " - Uses YAML workflow configuration"
    Write-Host "3. Master Automation" -ForegroundColor Blue -NoNewline
    Write-Host " - Original master automation system"
    Write-Host "4. Single Round" -ForegroundColor Magenta -NoNewline
    Write-Host " - Run one automation round only"
    Write-Host "5. Compliance Check Only" -ForegroundColor Yellow -NoNewline
    Write-Host " - Just check current status"
    Write-Host "6. Exit" -ForegroundColor Red
    Write-Host ""
}

# Function to run automation
function Run-Automation {
    param($Choice)
    
    switch ($Choice) {
        "1" {
            Write-Host ""
            Write-Host "Starting Complete Automation System..." -ForegroundColor Green
            Write-Host "This will automatically fix all issues and complete the project." -ForegroundColor Yellow
            Write-Host ""
            Read-Host "Press Enter to continue"
            npm run automation:complete
        }
        "2" {
            Write-Host ""
            Write-Host "Starting Workflow-based Automation..." -ForegroundColor Cyan
            Write-Host "This uses the YAML workflow configuration." -ForegroundColor Yellow
            Write-Host ""
            Read-Host "Press Enter to continue"
            npm run automation:workflow:complete
        }
        "3" {
            Write-Host ""
            Write-Host "Starting Master Automation..." -ForegroundColor Blue
            Write-Host "This runs the original master automation system." -ForegroundColor Yellow
            Write-Host ""
            Read-Host "Press Enter to continue"
            npm run automation:master
        }
        "4" {
            Write-Host ""
            $round = Read-Host "Enter round number (default 1)"
            if ([string]::IsNullOrWhiteSpace($round)) { $round = "1" }
            Write-Host "Starting Automation Round $round..." -ForegroundColor Magenta
            Read-Host "Press Enter to continue"
            node scripts/automation/automation-round.js $round
        }
        "5" {
            Write-Host ""
            Write-Host "Running Compliance Check..." -ForegroundColor Yellow
            npm run compliance:check
        }
        "6" {
            Write-Host "Exiting..." -ForegroundColor Red
            exit 0
        }
        default {
            Write-Host "Invalid choice!" -ForegroundColor Red
            return $false
        }
    }
    return $true
}

# Main loop
do {
    Show-Menu
    $choice = Read-Host "Enter your choice (1-6)"
    $result = Run-Automation -Choice $choice
    
    if ($result -and $choice -ne "6") {
        Write-Host ""
        Write-Host "=======================================" -ForegroundColor Green
        Write-Host " Automation Complete!" -ForegroundColor Yellow
        Write-Host "=======================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Check the generated reports for details:" -ForegroundColor Cyan
        Write-Host "- automation-complete-report-*.md" -ForegroundColor White
        Write-Host "- workflow-report-*.json" -ForegroundColor White
        Write-Host "- logs/automation-*.log" -ForegroundColor White
        Write-Host ""
        
        $continue = Read-Host "Run another automation? (y/n)"
        if ($continue -ne "y") {
            break
        }
    }
} while ($choice -ne "6")

Write-Host ""
Write-Host "Thank you for using LightDom Automation!" -ForegroundColor Cyan
Write-Host ""
