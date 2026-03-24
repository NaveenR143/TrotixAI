const pf = [
  {
    fieldName: 'Facility',
    format: {
      digitSeparator: true,
      places: 0,
    },
  },
  {
    fieldName: 'AssemblyType',
    format: {
      digitSeparator: true,
      places: 0,
    },
  },
  {
    fieldName: 'PlantType',
    format: {
      digitSeparator: true,
      places: 0,
    },
  },
  {
    fieldName: 'Longitude',
    format: {
      digitSeparator: true,
      places: 2,
    },
  },
  {
    fieldName: 'Latitude',
    format: {
      digitSeparator: true,
      places: 2,
    },
  },
  {
    fieldName: 'PlantId',
    format: {
      digitSeparator: true,
      places: 0,
    },
  },
  {
    fieldName: 'PipelineHeaderId',
    format: {
      digitSeparator: true,
      places: 0,
    },
  },
  {
    fieldName: 'PipelineName',
    format: {
      digitSeparator: true,
      places: 0,
    },
  },
  {
    fieldName: 'PipelineProduct',
    format: {
      digitSeparator: true,
      places: 0,
    },
  },
  {
    fieldName: 'SectionId',
    format: {
      digitSeparator: true,
      places: 0,
    },
  },
  {
    fieldName: 'SectionName',
    format: {
      digitSeparator: true,
      places: 0,
    },
  },
];

