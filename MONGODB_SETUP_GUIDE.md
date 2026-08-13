# MongoDB Setup Guide for FlixHub

## Problem
Only Netflix and Netflix+Prime accounts are showing in admin panel. Other services (HBO Max, Prime Video, Disney+, Apple TV+) are missing because MongoDB database is not running.

## Solution: Install & Setup MongoDB

### Step 1: Download MongoDB Community Server
1. Go to: https://www.mongodb.com/try/download/community
2. Select "Windows" platform
3. Download MongoDB Community Server (latest version)
4. Run the installer (.msi file)

### Step 2: Install MongoDB
1. Follow installation wizard
2. Choose "Complete" installation
3. Install MongoDB as a Windows Service (recommended)
4. Install MongoDB Compass (GUI tool - optional but helpful)

### Step 3: Start MongoDB Service
```powershell
# Check if service exists
Get-Service -Name MongoDB

# Start MongoDB service
Start-Service MongoDB

# Verify it's running
Get-Service -Name MongoDB
```

### Step 4: Seed Database with All Services
```powershell
# Navigate to server directory
cd server

# Run seed script to populate database
npm run seed
```

### Step 5: Start Backend Server
```powershell
# In server directory
npm run dev
```

### Step 6: Verify All Services
- Open admin panel
- Go to Stock Manager
- You should see all services:
  - Netflix (1080p HD)
  - Prime Video (4K UHD)
  - HBO Max (4K UHD)
  - Disney+ (4K UHD)
  - Apple TV+ (8K UHD)
  - Netflix + Prime Video (Bundle)

## Alternative: Quick Fix (Temporary)
If MongoDB installation is not possible right now, the system will use mock data and show all services, but data won't persist.

## Files Modified for Mock Data:
- `client/src/hooks/useApi.js` - Added fallback mock data for all endpoints
- All admin panels will show complete service list even without database

## Database Structure (Once MongoDB is running):
```javascript
Products Collection:
- Netflix: Rs 450/month (1080p HD)
- Prime Video: Rs 350/month (4K UHD) 
- HBO Max: Rs 450/month (4K UHD)
- Disney+: Rs 400/month (4K UHD)
- Apple TV+: Rs 1800/month (8K UHD)
- Netflix + Prime: Rs 600/month (Bundle, 4K UHD)
```

## Expected Result:
✅ All 6 streaming services visible in admin panel
✅ Proper stock management for each service
✅ Account creation for any service
✅ Complete inventory tracking