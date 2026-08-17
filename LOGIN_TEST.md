# 🔑 Login Test Instructions

## ✅ **System Status: READY FOR TESTING**

**Backend Server**: ✅ Running on http://localhost:5000  
**Frontend Client**: ✅ Running on http://localhost:5173  
**Database**: ⚠️ Mock Mode (MongoDB not connected)  
**Authentication**: ✅ Functional with mock data  

## 🎯 **CORRECT LOGIN CREDENTIALS**

### **For Admin Panel Access:**

```
Email: businessyttom@gmail.com
Password: admin123
```

**OR alternative admin email:**

```
Email: admin@flixhub.pk  
Password: admin123
```

### **For Regular User Access:**
```
Email: test@example.com (or any valid email)
Password: test123 (or any password)
```

## 📋 **Step-by-Step Test Process**

### **Step 1: Access the System**
1. Open browser: http://localhost:5173
2. If login page doesn't appear, click "Admin" or "Login" 

### **Step 2: Admin Login Test**
1. Enter email: `businessyttom@gmail.com`
2. Enter password: `admin123`
3. Click "Log in" button
4. **Expected Result**: Should redirect to admin dashboard

### **Step 3: Verify Admin Functions**
After successful login, check:
- [ ] Dashboard loads with stats
- [ ] Stock Manager shows all 6 services 
- [ ] Products Manager accessible
- [ ] Orders Manager functional
- [ ] Account Manager shows accounts
- [ ] Payment Proofs section works

### **Step 4: Shop Flow Test**
1. Go to Shop page
2. Check all services display correctly:
   - [ ] Netflix (netflix.png)
   - [ ] Prime Video (images 4.jpeg)  
   - [ ] Disney+ (images 2.jpeg)
   - [ ] HBO Max
   - [ ] Apple TV+
   - [ ] Netflix + Prime combo

### **Step 5: Image Consistency Test**
1. From Home page, click Netflix plan
2. **Expected**: Same Netflix image in ProductDetail
3. From Home page, click Prime Video plan  
4. **Expected**: Same Prime Video image (4.jpeg) in ProductDetail
5. From Home page, click Disney+ plan
6. **Expected**: Same Disney+ image (2.jpeg) in ProductDetail

## 🚨 **Troubleshooting Common Issues**

### **Issue: "Wrong email or password" Error**
**Solutions:**
1. **Use exact email**: `businessyttom@gmail.com` (copy-paste)
2. **Use exact password**: `admin123` (copy-paste)  
3. **Clear browser cache**: F12 > Application > Storage > Clear All
4. **Hard refresh**: Ctrl + F5
5. **Check console**: F12 > Console for JavaScript errors

### **Issue: Login button not working**
**Solutions:**
1. Check browser console for errors
2. Verify both servers are running  
3. Try different browser
4. Clear localStorage: `localStorage.clear()` in console

### **Issue: Admin panel not loading after login**
**Solutions:**
1. Check if redirected to correct URL
2. Verify admin role is assigned correctly
3. Check browser network tab for API errors

### **Issue: Images not displaying**
**Solutions:**
1. Check if image files exist in `/client/public/uploads/`
2. Verify image paths in browser DevTools
3. Check console for 404 errors

## 🔍 **System Verification Checklist**

### **Authentication System:**
- [ ] Admin login with businessyttom@gmail.com works
- [ ] Wrong credentials show proper error message
- [ ] User login with any valid email works
- [ ] Logout functionality works

### **Admin Panel:**
- [ ] Dashboard displays mock stats correctly
- [ ] Stock Manager shows 6 streaming services
- [ ] Products list displays with correct images
- [ ] Account Manager shows account slots
- [ ] Order system functional

### **Shop & Images:**
- [ ] Home page shows correct featured images
- [ ] Shop page displays all services
- [ ] ProductDetail shows matching home images  
- [ ] Navigation between pages works
- [ ] Payment flow initiated correctly

### **Performance:**
- [ ] Pages load within 2-3 seconds
- [ ] No JavaScript console errors
- [ ] API calls return data (mock or real)
- [ ] Images load properly

## 📞 **Still Having Issues?**

If login still fails after following all steps:

1. **Check server logs**: Look at the terminal where server is running
2. **Browser DevTools**: F12 > Network tab > see if API calls are made
3. **Clear everything**: Close browser, clear cache, restart both servers
4. **Try exact URL**: http://localhost:5173/admin/login

## ✨ **Success Indicators**

**You'll know it's working when:**
- Login redirects to admin dashboard immediately  
- Dashboard shows stats and navigation menu
- Stock manager displays all streaming services
- Shop page shows products with correct images
- No console errors in browser DevTools

---

**Test Date**: August 13, 2026  
**System**: FlixHub v2.0 Mock Mode  
**Login**: businessyttom@gmail.com / admin123