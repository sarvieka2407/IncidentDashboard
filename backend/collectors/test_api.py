import requests

data = requests.get(
    "https://status.atlassian.com/api/v2/incidents.json"
).json()

print(data["incidents"][0]["name"])
print(data["incidents"][0]["created_at"])