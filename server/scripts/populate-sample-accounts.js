import mongoose from 'mongoose';
import Account from '../src/models/Account.js';
import Product from '../src/models/Product.js';
import dotenv from 'dotenv';

dotenv.config();

const SAMPLE_ACCOUNTS = [
  // Netflix accounts
  {
    slug: 'netflix',
    accounts: [
      { login: 'netflix.premium.1@email.com', password: 'SecurePass123!', plan: 'Premium' },
      { login: 'netflix.premium.2@email.com', password: 'SecurePass124!', plan: 'Premium' },
      { login: 'netflix.premium.3@email.com', password: 'SecurePass125!', plan: 'Premium' },
    ]
  },
  // Prime Video accounts
  {
    slug: 'prime-video',
    accounts: [
      { login: 'prime.user.1@email.com', password: 'PrimePass123!', plan: 'Premium' },
      { login: 'prime.user.2@email.com', password: 'PrimePass124!', plan: 'Premium' },
    ]
  },
  // HBO Max accounts
  {
    slug: 'hbo-max',
    accounts: [
      { login: 'hbo.premium.1@email.com', password: 'HBOPass123!', plan: 'Premium' },
      { login: 'hbo.premium.2@email.com', password: 'HBOPass124!', plan: 'Premium' },
    ]
  },
  // Apple TV accounts
  {
    slug: 'apple-tv',
    accounts: [
      { login: 'appletv.user.1@email.com', password: 'ApplePass123!', plan: 'Premium' },
    ]
  },
  // Bundle accounts
  {
    slug: 'netflix-prime',
    accounts: [
      { login: 'bundle.user.1@email.com', password: 'BundlePass123!', plan: 'Premium Bundle' },
      { login: 'bundle.user.2@email.com', password: 'BundlePass124!', plan: 'Premium Bundle' },
    ]
  }
];

async function populateSampleAccounts() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log('Clearing existing sample accounts...');
    await Account.deleteMany({ note: 'Sample account for development' });
    
    for (const service of SAMPLE_ACCOUNTS) {
      console.log(`Processing ${service.slug}...`);
      
      // Find the product by slug
      const product = await Product.findOne({ slug: service.slug });
      if (!product) {
        console.warn(`Product not found for slug: ${service.slug}, skipping...`);
        continue;
      }
      
      // Create accounts for this product
      for (const accountData of service.accounts) {
        const account = new Account({
          product: product._id,
          login: accountData.login,
          password: accountData.password,
          plan: accountData.plan,
          status: 'available',
          accountStatus: 'active',
          purchaseDate: new Date(),
          providerExpiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
          totalSlots: 4, // Most streaming services support 4 profiles
          note: 'Sample account for development'
        });
        
        await account.save();
        console.log(`Created account: ${accountData.login} for ${service.slug}`);
      }
    }
    
    console.log('\n✅ Sample accounts populated successfully!');
    console.log('All products should now show as "In Stock"');
    
  } catch (error) {
    console.error('Error populating sample accounts:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed.');
  }
}

// Run the script
populateSampleAccounts();