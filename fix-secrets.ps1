Write-Host "Fixing git repository secrets..." -ForegroundColor Green

# Stage the fixed files
Write-Host "Staging fixed files..." -ForegroundColor Yellow
git add linear-api-key.txt
git add start-ticket-queue-with-key.bat
git add src/components/admin/SecuritySettings.tsx
git add .gitignore

# Commit the changes
Write-Host "Committing changes..." -ForegroundColor Yellow
git commit -m "fix: Remove exposed API keys and use environment variables

- Replace hardcoded Linear API key with environment variable
- Replace hardcoded Stripe API key with environment variable  
- Update .gitignore to prevent future secret exposure
- Add proper error handling for missing environment variables"

# Try to push
Write-Host "Attempting to push to remote..." -ForegroundColor Yellow
$pushResult = git push origin main 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "Push failed. Error details:" -ForegroundColor Red
    Write-Host $pushResult -ForegroundColor Red
    Write-Host ""
    Write-Host "You may need to:" -ForegroundColor Yellow
    Write-Host "1. Check if there are still secrets in the commit history" -ForegroundColor White
    Write-Host "2. Use git rebase to remove secrets from previous commits" -ForegroundColor White
    Write-Host "3. Contact GitHub support if the issue persists" -ForegroundColor White
} else {
    Write-Host "Successfully pushed to remote!" -ForegroundColor Green
}

Read-Host "Press Enter to continue"
