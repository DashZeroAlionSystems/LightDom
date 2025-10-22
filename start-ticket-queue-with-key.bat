@echo off
REM Set your Linear API key as an environment variable before running this script
REM Example: set LINEAR_API_KEY=your_linear_api_key_here
if "%LINEAR_API_KEY%"=="" (
    echo ERROR: LINEAR_API_KEY environment variable is not set
    echo Please set it with: set LINEAR_API_KEY=your_linear_api_key_here
    pause
    exit /b 1
)
set TICKET_QUEUE_PORT=3099
node scripts/ticket-queue-server.js
