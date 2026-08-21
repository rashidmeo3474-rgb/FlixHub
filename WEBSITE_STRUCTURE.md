# FlixHub - Complete Website Structure & Documentation

## 📁 Project Structure

```
Premium subscriptions Netflix/
├── client/                          # Frontend (React + Vite)
│   ├── public/
│   │   ├── logos/                  # Service logos
│   │   │   ├── netflix.png
│   │   │   ├── netflix.jpg
│   │   │   ├── prime-video-new.png
│   │   │   ├── apple-tv.png
│   │   │   ├── disney-simple.svg
│   │   │   ├── hbo-max-new.png
│   │   │   ├── netflix-prime-home.png
│   │   │   ├── easypaisa.png
│   │   │   ├── jazzcash.png
│   │   │   ├── nayapay.png
│   │   │   ├── mcb.png
│   │   │   ├── ubl.jpg
│   │   │   └── visa.jpg
│   │   └── scenes/                 # Background images (152 files)
│   │       ├── f01.jpg - f29.png
│   │       ├── n01.jpg - n50.jpg
│   │       └── ... (more scene images)
│   │
│   ├── src/
│   │   ├── admin/                  # Admin Panel Components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── OrdersManager.jsx
│   │   │   ├── ProductsManager.jsx
│   │   │   ├── StockManager.jsx
│   │   │   ├── UsersManager.jsx
│   │   │   ├── PaymentProofs.jsx
│   │   │   ├── PaymentSettings.jsx
│   │   │   ├── ActivityLog.jsx
│   │   │   └── SubscriptionInventory.jsx
│   │   │
│   │   ├── components/             # Reusable Components
│   │   │   ├── ProductCard.jsx     # Product card with animations
│   │   │   ├── StoreLayout.jsx     # Main layout with navbar
│   │   │   └── LoginGateModal.jsx  # Login prompt modal
│   │   │
│   │   ├── context/                # React Context
│   │   │   ├── AuthContext.jsx     # Authentication state
│   │   │   └── I18nContext.jsx     # Internationalization
│   │   │
│   │   ├── hooks/                  # Custom Hooks
│   │   │   └── useApi.js           # API fetching hook
│   │   │
│   │   ├── pages/                  # Page Components
│   │   │   ├── Home.jsx            # Homepage with 6 products
│   │   │   ├── Shop.jsx            # Shop with filters
│   │   │   ├── ProductDetail.jsx   # Single product view
│   │   │   ├── Checkout.jsx        # Checkout flow
│   │   │   ├── Login.jsx           # Login page
│   │   │   ├── Register.jsx        # Registration page
│   │   │   ├── Orders.jsx          # User orders
│   │   │   ├── UserDashboard.jsx   # User dashboard
│   │   │   ├── Success.jsx         # Success page
│   │   │   └── Contact.jsx         # Contact page
│   │   │
│   │   ├── utils/                  # Utility Functions
│   │   │   └── format.js           # Formatting helpers
│   │   │
│   │   ├── api/                    # API Client
│   │   │   └── client.js           # Axios instance
│   │   │
│   │   ├── App.jsx                 # Main App component
│   │   ├── main.jsx                # Entry point
│   │   └── styles.css              # Global styles (32KB)
│   │
│   ├── index.html                  # HTML template
│   ├── vite.config.js              # Vite configuration
│   ├── package.json                # Frontend dependencies
│   └── .env                        # Environment variables
│
├── server/                         # Backend (Node.js + Express)
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              # MongoDB connection
│   │   │
│   │   ├── controllers/           # Route Controllers
│   │   │   ├── authController.js  # Auth logic
│   │   │   ├── productController.js
│   │   │   ├── orderController.js
│   │   │   ├── adminController.js
│   │   │   └── paymentController.js
│   │   │
│   │   ├── models/                # Mongoose Models
│   │   │   ├── User.js
│   │   │   ├── Product.js
│   │   │   ├── Order.js
│   │   │   ├── Account.js         # Subscription inventory
│   │   │   └── PaymentProof.js
│   │   │
│   │   ├── routes/                # API Routes
│   │   │   ├── auth.routes.js
│   │   │   ├── product.routes.js
│   │   │   ├── order.routes.js
│   │   │   ├── admin.routes.js
│   │   │   ├── payment.routes.js
│   │   │   ├── subscription.routes.js
│   │   │   └── support.routes.js
│   │   │
│   │   ├── middleware/            # Middleware
│   │   │   ├── auth.js            # JWT verification
│   │   │   └── error.js           # Error handling
│   │   │
│   │   ├── utils/                 # Utilities
│   │   │   └── token.js           # JWT helpers
│   │   │
│   │   ├── index.js               # Express server
│   │   └── seed.js                # Database seeding
│   │
│   ├── package.json               # Backend dependencies
│   └── .env                       # Server environment variables
│
├── uploads/                       # Uploaded files
└── .gitignore                     # Git ignore rules
```

