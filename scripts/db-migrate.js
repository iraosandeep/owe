#!/usr/bin/env node

console.log('Expo SQLite migration flow');
console.log('1) Generate SQL files: pnpm db:generate');
console.log('2) Start app on iOS/Android: pnpm start (or pnpm ios / pnpm android)');
console.log('3) Migrations are applied in-app with useMigrations().');
console.log('');
console.log('Note: drizzle-kit migrate is not supported with driver "expo".');
