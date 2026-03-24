// client/src/components/UploadScreen.js

const UploadScreen = ({ onUpload, loading, error }) => {
    const [file, setFile] = React.useState(null);
    const [drag, setDrag] = React.useState(false);
    const [step, setStep] = React.useState(0);

    const steps = [
        'Reading your resume…',
        'Extracting skills & experience…',
        'Matching jobs from database…',
        'Ranking by compatibility…',
    ];

    React.useEffect(() => {
        if (!loading) { setStep(0); return; }
        const iv = setInterval(() => setStep((s) => Math.min(s + 1, steps.length - 1)), 1200);
        return () => clearInterval(iv);
    }, [loading]);

    const handleFile = (f) => {
        if (!f) return;
        const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
        if (!allowed.includes(f.type)) return;
        setFile(f);
    };

    const fmt = (b) => b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(1) + ' MB';

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loader-ring" />
                <div style={{ textAlign: 'center' }}>
                    <h2>Analyzing your resume</h2>
                    <p style={{ marginTop: 4 }}>Finding your best matches</p>
                </div>
                <div className="loading-steps">
                    {steps.map((s, i) => (
                        <div key={i} className={`loading-step ${i < step ? 'done' : i === step ? 'active' : ''}`}>
                            <div className="step-dot" />
                            {i < step ? '✓ ' : ''}{s}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="upload-screen">
            <div className="upload-hero fade-up">
                <h1>Find jobs that<br /><em>match you</em></h1>
                <p>Upload your resume and we'll instantly surface the best opportunities.</p>
            </div>

            {!file ? (
                <div
                    className={`upload-zone fade-up-2 ${drag ? 'drag-over' : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                    onDragLeave={() => setDrag(false)}
                    onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
                >
                    <input type="file" accept=".pdf,.docx,.txt" onChange={(e) => handleFile(e.target.files[0])} />
                    <div className="upload-icon">📄</div>
                    <h3>Drop your resume here</h3>
                    <p>or tap to browse files</p>
                    <div className="file-types">
                        <span className="tag">PDF</span>
                        <span className="tag">DOCX</span>
                        <span className="tag">TXT</span>
                    </div>
                </div>
            ) : (
                <div className="upload-selected fade-up-2">
                    <span className="file-icon">📄</span>
                    <div className="file-info">
                        <div className="file-name">{file.name}</div>
                        <div className="file-size">{fmt(file.size)}</div>
                    </div>
                    <button onClick={() => setFile(null)} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: 18 }}>✕</button>
                </div>
            )}

            {error && <div className="error-banner fade-up">⚠ {error}</div>}

            <button className="btn-primary fade-up-3" disabled={!file} onClick={() => onUpload(file)}>
                {file ? 'Find My Jobs →' : 'Select a resume to continue'}
            </button>
        </div>
    );
};