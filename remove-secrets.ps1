Write-Host "========================================" -ForegroundColor Cyan
Write-Host " REMOVING SECRETS FROM GIT HISTORY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This script will remove secrets from your git history." -ForegroundColor Yellow
Write-Host "WARNING: This will rewrite your git history!" -ForegroundColor Red
Write-Host ""

$confirm = Read-Host "Do you want to continue? (y/N)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "Operation cancelled." -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "Step 1: Creating backup branch..." -ForegroundColor Green
git branch backup-before-secret-removal
Write-Host "Backup created at: backup-before-secret-removal" -ForegroundColor Green
Write-Host ""

Write-Host "Step 2: Removing secrets from history using git filter-branch..." -ForegroundColor Green
Write-Host "This may take a few minutes..." -ForegroundColor Yellow
Write-Host ""

# Remove the Linear API key from all commits
Write-Host "Removing linear-api-key.txt from history..." -ForegroundColor Yellow
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch linear-api-key.txt" --prune-empty --tag-name-filter cat -- --all

# Remove the batch file with the key from all commits  
Write-Host "Removing start-ticket-queue-with-key.bat from history..." -ForegroundColor Yellow
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch start-ticket-queue-with-key.bat" --prune-empty --tag-name-filter cat -- --all

Write-Host ""
Write-Host "Step 3: Cleaning up filter-branch artifacts..." -ForegroundColor Green
git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive

Write-Host ""
Write-Host "Step 4: Adding back the fixed files..." -ForegroundColor Green
git add linear-api-key.txt
git add start-ticket-queue-with-key.bat
git add src/components/admin/SecuritySettings.tsx
git add .gitignore

git commit -m "fix: Add back files with secrets removed and use environment variables"

Write-Host ""
Write-Host "Step 5: Force pushing to remote..." -ForegroundColor Green
$pushResult = git push --force-with-lease origin main 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host " SUCCESS: Secrets removed from history!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your repository is now clean and can be pushed normally." -ForegroundColor Green
    Write-Host "The backup branch 'backup-before-secret-removal' contains your original history." -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host " ERROR: Push failed" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error details:" -ForegroundColor Red
    Write-Host $pushResult -ForegroundColor Red
    Write-Host ""
    Write-Host "You may need to:" -ForegroundColor Yellow
    Write-Host "1. Check if you have permission to force push" -ForegroundColor White
    Write-Host "2. Contact repository administrators" -ForegroundColor White
    Write-Host "3. Use GitHub's secret scanning unblock URLs" -ForegroundColor White
}

Write-Host ""
Read-Host "Press Enter to continue"
