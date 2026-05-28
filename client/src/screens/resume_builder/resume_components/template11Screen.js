import React from "react";
import "./template11.css";
import DescriptionRenderer from "./descriptionRenderer";

export default function Template11({ data }) {
    if (!data) return null;

    // Mapping from Redux state structure
    const { personalDetails, education, experience, skills, languages, projects } = data;
    const user = personalDetails || {};

    return (
        <div className="t11-resume-container">
            <div className="t11-resume">
                {/* HEADER */}
                <header className="t11-header">
                    <h1>{user.fullName || "Your Name"}</h1>
                    <div className="t11-job-title">{user.headline || "Professional Title"}</div>
                    <div className="t11-contact-info">
                        {user.phone && <span>{user.phone}</span>}
                        {user.phone && user.email && <span>|</span>}
                        {user.email && <span>{user.email}</span>}
                        {(user.email || user.phone) && user.website && <span>|</span>}
                        {user.website && <span>{user.website}</span>}
                        {(user.website || user.email || user.phone) && user.location && <span>|</span>}
                        {user.location && <span>{user.location}</span>}
                    </div>
                </header>

                {/* SUMMARY */}
                {user.summary && (
                    <div className="t11-section">
                        <div className="t11-section-title">Professional Summary</div>
                        <p className="t11-summary-text">{user.summary}</p>
                    </div>
                )}

                {/* SKILLS */}
                {skills && skills.length > 0 && (
                    <div className="t11-section">
                        <div className="t11-section-title">Core Competencies</div>
                        <div className="t11-skills-list">
                            {skills.map((skill, i) => (
                                <div key={i} className="t11-skill-category">
                                    • {skill}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* EXPERIENCE */}
                {experience && experience.length > 0 && (
                    <div className="t11-section">
                        <div className="t11-section-title">Professional Experience</div>
                        {experience.map((exp, i) => (
                            <div key={i} className="t11-exp-item">
                                <div className="t11-exp-header">
                                    <div className="t11-exp-role">{exp.role}</div>
                                    <div className="t11-exp-date">
                                        {exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}
                                    </div>
                                </div>
                                <div className="t11-exp-company">{exp.company}</div>
                                <DescriptionRenderer description={exp.description} className="t11-exp-details" />
                            </div>
                        ))}
                    </div>
                )}

                {/* PROJECTS */}
                {projects && projects.length > 0 && (
                    <div className="t11-section">
                        <div className="t11-section-title">Key Projects</div>
                        {projects.map((proj, i) => (
                            <div key={i} className="t11-exp-item">
                                <div className="t11-exp-header">
                                    <div className="t11-exp-role">{proj.name}</div>
                                    {proj.year && <div className="t11-exp-date">{proj.year}</div>}
                                </div>
                                {proj.link && (
                                    <div style={{ fontSize: '11px', color: '#333', fontStyle: 'italic', marginBottom: '4px' }}>
                                        {proj.link}
                                    </div>
                                )}
                                <DescriptionRenderer description={proj.description} className="t11-exp-details" />
                            </div>
                        ))}
                    </div>
                )}

                {/* EDUCATION */}
                {education && education.length > 0 && (
                    <div className="t11-section">
                        <div className="t11-section-title">Education</div>
                        {education.map((edu, i) => (
                            <div key={i} className="t11-edu-item">
                                <div className="t11-edu-header">
                                    <div className="t11-edu-school">{edu.school || edu.institution}</div>
                                    <div className="t11-edu-date">{edu.year}</div>
                                </div>
                                <div className="t11-edu-degree">{edu.degree}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* LANGUAGES */}
                {languages && languages.length > 0 && (
                    <div className="t11-section">
                        <div className="t11-section-title">Languages</div>
                        <div className="t11-languages">
                            {languages.map((lang, i) => (
                                <div key={i} className="t11-lang-item">
                                    • {lang}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
