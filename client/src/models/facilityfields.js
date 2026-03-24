const pf = [
  {
    name: 'ObjectId',
    type: 'oid',
  },
  {
    name: 'Facility',
    type: 'string',
  },
  {
    name: 'AssemblyType',
    type: 'string',
  },
  {
    name: 'PlantType',
    type: 'string',
  },
  {
    name: 'Latitude',
    type: 'double',
  },
  {
    name: 'Longitude',
    type: 'double',
  },
  {
    name: 'PlantId',
    type: 'integer',
  },
  {
    name: 'PipelineHeaderId',
    type: 'integer',
  },
  {
    name: 'PipelineName',
    type: 'string',
  },
  {
    name: 'PipelineProduct',
    type: 'string',
  },
  {
    name: 'SectionId',
    type: 'integer',
  },
  {
    name: 'SectionName',
    type: 'string',
  },
];

export const fnFetchFacilityFields = {
  'Gas Storage': [
    {
      name: 'ObjectId',
      type: 'oid',
    },
    {
      name: 'Facility',
      type: 'string',
    },
    {
      name: 'Latitude',
      type: 'double',
    },
    {
      name: 'Longitude',
      type: 'double',
    },
    {
      name: 'PlantId',
      type: 'integer',
    },
    {
      name: 'PlantType',
      type: 'string',
    },
    {
      name: 'OperatorName',
      type: 'string',
    },
    {
      name: 'CurrentCushionCapacity',
      type: 'double',
    },
    {
      name: 'CurrentWorkingCapacity',
      type: 'double',
    },
    {
      name: 'CurrentTotalCapacity',
      type: 'double',
    },
    {
      name: 'Status',
      type: 'string',
    },
  ],
  'Gas Plant': [
    {
      name: 'ObjectId',
      type: 'oid',
    },
    {
      name: 'Facility',
      type: 'string',
    },
    {
      name: 'Latitude',
      type: 'double',
    },
    {
      name: 'Longitude',
      type: 'double',
    },
    {
      name: 'PlantId',
      type: 'integer',
    },
    {
      name: 'PlantType',
      type: 'string',
    },
    {
      name: 'OperatorName',
      type: 'string',
    },
    {
      name: 'GasProcessingCapacity',
      type: 'double',
    },
    {
      name: 'TotalGasOperatingCapacity',
      type: 'double',
    },
    {
      name: 'TotalGasPlannedCapacity',
      type: 'double',
    },
    {
      name: 'Status',
      type: 'string',
    },
  ],
  Refinery: [
    {
      name: 'ObjectId',
      type: 'oid',
    },
    {
      name: 'Facility',
      type: 'string',
    },
    {
      name: 'Latitude',
      type: 'double',
    },
    {
      name: 'Longitude',
      type: 'double',
    },
    {
      name: 'PlantId',
      type: 'integer',
    },
    {
      name: 'PlantType',
      type: 'string',
    },
    {
      name: 'OperatorName',
      type: 'string',
    },
    {
      name: 'TotalCrudeDistillationCapacity',
      type: 'double',
    },

    {
      name: 'Status',
      type: 'string',
    },
  ],
  Liquefaction: [
    {
      name: 'ObjectId',
      type: 'oid',
    },
    {
      name: 'Facility',
      type: 'string',
    },
    {
      name: 'Latitude',
      type: 'double',
    },
    {
      name: 'Longitude',
      type: 'double',
    },
    {
      name: 'PlantId',
      type: 'integer',
    },
    {
      name: 'PlantType',
      type: 'string',
    },
    {
      name: 'OperatorName',
      type: 'string',
    },
    {
      name: 'TotalBaseloadCapacity',
      type: 'double',
    },
    {
      name: 'TotalPeakloadCapacity',
      type: 'double',
    },
    {
      name: 'TotalCapacityMMTPA',
      type: 'double',
    },
    {
      name: 'Status',
      type: 'string',
    },
  ],
  Terminal: [
    {
      name: 'ObjectId',
      type: 'oid',
    },
    {
      name: 'Facility',
      type: 'string',
    },
    {
      name: 'Latitude',
      type: 'double',
    },
    {
      name: 'Longitude',
      type: 'double',
    },
    {
      name: 'PlantId',
      type: 'integer',
    },
    {
      name: 'PlantType',
      type: 'string',
    },
    {
      name: 'OperatorName',
      type: 'string',
    },
    {
      name: 'CommodityHandled',
      type: 'string',
    },
    {
      name: 'TotalCapacityBarrels',
      type: 'double',
    },
    {
      name: 'Status',
      type: 'string',
    },
  ],
  Permit: [
    {
      name: 'ObjectId',
      type: 'oid',
    },
    {
      name: 'Facility',
      type: 'string',
    },
    {
      name: 'Latitude',
      type: 'double',
    },
    {
      name: 'Longitude',
      type: 'double',
    },
    {
      name: 'PlantId',
      type: 'integer',
    },
    {
      name: 'PlantType',
      type: 'string',
    },
    {
      name: 'OperatorName',
      type: 'string',
    },
    {
      name: 'StatusCode',
      type: 'string',
    },
    {
      name: 'Status',
      type: 'string',
    },
  ],
  Well: [
    {
      name: 'ObjectId',
      type: 'oid',
    },
    {
      name: 'Facility',
      type: 'string',
    },
    {
      name: 'Latitude',
      type: 'double',
    },
    {
      name: 'Longitude',
      type: 'double',
    },
    {
      name: 'PlantId',
      type: 'integer',
    },
    {
      name: 'PlantType',
      type: 'string',
    },
    {
      name: 'OperatorName',
      type: 'string',
    },
    {
      name: 'StatusCode',
      type: 'string',
    },
    {
      name: 'Status',
      type: 'string',
    },
  ],
  Pipeline: [
    {
      name: 'ObjectId',
      type: 'oid',
    },
    {
      name: 'Facility',
      type: 'string',
    },
    {
      name: 'Section',
      type: 'string',
    },
    {
      name: 'CommodityHandled',
      type: 'string',
    },
    {
      name: 'PlantId',
      type: 'integer',
    },
    {
      name: 'PlantType',
      type: 'string',
    },
    {
      name: 'OperatorName',
      type: 'string',
    },
    {
      name: 'Direction',
      type: 'string',
    },
  ],
  PipelineFacility: pf,
  pipelinefacility: pf,
  'Compressor Station': [
    {
      name: 'ObjectId',
      type: 'oid',
    },
    {
      name: 'Facility',
      type: 'string',
    },
    {
      name: 'Latitude',
      type: 'double',
    },
    {
      name: 'Longitude',
      type: 'double',
    },
    {
      name: 'PlantId',
      type: 'integer',
    },
    {
      name: 'PlantType',
      type: 'string',
    },
    {
      name: 'OperatorName',
      type: 'string',
    },
    {
      name: 'Status',
      type: 'string',
    },
    {
      name: 'TotalPower',
      type: 'double',
    },
    {
      name: 'NumberOfEngines',
      type: 'double',
    },
  ],
  'Pumping Station': [
    {
      name: 'ObjectId',
      type: 'oid',
    },
    {
      name: 'Facility',
      type: 'string',
    },
    {
      name: 'Latitude',
      type: 'double',
    },
    {
      name: 'Longitude',
      type: 'double',
    },
    {
      name: 'PlantId',
      type: 'integer',
    },
    {
      name: 'PlantType',
      type: 'string',
    },
    {
      name: 'OperatorName',
      type: 'string',
    },
    {
      name: 'Status',
      type: 'string',
    },
  ],
  CCUS: [
    {
      name: 'ObjectId',
      type: 'oid',
    },
    {
      name: 'Facility',
      type: 'string',
    },
    {
      name: 'Latitude',
      type: 'double',
    },
    {
      name: 'Longitude',
      type: 'double',
    },
    {
      name: 'PlantId',
      type: 'integer',
    },
    {
      name: 'PlantType',
      type: 'string',
    },
    {
      name: 'OperatorName',
      type: 'string',
    },
    {
      name: 'CO2CaptureStoreMMTPA',
      type: 'double',
    },
    {
      name: 'Status',
      type: 'string',
    },
  ],
  'CO2 Storage': [
    {
      name: 'ObjectId',
      type: 'oid',
    },
    {
      name: 'Facility',
      type: 'string',
    },
    {
      name: 'Latitude',
      type: 'double',
    },
    {
      name: 'Longitude',
      type: 'double',
    },
    {
      name: 'PlantId',
      type: 'integer',
    },
    {
      name: 'PlantType',
      type: 'string',
    },
    {
      name: 'OperatorName',
      type: 'string',
    },
    {
      name: 'CO2StorageCapacity',
      type: 'double',
    },
    {
      name: 'Status',
      type: 'string',
    },
  ],
  'Hydrogen Plant': [
    {
      name: 'ObjectId',
      type: 'oid',
    },
    {
      name: 'Facility',
      type: 'string',
    },
    {
      name: 'Latitude',
      type: 'double',
    },
    {
      name: 'Longitude',
      type: 'double',
    },
    {
      name: 'PlantId',
      type: 'integer',
    },
    {
      name: 'PlantType',
      type: 'string',
    },
    {
      name: 'OperatorName',
      type: 'string',
    },
    {
      name: 'TotalHydrogenCapacity',
      type: 'double',
    },
    {
      name: 'Status',
      type: 'string',
    },
  ],
  'Industrial Plant': [
    {
      name: 'ObjectId',
      type: 'oid',
    },
    {
      name: 'Facility',
      type: 'string',
    },
    {
      name: 'Latitude',
      type: 'double',
    },
    {
      name: 'Longitude',
      type: 'double',
    },
    {
      name: 'PlantId',
      type: 'integer',
    },
    {
      name: 'PlantType',
      type: 'string',
    },
    {
      name: 'OperatorName',
      type: 'string',
    },
    {
      name: 'Status',
      type: 'string',
    },
  ],
  'Power Plant': [
    {
      name: 'ObjectId',
      type: 'oid',
    },
    {
      name: 'Facility',
      type: 'string',
    },
    {
      name: 'Latitude',
      type: 'double',
    },
    {
      name: 'Longitude',
      type: 'double',
    },
    {
      name: 'PlantId',
      type: 'integer',
    },
    {
      name: 'PlantType',
      type: 'string',
    },
    {
      name: 'OperatorName',
      type: 'string',
    },
    {
      name: 'Status',
      type: 'string',
    },
  ],

  'Interconnected Facilities': [
    {
      name: 'ObjectId',
      type: 'oid',
    },
    {
      name: 'Facility',
      type: 'string',
    },
    {
      name: 'Latitude',
      type: 'double',
    },
    {
      name: 'Longitude',
      type: 'double',
    },
    {
      name: 'PlantId',
      type: 'integer',
    },
    {
      name: 'PlantType',
      type: 'string',
    },
  ],
  'Emission Facilities': [
    {
      name: 'ObjectId',
      type: 'oid',
    },
    {
      name: 'Facility',
      type: 'string',
    },
    {
      name: 'Latitude',
      type: 'double',
    },
    {
      name: 'Longitude',
      type: 'double',
    },
    {
      name: 'PlantId',
      type: 'integer',
    },
    {
      name: 'PlantType',
      type: 'string',
    },
    {
      name: 'Company1',
      type: 'string',
    },
    {
      name: 'Company2',
      type: 'string',
    },
    {
      name: 'Company3',
      type: 'string',
    },
    {
      name: 'ReportingYear',
      type: 'integer',
    },
    {
      name: 'GhgQuantityMetricTonsCo2E',
      type: 'double',
    },
    {
      name: 'FacilityType',
      type: 'string',
    },
  ],
};
