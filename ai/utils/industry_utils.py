from typing import List

INDUSTRY_MAPPING = {

    # =============================
    # SOFTWARE / IT
    # =============================

    "Software Product": [
        "Software Product",
        "IT Services",
        "IT Services & Consulting",
        "Technology",
        "Internet",
        "Emerging Technologies",
        "Hardware & Networking",
        "Design",
        "Gaming"
    ],

    "IT Services": [
        "IT Services",
        "IT Services & Consulting",
        "Technology",
        "Software Product",
        "Internet",
        "Emerging Technologies",
        "Hardware & Networking"
    ],

    "IT Services & Consulting": [
        "IT Services",
        "IT Services & Consulting",
        "Technology",
        "Software Product",
        "Internet",
        "Professional Services"
    ],

    "Technology": [
        "Technology",
        "Software Product",
        "IT Services",
        "IT Services & Consulting",
        "Internet",
        "Emerging Technologies"
    ],

    "Internet": [
        "Internet",
        "Technology",
        "Software Product",
        "IT Services",
        "Emerging Technologies"
    ],

    "Hardware & Networking": [
        "Hardware & Networking",
        "IT Services",
        "Technology",
        "Electronics Manufacturing"
    ],

    # =============================
    # BFSI
    # =============================

    "Banking": [
        "Banking",
        "Financial Services",
        "BFSI",
        "NBFC",
        "Insurance"
    ],

    "Insurance": [
        "Insurance",
        "Financial Services",
        "Banking",
        "BFSI",
        "NBFC"
    ],

    "Financial Services": [
        "Financial Services",
        "Banking",
        "Insurance",
        "BFSI",
        "NBFC"
    ],

    "NBFC": [
        "NBFC",
        "Financial Services",
        "Banking",
        "Insurance",
        "BFSI"
    ],

    # =============================
    # HEALTHCARE
    # =============================

    "Healthcare & Life Sciences": [
        "Healthcare & Life Sciences",
        "Pharmaceutical & Life Sciences",
        "Biotechnology",
        "Medical Devices & Equipment"
    ],

    "Pharmaceutical & Life Sciences": [
        "Healthcare & Life Sciences",
        "Pharmaceutical & Life Sciences",
        "Biotechnology",
        "Medical Devices & Equipment"
    ],

    # =============================
    # MANUFACTURING
    # =============================

    "Manufacturing & Production": [
        "Manufacturing & Production",
        "Industrial Automation",
        "Electrical Equipment",
        "Automobile",
        "Auto Components",
        "Chemicals",
        "Packaging & Containers",
        "Iron & Steel",
        "Metals & Mining"
    ],

    "Automobile": [
        "Automobile",
        "Auto Components",
        "Manufacturing & Production",
        "Industrial Automation"
    ],

    # =============================
    # MEDIA
    # =============================

    "Media, Entertainment & Telecom": [
        "Media, Entertainment & Telecom",
        "Advertising & Marketing",
        "Animation & VFX",
        "Gaming",
        "Printing & Publishing"
    ],

    # =============================
    # EDUCATION
    # =============================

    "Education": [
        "Education",
        "Professional Services"
    ],

    # =============================
    # CONSULTING
    # =============================

    "Management Consulting": [
        "Management Consulting",
        "Professional Services",
        "IT Services & Consulting",
        "Legal"
    ],

    "Professional Services": [
        "Professional Services",
        "Management Consulting",
        "Legal",
        "IT Services & Consulting"
    ]
}


def get_related_industries(industry: str) -> List[str]:
    """
    Returns related industries.
    If industry is not mapped, returns itself.
    """
    if not industry:
        return []
        
    query = industry.strip().lower()
    matched_industries = []
    seen = set()
    
    # 1. Match keys in INDUSTRY_MAPPING case-insensitively (exact or substring)
    for key, related_list in INDUSTRY_MAPPING.items():
        key_lower = key.lower()
        if query == key_lower or query in key_lower:
            for item in related_list:
                if item not in seen:
                    seen.add(item)
                    matched_industries.append(item)
                    
    # 2. If no mapped key matched, return the original industry
    if not matched_industries:
        return [industry]
        
    return matched_industries