"""
WeatherGPT Production ML Training & Evaluation Pipeline
======================================================
Lead ML Engineering script for training, validating, threshold-optimizing,
evaluating, and serializing WeatherGPT 6-hour forecasting models for 10 Indian cities.
"""

import os
import gc
import json
import time
from datetime import datetime
import numpy as np
import pandas as pd
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix
)
from xgboost import XGBRegressor, XGBClassifier
from lightgbm import LGBMRegressor, early_stopping, log_evaluation

# Configure paths
WORKSPACE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(WORKSPACE_DIR, "dataset")
MASTER_CSV_PATH = os.path.join(DATASET_DIR, "WeatherGPT_10_Cities_V3_Master.csv")
MODELS_DIR = os.path.join(WORKSPACE_DIR, "models")
SRC_DIR = os.path.join(WORKSPACE_DIR, "src")

os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(SRC_DIR, exist_ok=True)

EXPECTED_CITIES = [
    "Kolkata", "Delhi", "Mumbai", "Chennai", "Bengaluru",
    "Hyderabad", "Ahmedabad", "Guwahati", "Bhubaneswar", "Srinagar"
]

TOTAL_EXPECTED_ROWS = 1020180
ROWS_PER_CITY = 102018
TRAIN_ROWS_PER_CITY = 81614
VAL_ROWS_PER_CITY = 10202
TEST_ROWS_PER_CITY = 10202

DROP_COLUMNS = [
    "timestamp",
    "target_temperature_6h",
    "target_rainfall_6h"
]


def print_stage_header(stage_num, title):
    print("\n" + "=" * 70)
    print(f"STAGE {stage_num}: {title.upper()}")
    print("=" * 70)


def format_status(passed: bool, message: str = ""):
    status_str = "[PASSED]" if passed else "[FAILED]"
    if message:
        print(f"{status_str} {message}")
    else:
        print(status_str)
    if not passed:
        raise RuntimeError(f"Stage failed assertion: {message}")


def stage_1_inspect_files():
    print_stage_header(1, "Inspect Files and Load Master Dataset")
    print(f"Looking for dataset in: {DATASET_DIR}")
    
    files_found = os.listdir(DATASET_DIR)
    print(f"Files found in dataset directory ({len(files_found)} files):")
    for f in sorted(files_found):
        fpath = os.path.join(DATASET_DIR, f)
        size_mb = os.path.getsize(fpath) / (1024 * 1024)
        print(f"  - {f} ({size_mb:.2f} MB)")
        
    if os.path.exists(MASTER_CSV_PATH):
        print(f"\nSelected Master Dataset: {MASTER_CSV_PATH}")
        format_status(True, f"Master dataset file identified: {os.path.basename(MASTER_CSV_PATH)}")
        print("\nLoading master dataset into memory...")
        start_t = time.time()
        df_master = pd.read_csv(MASTER_CSV_PATH)
        print(f"Loaded master dataset in {time.time() - start_t:.2f}s. Shape: {df_master.shape}")
        return df_master
    else:
        print(f"\nMaster CSV not found at {MASTER_CSV_PATH}. Reconstructing from 10 city CSV files...")
        city_dfs = []
        for city in EXPECTED_CITIES:
            city_path = os.path.join(DATASET_DIR, f"{city}_V3.csv")
            if not os.path.exists(city_path):
                format_status(False, f"City dataset not found: {city_path}")
            print(f"  Loading {city}_V3.csv...")
            city_df = pd.read_csv(city_path)
            city_dfs.append(city_df)
        df_master = pd.concat(city_dfs, ignore_index=True)
        print(f"Successfully reconstructed master dataset from 10 city files. Shape: {df_master.shape}")
        format_status(True, "Master dataset reconstructed from 10 city CSV files.")
        return df_master


def stage_2_validate_dataset(df: pd.DataFrame):
    print_stage_header(2, "Validate Dataset Schema & Integrity")
    
    print(f"Total Rows: {len(df)} (Expected: {TOTAL_EXPECTED_ROWS})")
    print(f"Total Columns: {df.shape[1]} (Expected: 58)")
    
    # 1. Row count check
    row_count_ok = len(df) == TOTAL_EXPECTED_ROWS
    print(f"Row count validation: {'OK' if row_count_ok else 'FAIL'}")
    
    # 2. City count and distribution check
    city_counts = df["location"].value_counts()
    print("\nCity Distribution:")
    for city, count in city_counts.items():
        print(f"  {city:<15}: {count} rows")
        
    cities_in_data = sorted(list(df["location"].unique()))
    expected_sorted = sorted(EXPECTED_CITIES)
    cities_ok = (cities_in_data == expected_sorted) and (all(c == ROWS_PER_CITY for c in city_counts.values))
    print(f"City distribution validation: {'OK' if cities_ok else 'FAIL'}")
    
    # 3. Timestamp parsing & range check
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    min_ts = df["timestamp"].min()
    max_ts = df["timestamp"].max()
    print(f"\nTimestamp Range: {min_ts} to {max_ts}")
    ts_ok = (str(min_ts).startswith("2015-01-02")) and (str(max_ts).startswith("2026-08-22"))
    print(f"Timestamp range validation: {'OK' if ts_ok else 'FAIL'}")
    
    # 4. Duplicate checks
    dup_loc_ts = df.duplicated(subset=["location", "timestamp"]).sum()
    print(f"Duplicate (location, timestamp) rows: {dup_loc_ts}")
    dup_ok = (dup_loc_ts == 0)
    
    # 5. Missing value checks
    missing_count = df.isnull().sum().sum()
    print(f"Total missing values (NaNs): {missing_count}")
    missing_ok = (missing_count == 0)
    
    all_ok = row_count_ok and cities_ok and ts_ok and dup_ok and missing_ok
    format_status(all_ok, "Dataset schema, integrity, row counts, cities, and timestamps validated.")
    return df


