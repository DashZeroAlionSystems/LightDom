# PowerShell script to start Electron with proper environment variables
Write-Host "🚀 Starting LightDom Electron App (PowerShell)..." -ForegroundColor Green

# Set environment variable
$env:NODE_ENV = "development"

# Start Electron
Write-Host "🖥️  Starting Electron..." -ForegroundColor Yellow
electron .

Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
