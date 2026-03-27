                   ┌──────────────────────────┐
                   │   Job Description (JD)   │
                   └────────────┬─────────────┘
                                │
                                ▼
                   ┌──────────────────────────┐
                   │   JD Analyzer Module     │
                   │ (NLP / keyword extract)  │
                   └────────────┬─────────────┘
                                │
                                ▼
                   ┌──────────────────────────┐
                   │   JD Insights JSON       │
                   │ skills, tools, domain    │
                   └────────────┬─────────────┘
                                │
                                │
        ┌───────────────────────┼────────────────────────┐
        │                       │                        │
        ▼                       ▼                        ▼

┌──────────────────┐   ┌──────────────────┐   ┌────────────────────────┐
│ Summary Prompt   │   │ Skills Prompt    │   │ Experience Prompts     │
│ (LLM Call #1)    │   │ (LLM Call #2)    │   │ (LLM Call #3 - loop)   │
└────────┬─────────┘   └────────┬─────────┘   └──────────┬─────────────┘
         │                      │                        │
         ▼                      ▼                        ▼

 Optimized Summary     Optimized Skills      Optimized Experience Bullets
                                                   (per job)

        └───────────────────────┬────────────────────────┘
                                ▼
                   ┌──────────────────────────┐
                   │ Resume Aggregator        │
                   │ (merge all outputs)      │
                   └────────────┬─────────────┘
                                │
                                ▼
                   ┌──────────────────────────┐
                   │ Validation Layer         │
                   │ - No hallucination       │
                   │ - Skill consistency      │
                   └────────────┬─────────────┘
                                │
                                ▼
                   ┌──────────────────────────┐
                   │ Final Resume JSON        │
                   └────────────┬─────────────┘
                                │
                                ▼
                   ┌──────────────────────────┐
                   │ Template Engine (HTML)   │
                   │ Jinja2                   │
                   └────────────┬─────────────┘
                                │
                                ▼
                   ┌──────────────────────────┐
                   │ PDF Generator            │
                   │ WeasyPrint / pdfkit      │
                   └──────────────────────────┘