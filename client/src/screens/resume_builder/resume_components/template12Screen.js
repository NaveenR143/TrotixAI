import React from "react";
import "./template12.css";

export default function Template12({ data }) {
    if (!data) return null;

    const {
        personalDetails,
        education,
        experience,
        skills,
        languages,
        projects
    } = data;

    const user = personalDetails || {};

    // Helper to get initials
    const getInitials = (name) => {
        if (!name) return "AM";
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <div className="t12-resume-container">
            <div className="t12-resume-page">
                {/* LEFT SIDEBAR */}
                <div className="t12-sidebar">
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div className="t12-profile-initials">{getInitials(user.fullName)}</div>
                        <div className="t12-sidebar-name">{user.fullName || "Your Name"}</div>
                        <div className="t12-sidebar-title">{user.headline || "Professional Title"}</div>
                    </div>

                    {/* Contact */}
                    <div className="t12-sidebar-section">
                        <div className="t12-sidebar-heading">Contact</div>
                        {user.phone && (
                            <div className="t12-contact-item">
                                <svg className="t12-contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                <span className="t12-contact-text">{user.phone}</span>
                            </div>
                        )}
                        {user.email && (
                            <div className="t12-contact-item">
                                <svg className="t12-contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                                <span className="t12-contact-text">{user.email}</span>
                            </div>
                        )}
                        {user.location && (
                            <div className="t12-contact-item">
                                <svg className="t12-contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                <span className="t12-contact-text">{user.location}</span>
                            </div>
                        )}
                        {user.website && (
                            <div className="t12-contact-item">
                                <svg className="t12-contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                                <span className="t12-contact-text">{user.website}</span>
                            </div>
                        )}
                    </div>

                    {/* Education */}
                    {education && education.length > 0 && (
                        <div className="t12-sidebar-section">
                            <div className="t12-sidebar-heading">Education</div>
                            {education.map((edu, i) => (
                                <div key={i} className="t12-edu-block">
                                    <div className="t12-edu-degree">{edu.degree}</div>
                                    <div className="t12-edu-school">{edu.school || edu.institution}</div>
                                    <div className="t12-edu-year">{edu.year}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Skills */}
                    {skills && skills.length > 0 && (
                        <div className="t12-sidebar-section">
                            <div className="t12-sidebar-heading">Skills</div>
                            {skills.map((skill, i) => (
                                <div key={i} className="t12-skill-item">
                                    <div className="t12-skill-name">{skill}</div>
                                    <div className="t12-skill-bar-bg">
                                        <div className="t12-skill-bar-fill" style={{ width: `${92 - (i * 4)}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Languages */}
                    {languages && languages.length > 0 && (
                        <div className="t12-sidebar-section">
                            <div className="t12-sidebar-heading">Languages</div>
                            {languages.map((lang, i) => (
                                <div key={i} className="t12-lang-item">
                                    <span className="t12-lang-name">{lang}</span>
                                    <span className="t12-lang-level">Native</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* RIGHT MAIN */}
                <div className="t12-main-content">
                    {/* Header */}
                    <div className="t12-main-header">
                        <div className="t12-main-name">{user.fullName || "Your Name"}</div>
                        <div className="t12-main-jobtitle">{user.headline || "Professional Title"}</div>
                    </div>

                    {/* Profile */}
                    {user.summary && (
                        <div className="t12-main-section">
                            <div className="t12-section-heading">Profile</div>
                            <p className="t12-profile-text">{user.summary}</p>
                        </div>
                    )}

                    {/* Work Experience */}
                    {experience && experience.length > 0 && (
                        <div className="t12-main-section">
                            <div className="t12-section-heading">Work Experience</div>
                            {experience.map((exp, i) => (
                                <div key={i} className="t12-exp-block">
                                    <div className="t12-exp-role">{exp.role}</div>
                                    <div className="t12-exp-company">{exp.company}</div>
                                    <div className="t12-exp-date">
                                        {exp.startDate} — {exp.isCurrent ? 'PRESENT' : exp.endDate?.toUpperCase()}
                                    </div>
                                    <div className="t12-exp-desc">
                                        {exp.description && (
                                            <ul>
                                                {exp.description.split('\n').map((point, idx) => (
                                                    point.trim() && <li key={idx}>{point.replace(/^[•\-\*]\s?/, '')}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Projects */}
                    {projects && projects.length > 0 && (
                        <div className="t12-main-section">
                            <div className="t12-section-heading">Key Projects</div>
                            {projects.map((proj, i) => (
                                <div key={i} className="t12-exp-block">
                                    <div className="t12-exp-role">{proj.name}</div>
                                    {proj.link && <div className="t12-exp-company">{proj.link}</div>}
                                    {proj.year && <div className="t12-exp-date">{proj.year}</div>}
                                    <div className="t12-exp-desc">
                                        {proj.description && (
                                            <ul>
                                                {proj.description.split('\n').map((point, idx) => (
                                                    point.trim() && <li key={idx}>{point.replace(/^[•\-\*]\s?/, '')}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* References */}
                    <div className="t12-main-section">
                        <div className="t12-section-heading">References</div>
                        <div className="t12-ref-grid">
                            <div className="t12-ref-block">
                                <div className="t12-ref-name">Available upon request</div>
                                <div className="t12-ref-role">Professional references can be provided.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
