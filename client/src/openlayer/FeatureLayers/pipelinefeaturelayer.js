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
import MultiLineString from "ol/geom/MultiLineString";
import { getUid } from "ol/util";
import { getRandomColor } from "../../models/colors";
import RegularShape from "ol/style/RegularShape";

// Adds a facility feature layer to the map.
export const fnAddPipelineMapLayer = async (data, type, layername, map) => {
  // Load the necessary modules
  const [hexcolor, rgbcolor] = getRandomColor();

  const styleFunction = function (feature) {
    const geometry = feature.getGeometry();

    const styles = [
      // LineStyle (LineString)
      new Style({
        stroke: new Stroke({
          color: hexcolor,
          width: 2.5,
        }),
      }),
    ];

    // Working example

    // const coords = geometry.getCoordinates();

    // const start = coords[0][0]; // First coordinate [x1, y1]
    // const end = coords[0][1]; // Second coordinate [x2, y2]

    // // Calculate the differences in x and y
    // const dx = end[0] - start[0];
    // const dy = end[1] - start[1];

    // // Calculate the rotation angle based on atan2
    // const rotation = Math.atan2(dy, dx);

    // styles.push(
    //   new Style({
    //     geometry: new Point(start),
    //     image: new RegularShape({
    //       points: 3, // Number of points for a triangle (change for different shapes)
    //       radius: 7, // The size of the shape
    //       rotation: -rotation + 10, // Rotation angle (make sure it's in the correct direction)
    //       fill: new Fill({
    //         color: "black", // Color of the shape
    //       }),
    //     }),
    //   })
    // );

    const zoom = map.getView().getZoom(); // Get current zoom level from the map
    // console.log("Zoom : ", zoom);
    // Show label and shape only if zoom is >= 14
    if (zoom >= 8) {
      // Ensure that we are working with a LineString geometry (this works for MultiLineString as well)
      if (geometry instanceof MultiLineString) {
        const coords = geometry.getCoordinates();

        const attributes = feature ? feature.getProperties() : {}; // Get

        // Loop through the coordinates of the line to calculate directions for the arrows
        coords.forEach((line, lineIndex) => {
          for (let i = 0; i < line.length - 1; i++) {
            const start = line[i];
            const end = line[i + 1];
            const dx = end[0] - start[0];
            const dy = end[1] - start[1];
            const rotation = Math.atan2(dy, dx); // Calculate the rotation for the arrow

            // Calculate the midpoint of the line
            const midpoint = [
              (start[0] + end[0]) / 2, // Midpoint x
              (start[1] + end[1]) / 2, // Midpoint y
            ];

            // styles.push(
            //   new Style({
            //     text: new Text({
            //       text: `${attributes.Facility} - ${attributes.SegmentName}`,
            //       font: "8px Arial, sans-serif",
            //       fill: new Fill({
            //         color: "#000000",
            //       }),
            //       offsetY: -15,
            //       overflow: true,
            //       placement: "line",
            //     }),
            //   })
            // );

            if (attributes.Direction === "Uni-Directional") {
              // Add the arrow style at the end of the current segment
              //Uni Directional
              styles.push(
                new Style({
                  geometry: new Point(midpoint),
                  image: new RegularShape({
                    points: 3, // Number of points for a triangle (change for different shapes)
                    radius: 5, // The size of the shape
                    rotation: -rotation + 10, // Rotation angle (make sure it's in the correct direction)
                    fill: new Fill({
                      color: "black", // Color of the shape
                    }),
                  }),
                })
              );
            } else {
              const offset = 5; // Adjust this value to increase the distance between arrows

              // Calculate the forward and backward positions
              const forwardArrow = new Point([
                midpoint[0] + offset * Math.cos(rotation), // Move the forward arrow
                midpoint[1] + offset * Math.sin(rotation), // Move the forward arrow
              ]);

              const backwardArrow = new Point([
                midpoint[0] - offset * Math.cos(rotation), // Move the backward arrow
                midpoint[1] - offset * Math.sin(rotation), // Move the backward arrow
              ]);

              //Bi-Directional
              styles.push(
                new Style({
                  geometry: forwardArrow, // Position at the midpoint of the line
                  image: new RegularShape({
                    points: 3, // Number of points for the triangle (change for different shapes)
                    radius: 5, // The size of the shape
                    rotation: -rotation + 10, // Rotation for one arrow (directional)
                    fill: new Fill({
                      color: "black", // Color of the shape
                    }),
                  }),
                }),
                // Second arrow pointing in the opposite direction
                new Style({
                  geometry: backwardArrow, // Position at the midpoint of the line
                  image: new RegularShape({
                    points: 3, // Number of points for the triangle (change for different shapes)
                    radius: 5, // The size of the shape
                    rotation: -rotation + Math.PI + 10, // Rotation for the opposite direction
                    fill: new Fill({
                      color: "black", // Color of the shape
                    }),
                  }),
                })
              );
            }
          }
        });
      }
    }

    return styles;
  };

  // Create features from the JSON array
  const features = data.map((item) => {
    const feature = fnFetchOLFeature(type, item, null, null);

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
