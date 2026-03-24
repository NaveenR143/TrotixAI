import {
  COMPRESSOR_STATION,
  DEHYDRATION_EQUIPMENT,
  FIELD_GATHERING_STATION,
  GAS_OIL_SEPERATION_POINT,
  GAS_PLANT,
  GAS_STORAGE,
  INDUSTRIAL_PLANT,
  INTERCONNECT,
  LDC,
  LIQUEFACTION,
  METERING_STATION_BIDIRECTIONAL,
  METERING_STATION_DELIVERY,
  METERING_STATION_RECEIPT,
  POOLING_POINT,
  POWER_PLANT,
  PUMPING_STATION,
  REGULATORY_STATION,
  RURAL_TAP,
  TANK,
  TEE_JUNCTION,
  TERMINAL,
  TOWN_BORDER_STATION,
} from "./facilitytypes";

// Facility Colors
const cDataCentersColor = "#d68b30ff";
const cGasPlantColor = "#d63031";
const cGasStorageColor = "#ff7d7e";
const cLNGColor = "#930001";
const cRefineryColor = "#74b9ff";
const cTerminalColor = "#5a5a5a";
const cPermitColor = "#000000";
const cWellColor = "#607d8b";
const cCompressorStationColor = "#795548";
const cPumpingStationColor = "#123b4e";
const cIndustrialPlantColor = "#86baab";
const cPowerPlantColor = "#ff63f7";
const cEmissionFacilityColor = "#29a33f";
const cPipelineAssembliesColor = "#f5b910";
const cPipelineAssembliesInterconnectColor = "#00b818";

// Product Colors
const cCrudeColor = "#1d9d00";
const cRefinedProductColor = "#0984e3";
const cChemicalsColor = "#636e72";
const cLNGProductColor = "#ff357d";

// Status Colors
const cActiveColor = "#607d8b";
const cExpiredColor = "#d63031";
const cDeniedColor = "#ff7675";
const cWaitingColor = "#fdcb6e";

// let cNaturalGasColorPipeline = [247, 220, 5, 255];
const cNaturalGasColorPipeline = [255, 53, 125, 255];
const cCrudeOilColorPipeline = [29, 157, 0, 255];
const cRefinedProductsColorPipeline = [9, 132, 227, 255];
const cNGLColorPipeline = [191, 191, 101, 255];
const cLPGColorPipeline = [31, 52, 34, 255];
const cLNGColorPipeline = [147, 0, 1, 255];
const cHydrogenColorPipeline = [26, 213, 212, 255];
const cCarbondioxideColorPipeline = [216, 230, 103, 255];

const cNaturalGasColorGS = [0, 0, 0, 255];
const cCrudeOilColorGS = [12, 64, 0, 255];

export const DataCenterColor = cDataCentersColor;
export const GasPlantColor = cGasPlantColor;
export const GasStorageColor = cGasStorageColor;
export const LNGColor = cLNGColor;
export const RefineryColor = cRefineryColor;
export const TerminalColor = cTerminalColor;
export const PermitColor = cPermitColor;
export const WellColor = cWellColor;
export const CompressorStationColor = cCompressorStationColor;
export const PumpingStationColor = cPumpingStationColor;

export const IndustrialPlantColor = cIndustrialPlantColor;
export const PowerPlantColor = cPowerPlantColor;
export const PipelineAssembliesColor = cPipelineAssembliesColor;
export const PipelineAssembliesInterconnectColor =
  cPipelineAssembliesInterconnectColor;
export const EmissionFacilityColor = cEmissionFacilityColor;

export const CrudeColor = cCrudeColor;
export const RefinedProductColor = cRefinedProductColor;
export const ChemicalsColor = cChemicalsColor;
export const LNGProductColor = cLNGProductColor;

export const ActiveColor = cActiveColor;
export const ExpiredColor = cExpiredColor;
export const DeniedColor = cDeniedColor;
export const WaitingColor = cWaitingColor;

