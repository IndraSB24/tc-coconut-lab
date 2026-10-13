const { spawn } = require('child_process');
const path = require('path');

// Extract arguments: supports "npm run docs:dev 7001", "npm run docs:dev -- 7001", "--port 7001", or PORT=7001
const args = process.argv.slice(2);
let port = process.env.PORT || '7001';

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (/^\d+$/.test(arg)) {
    port = arg;
  } else if ((arg === '--port' || arg === '-p') && args[i + 1]) {
    port = args[i + 1];
    i++;
  }
}

console.log(`\n📚 [Docs-Viewer] Starting Docusaurus on http://localhost:${port} ...\n`);

const docusaurus = spawn('npx', ['docusaurus', 'start', '--port', port], {
  cwd: path.resolve(__dirname, '../docs-viewer'),
  stdio: 'inherit',
  shell: true,
});

docusaurus.on('exit', (code) => {
  process.exit(code || 0);
});
