import os
import io
import zipfile
from typing import List, Optional
from fastapi import FastAPI, File, UploadFile, Query, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from services.vector_store import VectorStore
from services.pdf_service import DocumentProcessor
from agents.orchestrator import Orchestrator

app = FastAPI(title="NexusLM Multiagent API Engine", version="1.0.0")

# Enable CORS for local dev servers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global in-memory VectorStore and Orchestrator state
vector_store = VectorStore()
orchestrator = Orchestrator(vector_store)
uploaded_files_registry = []

class ProjectExportRequest(BaseModel):
    files: dict
    project_name: Optional[str] = "nexus_generated_project"

class NotebookRequest(BaseModel):
    topic: str
    context: Optional[str] = ""

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "NexusLM Multiagent Engine",
        "indexed_documents": len(uploaded_files_registry),
        "total_vector_chunks": len(vector_store.documents)
    }

@app.post("/api/upload")
async def upload_document(file: UploadFile = File(...)):
    filename = file.filename
    content = await file.read()
    
    chunks = []
    if filename.lower().endswith(".pdf"):
        chunks = DocumentProcessor.process_pdf(content, filename)
    else:
        text_str = content.decode('utf-8', errors='ignore')
        chunks = DocumentProcessor.process_text(text_str, filename)

    if not chunks:
        raise HTTPException(status_code=400, detail="Could not extract text from uploaded document.")

    vector_store.add_document_chunks(filename, chunks)
    
    file_info = {
        "id": len(uploaded_files_registry) + 1,
        "name": filename,
        "size_bytes": len(content),
        "chunks_count": len(chunks)
    }
    uploaded_files_registry.append(file_info)

    return {
        "message": f"Successfully indexed '{filename}' into RAG Vector Store.",
        "file_info": file_info,
        "total_sources": len(uploaded_files_registry),
        "total_chunks": len(vector_store.documents)
    }

@app.get("/api/sources")
def get_sources():
    return {
        "sources": uploaded_files_registry,
        "total_chunks": len(vector_store.documents)
    }

@app.delete("/api/sources")
def clear_sources():
    global uploaded_files_registry
    vector_store.clear()
    uploaded_files_registry = []
    return {"message": "Workspace cleared."}

@app.get("/api/stream")
def stream_agent_execution(prompt: str = Query(...), mode: str = Query("auto")):
    """
    Streams multiagent execution events and live visual scraping telemetry over SSE.
    """
    return StreamingResponse(
        orchestrator.process_request_stream(prompt, mode),
        media_type="text/event-stream"
    )

@app.post("/api/notebooklm/briefing")
def get_briefing(req: NotebookRequest):
    return orchestrator.notebook_agent.generate_briefing_doc(
    req.topic,
    req.context or ""
)

@app.post("/api/notebooklm/mindmap")
def get_mindmap(req: NotebookRequest):
    return orchestrator.notebook_agent.generate_mindmap(req.topic)

@app.post("/api/export-project-zip")
def export_project_zip(req: ProjectExportRequest):
    zip_bytes = orchestrator.coder_agent.create_zip_bytes(req.files)
    filename = f"{req.project_name}.zip"
    return Response(
        content=zip_bytes,
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@app.get("/api/download-app-zip")
def download_complete_app_zip():
    """
    Packs the entire multiagent application directory into a downloadable zip file.
    """
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    buffer = io.BytesIO()
    
    with zipfile.ZipFile(buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(root_dir):
            dirs[:] = [d for d in dirs if d not in ('node_modules', '__pycache__', '.git', 'dist', 'build')]
            for file in files:
                abs_file = os.path.join(root, file)
                rel_file = os.path.relpath(abs_file, root_dir)
                zf.write(abs_file, os.path.join("multiagent_notebooklm_app", rel_file))
                
    buffer.seek(0)
    return Response(
        content=buffer.getvalue(),
        media_type="application/zip",
        headers={"Content-Disposition": "attachment; filename=multiagent_notebooklm_app.zip"}
    )

# Mount frontend dist static files if built
frontend_dist = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "dist")
if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="static_assets")
    
    @app.get("/{full_path:path}")
    def serve_frontend_spa(full_path: str):
        if full_path.startswith("api"):
            raise HTTPException(status_code=404, detail="API route not found")
        index_file = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        raise HTTPException(status_code=404, detail="Index file not found")

