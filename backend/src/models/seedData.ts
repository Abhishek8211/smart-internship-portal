import bcrypt from 'bcryptjs';

const salt = bcrypt.genSaltSync(10);
const passwordHash = bcrypt.hashSync('Password@123', salt);

export const sampleUsers = [
  {
    _id: 'usr_student_1',
    email: 'student@example.com',
    passwordHash: passwordHash,
    role: 'student' as const,
    name: 'Alex Rivera',
    isVerified: true,
    profilePic: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    createdAt: new Date()
  },
  {
    _id: 'usr_student_2',
    email: 'jane.smith@example.com',
    passwordHash: passwordHash,
    role: 'student' as const,
    name: 'Jane Smith',
    isVerified: true,
    profilePic: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    createdAt: new Date()
  },
  {
    _id: 'usr_recruiter_1',
    email: 'recruiter@stripe.com',
    passwordHash: passwordHash,
    role: 'recruiter' as const,
    name: 'Sarah Chen',
    isVerified: true,
    profilePic: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    createdAt: new Date()
  },
  {
    _id: 'usr_recruiter_2',
    email: 'hr@vercel.com',
    passwordHash: passwordHash,
    role: 'recruiter' as const,
    name: 'Marcus Aurelius',
    isVerified: true,
    profilePic: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    createdAt: new Date()
  },
  {
    _id: 'usr_admin_1',
    email: 'admin@portal.com',
    passwordHash: passwordHash,
    role: 'admin' as const,
    name: 'Chief Administrator',
    isVerified: true,
    profilePic: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    createdAt: new Date()
  }
];

export const sampleCompanies = [
  {
    id: 'comp_stripe',
    name: 'Stripe',
    logo: 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=100',
    description: 'Financial infrastructure for the internet. Millions of businesses of every size use Stripe to accept payments and manage their businesses online.',
    website: 'https://stripe.com',
    location: 'San Francisco, CA (Hybrid)',
    is_verified: true,
    created_at: new Date()
  },
  {
    id: 'comp_vercel',
    name: 'Vercel',
    logo: 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=100&q=80', // Replace with a clean logo
    description: 'Vercel provides the developer experience and infrastructure to build, deploy, and scale frontend web applications globally.',
    website: 'https://vercel.com',
    location: 'New York, NY (Remote)',
    is_verified: true,
    created_at: new Date()
  },
  {
    id: 'comp_google',
    name: 'Google',
    logo: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=100',
    description: 'Google’s mission is to organize the world’s information and make it universally accessible and useful.',
    website: 'https://google.com',
    location: 'Mountain View, CA (Office)',
    is_verified: true,
    created_at: new Date()
  }
];

export const sampleRecruiters = [
  {
    id: 'usr_recruiter_1',
    company_id: 'comp_stripe',
    phone: '+1 (555) 019-2834',
    title: 'Lead Talent Partner',
    is_verified: true,
    created_at: new Date()
  },
  {
    id: 'usr_recruiter_2',
    company_id: 'comp_vercel',
    phone: '+1 (555) 012-3456',
    title: 'Senior Engineering Recruiter',
    is_verified: true,
    created_at: new Date()
  }
];

