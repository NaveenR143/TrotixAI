import {
  Box,
  Card,
  CardContent,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";

import { useDispatch } from "react-redux";
import shortid from "shortid";

import * as facilitycolors from "../../esrijs/MapProps/facilitycolors";
import axios from "axios";
import Grid from "@mui/material/Grid2";
import { displaySpinner } from "../../redux/spinner/Action";
import baseurl from "../../models/config";

export default function DataCoverageComp(props) {
  const dispatch = useDispatch();
  const theme = useTheme();

  const facilities = [
    { name: "Gas Storage", color: "GasStorageColor", file: "gasstorage" },
    { name: "Gas Plant", color: "GasPlantColor", file: "gasplant" },
    { name: "Liquefaction", color: "LNGColor", file: "liquefaction" },
    { name: "Refinery", color: "RefineryColor", file: "refinery" },
    { name: "Terminal", color: "TerminalColor", file: "terminal" },
    { name: "Pipeline", color: "PipelineAssembliesColor", file: "pipeline" },
    {
      name: "Compressor Station",
      color: "CompressorStationColor",
      file: "compressorstation",
    },
    {
      name: "Pumping Station",
      color: "PumpingStationColor",
      file: "pumpingstation",
    },
    {
      name: "Industrial Plant",
      color: "IndustrialPlantColor",
      file: "industrialplant",
    },
    {
      name: "Power Plant",
      color: "PowerPlantColor",
      file: "powerplant",
    },
  ];

  const [totalcount, setTotalCount] = useState({
    gasstorage: 0,
    gasplant: 0,
    refinery: 0,
    liquefaction: 0,
    terminal: 0,
    pipeline: 0,
    compressorstation: 0,
    pumpingstation: 0,
    industrialplant: 0,
    powerplant: 0,
  });

  const fnFetchDataCoverage = async (event) => {
    try {
      const options = {
        headers: {},
      };

      const response = await axios.post(`${baseurl}fetchtotalcount`, {}, options);
      const { status, count } = response.data[0];

      dispatch(displaySpinner(false));

      if (
        response.data[0] !== undefined &&
        (response.data[0].status === "error" ||
          response.data[0].status === "no records found")
      ) {
      } else {
        if (response.data[0].status === "success") {
          setTotalCount({
            gasstorage: count.gasstoragetotal,
            gasplant: count.gasplanttotal,
            refinery: count.refinerytotal,
            liquefaction: count.liquefactiontotal,
            terminal: count.terminaltotal,
            compressorstation: count.compressorstationtotal,
            pumpingstation: count.pumpingstationtotal,
            powerplant: count.powerplanttotal,
            industrialplant: count.industrialplanttotal,
            pipeline: count.pipelinetotal,
          });
        }
      }
    } catch (error) {
      dispatch(displaySpinner(false));
      console.error(error);

      if (error.response && error.response.status === 500) {
        console.error("Server error occurred. Please try again later.");
      }
    }
  };

  useEffect(() => {
    fnFetchDataCoverage();
  }, []);

  // Helper function to convert hex to rgba
  const hexToRgba = (hex, alpha) => {
    if (!hex) return `rgba(100, 100, 100, ${alpha})`;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <Box
      sx={{
        margin: "auto",
        mt: 4,
        minWidth: "250px",
        maxWidth: "1200px",
      }}
    >
      {totalcount.gasplant > 0 && (
        <>
          <Typography
            variant="h5"
            fontWeight="700"
            sx={{
              mb: 3,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Data Coverage
          </Typography>

          <Grid container spacing={2}>
            {facilities.map((facility, index) => {
              const count = parseInt(totalcount[facility.file]);
              if (count <= 0) return null;

              const facilityColor = facilitycolors[facility.color] || "#6366f1";

              return (
                <Grid item size={{ xs: 12, sm: 6, md: 4 }} key={shortid.generate()}>
                  <Card
                    sx={{
                      position: "relative",
                      overflow: "hidden",
                      background: theme.palette.mode === "dark"
                        ? `linear-gradient(135deg, ${alpha(facilityColor, 0.1)} 0%, ${alpha(facilityColor, 0.05)} 100%)`
                        : `linear-gradient(135deg, ${alpha(facilityColor, 0.08)} 0%, ${alpha(facilityColor, 0.03)} 100%)`,
                      backdropFilter: "blur(10px)",
                      border: `1px solid ${alpha(facilityColor, 0.2)}`,
                      borderRadius: 3,
                      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        transform: "translateY(-8px) scale(1.02)",
                        boxShadow: `0 12px 40px ${hexToRgba(facilityColor, 0.3)}`,
                        border: `1px solid ${alpha(facilityColor, 0.4)}`,
                        "& .count-text": {
                          transform: "scale(1.1)",
                        },
                        "& .color-indicator": {
                          transform: "rotate(360deg) scale(1.2)",
                        },
                      },
                    }}
                  >
                    {/* Decorative gradient overlay */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        width: "150px",
                        height: "150px",
                        background: `radial-gradient(circle, ${hexToRgba(facilityColor, 0.15)} 0%, transparent 70%)`,
                        pointerEvents: "none",
                      }}
                    />

                    <CardContent sx={{ p: 3, position: "relative", zIndex: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mb: 2,
                        }}
                      >
                        <Typography
                          className="count-text"
                          variant="h3"
                          fontWeight="800"
                          sx={{
                            background: `linear-gradient(135deg, ${facilityColor} 0%, ${hexToRgba(facilityColor, 0.7)} 100%)`,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                            transition: "transform 0.3s ease",
                            letterSpacing: "-0.02em",
                          }}
                        >
                          {count.toLocaleString()}
                        </Typography>

                        <Box
                          className="color-indicator"
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: "50%",
                            background: `linear-gradient(135deg, ${facilityColor} 0%, ${hexToRgba(facilityColor, 0.8)} 100%)`,
                            boxShadow: `0 4px 20px ${hexToRgba(facilityColor, 0.4)}`,
                            transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Box
                            sx={{
                              width: 24,
                              height: 24,
                              borderRadius: "50%",
                              backgroundColor: "white",
                              opacity: 0.3,
                            }}
                          />
                        </Box>
                      </Box>

                      <Typography
                        variant="body1"
                        fontWeight="600"
                        sx={{
                          color: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.8)",
                          letterSpacing: "0.01em",
                        }}
                      >
                        {facility.name}
                      </Typography>

                      {/* Progress bar */}
                      <Box
                        sx={{
                          mt: 2,
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: alpha(facilityColor, 0.1),
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={{
                            height: "100%",
                            width: "100%",
                            background: `linear-gradient(90deg, ${facilityColor} 0%, ${hexToRgba(facilityColor, 0.6)} 100%)`,
                            animation: "progressLoad 1.5s ease-out",
                            "@keyframes progressLoad": {
                              from: { width: 0 },
                              to: { width: "100%" },
                            },
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </>
      )}
    </Box>
  );
}