---

## 🎨 Key Features

### **Frontend Features:**
1. **Home Page** - 6 premium products with cinematic animations
2. **Shop Page** - Filter by resolution (480p, 720p, 1080p, 4K, 8K, Bundles)
3. **Product Cards** - Themed particles, spinning neon borders, hover effects
4. **Responsive Design** - Mobile, tablet, desktop optimized
5. **Authentication** - Login, register, JWT-based auth
6. **Admin Panel** - Full inventory management system
7. **Subscription Inventory** - Account management with slot assignment

### **Backend Features:**
1. **RESTful API** - Express.js
2. **MongoDB Database** - User, Product, Order, Account models
3. **JWT Authentication** - Secure token-based auth
4. **CORS & Security** - Helmet, rate limiting
5. **File Uploads** - Multer for payment proofs
6. **Admin Routes** - Protected admin endpoints

---

## 🔑 Environment Variables

### **Client (.env)**
```env
VITE_API_URL=http://localhost:5000/api
VITE_WHATSAPP=+923001234567
VITE_SITE_NAME=FlixHub
```

### **Server (.env)**
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

## 📦 Products Configuration

### **Home Page Products (6 items):**
1. **Netflix** - Red (#e50914), ★ particle, Action·Drama
2. **Prime Video** - Blue (#00a8e1), ⬡ particle, Adventure·Sci-Fi
3. **Disney+** - Purple (#4b6cf7), ✦ particle, Fantasy·Family
4. **Apple TV+** - Gray (#d8d8d8), ◆ particle, Premium·Thriller
5. **Netflix + Prime** - Orange (#ff6b00), ⬟ particle, Best Bundle
6. **HBO Max** - Purple (#9b30ff), ✧ particle, Dark·History

### **Quality Badges:**
- **480p SD** - Blue (#a0b9e6)
- **720p HD** - Cyan (#00F0FF)
- **1080p HD** - Green (#00FF87)
- **4K UHD** - Purple (#C084FF)
- **8K UHD** - Gold (#FFD600)

---

## 🛠️ Installation & Setup

### **Prerequisites:**
- Node.js v18+
- MongoDB installed
- Git

### **Installation:**
```bash
# Clone repository
git clone https://github.com/rashidmeo3474-rgb/FlixHub.git
cd "Premium subscriptions Netflix"

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install

# Start MongoDB (as Administrator)
net start MongoDB

# Seed database
cd server
node src/seed.js

# Start development servers
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend
cd client
npm run dev
```

### **Access:**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Admin Panel: http://localhost:5173/admin

### **Default Admin Credentials:**
- Email: admin@flixhub.pk
- Password: admin123

---

## 🚀 Deployment

### **Vercel (Frontend):**
1. Connect GitHub repository
2. Build command: `npm run build`
3. Output directory: `dist`
4. Environment variables: Set `VITE_API_URL`

### **Render/Railway (Backend):**
1. Connect GitHub repository
2. Build command: `npm install`
3. Start command: `node src/index.js`
4. Environment variables: Set all server .env variables

---

## 📱 API Endpoints

### **Authentication:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/admin-login` - Admin login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### **Products:**
- `GET /api/products` - Get all products
- `GET /api/products/:slug` - Get single product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### **Orders:**
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id` - Update order (admin)

### **Admin:**
- `GET /api/admin/stats` - Dashboard stats
- `GET /api/admin/users` - Get all users
- `GET /api/admin/inventory` - Subscription inventory
- `POST /api/admin/inventory/:accountId/assign` - Assign customer to slot

### **Payments:**
- `POST /api/payments/proof` - Upload payment proof
- `GET /api/payments/proofs` - Get all proofs (admin)
- `PUT /api/payments/proofs/:id` - Update proof status

---

## 🎨 Styling System

### **CSS Variables:**
```css
:root {
  --bg: #0a0a0f;           /* Background */
  --card: #14141f;          /* Card background */
  --text: oklch(0.98 0 0);  /* Primary text */
  --muted: oklch(0.6 0 0);  /* Muted text */
  --line: oklch(0.2 0 0);   /* Borders */
  --accent: #54d6e8;        /* Accent color */
}
```

### **Key CSS Classes:**
- `.pcard` - Product card with animations
- `.cinema-grid` - Background cinema grid
- `.app-header` - Navigation header
- `.shop-card-wrapper` - Shop product card
- `.admin-panel` - Admin dashboard layout

---

## 🗄️ Database Schema

### **User Model:**
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  role: 'user' | 'admin',
  language: String,
  timestamps: true
}
```

### **Product Model:**
```javascript
{
  name: String,
  slug: String (unique),
  quality: String,
  monthlyPrice: Number,
  compareAt: Number,
  accent: String,
  category: 'movies' | 'bundle',
  logo: String,
  inStock: Number,
  timestamps: true
}
```

### **Order Model:**
```javascript
{
  user: ObjectId,
  product: ObjectId,
  duration: Number,
  totalPrice: Number,
  status: String,
  paymentProof: String,
  timestamps: true
}
```

### **Account Model (Subscription Inventory):**
```javascript
{
  service: String,
  plan: String,
  email: String,
  password: String,
  purchaseDate: Date,
  providerExpiry: Date,
  totalSlots: Number,
  slots: [{
    slotNumber: Number,
    status: 'AVAILABLE' | 'OCCUPIED' | 'EXPIRED',
    customerId: ObjectId,
    customerExpiry: Date
  }],
  timestamps: true
}
```

---

## 🔐 Security Features

1. **JWT Authentication** - Secure token-based auth
2. **Password Hashing** - bcrypt (12 rounds)
3. **CORS Protection** - Allowed origins only
4. **Helmet** - Security headers
5. **Rate Limiting** - 40 requests per 15 min
6. **Input Validation** - Sanitized inputs
7. **Role-Based Access** - Admin vs User permissions

---

## 📊 Admin Panel Features

1. **Dashboard** - Stats overview
2. **Orders Manager** - View/update orders
3. **Products Manager** - CRUD products
4. **Stock Manager** - Inventory levels
5. **Users Manager** - User management
6. **Payment Proofs** - Review payment uploads
7. **Payment Settings** - Payment configuration
8. **Activity Log** - System activity
9. **Subscription Inventory** - Full account management with:
   - Service-wise overview
   - Account CRUD operations
   - Slot management
   - Customer assignment
   - Credentials reveal
   - Status filters
   - Provider vs customer expiry tracking

---

## 🌐 Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 640px) {
  .home-product-grid { grid-template-columns: 1fr; }
}

/* Tablet */
@media (max-width: 1024px) {
  .home-product-grid { grid-template-columns: repeat(2, 1fr); }
}

/* Desktop */
@media (min-width: 1025px) {
  .home-product-grid { grid-template-columns: repeat(3, 1fr); }
}
```

---

## 📝 Git Branches

- `main` - Production branch
- `restore-2026-08-13` - August 13 restore point
- `backup-before-full-restore-2026-08-20-13-13-31` - Backup before restoration

---

## 🐛 Common Issues & Solutions

### **MongoDB Connection Failed:**
```bash
# Start MongoDB as Administrator
net start MongoDB
```

### **Build Errors:**
```bash
# Clear cache and rebuild
cd client
rm -rf node_modules dist
npm install
npm run build
```

### **CORS Errors:**
- Check `CLIENT_URL` in server `.env`
- Add frontend URL to `allowedOrigins` in `server/src/index.js`

### **Login Issues:**
- Run seed script: `node src/seed.js`
- Check MongoDB is running
- Verify JWT_SECRET in `.env`

---

## 📞 Support

- WhatsApp: +923001234567
- Email: admin@flixhub.pk
- GitHub: https://github.com/rashidmeo3474-rgb/FlixHub

---

**Last Updated:** August 20, 2026
**Version:** 1.0.0 (Restored to August 13, 2026 state)
