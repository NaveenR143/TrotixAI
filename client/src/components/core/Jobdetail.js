// client/src/components/JobDetail.js

const JobDetail = ({ job, onBack }) => {
    const initials = (job.company || '??').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

    return (
        <div className="detail-screen">
            <div className="detail-nav">
                <button className="back-btn" onClick={onBack}>←</button>
                <div className="detail-nav-title">{job.title}</div>
                {job.match_score != null && (
                    <div className="match-badge" style={{ marginLeft: 'auto', flexShrink: 0 }}>⚡ {job.match_score}%</div>
                )}
            </div>

            <div className="detail-body">
                <div className="detail-hero fade-up">
                    <div className="detail-company-row">
                        <div className="detail-logo">{initials}</div>
                        <div>
                            <div className="detail-company-name">{job.company}</div>
                            {job.website && (
                                <a href={job.website} target="_blank" rel="noopener noreferrer"
                                    style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none' }}>
                                    {job.website.replace(/https?:\/\//, '')}
                                </a>
                            )}
                        </div>
                    </div>
                    <div className="detail-title">{job.title}</div>
                    <div className="detail-tags">
                        {job.location && <span className="job-tag">📍 {job.location}</span>}
                        {job.type && <span className="job-tag">{job.type}</span>}
                        {job.experience && <span className="job-tag">{job.experience}</span>}
                        {job.department && <span className="job-tag">{job.department}</span>}
                        {job.remote && <span className="job-tag highlight">🌐 Remote</span>}
                    </div>
                </div>

                <div className="detail-stats fade-up-2">
                    {job.salary && <div className="stat-box"><div className="stat-label">Salary</div><div className="stat-value accent">{job.salary}</div></div>}
                    {job.match_score != null && <div className="stat-box"><div className="stat-label">Match Score</div><div className="stat-value accent">{job.match_score}%</div></div>}
                    {job.openings && <div className="stat-box"><div className="stat-label">Openings</div><div className="stat-value">{job.openings}</div></div>}
                    {job.posted && <div className="stat-box"><div className="stat-label">Posted</div><div className="stat-value" style={{ fontSize: 14 }}>{job.posted}</div></div>}
                </div>

                {job.description && (
                    <div className="detail-section fade-up-2">
                        <div className="detail-section-title">About the Role</div>
                        <p>{job.description}</p>
                    </div>
                )}
                {job.responsibilities?.length > 0 && (
                    <div className="detail-section fade-up-2">
                        <div className="detail-section-title">Responsibilities</div>
                        <ul>{job.responsibilities.map((r, i) => <li key={i}>{r}</li>)}</ul>
                    </div>
                )}
                {job.requirements?.length > 0 && (
                    <div className="detail-section fade-up-3">
                        <div className="detail-section-title">Requirements</div>
                        <ul>{job.requirements.map((r, i) => <li key={i}>{r}</li>)}</ul>
                    </div>
                )}
                {job.skills?.length > 0 && (
                    <div className="detail-section fade-up-3">
                        <div className="detail-section-title">Skills</div>
                        <div className="skills-list">
                            {job.skills.map((s) => {
                                const m = (job.matched_skills || []).includes(s);
                                return <span key={s} className={`skill-chip ${m ? 'matched' : ''}`}>{m ? '✓ ' : ''}{s}</span>;
                            })}
                        </div>
                    </div>
                )}
                {job.benefits?.length > 0 && (
                    <div className="detail-section fade-up-3">
                        <div className="detail-section-title">Benefits</div>
                        <ul>{job.benefits.map((b, i) => <li key={i}>{b}</li>)}</ul>
                    </div>
                )}
                {job.about_company && (
                    <div className="detail-section fade-up-3">
                        <div className="detail-section-title">About {job.company}</div>
                        <p>{job.about_company}</p>
                    </div>
                )}
            </div>

            <div className="detail-footer">
                <button className="btn-skip" style={{ flex: 1 }} onClick={onBack}>← Back</button>
                <button className="btn-apply" style={{ flex: 2 }} onClick={() => job.apply_url ? window.open(job.apply_url, '_blank', 'noopener') : alert('No application link available.')}>
                    Apply Now →
                </button>
            </div>
        </div>
    );
};