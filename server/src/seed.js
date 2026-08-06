import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/User.js';
import Product from './models/Product.js';
import Account from './models/Account.js';

dotenv.config();

const PRODUCTS = [
<<<<<<< HEAD
  {
    name: 'Netflix',
    quality: '1080p HD',
    monthlyPrice: 350,
    compareAt: 450,
    accent: '#e50914',
    category: 'movies',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/800px-Netflix_2015_logo.svg.png'
  },
  {
    name: 'Prime Video',
    quality: '4K UHD',
    monthlyPrice: 250,
    compareAt: 300,
    accent: '#00a8e1',
    category: 'movies',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Amazon_Prime_Video_logo.svg/800px-Amazon_Prime_Video_logo.svg.png'
  },
  {
    name: 'Disney+',
    quality: '4K UHD',
    monthlyPrice: 300,
    compareAt: 450,
    accent: '#4b6cf7',
    category: 'movies',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Disney%2B_logo.svg/800px-Disney%2B_logo.svg.png'
  },
  {
    name: 'Apple TV+',
    quality: '8K UHD',
    monthlyPrice: 2600,
    compareAt: 5500,
    accent: '#d8d8d8',
    category: 'movies',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Apple_TV_Plus_Logo.svg/800px-Apple_TV_Plus_Logo.svg.png'
  },
  {
    name: 'HBO Max',
    quality: '4K UHD',
    monthlyPrice: 350,
    compareAt: 1200,
    accent: '#9b59f5',
    category: 'movies',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/HBO_Max_Logo.svg/800px-HBO_Max_Logo.svg.png'
  },
  {
    name: 'Netflix + Prime',
    quality: '4K UHD',
    monthlyPrice: 500,
    compareAt: 1900,
    accent: '#e50914',
    category: 'bundle',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/800px-Netflix_2015_logo.svg.png'
  },
  {
    name: 'Netflix + HBO Max',
    quality: '4K UHD',
    monthlyPrice: 600,
    compareAt: 2200,
    accent: '#c026d3',
    category: 'bundle',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/800px-Netflix_2015_logo.svg.png'
  }
=======
  { name: 'Netflix',         quality: '1080p HD', monthlyPrice: 350,  compareAt: 450,  accent: '#e50914', category: 'movies' },
  { name: 'Prime Video',     quality: '4K UHD',   monthlyPrice: 250,  compareAt: 300,  accent: '#00a8e1', category: 'movies' },
  { name: 'Disney+',         quality: '4K UHD',   monthlyPrice: 300,  compareAt: 450,  accent: '#4b6cf7', category: 'movies' },
  { name: 'Apple TV+',       quality: '4K UHD',   monthlyPrice: 2600, compareAt: 5500, accent: '#d8d8d8', category: 'movies' },
  { name: 'HBO Max',         quality: '4K UHD',   monthlyPrice: 350,  compareAt: 1200, accent: '#7b2ff7', category: 'movies' },
  { name: 'Netflix + Prime', quality: '4K UHD',   monthlyPrice: 500,  compareAt: 1900, accent: '#e50914', category: 'bundle' }
>>>>>>> 178aa0fd1475a77692598040c72d5b4865dcf9f7
];

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const run = async () => {
  await connectDB();

  const email = (process.env.ADMIN_EMAIL || 'admin@primevault.pk').toLowerCase();
  let admin = await User.findOne({ email });
  if (!admin) {
    admin = await User.create({
      name: 'Store Admin', email, role: 'admin',
      password: process.env.ADMIN_PASSWORD || 'admin123'
    });
    console.log('Admin created:', email);
  } else console.log('Admin already exists:', email);

  for (const p of PRODUCTS) {
    const slug = slugify(p.name);
    const product = await Product.findOneAndUpdate(
      { slug }, { ...p, slug }, { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    const available = await Account.countDocuments({ product: product._id, status: 'available' });
    if (available < 8) {
      const docs = Array.from({ length: 8 - available }, (_, i) => ({
        product: product._id,
<<<<<<< HEAD
        login: `${slug}.acct${Date.now().toString(36)}${i}@mailbox.pk`,
=======
        login: \`\${slug}.acct\${Date.now().toString(36)}\${i}@mailbox.pk\`,
>>>>>>> 178aa0fd1475a77692598040c72d5b4865dcf9f7
        password: 'Pv' + Math.random().toString(36).slice(2, 10) + '!',
        profile: 'Profile ' + (i + 1)
      }));
      await Account.insertMany(docs);
<<<<<<< HEAD
      console.log(`Stocked ${docs.length} accounts for ${p.name}`);
=======
      console.log(\`Stocked \${docs.length} accounts for \${p.name}\`);
>>>>>>> 178aa0fd1475a77692598040c72d5b4865dcf9f7
    }
  }

  await mongoose.disconnect();
  console.log('Seed complete.');
};

run().catch((err) => { console.error(err); process.exit(1); });
