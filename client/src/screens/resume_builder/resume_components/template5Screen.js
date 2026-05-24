import React from "react";
import "./template5.css";

export default function Template5({ data }) {
    if (!data) return null;

    // Mapping from Redux state structure
    const { personalDetails, education, experience, skills, languages, projects } = data;
    const user = personalDetails || {};

    return (
        <div className="t5-resume-container">
            <div className="t5-resume">
                {/* DARK CORPORATE HEADER */}
                <header className="t5-header">
                    <div className="t5-header-left">
                        <h1>{user.fullName || "Your Name"}</h1>
                        <div className="t5-job-title">{user.headline || "Professional Title"}</div>
                    </div>
                    <div className="t5-header-right">
                        {user.phone && <span>{user.phone}</span>}
                        {user.email && <span>{user.email}</span>}
                        {user.website && <span>{user.website}</span>}
                        {user.location && <span>{user.location}</span>}
                    </div>
                </header>

                <div className="t5-content">
                    {/* PROFESSIONAL SUMMARY */}
                    {user.summary && (
                        <div className="t5-section">
                            <div className="t5-section-title">Professional Summary</div>
                            <p className="t5-summary-text">{user.summary}</p>
                        </div>
                    )}

                    {/* CORE COMPETENCIES (SKILLS) */}
                    {skills && skills.length > 0 && (
                        <div className="t5-section">
                            <div className="t5-section-title">Core Competencies</div>
                            <div className="t5-skills-container">
                                {skills.map((skill, i) => (
                                    <div key={i} className="t5-skill-tag">
                                        {skill}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* PROFESSIONAL EXPERIENCE */}
                    {experience && experience.length > 0 && (
                        <div className="t5-section">
                            <div className="t5-section-title">Professional Experience</div>
                            {experience.map((exp, i) => (
                                <div key={i} className="t5-exp-item">
                                    <div className="t5-exp-header">
                                        <div className="t5-exp-role">{exp.role}</div>
                                        <div className="t5-exp-date">
                                            {exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}
                                        </div>
                                    </div>
                                    <div className="t5-exp-company">{exp.company}</div>
                                    {exp.description && (
                                        <ul className="t5-exp-details">
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
                        <div className="t5-section">
                            <div className="t5-section-title">Key Projects</div>
                            {projects.map((proj, i) => (
                                <div key={i} className="t5-proj-item">
                                    <div className="t5-proj-header">
                                        <div className="t5-proj-name">{proj.name}</div>
                                        {proj.year && <div className="t5-proj-year">{proj.year}</div>}
                                    </div>
                                    {proj.link && (
                                        <a href={proj.link} target="_blank" rel="noopener noreferrer" className="t5-proj-link">
                                            {proj.link}
                                        </a>
                                    )}
                                    {proj.description && (
                                        <ul className="t5-proj-details">
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
                        <div className="t5-section">
                            <div className="t5-section-title">Education</div>
                            {education.map((edu, i) => (
                                <div key={i} className="t5-edu-item">
                                    <div className="t5-edu-left">
                                        <div className="t5-edu-school">{edu.school || edu.institution}</div>
                                        <div className="t5-edu-degree">{edu.degree}</div>
                                    </div>
                                    <div className="t5-edu-date">{edu.year}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* LANGUAGES */}
                    {languages && languages.length > 0 && (
                        <div className="t5-section" style={{ marginBottom: 0 }}>
                            <div className="t5-section-title">Languages</div>
                            <div className="t5-languages">
                                {languages.map((lang, i) => (
                                    <div key={i} className="t5-lang-item">
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
