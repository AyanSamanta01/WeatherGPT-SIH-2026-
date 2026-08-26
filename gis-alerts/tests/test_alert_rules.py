"""
Unit Tests for Alert Rules & IMD SOP Severity Engine
===================================================
"""

import pytest
from src.alert_rules_engine import AlertRulesEngine, IMDColorCode


def test_rainfall_severity_bands():
    engine = AlertRulesEngine()

    # 1. No Rain / Light
    res_light = engine.evaluate_rainfall(5.0)
    assert res_light["severity"] == "INFO"
    assert res_light["color_code"]["level"] == "Green"

    # 2. Heavy Rain (Yellow)
    res_heavy = engine.evaluate_rainfall(75.0)
    assert res_heavy["severity"] == "WATCH"
    assert res_heavy["color_code"]["level"] == "Yellow"

    # 3. Very Heavy Rain (Orange)
    res_vheavy = engine.evaluate_rainfall(140.0)
    assert res_vheavy["severity"] == "WARNING"
    assert res_vheavy["color_code"]["level"] == "Orange"

    # 4. Extremely Heavy Rain (Red Emergency)
    res_ext = engine.evaluate_rainfall(220.0)
    assert res_ext["severity"] == "EMERGENCY"
    assert res_ext["color_code"]["level"] == "Red"
    assert len(res_ext["advisories"]) > 0


def test_wind_and_cyclone_bands():
    engine = AlertRulesEngine()

    # 1. Squally wind (Yellow)
    w_squall = engine.evaluate_wind(50.0)
    assert w_squall["severity"] == "WATCH"
    assert w_squall["color_code"]["level"] == "Yellow"

    # 2. Gale wind (Orange)
    w_gale = engine.evaluate_wind(70.0)
    assert w_gale["severity"] == "WARNING"
    assert w_gale["color_code"]["level"] == "Orange"

    # 3. Severe Cyclonic storm wind (Red)
    w_cyclone = engine.evaluate_wind(95.0)
    assert w_cyclone["severity"] == "EMERGENCY"
    assert w_cyclone["color_code"]["level"] == "Red"


def test_thermal_extremes():
    engine = AlertRulesEngine()

    # 1. Heatwave (Orange)
    hw = engine.evaluate_thermal_extremes(42.0)
    assert hw["severity"] == "WARNING"
    assert hw["color_code"]["level"] == "Orange"

    # 2. Severe Heatwave (Red)
    shw = engine.evaluate_thermal_extremes(46.5)
    assert shw["severity"] == "EMERGENCY"
    assert shw["color_code"]["level"] == "Red"

    # 3. Severe Coldwave (Orange)
    cw = engine.evaluate_thermal_extremes(3.0)
    assert cw["severity"] == "WARNING"
    assert cw["color_code"]["level"] == "Orange"


def test_composite_hazard_evaluation():
    engine = AlertRulesEngine()

    # Extreme scenario: Heavy Rain (150mm) + Cyclone Wind (92 km/h) + Lightning
    comp = engine.evaluate_composite_hazard(
        temperature_c=27.0,
        rainfall_mm=150.0,
        wind_speed_kmh=92.0,
        lightning_detected=True
    )
    assert comp["overall_severity"] == "EMERGENCY"
    assert comp["color_code"]["level"] == "Red"
    assert comp["composite_hazard_score"] >= 80
    assert any("30-30 Rule" in adv for adv in comp["advisories"])
