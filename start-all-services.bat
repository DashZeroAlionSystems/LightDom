@echo off
setlocal ENABLEDELAYEDEXPANSION

set "DEV_CRAWLER_STUB=false"
echo 🚀 Starting LightDom Complete System (Windows)...

REM Kill any existing processes
echo 🧹 Cleaning up existing processes...
taskkill /F /IM node.exe /T >nul 2>&1
taskkill /F /IM electron.exe /T >nul 2>&1
taskkill /F /IM ollama.exe /T >nul 2>&1

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Start Ollama serve daemon
echo 🦾 Starting Ollama serve daemon...
where ollama >nul 2>&1
if !errorlevel! == 0 (
  start "Ollama" cmd /k "ollama serve"
  echo ✅ Ollama service starting...
  timeout /t 3 /nobreak >nul
  
  REM Pull deepseek model if not present
  echo 📥 Ensuring deepseek-r1:latest model is available...
  ollama pull deepseek-r1:latest >nul 2>&1
  if !errorlevel! == 0 (
    echo ✅ DeepSeek model ready
  ) else (
    echo ⚠️  Could not pull DeepSeek model automatically. Pull manually with: ollama pull deepseek-r1:latest
  )
) else (
  echo ⚠️  Ollama not found. Install from https://ollama.com
  echo    Continuing without Ollama integration...
)

REM Start API Server
echo 📡 Starting API Server...
start "API Server" cmd /k "cd /d %~dp0 && node simple-api-server.js"

REM Wait for API to start
call :waitForHttp "API Server" "http://localhost:3001/api/health" 30 || goto :cleanup

call :applySchemas

REM Check Ollama health if it was started
where ollama >nul 2>&1
if !errorlevel! == 0 (
  call :waitForHttp "Ollama" "http://localhost:11434/api/tags" 10
  if !errorlevel! == 0 (
    echo ✅ Ollama service is ready
  ) else (
    echo ⚠️  Ollama may not be fully ready yet
  )
)

REM Start Frontend
echo 🌐 Starting Frontend...
start "Frontend" cmd /k "cd /d %~dp0 && npm run dev"

REM Wait for frontend to start
timeout /t 5 /nobreak >nul

call :ensureElectron

REM Start Electron
echo 🖥️  Starting Electron...
set NODE_ENV=development
start "Electron" cmd /k "cd /d %~dp0 && call %ELECTRON_LAUNCH_CMD% . --dev"

echo ✅ All services started!
echo 🌐 Frontend: Check the Frontend window for the URL
echo 🔌 API: http://localhost:3001
echo 🦾 Ollama: http://localhost:11434 (if installed)
echo 🖥️  Electron: Desktop app should open
echo.
echo Press any key to exit this window...
pause >nul
goto :EOF

:ensureElectron
if defined ELECTRON_LAUNCH_CMD exit /b 0
set "ELECTRON_LAUNCH_CMD=electron"
where electron >nul 2>&1
if !errorlevel! == 0 (
  echo ✅ Global Electron CLI detected.
  exit /b 0
)

if exist "%~dp0node_modules\.bin\electron.cmd" (
  echo ✅ Local Electron CLI detected.
  set "ELECTRON_LAUNCH_CMD=npx electron"
  exit /b 0
)

echo ⚠️  Electron CLI not found. Attempting local install...
pushd "%~dp0" >nul
call npm install electron --no-save >nul 2>&1
popd >nul

if exist "%~dp0node_modules\.bin\electron.cmd" (
  echo ✅ Electron installed locally.
  set "ELECTRON_LAUNCH_CMD=npx electron"
  exit /b 0
)

echo ❌ Electron CLI could not be installed automatically. Falling back to npx electron.
set "ELECTRON_LAUNCH_CMD=npx electron"
exit /b 0

:waitForHttp
set "WAIT_NAME=%~1"
set "WAIT_URL=%~2"
set "WAIT_RETRIES=%~3"
if "%WAIT_RETRIES%"=="" set WAIT_RETRIES=20
echo 🔍 Waiting for %WAIT_NAME% (%WAIT_URL%)...
for /l %%I in (1,1,%WAIT_RETRIES%) do (
  powershell -NoLogo -NoProfile -Command "try { Invoke-WebRequest -UseBasicParsing -TimeoutSec 5 -Uri '%WAIT_URL%' | Out-Null; exit 0 } catch { exit 1 }" >nul 2>&1
  if !errorlevel! == 0 (
    echo ✅ %WAIT_NAME% is reachable.
    exit /b 0
  )
  echo ⏳ Attempt %%I/%WAIT_RETRIES% failed. Retrying in 2 seconds...
  timeout /t 2 /nobreak >nul
)
echo ❌ %WAIT_NAME% did not respond after %WAIT_RETRIES% attempts.
exit /b 1

:applySchemas
echo 🗄️  Applying database schemas...
powershell -NoLogo -NoProfile -Command "try { Invoke-WebRequest -UseBasicParsing -TimeoutSec 60 -Method Post -Uri 'http://localhost:3001/api/db/apply-schemas' | Out-Null; exit 0 } catch { exit 1 }" >nul 2>&1
if !errorlevel! == 0 (
  echo ✅ Database schemas applied (idempotent).
  exit /b 0
)
echo ⚠️  Unable to apply database schemas automatically. Check API logs for details.
exit /b 0

:cleanup
echo ❌ Startup sequence aborted due to previous errors.
goto :EOF
