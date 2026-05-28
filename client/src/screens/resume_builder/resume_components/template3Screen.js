import React from "react";
import "./template3.css";
import DescriptionRenderer from "./descriptionRenderer";

export default function Template3({ data }) {
    if (!data) return null;

    // Mapping from Redux state structure
    const { personalDetails, education, experience, skills, languages, projects } = data;
    const user = personalDetails || {};

    return (
        <div className="t3-resume-container">
            <div className="t3-resume">
                {/* COLORED HEADER */}
                <header className="t3-header">
                    <h1>{user.fullName || "Your Name"}</h1>
                    <div className="t3-job-title">{user.headline || "Professional Title"}</div>
                    <div className="t3-contact-info">
                        {user.phone && <span>{user.phone}</span>}
                        {user.phone && user.email && <span>|</span>}
                        {user.email && <span>{user.email}</span>}
                        {user.email && user.website && <span>|</span>}
                        {user.website && <span>{user.website}</span>}
                        {(user.email || user.phone || user.website) && user.location && <span>|</span>}
                        {user.location && <span>{user.location}</span>}
                    </div>
                </header>

                <div className="t3-content">
                    {/* PROFESSIONAL SUMMARY */}
                    {user.summary && (
                        <div className="t3-section">
                            <div className="t3-section-title">Professional Summary</div>
                            <p className="t3-summary-text">{user.summary}</p>
                        </div>
                    )}

                    {/* CORE COMPETENCIES (SKILLS) */}
                    {skills && skills.length > 0 && (
                        <div className="t3-section">
                            <div className="t3-section-title">Core Competencies</div>
                            <div className="t3-skills-grid">
                                {skills.map((skill, i) => (
                                    <div key={i} className="t3-skill-category">
                                        • {skill}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* PROFESSIONAL EXPERIENCE */}
                    {experience && experience.length > 0 && (
                        <div className="t3-section">
                            <div className="t3-section-title">Professional Experience</div>
                            {experience.map((exp, i) => (
                                <div key={i} className="t3-exp-item">
                                    <div className="t3-exp-header">
                                        <div className="t3-exp-role">{exp.role}</div>
                                        <div className="t3-exp-date">
                                            {exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}
                                        </div>
                                    </div>
                                    <div className="t3-exp-company">{exp.company}</div>
                                    <DescriptionRenderer description={exp.description} className="t3-exp-details" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* PROJECTS */}
                    {projects && projects.length > 0 && (
                        <div className="t3-section">
                            <div className="t3-section-title">Key Projects</div>
                            {projects.map((proj, i) => (
                                <div key={i} className="t3-proj-item">
                                    <div className="t3-proj-header">
                                        <div className="t3-proj-name">{proj.name}</div>
                                        {proj.year && <div className="t3-proj-year">{proj.year}</div>}
                                    </div>
                                    {proj.link && (
                                        <a href={proj.link} target="_blank" rel="noopener noreferrer" className="t3-proj-link">
                                            {proj.link}
                                        </a>
                                    )}
                                    <DescriptionRenderer description={proj.description} className="t3-proj-details" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* EDUCATION */}
                    {education && education.length > 0 && (
                        <div className="t3-section">
                            <div className="t3-section-title">Education</div>
                            {education.map((edu, i) => (
                                <div key={i} className="t3-edu-item">
                                    <div className="t3-edu-header">
                                        <div className="t3-edu-school">{edu.school || edu.institution}</div>
                                        <div className="t3-edu-date">{edu.year}</div>
                                    </div>
                                    <div className="t3-edu-degree">{edu.degree}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* LANGUAGES */}
                    {languages && languages.length > 0 && (
                        <div className="t3-section" style={{ marginBottom: 0 }}>
                            <div className="t3-section-title">Languages</div>
                            <div className="t3-languages">
                                {languages.map((lang, i) => (
                                    <div key={i} className="t3-lang-item">
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
