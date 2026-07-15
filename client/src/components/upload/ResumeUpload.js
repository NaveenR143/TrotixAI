// components/upload/ResumeUpload.js
import React, { useState, useRef, useCallback } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Typography,
  Alert,
  AlertTitle,
  Collapse,
  styled,
  keyframes,
  Chip
} from "@mui/material";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { API_BASE_URL, API_ENDPOINTS } from "../../config/api.config";

// ─── Animations ───────────────────────────────────────────────────────────────
const scanBar = keyframes`
  0% { transform: translateY(0%); }
  50% { transform: translateY(74%); }
  100% { transform: translateY(0%); }
`;

// ─── Constants ────────────────────────────────────────────────────────────────
const ACCEPTED_TYPES = {
  "application/pdf": "PDF",
  "text/csv": "CSV",
  "application/vnd.ms-excel": "CSV",
};
const ACCEPTED_EXTENSIONS = [".pdf", ".csv"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const API_ENDPOINT = `${API_BASE_URL}${API_ENDPOINTS.UPLOAD_RESUME}`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function validateFile(file) {
  if (!file) return "No file selected.";

  // Check for special or invalid characters in filename
  const invalidPattern = /[<>:"/\\|?*\^%#$&;`\x00-\x1F\x7F]/;
  const match = file.name.match(invalidPattern);
  if (match) {
    const char = match[0];
    const isControlChar = char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127;
    const charDesc = isControlChar ? "control/non-printable character" : `"${char}"`;
    return `Filename contains invalid character ${charDesc}. Please rename the file and upload again.`;
  }

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

const STATUS = { IDLE: "idle", UPLOADING: "uploading", SUCCESS: "success", ERROR: "error", MULTIPLE_PHONES: "multiple_phones" };

const StyledDropZone = styled(Box)(({ theme, dragging, disabled }) => ({
  border: `1px dashed ${disabled ? '#CBD5E1' : dragging ? '#2563EB' : '#93C5FD'}`,
  borderRadius: '24px',
  padding: '24px',
  textAlign: "center",
  cursor: disabled ? "not-allowed" : "pointer",
  background: disabled ? '#F1F5F9' : 'linear-gradient(135deg, #EFF6FF 0%, #F5F3FF 100%)',
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  outline: "none",
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '140px',
  '&:hover': {
    borderColor: disabled ? '#CBD5E1' : '#2563EB',
    transform: disabled ? 'none' : 'translateY(-2px)',
    boxShadow: disabled ? 'none' : '0 10px 25px -5px rgba(37, 99, 235, 0.1)',
  },
  opacity: disabled ? 0.65 : 1,
}));

const ScanningOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '2px',
  background: 'linear-gradient(90deg, #2563EB, #7C3AED, #2563EB)',
  animation: `${scanBar} 2.4s ease-in-out infinite`,
  zIndex: 2,
}));

const DropZone = ({ file, onFileChange, disabled, status }) => {
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

  return (
    <StyledDropZone
      dragging={dragging}
      disabled={disabled}
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <input ref={inputRef} type="file" accept={ACCEPTED_EXTENSIONS.join(",")} hidden disabled={disabled} onChange={(e) => processFile(e.target.files?.[0] ?? null)} />

      {status === STATUS.UPLOADING && <ScanningOverlay />}

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', mb: file ? 2 : 0 }}>
        <Box sx={{ textAlign: 'left' }}>
          <Typography sx={{ fontWeight: 600, color: "#0F172A", fontSize: "0.95rem" }}>
            {file ? file.name : "Drag & drop your resume"}
          </Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "#212121", mt: 0.5 }}>
            {file ? `${(file.size / 1024).toFixed(0)} KB` : "PDF & DOCX supported"}
          </Typography>
        </Box>
        <Box sx={{
          width: 48,
          height: 48,
          borderRadius: "16px",
          bgcolor: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          color: '#2563EB'
        }}>
          {file ? <InsertDriveFileIcon /> : <UploadFileIcon />}
        </Box>
      </Box>

      {file && (
        <Box sx={{ width: '100%', mt: 'auto' }}>
          <Box sx={{ bgcolor: 'rgba(255, 255, 255, 0.75)', p: 1.5, borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 500, color: '#212121' }}>
                {file.name}
              </Typography>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: status === STATUS.UPLOADING ? '#2563EB' : '#10B981' }}>
                {status === STATUS.UPLOADING ? "Scanning" : "Ready"}
              </Typography>
            </Box>
            <Box sx={{ position: 'relative', height: 4, bgcolor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: status === STATUS.UPLOADING ? '70%' : '100%',
                background: 'linear-gradient(90deg, #2563EB, #7C3AED)',
                borderRadius: 4,
                transition: 'width 0.5s ease'
              }} />
            </Box>
          </Box>
        </Box>
      )}
    </StyledDropZone>
  );
};