//Gathering System Pipeline Facility Properties
export const GSPipelineFacilitiesProps = [
  {
    // All features with value of "North" will be blue
    value: GAS_PLANT,
    symbol: {
      type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
      size: 12,
      color: cGasPlantColor,
      outline: {
        // autocasts as new SimpleLineSymbol()
        width: 1,
        color: "#000000",
      },
    },
  },
  {
    // All features with value of "North" will be blue
    value: TERMINAL,
    symbol: {
      type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
      size: 12,
      color: cTerminalColor,
      outline: {
        // autocasts as new SimpleLineSymbol()
        width: 1,
        color: "#000000",
      },
    },
  },
  {
    // All features with value of "North" will be blue
    value: "Refinery",
    symbol: {
      type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
      size: 12,
      color: cRefineryColor,
      outline: {
        // autocasts as new SimpleLineSymbol()
        width: 1,
        color: "#000000",
      },
    },
  },
  {
    // All features with value of "North" will be blue
    value: COMPRESSOR_STATION,
    symbol: {
      type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
      size: 12,
      color: cCompressorStationColor,
      outline: {
        // autocasts as new SimpleLineSymbol()
        width: 1,
        color: "#000000",
      },
    },
  },
  {
    // All features with value of "North" will be blue
    value: PUMPING_STATION,
    symbol: {
      type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
      size: 12,
      color: cPumpingStationColor,
      outline: {
        // autocasts as new SimpleLineSymbol()
        width: 1,
        color: "#000000",
      },
    },
  },

  {
    // All features with value of "North" will be blue
    value: INDUSTRIAL_PLANT,
    symbol: {
      type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
      size: 12,
      color: cIndustrialPlantColor,
      outline: {
        // autocasts as new SimpleLineSymbol()
        width: 1,
        color: "#000000",
      },
    },
  },
  {
    // All features with value of "North" will be blue
    value: GAS_STORAGE,
    symbol: {
      type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
      size: 12,
      color: cGasStorageColor,
      outline: {
        // autocasts as new SimpleLineSymbol()
        width: 1,
        color: "#000000",
      },
    },
  },
  {
    // All features with value of "North" will be blue
    value: LIQUEFACTION,
    symbol: {
      type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
      size: 12,
      color: cLNGColor,
      outline: {
        // autocasts as new SimpleLineSymbol()
        width: 1,
        color: "#000000",
      },
    },
  },
  {
    // All features with value of "North" will be blue
    value: REGULATORY_STATION,
    symbol: {
      type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
      size: 12,
      color: cPipelineAssembliesColor,
      outline: {
        // autocasts as new SimpleLineSymbol()
        width: 1,
        color: "#000000",
      },
    },
  },
  {
    // All features with value of "North" will be blue
    value: METERING_STATION_DELIVERY,
    symbol: {
      type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
      size: 12,
      color: cPipelineAssembliesColor,
      outline: {
        // autocasts as new SimpleLineSymbol()
        width: 1,
        color: "#000000",
      },
    },
  },
  {
    // All features with value of "North" will be blue
    value: METERING_STATION_RECEIPT,
    symbol: {
      type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
      size: 12,
      color: cPipelineAssembliesColor,
      outline: {
        // autocasts as new SimpleLineSymbol()
        width: 1,
        color: "#000000",
      },
    },
  },
  {
    // All features with value of "North" will be blue
    value: METERING_STATION_BIDIRECTIONAL,
    symbol: {
      type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
      size: 12,
      color: cPipelineAssembliesColor,
      outline: {
        // autocasts as new SimpleLineSymbol()
        width: 1,
        color: "#000000",
      },
    },
  },
  {
    value: RURAL_TAP,
    symbol: {
      type: "simple-marker",
      size: 12,
      color: cPipelineAssembliesColor,
      outline: {
        width: 1,
        color: "#000000",
      },
    },
  },
  {
    value: FIELD_GATHERING_STATION,
    symbol: {
      type: "simple-marker",
      size: 12,
      color: cPipelineAssembliesColor,
      outline: {
        width: 1,
        color: "#000000",
      },
    },
  },
  {
    value: GAS_OIL_SEPERATION_POINT,
    symbol: {
      type: "simple-marker",
      size: 12,
      color: cPipelineAssembliesColor,
      outline: {
        width: 1,
        color: "#000000",
      },
    },
  },
  {
    value: TEE_JUNCTION,
    symbol: {
      type: "simple-marker",
      size: 12,
      color: cPipelineAssembliesColor,
      outline: {
        width: 1,
        color: "#000000",
      },
    },
  },
  {
    // All features with value of "North" will be blue
    value: DEHYDRATION_EQUIPMENT,
    symbol: {
      type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
      size: 12,
      color: cPipelineAssembliesColor,
      outline: {
        // autocasts as new SimpleLineSymbol()
        width: 1,
        color: "#000000",
      },
    },
  },
  {
    // All features with value of "North" will be blue
    value: POOLING_POINT,
    symbol: {
      type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
      size: 12,
      color: cPipelineAssembliesColor,
      outline: {
        // autocasts as new SimpleLineSymbol()
        width: 1,
        color: "#000000",
      },
    },
  },
  {
    value: TANK,
    symbol: {
      type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
      size: 12,
      color: cPipelineAssembliesColor,
      outline: {
        // autocasts as new SimpleLineSymbol()
        width: 1,
        color: "#000000",
      },
    },
  },
  {
    value: TOWN_BORDER_STATION,
    symbol: {
      type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
      size: 12,
      color: cPipelineAssembliesColor,
      outline: {
        // autocasts as new SimpleLineSymbol()
        width: 1,
        color: "#000000",
      },
    },
  },
  {
    value: LDC,
    symbol: {
      type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
      size: 12,
      color: cPipelineAssembliesColor,
      outline: {
        // autocasts as new SimpleLineSymbol()
        width: 1,
        color: "#000000",
      },
    },
  },
  {
    value: INTERCONNECT,
    symbol: {
      type: "simple-marker",
      style: "x", // autocasts as new SimpleMarkerSymbol()
      size: 12,
      color: cPipelineAssembliesColor,
      outline: {
        // autocasts as new SimpleLineSymbol()
        width: 1.5,
        color: cPipelineAssembliesColor,
      },
    },
  },
  {
    value: INDUSTRIAL_PLANT,
    symbol: {
      type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
      size: 12,
      color: cPipelineAssembliesColor,
      outline: {
        // autocasts as new SimpleLineSymbol()
        width: 1,
        color: "#000000",
      },
    },
  },
  {
    value: POWER_PLANT,
    symbol: {
      type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
      size: 12,
      color: cPowerPlantColor,
      outline: {
        // autocasts as new SimpleLineSymbol()
        width: 1,
        color: "#000000",
      },
    },
  },
];

