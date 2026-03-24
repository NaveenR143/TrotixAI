// client/src/components/JobCard.js

const JobCard = ({ job, onNext, onViewDetail, animState }) => {
    const initials = (job.company || '??').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
    const matched = job.matched_skills || [];
    const unmatched = (job.skills || []).filter((s) => !matched.includes(s));

    return (
        <div className={`job-card ${animState}`}>
            <div className="card-header">
                <div className="company-row">
                    <div className="company-logo">{initials}</div>
                    <div className="company-info">
                        <div className="company-name">{job.company}</div>
                    </div>
                    {job.match_score != null && (
                        <div className="match-badge">⚡ {job.match_score}% match</div>
                    )}
                </div>
                <div className="job-title">{job.title}</div>
                <div className="job-tags">
                    {job.location && <span className="job-tag">📍 {job.location}</span>}
                    {job.type && <span className="job-tag">{job.type}</span>}
                    {job.experience && <span className="job-tag">{job.experience}</span>}
                    {job.remote && <span className="job-tag highlight">Remote</span>}
                </div>
            </div>

            <div className="card-body">
                {job.salary && (
                    <div className="card-section">
                        <div className="card-section-label">Compensation</div>
                        <div className="salary-row">
                            <span className="salary-amount">{job.salary}</span>
                            <span className="salary-period">/ year</span>
                        </div>
                    </div>
                )}
                {job.summary && (
                    <div className="card-section">
                        <div className="card-section-label">About the role</div>
                        <p>{job.summary}</p>
                    </div>
                )}
                {(job.skills || []).length > 0 && (
                    <div className="card-section">
                        <div className="card-section-label">Skills · {matched.length}/{(job.skills || []).length} matched</div>
                        <div className="skills-list">
                            {matched.map((s) => <span key={s} className="skill-chip matched">✓ {s}</span>)}
                            {unmatched.map((s) => <span key={s} className="skill-chip">{s}</span>)}
                        </div>
                    </div>
                )}
            </div>

            <div className="card-actions">
                <button className="btn-skip" onClick={onNext}>Skip →</button>
                <button className="btn-detail" onClick={onViewDetail}>Details</button>
                <button className="btn-apply" onClick={onViewDetail}>Apply Now</button>
            </div>
        </div>
    );
};