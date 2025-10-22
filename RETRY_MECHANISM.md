# GitHub Actions Retry Mechanism

## Overview

All GitHub Actions workflows in this repository now include automatic retry capabilities to handle transient failures gracefully. This ensures that temporary issues like network glitches, race conditions, or momentary service unavailability don't cause the entire workflow to fail.

## Implementation

We use the [`nick-fields/retry-action@v3`](https://github.com/nick-fields/retry-action) GitHub Action to wrap critical steps that may fail due to transient issues.

## Retry Configuration

Different types of tasks have different retry configurations optimized for their characteristics:

### Dependency Installation
- **Max Attempts**: 3
- **Retry Wait**: 30 seconds
- **Timeout**: 10 minutes
- **Rationale**: Network issues during package downloads are common and usually resolve quickly.

### Tests (Unit, Integration, E2E, Performance, API)
- **Max Attempts**: 3
- **Retry Wait**: 30 seconds
- **Timeout**: 15-20 minutes
- **Rationale**: Tests may fail due to timing issues or resource contention. Multiple attempts help ensure stability.

### Service Health Checks
- **Max Attempts**: 5
- **Retry Wait**: 10 seconds
- **Timeout**: 5 minutes
- **Rationale**: Services (PostgreSQL, Anvil blockchain node) need time to start. More frequent retries with shorter delays work best.

### Build Operations
- **Max Attempts**: 3
- **Retry Wait**: 30 seconds
- **Timeout**: 10-15 minutes
- **Rationale**: Builds may occasionally fail due to resource contention or temporary file system issues.

### Linting and Formatting Checks
- **Max Attempts**: 2
- **Retry Wait**: 10 seconds
- **Timeout**: 5 minutes
- **Rationale**: These rarely fail due to transient issues, so fewer retries are needed.

### Long-Running Tasks (Autopilot)
- **Max Attempts**: 2
- **Retry Wait**: 60 seconds
- **Timeout**: 60 minutes
- **Rationale**: These are complex operations that may occasionally fail. Longer wait times allow the system to recover.

## Affected Workflows

### 1. Test Suite (`test.yml`)
All test jobs now include retry logic:
- test-smart-contracts
- test-api
- test-frontend
- test-integration
- test-performance
- test-coverage

### 2. CI/CD Pipeline (`ci-cd.yml`)
All quality gate and deployment jobs include retry logic:
- pre-commit-gates
- pre-merge-gates
- pre-deployment-gates

### 3. Agent Automation (`agent-automation.yml`)
Automation tasks include retry logic:
- agent-evaluation
- compliance-check
- autopilot-execution
- execute-workflow
- verify-results

## Benefits

1. **Increased Reliability**: Workflows are more resilient to transient failures
2. **Reduced False Negatives**: Legitimate issues are separated from temporary glitches
3. **Time Savings**: No need to manually re-run failed workflows for transient issues
4. **Better Resource Utilization**: Automatic retries prevent wasted CI/CD minutes

## Monitoring

Each retry attempt is logged in the GitHub Actions console, showing:
- Number of attempts made
- Reason for retry (if the previous attempt failed)
- Total time spent on retries

## Limitations

- Retries won't fix persistent issues (e.g., actual bugs in code or tests)
- Each retry consumes GitHub Actions minutes
- Maximum timeout per step is still enforced

## Future Improvements

Potential enhancements to consider:
- Exponential backoff for retry delays
- Conditional retry based on error type
- Slack/email notifications for repeated failures
- Metrics collection on retry frequency to identify problematic steps

## Troubleshooting

If a step fails even after all retry attempts:
1. Check the logs to understand the root cause
2. Verify it's not a persistent issue that needs code changes
3. Consider increasing retry attempts or timeout if the issue is environmental
4. Check service health (external APIs, databases, etc.)

## Related Documentation

- [GitHub Actions Best Practices](https://docs.github.com/en/actions/learn-github-actions/best-practices-for-github-actions)
- [Retry Action Documentation](https://github.com/nick-fields/retry-action)
- [Workflow Automation Guide](./WORKFLOW_AUTOMATION.md)