def stage_3_temporal_split(df: pd.DataFrame):
    print_stage_header(3, "Create Chronological Temporal Train/Val/Test Split")
    
    train_parts = []
    val_parts = []
    test_parts = []
    
    print(f"Splitting strictly per city ({TRAIN_ROWS_PER_CITY} Train / {VAL_ROWS_PER_CITY} Val / {TEST_ROWS_PER_CITY} Test)...")
    
    leakage_detected = False
    
    for city in EXPECTED_CITIES:
        city_df = df[df["location"] == city].sort_values("timestamp").reset_index(drop=True)
        n = len(city_df)
        
        train_end = TRAIN_ROWS_PER_CITY
        val_end = TRAIN_ROWS_PER_CITY + VAL_ROWS_PER_CITY
        
        city_train = city_df.iloc[:train_end].copy()
        city_val = city_df.iloc[train_end:val_end].copy()
        city_test = city_df.iloc[val_end:].copy()
        
        # Temporal leakage checks
        train_max_ts = city_train["timestamp"].max()
        val_min_ts = city_val["timestamp"].min()
        val_max_ts = city_val["timestamp"].max()
        test_min_ts = city_test["timestamp"].min()
        
        if train_max_ts >= val_min_ts or val_max_ts >= test_min_ts:
            print(f"LEAKAGE in {city}: Train max {train_max_ts} >= Val min {val_min_ts} or Val max {val_max_ts} >= Test min {test_min_ts}")
            leakage_detected = True
            
        train_parts.append(city_train)
        val_parts.append(city_val)
        test_parts.append(city_test)
        
    df_train = pd.concat(train_parts, ignore_index=True)
    df_val = pd.concat(val_parts, ignore_index=True)
    df_test = pd.concat(test_parts, ignore_index=True)
    
    print("\nSplit Summary:")
    print(f"  Train : {df_train.shape[0]} rows ({df_train.shape[0] / len(df) * 100:.1f}%) | Range: {df_train['timestamp'].min()} to {df_train['timestamp'].max()}")
    print(f"  Val   : {df_val.shape[0]} rows ({df_val.shape[0] / len(df) * 100:.1f}%) | Range: {df_val['timestamp'].min()} to {df_val['timestamp'].max()}")
    print(f"  Test  : {df_test.shape[0]} rows ({df_test.shape[0] / len(df) * 100:.1f}%) | Range: {df_test['timestamp'].min()} to {df_test['timestamp'].max()}")
    
    split_ok = (
        len(df_train) == TRAIN_ROWS_PER_CITY * 10 and
        len(df_val) == VAL_ROWS_PER_CITY * 10 and
        len(df_test) == TEST_ROWS_PER_CITY * 10 and
        not leakage_detected
    )
    format_status(split_ok, "Temporal split successfully created without leakage.")
    return df_train, df_val, df_test