// Pipeline Facility Properties
export const PipelineFacilitiesProps = [
  {
    // All features with value of "North" will be blue
    value: GAS_PLANT,
    symbol: {
      type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
      size: 7,
      color: cGasPlantColor,
      outline: {
        // autocasts as new SimpleLineSymbol()
        width: 1,
        color: "#000000",
      },
    },
  },
  {
    // All features with value of "North" will be blue
    value: TERMINAL,
    symbol: {
      type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
      size: 7,
      color: cTerminalColor,
      outline: {
        // autocasts as new SimpleLineSymbol()
        width: 1,
        color: "#000000",
      },
    },
  },
  {
    // All features with value of "North" will be blue
    value: "Refinery",
    symbol: {
      type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
      size: 7,
      color: cRefineryColor,
      outline: {
        // autocasts as new SimpleLineSymbol()
        width: 1,
        color: "#000000",
      },
    },
  },
  {
    // All features with value of "North" will be blue
    value: COMPRESSOR_STATION,
    symbol: {
      type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
      size: 7,
      color: cCompressorStationColor,
      outline: {
        // autocasts as new SimpleLineSymbol()
        width: 1,
        color: "#000000",
      },
    },
  },
  {
    // All features with value of "North" will be blue
    value: PUMPING_STATION,
    symbol: {
      type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
      size: 7,
      color: cPumpingStationColor,
      outline: {
        // autocasts as new SimpleLineSymbol()
        width: 1,
        color: "#000000",
      },
    },
  },

  {
    // All features with value of "North" will be blue
    value: INDUSTRIAL_PLANT,
    symbol: {
      type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
      size: 7,
      color: cIndustrialPlantColor,
      outline: {
        // autocasts as new SimpleLineSymbol()
        width: 1,
        color: "#000000",
      },
    },
  },
  {
    // All features with value of "North" will be blue
    value: GAS_STORAGE,
    symbol: {
      type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
      size: 7,
      color: cGasStorageColor,
      outline: {
        // autocasts as new SimpleLineSymbol()
        width: 1,
        color: "#000000",
      },
    },
  },
  {
    // All features with value of "North" will be blue
    value: LIQUEFACTION,
    symbol: {
      type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
      size: 7,
      color: cLNGColor,
      outline: {
        // autocasts as new SimpleLineSymbol()
        width: 1,
        color: "#000000",
      },
    },
  },
  {
    // All features with value of "North" will be blue
    value: REGULATORY_STATION,
    symbol: {
      type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
      size: 7,
      color: cPipelineAssembliesColor,
      outline: {
        // autocasts as new SimpleLineSymbol()
        width: 1,
        color: "#000000",
      },
    },
  },
  {
    // All features with value of "North" will be blue
    value: METERING_STATION_DELIVERY,
    symbol: {
      type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
      size: 7,
      color: cPipelineAssembliesColor,
      outline: {
        // autocasts as new SimpleLineSymbol()
        width: 1,
        color: "#000000",
      },
    },
  },
  {
    // All features with value of "North" will be blue
    value: METERING_STATION_RECEIPT,
    symbol: {
      type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
      size: 7,
      color: cPipelineAssembliesColor,
      outline: {
        // autocasts as new SimpleLineSymbol()
        width: 1,
        color: "#000000",
      },
    },
  },
  {
    // All features with value of "North" will be blue
    value: METERING_STATION_BIDIRECTIONAL,
    symbol: {
      type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
      size: 7,
      color: cPipelineAssembliesColor,
      outline: {
        // autocasts as new SimpleLineSymbol()
        width: 1,
        color: "#000000",
      },
    },
  },
  {
    value: RURAL_TAP,
    symbol: {
      type: "simple-marker",
      size: 7,
      color: cPipelineAssembliesColor,
      outline: {
        width: 1,
        color: "#000000",
      },
    },
  },
  {
    value: FIELD_GATHERING_STATION,
    symbol: {
      type: "simple-marker",
      size: 7,
      color: cPipelineAssembliesColor,
      outline: {
        width: 1,
        color: "#000000",
      },
    },
  },
  {
    value: GAS_OIL_SEPERATION_POINT,
    symbol: {
      type: "simple-marker",
      size: 7,
      color: cPipelineAssembliesColor,
      outline: {
        width: 1,
        color: "#000000",
      },
    },
  },
  {
    value: TEE_JUNCTION,
    symbol: {
      type: "simple-marker",
      size: 7,
      color: cPipelineAssembliesColor,
      outline: {
        width: 1,
        color: "#000000",
      },
    },
  },
  {
    // All features with value of "North" will be blue
    value: DEHYDRATION_EQUIPMENT,
    symbol: {
      type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
      size: 7,
      color: cPipelineAssembliesColor,
      outline: {
        // autocasts as new SimpleLineSymbol()
        width: 1,
        color: "#000000",
      },
    },
  },
  {
    // All features with value of "North" will be blue
    value: POOLING_POINT,
    symbol: {
      type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
      size: 7,
      color: cPipelineAssembliesColor,
      outline: {
        // autocasts as new SimpleLineSymbol()
        width: 1,
        color: "#000000",
      },
    },
  },
  {
    value: TANK,
    symbol: {
      type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
      size: 7,
      color: cPipelineAssembliesColor,
      outline: {
        // autocasts as new SimpleLineSymbol()
        width: 1,
        color: "#000000",
      },
    },
  },
  {
    value: TOWN_BORDER_STATION,
    symbol: {
      type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
      size: 7,
      color: cPipelineAssembliesColor,
      outline: {
        // autocasts as new SimpleLineSymbol()
        width: 1,
        color: "#000000",
      },
    },
  },
  {
    value: LDC,
    symbol: {
      type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
      size: 7,
      color: cPipelineAssembliesColor,
      outline: {
        // autocasts as new SimpleLineSymbol()
        width: 1,
        color: "#000000",
      },
    },
  },
  {
    value: INTERCONNECT,
    symbol: {
      type: "simple-marker",
      style: "x", // autocasts as new SimpleMarkerSymbol()
      size: 7,
      color: cPipelineAssembliesColor,
      outline: {
        // autocasts as new SimpleLineSymbol()
        width: 1.5,
        color: cPipelineAssembliesColor,
      },
    },
  },
  {
    value: INDUSTRIAL_PLANT,
    symbol: {
      type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
      size: 7,
      color: cPipelineAssembliesColor,
      outline: {
        // autocasts as new SimpleLineSymbol()
        width: 1,
        color: "#000000",
      },
    },
  },
  {
    value: POWER_PLANT,
    symbol: {
      type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
      size: 7,
      color: cPowerPlantColor,
      outline: {
        // autocasts as new SimpleLineSymbol()
        width: 1,
        color: "#000000",
      },
    },
  },
];

