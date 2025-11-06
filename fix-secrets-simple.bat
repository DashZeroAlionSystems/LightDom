@echo off
echo ========================================
echo  SIMPLE SECRET REMOVAL FIX
echo ========================================
echo.

echo This is a safer approach that creates a new clean commit
echo without rewriting history.
echo.

echo Step 1: Creating a new branch for the fix...
git checkout -b fix-secrets-clean
echo.

echo Step 2: The files are already fixed, committing them...
git add .
git commit -m "fix: Remove all exposed API keys and use environment variables

- Replace hardcoded Linear API key with environment variable
- Replace hardcoded Stripe API key with environment variable  
- Update .gitignore to prevent future secret exposure
- Add proper error handling for missing environment variables"
echo.

echo Step 3: Pushing the clean branch...
git push origin fix-secrets-clean
echo.

echo Step 4: Instructions for merging...
echo.
echo SUCCESS: Clean branch created and pushed!
echo.
echo Next steps:
echo 1. Go to GitHub and create a Pull Request from 'fix-secrets-clean' to 'main'
echo 2. Review the changes in the PR
echo 3. Merge the PR to update main with the clean version
echo 4. Delete the 'fix-secrets-clean' branch after merging
echo.
echo This approach avoids rewriting history and is safer for shared repositories.
echo.

pause
