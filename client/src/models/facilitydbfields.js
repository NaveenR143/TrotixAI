export const fnFetchFacilityDbFields = (type, where) => {
  switch (type) {
    case 'gasstorage':
      return `SELECT DISTINCT GasStorageHeaderId AS GasStorageId,GasStorageName, OperatorName,OwnerName,Latitude,Longitude,CurrentTotalCapacity_BCF AS CurrentTotalCapacity_BCF,CurrentCushionCapacity_BCF AS CurrentCushionCapacity_BCF,CurrentWorkingCapacity_BCF AS CurrentWorkingCapacity_BCF,StateName,CountyName,Status FROM master.vgasstorageoverallheader WHERE ${where}`;
    case 'gasplant':
      return `SELECT DISTINCT GasPlantId,GasPlantName,OperatorName,OwnerName,Latitude,Longitude,GasProcessingCapacityMMSCFD,GasStorageCapacityMMSCF,Status,StateName,CountyName,TotalGasOperatingCapacityMMSCFD,TotalGasPlannedCapacityMMSCFD FROM master.vgasplantoverallheader WHERE ${where}`;
    case 'refinery':
      return `SELECT DISTINCT RefineryHeaderId AS RefineryId, RefineryName, OperatorName, OwnerName, Latitude, Longitude, Status, StateName, CountyName,TotalCrudeDistillationCapacity FROM master.vrefineryoverallheader WHERE ${where}`;
    case 'liquefaction':
      return `SELECT DISTINCT LiquefactionPlantHeaderId AS LiquefactionId, LiquefactionPlantName, OperatorName, OwnerName, Latitude, Longitude, StateName, CountyName,Status,TotalBaseloadCapacityBCF,TotalPeakloadCapacityBCF,TotalCapacityMMTPA FROM master.vliquefactionoverallheader WHERE ${where}`;
    case 'terminal':
      return `SELECT
      vt.TerminalHeaderId AS TerminalId,
      TerminalName,
      OperatorName,
      OwnerName,
      Latitude,
      Longitude,
      GROUP_CONCAT(
          CONCAT(
              IF(ch.CommodityHandled IS NULL, '', CONCAT('', ch.CommodityHandled)),
              IF(ch2.CommodityHandled IS NULL, '', CONCAT(', ', ch2.CommodityHandled)),
              IF(ch3.CommodityHandled IS NULL, '', CONCAT(', ', ch3.CommodityHandled)),
              IF(ch4.CommodityHandled IS NULL, '', CONCAT(', ', ch4.CommodityHandled))
          )
      ) AS CommodityHandled,
      StateName,
      CountyName,
      Status,
      TotalCapacityBarrels
  FROM
      master.vterminaloverallheader vt
      LEFT JOIN master.terminalunit tu ON tu.TerminalHeaderId = vt.TerminalHeaderId
      LEFT JOIN master.commodityhandled ch ON ch.CommodityHandledId = tu.CommodityHandled1Id
      LEFT JOIN master.commodityhandled ch2 ON ch2.CommodityHandledId = tu.CommodityHandled2Id
      LEFT JOIN master.commodityhandled ch3 ON ch3.CommodityHandledId = tu.CommodityHandled3Id
      LEFT JOIN master.commodityhandled ch4 ON ch4.CommodityHandledId = tu.CommodityHandled4Id
  WHERE
    ${where}
  GROUP BY
      vt.TerminalHeaderId,
      TerminalName,
      OperatorName,
      OwnerName,
      Latitude,
      Longitude,
      StateName,
      CountyName,
      Status,
      TotalCapacityBarrels;`;
    case 'permit':
      return `SELECT DISTINCT PermitsHeaderId AS PermitsId, APINumber, WellNameNumber, OperatorName, Latitude, Longitude, PermitApprovalDate, DrillingPermitType AS \`Status\`,DrillingPermitCode AS  StatusCode, StatusDate, ClassificationName AS WellClassification FROM master.vpermitsoverallheader WHERE ${where}`;
    case 'well':
      return `SELECT DISTINCT WellHeaderId AS WellsId, APINumber, WellName, OperatorName, Latitude, Longitude,PermitDate AS PermitApprovalDate,WellStatusName AS \`Status\`, WellStatusCode AS StatusCode, StatusDate,ClassificationName AS WellClassification FROM master.vwellsoverallheader WHERE ${where}`;
    case 'pipeline':
      return `SELECT 
                ph.PipelineHeaderId, 
                ph.PipelineName, 
                ps.PipelineSectionName, 
                lcs.LifeCycleStatus, 
                ph.PipesurfaceArea, 
                ph.PipelineCapacityBPD, 
                ph.PipelineCapacityBCFD, 
                ph.NominalDiameterInch, 
                ph.ReportedLengthMiles, 
                ph.LengthMilesType, 
                ph.ConfiguredReportedLengthMiles, 
                ph.TSP_FERC_CID, 
                ch.CommodityHandled, 
                o.OperatorName, 
                ow.OperatorName AS OwnerName, 
                dr.Direction, 
                TRUNCATE(ps.SectionLengthMiles, 2) AS SectionLengthMiles, 
                ps.Geom AS Coords, 
                ps.SegmentStatus, 
                date_format(
                  ps.SectionInservicedate, '%m-%d-%Y'
                ) AS 'SectionInservicedate' 
              FROM 
                master.pipelinesection ps 
                LEFT JOIN master.pipelineheader ph ON ph.PipelineHeaderId = ps.PipelineHeaderId 
                LEFT JOIN master.operator o ON o.OperatorId = ph.OperatorId 
                LEFT JOIN master.operator ow ON ow.OperatorId = ph.OwnerId 
                LEFT JOIN master.commodityhandled ch ON ch.CommodityHandledId = ph.CommodityId 
                LEFT JOIN master.direction dr ON dr.DirectionId = ps.DirectionId 
                LEFT JOIN master.lifecyclestatus lcs ON ph.LifeCycleStatusId = lcs.LifeCycleStatusId 
              WHERE 
                ps.PipelineHeaderId IN (
                  SELECT 
                    DISTINCT ph.PipelineHeaderId 
                  FROM 
                    master.pipelineheader ph 
                    LEFT JOIN master.pipelinesection ps ON ph.PipelineHeaderId = ps.PipelineHeaderId 
                    LEFT JOIN master.county cty ON ps.FromCountyId = cty.CountyId 
                    LEFT JOIN master.statename st ON st.StateNameId = ps.FromStateNameId 
                    LEFT JOIN master.operator op ON op.OperatorId = ph.OperatorId 
                    LEFT JOIN master.operator ow ON ow.OperatorId = ph.OwnerId 
                    LEFT JOIN master.operator c1 ON c1.OperatorId = op.Company1Id 
                    LEFT JOIN master.operator c2 ON c2.OperatorId = op.Company2Id 
                    LEFT JOIN master.operator c3 ON c3.OperatorId = op.Company3Id 
                    LEFT JOIN master.basin b ON b.BasinId = ps.FromBasinId 
                    LEFT JOIN master.regulatorytype rt ON rt.RegulatoryTypeId = ph.RegulatoryTypeId 
                    LEFT JOIN master.lifecyclestatus lcs ON lcs.LifeCycleStatus = ps.SegmentStatus 
                  WHERE 
                    ${where}
                ) 
                AND ps.Geom != 'null'`;
    case 'pipelinefacility':
      return `SELECT 
                DISTINCT ph.PipelineHeaderId, 
                ph.PipelineName, 
                ch.CommodityHandled, 
                rt.RegulatoryType, 
                ps.SegmentStatus, 
                ps.PipelineSectionId, 
                ps.PipelineSectionName, 
                ps.SectionFromDeviceTerminalType, 
                ps.SectionFromDeviceTerminal, 
                ps.SectionToDeviceTerminalType, 
                ps.SectionToDeviceTerminal, 
                o.OperatorName, 
                ow.OperatorName AS OwnerName, 
                off.Id AS FromId, 
                off.Latitude AS FromLatitude, 
                off.Longitude AS FromLongitude, 
                oft.Id AS ToId, 
                oft.Latitude AS ToLatitude, 
                oft.Longitude AS ToLongitude 
              FROM 
                master.pipelinesection ps 
                LEFT JOIN master.pipelineheader ph ON ph.PipelineHeaderId = ps.PipelineHeaderId 
                LEFT JOIN master.lifecyclestatus lcs ON lcs.LifeCycleStatusId = ph.LifeCycleStatusId 
                LEFT JOIN master.commodityhandled ch ON ch.CommodityHandledId = ph.CommodityId 
                LEFT JOIN master.regulatorytype rt ON rt.RegulatoryTypeId = ph.RegulatoryTypeId 
                LEFT JOIN master.operator o ON o.OperatorId = ph.OperatorId 
                LEFT JOIN master.operator ow ON ow.OperatorId = ph.OwnerId 
                LEFT JOIN master.voverallfacilities off ON off.Facilitytype = ps.SectionFromDeviceTerminalType 
                AND off.Id = ps.SectionFromDeviceTerminalId 
                LEFT JOIN master.voverallfacilities oft ON oft.Facilitytype = ps.SectionToDeviceTerminalType 
                AND oft.Id = ps.SectionToDeviceTerminalId 
              WHERE 
                ps.PipelineHeaderId IN (
                  SELECT 
                    DISTINCT ph.PipelineHeaderId 
                  FROM 
                    master.pipelineheader ph 
                    LEFT JOIN master.pipelinesection ps ON ph.PipelineHeaderId = ps.PipelineHeaderId 
                    LEFT JOIN master.county cty ON ps.FromCountyId = cty.CountyId 
                    LEFT JOIN master.statename st ON st.StateNameId = ps.FromStateNameId 
                    LEFT JOIN master.operator op ON op.OperatorId = ph.OperatorId 
                    LEFT JOIN master.operator ow ON ow.OperatorId = ph.OwnerId 
                    LEFT JOIN master.operator c1 ON c1.OperatorId = op.Company1Id 
                    LEFT JOIN master.operator c2 ON c2.OperatorId = op.Company2Id 
                    LEFT JOIN master.operator c3 ON c3.OperatorId = op.Company3Id 
                    LEFT JOIN master.basin b ON b.BasinId = ps.FromBasinId 
                    LEFT JOIN master.lifecyclestatus lcs ON lcs.LifeCycleStatus = ps.SegmentStatus 
                  WHERE 
                      ${where}
                ) 
              GROUP BY 
                ps.PipelineSectionId, 
                ph.PipelineName, 
                ch.CommodityHandled, 
                rt.RegulatoryType, 
                ps.SegmentStatus, 
                ps.PipelineSectionId, 
                ps.PipelineSectionName, 
                ps.SectionFromDeviceTerminalType, 
                ps.SectionFromDeviceTerminal, 
                ps.SectionToDeviceTerminalType, 
                ps.SectionToDeviceTerminal, 
                o.OperatorName, 
                ow.OperatorName, 
                off.Id, 
                off.Latitude, 
                off.Longitude, 
                oft.Id, 
                oft.Latitude, 
                oft.Longitude;`;
    case 'compressorstation':
      return `SELECT DISTINCT CompressorStationId, CompressorStationName, Longitude, Latitude, OperatorName, OwnerName, StateName, CountyName,Status,TotalPower,NumberOfEngines FROM master.vcompressorstationoverallheader WHERE ${where}`;
    case 'pumpingstation':
      return `SELECT DISTINCT PumpingStationId, PumpingStationName, Longitude, Latitude, OperatorName, OwnerName, StateName, CountyName,Status FROM master.vpumpingstationoverallheader WHERE ${where}`;
    case 'ccus':
      return `SELECT DISTINCT CCUSHeaderId,CCUSName,CountryName,CityName,CountyName,StateName,BasinName,OperatorName,OwnerName,Latitude,Longitude,Zipcode,Status,CCUSFunction,CaptureType,CaptureTechnology,CO2EndUse,CO2CaptureStoreMMTPA,InceptionDate,LocationQualifier,CO2TransportMode,FacilityType,FacilityName,EPCContractor FROM master.vccusoverallheader WHERE ${where}`;
    case 'co2storage':
      return `SELECT DISTINCT CO2StorageHeaderId,CO2StorageName,CountryName,CityName,CountyName,StateName,BasinName,OperatorName,OwnerName,Status,ReservoirType,CO2StorageCapacityMMTPA,InceptionDate,Longitude,Latitude,LocationQualifier,CO2EndUse,Zipcode FROM master.vco2storageoverallheader WHERE ${where}`;
    case 'hydrogenplant':
      return `SELECT DISTINCT HydrogenPlantHeaderId,HydrogenPlantName,CountryName,CityName,CountyName,StateName,BasinName,OperatorName,OwnerName,Status,Longitude,Latitude,IndustrialPlantType,LocationQualifier,Zipcode,TotalHydrogenCapacityMMSCFD FROM master.vhydrogenplantoverallheader WHERE ${where}`;
    case 'industrialplant':
      return `SELECT DISTINCT IndustrialPlantId,IndustrialPlantName,CityName,StateName,Zipcode,Status,CountyName,CountryName,BasinName,Latitude,Longitude,OperatorName,OwnerName,PipelineLocationCode FROM master.vindustrialplantoverallheader WHERE ${where}`;
    case 'powerplant':
      return `SELECT DISTINCT PowerPlantId,PowerPlantName,CityName,StateName,Zipcode,Status,CountyName,CountryName,BasinName,Latitude,Longitude,OperatorName,OwnerName FROM master.vpowerplantoverallheader WHERE ${where}`;
    case 'emissionfacilities':
      return `SELECT DISTINCT ef.EmissionFacilitiesId,ef.FacilityName,ef.GHGRPId,ef.IndustryType,ef.Latitude,ef.Longitude,ef.CityName,ef.CountyName,ef.StateName,ef.BasinName,ef.Company1,ef.Company2,ef.Company3,efq.ReportingYear,efq.GhgQuantityMetricTonsCo2E FROM master.vemissionfacilities ef LEFT JOIN master.emissionfacilitiesqnty efq ON efq.EmissionFacilityId = ef.EmissionFacilitiesId WHERE ${where}`;
  }
};

