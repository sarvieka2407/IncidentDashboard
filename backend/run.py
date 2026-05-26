import sys
import os
 
# this tells Python where to look for your modules
# without this, "from collectors.rss_collector import..." would fail
# because Python wouldn't know where the collectors folder is
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
 
from collectors.rss_collector import fetch_all_feeds
from processors.ai_summarizer import summarize_all_incidents
from collectors.api_collector import fetch_all_apis
 
 
# ---------------------------------------------------------
# HELPER — pretty print one incident
# just makes the terminal output readable
# ---------------------------------------------------------
def print_incident(incident: dict):
    severity_colors = {
        "Critical": "🔴",
        "High":     "🟠",
        "Medium":   "🟡",
        "Low":      "🟢",
        "Unknown":  "⚪",
    }
 
    icon = severity_colors.get(incident.get("severity", "Unknown"), "⚪")
 
    print(f"""
{icon} [{incident.get('severity', 'Unknown')}] {incident.get('company')} — {incident.get('title')}
   Summary:  {incident.get('summary', 'N/A')}
   Services: {', '.join(incident.get('services', [])) or 'Unknown'}
   Region:   {incident.get('region', 'Unknown')}
   Status:   {incident.get('status', 'Unknown')}
   Published:{incident.get('published', 'Unknown')}
""")
    print("-" * 70)
 
 
# ---------------------------------------------------------
# MAIN PIPELINE
# this is the full flow:
# collect → process → display
# ---------------------------------------------------------
def run_pipeline():
    print("\n" + "=" * 70)
    print("   INCIDENT DASHBOARD — PIPELINE TEST")
    print("=" * 70)
 
    # ----- STEP 1: COLLECT -----
    print("\n📡 STEP 1 — Fetching incidents from RSS feeds...\n")
    raw_incidents = fetch_all_feeds()
    api_incidents = fetch_all_apis()                        # ← add this
    raw_incidents = raw_incidents + api_incidents
 
    if not raw_incidents:
        print("❌ No incidents fetched. Check your internet connection or RSS URLs.")
        return
 
    print(f"\n✅ Fetched {len(raw_incidents)} raw incidents")
 
    # for testing — only process first 5 incidents
    # ai calls cost money/quota, no point processing all 100+
    # remove this slice once everything is confirmed working
    test_batch = raw_incidents[:5]
    print(f"   (processing first {len(test_batch)} for this test run)\n")
 
    # ----- STEP 2: PROCESS -----
    print("🤖 STEP 2 — Sending to AI for summarization...\n")
    enriched_incidents = summarize_all_incidents(test_batch)
 
    # ----- STEP 3: DISPLAY -----
    print("\n" + "=" * 70)
    print("   RESULTS")
    print("=" * 70)
 
    for incident in enriched_incidents:
        print_incident(incident)
 
    # ----- SUMMARY -----
    total     = len(enriched_incidents)
    processed = sum(1 for i in enriched_incidents if i.get("ai_processed"))
    failed    = total - processed
 
    print(f"\n📊 SUMMARY")
    print(f"   Total processed : {total}")
    print(f"   AI enriched     : {processed}")
    print(f"   Failed          : {failed}")
    print("\n✅ Pipeline test complete!\n")
 
 
if __name__ == "__main__":
    run_pipeline()