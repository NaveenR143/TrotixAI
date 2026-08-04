import os
import logging
import requests

logger = logging.getLogger(__name__)

class WhatsAppNotificationService:
    """
    Outbound WhatsApp notification service for TrotixAI premium reports.
    """
    
    def __init__(self):
        self.access_token = os.getenv("WATSAPP_ACCESS_TOKEN") or os.getenv("WHATSAPP_ACCESS_TOKEN")
        self.phone_number_id = os.getenv("WATSAPP_PHONENUMBER_ID") or os.getenv("WHATSAPP_PHONENUMBER_ID")
        
        # Meta Graph API endpoint: https://graph.facebook.com/v17.0/{phone_number_id}/messages
        self.url = f"https://graph.facebook.com/v17.0/{self.phone_number_id}/messages" if self.phone_number_id else None
        
    def send_template_notification(self, phone: str, template_name: str, parameters: list) -> bool:
        """
        Send template notification using Meta Cloud API.
        If credentials are not found, falls back to logging the template to stdout/logs.
        """
        # Format destination phone number (must be in international format without '+' or '00')
        # E.g. "+91 99725 66264" -> "919972566264"
        clean_phone = "".join(filter(str.isdigit, phone))
        if clean_phone.startswith("0"):
            clean_phone = clean_phone[1:]
        if not clean_phone.startswith("91") and len(clean_phone) == 10:
            clean_phone = f"91{clean_phone}"
            
        logger.info(f"Preparing to send WhatsApp Template '{template_name}' to '{clean_phone}' with params: {parameters}")
        print(f"\n[WHATSAPP OUTBOUND TEMPLATE] Recipient: {clean_phone}\nTemplate: {template_name}\nParameters: {parameters}\n")
        
        if not self.access_token or not self.phone_number_id:
            logger.warning("WhatsApp API credentials missing in environment variables. Falling back to Mock logger.")
            return True
            
        # Format the parameters into Meta's template format
        # Parameters is a list of strings
        components_parameters = [
            {"type": "text", "text": str(p)}
            for p in parameters
        ]
        
        payload = {
            "messaging_product": "whatsapp",
            "to": clean_phone,
            "type": "template",
            "template": {
                "name": template_name,
                "language": {"code": "en_US"},
                "components": [
                    {
                        "type": "body",
                        "parameters": components_parameters
                    }
                ]
            }
        }
        
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }
        
        try:
            response = requests.post(self.url, json=payload, headers=headers, timeout=10)
            if response.status_code in [200, 201]:
                logger.info(f"WhatsApp notification sent successfully! Response: {response.json()}")
                return True
            else:
                logger.error(f"Failed to send WhatsApp notification. Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            logger.error(f"Exception sending WhatsApp notification to {clean_phone}: {e}", exc_info=True)
            return False

    def send_payment_success(self, phone: str, name: str, status_link: str) -> bool:
        """
        Trigger 'premium_payment_success' template.
        """
        # Message:
        # Hello {{1}},
        # Payment received successfully.
        # Your Career Booster Pack is now being generated.
        # You can track the progress here:
        # {{2}}
        return self.send_template_notification(
            phone=phone,
            template_name="premium_payment_success",
            parameters=[name, status_link]
        )
        
    def send_reports_completed(self, phone: str, name: str, dashboard_link: str) -> bool:
        """
        Trigger 'premium_reports_completed' template.
        """
        # Message:
        # Hello {{1}},
        # Your premium reports are ready.
        # Download them here:
        # {{2}}
        return self.send_template_notification(
            phone=phone,
            template_name="premium_reports_completed",
            parameters=[name, dashboard_link]
        )
        
    def send_reports_failed(self, phone: str, name: str, status_link: str) -> bool:
        """
        Trigger 'premium_reports_failed' template.
        """
        # Message:
        # Hello {{1}},
        # We encountered an issue while generating one of your reports.
        # We're retrying automatically.
        # You can check the latest status here:
        # {{2}}
        return self.send_template_notification(
            phone=phone,
            template_name="premium_reports_failed",
            parameters=[name, status_link]
        )