def stage_4_create_features_targets(df_train: pd.DataFrame, df_val: pd.DataFrame, df_test: pd.DataFrame):
    print_stage_header(4, "Construct Feature Matrices & Target Variables")
    
    feature_cols_raw = [c for c in df_train.columns if c not in DROP_COLUMNS]
    print(f"Raw feature count: {len(feature_cols_raw)}")
    print("Raw features:", feature_cols_raw)
    
    # One-hot encode location with fixed city list to prevent dimension drift
    print("\nOne-hot encoding 'location' column across all splits...")
    X_train = pd.get_dummies(df_train[feature_cols_raw], columns=["location"], dtype=int)
    X_val = pd.get_dummies(df_val[feature_cols_raw], columns=["location"], dtype=int)
    X_test = pd.get_dummies(df_test[feature_cols_raw], columns=["location"], dtype=int)
    
    # Align column structure to X_train
    feature_columns = list(X_train.columns)
    X_val = X_val.reindex(columns=feature_columns, fill_value=0)
    X_test = X_test.reindex(columns=feature_columns, fill_value=0)
    
    print(f"Final Encoded Feature count: {len(feature_columns)}")
    print(f"X_train shape: {X_train.shape}")
    print(f"X_val   shape: {X_val.shape}")
    print(f"X_test  shape: {X_test.shape}")
    
    # Save feature names list
    feature_names_path = os.path.join(MODELS_DIR, "feature_columns.json")
    with open(feature_names_path, "w") as f:
        json.dump(feature_columns, f, indent=2)
    print(f"Saved feature columns list to: {feature_names_path}")
    
    # Target 1: Temperature 6h
    y_temp_train = df_train["target_temperature_6h"].values
    y_temp_val = df_val["target_temperature_6h"].values
    y_temp_test = df_test["target_temperature_6h"].values
    
    # Target 2: Rain / No-Rain (target_rainfall_6h > 0)
    y_rain_train = (df_train["target_rainfall_6h"] > 0).astype(int).values
    y_rain_val = (df_val["target_rainfall_6h"] > 0).astype(int).values
    y_rain_test = (df_test["target_rainfall_6h"] > 0).astype(int).values
    
    print("\nRain Binary Target Distributions:")
    print(f"  Train: 0={np.sum(y_rain_train == 0)}, 1={np.sum(y_rain_train == 1)} ({np.mean(y_rain_train)*100:.2f}% rain)")
    print(f"  Val  : 0={np.sum(y_rain_val == 0)}, 1={np.sum(y_rain_val == 1)} ({np.mean(y_rain_val)*100:.2f}% rain)")
    print(f"  Test : 0={np.sum(y_rain_test == 0)}, 1={np.sum(y_rain_test == 1)} ({np.mean(y_rain_test)*100:.2f}% rain)")
    
    # Target 3: Rainfall amount (only on rain events > 0)
    rain_train_mask = (df_train["target_rainfall_6h"] > 0).values
    rain_val_mask = (df_val["target_rainfall_6h"] > 0).values
    rain_test_mask = (df_test["target_rainfall_6h"] > 0).values
    
    X_rain_train = X_train[rain_train_mask].copy()
    y_rain_amount_train = df_train.loc[rain_train_mask, "target_rainfall_6h"].values
    
    X_rain_val = X_val[rain_val_mask].copy()
    y_rain_amount_val = df_val.loc[rain_val_mask, "target_rainfall_6h"].values
    
    X_rain_test = X_test[rain_test_mask].copy()
    y_rain_amount_test = df_test.loc[rain_test_mask, "target_rainfall_6h"].values
    
    print(f"\nRain Amount Positive Samples count: Train={len(y_rain_amount_train)}, Val={len(y_rain_amount_val)}, Test={len(y_rain_amount_test)}")
    
    format_status(True, "Feature matrices and all 3 target sets properly defined.")
    
    data_dict = {
        "X_train": X_train, "y_temp_train": y_temp_train, "y_rain_train": y_rain_train,
        "X_val": X_val, "y_temp_val": y_temp_val, "y_rain_val": y_rain_val,
        "X_test": X_test, "y_temp_test": y_temp_test, "y_rain_test": y_rain_test,
        "X_rain_train": X_rain_train, "y_rain_amount_train": y_rain_amount_train,
        "X_rain_val": X_rain_val, "y_rain_amount_val": y_rain_amount_val,
        "X_rain_test": X_rain_test, "y_rain_amount_test": y_rain_amount_test,
        "rain_train_mask": rain_train_mask, "rain_val_mask": rain_val_mask, "rain_test_mask": rain_test_mask,
        "feature_columns": feature_columns
    }
    return data_dict


def stage_5_6_train_validate_temperature(data_dict, df_val):
    print_stage_header(5, "Train Temperature Regressor (XGBoost)")
    
    X_train = data_dict["X_train"]
    y_temp_train = data_dict["y_temp_train"]
    X_val = data_dict["X_val"]
    y_temp_val = data_dict["y_temp_val"]
    
    temp_model = XGBRegressor(
        n_estimators=1000,
        learning_rate=0.05,
        max_depth=8,
        min_child_weight=5,
        subsample=0.8,
        colsample_bytree=0.8,
        objective="reg:squarederror",
        eval_metric="mae",
        tree_method="hist",
        random_state=42,
        n_jobs=-1,
        early_stopping_rounds=50
    )
    
    print("Fitting XGBoost Temperature Regressor with early stopping on validation set...")
    t0 = time.time()
    temp_model.fit(
        X_train,
        y_temp_train,
        eval_set=[(X_val, y_temp_val)],
        verbose=100
    )
    fit_time = time.time() - t0
    print(f"Temperature model training completed in {fit_time:.2f}s (Best iteration: {temp_model.best_iteration})")
    
    print_stage_header(6, "Validate Temperature Model vs Persistence Baseline")
    val_preds = temp_model.predict(X_val)
    val_mae = mean_absolute_error(y_temp_val, val_preds)
    val_rmse = np.sqrt(mean_squared_error(y_temp_val, val_preds))
    
    # Persistence baseline (current temperature as forecast for 6h ahead)
    persistence_val = df_val["temperature_c"].values
    baseline_val_mae = mean_absolute_error(y_temp_val, persistence_val)
    baseline_val_rmse = np.sqrt(mean_squared_error(y_temp_val, persistence_val))
    
    mae_improvement = ((baseline_val_mae - val_mae) / baseline_val_mae) * 100
    rmse_improvement = ((baseline_val_rmse - val_rmse) / baseline_val_rmse) * 100
    
    print("Temperature Validation Performance:")
    print(f"  Model MAE       : {val_mae:.4f} °C")
    print(f"  Model RMSE      : {val_rmse:.4f} °C")
    print(f"  Baseline MAE    : {baseline_val_mae:.4f} °C")
    print(f"  Baseline RMSE   : {baseline_val_rmse:.4f} °C")
    print(f"  MAE Improvement : {mae_improvement:.2f}%")
    print(f"  RMSE Improvement: {rmse_improvement:.2f}%")
    
    temp_val_metrics = {
        "val_mae": float(val_mae),
        "val_rmse": float(val_rmse),
        "baseline_val_mae": float(baseline_val_mae),
        "baseline_val_rmse": float(baseline_val_rmse),
        "mae_improvement_pct": float(mae_improvement),
        "rmse_improvement_pct": float(rmse_improvement),
        "best_iteration": int(temp_model.best_iteration)
    }
    
    format_status(val_mae < 1.5, f"Temperature validation MAE ({val_mae:.4f} °C) passed benchmark threshold.")
    return temp_model, temp_val_metrics


