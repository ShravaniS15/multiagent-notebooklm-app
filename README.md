# NexusLM - Multiagent AI Studio & RAG Workspace

NexusLM is a full-stack **Multiagent AI Platform** inspired by NotebookLM and modern agentic architectures. It features:

- 📄 **PDF & Document RAG Indexing**: Upload PDFs, TXT, MD, or code files for semantic chunking and TF-IDF vector similarity retrieval with exact source page citations.
- 🌐 **Live Web Scraping Transparency Feed**: Real-time visual telemetry panel that displays target web URLs, HTTP status, parsed DOM text, and scraping progress live on the frontend.
- 💻 **Project Builder & Code Studio**: Generates complete multi-file project structures (React, Python, etc.) with tabbed file viewing, syntax styling, and 1-click **Export Project ZIP**.
- 🎨 **AI Image Synthesizer**: Prompts and renders high-res AI artwork with instant preview.
- 🎙️ **NotebookLM Feature Suite**:
  - **Audio Overview (Podcast Generator)**: Converts documents into an interactive 2-host audio podcast discussion with Web Speech API audio synthesis and transcript timeline.
  - **Briefing Doc & Flashcards Deck**: Generates executive briefings, key takeaways, and flashcards.
  - **Knowledge Mindmap**: Interactive visual node graph representing document concepts.

---

## Quick Start Guide

### 1. Install & Run Backend (Python FastAPI)

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

Backend server will run at: `http://127.0.0.1:8000`

### 2. Install & Run Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Frontend UI will run at: `http://localhost:5173`

---

## Standalone ZIP Download

You can download the entire working project codebase directly from the UI by clicking **"Download Full App ZIP"** in the sidebar, or by accessing the API endpoint:
`GET http://127.0.0.1:8000/api/download-app-zip`