export const FullPipelineProps = [
  {
    // All features with value of "North" will be blue
    value: "Natural Gas",
    symbol: {
      type: "simple-line",
      color: cNaturalGasColorPipeline,
      width: 1,
    },
  },
  {
    // All features with value of "North" will be blue
    value: "Crude Oil",
    symbol: {
      type: "simple-line",
      color: cCrudeOilColorPipeline,
      width: 1,
    },
  },
  {
    // All features with value of "North" will be blue
    value: "NGL",
    symbol: {
      type: "simple-line",
      color: cNGLColorPipeline,
      width: 1,
    },
  },
  {
    // All features with value of "North" will be blue
    value: "Refined Products",
    symbol: {
      type: "simple-line",
      color: cRefinedProductsColorPipeline,
      width: 1,
    },
  },
  {
    // All features with value of "North" will be blue
    value: "LPG",
    symbol: {
      type: "simple-line",
      color: cLPGColorPipeline,
      width: 1,
    },
  },
  {
    // All features with value of "North" will be blue
    value: "LNG",
    symbol: {
      type: "simple-line",
      color: cLNGColorPipeline,
      width: 1,
    },
  },
  {
    // All features with value of "North" will be blue
    value: "Carbondioxide",
    symbol: {
      type: "simple-line",
      color: cCarbondioxideColorPipeline,
      width: 1,
    },
  },
  {
    // All features with value of "North" will be blue
    value: "Hydrogen",
    symbol: {
      type: "simple-line",
      color: cHydrogenColorPipeline,
      width: 1,
    },
  },
];

export const FullGSProps = [
  {
    // All features with value of "North" will be blue
    value: "Natural Gas",
    symbol: {
      type: "simple-line",
      // style: "short-dash-dot",
      color: cNaturalGasColorGS,
      width: 0.75,
    },
  },
  {
    // All features with value of "North" will be blue
    value: "Crude Oil",
    symbol: {
      type: "simple-line",
      // style: "short-dash-dot",
      color: cCrudeOilColorGS,
      width: 0.75,
    },
  },
];

