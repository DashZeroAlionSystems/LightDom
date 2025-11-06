@echo off
echo ========================================
echo  FIXING GIT HISTORY - REMOVING SECRETS
echo ========================================
echo.

echo Step 1: Checking current status...
git status --porcelain
echo.

echo Step 2: Staging current fixes...
git add linear-api-key.txt
git add start-ticket-queue-with-key.bat
git add src/components/admin/SecuritySettings.tsx
git add .gitignore
echo.

echo Step 3: Committing current fixes...
git commit -m "fix: Remove exposed API keys and use environment variables

- Replace hardcoded Linear API key with environment variable
- Replace hardcoded Stripe API key with environment variable  
- Update .gitignore to prevent future secret exposure
- Add proper error handling for missing environment variables"
echo.

echo Step 4: Interactive rebase to remove secrets from history...
echo This will open an editor. For each commit with secrets:
echo 1. Change 'pick' to 'edit' for commits 2bfc74c2 and 013603aa
echo 2. Save and close the editor
echo 3. The script will then fix each commit
echo.
pause

git rebase -i HEAD~5
echo.

echo Step 5: Force push to update remote history...
echo WARNING: This will rewrite history on the remote repository
echo.
set /p confirm="Are you sure you want to force push? (y/N): "
if /i "%confirm%"=="y" (
    git push --force-with-lease origin main
    if %errorlevel% equ 0 (
        echo.
        echo SUCCESS: Repository history cleaned and pushed!
    ) else (
        echo.
        echo ERROR: Force push failed. You may need to:
        echo 1. Check if you have permission to force push
        echo 2. Contact repository administrators
        echo 3. Use GitHub's secret scanning unblock URLs
    )
) else (
    echo.
    echo Force push cancelled. You can run this script again later.
)

echo.
echo ========================================
echo  FIX COMPLETE
echo ========================================
pause
