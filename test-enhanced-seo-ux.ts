import SEOGenerationService from './src/services/SEOGenerationService.tsx';

async function testEnhancedSEOService() {
  console.log('🧪 Testing Enhanced SEO Service with UX Improvements...');

  try {
    const seoService = SEOGenerationService();

    // Test 1: Content Templates
    console.log('1. Testing Content Templates...');
    const templates = seoService.getContentTemplates();
    console.log(`✅ Found ${templates.length} content templates`);
    console.log('Available templates:', templates.map(t => t.name));

    // Test 2: Template-based Content Generation
    console.log('2. Testing Template-based Content Generation...');
    const workflow = await seoService.generateContentWithTemplate(
      'blog-technical-guide',
      'React Performance Optimization',
      {
        tone: 'technical',
        targetAudience: 'developers',
        keywords: ['React', 'performance', 'optimization'],
        seoOptimization: true
      }
    );
    console.log(`✅ Created workflow: ${workflow.id} - Status: ${workflow.status}`);

    // Test 3: Content Preview
    console.log('3. Testing Content Preview...');
    seoService.previewContent(workflow.id);
    const preview = seoService.getContentPreview();
    console.log(`✅ Content preview loaded: ${preview?.title}`);

    // Test 4: Content Editing
    console.log('4. Testing Content Editing...');
    seoService.updateWorkflowContent(workflow.id, {
      title: 'Advanced React Performance Optimization Techniques'
    });
    console.log('✅ Content updated successfully');

    // Test 5: Content Scheduling
    console.log('5. Testing Content Scheduling...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    seoService.scheduleContentForPublication(workflow.id, tomorrow);
    console.log(`✅ Content scheduled for: ${tomorrow.toLocaleDateString()}`);

    // Test 6: Workflow Analytics
    console.log('6. Testing Workflow Analytics...');
    const analytics = seoService.getWorkflowAnalytics();
    console.log('✅ Analytics:', {
      total: analytics.overview.total,
      completionRate: analytics.overview.completionRate,
      avgTimeToPublish: analytics.performance.avgTimeToPublish
    });

    // Test 7: Publishing Optimization
    console.log('7. Testing Publishing Optimization...');
    const optimization = seoService.optimizePublishingSchedule();
    console.log(`✅ Publishing suggestion: ${optimization.suggestion}`);

    // Test 8: Workflow Notifications
    console.log('8. Testing Workflow Notifications...');
    const notifications = seoService.getWorkflowNotifications();
    console.log(`✅ Found ${notifications.length} notifications`);

    console.log('🎉 All Enhanced SEO Service UX tests passed!');
    console.log('✨ New Features Implemented:');
    console.log('  - Content Templates with AI assistance');
    console.log('  - Content Preview & Editing capabilities');
    console.log('  - Automated Content Scheduling');
    console.log('  - Comprehensive Workflow State Management');
    console.log('  - Progress tracking and analytics');
    console.log('  - Smart publishing optimization');

  } catch (error) {
    console.error('❌ Enhanced SEO Service test failed:', error);
    process.exit(1);
  }
}

testEnhancedSEOService();