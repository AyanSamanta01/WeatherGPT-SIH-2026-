const locationService = require('../services/locationService');
const { successResponse, errorResponse } = require('../utils/response');

const getLocations = async (req, res, next) => {
  try {
    const locations = await locationService.getLocations(req.user.id);
    return successResponse(res, locations, 'User locations retrieved');
  } catch (err) {
    next(err);
  }
};

const getLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const location = await locationService.getLocationById(req.user.id, id);
    if (!location) {
      return errorResponse(res, 'Location not found', 404);
    }
    return successResponse(res, location, 'Location retrieved successfully');
  } catch (err) {
    next(err);
  }
};

const createLocation = async (req, res, next) => {
  try {
    const location = await locationService.addLocation(req.user.id, req.body);
    return successResponse(res, location, 'Location added successfully', 201);
  } catch (err) {
    next(err);
  }
};

const updateLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await locationService.updateLocation(req.user.id, id, req.body);
    if (!updated) {
      return errorResponse(res, 'Location not found', 404);
    }
    return successResponse(res, updated, 'Location updated successfully');
  } catch (err) {
    next(err);
  }
};

const deleteLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    await locationService.deleteLocation(req.user.id, id);
    return successResponse(res, null, 'Location deleted successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getLocations,
  getLocation,
  createLocation,
  updateLocation,
  deleteLocation
};

