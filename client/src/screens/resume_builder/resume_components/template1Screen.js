import React from "react";
import "./template1.css";

export default function Template1({ data }) {
    if (!data) return null;

    // Mapping from Redux state structure
    const { personalDetails, education, experience, skills, languages, projects } = data;
    const user = personalDetails || {};

    return (
        <div className="resume-container">
            <div className="resume-page">
                {/* Header */}
                <div className="header">
                    <h1>{user.fullName || "Your Name"}</h1>
                    <h3>{user.headline || "Professional Title"}</h3>
                    <p>
                        {user.location && `${user.location} | `}
                        {user.email} 
                        {user.phone && ` | ${user.phone}`}
                        {user.website && ` | ${user.website}`}
                    </p>
                </div>

                <div className="body">
                    {/* LEFT PANEL */}
                    <div className="left">
                        {education && education.length > 0 && (
                            <section>
                                <h4>EDUCATION</h4>
                                {education.map((edu, i) => (
                                    <div key={i} className="block">
                                        <strong>{edu.school || edu.institution}</strong>
                                        <p>{edu.year}</p>
                                        <p>{edu.degree}</p>
                                    </div>
                                ))}
                            </section>
                        )}

                        {skills && skills.length > 0 && (
                            <section>
                                <h4>SKILLS</h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                    {skills.map((skill, i) => (
                                        <span key={i} style={{ fontSize: '9pt', background: '#f7fafc', padding: '2px 8px', borderRadius: '4px', border: '1px solid #edf2f7' }}>
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </section>
                        )}

                        {languages && languages.length > 0 && (
                            <section>
                                <h4>LANGUAGES</h4>
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    {languages.map((lang, i) => (
                                        <li key={i} style={{ fontSize: '10pt', marginBottom: '4px' }}>• {lang}</li>
                                    ))}
                                </ul>
                            </section>
                        )}
                    </div>

                    {/* RIGHT PANEL */}
                    <div className="right">
                        {user.summary && (
                            <section>
                                <h4>SUMMARY</h4>
                                <p style={{ fontSize: '10pt', textAlign: 'justify' }}>{user.summary}</p>
                            </section>
                        )}

                        {experience && experience.length > 0 && (
                            <section>
                                <h4>EXPERIENCE</h4>
                                {experience.map((exp, i) => (
                                    <div key={i} className="block">
                                        <div className="exp-header">
                                            <strong>{exp.role}</strong>
                                            <span>{exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}</span>
                                        </div>
                                        <p style={{ fontWeight: 600, color: '#4a5568', marginBottom: '5px' }}>{exp.company}</p>
                                        <ul>
                                            {exp.description && exp.description.split('\n').map((point, idx) => (
                                                point.trim() && <li key={idx}>{point.replace(/^[•\-\*]\s?/, '')}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </section>
                        )}

                        {projects && projects.length > 0 && (
                            <section>
                                <h4>PROJECTS</h4>
                                {projects.map((proj, i) => (
                                    <div key={i} className="block">
                                        <strong>{proj.name}</strong>
                                        <p>{proj.description}</p>
                                    </div>
                                ))}
                            </section>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Template for extra pages if content overflows significantly */}
            {/* In a real app, this would be computed, but here we provide the structure */}
        </div>
    );
}