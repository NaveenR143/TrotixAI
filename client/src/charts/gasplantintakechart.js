import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
} from "@mui/material";
import ReactECharts from "echarts-for-react";
import React, { useEffect, useState } from "react";

export const GasPlantIntakeChart = ({ rawData }) => {
  const [options, setOptions] = useState({});

  const products = {
    "Total Gas Intake": "TotalGasIntakeMCF",
    "Into Gathering System": "GasIntoGatheringSystemMCF",
    "Wet Gas Disposition": "WetGasDispositionMCF",
    "Gas Plant Intake": "GasPlantIntakeMCF",
    "From Other Plant": "GasFromOtherPlantMCF",
    "From Transmission Line": "GasFromTransmissionLineMCF",
    "From Storage": "GasFromStorageMCF",
  };

  const [selectedproduct, setSelectedProduct] = useState("");

  const fnSelectProduct = (event) => {
    setSelectedProduct(event.target.value);
  };

  const fnGenerateChart = () => {
    const uniqueDates = [
      ...new Set(rawData.map((item) => `${item.Month}-${item.Year}`)),
    ];

    // Extract unique locations for series
    const uniqueFacilities = [...new Set(rawData.map((item) => item.GasPlant))];

    // Prepare series data
    const seriesData = uniqueFacilities.map((facility, index) => {
      const data = uniqueDates.map((date) => {
        const [month, year] = date.split("-");

        const entry = rawData.find(
          (item) =>
            item.GasPlant === facility &&
            item.Month === month &&
            String(item.Year) === year
        );

        return entry && entry[selectedproduct] ? entry[selectedproduct] : 0; // Default to 0 if no data for date
      });

      return {
        name: facility,
        type: "line",
        data: data,
        markPoint: {
          data: [
            { type: "max", name: "Max" },
            { type: "min", name: "Min" },
          ],
        },
        markLine: {
          data: [{ type: "average", name: "Avg" }],
        },
        // yAxisIndex: index,
        yAxisIndex: 0,
      };
    });

    const chartoptions = {
      tooltip: {
        trigger: "axis",
      },
      legend: {
        data: uniqueFacilities, // Add legend for each location
        bottom: 0, // Moves the legend to the bottom
      },
      toolbox: {
        show: true,
        feature: {
          dataZoom: {
            yAxisIndex: "none",
          },
          dataView: { readOnly: false },
          magicType: { type: ["line", "bar"] },
          restore: {},
          saveAsImage: {},
        },
      },
      xAxis: {
        type: "category", // Changed type to category
        boundaryGap: false,
        data: uniqueDates, // Set x-axis dates
      },

      yAxis: {
        type: "value",
        position: "left",
        axisLine: {
          lineStyle: {
            color: "#1890FF", // Primary Y-axis color
          },
        },
      },
      series: seriesData, // Add series data
    };

    setOptions(chartoptions);
  };

  useEffect(() => {
    if (selectedproduct !== "") {
      fnGenerateChart();
    }
  }, [selectedproduct]);

  useEffect(() => {
    if (rawData.length > 0) {
      setSelectedProduct("TotalGasIntakeMCF");
    }
  }, [rawData]);

  return (
    <>
      {rawData.length > 0 && selectedproduct !== "" && (
        <Grid
          container
          direction="row"
          sx={{
            justifyContent: "space-evenly",
            alignItems: "center",
          }}
        >
          <Grid size={3} item>
            {selectedproduct !== "" && (
              <>
                <FormControl>
                  <RadioGroup
                    aria-labelledby="gasplantproductsid"
                    defaultValue={selectedproduct}
                    name="GasPlantProducts"
                    onChange={fnSelectProduct}
                    value={selectedproduct}
                  >
                    {Object.keys(products).map((product) => (
                      <FormControlLabel
                        value={products[product]}
                        control={<Radio />}
                        label={product}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              </>
            )}
          </Grid>
          <Grid size={9} item>
            <ReactECharts
              style={{ minWidth: "145vh", minHeight: "70vh" }}
              option={options}
            />
          </Grid>
        </Grid>
      )}
    </>
  );
};
