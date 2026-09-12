import aiService from './services/aiService';

async function runTests() {
  console.log('🧪 Starting Smart Match Portal AI Engine Unit Tests...\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, message: string) => {
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      failed++;
    }
  };

  // Test Case 1: Recommendation match percentages
  console.log('--- 1. Testing Internship Recommendation Engine match scores ---');
  const mockStudent = {
    skills: ['React', 'TypeScript', 'Node.js'],
    cgpa: 3.8,
    links: { portfolio: 'remote' }
  };

  const mockJob = {
    role: 'Full Stack Engineer',
    skills_required: ['React', 'TypeScript', 'SQL'],
    location: 'Remote',
    mode: 'Remote'
  };

  const matchRes = aiService.recommendInternship(mockStudent, mockJob);
  assert(matchRes.matchPercentage >= 70, `Match score should be high for high-skill match (${matchRes.matchPercentage}%)`);
  assert(matchRes.explanation.includes('React'), 'Explanation description should report matched skill "React"');
  assert(matchRes.explanation.includes('SQL'), 'Explanation description should suggest missing skill "SQL"');

  // Test Case 2: ATS scoring calculations
  console.log('\n--- 2. Testing ATS Resume Grader Engine ---');
  const completeProfile = {
    skills: ['React', 'Python', 'Docker'],
    projects: [{ title: 'P1', description: 'A test project', technologies: ['React'] }],
    education: [{ institution: 'State U', degree: 'BS', fieldOfStudy: 'CS' }],
    cgpa: 3.7,
    links: { github: 'git-link', linkedin: 'in-link' }
  };

  const scoreRes = await aiService.calculateATSScore(completeProfile);
  assert(scoreRes.score > 70, `ATS score for complete profile should be high (${scoreRes.score}/100)`);

  const emptyProfile = {
    skills: [],
    projects: [],
    education: []
  };
  const lowScoreRes = await aiService.calculateATSScore(emptyProfile);
  assert(lowScoreRes.score < 40, `ATS score for blank profile should be low (${lowScoreRes.score}/100)`);
  assert(lowScoreRes.suggestions.length > 0, 'Suggestions list should not be empty for deficient profile');

  // Test Case 3: Skill Gap Analysis
  console.log('\n--- 3. Testing Skill Gap Roadmap Builder ---');
  const gapRes = aiService.analyzeSkillGap(
    ['React', 'CSS'],
    ['React', 'TypeScript', 'Docker']
  );
  assert(gapRes.known.includes('React'), 'Known list should identify "React"');
  assert(gapRes.missing.includes('TypeScript') && gapRes.missing.includes('Docker'), 'Missing list should identify "TypeScript" and "Docker"');
  assert(gapRes.roadmap.length > 0, 'Roadmap steps should be generated for missing skills');

  console.log(`\n🎉 Tests completed: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
