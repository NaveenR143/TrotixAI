// components/upload/ResumeUpload.js
import React, { useState, useRef, useCallback } from "react";
import axios from "axios";
import {
  Box,
  Button,
  LinearProgress,
  Typography,
  Alert,
  AlertTitle,
  Collapse,
  IconButton
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

// ─── Constants ────────────────────────────────────────────────────────────────
const ACCEPTED_TYPES = {
  "application/pdf": "PDF",
  "text/csv": "CSV",
  "application/vnd.ms-excel": "CSV",
};
const ACCEPTED_EXTENSIONS = [".pdf", ".csv"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const API_ENDPOINT = "/api/resume/parse";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function validateFile(file) {
  if (!file) return "No file selected.";
  const ext = "." + file.name.split(".").pop().toLowerCase();
  const mimeOk = Object.keys(ACCEPTED_TYPES).includes(file.type);
  const extOk = ACCEPTED_EXTENSIONS.includes(ext);
  if (!mimeOk && !extOk) {
    return `Unsupported file type "${file.type || ext}". Please upload a PDF or CSV.`;
  }
  if (file.size > MAX_SIZE_BYTES) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    return `File is too large (${mb} MB). Maximum allowed size is 5 MB.`;
  }
  return null;
}

const log = {
  info: (msg, data) => console.info(`[ResumeUpload] ${msg}`, data || ''),
  warn: (msg, data) => console.warn(`[ResumeUpload] ${msg}`, data || ''),
  error: (msg, err) => console.error(`[ResumeUpload] ${msg}`, err || ''),
};

const STATUS = { IDLE: "idle", UPLOADING: "uploading", SUCCESS: "success", ERROR: "error" };

const DropZone = ({ file, onFileChange, disabled }) => {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const processFile = useCallback((rawFile) => {
    if (!rawFile) return;
    log.info("File selected", { name: rawFile.name, type: rawFile.type, size: rawFile.size });
    onFileChange(rawFile);
  }, [onFileChange]);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    processFile(e.dataTransfer.files[0] ?? null);
  };
  const borderColor = dragging ? "#6366f1" : file ? "#10b981" : "#cbd5e1";
  const bgColor = dragging ? "#f5f3ff" : file ? "#f0fdf4" : "#f8fafc";
  return (
    <Box
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      sx={{
        border: `2px dashed ${borderColor}`, borderRadius: 3, p: 4, textAlign: "center",
        cursor: disabled ? "not-allowed" : "pointer", bgcolor: bgColor, transition: "all 0.2s ease",
        outline: "none", "&:hover:not([aria-disabled])": { borderColor: "#6366f1", bgcolor: "#f5f3ff" },
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <input ref={inputRef} type="file" accept={ACCEPTED_EXTENSIONS.join(",")} hidden disabled={disabled} onChange={(e) => processFile(e.target.files?.[0] ?? null)} />
      {file ? (
        <Box>
          <Box sx={{ width: 48, height: 48, borderRadius: "50%", bgcolor: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 1.5 }}>
            <InsertDriveFileIcon sx={{ color: "#16a34a", fontSize: 24 }} />
          </Box>
          <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.9rem" }}>{file.name}</Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "#64748b", mt: 0.5 }}>{(file.size / 1024).toFixed(0)} KB · {disabled ? "Uploading…" : "Click to change"}</Typography>
        </Box>
      ) : (
        <Box>
          <Box sx={{ width: 48, height: 48, borderRadius: "50%", bgcolor: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 1.5 }}>
            <CloudUploadIcon sx={{ color: "#6366f1", fontSize: 24 }} />
          </Box>
          <Typography sx={{ fontWeight: 600, color: "#0f172a", fontSize: "0.9rem" }}>Drop your resume here</Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8", mt: 0.5 }}>PDF or CSV · Max 5 MB</Typography>
        </Box>
      )}
    </Box>
  );
};

const ResumeUpload = ({ onSuccess, onError }) => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(STATUS.IDLE);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const cancelSourceRef = useRef(null);
  const handleFileChange = useCallback((selectedFile) => {
    setStatus(STATUS.IDLE); setErrorMsg(""); setProgress(0);
    const validationError = validateFile(selectedFile);
    if (validationError) {
      setErrorMsg(validationError); setStatus(STATUS.ERROR); setFile(null); return;
    }
    setFile(selectedFile);
  }, []);
  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("resume", file);
    cancelSourceRef.current = axios.CancelToken.source();
    setStatus(STATUS.UPLOADING); setProgress(0); setErrorMsg("");
    try {
      const response = await axios.post(API_ENDPOINT, formData, {
        headers: { "Accept": "application/json" },
        cancelToken: cancelSourceRef.current.token,
        onUploadProgress: (p) => setProgress(p.total ? Math.round((p.loaded / p.total) * 100) : 0),
      });
      setStatus(STATUS.SUCCESS); setProgress(100);
      if (onSuccess) onSuccess(response.data);
    } catch (err) {
      if (axios.isCancel(err)) return;
      const msg = err.response?.data?.message || err.message || "Upload failed";
      setErrorMsg(msg); setStatus(STATUS.ERROR);
      if (onError) onError(new Error(msg));
    }
  };
  const handleReset = () => {
    if (cancelSourceRef.current) cancelSourceRef.current.cancel();
    setFile(null); setStatus(STATUS.IDLE); setProgress(0); setErrorMsg("");
  };
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <DropZone file={file} onFileChange={handleFileChange} disabled={status === STATUS.UPLOADING} />
      <Collapse in={status === STATUS.ERROR}>
        <Alert severity="error" onClose={handleReset} sx={{ fontSize: "0.82rem" }}>
          <AlertTitle sx={{ fontSize: "0.85rem", fontWeight: 700 }}>Upload Failed</AlertTitle>
          {errorMsg}
        </Alert>
      </Collapse>
      <Collapse in={status === STATUS.SUCCESS}>
        <Alert severity="success" sx={{ fontSize: "0.82rem" }}>
          <AlertTitle sx={{ fontSize: "0.85rem", fontWeight: 700 }}>Resume Parsed!</AlertTitle>
          Your resume was analyzed successfully.
        </Alert>
      </Collapse>
      <Collapse in={status === STATUS.UPLOADING || status === STATUS.SUCCESS}>
        <Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
            <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>{status === STATUS.UPLOADING ? "Uploading…" : "Complete"}</Typography>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#0f172a" }}>{progress}%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={progress} sx={{ borderRadius: 8, height: 6, bgcolor: "#e2e8f0", "& .MuiLinearProgress-bar": { background: "linear-gradient(90deg, #6366f1, #8b5cf6)", borderRadius: 8 } }} />
        </Box>
      </Collapse>
      {status !== STATUS.SUCCESS && (
        <Button variant="contained" size="large" fullWidth disabled={!file || status === STATUS.UPLOADING} onClick={handleUpload} endIcon={<AutoAwesomeIcon />}
          sx={{ py: 1.5, background: "black", color: "white", "&:hover": { background: "#333333", transform: "translateY(-1px)" }, "&.Mui-disabled": { background: "#e0e0e0", color: "#9e9e9e" }, boxShadow: "0 4px 14px rgba(0,0,0,0.15)" }}>
          {status === STATUS.UPLOADING ? "Analysing…" : "Analyse with AI"}
        </Button>
      )}
      {(status === STATUS.SUCCESS || status === STATUS.ERROR) && (
        <Button variant="text" size="small" onClick={handleReset} sx={{ alignSelf: "center", color: "#94a3b8", fontSize: "0.78rem" }}>Upload another file</Button>
      )}
    </Box>
  );
};

export default ResumeUpload;