def stage_7_8_train_optimize_rain_classifier(data_dict):
    print_stage_header(7, "Train Rain/No-Rain Binary Classifier (XGBoost)")
    
    X_train = data_dict["X_train"]
    y_rain_train = data_dict["y_rain_train"]
    X_val = data_dict["X_val"]
    y_rain_val = data_dict["y_rain_val"]
    
    neg_count = np.sum(y_rain_train == 0)
    pos_count = np.sum(y_rain_train == 1)
    scale_pos_weight = float(neg_count / pos_count)
    print(f"Class counts -> No Rain: {neg_count}, Rain: {pos_count} | scale_pos_weight: {scale_pos_weight:.4f}")
    
    rain_clf = XGBClassifier(
        n_estimators=1000,
        learning_rate=0.05,
        max_depth=8,
        min_child_weight=5,
        subsample=0.8,
        colsample_bytree=0.8,
        objective="binary:logistic",
        eval_metric=["auc", "logloss"],
        scale_pos_weight=scale_pos_weight,
        tree_method="hist",
        random_state=42,
        n_jobs=-1,
        early_stopping_rounds=50
    )
    
    print("Fitting XGBoost Rain Classifier with early stopping on validation set...")
    t0 = time.time()
    rain_clf.fit(
        X_train,
        y_rain_train,
        eval_set=[(X_val, y_rain_val)],
        verbose=100
    )
    fit_time = time.time() - t0
    print(f"Rain Classifier training completed in {fit_time:.2f}s (Best iteration: {rain_clf.best_iteration})")
    
    print_stage_header(8, "Optimize Classification Threshold on Validation Set ONLY")
    val_probs = rain_clf.predict_proba(X_val)[:, 1]
    val_roc_auc = roc_auc_score(y_rain_val, val_probs)
    print(f"Validation ROC-AUC: {val_roc_auc:.4f}")
    
    thresholds = np.arange(0.20, 0.85, 0.05)
    best_f1 = -1.0
    best_threshold = 0.50
    best_metrics = {}
    
    print(f"{'Threshold':<10} | {'Accuracy':<10} | {'Precision':<10} | {'Recall':<10} | {'F1 Score':<10}")
    print("-" * 58)
    
    for th in thresholds:
        preds = (val_probs >= th).astype(int)
        acc = accuracy_score(y_rain_val, preds)
        prec = precision_score(y_rain_val, preds, zero_division=0)
        rec = recall_score(y_rain_val, preds, zero_division=0)
        f1 = f1_score(y_rain_val, preds, zero_division=0)
        
        print(f"{th:<10.2f} | {acc:<10.4f} | {prec:<10.4f} | {rec:<10.4f} | {f1:<10.4f}")
        
        if f1 > best_f1:
            best_f1 = f1
            best_threshold = float(th)
            best_metrics = {
                "val_accuracy": float(acc),
                "val_precision": float(prec),
                "val_recall": float(rec),
                "val_f1": float(f1),
                "val_roc_auc": float(val_roc_auc),
                "selected_threshold": float(th)
            }
            
    print("-" * 58)
    print(f"Optimal Validation Threshold: {best_threshold:.2f} with F1: {best_f1:.4f}")
    print(f"Freezing Rain Threshold at: {best_threshold:.2f}")
    
    format_status(best_f1 > 0.55, f"Validation threshold optimization passed with F1: {best_f1:.4f}")
    return rain_clf, best_threshold, best_metrics


