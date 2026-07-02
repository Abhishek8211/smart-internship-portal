import { prisma } from '../config/db';
import { User, StudentProfile, Application, Notification, Chat } from './mongoModels';
import { emitNotification } from '../services/socketService';

export const dbStore = {
  users: {
    findByEmail: async (email: string) => {
      return await User.findOne({ email });
    },

    findById: async (id: string) => {
      return await User.findById(id);
    },

    create: async (userData: { email: string; passwordHash: string; role: 'student' | 'recruiter' | 'admin'; name: string; isVerified?: boolean; otp?: string; otpExpiry?: Date }) => {
      const newUser = new User({
        ...userData,
        isVerified: userData.isVerified || false
      });
      return await newUser.save();
    },

    update: async (id: string, data: any) => {
      return await User.findByIdAndUpdate(id, data, { new: true });
    },

    findAll: async () => {
      return await User.find({});
    }
  },

  profiles: {
    findByUserId: async (userId: string) => {
      return await StudentProfile.findOne({ user: userId });
    },

    create: async (profileData: { user: string; skills?: string[]; education?: any[]; cgpa?: number; projects?: any[]; certifications?: any[]; links?: any }) => {
      const newProfile = new StudentProfile({
        ...profileData,
        skills: profileData.skills || [],
        education: profileData.education || [],
        cgpa: profileData.cgpa || 0,
        projects: profileData.projects || [],
        certifications: profileData.certifications || [],
        links: profileData.links || {},
        savedInternships: []
      });
      return await newProfile.save();
    },

    updateByUserId: async (userId: string, data: any) => {
      return await StudentProfile.findOneAndUpdate({ user: userId }, data, { new: true, upsert: true });
    }
  },

  companies: {
    findAll: async () => {
      return await prisma.company.findMany({
        orderBy: { name: 'asc' }
      });
    },

    findById: async (id: string) => {
      return await prisma.company.findUnique({
        where: { id }
      });
    },

    create: async (companyData: { name: string; logo?: string; description?: string; website?: string; location?: string; is_verified?: boolean }) => {
      return await prisma.company.create({
        data: {
          name: companyData.name,
          logo: companyData.logo || '',
          description: companyData.description || '',
          website: companyData.website || '',
          location: companyData.location || '',
          is_verified: companyData.is_verified || false
        }
      });
    },

    update: async (id: string, data: Partial<{ name: string; logo: string; description: string; website: string; location: string; is_verified: boolean }>) => {
      return await prisma.company.update({
        where: { id },
        data
      });
    },

    delete: async (id: string) => {
      await prisma.company.delete({
        where: { id }
      });
      return true;
    }
  },

  recruiters: {
    findById: async (id: string) => {
      return await prisma.recruiter.findUnique({
        where: { id }
      });
    },

    create: async (recruiterData: { id: string; company_id: string | null; phone: string; title: string; is_verified?: boolean }) => {
      return await prisma.recruiter.create({
        data: {
          id: recruiterData.id,
          company_id: recruiterData.company_id,
          phone: recruiterData.phone,
          title: recruiterData.title,
          is_verified: recruiterData.is_verified || false
        }
      });
    },

    update: async (id: string, data: Partial<{ company_id: string | null; phone: string; title: string; is_verified: boolean }>) => {
      return await prisma.recruiter.update({
        where: { id },
        data
      });
    }
  },

  internships: {
    findAll: async (filters: { role?: string; location?: string; mode?: string; stipendMin?: string; remoteOnly?: boolean; limit?: number; offset?: number; search?: string; sort?: string }) => {
      const where: any = {};

      if (filters.search) {
        where.OR = [
          { role: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
          { company: { name: { contains: filters.search, mode: 'insensitive' } } }
        ];
      }

      if (filters.mode) {
        where.mode = filters.mode;
      }

      if (filters.location) {
        where.location = { contains: filters.location, mode: 'insensitive' };
      }

      // Query database
      const list = await prisma.internship.findMany({
        where,
        include: { company: true },
        orderBy: { posted_date: 'desc' },
        take: filters.limit,
        skip: filters.offset
      });

      // Map back to standard schema layout
      return list.map((item) => ({
        ...item,
        company_name: item.company.name,
        company_logo: item.company.logo
      }));
    },

    findById: async (id: string) => {
      const item = await prisma.internship.findUnique({
        where: { id },
        include: { company: true }
      });

      if (!item) return null;

      return {
        ...item,
        company_name: item.company.name,
        company_logo: item.company.logo,
        company_description: item.company.description,
        company_website: item.company.website
      };
    },

    create: async (jobData: { company_id: string; role: string; description: string; location: string; mode: 'Remote' | 'Hybrid' | 'Office'; stipend: string; duration: string; skills_required: string[]; status?: 'Active' | 'Closed' | 'Pending Approval' }) => {
      return await prisma.internship.create({
        data: {
          company_id: jobData.company_id,
          role: jobData.role,
          description: jobData.description,
          location: jobData.location,
          mode: jobData.mode,
          stipend: jobData.stipend,
          duration: jobData.duration,
          skills_required: jobData.skills_required,
          status: jobData.status || 'Active'
        }
      });
    },

    update: async (id: string, data: Partial<{ role: string; description: string; location: string; mode: string; stipend: string; duration: string; skills_required: string[]; status: string }>) => {
      return await prisma.internship.update({
        where: { id },
        data: data as any
      });
    },

    delete: async (id: string) => {
      await prisma.internship.delete({
        where: { id }
      });
      return true;
    },

    incrementApplicants: async (id: string) => {
      await prisma.internship.update({
        where: { id },
        data: {
          applicants_count: { increment: 1 }
        }
      });
    }
  },

  applications: {
    findAll: async (filters?: { studentId?: string; recruiterCompanyId?: string; internshipId?: string }) => {
      const query: any = {};
      if (filters?.studentId) query.studentId = filters.studentId;
      if (filters?.internshipId) query.internshipId = filters.internshipId;

      let apps = await Application.find(query);

      // Filter by company (stored in PostgreSQL)
      if (filters?.recruiterCompanyId) {
        const jobs = await prisma.internship.findMany({
          where: { company_id: filters.recruiterCompanyId },
          select: { id: true }
        });
        const jobIds = jobs.map((j) => j.id);
        apps = apps.filter((a) => jobIds.includes(a.internshipId));
      }

      return apps;
    },

    findById: async (id: string) => {
      return await Application.findById(id);
    },

    create: async (appData: { studentId: string; internshipId: string; resumeUrl: string; coverLetter?: string; matchPercentage?: number; matchExplanation?: string }) => {
      const newApp = new Application({
        studentId: appData.studentId,
        internshipId: appData.internshipId,
        status: 'Applied',
        resumeUrl: appData.resumeUrl,
        coverLetter: appData.coverLetter || '',
        matchPercentage: appData.matchPercentage || 0,
        matchExplanation: appData.matchExplanation || '',
        timeline: [{ status: 'Applied', date: new Date() }]
      });

      await newApp.save();
      // Increment applicant counter
      await prisma.internship.update({
        where: { id: appData.internshipId },
        data: { applicants_count: { increment: 1 } }
      });
      
      return newApp;
    },

    update: async (id: string, data: any) => {
      const app = await Application.findById(id);
      if (!app) return null;

      const updatedTimeline = [...app.timeline];
      if (data.status && data.status !== app.status) {
        updatedTimeline.push({ status: data.status, date: new Date() });
      }

      return await Application.findByIdAndUpdate(
        id,
        {
          ...data,
          timeline: data.timeline || updatedTimeline
        },
        { new: true }
      );
    }
  },

  notifications: {
    findByUserId: async (userId: string) => {
      return await Notification.find({ userId }).sort({ createdAt: -1 });
    },

    create: async (notifData: { userId: string; title: string; message: string; type: 'info' | 'success' | 'warning' | 'alert' }) => {
      const newNotif = new Notification({
        userId: notifData.userId,
        title: notifData.title,
        message: notifData.message,
        type: notifData.type,
        isRead: false
      });
      const saved = await newNotif.save();
      emitNotification(notifData.userId, saved);
      return saved;
    },

    markAsRead: async (id: string) => {
      return await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
    }
  },

  chats: {
    findByUserId: async (userId: string) => {
      return await Chat.findOne({ userId });
    },

    addMessage: async (userId: string, sender: 'user' | 'bot' | 'recruiter', text: string) => {
      const newMessage = { sender, text, timestamp: new Date() };
      return await Chat.findOneAndUpdate(
        { userId },
        { $push: { messages: newMessage } },
        { new: true, upsert: true }
      );
    }
  }
};

export default dbStore;
