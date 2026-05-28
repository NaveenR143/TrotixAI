import React from "react";
import "./template1.css";
import DescriptionRenderer from "./descriptionRenderer";

export default function Template1({ data }) {
    if (!data) return null;

    // Mapping from Redux state structure
    const { personalDetails, education, experience, skills, languages, projects } = data;
    const user = personalDetails || {};

    return (
        <div className="resume-container">
            <div className="resume-page">
                {/* Header Section */}
                <div className="header">
                    <h1>{user.fullName || "Your Name"}</h1>
                    <h3>{user.headline || "Professional Title"}</h3>
                    <div className="header-divider"></div>
                    <div className="contact-info">
                        {user.location && <span>{user.location}</span>}
                        {user.email && <span>| {user.email}</span>}
                        {user.phone && <span>| {user.phone}</span>}
                        {user.website && <span>| {user.website}</span>}
                    </div>
                </div>

                {/* Body Section */}
                <div className="body">
                    {/* LEFT PANEL (Grey Background) */}
                    <div className="left">
                        {education && education.length > 0 && (
                            <section className="section">
                                <h4>EDUCATION:</h4>
                                {education.map((edu, i) => (
                                    <div key={i} className="block">
                                        <strong className="edu-school">{edu.school || edu.institution}</strong>
                                        <div className="year">{edu.year}</div>
                                        <p className="edu-degree">{edu.degree}</p>
                                    </div>
                                ))}
                            </section>
                        )}

                        {skills && skills.length > 0 && (
                            <section className="section">
                                <h4>SKILLS:</h4>
                                <ul className="skill-list">
                                    {skills.map((skill, i) => (
                                        <li key={i}>{skill}</li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {languages && languages.length > 0 && (
                            <section className="section">
                                <h4>LANGUAGE:</h4>
                                <ul className="skill-list">
                                    {languages.map((lang, i) => (
                                        <li key={i}>{lang}</li>
                                    ))}
                                </ul>
                            </section>
                        )}
                    </div>

                    {/* RIGHT PANEL (White Background) */}
                    <div className="right">
                        {user.summary && (
                            <section className="section">
                                <h4>SUMMARY:</h4>
                                <p className="t2-profile-text" style={{ fontSize: '11px', textAlign: 'justify', lineHeight: 1.6 }}>
                                    {user.summary}
                                </p>
                            </section>
                        )}

                        {experience && experience.length > 0 && (
                            <section className="section">
                                <h4>EXPERIENCE:</h4>
                                {experience.map((exp, i) => (
                                    <div key={i} className="block">
                                        <div className="exp-header">
                                            <strong className="exp-role">{exp.role}</strong>
                                            <div className="exp-date">
                                                {exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}
                                            </div>
                                        </div>
                                        <div className="company-name exp-company">{exp.company}</div>
                                        <DescriptionRenderer description={exp.description} />
                                    </div>
                                ))}
                            </section>
                        )}

                        {projects && projects.length > 0 && (
                            <section className="section">
                                <h4>PROJECTS:</h4>
                                {projects.map((proj, i) => (
                                    <div key={i} className="block">
                                        <div className="exp-header">
                                            <strong className="exp-role">{proj.name}</strong>
                                            {proj.year && <div className="exp-date">{proj.year}</div>}
                                        </div>
                                        {proj.link && (
                                            <div style={{ fontSize: '10px', color: '#666', fontStyle: 'italic', marginBottom: '4px' }}>
                                                {proj.link}
                                            </div>
                                        )}
                                        <DescriptionRenderer description={proj.description} />
                                    </div>
                                ))}
                            </section>
                        )}

                        {/* References Section (Design matching template) */}
                        <section className="section">
                            <h4>REFERENCES:</h4>
                            <div className="references-grid">
                                <div className="ref-item">
                                    <strong>HARUMI KOBAYASHI</strong>
                                    <p>Wardiere Inc. / CEO</p>
                                    <p>Phone: 123-456-7890</p>
                                    <p>Email: hello@reallygreatsite.com</p>
                                </div>
                                <div className="ref-item">
                                    <strong>BAILEY DUPONT</strong>
                                    <p>Wardiere Inc. / CEO</p>
                                    <p>Phone: 123-456-7890</p>
                                    <p>Email: hello@reallygreatsite.com</p>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}