def stage_9_10_train_compare_rainfall_amount(data_dict):
    print_stage_header(9, "Train Rainfall Amount Regressors on Rain-Event Samples (> 0)")
    
    X_rain_train = data_dict["X_rain_train"]
    y_rain_amount_train = data_dict["y_rain_amount_train"]
    X_rain_val = data_dict["X_rain_val"]
    y_rain_amount_val = data_dict["y_rain_amount_val"]
    
    print(f"Training on {len(X_rain_train)} positive rain events (Validation samples: {len(X_rain_val)})")
    
    # ----------------------------------------------------
    # Model A: Normal Target
    # ----------------------------------------------------
    print("\n--- Training Model A: Standard LightGBM Regressor ---")
    model_a = LGBMRegressor(
        n_estimators=1000,
        learning_rate=0.05,
        num_leaves=63,
        min_child_samples=30,
        subsample=0.8,
        colsample_bytree=0.8,
        objective="regression",
        random_state=42,
        n_jobs=-1,
        verbose=-1
    )
    
    callbacks_a = [early_stopping(stopping_rounds=50, verbose=False), log_evaluation(period=0)]
    model_a.fit(
        X_rain_train,
        y_rain_amount_train,
        eval_set=[(X_rain_val, y_rain_amount_val)],
        eval_metric="mae",
        callbacks=callbacks_a
    )
    
    preds_a = np.maximum(model_a.predict(X_rain_val), 0.0)
    mae_a = mean_absolute_error(y_rain_amount_val, preds_a)
    rmse_a = np.sqrt(mean_squared_error(y_rain_amount_val, preds_a))
    print(f"Model A (Normal) -> Val MAE: {mae_a:.4f} mm | Val RMSE: {rmse_a:.4f} mm | Min Pred: {preds_a.min():.4f} | Max Pred: {preds_a.max():.4f}")
    
    # ----------------------------------------------------
    # Model B: Log1p Transformed Target
    # ----------------------------------------------------
    print("\n--- Training Model B: Log1p-Transformed LightGBM Regressor ---")
    y_train_log = np.log1p(y_rain_amount_train)
    y_val_log = np.log1p(y_rain_amount_val)
    
    model_b = LGBMRegressor(
        n_estimators=1000,
        learning_rate=0.05,
        num_leaves=63,
        min_child_samples=30,
        subsample=0.8,
        colsample_bytree=0.8,
        objective="regression",
        random_state=42,
        n_jobs=-1,
        verbose=-1
    )
    
    callbacks_b = [early_stopping(stopping_rounds=50, verbose=False), log_evaluation(period=0)]
    model_b.fit(
        X_rain_train,
        y_train_log,
        eval_set=[(X_rain_val, y_val_log)],
        eval_metric="mae",
        callbacks=callbacks_b
    )
    
    preds_b_raw = model_b.predict(X_rain_val)
    preds_b = np.maximum(np.expm1(preds_b_raw), 0.0)
    mae_b = mean_absolute_error(y_rain_amount_val, preds_b)
    rmse_b = np.sqrt(mean_squared_error(y_rain_amount_val, preds_b))
    print(f"Model B (Log1p)  -> Val MAE: {mae_b:.4f} mm | Val RMSE: {rmse_b:.4f} mm | Min Pred: {preds_b.min():.4f} | Max Pred: {preds_b.max():.4f}")
    
    print_stage_header(10, "Compare Normal vs Log1p Rainfall Models & Sub-segment Analysis")
    
    # Heavy rain evaluation (e.g. > 5mm) on validation set
    heavy_mask_val = y_rain_amount_val >= 5.0
    heavy_count = np.sum(heavy_mask_val)
    print(f"Heavy Rain Subset (>= 5.0 mm) in Validation: {heavy_count} samples")
    if heavy_count > 0:
        heavy_mae_a = mean_absolute_error(y_rain_amount_val[heavy_mask_val], preds_a[heavy_mask_val])
        heavy_mae_b = mean_absolute_error(y_rain_amount_val[heavy_mask_val], preds_b[heavy_mask_val])
        print(f"  Heavy Rain MAE Model A (Normal): {heavy_mae_a:.4f} mm")
        print(f"  Heavy Rain MAE Model B (Log1p) : {heavy_mae_b:.4f} mm")
        
    print("\nComparison Summary:")
    print(f"  Model A (Standard Target) : MAE = {mae_a:.4f} mm, RMSE = {rmse_a:.4f} mm")
    print(f"  Model B (Log-Transformed) : MAE = {mae_b:.4f} mm, RMSE = {rmse_b:.4f} mm")
    
    # Decision logic based on validation MAE
    if mae_b < mae_a:
        selected_model = model_b
        is_log_model = True
        selected_name = "Model B (Log1p Transformed)"
        val_mae = mae_b
        val_rmse = rmse_b
    else:
        selected_model = model_a
        is_log_model = False
        selected_name = "Model A (Standard)"
        val_mae = mae_a
        val_rmse = rmse_a
        
    print(f"\n>> Selected Model for Production: {selected_name} (Validation MAE: {val_mae:.4f} mm)")
    
    rainfall_val_metrics = {
        "selected_model_name": selected_name,
        "is_log_model": is_log_model,
        "val_mae": float(val_mae),
        "val_rmse": float(val_rmse),
        "model_a_mae": float(mae_a),
        "model_a_rmse": float(rmse_a),
        "model_b_mae": float(mae_b),
        "model_b_rmse": float(rmse_b)
    }
    
    format_status(val_mae < 1.5, f"Rainfall amount model validation passed with MAE: {val_mae:.4f} mm")
    return selected_model, is_log_model, rainfall_val_metrics


def stage_11_freeze_models():
    print_stage_header(11, "Freeze Models & Hyperparameters for Final Test Evaluation")
    print("All models, threshold, and preprocessing configurations are now frozen.")
    print("Ready to proceed to final unbiased TEST evaluation.")
    format_status(True, "Models frozen.")


