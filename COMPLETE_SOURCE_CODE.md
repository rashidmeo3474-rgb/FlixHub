# FlixHub - Complete Source Code Documentation

## 📋 Table of Contents
1. [Client Files](#client-files)
2. [Server Files](#server-files)
3. [Configuration Files](#configuration-files)

---

# CLIENT FILES

## 1. client/src/pages/Home.jsx

```jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useApi from '../hooks/useApi.js';
import { useI18n } from '../context/I18nContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import LoginGateModal from '../components/LoginGateModal.jsx';

export default function Home() {
  const { t }    = useI18n();
  const { user } = useAuth();
  const { data, loading } = useApi('/products');
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth <= 640;
      const tablet = window.innerWidth > 640 && window.innerWidth <= 1024;
      setIsMobile(mobile);
      setIsTablet(tablet);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const HOME_SLUGS = ['netflix', 'prime-video', 'disney', 'apple-tv-1080p', 'netflix-prime', 'hbo-max'];
  const all = data?.products || [];

  const FALLBACK_CARDS = {
    'netflix':        { _id: 'netflix',        slug: 'netflix',        name: 'Netflix',               accent: '#e50914', monthlyPrice: 450,  compareAt: 600,  inStock: 8, logo: '/logos/netflix.jpg'       },
    'prime-video':    { _id: 'prime-video',    slug: 'prime-video',    name: 'Prime Video',           accent: '#00a8e1', monthlyPrice: 350,  compareAt: 500,  inStock: 8, logo: '/logos/prime-video-new.png'   },
    'disney':         { _id: 'disney',         slug: 'disney',         name: 'Disney+',               accent: '#4b6cf7', monthlyPrice: 400,  compareAt: 550,  inStock: 8, logo: null                       },
    'apple-tv-1080p': { _id: 'apple-tv-1080p', slug: 'apple-tv-1080p', name: 'Apple TV+',             accent: '#d8d8d8', monthlyPrice: 1800, compareAt: 2500, inStock: 8, logo: '/logos/apple-tv.png'      },
    'netflix-prime':  { _id: 'netflix-prime',  slug: 'netflix-prime',  name: 'Netflix + Prime Video', accent: '#ff6b00', monthlyPrice: 600,  compareAt: 1000, inStock: 8, logo: '/logos/netflix-prime-home.png' },
    'hbo-max':        { _id: 'hbo-max',        slug: 'hbo-max',        name: 'HBO Max',               accent: '#9b30ff', monthlyPrice: 450,  compareAt: 600,  inStock: 8, logo: '/logos/hbo-max-new.png'       },
  };

  const products = HOME_SLUGS.map(slug => all.find(p => p.slug === slug) || FALLBACK_CARDS[slug]);

  const [gateProduct, setGateProduct] = useState(null);

  const steps = [
    { n: '1', title: t('viewPlan'),  body: t('duration'), icon: '🛒' },
    { n: '2', title: t('pay'),       body: t('paymentMethod'), icon: '💳' },
    { n: '3', title: t('delivered'), body: t('credentials'), icon: '✉' },
  ];

  const handleCardClick = (e, product) => {
    if (!user) {
      e.preventDefault();
      e.stopPropagation();
      setGateProduct(product);
    }
  };

  const getGridColumns = () => {
    if (isMobile) return 1;
    if (isTablet) return 2;
    return 3;
  };

  return (
    <>
      {gateProduct && !user && (
        <LoginGateModal product={gateProduct} onClose={() => setGateProduct(null)} />
      )}

      {/* Hero Section */}
      <section className="hero-section" style={{ position: 'relative', overflow: 'hidden', padding: isMobile ? '60px 0 48px' : isTablet ? '70px 0 56px' : '80px 0 72px' }}>
        {/* Cinema Background Grid */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.15, zIndex: 0 }}>
          <div className="cinema-grid" />
        </div>

        <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: isMobile ? 34 : isTablet ? 44 : 52, fontWeight: 800, marginBottom: 16, textAlign: 'center' }}>
            {t('heroTitle')}
          </h1>
          <p style={{ fontSize: isMobile ? 15 : 17, color: 'var(--muted)', textAlign: 'center', maxWidth: 600, margin: '0 auto 40px' }}>
            {t('heroSubtitle')}
          </p>

          {/* Product Grid */}
          <div className="home-product-grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${getGridColumns()}, 1fr)`, gap: isMobile ? 18 : isTablet ? 20 : 24 }}>
            {products.map((p, i) => (
              <div key={p._id} onClick={(e) => handleCardClick(e, p)}>
                <ProductCard product={p} index={i} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section" style={{ background: 'var(--card)' }}>
        <div className="wrap">
          <h2 style={{ fontSize: isMobile ? 26 : 32, fontWeight: 800, textAlign: 'center', marginBottom: 40 }}>
            {t('howItWorks')}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : `repeat(3, 1fr)`, gap: 24 }}>
            {steps.map((s) => (
              <div key={s.n} className="card" style={{ textAlign: 'center', padding: isMobile ? 24 : 32 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>{s.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--accent)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Step {s.n}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ color: 'var(--muted)', fontSize: 14 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
```

---

## 2. client/src/components/ProductCard.jsx

See WEBSITE_STRUCTURE.md for full ProductCard code with themes, particles, and animations.

---

## 3. client/src/pages/Shop.jsx

Shop page with resolution filters, duration selector, and product listings.

---

# SERVER FILES

## 1. server/src/index.js

```javascript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import orderRoutes from './routes/order.routes.js';
import adminRoutes from './routes/admin.routes.js';
import paymentRoutes from './routes/payment.routes.js';

dotenv.config();
await connectDB();

const app = express();
app.set('trust proxy', 1);

const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://flix-hub-phi.vercel.app',
  'https://flixhub-0len.onrender.com',
]);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }
    callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 40 }));

app.get('/', (req, res) => res.json({ ok: true, message: 'FlixHub API is running' }));
app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`API ready on http://localhost:${port}`));
```

---

## 2. server/src/config/db.js

```javascript
import mongoose from 'mongoose';

