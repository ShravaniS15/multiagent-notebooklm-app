import io
from typing import List, Dict, Any
import pypdf

class DocumentProcessor:
    @staticmethod
    def process_pdf(file_bytes: bytes, filename: str) -> List[Dict[str, Any]]:
        chunks = []
        try:
            pdf_reader = pypdf.PdfReader(io.BytesIO(file_bytes))
            for page_num, page in enumerate(pdf_reader.pages, start=1):
                text = page.extract_text() or ""
                page_chunks = DocumentProcessor._chunk_text(text, chunk_size=400, overlap=50)
                for idx, chunk in enumerate(page_chunks):
                    chunks.append({
                        "page": page_num,
                        "chunk_index": idx,
                        "text": chunk
                    })
        except Exception as e:
            print(f"Error reading PDF {filename}: {e}")
            # Fallback string extraction
            try:
                raw_text = file_bytes.decode('utf-8', errors='ignore')
                raw_chunks = DocumentProcessor._chunk_text(raw_text, chunk_size=400, overlap=50)
                for idx, chunk in enumerate(raw_chunks):
                    chunks.append({"page": 1, "chunk_index": idx, "text": chunk})
            except Exception:
                pass
        return chunks

    @staticmethod
    def process_text(text_content: str, filename: str) -> List[Dict[str, Any]]:
        chunks = []
        raw_chunks = DocumentProcessor._chunk_text(text_content, chunk_size=400, overlap=50)
        for idx, chunk in enumerate(raw_chunks):
            chunks.append({
                "page": 1,
                "chunk_index": idx,
                "text": chunk
            })
        return chunks

    @staticmethod
    def _chunk_text(text: str, chunk_size: int = 400, overlap: int = 50) -> List[str]:
        words = text.split()
        if not words:
            return []
        
        chunks = []
        i = 0
        while i < len(words):
            chunk_words = words[i : i + chunk_size]
            chunk_str = " ".join(chunk_words).strip()
            if chunk_str:
                chunks.append(chunk_str)
            i += (chunk_size - overlap)
        return chunks
