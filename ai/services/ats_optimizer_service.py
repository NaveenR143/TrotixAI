import os
import json
import logging
from typing import Dict, Any
from openai import OpenAI

logger = logging.getLogger(__name__)

class ATSOptimizerService:
    def __init__(self) -> None:
        self._endpoint = os.getenv("AZURE_OPENAI_ENDPOINT", "").split("#")[0].strip()
        self._api_key = os.getenv("AZURE_OPENAI_API_KEY", "").split("#")[0].strip()
        self._deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT", "").split("#")[0].strip()
        
        if not self._endpoint or not self._api_key or not self._deployment:
            raise ValueError("Azure OpenAI configuration missing for ATSOptimizerService. Ensure AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, and AZURE_OPENAI_DEPLOYMENT are set.")
            
        self._client = OpenAI(
            base_url=self._endpoint,
            api_key=self._api_key,
        )

    async def generate_ats_content(self, user_profile: Dict[str, Any], job_details: Dict[str, Any]) -> Dict[str, Any]:
        # Headline and Summary
        headline = user_profile.get("headline") or ""
        summary = user_profile.get("summary") or ""
        headline_summary_str = f"Headline: {headline}\nSummary: {summary}\n" if (headline or summary) else "No headline or summary listed.\n"

        # Format candidate projects
        projects_list = user_profile.get("projects") or []
        projects_str = ""
        for i, proj in enumerate(projects_list):
            projects_str += f"Project {i+1}:\n"
            projects_str += f"  Title: {proj.get('title')}\n"
            projects_str += f"  Description: {proj.get('description')}\n"
            
            # Safely handle projects skills list/dict formats
            proj_skills = proj.get('skills_used') or []
            proj_skills_formatted = []
            for s in proj_skills:
                if isinstance(s, dict):
                    proj_skills_formatted.append(s.get("name") or str(s))
                else:
                    proj_skills_formatted.append(str(s))
            projects_str += f"  Skills Used: {', '.join(proj_skills_formatted)}\n\n"
        if not projects_str:
            projects_str = "No projects listed.\n"

        # Format candidate experience
        exp_list = user_profile.get("experience") or []
        exp_str = ""
        for i, exp in enumerate(exp_list):
            exp_str += f"Experience {i+1}:\n"
            exp_str += f"  Company: {exp.get('company_name')}\n"
            exp_str += f"  Title: {exp.get('title')}\n"
            exp_str += f"  Is Current: {exp.get('is_current')}\n"
            exp_str += f"  Description: {exp.get('description')}\n"
            
            # Safely handle experience skills list/dict formats
            exp_skills = exp.get('skills_used') or []
            exp_skills_formatted = []
            for s in exp_skills:
                if isinstance(s, dict):
                    exp_skills_formatted.append(s.get("name") or str(s))
                else:
                    exp_skills_formatted.append(str(s))
            exp_str += f"  Skills Used: {', '.join(exp_skills_formatted)}\n\n"
        if not exp_str:
            exp_str = "No experience listed.\n"

        # Format candidate skills
        skills_list = user_profile.get("skills") or []
        skills_names = []
        for s in skills_list:
            if isinstance(s, dict):
                skills_names.append(s.get("name") or str(s))
            elif s:
                skills_names.append(str(s))
        skills_str = ", ".join(skills_names) if skills_names else "No skills listed."

        # Format candidate education
        edu_list = user_profile.get("education") or []
        edu_str = ""
        for i, edu in enumerate(edu_list):
            edu_str += f"Education {i+1}:\n"
            edu_str += f"  Institution: {edu.get('institution') or 'N/A'}\n"
            edu_str += f"  Degree: {edu.get('degree') or 'N/A'}\n"
            edu_str += f"  Field of Study: {edu.get('field_of_study') or 'N/A'}\n"
            if edu.get('description'):
                edu_str += f"  Description: {edu.get('description')}\n"
        if not edu_str:
            edu_str = "No education details listed.\n"

        # Format candidate certifications
        cert_list = user_profile.get("certifications") or []
        cert_str = ""
        for i, cert in enumerate(cert_list):
            cert_str += f"Certification {i+1}:\n"
            cert_str += f"  Name: {cert.get('name') or 'N/A'}\n"
            cert_str += f"  Issuer: {cert.get('issuer') or 'N/A'}\n"
        if not cert_str:
            cert_str = "No certifications listed.\n"

        # Format candidate achievements
        ach_list = user_profile.get("achievements") or []
        ach_str = ""
        for i, ach in enumerate(ach_list):
            ach_str += f"Achievement {i+1}: {ach.get('achievement') or 'N/A'}\n"
        if not ach_str:
            ach_str = "No achievements listed.\n"

        # Format candidate industries
        industries_list = user_profile.get("user_industries") or []
        industries_names = [ind.get("name") for ind in industries_list if ind.get("name")]
        industries_str = ", ".join(industries_names) if industries_names else "No industries listed."

        system_prompt = (
            "You are an expert career consultant and professional resume optimizer specializing in ATS optimization.\n"
            "Your task is to carefully analyze the candidate's complete profile (across all aspects: headline, summary, experience, projects, skills, education, certifications, and achievements) and match it against the target job description to generate highly optimized, ATS-friendly resume content.\n\n"
            "STRICT LOGICAL PROCESS:\n"
            "1. SKILL IDENTIFICATION:\n"
            "   - Analyze the target job description and identify the core technical skills, programming languages, libraries, frameworks, tools, methodologies, and soft skills required.\n"
            "2. CROSS-CHECKING AND MATCHING PROFILE DETAILS:\n"
            "   - Cross-check the identified required job skills against ALL aspects of the candidate's profile: experience descriptions, projects details, current listed skills, education field of study, certifications, and achievements.\n"
            "   - Determine which required job skills the candidate has actual exposure to, even if they were only mentioned in a project, a specific job role, or a certification.\n"
            "3. CONTENT GENERATION AND SECTIONS REWRITING:\n"
            "   - Rewrite and tailor the following sections, ensuring that the matched skills/keywords are clearly highlighted and woven naturally into the content:\n"
            "     - 'project_details': Optimize the candidate's project descriptions. Highlight the matched technologies, tools, and methodologies in bullet points showing how the candidate applied them. Keep the text realistic and grounded in the candidate's actual projects.\n"
            "     - 'experience_details': Optimize the work experience. Highlight achievements, tools, responsibilities, and methodologies that match the target job requirements. Rewrite as professional, high-impact bullet points.\n"
            "     - 'skills': Compile a clean, comma-separated list of candidate skills that are relevant to this job. This list MUST consist of skills required by the job (listed under Required Skills and extracted from the Job Description) that the candidate possesses or has shown evidence of in any part of their profile (projects, experience, certifications, etc.). Do NOT invent new skills that the candidate has no background in.\n\n"
            "STRICT RULES:\n"
            "1. Keep the content realistic, factual, and strictly based on the candidate's actual history. Do NOT invent new companies, degrees, roles, or certifications.\n"
            "2. Do NOT modify, invent, or output any personal identification or contact details (e.g. names, emails, phone numbers, addresses, social profiles).\n"
            "3. Redesign the output tone, vocabulary, and context of the rewritten project and experience details to align with the specific job title, hiring company, target industry, and department. For example, frame technical accomplishments to highlight application domains (e.g., e-commerce, cloud, enterprise) that are relevant to the hiring company and department.\n"
            "4. Your output MUST be a valid JSON object matching this schema exactly:\n"
            "   {\n"
            "     \"project_details\": \"string\",\n"
            "     \"experience_details\": \"string\",\n"
            "     \"skills\": \"string\"\n"
            "   }\n"
        )
        
        user_prompt = (
            f"=== CANDIDATE PROFILE ===\n"
            f"Headline & Summary:\n{headline_summary_str}\n"
            f"Candidate Experience:\n{exp_str}\n"
            f"Candidate Projects:\n{projects_str}\n"
            f"Candidate Skills:\n{skills_str}\n"
            f"Candidate Education:\n{edu_str}\n"
            f"Candidate Certifications:\n{cert_str}\n"
            f"Candidate Achievements:\n{ach_str}\n"
            f"Candidate Industries:\n{industries_str}\n\n"
            f"=== TARGET JOB DESCRIPTION ===\n"
            f"Company: {job_details.get('company') or 'N/A'}\n"
            f"Job Title: {job_details.get('title') or 'N/A'}\n"
            f"Industry: {job_details.get('industry') or 'N/A'}\n"
            f"Department: {job_details.get('department') or 'N/A'}\n"
            f"Location: {job_details.get('location') or 'N/A'}\n"
            f"Job Summary: {job_details.get('summary') or 'N/A'}\n"
            f"Required Skills: {', '.join(job_details.get('skills') or [])}\n"
            f"Job Description:\n{job_details.get('description')}\n"
        )
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        
        try:
            response = self._client.chat.completions.create(
                model=self._deployment,
                messages=messages,
                response_format={"type": "json_object"},
                temperature=0.3
            )
            
            raw_content = (response.choices[0].message.content or "").strip()
            return json.loads(raw_content)
        except Exception as exc:
            logger.error(f"ATS Content generation failed in service: {exc}", exc_info=True)
            raise ValueError(f"AI generation failed: {str(exc)}")

    async def generate_ats_resume(self, user_profile: Dict[str, Any], job_details: Dict[str, Any]) -> Dict[str, Any]:
        # Headline and Summary
        headline = user_profile.get("headline") or ""
        summary = user_profile.get("summary") or ""
        headline_summary_str = f"Headline: {headline}\nSummary: {summary}\n" if (headline or summary) else "No headline or summary listed.\n"

        # Format candidate projects
        projects_list = user_profile.get("projects") or []
        projects_str = ""
        for i, proj in enumerate(projects_list):
            projects_str += f"Project {i+1}:\n"
            projects_str += f"  Title: {proj.get('title')}\n"
            projects_str += f"  Description: {proj.get('description')}\n"
            
            # Safely handle projects skills list/dict formats
            proj_skills = proj.get('skills_used') or []
            proj_skills_formatted = []
            for s in proj_skills:
                if isinstance(s, dict):
                    proj_skills_formatted.append(s.get("name") or str(s))
                else:
                    proj_skills_formatted.append(str(s))
            projects_str += f"  Skills Used: {', '.join(proj_skills_formatted)}\n\n"
        if not projects_str:
            projects_str = "No projects listed.\n"

        # Format candidate experience
        exp_list = user_profile.get("experience") or []
        exp_str = ""
        for i, exp in enumerate(exp_list):
            exp_str += f"Experience {i+1}:\n"
            exp_str += f"  Company: {exp.get('company_name')}\n"
            exp_str += f"  Title: {exp.get('title')}\n"
            exp_str += f"  Is Current: {exp.get('is_current')}\n"
            exp_str += f"  Description: {exp.get('description')}\n"
            
            # Safely handle experience skills list/dict formats
            exp_skills = exp.get('skills_used') or []
            exp_skills_formatted = []
            for s in exp_skills:
                if isinstance(s, dict):
                    exp_skills_formatted.append(s.get("name") or str(s))
                else:
                    exp_skills_formatted.append(str(s))
            exp_str += f"  Skills Used: {', '.join(exp_skills_formatted)}\n\n"
        if not exp_str:
            exp_str = "No experience listed.\n"

        # Format candidate skills
        skills_list = user_profile.get("skills") or []
        skills_names = []
        for s in skills_list:
            if isinstance(s, dict):
                skills_names.append(s.get("name") or str(s))
            elif s:
                skills_names.append(str(s))
        skills_str = ", ".join(skills_names) if skills_names else "No skills listed."

        # Format candidate education
        edu_list = user_profile.get("education") or []
        edu_str = ""
        for i, edu in enumerate(edu_list):
            edu_str += f"Education {i+1}:\n"
            edu_str += f"  Institution: {edu.get('institution') or 'N/A'}\n"
            edu_str += f"  Degree: {edu.get('degree') or 'N/A'}\n"
            edu_str += f"  Field of Study: {edu.get('field_of_study') or 'N/A'}\n"
            if edu.get('description'):
                edu_str += f"  Description: {edu.get('description')}\n"
        if not edu_str:
            edu_str = "No education details listed.\n"

        # Format candidate certifications
        cert_list = user_profile.get("certifications") or []
        cert_str = ""
        for i, cert in enumerate(cert_list):
            cert_str += f"Certification {i+1}:\n"
            cert_str += f"  Name: {cert.get('name') or 'N/A'}\n"
            cert_str += f"  Issuer: {cert.get('issuer') or 'N/A'}\n"
        if not cert_str:
            cert_str = "No certifications listed.\n"

        # Format candidate achievements
        ach_list = user_profile.get("achievements") or []
        ach_str = ""
        for i, ach in enumerate(ach_list):
            ach_str += f"Achievement {i+1}: {ach.get('achievement') or 'N/A'}\n"
        if not ach_str:
            ach_str = "No achievements listed.\n"

        # Format candidate industries
        industries_list = user_profile.get("user_industries") or []
        industries_names = [ind.get("name") for ind in industries_list if ind.get("name")]
        industries_str = ", ".join(industries_names) if industries_names else "No industries listed."

        system_prompt = (
            "You are an expert career consultant and professional resume optimizer specializing in ATS optimization.\n"
            "Your task is to analyze the candidate's complete profile and target job description to generate optimized, ATS-friendly resume content.\n\n"
            "STRICT LOGICAL PROCESS:\n"
            "1. PROFESSIONAL SUMMARY:\n"
            "   - Generate an optimized professional summary tailored specifically to the target job description. Emphasize matching capabilities, years of experience, and alignment. Keep it professional and concise (3-4 sentences).\n"
            "2. SKILLS OPTIMIZATION:\n"
            "   - Refine the skills section to match the job description. Retain only skills that the candidate has shown exposure to (in any part of the profile: experience, projects, certifications, skills, etc.) while maximizing keyword alignment. Do NOT fabricate skills.\n"
            "   - Compile a clean, comma-separated list of candidate skills that are relevant to this job. Do NOT invent new skills that the candidate has no background in.\n"
            "3. EXPERIENCE ENHANCEMENT:\n"
            "   - For each experience item in the candidate's profile, rewrite and optimize the description to highlight accomplishments, responsibilities, tools, and methodologies that match the target job requirements.\n"
            "   - Provide these as high-impact, professional bullet points. Maintain factual accuracy (do not invent experience or alter companies/dates).\n"
            "4. PROJECT TAILORING:\n"
            "   - For each project, optimize the description to highlight tools and methodologies that align with the target role.\n\n"
            "STRICT RULES:\n"
            "1. Keep all content realistic, factual, and strictly based on the candidate's actual history. Do NOT invent companies, titles, degrees, or certifications.\n"
            "2. The output experience list MUST contain exactly the same number of entries, matching company names, and matching titles, in the same order as candidate experience.\n"
            "3. The output projects list MUST contain exactly the same number of entries and matching titles, in the same order as candidate projects.\n"
            "4. Your output MUST be a valid JSON object matching this schema exactly:\n"
            "   {\n"
            "     \"summary\": \"string\",\n"
            "     \"skills\": \"string\",\n"
            "     \"experience\": [\n"
            "       {\n"
            "         \"company_name\": \"string\",\n"
            "         \"title\": \"string\",\n"
            "         \"description\": \"string\"\n"
            "       }\n"
            "     ],\n"
            "     \"projects\": [\n"
            "       {\n"
            "         \"title\": \"string\",\n"
            "         \"description\": \"string\"\n"
            "       }\n"
            "     ]\n"
            "   }\n"
        )

        user_prompt = (
            f"=== CANDIDATE PROFILE ===\n"
            f"Headline & Summary:\n{headline_summary_str}\n"
            f"Candidate Experience:\n{exp_str}\n"
            f"Candidate Projects:\n{projects_str}\n"
            f"Candidate Skills:\n{skills_str}\n"
            f"Candidate Education:\n{edu_str}\n"
            f"Candidate Certifications:\n{cert_str}\n"
            f"Candidate Achievements:\n{ach_str}\n"
            f"Candidate Industries:\n{industries_str}\n\n"
            f"=== TARGET JOB DESCRIPTION ===\n"
            f"Company: {job_details.get('company') or 'N/A'}\n"
            f"Job Title: {job_details.get('title') or 'N/A'}\n"
            f"Industry: {job_details.get('industry') or 'N/A'}\n"
            f"Department: {job_details.get('department') or 'N/A'}\n"
            f"Location: {job_details.get('location') or 'N/A'}\n"
            f"Job Summary: {job_details.get('summary') or 'N/A'}\n"
            f"Required Skills: {', '.join(job_details.get('skills') or [])}\n"
            f"Job Description:\n{job_details.get('description')}\n"
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        try:
            response = self._client.chat.completions.create(
                model=self._deployment,
                messages=messages,
                response_format={"type": "json_object"},
                temperature=0.3
            )
            raw_content = (response.choices[0].message.content or "").strip()
            return json.loads(raw_content)
        except Exception as exc:
            logger.error(f"ATS Resume generation failed in service: {exc}", exc_info=True)
            raise ValueError(f"AI generation failed: {str(exc)}")

