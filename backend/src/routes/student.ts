import { Router, Response } from 'express';
import { dbStore } from '../models/dbStore';
import { authenticateJWT, authorizeRoles, AuthenticatedRequest } from '../middleware/auth';
import { aiService } from '../services/aiService';

const router = Router();

// 1. GET STUDENT PROFILE
router.get('/profile', authenticateJWT, authorizeRoles(['student']), async (req: AuthenticatedRequest, res) => {
  try {
    const profile = await dbStore.profiles.findByUserId(req.user!.userId);
    if (!profile) {
      // Create empty profile if not found
      const newProf = await dbStore.profiles.create({ user: req.user!.userId });
      return res.json(newProf);
    }
    res.json(profile);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. UPDATE PROFILE
router.put('/profile', authenticateJWT, authorizeRoles(['student']), async (req: AuthenticatedRequest, res) => {
  try {
    const { skills, education, cgpa, projects, certifications, links } = req.body;
    
    const currentProfile = await dbStore.profiles.findByUserId(req.user!.userId);
    const updatedFields: any = {
      skills,
      education,
      cgpa,
      projects,
      certifications,
      links
    };

    // Re-grade ATS Score when student updates profile details
    if (skills || projects || education) {
      const atsResult = await aiService.calculateATSScore({
        skills: skills || currentProfile?.skills || [],
        projects: projects || currentProfile?.projects || [],
        education: education || currentProfile?.education || [],
        links: links || currentProfile?.links || {},
        cgpa: cgpa || currentProfile?.cgpa || 0
      });
      updatedFields.atsScore = atsResult.score;
      updatedFields.atsSuggestions = atsResult.suggestions;
    }

    const updated = await dbStore.profiles.updateByUserId(req.user!.userId, updatedFields);
    res.json({ message: 'Profile updated successfully.', profile: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. MOCK GITHUB IMPORT
router.post('/import-github', authenticateJWT, authorizeRoles(['student']), async (req: AuthenticatedRequest, res) => {
  try {
    const { githubUsername } = req.body;
    if (!githubUsername) return res.status(400).json({ error: 'GitHub username is required.' });

    // Simulate calling GitHub API
    // We mock returning repositories and language statistics
    const mockGithubData = {
      repos: [
        { name: 'nextjs-saas-template', description: 'A template built with Next.js, TypeScript and Tailwind.', language: 'TypeScript' },
        { name: 'express-microservices', description: 'Express backend connecting to MongoDB and RabbitMQ.', language: 'JavaScript' },
        { name: 'python-data-classifier', description: 'Classification of tabular datasets using pandas.', language: 'Python' }
      ],
      skills: ['TypeScript', 'JavaScript', 'Python', 'Next.js', 'Express', 'Tailwind CSS']
    };

    // Get current profile
    const profile = await dbStore.profiles.findByUserId(req.user!.userId);
    const currentSkills = profile?.skills || [];
    const currentProjects = profile?.projects || [];

    // Merge skills
    const mergedSkills = Array.from(new Set([...currentSkills, ...mockGithubData.skills]));

    // Add imported repositories as projects
    const mergedProjects = [...currentProjects];
    mockGithubData.repos.forEach(repo => {
      if (!mergedProjects.some(p => p.title.toLowerCase() === repo.name.toLowerCase())) {
        mergedProjects.push({
          title: repo.name,
          description: `${repo.description} (Imported from GitHub)`,
          technologies: [repo.language]
        });
      }
    });

    // Re-grade ATS Score
    const atsResult = await aiService.calculateATSScore({
      skills: mergedSkills,
      projects: mergedProjects,
      education: profile?.education || [],
      links: { ...profile?.links, github: `https://github.com/${githubUsername}` },
      cgpa: profile?.cgpa || 0
    });

    const updated = await dbStore.profiles.updateByUserId(req.user!.userId, {
      skills: mergedSkills,
      projects: mergedProjects,
      links: { ...profile?.links, github: `https://github.com/${githubUsername}` },
      atsScore: atsResult.score,
      atsSuggestions: atsResult.suggestions
    });

    await dbStore.notifications.create({
      userId: req.user!.userId,
      title: 'GitHub Data Imported',
      message: `Successfully imported ${mockGithubData.repos.length} repositories and updated skills.`,
      type: 'success'
    });

    res.json({ message: 'GitHub profile data imported successfully.', profile: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. MOCK LINKEDIN IMPORT
router.post('/import-linkedin', authenticateJWT, authorizeRoles(['student']), async (req: AuthenticatedRequest, res) => {
  try {
    const { linkedinUrl } = req.body;
    if (!linkedinUrl) return res.status(400).json({ error: 'LinkedIn URL is required.' });

    // Mock LinkedIn profile data
    const mockLinkedinData = {
      name: 'Imported Candidate Profile',
      education: [
        { institution: 'International Institute of Technology', degree: 'Bachelor of Technology', fieldOfStudy: 'Computer Engineering', startYear: 2022, endYear: 2026, cgpa: 3.8 }
      ],
      certifications: [
        { name: 'Google Data Analytics Certificate', issuingOrganization: 'Google', issueDate: '2025-02-14' }
      ]
    };

    const profile = await dbStore.profiles.findByUserId(req.user!.userId);
    const mergedEducation = profile?.education && profile.education.length > 0 ? profile.education : mockLinkedinData.education;
    const currentCertifications = profile?.certifications || [];

    const mergedCertifications = [...currentCertifications];
    mockLinkedinData.certifications.forEach(cert => {
      if (!mergedCertifications.some(c => c.name.toLowerCase() === cert.name.toLowerCase())) {
        mergedCertifications.push(cert);
      }
    });

    const updated = await dbStore.profiles.updateByUserId(req.user!.userId, {
      education: mergedEducation,
      certifications: mergedCertifications,
      links: { ...profile?.links, linkedin: linkedinUrl }
    });

    await dbStore.notifications.create({
      userId: req.user!.userId,
      title: 'LinkedIn Data Imported',
      message: 'Successfully imported education and certification profiles from LinkedIn.',
      type: 'success'
    });

    res.json({ message: 'LinkedIn profile data imported successfully.', profile: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. GET BOOKMARKED INTERNSHIPS
router.get('/bookmarks', authenticateJWT, authorizeRoles(['student']), async (req: AuthenticatedRequest, res) => {
  try {
    const profile = await dbStore.profiles.findByUserId(req.user!.userId);
    if (!profile) return res.status(404).json({ error: 'Profile not found.' });

    const savedIds = profile.savedInternships || [];
    const list = await Promise.all(savedIds.map(async (id: string) => await dbStore.internships.findById(id)));
    
    // Filter out nulls
    const filteredList = list.filter(Boolean);

    // Compute recommendations overlay
    const enrichedList = filteredList.map((job: any) => {
      const recommendation = aiService.recommendInternship(profile, job);
      return {
        ...job,
        matchPercentage: recommendation.matchPercentage,
        matchExplanation: recommendation.explanation
      };
    });

    res.json(enrichedList);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
export default router;