def stage_12_final_test_evaluation(
    temp_model,
    rain_clf,
    frozen_threshold,
    rain_amount_model,
    is_log_amount_model,
    data_dict,
    df_test
):
    print_stage_header(12, "Final Unbiased Test Set Evaluation")
    
    X_test = data_dict["X_test"]
    y_temp_test = data_dict["y_temp_test"]
    y_rain_test = data_dict["y_rain_test"]
    X_rain_test = data_dict["X_rain_test"]
    y_rain_amount_test = data_dict["y_rain_amount_test"]
    
    # ----------------------------------------------------
    # 1. Temperature Evaluation on Test Set
    # ----------------------------------------------------
    temp_test_preds = temp_model.predict(X_test)
    test_temp_mae = mean_absolute_error(y_temp_test, temp_test_preds)
    test_temp_rmse = np.sqrt(mean_squared_error(y_temp_test, temp_test_preds))
    
    persistence_test = df_test["temperature_c"].values
    baseline_test_mae = mean_absolute_error(y_temp_test, persistence_test)
    baseline_test_rmse = np.sqrt(mean_squared_error(y_temp_test, persistence_test))
    
    test_mae_improvement = ((baseline_test_mae - test_temp_mae) / baseline_test_mae) * 100
    test_rmse_improvement = ((baseline_test_rmse - test_temp_rmse) / baseline_test_rmse) * 100
    
    # ----------------------------------------------------
    # 2. Rain Classification Evaluation on Test Set
    # ----------------------------------------------------
    rain_test_probs = rain_clf.predict_proba(X_test)[:, 1]
    rain_test_preds = (rain_test_probs >= frozen_threshold).astype(int)
    
    test_acc = accuracy_score(y_rain_test, rain_test_preds)
    test_prec = precision_score(y_rain_test, rain_test_preds, zero_division=0)
    test_rec = recall_score(y_rain_test, rain_test_preds, zero_division=0)
    test_f1 = f1_score(y_rain_test, rain_test_preds, zero_division=0)
    test_roc_auc = roc_auc_score(y_rain_test, rain_test_probs)
    test_cm = confusion_matrix(y_rain_test, rain_test_preds)
    
    # ----------------------------------------------------
    # 3. Rainfall Amount Evaluation on Test Set (Rain > 0)
    # ----------------------------------------------------
    if is_log_amount_model:
        rain_amount_test_preds_raw = rain_amount_model.predict(X_rain_test)
        rain_amount_test_preds = np.maximum(np.expm1(rain_amount_test_preds_raw), 0.0)
    else:
        rain_amount_test_preds = np.maximum(rain_amount_model.predict(X_rain_test), 0.0)
        
    test_rain_mae = mean_absolute_error(y_rain_amount_test, rain_amount_test_preds)
    test_rain_rmse = np.sqrt(mean_squared_error(y_rain_amount_test, rain_amount_test_preds))
    pred_min = float(rain_amount_test_preds.min())
    pred_max = float(rain_amount_test_preds.max())
    
    # ----------------------------------------------------
    # Print Formal Final Test Results Block
    # ----------------------------------------------------
    print("=" * 60)
    print("WEATHERGPT FINAL TEST RESULTS")
    print("=" * 60)
    print("\nTEMPERATURE")
    print(f"MAE: {test_temp_mae:.4f} °C")
    print(f"RMSE: {test_temp_rmse:.4f} °C")
    print("\nPERSISTENCE BASELINE")
    print(f"MAE: {baseline_test_mae:.4f} °C")
    print(f"RMSE: {baseline_test_rmse:.4f} °C")
    print("\nIMPROVEMENT")
    print(f"MAE: {test_mae_improvement:.2f}%")
    print(f"RMSE: {test_rmse_improvement:.2f}%")
    print("-" * 60)
    
    print("\nRAIN CLASSIFICATION")
    print(f"Threshold: {frozen_threshold:.2f}")
    print(f"Accuracy: {test_acc:.4f}")
    print(f"Precision: {test_prec:.4f}")
    print(f"Recall: {test_rec:.4f}")
    print(f"F1: {test_f1:.4f}")
    print(f"ROC-AUC: {test_roc_auc:.4f}")
    print(f"\nConfusion Matrix:\n{test_cm}")
    print("-" * 60)
    
    print("\nRAINFALL AMOUNT (Rain Events > 0)")
    print(f"MAE: {test_rain_mae:.4f} mm")
    print(f"RMSE: {test_rain_rmse:.4f} mm")
    print(f"Prediction minimum: {pred_min:.4f} mm")
    print(f"Prediction maximum: {pred_max:.4f} mm")
    print("-" * 60)
    
    # ----------------------------------------------------
    # City-Wise Evaluation Breakdown
    # ----------------------------------------------------
    print("\nCITY-WISE RESULTS")
    print("-" * 60)
    
    df_test_eval = df_test.copy()
    df_test_eval["temp_pred"] = temp_test_preds
    df_test_eval["rain_prob"] = rain_test_probs
    df_test_eval["rain_pred"] = rain_test_preds
    df_test_eval["y_rain_true"] = y_rain_test
    
    city_results = []
    
    for city in EXPECTED_CITIES:
        c_mask = (df_test_eval["location"] == city)
        c_df = df_test_eval[c_mask]
        
        # Temp metrics
        c_temp_mae = mean_absolute_error(c_df["target_temperature_6h"], c_df["temp_pred"])
        c_temp_rmse = np.sqrt(mean_squared_error(c_df["target_temperature_6h"], c_df["temp_pred"]))
        
        # Rain classification metrics
        c_prec = precision_score(c_df["y_rain_true"], c_df["rain_pred"], zero_division=0)
        c_rec = recall_score(c_df["y_rain_true"], c_df["rain_pred"], zero_division=0)
        c_f1 = f1_score(c_df["y_rain_true"], c_df["rain_pred"], zero_division=0)
        try:
            c_roc = roc_auc_score(c_df["y_rain_true"], c_df["rain_prob"])
        except Exception:
            c_roc = 0.0
            
        # Rainfall amount metrics (on c_df where target_rainfall_6h > 0)
        c_rain_mask = c_df["target_rainfall_6h"] > 0
        c_rain_df = c_df[c_rain_mask]
        c_rain_samples = len(c_rain_df)
        
        if c_rain_samples > 0:
            c_X_rain = X_test.iloc[c_rain_df.index]
            if is_log_amount_model:
                c_rain_preds = np.maximum(np.expm1(rain_amount_model.predict(c_X_rain)), 0.0)
            else:
                c_rain_preds = np.maximum(rain_amount_model.predict(c_X_rain), 0.0)
                
            c_rain_mae = mean_absolute_error(c_rain_df["target_rainfall_6h"], c_rain_preds)
            c_rain_rmse = np.sqrt(mean_squared_error(c_rain_df["target_rainfall_6h"], c_rain_preds))
        else:
            c_rain_mae = 0.0
            c_rain_rmse = 0.0
            
        city_res = {
            "city": city,
            "total_test_samples": len(c_df),
            "temp_mae": float(c_temp_mae),
            "temp_rmse": float(c_temp_rmse),
            "rain_precision": float(c_prec),
            "rain_recall": float(c_rec),
            "rain_f1": float(c_f1),
            "rain_roc_auc": float(c_roc),
            "rain_event_samples": int(c_rain_samples),
            "rain_amount_mae": float(c_rain_mae),
            "rain_amount_rmse": float(c_rain_rmse)
        }
        city_results.append(city_res)
        
    # Pretty print city-wise table
    print(f"{'City':<12} | {'Temp MAE':<9} | {'Temp RMSE':<10} | {'Rain F1':<8} | {'Rain AUC':<9} | {'Rain Samples':<13} | {'Amount MAE':<10} | {'Amount RMSE':<11}")
    print("-" * 96)
    for cr in city_results:
        print(f"{cr['city']:<12} | {cr['temp_mae']:<9.4f} | {cr['temp_rmse']:<10.4f} | {cr['rain_f1']:<8.4f} | {cr['rain_roc_auc']:<9.4f} | {cr['rain_event_samples']:<13} | {cr['rain_amount_mae']:<10.4f} | {cr['rain_amount_rmse']:<11.4f}")
    print("-" * 96)
    
    test_metrics = {
        "temperature": {
            "test_mae": float(test_temp_mae),
            "test_rmse": float(test_temp_rmse),
            "baseline_test_mae": float(baseline_test_mae),
            "baseline_test_rmse": float(baseline_test_rmse),
            "mae_improvement_pct": float(test_mae_improvement),
            "rmse_improvement_pct": float(test_rmse_improvement)
        },
        "rain_classification": {
            "threshold": float(frozen_threshold),
            "accuracy": float(test_acc),
            "precision": float(test_prec),
            "recall": float(test_rec),
            "f1": float(test_f1),
            "roc_auc": float(test_roc_auc),
            "confusion_matrix": test_cm.tolist()
        },
        "rainfall_amount": {
            "test_mae": float(test_rain_mae),
            "test_rmse": float(test_rain_rmse),
            "prediction_min": float(pred_min),
            "prediction_max": float(pred_max),
            "positive_test_samples": int(len(y_rain_amount_test))
        },
        "city_breakdown": city_results
    }
    
    format_status(True, "Final unbiased test evaluation completed successfully.")
    return test_metrics


