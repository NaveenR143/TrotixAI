// Universal Wrapper
const popupWrapper = (innerHTML) => `
  <div style="
      display:flex; 
      justify-content:center; 
      align-items:center;  
      border-radius:8px; 
      background-color:#f7f7f7; 
      max-width:100%;
  ">
    <div style="
        background-color:#ffffff; 
        box-shadow:0 4px 4px rgba(0,0,0,0.1); 
        border-radius:8px; 
        width:300px; 
        padding:15px;
    ">
      ${innerHTML}
    </div>
  </div>
`;

// Universal Key-Value Renderer
const renderField = (label, value) => {
  if (!value && value !== 0) return "";
  return `
    <div style="margin-bottom:8px; display:flex; justify-content:space-between;">
      <span style="color:#666;">${label}:</span>
      <span style="color:#111;">${value}</span>
    </div>
  `;
};

// Coordinates Renderer
const renderCoordinates = (lat, lon) => {
  if (!lat || !lon) return "";
  return `
    <div style="margin-bottom:8px; display:flex; justify-content:space-between;">
      <span style="color:#666;">Coordinates:</span>
      <span style="color:#111;">${Number(lat).toFixed(5)}, ${Number(
    lon
  ).toFixed(5)}</span>
    </div>
  `;
};

const renderStatus = (status) => {
  if (!status) return "";
  return `
    <div style="margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
      <span style="color:#666;">Status:</span>
      <span style="font-weight:600; color:${status === "Active" ? "green" : status === "Inactive" ? "red" : "orange"
    };">
        ● ${status}
      </span>
    </div>
  `;
};

const renderPipelineStatus = (status) => {
  if (!status) return "";
  return `
    <div style="margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
      <span style="color:#666;">Status:</span>
      <span style="font-weight:600; color:${status === "In Service"
      ? "green"
      : status === "Out of Service"
        ? "red"
        : "orange"
    };">
        ● ${status}
      </span>
    </div>
  `;
};

// Universal Link Button
const renderLinkButton = (id, type, values) => {



  // console.log(JSON.stringify(values));
  if (!id) return "";

  let url = `/facility/${id}/${type}`;



  if (values?.CommodityHandled === "Natural Gas") {
    url = `/naturalgaspipeline/${id}`;
  }
  return `
    
    <div style="margin-top:10px; text-align:right;">
      <a href="${url}"
        target="_blank"
        rel="noopener noreferrer"
        style="color:#2563eb; font-size:13px; text-decoration:none; font-weight:500;">
        View Details →
      </a>
    </div>
  `;
};

// Title Builder
const renderTitle = (title) => `
  <div style="font-size:17px; font-weight:600; margin-bottom:10px; color:#222;">
    ${title}
  </div>`;

