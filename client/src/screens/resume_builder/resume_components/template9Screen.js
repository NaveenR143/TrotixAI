import React from "react";
import "./template9.css";

export default function Template9({ data }) {
    if (!data) return null;

    // Mapping from Redux state structure
    const { personalDetails, education, experience, skills, languages, projects } = data;
    const user = personalDetails || {};

    return (
        <div className="t9-resume-container">
            <div className="t9-resume">
                {/* TOP GREEN BAR */}
                <div className="t9-top-accent"></div>

                {/* HEADER */}
                <header className="t9-header">
                    <h1>{user.fullName || "Your Name"}</h1>
                    <div className="t9-job-title">{user.headline || "Professional Title"}</div>
                    
                    <div className="t9-contact-info">
                        {user.phone && (
                            <div className="t9-contact-item">
                                <span className="t9-contact-label">Phone:</span> {user.phone}
                            </div>
                        )}
                        {user.email && (
                            <div className="t9-contact-item">
                                <span className="t9-contact-label">Email:</span> {user.email}
                            </div>
                        )}
                        {user.website && (
                            <div className="t9-contact-item">
                                <span className="t9-contact-label">Web:</span> {user.website}
                            </div>
                        )}
                        {user.location && (
                            <div className="t9-contact-item">
                                <span className="t9-contact-label">Location:</span> {user.location}
                            </div>
                        )}
                    </div>
                </header>

                <div className="t9-content">
                    {/* PROFESSIONAL SUMMARY */}
                    {user.summary && (
                        <div className="t9-section">
                            <div className="t9-section-title">Professional Summary</div>
                            <p className="t9-summary-text">{user.summary}</p>
                        </div>
                    )}

                    {/* CORE COMPETENCIES (SKILLS) */}
                    {skills && skills.length > 0 && (
                        <div className="t9-section">
                            <div className="t9-section-title">Core Competencies</div>
                            <div className="t9-skills-grid">
                                {skills.map((skill, i) => (
                                    <div key={i} className="t9-skill-item">
                                        {skill}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* PROFESSIONAL EXPERIENCE */}
                    {experience && experience.length > 0 && (
                        <div className="t9-section">
                            <div className="t9-section-title">Professional Experience</div>
                            {experience.map((exp, i) => (
                                <div key={i} className="t9-exp-item">
                                    <div className="t9-exp-header">
                                        <div className="t9-exp-role">{exp.role}</div>
                                        <div className="t9-exp-date">
                                            {exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}
                                        </div>
                                    </div>
                                    <div className="t9-exp-company">{exp.company}</div>
                                    {exp.description && (
                                        <ul className="t9-exp-details">
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
                        <div className="t9-section">
                            <div className="t9-section-title">Key Projects</div>
                            {projects.map((proj, i) => (
                                <div key={i} className="t9-proj-item">
                                    <div className="t9-proj-header">
                                        <div className="t9-proj-name">{proj.name}</div>
                                        {proj.year && <div className="t9-proj-year">{proj.year}</div>}
                                    </div>
                                    {proj.link && (
                                        <a href={proj.link} target="_blank" rel="noopener noreferrer" className="t9-proj-link">
                                            {proj.link}
                                        </a>
                                    )}
                                    {proj.description && (
                                        <ul className="t9-proj-details">
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
                        <div className="t9-section">
                            <div className="t9-section-title">Education</div>
                            {education.map((edu, i) => (
                                <div key={i} className="t9-edu-item">
                                    <div className="t9-edu-left">
                                        <div className="t9-edu-school">{edu.school || edu.institution}</div>
                                        <div className="t9-edu-degree">{edu.degree}</div>
                                    </div>
                                    <div className="t9-edu-date">{edu.year}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* LANGUAGES */}
                    {languages && languages.length > 0 && (
                        <div className="t9-section" style={{ marginBottom: 0 }}>
                            <div className="t9-section-title">Languages</div>
                            <div className="t9-languages">
                                {languages.map((lang, i) => (
                                    <div key={i} className="t9-lang-item">
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
