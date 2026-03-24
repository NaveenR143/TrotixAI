const fnFetchDataDrivenSizeFields = {
  'Gas Storage': [
    {
      name: 'CurrentCushionCapacity',
      display: 'CurrentCushionCapacity_BCF',
    },
    {
      name: 'CurrentWorkingCapacity',
      display: 'CurrentWorkingCapacity_BCF',
    },
    {
      name: 'CurrentTotalCapacity',
      display: 'CurrentTotalCapacity_BCF',
    },
  ],
  'Gas Plant': [
    {
      name: 'GasProcessingCapacity',
      display: 'GasProcessingCapacityMMSCFD',
    },
    {
      name: 'TotalGasOperatingCapacity',
      display: 'TotalGasOperatingCapacityMMSCFD',
    },
    {
      name: 'TotalGasPlannedCapacity',
      display: 'TotalGasPlannedCapacityMMSCFD',
    },
  ],
  Refinery: [
    {
      name: 'TotalCrudeDistillationCapacity',
      display: 'TotalCrudeDistillationCapacity',
    },
  ],
  Liquefaction: [
    {
      name: 'TotalBaseloadCapacity',
      display: 'TotalBaseloadCapacityBCF',
    },
    {
      name: 'TotalPeakloadCapacity',
      display: 'TotalPeakloadCapacityBCF',
    },
    {
      name: 'TotalCapacityMMTPA',
      display: 'TotalCapacityMMTPA',
    },
  ],
  Terminal: [
    {
      name: 'TotalCapacityBarrels',
      display: 'TotalCapacityBarrels',
    },
  ],
  CCUS: [
    {
      name: 'CO2CaptureStoreMMTPA',
      display: 'CO2CaptureStoreMMTPA',
    },
  ],
  'CO2 Storage': [
    {
      name: 'CO2StorageCapacity',
      display: 'CO2StorageCapacityMMTPA',
    },
  ],
  'Hydrogen Plant': [
    {
      name: 'TotalHydrogenCapacity',
      display: 'TotalHydrogenCapacityMMSCFD',
    },
  ],
  'Emission Facilities': [
    {
      name: 'GhgQuantityMetricTonsCo2E',
      display: 'GhgQuantityMetricTonsCo2E',
    },
  ],
};

export default fnFetchDataDrivenSizeFields;