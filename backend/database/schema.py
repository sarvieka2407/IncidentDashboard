from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.orm import DeclarativeBase
from datetime import datetime
 
# any class inherting from Base will be a table in the database
class Base(DeclarativeBase):
    pass

# class = table, objects = row
class Incident(Base):
    __tablename__ = 'incidents'

    # COLUMNS
    # Column() defines one column in the table.
    #id = Column(
    #Integer,
   # primary_key=True,
   # autoincrement=True
#)

    id          = Column(Integer, primary_key=True, autoincrement=True)
 
    company     = Column(String(100), nullable=False)

    title       = Column(String(500), nullable=False)
 
    description = Column(Text, nullable=True)
 
    summary     = Column(Text, nullable=True)
 
    severity    = Column(String(50), nullable=True)
 
    services    = Column(String(500), nullable=True)
 
    region      = Column(String(200), nullable=True)

    status      = Column(String(100), default="Work in Progress")

    source      = Column(String(50), nullable=True)
 
    url         = Column(String(500), nullable=True)
 
    published   = Column(String(200), nullable=True)
 
    created_at  = Column(DateTime, default=datetime.now)
 
    ai_processed = Column(String(10), default="false")

    def __repr__(self):
        return f"<Incident {self.id} | {self.company} | {self.title[:50]}>"
    
    def to_dict(self):
        return {
            "id":           self.id,
            "company":      self.company,
            "title":        self.title,
            "description":  self.description,
            "summary":      self.summary,
            "severity":     self.severity,
            "services":     self.services,
            "region":       self.region,
            "status":       self.status,
            "source":       self.source,
            "url":          self.url,
            "published":    self.published,
            "created_at":   str(self.created_at),
            "ai_processed": self.ai_processed,
        }
 