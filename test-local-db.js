#!/usr/bin/env node

// Test script to verify local database connection
const { PrismaClient } = require('@prisma/client');

// Load environment from .env.local explicitly
require('dotenv').config({ path: '.env.local' });

async function testLocalDb() {
  console.log('🔍 Testing local database connection...\n');

  console.log('Environment:');
  console.log(
    'DATABASE_URL:',
    process.env.DATABASE_URL?.includes('localhost') ? 'localhost (local)' : 'remote'
  );
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log();

  const prisma = new PrismaClient();

  try {
    const count = await prisma.researchPaper.count();
    console.log(`📊 Total papers in database: ${count}`);

    if (count === 1000) {
      console.log('✅ You are using the LOCAL database (1,000 papers)');
    } else if (count === 3723) {
      console.log('⚠️  You are using the PRODUCTION database (3,723 papers)');
      console.log('   Next.js may not be loading .env.local properly');
    } else {
      console.log(`📌 Database has ${count} papers`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testLocalDb();
