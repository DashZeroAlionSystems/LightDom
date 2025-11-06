@echo off
echo Fixing git repository secrets...

REM Stage the fixed files
git add linear-api-key.txt
git add start-ticket-queue-with-key.bat
git add src/components/admin/SecuritySettings.tsx
git add .gitignore

REM Commit the changes
git commit -m "fix: Remove exposed API keys and use environment variables

- Replace hardcoded Linear API key with environment variable
- Replace hardcoded Stripe API key with environment variable  
- Update .gitignore to prevent future secret exposure
- Add proper error handling for missing environment variables"

REM Try to push
echo Attempting to push to remote...
git push origin main

if %errorlevel% neq 0 (
    echo.
    echo Push failed. You may need to:
    echo 1. Check if there are still secrets in the commit history
    echo 2. Use git rebase to remove secrets from previous commits
    echo 3. Contact GitHub support if the issue persists
) else (
    echo.
    echo Successfully pushed to remote!
)

pause
