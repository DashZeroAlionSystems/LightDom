# PowerShell Script for Chrome React Dev Container
# Cross-platform startup script with better error handling

param(
    [switch]$Verbose,
    [switch]$SkipChecks,
    [switch]$ForceRestart
)

Write-Host "🚀 Starting Chrome React Dev Container (PowerShell)" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Function to test command availability
function Test-Command {
    param([string]$Command)
    try {
        $null = Get-Command $Command -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

# Function to test Node.js
function Test-NodeJs {
    try {
        $version = & node --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Node.js found: $version" -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host "❌ Node.js test failed" -ForegroundColor Red
    }
    return $false
}

# Function to test port availability
function Test-Port {
    param([int]$Port)
    try {
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $tcpClient.Connect("127.0.0.1", $Port)
        $tcpClient.Close()
        return $false  # Port is in use
    } catch {
        return $true   # Port is available
    }
}

# Function to kill process on port
function Stop-PortProcess {
    param([int]$Port)
    try {
        $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        foreach ($conn in $connections) {
            if ($conn.OwningProcess) {
                Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
                Write-Host "🛑 Killed process on port $Port" -ForegroundColor Yellow
            }
        }
    } catch {
        Write-Host "⚠️ Could not kill process on port $Port" -ForegroundColor Yellow
    }
}

# Function to check dependencies
function Test-Dependencies {
    $requiredFiles = @(
        "enterprise-chrome-react-workflow.js",
        "chrome-react-dev-container.js",
        "admin-dashboard.html"
    )

    $missingFiles = @()
    foreach ($file in $requiredFiles) {
        if (!(Test-Path $file)) {
            $missingFiles += $file
        }
    }

    if ($missingFiles.Count -gt 0) {
        Write-Host "❌ Missing required files:" -ForegroundColor Red
        $missingFiles | ForEach-Object { Write-Host "   • $_" -ForegroundColor Red }
        return $false
    }

    Write-Host "✅ All required files present" -ForegroundColor Green
    return $true
}

# Main execution
try {
    # Step 1: Basic system checks
    if (!$SkipChecks) {
        Write-Host "🔍 Performing system checks..." -ForegroundColor Yellow
        Write-Host ""

        # Test Node.js
        if (!(Test-NodeJs)) {
            Write-Host ""
            Write-Host "❌ Node.js is required but not found!" -ForegroundColor Red
            Write-Host "📥 Download from: https://nodejs.org/" -ForegroundColor Yellow
            Write-Host "🔧 Or run: choco install nodejs" -ForegroundColor Yellow
            exit 1
        }

        # Test dependencies
        if (!(Test-Dependencies)) {
            Write-Host ""
            Write-Host "❌ Required files are missing!" -ForegroundColor Red
            Write-Host "📁 Please ensure you're running from the project root directory" -ForegroundColor Yellow
            exit 1
        }

        # Test Puppeteer
        try {
            & node -e "require('puppeteer')" 2>$null | Out-Null
            Write-Host "✅ Puppeteer available" -ForegroundColor Green
        } catch {
            Write-Host "❌ Puppeteer not available - installing..." -ForegroundColor Yellow
            & npm install puppeteer
            if ($LASTEXITCODE -ne 0) {
                Write-Host "❌ Failed to install Puppeteer" -ForegroundColor Red
                exit 1
            }
        }

        # Check ports
        $ports = @(3001, 3002, 3003)
        $portsToFree = @()

        foreach ($port in $ports) {
            if (!(Test-Port $port)) {
                Write-Host "⚠️ Port $port is in use" -ForegroundColor Yellow
                $portsToFree += $port
            }
        }

        if ($portsToFree.Count -gt 0 -and $ForceRestart) {
            Write-Host "🛑 Force restart enabled - freeing ports..." -ForegroundColor Yellow
            foreach ($port in $portsToFree) {
                Stop-PortProcess $port
            }
            Start-Sleep -Seconds 2
        }

        Write-Host ""
    }

    # Step 2: Start the workflow
    Write-Host "🎯 Starting Chrome React Dev Container Workflow..." -ForegroundColor Green
    Write-Host ""
    Write-Host "This will create:" -ForegroundColor Cyan
    Write-Host "  • Headless Chrome browser environment" -ForegroundColor White
    Write-Host "  • Live React code execution system" -ForegroundColor White
    Write-Host "  • Admin dashboard for management" -ForegroundColor White
    Write-Host "  • Self-healing error recovery" -ForegroundColor White
    Write-Host ""
    Write-Host "Press Ctrl+C to stop the system" -ForegroundColor Yellow
    Write-Host ""

    # Start the workflow
    $processArgs = @{
        FilePath = "node"
        ArgumentList = "enterprise-chrome-react-workflow.js"
        WorkingDirectory = $PSScriptRoot
        NoNewWindow = $true
        Wait = $true
    }

    if ($Verbose) {
        $processArgs.RedirectStandardOutput = $false
        $processArgs.RedirectStandardError = $false
    }

    $process = Start-Process @processArgs

    if ($process.ExitCode -eq 0) {
        Write-Host ""
        Write-Host "🎊 Chrome React Dev Container completed successfully!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "❌ Chrome React Dev Container exited with code $($process.ExitCode)" -ForegroundColor Red
    }

} catch {
    Write-Host ""
    Write-Host "💥 Script execution failed: $($_.Exception.Message)" -ForegroundColor Red

    if ($Verbose) {
        Write-Host "Stack trace:" -ForegroundColor Red
        $_.ScriptStackTrace
    }
} finally {
    Write-Host ""
    Write-Host "🌐 System Access Points:" -ForegroundColor Cyan
    Write-Host "   🔴 Live React Editor: http://localhost:3001" -ForegroundColor White
    Write-Host "   🔵 Admin Dashboard:   http://localhost:3003" -ForegroundColor White
    Write-Host "   🟢 Health Check:      http://localhost:3001/health" -ForegroundColor White
    Write-Host ""
    Write-Host "📞 Need help? Run: .\\cross-platform-chrome-react-demo.js" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🛑 Press any key to exit..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
