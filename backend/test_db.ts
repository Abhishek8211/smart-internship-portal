import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-internship-portal')
  .then(async () => {
    const db = mongoose.connection.db;
    const users = await db!.collection('users').find({}).toArray();
    console.log(users.map(u => ({ email: u.email, keys: Object.keys(u) })));
    mongoose.disconnect();
  })
  .catch(console.error);