const fnFetchOLPopupHTML = (ftype, values) => {


  switch (ftype) {
    case "Gas Plant": {
      const html = `
      ${renderTitle(`${values?.Facility} - Gas Plant`)}
      ${renderCoordinates(values.Latitude, values.Longitude)}
      ${renderField("Operator", values.Operator)}
      ${renderField("Owner", values.Owner)}
      ${renderField("State", values.State)}
      ${renderField("County", values.County)}
      ${renderField("Basin", values.Basin)}
      ${renderField(
        "Processing Capacity (MMSCFD)",
        values.GasProcessingCapacityMMSCFD
      )}
      ${renderField(
        "Operating Capacity (MMSCFD)",
        values.TotalGasOperatingCapacityMMSCFD
      )}
      ${renderField(
        "Planned Capacity (MMSCFD)",
        values.TotalGasPlannedCapacityMMSCFD
      )}
      ${renderStatus(values.Status)}
      ${renderLinkButton(
        values.GasPlantId || values.FacilityId,
        values.PlantType || "Gas Plant",
        values
      )}
    `;
      return popupWrapper(html);
    }
    case "DataCenters": {
      const html = `
      ${renderTitle(`${values?.Facility} - Data Center`)}
      ${renderCoordinates(values.Latitude, values.Longitude)}
      ${renderField("Operator", values.Operator)}
      ${renderField("Owner", values.Owner)}
      ${renderField("State", values.State)}
      ${renderField("County", values.County)}
      ${renderField("Basin", values.Basin)}
      ${renderField(
        "Total Area (SQF)",
        values.TotalAreaSQF
      )}
      ${renderField(
        "Total Power (MW)",
        values.TotalPowerMW
      )}
      
      ${renderStatus(values.Status)}
      ${renderLinkButton(
        values.DataCenterId || values.FacilityId,
        values.PlantType || "DataCenters",
        values
      )}
    `;
      return popupWrapper(html);
    }
    case "Gas Storage": {
      const html = `
                  ${renderTitle(`${values?.Facility} - Gas Storage`)}
                  ${renderCoordinates(values.Latitude, values.Longitude)}
                  ${renderField("Operator", values.Operator)}
                  ${renderField("Owner", values.Owner)}
                  ${renderField("State", values.State)}
                  ${renderField("County", values.County)}
                  ${renderField("Basin", values.Basin)}
                  ${renderField(
        "Cushion Capacity (BCF)",
        values.CushionCapacityBCF
      )}
                  ${renderField(
        "Working Capacity (BCF)",
        values.WorkingCapacityBCF
      )}
                  ${renderField(
        "Total Capacity (BCF)",
        values.TotalCapacityBCF
      )}
                  ${renderStatus(values.Status)}
                  ${renderLinkButton(
        values.GasStorageId || values.FacilityId,
        values.PlantType || "Gas Storage",
        values
      )}`;
      return popupWrapper(html);
    }
    case "Liquefaction": {
      const html = `
                  ${renderTitle(`${values?.Facility} - LNG Plant`)}
                  ${renderCoordinates(values.Latitude, values.Longitude)}
                  ${renderField("Operator", values.Operator)}
                  ${renderField("Owner", values.Owner)}
                  ${renderField("State", values.State)}
                  ${renderField("County", values.County)}
                  ${renderField("Basin", values.Basin)}
                  ${renderField(
        "Total Baseload Capacity (BCF)",
        values.TotalBaseloadCapacityBCF
      )}
                  ${renderField(
        "Total Peakload Capacity (BCF)",
        values.TotalPeakloadCapacityBCF
      )}
                  ${renderField(
        "Total Capacity (MMTPA)",
        values.TotalCapacityMMTPA
      )}
                  ${renderStatus(values.Status)}
                  ${renderLinkButton(
        values.LNGId || values.FacilityId,
        values.PlantType || "Liquefaction",
        values
      )}`;
      return popupWrapper(html);
    }

    case "Refinery": {
      const html = `
                  ${renderTitle(`${values?.Facility} - Refinery`)}
                  ${renderCoordinates(values.Latitude, values.Longitude)}
                  ${renderField("Operator", values.Operator)}
                  ${renderField("Owner", values.Owner)}
                  ${renderField("State", values.State)}
                  ${renderField("County", values.County)}
                  ${renderField("Basin", values.Basin)}
                  ${renderField(
        "Total Crude Distillation Capacity",
        values.TotalCrudeDistillationCapacity
      )}
                  
                  ${renderStatus(values.Status)}
                  ${renderLinkButton(
        values.RefineryId || values.FacilityId,
        values.PlantType || "Refinery",
        values
      )}`;
      return popupWrapper(html);
    }

    case "Terminal": {
      const html = `
                  ${renderTitle(`${values?.Facility} - Terminal`)}
                  ${renderCoordinates(values.Latitude, values.Longitude)}
                  ${renderField("Operator", values.Operator)}
                  ${renderField("Owner", values.Owner)}
                  ${renderField("State", values.State)}
                  ${renderField("County", values.County)}
                  ${renderField("Basin", values.Basin)}
                  ${renderField("Terminal Type", values.TerminalType)}
                  ${renderField(
        "Total Capacity Barrels",
        values.TotalCapacityBarrels
      )}
                  ${renderStatus(values.Status)}
                  ${renderLinkButton(
        values.TerminalId || values.FacilityId,
        values.PlantType || "Terminal",
        values
      )}`;
      return popupWrapper(html);
    }

    case "Compressor Station": {
      const html = `
                  ${renderTitle(`${values?.Facility} - Compressor Station`)}
                  ${renderCoordinates(values.Latitude, values.Longitude)}
                  ${renderField("Operator", values.Operator)}
                  ${renderField("Owner", values.Owner)}
                  ${renderField("State", values.State)}
                  ${renderField("County", values.County)}
                  ${renderField("Basin", values.Basin)}
                  ${renderField("Total Power", values.TotalPower)}
                  ${renderField("Number Of Engines", values.NumberOfEngines)}
                  ${renderField("Number Of Turbines", values.NumberOfTurbines)}
                  ${renderField("Number Of Motors", values.NumberOfMotors)}
                  ${renderStatus(values.Status)}
                  ${renderLinkButton(
        values.CompressorStationId || values.FacilityId,
        values.PlantType || "Compressor Station",
        values
      )}`;
      return popupWrapper(html);
    }
    case "Pumping Station": {
      const html = `
                  ${renderTitle(`${values?.Facility} - Pumping Station`)}
                  ${renderCoordinates(values.Latitude, values.Longitude)}
                  ${renderField("Operator", values.Operator)}
                  ${renderField("Owner", values.Owner)}
                  ${renderField("State", values.State)}
                  ${renderField("County", values.County)}
                  ${renderField("Basin", values.Basin)}
                  ${renderField("Commodity Handled", values.CommodityHandled)}
                  ${renderStatus(values.Status)}
                  ${renderLinkButton(
        values.PumpingStationId || values.FacilityId,
        values.PlantType || "Pumping Station",
        values
      )}`;
      return popupWrapper(html);
    }
    case "Industrial Plant":
    case "Industrial Plants": {
      const html = `
                  ${renderTitle(`${values?.Facility} - Industrial Plant`)}
                  ${renderCoordinates(values.Latitude, values.Longitude)}
                  ${renderField("Operator", values.Operator)}
                  ${renderField("Owner", values.Owner)}
                  ${renderField("State", values.State)}
                  ${renderField("County", values.County)}
                  ${renderField("Basin", values.Basin)}
                  ${renderStatus(values.Status)}
                  ${renderLinkButton(
        values.IndustrialPlantId || values.FacilityId,
        values.PlantType || "Industrial Plant",
        values
      )}`;
      return popupWrapper(html);
    }

    case "Power Plant": {
      const html = `
                  ${renderTitle(`${values?.Facility} - Power Plant`)}
                  ${renderCoordinates(values.Latitude, values.Longitude)}
                  ${renderField("Operator", values.Operator)}
                  ${renderField("Owner", values.Owner)}
                  ${renderField("State", values.State)}
                  ${renderField("County", values.County)}
                  ${renderField("Basin", values.Basin)}
                  ${renderStatus(values.Status)}
                  ${renderField("Technologies", values.Technologies)}
                  ${renderField("Fuels", values.Fuels)}
                  ${renderField("OperatingMonths", values.OperatingMonths)}
                  ${renderField("NameplateCapacityMW", values.NameplateCapacityMW)}
                  ${renderField("NameplatePowerFactor", values.NameplatePowerFactor)}
                  ${renderField("SummerCapacityMW", values.SummerCapacityMW)}
                  ${renderField("WinterCapacityMW", values.WinterCapacityMW)}
                  ${renderField("MinimumLoadMW", values.MinimumLoadMW)}
                  ${renderLinkButton(
        values.PowerPlantId || values.FacilityId,
        values.PlantType || "Power Plant", values
      )}`;
      return popupWrapper(html);
    }
    case "Pipeline": {
      const html = `
                  ${renderTitle(`${values?.Facility} - Pipeline`)}
                  ${renderField("Segment Name", values.SegmentName)}
                  ${renderField(
        "Operator",
        values.OperatorName || values.Operator
      )}
                  ${renderField("Commodity", values.CommodityHandled)}
                  ${renderField(
        "Nominal Diameter Inch",
        values.NominalDiameterInch
      )}
                  ${renderField(
        "Segment Measured Length Miles",
        values.SegmentMeasuredLengthMiles
      )}
                  ${renderPipelineStatus(values.SegmentStatus)}
                  ${renderLinkButton(
        values.PipelineId || values.FacilityId,
        values.PlantType || "Pipeline", values
      )}`;
      return popupWrapper(html);
    }
    case "PipelineFacilities":
    case "PipelineFacility": {
      const html = `
                  ${renderTitle(`${values?.Facility}`)}
                  ${renderCoordinates(values.Latitude, values.Longitude)}
                  ${renderField("Operator", values.Operator)}
                  ${renderStatus(values.Status)}
                  ${renderLinkButton(values.FacilityId, values.PlantType, values)}`;
      return popupWrapper(html);
    }
  }
};

export default fnFetchOLPopupHTML;
