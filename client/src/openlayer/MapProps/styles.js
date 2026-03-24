import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import Map from "ol/Map";
import Overlay from "ol/Overlay";
import View from "ol/View";
import { fromLonLat } from "ol/proj";
import Feature from "ol/Feature";
import MultiLineString from "ol/geom/MultiLineString";
import LineString from "ol/geom/LineString";
import Point from "ol/geom/Point";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { getUid } from "ol/util";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Circle from "ol/style/Circle";
import Text from "ol/style/Text";

import * as facilitycolors from "./facilitycolors";
import { getRandomColor } from "../../models/colors";

// const pstyle = new Style({
//   image: new Circle({
//     radius: 7, // Adjust the size of the point
//     fill: new Fill({
//       color: "rgba(255, 0, 0, 0.6)", // Fill color (red with transparency)
//     }),
//     stroke: new Stroke({
//       color: "#ffcc33", // Stroke color (yellow outline)
//       width: 2, // Stroke width (outer line size)
//     }),
//   }),

//   text: new Text({
//     font: "11px sans-serif", // Font style and size
//     offsetX: 0,
//     offsetY: -20, // Offset the text slightly above the point
//     placement: "point",
//     text: `${item.GasPlant}`, // Set the label text to the name of the GasPlant
//     textAlign: "center",
//     textBaseline: "top",
//     fill: new Fill({
//       color: "black", // Text color
//     }),
//   }),
// });

const fnFetchOLStyle = (ftype, item, color, showLabel = true) => {
  const facilitymapto = {
    "Gas Plant": facilitycolors.GasPlantColor,
    "Gas Storage": facilitycolors.GasStorageColor,
    LNG: facilitycolors.LNGColor,
    Refinery: facilitycolors.RefineryColor,
    Terminal: facilitycolors.TerminalColor,
    "Compressor Station": facilitycolors.CompressorStationColor,
    "Pumping Station": facilitycolors.PumpingStationColor,
    "Industrial Plant": facilitycolors.IndustrialPlantColor,
    "Industrial Plants": facilitycolors.IndustrialPlantColor,
    "Power Plant": facilitycolors.PowerPlantColor,
    "Emission Facilities": facilitycolors.EmissionFacilityColor,
    "DataCenters": facilitycolors.DataCentersColor,
  };

  let fText = "";

  switch (ftype) {
    case "Gas Plant":
      fText = `${item.GasPlant}`;
      break;
    case "Gas Storage":
      fText = `${item.GasStorage}`;
      break;
    case "Liquefaction":
    case "LNG":
      fText = `${item.LNGPlant}`;
      break;

    case "Refinery":
      fText = `${item.Refinery}`;
      break;

    case "Terminal":
      fText = `${item.Terminal}`;
      break;

    case "Compressor Station":
      fText = `${item.CompressorStation}`;
      break;

    case "Pumping Station":
      fText = `${item.PumpingStation}`;
      break;

    case "Industrial Plant":
    case "Industrial Plants":
      fText = `${item.IndustrialPlant}`;
      break;

    case "Power Plant":
      fText = `${item.PowerPlant}`;
      break;
    case "DataCenters":
      fText = `${item.DataCenter}`;
      break;
    case "Pipeline": {
      fText = `${item.Pipeline}`;
      break;
    }
    case "PipelineFacilties":
    case "PipelineFacility": {
      fText = `${item.FacilityName}`;
      break;
    }
    case "NearestFacilities": {
      fText = `${item.Facility}`;
      break;
    }
  }

  // console.log(typeof fText);

  fText =
    fText && fText !== "undefined"
      ? fText
      : item.FacilityName ||
      item.Facility ||
      item["Facility Name"] ||
      "Unknown Facility";

  // console.log("fText", fText, item.FacilityType);



  return new Style({
    image: new Circle({
      radius: 5, // Adjust the size of the point
      fill: new Fill({
        // color: "rgba(255, 0, 0, 0.6)", // Fill color (red with transparency)
        color: facilitymapto[ftype] ?? facilitymapto[item.FacilityType],
      }),
      stroke: new Stroke({
        // color: "#ffcc33", // Stroke color (yellow outline)
        color: color,
        width: 2, // Stroke width (outer line size)
      }),
    }),

    text: showLabel
      ? new Text({
        font: "11px sans-serif", // Font style and size
        offsetX: 0,
        offsetY: -20, // Offset the text slightly above the point
        placement: "point",
        text: `${fText ?? item["Facility Name"]}`, // Set the label text to the name of the GasPlant
        textAlign: "center",
        textBaseline: "top",
        fill: new Fill({
          color: "black", // Text color
        }),
      })
      : null,
  });
};

export default fnFetchOLStyle;
