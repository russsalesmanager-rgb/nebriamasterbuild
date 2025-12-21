/**
 * Database seeding script
 * 
 * This script creates initial data including:
 * - Roles (if not exists)
 * - Owner user account
 * - Admin user account
 */

require('dotenv').config();
const bcrypt = require('bcrypt');
const models = require('../models');

async function seed() {
  try {
    console.log('Starting database seeding...');
    
    // Ensure roles exist
    const roles = [
      { id: 1, name: 'OWNER', description: 'Platform owner with absolute control' },
      { id: 2, name: 'ADMIN', description: 'Administrator with broad privileges' },
      { id: 3, name: 'MODERATOR', description: 'Moderator who can manage content and users' },
      { id: 4, name: 'VERIFIED_CREATOR', description: 'Verified content creator' },
      { id: 5, name: 'USER', description: 'Standard user' }
    ];
    
    for (const role of roles) {
      await models.Role.findOrCreate({
        where: { id: role.id },
        defaults: role
      });
    }
    console.log('✓ Roles seeded');
    
    // Create owner account
    const ownerEmail = process.env.OWNER_EMAIL || 'owner@nebria.com';
    const ownerUsername = process.env.OWNER_USERNAME || 'owner';
    const ownerPassword = process.env.OWNER_PASSWORD || 'ChangeThisPassword123!';
    
    const [owner, ownerCreated] = await models.User.findOrCreate({
      where: { email: ownerEmail },
      defaults: {
        username: ownerUsername,
        email: ownerEmail,
        passwordHash: ownerPassword, // Will be hashed by model hook
        roleId: 1, // OWNER
        isVerified: true,
        bio: 'Platform Owner'
      }
    });
    
    if (ownerCreated) {
      console.log(`✓ Owner account created: ${ownerUsername} (${ownerEmail})`);
      console.log(`  Password: ${ownerPassword}`);
      console.log('  ⚠️  CHANGE THIS PASSWORD IN PRODUCTION!');
    } else {
      console.log(`✓ Owner account already exists: ${ownerUsername}`);
    }
    
    // Create admin account
    const adminEmail = 'admin@nebria.com';
    const adminUsername = 'admin';
    const adminPassword = 'AdminPassword123!';
    
    const [admin, adminCreated] = await models.User.findOrCreate({
      where: { email: adminEmail },
      defaults: {
        username: adminUsername,
        email: adminEmail,
        passwordHash: adminPassword, // Will be hashed by model hook
        roleId: 2, // ADMIN
        isVerified: true,
        bio: 'Platform Administrator'
      }
    });
    
    if (adminCreated) {
      console.log(`✓ Admin account created: ${adminUsername} (${adminEmail})`);
      console.log(`  Password: ${adminPassword}`);
      console.log('  ⚠️  CHANGE THIS PASSWORD IN PRODUCTION!');
    } else {
      console.log(`✓ Admin account already exists: ${adminUsername}`);
    }
    
    console.log('\n✓ Database seeding completed successfully');
    console.log('\nDefault Accounts:');
    console.log('─────────────────────────────────────────');
    console.log(`Owner: ${ownerEmail} / ${ownerPassword}`);
    console.log(`Admin: ${adminEmail} / ${adminPassword}`);
    console.log('─────────────────────────────────────────\n');
    
    process.exit(0);
  } catch (error) {
    console.error('✗ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
