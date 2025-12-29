import { execSync } from 'child_process';

console.log('🚀 Starting Verification Loop...\n');

try {
  console.log('1️⃣  Running Legacy & Component Tests...');
  execSync('npx vitest --run', { stdio: 'inherit' });
  console.log('✅ Legacy Tests Passed\n');

  console.log('2️⃣  Running Targeted Offline Checks with Coverage...');
  execSync('npx vitest --run src/components/client/SignupWizard.offline.test.jsx AkaTech_Components/ui/FloatingAssistant.offline.test.jsx --coverage', { stdio: 'inherit' });
  console.log('✅ Offline Checks Passed\n');

  console.log('🎉 Verification Complete! All systems nominal.');
} catch (error) {
  console.error('\n❌ Verification Failed!');
  process.exit(1);
}
