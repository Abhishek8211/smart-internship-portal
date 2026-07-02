# Smart Internship Matching Portal

An enterprise-ready, AI-powered internship portal designed to intelligently connect students with internship opportunities based on skills, academic profiles, certifications, projects, and resume analyses. Recruiters can manage postings, filter candidates using AI ranking, and generate customized practice interviews.

This platform features a professional monorepo architecture, responsive glassmorphic layout, role-based dashboards, real-time push alerts, and a robust dual-database layer (MongoDB and PostgreSQL).

---

## Key Features

### 🌟 For Students
- **AI Resume Parser & Profile Sync**: Extract skills, education, projects, and certifications automatically using Gemini 1.5.
- **ATS Resume Grader**: Evaluate keyword density, project descriptions, and links with tuning suggestions.
- **AI Recommendation Engine**: View compatibility scores (e.g., 95% Match) and detailed match explanations.
- **Skill Gap Analyst**: Compare skills with job criteria to construct personalized learning roadmaps.
- **AI Career Counselor Chatbot**: Obtain guidelines on coding tasks, interview prep, and roadmap resources in Markdown.
- **Practice Interview Sheets**: Access custom-generated Technical, HR, Coding, and Behavioral practice sheets.
- **GitHub & LinkedIn Sync**: Fast-track portfolio setup via simulated profiles sync.

### 💼 For Recruiters
- **Post & Audit Internship Listings**: Edit location modes (Remote/Hybrid/Office), stipends, and requirements with full CRUD.
- **AI Candidate Ranking**: Retrieve applications sorted by matching score, shortening vetting time.
- **Interview Scheduler**: Book Zoom interviews, schedule dates, and automatically generate practice sheets for candidates.
- **Offer Letters**: Release offer summaries directly via candidates application status updates.
- **Company Profiles**: Save corporate branding details, logo, description, and website headquarters.

### 🛡️ For Admins
- **Analytics Dashboard**: Access global statistics (total profiles, verified companies, top in-demand skills).
- **Audit Logs**: Trace system activities (new profiles, hires, postings).
- **Governance Controls**: Verify recruitment companies, audit jobs, and moderate user logins.

---

## Tech Stack

- **Frontend**: Next.js 15 (App Router, React 19), Tailwind CSS, Framer Motion, Recharts, Lucide Icons, Socket.io Client.
- **Backend**: Node.js, Express.js (TypeScript), JWT Authentication, bcrypt, Morgan logger, Multer, Socket.io.
- **Database**:
  - **MongoDB**: Accounts, Profiles, Applications, Chats, Notifications.
  - **PostgreSQL**: Companies, Recruiters, Internships (managed via Prisma ORM).
- **Containerization**: Docker, Docker Compose.

---

## Project Structure

```
smart-internship-portal/
├── docker-compose.yml       # Complete environment orchestrator
├── package.json             # Root monorepo scripts
├── README.md
├── backend/
│   ├── prisma/              # PostgreSQL schema & migration files
│   ├── src/
│   │   ├── config/          # DB connections
│   │   ├── middleware/      # Auth & Role validation guards
│   │   ├── models/          # Mongo schemas & Postgres interfaces
│   │   ├── routes/          # API controllers
│   │   ├── services/        # AI Service, Socket.io, Email transmitters
│   │   ├── test.ts          # Unit testing suite
│   │   └── index.ts         # Server entrypoint
│   ├── package.json
│   └── tsconfig.json
└── frontend/
    ├── src/
    │   ├── app/             # App Router pages (dashboards, home, auth)
    │   ├── context/         # Auth, Theme, & Sockets context layers
    │   └── globals.css      # Custom glassmorphic utilities
    ├── package.json
    └── tailwind.config.ts
```

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Docker & Docker Compose](https://www.docker.com/)

### Installation & Launch

1. **Bootstrap Monorepo Dependencies**
   Install packages for the frontend and backend using the legacy-peer-deps flag:
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install --legacy-peer-deps
   ```

2. **Configure Environment Variables**
   - Create a `backend/.env` file:
     ```env
     PORT=5000
     JWT_SECRET=sip_jwt_secret_token_2026_key
     DATABASE_URL="postgresql://postgres:password123@localhost:5432/smart_internship_portal?schema=public"
     MONGO_URI="mongodb://localhost:27017/smart_internship_portal"
     EMAIL_HOST=smtp.ethereal.email
     EMAIL_PORT=587
     EMAIL_USER=test@ethereal.email
     EMAIL_PASS=testpassword
     GEMINI_API_KEY=your_gemini_key_here
     ```
   - Create a `frontend/.env.local` file:
     ```env
     NEXT_PUBLIC_API_URL=http://localhost:5000
     ```

3. **Prisma Schema Build**
   Sync PostgreSQL structures and build the client types:
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push
   ```

4. **Launch Local Services**
   ```bash
   # Start backend (from backend folder)
   npm run dev
   
   # Start frontend (from frontend folder)
   npm run dev
   ```
   - **Frontend UI Client**: http://localhost:3000
   - **REST API Server**: http://localhost:5000
   - **API Documentation (Swagger UI)**: http://localhost:5000/api-docs

---

## 🐳 Docker Compose Deployment

To spin up the complete environment including PostgreSQL, MongoDB, the API backend server, and the Next.js client under a unified compose network, simply run:
```bash
docker compose up --build
```
This maps:
- Next.js Client on http://localhost:3000
- REST API Server on http://localhost:5000
- PostgreSQL on port `5432`
- MongoDB on port `27017`

---

## 🧪 Running Unit Tests

We have implemented an automated test suite verifying the compatibility logic of our match scoring model, ATS analyzer suggestion calculations, and skill gap roadmaps:
```bash
cd backend
npm run test
```

---

## Sandbox Mock Logins

To preview roles instantly, log in using these credentials:

| Role | Email Address | Password |
| :--- | :--- | :--- |
| **Student** | `student@example.com` | `Password@123` |
| **Recruiter** | `recruiter@stripe.com` | `Password@123` |
| **Admin** | `admin@portal.com` | `Password@123` |
| **Verification OTP** | *Any email registration* | `123456` |