const fnFetchFacilityFieldInfo = {
  'Gas Storage': [
    {
      fieldName: 'Facility',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'Longitude',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'Latitude',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'PlantId',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'PlantType',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'OperatorName',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'CurrentCushionCapacity',
      format: {
        digitSeparator: true,
        places: 2,
      },
    },
    {
      fieldName: 'CurrentWorkingCapacity',
      format: {
        digitSeparator: true,
        places: 2,
      },
    },
    {
      fieldName: 'CurrentTotalCapacity',
      format: {
        digitSeparator: true,
        places: 2,
      },
    },
  ],
  'Gas Plant': [
    {
      fieldName: 'Facility',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'Longitude',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'Latitude',
      format: {
        digitSeparator: true,
        places: 2,
      },
    },
    {
      fieldName: 'PlantId',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'PlantType',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'OperatorName',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'Status',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'GasProcessingCapacity',
      format: {
        digitSeparator: true,
        places: 2,
      },
    },
    {
      fieldName: 'TotalGasOperatingCapacity',
      format: {
        digitSeparator: true,
        places: 2,
      },
    },
    {
      fieldName: 'TotalGasPlannedCapacity',
      format: {
        digitSeparator: true,
        places: 2,
      },
    },
  ],
  Refinery: [
    {
      fieldName: 'Facility',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'Longitude',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'Latitude',
      format: {
        digitSeparator: true,
        places: 2,
      },
    },
    {
      fieldName: 'PlantId',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'PlantType',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'OperatorName',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'TotalCrudeDistillationCapacity',
      format: {
        digitSeparator: true,
        places: 2,
      },
    },
    {
      fieldName: 'Status',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
  ],
  Liquefaction: [
    {
      fieldName: 'Facility',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'Longitude',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'Latitude',
      format: {
        digitSeparator: true,
        places: 2,
      },
    },
    {
      fieldName: 'PlantId',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'PlantType',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'OperatorName',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'Status',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'TotalBaseloadCapacity',
      format: {
        digitSeparator: true,
        places: 2,
      },
    },
    {
      fieldName: 'TotalPeakloadCapacity',
      format: {
        digitSeparator: true,
        places: 2,
      },
    },
    {
      fieldName: 'TotalCapacityMMTPA',
      format: {
        digitSeparator: true,
        places: 2,
      },
    },
  ],
  Terminal: [
    {
      fieldName: 'Facility',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'Longitude',
      format: {
        digitSeparator: true,
        places: 2,
      },
    },
    {
      fieldName: 'Latitude',
      format: {
        digitSeparator: true,
        places: 2,
      },
    },
    {
      fieldName: 'PlantId',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'PlantType',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'OperatorName',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'CommodityHandled',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'TotalCapacityBarrels',
      format: {
        digitSeparator: true,
        places: 2,
      },
    },
    {
      fieldName: 'Status',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
  ],
  Pipeline: [
    {
      fieldName: 'Facility',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'Section',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'PlantId',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'PlantType',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'OperatorName',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'Direction',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'CommodityHandled',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
  ],
  PipelineFacility: pf,
  pipelinefacility: pf,
  'Compressor Station': [
    {
      fieldName: 'Facility',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'Longitude',
      format: {
        digitSeparator: true,
        places: 2,
      },
    },
    {
      fieldName: 'Latitude',
      format: {
        digitSeparator: true,
        places: 2,
      },
    },
    {
      fieldName: 'PlantId',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'PlantType',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'OperatorName',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'Status',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'TotalPower',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'NumberOfEngines',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
  ],
  'Pumping Station': [
    {
      fieldName: 'Facility',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'Longitude',
      format: {
        digitSeparator: true,
        places: 2,
      },
    },
    {
      fieldName: 'Latitude',
      format: {
        digitSeparator: true,
        places: 2,
      },
    },
    {
      fieldName: 'PlantId',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'PlantType',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'OperatorName',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'Status',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
  ],
  CCUS: [
    {
      fieldName: 'Facility',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'Longitude',
      format: {
        digitSeparator: true,
        places: 2,
      },
    },
    {
      fieldName: 'Latitude',
      format: {
        digitSeparator: true,
        places: 2,
      },
    },
    {
      fieldName: 'PlantId',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'PlantType',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'OperatorName',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'CO2CaptureStoreMMTPA',
      format: {
        digitSeparator: true,
        places: 2,
      },
    },
    {
      fieldName: 'Status',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
  ],
  'CO2 Storage': [
    {
      fieldName: 'Facility',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'Longitude',
      format: {
        digitSeparator: true,
        places: 2,
      },
    },
    {
      fieldName: 'Latitude',
      format: {
        digitSeparator: true,
        places: 2,
      },
    },
    {
      fieldName: 'PlantId',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'PlantType',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'OperatorName',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'CO2StorageCapacity',
      format: {
        digitSeparator: true,
        places: 2,
      },
    },
    {
      fieldName: 'Status',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
  ],
  'Hydrogen Plant': [
    {
      fieldName: 'Facility',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'Longitude',
      format: {
        digitSeparator: true,
        places: 2,
      },
    },
    {
      fieldName: 'Latitude',
      format: {
        digitSeparator: true,
        places: 2,
      },
    },
    {
      fieldName: 'PlantId',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'PlantType',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'OperatorName',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'TotalHydrogenCapacity',
      format: {
        digitSeparator: true,
        places: 2,
      },
    },
    {
      fieldName: 'Status',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
  ],
  'Industrial Plant': [
    {
      fieldName: 'Facility',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'Longitude',
      format: {
        digitSeparator: true,
        places: 2,
      },
    },
    {
      fieldName: 'Latitude',
      format: {
        digitSeparator: true,
        places: 2,
      },
    },
    {
      fieldName: 'PlantId',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'PlantType',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'OperatorName',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'Status',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
  ],
  'Power Plant': [
    {
      fieldName: 'Facility',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'Longitude',
      format: {
        digitSeparator: true,
        places: 2,
      },
    },
    {
      fieldName: 'Latitude',
      format: {
        digitSeparator: true,
        places: 2,
      },
    },
    {
      fieldName: 'PlantId',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'PlantType',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'OperatorName',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'Status',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
  ],

  'Interconnected Facilities': [
    {
      fieldName: 'Facility',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'Longitude',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'Latitude',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'PlantId',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'PlantType',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
  ],
  'Emission Facilities': [
    {
      fieldName: 'Facility',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'Longitude',
      format: {
        digitSeparator: true,
        places: 2,
      },
    },
    {
      fieldName: 'Latitude',
      format: {
        digitSeparator: true,
        places: 2,
      },
    },
    {
      fieldName: 'PlantId',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'PlantType',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'Company1',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'Company2',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'Company3',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'ReportingYear',
      format: {
        digitSeparator: true,
        places: 0,
      },
    },
    {
      fieldName: 'GhgQuantityMetricTonsCo2E',
      format: {
        digitSeparator: true,
        places: 2,
      },
    },
  ],
};

export default fnFetchFacilityFieldInfo;
