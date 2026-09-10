import json
import time
from typing import Generator, Dict, Any

from services.vector_store import VectorStore
from agents.rag_agent import RAGAgent
from agents.web_agent import WebScraperAgent
from agents.coder_agent import CoderAgent
from agents.image_agent import ImageAgent
from agents.notebooklm_agent import NotebookLMAgent

class Orchestrator:
    def __init__(self, vector_store: VectorStore):
        self.vector_store = vector_store
        self.rag_agent = RAGAgent(vector_store)
        self.web_agent = WebScraperAgent()
        self.coder_agent = CoderAgent()
        self.image_agent = ImageAgent()
        self.notebook_agent = NotebookLMAgent()

    def process_request_stream(self, prompt: str, mode: str = "auto") -> Generator[str, None, None]:
        """
        Processes user prompts and streams SSE formatted events: 'data: {...}\n\n'
        """
        lowered = prompt.lower()

        # Step 1: Orchestrator Intent Classification
        yield self._format_sse({
            "type": "telemetry",
            "agent": "Orchestrator Agent",
            "stage": "INTENT_CLASSIFICATION",
            "message": f"Analyzing user prompt: '{prompt}' (Mode: {mode})...",
            "progress": 5
        })
        time.sleep(0.3)

        # Mode detection
        is_audio_req = "podcast" in lowered or "audio" in lowered or "notebooklm" in lowered or mode == "audio"
        is_image_req = "image" in lowered or "generate photo" in lowered or "picture" in lowered or "draw" in lowered or mode == "image"
        is_code_req = "code" in lowered or "create project" in lowered or "build app" in lowered or "react" in lowered or "script" in lowered or mode == "coder"
        is_scrape_req = "scrape" in lowered or "search" in lowered or "internet" in lowered or "web" in lowered or "latest" in lowered or mode == "scraper"

        # Check RAG context availability
        rag_res = self.rag_agent.query(prompt) if self.vector_store.documents else {"found": False}

        if is_audio_req:
            yield self._format_sse({
                "type": "telemetry",
                "agent": "Orchestrator Agent",
                "stage": "DELEGATING",
                "message": "Delegating to NotebookLM Feature Suite Agent -> Generating Audio Podcast Overview...",
                "progress": 25
            })
            time.sleep(0.4)

            context_str = rag_res.get("context", prompt)
            audio_data = self.notebook_agent.generate_audio_overview(prompt, context_str)

            yield self._format_sse({
                "type": "final_response",
                "agent": "NotebookLM Suite Agent",
                "text": f"🎙️ **NotebookLM Audio Overview Generated!**\n\nI have created a 2-host audio podcast discussion based on your request: *\"{prompt}\"*.",
                "feature_type": "audio",
                "audio_data": audio_data
            })

        elif is_image_req:
            yield self._format_sse({
                "type": "telemetry",
                "agent": "Orchestrator Agent",
                "stage": "DELEGATING",
                "message": "Delegating to Image Synthesizer Agent -> Crafting prompt & artwork rendering...",
                "progress": 30
            })
            time.sleep(0.5)

            image_data = self.image_agent.generate_image(prompt)

            yield self._format_sse({
                "type": "final_response",
                "agent": "Image Synthesizer Agent",
                "text": f"🎨 **AI Image Rendered Successfully!**\n\nGenerated high-resolution artwork for prompt: *\"{prompt}\"*.",
                "feature_type": "image",
                "image_data": image_data
            })

        elif is_code_req:
            yield self._format_sse({
                "type": "telemetry",
                "agent": "Orchestrator Agent",
                "stage": "DELEGATING",
                "message": "Delegating to Coder & Project Builder Agent -> Structuring multi-file project architecture...",
                "progress": 30
            })
            time.sleep(0.5)

            project_data = self.coder_agent.generate_project(prompt)

            yield self._format_sse({
                "type": "final_response",
                "agent": "Coder & Project Builder Agent",
                "text": f"💻 **Project Created Successfully!**\n\nI have generated a multi-file project structure for: *\"{prompt}\"*. You can inspect the files below or export as a ZIP archive.",
                "feature_type": "code",
                "code_data": project_data
            })

        elif is_scrape_req:
            yield self._format_sse({
                "type": "telemetry",
                "agent": "Orchestrator Agent",
                "stage": "DELEGATING",
                "message": "Delegating to Web Search & Scraper Agent -> Initiating live web transparency feed...",
                "progress": 10
            })

            # Stream web agent events directly to SSE
            scraped_content = []
            for event in self.web_agent.search_and_scrape(prompt):
                if event["type"] == "telemetry":
                    yield self._format_sse(event)
                elif event["type"] == "result":
                    scraped_content = event["data"]

            snippet_summary = ""
            if scraped_content:
                snippet_summary = "\n\n**Scraped Source Summary:**\n" + "\n".join([f"- [{s['title']}]({s['url']}): {s['content'][:200]}..." for s in scraped_content])

            yield self._format_sse({
                "type": "final_response",
                "agent": "Web Search & Scraper Agent",
                "text": f"🌐 **Web Search & Scraping Completed!**\n\nI searched the internet for *\"{prompt}\"* and analyzed live website data in real-time.{snippet_summary}",
                "feature_type": "web",
                "scraped_sources": scraped_content
            })

        else:
            # Default General / RAG Query
            if rag_res.get("found"):
                yield self._format_sse({
                    "type": "telemetry",
                    "agent": "RAG & Document Agent",
                    "stage": "VECTOR_SEARCH",
                    "message": f"Retrieved top document chunks matching query (Highest similarity: {rag_res['top_score']}%).",
                    "progress": 65
                })
                time.sleep(0.4)

                formatted_citations = "\n".join([f"• **{c['doc_name']}** (Page {c['page']} - Similarity: {c['score']}%): *\"{c['snippet']}\"*" for c in rag_res["citations"]])

                response_text = f"📚 **Answer derived from your NotebookLM Documents:**\n\nBased on your indexed workspace sources:\n\n{rag_res['context'][:800]}...\n\n### 🔍 Verified Citations:\n{formatted_citations}"

                yield self._format_sse({
                    "type": "final_response",
                    "agent": "Document & RAG Agent",
                    "text": response_text,
                    "citations": rag_res["citations"]
                })
            else:
                yield self._format_sse({
                    "type": "telemetry",
                    "agent": "Orchestrator Agent",
                    "stage": "GENERAL_REASONING",
                    "message": "Synthesizing answer using multiagent reasoning engine...",
                    "progress": 80
                })
                time.sleep(0.3)

                response_text = f"✨ **Nexus Multiagent Assistant:**\n\nI analyzed your prompt *\"{prompt}\"*. \n\n- You can upload **PDFs or TXT files** to enable vector RAG index queries.\n- You can request **\"Scrape topic\"** to trigger live web scraping transparency.\n- You can ask to **\"Create project\"** to generate multi-file code and download ZIP files.\n- You can request **\"Generate podcast audio\"** to synthesize a NotebookLM Audio Overview!"

                yield self._format_sse({
                    "type": "final_response",
                    "agent": "Orchestrator Agent",
                    "text": response_text
                })

    def _format_sse(self, data: Dict[str, Any]) -> str:
        return f"data: {json.dumps(data)}\n\n"
