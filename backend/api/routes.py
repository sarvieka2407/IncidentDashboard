import sys
import logging
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)) + "/..")

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from collectors.rss_collector import fetch_all_feeds
from collectors.api_collector import fetch_all_apis

from database.db import (
    save_incidents,
    get_all_incidents,
    get_companies,
)

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
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3002",
        "http://10.254.128.113:3002",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _sync_database():
    rss_incidents = fetch_all_feeds()
    api_incidents = fetch_all_apis()

    all_incidents = rss_incidents + api_incidents

    logger.info(f"Fetched {len(all_incidents)} incidents")

    saved = save_incidents(all_incidents)

    logger.info(f"Saved {saved} incidents to database")
    return len(all_incidents), saved


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "message": "Incident Dashboard API is running"
    }


@app.get("/incidents")
def get_all_incidents_endpoint():

    incidents = get_all_incidents()

    if not incidents:
        logger.info("Database empty. Performing initial synchronization...")
        fetched, saved = _sync_database()
        logger.info("Synchronization complete.")
        incidents = get_all_incidents()
        logger.info(f"Database initialized with {len(incidents)} incidents.")

    return {
        "total": len(incidents),
        "incidents": incidents
    }


@app.get("/incidents/{company}")
def get_incidents_by_company(company: str):

    incidents = get_all_incidents()

    filtered = [
        incident
        for incident in incidents
        if incident["company"].lower() == company.lower()
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
def get_companies_endpoint():

    companies = get_companies()

    return {
        "total": len(companies),
        "companies": companies
    }


@app.get("/refresh")
def refresh_incidents():

    fetched, saved = _sync_database()

    return {
        "message": "Data refreshed successfully",
        "fetched": fetched,
        "saved": saved
    }