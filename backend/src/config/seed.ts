import { connectMongoDB, connectPostgreSQL, prisma } from './db';
import { User, StudentProfile, Application, Notification, Chat } from '../models/mongoModels';
import {
  sampleUsers,
  sampleCompanies,
  sampleRecruiters,
  sampleStudentProfiles,
  sampleInternships,
  sampleApplications,
  sampleNotifications,
  sampleChats
} from '../models/seedData';

const seedDatabases = async () => {
  console.log('🌱 Starting database seeding script...');

  // 1. Establish connections
  await connectMongoDB();
  await connectPostgreSQL();

  // 2. Seed MongoDB
  try {
    console.log('🔄 Seeding MongoDB collections...');
    
    await User.deleteMany({});
    await StudentProfile.deleteMany({});
    await Application.deleteMany({});
    await Notification.deleteMany({});
    await Chat.deleteMany({});

    // Insert base users
    const users = await User.insertMany(sampleUsers);
    console.log(`✅ Seeded ${users.length} Users into MongoDB.`);

    // Sync student profiles
    // Map sample user IDs to mongo object ids
    const studentProfiles = sampleStudentProfiles.map((prof) => {
      const u = users.find((user) => user._id === prof.user);
      return {
        ...prof,
        user: u?._id || prof.user
      };
    });
    const profiles = await StudentProfile.insertMany(studentProfiles);
    console.log(`✅ Seeded ${profiles.length} Student Profiles into MongoDB.`);

    // Insert applications
    const apps = await Application.insertMany(sampleApplications);
    console.log(`✅ Seeded ${apps.length} Applications into MongoDB.`);

    // Insert notifications
    const notifs = await Notification.insertMany(sampleNotifications);
    console.log(`✅ Seeded ${notifs.length} Notifications into MongoDB.`);

    // Insert chats
    const chats = await Chat.insertMany(sampleChats);
    console.log(`✅ Seeded ${chats.length} Chats into MongoDB.`);

  } catch (err: any) {
    console.error('❌ MongoDB seeding failed:', err.message);
  }

  // 3. Seed PostgreSQL
  try {
    console.log('🔄 Seeding PostgreSQL tables...');

    // Clear tables
    await prisma.internship.deleteMany({});
    await prisma.recruiter.deleteMany({});
    await prisma.company.deleteMany({});

    // Insert companies
    for (const c of sampleCompanies) {
      await prisma.company.create({
        data: {
          id: c.id,
          name: c.name,
          logo: c.logo,
          description: c.description,
          website: c.website,
          location: c.location,
          is_verified: c.is_verified
        }
      });
    }
    console.log(`✅ Seeded ${sampleCompanies.length} Companies into PostgreSQL.`);

    // Insert recruiters
    for (const r of sampleRecruiters) {
      await prisma.recruiter.create({
        data: {
          id: r.id,
          company_id: r.company_id,
          phone: r.phone,
          title: r.title,
          is_verified: r.is_verified
        }
      });
    }
    console.log(`✅ Seeded ${sampleRecruiters.length} Recruiters into PostgreSQL.`);

    // Insert internships
    for (const i of sampleInternships) {
      await prisma.internship.create({
        data: {
          id: i.id,
          company_id: i.company_id,
          role: i.role,
          description: i.description,
          location: i.location,
          mode: i.mode,
          stipend: i.stipend,
          duration: i.duration,
          skills_required: i.skills_required,
          status: i.status
        }
      });
    }
    console.log(`✅ Seeded ${sampleInternships.length} Internships into PostgreSQL.`);
    console.log('✅ PostgreSQL seeding complete.');

  } catch (err: any) {
    console.error('❌ PostgreSQL seeding failed:', err.message);
  }

  console.log('🏁 Database seeding process finished.');
  process.exit(0);
};

seedDatabases().catch((err) => {
  console.error('❌ Seeding process error:', err);
  process.exit(1);
});