export const fnFetchFacilityCountDbFields = (type, where) => {
  switch (type) {
    case 'gasstorage':
      return `SELECT DISTINCT COUNT(GasStorageHeaderId) AS Total FROM master.vgasstorageoverallheader WHERE ${where}`;
    case 'gasplant':
      return `SELECT DISTINCT COUNT(GasPlantId) AS Total FROM master.vgasplantoverallheader WHERE ${where}`;
    case 'refinery':
      return `SELECT DISTINCT COUNT(RefineryHeaderId) AS Total FROM master.vrefineryoverallheader WHERE ${where}`;
    case 'liquefaction':
      return `SELECT DISTINCT COUNT(LiquefactionPlantHeaderId) AS Total FROM master.vliquefactionoverallheader WHERE ${where}`;
    case 'terminal':
      return `SELECT DISTINCT COUNT(vt.TerminalHeaderId) AS Total FROM master.vterminaloverallheader vt LEFT JOIN master.terminalunit tu ON tu.TerminalHeaderId = vt.TerminalHeaderId LEFT JOIN master.commodityhandled ch ON ch.CommodityHandledId = tu.CommodityHandled1Id LEFT JOIN master.commodityhandled ch2 ON ch2.CommodityHandledId = tu.CommodityHandled2Id LEFT JOIN master.commodityhandled ch3 ON ch3.CommodityHandledId = tu.CommodityHandled3Id LEFT JOIN master.commodityhandled ch4 ON ch4.CommodityHandledId = tu.CommodityHandled4Id WHERE ${where}`;
    case 'permit':
      return `SELECT DISTINCT COUNT(PermitsHeaderId) AS Total FROM master.vpermitsoverallheader WHERE ${where}`;
    case 'well':
      return `SELECT DISTINCT COUNT(WellHeaderId) AS Total FROM master.vwellsoverallheader WHERE ${where}`;
    case 'pipeline':
      return `SELECT COUNT(DISTINCT ph.PipelineHeaderId) AS Total FROM master.pipelineheader ph LEFT JOIN master.operator o ON o.OperatorId = ph.OperatorId LEFT JOIN master.operator ow ON ow.OperatorId = ph.OwnerId LEFT JOIN master.regulatorytype rt ON rt.RegulatoryTypeId = ph.RegulatoryTypeId LEFT JOIN master.commodityhandled ch ON ch.CommodityHandledId = ph.CommodityId INNER JOIN master.pipelinesection ps ON ps.PipelineHeaderId = ph.PipelineHeaderId LEFT JOIN master.lifecyclestatus lcs ON lcs.LifeCycleStatus = ps.SegmentStatus WHERE ${where}`;

    case 'pipelinefacility':
      return `SELECT DISTINCT COUNT(*) AS Total FROM master.pipelinesection ps LEFT JOIN master.pipelineheader ph ON ph.PipelineHeaderId = ps.PipelineHeaderId LEFT JOIN master.commodityhandled ch ON ch.CommodityHandledId = ph.CommodityId LEFT JOIN master.regulatorytype rt ON rt.RegulatoryTypeId = ph.RegulatoryTypeId LEFT JOIN master.operator o ON o.OperatorId = ph.OperatorId LEFT JOIN master.operator ow ON ow.OperatorId = ph.OwnerId LEFT JOIN master.voverallfacilities off ON off.Facilitytype = ps.SectionFromDeviceTerminalType AND off.Id = ps.SectionFromDeviceTerminalId LEFT JOIN master.voverallfacilities oft ON oft.Facilitytype = ps.SectionToDeviceTerminalType AND oft.Id = ps.SectionToDeviceTerminalId WHERE ps.PipelineHeaderId IN (SELECT DISTINCT ph.PipelineHeaderId FROM master.pipelineheader ph LEFT JOIN master.pipelinesection ps ON ph.PipelineHeaderId = ps.PipelineHeaderId LEFT JOIN master.county cty ON ps.FromCountyId = cty.CountyId LEFT JOIN master.statename st ON st.StateNameId = ps.FromStateNameId LEFT JOIN master.operator op ON op.OperatorId = ph.OperatorId LEFT JOIN master.operator ow ON ow.OperatorId = ph.OwnerId LEFT JOIN master.operator c1 ON c1.OperatorId = op.Company1Id LEFT JOIN master.operator c2 ON c2.OperatorId = op.Company2Id LEFT JOIN master.operator c3 ON c3.OperatorId = op.Company3Id LEFT JOIN master.basin b ON b.BasinId = ps.FromBasinId WHERE ${where}) GROUP BY ps.PipelineSectionId`;
    case 'compressorstation':
      return `SELECT DISTINCT COUNT(CompressorStationId) AS Total FROM master.vcompressorstationoverallheader WHERE ${where}`;
    case 'pumpingstation':
      return `SELECT DISTINCT COUNT(PumpingStationId) AS Total FROM master.vpumpingstationoverallheader WHERE ${where}`;
    case 'ccus':
      return `SELECT DISTINCT COUNT(CCUSHeaderId) AS Total FROM master.vccusoverallheader WHERE ${where}`;
    case 'co2storage':
      return `SELECT DISTINCT COUNT(CO2StorageHeaderId) AS Total FROM master.vco2storageoverallheader WHERE ${where}`;
    case 'hydrogenplant':
      return `SELECT DISTINCT COUNT(HydrogenPlantHeaderId) AS Total FROM master.vhydrogenplantoverallheader WHERE ${where}`;
    case 'industrialplant':
      return `SELECT DISTINCT COUNT(IndustrialPlantId) AS Total FROM master.vindustrialplantoverallheader WHERE ${where}`;
    case 'powerplant':
      return `SELECT DISTINCT COUNT(PowerPlantId) AS Total FROM master.vpowerplantoverallheader WHERE ${where}`;
    case 'emissionfacilities':
      return `SELECT DISTINCT COUNT(ef.EmissionFacilitiesId) AS Total FROM master.vemissionfacilities ef LEFT JOIN master.emissionfacilitiesqnty efq ON efq.EmissionFacilityId = ef.EmissionFacilitiesId WHERE ${where}`;
  }
};
