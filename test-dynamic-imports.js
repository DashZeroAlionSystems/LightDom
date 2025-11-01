console.log('Testing dynamic imports...');

try {
  console.log('Importing seo-analysis.js...');
  const seoModule = await import('./src/api/seo-analysis.js');
  console.log('✅ SEO analysis module imported successfully');

  console.log('Importing seo-training.js...');
  const trainingModule = await import('./src/api/seo-training.js');
  console.log('✅ SEO training module imported successfully');

  console.log('Importing seo-model-training.js...');
  const modelModule = await import('./src/api/seo-model-training.js');
  console.log('✅ SEO model training module imported successfully');

  console.log('🎉 All dynamic imports working!');
} catch (error) {
  console.error('❌ Dynamic import error:', error);
  console.error('Stack:', error.stack);
}