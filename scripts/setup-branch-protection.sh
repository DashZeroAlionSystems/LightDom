#!/bin/bash

# Setup Branch Protection Rules for LightDom Repository
# This script configures branch protection rules for the main branch

set -e

echo "🔒 Setting up branch protection rules for LightDom repository..."

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed. Please install it first."
    echo "   Visit: https://cli.github.com/"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub CLI. Please run 'gh auth login' first."
    exit 1
fi

# Get repository information
REPO=$(gh repo view --json nameWithOwner --jq '.nameWithOwner')
echo "📁 Repository: $REPO"

# Set up branch protection rules for main branch
echo "🔧 Configuring branch protection rules for 'main' branch..."

# Create branch protection rule
gh api repos/$REPO/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["pre-commit-gates","pre-merge-gates"]}' \
  --field enforce_admins=false \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true,"require_code_owner_reviews":true}' \
  --field restrictions='{"users":[],"teams":[],"apps":[]}' \
  --field allow_force_pushes=false \
  --field allow_deletions=false \
  --field required_linear_history=false \
  --field allow_squash_merge=true \
  --field allow_merge_commit=true \
  --field allow_rebase_merge=true \
  --field allow_auto_merge=true \
  --field delete_branch_on_merge=true

echo "✅ Branch protection rules configured successfully!"

# Display the configured rules
echo ""
echo "📋 Configured branch protection rules:"
echo "  • Require pull request reviews before merging (1 reviewer)"
echo "  • Dismiss stale reviews when new commits are pushed"
echo "  • Require review from code owners"
echo "  • Require status checks to pass before merging"
echo "  • Require branches to be up to date before merging"
echo "  • Required status checks: pre-commit-gates, pre-merge-gates"
echo "  • Allow force pushes: ❌"
echo "  • Allow deletions: ❌"
echo "  • Allow auto-merge: ✅"
echo "  • Delete branch on merge: ✅"

echo ""
echo "🎉 Branch protection setup complete!"
echo ""
echo "Next steps:"
echo "  1. Create a feature branch: git checkout -b feature/your-feature-name"
echo "  2. Make your changes and commit them"
echo "  3. Push the branch: git push origin feature/your-feature-name"
echo "  4. Create a pull request targeting main"
echo "  5. Request a review from a code owner"
echo "  6. Once approved and CI passes, the PR will auto-merge!"
echo ""
echo "For more information, see: GIT_AUTOMATION_README.md"