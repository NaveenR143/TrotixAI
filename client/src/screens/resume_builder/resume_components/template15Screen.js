import React, { useState, useEffect } from "react";
import "./template15.css";
import DescriptionRenderer from "./descriptionRenderer";
import PersonalDetailsGrid from "./personalDetailsGrid";
import { getSpacingStyle } from "./spacingHelper";
import { fetchProfilePhoto } from "../../../api/profileAPI";

const DEFAULT_DEMO_PHOTO = "";
const DEFAULT_AVATAR_SVG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'><rect width='200' height='200' fill='%23cbd5e1'/><path d='M100 45a32 32 0 1 0 0 64 32 32 0 0 0 0-64zm0 80c-38 0-68 20-68 48v7h136v-7c0-28-30-48-68-48z' fill='%23475569'/></svg>";

export default function Template15({ data }) {
    if (!data) return null;

    // Mapping from Redux state structure
    const { personalDetails, education, experience, skills, languages, projects, references, spacingConfig } = data;
    const user = personalDetails || {};
    const userPhoto = user.avatarUrl || user.photo || user.picture || user.avatar_url;
    const showPhotoContainer = user.showPhoto !== false;
    const rawPhotoUrl = showPhotoContainer ? (userPhoto || DEFAULT_DEMO_PHOTO) : null;

    const isSecureBlobUrl = rawPhotoUrl && typeof rawPhotoUrl === "string" && rawPhotoUrl.includes("blob.core.windows.net");
    const [photoUrl, setPhotoUrl] = useState(rawPhotoUrl && !isSecureBlobUrl && (rawPhotoUrl.startsWith("http") || rawPhotoUrl.startsWith("data:") || rawPhotoUrl.startsWith("blob:")) ? rawPhotoUrl : DEFAULT_DEMO_PHOTO);

    useEffect(() => {
        let objectUrl = null;
        let isMounted = true;

        if (!rawPhotoUrl) {
            setPhotoUrl(null);
            return;
        }

        if (
            (rawPhotoUrl.startsWith("data:") ||
                rawPhotoUrl.startsWith("blob:") ||
                rawPhotoUrl.startsWith("http")) &&
            !isSecureBlobUrl
        ) {
            setPhotoUrl(rawPhotoUrl);
            return;
        }

        fetchProfilePhoto(rawPhotoUrl)
            .then((result) => {
                if (isMounted && !result.error && result.data) {
                    objectUrl = URL.createObjectURL(result.data);
                    setPhotoUrl(objectUrl);
                } else if (isMounted) {
                    setPhotoUrl(DEFAULT_DEMO_PHOTO);
                }
            })
            .catch(() => {
                if (isMounted) setPhotoUrl(DEFAULT_DEMO_PHOTO);
            });

        return () => {
            isMounted = false;
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [rawPhotoUrl]);

    const activePhotoSrc = photoUrl || DEFAULT_DEMO_PHOTO;

    return (
        <div className="t15-resume-container">
            <div className="t15-resume">
                {/* HEADER */}
                <header className={`t15-header ${showPhotoContainer ? 'has-photo' : 'no-photo'}`} style={getSpacingStyle(spacingConfig, 'header')}>
                    <div className="t15-header-inner">
                        {showPhotoContainer && (
                            <div className="t15-photo-wrapper">
                                <img
                                    src={activePhotoSrc}
                                    alt={user.fullName || "Profile Photo"}
                                    className="t15-profile-photo"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = DEFAULT_AVATAR_SVG;
                                    }}
                                />
                            </div>
                        )}
                        <div className="t15-header-details">
                            <h1>{user.fullName || "Your Name"}</h1>
                            <div className="t15-job-title">{user.headline}</div>
                            <div className="t15-contact-info">
                                {user.phone && <span>{user.phone}</span>}
                                {user.phone && user.email && <span>|</span>}
                                {user.email && <span>{user.email}</span>}
                                {(user.email || user.phone) && user.website && <span>|</span>}
                                {user.website && <span>{user.website}</span>}
                                {(user.website || user.email || user.phone) && user.location && <span>|</span>}
                                {user.location && <span>{user.location}</span>}
                            </div>
                        </div>
                    </div>
                </header>

                {/* SUMMARY */}
                {user.summary && (
                    <div className="t15-section" style={getSpacingStyle(spacingConfig, 'summary')}>
                        <div className="t15-section-title">Professional Summary</div>
                        <p className="t15-summary-text">{user.summary}</p>
                    </div>
                )}

                {/* SKILLS */}
                {skills && skills.length > 0 && (
                    <div className="t15-section" style={getSpacingStyle(spacingConfig, 'skills')}>
                        <div className="t15-section-title">Core Competencies</div>
                        <div className="t15-skills-list">
                            {skills.map((skill, i) => (
                                <div key={i} className="t15-skill-category">
                                    • {skill}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* EXPERIENCE */}
                {experience && experience.length > 0 && (
                    <div className="t15-section" style={getSpacingStyle(spacingConfig, 'experience')}>
                        <div className="t15-section-title">Professional Experience</div>
                        {experience.map((exp, i) => (
                            <div key={i} className="t15-exp-item">
                                <div className="t15-exp-header">
                                    <div className="t15-exp-role">{exp.role}</div>
                                    <div className="t15-exp-date">
                                        {exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}
                                    </div>
                                </div>
                                <div className="t15-exp-company">{exp.company}</div>
                                <DescriptionRenderer description={exp.description} className="t15-exp-details" />
                            </div>
                        ))}
                    </div>
                )}

                {/* PROJECTS */}
                {projects && projects.length > 0 && (
                    <div className="t15-section" style={getSpacingStyle(spacingConfig, 'projects')}>
                        <div className="t15-section-title">Key Projects</div>
                        {projects.map((proj, i) => (
                            <div key={i} className="t15-exp-item">
                                <div className="t15-exp-header">
                                    <div className="t15-exp-role">{proj.name}</div>
                                    {proj.year && <div className="t15-exp-date">{proj.year}</div>}
                                </div>
                                {proj.link && (
                                    <div style={{ fontSize: '12.42px', color: '#333', fontStyle: 'italic', marginBottom: '4px' }}>
                                        {proj.link}
                                    </div>
                                )}
                                <DescriptionRenderer description={proj.description} className="t15-exp-details" />
                            </div>
                        ))}
                    </div>
                )}

                {/* EDUCATION */}
                {education && education.length > 0 && (
                    <div className="t15-section" style={getSpacingStyle(spacingConfig, 'education')}>
                        <div className="t15-section-title">Education</div>
                        {education.map((edu, i) => (
                            <div key={i} className="t15-edu-item">
                                <div className="t15-edu-header">
                                    <div className="t15-edu-school">{edu.school || edu.institution}</div>
                                    <div className="t15-edu-date">{edu.year}</div>
                                </div>
                                <div className="t15-edu-degree">{edu.degree}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* LANGUAGES */}
                {languages && languages.length > 0 && (
                    <div className="t15-section" style={getSpacingStyle(spacingConfig, 'languages')}>
                        <div className="t15-section-title">Languages</div>
                        <div className="t15-languages">
                            {languages.map((lang, i) => (
                                <div key={i} className="t15-lang-item">
                                    • {lang}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* REFERENCES */}
                {references && references.length > 0 && (
                    <div className="t15-section" style={getSpacingStyle(spacingConfig, 'references')}>
                        <div className="t15-section-title">References</div>
                        <div className="t15-ref-grid">
                            {references.map((ref, i) => (
                                <div key={i} className="t15-ref-item">
                                    <div className="t15-ref-name">{ref.name}</div>
                                    <div>{ref.designation || ref.role}{ref.company ? ` at ${ref.company}` : ''}</div>
                                    {ref.phone && <div>Phone: {ref.phone}</div>}
                                    {ref.email && <div>Email: {ref.email}</div>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {(user.showPersonalDetails !== false && (user.date_of_birth || user.gender || user.maritalStatus || user.location)) && (
                    <div className="t15-section" style={getSpacingStyle(spacingConfig, 'personalDetails')}>
                        <div className="t15-section-title">Personal Details</div>
                        <PersonalDetailsGrid user={user} />
                    </div>
                )}
            </div>
        </div>
    );
}
