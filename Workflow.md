🔁 1. Improved Candidate Workflow (Mobile + Web)

🟢 Entry State
    New user
    Upload Resume (PDF/DOC)
    OR Import from LinkedIn / Drive
    Returning user
    Skip upload → directly show job feed

🧠 Resume Processing Layer (Important upgrade)
    Parse resume → extract:
    Skills
    Experience
    Role preferences
    Location
    Create User Profile Vector (AI matching)
    Store editable profile (user can tweak extracted data)

📱 Job Feed (Inshorts-style swipe UI)
    UX Improvements
    Swipe cards (like Tinder/Inshorts hybrid)
    Show:
    Job Title, Company, Salary (if available)
    Match Score (🔥 85% match)
    Key skills match/missing
    Location + Work Mode
    Actions:
    👍 Relevant → improves recommendations
    👎 Not Relevant → removes noise
    ⭐ Save Job
    ⚡ Quick Apply (if supported)
    👉 Tap Card → Full Job Details

📄 Job Detail Page (After Tap)

    Full Description
    Skills Required vs Your Skills (highlight gaps)
    Company Info
    Apply Options:
    Redirect to company site
    OR Easy Apply (future feature)

🎯 Smart Enhancements (BIG differentiators)

    1. Skill Gap Engine
    “You’re missing: React, AWS”
    Suggest:
    Courses (Coursera, Udemy, etc.)
    Learning paths

    2. Resume Visibility Score
    “Your profile ranks in top 40%”
    Suggestions:
    Add keywords
    Add projects

    3. Daily Feed Optimization
    Based on:
    Swipe behavior
    Apply clicks
    Time spent

🔁 Returning User Flow
    Open app → Direct Job Feed
    Background refresh of recommendations

Occasional:
“Update resume?”
“New skills trending”


🔄 2. Recruiter Workflow (Reverse Flow)

🟢 Recruiter Entry
    Sign up / Login
    Create Company Profile

📤 Job Posting Flow
    Add:
    Role
    Skills required
    Experience
    Salary
    Location
    AI suggests:
    Better job description
    Missing keywords

🎯 Candidate Discovery (Swipe UI for recruiters)
    Similar to candidate feed:
    Candidate cards
    Show:
    Match %
    Skills
    Experience summary
    Actions:
    👍 Shortlist
    👎 Skip
    📩 Invite to Apply
    👁 View Full Profile
    📄 Candidate Detail Page
    Resume
    Skill match vs job
    Activity (active job seeker or not)
    Actions:
    Contact
    Send test
    Schedule interview

    🧠 Recruiter Intelligence Layer
    Shows:
    “Top 10 matching candidates”
    “Low response rate? Improve JD”



                    ┌─────────────────────────┐
                    │        USER APP         │
                    └──────────┬──────────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
        ┌───────▼───────┐             ┌───────▼────────┐
        │  CANDIDATE    │             │   RECRUITER     │
        └───────┬───────┘             └───────┬────────┘
                │                             │
      ┌─────────▼─────────┐        ┌──────────▼──────────┐
      │ Upload Resume /   │        │ Create Job Posting  │
      │ Import Profile    │        │                     │
      └─────────┬─────────┘        └──────────┬──────────┘
                │                             │
        ┌───────▼────────┐          ┌────────▼─────────┐
        │ Resume Parsing │          │ JD Optimization  │
        │ + Skill Extract│          │ (AI Suggestion)  │
        └───────┬────────┘          └────────┬─────────┘
                │                             │
        ┌───────▼────────┐          ┌────────▼─────────┐
        │ Profile Vector │◄────────►│ Matching Engine  │
        │ (AI Matching)  │          │ (Candidates ↔ Jobs)
        └───────┬────────┘          └────────┬─────────┘
                │                             │
        ┌───────▼────────────┐     ┌─────────▼────────────┐
        │ Job Feed (Swipe UI)│     │ Candidate Feed       │
        │ 👍 👎 ⭐ Apply       │     │ 👍 👎 Invite         │
        └───────┬────────────┘     └─────────┬────────────┘
                │                             │
        ┌───────▼────────────┐     ┌─────────▼────────────┐
        │ Job Detail Page    │     │ Candidate Detail     │
        │ Apply Redirect     │     │ Contact / Interview  │
        └───────┬────────────┘     └─────────┬────────────┘
                │                             │
        ┌───────▼────────────┐     ┌─────────▼────────────┐
        │ Skill Suggestions  │     │ Hiring Insights      │
        │ Courses + Resume   │     │ + Analytics          │
        │ Score              │     │                      │
        └────────────────────┘     └──────────────────────┘