import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from database.schema import Base, Incident

# ---------------------------------------------------------
# DATABASE SETUP
# ---------------------------------------------------------

# database file location
# puts incidents.db in the same folder as main.py
DATABASE_URL = "sqlite:///./incidents.db"
print("Database path:", os.path.abspath("incidents.db"))


# create_engine connects to the database
# echo=True prints all SQL queries (useful for debugging)
# connect_args is SQLite specific
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False  # set to True if you want to see SQL queries
)

# SessionLocal is a factory for creating sessions
# a session is like a connection to the database
# you need one to read/write data
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# ---------------------------------------------------------
# CREATE TABLES
# run this once at startup to create the incidents table
# if the table already exists, it does nothing
# ---------------------------------------------------------
def init_db():
    """
    Creates all database tables.
    Run this once at app startup.
    """
    Base.metadata.create_all(bind=engine)
    print("✅ Database initialized")


# ---------------------------------------------------------
# GET DATABASE SESSION
# this is a helper function for getting a fresh session
# used in the routes
# ---------------------------------------------------------
def get_db() -> Session:
    """
    Returns a database session.
    Used as a dependency in FastAPI endpoints.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------------------------------------------------
# SAVE INCIDENTS
# takes raw incident data from collectors
# creates Incident objects and saves them to the database
# ---------------------------------------------------------
def save_incident(incident_data: dict) -> Incident:
    """
    Saves one incident to the database.
    Takes a dictionary (from RSS/API collector) and saves as a row.
    
    Returns the saved Incident object.
    """
    db = SessionLocal()
    try:
        # create an Incident object from the dictionary
        incident = Incident(
            company      = incident_data.get("company"),
            title        = incident_data.get("title"),
            description  = incident_data.get("description"),
            summary      = incident_data.get("summary"),
            severity     = incident_data.get("severity"),
            services     = incident_data.get("services"),
            region       = incident_data.get("region"),
            status       = incident_data.get("status"),
            source       = incident_data.get("source"),
            url          = incident_data.get("url"),
            published    = incident_data.get("published"),
            ai_processed = incident_data.get("ai_processed", "false"),
        )
        
        # add to session (queued for saving)
        db.add(incident)
        
        # commit saves it to the database for real
        db.commit()
        
        # refresh reloads the object from the database
        # this gives us the ID that was auto-generated
        db.refresh(incident)
        
        return incident
        
    except Exception as e:
        db.rollback()
        print(f"Error saving incident: {e}")
        raise
    finally:
        db.close()


# ---------------------------------------------------------
# SAVE MULTIPLE INCIDENTS
# batch saves many incidents at once
# more efficient than calling save_incident in a loop
# ---------------------------------------------------------

def save_incidents(incidents_data: list) -> int:
    """
    Saves multiple incidents.

    If an incident already exists (same company + title),
    update it with the latest information.

    Otherwise insert it as a new incident.

    Returns the number of rows inserted or updated.
    """

    db = SessionLocal()

    try:
        count = 0

        for incident_data in incidents_data:
            company = incident_data.get("company")
            title = incident_data.get("title")
            description = incident_data.get("description")
            status = incident_data.get("status")
            source = incident_data.get("source")
            published = incident_data.get("published")

            # Check if this incident already exists
            existing = db.query(Incident).filter(
                Incident.company == company,
                Incident.title == title
            ).first()

            if existing:
                # Update latest information only if changed
                if existing.description != description:
                    existing.description = description
                    # TODO:
                    # If description changes, invalidate cached AI summary.
                    # summary = NULL
                    # ai_processed = false

                if existing.status != status:
                    existing.status = status

                if existing.source != source:
                    existing.source = source

                if existing.published != published:
                    existing.published = published

                count += 1
                continue

            # New incident
            incident = Incident(
                company=company,
                title=title,
                description=description,

                summary=incident_data.get("summary"),
                severity=incident_data.get("severity"),
                services=incident_data.get("services"),
                region=incident_data.get("region"),

                status=status,
                source=source,
                url=incident_data.get("url"),
                published=published,

                ai_processed=incident_data.get("ai_processed", False),
            )

            db.add(incident)
            count += 1

        db.commit()
        return count

    except Exception as e:
        db.rollback()
        print(f"Error saving incidents: {e}")
        raise

    finally:
        db.close()

# ---------------------------------------------------------
# GET ALL INCIDENTS
# ---------------------------------------------------------
def get_all_incidents() -> list:
    """
    Returns all incidents from the database.
    Ordered by most recent first (created_at DESC).
    """
    db = SessionLocal()
    try:
        incidents = db.query(Incident)\
            .order_by(Incident.created_at.desc())\
            .all()
        
        print("SQLAlchemy count:", db.query(Incident).count())
        print("Fetched rows:", len(incidents))
        print("First IDs:", [i.id for i in incidents[:10]])
        
        # convert objects to dictionaries for JSON
        return [i.to_dict() for i in incidents]
        
    except Exception as e:
        print(f"Error fetching incidents: {e}")
        return []
    finally:
        db.close()


# ---------------------------------------------------------
# GET INCIDENTS BY COMPANY
# ---------------------------------------------------------
def get_incidents_by_company(company: str) -> list:
    """
    Returns all incidents for a specific company.
    """
    db = SessionLocal()
    try:
        incidents = db.query(Incident)\
            .filter(Incident.company == company)\
            .order_by(Incident.created_at.desc())\
            .all()
        
        return [i.to_dict() for i in incidents]
        
    except Exception as e:
        print(f"Error fetching incidents: {e}")
        return []
    finally:
        db.close()


# ---------------------------------------------------------
# GET INCIDENTS BY SEVERITY
# ---------------------------------------------------------
def get_incidents_by_severity(severity: str) -> list:
    """
    Returns all incidents with a specific severity level.
    """
    db = SessionLocal()
    try:
        incidents = db.query(Incident)\
            .filter(Incident.severity == severity)\
            .order_by(Incident.created_at.desc())\
            .all()
        
        return [i.to_dict() for i in incidents]
        
    except Exception as e:
        print(f"Error fetching incidents: {e}")
        return []
    finally:
        db.close()


# ---------------------------------------------------------
# GET UNIQUE COMPANIES
# returns list of all companies in the database
# ---------------------------------------------------------
def get_companies() -> list:
    """
    Returns a sorted list of all unique companies.
    """
    db = SessionLocal()
    try:
        companies = db.query(Incident.company)\
            .distinct()\
            .all()
        
        # query returns tuples like [('AWS',), ('GitHub',)]
        # extract just the company name
        return sorted([c[0] for c in companies])
        
    except Exception as e:
        print(f"Error fetching companies: {e}")
        return []
    finally:
        db.close()


# ---------------------------------------------------------
# CLEAR ALL INCIDENTS
# useful for testing or resetting
# ---------------------------------------------------------
def clear_all_incidents() -> int:
    """
    Deletes all incidents from the database.
    Returns the count deleted.
    """
    db = SessionLocal()
    try:
        count = db.query(Incident).delete()
        db.commit()
        return count
        
    except Exception as e:
        db.rollback()
        print(f"Error clearing incidents: {e}")
        raise
    finally:
        db.close()


# ---------------------------------------------------------
# GET INCIDENT COUNT
# ---------------------------------------------------------
def get_incident_count() -> int:
    """
    Returns total number of incidents in database.
    """
    db = SessionLocal()
    try:
        count = db.query(Incident).count()
        return count
    except Exception as e:
        print(f"Error counting incidents: {e}")
        return 0
    finally:
        db.close()