const climateService = require('../services/climateService');
const { successResponse } = require('../utils/response');

const getClimateTrends = async (req, res, next) => {
  try {
    const { lat, lon, years } = req.query;
    const data = await climateService.getClimateTrends({ lat, lon, years });
    return successResponse(res, data, 'Climate trends retrieved successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getClimateTrends
};
