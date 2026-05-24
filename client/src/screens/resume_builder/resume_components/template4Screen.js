import React from "react";
import "./template4.css";

export default function Template4({ data }) {
    if (!data) return null;

    // Mapping from Redux state structure
    const { personalDetails, education, experience, skills, languages, projects } = data;
    const user = personalDetails || {};

    return (
        <div className="t4-resume-container">
            <div className="t4-resume">
                {/* TOP ACCENT BAR */}
                <div className="t4-top-bar"></div>

                {/* HEADER */}
                <header className="t4-header">
                    <div className="t4-header-content">
                        <div className="t4-header-left">
                            <h1>{user.fullName || "Your Name"}</h1>
                            <div className="t4-job-title">{user.headline || "Professional Title"}</div>
                        </div>
                        <div className="t4-header-right">
                            {user.phone && <div>{user.phone}</div>}
                            {user.email && <div>{user.email}</div>}
                            {user.website && <div>{user.website}</div>}
                            {user.location && <div>{user.location}</div>}
                        </div>
                    </div>
                </header>

                <div className="t4-content">
                    {/* PROFESSIONAL SUMMARY */}
                    {user.summary && (
                        <div className="t4-section">
                            <div className="t4-section-title">Professional Summary</div>
                            <p className="t4-summary-text">{user.summary}</p>
                        </div>
                    )}

                    {/* CORE COMPETENCIES (SKILLS) */}
                    {skills && skills.length > 0 && (
                        <div className="t4-section">
                            <div className="t4-section-title">Core Competencies</div>
                            <div className="t4-skills-grid">
                                {skills.map((skill, i) => (
                                    <div key={i} className="t4-skill-category">
                                        • {skill}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* PROFESSIONAL EXPERIENCE */}
                    {experience && experience.length > 0 && (
                        <div className="t4-section">
                            <div className="t4-section-title">Professional Experience</div>
                            {experience.map((exp, i) => (
                                <div key={i} className="t4-exp-item">
                                    <div className="t4-exp-header">
                                        <div className="t4-exp-role">{exp.role}</div>
                                        <div className="t4-exp-date">
                                            {exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}
                                        </div>
                                    </div>
                                    <div className="t4-exp-company">{exp.company}</div>
                                    {exp.description && (
                                        <ul className="t4-exp-details">
                                            {exp.description.split('\n').map((point, idx) => (
                                                point.trim() && <li key={idx}>{point.replace(/^[•\-\*]\s?/, '')}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* KEY PROJECTS */}
                    {projects && projects.length > 0 && (
                        <div className="t4-section">
                            <div className="t4-section-title">Key Projects</div>
                            {projects.map((proj, i) => (
                                <div key={i} className="t4-proj-item">
                                    <div className="t4-proj-header">
                                        <div className="t4-proj-name">{proj.name}</div>
                                        {proj.year && <div className="t4-proj-year">{proj.year}</div>}
                                    </div>
                                    {proj.link && (
                                        <a href={proj.link} target="_blank" rel="noopener noreferrer" className="t4-proj-link">
                                            {proj.link}
                                        </a>
                                    )}
                                    {proj.description && (
                                        <ul className="t4-proj-details">
                                            {proj.description.split('\n').map((point, idx) => (
                                                point.trim() && <li key={idx}>{point.replace(/^[•\-\*]\s?/, '')}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* EDUCATION */}
                    {education && education.length > 0 && (
                        <div className="t4-section">
                            <div className="t4-section-title">Education</div>
                            {education.map((edu, i) => (
                                <div key={i} className="t4-edu-item">
                                    <div className="t4-edu-left">
                                        <div className="t4-edu-school">{edu.school || edu.institution}</div>
                                        <div className="t4-edu-degree">{edu.degree}</div>
                                    </div>
                                    <div className="t4-edu-date">{edu.year}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* LANGUAGES */}
                    {languages && languages.length > 0 && (
                        <div className="t4-section" style={{ marginBottom: 0 }}>
                            <div className="t4-section-title">Languages</div>
                            <div className="t4-languages">
                                {languages.map((lang, i) => (
                                    <div key={i} className="t4-lang-item">
                                        • {lang}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
