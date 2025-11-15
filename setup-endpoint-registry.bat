@echo off
REM ====================================================================
REM API Endpoint Registry - Easy Setup Script (Windows)
REM ====================================================================
REM Purpose: One-command setup for the API Endpoint Registry system
REM Usage: setup-endpoint-registry.bat
REM ====================================================================

echo ========================================
echo API Endpoint Registry - Easy Setup
echo ========================================
echo.

REM Database configuration
if "%DB_HOST%"=="" set DB_HOST=localhost
if "%DB_PORT%"=="" set DB_PORT=5432
if "%DB_NAME%"=="" set DB_NAME=dom_space_harvester
if "%DB_USER%"=="" set DB_USER=postgres

echo Configuration:
echo    Database: %DB_NAME%
echo    Host: %DB_HOST%:%DB_PORT%
echo    User: %DB_USER%
echo.

REM Step 1: Check prerequisites
echo Step 1: Checking prerequisites...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -c "SELECT 1 FROM workflow_services LIMIT 1" >nul 2>&1
if errorlevel 1 (
    echo Installing prerequisite: workflow-hierarchy-schema.sql
    psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f migrations\workflow-hierarchy-schema.sql
) else (
    echo ✓ Prerequisites met
)
echo.

REM Step 2: Run main migration
echo Step 2: Creating API Endpoint Registry tables...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f migrations\20251115_api_endpoint_registry.sql
if errorlevel 1 (
    echo ✗ Error running migration
) else (
    echo ✓ Schema created
)
echo.

REM Step 3: Seed demo data
echo Step 3: Seeding demo data...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f migrations\20251115_api_endpoint_registry_demo_data.sql
if errorlevel 1 (
    echo ✗ Error seeding data
) else (
    echo ✓ Demo data seeded
)
echo.

REM Step 4: Verify installation
echo Step 4: Verifying installation...
echo.

for /f "delims=" %%i in ('psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -t -c "SELECT COUNT(*) FROM api_endpoints"') do set ENDPOINTS=%%i
for /f "delims=" %%i in ('psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -t -c "SELECT COUNT(*) FROM service_endpoint_bindings"') do set BINDINGS=%%i
for /f "delims=" %%i in ('psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -t -c "SELECT COUNT(*) FROM workflow_endpoint_chains"') do set CHAINS=%%i
for /f "delims=" %%i in ('psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -t -c "SELECT COUNT(*) FROM workflow_wizard_configs"') do set WIZARDS=%%i
for /f "delims=" %%i in ('psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -t -c "SELECT COUNT(*) FROM endpoint_execution_logs"') do set LOGS=%%i

echo Database Status:
echo    • API Endpoints: %ENDPOINTS%
echo    • Service Bindings: %BINDINGS%
echo    • Endpoint Chains: %CHAINS%
echo    • Wizard Configs: %WIZARDS%
echo    • Execution Logs: %LOGS%
echo.

REM Step 5: Display next steps
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next Steps:
echo.
echo 1. Start the API server:
echo    npm run start:dev
echo.
echo 2. View demo data:
echo    psql -d %DB_NAME% -c "SELECT * FROM api_endpoints;"
echo.
echo 3. View relationships:
echo    psql -d %DB_NAME% -c "SELECT ae.title, seb.binding_order, ws.name FROM api_endpoints ae JOIN service_endpoint_bindings seb ON ae.endpoint_id = seb.endpoint_id JOIN workflow_services ws ON seb.service_id = ws.service_id ORDER BY seb.binding_order;"
echo.
echo 4. Run the demo script:
echo    node demo-endpoint-registry-system.js
echo.
echo 5. Try the API:
echo    curl http://localhost:3001/api/endpoint-registry/endpoints
echo.
echo Documentation:
echo    • API_ENDPOINT_REGISTRY_QUICKSTART.md
echo    • API_ENDPOINT_REGISTRY_SYSTEM.md
echo    • API_ENDPOINT_REGISTRY_ARCHITECTURE.md
echo.
pause
