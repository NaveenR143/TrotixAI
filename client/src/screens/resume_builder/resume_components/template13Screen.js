import React from "react";
import "./template13.css";
import DescriptionRenderer from "./descriptionRenderer";
import PersonalDetailsGrid from "./personalDetailsGrid";

export default function Template13({ data }) {
    if (!data) return null;

    const {
        personalDetails,
        education,
        experience,
        skills,
        languages,
        projects,
        references
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
        <div className="t13-resume-container">
            <div className="t13-resume-page">
                {/* HEADER */}
                <div className="t13-header">
                    <div className="t13-header-top">
                        <div>
                            <div className="t13-header-name">{user.fullName || "Your Name"}</div>
                            <div className="t13-header-title">{user.headline}</div>
                        </div>
                        <div className="t13-header-initials">{getInitials(user.fullName)}</div>
                    </div>
                    <div className="t13-contact-row">
                        {user.phone && (
                            <div className="t13-contact-chip">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                {user.phone}
                            </div>
                        )}
                        {user.email && (
                            <div className="t13-contact-chip">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                                {user.email}
                            </div>
                        )}
                        {user.location && (
                            <div className="t13-contact-chip">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                {user.location}
                            </div>
                        )}
                        {user.website && (
                            <div className="t13-contact-chip">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                                {user.website}
                            </div>
                        )}
                    </div>
                </div>

                {/* BODY GRID */}
                <div className="t13-body-grid">
                    {/* LEFT COLUMN */}
                    <div className="t13-left-col">
                        {user.summary && (
                            <div className="t13-section">
                                <div className="t13-section-title">Profile</div>
                                <p className="t13-profile-text">{user.summary}</p>
                            </div>
                        )}

                        {experience && experience.length > 0 && (
                            <div className="t13-section">
                                <div className="t13-section-title">Work Experience</div>
                                {experience.map((exp, i) => (
                                    <div key={i} className="t13-exp-item">
                                        <div className="t13-exp-date-col">
                                            <span className="t13-exp-date">
                                                {exp.startDate} — {exp.isCurrent ? 'PRESENT' : exp.endDate?.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="t13-exp-content">
                                            <div className="t13-exp-role">{exp.role}</div>
                                            <div className="t13-exp-company">{exp.company}</div>
                                            <DescriptionRenderer description={exp.description} className="t13-exp-desc" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {projects && projects.length > 0 && (
                            <div className="t13-section">
                                <div className="t13-section-title">Key Projects</div>
                                {projects.map((proj, i) => (
                                    <div key={i} className="t13-exp-item">
                                        <div className="t13-exp-date-col">
                                            <span className="t13-exp-date">{proj.year}</span>
                                        </div>
                                        <div className="t13-exp-content">
                                            <div className="t13-exp-role">{proj.name}</div>
                                            {proj.link && <div className="t13-exp-company" style={{ fontSize: '0.65rem' }}>{proj.link}</div>}
                                            <DescriptionRenderer description={proj.description} className="t13-exp-desc" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {(user.showPersonalDetails !== false && (user.date_of_birth || user.gender || user.maritalStatus || user.location)) && (
                            <div className="t13-section">
                                <div className="t13-section-title">Personal Details</div>
                                <PersonalDetailsGrid user={user} />
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="t13-right-col">
                        {education && education.length > 0 && (
                            <div className="t13-section">
                                <div className="t13-section-title">Education</div>
                                {education.map((edu, i) => (
                                    <div key={i} className="t13-edu-item">
                                        <div className="t13-edu-degree">{edu.degree}</div>
                                        <div className="t13-edu-school">{edu.school || edu.institution}</div>
                                        <div className="t13-edu-year">{edu.year}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {skills && skills.length > 0 && (
                            <div className="t13-section">
                                <div className="t13-section-title">Skills</div>
                                <div className="t13-skill-pills">
                                    {skills.map((skill, i) => (
                                        <span key={i} className="t13-skill-pill">{skill}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {languages && languages.length > 0 && (
                            <div className="t13-section">
                                <div className="t13-section-title">Languages</div>
                                {languages.map((lang, i) => (
                                    <div key={i} className="t13-lang-row">
                                        <span>{lang}</span>
                                        <span className="t13-lang-level">Native</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {references && references.length > 0 && (
                            <div className="t13-section">
                                <div className="t13-section-title">References</div>
                                {references.map((ref, i) => (
                                    <div key={i} className="t13-ref-card">
                                        <div className="t13-ref-name">{ref.name}</div>
                                        <div className="t13-ref-role">
                                            {ref.designation || ref.role}
                                            {ref.company && ` at ${ref.company}`}
                                        </div>
                                        {ref.phone && <div className="t13-ref-contact">Phone: {ref.phone}</div>}
                                        {ref.email && <div className="t13-ref-contact">Email: {ref.email}</div>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
