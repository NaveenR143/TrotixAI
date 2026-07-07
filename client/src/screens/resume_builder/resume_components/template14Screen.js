import React from "react";
import "./template14.css";
import DescriptionRenderer from "./descriptionRenderer";
import PersonalDetailsGrid from "./personalDetailsGrid";

export default function Template14({ data }) {
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

    // Helper for split name (first word accented or last word?)
    // Reference HTML has "ARJUN <span>MEHTA</span>"
    const renderName = (name) => {
        if (!name) return "Your Name";
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) {
            const last = parts.pop();
            return <>{parts.join(" ")} <span>{last}</span></>;
        }
        return name;
    };

    return (
        <div className="t14-resume-container">
            <div className="t14-resume-page">
                {/* HEADER */}
                <div className="t14-header">
                    <div className="t14-header-row">
                        <div>
                            <div className="t14-header-name">{renderName(user.fullName)}</div>
                            <div className="t14-header-title">{user.headline} </div>
                        </div>
                        <div className="t14-header-monogram">{getInitials(user.fullName)}</div>
                    </div>
                    <div className="t14-contact-strip">
                        {user.phone && (
                            <div className="t14-contact-item">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                {user.phone}
                            </div>
                        )}
                        <div className="t14-contact-sep"></div>
                        {user.email && (
                            <div className="t14-contact-item">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                                {user.email}
                            </div>
                        )}
                        <div className="t14-contact-sep"></div>
                        {user.location && (
                            <div className="t14-contact-item">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                {user.location}
                            </div>
                        )}
                        {user.website && (
                            <>
                                <div className="t14-contact-sep"></div>
                                <div className="t14-contact-item">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                                    {user.website}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* BODY */}
                <div className="t14-body-layout">
                    {/* LEFT COLUMN */}
                    <div className="t14-left-col">
                        {user.summary && (
                            <div className="t14-section">
                                <div className="t14-section-title"><div className="t14-section-dot"></div>Profile<div className="t14-section-line"></div></div>
                                <p className="t14-profile-text">{user.summary}</p>
                            </div>
                        )}

                        {experience && experience.length > 0 && (
                            <div className="t14-section">
                                <div className="t14-section-title"><div className="t14-section-dot"></div>Work Experience<div className="t14-section-line"></div></div>
                                {experience.map((exp, i) => (
                                    <div key={i} className="t14-exp-card">
                                        <div className="t14-exp-top">
                                            <div className="t14-exp-role">{exp.role}</div>
                                            <div className="t14-exp-date-badge">
                                                {exp.startDate} — {exp.isCurrent ? 'PRESENT' : exp.endDate?.toUpperCase()}
                                            </div>
                                        </div>
                                        <div className="t14-exp-company">{exp.company}</div>
                                        <DescriptionRenderer description={exp.description} className="t14-exp-desc" />
                                    </div>
                                ))}
                            </div>
                        )}

                        {projects && projects.length > 0 && (
                            <div className="t14-section">
                                <div className="t14-section-title"><div className="t14-section-dot"></div>Key Projects<div className="t14-section-line"></div></div>
                                {projects.map((proj, i) => (
                                    <div key={i} className="t14-exp-card">
                                        <div className="t14-exp-top">
                                            <div className="t14-exp-role">{proj.name}</div>
                                            <div className="t14-exp-date-badge">{proj.year}</div>
                                        </div>
                                        {proj.link && <div className="t14-exp-company" style={{ fontSize: '0.65rem' }}>{proj.link}</div>}
                                        <DescriptionRenderer description={proj.description} className="t14-exp-desc" />
                                    </div>
                                ))}
                            </div>
                        )}

                        {(user.showPersonalDetails !== false && (user.date_of_birth || user.gender || user.maritalStatus || user.location)) && (
                            <div className="t14-section">
                                <div className="t14-section-title"><div className="t14-section-dot"></div>Personal Details<div className="t14-section-line"></div></div>
                                <PersonalDetailsGrid user={user} />
                            </div>
                        )}
                    </div>

                    {/* RIGHT SIDEBAR */}
                    <div className="t14-sidebar-col">
                        {education && education.length > 0 && (
                            <div className="t14-section">
                                <div className="t14-section-title"><div className="t14-section-dot"></div>Education<div className="t14-section-line"></div></div>
                                {education.map((edu, i) => (
                                    <div key={i} className="t14-edu-item">
                                        <div className="t14-edu-degree">{edu.degree}</div>
                                        <div className="t14-edu-school">{edu.school || edu.institution}</div>
                                        <div className="t14-edu-year">{edu.year}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {skills && skills.length > 0 && (
                            <div className="t14-section">
                                <div className="t14-section-title"><div className="t14-section-dot"></div>Skills<div className="t14-section-line"></div></div>
                                {skills.map((skill, i) => (
                                    <div key={i} className="t14-skill-item">
                                        <div className="t14-skill-label"><span>{skill}</span><span className="t14-skill-pct">{92 - (i * 5)}%</span></div>
                                        <div className="t14-skill-track"><div className="t14-skill-fill" style={{ width: `${92 - (i * 5)}%` }}></div></div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {languages && languages.length > 0 && (
                            <div className="t14-section">
                                <div className="t14-section-title"><div className="t14-section-dot"></div>Languages<div className="t14-section-line"></div></div>
                                {languages.map((lang, i) => (
                                    <div key={i} className="t14-lang-item">
                                        <span className="t14-lang-name">{lang}</span>
                                        <div className="t14-lang-dots">
                                            {[1, 2, 3, 4, 5].map(dot => (
                                                <div key={dot} className={`t14-lang-dot ${dot <= (5 - i) ? 'filled' : ''}`}></div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {references && references.length > 0 && (
                            <div className="t14-section">
                                <div className="t14-section-title"><div className="t14-section-dot"></div>References<div className="t14-section-line"></div></div>
                                {references.map((ref, i) => (
                                    <div key={i} className="t14-ref-item">
                                        <div className="t14-ref-name">{ref.name}</div>
                                        <div className="t14-ref-role">
                                            {ref.designation || ref.role}
                                            {ref.company && ` at ${ref.company}`}
                                        </div>
                                        {ref.phone && <div className="t14-ref-contact">Phone: {ref.phone}</div>}
                                        {ref.email && <div className="t14-ref-contact">Email: {ref.email}</div>}
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
