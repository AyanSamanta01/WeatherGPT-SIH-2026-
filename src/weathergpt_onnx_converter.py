"""
WeatherGPT ONNX Model Converter & Architecture Export
=====================================================
Exports WeatherGPT decision graph representations, tensor schemas,
and generates performance benchmark logs in models/onnx_metadata.json.
"""

import os
import sys
import json
import time
from typing import Dict, Any
import numpy as np

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from src.weathergpt_onnx_inference import get_edge_engine

MODELS_DIR = os.path.join(BASE_DIR, "models")


def generate_onnx_graph_metadata(models_dir=MODELS_DIR) -> Dict[str, Any]:
    """
    Generates optimization and graph schema metadata for edge deployments.
    """
    print("=" * 65)
    print("WEATHERGPT EDGE MODEL EXPORT & GRAPH METRICS GENERATION")
    print("=" * 65)

    engine = get_edge_engine(models_dir=models_dir)
    print(f"[*] Loaded feature space dimensionality: {engine.num_features} features")
    print(f"[*] Temperature Regressor compiled trees: {engine.temp_engine.num_trees}")
    print(f"[*] Rain Classifier compiled trees:        {engine.rain_engine.num_trees}")

    # Benchmarking
    print("\n--- Benchmarking Latency over 200 Iterations ---")
    benchmark_res = engine.benchmark_latency(iterations=200)
    print(f"[*] Mean Single-Sample Latency: {benchmark_res['mean_latency_ms']} ms")
    print(f"[*] P95 Latency:                {benchmark_res['p95_latency_ms']} ms")
    print(f"[*] Estimated Throughput:       {benchmark_res['throughput_qps']} queries/sec")

    metadata = {
        "graph_specification": {
            "format": "WeatherGPT-Edge-Optimized-V1",
            "opset_target": 15,
            "input_tensor": {
                "name": "float_features",
                "dtype": "float32",
                "shape": [None, engine.num_features]
            },
            "output_tensors": [
                {"name": "temperature_6h_c", "dtype": "float32", "shape": [None, 1]},
                {"name": "rain_probability", "dtype": "float32", "shape": [None, 1]},
                {"name": "rainfall_amount_mm", "dtype": "float32", "shape": [None, 1]}
            ]
        },
        "models": {
            "temperature_regressor": {
                "source_file": "temperature_xgb.json",
                "trees_compiled": engine.temp_engine.num_trees,
                "base_score": engine.temp_engine.base_score
            },
            "rain_classifier": {
                "source_file": "rain_classifier_xgb.json",
                "trees_compiled": engine.rain_engine.num_trees,
                "classification_threshold": engine.rain_threshold
            }
        },
        "edge_performance": benchmark_res,
        "feature_count": engine.num_features,
        "features": engine.feature_columns,
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }

    meta_path = os.path.join(models_dir, "onnx_metadata.json")
    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"\n[+] Saved edge graph metadata: {meta_path}")
    print("=" * 65)
    return metadata


if __name__ == "__main__":
    generate_onnx_graph_metadata()
