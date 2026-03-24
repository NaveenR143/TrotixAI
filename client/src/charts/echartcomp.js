import React from "react";

import { GasPlantProductionChart } from "./gasplantproductionchart";
import { GasPlantDispositionChart } from "./gasplantdispositionchart";
import { GasPlantIntakeChart } from "./gasplantintakechart";
import { FlowPointsHistoryChart } from "./flowpointshistorychart";

export const EChartComp = ({ ftype, data }) => {
  return (
    <>
      {ftype === "GasPlantProduction" && (
        <GasPlantProductionChart rawData={data}></GasPlantProductionChart>
      )}
      {ftype === "GasPlantDisposition" && (
        <GasPlantDispositionChart rawData={data}></GasPlantDispositionChart>
      )}
      {ftype === "GasPlantIntake" && (
        <GasPlantIntakeChart rawData={data}></GasPlantIntakeChart>
      )}

      {ftype === "FlowPointsHistory" && (
        <FlowPointsHistoryChart rawData={data}></FlowPointsHistoryChart>
      )}
    </>
  );
};
