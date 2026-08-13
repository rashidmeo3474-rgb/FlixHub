# MongoDB Setup Guide

## Check if MongoDB is installed:
```bash
mongod --version
```

## If not installed, install MongoDB:
1. Download from: https://www.mongodb.com/try/download/community
2. Install with default settings
3. Start MongoDB service

## Start MongoDB:
```bash
# Option 1: Start as service
net start mongodb

# Option 2: Start manually
mongod --dbpath="C:\data\db"
```

## Once MongoDB is running:
```bash
cd server
npm run populate-accounts
```

## Check stock after population:
- Products will show real account counts
- Users can actually purchase and receive credentials