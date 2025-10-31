#!/usr/bin/env node

/**
 * Cross-platform dev server runner
 * Starts both Vite frontend and Express backend servers simultaneously
 * Works on Windows, macOS, and Linux
 * 
 * This fixes the Windows path issue with spaces in the directory name
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isWindows = process.platform === 'win32';

console.log('🚀 Starting Prayer Times Development Servers...\n');

// Start Vite frontend using Node directly to avoid bin path issues
console.log('📦 Frontend Server: Vite (http://localhost:5173)\n');
const vitePath = path.join(__dirname, 'node_modules', 'vite', 'bin', 'vite.js');
const frontend = spawn('node', [vitePath], {
  stdio: 'inherit',
  cwd: __dirname,
  env: { ...process.env, NODE_ENV: 'development' }
});

// Wait 3 seconds for frontend to start, then start backend
setTimeout(() => {
  console.log('\n🔐 Backend API Server (http://localhost:3001)\n');
  const backendArgs = ['--loader', 'ts-node/esm', path.join(__dirname, 'api', 'gemini.ts')];
  const backend = spawn('node', backendArgs, {
    stdio: 'inherit',
    cwd: __dirname,
    env: { ...process.env, NODE_ENV: 'development' }
  });

  backend.on('error', (err) => {
    console.error('Backend server error:', err);
    process.exit(1);
  });

  backend.on('exit', (code) => {
    console.log(`\n❌ Backend server exited with code ${code}`);
    process.exit(code);
  });
}, 3000);

frontend.on('error', (err) => {
  console.error('Frontend server error:', err);
  process.exit(1);
});

frontend.on('exit', (code) => {
  console.log(`\n❌ Frontend server exited with code ${code}`);
  process.exit(code);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down servers...');
  frontend.kill('SIGTERM');
  setTimeout(() => process.exit(0), 1000);
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Shutting down servers...');
  frontend.kill('SIGTERM');
  setTimeout(() => process.exit(0), 1000);
});
