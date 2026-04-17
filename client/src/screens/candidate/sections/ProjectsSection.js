import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  Link,
  Stack,
} from "@mui/material";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import LinkIcon from "@mui/icons-material/Link";

const ProjectsSection = ({ initialProjects }) => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    setProjects(Array.isArray(initialProjects) ? JSON.parse(JSON.stringify(initialProjects)) : []);
  }, [initialProjects]);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        border: "1px solid #e2e8f0",
        borderRadius: 2,
        bgcolor: "#fff",
        boxShadow: "0 4px 24px rgba(15,23,42,0.06)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FolderOpenIcon sx={{ fontSize: 20, color: "#6366f1" }} />
          <Typography sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
            Projects
          </Typography>
        </Box>
      </Box>

      {(!projects || projects.length === 0) ? (
        <Typography sx={{ fontSize: "0.85rem", color: "#94a3b8", fontStyle: "italic" }}>
          No projects added yet.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {projects.map((project, index) => (
            <Paper
              key={project?.id ?? index}
              variant="outlined"
              sx={{ p: 2.5, bgcolor: "#f8fafc", borderStyle: "dashed" }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                <Typography sx={{ fontWeight: 700, mb: 0.5 }}>
                  {project.title || "Untitled Project"}
                </Typography>
                <Typography sx={{ fontSize: "0.8rem", color: "text.secondary" }}>
                  {project.startDate ? new Date(project.startDate).toLocaleDateString("en-US", { year: "numeric", month: "short" }) : ""}
                  {project.endDate ? ` - ${new Date(project.endDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })}` : project.startDate ? " - Present" : ""}
                </Typography>
              </Box>

              {project.description && (
                <Typography sx={{ fontSize: "0.9rem", color: "text.primary", lineHeight: 1.6, mb: 1 }}>
                  {project.description}
                </Typography>
              )}

              {project.skills && project.skills.length > 0 && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1 }}>
                  {project.skills.map((skill) => (
                    <Chip
                      key={skill}
                      label={skill}
                      size="small"
                      sx={{ bgcolor: "#ede9fe", color: "#4f46e5", fontWeight: 600 }}
                    />
                  ))}
                </Box>
              )}

              {(project.url || project.repoUrl) && (
                <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
                  {project.url && (
                    <Link href={project.url} target="_blank" rel="noopener noreferrer" underline="hover" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <LinkIcon sx={{ fontSize: 16 }} />
                      <Typography sx={{ fontSize: "0.85rem", color: "#2563eb" }}>Live link</Typography>
                    </Link>
                  )}
                  {project.repoUrl && (
                    <Link href={project.repoUrl} target="_blank" rel="noopener noreferrer" underline="hover" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <LinkIcon sx={{ fontSize: 16 }} />
                      <Typography sx={{ fontSize: "0.85rem", color: "#2563eb" }}>Repository</Typography>
                    </Link>
                  )}
                </Stack>
              )}
            </Paper>
          ))}
        </Stack>
      )}
    </Paper>
  );
};

export default ProjectsSection;
