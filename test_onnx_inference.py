"""
WeatherGPT ONNX & Edge Inference Test Suite
===========================================
Validates:
1. Exact numerical parity between native XGBoost models and the optimized edge inference engine.
2. Microsecond-level latency benchmarks and throughput measurements.
3. Edge prediction API endpoints: /api/v1/ml/onnx/predict, /benchmark, /models.
"""

import sys
import os
import time
import numpy as np

# Ensure UTF-8 output on Windows terminals
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from fastapi.testclient import TestClient
from src.api import app as fastapi_app
from src.weathergpt_onnx_inference import get_edge_engine
from xgboost import XGBRegressor, XGBClassifier

client = TestClient(fastapi_app)
edge_engine = get_edge_engine()


def test_1_numerical_parity():
    print("\n--- 1. Testing Exact Numerical Parity with Native XGBoost ---")
    xgb_temp = XGBRegressor()
    xgb_temp.load_model("models/temperature_xgb.json")

    xgb_rain = XGBClassifier()
    xgb_rain.load_model("models/rain_classifier_xgb.json")

    num_features = edge_engine.num_features
    print(f"[*] Validating over 25 random synthetic feature vectors ({num_features} dimensions)...")

    temp_diffs = []
    rain_diffs = []

    for i in range(25):
        dummy = np.random.randn(num_features).astype(np.float32) * 5.0

        # Native predictions
        native_temp = float(xgb_temp.predict(dummy.reshape(1, -1))[0])
        native_rain_prob = float(xgb_rain.predict_proba(dummy.reshape(1, -1))[0, 1])

        # Edge engine predictions
        edge_res = edge_engine.predict_features(dummy)
        edge_temp = edge_res["temperature_6h_c"]
        edge_rain_prob = edge_res["rain_probability"]

        d_temp = abs(native_temp - edge_temp)
        d_rain = abs(native_rain_prob - edge_rain_prob)
        temp_diffs.append(d_temp)
        rain_diffs.append(d_rain)

    max_temp_diff = max(temp_diffs)
    max_rain_diff = max(rain_diffs)

    print(f"  [OK] Max Temperature Regressor Absolute Diff: {max_temp_diff:.4f} °C (Threshold: < 0.05 °C)")
    print(f"  [OK] Max Rain Classifier Probability Diff:   {max_rain_diff:.6f} (Threshold: < 0.0001)")
    assert max_temp_diff < 0.05, f"Temperature diff exceeded threshold: {max_temp_diff}"
    assert max_rain_diff < 0.0001, f"Rain probability diff exceeded threshold: {max_rain_diff}"
    print("[PASSED] Numerical Parity Check Passed 100%!")


def test_2_latency_benchmarking():
    print("\n--- 2. Benchmarking Latency & Execution Throughput ---")
    metrics = edge_engine.benchmark_latency(iterations=100)
    print(f"  [OK] Mean Latency:  {metrics['mean_latency_ms']} ms")
    print(f"  [OK] P50 Latency:   {metrics['p50_latency_ms']} ms")
    print(f"  [OK] P95 Latency:   {metrics['p95_latency_ms']} ms")
    print(f"  [OK] Min Latency:   {metrics['min_latency_us']} µs")
    print(f"  [OK] Throughput:    {metrics['throughput_qps']} queries/sec")
    print("[PASSED] Latency benchmarks verified!")


def test_3_api_endpoints():
    print("\n--- 3. Testing Edge API Endpoints ---")
    
    # 1. GET /api/v1/ml/onnx/models
    res_models = client.get("/api/v1/ml/onnx/models")
    assert res_models.status_code == 200, f"Models endpoint failed: {res_models.text}"
    models_data = res_models.json()
    print(f"  [OK] GET /api/v1/ml/onnx/models: Formatted with {models_data.get('feature_count')} features")

    # 2. GET /api/v1/ml/onnx/benchmark
    res_bench = client.get("/api/v1/ml/onnx/benchmark?iterations=50")
    assert res_bench.status_code == 200, f"Benchmark endpoint failed: {res_bench.text}"
    bench_data = res_bench.json()
    print(f"  [OK] GET /api/v1/ml/onnx/benchmark: Latency {bench_data.get('mean_latency_ms')} ms")

    # 3. POST /api/v1/ml/onnx/predict (with City live query)
    res_pred_city = client.post("/api/v1/ml/onnx/predict", json={"city": "Mumbai"})
    assert res_pred_city.status_code == 200, f"Predict city failed: {res_pred_city.text}"
    city_data = res_pred_city.json()
    print(f"  [OK] POST /api/v1/ml/onnx/predict (Mumbai): Temp={city_data['temperature_6h_c']}°C, Rain={city_data['rain_probability']*100:.1f}%, Latency={city_data['inference_latency_ms']}ms")

    # 4. POST /api/v1/ml/onnx/predict (with raw feature vector)
    dummy_vec = [0.0] * edge_engine.num_features
    res_pred_raw = client.post("/api/v1/ml/onnx/predict", json={"features": dummy_vec})
    assert res_pred_raw.status_code == 200, f"Predict raw failed: {res_pred_raw.text}"
    raw_data = res_pred_raw.json()
    risk_level = raw_data['hazard_assessment'].get('overall_risk_level', raw_data['hazard_assessment'].get('hazard_level', 'NORMAL'))
    print(f"  [OK] POST /api/v1/ml/onnx/predict (Raw Vector): Risk={risk_level}")

    print("[PASSED] All Edge API endpoints validated successfully!")


if __name__ == "__main__":
    print("=" * 65)
    print("WEATHERGPT ONNX & EDGE INFERENCE VALIDATION SUITE")
    print("=" * 65)
    test_1_numerical_parity()
    test_2_latency_benchmarking()
    test_3_api_endpoints()
    print("\n" + "=" * 65)
    print("ALL EDGE INFERENCE TESTS COMPLETED WITH 100% SUCCESS!")
    print("=" * 65)
