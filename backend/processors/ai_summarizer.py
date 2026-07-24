
import os 
import json 
import logging
from google import genai
from dotenv import load_dotenv


#load_dotenv() reads ur .env file and makes your API key available to the code via os.getenv()
load_dotenv() 
print("Using API key:", os.getenv("GEMINI_API_KEY")[:12] + "..." if os.getenv("GEMINI_API_KEY") else "None")

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


# the prompt: 
PROMPT_TEMPLATE = """
You are a Senior Site Reliability Engineer (SRE) preparing an internal engineering incident brief for other backend, infrastructure and platform engineers.

Your audience is technical.

Do NOT simply rewrite or shorten the incident.

Instead, extract the most important engineering information and present it as a concise incident brief.

Return ONLY a valid JSON object using this exact schema:

{{
    "summary": "...",
    "severity": "Critical | High | Medium | Low",
    "services": ["..."],
    "region": "Global | Unknown | specific region",
    "status": "investigating | identified | monitoring | resolved"
}}

The "summary" should read like something an experienced SRE would post in an internal Slack incident channel.

Structure it exactly like this whenever the information is available:

What happened:
<1-2 sentences describing the incident>

Impact:
<Explain what users, customers or systems are affected>

Context:
<Include useful technical context only if it exists. Examples: maintenance, deployment, infrastructure change, networking issue, database issue, etc. If no useful context exists, omit this section entirely.>

Action:
<Briefly describe what engineers are currently doing or what customers should do. If no action exists, omit this section entirely.>

Formatting Rules:

- Separate each section with ONE blank line.
- Keep each section short.
- Maximum 120 words total.
- Write in clear engineering language.
- Do NOT exaggerate.
- Do NOT speculate.
- Do NOT invent missing information.
- Do NOT repeat timestamps unless they are operationally important.
- Do NOT copy large portions of the original incident.
- Prefer concise engineering communication over marketing language.

Severity Guidelines:

Critical:
Major outage affecting most users or core infrastructure.

High:
Significant customer impact or multiple services affected.

Medium:
Partial degradation, limited impact or planned maintenance with possible disruption.

Low:
Minor issue, informational update or maintenance with negligible customer impact.

Services:
Return only the directly affected services or products.

Region:
Return the affected region if explicitly mentioned.
Otherwise use "Global" or "Unknown".

Status:
Return ONLY one of:

investigating
identified
monitoring
resolved

Incident Information

Company:
{company}

Title:
{title}

Description:
{description}
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
        model    = "gemini-3.5-flash",
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


def summarize_single_incident(company: str, title: str, description: str) -> str:
    """
    Summarizes a single incident and returns the generated summary text.
    Raises exceptions on any failure so the caller can handle them.
    """
    logger.info(f"Generating single incident summary: {company} — {title}")

    try:
        prompt = PROMPT_TEMPLATE.format(
            company=company,
            title=title,
            description=description[:1000]
        )

        response = client.models.generate_content(
            model="gemini-3.5-flash",
            contents=prompt
        )

        raw_response = response.text.strip()

        if raw_response.startswith("```"):
            raw_response = raw_response.split("```")[1]
            if raw_response.startswith("json"):
                raw_response = raw_response[4:]
            raw_response = raw_response.strip()

        logger.info(f"Raw Gemini response:\n{raw_response}")

        ai_data = json.loads(raw_response)

        summary = ai_data.get("summary")
        if not summary:
            raise ValueError("AI response did not contain a 'summary' field")

        logger.info("Successfully generated AI summary.")

        return summary

    except Exception as e:
        import traceback

        logger.exception("===== GEMINI EXCEPTION =====")
        traceback.print_exc()

        raise