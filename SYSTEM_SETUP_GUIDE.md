# FlixHub System Setup & Troubleshooting Guide

## 🚨 Current Status: RUNNING IN MOCK MODE (Database Not Connected)

The system is currently running with **mock data fallbacks** because MongoDB is not connected. This is normal for development but causes authentication issues.

## 📋 **Login Credentials (Mock Mode)**

### **Admin Login:**
- **Email**: `businessyttom@gmail.com` OR `admin@flixhub.pk`  
- **Password**: `admin123`

### **User Login:**
- **Email**: Any valid email format (e.g., `test@example.com`)
- **Password**: Any password

## 🔧 **Complete Setup Instructions**

### **Option 1: Quick Mock Mode Fix (Recommended)**
1. **Use correct admin credentials**: `businessyttom@gmail.com` / `admin123`
2. **Clear browser cache**: Delete localStorage data
3. **Restart client**: `cd client && npm run dev`

### **Option 2: Full Database Setup**

#### **Step 1: Install MongoDB**
```bash
# Windows (using Chocolatey)
choco install mongodb

# Or download from: https://www.mongodb.com/try/download/community
```

#### **Step 2: Start MongoDB Service**
```bash
# Windows Service
net start MongoDB

# Or manually
mongod --dbpath "C:\data\db"
```

#### **Step 3: Initialize Database**
```bash
cd server
npm run seed
```

#### **Step 4: Start Backend**
```bash
cd server
npm run dev
```

#### **Step 5: Start Frontend**
```bash
cd client  
npm run dev
```

## 🐛 **Common Issues & Fixes**

### **Issue 1: "Wrong email or password"**
**Cause**: Using wrong credentials in mock mode
**Fix**: Use `businessyttom@gmail.com` / `admin123`

### **Issue 2: Login button not responding**
**Cause**: Client cache or network error
**Fix**: 
1. Clear browser localStorage
2. Hard refresh (Ctrl+F5)
3. Check browser console for errors

### **Issue 3: Admin panel not loading**
**Cause**: Role authentication issue
**Fix**: Use exact admin email format

### **Issue 4: Payment/Order issues** 
**Cause**: Mock data limitations
**Fix**: Setup full database for production features

### **Issue 5: Stock management errors**
**Cause**: No real database persistence
**Fix**: Either use mock data or setup MongoDB

## 📊 **System Components Status**

| Component | Status | Notes |
|-----------|--------|-------|
| Frontend Client | ✅ Working | React + Vite running on port 5173 |
| Backend API | ❌ Mock Mode | NodeJS + Express (needs MongoDB) |
| Database | ❌ Not Connected | MongoDB not running |
| Authentication | ⚠️ Mock Only | Works with hardcoded credentials |
| Admin Panel | ⚠️ Mock Data | Limited functionality |
| Payment System | ⚠️ Mock Only | File uploads work, processing is mocked |
| Image System | ✅ Working | Centralized image mapping active |

## 🎯 **Recommended Action Plan**

### **Immediate (5 minutes)**
1. Use correct login: `businessyttom@gmail.com` / `admin123`
2. Test admin panel functionality
3. Verify shop and payment flow

### **Short-term (30 minutes)**
1. Install and start MongoDB
2. Run database seed script
3. Start backend server properly

### **Long-term (Production)**
1. Configure production MongoDB Atlas
2. Set up proper environment variables
3. Deploy with real database

## 🔐 **Security Notes**

- **Development Mode**: Current setup is for development only
- **Production Setup**: Change all default passwords
- **Environment Variables**: Never commit real credentials
- **Database Security**: Enable MongoDB authentication for production

## 📱 **Testing Checklist**

- [ ] Admin login works with correct credentials
- [ ] Admin dashboard loads completely  
- [ ] Product/service management functional
- [ ] Stock management displays properly
- [ ] Order processing flow works
- [ ] Payment proof upload functional
- [ ] User registration/login works
- [ ] Shop displays all products correctly
- [ ] Image consistency across pages

## 🆘 **Need Help?**

If issues persist:
1. Check browser console for JavaScript errors
2. Verify network requests in DevTools
3. Check server logs for API errors  
4. Ensure correct ports (5173 for client, 5000 for server)
5. Clear all browser data and try again

---

**Last Updated**: August 13, 2026
**System Version**: FlixHub v2.0 (Mock Mode Active)