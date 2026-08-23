const locationService = require('../services/locationService');
const { successResponse } = require('../utils/response');

const getLocations = async (req, res, next) => {
  try {
    const locations = await locationService.getLocations(req.user.id);
    return successResponse(res, locations, 'User locations retrieved');
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
  createLocation,
  deleteLocation
};
