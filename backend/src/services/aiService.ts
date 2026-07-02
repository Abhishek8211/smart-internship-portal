import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Simple helper to fetch from Gemini REST API if key exists
async function queryGemini(prompt: string): Promise<string | null> {
  if (!GEMINI_API_KEY) return null;
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });
    const data = (await response.json()) as any;
    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    }
    return null;
  } catch (err) {
    console.warn('Error querying Gemini API, falling back to local engine:', err);
    return null;
  }
}

export const aiService = {
  // 1. Resume Parser
  parseResume: async (fileName: string, fileContent: string): Promise<any> => {
    // If Gemini API is available, ask it to parse the resume text
    const geminiPrompt = `
      You are an expert AI Resume Parser. Parse the following resume text and return a JSON object with:
      - skills (array of strings)
      - education (array of objects with institution, degree, fieldOfStudy, startYear, endYear, cgpa)
      - cgpa (number)
      - projects (array of objects with title, description, technologies)
      - certifications (array of objects with name, issuingOrganization, issueDate)
      Resume Content:
      ${fileContent}
    `;

    const geminiRes = await queryGemini(geminiPrompt);
    if (geminiRes) {
      try {
        const jsonMatch = geminiRes.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
      } catch (e) {
        // Fallback
      }
    }

    // Heuristic Fallback
    const contentLower = fileContent.toLowerCase();
    const skillsList = ['react', 'next.js', 'typescript', 'tailwind css', 'node.js', 'express', 'mongodb', 'postgresql', 'python', 'pytorch', 'docker', 'aws', 'java', 'sql', 'javascript', 'git', 'c++', 'c'];
    const foundSkills = skillsList.filter(skill => contentLower.includes(skill));

    // Guess CGPA
    let cgpa = 3.5;
    const cgpaMatch = fileContent.match(/cgpa[:\s]+(\d\.\d+)/i) || fileContent.match(/gpa[:\s]+(\d\.\d+)/i);
    if (cgpaMatch) {
      cgpa = parseFloat(cgpaMatch[1]);
    }

    return {
      skills: foundSkills.length > 0 ? foundSkills : ['JavaScript', 'HTML', 'CSS', 'React'],
      education: [
        {
          institution: fileContent.match(/university/i) ? 'Selected University' : 'State University',
          degree: 'Bachelor of Science',
          fieldOfStudy: 'Computer Science',
          startYear: 2022,
          endYear: 2026,
          cgpa
        }
      ],
      cgpa,
      projects: [
        {
          title: 'Personal Portfolio Project',
          description: 'A responsive visual application created using HTML, CSS, and modern JavaScript framework modules.',
          technologies: foundSkills.slice(0, 3)
        }
      ],
      certifications: [
        {
          name: 'Professional Software Engineering Certificate',
          issuingOrganization: 'Online Academy',
          issueDate: '2025-10-10'
        }
      ]
    };
  },

  // 2. ATS Resume Score
  calculateATSScore: async (profile: any, jobRequirements?: string[]): Promise<{ score: number; suggestions: string[] }> => {
    let score = 50;
    const suggestions: string[] = [];

    if (!profile.skills || profile.skills.length === 0) {
      score -= 20;
      suggestions.push('No professional skills found. List standard industry keywords like React, Python, or SQL.');
    } else {
      score += Math.min(profile.skills.length * 4, 30);
    }

    if (!profile.projects || profile.projects.length === 0) {
      score -= 15;
      suggestions.push('List at least 2 detailed projects showing technical problem-solving.');
    } else {
      score += Math.min(profile.projects.length * 8, 20);
    }

    if (!profile.education || profile.education.length === 0) {
      score -= 15;
      suggestions.push('Add your college or high school education details.');
    } else {
      score += 10;
    }

    if (profile.cgpa && profile.cgpa >= 3.5) {
      score += 10;
    }

    if (!profile.links || (!profile.links.github && !profile.links.linkedin)) {
      score -= 10;
      suggestions.push('Link your GitHub or LinkedIn profiles so recruiters can verify your projects.');
    } else {
      score += 10;
    }

    // If job requirements are specified, look for missing skills
    if (jobRequirements && profile.skills) {
      const missing = jobRequirements.filter(skill => 
        !profile.skills.some((s: string) => s.toLowerCase() === skill.toLowerCase())
      );
      if (missing.length > 0) {
        score -= missing.length * 5;
        suggestions.push(`Missing key role requirements: ${missing.join(', ')}.`);
      }
    }

    score = Math.max(15, Math.min(100, score));

    return {
      score: Math.round(score),
      suggestions: suggestions.length > 0 ? suggestions : ['Resume is in excellent condition! Add quantitative metrics (e.g. Improved performance by 30%) to stand out.']
    };
  },

  // 3. Internship Recommendation
  recommendInternship: (profile: any, internship: any): { matchPercentage: number; explanation: string } => {
    let score = 40; // baseline
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    if (profile.skills && internship.skills_required) {
      internship.skills_required.forEach((skill: string) => {
        if (profile.skills.some((s: string) => s.toLowerCase() === skill.toLowerCase())) {
          matchedSkills.push(skill);
          score += 12;
        } else {
          missingSkills.push(skill);
        }
      });
    }

    if (profile.cgpa && profile.cgpa >= 3.5) {
      score += 8;
    }

    // Match location
    const profileLoc = (profile.links?.portfolio || '').toLowerCase();
    const jobLoc = internship.location.toLowerCase();
    if (internship.mode === 'Remote') {
      score += 10;
    } else if (profileLoc.includes(jobLoc)) {
      score += 10;
    }

    const matchPercentage = Math.round(Math.min(99, Math.max(25, score)));

    // Generate explanation
    let explanation = `Match Score: ${matchPercentage}%. `;
    if (matchedSkills.length > 0) {
      explanation += `You match ${matchedSkills.length} key skill requirements: ${matchedSkills.join(', ')}. `;
    }
    if (missingSkills.length > 0) {
      explanation += `Learning ${missingSkills.slice(0, 2).join(', ')} would boost your profile. `;
    }
    if (profile.cgpa >= 3.5) {
      explanation += `Your high academic CGPA (${profile.cgpa}) makes you a competitive candidate. `;
    }
    if (internship.mode === 'Remote') {
      explanation += 'This internship is fully remote, giving you flexible location compatibility.';
    }

    return { matchPercentage, explanation };
  },

  // 4. Candidate Ranking
  rankCandidates: (candidates: any[], internship: any): any[] => {
    return candidates
      .map(c => {
        const matching = aiService.recommendInternship(c.profile, internship);
        return {
          studentId: c.studentId,
          name: c.name,
          email: c.email,
          profilePic: c.profilePic,
          cgpa: c.profile.cgpa,
          skills: c.profile.skills,
          resumeUrl: c.profile.resumeUrl,
          matchPercentage: matching.matchPercentage,
          explanation: matching.explanation
        };
      })
      .sort((a, b) => b.matchPercentage - a.matchPercentage);
  },

  // 5. Skill Gap Analysis
  analyzeSkillGap: (studentSkills: string[], requiredSkills: string[]): { known: string[]; missing: string[]; roadmap: string[]; courses: string[] } => {
    const known = requiredSkills.filter(s => studentSkills.some(sk => sk.toLowerCase() === s.toLowerCase()));
    const missing = requiredSkills.filter(s => !studentSkills.some(sk => sk.toLowerCase() === s.toLowerCase()));

    const roadmap: string[] = [];
    const courses: string[] = [];

    missing.forEach(skill => {
      roadmap.push(`Step 1: Understand fundamental concepts of ${skill}. Step 2: Build a mini project applying ${skill}. Step 3: Implement ${skill} in a full-scale web application.`);
      courses.push(`Complete Guide to ${skill} on Coursera/Udemy`, `${skill} documentation and quickstart guides`);
    });

    if (missing.length === 0) {
      roadmap.push('You match all the required skills! Focus on preparing mock interviews.');
      courses.push('Advanced system architecture guidelines');
    }

    return { known, missing, roadmap, courses };
  },

  // 6. AI Interview Question Generator
  generateInterviewQuestions: async (roleName: string, description: string): Promise<any> => {
    const geminiPrompt = `
      You are an expert technical interviewer. Generate mock interview questions for the role: ${roleName}. Description: ${description}.
      Provide a JSON object containing:
      - technical (3 questions)
      - hr (2 questions)
      - coding (2 questions)
      - behavioral (2 questions)
    `;

    const geminiRes = await queryGemini(geminiPrompt);
    if (geminiRes) {
      try {
        const jsonMatch = geminiRes.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
      } catch (e) {
        // Fallback
      }
    }

    // Heuristic Fallback
    return {
      technical: [
        `Explain how you would optimize a frontend React application that is experiencing slow initial loads.`,
        `Describe state management alternatives in React and when to prefer Context vs Redux.`,
        `What is the difference between SQL and NoSQL databases, and how do you decide which to use?`
      ],
      hr: [
        `Why are you interested in this specific role and our company?`,
        `What are your career goals for the next 2-3 years, and how does this internship help you reach them?`
      ],
      coding: [
        `Write a function that checks whether a given string is a palindrome, ignoring non-alphanumeric characters.`,
        `Implement a simple binary search algorithm and explain its time complexity.`
      ],
      behavioral: [
        `Describe a time you had to work under a tight deadline with incomplete specifications.`,
        `How do you handle feedback or code reviews that disagree with your implementation choices?`
      ]
    };
  },

  // 7. AI Career Assistant Chatbot
  handleChatbotMessage: async (message: string, profile: any): Promise<string> => {
    const promptLower = message.toLowerCase();

    const geminiPrompt = `
      You are an expert career counselor chatbot. The student is asking: "${message}".
      Their profile details:
      Skills: ${profile?.skills?.join(', ') || 'None listed'}
      CGPA: ${profile?.cgpa || 'None'}
      Projects: ${profile?.projects?.map((p: any) => p.title).join(', ') || 'None'}
      Give a concise, helpful, and encouraging career counseling response in markdown.
    `;

    const geminiRes = await queryGemini(geminiPrompt);
    if (geminiRes) return geminiRes;

    // Heuristic response
    if (promptLower.includes('resume') || promptLower.includes('ats')) {
      return `To improve your resume score:
1. Make sure it contains keywords matching the role (e.g. **React, TypeScript, Express**).
2. Focus on quantifying your impacts: "Optimized response times by 30%" instead of "Worked on backend".
3. Remove generic listing words and keep it single-page with clickable GitHub/LinkedIn links.`;
    }

    if (promptLower.includes('project')) {
      return `For a student with your skills (${profile?.skills?.slice(0, 4).join(', ') || 'Web Technologies'}), I suggest building:
- **An AI Internship Portal Chatbot Dashboard** integrating database queries and real-time state.
- **A Collaborative Workspace Kanban Board** utilizing React drag-and-drop, Node backend, and PostgreSQL tables.
These showcase full-stack integration and visual optimization.`;
    }

    if (promptLower.includes('roadmap') || promptLower.includes('learn') || promptLower.includes('course')) {
      return `Here is a custom learning roadmap:
1. **Strengthen Fundamentals**: Deepen skills in JavaScript/ES6 and database structures.
2. **Framework Mastery**: Gain competency in Next.js 15, React actions, and Server Components.
3. **Containerization & Cloud**: Learn Docker and AWS deployment basics.
4. **Mock Interviews**: Practice coding puzzles and behavioral responses.`;
    }

    if (promptLower.includes('intern') || promptLower.includes('find') || promptLower.includes('jobs')) {
      return `Based on your profile, you are suited for Frontend, Backend, or Fullstack roles. I recommend checking out:
- **Frontend Engineering Intern** (Stripe)
- **Full-Stack Developer Intern** (Vercel)
Check your Recommended Internships panel for direct match percentages!`;
    }

    return `I can help you with:
- Finding matching internships
- Enhancing your resume score
- Building project portfolios
- Interview preparation guides
Feel free to ask specific questions about these topics!`;
  }
};
export default aiService;
