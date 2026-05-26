# pip3 install feedparser (python library for parsing RSS feeds)
import ssl
ssl._create_default_https_context = ssl._create_unverified_context

import feedparser 
import logging
from datetime import datetime 


logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

RSS_FEEDS = {

    "GitHub":        "https://www.githubstatus.com/history.rss",
    "Cloudflare":    "https://www.cloudflarestatus.com/history.rss",
    "AWS":           "https://status.aws.amazon.com/rss/all.rss",
    "Google Cloud":  "https://status.cloud.google.com/en/feed.atom",
    "Datadog":       "https://status.datadoghq.com/history.rss",
    "PagerDuty":     "https://status.pagerduty.com/history.rss",
    "Shopify":       "https://www.shopifystatus.com/history.rss",
    "Atlassian":     "https://status.atlassian.com/history.rss"
}


# fetch_feed function: how to fetch function 

def fetch_feed(company : str, url : str) -> list: 

    logger.info(f"Fetching feed from {company} ...")

    try: 
        # feed is an object that contains the parsed RSS feed data :
        feed = feedparser.parse(url)

        if feed.bozo and not feed.entries: 
            logger.warning(f"Could not parse feed for {company}: {url}")
            return [] # skip this feed 

        incidents = []

        for entry in feed.entries: 
            incident = {
                "company":     company,
                "title":       entry.get("title", "No title"),
                "description": entry.get("summary", "No description"),
                "url":         entry.get("link", ""),
                "published":   entry.get("published", str(datetime.now())),
                "source":      "rss",
            }

            incidents.append(incident)

            logger.info(f"Found {len(incidents)} incidents for {company}")

        return incidents
        

    except Exception as e:
        logger.error(f"Failed to fetch {company}: {e}")
        return []


# fetch_all_feeds: goes through all the RSS feeds and called fetch_feed for each one, and aggregates the results into a single list of incidents.

def fetch_all_feeds() -> list: 
    all_incidents = []

    for company, url in RSS_FEEDS.items():
        incidents = fetch_feed(company, url)
        all_incidents.extend(incidents)

    logger.info(f"Total incidents fetched: {len(all_incidents)}")
    return all_incidents
 


