const weatherService = require('../services/weatherService');
const { successResponse } = require('../utils/response');

const getCurrentWeather = async (req, res, next) => {
  try {
    const { lat, lon, units } = req.query;
    const data = await weatherService.getCurrentWeather({ lat, lon, units });
    return successResponse(res, data, 'Current weather fetched successfully');
  } catch (err) {
    next(err);
  }
};

const getForecast = async (req, res, next) => {
  try {
    const { lat, lon, days } = req.query;
    const data = await weatherService.getForecast({ lat, lon, days });
    return successResponse(res, data, 'Weather forecast fetched successfully');
  } catch (err) {
    next(err);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const { lat, lon, from, to } = req.query;
    const data = await weatherService.getHistory({ lat, lon, from, to });
    return successResponse(res, data, 'Historical weather fetched successfully');
  } catch (err) {
    next(err);
  }
};

const geocode = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      return successResponse(res, [], 'Empty query');
    }
    const results = await weatherService.geocode({ query: q });
    return successResponse(res, results, 'Geocoding results retrieved');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCurrentWeather,
  getForecast,
  getHistory,
  geocode
};
