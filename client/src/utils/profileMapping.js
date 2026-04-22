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
    personalDetails: {
      fullName: toTitleCase(profileData?.full_name) || "",
      email: profileData?.email || "",
      phone: profileData?.phone || "",
      website: profileData?.portfolio_url || profileData?.github_url || "",
      preferredLocation: toTitleCase(profileData?.preferred_locations?.[0]) || toTitleCase(profileData?.current_location) || "",
      currentLocation: toTitleCase(profileData?.current_location) || "",
      headline: toTitleCase(profileData?.headline) || "",
      summary: toTitleCase(profileData?.summary) || "",
      date_of_birth: profileData?.date_of_birth || "",
      maritalStatus: profileData?.marital_status || "",
      gender: toTitleCase(profileData?.gender) || "",
    },
    experience: profileData?.experience && Array.isArray(profileData.experience)
      ? profileData.experience.map((exp) => ({
        id: exp?.id || Date.now() + Math.random(),
        company: toTitleCase(exp?.company_name || "") || "",
        role: toTitleCase(exp?.title) || "",
        location: toTitleCase(exp?.location) || "",
        description: toTitleCase(exp?.description) || "",
        startDate: exp?.start_date || "",
        endDate: exp?.end_date || "",
        isCurrent: exp?.is_current || false,
        skills: exp?.skills_used || [],
      }))
      : [],
    education: profileData?.education && Array.isArray(profileData.education)
      ? profileData.education.map((edu) => ({
        id: edu?.id || Date.now() + Math.random(),
        school: toTitleCase(edu?.institution) || "",
        degree: toTitleCase(edu?.degree) || "",
        field: toTitleCase(edu?.field_of_study) || "",
        grade: edu?.grade || "",
        year: edu?.end_year || "",
      }))
      : [],
    projects: profileData?.projects && Array.isArray(profileData.projects)
      ? profileData.projects.map((project) => ({
          id: project?.id || Date.now() + Math.random(),
          title: toTitleCase(project?.title || "") || "",
          description: project?.description || "",
          url: project?.url || "",
          repoUrl: project?.repo_url || "",
          startDate: project?.start_date || "",
          endDate: project?.end_date || "",
          skills: project?.skills_used && Array.isArray(project.skills_used)
            ? project.skills_used.map((s) => toTitleCase(typeof s === "string" ? s : s?.name))
            : [],
        }))
      : [],
    skills: profileData?.skills && Array.isArray(profileData.skills)
      ? profileData.skills.map((s) => toTitleCase(typeof s === "string" ? s : s?.name))
      : [],
    languages: profileData?.languages && Array.isArray(profileData.languages)
      ? profileData.languages.map((l) => toTitleCase(typeof l === "string" ? l : l?.language))
      : [],
  };
};
