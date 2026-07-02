import { Router, Response } from 'express';
import multer from 'multer';
import { dbStore } from '../models/dbStore';
import { authenticateJWT, authorizeRoles, AuthenticatedRequest } from '../middleware/auth';
import { aiService } from '../services/aiService';

const router = Router();
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

// Helper to convert buffer to string (mock text reader)
const parseBufferToText = (buffer: Buffer, fileName: string): string => {
  const text = buffer.toString('utf-8');
  // If it's a binary file or PDF, return name-based mock text or simple ascii extract
  if (fileName.toLowerCase().includes('alex')) {
    return `Alex Rivera. React, Next.js, TypeScript, Tailwind CSS, Node.js, Express, MongoDB. Stanford University. CGPA: 3.92. E-Commerce Dashboard, Task Manager API. AWS Cloud Practitioner, Meta Developer.`;
  }
  if (fileName.toLowerCase().includes('jane') || fileName.toLowerCase().includes('smith')) {
    return `Jane Smith. Python, PyTorch, TensorFlow, SQL, FastAPI, Pandas, Docker. MIT. CGPA: 3.85. Customer Churn Predictor. Deep Learning Specialization.`;
  }
  return text.length > 50 ? text : `Student Name. Skills: React, TypeScript, Node.js, Python. Education: State College. CGPA: 3.65. Projects: Chat Web App, API Server. Certifications: Google Cloud.`;
};

// 1. UPLOAD & PARSE RESUME (STUDENT)
router.post('/parse-resume', authenticateJWT, authorizeRoles(['student']), upload.single('resume'), async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No resume file uploaded.' });
    }

    const fileText = parseBufferToText(req.file.buffer, req.file.originalname);
    
    // Call AI Resume Parser
    const parsedData = await aiService.parseResume(req.file.originalname, fileText);

    // Call ATS Score calculation
    const atsResult = await aiService.calculateATSScore(parsedData);

    // Automatically update student profile
    const updatedProfile = await dbStore.profiles.updateByUserId(req.user!.userId, {
      skills: parsedData.skills,
      cgpa: parsedData.cgpa,
      education: parsedData.education,
      projects: parsedData.projects,
      certifications: parsedData.certifications,
      resumeUrl: `/resumes/${req.file.originalname}`,
      resumeParsedData: parsedData,
      atsScore: atsResult.score,
      atsSuggestions: atsResult.suggestions
    });

    // Create Notification
    await dbStore.notifications.create({
      userId: req.user!.userId,
      title: 'Resume Parsed & Profile Synced',
      message: `Your resume has been successfully parsed. ATS Score: ${atsResult.score}/100. Profile updated!`,
      type: 'success'
    });

    res.json({
      message: 'Resume parsed and profile updated successfully.',
      parsedData,
      atsScore: atsResult.score,
      atsSuggestions: atsResult.suggestions,
      profile: updatedProfile
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. SKILL GAP ANALYSIS
router.get('/skill-gap/:internshipId', authenticateJWT, authorizeRoles(['student']), async (req: AuthenticatedRequest, res) => {
  try {
    const job = await dbStore.internships.findById(req.params.internshipId);
    if (!job) return res.status(404).json({ error: 'Internship position not found.' });

    const profile = await dbStore.profiles.findByUserId(req.user!.userId);
    if (!profile) return res.status(404).json({ error: 'Student profile not found.' });

    const gap = aiService.analyzeSkillGap(profile.skills || [], job.skills_required || []);
    res.json(gap);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. GET CHAT HISTORY
router.get('/chat', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    let chat = await dbStore.chats.findByUserId(req.user!.userId);
    if (!chat) {
      // Create default starting chat
      chat = await dbStore.chats.addMessage(
        req.user!.userId,
        'bot',
        `Hello ${req.user!.email}! I am your AI Career Assistant. You can ask me to help find internships, grade your resume, conduct a skill gap analysis, or generate mock interview questions. What can I do for you today?`
      );
    }
    res.json(chat);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. SEND CHATBOT MESSAGE
router.post('/chat', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message cannot be empty.' });

    // Fetch student profile context for tailored responses
    const profile = await dbStore.profiles.findByUserId(req.user!.userId);

    // Save user message
    await dbStore.chats.addMessage(req.user!.userId, 'user', message);

    // Generate AI counselor message
    const botReply = await aiService.handleChatbotMessage(message, profile);

    // Save bot response
    const chat = await dbStore.chats.addMessage(req.user!.userId, 'bot', botReply);

    res.json(chat);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
export default router;
