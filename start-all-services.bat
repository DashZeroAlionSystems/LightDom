@echo off
setlocal ENABLEDELAYEDEXPANSION

set "DEV_CRAWLER_STUB=false"

if not defined OLLAMA_HOST (
  set "OLLAMA_HOST=127.0.0.1:11434"
)

for /f "tokens=*" %%I in ("%OLLAMA_HOST%") do set "OLLAMA_HOST=%%~I"

if /I not "%OLLAMA_HOST:~0,7%"=="http://" if /I not "%OLLAMA_HOST:~0,8%"=="https://" (
  set "OLLAMA_HOST=http://%OLLAMA_HOST%"
)

if "%OLLAMA_HOST:~-1%"=="/" set "OLLAMA_HOST=%OLLAMA_HOST:~0,-1%"

set "DEEPSEEK_API_URL=%OLLAMA_HOST%"
set "DEEPSEEK_MODEL=deepseek-r1:latest"
set "DEEPSEEK_ALLOW_ANON=true"
set "DEEPSEEK_HEALTH_URL=http://localhost:4100/health"
set "OLLAMA_HEALTH_URL=%OLLAMA_HOST%/api/version"
echo 🚀 Starting LightDom Complete System (Windows)...

REM Kill any existing processes
echo 🧹 Cleaning up existing processes...
taskkill /F /IM node.exe /T >nul 2>&1
taskkill /F /IM electron.exe /T >nul 2>&1

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Ensure Ollama serve daemon is running for local DeepSeek inference
call :startOllama

REM Start API Server
echo 📡 Starting API Server...
start "API Server" cmd /k "cd /d %~dp0 && node simple-api-server.js"

REM Wait for API to start
call :waitForHttp "API Server" "http://localhost:3001/api/health" 30 || goto :cleanup

call :applySchemas

REM Start DeepSeek orchestration service (local)
echo 🧠 Starting DeepSeek orchestration service...
start "DeepSeek Service" cmd /k "cd /d %~dp0 && npm run start:deepseek"
call :waitForHttp "DeepSeek Service" "%DEEPSEEK_HEALTH_URL%" 40 || goto :cleanup

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
echo 🖥️  Electron: Desktop app should open
echo.
echo Press any key to exit this window...
pause >nul
goto :EOF

:applySchemas
echo 🗄️  Applying database schemas...
powershell -NoLogo -NoProfile -Command "try { Invoke-WebRequest -UseBasicParsing -TimeoutSec 60 -Method Post -Uri 'http://localhost:3001/api/db/apply-schemas' > $null; exit 0 } catch { exit 1 }" >nul 2>&1
if !errorlevel! == 0 (
  echo ✅ Database schemas applied ^(idempotent^).
  exit /b 0
)
echo ⚠️  Unable to apply database schemas automatically. Check API logs for details.
exit /b 0

:cleanup
echo ❌ Startup sequence aborted due to previous errors.
goto :EOF

:ensureElectron
if defined ELECTRON_LAUNCH_CMD exit /b 0
if exist "%~dp0pnpm-lock.yaml" (
  pnpm exec electron --version >nul 2>&1
  if !errorlevel! == 0 (
    echo ✅ Using pnpm-managed Electron CLI.
    set "ELECTRON_LAUNCH_CMD=pnpm exec electron"
    exit /b 0
  )
)

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

:startOllama
echo 🤖 Ensuring Ollama daemon is running...
where ollama >nul 2>&1
if errorlevel 1 (
  echo ⚠️  Ollama CLI not found on PATH. Install Ollama to enable local DeepSeek chat.
  exit /b 0
)

powershell -NoLogo -NoProfile -Command "try { Invoke-WebRequest -UseBasicParsing -TimeoutSec 5 -Uri '%OLLAMA_HEALTH_URL%' > $null; exit 0 } catch { exit 1 }" >nul 2>&1
if not errorlevel 1 (
  echo ✅ Ollama daemon already running.
  call :ensureOllamaModel "%DEEPSEEK_MODEL%"
  exit /b 0
)

echo 🚀 Starting Ollama serve daemon...
start "Ollama Daemon" cmd /k "cd /d %~dp0 && ollama serve"

call :waitForHttp "Ollama Daemon" "%OLLAMA_HEALTH_URL%" 40
if errorlevel 1 (
  echo ⚠️  Ollama did not report ready. Local DeepSeek chat will run in mock mode.
  exit /b 0
)

echo ✅ Ollama daemon is ready.
call :ensureOllamaModel "%DEEPSEEK_MODEL%"
exit /b 0

:ensureOllamaModel
set "MODEL_NAME=%~1"
if "%MODEL_NAME%"=="" exit /b 0

echo 📥 Ensuring Ollama model %MODEL_NAME% is available...
ollama list | findstr /C:"%MODEL_NAME%" >nul 2>&1
if errorlevel 1 (
  echo ⏬ Pulling model %MODEL_NAME% ^(this may take a moment^)...
  ollama pull %MODEL_NAME%
  if errorlevel 1 (
    echo ⚠️  Unable to pull model %MODEL_NAME%. Download it manually with "ollama pull %MODEL_NAME%".
  ) else (
    echo ✅ Model %MODEL_NAME% ready.
  )
) else (
  echo ✅ Model %MODEL_NAME% already available locally.
)
exit /b 0

:waitForHttp
set "WAIT_NAME=%~1"
set "WAIT_URL=%~2"
set "WAIT_RETRIES=%~3"
if "%WAIT_RETRIES%"=="" set WAIT_RETRIES=20
echo 🔍 Waiting for %WAIT_NAME% (%WAIT_URL%)...
for /l %%I in (1,1,%WAIT_RETRIES%) do (
  powershell -NoLogo -NoProfile -Command "try { Invoke-WebRequest -UseBasicParsing -TimeoutSec 5 -Uri '%WAIT_URL%' > $null; exit 0 } catch { exit 1 }" >nul 2>&1
  if !errorlevel! == 0 (
    echo ✅ %WAIT_NAME% is reachable.
    exit /b 0
  )
  echo ⏳ Attempt %%I/%WAIT_RETRIES% failed. Retrying in 2 seconds...
  timeout /t 2 /nobreak >nul
)
echo ❌ %WAIT_NAME% did not respond after %WAIT_RETRIES% attempts.
exit /b 1