export const PipeineProps = [
  {
    value: "Uni-Directional, Natural Gas", // when one-way='yes', create CIMSymbol line with arrows
    symbol: {
      type: "cim", // autocasts as CIMSymbol
      data: {
        type: "CIMSymbolReference",
        symbol: {
          type: "CIMLineSymbol",
          symbolLayers: [
            {
              // black 1px line symbol
              type: "CIMSolidStroke",
              enable: true,
              width: 1,
              color: cNaturalGasColorPipeline,
            },
            {
              // arrow symbol
              type: "CIMVectorMarker",
              enable: true,
              size: 4,
              markerPlacement: {
                type: "CIMMarkerPlacementAlongLineSameSize", // places same size markers along the line
                endings: "WithMarkers",
                placementTemplate: [50], // determines space between each arrow
                angleToLine: true, // symbol will maintain its angle to the line when map is rotated
              },
              frame: {
                xmin: -5,
                ymin: -5,
                xmax: 5,
                ymax: 5,
              },
              markerGraphics: [
                {
                  type: "CIMMarkerGraphic",
                  geometry: {
                    rings: [
                      [
                        [-8, -5.47],
                        [-8, 5.6],
                        [1.96, -0.03],
                        [-8, -5.47],
                      ],
                    ],
                  },
                  symbol: {
                    // black fill for the arrow symbol
                    type: "CIMPolygonSymbol",
                    symbolLayers: [
                      {
                        type: "CIMSolidFill",
                        enable: true,
                        color: [0, 0, 0, 255],
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
      },
    },
  },
  {
    value: "Bi-Directional, Natural Gas", // when one-way='yes', create CIMSymbol line with arrows
    symbol: {
      type: "cim", // autocasts as CIMSymbol
      data: {
        type: "CIMSymbolReference",
        symbol: {
          type: "CIMLineSymbol",
          symbolLayers: [
            {
              // black 1px line symbol
              type: "CIMSolidStroke",
              enable: true,
              width: 1,
              color: cNaturalGasColorPipeline,
            },
            {
              // arrow symbol
              type: "CIMVectorMarker",
              enable: true,
              size: 4,
              markerPlacement: {
                type: "CIMMarkerPlacementAlongLineSameSize", // places same size markers along the line
                endings: "WithMarkers",
                placementTemplate: [50], // determines space between each arrow
                angleToLine: true, // symbol will maintain its angle to the line when map is rotated
              },
              frame: {
                xmin: -5,
                ymin: -5,
                xmax: 5,
                ymax: 5,
              },
              markerGraphics: [
                {
                  type: "CIMMarkerGraphic",
                  geometry: {
                    rings: [
                      [
                        [11, 2],
                        [10, 2],
                        [10, 7],
                        [11, 7],
                        [11, 2],
                      ],
                      [
                        [15, 15],
                        [19, 10.5],
                        [15, 6],
                        [15, 9],
                        [6, 9],
                        [6, 6],
                        [2, 10.5],
                        [6, 15],
                        [6, 12],
                        [15, 12],
                        [15, 15],
                      ],
                      [
                        [11, 14],
                        [10, 14],
                        [10, 19],
                        [11, 19],
                        [11, 14],
                      ],
                    ],
                  },
                  symbol: {
                    // black fill for the arrow symbol
                    type: "CIMPolygonSymbol",
                    symbolLayers: [
                      {
                        type: "CIMSolidFill",
                        enable: true,
                        color: [0, 0, 0, 255],
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
      },
    },
  },
  {
    value: "Uni-Directional, Crude Oil", // when one-way='yes', create CIMSymbol line with arrows
    symbol: {
      type: "cim", // autocasts as CIMSymbol
      data: {
        type: "CIMSymbolReference",
        symbol: {
          type: "CIMLineSymbol",
          symbolLayers: [
            {
              // black 1px line symbol
              type: "CIMSolidStroke",
              enable: true,
              width: 1,
              color: cCrudeOilColorPipeline,
            },
            {
              // arrow symbol
              type: "CIMVectorMarker",
              enable: true,
              size: 4,
              markerPlacement: {
                type: "CIMMarkerPlacementAlongLineSameSize", // places same size markers along the line
                endings: "WithMarkers",
                placementTemplate: [50], // determines space between each arrow
                angleToLine: true, // symbol will maintain its angle to the line when map is rotated
              },
              frame: {
                xmin: -5,
                ymin: -5,
                xmax: 5,
                ymax: 5,
              },
              markerGraphics: [
                {
                  type: "CIMMarkerGraphic",
                  geometry: {
                    rings: [
                      [
                        [-8, -5.47],
                        [-8, 5.6],
                        [1.96, -0.03],
                        [-8, -5.47],
                      ],
                    ],
                  },
                  symbol: {
                    // black fill for the arrow symbol
                    type: "CIMPolygonSymbol",
                    symbolLayers: [
                      {
                        type: "CIMSolidFill",
                        enable: true,
                        color: [0, 0, 0, 255],
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
      },
    },
  },
  {
    value: "Bi-Directional, Crude Oil", // when one-way='yes', create CIMSymbol line with arrows
    symbol: {
      type: "cim", // autocasts as CIMSymbol
      data: {
        type: "CIMSymbolReference",
        symbol: {
          type: "CIMLineSymbol",
          symbolLayers: [
            {
              // black 1px line symbol
              type: "CIMSolidStroke",
              enable: true,
              width: 1,
              color: cCrudeOilColorPipeline,
            },
            {
              // arrow symbol
              type: "CIMVectorMarker",
              enable: true,
              size: 4,
              markerPlacement: {
                type: "CIMMarkerPlacementAlongLineSameSize", // places same size markers along the line
                endings: "WithMarkers",
                placementTemplate: [50], // determines space between each arrow
                angleToLine: true, // symbol will maintain its angle to the line when map is rotated
              },
              frame: {
                xmin: -5,
                ymin: -5,
                xmax: 5,
                ymax: 5,
              },
              markerGraphics: [
                {
                  type: "CIMMarkerGraphic",
                  geometry: {
                    rings: [
                      [
                        [11, 2],
                        [10, 2],
                        [10, 7],
                        [11, 7],
                        [11, 2],
                      ],
                      [
                        [15, 15],
                        [19, 10.5],
                        [15, 6],
                        [15, 9],
                        [6, 9],
                        [6, 6],
                        [2, 10.5],
                        [6, 15],
                        [6, 12],
                        [15, 12],
                        [15, 15],
                      ],
                      [
                        [11, 14],
                        [10, 14],
                        [10, 19],
                        [11, 19],
                        [11, 14],
                      ],
                    ],
                  },
                  symbol: {
                    // black fill for the arrow symbol
                    type: "CIMPolygonSymbol",
                    symbolLayers: [
                      {
                        type: "CIMSolidFill",
                        enable: true,
                        color: [0, 0, 0, 255],
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
      },
    },
  },
  {
    value: "Uni-Directional, Refined Products", // when one-way='yes', create CIMSymbol line with arrows
    symbol: {
      type: "cim", // autocasts as CIMSymbol
      data: {
        type: "CIMSymbolReference",
        symbol: {
          type: "CIMLineSymbol",
          symbolLayers: [
            {
              // black 1px line symbol
              type: "CIMSolidStroke",
              enable: true,
              width: 1,
              color: cRefinedProductsColorPipeline,
            },
            {
              // arrow symbol
              type: "CIMVectorMarker",
              enable: true,
              size: 4,
              markerPlacement: {
                type: "CIMMarkerPlacementAlongLineSameSize", // places same size markers along the line
                endings: "WithMarkers",
                placementTemplate: [50], // determines space between each arrow
                angleToLine: true, // symbol will maintain its angle to the line when map is rotated
              },
              frame: {
                xmin: -5,
                ymin: -5,
                xmax: 5,
                ymax: 5,
              },
              markerGraphics: [
                {
                  type: "CIMMarkerGraphic",
                  geometry: {
                    rings: [
                      [
                        [-8, -5.47],
                        [-8, 5.6],
                        [1.96, -0.03],
                        [-8, -5.47],
                      ],
                    ],
                  },
                  symbol: {
                    // black fill for the arrow symbol
                    type: "CIMPolygonSymbol",
                    symbolLayers: [
                      {
                        type: "CIMSolidFill",
                        enable: true,
                        color: [0, 0, 0, 255],
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
      },
    },
  },
  {
    value: "Bi-Directional, Refined Products", // when one-way='yes', create CIMSymbol line with arrows
    symbol: {
      type: "cim", // autocasts as CIMSymbol
      data: {
        type: "CIMSymbolReference",
        symbol: {
          type: "CIMLineSymbol",
          symbolLayers: [
            {
              // black 1px line symbol
              type: "CIMSolidStroke",
              enable: true,
              width: 1,
              color: cRefinedProductsColorPipeline,
            },
            {
              // arrow symbol
              type: "CIMVectorMarker",
              enable: true,
              size: 4,
              markerPlacement: {
                type: "CIMMarkerPlacementAlongLineSameSize", // places same size markers along the line
                endings: "WithMarkers",
                placementTemplate: [50], // determines space between each arrow
                angleToLine: true, // symbol will maintain its angle to the line when map is rotated
              },
              frame: {
                xmin: -5,
                ymin: -5,
                xmax: 5,
                ymax: 5,
              },
              markerGraphics: [
                {
                  type: "CIMMarkerGraphic",
                  geometry: {
                    rings: [
                      [
                        [11, 2],
                        [10, 2],
                        [10, 7],
                        [11, 7],
                        [11, 2],
                      ],
                      [
                        [15, 15],
                        [19, 10.5],
                        [15, 6],
                        [15, 9],
                        [6, 9],
                        [6, 6],
                        [2, 10.5],
                        [6, 15],
                        [6, 12],
                        [15, 12],
                        [15, 15],
                      ],
                      [
                        [11, 14],
                        [10, 14],
                        [10, 19],
                        [11, 19],
                        [11, 14],
                      ],
                    ],
                  },
                  symbol: {
                    // black fill for the arrow symbol
                    type: "CIMPolygonSymbol",
                    symbolLayers: [
                      {
                        type: "CIMSolidFill",
                        enable: true,
                        color: [0, 0, 0, 255],
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
      },
    },
  },
  {
    value: "Uni-Directional, NGL", // when one-way='yes', create CIMSymbol line with arrows
    symbol: {
      type: "cim", // autocasts as CIMSymbol
      data: {
        type: "CIMSymbolReference",
        symbol: {
          type: "CIMLineSymbol",
          symbolLayers: [
            {
              // black 1px line symbol
              type: "CIMSolidStroke",
              enable: true,
              width: 1,
              color: cNGLColorPipeline,
            },
            {
              // arrow symbol
              type: "CIMVectorMarker",
              enable: true,
              size: 4,
              markerPlacement: {
                type: "CIMMarkerPlacementAlongLineSameSize", // places same size markers along the line
                endings: "WithMarkers",
                placementTemplate: [50], // determines space between each arrow
                angleToLine: true, // symbol will maintain its angle to the line when map is rotated
              },
              frame: {
                xmin: -5,
                ymin: -5,
                xmax: 5,
                ymax: 5,
              },
              markerGraphics: [
                {
                  type: "CIMMarkerGraphic",
                  geometry: {
                    rings: [
                      [
                        [-8, -5.47],
                        [-8, 5.6],
                        [1.96, -0.03],
                        [-8, -5.47],
                      ],
                    ],
                  },
                  symbol: {
                    // black fill for the arrow symbol
                    type: "CIMPolygonSymbol",
                    symbolLayers: [
                      {
                        type: "CIMSolidFill",
                        enable: true,
                        color: [0, 0, 0, 255],
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
      },
    },
  },
  {
    value: "Bi-Directional, NGL", // when one-way='yes', create CIMSymbol line with arrows
    symbol: {
      type: "cim", // autocasts as CIMSymbol
      data: {
        type: "CIMSymbolReference",
        symbol: {
          type: "CIMLineSymbol",
          symbolLayers: [
            {
              // black 1px line symbol
              type: "CIMSolidStroke",
              enable: true,
              width: 1,
              color: cNGLColorPipeline,
            },
            {
              // arrow symbol
              type: "CIMVectorMarker",
              enable: true,
              size: 4,
              markerPlacement: {
                type: "CIMMarkerPlacementAlongLineSameSize", // places same size markers along the line
                endings: "WithMarkers",
                placementTemplate: [50], // determines space between each arrow
                angleToLine: true, // symbol will maintain its angle to the line when map is rotated
              },
              frame: {
                xmin: -5,
                ymin: -5,
                xmax: 5,
                ymax: 5,
              },
              markerGraphics: [
                {
                  type: "CIMMarkerGraphic",
                  geometry: {
                    rings: [
                      [
                        [11, 2],
                        [10, 2],
                        [10, 7],
                        [11, 7],
                        [11, 2],
                      ],
                      [
                        [15, 15],
                        [19, 10.5],
                        [15, 6],
                        [15, 9],
                        [6, 9],
                        [6, 6],
                        [2, 10.5],
                        [6, 15],
                        [6, 12],
                        [15, 12],
                        [15, 15],
                      ],
                      [
                        [11, 14],
                        [10, 14],
                        [10, 19],
                        [11, 19],
                        [11, 14],
                      ],
                    ],
                  },
                  symbol: {
                    // black fill for the arrow symbol
                    type: "CIMPolygonSymbol",
                    symbolLayers: [
                      {
                        type: "CIMSolidFill",
                        enable: true,
                        color: [0, 0, 0, 255],
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
      },
    },
  },
  {
    value: "Uni-Directional, LPG", // when one-way='yes', create CIMSymbol line with arrows
    symbol: {
      type: "cim", // autocasts as CIMSymbol
      data: {
        type: "CIMSymbolReference",
        symbol: {
          type: "CIMLineSymbol",
          symbolLayers: [
            {
              // black 1px line symbol
              type: "CIMSolidStroke",
              enable: true,
              width: 1,
              color: cLPGColorPipeline,
            },
            {
              // arrow symbol
              type: "CIMVectorMarker",
              enable: true,
              size: 4,
              markerPlacement: {
                type: "CIMMarkerPlacementAlongLineSameSize", // places same size markers along the line
                endings: "WithMarkers",
                placementTemplate: [50], // determines space between each arrow
                angleToLine: true, // symbol will maintain its angle to the line when map is rotated
              },
              frame: {
                xmin: -5,
                ymin: -5,
                xmax: 5,
                ymax: 5,
              },
              markerGraphics: [
                {
                  type: "CIMMarkerGraphic",
                  geometry: {
                    rings: [
                      [
                        [-8, -5.47],
                        [-8, 5.6],
                        [1.96, -0.03],
                        [-8, -5.47],
                      ],
                    ],
                  },
                  symbol: {
                    // black fill for the arrow symbol
                    type: "CIMPolygonSymbol",
                    symbolLayers: [
                      {
                        type: "CIMSolidFill",
                        enable: true,
                        color: [0, 0, 0, 255],
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
      },
    },
  },
  {
    value: "Bi-Directional, LPG", // when one-way='yes', create CIMSymbol line with arrows
    symbol: {
      type: "cim", // autocasts as CIMSymbol
      data: {
        type: "CIMSymbolReference",
        symbol: {
          type: "CIMLineSymbol",
          symbolLayers: [
            {
              // black 1px line symbol
              type: "CIMSolidStroke",
              enable: true,
              width: 1,
              color: cLPGColorPipeline,
            },
            {
              // arrow symbol
              type: "CIMVectorMarker",
              enable: true,
              size: 4,
              markerPlacement: {
                type: "CIMMarkerPlacementAlongLineSameSize", // places same size markers along the line
                endings: "WithMarkers",
                placementTemplate: [50], // determines space between each arrow
                angleToLine: true, // symbol will maintain its angle to the line when map is rotated
              },
              frame: {
                xmin: -5,
                ymin: -5,
                xmax: 5,
                ymax: 5,
              },
              markerGraphics: [
                {
                  type: "CIMMarkerGraphic",
                  geometry: {
                    rings: [
                      [
                        [11, 2],
                        [10, 2],
                        [10, 7],
                        [11, 7],
                        [11, 2],
                      ],
                      [
                        [15, 15],
                        [19, 10.5],
                        [15, 6],
                        [15, 9],
                        [6, 9],
                        [6, 6],
                        [2, 10.5],
                        [6, 15],
                        [6, 12],
                        [15, 12],
                        [15, 15],
                      ],
                      [
                        [11, 14],
                        [10, 14],
                        [10, 19],
                        [11, 19],
                        [11, 14],
                      ],
                    ],
                  },
                  symbol: {
                    // black fill for the arrow symbol
                    type: "CIMPolygonSymbol",
                    symbolLayers: [
                      {
                        type: "CIMSolidFill",
                        enable: true,
                        color: [0, 0, 0, 255],
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
      },
    },
  },
  {
    value: "Uni-Directional, LNG", // when one-way='yes', create CIMSymbol line with arrows
    symbol: {
      type: "cim", // autocasts as CIMSymbol
      data: {
        type: "CIMSymbolReference",
        symbol: {
          type: "CIMLineSymbol",
          symbolLayers: [
            {
              // black 1px line symbol
              type: "CIMSolidStroke",
              enable: true,
              width: 1,
              color: cLNGColorPipeline,
            },
            {
              // arrow symbol
              type: "CIMVectorMarker",
              enable: true,
              size: 4,
              markerPlacement: {
                type: "CIMMarkerPlacementAlongLineSameSize", // places same size markers along the line
                endings: "WithMarkers",
                placementTemplate: [50], // determines space between each arrow
                angleToLine: true, // symbol will maintain its angle to the line when map is rotated
              },
              frame: {
                xmin: -5,
                ymin: -5,
                xmax: 5,
                ymax: 5,
              },
              markerGraphics: [
                {
                  type: "CIMMarkerGraphic",
                  geometry: {
                    rings: [
                      [
                        [-8, -5.47],
                        [-8, 5.6],
                        [1.96, -0.03],
                        [-8, -5.47],
                      ],
                    ],
                  },
                  symbol: {
                    // black fill for the arrow symbol
                    type: "CIMPolygonSymbol",
                    symbolLayers: [
                      {
                        type: "CIMSolidFill",
                        enable: true,
                        color: [0, 0, 0, 255],
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
      },
    },
  },
  {
    value: "Bi-Directional, LNG", // when one-way='yes', create CIMSymbol line with arrows
    symbol: {
      type: "cim", // autocasts as CIMSymbol
      data: {
        type: "CIMSymbolReference",
        symbol: {
          type: "CIMLineSymbol",
          symbolLayers: [
            {
              // black 1px line symbol
              type: "CIMSolidStroke",
              enable: true,
              width: 1,
              color: cLNGColorPipeline,
            },
            {
              // arrow symbol
              type: "CIMVectorMarker",
              enable: true,
              size: 4,
              markerPlacement: {
                type: "CIMMarkerPlacementAlongLineSameSize", // places same size markers along the line
                endings: "WithMarkers",
                placementTemplate: [50], // determines space between each arrow
                angleToLine: true, // symbol will maintain its angle to the line when map is rotated
              },
              frame: {
                xmin: -5,
                ymin: -5,
                xmax: 5,
                ymax: 5,
              },
              markerGraphics: [
                {
                  type: "CIMMarkerGraphic",
                  geometry: {
                    rings: [
                      [
                        [11, 2],
                        [10, 2],
                        [10, 7],
                        [11, 7],
                        [11, 2],
                      ],
                      [
                        [15, 15],
                        [19, 10.5],
                        [15, 6],
                        [15, 9],
                        [6, 9],
                        [6, 6],
                        [2, 10.5],
                        [6, 15],
                        [6, 12],
                        [15, 12],
                        [15, 15],
                      ],
                      [
                        [11, 14],
                        [10, 14],
                        [10, 19],
                        [11, 19],
                        [11, 14],
                      ],
                    ],
                  },
                  symbol: {
                    // black fill for the arrow symbol
                    type: "CIMPolygonSymbol",
                    symbolLayers: [
                      {
                        type: "CIMSolidFill",
                        enable: true,
                        color: [0, 0, 0, 255],
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
      },
    },
  },
  {
    value: "Uni-Directional, Carbondioxide", // when one-way='yes', create CIMSymbol line with arrows
    symbol: {
      type: "cim", // autocasts as CIMSymbol
      data: {
        type: "CIMSymbolReference",
        symbol: {
          type: "CIMLineSymbol",
          symbolLayers: [
            {
              // black 1px line symbol
              type: "CIMSolidStroke",
              enable: true,
              width: 1,
              color: cCarbondioxideColorPipeline,
            },
            {
              // arrow symbol
              type: "CIMVectorMarker",
              enable: true,
              size: 4,
              markerPlacement: {
                type: "CIMMarkerPlacementAlongLineSameSize", // places same size markers along the line
                endings: "WithMarkers",
                placementTemplate: [50], // determines space between each arrow
                angleToLine: true, // symbol will maintain its angle to the line when map is rotated
              },
              frame: {
                xmin: -5,
                ymin: -5,
                xmax: 5,
                ymax: 5,
              },
              markerGraphics: [
                {
                  type: "CIMMarkerGraphic",
                  geometry: {
                    rings: [
                      [
                        [-8, -5.47],
                        [-8, 5.6],
                        [1.96, -0.03],
                        [-8, -5.47],
                      ],
                    ],
                  },
                  symbol: {
                    // black fill for the arrow symbol
                    type: "CIMPolygonSymbol",
                    symbolLayers: [
                      {
                        type: "CIMSolidFill",
                        enable: true,
                        color: [0, 0, 0, 255],
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
      },
    },
  },
  {
    value: "Bi-Directional, Carbondioxide", // when one-way='yes', create CIMSymbol line with arrows
    symbol: {
      type: "cim", // autocasts as CIMSymbol
      data: {
        type: "CIMSymbolReference",
        symbol: {
          type: "CIMLineSymbol",
          symbolLayers: [
            {
              // black 1px line symbol
              type: "CIMSolidStroke",
              enable: true,
              width: 1,
              color: cCarbondioxideColorPipeline,
            },
            {
              // arrow symbol
              type: "CIMVectorMarker",
              enable: true,
              size: 4,
              markerPlacement: {
                type: "CIMMarkerPlacementAlongLineSameSize", // places same size markers along the line
                endings: "WithMarkers",
                placementTemplate: [50], // determines space between each arrow
                angleToLine: true, // symbol will maintain its angle to the line when map is rotated
              },
              frame: {
                xmin: -5,
                ymin: -5,
                xmax: 5,
                ymax: 5,
              },
              markerGraphics: [
                {
                  type: "CIMMarkerGraphic",
                  geometry: {
                    rings: [
                      [
                        [11, 2],
                        [10, 2],
                        [10, 7],
                        [11, 7],
                        [11, 2],
                      ],
                      [
                        [15, 15],
                        [19, 10.5],
                        [15, 6],
                        [15, 9],
                        [6, 9],
                        [6, 6],
                        [2, 10.5],
                        [6, 15],
                        [6, 12],
                        [15, 12],
                        [15, 15],
                      ],
                      [
                        [11, 14],
                        [10, 14],
                        [10, 19],
                        [11, 19],
                        [11, 14],
                      ],
                    ],
                  },
                  symbol: {
                    // black fill for the arrow symbol
                    type: "CIMPolygonSymbol",
                    symbolLayers: [
                      {
                        type: "CIMSolidFill",
                        enable: true,
                        color: [0, 0, 0, 255],
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
      },
    },
  },
  {
    value: "Uni-Directional, Hydrogen", // when one-way='yes', create CIMSymbol line with arrows
    symbol: {
      type: "cim", // autocasts as CIMSymbol
      data: {
        type: "CIMSymbolReference",
        symbol: {
          type: "CIMLineSymbol",
          symbolLayers: [
            {
              // black 1px line symbol
              type: "CIMSolidStroke",
              enable: true,
              width: 1,
              color: cHydrogenColorPipeline,
            },
            {
              // arrow symbol
              type: "CIMVectorMarker",
              enable: true,
              size: 4,
              markerPlacement: {
                type: "CIMMarkerPlacementAlongLineSameSize", // places same size markers along the line
                endings: "WithMarkers",
                placementTemplate: [50], // determines space between each arrow
                angleToLine: true, // symbol will maintain its angle to the line when map is rotated
              },
              frame: {
                xmin: -5,
                ymin: -5,
                xmax: 5,
                ymax: 5,
              },
              markerGraphics: [
                {
                  type: "CIMMarkerGraphic",
                  geometry: {
                    rings: [
                      [
                        [-8, -5.47],
                        [-8, 5.6],
                        [1.96, -0.03],
                        [-8, -5.47],
                      ],
                    ],
                  },
                  symbol: {
                    // black fill for the arrow symbol
                    type: "CIMPolygonSymbol",
                    symbolLayers: [
                      {
                        type: "CIMSolidFill",
                        enable: true,
                        color: [0, 0, 0, 255],
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
      },
    },
  },
  {
    value: "Bi-Directional, Hydrogen", // when one-way='yes', create CIMSymbol line with arrows
    symbol: {
      type: "cim", // autocasts as CIMSymbol
      data: {
        type: "CIMSymbolReference",
        symbol: {
          type: "CIMLineSymbol",
          symbolLayers: [
            {
              // black 1px line symbol
              type: "CIMSolidStroke",
              enable: true,
              width: 1,
              color: cHydrogenColorPipeline,
            },
            {
              // arrow symbol
              type: "CIMVectorMarker",
              enable: true,
              size: 4,
              markerPlacement: {
                type: "CIMMarkerPlacementAlongLineSameSize", // places same size markers along the line
                endings: "WithMarkers",
                placementTemplate: [50], // determines space between each arrow
                angleToLine: true, // symbol will maintain its angle to the line when map is rotated
              },
              frame: {
                xmin: -5,
                ymin: -5,
                xmax: 5,
                ymax: 5,
              },
              markerGraphics: [
                {
                  type: "CIMMarkerGraphic",
                  geometry: {
                    rings: [
                      [
                        [11, 2],
                        [10, 2],
                        [10, 7],
                        [11, 7],
                        [11, 2],
                      ],
                      [
                        [15, 15],
                        [19, 10.5],
                        [15, 6],
                        [15, 9],
                        [6, 9],
                        [6, 6],
                        [2, 10.5],
                        [6, 15],
                        [6, 12],
                        [15, 12],
                        [15, 15],
                      ],
                      [
                        [11, 14],
                        [10, 14],
                        [10, 19],
                        [11, 19],
                        [11, 14],
                      ],
                    ],
                  },
                  symbol: {
                    // black fill for the arrow symbol
                    type: "CIMPolygonSymbol",
                    symbolLayers: [
                      {
                        type: "CIMSolidFill",
                        enable: true,
                        color: [0, 0, 0, 255],
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
      },
    },
  },
];
