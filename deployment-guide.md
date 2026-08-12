# Deployment guide

## Backend on Render
1. Create a new Web Service on Render.
2. Point it to the server folder.
3. Set the following environment variables:
   - NODE_ENV=production
   - PORT=10000
   - MONGO_URI=your_mongodb_connection_string
   - JWT_SECRET=a_long_random_string
   - CLIENT_URL=https://your-vercel-app.vercel.app
   - ADMIN_EMAIL=admin@primevault.pk
   - ADMIN_PASSWORD=admin123
4. Build command: npm install
5. Start command: npm start

## Frontend on Vercel
1. Create a Vercel project from the client folder.
2. Set the environment variable:
   - VITE_API_URL=https://your-render-backend-url/api
   - VITE_SITE_NAME=PrimeVault
3. Build command: npm install && npm run build
4. Output directory: dist

## Notes
- The server now serves uploaded payment proofs from /uploads.
- For production, configure a persistent file storage service if you expect large uploads.
- For a real payment gateway, replace the mock adapter in server/src/services/payments.js with your provider integration.
