import { execSync } from 'child_process';

function run(command) {
  try {
    return execSync(command, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch (err) {
    return err.stderr ? err.stderr.trim() : err.message;
  }
}

console.log('=== Agent Pop-Up Git Sync & Status Check ===');
const branch = run('git branch --show-current');
const remote = run('git remote get-url origin');
const status = run('git status --short');
const lastCommit = run('git log -1 --oneline');

console.log(`Current Branch: ${branch}`);
console.log(`Remote Origin : ${remote}`);
console.log(`Last Commit   : ${lastCommit}`);
console.log('\nWorking Tree Status:');
console.log(status || 'Clean working tree.');

const forbiddenPatterns = ['.env', 'id_rsa', '.pem', 'credentials', 'token'];
const dirtyFiles = status.split('\n').filter(Boolean);
const riskyFiles = dirtyFiles.filter(line => 
  forbiddenPatterns.some(p => line.toLowerCase().includes(p))
);

if (riskyFiles.length > 0) {
  console.error('\n[WARNING] Potential sensitive files detected in status:');
  riskyFiles.forEach(f => console.error('  - ' + f));
  process.exit(1);
} else {
  console.log('\n[PASS] No sensitive files detected.');
}
