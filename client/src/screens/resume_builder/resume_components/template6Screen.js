import React from "react";
import "./template6.css";
import DescriptionRenderer from "./descriptionRenderer";
import PersonalDetailsGrid from "./personalDetailsGrid";
import { getSpacingStyle } from "./spacingHelper";

export default function Template6({ data }) {
    if (!data) return null;

    // Mapping from Redux state structure
    const { personalDetails, education, experience, skills, languages, projects, references, spacingConfig } = data;
    const user = personalDetails || {};

    return (
        <div className="t6-resume-container">
            <div className="t6-resume">
                {/* CLASSIC CENTERED HEADER */}
                <header className="t6-header" style={getSpacingStyle(spacingConfig, 'header')}>
                    <h1>{user.fullName || "Your Name"}</h1>
                    <div className="t6-job-title">{user.headline} </div>
                    <div className="t6-contact-info">
                        {user.phone && <span>{user.phone}</span>}
                        {user.phone && user.email && <span className="t6-separator">|</span>}
                        {user.email && <span>{user.email}</span>}
                        {user.email && user.website && <span className="t6-separator">|</span>}
                        {user.website && <span>{user.website}</span>}
                        {(user.email || user.phone || user.website) && user.location && <span className="t6-separator">|</span>}
                        {user.location && <span>{user.location}</span>}
                    </div>
                </header>

                <div className="t6-content">
                    {/* PROFESSIONAL SUMMARY */}
                    {user.summary && (
                        <div className="t6-section" style={getSpacingStyle(spacingConfig, 'summary')}>
                            <div className="t6-section-title">Professional Summary</div>
                            <p className="t6-summary-text">{user.summary}</p>
                        </div>
                    )}

                    {/* CORE COMPETENCIES (SKILLS) */}
                    {skills && skills.length > 0 && (
                        <div className="t6-section" style={getSpacingStyle(spacingConfig, 'skills')}>
                            <div className="t6-section-title">Core Competencies</div>
                            <div className="t6-skills-list">
                                {skills.map((skill, i) => (
                                    <div key={i} className="t6-skill-item">
                                        {skill}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* PROFESSIONAL EXPERIENCE */}
                    {experience && experience.length > 0 && (
                        <div className="t6-section" style={getSpacingStyle(spacingConfig, 'experience')}>
                            <div className="t6-section-title">Professional Experience</div>
                            {experience.map((exp, i) => (
                                <div key={i} className="t6-exp-item">
                                    <div className="t6-exp-header">
                                        <div className="t6-exp-role">{exp.role}</div>
                                        <div className="t6-exp-date">
                                            {exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}
                                        </div>
                                    </div>
                                    <div className="t6-exp-company">{exp.company}</div>
                                    <DescriptionRenderer description={exp.description} className="t6-exp-details" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* KEY PROJECTS */}
                    {projects && projects.length > 0 && (
                        <div className="t6-section" style={getSpacingStyle(spacingConfig, 'projects')}>
                            <div className="t6-section-title">Key Projects</div>
                            {projects.map((proj, i) => (
                                <div key={i} className="t6-proj-item">
                                    <div className="t6-proj-header">
                                        <div className="t6-proj-name">{proj.name}</div>
                                        {proj.year && <div className="t6-proj-year">{proj.year}</div>}
                                    </div>
                                    {proj.link && (
                                        <a href={proj.link} target="_blank" rel="noopener noreferrer" className="t6-proj-link">
                                            {proj.link}
                                        </a>
                                    )}
                                    <DescriptionRenderer description={proj.description} className="t6-proj-details" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* EDUCATION */}
                    {education && education.length > 0 && (
                        <div className="t6-section" style={getSpacingStyle(spacingConfig, 'education')}>
                            <div className="t6-section-title">Education</div>
                            {education.map((edu, i) => (
                                <div key={i} className="t6-edu-item">
                                    <div className="t6-edu-left">
                                        <div className="t6-edu-school">{edu.school || edu.institution}</div>
                                        <div className="t6-edu-degree">{edu.degree}</div>
                                    </div>
                                    <div className="t6-edu-date">{edu.year}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* LANGUAGES */}
                    {languages && languages.length > 0 && (
                        <div className="t6-section" style={getSpacingStyle(spacingConfig, 'languages')}>
                            <div className="t6-section-title">Languages</div>
                            <div className="t6-languages">
                                {languages.map((lang, i) => (
                                    <div key={i} className="t6-lang-item">
                                        • {lang}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {(user.showPersonalDetails !== false && (user.date_of_birth || user.gender || user.maritalStatus || user.location)) && (
                        <div className="t6-section" style={getSpacingStyle(spacingConfig, 'personalDetails')}>
                            <div className="t6-section-title">Personal Details</div>
                            <PersonalDetailsGrid user={user} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
