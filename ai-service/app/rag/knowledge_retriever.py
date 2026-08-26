import re
import math
from typing import List, Dict, Any, Optional
from .knowledge_base import METEOROLOGICAL_KNOWLEDGE_BASE
from ..models.schemas import RAGSearchResult

class KnowledgeRetriever:
    """
    In-memory hybrid lexical and semantic knowledge retriever for domain meteorology
    """
    def __init__(self, documents: Optional[List[Dict[str, Any]]] = None):
        self.documents = documents or METEOROLOGICAL_KNOWLEDGE_BASE
        self._build_index()

    def _build_index(self):
        # Calculate term frequencies and document frequencies for BM25-style scoring
        self.doc_tokens = []
        self.df = {}
        self.num_docs = len(self.documents)

        for doc in self.documents:
            text = f"{doc['title']} {' '.join(doc['keywords'])} {doc['content']}".lower()
            tokens = set(re.findall(r'\w+', text))
            self.doc_tokens.append(tokens)
            for token in tokens:
                self.df[token] = self.df.get(token, 0) + 1

    def search(self, query: str, category: Optional[str] = None, top_k: int = 2) -> List[RAGSearchResult]:
        if not query or not query.strip():
            return []

        query_tokens = re.findall(r'\w+', query.lower())
        if not query_tokens:
            return []

        scores = []
        for idx, doc in enumerate(self.documents):
            if category and doc.get("category") != category:
                continue

            doc_text = f"{doc['title']} {' '.join(doc['keywords'])} {doc['content']}".lower()
            tokens = self.doc_tokens[idx]
            
            # 1. Term Match Score (IDF-weighted)
            match_score = 0.0
            for qt in query_tokens:
                if qt in tokens:
                    idf = math.log(1.0 + (self.num_docs - self.df.get(qt, 0) + 0.5) / (self.df.get(qt, 0) + 0.5))
                    match_score += max(idf, 0.2)

            # 2. Keyword exact boost
            keyword_boost = 0.0
            for kw in doc.get("keywords", []):
                if kw.lower() in query.lower():
                    keyword_boost += 1.5

            # 3. Title exact boost
            title_boost = 2.0 if doc.get("title", "").lower() in query.lower() else 0.0

            total_score = match_score + keyword_boost + title_boost

            if total_score > 0.3:
                scores.append((total_score, doc))

        # Sort by total score descending
        scores.sort(key=lambda x: x[0], reverse=True)

        results = []
        for score, doc in scores[:top_k]:
            normalized_score = min(round(score / 5.0, 3), 1.0)
            results.append(RAGSearchResult(
                title=doc["title"],
                content=doc["content"],
                category=doc["category"],
                source=doc["source"],
                relevance_score=normalized_score
            ))

        return results

    def format_for_prompt(self, search_results: List[RAGSearchResult]) -> str:
        if not search_results:
            return ""

        formatted_chunks = []
        for r in search_results:
            formatted_chunks.append(
                f"### [DOMAIN KNOWLEDGE CHUNK: {r.title}]\n"
                f"Source: {r.source}\n"
                f"Relevance: {r.relevance_score}\n"
                f"Content:\n{r.content}\n"
            )

        return "METEOROLOGICAL & SECTOR DOMAIN KNOWLEDGE:\n" + "\n".join(formatted_chunks)

default_retriever = KnowledgeRetriever()
