import React from "react";
import "./template2.css";

export default function Template2({ data }) {
    if (!data) return null;

    const {
        personalDetails,
        education,
        experience,
        skills,
        languages,
    } = data;

    const user = personalDetails || {};

    return (
        <div className="t2-container">
            <div className="t2-card">
                {/* LEFT SIDEBAR */}
                <div className="t2-left">
                    <div className="t2-photo-wrapper">
                        <img
                            src={user.profileImage || "https://via.placeholder.com/120"}
                            alt="profile"
                        />
                    </div>

                    <section>
                        <h4>CONTACT</h4>
                        <p>{user.phone}</p>
                        <p>{user.email}</p>
                        <p>{user.location}</p>
                    </section>

                    {education?.length > 0 && (
                        <section>
                            <h4>EDUCATION</h4>
                            {education.map((edu, i) => (
                                <div key={i} className="t2-block">
                                    <p className="year">{edu.year}</p>
                                    <strong>{edu.school || edu.institution}</strong>
                                    <p>{edu.degree} {edu.field ? `in ${edu.field}` : ""}</p>
                                </div>
                            ))}
                        </section>
                    )}


                    {skills?.length > 0 && (
                        <section>
                            <h4>SKILLS</h4>
                            <ul>
                                {skills.map((s, i) => (
                                    <li key={i}>{s}</li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {languages?.length > 0 && (
                        <section>
                            <h4>LANGUAGES</h4>
                            <ul>
                                {languages.map((l, i) => (
                                    <li key={i}>{l}</li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>

                {/* RIGHT CONTENT */}
                <div className="t2-right">
                    {/* HEADER */}
                    <div className="t2-header">
                        <h1>{user.fullName || "Your Name"}</h1>
                        <div className="t2-role">{user.headline || "Your Role"}</div>
                    </div>

                    {/* PROFILE */}
                    {user.summary && (
                        <section>
                            <h4>PROFILE</h4>
                            <p>{user.summary}</p>
                        </section>
                    )}

                    {/* EXPERIENCE */}
                    {experience?.length > 0 && (
                        <section>
                            <h4>WORK EXPERIENCE</h4>
                            <div className="timeline">
                                {experience.map((exp, i) => (
                                    <div key={i} className="timeline-item">
                                        <div className="timeline-dot" />
                                        <div className="timeline-content">
                                            <div className="exp-header">
                                                <strong>{exp.company}</strong>
                                                <span>
                                                    {exp.startDate} -{" "}
                                                    {exp.isCurrent ? "Present" : exp.endDate}
                                                </span>
                                            </div>
                                            <p className="role">{exp.role}</p>
                                            <ul>
                                                {exp.description &&
                                                    exp.description.split("\n").map((d, idx) => (
                                                        d.trim() && <li key={idx}>{d.replace(/^[•\-\*]\s?/, '')}</li>
                                                    ))}
                                            </ul>

                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* PROJECTS */}
                    {data.projects?.length > 0 && (
                        <section>
                            <h4>PROJECTS</h4>
                            <div className="timeline">
                                {data.projects.map((proj, i) => (
                                    <div key={i} className="timeline-item">
                                        <div className="timeline-dot" />
                                        <div className="timeline-content">
                                            <div className="exp-header">
                                                <strong>{proj.name}</strong>
                                                <span>{proj.year}</span>
                                            </div>
                                            {proj.link && (
                                                <p className="role" style={{ color: '#5f6f73', textDecoration: 'underline', marginBottom: '4px' }}>
                                                    {proj.link}
                                                </p>
                                            )}
                                            <ul>
                                                {proj.description &&
                                                    proj.description.split("\n").map((d, idx) => (
                                                        d.trim() && <li key={idx}>{d.replace(/^[•\-\*]\s?/, '')}</li>
                                                    ))}
                                            </ul>

                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}


                    {/* REFERENCES (static placeholder like template) */}
                    <section>
                        <h4>REFERENCE</h4>
                        <div className="references">
                            <div>
                                <strong>Reference Name</strong>
                                <p>Company</p>
                                <p>Phone</p>
                                <p>Email</p>
                            </div>
                            <div>
                                <strong>Reference Name</strong>
                                <p>Company</p>
                                <p>Phone</p>
                                <p>Email</p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}