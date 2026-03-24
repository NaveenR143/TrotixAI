import re
from transformers import pipeline
from typing import Optional


# Define a simple text cleaner
def clean_text(text):
    text = text.lower()
    text = re.sub(r"[^\w\s]", "", text)
    return text


def detect_geo_facility(query: str):
    # latitude/longitude
    if re.search(r"[-+]?\d{1,2}\.\d+[, ]+[-+]?\d{1,3}\.\d+", query):
        return "geo"
    # radius
    if re.search(r"\b\d+\s?(km|kilometer|mile|miles|radius)\b", query, re.I):
        return "radius"
    # facility type keywords
    facilities = ["pumping station", "gas plant", "refinery", "compressor", "terminal"]
    if any(f in query.lower() for f in facilities):
        return "facility"
    return None


# List of connection-related keywords
CONNECTION_KEYWORDS = [
    # Basic connection terms
    "connected",
    "linked",
    "integrated",
    "associated",
    "joined",
    "tied",
    "coupled",
    "connected to",
    # Pipeline-specific phrases
    "linked pipelines",
    "upstream",
    "downstream",
    "feeds into",
    "flows to",
    "part of network",
    "network of",
    # Queries about relationships
    "related to",
    "belongs to",
    "connected facility",
    "interconnected",
    "adjacent",
    "neighboring",
    "connection",
    "connections",
    "connection network",
    "connection map",
    # User query phrasing
    "all pipelines connected",
    "all connected",
]

# Regex to match keywords
CONNECTION_PATTERN = re.compile(
    r"\b(" + "|".join(re.escape(k) for k in CONNECTION_KEYWORDS) + r")\b",
    flags=re.IGNORECASE,
)


def is_network_query(query: str) -> bool:
    """
    Returns True if the user query likely involves a network/connection request.
    Otherwise, returns False (skip LLM call).
    """
    if CONNECTION_PATTERN.search(query):
        print("Connection Pattern Exists")
        return True

    # # Optional: check for phrases like "show X pipelines" etc.
    # if re.search(r"show .*pipeline", query, flags=re.IGNORECASE):
    #     print("Show Pipeline Exists")
    #     return True

    return False


# Keywords indicating geospatial intent
GEO_KEYWORDS = [
    "near",
    "within",
    "around",
    "radius",
    "miles",
    "kilometers",
    "km",
    "mile",
    "lat",
    "lon",
    "latitude",
    "longitude",
]

# Regex to detect numeric coordinates
COORD_PATTERN = re.compile(r"-?\d{1,3}\.\d+")

# Combined regex for quick check
GEO_PATTERN = re.compile(
    r"(" + "|".join(re.escape(k) for k in GEO_KEYWORDS) + r")", flags=re.IGNORECASE
)


def is_geospatial_query(query: str) -> bool:
    """
    Returns True if the query likely involves latitude, longitude, or distance.
    Otherwise, returns False (skip LLM call).
    """
    # Step 1: Check for geo keywords
    # if GEO_PATTERN.search(query):
    #     return True

    # Step 2: Check for numeric coordinates
    if COORD_PATTERN.search(query):
        return True

    return False


def is_nearby_query(text: str) -> bool:
    """
    Detects prompts like:
    - show facilities around <place>
    - show power plants near <place>
    - find stations close to <place>
    - show <something> surrounding <place>
    - find terminals within 12 km of williams compressor station
    """

    pattern = r"""
        \b
        (?:(show|find|get|list|display)\s+)?     # optional leading verb

        # optional target (one to four words, e.g., "power plants", "gas processing facilities")
        (?:[a-zA-Z0-9'-]+\s+){0,4}?

        (
            # --- Case 1: spatial keywords ---
            (?:near|around|close\s+to|surrounding)\s+
            [a-zA-Z0-9\s\-'&\.]+

            |

            # --- Case 2: within <distance> of <place> ---
            within\s+
            \d+(?:\.\d+)?\s*                # number (integer or decimal)
            (?:mile|miles|mi|km|kilometers?|m|meters?)\s+
            of\s+
            [a-zA-Z0-9\s\-'&\.]+
        )
        \b
    """

    return re.search(pattern, text, re.IGNORECASE | re.VERBOSE) is not None


def extract_distance_in_miles(text: str):
    """
    Extracts ANY distance expression from text
    and converts it to miles.

    Supported examples:
      - 10 miles
      - 5 mi
      - 20-mile
      - 30 km
      - 12 kilometers
      - 100 m
      - 3 meters
      - 4 km radius
      - 8mile
    """

    pattern = (
        r"(\d+(?:\.\d+)?)\s*(mile|miles|mi|km|kilometer|kilometers|m|meter|meters)\b"
    )

    match = re.search(pattern, text, flags=re.IGNORECASE)
    if not match:
        return None  # No distance found

    value = float(match.group(1))
    unit = match.group(2).lower()

    # Convert all to miles
    if unit in ["mile", "miles", "mi"]:
        miles = value

    elif unit in ["km", "kilometer", "kilometers"]:
        miles = value * 0.621371

    elif unit in ["m", "meter", "meters"]:
        miles = value * 0.000621371

    else:
        miles = value  # fallback

    return round(miles, 2)


def remove_units_from_query(text: str) -> str:
    """
    Removes units (miles, km, etc.) from the query string, leaving only the number.
    Useful for fixing SQL syntax errors like 'LIMIT 20 miles'.
    """
    pattern = r"(\b\d+(?:\.\d+)?)\s*(?:miles|mile|mi|km|kilometers|kilometer|meters|meter|m)\b"
    return re.sub(pattern, r"\1", text, flags=re.IGNORECASE)
