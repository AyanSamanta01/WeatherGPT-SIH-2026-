const alertService = require('../services/alertService');
const { successResponse } = require('../utils/response');

const getAlerts = async (req, res, next) => {
  try {
    const alerts = await alertService.getActiveAlerts();
    return successResponse(res, alerts, 'Active weather alerts retrieved');
  } catch (err) {
    next(err);
  }
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

const createAlert = async (req, res, next) => {
  try {
    const alert = await alertService.createAlert(req.body);
    return successResponse(res, alert, 'Alert created successfully', 201);
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
  getNearbyAlerts,
  createAlert,
  getPreferences,
  updatePreferences
};
