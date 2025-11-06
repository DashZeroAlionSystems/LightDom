@echo off
echo ========================================
echo  REMOVING SECRETS FROM GIT HISTORY
echo ========================================
echo.

echo This script will remove secrets from your git history.
echo WARNING: This will rewrite your git history!
echo.

set /p confirm="Do you want to continue? (y/N): "
if /i not "%confirm%"=="y" (
    echo Operation cancelled.
    pause
    exit /b 0
)

echo.
echo Step 1: Creating backup branch...
git branch backup-before-secret-removal
echo Backup created at: backup-before-secret-removal
echo.

echo Step 2: Removing secrets from history using git filter-branch...
echo This may take a few minutes...
echo.

REM Remove the Linear API key from all commits
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch linear-api-key.txt" --prune-empty --tag-name-filter cat -- --all

REM Remove the batch file with the key from all commits  
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch start-ticket-queue-with-key.bat" --prune-empty --tag-name-filter cat -- --all

echo.
echo Step 3: Cleaning up filter-branch artifacts...
git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo.
echo Step 4: Adding back the fixed files...
git add linear-api-key.txt
git add start-ticket-queue-with-key.bat
git add src/components/admin/SecuritySettings.tsx
git add .gitignore

git commit -m "fix: Add back files with secrets removed and use environment variables"

echo.
echo Step 5: Force pushing to remote...
git push --force-with-lease origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo  SUCCESS: Secrets removed from history!
    echo ========================================
    echo.
    echo Your repository is now clean and can be pushed normally.
    echo The backup branch 'backup-before-secret-removal' contains your original history.
) else (
    echo.
    echo ========================================
    echo  ERROR: Push failed
    echo ========================================
    echo.
    echo You may need to:
    echo 1. Check if you have permission to force push
    echo 2. Contact repository administrators
    echo 3. Use GitHub's secret scanning unblock URLs
)

echo.
pause
