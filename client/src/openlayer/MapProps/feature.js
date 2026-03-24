import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import Map from "ol/Map";
import Overlay from "ol/Overlay";
import View from "ol/View";
import { fromLonLat } from "ol/proj";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Circle from "ol/style/Circle";
import Text from "ol/style/Text";
import MultiLineString from "ol/geom/MultiLineString";
import {
  COMPRESSOR_STATION,
  GAS_STORAGE,
  INDUSTRIAL_PLANT,
  LIQUEFACTION,
  POWER_PLANT,
  PUMPING_STATION,
  REFINERY,
  TERMINAL,
  DATA_CENTERS
} from "../../models/facilitytypes";

// const feature = new Feature({
//   geometry: new Point(fromLonLat([lon, lat])),
//   name: item.GasPlant, // Store the location name as a property
// });

const fnFetchOLFeature = (ftype, item, lon, lat) => {
  switch (ftype) {
    case "Gas Plant":
      // {
      //     GasPlantId: 292,
      //     GasPlant: "Pecos Diamond",
      //     Country: "United States",
      //     City: "Atoka",
      //     County: "Eddy",
      //     State: "New Mexico",
      //     Basin: "Permian Basin",
      //     Zipcode: null,
      //     Operator: "DCP Midstream",
      //     Owner: "DCP Midstream",
      //     Latitude: 32.77049,
      //     Longitude: -104.26937,
      //     GasProcessingCapacityMMSCFD: 260,
      //     GasStorageCapacityMMSCF: null,
      //     NGLStorageCapacityBbl: null,
      //     BTUContentGasSoldJOULES: 1081,
      //     TotalGasOperatingCapacityMMSCFD: 260,
      //     TotalGasPlannedCapacityMMSCFD: 0,
      //     TotalNGLOperatingCapacityBbld: 110000,
      //     TotalNGLPlannedCapacityBbld: 0,
      //     PlantCommissioned: null,
      //     Treatment: 0,
      //     NGLExtraction: 0,
      //     Fractionation: 1,
      //     Status: "Active",
      //     Projects: 0,
      //}

      return new Feature({
        geometry: new Point(fromLonLat([lon, lat])),
        Facility: item.GasPlant || item.FacilityName || item["Facility Name"], // Store the location name as a property
        Longitude: lon,
        Latitude: lat,
        PlantType: "Gas Plant",
        Operator: item.Operator === null ? "" : item.Operator,
        Owner: item.Owner === null ? "" : item.Owner,
        State: item.State === null ? "" : item.State,
        County: item.County === null ? "" : item.County,
        Basin: item.Basin === null ? "" : item.Basin,
        GasProcessingCapacityMMSCFD:
          item.GasProcessingCapacityMMSCFD === null
            ? ""
            : item.GasProcessingCapacityMMSCFD,
        TotalGasOperatingCapacityMMSCFD:
          item.TotalGasOperatingCapacityMMSCFD === null
            ? ""
            : item.TotalGasOperatingCapacityMMSCFD,
        TotalGasPlannedCapacityMMSCFD:
          item.TotalGasPlannedCapacityMMSCFD === null
            ? ""
            : item.TotalGasPlannedCapacityMMSCFD,
        Status: item.Status || item.status,
        GasPlantId: item.GasPlantId || item.FacilityId,
      });

    case "Gas Storage":
      return new Feature({
        geometry: new Point(fromLonLat([lon, lat])),
        Facility: item.GasStorage
          ? item.GasStorage
          : item.FacilityName || item.Facility, // Store the location name as a property
        Longitude: lon,
        Latitude: lat,
        PlantType: GAS_STORAGE,
        Operator: item.Operator === null ? "" : item.Operator,
        Owner: item.Owner === null ? "" : item.Owner,
        State: item.State === null ? "" : item.State,
        County: item.County === null ? "" : item.County,
        Basin: item.Basin === null ? "" : item.Basin,
        CushionCapacityBCF:
          item.CushionCapacityBCF === null ? "" : item.CushionCapacityBCF,
        WorkingCapacityBCF:
          item.WorkingCapacityBCF === null ? "" : item.WorkingCapacityBCF,
        TotalCapacityBCF:
          item.TotalCapacityBCF === null ? "" : item.TotalCapacityBCF,
        Status: item.Status || item.status,
        GasStorageId: item.GasStorageId || item.FacilityId,
      });
    case "Liquefaction":
    case "LNG":
      return new Feature({
        geometry: new Point(fromLonLat([lon, lat])),
        Facility: item.LNGPlant
          ? item.LNGPlant
          : item.FacilityName || item.Facility, // Store the location name as a property
        Longitude: lon,
        Latitude: lat,
        PlantType: LIQUEFACTION,
        Operator: item.Operator === null ? "" : item.Operator,
        Owner: item.Owner === null ? "" : item.Owner,
        State: item.State === null ? "" : item.State,
        County: item.County === null ? "" : item.County,
        Basin: item.Basin === null ? "" : item.Basin,
        TotalBaseloadCapacityBCF:
          item.TotalBaseloadCapacityBCF === null
            ? ""
            : item.TotalBaseloadCapacityBCF,
        TotalPeakloadCapacityBCF:
          item.TotalPeakloadCapacityBCF === null
            ? ""
            : item.TotalPeakloadCapacityBCF,
        TotalCapacityMMTPA:
          item.TotalCapacityMMTPA === null ? "" : item.TotalCapacityMMTPA,
        Status: item.Status || item.status,
        LNGId: item.LNGId || item.FacilityId,
      });

    case "Refinery":
      return new Feature({
        geometry: new Point(fromLonLat([lon, lat])),
        Facility: item.Refinery
          ? item.Refinery
          : item.FacilityName || item.Facility, // Store the location name as a property
        Longitude: lon,
        Latitude: lat,
        PlantType: REFINERY,
        Operator: item.Operator === null ? "" : item.Operator,
        Owner: item.Owner === null ? "" : item.Owner,
        State: item.State === null ? "" : item.State,
        County: item.County === null ? "" : item.County,
        Basin: item.Basin === null ? "" : item.Basin,
        TotalCrudeDistillationCapacity:
          item.TotalCrudeDistillationCapacity === null
            ? ""
            : item.TotalCrudeDistillationCapacity,
        Status: item.Status || item.status,
        RefineryId: item.RefineryId || item.FacilityId,
      });

    case "Terminal":
      return new Feature({
        geometry: new Point(fromLonLat([lon, lat])),
        Facility: item.Terminal
          ? item.Terminal
          : item.FacilityName || item.Facility, // Store the location name as a property
        Longitude: lon,
        Latitude: lat,
        PlantType: TERMINAL,
        Operator: item.Operator === null ? "" : item.Operator,
        Owner: item.Owner === null ? "" : item.Owner,
        State: item.State === null ? "" : item.State,
        County: item.County === null ? "" : item.County,
        Basin: item.Basin === null ? "" : item.Basin,
        TerminalType: item.TerminalType === null ? "" : item.TerminalType,
        TotalCapacityBarrels:
          item.TotalCapacityBarrels === null ? "" : item.TotalCapacityBarrels,
        Status: item.Status || item.status,
        TerminalId: item.TerminalId || item.FacilityId,
      });

    case "Compressor Station":
      return new Feature({
        geometry: new Point(fromLonLat([lon, lat])),
        Facility: item.CompressorStation
          ? item.CompressorStation
          : item.FacilityName || item.Facility, // Store the location name as a property
        Longitude: lon,
        Latitude: lat,
        PlantType: COMPRESSOR_STATION,
        Operator: item.Operator === null ? "" : item.Operator,
        Owner: item.Owner === null ? "" : item.Owner,
        State: item.State === null ? "" : item.State,
        County: item.County === null ? "" : item.County,
        Basin: item.Basin === null ? "" : item.Basin,
        TotalPower: item.TotalPower === null ? "" : item.TotalPower,
        NumberOfEngines:
          item.NumberOfEngines === null ? "" : item.NumberOfEngines,
        NumberOfTurbines:
          item.NumberOfTurbines === null ? "" : item.NumberOfTurbines,
        NumberOfMotors: item.NumberOfMotors === null ? "" : item.NumberOfMotors,
        Status: item.Status || item.status,
        CompressorStationId: item.CompressorStationId || item.FacilityId,
      });

    case "Pumping Station":
      return new Feature({
        geometry: new Point(fromLonLat([lon, lat])),
        Facility: item.PumpingStation
          ? item.PumpingStation
          : item.FacilityName || item.Facility, // Store the location name as a property
        Longitude: lon,
        Latitude: lat,
        PlantType: PUMPING_STATION,
        Operator: item.Operator === null ? "" : item.Operator,
        Owner: item.Owner === null ? "" : item.Owner,
        State: item.State === null ? "" : item.State,
        County: item.County === null ? "" : item.County,
        Basin: item.Basin === null ? "" : item.Basin,
        CommodityHandled:
          item.CommodityHandled === null ? "" : item.CommodityHandled,
        Status: item.Status || item.status,
        PumpingStationId: item.PumpingStationId || item.FacilityId,
      });

    case "Industrial Plant":
    case "Industrial Plants":
      return new Feature({
        geometry: new Point(fromLonLat([lon, lat])),
        Facility: item.IndustrialPlant
          ? item.IndustrialPlant
          : item.FacilityName || item.Facility, // Store the location name as a property
        Longitude: lon,
        Latitude: lat,
        PlantType: INDUSTRIAL_PLANT,
        Operator: item.Operator === null ? "" : item.Operator,
        Owner: item.Owner === null ? "" : item.Owner,
        State: item.State === null ? "" : item.State,
        County: item.County === null ? "" : item.County,
        Basin: item.Basin === null ? "" : item.Basin,
        Status: item.Status || item.status,
        IndustrialPlantId: item.IndustrialPlantId || item.FacilityId,
      });
    case "Power Plant":
      return new Feature({
        geometry: new Point(fromLonLat([lon, lat])),
        Facility: item.PowerPlant
          ? item.PowerPlant
          : item.FacilityName || item.Facility, // Store the location name as a property
        Longitude: lon,
        Latitude: lat,
        PlantType: POWER_PLANT,
        Operator: item.Operator === null ? "" : item.Operator,
        Owner: item.Owner === null ? "" : item.Owner,
        State: item.State === null ? "" : item.State,
        County: item.County === null ? "" : item.County,
        Basin: item.Basin === null ? "" : item.Basin,
        Status: item.Status || item.status,
        Technologies: item.Technologies === null ? "" : item.Technologies,
        Fuels: item.Fuels === null ? "" : item.Fuels,
        OperatingMonths: item.OperatingMonths === null ? "" : item.OperatingMonths,
        NameplateCapacityMW: item.NameplateCapacityMW === null ? "" : item.NameplateCapacityMW,
        NameplatePowerFactor: item.NameplatePowerFactor === null ? "" : item.NameplatePowerFactor,
        SummerCapacityMW: item.SummerCapacityMW === null ? "" : item.SummerCapacityMW,
        WinterCapacityMW: item.WinterCapacityMW === null ? "" : item.WinterCapacityMW,
        MinimumLoadMW: item.MinimumLoadMW === null ? "" : item.MinimumLoadMW,
        PowerPlantId: item.PowerPlantId || item.FacilityId,
      });

    case "DataCenters":
      return new Feature({
        geometry: new Point(fromLonLat([lon, lat])),
        Facility: item.DataCenter
          ? item.DataCenter
          : item.FacilityName || item.Facility, // Store the location name as a property
        Longitude: lon,
        Latitude: lat,
        PlantType: DATA_CENTERS,
        Operator: item.Operator === null ? "" : item.Operator,
        Owner: item.Owner === null ? "" : item.Owner,
        State: item.State === null ? "" : item.State,
        County: item.County === null ? "" : item.County,
        Basin: item.Basin === null ? "" : item.Basin,
        TotalAreaSQF:
          item.TotalAreaSQF === null ? "" : item.TotalAreaSQF,
        TotalPowerMW:
          item.TotalPowerMW === null ? "" : item.TotalPowerMW,
        Status: item.Status || item.status,
        DataCenterId: item.DataCenterId || item.FacilityId,
      });
    case "NearestFacilities":
      return new Feature({
        geometry: new Point(fromLonLat([lon, lat])),
        Facility: item.Facility, // Store the location name as a property
        FacilityId: item.FacilityId,
        Longitude: lon,
        Latitude: lat,
        PlantType: item.FacilityType === null ? "" : item.FacilityType,
        Operator: item.Operator === null ? "" : item.Operator,
        Status: item.Status || item.status,
      });

    case "Pipeline":
      // {
      //   PipelineId: 122378,
      //   Pipeline: "3 Bear Delaware Pipeline",
      //   Status: "In Service",
      //   SegmentName: "Legacy FGS To lea junction",
      //   Commodity: "Crude Oil",
      //   Operator: "3 Bear Delaware Operating-Nm LLC",
      //   Owner: "3 Bear Energy",
      //   Direction: "Uni-Directional",
      //   ReportedLengthMiles: 150,
      //   NominalDiameterInch: null,
      //   SegmentStatus: "In Service",
      //   SegmentMeasuredLengthMiles: 0.313416,
      //   Geom: '{"type":"MultiLineString","coordinates":[[[-103.5192277,32.5851731],[-103.519695,32.580643]]]}',
      // }

      // Parse the geometry data (Geom) from the provided data
      const geomData = JSON.parse(item.Geom);

      // Convert the coordinates from LonLat to the map's projection (EPSG:3857)
      const transformedCoordinates = geomData.coordinates.map(
        (line) => line.map((coord) => fromLonLat(coord)) // Transform each point in the line
      );

      // Create the MultiLineString geometry with transformed coordinates
      const multilinestring = new MultiLineString(transformedCoordinates);

      return new Feature({
        geometry: multilinestring,
        Facility: item.Pipeline,
        PlantType: "Pipeline",
        SegmentName: item.SegmentName,
        CommodityHandled: item.Commodity === null ? "" : item.Commodity,
        OperatorName: item.Operator === null ? "" : item.Operator,
        Direction: item.Direction === null ? "" : item.Direction,
        NominalDiameterInch:
          item.NominalDiameterInch === null ? "" : item.NominalDiameterInch,
        SegmentStatus: item.SegmentStatus === null ? "" : item.SegmentStatus,
        SegmentMeasuredLengthMiles:
          item.SegmentMeasuredLengthMiles === null
            ? ""
            : item.SegmentMeasuredLengthMiles,
        PipelineId: item.PipelineId,
      });
    case "PipelineFacilties":
    case "PipelineFacility":
      return new Feature({
        geometry: new Point(fromLonLat([lon, lat])),
        Facility: item.Facility || item.FacilityName || item["Facility Name"], // Store the location name as a property
        Longitude: lon,
        Latitude: lat,
        PlantType: item.FacilityType,
        Operator:
          item.OperatorName === null ? "" : item.OperatorName || item.Operator,
        FacilityId: item.FacilityId,
      });
  }
};

export default fnFetchOLFeature;
