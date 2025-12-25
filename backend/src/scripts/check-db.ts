import { config } from 'dotenv';
config();

import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || '';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'cws';

async function checkAndSeed() {
  console.log('\n🔍 Checking cws database...\n');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db(MONGODB_DB_NAME);
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log('📁 Existing collections in cws:');
    collectionNames.forEach(name => console.log(`   - ${name}`));
    console.log('');
    
    // Check if we have room for new collections
    // Or if users/roles already exist
    const hasUsers = collectionNames.includes('users');
    const hasRoles = collectionNames.includes('roles');
    const hasPermissions = collectionNames.includes('permissions');
    
    console.log('📊 Required collections status:');
    console.log(`   - users: ${hasUsers ? '✅ exists' : '❌ missing'}`);
    console.log(`   - roles: ${hasRoles ? '✅ exists' : '❌ missing'}`);
    console.log(`   - permissions: ${hasPermissions ? '✅ exists' : '❌ missing'}`);
    console.log('');
    
    // Check existing data
    if (hasUsers) {
      const usersCount = await db.collection('users').countDocuments();
      console.log(`   Users count: ${usersCount}`);
      const adminUser = await db.collection('users').findOne({ email: 'admin@admin.com' });
      if (adminUser) {
        console.log(`   ✅ Admin user exists: ${adminUser.email}`);
      }
    }
    
    // We can use the existing collections
    if (!hasUsers || !hasRoles || !hasPermissions) {
      console.log('\n⚠️  Your Atlas cluster has reached the 500 collection limit.');
      console.log('   To add new collections, you need to either:');
      console.log('   1. Upgrade your Atlas tier');
      console.log('   2. Delete unused databases/collections');
      console.log('\n   Databases that could be cleaned up:');
      console.log('   - alhamdayurvedic (35 collections)');
      console.log('   - informixtech (56 collections)');
      console.log('   - logihubmobile (53 collections)');
      console.log('   - etc.\n');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

checkAndSeed();
