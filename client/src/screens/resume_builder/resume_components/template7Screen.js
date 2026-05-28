import React from "react";
import "./template7.css";
import DescriptionRenderer from "./descriptionRenderer";

export default function Template7({ data }) {
    if (!data) return null;

    // Mapping from Redux state structure
    const { personalDetails, education, experience, skills, languages, projects } = data;
    const user = personalDetails || {};

    return (
        <div className="t7-resume-container">
            <div className="t7-resume">
                {/* TOP ACCENT BAR */}
                <div className="t7-top-accent"></div>

                {/* HEADER */}
                <header className="t7-header">
                    <div className="t7-header-left">
                        <h1>{user.fullName || "Your Name"}</h1>
                        <div className="t7-job-title">{user.headline || "Professional Title"}</div>
                    </div>
                    <div className="t7-header-right">
                        {user.phone && <div>{user.phone}</div>}
                        {user.email && <div>{user.email}</div>}
                        {user.website && <div>{user.website}</div>}
                        {user.location && <div>{user.location}</div>}
                    </div>
                </header>

                <div className="t7-content">
                    {/* PROFESSIONAL SUMMARY */}
                    {user.summary && (
                        <div className="t7-section">
                            <div className="t7-section-title">Professional Summary</div>
                            <p className="t7-summary-text">{user.summary}</p>
                        </div>
                    )}

                    {/* CORE COMPETENCIES (SKILLS) */}
                    {skills && skills.length > 0 && (
                        <div className="t7-section">
                            <div className="t7-section-title">Core Competencies</div>
                            <table className="t7-skills-table">
                                <tbody>
                                    <tr>
                                        <td className="t7-skill-cat">Skills & Expertise</td>
                                        <td className="t7-skill-list">{skills.join(", ")}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* PROFESSIONAL EXPERIENCE */}
                    {experience && experience.length > 0 && (
                        <div className="t7-section">
                            <div className="t7-section-title">Professional Experience</div>
                            {experience.map((exp, i) => (
                                <div key={i} className="t7-exp-item">
                                    <div className="t7-exp-header">
                                        <div className="t7-exp-role">{exp.role}</div>
                                        <div className="t7-exp-date">
                                            {exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}
                                        </div>
                                    </div>
                                    <div className="t7-exp-company">{exp.company}</div>
                                    <DescriptionRenderer description={exp.description} className="t7-exp-details" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* KEY PROJECTS */}
                    {projects && projects.length > 0 && (
                        <div className="t7-section">
                            <div className="t7-section-title">Key Projects</div>
                            {projects.map((proj, i) => (
                                <div key={i} className="t7-proj-item">
                                    <div className="t7-proj-header">
                                        <div className="t7-proj-name">{proj.name}</div>
                                        {proj.year && <div className="t7-proj-year">{proj.year}</div>}
                                    </div>
                                    {proj.link && (
                                        <a href={proj.link} target="_blank" rel="noopener noreferrer" className="t7-proj-link">
                                            {proj.link}
                                        </a>
                                    )}
                                    <DescriptionRenderer description={proj.description} className="t7-proj-details" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* EDUCATION */}
                    {education && education.length > 0 && (
                        <div className="t7-section">
                            <div className="t7-section-title">Education</div>
                            {education.map((edu, i) => (
                                <div key={i} className="t7-edu-item">
                                    <div className="t7-edu-left">
                                        <div className="t7-edu-school">{edu.school || edu.institution}</div>
                                        <div className="t7-edu-degree">{edu.degree}</div>
                                    </div>
                                    <div className="t7-edu-date">{edu.year}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* LANGUAGES */}
                    {languages && languages.length > 0 && (
                        <div className="t7-section" style={{ marginBottom: 0 }}>
                            <div className="t7-section-title">Languages</div>
                            <div className="t7-languages">
                                {languages.map((lang, i) => (
                                    <div key={i} className="t7-lang-item">
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
