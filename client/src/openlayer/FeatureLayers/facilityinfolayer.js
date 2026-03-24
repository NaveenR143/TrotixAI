import { loadModules } from "esri-loader";
import shortid from "shortid";
import fnFetchOLFeature from "../MapProps/feature";
import fnFetchOLStyle from "../MapProps/styles";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Circle from "ol/style/Circle";
import Text from "ol/style/Text";
import { getUid } from "ol/util";
import { getRandomColor } from "../../models/colors";

// Adds a facility feature layer to the map.
export const fnAddFacilityInfoMapLayer = async (data, type) => {
  // Load the necessary modules

  const [hexcolor, rgbcolor] = getRandomColor();

  // Extract latitude and longitude from the object
  const [lat, lon] = [data.Latitude, data.Longitude];

  // console.log("AFIML", type);

  // Create a single feature
  const feature = fnFetchOLFeature(type, data, lon, lat);

  console.log("Facility Type", type);

  // Apply style
  const pstyle = fnFetchOLStyle(type, data, hexcolor);
  feature.setStyle(pstyle);

  // Create a vector source and add features
  const vectorSource = new VectorSource({
    features: [feature],
  });

  // Create a vector layer to display the features
  const vectorLayer = new VectorLayer({
    source: vectorSource,
  });

  return vectorLayer; // Return the facility object
};
