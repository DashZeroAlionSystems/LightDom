---
description: Automated deployment workflow for design system updates with quality gates and rollback capabilities
auto_execution_mode: 3
---

1. **Quality Gate Check**
   - Run DesignSystemQA component tests
   - Verify TypeScript compilation
   - Check bundle size against thresholds
   - Validate accessibility compliance
   - Confirm visual regression tests pass

2. **Version Management**
   - Determine semantic version bump (patch/minor/major)
   - Update component version numbers
   - Generate changelog from commit messages
   - Tag release in version control

3. **Build Optimization**
   - Run production build with optimizations
   - Analyze bundle composition and tree-shaking
   - Generate source maps for debugging
   - Create compressed assets for CDN

4. **Documentation Generation**
   - Auto-generate component documentation
   - Update design system README with new components
   - Create migration guides for breaking changes
   - Generate TypeScript declaration files

5. **Testing & Validation**
   - Run integration tests across supported browsers
   - Perform cross-platform compatibility testing
   - Validate component interactions and state management
   - Test accessibility with automated tools

6. **Deployment Preparation**
   - Create deployment package with all assets
   - Generate deployment manifest with checksums
   - Prepare rollback artifacts and procedures
   - Notify stakeholders of upcoming deployment

7. **Staged Rollout**
   - Deploy to staging environment first
   - Run smoke tests and integration validation
   - Monitor error rates and performance metrics
   - Gradual rollout to production with feature flags

8. **Post-Deployment Monitoring**
   - Monitor application performance and error rates
   - Track component usage and adoption metrics
   - Collect user feedback and issue reports
   - Prepare hotfix procedures if needed

9. **Feedback Integration**
   - Analyze deployment metrics and user feedback
   - Identify areas for improvement and optimization
   - Update component designs based on usage patterns
   - Plan next iteration of design system enhancements

10. **Knowledge Update**
    - Document deployment lessons learned
    - Update operational runbooks and procedures
    - Create memory entries for significant deployment events
    - Share insights with development team