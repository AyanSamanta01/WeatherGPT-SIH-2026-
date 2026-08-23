const prisma = require('../config/db');

class LocationService {
  constructor() {
    this.inMemoryLocations = [];
  }

  async getLocations(userId) {
    if (prisma && prisma.location) {
      try {
        return await prisma.location.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' }
        });
      } catch (err) {
        // Fallback
      }
    }
    return this.inMemoryLocations.filter(l => l.userId === userId);
  }

  async addLocation(userId, data) {
    if (prisma && prisma.location) {
      try {
        if (data.isDefault) {
          await prisma.location.updateMany({
            where: { userId, isDefault: true },
            data: { isDefault: false }
          });
        }

        return await prisma.location.create({
          data: {
            userId,
            name: data.name,
            latitude: data.latitude,
            longitude: data.longitude,
            isDefault: !!data.isDefault
          }
        });
      } catch (err) {
        // Fallback
      }
    }

    const newLoc = { id: 'loc-' + Date.now(), userId, ...data, createdAt: new Date() };
    this.inMemoryLocations.push(newLoc);
    return newLoc;
  }

  async deleteLocation(userId, locationId) {
    if (prisma && prisma.location) {
      try {
        return await prisma.location.deleteMany({
          where: {
            id: locationId,
            userId
          }
        });
      } catch (err) {
        // Fallback
      }
    }
    this.inMemoryLocations = this.inMemoryLocations.filter(l => !(l.id === locationId && l.userId === userId));
    return { count: 1 };
  }
}

module.exports = new LocationService();
