import uvicorn
from database.db import init_db
init_db()   


if __name__ == "__main__":
    uvicorn.run(
        "api.routes:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )