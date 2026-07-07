import { toTitleCase } from "../screens/candidate/utils/profileUtils";

/**
 * Maps raw API profile data to the application's Redux state structure
 * @param {Object} profileData - Raw data from API
 * @returns {Object} - Mapped profile data
 */
export const mapProfileData = (profileData) => {
  if (!profileData) return null;

  return {
    id: profileData.id,
    wallet_balance: profileData.wallet_balance || 0, // Assuming balance is part of profile data
    personalDetails: {
      fullName: toTitleCase(profileData?.full_name) || "",
      email: profileData?.email || "",
      phone: profileData?.phone || "",
      website: profileData?.portfolio_url || profileData?.github_url || "",
      preferredLocation: toTitleCase(profileData?.preferred_locations?.[0]) || toTitleCase(profileData?.current_location) || "",
      currentLocation: toTitleCase(profileData?.current_location) || "",
      location: toTitleCase(profileData?.current_location) || toTitleCase(profileData?.preferred_locations?.[0]) || "",
      headline: toTitleCase(profileData?.headline) || "",
      summary: profileData?.summary || profileData?.parsed_summary || "",
      date_of_birth: profileData?.date_of_birth || "",
      maritalStatus: profileData?.marital_status || "",
      gender: toTitleCase(profileData?.gender) || "",
      avatarUrl: profileData?.avatar_url || "",
      profile_viewed: profileData?.profile_viewed || false,
    },
    user_industries: profileData?.user_industries || [],
    experience: profileData?.experience && Array.isArray(profileData.experience)
      ? profileData.experience.map((exp) => ({
        id: exp?.id || Date.now() + Math.random(),
        company: toTitleCase(exp?.company_name || "") || "",
        company_name: toTitleCase(exp?.company_name || "") || "",
        role: toTitleCase(exp?.title) || "",
        location: toTitleCase(exp?.location) || "",
        description: exp?.description || "",
        startDate: exp?.start_date || "",
        endDate: exp?.end_date || "",
        isCurrent: exp?.is_current || false,
        skills: exp?.skills_used || [],
      }))
      : [],
    education: profileData?.education && Array.isArray(profileData.education)
      ? profileData.education
          .map((edu) => ({
            id: edu?.id || Date.now() + Math.random(),
            school: toTitleCase(edu?.institution) || "",
            degree: toTitleCase(edu?.degree) || "",
            field: toTitleCase(edu?.field_of_study) || "",
            grade: edu?.grade || "",
            year: edu?.end_year || "",
            isCurrent: edu?.is_current || false,
            startYear: edu?.start_year || "",
          }))
          .sort((a, b) => {
            // Sort criteria:
            // 1. isCurrent studies first
            if (a.isCurrent && !b.isCurrent) return -1;
            if (!a.isCurrent && b.isCurrent) return 1;

            // 2. year (end_year) descending
            const yearA = parseInt(a.year) || 0;
            const yearB = parseInt(b.year) || 0;
            if (yearB !== yearA) {
              return yearB - yearA;
            }

            // 3. startYear descending
            const startA = parseInt(a.startYear) || 0;
            const startB = parseInt(b.startYear) || 0;
            return startB - startA;
          })
      : [],
    projects: profileData?.projects && Array.isArray(profileData.projects)
      ? profileData.projects.map((project) => {
          const titleVal = toTitleCase(project?.title || "") || "";
          const urlVal = project?.url || "";
          
          // Safely extract the year from end_date, falling back to start_date
          const dateStr = project?.end_date || project?.start_date || "";
          const yearMatch = dateStr.match(/\d{4}/);
          const yearVal = yearMatch ? yearMatch[0] : "";

          return {
            id: project?.id || Date.now() + Math.random(),
            title: titleVal,
            name: titleVal,
            description: project?.description || "",
            url: urlVal,
            link: urlVal,
            repoUrl: project?.repo_url || "",
            startDate: project?.start_date || "",
            endDate: project?.end_date || "",
            year: yearVal,
            skills: project?.skills_used && Array.isArray(project.skills_used)
              ? project.skills_used.map((s) => toTitleCase(typeof s === "string" ? s : s?.name))
              : [],
          };
        })
      : [],
    skills: profileData?.skills && Array.isArray(profileData.skills)
      ? profileData.skills.map((s) => toTitleCase(typeof s === "string" ? s : s?.name))
      : [],
    languages: profileData?.languages && Array.isArray(profileData.languages)
      ? [...profileData.languages]
          .sort((a, b) => {
            const idA = typeof a === "object" && a !== null ? a.id || a.language_id || 0 : 0;
            const idB = typeof b === "object" && b !== null ? b.id || b.language_id || 0 : 0;
            return idA - idB;
          })
          .map((l) => toTitleCase(typeof l === "string" ? l : l?.language))
      : [],
    achievements: profileData?.achievements && Array.isArray(profileData.achievements)
      ? profileData.achievements.map((l, index) => ({
        id: (typeof l === "object" && l?.id) || Date.now() + index + Math.random(),
        achievement: toTitleCase(typeof l === "string" ? l : l?.achievement) || "",
      }))
      : [],
  };
};


export const mapRoleToType = (role) => {
  switch (role?.toLowerCase()) {
    case 'jobseeker': return 'Candidate';
    case 'recruiter': return 'Recruiter';
    case 'consultant': return 'Consultant';
    default: return 'Candidate';
  }
};