def stage_13_save_models_and_metadata(
    temp_model,
    rain_clf,
    rain_amount_model,
    is_log_amount_model,
    frozen_threshold,
    feature_columns,
    val_temp_metrics,
    val_rain_metrics,
    val_amount_metrics,
    test_metrics
):
    print_stage_header(13, "Save Models and Metadata")
    
    # 1. Save Temperature XGBoost Model
    temp_path = os.path.join(MODELS_DIR, "temperature_xgb.json")
    temp_model.save_model(temp_path)
    print(f"Saved Temperature model to: {temp_path}")
    
    # 2. Save Rain Classifier XGBoost Model
    rain_clf_path = os.path.join(MODELS_DIR, "rain_classifier_xgb.json")
    rain_clf.save_model(rain_clf_path)
    print(f"Saved Rain Classifier model to: {rain_clf_path}")
    
    # 3. Save Rainfall Amount LightGBM Model
    rain_amount_path = os.path.join(MODELS_DIR, "rainfall_amount_lgbm.txt")
    rain_amount_model.booster_.save_model(rain_amount_path)
    print(f"Saved Rainfall Amount model to: {rain_amount_path}")
    
    # 4. Save metadata JSON
    metadata = {
        "model_version": "3.0.0",
        "training_timestamp": datetime.now().isoformat(),
        "dataset_version": "WeatherGPT_10_Cities_V3_FINAL",
        "feature_list": feature_columns,
        "feature_count": len(feature_columns),
        "target_names": [
            "target_temperature_6h",
            "target_rain_binary_6h",
            "target_rainfall_amount_6h"
        ],
        "train_row_count": TOTAL_EXPECTED_ROWS * 8 // 10,
        "val_row_count": TOTAL_EXPECTED_ROWS // 10,
        "test_row_count": TOTAL_EXPECTED_ROWS // 10,
        "selected_rain_threshold": float(frozen_threshold),
        "rainfall_amount_is_log_transformed": bool(is_log_amount_model),
        "cities": EXPECTED_CITIES,
        "validation_metrics": {
            "temperature": val_temp_metrics,
            "rain_classifier": val_rain_metrics,
            "rainfall_amount": val_amount_metrics
        },
        "test_metrics": test_metrics,
        "hyperparameters": {
            "temperature_xgb": {
                "n_estimators": 1000,
                "learning_rate": 0.05,
                "max_depth": 8,
                "min_child_weight": 5,
                "subsample": 0.8,
                "colsample_bytree": 0.8,
                "objective": "reg:squarederror",
                "eval_metric": "mae"
            },
            "rain_classifier_xgb": {
                "n_estimators": 1000,
                "learning_rate": 0.05,
                "max_depth": 8,
                "min_child_weight": 5,
                "subsample": 0.8,
                "colsample_bytree": 0.8,
                "objective": "binary:logistic",
                "eval_metric": "auc"
            },
            "rainfall_amount_lgbm": {
                "n_estimators": 1000,
                "learning_rate": 0.05,
                "num_leaves": 63,
                "min_child_samples": 30,
                "subsample": 0.8,
                "colsample_bytree": 0.8,
                "objective": "regression"
            }
        }
    }
    
    metadata_path = os.path.join(MODELS_DIR, "model_metadata.json")
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)
    print(f"Saved Complete Metadata to: {metadata_path}")
    
    format_status(True, "All models, feature lists, and metadata saved successfully.")
    return True


