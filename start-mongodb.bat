@echo off
echo Starting MongoDB...
echo.
echo Option 1: If you have MongoDB installed locally:
echo mongod --dbpath "C:\data\db"
echo.
echo Option 2: If you have MongoDB Compass installed:
echo Start MongoDB Compass and connect to mongodb://localhost:27017
echo.
echo Option 3: If you don't have MongoDB:
echo 1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
echo 2. Install it with default settings
echo 3. Start MongoDB service from Services or run: net start MongoDB
echo.
echo Press any key to try starting MongoDB service...
pause
net start MongoDB
pause