export const GAS_STORAGE = "Gas Storage";
export const GAS_PLANT = "Gas Plant";
export const REFINERY = "Refinery";
export const LIQUEFACTION = "Liquefaction";
export const TERMINAL = "Terminal";
export const PIPELINE = "Pipeline";
export const PIPELINE_FACILITY = "PipelineFacility";
export const COMPRESSOR_STATION = "Compressor Station";
export const PUMPING_STATION = "Pumping Station";
export const POWER_PLANT = "Power Plant";
export const INDUSTRIAL_PLANT = "Industrial Plant";
export const METERING_STATION_DELIVERY = "Metering Station Delivery";
export const METERING_STATION_RECEIPT = "Metering Station Receipt";
export const METERING_STATION_BIDIRECTIONAL = "Metering Station Bidirectional";
export const RURAL_TAP = "Rural Tap";
export const FIELD_GATHERING_STATION = "Field Gathering Station";
export const GAS_OIL_SEPERATION_POINT = "Gas Oil Seperation Point";
export const TEE_JUNCTION = "Tee Junction";
export const DEHYDRATION_EQUIPMENT = "Dehydration Equipment";
export const POOLING_POINT = "Pooling Point";
export const TOWN_BORDER_STATION = "Town Border Station";
export const LDC = "LDC";
export const INTERCONNECT = "Interconnect";
export const TANK = "Tank";
export const GATHERING_SYSTEM = "Gathering System";
export const DATA_CENTERS = "DataCenters";

// Pipeline Assemblies
export const REGULATORY_STATION = "Regulatory Station";

export const FacilityTypes = [
  GAS_STORAGE,
  GAS_PLANT,
  REFINERY,
  LIQUEFACTION,
  TERMINAL,
  "PipelineSystem",
  GATHERING_SYSTEM,
  COMPRESSOR_STATION,
  PUMPING_STATION,
  POWER_PLANT,
  INDUSTRIAL_PLANT,

];

export const GasFacilityTypes = [
  GAS_STORAGE,
  GAS_PLANT,
  LIQUEFACTION,
  COMPRESSOR_STATION,
  POWER_PLANT,
  INDUSTRIAL_PLANT,
  METERING_STATION_DELIVERY,
  METERING_STATION_RECEIPT,
  METERING_STATION_BIDIRECTIONAL,
  FIELD_GATHERING_STATION,
  DEHYDRATION_EQUIPMENT,
  LDC,
  INTERCONNECT,
];

export const ChartFacilityTypes = [
  "GasPlantProduction",
  "GasPlantDisposition",
  "GasPlantIntake",
  "FlowPointsHistory"
];

export const DataDrivenSizeFacilityFields = {
  "Gas Plant": "TotalGasOperatingCapacity",
  "Gas Storage": "TotalCapacityBCF",
  LNG: "TotalCapacityMMTPA",
  Refinery: "TotalCrudeDistillationCapacity",
  Terminal: "TotalCapacityBarrels",
  "Compressor Station": "TotalPower"
};
