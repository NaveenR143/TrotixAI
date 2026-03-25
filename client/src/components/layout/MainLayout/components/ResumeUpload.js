// components/ResumeUpload.js
//
// A self-contained, production-ready resume file upload component.
// Supports PDF and CSV; drag-and-drop; upload progress; rich error handling;
// structured console logging; and a premium MUI-based UI.
//
// Usage:
//   <ResumeUpload onSuccess={(parsedData) => handleResult(parsedData)} />
//
// Props:
//   onSuccess  - called with the parsed API response body on 2xx
//   onError    - (optional) called with an Error object on any failure

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
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

// ─── Constants ────────────────────────────────────────────────────────────────

/** Accepted MIME types mapped to human-readable names. */
const ACCEPTED_TYPES = {
  "application/pdf": "PDF",
  "text/csv": "CSV",
  // Some systems report CSV without a standard MIME type:
  "application/vnd.ms-excel": "CSV",
};

/** Accepted file extensions (used for input[accept] and fallback validation). */
const ACCEPTED_EXTENSIONS = [".pdf", ".csv"];

/** Maximum allowed file size in bytes (5 MB). */
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

/** Backend endpoint for resume parsing. */
const API_ENDPOINT = "/api/resume/parse";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Validates a File object against allowed types and size limits.
 * Returns null on success, or a human-readable error string on failure.
 */
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

/** Structured logger — prefixes every message with [ResumeUpload] for easy filtering. */
const log = {
  info: (msg, data) =>
    data
      ? console.info(`[ResumeUpload] ${msg}`, data)
      : console.info(`[ResumeUpload] ${msg}`),
  warn: (msg, data) =>
    data
      ? console.warn(`[ResumeUpload] ${msg}`, data)
      : console.warn(`[ResumeUpload] ${msg}`),
  error: (msg, err) =>
    err
      ? console.error(`[ResumeUpload] ${msg}`, err)
      : console.error(`[ResumeUpload] ${msg}`),
};

// ─── Upload status enum ───────────────────────────────────────────────────────

const STATUS = {
  IDLE: "idle",
  UPLOADING: "uploading",
  SUCCESS: "success",
  ERROR: "error",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

/**
 * DropZone — clickable / draggable area that triggers the hidden file input.
 */
const DropZone = ({ file, onFileChange, disabled }) => {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  /** Handles both drag-and-drop and file-picker selections. */
  const processFile = useCallback(
    (rawFile) => {
      if (!rawFile) return;

      log.info("File selected", {
        name: rawFile.name,
        type: rawFile.type,
        size: rawFile.size,
        lastModified: new Date(rawFile.lastModified).toISOString(),
      });

      onFileChange(rawFile);
    },
    [onFileChange]
  );

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    processFile(e.dataTransfer.files[0] ?? null);
  };

  const borderColor = dragging
    ? "#6366f1"
    : file
    ? "#10b981"
    : "#cbd5e1";

  const bgColor = dragging
    ? "#f5f3ff"
    : file
    ? "#f0fdf4"
    : "#f8fafc";

  return (
    <Box
      role="button"
      tabIndex={0}
      aria-label="Upload resume — click or drag a file here"
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => e.key === "Enter" && !disabled && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      sx={{
        border: `2px dashed ${borderColor}`,
        borderRadius: 3,
        p: 4,
        textAlign: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        bgcolor: bgColor,
        transition: "all 0.2s ease",
        outline: "none",
        "&:hover:not([aria-disabled])": {
          borderColor: "#6366f1",
          bgcolor: "#f5f3ff",
        },
        "&:focus-visible": {
          boxShadow: "0 0 0 3px rgba(99,102,241,0.3)",
        },
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {/* Hidden native file input */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS.join(",")}
        hidden
        disabled={disabled}
        onChange={(e) => processFile(e.target.files?.[0] ?? null)}
      />

      {file ? (
        // ── File selected state ──────────────────────────────────────────────
        <Box>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              bgcolor: "#dcfce7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 1.5,
            }}
          >
            <InsertDriveFileIcon sx={{ color: "#16a34a", fontSize: 24 }} />
          </Box>
          <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.9rem" }}>
            {file.name}
          </Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "#64748b", mt: 0.5 }}>
            {(file.size / 1024).toFixed(0)} KB · {disabled ? "Uploading…" : "Click to change"}
          </Typography>
        </Box>
      ) : (
        // ── Empty / idle state ───────────────────────────────────────────────
        <Box>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              bgcolor: "#ede9fe",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 1.5,
            }}
          >
            <CloudUploadIcon sx={{ color: "#6366f1", fontSize: 24 }} />
          </Box>
          <Typography sx={{ fontWeight: 600, color: "#0f172a", fontSize: "0.9rem" }}>
            Drop your resume here
          </Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8", mt: 0.5 }}>
            PDF or CSV · Max 5 MB
          </Typography>
        </Box>
      )}
    </Box>
  );
};

