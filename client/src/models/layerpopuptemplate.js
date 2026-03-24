/* eslint-disable consistent-return */
import {
  COMPRESSOR_STATION,
  GAS_PLANT,
  GAS_STORAGE,
  INDUSTRIAL_PLANT,
  LIQUEFACTION,
  PIPELINE,
  PIPELINE_FACILITY,
  POWER_PLANT,
  PUMPING_STATION,
  REFINERY,
  TERMINAL,
} from "./facilitytypes";

const fnFetchPopup = (feature, type) => {
  switch (type) {
    case GAS_STORAGE:
      return `Facility Id : <b>${
        feature.graphic.attributes.PlantId
      }</b> </br>${GAS_STORAGE} Name : <b>${
        feature.graphic.attributes.Facility
      }</b> </br>Facility Type : <b>${
        feature.graphic.attributes.PlantType
      }</b> </br> Latitude : <b>${
        feature.graphic.attributes.Latitude
      }</b> </br> Longitude : <b>${
        feature.graphic.attributes.Longitude
      }</b> </br> Operator Name : <b>${
        feature.graphic.attributes.OperatorName
          ? feature.graphic.attributes.OperatorName
          : ""
      }</b> </br> Total Capacity BCF : <b>${
        feature.graphic.attributes.CurrentTotalCapacity
          ? feature.graphic.attributes.CurrentTotalCapacity
          : ""
      }</b> </br> Current Cushion Capacity BCF : <b>${
        feature.graphic.attributes.CurrentCushionCapacity
          ? feature.graphic.attributes.CurrentCushionCapacity
          : ""
      }</b> </br> Current Working Capacity BCF : <b>${
        feature.graphic.attributes.CurrentWorkingCapacity
          ? feature.graphic.attributes.CurrentWorkingCapacity
          : ""
      }</b> </br> Status : <b>${
        feature.graphic.attributes.Status
          ? feature.graphic.attributes.Status
          : ""
      }</b>`;

    case GAS_PLANT:
      return `Facility Id : <b>${
        feature.graphic.attributes.PlantId
      }</b> </br>Gas Plant Name : <b>${
        feature.graphic.attributes.Facility
      }</b> </br>Facility Type : <b>${
        feature.graphic.attributes.PlantType
      }</b> </br> Latitude : <b>${
        feature.graphic.attributes.Latitude
      }</b> </br> Longitude : <b>${
        feature.graphic.attributes.Longitude
      }</b> </br> Operator Name : <b>${
        feature.graphic.attributes.OperatorName
          ? feature.graphic.attributes.OperatorName
          : ""
      }</b> </br> Total Gas Processing Capacity MMSCFD : <b>${
        feature.graphic.attributes.GasProcessingCapacity
          ? feature.graphic.attributes.GasProcessingCapacity
          : ""
      }</b> </br> Total Gas Operating Capacity MMSCFD : <b>${
        feature.graphic.attributes.TotalGasOperatingCapacity
          ? feature.graphic.attributes.TotalGasOperatingCapacity
          : ""
      }</b> </br> Total Gas Planned Capacity MMSCFD : <b>${
        feature.graphic.attributes.TotalGasPlannedCapacity
          ? feature.graphic.attributes.TotalGasPlannedCapacity
          : ""
      }</b> </br> Status : <b>${
        feature.graphic.attributes.Status
          ? feature.graphic.attributes.Status
          : ""
      }</b>`;
    case REFINERY:
      return `Facility Id : <b>${
        feature.graphic.attributes.PlantId
      }</b> </br>Refinery Name : <b>${
        feature.graphic.attributes.Facility
      }</b> </br>Facility Type : <b>${
        feature.graphic.attributes.PlantType
      }</b> </br> Latitude : <b>${
        feature.graphic.attributes.Latitude
      }</b> </br> Longitude : <b>${
        feature.graphic.attributes.Longitude
      }</b> </br> Operator Name : <b>${
        feature.graphic.attributes.OperatorName
          ? feature.graphic.attributes.OperatorName
          : ""
      }</b> </br> Total Crude Distillation Capacity : <b>${
        feature.graphic.attributes.TotalCrudeDistillationCapacity
          ? feature.graphic.attributes.TotalCrudeDistillationCapacity
          : ""
      }</b> </br> Status : <b>${
        feature.graphic.attributes.Status
          ? feature.graphic.attributes.Status
          : ""
      }</b>`;
    case LIQUEFACTION:
      return `Facility Id : <b>${
        feature.graphic.attributes.PlantId
      }</b> </br>Liquefaction Plant Name : <b>${
        feature.graphic.attributes.Facility
      }</b> </br>Facility Type : <b>${
        feature.graphic.attributes.PlantType
      }</b> </br> Latitude : <b>${
        feature.graphic.attributes.Latitude
      }</b> </br> Longitude : <b>${
        feature.graphic.attributes.Longitude
      }</b> </br> Operator Name : <b>${
        feature.graphic.attributes.OperatorName
          ? feature.graphic.attributes.OperatorName
          : ""
      }</b> </br> Total Baseload Capacity BCF: <b>${
        feature.graphic.attributes.TotalBaseloadCapacity
          ? feature.graphic.attributes.TotalBaseloadCapacity
          : ""
      }</b> </br> Total Peakload Capacity BCF : <b>${
        feature.graphic.attributes.TotalPeakloadCapacity
          ? feature.graphic.attributes.TotalPeakloadCapacity
          : ""
      }</b> </br> Total Capacity MMTPA : <b>${
        feature.graphic.attributes.TotalCapacityMMTPA
          ? feature.graphic.attributes.TotalCapacityMMTPA
          : ""
      }</b> </br> Status : <b>${
        feature.graphic.attributes.Status
          ? feature.graphic.attributes.Status
          : ""
      }</b>`;

    case TERMINAL:
      return `Facility Id : <b>${
        feature.graphic.attributes.PlantId
      }</b> </br>Terminal Name : <b>${
        feature.graphic.attributes.Facility
      }</b> </br>Facility Type : <b>${
        feature.graphic.attributes.PlantType
      }</b> </br> Latitude : <b>${
        feature.graphic.attributes.Latitude
      }</b> </br> Longitude : <b>${
        feature.graphic.attributes.Longitude
      }</b> </br> Operator Name : <b>${
        feature.graphic.attributes.OperatorName
          ? feature.graphic.attributes.OperatorName
          : ""
      }</b> </br> Commodity Handled : <b>${
        feature.graphic.attributes.CommodityHandled
          ? feature.graphic.attributes.CommodityHandled
          : ""
      }</b> </br> Total Capacity Barrels : <b>${
        feature.graphic.attributes.TotalCapacityBarrels
          ? feature.graphic.attributes.TotalCapacityBarrels
          : ""
      }</b> </br> Status : <b>${
        feature.graphic.attributes.Status
          ? feature.graphic.attributes.Status
          : ""
      }</b>`;

    case PIPELINE:
      return `Pipeline Name : <b>${
        feature.graphic.attributes.Facility
      }</b> </br> Section Name : <b>${
        feature.graphic.attributes.Section
      }</b> </br> Direction : <b>${
        feature.graphic.attributes.Direction
      }</b> </br>Facility Type : <b>${
        feature.graphic.attributes.PlantType
      }</b> </br> Operator Name : <b>${
        feature.graphic.attributes.OperatorName
          ? feature.graphic.attributes.OperatorName
          : ""
      }</b> </br> CommodityHandled : <b>${
        feature.graphic.attributes.CommodityHandled
          ? feature.graphic.attributes.CommodityHandled
          : ""
      }</b>`;
    case PIPELINE_FACILITY:
    case "pipelinefacility":
      return `Facility Id : <b>${feature.graphic.attributes.PlantId}</b> </br>Facility Name : <b>${feature.graphic.attributes.Facility}</b> </br> Facility Type : <b>${feature.graphic.attributes.AssemblyType}</b> </br> Latitude : <b>${feature.graphic.attributes.Latitude}</b> </br> Longitude : <b>${feature.graphic.attributes.Longitude}</b>`;
    case COMPRESSOR_STATION:
      return `Facility Id : <b>${
        feature.graphic.attributes.PlantId
      }</b> </br>Compressor Station Name : <b>${
        feature.graphic.attributes.Facility
      }</b> </br>Facility Type : <b>${
        feature.graphic.attributes.PlantType
      }</b> </br> Latitude : <b>${
        feature.graphic.attributes.Latitude
      }</b> </br> Longitude : <b>${
        feature.graphic.attributes.Longitude
      }</b> </br> Operator Name : <b>${
        feature.graphic.attributes.OperatorName
          ? feature.graphic.attributes.OperatorName
          : ""
      }</b> </br> Status : <b>${
        feature.graphic.attributes.Status
          ? feature.graphic.attributes.Status
          : ""
      }</b> </br> TotalPower : <b>${
        feature.graphic.attributes.TotalPower
          ? feature.graphic.attributes.TotalPower
          : ""
      }</b> </br> NumberOfEngines : <b>${
        feature.graphic.attributes.NumberOfEngines
          ? feature.graphic.attributes.NumberOfEngines
          : ""
      }</b>`;
    case PUMPING_STATION:
      return `Facility Id : <b>${
        feature.graphic.attributes.PlantId
      }</b> </br>Pumping Station Name : <b>${
        feature.graphic.attributes.Facility
      }</b> </br>Facility Type : <b>${
        feature.graphic.attributes.PlantType
      }</b> </br> Latitude : <b>${
        feature.graphic.attributes.Latitude
      }</b> </br> Longitude : <b>${
        feature.graphic.attributes.Longitude
      }</b> </br> Operator Name : <b>${
        feature.graphic.attributes.OperatorName
          ? feature.graphic.attributes.OperatorName
          : ""
      }</b> </br> Status : <b>${
        feature.graphic.attributes.Status
          ? feature.graphic.attributes.Status
          : ""
      }</b>`;
    case POWER_PLANT:
      return `Facility Id : <b>${
        feature.graphic.attributes.PlantId
      }</b> </br>Power Plant Name : <b>${
        feature.graphic.attributes.Facility
      }</b> </br>Facility Type : <b>${
        feature.graphic.attributes.PlantType
      }</b> </br> Latitude : <b>${
        feature.graphic.attributes.Latitude
      }</b> </br> Longitude : <b>${
        feature.graphic.attributes.Longitude
      }</b> </br> Operator Name : <b>${
        feature.graphic.attributes.OperatorName
          ? feature.graphic.attributes.OperatorName
          : ""
      }</b> </br> Status : <b>${
        feature.graphic.attributes.Status
          ? feature.graphic.attributes.Status
          : ""
      }</b>`;

    case INDUSTRIAL_PLANT:
      return `Facility Id : <b>${
        feature.graphic.attributes.PlantId
      }</b> </br>Industrial Plant Name : <b>${
        feature.graphic.attributes.Facility
      }</b> </br>Facility Type : <b>${
        feature.graphic.attributes.PlantType
      }</b> </br> Latitude : <b>${
        feature.graphic.attributes.Latitude
      }</b> </br> Longitude : <b>${
        feature.graphic.attributes.Longitude
      }</b> </br> Operator Name : <b>${
        feature.graphic.attributes.OperatorName
          ? feature.graphic.attributes.OperatorName
          : ""
      }</b> </br> Status : <b>${
        feature.graphic.attributes.Status
          ? feature.graphic.attributes.Status
          : ""
      }</b>`;

    case "Interconnected Facilities":
      return `Facility Id : <b>${feature.graphic.attributes.PlantId}</b> </br>Facility Name : <b>${feature.graphic.attributes.Facility}</b> </br>Facility Type : <b>${feature.graphic.attributes.PlantType}</b> </br> Latitude : <b>${feature.graphic.attributes.Latitude}</b> </br> Longitude : <b>${feature.graphic.attributes.Longitude}</b>`;

    case "Emission Facilities":
      return `Facility Id : <b>${
        feature.graphic.attributes.PlantId
      }</b> </br>Facility Name : <b>${
        feature.graphic.attributes.Facility
      }</b> </br>Industry Type : <b>${
        feature.graphic.attributes.PlantType
      }</b> </br> Latitude : <b>${
        feature.graphic.attributes.Latitude
      }</b> </br> Longitude : <b>${
        feature.graphic.attributes.Longitude
      }</b> </br> Company1 : <b>${
        feature.graphic.attributes.Company1
          ? feature.graphic.attributes.Company1
          : ""
      }</b> </br> Company2 : <b>${
        feature.graphic.attributes.Company2
          ? feature.graphic.attributes.Company2
          : ""
      }</b> </br> Company3 : <b>${
        feature.graphic.attributes.Company3
          ? feature.graphic.attributes.Company3
          : ""
      }</b> </br> Reporting Year : <b>${
        feature.graphic.attributes.ReportingYear
          ? feature.graphic.attributes.ReportingYear
          : ""
      }</b> </br> Ghg Quantity Metric Tons Co2E : <b>${
        feature.graphic.attributes.GhgQuantityMetricTonsCo2E
          ? feature.graphic.attributes.GhgQuantityMetricTonsCo2E
          : ""
      }</b>`;
  }
};

export default fnFetchPopup;