export default async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/primevault';
  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB connected:', mongoose.connection.name);
    return true;
  } catch (error) {
    console.warn('⚠️  MongoDB connection failed:', error.message);
    console.warn('🔄 Server continuing with mock data...');
    return false;
  }
}
```

---

## 3. server/src/models/User.js

```javascript
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, trim: true, default: '' },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  phone: { type: String, trim: true, default: '' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  language: { type: String, default: 'en' }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = function(plain) {
  return bcrypt.compare(plain, this.password);
};

export default mongoose.model('User', userSchema);
```

---

## 4. server/src/models/Product.js

```javascript
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  quality: { type: String },
  monthlyPrice: { type: Number, required: true },
  compareAt: { type: Number },
  accent: { type: String, default: '#54d6e8' },
  category: { type: String, enum: ['movies', 'bundle', 'music'], default: 'movies' },
  logo: { type: String },
  inStock: { type: Number, default: 0 },
  description: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
```

---

## 5. server/src/models/Account.js

```javascript
import mongoose from 'mongoose';

const slotSchema = new mongoose.Schema({
  slotNumber: { type: Number, required: true },
  status: { type: String, enum: ['AVAILABLE', 'OCCUPIED', 'EXPIRED'], default: 'AVAILABLE' },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerName: String,
  customerEmail: String,
  customerExpiry: Date,
  assignedAt: Date
});

const accountSchema = new mongoose.Schema({
  service: { type: String, required: true },
  plan: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  purchaseDate: { type: Date, default: Date.now },
  providerExpiry: Date,
  totalSlots: { type: Number, default: 1, min: 1 },
  slots: [slotSchema],
  notes: String
}, { timestamps: true });

accountSchema.pre('save', function(next) {
  if (this.isModified('totalSlots')) {
    const current = this.slots.length;
    if (this.totalSlots > current) {
      const newSlots = Array.from({ length: this.totalSlots - current }, (_, i) => ({
        slotNumber: current + i + 1,
        status: 'AVAILABLE'
      }));
      this.slots.push(...newSlots);
    }
  }
  next();
});

export default mongoose.model('Account', accountSchema);
```

---

## 6. server/src/controllers/authController.js

```javascript
import User from '../models/User.js';
import { asyncHandler } from '../middleware/error.js';
import { signToken, publicUser } from '../utils/token.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  const normalizedEmail = String(email || '').toLowerCase().trim();
  
  if (!normalizedEmail || !password) {
    return res.status(422).json({ message: 'Email and password are required' });
  }
  
  if (await User.exists({ email: normalizedEmail })) {
    return res.status(409).json({ message: 'This email is already registered' });
  }

  const user = await User.create({
    name: String(name || '').trim() || normalizedEmail.split('@')[0],
    email: normalizedEmail,
    password,
    phone: String(phone || '').trim(),
    role: 'user',
  });

  const token = signToken(user._id);
  res.status(201).json({ token, user: publicUser(user) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = String(email || '').toLowerCase().trim();
  
  if (!normalizedEmail || !password) {
    return res.status(422).json({ message: 'Email and password are required' });
  }

  const user = await User.findOne({ email: normalizedEmail }).select('+password');
  
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = signToken(user._id);
  res.json({ token, user: publicUser(user) });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: publicUser(req.user) });
});
```

---

# CONFIGURATION FILES

## 1. client/package.json

```json
{
  "name": "primevault-client",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.30.4",
    "axios": "^1.7.9"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "vite": "^5.4.21"
  }
}
```

---

## 2. server/package.json

```json
{
  "name": "primevault-server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "seed": "node src/seed.js"
  },
  "dependencies": {
    "express": "^4.21.2",
    "mongoose": "^8.9.3",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "helmet": "^8.0.0",
    "morgan": "^1.10.0",
    "express-rate-limit": "^7.5.0",
    "multer": "^1.4.5-lts.1",
    "dotenv": "^16.4.7"
  },
  "devDependencies": {
    "nodemon": "^3.1.9"
  }
}
```

---

## 3. client/vite.config.js

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
```

---

## 4. Environment Variables

### client/.env
```env
VITE_API_URL=http://localhost:5000/api
VITE_WHATSAPP=+923001234567
VITE_SITE_NAME=FlixHub
```

### server/.env
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/primevault
JWT_SECRET=flixhub_super_secret_jwt_key_2026
JWT_EXPIRES=7d
CLIENT_URL=http://localhost:5173
ADMIN_EMAIL=admin@flixhub.pk
ADMIN_PASSWORD=admin123
```

---

**End of Source Code Documentation**
