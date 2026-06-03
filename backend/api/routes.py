import sys
import logging
import os
from processors.ai_summarizer import summarize_all_incidents
sys.path.append(os.path.dirname(os.path.abspath(__file__)) + "/..")

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from collectors.rss_collector import fetch_all_feeds
from collectors.api_collector import fetch_all_apis

from database.db import save_incidents, get_all_incidents, get_companies, get_incident_count

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Incident Dashboard API",
    description="Aggregates tech incidents from RSS feeds and APIs",
    version="1.0.0"
)



app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],   
    allow_methods=["GET"],                     
    allow_headers=["*"],
)


 
incidents_cache = []


def get_incidents_from_cache():
    global incidents_cache

    if not incidents_cache:
        rss_incidents = fetch_all_feeds()
        api_incidents = fetch_all_apis()

        all_incidents = rss_incidents + api_incidents

        logger.info(f"Fetched {len(all_incidents)} incidents")

        # AI processing
        incidents_cache = summarize_all_incidents(all_incidents)

        save_incidents(incidents_cache)

        logger.info(
            f"Saved {len(incidents_cache)} incidents to database"
        )

    return incidents_cache

 
@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Incident Dashboard API is running"}

 
@app.get("/incidents")
def get_all_incidents():
    incidents = get_incidents_from_cache()
    return {
        "total": len(incidents),
        "incidents": incidents
    }


 
@app.get("/incidents/{company}")
def get_incidents_by_company(company: str):
    incidents = get_incidents_from_cache()
 
    filtered = [
        i for i in incidents
        if i["company"].lower() == company.lower()
    ]

    if not filtered:
 
        raise HTTPException(
            status_code=404,
            detail=f"No incidents found for company: {company}"
        )

    return {
        "company": company,
        "total": len(filtered),
        "incidents": filtered
    }

 
@app.get("/companies")
def get_companies():
    incidents = get_incidents_from_cache()

    # set() removes duplicates — if AWS appears 36 times,
    # it only appears once in the set
    companies = list(set(i["company"] for i in incidents))
    companies.sort()  # alphabetical order

    return {
        "total": len(companies),
        "companies": companies
    }
 
@app.get("/refresh")
def refresh_incidents():
    global incidents_cache

    # clear the cache
    incidents_cache = []

    # fetch fresh data
    incidents = get_incidents_from_cache()

    return {
        "message": "Data refreshed successfully",
        "total": len(incidents)
    }

 