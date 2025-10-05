# PowerShell script to start all LightDom services
Write-Host "🚀 Starting LightDom Complete System (PowerShell)..." -ForegroundColor Green

# Kill any existing processes
Write-Host "🧹 Cleaning up existing processes..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*node*" -or $_.ProcessName -like "*electron*"} | Stop-Process -Force -ErrorAction SilentlyContinue

# Wait a moment
Start-Sleep -Seconds 2

# Start API Server
Write-Host "📡 Starting API Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; node simple-api-server.js" -WindowStyle Normal

# Wait for API to start
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "🌐 Starting Frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev" -WindowStyle Normal

# Wait for frontend to start
Start-Sleep -Seconds 5

# Start Electron
Write-Host "🖥️  Starting Electron..." -ForegroundColor Cyan
$env:NODE_ENV = "development"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; electron . --dev" -WindowStyle Normal

Write-Host "✅ All services started!" -ForegroundColor Green
Write-Host "🌐 Frontend: Check the Frontend window for the URL" -ForegroundColor White
Write-Host "🔌 API: http://localhost:3001" -ForegroundColor White
Write-Host "🖥️  Electron: Desktop app should open" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