export const sampleStudentProfiles = [
  {
    _id: 'prof_student_1',
    user: 'usr_student_1',
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Redux Toolkit', 'Node.js', 'Express', 'MongoDB'],
    education: [
      {
        institution: 'Stanford University',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
        startYear: 2023,
        endYear: 2027,
        cgpa: 3.92
      }
    ],
    cgpa: 3.92,
    projects: [
      {
        title: 'E-Commerce Dashboard',
        description: 'A premium responsive admin dashboard for managing products, sales analytics, and order fulfillment. Integrated with Recharts and Framer Motion.',
        technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Recharts'],
        link: 'https://github.com/alexrivera/ecommerce-dashboard'
      },
      {
        title: 'Task Manager API',
        description: 'RESTful API built with Express and MongoDB, featuring secure JWT-based session tokens and input validations via Zod.',
        technologies: ['Node.js', 'Express', 'MongoDB', 'JWT'],
        link: 'https://github.com/alexrivera/task-api'
      }
    ],
    certifications: [
      {
        name: 'AWS Certified Cloud Practitioner',
        issuingOrganization: 'Amazon Web Services',
        issueDate: '2025-05-15',
        credentialId: 'AWS-123456'
      },
      {
        name: 'Meta Front-End Developer Certificate',
        issuingOrganization: 'Meta',
        issueDate: '2025-11-20',
        credentialId: 'META-FE-987'
      }
    ],
    links: {
      portfolio: 'https://alexrivera.dev',
      github: 'https://github.com/alexrivera',
      linkedin: 'https://linkedin.com/in/alexrivera'
    },
    resumeUrl: '/resumes/alex_rivera_resume.pdf',
    resumeParsedData: {
      skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Express', 'MongoDB'],
      education: 'Stanford University (BS CS)',
      cgpa: '3.92',
      projects: 'E-Commerce Dashboard, Task Manager API',
      certifications: 'AWS Cloud Practitioner, Meta Front-End Developer'
    },
    atsScore: 88,
    atsSuggestions: [
      'Add more achievements with metric impacts (e.g. Optimized database query performance by 40%).',
      'Incorporate Docker or cloud deployment keywords into your skill list.',
      'Provide links for all listed major projects.'
    ],
    savedInternships: ['intern_stripe_fe']
  },
  {
    _id: 'prof_student_2',
    user: 'usr_student_2',
    skills: ['Python', 'PyTorch', 'TensorFlow', 'SQL', 'FastAPI', 'Pandas', 'Docker'],
    education: [
      {
        institution: 'MIT',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Data Science & AI',
        startYear: 2022,
        endYear: 2026,
        cgpa: 3.85
      }
    ],
    cgpa: 3.85,
    projects: [
      {
        title: 'Customer Churn Predictor',
        description: 'Machine Learning classifier analyzing user behavior datasets to forecast user churn rates. Achieved an F1-score of 92%.',
        technologies: ['Python', 'Scikit-Learn', 'Pandas', 'FastAPI'],
        link: 'https://github.com/janesmith/churn-predictor'
      }
    ],
    certifications: [
      {
        name: 'Deep Learning Specialization',
        issuingOrganization: 'DeepLearning.AI',
        issueDate: '2024-08-10'
      }
    ],
    links: {
      github: 'https://github.com/janesmith',
      linkedin: 'https://linkedin.com/in/janesmith'
    },
    resumeUrl: '',
    atsScore: 0,
    atsSuggestions: [],
    savedInternships: []
  }
];

