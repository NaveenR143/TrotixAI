import React, { useMemo, useRef } from "react";
import ReactECharts from "echarts-for-react";
import {
  Button,
  Grid,
  Stack,
  Typography,
  Paper,
  Box,
  useTheme,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Timeline as TimelineIcon,
} from "@mui/icons-material";

/**
 * Premium Flow Points History Chart component.
 * Features modern UX, responsive design, and rich interactivity.
 */
export const FlowPointsHistoryChart = ({ rawData }) => {
  const echartsRef = useRef(null);
  const theme = useTheme();

  // Modern professional color palette
  const colors = [
    "#3f51b5", "#f50057", "#00c853", "#ff9100", "#00b0ff",
    "#aa00ff", "#009688", "#795548", "#607d8b", "#c1ae04ff"
  ];

  // Prepare chart options
  const options = useMemo(() => {
    if (!rawData || rawData.length === 0) return {};

    // Get all unique dates for x-axis
    const uniqueDates = [...new Set(rawData.map((d) => d.EffectiveDate))].sort(
      (a, b) => new Date(a) - new Date(b)
    );

    // Group data by LocName + FlowInd
    const seriesMap = {};
    rawData.forEach((d) => {
      const keyBase = `${d.LocName}-${d.FlowInd}`;
      const schedKey = `${keyBase} (Sched)`;
      const capKey = `${keyBase} (Cap)`;

      // Scheduled Quantity Series
      if (!seriesMap[schedKey]) {
        seriesMap[schedKey] = {
          name: schedKey,
          type: "line",
          smooth: true,
          showSymbol: false,
          areaStyle: {
            opacity: 0.1
          },
          data: Array(uniqueDates.length).fill(null),
        };
      }

      // Available Capacity Series
      if (!seriesMap[capKey]) {
        seriesMap[capKey] = {
          name: capKey,
          type: "line",
          smooth: true,
          showSymbol: false,
          lineStyle: { type: "dashed", width: 1 },
          data: Array(uniqueDates.length).fill(null),
        };
      }

      const dateIndex = uniqueDates.indexOf(d.EffectiveDate);
      seriesMap[schedKey].data[dateIndex] = d.TotalScheduledQuantity;
      seriesMap[capKey].data[dateIndex] = d.OperationallyAvailableCapacity;
    });

    const seriesData = Object.values(seriesMap);

    return {
      color: colors,
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderWidth: 0,
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        textStyle: {
          color: "#333",
          fontFamily: theme.typography.fontFamily,
          fontSize: 12
        },
        padding: 12,
        formatter: (params) => {
          if (!params || params.length === 0) return "";
          let html = `<div style="font-weight: 600; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px;">${params[0].axisValue}</div>`;
          params.forEach(param => {
            const val = (param.value !== null && param.value !== undefined)
              ? Number(param.value).toLocaleString()
              : "N/A";
            html += `<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; min-width: 180px;">
              <span style="display: flex; align-items: center;">
                <span style="width: 8px; height: 8px; border-radius: 50%; background-color: ${param.color}; display: inline-block; margin-right: 8px;"></span>
                ${param.seriesName}
              </span>
              <span style="font-weight: 700; margin-left: 12px;">${val}</span>
            </div>`;
          });
          return html;
        }
      },
      legend: {
        type: 'scroll',
        top: 10,
        left: 'center',
        padding: [10, 20],
        itemGap: 15,
        textStyle: {
          fontSize: 11,
          color: theme.palette.text.secondary
        },
        pageIconColor: theme.palette.primary.main,
        pageTextStyle: {
          color: theme.palette.text.primary
        }
      },
      grid: {
        top: 80,
        bottom: 70,
        left: 50,
        right: 30,
        containLabel: true
      },
      toolbox: {
        show: true,
        feature: {
          dataZoom: { yAxisIndex: "none" },
          dataView: { readOnly: false, title: "Data View", lang: ["Data View", "Close", "Refresh"] },
          magicType: { type: ["line", "bar"], title: { line: "Line", bar: "Bar" } },
          restore: { title: "Reset" },
          saveAsImage: { title: "Export" },
        },
        right: 10,
        bottom: 5
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: uniqueDates.map(d => new Date(d).toLocaleDateString()),
        axisLine: { lineStyle: { color: theme.palette.divider } },
        axisLabel: { color: theme.palette.text.secondary, fontSize: 10 }
      },
      yAxis: {
        type: "value",
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { type: "dashed", color: theme.palette.divider } },
        axisLabel: { color: theme.palette.text.secondary, fontSize: 10 }
      },
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 100
        },
        {
          start: 0,
          end: 100,
          bottom: 45,
          height: 15,
          handleIcon: 'path://M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
          handleSize: '120%',
          handleStyle: {
            color: '#fff',
            shadowBlur: 3,
            shadowColor: 'rgba(0, 0, 0, 0.6)',
            shadowOffsetX: 2,
            shadowOffsetY: 2
          },
          textStyle: { color: theme.palette.text.secondary, fontSize: 10 },
          borderColor: 'transparent',
          backgroundColor: 'rgba(0,0,0,0.02)',
          fillerColor: 'rgba(18, 116, 255, 0.1)'
        }
      ],
      series: seriesData,
    };
  }, [rawData, theme]);

  const toggleAll = (visible) => {
    const echartsInstance = echartsRef.current.getEchartsInstance();
    const seriesNames = options.series.map(s => s.name);
    const selected = {};
    seriesNames.forEach(name => {
      selected[name] = visible;
    });
    echartsInstance.setOption({
      legend: { selected }
    });
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, #fcfcfc 100%)`,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
        width: '100%',
        minHeight: '75vh',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              bgcolor: theme.palette.primary.light + '20',
              mr: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <TimelineIcon color="primary" />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary, lineHeight: 1.2 }}>
              Facility Daily Flow
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Historical throughput and capacity analysis
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={1}>
          <Tooltip title="Show all series">
            <Button
              variant="text"
              size="small"
              startIcon={<VisibilityIcon fontSize="small" />}
              onClick={() => toggleAll(true)}
              sx={{ borderRadius: 2, textTransform: 'none', px: 1.5 }}
            >
              Show All
            </Button>
          </Tooltip>
          <Tooltip title="Hide all series">
            <Button
              variant="text"
              size="small"
              color="inherit"
              startIcon={<VisibilityOffIcon fontSize="small" />}
              onClick={() => toggleAll(false)}
              sx={{ borderRadius: 2, textTransform: 'none', px: 1.5, opacity: 0.7 }}
            >
              Hide All
            </Button>
          </Tooltip>
        </Stack>
      </Box>

      <Box sx={{ flexGrow: 1, position: 'relative' }}>
        <ReactECharts
          ref={echartsRef}
          option={options}
          notMerge={true}
          lazyUpdate={true}
          style={{ minWidth: "145vh", minHeight: "80vh" }}
        />
      </Box>
    </Paper>
  );
};
