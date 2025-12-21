/*
 * Database Seed Script
 * 
 * Seeds the database with initial roles and an owner account.
 */

require('dotenv').config();

const models = require('./src/models');
const bcrypt = require('bcrypt');

async function seed() {
  try {
    console.log('Connecting to database...');
    await models.sequelize.sync();
    console.log('Database connected');
    
    // Check if roles exist
    const roleCount = await models.Role.count();
    
    if (roleCount === 0) {
      console.log('Seeding roles...');
      await models.Role.bulkCreate([
        { id: 1, name: 'OWNER', description: 'Platform owner with full control' },
        { id: 2, name: 'ADMIN', description: 'Administrator with management privileges' },
        { id: 3, name: 'MODERATOR', description: 'Content moderator' },
        { id: 4, name: 'VERIFIED_CREATOR', description: 'Verified content creator' },
        { id: 5, name: 'USER', description: 'Standard user' }
      ]);
      console.log('✓ Roles created');
    } else {
      console.log('✓ Roles already exist');
    }
    
    // Check if owner exists
    const ownerExists = await models.User.findOne({
      where: { roleId: 1 }
    });
    
    if (!ownerExists) {
      console.log('Creating owner account...');
      
      // Use environment variables or defaults
      const ownerEmail = process.env.OWNER_EMAIL || 'owner@nebria.local';
      const ownerPassword = process.env.OWNER_PASSWORD || 'SecurePassword123!';
      const ownerUsername = process.env.OWNER_USERNAME || 'owner';
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(ownerPassword, salt);
      
      const owner = await models.User.create({
        username: ownerUsername,
        email: ownerEmail,
        passwordHash: passwordHash,
        roleId: 1,
        isVerified: true
      });
      
      console.log('✓ Owner account created');
      console.log(`  Email: ${ownerEmail}`);
      console.log(`  Username: ${ownerUsername}`);
      console.log(`  Password: ${ownerPassword}`);
      console.log(`  ⚠️  CHANGE THE PASSWORD AFTER FIRST LOGIN!`);
      
      // Create wallet for owner
      await models.Wallet.create({
        userId: owner.id,
        balance: 1000000 // Give owner 1M tokens to start
      });
      console.log('✓ Owner wallet created with 1,000,000 $FREEDOM tokens');
    } else {
      console.log('✓ Owner account already exists');
    }
    
    console.log('\n✅ Database seeding completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run seed
seed();
