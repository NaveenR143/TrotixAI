export const fnFetchFacilityQuery = (type, lat, long, radius) => {
  switch (type) {
    case 'Gas Storage':
      return `SELECT vgs.Id AS FacilityId, vgs.GasStorageName AS FacilityName, vgs.Latitude,vgs.Longitude,vgs.OperatorName,vgs.CurrentCushionCapacity_BCF,vgs.CurrentWorkingCapacity_BCF,vgs.CurrentTotalCapacity_BCF,vgs.Status,SQRT(POW(69.1 * (vgs.Latitude -  ${lat}), 2) + POW(69.1 * (${long} - vgs.Longitude) * COS(vgs.Latitude / 57.3), 2)) AS NearByDistance  FROM master.vgasstorageheader vgs HAVING NearByDistance < ${radius};`;
    case 'Gas Plant':
      return {
        attributes: {
          ObjectId: shortid.generate(),
          Facility: facility.GasPlantName ? facility.GasPlantName : facility.FacilityName,
          Latitude: facility.Latitude,
          Longitude: facility.Longitude,
          PlantId: facility.GasPlantId ? facility.GasPlantId : facility.FacilityId,
          PlantType: 'Gas Plant',
          OperatorName: facility.OperatorName,
          GasProcessingCapacity:
            facility.GasProcessingCapacityMMSCFD === null
              ? ''
              : facility.GasProcessingCapacityMMSCFD,
          TotalGasOperatingCapacity:
            facility.TotalGasOperatingCapacityMMSCFD === null
              ? ''
              : facility.TotalGasOperatingCapacityMMSCFD,
          TotalGasPlannedCapacity:
            facility.TotalGasPlannedCapacityMMSCFD === null
              ? ''
              : facility.TotalGasPlannedCapacityMMSCFD,
          Status: facility.Status,
        },
        geometry: {
          latitude: facility.Latitude,
          longitude: facility.Longitude,
          type: 'point',
        },
      };

    case 'Refinery':
      return {
        attributes: {
          ObjectId: shortid.generate(),
          Facility: facility.RefineryName ? facility.RefineryName : facility.FacilityName,
          Latitude: facility.Latitude,
          Longitude: facility.Longitude,
          PlantId: facility.RefineryId ? facility.RefineryId : facility.FacilityId,
          PlantType: 'Refinery',
          OperatorName: facility.OperatorName,
          TotalCrudeDistillationCapacity:
            facility.TotalCrudeDistillationCapacity === null
              ? ''
              : facility.TotalCrudeDistillationCapacity,
          Status: facility.Status,
        },
        geometry: {
          latitude: facility.Latitude,
          longitude: facility.Longitude,
          type: 'point',
        },
      };

    case 'Liquefaction':
      return {
        attributes: {
          ObjectId: shortid.generate(),
          Facility: facility.LiquefactionPlantName
            ? facility.LiquefactionPlantName
            : facility.FacilityName,
          Latitude: facility.Latitude,
          Longitude: facility.Longitude,
          PlantId: facility.LiquefactionId ? facility.LiquefactionId : facility.FacilityId,
          PlantType: 'Liquefaction',
          OperatorName: facility.OperatorName,
          TotalBaseloadCapacity:
            facility.TotalBaseloadCapacityBCF === null ? '' : facility.TotalBaseloadCapacityBCF,
          TotalPeakloadCapacity:
            facility.TotalPeakloadCapacityBCF === null ? '' : facility.TotalPeakloadCapacityBCF,
          TotalCapacityMMTPA:
            facility.TotalCapacityMMTPA === null ? '' : facility.TotalCapacityMMTPA,
          Status: facility.Status,
        },
        geometry: {
          latitude: facility.Latitude,
          longitude: facility.Longitude,
          type: 'point',
        },
      };

    case 'Terminal':
      return {
        attributes: {
          ObjectId: shortid.generate(),
          Facility: facility.TerminalName ? facility.TerminalName : facility.FacilityName,
          Latitude: facility.Latitude,
          Longitude: facility.Longitude,
          PlantId: facility.TerminalId ? facility.TerminalId : facility.FacilityId,
          PlantType: 'Terminal',
          OperatorName: facility.OperatorName,
          CommodityHandled: facility.CommodityHandled,
          TotalCapacityBarrels:
            facility.TotalCapacityBarrels === null ? '' : facility.TotalCapacityBarrels,
          Status: facility.Status,
        },
        geometry: {
          latitude: facility.Latitude,
          longitude: facility.Longitude,
          type: 'point',
        },
      };

    case 'Permit':
      return {
        attributes: {
          ObjectId: shortid.generate(),
          Facility: facility.WellNameNumber,
          Latitude: facility.Latitude,
          Longitude: facility.Longitude,
          PlantId: facility.PermitsId,
          PlantType: 'Permit',
          OperatorName: facility.OperatorName,
          StatusCode: facility.StatusCode,
          Status: facility.Status,
        },
        geometry: {
          latitude: facility.Latitude,
          longitude: facility.Longitude,
          type: 'point',
        },
      };

    case 'Well':
      return {
        attributes: {
          ObjectId: shortid.generate(),
          Facility: facility.WellName,
          Latitude: facility.Latitude,
          Longitude: facility.Longitude,
          PlantId: facility.WellsId,
          PlantType: 'Well',
          OperatorName: facility.OperatorName,
          StatusCode: facility.StatusCode,
          Status: facility.Status,
        },
        geometry: {
          latitude: facility.Latitude,
          longitude: facility.Longitude,
          type: 'point',
        },
      };

    case 'Pipeline': {
      return {
        attributes: {
          ObjectId: shortid.generate(),
          Facility: facility.PipelineName ? facility.PipelineName : facility.FacilityName,
          Section: facility.PipelineSectionName,
          CommodityHandled: facility.CommodityHandled,
          PlantId: facility.PipelineHeaderId ? facility.PipelineHeaderId : facility.FacilityId,
          PlantType: 'Pipeline',
          OperatorName: facility.OperatorName,
          Direction: facility.Direction,
        },
        geometry: {
          type: 'polyline',
          paths:
            typeof facility.Coords === 'object'
              ? facility.Coords.coordinates
              : JSON.parse(facility.Coords).coordinates,
        },
      };
    }
    case 'PipelineFacility': {
      return {
        attributes: {
          ObjectId: shortid.generate(),
          Facility: facility.Facility,
          AssemblyType: facility.PlantType,
          Latitude: facility.Latitude,
          Longitude: facility.Longitude,
          PlantId: facility.PlantId ? facility.PlantId : facility.FacilityId,
          PlantType: 'Pipeline Assembly',
          PipelineHeaderId: facility.PipelineHeaderId,
          PipelineName: facility.PipelineName,
          PipelineProduct: facility.PipelineProduct,
          SectionId: facility.SectionId,
          SectionName: facility.SectionName,
        },
        geometry: {
          latitude: facility.Latitude,
          longitude: facility.Longitude,
          type: 'point',
        },
      };
    }
    case 'Compressor Station': {
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
          PlantType: 'Compressor Station',
          OperatorName: facility.OperatorName,
          Status: facility.Status,
          Status: facility.TotalPower,
          Status: facility.NumberOfEngines,
        },
        geometry: {
          latitude: facility.Latitude,
          longitude: facility.Longitude,
          type: 'point',
        },
      };
    }
    case 'Pumping Station': {
      return {
        attributes: {
          ObjectId: shortid.generate(),
          Facility: facility.PumpingStationName
            ? facility.PumpingStationName
            : facility.FacilityName,
          Latitude: facility.Latitude,
          Longitude: facility.Longitude,
          PlantId: facility.PumpingStationId ? facility.PumpingStationId : facility.FacilityId,
          PlantType: 'Pumping Station',
          OperatorName: facility.OperatorName,
          Status: facility.Status,
        },
        geometry: {
          latitude: facility.Latitude,
          longitude: facility.Longitude,
          type: 'point',
        },
      };
    }
    case 'CCUS': {
      return {
        attributes: {
          ObjectId: shortid.generate(),
          Facility: facility.CCUSName ? facility.CCUSName : facility.FacilityName,
          Latitude: facility.Latitude,
          Longitude: facility.Longitude,
          PlantId: facility.CCUSHeaderId ? facility.CCUSHeaderId : facility.FacilityId,
          PlantType: 'CCUS',
          OperatorName: facility.OperatorName,
          CO2CaptureStoreMMTPA:
            facility.CO2CaptureStoreMMTPA === null ? '' : facility.CO2CaptureStoreMMTPA,
          Status: facility.Status,
        },
        geometry: {
          latitude: facility.Latitude,
          longitude: facility.Longitude,
          type: 'point',
        },
      };
    }
    case 'CO2 Storage': {
      return {
        attributes: {
          ObjectId: shortid.generate(),
          Facility: facility.CO2StorageName ? facility.CO2StorageName : facility.FacilityName,
          Latitude: facility.Latitude,
          Longitude: facility.Longitude,
          PlantId: facility.CO2StorageHeaderId ? facility.CO2StorageHeaderId : facility.FacilityId,
          PlantType: 'CO2 Storage',
          OperatorName: facility.OperatorName,
          CO2StorageCapacity:
            facility.CO2StorageCapacityMMTPA === null ? '' : facility.CO2StorageCapacityMMTPA,
          Status: facility.Status,
        },
        geometry: {
          latitude: facility.Latitude,
          longitude: facility.Longitude,
          type: 'point',
        },
      };
    }
    case 'Hydrogen Plant': {
      return {
        attributes: {
          ObjectId: shortid.generate(),
          Facility: facility.HydrogenPlantName ? facility.HydrogenPlantName : facility.FacilityName,
          Latitude: facility.Latitude,
          Longitude: facility.Longitude,
          PlantId: facility.HydrogenPlantHeaderId
            ? facility.HydrogenPlantHeaderId
            : facility.FacilityId,
          PlantType: 'Hydrogen Plant',
          OperatorName: facility.OperatorName,
          TotalHydrogenCapacity:
            facility.TotalHydrogenCapacityMMSCFD === null
              ? ''
              : facility.TotalHydrogenCapacityMMSCFD,
          Status: facility.Status,
        },
        geometry: {
          latitude: facility.Latitude,
          longitude: facility.Longitude,
          type: 'point',
        },
      };
    }
    case 'Industrial Plant': {
      return {
        attributes: {
          ObjectId: shortid.generate(),
          Facility: facility.IndustrialPlantName
            ? facility.IndustrialPlantName
            : facility.FacilityName,
          Latitude: facility.Latitude,
          Longitude: facility.Longitude,
          PlantId: facility.IndustrialPlantId ? facility.IndustrialPlantId : facility.FacilityId,
          PlantType: 'Industrial Plant',
          OperatorName: facility.OperatorName,
          Status: facility.Status,
        },
        geometry: {
          latitude: facility.Latitude,
          longitude: facility.Longitude,
          type: 'point',
        },
      };
    }
    case 'Power Plant': {
      return {
        attributes: {
          ObjectId: shortid.generate(),
          Facility: facility.PowerPlantName ? facility.PowerPlantName : facility.FacilityName,
          Latitude: facility.Latitude,
          Longitude: facility.Longitude,
          PlantId: facility.PowerPlantId ? facility.PowerPlantId : facility.FacilityId,
          PlantType: 'Power Plant',
          OperatorName: facility.OperatorName,
          Status: facility.Status,
        },
        geometry: {
          latitude: facility.Latitude,
          longitude: facility.Longitude,
          type: 'point',
        },
      };
    }
    case 'Interconnected Facilities': {
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
          type: 'point',
        },
      };
    }
  }
};