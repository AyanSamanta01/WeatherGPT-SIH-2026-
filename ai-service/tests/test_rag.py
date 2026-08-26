import pytest
from app.rag.knowledge_retriever import default_retriever

def test_rag_cyclone_warning_search():
    results = default_retriever.search("IMD 4 stage cyclone warning stages", top_k=2)
    assert len(results) > 0
    assert any("Cyclone" in r.title for r in results)
    assert results[0].relevance_score > 0.3
    assert results[0].source is not None

def test_rag_monsoon_dynamics_search():
    results = default_retriever.search("What is the effect of El Nino on Indian monsoon?", top_k=2)
    assert len(results) > 0
    assert any("El Niño" in r.title or "Monsoon" in r.title for r in results)

def test_rag_ndma_heatwave_search():
    results = default_retriever.search("NDMA heatwave threshold and safety protocols", top_k=2)
    assert len(results) > 0
    assert any("Heatwave" in r.title for r in results)

def test_rag_formatting_for_prompt():
    results = default_retriever.search("lightning 30-30 rule safety", top_k=1)
    prompt_str = default_retriever.format_for_prompt(results)
    assert "DOMAIN KNOWLEDGE CHUNK" in prompt_str
    assert "30-30 Rule" in prompt_str or "Lightning" in prompt_str
