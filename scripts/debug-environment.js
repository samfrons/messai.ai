#!/usr/bin/env node

// Load environment variables
require('dotenv').config();

console.log('🔍 Environment Debug Information');
console.log('================================\n');

console.log('📍 Current Working Directory:', process.cwd());
console.log('📝 Node.js Version:', process.version);
console.log('🌍 NODE_ENV:', process.env.NODE_ENV || 'undefined');
console.log('🗃️ DATABASE_PROVIDER:', process.env.DATABASE_PROVIDER || 'undefined');
console.log('🔧 FORCE_POSTGRES:', process.env.FORCE_POSTGRES || 'undefined');

// Check DATABASE_URL
const dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
  console.log('✅ DATABASE_URL loaded successfully');
  console.log('📊 DATABASE_URL (partial):', dbUrl.substring(0, 30) + '...');

  // Validate URL format
  if (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://')) {
    console.log('✅ DATABASE_URL format is valid for PostgreSQL');
  } else if (dbUrl.startsWith('file:')) {
    console.log('✅ DATABASE_URL format is valid for SQLite');
  } else {
    console.log('❌ DATABASE_URL format is invalid');
    console.log('   Expected: postgresql:// or postgres:// or file:');
  }
} else {
  console.log('❌ DATABASE_URL not found');
}

// Check DIRECT_URL
const directUrl = process.env.DIRECT_URL;
if (directUrl) {
  console.log('✅ DIRECT_URL loaded successfully');
  console.log('📊 DIRECT_URL (partial):', directUrl.substring(0, 30) + '...');
} else {
  console.log('⚠️ DIRECT_URL not found (optional for some setups)');
}

// Check NEXTAUTH_SECRET
const nextAuthSecret = process.env.NEXTAUTH_SECRET;
if (nextAuthSecret) {
  console.log('✅ NEXTAUTH_SECRET loaded successfully');
} else {
  console.log('❌ NEXTAUTH_SECRET not found');
}

// Check NEXTAUTH_URL
const nextAuthUrl = process.env.NEXTAUTH_URL;
if (nextAuthUrl) {
  console.log('✅ NEXTAUTH_URL loaded successfully:', nextAuthUrl);
} else {
  console.log('❌ NEXTAUTH_URL not found');
}

console.log('\n🧪 Testing Prisma Client Creation...');

try {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  console.log('✅ Prisma client created successfully');

  // Try to get the database URL that Prisma will use
  console.log(
    '📊 Prisma will use database URL format:',
    dbUrl?.startsWith('postgres') ? 'PostgreSQL' : dbUrl?.startsWith('file:') ? 'SQLite' : 'Unknown'
  );

  prisma.$disconnect();
} catch (error) {
  console.log('❌ Prisma client creation failed:');
  console.log('   Error:', error.message);
}

console.log('\n📋 Environment File Check...');

const fs = require('fs');
const path = require('path');

const envFiles = ['.env', '.env.local', '.env.development', '.env.production'];
const rootDir = process.cwd();

envFiles.forEach((envFile) => {
  const filePath = path.join(rootDir, envFile);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${envFile} exists`);
  } else {
    console.log(`❌ ${envFile} not found`);
  }
});

console.log('\n💡 Troubleshooting Tips:');
console.log('1. For Next.js API routes: Environment variables are auto-loaded');
console.log('2. For standalone scripts: Use "node -r dotenv/config script.js"');
console.log('3. For npm scripts: Use "dotenv -e .env -- command"');
console.log('4. Ensure .env file is in project root directory');
console.log('5. Check that DATABASE_URL starts with "postgresql://" or "postgres://"');
