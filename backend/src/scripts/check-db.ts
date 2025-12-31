import { config } from 'dotenv';
config();

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://webfaisalbd:R6fVp4V9hV33kYdZ@127.0.0.1:27017/cws?authSource=admin';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'cws';

async function main() {
  try {
    await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB_NAME });
    console.log('Connected to MongoDB\n');
    
    const db = mongoose.connection.db!;
    
    // Check tenants
    const tenants = await db.collection('entities').find({}).toArray();
    console.log('=== All Tenants ===');
    tenants.forEach((t: any) => {
      console.log(`- ${t.subdomain || t.name} (ID: ${t._id})`);
    });
    
    // Check for faisal tenant
    const faisalTenant = tenants.find((t: any) => t.subdomain && t.subdomain.includes('faisal'));
    if (faisalTenant) {
      console.log(`\nFound Faisal tenant: ${(faisalTenant as any).subdomain} (${(faisalTenant as any)._id})`);
    }
    
    // Check existing products
    const products = await db.collection('tenant_data')
      .find({ key: 'products' }).limit(3).toArray();
    
    console.log('\n=== Existing Product Structures ===');
    for (const p of products) {
      console.log(`\nTenant ID: ${(p as any).tenantId}`);
      console.log(`Products count: ${(p as any).data ? (p as any).data.length : 0}`);
      if ((p as any).data && (p as any).data.length > 0) {
        console.log('Sample product (first one):');
        console.log(JSON.stringify((p as any).data[0], null, 2));
        break;
      }
    }
    
    // Check categories
    const categories = await db.collection('tenant_data')
      .find({ key: 'categories' }).limit(1).toArray();
      
    console.log('\n=== Existing Category Structures ===');
    for (const c of categories) {
      console.log(`Tenant ID: ${(c as any).tenantId}`);
      console.log(`Categories count: ${(c as any).data ? (c as any).data.length : 0}`);
      if ((c as any).data && (c as any).data.length > 0) {
        console.log('Sample categories (first 3):');
        console.log(JSON.stringify((c as any).data.slice(0, 3), null, 2));
      }
    }
    
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
