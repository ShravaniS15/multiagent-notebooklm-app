import math
import re
from typing import List, Dict, Any, Tuple

class VectorStore:
    def __init__(self):
        self.documents: List[Dict[str, Any]] = [] # [{id, doc_name, page, chunk_index, text, tokens}]
        self.vocabulary: Dict[str, int] = {}
        self.idf: Dict[str, float] = {}

    def _tokenize(self, text: str) -> List[str]:
        words = re.findall(r'\b\w+\b', text.lower())
        return [w for w in words if len(w) > 2]

    def add_document_chunks(self, doc_name: str, chunks: List[Dict[str, Any]]):
        """
        chunks: [{page: int, text: str, chunk_index: int}]
        """
        for c in chunks:
            tokens = self._tokenize(c["text"])
            doc_entry = {
                "id": f"{doc_name}_p{c.get('page', 1)}_c{c.get('chunk_index', 0)}",
                "doc_name": doc_name,
                "page": c.get("page", 1),
                "chunk_index": c.get("chunk_index", 0),
                "text": c["text"],
                "tokens": tokens
            }
            self.documents.append(doc_entry)
        self._rebuild_index()

    def _rebuild_index(self):
        doc_count = len(self.documents)
        if doc_count == 0:
            return

        df: Dict[str, int] = {}
        for doc in self.documents:
            unique_tokens = set(doc["tokens"])
            for t in unique_tokens:
                df[t] = df.get(t, 0) + 1

        self.idf = {t: math.log((doc_count + 1) / (count + 1)) + 1.0 for t, count in df.items()}

    def _get_vector(self, tokens: List[str]) -> Dict[str, float]:
        tf: Dict[str, float] = {}
        total = len(tokens)
        if total == 0:
            return {}
        for t in tokens:
            tf[t] = tf.get(t, 0) + 1.0
        
        vector = {}
        for t, count in tf.items():
            idf_val = self.idf.get(t, 1.0)
            vector[t] = (count / total) * idf_val
        return vector

    def _cosine_similarity(self, vec1: Dict[str, float], vec2: Dict[str, float]) -> float:
        intersection = set(vec1.keys()) & set(vec2.keys())
        dot_product = sum(vec1[t] * vec2[t] for t in intersection)
        
        mag1 = math.sqrt(sum(v ** 2 for v in vec1.values()))
        mag2 = math.sqrt(sum(v ** 2 for v in vec2.values()))
        
        if mag1 == 0 or mag2 == 0:
            return 0.0
        return dot_product / (mag1 * mag2)

    def search(self, query: str, top_k: int = 4) -> List[Dict[str, Any]]:
        query_tokens = self._tokenize(query)
        if not query_tokens or not self.documents:
            return []
        
        q_vec = self._get_vector(query_tokens)
        
        results = []
        for doc in self.documents:
            d_vec = self._get_vector(doc["tokens"])
            score = self._cosine_similarity(q_vec, d_vec)
            
            # Boost score if exact phrase matches
            if query.lower() in doc["text"].lower():
                score += 0.2
            
            if score > 0.01:
                results.append({
                    "id": doc["id"],
                    "doc_name": doc["doc_name"],
                    "page": doc["page"],
                    "chunk_index": doc["chunk_index"],
                    "text": doc["text"],
                    "score": round(min(score, 1.0) * 100, 1) # similarity percentage
                })
        
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_k]

    def clear(self):
        self.documents = []
        self.vocabulary = {}
        self.idf = {}