// ─── Main ResumeUpload component ──────────────────────────────────────────────

/**
 * ResumeUpload
 *
 * Handles the complete file-upload lifecycle:
 *   1. File selection / drag-and-drop via DropZone
 *   2. Client-side validation (type + size)
 *   3. Multipart POST to /api/resume/parse via Axios with progress tracking
 *   4. Success / error feedback
 *   5. Structured console logging throughout
 *
 * @param {{ onSuccess: (data: any) => void, onError?: (err: Error) => void }} props
 */
const ResumeUpload = ({ onSuccess, onError }) => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(STATUS.IDLE);
  const [progress, setProgress] = useState(0);   // 0–100
  const [errorMsg, setErrorMsg] = useState("");
  const [responseData, setResponseData] = useState(null);

  // CancelToken source — lets us abort an in-flight request if needed
  const cancelSourceRef = useRef(null);

  // ── File selection handler ────────────────────────────────────────────────

  const handleFileChange = useCallback((selectedFile) => {
    // Reset any previous result / error when user picks a new file
    setStatus(STATUS.IDLE);
    setErrorMsg("");
    setResponseData(null);
    setProgress(0);

    const validationError = validateFile(selectedFile);
    if (validationError) {
      log.warn("File validation failed", { reason: validationError, file: selectedFile?.name });
      setErrorMsg(validationError);
      setStatus(STATUS.ERROR);
      setFile(null);
      return;
    }

    setFile(selectedFile);
  }, []);

  // ── Upload handler ────────────────────────────────────────────────────────

  const handleUpload = async () => {
    if (!file) return;

    // Final safety check before sending
    const validationError = validateFile(file);
    if (validationError) {
      setErrorMsg(validationError);
      setStatus(STATUS.ERROR);
      return;
    }

    // Build multipart/form-data payload
    const formData = new FormData();
    formData.append("resume", file);

    // Create a fresh cancel token for this request
    cancelSourceRef.current = axios.CancelToken.source();

    setStatus(STATUS.UPLOADING);
    setProgress(0);
    setErrorMsg("");

    log.info("Uploading file", {
      endpoint: API_ENDPOINT,
      fileName: file.name,
      fileType: file.type,
      fileSizeKB: (file.size / 1024).toFixed(1),
      timestamp: new Date().toISOString(),
    });

    try {
      const response = await axios.post(API_ENDPOINT, formData, {
        headers: {
          // Axios sets Content-Type to multipart/form-data with boundary automatically
          // when FormData is passed — do NOT set it manually.
          "Accept": "application/json",
        },
        cancelToken: cancelSourceRef.current.token,
        onUploadProgress: (progressEvent) => {
          const pct = progressEvent.total
            ? Math.round((progressEvent.loaded / progressEvent.total) * 100)
            : 0;
          setProgress(pct);
          log.info(`Upload progress: ${pct}%`);
        },
      });

      log.info("Upload successful", {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
      });

      setStatus(STATUS.SUCCESS);
      setProgress(100);
      setResponseData(response.data);

      // Propagate parsed data to parent
      if (typeof onSuccess === "function") {
        onSuccess(response.data);
      }
    } catch (err) {
      if (axios.isCancel(err)) {
        // User (or code) cancelled the request — not truly an error
        log.warn("Upload cancelled by client");
        setStatus(STATUS.IDLE);
        setProgress(0);
        return;
      }

      // ── Determine a human-readable message ─────────────────────────────
      let message = "Something went wrong. Please try again.";

      if (err.response) {
        // Server responded with a non-2xx status
        const { status: httpStatus, data } = err.response;
        message =
          data?.message ||
          data?.error ||
          `Server error (${httpStatus}). Please try again later.`;

        log.error(`Server error ${httpStatus}`, {
          status: httpStatus,
          data,
        });
      } else if (err.request) {
        // Request was sent but no response received
        message = "Network error — no response from the server. Check your connection.";
        log.error("Network error — no response received", err.request);
      } else {
        // Axios config / setup error
        message = err.message || message;
        log.error("Request setup error", err);
      }

      setErrorMsg(message);
      setStatus(STATUS.ERROR);

      if (typeof onError === "function") {
        onError(new Error(message));
      }
    }
  };

  // ── Reset ─────────────────────────────────────────────────────────────────

  const handleReset = () => {
    // If uploading, cancel the in-flight request first
    if (cancelSourceRef.current) {
      cancelSourceRef.current.cancel("User reset the upload.");
    }
    setFile(null);
    setStatus(STATUS.IDLE);
    setProgress(0);
    setErrorMsg("");
    setResponseData(null);
    log.info("Upload state reset by user");
  };

  // ── Derived state ─────────────────────────────────────────────────────────

  const isUploading = status === STATUS.UPLOADING;
  const isSuccess = status === STATUS.SUCCESS;
  const isError = status === STATUS.ERROR;
  const canUpload = Boolean(file) && !isUploading && !isSuccess;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

      {/* ── Drop zone ──────────────────────────────────────────────────── */}
      <DropZone
        file={file}
        onFileChange={handleFileChange}
        disabled={isUploading}
      />

      {/* ── Validation / server error alert ───────────────────────────── */}
      <Collapse in={isError}>
        <Alert
          severity="error"
          icon={<ErrorOutlineIcon fontSize="inherit" />}
          onClose={handleReset}
          sx={{ fontSize: "0.82rem" }}
        >
          <AlertTitle sx={{ fontSize: "0.85rem", fontWeight: 700 }}>Upload Failed</AlertTitle>
          {errorMsg}
        </Alert>
      </Collapse>

      {/* ── Success alert ─────────────────────────────────────────────── */}
      <Collapse in={isSuccess}>
        <Alert
          severity="success"
          icon={<CheckCircleOutlineIcon fontSize="inherit" />}
          sx={{ fontSize: "0.82rem" }}
        >
          <AlertTitle sx={{ fontSize: "0.85rem", fontWeight: 700 }}>Resume Parsed!</AlertTitle>
          Your resume was uploaded and analysed successfully.
        </Alert>
      </Collapse>

      {/* ── Upload progress bar ────────────────────────────────────────── */}
      <Collapse in={isUploading || isSuccess}>
        <Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
            <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>
              {isUploading ? "Uploading…" : "Complete"}
            </Typography>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#0f172a" }}>
              {progress}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              borderRadius: 8,
              height: 6,
              bgcolor: "#e2e8f0",
              "& .MuiLinearProgress-bar": {
                background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
                borderRadius: 8,
              },
            }}
          />
        </Box>
      </Collapse>

      {/* ── Primary action button ──────────────────────────────────────── */}
      {!isSuccess && (
        <Button
          variant="contained"
          size="large"
          fullWidth
          disabled={!canUpload}
          onClick={handleUpload}
          endIcon={<AutoAwesomeIcon />}
          sx={{
            py: 1.5,
            fontSize: "0.95rem",
            color: canUpload ? "#fff" : undefined,
            background: canUpload
              ? "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)"
              : undefined,
            boxShadow: canUpload ? "0 4px 14px rgba(99,102,241,0.35)" : undefined,
            transition: "transform 0.15s ease, box-shadow 0.15s ease",
            "&:hover": {
              transform: canUpload ? "translateY(-1px)" : undefined,
              boxShadow: canUpload ? "0 6px 20px rgba(99,102,241,0.4)" : undefined,
            },
            "&.Mui-disabled": {
              color: "#9ca3af",
              background: "#e5e7eb",
              boxShadow: "none",
            },
          }}
        >
          {isUploading ? "Analysing…" : "Analyse with AI"}
        </Button>
      )}

      {/* ── Reset / upload another button (only after success or error) ─ */}
      {(isSuccess || isError) && (
        <Button
          variant="text"
          size="small"
          onClick={handleReset}
          sx={{ alignSelf: "center", color: "#94a3b8", fontSize: "0.78rem" }}
        >
          Upload a different file
        </Button>
      )}

      {/* ── Credits hint ───────────────────────────────────────────────── */}
      {!isSuccess && (
        <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8", textAlign: "center" }}>
          Uses <strong>5 credits</strong> · 100 free on signup
        </Typography>
      )}
    </Box>
  );
};

export default ResumeUpload;
