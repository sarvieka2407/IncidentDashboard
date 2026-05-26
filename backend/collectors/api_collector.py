
import requests
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

API_SOURCES = {
    "Atlassian":  "https://status.atlassian.com/api/v2/incidents.json",
    "PagerDuty":  "https://status.pagerduty.com/api/v2/incidents.json",
    "Twilio":     "https://status.twilio.com/api/v2/incidents.json",
    "Sendgrid":   "https://status.sendgrid.com/api/v2/incidents.json",
    "Dropbox":    "https://status.dropbox.com/api/v2/incidents.json",
    "Intercom":   "https://www.intercomstatus.com/api/v2/incidents.json",
}

def fetch_api(company: str, url: str) -> list:
    logger.info(f"Fetching API for {company}...")
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()

        raw_incidents = data.get("incidents", [])

        if not raw_incidents:
            logger.info(f"No incidents found for {company}")
            return []
        
        incidents = []

        for item in raw_incidents:

            updates = item.get("incident_updates", [])
            description = updates[0].get("body", "No description") if updates else "No description"

            incident = {
                "company":     company,
                "title":       item.get("name", "No title"),
                "description": description,
                "url":         item.get("shortlink", ""),
                "published":   item.get("created_at", str(datetime.now())),
                "source":      "api",   # only difference — marks where it came from
            }
 
            incidents.append(incident)

            logger.info(f"Found {len(incidents)} incidents for {company}")
            return incidents

    except requests.exceptions.Timeout:
        logger.error(f"Timeout fetching {company}: {url}")
        return []
    
    except requests.exceptions.RequestException as e:
        logger.error(f"Request failed for {company}: {e}")
        return []


    except Exception as e:
        logger.error(f"Failed to fetch {company}: {e}")
        return []
    
def fetch_all_apis() -> list:
    all_incidents = []

    for company, url in API_SOURCES.items():
        incidents = fetch_api(company, url)
        all_incidents.extend(incidents)

    logger.info(f"Total API incidents fetched: {len(all_incidents)}")
    return all_incidents

