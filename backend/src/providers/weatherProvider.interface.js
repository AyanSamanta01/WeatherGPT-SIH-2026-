/**
 * Base abstract class for weather data providers
 */
class WeatherProvider {
  constructor(name) {
    this.name = name;
  }

  /**
   * Fetch current weather for coordinates
   * @param {{ lat: number, lon: number, units?: string }} params
   * @returns {Promise<object>} Standardized current weather object
   */
  async getCurrentWeather(params) {
    throw new Error(`getCurrentWeather not implemented in ${this.name}`);
  }

  /**
   * Fetch weather forecast for coordinates
   * @param {{ lat: number, lon: number, days?: number }} params
   * @returns {Promise<object>} Standardized forecast object
   */
  async getForecast(params) {
    throw new Error(`getForecast not implemented in ${this.name}`);
  }

  /**
   * Fetch historical weather for coordinates
   * @param {{ lat: number, lon: number, from: string, to: string }} params
   * @returns {Promise<object>} Standardized historical weather object
   */
  async getHistory(params) {
    throw new Error(`getHistory not implemented in ${this.name}`);
  }

  /**
   * Resolve location name to coordinates
   * @param {{ query: string }} params
   * @returns {Promise<Array<object>>} Geocoding results
   */
  async geocode(params) {
    throw new Error(`geocode not implemented in ${this.name}`);
  }
}

module.exports = WeatherProvider;
