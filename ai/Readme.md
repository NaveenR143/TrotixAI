pip install -r api/requirements.txt

& C:/Naveen/Jobs\Source/TrotixAI/ai/.venv/Scripts/Activate.ps1


uvicorn ai.main:app --reload --port 8000

uvicorn ai.main:app --host 0.0.0.0 --port 8000