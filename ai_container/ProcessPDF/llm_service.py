import os
import json
import logging
import re
from datetime import date, datetime
from enum import Enum
from uuid import UUID
from decimal import Decimal
from typing import Any
from openai import OpenAI
from ProcessPDF.resume_pipeline.toon import TOONFormatter

logger = logging.getLogger(__name__)


def json_serializable(obj: Any) -> Any:
    """
    Convert non-serializable objects (date, datetime, Enum, UUID, Decimal) to JSON-serializable formats.
    """
    if isinstance(obj, (date, datetime)):
        return obj.isoformat()
    if isinstance(obj, Enum):
        return obj.value
    if isinstance(obj, UUID):
        return str(obj)
    if isinstance(obj, Decimal):
        return float(obj)
    return obj


def clean_dict(value: Any) -> Any:
    """
    Recursively clean a dictionary/list by:
    1. Converting non-serializable objects to strings
    2. Removing None, empty strings, empty lists, and empty dicts
    """
    if isinstance(value, dict):
        cleaned = {}
        for k, v in value.items():
            cleaned_v = clean_dict(v)
            if cleaned_v not in [None, "", [], {}]:
                cleaned[k] = cleaned_v
        return cleaned
    elif isinstance(value, list):
        cleaned_list = []
        for v in value:
            cleaned_v = clean_dict(v)
            if cleaned_v not in [None, "", [], {}]:
                cleaned_list.append(cleaned_v)
        return cleaned_list
    else:
        return json_serializable(value)


