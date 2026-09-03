# whatsapp/whatsapp_service.py
"""
WhatsApp Service Module
Handles formatting and sending WhatsApp notifications using Facebook Graph/WhatsApp Business API templates.
"""

import os
import re
import logging
import requests
from typing import Dict, Any, List, Optional

LOGGER = logging.getLogger(__name__)

# Load credentials from environment
ACCESS_TOKEN = os.getenv("ACCESS_TOKEN", "").strip(' "')
PHONE_NUMBER_ID = os.getenv("PHONE_NUMBER_ID", "").strip(' "')
WHATSAPP_API_URL = f"https://graph.facebook.com/v25.0/{PHONE_NUMBER_ID}/messages"

# Default Template Configuration
DEFAULT_TEMPLATE_NAME = "resume_upload_status"
DEFAULT_IMAGE_ID = "1460819949430912"  # Header image ID from test_watsapp.py
PACKAGE_TEMPLATE_NAME = "profile_ready_upgrade"
PACKAGE_IMAGE_ID = "1550875050167475"

def format_phone_number(phone: str) -> str:
    """
    Format and validate phone number to the format required by WhatsApp API.
    
    Rules:
    - If it has +91, remove + and keep only 91.
    - If the cleaned phone number has exactly 10 digits, prepend '91' to it.
    - Otherwise, validate the formatted values.

    Args:
        phone: Raw phone number string

    Returns:
        Formatted phone number string containing only digits (12 characters, starting with 91).
        
    Raises:
        ValueError: If the phone number is invalid or cannot be formatted.
    """
    if not phone:
        raise ValueError("Phone number cannot be empty.")
        
    # Strip whitespace
    phone_str = str(phone).strip()
    
    # If it starts with +91, remove + and keep 91
    if phone_str.startswith("+91"):
        phone_str = "91" + phone_str[3:]
    elif phone_str.startswith("+"):
        # If it starts with any other +, remove +
        phone_str = phone_str[1:]
        
    # Remove all non-digit characters
    cleaned = re.sub(r"\D", "", phone_str)
    
    # If the cleaned length is exactly 10 digits, prepend '91'
    if len(cleaned) == 10:
        cleaned = "91" + cleaned
        
    # Validation: must be exactly 12 digits and start with 91
    if not cleaned.isdigit() or len(cleaned) != 12 or not cleaned.startswith("91"):
        raise ValueError(
            f"Invalid phone number values: '{phone}' (formatted: '{cleaned}'). "
            "Phone number must be a 10-digit number or start with 91 or +91."
        )
        
    return cleaned


