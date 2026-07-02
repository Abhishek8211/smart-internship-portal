import { Router, Response } from 'express';
import { dbStore } from '../models/dbStore';
import { authenticateJWT, authorizeRoles, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// 1. ADMIN METRICS/STATS
router.get('/stats', authenticateJWT, authorizeRoles(['admin']), async (req: AuthenticatedRequest, res) => {
  try {
    const users = await dbStore.users.findAll();
    const internships = await dbStore.internships.findAll({});
    const applications = await dbStore.applications.findAll();
    const companies = await dbStore.companies.findAll();

    const studentsCount = users.filter((u) => u.role === 'student').length;
    const recruitersCount = users.filter((u) => u.role === 'recruiter').length;
    const activeJobsCount = internships.filter((i) => i.status === 'Active').length;

    // Placed rate (Selected / Total Applications)
    const selectedCount = applications.filter((a) => a.status === 'Selected').length;
    const placementRate = applications.length > 0 ? Math.round((selectedCount / applications.length) * 100) : 0;

    // Fetch skills from student profiles
    const profiles = await Promise.all(
      users.filter(u => u.role === 'student').map(u => dbStore.profiles.findByUserId(u._id))
    );
    const skillCounts: { [key: string]: number } = {};
    profiles.filter(Boolean).forEach((p: any) => {
      p.skills?.forEach((skill: string) => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
    });

    // Sort skills by count
    const topSkills = Object.entries(skillCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    res.json({
      metrics: {
        totalStudents: studentsCount,
        totalRecruiters: recruitersCount,
        totalCompanies: companies.length,
        activeJobs: activeJobsCount,
        totalApplications: applications.length,
        placementRate,
        selectedCandidates: selectedCount
      },
      topSkills,
      recentActivity: [
        { id: 1, action: 'New Student Registration', details: `${studentsCount} total students now active`, time: 'Just now' },
        { id: 2, action: 'Internship Posted', details: 'Vercel added Full-Stack position', time: '1 hour ago' },
        { id: 3, action: 'Candidate Hired', details: 'Alex Rivera hired at Stripe', time: 'Yesterday' }
      ]
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. LIST ALL USERS
router.get('/users', authenticateJWT, authorizeRoles(['admin']), async (req: AuthenticatedRequest, res) => {
  try {
    const list = await dbStore.users.findAll();
    const sanitized = list.map((u: any) => ({
      id: u._id,
      email: u.email,
      role: u.role,
      name: u.name,
      isVerified: u.isVerified,
      createdAt: u.createdAt
    }));
    res.json(sanitized);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. SUSPEND USER
router.put('/users/:id/suspend', authenticateJWT, authorizeRoles(['admin']), async (req: AuthenticatedRequest, res) => {
  try {
    // To suspend, in our schema we can toggle isVerified or log status
    const user = await dbStore.users.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    // Toggle verification status or flag
    const updated = await dbStore.users.update(req.params.id, { isVerified: !user.isVerified });
    res.json({ message: 'User verification status toggled successfully.', user: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. APPROVE/VERIFY COMPANY
router.put('/companies/:id/verify', authenticateJWT, authorizeRoles(['admin']), async (req: AuthenticatedRequest, res) => {
  try {
    const company = await dbStore.companies.findById(req.params.id);
    if (!company) return res.status(404).json({ error: 'Company not found.' });

    const updated = await dbStore.companies.update(req.params.id, { is_verified: !company.is_verified });
    res.json({ message: 'Company verification status toggled successfully.', company: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. APPROVE INTERNSHIP POSTING
router.put('/internships/:id/approve', authenticateJWT, authorizeRoles(['admin']), async (req: AuthenticatedRequest, res) => {
  try {
    const job = await dbStore.internships.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Internship posting not found.' });

    const updated = await dbStore.internships.update(req.params.id, { status: 'Active' });
    res.json({ message: 'Internship posting approved successfully.', job: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
export default router;
