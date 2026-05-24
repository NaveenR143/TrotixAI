# TrotixAI Database Views Proposal

**Generated:** April 10, 2026  
**Database:** PostgreSQL (trotixai)  
**Purpose:** Simplified data access for end-users, reporting, and analytics

---

## Table of Contents

1. [Schema Overview](#schema-overview)
2. [Jobseeker Views](#jobseeker-views-for-candidates)
3. [Recruiter Views](#recruiter-views)
4. [Analytics & Admin Views](#analytics--admin-views)
5. [Reporting Views](#reporting-views)
6. [Implementation Guide](#implementation-guide)

---

## Schema Overview

### Primary Tables (24 tables total)

| Category | Tables |
|----------|--------|
| **Auth & Users** | users, auth_tokens, oauth_accounts |
| **Profiles** | jobseeker_profiles, recruiter_profiles, companies |
| **Skills & Experience** | skills, jobseeker_skills, work_experiences, education, certifications, projects |
| **Resumes** | resumes, resume_sections, resume_builder_docs |
| **Jobs** | jobs, job_categories, job_questions, applications |
| **AI Features** | ai_job_matches, ai_candidate_matches, skill_suggestions, ai_feature_pricing, ai_usage_logs |
| **Credits & Payments** | credit_wallets, credit_transactions, payment_orders, credit_packs, subscription_plans, user_subscriptions |
| **Messaging** | message_threads, messages, notifications |

### Key Relationships

```
users
├── jobseeker_profiles
│   ├── jobseeker_skills → skills
│   ├── work_experiences
│   ├── education
│   ├── certifications
│   └── projects
├── recruiter_profiles → companies
├── applications → jobs
├── credit_wallets → credit_transactions
└── payment_orders

jobs
├── company_id → companies
├── recruiter_id → users
├── job_categories
├── job_questions
└── applications

skills (master table)
└── jobseeker_skills (many-to-many with users)
```

---

## Jobseeker Views (For Candidates)

### View 1: Active Job Opportunities with Match Context

**View Name:** `vw_active_jobs_with_context`

**Description:**  
Displays all active job postings enriched with company details, salary ranges, and location data. Perfect for jobseekers browsing opportunities without needing complex joins.

**Tables Involved:**  
`jobs`, `companies`, `users` (recruiter)

**Key Columns:**  
job_id, job_title, company_name, location, city, country, salary_range, job_type, work_mode, experience_level, skills_required, posted_at, view_count, application_count, recruiter_name

```sql
CREATE VIEW vw_active_jobs_with_context AS
SELECT
    j.id                 AS job_id,
    j.title              AS job_title,
    j.slug               AS job_slug,
    c.name               AS company_name,
    c.slug               AS company_slug,
    c.industry,
    j.location,
    j.city,
    j.state,
    j.country,
    CONCAT(j.salary_min, '–', j.salary_max, ' ', j.salary_currency) AS salary_range,
    j.salary_min,
    j.salary_max,
    j.salary_currency,
    j.job_type,
    j.work_mode,
    j.experience_level,
    j.experience_min_yrs,
    j.experience_max_yrs,
    j.openings,
    array_length(j.skills_required, 1) AS num_skills_required,
    j.skills_required,
    j.description,
    EXTRACT(DAY FROM NOW() - j.posted_at) AS days_posted,
    j.posted_at,
    j.expires_at,
    j.view_count,
    j.apply_count,
    u.full_name           AS recruiter_name,
    c.logo_url,
    c.website,
    c.is_verified         AS company_verified,
    j.created_at          AS job_created_at
FROM jobs j
LEFT JOIN companies c     ON j.company_id = c.id
LEFT JOIN users u         ON j.recruiter_id = u.id
WHERE j.status = 'active'
  AND j.posted_at <= NOW()
  AND (j.expires_at IS NULL OR j.expires_at > NOW())
ORDER BY j.posted_at DESC;
```

---

### View 2: My Applications Summary

**View Name:** `vw_jobseeker_applications_summary`

**Description:**  
A consolidated view for each jobseeker showing their application history, current status, company details, and salary expectations. Used for "My Applications" dashboard.

**Tables Involved:**  
`applications`, `jobs`, `companies`, `users`, `resumes`

**Key Columns:**  
application_id, job_id, job_title, company_name, status, applied_at, salary_min, salary_max, recruiter_notes, starred, interview_scheduled_at, days_since_applied

```sql
CREATE VIEW vw_jobseeker_applications_summary AS
SELECT
    a.id                       AS application_id,
    a.applicant_id             AS jobseeker_id,
    j.id                       AS job_id,
    j.title                    AS job_title,
    j.slug                     AS job_slug,
    c.name                     AS company_name,
    c.slug                     AS company_slug,
    c.industry,
    c.logo_url,
    j.location,
    j.city,
    j.state,
    j.salary_min,
    j.salary_max,
    j.salary_currency,
    j.work_mode,
    j.job_type,
    a.status                   AS application_status,
    a.applied_at,
    EXTRACT(DAY FROM NOW() - a.applied_at) AS days_since_applied,
    a.interview_scheduled_at,
    a.interview_type,
    a.recruiter_notes,
    a.starred,
    a.viewed_at,
    a.ai_match_score,
    r.file_name               AS resume_used,
    a.cover_letter,
    j.posted_at,
    j.expires_at
FROM applications a
JOIN jobs j              ON a.job_id = j.id
LEFT JOIN companies c    ON j.company_id = c.id
LEFT JOIN resumes r      ON a.resume_id = r.id
ORDER BY a.applied_at DESC;
```

---

### View 3: Jobseeker Profile Completeness

**View Name:** `vw_jobseeker_profile_completeness`

**Description:**  
Tracks what sections of a jobseeker's profile are complete or incomplete. Identifies gaps to encourage profile improvement and boost visibility.

**Tables Involved:**  
`users`, `jobseeker_profiles`, `work_experiences`, `education`, `certifications`, `skills`, `projects`, `resumes`

**Key Columns:**  
user_id, full_name, profile_completion_pct, has_headline, has_summary, work_exp_count, education_count, skills_count, certifications_count, projects_count, resumes_count, sections_complete, sections_missing

```sql
CREATE VIEW vw_jobseeker_profile_completeness AS
SELECT
    u.id                    AS user_id,
    u.full_name,
    u.email,
    jp.profile_completion   AS profile_completion_pct,
    CASE WHEN jp.headline IS NOT NULL THEN 1 ELSE 0 END AS has_headline,
    CASE WHEN jp.summary IS NOT NULL THEN 1 ELSE 0 END AS has_summary,
    COALESCE(we_count.cnt, 0) AS work_exp_count,
    COALESCE(edu_count.cnt, 0) AS education_count,
    COALESCE(skill_count.cnt, 0) AS skills_count,
    COALESCE(cert_count.cnt, 0) AS certifications_count,
    COALESCE(proj_count.cnt, 0) AS projects_count,
    COALESCE(res_count.cnt, 0) AS resumes_count,
    jp.updated_at           AS profile_last_updated,
    CASE
        WHEN jp.profile_completion >= 80 THEN 'Excellent'
        WHEN jp.profile_completion >= 60 THEN 'Good'
        WHEN jp.profile_completion >= 40 THEN 'Fair'
        ELSE 'Incomplete'
    END AS profile_status,
    ARRAY_AGG(DISTINCT missing_section) FILTER (WHERE missing_section IS NOT NULL) AS sections_missing
FROM users u
LEFT JOIN jobseeker_profiles jp ON u.id = jp.user_id
LEFT JOIN (SELECT user_id, COUNT(*) AS cnt FROM work_experiences GROUP BY user_id) we_count ON u.id = we_count.user_id
LEFT JOIN (SELECT user_id, COUNT(*) AS cnt FROM education GROUP BY user_id) edu_count ON u.id = edu_count.user_id
LEFT JOIN (SELECT user_id, COUNT(*) AS cnt FROM jobseeker_skills GROUP BY user_id) skill_count ON u.id = skill_count.user_id
LEFT JOIN (SELECT user_id, COUNT(*) AS cnt FROM certifications GROUP BY user_id) cert_count ON u.id = cert_count.user_id
LEFT JOIN (SELECT user_id, COUNT(*) AS cnt FROM projects GROUP BY user_id) proj_count ON u.id = proj_count.user_id
LEFT JOIN (SELECT user_id, COUNT(*) AS cnt FROM resumes GROUP BY user_id) res_count ON u.id = res_count.user_id
LEFT JOIN LATERAL (
    SELECT UNNEST(ARRAY[
        CASE WHEN jp.headline IS NULL THEN 'headline' ELSE NULL END,
        CASE WHEN jp.summary IS NULL THEN 'summary' ELSE NULL END,
        CASE WHEN we_count.cnt = 0 THEN 'experience' ELSE NULL END,
        CASE WHEN edu_count.cnt = 0 THEN 'education' ELSE NULL END,
        CASE WHEN skill_count.cnt = 0 THEN 'skills' ELSE NULL END,
        CASE WHEN res_count.cnt = 0 THEN 'resume' ELSE NULL END
    ]) AS missing_section
) MISSING ON TRUE
WHERE u.role = 'jobseeker'
GROUP BY u.id, u.full_name, u.email, jp.profile_completion, jp.headline, jp.summary, 
         we_count.cnt, edu_count.cnt, skill_count.cnt, cert_count.cnt, proj_count.cnt, 
         res_count.cnt, jp.updated_at;
```

---

### View 4: My AI Job Matches

**View Name:** `vw_jobseeker_ai_job_matches`

**Description:**  
Shows AI-matched job opportunities with detailed scoring breakdown. Highlights skill matches and gaps for each jobseeker.

**Tables Involved:**  
`ai_job_matches`, `jobs`, `companies`, `users`

**Key Columns:**  
match_id, job_id, job_title, company_name, match_score, skill_score, experience_score, semantic_score, matched_skills, missing_skills, match_summary, expires_at

```sql
CREATE VIEW vw_jobseeker_ai_job_matches AS
SELECT
    ajm.id                 AS match_id,
    ajm.user_id            AS jobseeker_id,
    ajm.job_id,
    j.title                AS job_title,
    j.slug                 AS job_slug,
    c.name                 AS company_name,
    c.slug                 AS company_slug,
    c.industry,
    j.location,
    j.city,
    j.work_mode,
    j.experience_level,
    j.salary_min,
    j.salary_max,
    j.salary_currency,
    ajm.match_score        AS overall_match_pct,
    ajm.skill_score,
    ajm.experience_score,
    ajm.semantic_score,
    ajm.matched_skills,
    ajm.missing_skills,
    array_length(ajm.matched_skills, 1) AS num_matched_skills,
    array_length(ajm.missing_skills, 1) AS num_missing_skills,
    ajm.match_summary,
    ajm.matched_at,
    ajm.expires_at,
    EXTRACT(DAY FROM ajm.expires_at - NOW()) AS days_until_expiry,
    j.view_count,
    j.apply_count,
    ajm.credits_used
FROM ai_job_matches ajm
JOIN jobs j        ON ajm.job_id = j.id
LEFT JOIN companies c ON j.company_id = c.id
WHERE ajm.expires_at > NOW()
ORDER BY ajm.match_score DESC, ajm.matched_at DESC;
```

---

### View 5: Skills Marketplace Demand

**View Name:** `vw_skills_market_demand`

**Description:**  
Shows trending skills based on job market demand. Helps jobseekers identify which skills to learn or improve to remain competitive.

**Tables Involved:**  
`jobs`, `skills`

**Key Columns:**  
skill_name, skill_category, demand_count, trending_jobs_count, avg_salary_with_skill, is_trending, market_tier

```sql
CREATE VIEW vw_skills_market_demand AS
SELECT
    s.id                   AS skill_id,
    s.name                 AS skill_name,
    s.category             AS skill_category,
    COUNT(DISTINCT j.id)   AS job_demand_count,
    SUM(CASE WHEN j.status = 'active' THEN 1 ELSE 0 END) AS active_jobs_requiring_skill,
    SUM(CASE WHEN s.is_trending = TRUE THEN 1 ELSE 0 END) > 0 AS is_trending,
    ROUND(AVG(CASE 
        WHEN j.salary_max IS NOT NULL THEN (j.salary_min + j.salary_max) / 2 
    END), 2) AS avg_salary_with_skill,
    ROUND(AVG(CASE 
        WHEN j.salary_min IS NOT NULL THEN j.salary_min 
    END), 2) AS salary_min_avg,
    STRING_AGG(DISTINCT j.experience_level, ', ') AS experience_levels,
    CASE
        WHEN COUNT(DISTINCT j.id) > 500 THEN 'High Demand'
        WHEN COUNT(DISTINCT j.id) > 100 THEN 'Medium Demand'
        ELSE 'Niche'
    END AS demand_tier
FROM skills s
LEFT JOIN jobs j ON s.name = ANY(j.skills_required) OR s.name = ANY(j.skills_preferred)
WHERE s.id IS NOT NULL
GROUP BY s.id, s.name, s.category, s.is_trending
HAVING COUNT(DISTINCT j.id) > 0
ORDER BY job_demand_count DESC;
```

---

## Recruiter Views

### View 6: Job Posting Performance Dashboard

**View Name:** `vw_recruiter_job_performance`

**Description:**  
Comprehensive overview of each job posting's performance metrics—views, applications, engagement, and current status.

**Tables Involved:**  
`jobs`, `applications`, `companies`, `users`

**Key Columns:**  
job_id, job_title, company_name, status, posted_ago_days, view_count, application_count, shortlist_count, hired_count, rejection_rate, avg_days_to_shortlist, cost_per_application

```sql
CREATE VIEW vw_recruiter_job_performance AS
SELECT
    j.id                       AS job_id,
    j.title                    AS job_title,
    j.slug,
    j.recruiter_id,
    c.name                     AS company_name,
    j.status,
    j.job_type,
    j.experience_level,
    j.location,
    j.posted_at,
    EXTRACT(DAY FROM NOW() - j.posted_at) AS days_posted,
    j.expires_at,
    j.openings,
    j.view_count,
    COALESCE(app_count.cnt, 0) AS total_applications,
    COALESCE(shortlist_count.cnt, 0) AS shortlisted_count,
    COALESCE(offered_count.cnt, 0) AS offers_made,
    COALESCE(hired_count.cnt, 0) AS hired_count,
    COALESCE(rejected_count.cnt, 0) AS rejected_count,
    ROUND(CASE 
        WHEN COALESCE(app_count.cnt, 0) > 0 THEN (COALESCE(rejected_count.cnt, 0)::NUMERIC / app_count.cnt) * 100 
        ELSE 0 
    END, 2) AS rejection_rate_pct,
    ROUND(CASE 
        WHEN COALESCE(app_count.cnt, 0) > 0 THEN j.view_count::NUMERIC / app_count.cnt 
        ELSE 0 
    END, 2) AS views_per_application,
    ROUND(AVG(EXTRACT(DAY FROM CASE 
        WHEN a.status IN ('shortlisted', 'interview_scheduled') THEN a.updated_at 
    END - a.applied_at)), 2) AS avg_days_to_shortlist
FROM jobs j
LEFT JOIN companies c ON j.company_id = c.id
LEFT JOIN (SELECT job_id, COUNT(*) AS cnt FROM applications GROUP BY job_id) app_count ON j.id = app_count.job_id
LEFT JOIN (SELECT job_id, COUNT(*) AS cnt FROM applications WHERE status = 'shortlisted' GROUP BY job_id) shortlist_count ON j.id = shortlist_count.job_id
LEFT JOIN (SELECT job_id, COUNT(*) AS cnt FROM applications WHERE status = 'offer_made' GROUP BY job_id) offered_count ON j.id = offered_count.job_id
LEFT JOIN (SELECT job_id, COUNT(*) AS cnt FROM applications WHERE status = 'hired' GROUP BY job_id) hired_count ON j.id = hired_count.job_id
LEFT JOIN (SELECT job_id, COUNT(*) AS cnt FROM applications WHERE status = 'rejected' GROUP BY job_id) rejected_count ON j.id = rejected_count.job_id
LEFT JOIN applications a ON j.id = a.job_id
GROUP BY j.id, j.title, j.slug, j.recruiter_id, c.name, j.status, j.job_type, j.experience_level, 
         j.location, j.posted_at, j.expires_at, j.openings, j.view_count, 
         app_count.cnt, shortlist_count.cnt, offered_count.cnt, hired_count.cnt, rejected_count.cnt;
```

---

### View 7: Active Candidates (For Recruiter Search)

**View Name:** `vw_active_candidates_for_recruiter`

**Description:**  
Displays all actively job-seeking candidates with skills, experience, and availability. Used by recruiters for talent search and targeted outreach.

**Tables Involved:**  
`users`, `jobseeker_profiles`, `jobseeker_skills`, `skills`, `work_experiences`

**Key Columns:**  
user_id, full_name, headline, skills_array, years_of_experience, current_location, willing_to_relocate, expected_salary, is_actively_looking, profile_completion_pct, last_profile_update

```sql
CREATE VIEW vw_active_candidates_for_recruiter AS
SELECT
    u.id                    AS user_id,
    u.full_name,
    u.email,
    u.avatar_url,
    jp.headline,
    jp.summary,
    STRING_AGG(DISTINCT s.name, ', ' ORDER BY s.name) AS skills_string,
    ARRAY_AGG(DISTINCT s.name ORDER BY s.name) AS skills_array,
    jp.years_of_experience,
    jp.current_location,
    jp.preferred_locations,
    jp.current_salary,
    jp.expected_salary,
    jp.salary_currency,
    jp.gender,
    jp.notice_period_days,
    jp.is_actively_looking,
    jp.profile_completion    AS profile_completion_pct,
    jp.linkedin_url,
    jp.github_url,
    jp.portfolio_url,
    jp.updated_at           AS profile_last_updated,
    u.created_at,
    u.last_login_at,
    COUNT(DISTINCT we.id)   AS total_work_experiences,
    COALESCE(MAX(we.years), 0) AS years_in_current_role
FROM users u
LEFT JOIN jobseeker_profiles jp ON u.id = jp.user_id
LEFT JOIN jobseeker_skills js ON u.id = js.user_id
LEFT JOIN skills s ON js.skill_id = s.id
LEFT JOIN work_experiences we ON u.id = we.user_id
WHERE u.role = 'jobseeker'
  AND u.status = 'active'
  AND jp.is_actively_looking = TRUE
GROUP BY u.id, u.full_name, u.email, u.avatar_url, jp.headline, jp.summary, 
         jp.years_of_experience, jp.current_location, jp.preferred_locations, 
         jp.current_salary, jp.expected_salary, jp.salary_currency, jp.gender, 
         jp.notice_period_days, jp.is_actively_looking, jp.profile_completion, 
         jp.linkedin_url, jp.github_url, jp.portfolio_url, jp.updated_at, u.created_at, u.last_login_at
ORDER BY jp.profile_completion DESC, u.last_login_at DESC;
```

---

### View 8: Interview Pipeline

**View Name:** `vw_recruiter_interview_pipeline`

**Description:**  
Tracks candidates through the interview funnel—applications → shortlisted → interview scheduled → offers → hired. Shows current pipeline status and conversion metrics.

**Tables Involved:**  
`applications`, `jobs`, `users`

**Key Columns:**  
recruiter_id, job_id, job_title, pipeline_stage, candidate_count, avg_days_in_stage, conversion_rate, candidates_list

```sql
CREATE VIEW vw_recruiter_interview_pipeline AS
SELECT
    j.recruiter_id,
    j.id                   AS job_id,
    j.title                AS job_title,
    j.slug,
    CASE a.status
        WHEN 'applied' THEN '1. Applications'
        WHEN 'shortlisted' THEN '2. Shortlisted'
        WHEN 'interview_scheduled' THEN '3. Interview Scheduled'
        WHEN 'interview_completed' THEN '4. Interview Completed'
        WHEN 'offer_made' THEN '5. Offer Made'
        WHEN 'hired' THEN '6. Hired'
        WHEN 'rejected' THEN 'Rejected'
        WHEN 'withdrawn' THEN 'Withdrawn'
    END AS pipeline_stage,
    COUNT(DISTINCT a.id)   AS candidate_count,
    ROUND(AVG(EXTRACT(DAY FROM NOW() - a.applied_at)), 1) AS avg_days_in_stage,
    ROUND(CASE 
        WHEN LAG(COUNT(*)) OVER (PARTITION BY j.id ORDER BY CASE WHEN a.status = 'applied' THEN 1 WHEN a.status = 'shortlisted' THEN 2 WHEN a.status = 'interview_scheduled' THEN 3 WHEN a.status = 'interview_completed' THEN 4 WHEN a.status = 'offer_made' THEN 5 WHEN a.status = 'hired' THEN 6 ELSE 0 END) > 0 
        THEN (COUNT(*) / LAG(COUNT(*)) OVER (PARTITION BY j.id ORDER BY CASE WHEN a.status = 'applied' THEN 1 WHEN a.status = 'shortlisted' THEN 2 WHEN a.status = 'interview_scheduled' THEN 3 WHEN a.status = 'interview_completed' THEN 4 WHEN a.status = 'offer_made' THEN 5 WHEN a.status = 'hired' THEN 6 ELSE 0 END)) * 100
        ELSE 0 
    END, 2) AS conversion_rate_pct
FROM applications a
JOIN jobs j ON a.job_id = j.id
GROUP BY j.recruiter_id, j.id, j.title, j.slug, a.status
ORDER BY j.recruiter_id, j.id, CASE a.status
    WHEN 'applied' THEN 1
    WHEN 'shortlisted' THEN 2
    WHEN 'interview_scheduled' THEN 3
    WHEN 'interview_completed' THEN 4
    WHEN 'offer_made' THEN 5
    WHEN 'hired' THEN 6
    WHEN 'rejected' THEN 7
    WHEN 'withdrawn' THEN 8
    ELSE 0
END;
```

---

## Analytics & Admin Views

### View 9: User Growth and Registration Trends

**View Name:** `vw_user_growth_analytics`

**Description:**  
Tracks user registration trends by role, verification status, and activity. Useful for monitoring platform health and user acquisition.

**Tables Involved:**  
`users`

**Key Columns:**  
registration_date, total_users, jobseeker_count, recruiter_count, verified_users, active_users, signup_momentum

```sql
CREATE VIEW vw_user_growth_analytics AS
SELECT
    DATE(u.created_at)     AS registration_date,
    COUNT(*)               AS new_users_today,
    SUM(CASE WHEN u.role = 'jobseeker' THEN 1 ELSE 0 END) AS new_jobseekers,
    SUM(CASE WHEN u.role = 'recruiter' THEN 1 ELSE 0 END) AS new_recruiters,
    SUM(CASE WHEN u.is_email_verified = TRUE THEN 1 ELSE 0 END) AS email_verified_today,
    SUM(CASE WHEN u.status = 'active' THEN 1 ELSE 0 END) AS active_today,
    SUM(COUNT(*)) OVER (ORDER BY DATE(u.created_at)) AS cumulative_users,
    ROUND(AVG(CASE WHEN u.is_email_verified = TRUE THEN 1 ELSE 0 END)::NUMERIC * 100, 2) AS verification_rate_pct
FROM users u
GROUP BY DATE(u.created_at)
ORDER BY registration_date DESC;
```

---

### View 10: Marketplace Health Dashboard

**View Name:** `vw_marketplace_health_metrics`

**Description:**  
High-level KPIs showing job market activity, application rates, hiring pipeline, and platform engagement.

**Tables Involved:**  
`jobs`, `applications`, `users`, `companies`

**Key Columns:**  
metric_name, metric_value, change_from_last_month, status_indicator

```sql
CREATE VIEW vw_marketplace_health_metrics AS
SELECT
    'Total Active Jobs' AS metric_name,
    COUNT(DISTINCT CASE WHEN j.status = 'active' AND j.expires_at > NOW() THEN j.id END)::TEXT AS metric_value,
    NULL AS previous_value,
    'Real-time' AS last_updated
FROM jobs j

UNION ALL

SELECT
    'Total Applications (Last 7 Days)' AS metric_name,
    COUNT(*)::TEXT,
    NULL,
    'Real-time'
FROM applications
WHERE applied_at >= NOW() - INTERVAL '7 days'

UNION ALL

SELECT
    'Active Job Seekers' AS metric_name,
    COUNT(DISTINCT u.id)::TEXT,
    NULL,
    'Real-time'
FROM users u
LEFT JOIN jobseeker_profiles jp ON u.id = jp.user_id
WHERE u.role = 'jobseeker'
  AND u.status = 'active'
  AND jp.is_actively_looking = TRUE

UNION ALL

SELECT
    'Registered Companies' AS metric_name,
    COUNT(DISTINCT c.id)::TEXT,
    NULL,
    'Real-time'
FROM companies c

UNION ALL

SELECT
    'Recruiter Accounts' AS metric_name,
    COUNT(DISTINCT u.id)::TEXT,
    NULL,
    'Real-time'
FROM users u
WHERE u.role = 'recruiter'
  AND u.status = 'active'

UNION ALL

SELECT
    'Avg Applications per Job' AS metric_name,
    ROUND(AVG(app_count.cnt)::NUMERIC, 2)::TEXT,
    NULL,
    'Real-time'
FROM (SELECT job_id, COUNT(*) AS cnt FROM applications GROUP BY job_id) app_count;
```

---

### View 11: Credit System Analytics

**View Name:** `vw_credit_system_analytics`

**Description:**  
Comprehensive view of credit usage, spending patterns, and revenue insights. Tracks AI feature adoption and credit consumption per user.

**Tables Involved:**  
`credit_wallets`, `credit_transactions`, `ai_feature_pricing`, `payment_orders`

**Key Columns:**  
user_id, total_balance, lifetime_earned, lifetime_spent, credit_burnrate, last_purchase, preferred_features, transaction_count

```sql
CREATE VIEW vw_credit_system_analytics AS
SELECT
    u.id                    AS user_id,
    u.full_name,
    u.role,
    cw.balance              AS current_balance,
    cw.lifetime_earned,
    cw.lifetime_spent,
    ROUND((cw.lifetime_spent::NUMERIC / NULLIF(cw.lifetime_earned, 0)) * 100, 2) AS spend_rate_pct,
    ROUND(cw.lifetime_spent::NUMERIC / NULLIF(EXTRACT(DAY FROM NOW() - u.created_at), 0), 2) AS daily_credit_burn,
    COUNT(DISTINCT ct.id)   AS total_transactions,
    COUNT(DISTINCT CASE WHEN ct.type LIKE 'ai_%' THEN ct.id END) AS ai_feature_uses,
    STRING_AGG(DISTINCT ct.type, ', ') AS transaction_types,
    MAX(ct.created_at)      AS last_transaction_date,
    MAX(CASE WHEN ct.type IN ('purchase', 'admin_grant') THEN ct.created_at END) AS last_credit_purchase,
    COALESCE(po.total_purchases, 0) AS times_purchased_credits,
    COALESCE(po.total_spent, 0) AS total_money_spent
FROM users u
LEFT JOIN credit_wallets cw ON u.id = cw.user_id
LEFT JOIN credit_transactions ct ON cw.id = ct.wallet_id
LEFT JOIN (
    SELECT user_id, COUNT(*) AS total_purchases, SUM(amount) AS total_spent
    FROM payment_orders
    WHERE status = 'completed'
    GROUP BY user_id
) po ON u.id = po.user_id
WHERE u.role IN ('jobseeker', 'recruiter')
GROUP BY u.id, u.full_name, u.role, cw.balance, cw.lifetime_earned, cw.lifetime_spent, 
         po.total_purchases, po.total_spent, u.created_at;
```

---

### View 12: AI Feature Usage Analytics

**View Name:** `vw_ai_feature_usage_analytics`

**Description:**  
Detailed breakdown of AI feature adoption, credit costs, user engagement, and feature performance metrics.

**Tables Involved:**  
`ai_usage_logs`, `ai_feature_pricing`, `users`

**Key Columns:**  
feature_key, display_name, total_uses, unique_users, total_credits_used, avg_cost_per_use, avg_latency_ms, success_rate, errors_count, users_per_feature

```sql
CREATE VIEW vw_ai_feature_usage_analytics AS
SELECT
    afp.feature_key,
    afp.display_name,
    afp.credits_cost           AS cost_per_use,
    COUNT(DISTINCT aul.id)     AS total_uses,
    COUNT(DISTINCT aul.user_id) AS unique_users,
    SUM(aul.credits_used)      AS total_credits_used,
    ROUND(AVG(aul.credits_used)::NUMERIC, 2) AS avg_credits_per_use,
    ROUND(AVG(aul.latency_ms)::NUMERIC, 2) AS avg_latency_ms,
    ROUND((COUNT(*) - COUNT(CASE WHEN aul.error IS NOT NULL THEN 1 END))::NUMERIC / COUNT(*) * 100, 2) AS success_rate_pct,
    COUNT(CASE WHEN aul.error IS NOT NULL THEN 1 END) AS error_count,
    SUM(aul.tokens_in)         AS total_tokens_in,
    SUM(aul.tokens_out)        AS total_tokens_out,
    DATE_TRUNC('day', AVG(aul.created_at)) AS last_used_date
FROM ai_feature_pricing afp
LEFT JOIN ai_usage_logs aul ON afp.feature_key = aul.feature_key
WHERE afp.is_active = TRUE
GROUP BY afp.feature_key, afp.display_name, afp.credits_cost
ORDER BY total_uses DESC;
```

---

### View 13: Payment and Revenue Metrics

**View Name:** `vw_payment_revenue_metrics`

**Description:**  
Revenue insights including payment volumes, conversion rates, refunds, and transaction patterns. Used for financial reporting.

**Tables Involved:**  
`payment_orders`, `credit_packs`, `users`, `subscription_plans`

**Key Columns:**  
payment_date, total_revenue, successful_payments, failed_payments, refund_amount, avg_transaction_value, top_pack_bought, payment_status_breakdown

```sql
CREATE VIEW vw_payment_revenue_metrics AS
SELECT
    DATE(po.created_at)    AS payment_date,
    COUNT(*)               AS total_transactions,
    COUNT(CASE WHEN po.status = 'completed' THEN 1 END) AS completed_payments,
    COUNT(CASE WHEN po.status = 'failed' THEN 1 END) AS failed_payments,
    COUNT(CASE WHEN po.status = 'refunded' THEN 1 END) AS refunded_count,
    SUM(CASE WHEN po.status = 'completed' THEN po.amount ELSE 0 END) AS gross_revenue,
    COALESCE(SUM(po.refund_amount), 0) AS total_refunds,
    SUM(CASE WHEN po.status = 'completed' THEN po.amount ELSE 0 END) - COALESCE(SUM(po.refund_amount), 0) AS net_revenue,
    ROUND(AVG(CASE WHEN po.status = 'completed' THEN po.amount ELSE 0 END)::NUMERIC, 2) AS avg_transaction_value,
    STRING_AGG(DISTINCT po.gateway, ', ') AS payment_gateways_used,
    ROUND(COUNT(CASE WHEN po.status = 'completed' THEN 1 END)::NUMERIC / COUNT(*) * 100, 2) AS success_rate_pct,
    COUNT(DISTINCT po.user_id) AS unique_buyers
FROM payment_orders po
WHERE po.created_at >= NOW() - INTERVAL '90 days'
GROUP BY DATE(po.created_at)
ORDER BY payment_date DESC;
```

---

## Reporting Views

### View 14: Top Skills by Role and Experience Level

**View Name:** `vw_top_skills_by_role_experience`

**Description:**  
Identifies the most demanded skills stratified by job experience level. Used for career guidance and skill-gap analysis.

**Tables Involved:**  
`jobs`, `skills`, `jobseeker_skills`

**Key Columns:**  
experience_level, skill_name, demand_count, avg_salary, job_count, is_trending, skill_category

```sql
CREATE VIEW vw_top_skills_by_role_experience AS
SELECT
    j.experience_level,
    s.name                 AS skill_name,
    s.category             AS skill_category,
    COUNT(DISTINCT j.id)   AS jobs_requiring_skill,
    COUNT(DISTINCT CASE WHEN j.status = 'active' THEN j.id END) AS active_jobs,
    ROUND(AVG((j.salary_min + j.salary_max) / 2 FILTER (WHERE j.salary_max IS NOT NULL))::NUMERIC, 0) AS avg_salary_with_skill,
    s.is_trending,
    ROW_NUMBER() OVER (PARTITION BY j.experience_level ORDER BY COUNT(DISTINCT j.id) DESC) AS skill_rank_in_level
FROM (
    SELECT id, experience_level, salary_min, salary_max, status, skills_required
    FROM jobs
    UNION ALL
    SELECT id, experience_level, salary_min, salary_max, status, skills_preferred
    FROM jobs
) j
LEFT JOIN LATERAL UNNEST(COALESCE(j.skills_required, j.skills_preferred, ARRAY[]::TEXT[])) WITH ORDINALITY x(skill, ord) ON TRUE
LEFT JOIN skills s ON LOWER(s.name) = LOWER(x.skill)
WHERE s.id IS NOT NULL
GROUP BY j.experience_level, s.name, s.category, s.is_trending
HAVING COUNT(DISTINCT j.id) > 2
ORDER BY j.experience_level, jobs_requiring_skill DESC;
```

---

### View 15: Salary Trends by Location and Role

**View Name:** `vw_salary_trends_analysis`

**Description:**  
Aggregated salary data analyzing compensation trends by city, job type, experience level, and industry. Useful for compensation benchmarking.

**Tables Involved:**  
`jobs`, `companies`

**Key Columns:**  
city, state, country, job_type, experience_level, industry, avg_salary, salary_min_range, salary_max_range, median_salary, salary_currency, sample_size

```sql
CREATE VIEW vw_salary_trends_analysis AS
SELECT
    j.city,
    j.state,
    j.country,
    j.job_type,
    j.experience_level,
    COALESCE(c.industry, 'Not Specified') AS industry,
    j.salary_currency,
    COUNT(*)               AS job_postings,
    ROUND(AVG((j.salary_min + j.salary_max) / 2)::NUMERIC, 2) AS avg_salary,
    ROUND(PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY (j.salary_min + j.salary_max) / 2)::NUMERIC, 2) AS salary_25th_percentile,
    ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY (j.salary_min + j.salary_max) / 2)::NUMERIC, 2) AS salary_median,
    ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY (j.salary_min + j.salary_max) / 2)::NUMERIC, 2) AS salary_75th_percentile,
    MIN(j.salary_min)      AS min_salary_offered,
    MAX(j.salary_max)      AS max_salary_offered,
    STRING_AGG(DISTINCT j.skills_required[1], ', ') AS top_required_skills
FROM jobs j
LEFT JOIN companies c ON j.company_id = c.id
WHERE j.salary_min IS NOT NULL
  AND j.salary_max IS NOT NULL
  AND j.status = 'active'
GROUP BY j.city, j.state, j.country, j.job_type, j.experience_level, c.industry, j.salary_currency
HAVING COUNT(*) >= 3
ORDER BY j.country, j.city, j.experience_level, avg_salary DESC;
```

---

### View 16: Company Hiring Activity

**View Name:** `vw_company_hiring_activity`

**Description:**  
Shows hiring activity per company including number of open positions, time to hire, and hiring velocity.

**Tables Involved:**  
`companies`, `jobs`, `applications`

**Key Columns:**  
company_name, total_open_jobs, active_postings, total_applications, avg_time_to_hire, hiring_velocity, top_roles_hiring

```sql
CREATE VIEW vw_company_hiring_activity AS
SELECT
    c.id                   AS company_id,
    c.name                 AS company_name,
    c.slug,
    c.industry,
    c.size_range,
    c.website,
    COUNT(DISTINCT j.id)   AS total_job_postings,
    COUNT(DISTINCT CASE WHEN j.status = 'active' THEN j.id END) AS active_job_openings,
    SUM(j.openings)        AS total_openings,
    COALESCE(COUNT(DISTINCT a.id), 0) AS total_applications_received,
    ROUND(AVG(EXTRACT(DAY FROM a.applied_at - j.posted_at)) FILTER (WHERE a.status = 'hired')::NUMERIC, 1) AS avg_days_to_hire,
    COUNT(DISTINCT CASE WHEN a.status = 'hired' THEN a.id END) AS successful_hires,
    ROUND(COUNT(CASE WHEN a.status = 'hired' THEN 1 END)::NUMERIC / NULLIF(COUNT(DISTINCT a.id), 0) * 100, 2) AS conversion_rate_pct,
    STRING_AGG(DISTINCT j.title, ', ' ORDER BY j.title) AS roles_currently_hiring,
    MAX(j.posted_at)       AS most_recent_job_posted
FROM companies c
LEFT JOIN jobs j ON c.id = j.company_id
LEFT JOIN applications a ON j.id = a.job_id
GROUP BY c.id, c.name, c.slug, c.industry, c.size_range, c.website
ORDER BY active_job_openings DESC, total_applications_received DESC;
```

---

### View 17: Resume Quality Metrics (For Jobseekers)

**View Name:** `vw_resume_quality_and_impact`

**Description:**  
Analyzes resume effectiveness based on application success rates and job match performance. Helps identify which skills/sections drive engagement.

**Tables Involved:**  
`resumes`, `applications`, `ai_job_matches`, `jobseeker_skills`

**Key Columns:**  
resume_id, user_id, resume_name, total_applications, application_success_rate, avg_match_score, view_count, last_used_date, quality_score

```sql
CREATE VIEW vw_resume_quality_and_impact AS
SELECT
    r.id                   AS resume_id,
    r.user_id,
    r.file_name            AS resume_name,
    COUNT(DISTINCT a.id)   AS times_used_in_applications,
    COUNT(DISTINCT CASE WHEN a.status IN ('shortlisted', 'interview_scheduled', 'hired') THEN a.id END) AS successful_applications,
    ROUND(COUNT(CASE WHEN a.status IN ('shortlisted', 'interview_scheduled', 'hired') THEN 1 END)::NUMERIC / NULLIF(COUNT(DISTINCT a.id), 0) * 100, 2) AS success_rate_pct,
    ROUND(AVG(ajm.match_score)::NUMERIC, 2) AS avg_ai_match_score,
    COUNT(DISTINCT ajm.id) AS ai_matches_count,
    MAX(r.updated_at)      AS last_updated,
    MAX(a.applied_at)      AS last_used_date,
    ROUND(AVG(CASE 
        WHEN a.status IN ('shortlisted', 'interview_scheduled', 'hired') THEN 1
        ELSE 0
    END)::NUMERIC * 100, 2) AS estimated_quality_score
FROM resumes r
LEFT JOIN applications a ON r.id = a.resume_id
LEFT JOIN ai_job_matches ajm ON a.applicant_id = ajm.user_id
GROUP BY r.id, r.user_id, r.file_name
ORDER BY success_rate_pct DESC NULLS LAST;
```

---

## Implementation Guide

### Step 1: Prerequisites

Ensure the following PostgreSQL dependencies are installed:
- `pgvector` (for AI embeddings)
- `pg_trgm` (trigram search)

```bash
# Connect to your PostgreSQL database and enable extensions
psql -U postgres -d trotixai -c "\dx"

# If pgvector is not installed:
# Follow: https://github.com/pgvector/pgvector
```

### Step 2: Create All Views

Run the following script to create all views:

```sql
-- Copy each view creation statement from sections above and execute in order
-- Views are listed from least to most dependent on other views

-- You can batch execute all views at once since they only read from base tables
psql -U postgres -d trotixai -f create_all_views.sql
```

### Step 3: Set Up Performance Indexes

Create indexes on frequently queried view columns:

```sql
-- On jobseeker_profiles (for View 3, 4, 5 performance)
CREATE INDEX idx_js_profile_completion ON jobseeker_profiles (profile_completion);
CREATE INDEX idx_js_looking_updated ON jobseeker_profiles (is_actively_looking, updated_at DESC);

-- On applications (for View 6, 8 performance)
CREATE INDEX idx_app_status_date ON applications (status, applied_at DESC);
CREATE INDEX idx_app_recruiter_date ON applications (job_id, applied_at DESC);

-- On credit_transactions (for View 11, 12 performance)
CREATE INDEX idx_ctx_type_created ON credit_transactions (type, created_at DESC);

-- On jobs (for View 9, 14, 15, 16 performance)
CREATE INDEX idx_jobs_expires_status ON jobs (expires_at DESC, status);
CREATE INDEX idx_jobs_city_salary ON jobs (city, salary_min, salary_max);
```

### Step 4: Materialized Views for Heavy Analytics Queries

For frequently accessed but computationally expensive views (9, 11, 12, 13), consider materializing them:

```sql
-- Create materialized view (computed once, refreshed periodically)
CREATE MATERIALIZED VIEW mv_user_growth_analytics AS
SELECT * FROM vw_user_growth_analytics;

CREATE INDEX idx_mv_user_growth_date ON mv_user_growth_analytics (registration_date);

-- Refresh schedule (e.g., daily at 2 AM)
-- Can be automated with pg_cron:
-- SELECT cron.schedule('refresh_user_growth', '0 2 * * *', 'REFRESH MATERIALIZED VIEW mv_user_growth_analytics');

-- Manual refresh:
REFRESH MATERIALIZED VIEW mv_user_growth_analytics;
```

### Step 5: Grant Permissions

Configure view access by role:

```sql
-- Read-only access for external dashboards/reporting tools
CREATE ROLE dashboard_user WITH LOGIN PASSWORD 'secure_password';

-- Grant SELECT on all views
GRANT SELECT ON vw_active_jobs_with_context TO dashboard_user;
GRANT SELECT ON vw_jobseeker_applications_summary TO dashboard_user;
GRANT SELECT ON vw_recruiter_job_performance TO dashboard_user;
-- ... (repeat for all views)

-- Or grant blanket access:
GRANT USAGE ON SCHEMA public TO dashboard_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO dashboard_user;
```

### Step 6: Query Examples

#### Example 1: Find Top 10 Active Jobs for Frontend Developers

```sql
SELECT 
    job_id, job_title, company_name, salary_range, work_mode, city,
    view_count, application_count
FROM vw_active_jobs_with_context
WHERE 'frontend' = ANY(skills_required)
  AND experience_level IN ('junior', 'mid')
ORDER BY view_count DESC, posted_at DESC
LIMIT 10;
```

#### Example 2: Get Jobseeker Application Dashboard

```sql
SELECT 
    job_title, company_name, application_status, salary_range, 
    days_since_applied, interview_scheduled_at, ai_match_score
FROM vw_jobseeker_applications_summary
WHERE jobseeker_id = '${USER_ID}'
ORDER BY days_since_applied ASC;
```

#### Example 3: Analyze Company Hiring Trends

```sql
SELECT 
    company_name, active_job_openings, total_applications_received, 
    conversion_rate_pct, avg_days_to_hire
FROM vw_company_hiring_activity
WHERE industry = 'Technology'
  AND active_job_openings > 0
ORDER BY total_applications_received DESC;
```

#### Example 4: AI Feature Usage Report

```sql
SELECT 
    display_name, total_uses, unique_users, total_credits_used, 
    success_rate_pct, avg_latency_ms
FROM vw_ai_feature_usage_analytics
ORDER BY total_uses DESC;
```

---

## Performance Considerations

### Optimization Tips

1. **Use Materialized Views for Reports**: Views like `vw_user_growth_analytics` and `vw_marketplace_health_metrics` should be refreshed nightly rather than computed on-demand.

2. **Add Result Caching**: Cache expensive queries (salary trends, skill demand) for 1-7 days depending on freshness requirements.

3. **Partition Large Tables**: Consider partitioning:
   - `applications` by job_id or date
   - `credit_transactions` by created_at
   - `ai_usage_logs` by created_at

4. **Denormalization Strategy**: For high-traffic views like `vw_active_jobs_with_context`, consider maintaining a denormalized table updated via triggers.

5. **Vector Index Tuning**: If using pgvector for semantic search, tune HNSW parameters:
   ```sql
   CREATE INDEX idx_jobs_embedding ON jobs
   USING hnsw (job_embedding vector_cosine_ops)
   WITH (m=16, ef_construction=64);
   ```

### Query Monitoring

```sql
-- Find slow-running views
SELECT 
    query, calls, mean_exec_time, max_exec_time
FROM pg_stat_statements
WHERE query ILIKE '%vw_%'
ORDER BY mean_exec_time DESC;

-- Enable query logging for analysis
ALTER SYSTEM SET log_min_duration_statement = 5000; -- 5 seconds
SELECT pg_reload_conf();
```

---

## Maintenance Schedule

| Task | Frequency | Purpose |
|------|-----------|---------|
| Refresh `mv_user_growth_analytics` | Daily (2 AM) | User dashboards |
| Refresh `mv_marketplace_health_metrics` | 6 hours | Admin dashboard |
| Update View statistics | Weekly | Query optimizer accuracy |
| Review slow queries | Weekly | Performance tuning |
| Archive old transactions | Monthly | Storage optimization |
| Reindex vector indexes | Quarterly | Semantic search performance |

---

## Next Steps

1. **Deploy Views**: Execute all view creation statements in order
2. **Configure Indexes**: Run performance optimization indexes
3. **Set Up Materialization**: Schedule refresh jobs for heavy views
4. **Grant Permissions**: Configure role-based access control
5. **Build Dashboards**: Use these views in your BI tools (Metabase, Superset, Tableau, etc.)
6. **Monitor Performance**: Set up query monitoring and alerts
7. **Document Changes**: Maintain a changelog of view modifications

---

## View Dependency Map

```
Base Tables
├── users ────┬──→ vw_user_growth_analytics
│            ├──→ vw_profile_completeness
│            └──→ vw_active_candidates_for_recruiter
├── jobs ─────┬──→ vw_active_jobs_with_context
│            ├──→ vw_recruiter_job_performance
│            ├──→ vw_skills_market_demand
│            ├──→ vw_salary_trends_analysis
│            └──→ vw_company_hiring_activity
├── applications ──→ vw_recruiter_interview_pipeline
├── credit_* ──────→ vw_credit_system_analytics
└── ai_* ──────────→ vw_ai_feature_usage_analytics
```

---

## Appendix: View Metadata

```sql
-- Query to list all created views with row counts (if materialized)
SELECT 
    table_name, 
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename LIKE 'vw_%' OR tablename LIKE 'mv_%'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

**Document Version:** 1.0  
**Last Updated:** April 10, 2026  
**Maintainer:** Database Team  
**Status:** Ready for Implementation ✅
