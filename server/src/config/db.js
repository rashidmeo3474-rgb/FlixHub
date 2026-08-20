import mongoose from 'mongoose';

export default async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/flixhub';
  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log(`✅ MongoDB connected: ${mongoose.connection.name}`);
    console.log(`📂 Database: ${mongoose.connection.db.databaseName}`);
    console.log(`🔗 Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
    return true;
  } catch (error) {
    console.warn(`⚠️  MongoDB connection failed: ${error.message}`);
    console.warn(`🔍 Trying to connect to: ${uri}`);
    console.warn('📋 To start MongoDB:');
    console.warn('   - Run as Administrator: net start MongoDB');
    console.warn('   - Or install: https://www.mongodb.com/try/download/community');
    console.warn('🔄 Server continuing with mock data...');
    return false;
  }
}
