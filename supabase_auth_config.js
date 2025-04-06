// Run this script after your site is deployed to configure Supabase auth settings
// Install the Supabase CLI using: npm install -g supabase

const { execSync } = require('child_process');

const SITE_URL = 'https://crypto-intel-platform.windsurf.build';
const PROJECT_ID = 'jraqpyndhlkusevqmspy'; // Your Supabase project ID

try {
  console.log(`Configuring Supabase auth settings for ${SITE_URL}...`);
  
  // Set Site URL
  execSync(`supabase config set auth.site_url=${SITE_URL} --project-ref=${PROJECT_ID}`);
  
  // Add redirect URLs
  execSync(`supabase config set auth.additional_redirect_urls=${SITE_URL}/auth/callback --project-ref=${PROJECT_ID}`);
  
  // Configure CORS for your deployment site
  execSync(`supabase config set auth.cors_domains=${SITE_URL} --project-ref=${PROJECT_ID}`);

  console.log(`CORS configured for deployment URL: ${SITE_URL}`);
  
  console.log('Supabase auth configuration completed!');
} catch (error) {
  console.error('Error configuring Supabase auth settings:', error);
  console.log('\nManual configuration steps:');
  console.log('1. Go to https://app.supabase.com and select your project');
  console.log('2. Navigate to Authentication → URL Configuration');
  console.log(`3. Set Site URL to: ${SITE_URL}`);
  console.log(`4. Add Redirect URL: ${SITE_URL}/auth/callback`);
  console.log('5. Navigate to API → CORS');
  console.log(`6. Add ${SITE_URL} to your allowed origins`);
}