export const sampleInternships = [
  {
    id: 'intern_stripe_fe',
    company_id: 'comp_stripe',
    role: 'Frontend Engineering Intern',
    description: 'Join the Stripe Dashboard UI team to build global financial workflows. You will design, develop, and deploy rich visual interfaces using React, Next.js, and TypeScript, working closely with designers and product managers to deliver seamless dashboard interactions.',
    location: 'San Francisco, CA',
    mode: 'Hybrid' as const,
    stipend: '$45/hour',
    duration: '12 Weeks',
    skills_required: ['React', 'TypeScript', 'Tailwind CSS', 'Redux Toolkit'],
    applicants_count: 14,
    status: 'Active' as const,
    posted_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
  },
  {
    id: 'intern_vercel_fs',
    company_id: 'comp_vercel',
    role: 'Full-Stack Developer Intern',
    description: 'Work directly on Vercel Next.js features and deployment integrations. This role spans backend route optimization using Express/Node.js, database integration (PostgreSQL, Redis), and frontend components. Experience building open-source packages is a plus.',
    location: 'Remote',
    mode: 'Remote' as const,
    stipend: '$50/hour',
    duration: '16 Weeks',
    skills_required: ['React', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL'],
    applicants_count: 28,
    status: 'Active' as const,
    posted_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
  },
  {
    id: 'intern_google_ai',
    company_id: 'comp_google',
    role: 'AI & Research Engineering Intern',
    description: 'Collaborate with researchers on testing modern Large Language Model weights, optimization setups, and dataset tokenizations. Requires proficiency in PyTorch, Python, and data processing workflows.',
    location: 'Mountain View, CA',
    mode: 'Office' as const,
    stipend: '$55/hour',
    duration: '12 Weeks',
    skills_required: ['Python', 'PyTorch', 'TensorFlow', 'Docker'],
    applicants_count: 42,
    status: 'Active' as const,
    posted_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
  }
];

export const sampleApplications = [
  {
    _id: 'app_1',
    studentId: 'usr_student_1',
    internshipId: 'intern_stripe_fe',
    status: 'Shortlisted' as const,
    resumeUrl: '/resumes/alex_rivera_resume.pdf',
    coverLetter: 'I am excited about Stripe’s API quality and would love to contribute to the UI dashboard team.',
    matchPercentage: 92,
    matchExplanation: 'Your profile has an outstanding match. You possess 4 out of 4 required skills: React, TypeScript, Tailwind CSS, and Redux. Your CGPA (3.92) exceeds the criteria, and you have built relevant dashboard projects.',
    timeline: [
      { status: 'Applied', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      { status: 'Under Review', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { status: 'Shortlisted', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }
    ],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  },
  {
    _id: 'app_2',
    studentId: 'usr_student_1',
    internshipId: 'intern_vercel_fs',
    status: 'Interview Scheduled' as const,
    resumeUrl: '/resumes/alex_rivera_resume.pdf',
    matchPercentage: 88,
    matchExplanation: 'Great match: You have 4 out of 5 required skills (React, Next.js, TypeScript, Node.js). You have built backend APIs and E-Commerce web apps, aligning closely with the full-stack role requirements.',
    timeline: [
      { status: 'Applied', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { status: 'Under Review', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      { status: 'Interview Scheduled', date: new Date() }
    ],
    interviewDetails: {
      dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      link: 'https://zoom.us/j/987654321',
      notes: 'Technical panel round focused on React 19 concurrent features and Node server performance optimization.',
      aiQuestions: {
        technical: [
          'What are Server Components vs Client Components in Next.js App Router, and how do they benefit performance?',
          'How would you handle race conditions or heavy traffic load in a Node.js Express server backend?',
          'Explain the virtual DOM algorithm changes, and how React 19 handles async action states and hooks like useActionState.'
        ],
        hr: [
          'Why do you want to intern at Vercel? How do you align with our developer-first core values?',
          'Describe a situation where you had a disagreement with a team member on a technical architecture path. How did you resolve it?'
        ],
        coding: [
          'Implement a custom throttle function in TypeScript that supports leading and trailing options.',
          'Given an array of intervals, merge all overlapping intervals and return the merged array sorted by start time.'
        ],
        behavioral: [
          'Tell me about a complex project where you had to learn a completely new technology under a very tight schedule.',
          'How do you handle context switching when working on multiple high-priority developer-facing bug fixes?'
        ]
      }
    },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  }
];

export const sampleNotifications = [
  {
    _id: 'notif_1',
    userId: 'usr_student_1',
    title: 'Application Shortlisted',
    message: 'Your application for Frontend Engineering Intern at Stripe has been shortlisted. The recruiter will reach out shortly.',
    type: 'success' as const,
    isRead: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    _id: 'notif_2',
    userId: 'usr_student_1',
    title: 'Interview Scheduled',
    message: 'Your interview for Full-Stack Developer Intern at Vercel has been scheduled for tomorrow at 10:00 AM.',
    type: 'info' as const,
    isRead: false,
    createdAt: new Date()
  }
];

export const sampleChats = [
  {
    _id: 'chat_student_1',
    userId: 'usr_student_1',
    messages: [
      {
        sender: 'bot' as const,
        text: 'Hello Alex! I am your AI Career Assistant. You can ask me to help find internships, grade your resume, conduct a skill gap analysis, or generate mock interview questions. What can I do for you today?',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        sender: 'user' as const,
        text: 'Can you recommend some web development projects to build my portfolio?',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000)
      },
      {
        sender: 'bot' as const,
        text: 'Certainly! To stand out for Frontend/Fullstack roles: \n\n1. **Real-time collaborative document editor** using WebSockets, Automerge CRDTs, and React. (Highlights system design and state management skills).\n2. **Serverless Job Portal API** with microservices, Redis caching, and rate limiting middleware. (Highlights backend scalability).\n\nWould you like me to map out a step-by-step learning roadmap or details for one of these?',
        timestamp: new Date(Date.now() - 50 * 60 * 1000)
      }
    ]
  }
];
