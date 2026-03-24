facilitymap = {
    "gasplant_mview": "Gas Plant",
    "gasplantproduction_mview": "GasPlantProduction",
    "gasplantdisposition_mview": "GasPlantDisposition",
    "gasplantintake_mview": "GasPlantIntake",
    "pipeline_mview": "Pipeline",
    "pipeline_shipper_points_mview": "PipelineShipperPoints",
    "pipeline_shipper_details_mview": "PipelineShipperDetails",
    "pipeline_gas_tariff_mview": "PipelineGasTariff",
    "pipeline_dailyflow_mview": "PipelineGasDailyFlow",
    "pipeline_liquid_tariff_mview": "PipelineLiquidTariff",
    "facilities_mview": "PipelineFacilities",
    "gasstorage_mview": "Gas Storage",
    "lngplant_mview": "LNG",
    "refinery_mview": "Refinery",
    "terminal_mview": "Terminal",
    "compressorstation_mview": "Compressor Station",
    "pumpingstation_mview": "Pumping Station",
    "industrialplant_mview": "Industrial Plant",
    "powerplant_mview": "Power Plant",
    "datacenters_mview": "DataCenters",
}


def get_facility_type(facility):
    return facilitymap[facility]


facilitytablenamemap = {
    "gasplant_mview": "GasPlant",
    "gasstorage_mview": "GasStorage",
    "lngplant_mview": "LNGPlant",
    "refinery_mview": "Refinery",
    "terminal_mview": "Terminal",
    "compressorstation_mview": "CompressorStation",
    "pumpingstation_mview": "PumpingStation",
    "industrialplant_mview": "IndustrialPlant",
    "powerplant_mview": "PowerPlant",
    "datacenters_mview": "DataCenters",
}


def get_facility_table_name(table_name):
    return facilitytablenamemap[table_name]
