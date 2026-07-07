import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { dbStore } from './src/models/dbStore';
dotenv.config();

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-internship-portal');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Password@123', salt);

  const users = [
    { email: 'student@example.com', name: 'Alex Rivera', role: 'student' as const },
    { email: 'recruiter@stripe.com', name: 'Sarah Chen', role: 'recruiter' as const },
    { email: 'admin@portal.com', name: 'Chief Administrator', role: 'admin' as const }
  ];

  for (const u of users) {
    const existing = await dbStore.users.findByEmail(u.email);
    if (!existing) {
      await dbStore.users.create({
        email: u.email,
        passwordHash,
        role: u.role,
        name: u.name,
        isVerified: true
      });
      console.log(`Created ${u.email}`);
    } else {
      console.log(`${u.email} already exists`);
      // Update the password to Password@123 just in case
      await dbStore.users.update(existing._id.toString(), { passwordHash, password: null });
    }
  }

  mongoose.disconnect();
}

seed().catch(console.error);
