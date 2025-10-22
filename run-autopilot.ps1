#!/usr/bin/env pwsh
Write-Host "🤖 LightDom Autopilot" -ForegroundColor Cyan
Write-Host "Ensuring dependencies..." -ForegroundColor Yellow
npm install --legacy-peer-deps
Write-Host "Starting autopilot..." -ForegroundColor Green
npm run autopilot

