/**
 * Smart Job Match Utility
 * Computes deterministic match metrics between a candidate profile and a job listing.
 * Evaluates:
 * 1. Technical & categorized skills overlap (up to 50 pts)
 * 2. Professional experience alignment (up to 25 pts)
 * 3. Title/Headline semantic relevance (up to 15 pts)
 * 4. Profile completeness readiness (up to 10 pts)
 */

export const calculateJobMatch = (user, job) => {
  if (!job) {
    return {
      score: 0,
      matchedSkills: [],
      missingSkills: [],
      explanation: "",
      rating: "Low"
    };
  }

  // If user is not logged in or has no skills, return general baseline
  if (!user || (!user.skills?.length && !user.categorizedSkills?.length)) {
    return {
      score: 0,
      matchedSkills: [],
      missingSkills: Array.isArray(job.skills) ? job.skills.map((s) => String(s).trim()) : [],
      explanation: "Sign in and add skills to your profile to see your personalized match percentage.",
      rating: "Unranked"
    };
  }

  const userSkillList = (user.skills || [])
    .concat((user.categorizedSkills || []).map((s) => s?.name || ""))
    .map((s) => String(s).trim().toLowerCase())
    .filter(Boolean);

  const userSkillsSet = new Set(userSkillList);

  const jobSkills = Array.isArray(job.skills)
    ? job.skills.map((s) => String(s).trim()).filter(Boolean)
    : [];

  const matchedSkills = [];
  const missingSkills = [];

  jobSkills.forEach((skill) => {
    const norm = skill.toLowerCase();
    const hasMatch =
      userSkillsSet.has(norm) ||
      Array.from(userSkillsSet).some((us) => us.includes(norm) || norm.includes(us));

    if (hasMatch) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  // 1. Skills match score (max 50 pts)
  const skillsRatio = jobSkills.length > 0 ? matchedSkills.length / jobSkills.length : 0.75;
  const skillsScore = Math.round(skillsRatio * 50);

  // 2. Experience score (max 25 pts)
  const expCount = Array.isArray(user.experience) ? user.experience.length : 0;
  const expScore = expCount >= 3 ? 25 : expCount >= 1 ? 18 : 10;

  // 3. Title/Headline relevance (max 15 pts)
  const headline = String(user.headline || "").toLowerCase();
  const jobTitle = String(job.title || "").toLowerCase();
  const titleTokens = jobTitle.split(/[^a-z0-9]/).filter((w) => w.length > 3);
  const titleMatch = titleTokens.some((token) => headline.includes(token));
  const titleScore = titleMatch ? 15 : 8;

  // 4. Profile readiness (max 10 pts)
  const profileScore = userSkillList.length >= 4 ? 10 : 5;

  let totalScore = Math.min(98, Math.max(25, skillsScore + expScore + titleScore + profileScore));

  let rating = "Good Match";
  if (totalScore >= 85) rating = "Excellent Match";
  else if (totalScore >= 70) rating = "Strong Match";
  else if (totalScore < 50) rating = "Moderate Match";

  let explanation = "";
  if (matchedSkills.length > 0) {
    explanation = `Strong overlap with your skills: ${matchedSkills.slice(0, 3).join(", ")}.`;
  } else {
    explanation = `Aligns with your experience profile and target category.`;
  }

  return {
    score: totalScore,
    matchedSkills,
    missingSkills,
    rating,
    explanation,
    breakdown: {
      skillsMatch: skillsScore,
      experienceRelevance: expScore,
      titleRelevance: titleScore,
      profileReadiness: profileScore
    }
  };
};

export default calculateJobMatch;
