import sys
import os

# Load .env only in local development. In production (Render/Vercel)
# environment variables are injected directly by the platform.
if os.path.exists(".env"):
    from dotenv import load_dotenv
    load_dotenv()

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    import uvicorn
    debug = os.environ.get("ENVIRONMENT", "development") == "development"
    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 8000)),
        reload=debug,
    )
