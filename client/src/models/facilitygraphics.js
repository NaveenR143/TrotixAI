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

// eslint-disable-next-line consistent-return
const fnFetchFacilityGraphics = (facility, shortid, type) => {
  switch (type) {
    case GAS_STORAGE:
      return {
        attributes: {
          ObjectId: shortid.generate(),
          Facility: facility.GasStorageName
            ? facility.GasStorageName
            : facility.FacilityName,
          Latitude: facility.Latitude,
          Longitude: facility.Longitude,
          PlantId: facility.GasStorageId
            ? facility.GasStorageId
            : facility.FacilityId,
          PlantType: GAS_STORAGE,
          OperatorName: facility.OperatorName,
          CurrentCushionCapacity: facility.CurrentCushionCapacity_BCF,
          CurrentWorkingCapacity: facility.CurrentWorkingCapacity_BCF,
          CurrentTotalCapacity: facility.CurrentTotalCapacity_BCF,
          Status: facility.Status,
        },
        geometry: {
          latitude: facility.Latitude,
          longitude: facility.Longitude,
          type: "point",
        },
      };

    case GAS_PLANT:
      return {
        attributes: {
          ObjectId: shortid.generate(),
          Facility: facility.GasPlantName
            ? facility.GasPlantName
            : facility.FacilityName,
          Latitude: facility.Latitude,
          Longitude: facility.Longitude,
          PlantId: facility.GasPlantId
            ? facility.GasPlantId
            : facility.FacilityId,
          PlantType: GAS_PLANT,
          OperatorName: facility.OperatorName,
          GasProcessingCapacity:
            facility.GasProcessingCapacityMMSCFD === null
              ? ""
              : facility.GasProcessingCapacityMMSCFD,
          TotalGasOperatingCapacity:
            facility.TotalGasOperatingCapacityMMSCFD === null
              ? ""
              : facility.TotalGasOperatingCapacityMMSCFD,
          TotalGasPlannedCapacity:
            facility.TotalGasPlannedCapacityMMSCFD === null
              ? ""
              : facility.TotalGasPlannedCapacityMMSCFD,
          Status: facility.Status,
        },
        geometry: {
          latitude: facility.Latitude,
          longitude: facility.Longitude,
          type: "point",
        },
      };

    case REFINERY:
      return {
        attributes: {
          ObjectId: shortid.generate(),
          Facility: facility.RefineryName
            ? facility.RefineryName
            : facility.FacilityName,
          Latitude: facility.Latitude,
          Longitude: facility.Longitude,
          PlantId: facility.RefineryId
            ? facility.RefineryId
            : facility.FacilityId,
          PlantType: REFINERY,
          OperatorName: facility.OperatorName,
          TotalCrudeDistillationCapacity:
            facility.TotalCrudeDistillationCapacity === null
              ? ""
              : facility.TotalCrudeDistillationCapacity,
          Status: facility.Status,
        },
        geometry: {
          latitude: facility.Latitude,
          longitude: facility.Longitude,
          type: "point",
        },
      };

    case LIQUEFACTION:
      return {
        attributes: {
          ObjectId: shortid.generate(),
          Facility: facility.LiquefactionPlantName
            ? facility.LiquefactionPlantName
            : facility.FacilityName,
          Latitude: facility.Latitude,
          Longitude: facility.Longitude,
          PlantId: facility.LiquefactionId
            ? facility.LiquefactionId
            : facility.FacilityId,
          PlantType: LIQUEFACTION,
          OperatorName: facility.OperatorName,
          TotalBaseloadCapacity:
            facility.TotalBaseloadCapacityBCF === null
              ? ""
              : facility.TotalBaseloadCapacityBCF,
          TotalPeakloadCapacity:
            facility.TotalPeakloadCapacityBCF === null
              ? ""
              : facility.TotalPeakloadCapacityBCF,
          TotalCapacityMMTPA:
            facility.TotalCapacityMMTPA === null
              ? ""
              : facility.TotalCapacityMMTPA,
          Status: facility.Status,
        },
        geometry: {
          latitude: facility.Latitude,
          longitude: facility.Longitude,
          type: "point",
        },
      };

    case TERMINAL:
      return {
        attributes: {
          ObjectId: shortid.generate(),
          Facility: facility.TerminalName
            ? facility.TerminalName
            : facility.FacilityName,
          Latitude: facility.Latitude,
          Longitude: facility.Longitude,
          PlantId: facility.TerminalId
            ? facility.TerminalId
            : facility.FacilityId,
          PlantType: TERMINAL,
          OperatorName: facility.OperatorName,
          CommodityHandled: facility.CommodityHandled,
          TotalCapacityBarrels:
            facility.TotalCapacityBarrels === null
              ? ""
              : facility.TotalCapacityBarrels,
          Status: facility.Status,
        },
        geometry: {
          latitude: facility.Latitude,
          longitude: facility.Longitude,
          type: "point",
        },
      };

    case PIPELINE: {
      return {
        attributes: {
          ObjectId: shortid.generate(),
          Facility: facility.PipelineName
            ? facility.PipelineName
            : facility.FacilityName,
          Section: facility.PipelineSectionName,
          CommodityHandled: facility.CommodityHandled,
          PlantId: facility.PipelineHeaderId
            ? facility.PipelineHeaderId
            : facility.FacilityId,
          PlantType: PIPELINE,
          OperatorName: facility.OperatorName,
          Direction: facility.Direction,
        },
        geometry: {
          type: "polyline",
          paths:
            typeof facility.Coords === "object"
              ? facility.Coords.coordinates
              : JSON.parse(facility.Coords).coordinates,
        },
      };
    }
    case PIPELINE_FACILITY: {
      return {
        attributes: {
          ObjectId: shortid.generate(),
          Facility: facility.Facility,
          AssemblyType: facility.PlantType,
          Latitude: facility.Latitude,
          Longitude: facility.Longitude,
          PlantId: facility.PlantId ? facility.PlantId : facility.FacilityId,
          PlantType: "Pipeline Assembly",
          PipelineHeaderId: facility.PipelineHeaderId,
          PipelineName: facility.PipelineName,
          PipelineProduct: facility.PipelineProduct,
          SectionId: facility.SectionId,
          SectionName: facility.SectionName,
        },
        geometry: {
          latitude: facility.Latitude,
          longitude: facility.Longitude,
          type: "point",
        },
      };
    }
    case COMPRESSOR_STATION: {
      return {
        attributes: {
          ObjectId: shortid.generate(),
          Facility: facility.CompressorStationName
            ? facility.CompressorStationName
            : facility.FacilityName,
          Latitude: facility.Latitude,
          Longitude: facility.Longitude,
          PlantId: facility.CompressorStationId
            ? facility.CompressorStationId
            : facility.FacilityId,
          PlantType: COMPRESSOR_STATION,
          OperatorName: facility.OperatorName,
          Status: facility.Status,
          TotalPower: facility.TotalPower,
          NumberOfEngines: facility.NumberOfEngines,
        },
        geometry: {
          latitude: facility.Latitude,
          longitude: facility.Longitude,
          type: "point",
        },
      };
    }
    case PUMPING_STATION: {
      return {
        attributes: {
          ObjectId: shortid.generate(),
          Facility: facility.PumpingStationName
            ? facility.PumpingStationName
            : facility.FacilityName,
          Latitude: facility.Latitude,
          Longitude: facility.Longitude,
          PlantId: facility.PumpingStationId
            ? facility.PumpingStationId
            : facility.FacilityId,
          PlantType: PUMPING_STATION,
          OperatorName: facility.OperatorName,
          Status: facility.Status,
        },
        geometry: {
          latitude: facility.Latitude,
          longitude: facility.Longitude,
          type: "point",
        },
      };
    }

    case INDUSTRIAL_PLANT: {
      return {
        attributes: {
          ObjectId: shortid.generate(),
          Facility: facility.IndustrialPlantName
            ? facility.IndustrialPlantName
            : facility.FacilityName,
          Latitude: facility.Latitude,
          Longitude: facility.Longitude,
          PlantId: facility.IndustrialPlantId
            ? facility.IndustrialPlantId
            : facility.FacilityId,
          PlantType: INDUSTRIAL_PLANT,
          OperatorName: facility.OperatorName,
          Status: facility.Status,
        },
        geometry: {
          latitude: facility.Latitude,
          longitude: facility.Longitude,
          type: "point",
        },
      };
    }
    case POWER_PLANT: {
      return {
        attributes: {
          ObjectId: shortid.generate(),
          Facility: facility.PowerPlantName
            ? facility.PowerPlantName
            : facility.FacilityName,
          Latitude: facility.Latitude,
          Longitude: facility.Longitude,
          PlantId: facility.PowerPlantId
            ? facility.PowerPlantId
            : facility.FacilityId,
          PlantType: POWER_PLANT,
          OperatorName: facility.OperatorName,
          Status: facility.Status,
        },
        geometry: {
          latitude: facility.Latitude,
          longitude: facility.Longitude,
          type: "point",
        },
      };
    }
    case "Interconnected Facilities": {
      return {
        attributes: {
          ObjectId: shortid.generate(),
          Facility: facility.FacilityName,
          Latitude: facility.Latitude,
          Longitude: facility.Longitude,
          PlantId: facility.FacilityId,
          PlantType: facility.FacilityType,
        },
        geometry: {
          latitude: facility.Latitude,
          longitude: facility.Longitude,
          type: "point",
        },
      };
    }
    case "Emission Facilities": {
      return {
        attributes: {
          ObjectId: shortid.generate(),
          Facility: facility.FacilityName,
          Latitude: facility.Latitude,
          Longitude: facility.Longitude,
          PlantId: facility.EmissionFacilitiesId,
          PlantType: facility.IndustryType,
          Company1: facility.Company1,
          Company2: facility.Company2,
          Company3: facility.Company3,
          ReportingYear: facility.ReportingYear,
          GhgQuantityMetricTonsCo2E: facility.GhgQuantityMetricTonsCo2E,
          FacilityType: "EmissionFacilities",
        },
        geometry: {
          latitude: facility.Latitude,
          longitude: facility.Longitude,
          type: "point",
        },
      };
    }
  }
};

export default fnFetchFacilityGraphics;
