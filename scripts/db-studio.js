#!/usr/bin/env node

const { spawn } = require('node:child_process');

console.log('Drizzle Studio setup for Expo SQLite');
console.log('1) Launch app on iOS/Android (web is not supported).');
console.log('2) In Expo terminal, press Shift + M.');
console.log('3) Select "expo-drizzle-studio-plugin".');
console.log('');

if (process.argv.includes('--no-start')) {
  process.exit(0);
}

const expoCli = require.resolve('expo/bin/cli');
const child = spawn(process.execPath, [expoCli, 'start'], {
  stdio: 'inherit',
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
