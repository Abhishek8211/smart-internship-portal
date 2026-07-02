import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import { dbStore } from '../models/dbStore';
import { authenticateJWT, authorizeRoles, AuthenticatedRequest } from '../middleware/auth';
import { aiService } from '../services/aiService';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'sip_jwt_secret_token_2026_key';

// Soft Auth Helper for Match Percentage overlay during search
const getUserIdFromHeader = (req: AuthenticatedRequest): { userId: string; role: string } | null => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      return { userId: decoded.userId, role: decoded.role };
    } catch (e) {
      return null;
    }
  }
  return null;
};

// 1. GET ALL WITH FILTERS & AI RECOMMENDATIONS
router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const { search, mode, location, sort, limit, offset } = req.query;

    const parsedLimit = limit ? Math.min(50, parseInt(limit as string)) : 20;
    const parsedOffset = offset ? parseInt(offset as string) : 0;

    const list = await dbStore.internships.findAll({
      search: search as string,
      mode: mode as string,
      location: location as string,
      sort: sort as string,
      limit: parsedLimit,
      offset: parsedOffset
    });

    // Check if user is student to compute AI Match Percentage
    const userSession = getUserIdFromHeader(req);
    if (userSession && userSession.role === 'student') {
      const profile = await dbStore.profiles.findByUserId(userSession.userId);
      if (profile) {
        const enrichedList = list.map((job: any) => {
          const recommendation = aiService.recommendInternship(profile, job);
          return {
            ...job,
            matchPercentage: recommendation.matchPercentage,
            matchExplanation: recommendation.explanation
          };
        });
        res.setHeader('Cache-Control', 'public, max-age=15, stale-while-revalidate=30');
        return res.json(enrichedList);
      }
    }

    res.setHeader('Cache-Control', 'public, max-age=15, stale-while-revalidate=30');
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. GET BY ID (WITH MATCH DETAILS)
router.get('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const job = await dbStore.internships.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Internship position not found.' });

    const userSession = getUserIdFromHeader(req);
    if (userSession && userSession.role === 'student') {
      const profile = await dbStore.profiles.findByUserId(userSession.userId);
      if (profile) {
        const recommendation = aiService.recommendInternship(profile, job);
        const gapAnalysis = aiService.analyzeSkillGap(profile.skills || [], job.skills_required || []);
        return res.json({
          ...job,
          matchPercentage: recommendation.matchPercentage,
          matchExplanation: recommendation.explanation,
          skillGap: gapAnalysis
        });
      }
    }

    res.json(job);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. CREATE INTERNSHIP (RECRUITER)
router.post('/', authenticateJWT, authorizeRoles(['recruiter', 'admin']), async (req: AuthenticatedRequest, res) => {
  try {
    const { role, description, location, mode, stipend, duration, skills_required } = req.body;
    if (!role || !description || !location || !mode || !stipend || !duration || !skills_required) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Find Recruiter's company
    const rec = await dbStore.recruiters.findById(req.user!.userId);
    if (!rec || !rec.company_id) {
      return res.status(400).json({ error: 'Recruiter account must be linked to a company to post jobs.' });
    }

    const job = await dbStore.internships.create({
      company_id: rec.company_id,
      role,
      description,
      location,
      mode,
      stipend,
      duration,
      skills_required
    });

    res.status(201).json({ message: 'Internship position posted successfully.', job });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. UPDATE INTERNSHIP (RECRUITER/ADMIN)
router.put('/:id', authenticateJWT, authorizeRoles(['recruiter', 'admin']), async (req: AuthenticatedRequest, res) => {
  try {
    const job = await dbStore.internships.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Position not found.' });

    // Validate ownership
    if (req.user!.role === 'recruiter') {
      const rec = await dbStore.recruiters.findById(req.user!.userId);
      if (!rec || rec.company_id !== job.company_id) {
        return res.status(403).json({ error: 'Unauthorized to modify this posting.' });
      }
    }

    const updated = await dbStore.internships.update(req.params.id, req.body);
    res.json({ message: 'Internship position updated successfully.', job: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. DELETE INTERNSHIP (RECRUITER/ADMIN)
router.delete('/:id', authenticateJWT, authorizeRoles(['recruiter', 'admin']), async (req: AuthenticatedRequest, res) => {
  try {
    const job = await dbStore.internships.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Position not found.' });

    // Validate ownership
    if (req.user!.role === 'recruiter') {
      const rec = await dbStore.recruiters.findById(req.user!.userId);
      if (!rec || rec.company_id !== job.company_id) {
        return res.status(403).json({ error: 'Unauthorized to delete this posting.' });
      }
    }

    await dbStore.internships.delete(req.params.id);
    res.json({ message: 'Internship position deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. SAVE INTERNSHIP
router.post('/:id/save', authenticateJWT, authorizeRoles(['student']), async (req: AuthenticatedRequest, res) => {
  try {
    const profile = await dbStore.profiles.findByUserId(req.user!.userId);
    if (!profile) return res.status(404).json({ error: 'Student profile not found.' });

    const saved = profile.savedInternships || [];
    if (!saved.includes(req.params.id)) {
      saved.push(req.params.id);
      await dbStore.profiles.updateByUserId(req.user!.userId, { savedInternships: saved });
    }

    res.json({ message: 'Internship saved to bookmarks successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. UNSAVE INTERNSHIP
router.post('/:id/unsave', authenticateJWT, authorizeRoles(['student']), async (req: AuthenticatedRequest, res) => {
  try {
    const profile = await dbStore.profiles.findByUserId(req.user!.userId);
    if (!profile) return res.status(404).json({ error: 'Student profile not found.' });

    let saved = profile.savedInternships || [];
    saved = saved.filter((id: string) => id !== req.params.id);
    await dbStore.profiles.updateByUserId(req.user!.userId, { savedInternships: saved });

    res.json({ message: 'Internship removed from bookmarks successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
export default router;
