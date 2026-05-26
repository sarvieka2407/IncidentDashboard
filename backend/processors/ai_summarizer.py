import os 
import json 
import logging
from google import genai
from dotenv import load_dotenv


#load_dotenv() reads ur .env file and makes your API key available to the code via os.getenv()
load_dotenv() 

 
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))


# the prompt: 
PROMPT_TEMPLATE = """
You are an expert at analyzing tech infrastructure incidents.
 
Analyze the following incident report and return a JSON object with these exact fields:
 
{{
    "summary":  "2 sentence plain english explanation of what happened. avoid technical jargon.",
    "severity": "one of: Critical, High, Medium, Low",
    "services": ["list", "of", "affected", "services"],
    "region":   "affected region or 'Global' or 'Unknown'",
    "status":   "one of: investigating, identified, monitoring, resolved"
}}
 
Rules:
- Return ONLY the JSON object. No extra text, no markdown, no backticks.
- If a field cannot be determined from the text, use "Unknown" for strings or [] for lists.
- Severity guide:
    Critical = major outage affecting all or most users
    High     = significant issues affecting many users
    Medium   = partial issues affecting some users
    Low      = minor issues, minimal user impact
 
Incident from {company}:
Title: {title}
Description: {description}
"""

# function to summarize an incident using the above prompt template

def summarize_incident(incident: dict) -> dict:

    logger.info(f"Summarizing incident: {incident['company']} — {incident['title']}")
    
    try:
        # fill in the prompt with this incident's actual data
        prompt = PROMPT_TEMPLATE.format(
            company     = incident["company"],
            title       = incident["title"],
            description = incident["description"][:1000]
        )

        response = client.models.generate_content(
        model    = "gemini-2.0-flash",
        contents = prompt
)
        raw_response = response.text.strip()

         

        if raw_response.startswith("```"):
            raw_response = raw_response.split("```")[1]
            if raw_response.startswith("json"):
                raw_response = raw_response[4:]
            raw_response = raw_response.strip()

        # convert the JSON string into a Python dictionary
        ai_data = json.loads(raw_response) 

        incident["summary"]      = ai_data.get("summary",  "Could not generate summary")
        incident["severity"]     = ai_data.get("severity", "Unknown")
        incident["services"]     = ai_data.get("services", [])
        incident["region"]       = ai_data.get("region",   "Unknown")
        incident["status"]       = ai_data.get("status",   "Unknown")
        incident["ai_processed"] = True

        logger.info(f"Successfully processed: {incident['company']} — severity: {incident['severity']}")
        return incident
    
    except json.JSONDecodeError:
        # Gemini occasionally returns non-JSON despite instructions
        # we catch it, log it, and return the incident unprocessed
        logger.error(f"Gemini returned invalid JSON for {incident['company']}: {raw_response}")
        incident["ai_processed"] = False
        return incident
    
    except Exception as e:
        logger.error(f"Failed to summarize incident from {incident['company']}: {e}")
        incident["ai_processed"] = False
        return incident
    

def summarize_all_incidents(incidents: list) -> list:

    condensed = []

    for incident in incidents: 
        condensed_incident = summarize_incident(incident)
        condensed.append(condensed_incident)

    total = len(condensed)
    processed = sum(1 for i in condensed if i.get("ai_processed"))

    logger.info(f"AI processing complete: {processed}/{total} incidents processed successfully")
    return condensed 