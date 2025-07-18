#!/usr/bin/env node
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  console.log('🔍 Testing database connection...\n');

  console.log('Environment variables:');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'NOT SET');
  console.log('FORCE_POSTGRES:', process.env.FORCE_POSTGRES);
  console.log('NODE_ENV:', process.env.NODE_ENV);

  // Safety check for production
  const databaseUrl = process.env.DATABASE_URL || '';
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    databaseUrl.includes('supabase') ||
    databaseUrl.includes('neon') ||
    databaseUrl.includes('railway');

  if (isProduction) {
    console.log('\n⚠️  WARNING: Connected to PRODUCTION database!');
    console.log('🔒 This script will perform READ-ONLY operations only.\n');
  } else {
    console.log('\n✅ Connected to LOCAL development database.\n');
  }

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set in environment variables');
    process.exit(1);
  }

  const prisma = new PrismaClient({
    log: ['error', 'warn'],
  });

  try {
    // Test basic connection
    const count = await prisma.researchPaper.count();
    console.log(`✅ Connected successfully!`);
    console.log(`📊 Total ResearchPapers in database: ${count.toLocaleString()}\n`);

    // Get a sample paper
    const samplePaper = await prisma.researchPaper.findFirst({
      take: 1,
    });

    if (samplePaper) {
      console.log('📄 Sample Paper:');
      console.log(`   Title: ${samplePaper.title.substring(0, 80)}...`);
      console.log(`   Journal: ${samplePaper.journal || 'N/A'}`);
      console.log(`   DOI: ${samplePaper.doi || 'N/A'}`);
      console.log(`   System Type: ${samplePaper.systemType || 'N/A'}`);
      console.log(`   Power Output: ${samplePaper.powerOutput || 'N/A'} mW/m²`);
    }

    console.log('\n✅ Database connection test successful!');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute test
testConnection().catch(console.error);
