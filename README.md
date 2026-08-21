# 🎬 FlixHub - Premium Subscription Management Platform

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![MongoDB](https://img.shields.io/badge/mongodb-6.0%2B-green.svg)

A professional full-stack e-commerce platform for managing and selling premium streaming service subscriptions (Netflix, Prime Video, Disney+, Apple TV+, HBO Max).

## ✨ Features

### 🎨 Frontend
- **Cinematic UI Design** - Modern, responsive design with glassmorphism effects
- **Animated Product Cards** - Themed particles, spinning neon borders, 3D tilt effects
- **Resolution Filters** - 480p, 720p, 1080p, 4K, 8K quality tiers
- **Duration Selector** - Flexible 1-6 months subscription periods
- **Dynamic Pricing** - Real-time price calculation based on duration
- **User Authentication** - JWT-based secure login/register system
- **Responsive Design** - Optimized for mobile, tablet, and desktop
- **Internationalization** - Multi-language support (English/Urdu)

### 🔧 Backend
- **RESTful API** - Clean, organized Express.js architecture
- **MongoDB Integration** - Efficient data storage with Mongoose ODM
- **User Management** - Role-based access control (Admin/User)
- **Product Management** - CRUD operations for streaming services
- **Order Processing** - Complete order lifecycle management
- **Subscription Inventory** - Advanced account slot management system
- **Payment Proof Upload** - Multer-based file handling
- **Security** - Helmet, CORS, rate limiting, JWT encryption

### 👨‍💼 Admin Panel
- **Dashboard** - Real-time statistics and analytics
- **Orders Manager** - View, update, and process orders
- **Products Manager** - Add, edit, delete streaming services
- **Stock Manager** - Monitor inventory levels
- **Users Manager** - User account management
- **Payment Proofs** - Review and approve payment uploads
- **Subscription Inventory** - Full account management:
  - Service-wise overview with stock counts
  - Account CRUD operations
  - Configurable slots per account
  - Customer assignment workflow
  - Separate provider vs customer expiry dates
  - Credentials reveal functionality
  - Status filters (Available/Occupied/Expired)
  - Double assignment protection

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ installed
- MongoDB v6.0+ installed and running
- Git installed

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/rashidmeo3474-rgb/FlixHub.git
cd "Premium subscriptions Netflix"
```

2. **Install client dependencies**
```bash
cd client
npm install
```

3. **Install server dependencies**
```bash
cd ../server
npm install
```

4. **Configure environment variables**

Create `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/primevault
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES=7d
CLIENT_URL=http://localhost:5173
ADMIN_EMAIL=admin@flixhub.pk
ADMIN_PASSWORD=admin123
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_WHATSAPP=+923001234567
VITE_SITE_NAME=FlixHub
```

5. **Start MongoDB**
```bash
# Windows (Run as Administrator)
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

6. **Seed database with initial data**
```bash
cd server
node src/seed.js
```

7. **Start development servers**

**Terminal 1 - Backend:**
```bash
cd server
npm start
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

8. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Admin Panel: http://localhost:5173/admin

---

## 🎯 Default Credentials

### Admin Account
- **Email:** admin@flixhub.pk
- **Password:** admin123

### Test User
Create via registration page or use seed script.

---

## 📁 Project Structure

```
Premium subscriptions Netflix/
├── client/                    # React + Vite frontend
│   ├── public/               # Static assets
│   │   ├── logos/           # Service logos
│   │   └── scenes/          # Background images
│   ├── src/
│   │   ├── admin/           # Admin panel components
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React Context providers
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Page components
│   │   ├── utils/           # Utility functions
│   │   ├── App.jsx          # Main app component
│   │   └── styles.css       # Global styles
│   ├── package.json
│   └── vite.config.js
│
├── server/                   # Node.js + Express backend
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Route controllers
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Express middleware
│   │   ├── utils/           # Helper functions
│   │   ├── index.js         # Server entry point
│   │   └── seed.js          # Database seeder
│   ├── package.json
│   └── .env
│
├── uploads/                  # Uploaded files
├── README.md
└── .gitignore
```

---

## 🛠️ Available Scripts

### Client
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Server
```bash
npm start        # Start production server
npm run dev      # Start development server with nodemon
npm run seed     # Seed database with initial data
```

---

## 📊 Products & Services

### Streaming Services Available:
1. **Netflix** - Action · Drama · Thriller
2. **Prime Video** - Adventure · Sci-Fi
3. **Disney+** - Fantasy · Family
4. **Apple TV+** - Premium · Original Content
5. **HBO Max** - Dark · History · Drama
6. **Netflix + Prime** - Best Value Bundle

### Quality Tiers:
- **480p SD** - Mobile tier
- **720p HD** - Standard HD
- **1080p HD** - Full HD
- **4K UHD** - Ultra HD
- **8K UHD** - Master Quality

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register       # User registration
POST   /api/auth/login          # User login
POST   /api/auth/admin-login    # Admin login
GET    /api/auth/me             # Get current user
PUT    /api/auth/profile        # Update profile
```

### Products
```
GET    /api/products            # Get all products
GET    /api/products/:slug      # Get single product
POST   /api/products            # Create product (admin)
PUT    /api/products/:id        # Update product (admin)
DELETE /api/products/:id        # Delete product (admin)
```

### Orders
```
POST   /api/orders              # Create order
GET    /api/orders              # Get user orders
GET    /api/orders/:id          # Get single order
PUT    /api/orders/:id          # Update order (admin)
```

### Admin
```
GET    /api/admin/stats         # Dashboard statistics
GET    /api/admin/users         # Get all users
GET    /api/admin/inventory     # Subscription inventory
POST   /api/admin/inventory     # Create account
PUT    /api/admin/inventory/:id # Update account
DELETE /api/admin/inventory/:id # Delete account
POST   /api/admin/inventory/:accountId/assign  # Assign customer
```

---

## 🎨 Design System

### Color Palette
```css
--bg: #0a0a0f           /* Background */
--card: #14141f          /* Card background */
--text: oklch(0.98 0 0)  /* Primary text */
--muted: oklch(0.6 0 0)  /* Muted text */
--line: oklch(0.2 0 0)   /* Borders */
--accent: #54d6e8        /* Accent color */
```

### Product Themes
- **Netflix:** Red (#e50914) with ★ particle
- **Prime Video:** Blue (#00a8e1) with ⬡ particle
- **Disney+:** Purple (#4b6cf7) with ✦ particle
- **Apple TV+:** Gray (#d8d8d8) with ◆ particle
- **Netflix+Prime:** Orange (#ff6b00) with ⬟ particle
- **HBO Max:** Purple (#9b30ff) with ✧ particle

---

## 🚢 Deployment

### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Configure build settings:
   - **Framework:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Root Directory:** `client`
3. Add environment variables:
   - `VITE_API_URL=https://your-api-url.com/api`
   - `VITE_WHATSAPP=+923001234567`
   - `VITE_SITE_NAME=FlixHub`
4. Deploy

### Backend (Render/Railway)
1. Connect GitHub repository
2. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `node src/index.js`
   - **Root Directory:** `server`
3. Add environment variables from `server/.env`
4. Deploy

### Database (MongoDB Atlas)
1. Create free cluster at mongodb.com
2. Get connection string
3. Update `MONGO_URI` in server environment variables

---

## 🔐 Security Best Practices

- ✅ JWT authentication with httpOnly cookies
- ✅ Password hashing with bcrypt (12 rounds)
- ✅ CORS protection with allowed origins
- ✅ Helmet for security headers
- ✅ Rate limiting on auth endpoints
- ✅ Input validation and sanitization
- ✅ Role-based access control
- ✅ Environment variables for sensitive data

---

## 🐛 Troubleshooting

### MongoDB Connection Failed
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### CORS Errors
- Verify `CLIENT_URL` in server `.env`
- Check `allowedOrigins` in `server/src/index.js`
- Ensure frontend and backend URLs match

### Login Issues
- Run seed script: `node src/seed.js`
- Check MongoDB connection
- Verify JWT_SECRET in `.env`

---

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

---

## 👥 Contributors

- **Rashid Mehmood** - Lead Developer
- GitHub: [@rashidmeo3474-rgb](https://github.com/rashidmeo3474-rgb)

---

## 📞 Support

- **Email:** admin@flixhub.pk
- **WhatsApp:** +923001234567
- **GitHub Issues:** [Create Issue](https://github.com/rashidmeo3474-rgb/FlixHub/issues)

---

## 🙏 Acknowledgments

- React.js team for amazing frontend framework
- Express.js for robust backend framework
- MongoDB for flexible database solution
- Vite for lightning-fast build tool
- All open-source contributors

---

**Made with ❤️ in Pakistan**

**Last Updated:** August 20, 2026
