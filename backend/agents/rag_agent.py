from typing import List, Dict, Any
from services.vector_store import VectorStore

class RAGAgent:
    def __init__(self, vector_store: VectorStore):
        self.name = "Document & RAG Agent"
        self.vector_store = vector_store

    def query(self, user_query: str) -> Dict[str, Any]:
        results = self.vector_store.search(user_query, top_k=4)
        if not results:
            return {
                "found": False,
                "context": "",
                "citations": [],
                "message": "No relevant document chunks found in your NotebookLM workspace sources."
            }
        
        context_parts = []
        citations = []
        for idx, res in enumerate(results, start=1):
            context_parts.append(f"[Source {idx}: {res['doc_name']}, Page {res['page']}]\n{res['text']}")
            citations.append({
                "source_num": idx,
                "doc_name": res["doc_name"],
                "page": res["page"],
                "score": res["score"],
                "snippet": res["text"][:120] + "..."
            })

        return {
            "found": True,
            "context": "\n\n".join(context_parts),
            "citations": citations,
            "top_score": results[0]["score"] if results else 0
        }
