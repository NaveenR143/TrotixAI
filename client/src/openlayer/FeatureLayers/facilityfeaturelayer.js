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
export const fnAddFacilityMapLayer = async (data, type, layername, map) => {
  // Load the necessary modules

  const [hexcolor, rgbcolor] = getRandomColor();

  const styleFunction = (feature) => {
    const properties = feature.getProperties();
    const ftype = properties.PlantType || type;

    // Get current zoom level from the map
    const zoom = map ? map.getView().getZoom() : 0;

    // Show label only if zoom is >= 10
    const showLabel = zoom >= 10;

    return fnFetchOLStyle(ftype, properties.itemData, hexcolor, showLabel);
  };

  // Create features from the JSON array
  const features = data.map((item) => {
    const [lat, lon] = [item.Latitude, item.Longitude];

    const ftype =
      type === "PipelineFacility" || type === "PipelineFacilities"
        ? item.FacilityType
        : type;

    const feature = fnFetchOLFeature(ftype, item, lon, lat);

    // Store the original item data on the feature for the style function
    feature.set("itemData", item);

    return feature;
  });

  // Create a vector source and add features
  const vectorSource = new VectorSource({
    features: features,
  });

  // Create a vector layer to display the features
  const vectorLayer = new VectorLayer({
    source: vectorSource,
    style: styleFunction,
  });

  // map.addLayer(vectorLayer);

  // // Update the view center based on the first point's latitude and longitude
  // map.getView().setCenter(fromLonLat([data[0].Longitude, data[0].Latitude]));

  // // Increase the zoom level
  // map.getView().setZoom(10); // You can set this to any desired zoom level

  const vid = getUid(vectorLayer);

  // Create the facility object
  const facility = {
    name: layername,
    type, // The type of the facility
    properties: vectorLayer, // The facility layer
    id: vid,
    binded: true, // Indicates if the facility is bound to other facilities
    data, // The data for the facility layer
    count: data.length, // The count of the data for the facility layer
    filtered: false,
    filterquery: null,
    color: hexcolor,
    maplayer: true,
  };




  return facility; // Return the facility object
};