class ReportLLMService:
    """
    Service to handle LLM calls for report content generation.
    """
    def __init__(self):
        endpoint = os.getenv("AZURE_OPENAI_ENDPOINT", "")
        api_key = os.getenv("AZURE_OPENAI_API_KEY", "")
        self.deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4.1-mini")
        
        if endpoint and api_key:
            self.openai_client = OpenAI(
                base_url=endpoint,
                api_key=api_key,
            )
        else:
            self.openai_client = None
            logger.warning("Azure OpenAI configuration missing in background worker.")

    def is_available(self) -> bool:
        """Check if the LLM client is initialized."""
        return self.openai_client is not None

    async def generate_llm_content(
        self,
        report_type: str,
        data: dict,
        missing_skills: list[str] = None,
        weak_skills: list[str] = None,
        market_skills: list[str] = None
    ) -> str:
        """
        Dispatches OpenAI calls tailored for the requested report type.
        """
        if not self.is_available():
            # Fallback to static text mock if API is offline
            return self._fallback_report_text(report_type, data)
            
        candidate_summary = f"""
            Candidate Name: {data['user']['full_name']}
            Headline: {data['profile']['headline']}
            Current Skills: {', '.join(data['skills'])}
            Experience: {json.dumps(data['experiences'], indent=2)}
            Projects: {json.dumps(data['projects'], indent=2)}
            Education: {json.dumps(data['education'], indent=2)}
            """

        if report_type in ["ATS_RESUME", "ENHANCED_RESUME"]:
            formatter = TOONFormatter()
            schema_instruction = formatter.build_resume_enhancement_instructions()

            messages = [
                {
                    "role": "system",
                    "content": (
                        "You are an ATS-safe resume enhancement system."
                        "Your task is to:"
                        "1. Improve recruiter readability"
                        "2. Improve ATS compatibility"
                        "3. Strengthen professional phrasing"
                        "4. Enhance clarity and impact"
                        "5. Preserve factual accuracy"
                        "6. Maintain strict schema compliance"
                        "7. Keep content aligned with the candidate's actual experience and seniority"
                        "CRITICAL OUTPUT RULES (NON-NEGOTIABLE):"
                        "1. Output ONLY a valid TOON object."
                        "2. Do NOT include explanations, markdown, notes, comments, or extra text."
                        "3. Follow TOON syntax EXACTLY."
                        '4. Use ONLY double quotes (") for all strings.'
                        '5. Escape internal quotes using \\".'
                        "6. Use parentheses () only for object definitions."
                        "7. Separate all fields correctly with commas."
                        "8. Do NOT wrap output in markdown code fences."
                        "9. Maintain strict schema consistency."
                        "10. Do NOT omit required fields."
                        "11. Use empty arrays instead of null values where applicable."
                        "12. Every key MUST be followed by a colon."
                        "FACTUAL ACCURACY RULES:"
                        "1. Never invent companies, job titles, degrees, certifications, or technologies."
                        "2. Never fabricate years of experience."
                        "3. Never create fake projects or responsibilities."
                        "4. Do NOT generate unrealistic leadership claims."
                        "5. Only enhance information present or strongly implied in the input."
                        "6. Do NOT add technologies unrelated to the candidate's background."
                        "7. Use measurable impact ONLY when clearly supported by the input context."
                        "8. If metrics are unclear, improve wording without inventing numbers."
                        "9. Maintain achievement scope appropriate to the candidate's seniority level."
                        "ATS OPTIMIZATION RULES:"
                        "1. Use ATS-friendly, industry-standard terminology."
                        "2. Use standard resume section naming conventions."
                        "3. Improve keyword readability naturally."
                        "4. Avoid keyword stuffing."
                        "5. Keep formatting recruiter-friendly and ATS-safe."
                        "6. Prioritize clarity, relevance, and scannability."
                        "7. Ensure technical skills are grouped logically."
                        "8. Use concise, impactful phrasing throughout."
                        "CONTENT TRANSFORMATION RULES:"
                        "PROFESSIONAL SUMMARY:"
                        "1. Rewrite the summary into a compelling 3-4 sentence professional pitch designed to immediately capture recruiter and hiring-manager attention."
                        "2. Position the candidate according to current market demand by emphasizing the most relevant, in-demand capabilities, technologies, domain expertise, and business outcomes supported by their experience."
                        "3. Lead with a strong professional identity that clearly communicates who the candidate is, what they specialize in, and the type of value they bring to employers."
                        "4. Prioritize market-relevant skills and expertise that are frequently sought in current job descriptions for the candidate's target role, without adding unsupported skills or technologies."
                        "5. Highlight differentiators such as high-impact projects, measurable achievements, specialized expertise, scale, leadership, automation, innovation, or business impact when supported by the candidate's background."
                        "6. Use modern, confident, commercially attractive language that reflects how top candidates are positioned in the current hiring market, while remaining authentic and credible."
                        "7. Optimize the summary for both ATS matching and human readability by naturally incorporating relevant industry-standard keywords without keyword stuffing."
                        "8. Maintain alignment with the candidate's actual experience level and never exaggerate seniority, expertise, achievements, or responsibilities."
                        "9. Avoid generic introductions, empty buzzwords, clichés, repetition, and vague claims that do not communicate specific professional value."
                        "10. Structure the summary as a concise value proposition: PROFESSIONAL IDENTITY → MARKET-RELEVANT EXPERTISE → DIFFERENTIATORS/IMPACT → VALUE TO THE EMPLOYER."
                        "SKILLS ENHANCEMENT:"
                        "1. Preserve all existing skills from the input unless they are clearly irrelevant, obsolete, or redundant."
                        "2. Add complementary skills ONLY if directly supported or strongly implied by the candidate's experience, projects, responsibilities, or technologies."
                        "3. Order the final skills based on current market demand, hiring trends, and relevance to the candidate's target role, placing the most in-demand and role-relevant skills first."
                        "4. Prioritize skills that are currently valued by employers and commonly appear in relevant job descriptions, while avoiding trend-driven skills that are not supported by the candidate's background."
                        "5. Give higher priority to skills that demonstrate strong technical, business, or cross-functional value and are likely to improve ATS matching."
                        "6. Group related skills logically where appropriate, while keeping the most market-relevant skill groups prominent."
                        "7. Keep skill names industry-standard, concise, ATS-friendly, and consistent with terminology commonly used in current job postings."
                        "8. Avoid duplicate, overlapping, generic, or redundant skills."
                        "9. Do not invent skills, certifications, tools, technologies, or expertise that are not supported by the candidate's background."
                        "10. The final ordering should balance three factors: current market demand, relevance to the target role, and evidence of proficiency in the candidate's experience."
                        "EXPERIENCE ENHANCEMENT:"
                        "1. Rewrite experience descriptions to be achievement-oriented."
                        "2. Use strong action verbs at the beginning of each bullet point."
                        "3. Emphasize ownership, contribution, optimization, implementation, collaboration, or impact where applicable."
                        "4. Include technologies naturally when relevant."
                        "5. Keep bullet points concise and recruiter-friendly."
                        "6. Avoid overly long or repetitive descriptions."
                        "7. Preserve factual accuracy at all times."
                        "PROJECT ENHANCEMENT:"
                        "1. Rewrite project descriptions professionally."
                        "2. Highlight technical implementation, functionality, and impact."
                        "3. Mention technologies used naturally."
                        "4. Emphasize problem-solving and practical outcomes."
                        "5. Avoid exaggerated claims."
                        "LANGUAGE AND TONE RULES:"
                        "1. Maintain a professional, polished, executive tone."
                        "2. Use active voice wherever possible."
                        "3. Keep content concise and impactful."
                        "4. Avoid filler phrases and unnecessary adjectives."
                        "5. Ensure readability for both ATS systems and human recruiters."
                        "STRUCTURE RULES:"
                        "1. Summary must be concise and professionally written."
                        "2. Skills must be relevant and logically grouped."
                        "3. Work experience must be a list of Experience objects."
                        "4. Projects must be a list of Project objects."
                        "5. Include all languages provided in the input."
                        "6. Preserve all important candidate information."
                        "7. Ensure the final output is clean, consistent, and ATS-compatible."
                        "OUTPUT FORMAT:"
                        "Return a single EnhancedResumeTOON object only."
                    ),
                },
                {
                    "role": "user",
                    "content": (
                        f"{schema_instruction}\n\n"
                        "User profile data to enhance:\n"
                        f"{json.dumps(clean_dict(data), ensure_ascii=False)}\n"
                    ),
                },
            ]

            response = self.openai_client.chat.completions.create(
                model=self.deployment,
                messages=messages,
                temperature=0.3
            )
            content = (response.choices[0].message.content or "").strip()

            # Remove markdown code fences if present
            if content.startswith("```"):
                content = re.sub(r"^```[^\n]*\n", "", content)
                content = re.sub(r"\n```$", "", content).strip()

            if not content.startswith("EnhancedResumeTOON("):
                raise ValueError("Invalid TOON format for resume enhancement")

            # Convert TOON → JSON
            enhanced_json = formatter.career_toon_to_json(content)
            return json.dumps(enhanced_json)
            
        elif report_type == "SKILL_ANALYSIS":
            formatter = TOONFormatter()
            schema_instruction = formatter.build_skill_development_instructions()

            industry_names = [ind.get("name") for ind in data.get("industries") or [] if ind.get("name")]
            gpt_input = {
                "industries": industry_names,
                "experience": [
                    {
                        "company": exp.get("company_name"),
                        "role": exp.get("title"),
                        "duration": f"{exp.get('start_date')} - {exp.get('end_date') or 'present'}",
                        "summary": exp.get("description"),
                        "skills": exp.get("skills_used", []),
                    }
                    for exp in (data.get("experiences") or [])
                    if exp.get("company_name") or exp.get("title")
                ],
                "education": [
                    {
                        "school": edu.get("institution"),
                        "degree": edu.get("degree"),
                        "field": edu.get("field_of_study"),
                        "year": edu.get("end_year"),
                    }
                    for edu in (data.get("education") or [])
                    if edu.get("institution") or edu.get("degree")
                ],
                "skills": data.get("skills") or [],
                "projects": [
                    {
                        "title": proj.get("title"),
                        "summary": proj.get("description"),
                        "skills": proj.get("skills_used", []),
                    }
                    for proj in (data.get("projects") or [])
                    if proj.get("title") or proj.get("description")
                ],
                "current_role": data.get("profile", {}).get("headline"),
                "career_goal": None
            }

            missing_skills_context = ""
            if missing_skills:
                missing_skills_context = (
                    "\nRecent job postings relevant to the candidate frequently require these skills that they currently lack:\n"
                    f"{json.dumps(clean_dict(missing_skills), ensure_ascii=False)}\n"
                )

            weak_skills_context = ""
            if weak_skills:
                weak_skills_context = (
                    "\nThe candidate already lists these skills on their profile, but they are at a beginner level and require reinforcement:\n"
                    f"{json.dumps(clean_dict(weak_skills), ensure_ascii=False)}\n"
                )

            messages = [
                {
                    "role": "system",
                    "content": (
                        "You are an expert career and skill development advisor.\n"
                        "Your task is to analyze the user's profile and the provided market trend skills to recommend a personalized skill development path.\n"
                        "Output MUST follow EXACT TOON syntax.\n"
                        "STRICT RULES:\n"
                        '1. Use only double quotes (") for all strings.\n'
                        '2. Escape all internal quotes using \\".\n'
                        "3. Parentheses () are for objects.\n"
                        "4. Separate all fields with commas.\n"
                        "5. Do NOT add any extra text outside the TOON object.\n"
                        "CONTENT RULES:\n"
                        "6. Categorize skills as 'technical', 'soft', or 'domain-specific'.\n"
                        "7. Identify 8-10 skills most relevant to the user's background and industry trends.\n"
                        "8. Provide a clear importance rationale for each skill.\n"
                        "9. Include practical learning suggestions (projects, practice, etc.).\n"
                        "RESOURCE RULES (MANDATORY):\n"
                        "10. For EACH skill, include a 'resources' field.\n"
                        "11. Each skill MUST have at least 2 resources.\n"
                        "12. Resources MUST include real, specific items such as:\n"
                        "    - Course names\n"
                        "    - Certification programs\n"
                        "    - Learning platforms\n"
                        "    - URLs (valid-looking links)\n"
                        "13. Each resource must include: name, type, provider, url, cost, description.\n"
                        "14. Ensure a mix of 'free' and 'paid' resources where possible.\n"
                        "15. Avoid generic placeholders like 'search online' or 'various courses'.\n"
                        "ROADMAP RULE:\n"
                        "16. Assign one of these priorities for each skill:\n"
                        "    - 'immediate': High-priority skills the candidate needs to acquire immediately.\n"
                        "    - 'job-match': Skills that will directly improve the candidate's job match scores and eligibility.\n"
                        "    - 'future-ready': Skills required for long-term career growth and future-readiness.\n"
                        "    - 'long-term': General skills for long-term professional development.\n"
                    ),
                },
                {
                    "role": "user",
                    "content": (
                        f"{schema_instruction}\n\n"
                        "User profile data:\n"
                        f"{json.dumps(clean_dict(gpt_input), ensure_ascii=False)}\n\n"
                        "Top in-demand skills in user's industry that they lack:\n"
                        f"{json.dumps(clean_dict(market_skills), ensure_ascii=False)}\n"
                        f"{missing_skills_context}"
                        f"{weak_skills_context}"
                    ),
                },
            ]

            response = self.openai_client.chat.completions.create(
                model=self.deployment,
                messages=messages,
                temperature=0.3
            )
            content = (response.choices[0].message.content or "").strip()

            # Remove markdown code fences if present
            if content.startswith("```"):
                content = re.sub(r"^```[^\n]*\n", "", content)
                content = re.sub(r"\n```$", "", content).strip()

            if not content.startswith("SkillDevelopmentTOON("):
                raise ValueError("Invalid TOON format for skill development analysis")

            # Convert TOON → JSON
            analysis_json = formatter.career_toon_to_json(content)
            return json.dumps(analysis_json)
            
        elif report_type == "CAREER_ENHANCEMENT":
            formatter = TOONFormatter()
            schema_instruction = formatter.build_career_schema_instructions()

            industry_names = [ind.get("name") for ind in data.get("industries") or [] if ind.get("name")]
            gpt_input = {
                "industries": industry_names,
                "experience": [
                    {
                        "company": exp.get("company_name"),
                        "role": exp.get("title"),
                        "duration": f"{exp.get('start_date')} - {exp.get('end_date') or 'present'}",
                        "summary": exp.get("description"),
                        "skills": exp.get("skills_used", []),
                    }
                    for exp in (data.get("experiences") or [])
                    if exp.get("company_name") or exp.get("title")
                ],
                "education": [
                    {
                        "school": edu.get("institution"),
                        "degree": edu.get("degree"),
                        "field": edu.get("field_of_study"),
                        "year": edu.get("end_year"),
                    }
                    for edu in (data.get("education") or [])
                    if edu.get("institution") or edu.get("degree")
                ],
                "skills": data.get("skills") or [],
                "projects": [
                    {
                        "title": proj.get("title"),
                        "summary": proj.get("description"),
                        "skills": proj.get("skills_used", []),
                    }
                    for proj in (data.get("projects") or [])
                    if proj.get("title") or proj.get("description")
                ],
                "current_role": data.get("profile", {}).get("headline"),
                "career_goal": None
            }

            messages = [
                {
                    "role": "system",
                    "content": (
                        "You are a strict career advisor engine.\n"
                        "Output MUST follow EXACT TOON syntax.\n"
                        "STRICT RULES:\n"
                        '1. Use only double quotes (") for all strings.\n'
                        '2. Escape all internal quotes using \\".\n'
                        "3. Do NOT use } inside string values.\n"
                        "4. Use parentheses () ONLY for objects.\n"
                        "5. Every key MUST be followed by a colon.\n"
                        "6. Separate all fields with commas.\n"
                        "7. Do NOT produce trailing commas.\n"
                        "8. URLs must be valid and start with https://\n"
                        "9. Do NOT break strings across lines.\n"
                        "10. If unsure, return null instead of invalid syntax.\n"
                        "11. ALL sections must be filled with realistic data.\n"
                        "12. ALWAYS include resource URLs in courses, certifications, and action_plan.\n"
                        "13. ALWAYS include globally recognized or top regional universities.\n"
                        "14. Prefer universities offering online or flexible programs where applicable.\n"
                        "15. hiring_companies MUST be real well-known companies relevant to the field.\n"
                        "16. entrance_exams MUST be realistic (e.g., GATE, GRE, CAT, IELTS).\n"
                        "17. Strongly prefer FREE, open-source, or high-quality free resources.\n"
                        "18. recommendations.courses MUST contain at least 2 valid courses.\n"
                        "19. recommendations.certifications MUST contain at least 2 valid certifications.\n"
                        "20. Empty arrays are STRICTLY forbidden.\n"
                        "21. If unsure, generate the most relevant real-world options instead of leaving blank.\n"
                        "22. Prefer well-known platforms like Coursera, edX, Udemy, Kaggle, freeCodeCamp, AWS, Google, Microsoft.\n"
                        "23. Use real and verifiable course/certification names.\n"
                    ),
                },
                {
                    "role": "user",
                    "content": (
                        f"{schema_instruction}\n\n"
                        "User profile data:\n"
                        f"{json.dumps(clean_dict(gpt_input), ensure_ascii=False)}\n"
                    ),
                },
            ]

            response = self.openai_client.chat.completions.create(
                model=self.deployment,
                messages=messages,
                temperature=0.2
            )
            content = (response.choices[0].message.content or "").strip()

            # Remove markdown code fences if present
            if content.startswith("```"):
                content = re.sub(r"^```[^\n]*\n", "", content)
                content = re.sub(r"\n```$", "", content).strip()

            if not content.startswith("CareerAdviceTOON("):
                raise ValueError("Invalid TOON format for career advice")

            # Convert TOON → JSON
            advice_json = formatter.career_toon_to_json(content)
            
            # Add industries from profile data if not present
            if "industries" not in advice_json or not advice_json["industries"]:
                advice_json["industries"] = industry_names
                
            return json.dumps(advice_json)
            
        return ""

    def _fallback_report_text(self, report_type: str, data: dict) -> str:
        """
        Fallback compiler in case LLM service keys are invalid or missing.
        """
        if report_type == "SKILL_ANALYSIS":
            return json.dumps({
                "skills_analysis": [
                    {
                        "skill": "System Design",
                        "category": "technical",
                        "importance_rationale": "Essential for scaling applications.",
                        "learning_suggestions": ["Practice system design questions", "Read design blogs"],
                        "resources": [
                            {
                                "name": "Mastering Microservices Architecture",
                                "type": "course",
                                "provider": "Coursera",
                                "url": "https://coursera.org",
                                "cost": "free",
                                "description": "Hands-on scaling guidelines."
                            }
                        ],
                        "roadmap_priority": "immediate"
                    }
                ]
            })
        elif report_type == "CAREER_ENHANCEMENT":
            user_industries = data.get("industries") or []
            industry_names = [ind.get("name") for ind in user_industries if ind.get("name")]
            return json.dumps({
                "career_paths": {
                    "current_role": data["profile"].get("headline") or "Software Engineer",
                    "next_role": "Senior " + (data["profile"].get("headline") or "Software Engineer"),
                    "future_role": "Lead Architect / Engineering Manager"
                },
                "skill_gaps": [
                    {
                        "skill": "System Design",
                        "current_level": "intermediate",
                        "required_level": "advanced",
                        "importance": 8.5
                    }
                ],
                "recommendations": {
                    "courses": [
                        {
                            "title": "Pragmatic System Design",
                            "provider": "Educative",
                            "url": "https://educative.io"
                        }
                    ],
                    "certifications": [
                        {
                            "title": "AWS Certified Solutions Architect",
                            "provider": "Amazon Web Services",
                            "url": "https://aws.amazon.com"
                        }
                    ]
                },
                "action_plan": [
                    {
                        "phase": "Next 0-6 months",
                        "action": "Acquire AWS Solutions Architect certification and lead a database optimization task.",
                        "timeline": "0-6 months",
                        "resources": ["https://aws.amazon.com"]
                    }
                ],
                "industries": industry_names
            })
        else:
            return f"\nRESUME PROFILE OF: {data['user']['full_name']}\n{data['profile']['headline']}\nEmail: {data['user']['email']} | Phone: {data['user']['phone']}\n\nPROFESSIONAL SUMMARY:\nExperienced specialist with expertise in {', '.join(data['skills'][:6])}. Focused on delivery of reliable technical architectures.\n\nWORK EXPERIENCE:\n" + "\n".join([f"- {exp['title']} at {exp['company_name']} ({exp['start_date']} to {exp['end_date']})" for exp in data['experiences']]) + "\n\nEDUCATION:\n" + "\n".join([f"- {edu['degree']} in {edu['field_of_study']} from {edu['institution']}" for edu in data['education']]) + "\n"
