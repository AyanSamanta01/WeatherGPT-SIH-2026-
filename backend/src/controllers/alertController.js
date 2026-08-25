const alertService = require('../services/alertService');
const sseService = require('../services/sseService');
const { successResponse } = require('../utils/response');

const getAlerts = async (req, res, next) => {
  try {
    const { severity, alertType } = req.query;
    const alerts = await alertService.getActiveAlerts({ severity, alertType });
    return successResponse(res, alerts, 'Active weather alerts retrieved');
  } catch (err) {
    next(err);
  }
};

const getGisLayers = async (req, res, next) => {
  try {
    const geoJson = await alertService.getGisLayers();
    return successResponse(res, geoJson, 'GIS GeoJSON hazard layers retrieved');
  } catch (err) {
    next(err);
  }
};

const streamAlerts = (req, res) => {
  // Connect client to Server-Sent Events stream
  sseService.addClient(req, res);
};

const getNearbyAlerts = async (req, res, next) => {
  try {
    const { lat, lon, radiusKm } = req.query;
    const alerts = await alertService.getNearbyAlerts({ lat, lon, radiusKm });
    return successResponse(res, alerts, 'Nearby alerts retrieved');
  } catch (err) {
    next(err);
  }
};

const checkLocationHazard = async (req, res, next) => {
  try {
    const { lat, lon } = req.query;
    const evaluation = await alertService.evaluateLocationHazard({ lat, lon });
    return successResponse(res, evaluation, 'Location meteorological hazard evaluation complete');
  } catch (err) {
    next(err);
  }
};

const createAlert = async (req, res, next) => {
  try {
    const alert = await alertService.createAlert(req.body);
    // Broadcast live alert to all connected frontend streams
    sseService.broadcastAlert(alert);
    return successResponse(res, alert, 'Alert created successfully', 201);
  } catch (err) {
    next(err);
  }
};

const ingestCapAlert = async (req, res, next) => {
  try {
    const alert = await alertService.ingestCapAlert(req.body);
    // Broadcast live alert to all connected frontend streams
    sseService.broadcastAlert(alert);
    return successResponse(res, alert, 'CAP 1.2 Alert ingested successfully', 201);
  } catch (err) {
    next(err);
  }
};

const getPreferences = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const prefs = await alertService.getPreferences(userId);
    return successResponse(res, prefs, 'Alert preferences retrieved');
  } catch (err) {
    next(err);
  }
};

const updatePreferences = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const updated = await alertService.updatePreferences(userId, req.body);
    return successResponse(res, updated, 'Alert preferences updated successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAlerts,
  getGisLayers,
  streamAlerts,
  getNearbyAlerts,
  checkLocationHazard,
  createAlert,
  ingestCapAlert,
  getPreferences,
  updatePreferences
};


