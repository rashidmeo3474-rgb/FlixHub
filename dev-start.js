#!/usr/bin/env node

/**
 * Development Startup Script
 * This script helps identify and fix common development issues
 */

import { execSync, spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 FlixHub Development Environment Check\n');

// Check if MongoDB is running
try {
  console.log('📦 Checking MongoDB connection...');
  execSync('mongo --version', { stdio: 'ignore' });
  console.log('✅ MongoDB CLI found');
  
  // Try to connect to MongoDB
  try {
    execSync('mongo --eval "db.adminCommand(\'ping\')" mongodb://127.0.0.1:27017/test', { stdio: 'ignore' });
    console.log('✅ MongoDB is running and accessible');
  } catch (error) {
    console.log('⚠️  MongoDB is not running. Please start MongoDB first:');
    console.log('   - Run: mongod');
    console.log('   - Or use MongoDB Compass');
    console.log('   - Or install MongoDB Community Server');
  }
} catch (error) {
  console.log('⚠️  MongoDB not found. Please install MongoDB Community Server');
}

// Check Node.js and npm versions
console.log('\n🔧 Environment Check:');
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
  const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
  console.log(`✅ Node.js: ${nodeVersion}`);
  console.log(`✅ npm: ${npmVersion}`);
} catch (error) {
  console.log('❌ Node.js or npm not found');
}

// Check if server dependencies are installed
const serverPath = path.join(__dirname, 'server');
const clientPath = path.join(__dirname, 'client');

console.log('\n📚 Dependencies Check:');
if (fs.existsSync(path.join(serverPath, 'node_modules'))) {
  console.log('✅ Server dependencies installed');
} else {
  console.log('⚠️  Server dependencies missing. Run: cd server && npm install');
}

if (fs.existsSync(path.join(clientPath, 'node_modules'))) {
  console.log('✅ Client dependencies installed');
} else {
  console.log('⚠️  Client dependencies missing. Run: cd client && npm install');
}

console.log('\n🎯 Quick Start Commands:');
console.log('1. Start MongoDB (if not running): mongod');
console.log('2. Start backend: cd server && npm run dev');
console.log('3. Start frontend: cd client && npm run dev');
console.log('4. Visit: http://localhost:5173');

console.log('\n🔍 Common Issues & Solutions:');
console.log('- Loading delays: Backend not running or MongoDB connection issues');
console.log('- CSS not working: Clear browser cache, check styles.css import in main.jsx');
console.log('- API errors: Verify backend is running on port 5000');
console.log('- CORS errors: Check VITE_API_URL in client/.env');

console.log('\n📋 Environment Files:');
console.log(`Server .env: ${fs.existsSync(path.join(serverPath, '.env')) ? '✅' : '❌'}`);
console.log(`Client .env: ${fs.existsSync(path.join(clientPath, '.env')) ? '✅' : '❌'}`);

console.log('\n🎉 Ready to develop! Check the issues above and start the services.');