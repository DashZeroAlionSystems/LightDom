@echo off
REM Memory Workflow CodeMap - Docker Run Script (Windows)
REM Automated container setup and management

setlocal enabledelayedexpansion

REM Colors for Windows (limited support)
set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "RESET=[0m"

REM Logging functions
:log_info
echo [94m[INFO][0m %~1
goto :eof

:log_success
echo [92m[SUCCESS][0m %~1
goto :eof

:log_warning
echo [93m[WARNING][0m %~1
goto :eof

:log_error
echo [91m[ERROR][0m %~1
goto :eof

REM Check if Docker is installed
:check_docker
where docker >nul 2>nul
if %errorlevel% neq 0 (
    call :log_error "Docker is not installed. Please install Docker first."
    echo Visit: https://docs.docker.com/get-docker/
    pause
    exit /b 1
)

where docker-compose >nul 2>nul
if %errorlevel% neq 0 (
    call :log_error "Docker Compose is not installed. Please install Docker Compose."
    echo Visit: https://docs.docker.com/compose/install/
    pause
    exit /b 1
)

call :log_success "Docker and Docker Compose are installed"
goto :eof

REM Create necessary directories
:setup_directories
call :log_info "Setting up directories..."
if not exist "memory-store" mkdir memory-store
if not exist "logs" mkdir logs
call :log_success "Directories created"
goto :eof

REM Build the containers
:build_containers
call :log_info "Building Docker containers..."
docker-compose -f docker-compose-codemap.yml build
if %errorlevel% neq 0 (
    call :log_error "Failed to build containers"
    exit /b 1
)
call :log_success "Containers built successfully"
goto :eof

REM Start the services
:start_services
call :log_info "Starting Memory Workflow CodeMap services..."
docker-compose -f docker-compose-codemap.yml up -d
if %errorlevel% neq 0 (
    call :log_error "Failed to start services"
    exit /b 1
)
call :log_success "Services started successfully"
call :log_info "Waiting for services to be ready..."
goto :eof

REM Wait for services to be healthy
:wait_for_services
set max_attempts=30
set attempt=1

call :log_info "Checking service health..."

:wait_loop
docker-compose -f docker-compose-codemap.yml ps | findstr "healthy" >nul
if %errorlevel% equ 0 (
    call :log_success "All services are healthy!"
    goto :eof
)

echo|set /p="."
timeout /t 5 /nobreak >nul
set /a attempt+=1

if %attempt% leq %max_attempts% goto wait_loop

call :log_warning "Services are still starting. This may take a few more minutes."
call :log_info "You can check status with: docker-compose -f docker-compose-codemap.yml ps"
goto :eof

REM Show service status
:show_status
call :log_info "Service Status:"
echo.
docker-compose -f docker-compose-codemap.yml ps
echo.
call :log_info "Service Logs:"
echo   • CodeMap App: docker-compose -f docker-compose-codemap.yml logs codemap
echo   • Ollama: docker-compose -f docker-compose-codemap.yml logs ollama
echo   • All: docker-compose -f docker-compose-codemap.yml logs
goto :eof

REM Open browser
:open_browser
call :log_info "Opening browser to http://localhost:3002"
start http://localhost:3002
goto :eof

REM Main functions
:start_system
call :log_info "🚀 Starting Memory Workflow CodeMap in Docker containers"
echo.

call :check_docker
call :setup_directories
call :build_containers
call :start_services
call :wait_for_services

echo.
call :log_success "🎉 Memory Workflow CodeMap is running!"
echo.
call :log_info "🌐 Access the interactive CodeMap at: http://localhost:3002"
echo.
call :show_status
echo.
call :log_info "💡 Useful commands:"
echo   • View logs: docker-compose -f docker-compose-codemap.yml logs -f
echo   • Stop system: docker-compose -f docker-compose-codemap.yml down
echo   • Restart: docker-compose -f docker-compose-codemap.yml restart
echo.
call :open_browser
goto :eof

:stop_system
call :log_info "🛑 Stopping Memory Workflow CodeMap"
docker-compose -f docker-compose-codemap.yml down
if %errorlevel% equ 0 (
    call :log_success "Services stopped successfully"
) else (
    call :log_error "Failed to stop services"
)
goto :eof

:restart_system
call :log_info "🔄 Restarting Memory Workflow CodeMap"
docker-compose -f docker-compose-codemap.yml restart
if %errorlevel% equ 0 (
    call :log_success "Services restarted successfully"
    call :wait_for_services
) else (
    call :log_error "Failed to restart services"
)
goto :eof

:show_help
echo Memory Workflow CodeMap - Docker Management Script
echo.
echo Usage: %0 [command]
echo.
echo Commands:
echo   start     Start the complete CodeMap system
echo   stop      Stop all CodeMap services
echo   restart   Restart all CodeMap services
echo   status    Show current service status
echo   logs      Show service logs
echo   build     Rebuild the containers
echo   clean     Remove containers and volumes
echo   help      Show this help message
echo.
echo Examples:
echo   %0 start          # Start the complete system
echo   %0 logs codemap   # Show CodeMap app logs
echo   %0 stop           # Stop all services
echo.
goto :eof

REM Main script logic
if "%1"=="" (
    call :start_system
) else if "%1"=="start" (
    call :start_system
) else if "%1"=="stop" (
    call :stop_system
) else if "%1"=="restart" (
    call :restart_system
) else if "%1"=="status" (
    call :show_status
) else if "%1"=="logs" (
    if "%2"=="" (
        docker-compose -f docker-compose-codemap.yml logs
    ) else (
        docker-compose -f docker-compose-codemap.yml logs %2
    )
) else if "%1"=="build" (
    call :build_containers
) else if "%1"=="clean" (
    call :log_warning "This will remove all containers and volumes. Are you sure? (y/N)"
    set /p response="> "
    if /i "!response!"=="y" (
        docker-compose -f docker-compose-codemap.yml down -v --rmi all
        call :log_success "System cleaned"
    )
) else if "%1"=="help" (
    call :show_help
) else if "%1"=="--help" (
    call :show_help
) else if "%1"=="-h" (
    call :show_help
) else (
    call :log_error "Unknown command: %1"
    echo.
    call :show_help
    exit /b 1
)
