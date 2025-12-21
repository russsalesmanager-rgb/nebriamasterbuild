/**
 * Database migration script
 * 
 * This script runs database migrations by syncing Sequelize models
 * with the database schema. In production, use proper migration
 * files with tools like Sequelize CLI.
 */

require('dotenv').config();
const db = require('../config/db');

async function migrate() {
  try {
    console.log('Starting database migration...');
    
    // Sync all models with database
    // alter: true will update existing tables
    // force: true would drop and recreate (dangerous!)
    await db.sync({ alter: true });
    
    console.log('✓ Database migration completed successfully');
    
    await db.close();
    process.exit(0);
  } catch (error) {
    console.error('✗ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
