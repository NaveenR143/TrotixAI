import * as facilitycolors from "./facilitycolors";
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
  REFINERY,
  REGULATORY_STATION,
  RURAL_TAP,
  TANK,
  TEE_JUNCTION,
  TERMINAL,
  TOWN_BORDER_STATION,
} from "./facilitytypes";

const fnFetchRenderer = (type, color, na) => {
  const facilitymapto = {
    "Gas Plant": facilitycolors.GasPlantColor,
    "Gas Storage": facilitycolors.GasStorageColor,
    Liquefaction: facilitycolors.LNGColor,
    Refinery: facilitycolors.RefineryColor,
    Terminal: facilitycolors.TerminalColor,
    "Compressor Station": facilitycolors.CompressorStationColor,
    "Pumping Station": facilitycolors.PumpingStationColor,
    "Industrial Plant": facilitycolors.IndustrialPlantColor,
    "Power Plant": facilitycolors.PowerPlantColor,
    "Emission Facilities": facilitycolors.EmissionFacilityColor,
  };

  const PipelineFacilitiesProps = [
    {
      // All features with value of "North" will be blue
      value: GAS_PLANT,
      symbol: {
        type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
        size: 5,
        color: facilitycolors.GasPlantColor,
        outline: {
          // autocasts as new SimpleLineSymbol()
          width: 1,
          color,
        },
      },
    },
    {
      // All features with value of "North" will be blue
      value: TERMINAL,
      symbol: {
        type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
        size: 5,
        color: facilitycolors.TerminalColor,
        outline: {
          // autocasts as new SimpleLineSymbol()
          width: 1,
          color,
        },
      },
    },
    {
      // All features with value of "North" will be blue
      value: REFINERY,
      symbol: {
        type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
        size: 5,
        color: facilitycolors.RefineryColor,
        outline: {
          // autocasts as new SimpleLineSymbol()
          width: 1,
          color,
        },
      },
    },
    {
      // All features with value of "North" will be blue
      value: COMPRESSOR_STATION,
      symbol: {
        type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
        size: 5,
        color: facilitycolors.CompressorStationColor,
        outline: {
          // autocasts as new SimpleLineSymbol()
          width: 1,
          color,
        },
      },
    },
    {
      // All features with value of "North" will be blue
      value: PUMPING_STATION,
      symbol: {
        type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
        size: 5,
        color: facilitycolors.PumpingStationColor,
        outline: {
          // autocasts as new SimpleLineSymbol()
          width: 1,
          color,
        },
      },
    },
    {
      // All features with value of "North" will be blue
      value: INDUSTRIAL_PLANT,
      symbol: {
        type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
        size: 5,
        color: facilitycolors.IndustrialPlantColor,
        outline: {
          // autocasts as new SimpleLineSymbol()
          width: 1,
          color,
        },
      },
    },
    {
      // All features with value of "North" will be blue
      value: GAS_STORAGE,
      symbol: {
        type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
        size: 5,
        color: facilitycolors.GasStorageColor,
        outline: {
          // autocasts as new SimpleLineSymbol()
          width: 1,
          color,
        },
      },
    },
    {
      // All features with value of "North" will be blue
      value: LIQUEFACTION,
      symbol: {
        type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
        size: 5,
        color: facilitycolors.LNGColor,
        outline: {
          // autocasts as new SimpleLineSymbol()
          width: 1,
          color,
        },
      },
    },
    {
      // All features with value of "North" will be blue
      value: REGULATORY_STATION,
      symbol: {
        type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
        size: 5,
        color: facilitycolors.PipelineAssembliesColor,
        outline: {
          // autocasts as new SimpleLineSymbol()
          width: 1,
          color,
        },
      },
    },
    {
      // All features with value of "North" will be blue
      value: METERING_STATION_DELIVERY,
      symbol: {
        type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
        size: 5,
        color: facilitycolors.PipelineAssembliesColor,
        outline: {
          // autocasts as new SimpleLineSymbol()
          width: 1,
          color,
        },
      },
    },
    {
      // All features with value of "North" will be blue
      value: METERING_STATION_RECEIPT,
      symbol: {
        type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
        size: 5,
        color: facilitycolors.PipelineAssembliesColor,
        outline: {
          // autocasts as new SimpleLineSymbol()
          width: 1,
          color,
        },
      },
    },
    {
      // All features with value of "North" will be blue
      value: METERING_STATION_BIDIRECTIONAL,
      symbol: {
        type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
        size: 5,
        color: facilitycolors.PipelineAssembliesColor,
        outline: {
          // autocasts as new SimpleLineSymbol()
          width: 1,
          color,
        },
      },
    },
    {
      value: RURAL_TAP,
      symbol: {
        type: "simple-marker",
        size: 5,
        color: facilitycolors.PipelineAssembliesColor,
        outline: {
          width: 1,
          color,
        },
      },
    },
    {
      value: FIELD_GATHERING_STATION,
      symbol: {
        type: "simple-marker",
        size: 5,
        color: facilitycolors.PipelineAssembliesColor,
        outline: {
          width: 1,
          color,
        },
      },
    },
    {
      value: GAS_OIL_SEPERATION_POINT,
      symbol: {
        type: "simple-marker",
        size: 5,
        color: facilitycolors.PipelineAssembliesColor,
        outline: {
          width: 1,
          color,
        },
      },
    },
    {
      value: TEE_JUNCTION,
      symbol: {
        type: "simple-marker",
        size: 5,
        color: facilitycolors.PipelineAssembliesColor,
        outline: {
          width: 1,
          color,
        },
      },
    },
    {
      // All features with value of "North" will be blue
      value: DEHYDRATION_EQUIPMENT,
      symbol: {
        type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
        size: 5,
        color: facilitycolors.PipelineAssembliesColor,
        outline: {
          // autocasts as new SimpleLineSymbol()
          width: 1,
          color,
        },
      },
    },
    {
      // All features with value of "North" will be blue
      value: POOLING_POINT,
      symbol: {
        type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
        size: 5,
        color: facilitycolors.PipelineAssembliesColor,
        outline: {
          // autocasts as new SimpleLineSymbol()
          width: 1,
          color,
        },
      },
    },
    {
      value: TANK,
      symbol: {
        type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
        size: 5,
        color: facilitycolors.PipelineAssembliesColor,
        outline: {
          // autocasts as new SimpleLineSymbol()
          width: 1,
          color,
        },
      },
    },
    {
      value: TOWN_BORDER_STATION,
      symbol: {
        type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
        size: 5,
        color: facilitycolors.PipelineAssembliesColor,
        outline: {
          // autocasts as new SimpleLineSymbol()
          width: 1,
          color,
        },
      },
    },
    {
      value: LDC,
      symbol: {
        type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
        size: 5,
        color: facilitycolors.PipelineAssembliesColor,
        outline: {
          // autocasts as new SimpleLineSymbol()
          width: 1,
          color,
        },
      },
    },
    {
      value: INTERCONNECT,
      symbol: {
        type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
        style: "x",
        size: 7,
        color: facilitycolors.PipelineAssembliesInterconnectColor,
        outline: {
          // autocasts as new SimpleLineSymbol()
          width: 2,
          color,
        },
      },
    },
    {
      value: INDUSTRIAL_PLANT,
      symbol: {
        type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
        size: 5,
        color: facilitycolors.IndustrialPlantColor,
        outline: {
          // autocasts as new SimpleLineSymbol()
          width: 1,
          color,
        },
      },
    },
    {
      value: POWER_PLANT,
      symbol: {
        type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
        size: 5,
        color: facilitycolors.PowerPlantColor,
        outline: {
          // autocasts as new SimpleLineSymbol()
          width: 1,
          color,
        },
      },
    },
  ];

  let pipelinecolor = [135, 126, 126, 255];

  if (color) {
    pipelinecolor = [color.r, color.g, color.b, 255];
  }

  if (type === "Pipeline") {
    return {
      // All features with value of "North" will be blue
      type: "unique-value", // autocasts as UniqueValueRenderer
      field: "Direction",
      field2: "CommodityHandled",
      fieldDelimiter: ", ",
      defaultSymbol: {
        type: "simple-line",
      },
      uniqueValueInfos: [
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
                    color: pipelinecolor,
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
                    color: pipelinecolor,
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
                    color: pipelinecolor,
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
                    color: pipelinecolor,
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
                    color: pipelinecolor,
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
                    color: pipelinecolor,
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
                    color: pipelinecolor,
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
                    color: pipelinecolor,
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
                    color: pipelinecolor,
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
                    color: pipelinecolor,
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
                    color: pipelinecolor,
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
                    color: pipelinecolor,
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
                    color: pipelinecolor,
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
                    color: pipelinecolor,
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
                    color: pipelinecolor,
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
                    color: pipelinecolor,
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
      ],
    };
  }

  if (type === "PipelineFacility" || type === "pipelinefacility") {
    // console.log(facilitycolors.PipelineAssembliesColor);
    if (na) {
      return {
        type: "simple", // autocasts as new SimpleRenderer()
        symbol: {
          type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
          size: 9,
          color: facilitycolors.PipelineAssembliesColor,
          outline: {
            // autocasts as new SimpleLineSymbol()
            width: 1.5,
            color,
          },
        },
      };
    }
    return {
      type: "unique-value", // autocasts as new UniqueValueRenderer()
      field: "AssemblyType",
      defaultSymbol: {
        type: "simple", // autocasts as new SimpleRenderer()
        symbol: {
          type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
          size: 7,
          color: facilitycolors.PipelineAssembliesColor,
          outline: {
            // autocasts as new SimpleLineSymbol()
            width: 1.5,
            color,
          },
        },
      },
      uniqueValueInfos: PipelineFacilitiesProps,
    };
  }

  if (type === "NormalPipeline") {
    return {
      type: "unique-value", // autocasts as UniqueValueRenderer
      field: "CommodityHandled",
      fieldDelimiter: ", ",
      defaultSymbol: {
        type: "simple-line", // default SimpleLineSymbol
      },
      uniqueValueInfos: [
        {
          // All features with value of "North" will be blue
          value: "Natural Gas",
          symbol: {
            type: "simple-line",
            color: pipelinecolor,
            width: 1,
          },
        },
        {
          // All features with value of "North" will be blue
          value: "Crude Oil",
          symbol: {
            type: "simple-line",
            color: pipelinecolor,
            width: 1,
          },
        },
        {
          // All features with value of "North" will be blue
          value: "LPG",
          symbol: {
            type: "simple-line",
            color: pipelinecolor,
            width: 1,
          },
        },
        {
          // All features with value of "North" will be blue
          value: "NGL",
          symbol: {
            type: "simple-line",
            color: pipelinecolor,
            width: 1,
          },
        },
        {
          // All features with value of "North" will be blue
          value: "LNG",
          symbol: {
            type: "simple-line",
            color: pipelinecolor,
            width: 1,
          },
        },
        {
          // All features with value of "North" will be blue
          value: "Refined Products",
          symbol: {
            type: "simple-line",
            color: pipelinecolor,
            width: 1,
          },
        },
        {
          // All features with value of "North" will be blue
          value: "Carbondioxide",
          symbol: {
            type: "simple-line",
            color: pipelinecolor,
            width: 1,
          },
        },
        {
          // All features with value of "North" will be blue
          value: "Hydrogen",
          symbol: {
            type: "simple-line",
            color: pipelinecolor,
            width: 1,
          },
        },
      ],
    };
  }

  if (type === "NetworkPipeline") {
    return {
      type: "simple",
      symbol: {
        type: "simple-line",
        color: "#fa3020",
        width: 2.5,
        style: "long-dash", // short-dot,long-dash,short-dash
      },
    };
  }

  if (type === "Interconnected Facilities") {
    return {
      type: "simple", // autocasts as new UniqueValueRenderer()
      symbol: {
        type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
        size: 10,
        color,
      },
    };
  }

  return {
    type: "simple", // autocasts as new SimpleRenderer()
    symbol: {
      type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
      size: 9,
      color: facilitymapto[type],
      outline: {
        // autocasts as new SimpleLineSymbol()
        width: 1.5,
        color,
      },
    },
  };
};

export default fnFetchRenderer;