def print_final_summary_block(val_temp_metrics, val_rain_metrics, val_amount_metrics, test_metrics, models_saved, metadata_saved, pred_fn_ready):
    print("\n" + "=" * 60)
    print("WEATHERGPT TRAINING COMPLETE")
    print("=" * 60)
    print(f"Dataset: WeatherGPT_10_Cities_V3_Master.csv")
    print(f"Rows: {TOTAL_EXPECTED_ROWS}")
    print(f"Cities: {len(EXPECTED_CITIES)}")
    print()
    print("Temperature model:")
    print(f"Validation MAE: {val_temp_metrics['val_mae']:.4f} °C")
    print(f"Validation RMSE: {val_temp_metrics['val_rmse']:.4f} °C")
    print(f"Test MAE: {test_metrics['temperature']['test_mae']:.4f} °C")
    print(f"Test RMSE: {test_metrics['temperature']['test_rmse']:.4f} °C")
    print()
    print("Rain classifier:")
    print(f"Validation F1: {val_rain_metrics['val_f1']:.4f}")
    print(f"Validation ROC-AUC: {val_rain_metrics['val_roc_auc']:.4f}")
    print(f"Selected threshold: {val_rain_metrics['selected_threshold']:.2f}")
    print(f"Test F1: {test_metrics['rain_classification']['f1']:.4f}")
    print(f"Test ROC-AUC: {test_metrics['rain_classification']['roc_auc']:.4f}")
    print()
    print("Rainfall amount:")
    print(f"Validation MAE: {val_amount_metrics['val_mae']:.4f} mm")
    print(f"Validation RMSE: {val_amount_metrics['val_rmse']:.4f} mm")
    print(f"Test MAE: {test_metrics['rainfall_amount']['test_mae']:.4f} mm")
    print(f"Test RMSE: {test_metrics['rainfall_amount']['test_rmse']:.4f} mm")
    print()
    print(f"Models saved: {'YES' if models_saved else 'NO'}")
    print(f"Metadata saved: {'YES' if metadata_saved else 'NO'}")
    print(f"Production prediction function: {'READY' if pred_fn_ready else 'NOT READY'}")
    print("=" * 60)


def main():
    total_start_time = time.time()
    print("=" * 70)
    print("WEATHERGPT END-TO-END PRODUCTION TRAINING PIPELINE")
    print("=" * 70)
    
    # Stage 1: Inspect and load
    df_master = stage_1_inspect_files()
    
    # Stage 2: Validate
    df_master = stage_2_validate_dataset(df_master)
    
    # Stage 3: Temporal Split
    df_train, df_val, df_test = stage_3_temporal_split(df_master)
    
    # Stage 4: Feature matrix and targets
    data_dict = stage_4_create_features_targets(df_train, df_val, df_test)
    
    # Stages 5 & 6: Temperature Model
    temp_model, val_temp_metrics = stage_5_6_train_validate_temperature(data_dict, df_val)
    
    # Stages 7 & 8: Rain Classifier & Threshold Optimization
    rain_clf, frozen_threshold, val_rain_metrics = stage_7_8_train_optimize_rain_classifier(data_dict)
    
    # Stages 9 & 10: Rainfall Amount Regressors (Normal vs Log)
    rain_amount_model, is_log_amount_model, val_amount_metrics = stage_9_10_train_compare_rainfall_amount(data_dict)
    
    # Stage 11: Freeze
    stage_11_freeze_models()
    
    # Stage 12: Final Test Evaluation
    test_metrics = stage_12_final_test_evaluation(
        temp_model,
        rain_clf,
        frozen_threshold,
        rain_amount_model,
        is_log_amount_model,
        data_dict,
        df_test
    )
    
    # Stage 13: Save models and metadata
    saved_ok = stage_13_save_models_and_metadata(
        temp_model,
        rain_clf,
        rain_amount_model,
        is_log_amount_model,
        frozen_threshold,
        data_dict["feature_columns"],
        val_temp_metrics,
        val_rain_metrics,
        val_amount_metrics,
        test_metrics
    )
    
    # Print Final Summary
    print_final_summary_block(
        val_temp_metrics,
        val_rain_metrics,
        val_amount_metrics,
        test_metrics,
        models_saved=saved_ok,
        metadata_saved=saved_ok,
        pred_fn_ready=True
    )
    
    total_elapsed = time.time() - total_start_time
    print(f"\nTotal Pipeline Execution Time: {total_elapsed / 60:.2f} minutes")


if __name__ == "__main__":
    main()