const ResumeUpload = ({ onSuccess, onError, disabled }) => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(STATUS.IDLE);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [multiplePhones, setMultiplePhones] = useState([]);
  const cancelSourceRef = useRef(null);

  const handleFileChange = useCallback((selectedFile) => {
    setStatus(STATUS.IDLE); setErrorMsg(""); setProgress(0); setMultiplePhones([]);
    const validationError = validateFile(selectedFile);
    if (validationError) {
      setErrorMsg(validationError); setStatus(STATUS.ERROR); setFile(null); return;
    }
    setFile(selectedFile);
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    cancelSourceRef.current = axios.CancelToken.source();
    setStatus(STATUS.UPLOADING); setProgress(0); setErrorMsg(""); setMultiplePhones([]);
    try {
      log.info("Uploading resume", { fileName: file.name, fileSize: file.size, endpoint: API_ENDPOINT });

      const response = await axios.post(API_ENDPOINT, formData, {
        headers: { "Accept": "application/json" },
        cancelToken: cancelSourceRef.current.token,
        onUploadProgress: (p) => setProgress(p.total ? Math.round((p.loaded / p.total) * 100) : 0),
      });

      log.info("Resume upload successful", { status: response.status, data: response.data });
      
      if (response.data && response.data.phone_numbers && response.data.phone_numbers.length > 1) {
        log.warn("Multiple phone numbers detected", response.data);
        setMultiplePhones(response.data.phone_numbers);
        setErrorMsg(response.data.message || "Multiple phone numbers found. Please select your primary number.");
        setStatus(STATUS.MULTIPLE_PHONES);
        if (onError) {
          onError(new Error(response.data.message || "Multiple phone numbers found. Please upload resume with primary phone number."));
        }
        return;
      }

      setStatus(STATUS.SUCCESS);
      setProgress(100);
      if (onSuccess) onSuccess(response.data);
    } catch (err) {
      if (axios.isCancel(err)) {
        log.warn("Upload cancelled");
        return;
      }
      const msg = err.response?.data?.message || err.message || "Upload failed";
      log.error("Resume upload failed", { status: err.response?.status, message: msg, error: err });
      setErrorMsg(msg);
      setStatus(STATUS.ERROR);
      if (onError) onError(new Error(msg));
    }
  };

  const handleReset = () => {
    if (cancelSourceRef.current) cancelSourceRef.current.cancel();
    setFile(null); setStatus(STATUS.IDLE); setProgress(0); setErrorMsg(""); setMultiplePhones([]);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <DropZone file={file} onFileChange={handleFileChange} disabled={disabled || status === STATUS.UPLOADING} status={status} />

      <Collapse in={status === STATUS.ERROR}>
        <Alert severity="error" onClose={handleReset} sx={{ borderRadius: '16px', border: '1px solid #FECACA' }}>
          <AlertTitle sx={{ fontWeight: 600 }}>Upload Failed</AlertTitle>
          {errorMsg}
        </Alert>
      </Collapse>

      <Collapse in={status === STATUS.MULTIPLE_PHONES}>
        <Alert
          severity="warning"
          onClose={handleReset}
          sx={{
            borderRadius: '16px',
            border: '1px solid #FDE047',
            bgcolor: '#FEFCE8',
            color: '#854D0E',
            '& .MuiAlert-icon': {
              color: '#CA8A04'
            }
          }}
        >
          <AlertTitle sx={{ fontWeight: 600, color: '#854D0E' }}>Multiple Phone Numbers Found</AlertTitle>
          <Typography variant="body2" sx={{ mb: 1.5 }}>
            We detected multiple phone numbers in your resume:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            {multiplePhones.map((phone) => (
              <Chip
                key={phone}
                label={phone}
                size="small"
                sx={{
                  bgcolor: '#FEF08A',
                  color: '#854D0E',
                  fontWeight: 600,
                  border: '1px solid #FDE047'
                }}
              />
            ))}
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Please upload a resume containing only your primary phone number.
          </Typography>
        </Alert>
      </Collapse>

      <Collapse in={status === STATUS.SUCCESS}>
        <Alert severity="success" sx={{ borderRadius: '16px', border: '1px solid #A7F3D0' }}>
          <AlertTitle sx={{ fontWeight: 600 }}>Resume Parsed!</AlertTitle>
          Your resume was analyzed successfully.
        </Alert>
      </Collapse>

      {status !== STATUS.SUCCESS && (
        <Button
          variant="contained"
          size="large"
          fullWidth
          disabled={disabled || !file || status === STATUS.UPLOADING || status === STATUS.MULTIPLE_PHONES}
          onClick={handleUpload}
          endIcon={<AutoAwesomeIcon />}
          sx={{
            py: 1.8,
            borderRadius: '16px',
            background: 'linear-gradient(90deg, #2563EB, #7C3AED)',
            color: "white",
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '1rem',
            "&:hover": {
              background: 'linear-gradient(90deg, #1D4ED8, #6D28D9)',
              transform: "translateY(-2px)",
              boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)'
            },
            "&.Mui-disabled": {
              background: "#E2E8F0",
              color: "#94A3B8"
            },
            boxShadow: "0 4px 14px rgba(37, 99, 235, 0.2)"
          }}
        >
          {status === STATUS.UPLOADING ? "Analyzing Resume..." : "Start AI Job Matching"}
        </Button>
      )}

      {(status === STATUS.SUCCESS || status === STATUS.ERROR || status === STATUS.MULTIPLE_PHONES) && (
        <Button variant="text" size="small" onClick={handleReset} sx={{ alignSelf: "center", color: "#212121", fontWeight: 500 }}>
          Upload another file
        </Button>
      )}
    </Box>
  );
};

export default ResumeUpload;
