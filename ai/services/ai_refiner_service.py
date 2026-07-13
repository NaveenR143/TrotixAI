from __future__ import annotations

import json
import os
from pathlib import Path
from uuid import UUID
from dotenv import load_dotenv

from ai.utils.errors import AIRefinementError, CareerAdvisorError
from ai.utils.toon import TOONFormatter
from ai.utils.data_utils import clean_dict
from typing import Dict, Any, List
import logging
import httpx

logger = logging.getLogger(__name__)


try:
    from openai import AzureOpenAI, OpenAI  # type: ignore
except Exception:  # pragma: no cover
    AzureOpenAI = None  # type: ignore
    OpenAI = None  # type: ignore

load_dotenv()


class AzureOpenAIResumeRefiner:
    """Refines deterministic extraction using Azure OpenAI mini model via TOON."""

    def __init__(
        self,
        endpoint: str | None = None,
        api_key: str | None = None,
        api_version: str | None = None,
        deployment: str | None = None,
    ) -> None:
        self._endpoint = (endpoint or os.getenv("AZURE_OPENAI_ENDPOINT", "")).split("#")[0].strip()
        self._api_key = (api_key or os.getenv("AZURE_OPENAI_API_KEY", "")).split("#")[0].strip()
        self._api_version = (api_version or os.getenv(
            "AZURE_OPENAI_API_VERSION", "2025-04-14"
        )).split("#")[0].strip()
        self._deployment = (deployment or os.getenv(
            "AZURE_OPENAI_DEPLOYMENT", "")).split("#")[0].strip()
        self._formatter = TOONFormatter()

        if not self._endpoint or not self._api_key or not self._deployment:
            raise AIRefinementError(
                "Azure OpenAI configuration missing. Set AZURE_OPENAI_ENDPOINT, "
                "AZURE_OPENAI_API_KEY, and AZURE_OPENAI_DEPLOYMENT."
            )

        if AzureOpenAI is None:
            raise AIRefinementError(
                "`openai` package is required for Azure OpenAI calls."
            )

        # self._client = AzureOpenAI(
        #     azure_endpoint=self._endpoint,
        #     api_key=self._api_key,
        #     api_version=self._api_version,
        # )

        self._client = OpenAI(
            base_url=self._endpoint,
            api_key=self._api_key,
        )

    async def generate_career_advice(
        self,
        profile_data: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Generate structured career advice using Azure OpenAI
        """

        schema_instruction = self._formatter.build_career_schema_instructions()

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
                    f"{json.dumps(clean_dict(profile_data), ensure_ascii=False)}\n"
                ),
            },
        ]

        try:
            response = self._client.chat.completions.create(
                model=self._deployment,
                messages=messages,
                temperature=0.2,  # slight creativity for recommendations
            )
            if hasattr(response, "usage") and response.usage:
                print(f"Input tokens: {response.usage.prompt_tokens}, Output tokens: {response.usage.completion_tokens}")

            content = (response.choices[0].message.content or "").strip()

            # 🔍 Debug (optional)
            # print("Career Advice Raw Output:", content)

            # 🔴 Strong validation
            if not content.startswith("CareerAdviceTOON("):
                raise CareerAdvisorError(
                    "Invalid TOON format (missing root object)")

            if not content.endswith(")"):
                raise CareerAdvisorError(
                    "Malformed TOON response (missing closing bracket)"
                )

            # 🧩 Convert TOON → JSON
            advice_json = self._formatter.career_toon_to_json(content)

            # 🔍 Optional debug dump
            # with open(f"career_advice_{user_id}.json", "w", encoding="utf-8") as f:
            #     json.dump(advice_json, f, indent=2, ensure_ascii=False)

            return advice_json

        except CareerAdvisorError:
            raise

        except Exception as exc:
            logger.error(
                f"Career advice generation failed: {exc}", exc_info=True)
            raise CareerAdvisorError(
                f"LLM career advice failed: {exc}") from exc

    async def generate_skill_development_analysis(
        self,
        profile_data: Dict[str, Any],
        market_skills: List[str],
        missing_skills: List[str] = None,
    ) -> Dict[str, Any]:
        """
        Generate structured skill development analysis using Azure OpenAI
        """
        schema_instruction = self._formatter.build_skill_development_instructions()

        # Build missing skills context if available
        missing_skills_context = ""
        if missing_skills:
            missing_skills_context = (
                "\nRecent job postings relevant to the candidate frequently require these skills that they currently lack:\n"
                f"{json.dumps(clean_dict(missing_skills), ensure_ascii=False)}\n"
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
                    "16. Assign 'short-term' or 'long-term' priority for each skill.\n"
                ),
            },
            {
                "role": "user",
                "content": (
                    f"{schema_instruction}\n\n"
                    "User profile data:\n"
                    f"{json.dumps(clean_dict(profile_data), ensure_ascii=False)}\n\n"
                    "Top in-demand skills in user's industry that they lack:\n"
                    f"{json.dumps(clean_dict(market_skills), ensure_ascii=False)}\n"
                    f"{missing_skills_context}"
                ),
            },
        ]

        try:
            response = self._client.chat.completions.create(
                model=self._deployment,
                messages=messages,
                temperature=0.3,
            )
            if hasattr(response, "usage") and response.usage:
                print(f"Input tokens: {response.usage.prompt_tokens}, Output tokens: {response.usage.completion_tokens}")

            content = (response.choices[0].message.content or "").strip()

            if not content.startswith("SkillDevelopmentTOON("):
                raise CareerAdvisorError(
                    "Invalid TOON format for skill development analysis"
                )

            # Convert TOON → JSON
            analysis_json = self._formatter.career_toon_to_json(content)

            return analysis_json
        except Exception as exc:
            logger.error(
                f"Skill development analysis failed: {exc}", exc_info=True)
            raise CareerAdvisorError(
                f"LLM skill analysis failed: {exc}") from exc

    async def generate_application_email(
        self,
        user_profile: Dict[str, Any],
        job_details: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Generate a personalized application email using Azure OpenAI
        """
        schema_instruction = self._formatter.build_application_email_instructions()

        messages = [
            {
                "role": "system",
                "content": (
                    "You are an experienced career coach and professional resume consultant specializing in job applications in India.\n"
                    "Your task is to write a personalized and professional job application email based on the candidate's profile and the job description.\n"
                    "The email should sound natural, confident, and genuinely written by a professional candidate — not robotic, overly formal, or AI-generated.\n"
                    "Focus on aligning the candidate’s relevant skills, experience, and achievements with the role requirements.\n"
                    "Keep the tone concise, respectful, and suitable for Indian recruiters and hiring managers.\n"
                    "Avoid generic phrases, exaggerated claims, and template-style wording.\n"
                    "The email should include:\n"
                    "- A professional subject line\n"
                    "- A personalized greeting if recruiter/company information is available\n"
                    "- A strong but concise introduction\n"
                    "- Relevant experience and skills matching the job role\n"
                    "- A polite closing with interest in further discussion\n"
                    "- Professional sign-off\n\n"
                    "Output MUST follow EXACT TOON syntax.\n"
                    "STRICT RULES:\n"
                    '1. Use only double quotes (") for all strings.\n'
                    '2. Escape all internal quotes using \\".\n'
                    "3. Parentheses () are for objects.\n"
                    "4. Separate all fields with commas.\n"
                    "5. Do NOT add any extra text outside the TOON object.\n"
                    "6. The body MUST use \\n for newlines and maintain proper email formatting.\n"
                    "7. Do NOT use placeholders like [Your Name] or generic template text.\n"
                    "8. Ensure the writing feels human, personalized, and role-specific.\n"
                ),
            },
            {
                "role": "user",
                "content": (
                    f"{schema_instruction}\n\n"
                    "Candidate Profile:\n"
                    f"{json.dumps(clean_dict(user_profile), ensure_ascii=False)}\n\n"
                    "Job Description:\n"
                    f"{json.dumps(clean_dict(job_details), ensure_ascii=False)}\n"
                ),
            },
        ]

        try:
            response = self._client.chat.completions.create(
                model=self._deployment,
                messages=messages,
                temperature=0.7,  # moderate creativity for email writing
            )
            if hasattr(response, "usage") and response.usage:
                print(f"Input tokens: {response.usage.prompt_tokens}, Output tokens: {response.usage.completion_tokens}")

            content = (response.choices[0].message.content or "").strip()

            if not content.startswith("ApplicationEmailTOON("):
                raise CareerAdvisorError(
                    "Invalid TOON format for application email"
                )

            # Convert TOON → JSON
            email_json = self._formatter.career_toon_to_json(content)

            return email_json

        except Exception as exc:
            logger.error(
                f"Application email generation failed: {exc}", exc_info=True)
            raise CareerAdvisorError(
                f"LLM application email failed: {exc}") from exc

    async def generate_professional_photo(
        self,
        user_id: UUID,
        avatar_url: str,
        session: AsyncSession,
    ) -> str:
        """
        Orchestrate the AI photo enhancement process.
        """
        logger.info(f"Generating professional photo for user {user_id} using source {avatar_url}")
        
        # 1. Download image from avatar_url
        try:
            from ai.services.azure_storage_service import AzureStorageService
            azure_service = AzureStorageService()
            image_bytes, content_type = await azure_service.get_user_photo(avatar_url)
        except Exception as e:
            logger.error(f"Failed to fetch user photo from storage: {e}")
            raise CareerAdvisorError(f"Could not retrieve source photo from storage: {str(e)}")

        # 2. Call GPT to analyze photo and get prompt + gender info
        # prompt_data = await self.call_gpt_image_prompt_generation(image_bytes, content_type, user_id, session)
        # dalle_prompt = prompt_data.get("prompt")
        # gender = prompt_data.get("gender", "generic")

        # 3. Call DALL-E (or fallback) to generate the image
        generated_url = await self.call_gpt_image_model(
            image_bytes=image_bytes,
            content_type=content_type,
        )

        return generated_url

    async def call_gpt_image_prompt_generation(
        self,
        image_bytes: bytes,
        content_type: str,
        user_id: UUID,
        session: AsyncSession,
    ) -> dict:
        """
        Analyze image using multimodal GPT model and return prompt + gender.
        If vision fails or is unsupported, fallback to profile-based text description.
        """
        import base64
        from sqlalchemy import text
        
        try:
            base64_image = base64.b64encode(image_bytes).decode('utf-8')
            messages = [
                {
                    "role": "system",
                    "content": (
                        "You are an AI assistant specialized in image analysis for professional profile photos.\n"
                        "Analyze the user's photo and output a JSON object containing:\n"
                        "1. 'gender': 'male', 'female', or 'unknown'\n"
                        "2. 'prompt': A detailed DALL-E 3 image generation prompt to generate a high-quality professional corporate headshot of this person.\n"
                        "The prompt should preserve key features (approximate age, ethnicity, hair color/style, eye color) and specify professional business attire (suit, blazer) against a clean modern office backdrop with soft studio lighting.\n"
                        "Return ONLY a valid JSON object matching the schema: {\"gender\": \"...\", \"prompt\": \"...\"}."
                    )
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Analyze this photo and write the JSON prompt output."
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{content_type};base64,{base64_image}"
                            }
                        }
                    ]
                }
            ]

            response = self._client.chat.completions.create(
                model=self._deployment,
                messages=messages,
                response_format={"type": "json_object"},
                temperature=0.2,
            )
            if hasattr(response, "usage") and response.usage:
                print(f"Input tokens: {response.usage.prompt_tokens}, Output tokens: {response.usage.completion_tokens}")
            
            result = json.loads(response.choices[0].message.content or "{}")
            if "prompt" in result:
                return result
                
        except Exception as e:
            logger.warning(f"Multimodal vision call failed or unsupported, falling back to text profile: {e}")
            
        # Fallback: Query database for profile details to construct prompt
        try:
            query = text("SELECT first_name, last_name, gender FROM resumes WHERE user_id = :user_id LIMIT 1")
            db_res = await session.execute(query, {"user_id": str(user_id)})
            row = db_res.fetchone()
            
            gender = "unknown"
            if row:
                gender = (row[2] or "unknown").lower()
                
            gender_pronoun = "person"
            attire = "professional business attire"
            if gender == "male":
                gender_pronoun = "man"
                attire = "a sharp navy blue suit with a white shirt and tie"
            elif gender == "female":
                gender_pronoun = "woman"
                attire = "a professional black blazer with a white blouse"

            fallback_prompt = (
                f"A professional corporate headshot of a smiling {gender_pronoun} in {attire}. "
                f"They look confident and friendly, suitable for a resume and LinkedIn profile. "
                f"Set against a modern, clean, slightly out-of-focus office background with soft studio lighting. "
                f"High-quality 4k resolution, realistic photo."
            )
            return {"gender": gender, "prompt": fallback_prompt}
            
        except Exception as db_err:
            logger.error(f"Fallback database query failed: {db_err}")
            return {
                "gender": "unknown",
                "prompt": "A high-quality professional corporate headshot of a smiling professional, dressed in corporate attire, set against a clean, modern, slightly out-of-focus office background with soft studio lighting."
            }

    async def call_gpt_image_model(
        self,
        image_bytes: bytes | None = None,
        content_type: str | None = None,
    ) -> str:
        """
        Call AZURE_FLUX model to generate the image.
        If AZURE_FLUX fails, fallback to a premium preset unsplash URL.
        """
        
        try:
            endpoint = os.getenv("AZURE_FLUX_ENDPOINT", "").split("#")[0].strip()
            api_key = os.getenv("AZURE_FLUX_API_KEY", "").split("#")[0].strip()
            api_version = os.getenv("AZURE_FLUX_API_VERSION", "").split("#")[0].strip()
            deployment = os.getenv("AZURE_FLUX_DEPLOYMENT", "").split("#")[0].strip()

            if not endpoint or not api_key:
                raise AIRefinementError("AZURE_FLUX_ENDPOINT and AZURE_FLUX_API_KEY must be set in env.")

            url = f"{endpoint}?api-version={api_version}" if api_version else endpoint
            headers = {
                "Authorization": f"Bearer {api_key}",
                "api-key": api_key,
                "Content-Type": "application/json",
            }

            image_prompt = (
                "Transform the uploaded photo into a professional corporate headshot while preserving "
                "the person's exact identity, facial features, hairstyle, skin tone, and natural expression. "
                "Create a confident, friendly, and approachable appearance suitable for a resume and LinkedIn profile. "
                "Improve lighting, sharpness, and overall image quality while keeping the result photorealistic. "
                "Use professional business attire appropriate for a corporate environment. "
                "Replace the background with a clean, modern office setting with a subtle blur and soft studio lighting. "
                "Frame the image as a professional head-and-shoulders portrait with natural proportions. "
                "Maintain realistic skin texture and avoid any artificial or overly retouched appearance. "
                "High-resolution professional photography style, realistic DSLR camera quality."
            )

            payload = {
                "prompt": image_prompt,
                "width": 1024,
                "height": 1024,
                "n": 1,
            }
            if deployment:
                payload["model"] = deployment

            if image_bytes and content_type:
                import base64
                base64_image = base64.b64encode(image_bytes).decode('utf-8')
                payload["input_image"] = base64_image

            logger.info(f"Calling AZURE_FLUX model with endpoint: {endpoint}")
            async with httpx.AsyncClient() as client:
                response = await client.post(url, headers=headers, json=payload, timeout=60.0)
                response.raise_for_status()
                resp_json = response.json()

            data = resp_json.get("data", [])
            if data:
                image_url = data[0].get("url")
                if image_url:
                    return image_url
                b64 = data[0].get("b64_json")
                if b64:
                    return f"data:image/png;base64,{b64}"

            raise AIRefinementError("No image URL or base64 data returned in the response.")

        except Exception as e:
            logger.error(f"AZURE_FLUX image generation failed, returning premium unsplash preset: {e}")
            
        fallback_urls = {
            "male": "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400",
            "female": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
            "unknown": "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400",
            "generic": "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400"
        }
        
        gender_key = ("unknown" or "generic").lower()
        return fallback_urls.get(gender_key, fallback_urls["generic"])

    async def upload_generated_image(self, image_url: str, user_id: UUID) -> str:
        """
        Download the generated image from OpenAI/Unsplash/BFL or parse base64 and upload it to Azure Storage.
        """
        import httpx
        import base64
        from ai.services.azure_storage_service import AzureStorageService
        from azure.storage.blob import BlobServiceClient
        
        logger.info(f"Downloading/parsing generated image for user {user_id}")
        
        if image_url.startswith("data:"):
            try:
                header, encoded = image_url.split(",", 1)
                image_bytes = base64.b64decode(encoded)
                content_type = header.split(";")[0].split(":")[1]
            except Exception as e:
                raise CareerAdvisorError(f"Failed to parse base64 data URL: {e}")
        else:
            async with httpx.AsyncClient() as client:
                response = await client.get(image_url, timeout=30.0)
                if response.status_code != 200:
                    raise CareerAdvisorError(f"Failed to download generated image: HTTP {response.status_code}")
                image_bytes = response.content
                content_type = response.headers.get("content-type", "image/png")

        file_ext = ".png"
        if "jpeg" in content_type or "jpg" in content_type:
            file_ext = ".jpg"
        elif "webp" in content_type:
            file_ext = ".webp"

        azure_service = AzureStorageService()
        blob_service_client = BlobServiceClient.from_connection_string(
            azure_service.connection_string
        )
        container_name = "userphotos"
        try:
            blob_service_client.create_container(container_name)
        except Exception:
            pass
            
        blob_name = f"{user_id}_enhanced{file_ext}"
        blob_client = blob_service_client.get_blob_client(
            container=container_name, blob=blob_name
        )
        
        blob_client.upload_blob(image_bytes, overwrite=True)
        return blob_client.url

    async def update_user_avatar(self, user_id: UUID, new_avatar_url: str, session: AsyncSession) -> bool:
        """
        Update the avatar_url in the database.
        """
        from ai.db.resume_repository import ResumeRepository
        repo = ResumeRepository(session)
        success = await repo.update_avatar_url(str(user_id), new_avatar_url)
        return success
