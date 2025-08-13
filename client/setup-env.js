const fs = require('fs');
const path = require('path');

const envContent = `# NextAuth Configuration
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=http://localhost:3001

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000
`;

const envPath = path.join(__dirname, '.env.local');

console.log('🚀 Setting up environment variables for DBug Platform...\n');

try {
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env.local already exists. Skipping creation.');
  } else {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env.local file');
  }
  
  console.log('\n📝 Next steps:');
  console.log('1. Edit .env.local and replace the placeholder values:');
  console.log('   - Generate NEXTAUTH_SECRET: openssl rand -base64 32');
  console.log('   - Get GitHub OAuth credentials from: https://github.com/settings/developers');
  console.log('   - Set callback URL to: http://localhost:3001/api/auth/callback/github');
  
  console.log('\n2. Restart your development server');
  console.log('3. Test authentication at: http://localhost:3001/test-auth');
  
} catch (error) {
  console.error('❌ Error creating .env.local:', error.message);
  console.log('\n📝 Manual setup:');
  console.log('Create .env.local file in the client directory with the content above');
}
