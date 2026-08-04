import os
import json
import logging
from openai import OpenAI
from ProcessPDF.resume_pipeline.toon import TOONFormatter

logger = logging.getLogger(__name__)

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

        if report_type == "ATS_RESUME":
            # Active job description fallback
            job_desc = data["target_job"]["description"]
            job_title = data["target_job"]["title"]
            
            if not job_desc:
                # Dynamically construct target job description using LLM
                prompt_job = f"Based on the candidate skills ({', '.join(data['skills'])}) and experience: {data['profile']['headline']}, construct a standard, realistic target job description (around 150 words) that matches their seniority level."
                response_job = self.openai_client.chat.completions.create(
                    model=self.deployment,
                    messages=[{"role": "user", "content": prompt_job}],
                    temperature=0.7
                )
                job_desc = response_job.choices[0].message.content.strip()
                job_title = data["profile"]["headline"] or "Software Engineer"
                
            prompt = f"""
                You are an expert ATS optimization consultant.
                Optimize the following candidate profile for the target job:
                Target Job Title: {job_title}
                Target Job Description:
                {job_desc}

                Candidate Resume Details:
                {candidate_summary}

                Task:
                Produce a completely rewritten, highly professional, ATS-optimized single-column resume text.
                Incorporate key industry terms, matching keywords, metrics/achievements, and standard resume subheadings (PROFESSIONAL SUMMARY, WORK EXPERIENCE, PROJECTS, EDUCATION, TECHNICAL SKILLS). Do not use any markdown formatting like bolding asterisks or bullet styles. Keep it clean and text-only.
            """
            response = self.openai_client.chat.completions.create(
                model=self.deployment,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2
            )
            return response.choices[0].message.content.strip()
            
        elif report_type == "ENHANCED_RESUME":
            prompt = f"""
                You are a premium career coach and resume designer.
                Rewrite and enhance the following candidate profile:
                {candidate_summary}

                Task:
                Generate a high-impact, professional resume draft. Optimize sentence structures, use action verbs (e.g., spearheaded, engineered, orchestrated), and highlight accomplishments with metrics. Output should be divided into sections (PROFESSIONAL SUMMARY, EXPERIENCE, EDUCATION, SKILLS). Do not use markdown bullet symbols.
            """
            response = self.openai_client.chat.completions.create(
                model=self.deployment,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3
            )
            return response.choices[0].message.content.strip()
            
        elif report_type == "SKILL_ANALYSIS":
            market_skills_context = ""
            if market_skills:
                market_skills_context = f"\nTop in-demand skills in user's industry that they lack:\n{json.dumps(market_skills, ensure_ascii=False)}\n"

            missing_skills_context = ""
            if missing_skills:
                missing_skills_context = f"\nRecent matching job postings require these skills that the candidate lacks:\n{json.dumps(missing_skills, ensure_ascii=False)}\n"
                
            weak_skills_context = ""
            if weak_skills:
                weak_skills_context = f"\nThe candidate lists these skills at a beginner level needing reinforcement:\n{json.dumps(weak_skills, ensure_ascii=False)}\n"

            prompt = f"""
                You are an expert career and skill development advisor.
                Perform a comprehensive Skill Analysis and Gap Audit for the candidate:
                {candidate_summary}
                {market_skills_context}
                {missing_skills_context}
                {weak_skills_context}

                Output MUST be a valid JSON object matching this schema exactly:
                {{
                    "skills_analysis": [
                        {{
                            "skill": "Skill Name",
                            "category": "technical|soft|domain-specific",
                            "importance_rationale": "Clear explanation of why this skill is important for their target roles and matching jobs.",
                            "learning_suggestions": [
                                "Practical suggestion 1 (e.g., project, practice)",
                                "Practical suggestion 2"
                            ],
                            "resources": [
                                {{
                                    "name": "Course / Certification / Website Name",
                                    "type": "course|certification|website|book|project",
                                    "provider": "Platform or Institution name",
                                    "url": "URL to resource",
                                    "cost": "free|paid",
                                    "description": "Short description of the course contents"
                                }}
                            ],
                            "roadmap_priority": "immediate|job-match|future-ready|long-term"
                        }}
                    ]
                }}

                STRICT CONTENT RULES:
                1. Identify 8-10 skills most relevant to the user's background, job gaps, and weak skills.
                2. For each skill, recommend at least 2 resources.
                3. Roadmap priority must be exactly one of: 'immediate', 'job-match', 'future-ready', 'long-term'.
                4. Do NOT wrap the output in markdown block codes or include extra text. Just output pure JSON.
            """
            response = self.openai_client.chat.completions.create(
                model=self.deployment,
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
                temperature=0.2
            )
            return response.choices[0].message.content.strip()
            
        elif report_type == "CAREER_ENHANCEMENT":
            schema_instruction = TOONFormatter.build_career_schema_instructions()
            prompt = f"""
                Act as an executive career advisor. Formulate a personalized career roadmap and skill gap analysis for the candidate:
                {candidate_summary}

                Instructions:
                {schema_instruction}
            """
            response = self.openai_client.chat.completions.create(
                model=self.deployment,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3
            )
            raw_toon = response.choices[0].message.content.strip()
            # Parse TOON format back to JSON/dict
            parsed_json = TOONFormatter().career_toon_to_json(raw_toon)
            
            # Add industries from profile data if not present
            user_industries = data.get("industries") or []
            industry_names = [ind.get("name") for ind in user_industries if ind.get("name")]
            if "industries" not in parsed_json or not parsed_json["industries"]:
                parsed_json["industries"] = industry_names
                
            return json.dumps(parsed_json)
            
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
