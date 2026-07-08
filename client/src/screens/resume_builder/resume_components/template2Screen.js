import React from "react";
import "./template2.css";
import DescriptionRenderer from "./descriptionRenderer";
import PersonalDetailsGrid from "./personalDetailsGrid";
import { getSpacingStyle } from "./spacingHelper";

export default function Template2({ data }) {
    if (!data) return null;

    const {
        personalDetails,
        education,
        experience,
        skills,
        languages,
        projects,
        references,
        spacingConfig
    } = data;

    const user = personalDetails || {};

    // Helper to get initials
    const getInitials = (name) => {
        if (!name) return "AM";
        const parts = name.split(" ");
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <div className="t2-resume-container">
            <div className="t2-resume-page">
                {/* LEFT SIDEBAR */}
                <div className="t2-sidebar">
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div className="t2-profile-initials">{getInitials(user.fullName)}</div>
                        <div className="t2-sidebar-name">{user.fullName || "Your Name"}</div>
                        <div className="t2-sidebar-title">{user.headline}</div>
                    </div>

                    {/* Contact */}
                    <div className="t2-sidebar-section">
                        <div className="t2-sidebar-heading">Contact</div>
                        {user.phone && (
                            <div className="t2-contact-item">
                                <svg className="t2-contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                <span className="t2-contact-text">{user.phone}</span>
                            </div>
                        )}
                        {user.email && (
                            <div className="t2-contact-item">
                                <svg className="t2-contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                                <span className="t2-contact-text">{user.email}</span>
                            </div>
                        )}
                        {user.location && (
                            <div className="t2-contact-item">
                                <svg className="t2-contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                <span className="t2-contact-text">{user.location}</span>
                            </div>
                        )}
                        {user.website && (
                            <div className="t2-contact-item">
                                <svg className="t2-contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                                <span className="t2-contact-text">{user.website}</span>
                            </div>
                        )}
                    </div>

                    {/* Education */}
                    {education && education.length > 0 && (
                        <div className="t2-sidebar-section" style={getSpacingStyle(spacingConfig, 'education')}>
                            <div className="t2-sidebar-heading">Education</div>
                            {education.map((edu, i) => (
                                <div key={i} className="t2-edu-block">
                                    <div className="t2-edu-degree">{edu.degree}</div>
                                    <div className="t2-edu-school">{edu.school || edu.institution}</div>
                                    <div className="t2-edu-year">{edu.year}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Skills */}
                    {skills && skills.length > 0 && (
                        <div className="t2-sidebar-section" style={getSpacingStyle(spacingConfig, 'skills')}>
                            <div className="t2-sidebar-heading">Skills</div>
                            {skills.map((skill, i) => (
                                <div key={i} className="t2-skill-item">
                                    <div className="t2-skill-name">{skill}</div>
                                    <div className="t2-skill-bar-bg">
                                        <div className="t2-skill-bar-fill" style={{ width: `${95 - (i * 5)}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Languages */}
                    {languages && languages.length > 0 && (
                        <div className="t2-sidebar-section" style={getSpacingStyle(spacingConfig, 'languages')}>
                            <div className="t2-sidebar-heading">Languages</div>
                            {languages.map((lang, i) => (
                                <div key={i} className="t2-lang-item">
                                    <span className="t2-lang-name">{lang}</span>
                                    <span className="t2-lang-level">Proficient</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* RIGHT MAIN */}
                <div className="t2-main-content">
                    {/* Header */}
                    <div className="t2-main-header" style={getSpacingStyle(spacingConfig, 'header')}>
                        <div className="t2-main-name">{user.fullName || "Your Name"}</div>
                        <div className="t2-main-jobtitle">{user.headline}</div>
                    </div>

                    {/* Profile */}
                    {user.summary && (
                        <div className="t2-main-section" style={getSpacingStyle(spacingConfig, 'summary')}>
                            <div className="t2-section-heading">Profile</div>
                            <p className="t2-profile-text">{user.summary}</p>
                        </div>
                    )}

                    {/* Work Experience */}
                    {experience && experience.length > 0 && (
                        <div className="t2-main-section" style={getSpacingStyle(spacingConfig, 'experience')}>
                            <div className="t2-section-heading">Work Experience</div>
                            {experience.map((exp, i) => (
                                <div key={i} className="t2-exp-block">
                                    <div className="t2-exp-role">{exp.role}</div>
                                    <div className="t2-exp-company">{exp.company}</div>
                                    <div className="t2-exp-date">
                                        {exp.startDate} — {exp.isCurrent ? 'Present' : exp.endDate}
                                    </div>
                                    <div className="t2-exp-desc">
                                        <DescriptionRenderer description={exp.description} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Projects */}
                    {projects && projects.length > 0 && (
                        <div className="t2-main-section" style={getSpacingStyle(spacingConfig, 'projects')}>
                            <div className="t2-section-heading">Key Projects</div>
                            {projects.map((proj, i) => (
                                <div key={i} className="t2-exp-block">
                                    <div className="t2-exp-role">{proj.name}</div>
                                    {proj.link && <div className="t2-exp-company">{proj.link}</div>}
                                    {proj.year && <div className="t2-exp-date">{proj.year}</div>}
                                    <div className="t2-exp-desc">
                                        <DescriptionRenderer description={proj.description} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* References */}
                    {references && references.length > 0 && (
                        <div className="t2-main-section" style={getSpacingStyle(spacingConfig, 'references')}>
                            <div className="t2-section-heading">References</div>
                            <div className="t2-ref-grid">
                                {references.map((ref, i) => (
                                    <div key={i} className="t2-ref-block">
                                        <div className="t2-ref-name">{ref.name}</div>
                                        <div className="t2-ref-role">
                                            {ref.designation || ref.role}
                                            {ref.company && ` at ${ref.company}`}
                                        </div>
                                        {ref.phone && <div className="t2-ref-contact">Phone: {ref.phone}</div>}
                                        {ref.email && <div className="t2-ref-contact">Email: {ref.email}</div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {(user.showPersonalDetails !== false && (user.date_of_birth || user.gender || user.maritalStatus || user.location)) && (
                        <div className="t2-main-section" style={getSpacingStyle(spacingConfig, 'personalDetails')}>
                            <div className="t2-section-heading">Personal Details</div>
                            <PersonalDetailsGrid user={user} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}