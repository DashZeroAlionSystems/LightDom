# PowerShell script to start all LightDom services
Write-Host "🚀 Starting LightDom Complete System (PowerShell)..." -ForegroundColor Green

function Test-HttpHealth {
    param (
        [string]$Name,
        [string]$Url,
        [int]$TimeoutSeconds = 10
    )

    Write-Host "🔍 Verifying $Name health..." -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec $TimeoutSeconds
        if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 300) {
            Write-Host "✅ $Name health check passed ($($response.StatusCode))." -ForegroundColor Green
        } else {
            Write-Host "⚠️ $Name health check returned status $($response.StatusCode)." -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ $Name health check failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Kill any existing processes
Write-Host "🧹 Cleaning up existing processes..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*node*" -or $_.ProcessName -like "*electron*"} | Stop-Process -Force -ErrorAction SilentlyContinue

# Wait a moment
Start-Sleep -Seconds 2

# Start API Server
Write-Host "📡 Starting API Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; node simple-api-server.js" -WindowStyle Normal

# Start n8n (Docker)
Write-Host "🔄 Starting n8n workflow automation (Docker)..." -ForegroundColor Cyan
try {
    docker compose up n8n -d | Out-Null
} catch {
    Write-Host "❌ Failed to start n8n via Docker Compose: $($_.Exception.Message)" -ForegroundColor Red
}

# Start DeepSeek Orchestrator if script exists
$deepseekScriptDefined = (Get-Content package.json -ErrorAction SilentlyContinue | Select-String '"start:deepseek"')
if ($deepseekScriptDefined) {
    Write-Host "🧠 Starting DeepSeek orchestration service..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run start:deepseek" -WindowStyle Normal
} else {
    Write-Host "⚠️ npm script 'start:deepseek' not found. Skipping DeepSeek startup. Add the script in package.json." -ForegroundColor Yellow
}

# Start Crawler Service if script exists
$crawlerScriptDefined = (Get-Content package.json -ErrorAction SilentlyContinue | Select-String '"start:crawler"')
if ($crawlerScriptDefined) {
    Write-Host "🕸️  Starting Enhanced Crawler service..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run start:crawler" -WindowStyle Normal
} else {
    Write-Host "⚠️ npm script 'start:crawler' not found. Skipping crawler startup." -ForegroundColor Yellow
}

# Start Ollama services
Write-Host "🦾 Starting Ollama serve daemon..." -ForegroundColor Cyan
$ollamaInstalled = Get-Command ollama -ErrorAction SilentlyContinue
if ($ollamaInstalled) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; ollama serve" -WindowStyle Normal
    Write-Host "✅ Ollama service starting..." -ForegroundColor Green
    Start-Sleep -Seconds 3
    
    Write-Host "📥 Ensuring deepseek-r1:latest model is available..." -ForegroundColor Cyan
    try {
        $pullOutput = ollama pull deepseek-r1:latest 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ DeepSeek model ready" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Could not pull DeepSeek model. Pull manually with: ollama pull deepseek-r1:latest" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️ Unable to pull deepseek-r1:latest model: $($_.Exception.Message)" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️ Ollama not installed. Install from https://ollama.com" -ForegroundColor Yellow
    Write-Host "   Continuing without Ollama integration..." -ForegroundColor Gray
}

# Wait for backend services to stabilize
Start-Sleep -Seconds 10

# Health checks
Test-HttpHealth -Name "API" -Url "http://localhost:3001/api/health"
Test-HttpHealth -Name "n8n" -Url "http://localhost:5678/healthz"
$deepseekHealthUrl = $env:DEEPSEEK_HEALTH_URL
if (-not $deepseekHealthUrl) {
    $deepseekHealthUrl = "http://localhost:4100/health"
}
if ($deepseekScriptDefined) {
    Test-HttpHealth -Name "DeepSeek" -Url $deepseekHealthUrl
}
if ($crawlerScriptDefined) {
    $crawlerHealthUrl = $env:CRAWLER_HEALTH_URL
    if (-not $crawlerHealthUrl) {
        $crawlerHealthUrl = "http://localhost:4200/health"
    }
    Test-HttpHealth -Name "Crawler" -Url $crawlerHealthUrl
}
if ($ollamaInstalled) {
    Test-HttpHealth -Name "Ollama" -Url "http://localhost:11434/api/tags"
}

# Start Frontend
Write-Host "🌐 Starting Frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev" -WindowStyle Normal

# Wait for frontend to start
Start-Sleep -Seconds 5

# Start Electron
Write-Host "🖥️  Starting Electron..." -ForegroundColor Cyan
$env:NODE_ENV = "development"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npx electron . --dev" -WindowStyle Normal

Write-Host "✅ Startup sequence completed. Verify windows and logs for any issues." -ForegroundColor Green
Write-Host "🌐 Frontend: Check the Frontend window for the URL" -ForegroundColor White
Write-Host "🔌 API: http://localhost:3001" -ForegroundColor White
Write-Host "🦾 Ollama: http://localhost:11434 (if installed)" -ForegroundColor White
Write-Host "🖥️  Electron: Desktop app should open" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
