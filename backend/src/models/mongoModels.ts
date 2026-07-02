import mongoose, { Schema, Document } from 'mongoose';

// User Schema (Base for Students, Recruiters, Admins in Mongo, synced if necessary)
export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role: 'student' | 'recruiter' | 'admin';
  name: string;
  isVerified: boolean;
  otp?: string;
  otpExpiry?: Date;
  profilePic?: string;
  refreshTokens?: string[];
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, required: true, enum: ['student', 'recruiter', 'admin'] },
  name: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpiry: { type: Date },
  profilePic: { type: String, default: '' },
  refreshTokens: [{ type: String }]
}, { timestamps: true });

// Student Profile Schema
export interface IStudentProfile extends Document {
  user: mongoose.Types.ObjectId | string;
  skills: string[];
  education: {
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startYear: number;
    endYear: number;
    cgpa?: number;
  }[];
  cgpa: number;
  projects: {
    title: string;
    description: string;
    technologies: string[];
    link?: string;
  }[];
  certifications: {
    name: string;
    issuingOrganization: string;
    issueDate: Date | string;
    credentialId?: string;
  }[];
  links: {
    portfolio?: string;
    github?: string;
    linkedin?: string;
  };
  resumeUrl?: string;
  resumeParsedData?: any;
  atsScore?: number;
  atsSuggestions?: string[];
  savedInternships: string[]; // Internship IDs (PG strings)
}

const StudentProfileSchema = new Schema<IStudentProfile>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  skills: [{ type: String }],
  education: [{
    institution: { type: String, required: true },
    degree: { type: String, required: true },
    fieldOfStudy: { type: String, required: true },
    startYear: { type: Number },
    endYear: { type: Number },
    cgpa: { type: Number }
  }],
  cgpa: { type: Number, default: 0 },
  projects: [{
    title: { type: String, required: true },
    description: { type: String, required: true },
    technologies: [{ type: String }],
    link: { type: String }
  }],
  certifications: [{
    name: { type: String, required: true },
    issuingOrganization: { type: String, required: true },
    issueDate: { type: Schema.Types.Mixed },
    credentialId: { type: String }
  }],
  links: {
    portfolio: { type: String, default: '' },
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' }
  },
  resumeUrl: { type: String, default: '' },
  resumeParsedData: { type: Schema.Types.Mixed, default: {} },
  atsScore: { type: Number, default: 0 },
  atsSuggestions: [{ type: String }],
  savedInternships: [{ type: String }]
}, { timestamps: true });

// Application Schema
export interface IApplication extends Document {
  studentId: string; // User ID
  internshipId: string; // PG Internship ID (string)
  status: 'Applied' | 'Under Review' | 'Shortlisted' | 'Interview Scheduled' | 'Selected' | 'Rejected';
  resumeUrl: string;
  coverLetter?: string;
  matchPercentage: number;
  matchExplanation?: string;
  timeline: {
    status: string;
    date: Date;
  }[];
  interviewDetails?: {
    dateTime: Date;
    link?: string;
    notes?: string;
    aiQuestions?: {
      technical: string[];
      hr: string[];
      coding: string[];
      behavioral: string[];
    };
  };
  offerDetails?: {
    salary: string;
    startDate: Date;
    offerLetterUrl?: string;
    notes?: string;
  };
}

const ApplicationSchema = new Schema<IApplication>({
  studentId: { type: String, required: true, index: true },
  internshipId: { type: String, required: true, index: true },
  status: { 
    type: String, 
    required: true, 
    enum: ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected'],
    default: 'Applied'
  },
  resumeUrl: { type: String, required: true },
  coverLetter: { type: String },
  matchPercentage: { type: Number, default: 0 },
  matchExplanation: { type: String },
  timeline: [{
    status: { type: String, required: true },
    date: { type: Date, default: Date.now }
  }],
  interviewDetails: {
    dateTime: { type: Date },
    link: { type: String },
    notes: { type: String },
    aiQuestions: {
      technical: [{ type: String }],
      hr: [{ type: String }],
      coding: [{ type: String }],
      behavioral: [{ type: String }]
    }
  },
  offerDetails: {
    salary: { type: String },
    startDate: { type: Date },
    offerLetterUrl: { type: String },
    notes: { type: String }
  }
}, { timestamps: true });

// Notification Schema
export interface INotification extends Document {
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'success', 'warning', 'alert'], default: 'info' },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

// Chat Message Schema
export interface IChat extends Document {
  userId: string; // studentId
  messages: {
    sender: 'user' | 'bot' | 'recruiter';
    text: string;
    timestamp: Date;
  }[];
}

const ChatSchema = new Schema<IChat>({
  userId: { type: String, required: true, unique: true },
  messages: [{
    sender: { type: String, enum: ['user', 'bot', 'recruiter'], required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const StudentProfile = mongoose.models.StudentProfile || mongoose.model<IStudentProfile>('StudentProfile', StudentProfileSchema);
export const Application = mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema);
export const Notification = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
export const Chat = mongoose.models.Chat || mongoose.model<IChat>('Chat', ChatSchema);
