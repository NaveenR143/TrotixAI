import React from "react";
import "./template8.css";

export default function Template8({ data }) {
    if (!data) return null;

    // Mapping from Redux state structure
    const { personalDetails, education, experience, skills, languages, projects } = data;
    const user = personalDetails || {};

    return (
        <div className="t8-resume-container">
            <div className="t8-resume">
                {/* GRADIENT HEADER */}
                <header className="t8-header">
                    <div className="t8-header-left">
                        <h1>{user.fullName || "Your Name"}</h1>
                        <div className="t8-job-title">{user.headline || "Professional Title"}</div>
                    </div>
                    <div className="t8-header-right">
                        {user.phone && <div>{user.phone}</div>}
                        {user.email && <div>{user.email}</div>}
                        {user.website && <div>{user.website}</div>}
                        {user.location && <div>{user.location}</div>}
                    </div>
                </header>

                <div className="t8-content">
                    {/* PROFESSIONAL SUMMARY */}
                    {user.summary && (
                        <div className="t8-section">
                            <div className="t8-section-title">Professional Summary</div>
                            <p className="t8-summary-text">{user.summary}</p>
                        </div>
                    )}

                    {/* CORE COMPETENCIES (SKILLS) */}
                    {skills && skills.length > 0 && (
                        <div className="t8-section">
                            <div className="t8-section-title">Core Competencies</div>
                            <div className="t8-skills-grid">
                                {skills.map((skill, i) => (
                                    <div key={i} className="t8-skill-item">
                                        {skill}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* PROFESSIONAL EXPERIENCE */}
                    {experience && experience.length > 0 && (
                        <div className="t8-section">
                            <div className="t8-section-title">Professional Experience</div>
                            {experience.map((exp, i) => (
                                <div key={i} className="t8-exp-item">
                                    <div className="t8-exp-header">
                                        <div className="t8-exp-role">{exp.role}</div>
                                        <div className="t8-exp-date">
                                            {exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}
                                        </div>
                                    </div>
                                    <div className="t8-exp-company">{exp.company}</div>
                                    {exp.description && (
                                        <ul className="t8-exp-details">
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
                        <div className="t8-section">
                            <div className="t8-section-title">Key Projects</div>
                            {projects.map((proj, i) => (
                                <div key={i} className="t8-proj-item">
                                    <div className="t8-proj-header">
                                        <div className="t8-proj-name">{proj.name}</div>
                                        {proj.year && <div className="t8-proj-year">{proj.year}</div>}
                                    </div>
                                    {proj.link && (
                                        <a href={proj.link} target="_blank" rel="noopener noreferrer" className="t8-proj-link">
                                            {proj.link}
                                        </a>
                                    )}
                                    {proj.description && (
                                        <ul className="t8-proj-details">
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
                        <div className="t8-section">
                            <div className="t8-section-title">Education</div>
                            {education.map((edu, i) => (
                                <div key={i} className="t8-edu-item">
                                    <div className="t8-edu-left">
                                        <div className="t8-edu-school">{edu.school || edu.institution}</div>
                                        <div className="t8-edu-degree">{edu.degree}</div>
                                    </div>
                                    <div className="t8-edu-date">{edu.year}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* LANGUAGES */}
                    {languages && languages.length > 0 && (
                        <div className="t8-section" style={{ marginBottom: 0 }}>
                            <div className="t8-section-title">Languages</div>
                            <div className="t8-languages">
                                {languages.map((lang, i) => (
                                    <div key={i} className="t8-lang-item">
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
