import mongoose from 'mongoose';

export default async function connectDB() {
<<<<<<< HEAD
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI missing in .env');
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log('MongoDB connected:', mongoose.connection.name);
=======
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/primevault';
  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000
    });
    console.log('MongoDB connected:', mongoose.connection.name);
  } catch (error) {
    console.warn('MongoDB not available, continuing without database:', error.message);
  }
>>>>>>> 178aa0fd1475a77692598040c72d5b4865dcf9f7
}
