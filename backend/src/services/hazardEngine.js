/**
 * Meteorological Hazard Detection Engine
 * Evaluates live weather observations or NWP forecast models against official
 * IMD (India Meteorological Department) and WMO extreme weather thresholds.
 */

class HazardEngine {
  /**
   * Evaluate meteorological variables and return classified risk & advisories
   * @param {object} params
   * @param {number} params.temperature - Temperature in °C
   * @param {number} params.rainfall - Rainfall / Precipitation in mm
   * @param {number} params.windSpeed - Wind speed in km/h
   * @param {number} params.humidity - Relative humidity in %
   */
  evaluate({ temperature = 25, rainfall = 0, windSpeed = 0, humidity = 60 }) {
    const hazards = [];
    let highestSeverity = 'normal'; // 'normal' | 'advisory' | 'warning' | 'severe' | 'extreme'
    const advisories = [];
    const colorCode = { level: 'Green', message: 'No severe weather warning active' };

    // 1. Precipitation & Flooding Evaluation (IMD Classification)
    if (rainfall >= 204.4) {
      hazards.push({
        type: 'extreme_rainfall',
        severity: 'extreme',
        description: `Extremely heavy rainfall detected (${rainfall.toFixed(1)} mm). Severe flash flood risk.`
      });
      advisories.push('Immediate evacuation from low-lying areas. Avoid all travel.');
    } else if (rainfall >= 115.6) {
      hazards.push({
        type: 'very_heavy_rainfall',
        severity: 'severe',
        description: `Very heavy rainfall (${rainfall.toFixed(1)} mm). High likelihood of waterlogging & localized flooding.`
      });
      advisories.push('Avoid waterlogged roads and underpasses. Secure livestock and pumps.');
    } else if (rainfall >= 64.5) {
      hazards.push({
        type: 'heavy_rainfall',
        severity: 'warning',
        description: `Heavy rainfall (${rainfall.toFixed(1)} mm) observed/forecast.`
      });
      advisories.push('Ensure drainage channels are clear. Postpone agricultural spraying/harvesting.');
    } else if (rainfall >= 15.6) {
      hazards.push({
        type: 'moderate_rainfall',
        severity: 'advisory',
        description: `Moderate rainfall (${rainfall.toFixed(1)} mm).`
      });
    }

    // 2. Wind Speed & Cyclone / Squall Evaluation (IMD Gale Scale)
    if (windSpeed >= 89) {
      hazards.push({
        type: 'severe_cyclonic_storm',
        severity: 'extreme',
        description: `Violent storm force winds detected (${windSpeed.toFixed(1)} km/h). Structural danger.`
      });
      advisories.push('Remain indoors in sturdy shelters. Total suspension of marine operations.');
    } else if (windSpeed >= 62) {
      hazards.push({
        type: 'gale_force_wind',
        severity: 'severe',
        description: `Gale force winds (${windSpeed.toFixed(1)} km/h). Danger to kutcha houses and power lines.`
      });
      advisories.push('Secure loose roofing sheets, signboards, and outdoor equipment.');
    } else if (windSpeed >= 45) {
      hazards.push({
        type: 'squall_wind',
        severity: 'warning',
        description: `Squally weather conditions with gusts reaching ${windSpeed.toFixed(1)} km/h.`
      });
      advisories.push('Fishermen advised not to venture into deep sea waters.');
    }

    // 3. Heatwave & Thermal Stress Evaluation (IMD Heatwave Criteria)
    if (temperature >= 45) {
      hazards.push({
        type: 'severe_heatwave',
        severity: 'extreme',
        description: `Extreme temperature recorded (${temperature.toFixed(1)}°C). Severe heat illness risk.`
      });
      advisories.push('Avoid sun exposure between 11:00 AM - 4:00 PM. High risk of heat stroke.');
    } else if (temperature >= 40) {
      hazards.push({
        type: 'heatwave',
        severity: 'warning',
        description: `Heatwave condition (${temperature.toFixed(1)}°C).`
      });
      advisories.push('Drink plenty of fluids. Provide adequate shade and water for cattle.');
    } else if (temperature <= 4) {
      hazards.push({
        type: 'coldwave',
        severity: 'warning',
        description: `Coldwave condition detected with temperatures dropping to ${temperature.toFixed(1)}°C.`
      });
      advisories.push('Protect standing crops from frost injury with light irrigation.');
    }

    // Determine highest severity
    const severityHierarchy = ['normal', 'advisory', 'warning', 'severe', 'extreme'];
    for (const h of hazards) {
      if (severityHierarchy.indexOf(h.severity) > severityHierarchy.indexOf(highestSeverity)) {
        highestSeverity = h.severity;
      }
    }

    // Assign IMD 4-Color Code
    if (highestSeverity === 'extreme' || highestSeverity === 'severe') {
      colorCode.level = 'Red';
      colorCode.message = 'WARNING (Take Action) - Severe/Extreme Hazardous Weather Active';
    } else if (highestSeverity === 'warning') {
      colorCode.level = 'Orange';
      colorCode.message = 'ALERT (Be Prepared) - High Impact Weather Likely';
    } else if (highestSeverity === 'advisory') {
      colorCode.level = 'Yellow';
      colorCode.message = 'WATCH (Be Updated) - Deteriorating Weather Conditions';
    } else {
      colorCode.level = 'Green';
      colorCode.message = 'NO WARNING (Normal Weather)';
    }

    return {
      severity: highestSeverity,
      colorCode,
      hazards,
      advisories: advisories.length > 0 ? advisories : ['Normal weather conditions. No special advisory required.'],
      metrics: {
        temperature,
        rainfall,
        windSpeed,
        humidity
      }
    };
  }
}

module.exports = new HazardEngine();
