import re




def get_unique_column_values(sql_response, column_name):
    """
    Extract unique values for a given column from a list of rows.

    Args:
        sql_response (list): List of dicts or row objects
        column_name (str): Column name to extract

    Returns:
        list: Unique values (empty list if column not found)
    """

    if not isinstance(sql_response, list) or not sql_response:
        return []

    unique_values = set()

    for row in sql_response:
        value = None

        # Case 1: dictionary row
        if isinstance(row, dict):
            value = row.get(column_name)

        # Case 2: object row (SQLAlchemy etc.)
        elif hasattr(row, column_name):
            value = getattr(row, column_name, None)

        if value is not None:
            unique_values.add(value)

    return list(unique_values)


def get_table_from_prompt(prompt: str) -> str:
    """
    Determines the single most relevant database table name based on keywords.
    """
    tables = get_tables_from_prompt(prompt)
    return tables[0] if tables else None


def get_tables_from_prompt(prompt: str) -> list:
    """
    Determines multiple database table names based on keywords in the user prompt.

    Args:
        prompt (str): The user's natural language prompt.

    Returns:
        list: List of corresponding database table names.
    """
    p = prompt.lower()
    tables = []

    # Daily Flow detection
    daily_flow_keywords = [
        "operating",
        "daily flow",
        "utilization",
        "throughput",
        "capacity exceeded",
        "outage",
        "zero flow",
        "weather impact",
        "under-utilized",
        "over-utilized",
        "utilized",
        "near capacity",
        "congested",
        "bottleneck",
        "maintenance",
        "downtime",
        "capacity limit",
        "flow",
        "volume",
        "capacity",
        "constraint",
        "weather",
        "temperature",
        "cold",
        "heat",
        "maxed out",
        "offline",
        "weekly",
        "monthly",
        "daily",
    ]
    if ("flow" in p or any(kw in p for kw in daily_flow_keywords)) and (
        "facilities" in p or "facility" in p or "facs" in p or "pipeline" in p
    ):
        tables.append("pipeline_dailyflow_mview")

    # Pipeline-related
    if "pipeline" in p:
        if "facilities" in p:
            tables.append("pipelinefacilities_mview")
        if "shipper" in p and "points" in p:
            tables.append("pipeline_shipper_points_mview")
        if "shipper" in p:
            tables.append("pipeline_shipper_details_mview")
        if "gas" in p and "tariff" in p:
            tables.append("pipeline_gas_tariff_mview")
        if ("liquid" in p or "oil" in p) and "tariff" in p:
            tables.append("pipeline_liquid_tariff_mview")

        if not any(
            x in tables
            for x in [
                "pipelinefacilities_mview",
                "pipeline_shipper_points_mview",
                "pipeline_shipper_details_mview",
                "pipeline_gas_tariff_mview",
                "pipeline_liquid_tariff_mview",
                "pipeline_dailyflow_mview",
            ]
        ):
            tables.append("pipeline_mview")

    # Gas Storage
    if "gasstorage" in p or "gas storage" in p or "storage" in p:
        tables.append("gasstorage_mview")

    # Power Plant
    if "powerplant" in p or "power plant" in p:
        tables.append("powerplant_mview")

    # Gas Plant variations
    if (
        "gas plant" in p
        or "gasplant" in p
        or ("plant" in p and ("ngl" in p))
        or ("gas" in p and ("processing" in p or "plant" in p))
        or ("gas" in p and ("facility" in p or "facilities" in p))
    ):
        if "production" in p and not any(
            word in p for word in ["capacity", "capacities"]
        ):
            tables.append("gasplantproduction_mview")
        if "disposition" in p:
            tables.append("gasplantdisposition_mview")
        if "intake" in p:
            tables.append("gasplantintake_mview")

        # If none of the specific ones matched, or if "gas plant" itself is mentioned
        if not any(
            x in tables
            for x in [
                "gasplantproduction_mview",
                "gasplantdisposition_mview",
                "gasplantintake_mview",
            ]
        ):
            tables.append("gasplant_mview")

    # Data Center
    if (
        "data center" in p
        or "datacenter" in p
        or "datacenters" in p
        or "data centers" in p
    ):
        tables.append("datacenters_mview")

    # Compressor Station
    if "compressor station" in p or "compressorstation" in p:
        tables.append("compressorstation_mview")

    # Industrial Plant
    if "industrial" in p or "industry" in p or "industries" in p:
        tables.append("industrialplant_mview")

    # LNG Plant
    if (
        "lng" in p
        or "liquefication" in p
        or "lng plant" in p
        or "lngplant" in p
        or "liquefaction" in p
    ):
        tables.append("lngplant_mview")

    # Pumping Station
    if "pumpingstation" in p or "pumping station" in p:
        tables.append("pumpingstation_mview")

    # Refinery
    if "refinery" in p or "refineries" in p:
        tables.append("refinery_mview")

    # Terminal
    if "terminal" in p:
        tables.append("terminal_mview")

    # Shipper details
    if "shipper" in p and "detail" in p:
        tables.append("pipeline_shipper_details_mview")

    if "facilities" in p or "facility" in p:
        if "facilities_mview" not in tables:
            tables.append("facilities_mview")

    # Nearby / Around facilities
    if ("nearby" in p or "around" in p) and "facilities" in p:
        if "facilities_mview" not in tables:
            tables.append("facilities_mview")

    # Remove duplicates while preserving order
    unique_tables = []
    for t in tables:
        if t not in unique_tables:
            unique_tables.append(t)

    return unique_tables