def send_whatsapp_template_message(
    to_phone: str,
    template_name: str,
    parameters: List[Dict[str, Any]],
    header_image_id: Optional[str] = None,
    language_code: str = "en"
) -> Dict[str, Any]:
    """
    Low-level reusable helper to send a WhatsApp template message.

    Args:
        to_phone: Recipient phone number
        template_name: Name of the registered WhatsApp template
        parameters: List of parameter dictionaries for the template body
        header_image_id: Optional media ID for template header image
        language_code: Two-letter language code (default 'en')

    Returns:
        Dict: Response JSON from the WhatsApp API

    Raises:
        ValueError: If configuration is missing or inputs are invalid.
        requests.RequestException: If API call fails.
    """
    if not ACCESS_TOKEN or not PHONE_NUMBER_ID:
        raise ValueError("WhatsApp ACCESS_TOKEN or PHONE_NUMBER_ID is not configured in the environment.")

    formatted_phone = format_phone_number(to_phone)
    if not formatted_phone:
        raise ValueError("Invalid phone number provided.")

    headers = {
        "Authorization": f"Bearer {ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }

    # Build components
    components = []
    
    # If a header image is provided, add the header component
    if header_image_id:
        components.append({
            "type": "header",
            "parameters": [
                {
                    "type": "image",
                    "image": {
                        "id": header_image_id
                    }
                }
            ]
        })

    # Add the body component if parameters are present
    if parameters:
        components.append({
            "type": "body",
            "parameters": parameters
        })

    payload = {
        "messaging_product": "whatsapp",
        "to": formatted_phone,
        "type": "template",
        "template": {
            "name": template_name,
            "language": {"code": language_code},
        }
    }
    
    if components:
        payload["template"]["components"] = components

    LOGGER.info("Sending WhatsApp notification to %s using template %s", formatted_phone, template_name)
    response = requests.post(WHATSAPP_API_URL, headers=headers, json=payload, timeout=10)
    
    response.raise_for_status()
    return response.json()


def send_profile_update_notification(user: Dict[str, Any]) -> bool:
    """
    Send a WhatsApp notification to the user after a successful profile update.
    This uses the predefined template 'resume_upload_status'.
    
    Args:
        user: A dictionary containing user details, e.g.:
              {
                  "phone": "9972566264",
                  "full_name": "John Doe"
              }
              
    Returns:
        bool: True if sent successfully, False otherwise.
    """
    try:
        phone = user.get("phone")
        # phone = '919972566264'
        full_name = user.get("full_name") or user.get("name") or "Candidate"
        
        if not phone:
            LOGGER.warning("Cannot send WhatsApp notification: user has no phone number.")
            return False

        try:
            phone = format_phone_number(phone)
        except ValueError as val_err:
            LOGGER.error("Phone number validation failed: %s", val_err)
            return False

        # Build parameters for 'resume_upload_status' template
        # The template expects a 'candidate' body text parameter.
        parameters = [
            {
                "type": "text",
                "parameter_name": "candidate",
                "text": full_name
            }
        ]

        response_data = send_whatsapp_template_message(
            to_phone=phone,
            template_name=DEFAULT_TEMPLATE_NAME,
            parameters=parameters,
            header_image_id=DEFAULT_IMAGE_ID
        )
        LOGGER.info("WhatsApp notification sent successfully to %s. Response: %s", phone, response_data)
        return True

    except Exception as e:
        LOGGER.exception("Failed to send WhatsApp profile update notification to %s: %s", user.get('phone'), e)
        # Return False to let caller know it failed, but do not raise to preserve profile save status
        return False

def send_premium_package_notification(user: Dict[str, Any]) -> bool:
    """
    Send a WhatsApp notification to the user after a successful profile update.
    This uses the predefined template 'resume_upload_status'.
    
    Args:
        user: A dictionary containing user details, e.g.:
              {
                  "phone": "9972566264",
                  "full_name": "John Doe"
              }
              
    Returns:
        bool: True if sent successfully, False otherwise.
    """
    try:
        phone = user.get("phone")
        # phone = '919972566264'
        full_name = user.get("full_name") or user.get("name") or "Candidate"
        
        if not phone:
            LOGGER.warning("Cannot send WhatsApp notification: user has no phone number.")
            return False

        try:
            phone = format_phone_number(phone)
        except ValueError as val_err:
            LOGGER.error("Phone number validation failed: %s", val_err)
            return False

        # Build parameters for 'resume_upload_status' template
        # The template expects a 'candidate' body text parameter.
        parameters = [
            {
                "type": "text",
                "parameter_name": "candidate",
                "text": full_name
            }
        ]

        response_data = send_whatsapp_template_message(
            to_phone=phone,
            template_name=PACKAGE_TEMPLATE_NAME,
            parameters=parameters,
            header_image_id=PACKAGE_IMAGE_ID
        )
        LOGGER.info("WhatsApp notification sent successfully to %s. Response: %s", phone, response_data)
        return True

    except Exception as e:
        LOGGER.exception("Failed to send WhatsApp profile update notification to %s: %s", user.get('phone'), e)
        # Return False to let caller know it failed, but do not raise to preserve profile save status
        return False
