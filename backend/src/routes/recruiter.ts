import { Router, Response } from 'express';
import { dbStore } from '../models/dbStore';
import { authenticateJWT, authorizeRoles, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// 1. GET RECRUITER COMPANY PROFILE
router.get('/company', authenticateJWT, authorizeRoles(['recruiter']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const recruiter = await dbStore.recruiters.findById(req.user!.userId);
    if (!recruiter) {
      return res.status(404).json({ error: 'Recruiter profile not found.' });
    }

    if (!recruiter.company_id) {
      return res.json({ company: null });
    }

    const company = await dbStore.companies.findById(recruiter.company_id);
    res.json({ company });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. UPDATE RECRUITER COMPANY PROFILE
router.put('/company', authenticateJWT, authorizeRoles(['recruiter']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, logo, description, website, location } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Company name is required.' });
    }

    const recruiter = await dbStore.recruiters.findById(req.user!.userId);
    if (!recruiter) {
      return res.status(404).json({ error: 'Recruiter profile not found.' });
    }

    let company;
    if (!recruiter.company_id) {
      // Create new company and link it
      company = await dbStore.companies.create({
        name,
        logo: logo || '',
        description: description || '',
        website: website || '',
        location: location || '',
        is_verified: false
      });
      await dbStore.recruiters.update(req.user!.userId, { company_id: company.id });
    } else {
      // Update existing company
      company = await dbStore.companies.update(recruiter.company_id, {
        name,
        logo: logo || '',
        description: description || '',
        website: website || '',
        location: location || ''
      });
    }

    res.json({ message: 'Company profile updated successfully.', company });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
export default router;
