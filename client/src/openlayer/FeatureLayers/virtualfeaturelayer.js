import { loadModules } from "esri-loader";
import shortid from "shortid";

import { getRandomColor } from "../../models/colors";
import { Circle, Point, Polygon } from "ol/geom";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Feature from "ol/Feature";
import { fromLonLat } from "ol/proj";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { getUid } from "ol/util";

// Adds a facility feature layer to the map.
export const fnAddVirtualMapLayer = async (Latitude, Longitude) => {
  const [hexcolor, rgbcolor] = getRandomColor();

  const basePoint = [Longitude, Latitude];

  // Create triangle points (deg offsets for small shape)
  const coords = [
    basePoint,
    [Longitude + 0.01, Latitude],
    [Longitude, Latitude + 0.01],
    basePoint // close polygon
  ];

  // Convert all points to EPSG:3857
  const transformed = coords.map((c) => fromLonLat(c));

  // Polygon expects: [ [ [x,y], [x,y], ... ] ]
  const poly = new Polygon([transformed]);




  // Create a polygon geometry
  // const triangle = new Polygon(fromLonLat([Longitude, Latitude])).transform(
  //   "EPSG:4326",
  //   "EPSG:3857"
  // );

  // 

  const feature = new Feature({
    // geometry: new Point(fromLonLat([Longitude, Latitude])),
    geometry: poly,
    name: "Virtual Facility",
  });

  // const style = new Style({
  //   image: new Circle({
  //     radius: 5, // Adjust the size of the point
  //     fill: new Fill({
  //       // color: "rgba(255, 0, 0, 0.6)", // Fill color (red with transparency)
  //       color: hexcolor,
  //     }),
  //     stroke: new Stroke({
  //       // color: "#ffcc33", // Stroke color (yellow outline)
  //       color: hexcolor,
  //       width: 2, // Stroke width (outer line size)
  //     }),
  //   }),
  // });

  const style = new Style({
    stroke: new Stroke({
      color: "blue",
      width: 2,
    }),
    fill: new Fill({
      color: "rgba(0, 0, 255, 0.1)",
    }),
  });

  feature.setStyle(style); // Apply the style to the feature

  // Create a vector source and add features
  const vectorSource = new VectorSource({
    features: [feature],
  });

  // Create a vector layer to display the features
  const vectorLayer = new VectorLayer({
    source: vectorSource,
  });

  const vid = getUid(vectorLayer);

  // Create the facility object
  const facility = {
    properties: vectorLayer, // The facility layer
    id: vid,
    binded: true, // Indicates if the facility is bound to other facilities
    maplayer: true,
  };



  return facility; // Return the facility object
};
