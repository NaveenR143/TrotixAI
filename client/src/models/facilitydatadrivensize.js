import * as facilitycolors from './facilitycolors.jsx';

const fnFetchDataDrivenSize = (type, color, field, min, max) => {
  const facilitymapto = {
    'Gas Plant': facilitycolors.GasPlantColor,
    'Gas Storage': facilitycolors.GasStorageColor,
    Liquefaction: facilitycolors.LNGColor,
    Refinery: facilitycolors.RefineryColor,
    Terminal: facilitycolors.TerminalColor,
    'Compressor Station': facilitycolors.CompressorStationColor,
    'Pumping Station': facilitycolors.PumpingStationColor,
    CCUS: facilitycolors.CCUSColor,
    'CO2 Storage': facilitycolors.CO2StorageColor,
    'Hydrogen Plant': facilitycolors.HydrogenPlantColor,
    'Industrial Plant': facilitycolors.IndustrialPlantColor,
    'Power Plant': facilitycolors.PowerPlantColor,
    'Emission Facilities': facilitycolors.EmissionFacilityColor,
  };

  return {
    type: 'simple', // autocasts as new SimpleRenderer()
    symbol: {
      type: 'simple-marker', // autocasts as new SimpleMarkerSymbol()
      color: facilitymapto[type],
      outline: {
        width: 1.5,
        color: color,
      },
    },
    visualVariables: [
      {
        type: 'size',
        // type: "color", // indicates this is a color visual variable
        field: field, // total population in poverty
        // normalizationField: field, // total population
        minDataValue: min, // features where < 10% of the pop in poverty
        maxDataValue: max, // features where > 30% of the pop in poverty
        minSize: 3, // size of marker in pts
        maxSize: 24, // size of marker in pts
        // stops: [
        //     { value: 0.1, size: 4, label: "<15%" },
        //     { value: 75, size: 12, label: "25%" },
        //     { value: 156, size: 24, label: ">35%" }
        // ]
      },
    ],
  };
};

export default fnFetchDataDrivenSize;