import { Router, Response } from 'express';
import { dbStore } from '../models/dbStore';
import { authenticateJWT, authorizeRoles, AuthenticatedRequest } from '../middleware/auth';
import { aiService } from '../services/aiService';

const router = Router();

// 1. APPLY (STUDENT)
router.post('/', authenticateJWT, authorizeRoles(['student']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { internshipId, coverLetter } = req.body;
    if (!internshipId) return res.status(400).json({ error: 'Internship ID is required.' });

    const job = await dbStore.internships.findById(internshipId);
    if (!job) return res.status(404).json({ error: 'Internship position not found.' });

    const profile = await dbStore.profiles.findByUserId(req.user!.userId);
    if (!profile) return res.status(404).json({ error: 'Student profile not found.' });

    // Check if already applied
    const existingApps = await dbStore.applications.findAll({ studentId: req.user!.userId, internshipId });
    if (existingApps.length > 0) {
      return res.status(400).json({ error: 'You have already applied for this position.' });
    }

    // Compute AI match percentage and explanation on submission
    const matching = aiService.recommendInternship(profile, job);

    const app = await dbStore.applications.create({
      studentId: req.user!.userId,
      internshipId,
      resumeUrl: profile.resumeUrl || 'default_resume.pdf',
      coverLetter,
      matchPercentage: matching.matchPercentage,
      matchExplanation: matching.explanation
    });

    // Create Recruiter Notification
    const company = await dbStore.companies.findById(job.company_id);
    // Find recruiters in this company
    const allUsers = await dbStore.users.findAll();
    const recruiters = await Promise.all(
      allUsers
        .filter((u) => u.role === 'recruiter')
        .map(async (u) => {
          const rec = await dbStore.recruiters.findById(u._id);
          return rec?.company_id === job.company_id ? u._id : null;
        })
    );
    const activeRecs = recruiters.filter(Boolean) as string[];

    for (const recId of activeRecs) {
      await dbStore.notifications.create({
        userId: recId,
        title: 'New Application Received',
        message: `${req.user!.email} has applied for ${job.role} (${matching.matchPercentage}% match).`,
        type: 'info'
      });
    }

    // Create Student Notification
    await dbStore.notifications.create({
      userId: req.user!.userId,
      title: 'Application Submitted',
      message: `Your application for ${job.role} at ${company?.name || 'Company'} has been sent successfully.`,
      type: 'success'
    });

    res.status(201).json({ message: 'Application submitted successfully.', application: app });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. GET APPLICATIONS (ROLE-BASED & AI CANDIDATE RANKING)
router.get('/', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const role = req.user!.role;

    if (role === 'student') {
      const apps = await dbStore.applications.findAll({ studentId: req.user!.userId });
      // Enrich with job info
      const enrichedApps = await Promise.all(
        apps.map(async (app: any) => {
          const job = await dbStore.internships.findById(app.internshipId);
          return { ...app, internship: job };
        })
      );
      return res.json(enrichedApps);
    } 
    
    if (role === 'recruiter') {
      const rec = await dbStore.recruiters.findById(req.user!.userId);
      if (!rec || !rec.company_id) {
        return res.status(400).json({ error: 'Recruiter is not linked to any company.' });
      }

      const apps = await dbStore.applications.findAll({ recruiterCompanyId: rec.company_id });
      
      // Enrich with applicant user & profile details
      const enrichedApps = await Promise.all(
        apps.map(async (app: any) => {
          const studentUser = await dbStore.users.findById(app.studentId);
          const studentProfile = await dbStore.profiles.findByUserId(app.studentId);
          const job = await dbStore.internships.findById(app.internshipId);
          return {
            ...app,
            studentName: studentUser?.name || 'Student',
            studentEmail: studentUser?.email || '',
            studentProfilePic: studentUser?.profilePic || '',
            studentProfile,
            internship: job
          };
        })
      );

      // AI Candidate Ranking: Sort recruiter list by match percentage
      enrichedApps.sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));

      return res.json(enrichedApps);
    }

    if (role === 'admin') {
      const apps = await dbStore.applications.findAll();
      const enrichedApps = await Promise.all(
        apps.map(async (app: any) => {
          const studentUser = await dbStore.users.findById(app.studentId);
          const job = await dbStore.internships.findById(app.internshipId);
          return {
            ...app,
            studentName: studentUser?.name || 'Student',
            studentEmail: studentUser?.email || '',
            internship: job
          };
        })
      );
      return res.json(enrichedApps);
    }

    res.status(403).json({ error: 'Role access denied.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. GET APPLICATION BY ID
router.get('/:id', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const app = await dbStore.applications.findById(req.params.id);
    if (!app) return res.status(404).json({ error: 'Application record not found.' });

    // Validate access
    if (req.user!.role === 'student' && app.studentId !== req.user!.userId) {
      return res.status(403).json({ error: 'Unauthorized to view this application.' });
    }

    const job = await dbStore.internships.findById(app.internshipId);
    if (!job) return res.status(404).json({ error: 'Internship position not found.' });

    if (req.user!.role === 'recruiter') {
      const rec = await dbStore.recruiters.findById(req.user!.userId);
      if (!rec || rec.company_id !== job.company_id) {
        return res.status(403).json({ error: 'Unauthorized to view this application.' });
      }
    }

    const studentUser = await dbStore.users.findById(app.studentId);
    const studentProfile = await dbStore.profiles.findByUserId(app.studentId);

    res.json({
      ...app,
      studentName: studentUser?.name || 'Student',
      studentEmail: studentUser?.email || '',
      studentProfilePic: studentUser?.profilePic || '',
      studentProfile,
      internship: job
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. UPDATE APPLICATION STATUS (RECRUITER)
router.put('/:id/status', authenticateJWT, authorizeRoles(['recruiter', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, interviewDateTime, interviewLink, notes, salary, startDate } = req.body;
    if (!status) return res.status(400).json({ error: 'Target status is required.' });

    const app = await dbStore.applications.findById(req.params.id);
    if (!app) return res.status(404).json({ error: 'Application not found.' });

    const job = await dbStore.internships.findById(app.internshipId);
    if (!job) return res.status(404).json({ error: 'Internship position not found.' });

    // Validate ownership
    if (req.user!.role === 'recruiter') {
      const rec = await dbStore.recruiters.findById(req.user!.userId);
      if (!rec || rec.company_id !== job.company_id) {
        return res.status(403).json({ error: 'Unauthorized to modify this application.' });
      }
    }

    const updateFields: any = { status };

    // Smart status operations
    if (status === 'Interview Scheduled') {
      // Auto-generate AI practice questions based on role
      const aiQuestions = await aiService.generateInterviewQuestions(job.role, job.description);
      updateFields.interviewDetails = {
        dateTime: interviewDateTime ? new Date(interviewDateTime) : new Date(Date.now() + 24 * 60 * 60 * 1000),
        link: interviewLink || 'https://zoom.us/j/default',
        notes: notes || 'Interview schedule confirmation.',
        aiQuestions
      };
    } else if (status === 'Selected') {
      updateFields.offerDetails = {
        salary: salary || job.stipend || 'TBD',
        startDate: startDate ? new Date(startDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        notes: notes || 'Congratulations! We are pleased to offer you this internship.'
      };
    }

    const updatedApp = await dbStore.applications.update(req.params.id, updateFields);

    // Notify Student
    await dbStore.notifications.create({
      userId: app.studentId,
      title: `Application Status: ${status}`,
      message: `Your application status for ${job.role} has been updated to "${status}".`,
      type: status === 'Selected' ? 'success' : status === 'Rejected' ? 'alert' : 'info'
    });

    res.json({ message: 'Application status updated successfully.', application: updatedApp });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
export default router;
