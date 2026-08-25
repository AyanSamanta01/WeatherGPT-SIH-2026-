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

  async getLocationById(userId, locationId) {
    if (prisma && prisma.location) {
      try {
        const location = await prisma.location.findFirst({
          where: { id: locationId, userId }
        });
        if (location) return location;
      } catch (err) {
        // Fallback
      }
    }
    return this.inMemoryLocations.find(l => l.id === locationId && l.userId === userId) || null;
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

    if (data.isDefault) {
      this.inMemoryLocations.forEach(l => {
        if (l.userId === userId) l.isDefault = false;
      });
    }

    const newLoc = { id: 'loc-' + Date.now(), userId, ...data, isDefault: !!data.isDefault, createdAt: new Date(), updatedAt: new Date() };
    this.inMemoryLocations.push(newLoc);
    return newLoc;
  }

  async updateLocation(userId, locationId, data) {
    if (prisma && prisma.location) {
      try {
        if (data.isDefault) {
          await prisma.location.updateMany({
            where: { userId, isDefault: true },
            data: { isDefault: false }
          });
        }

        const updated = await prisma.location.updateMany({
          where: { id: locationId, userId },
          data
        });

        if (updated.count > 0) {
          return await prisma.location.findFirst({
            where: { id: locationId, userId }
          });
        }
      } catch (err) {
        // Fallback
      }
    }

    const locIndex = this.inMemoryLocations.findIndex(l => l.id === locationId && l.userId === userId);
    if (locIndex !== -1) {
      if (data.isDefault) {
        this.inMemoryLocations.forEach(l => {
          if (l.userId === userId) l.isDefault = false;
        });
      }
      this.inMemoryLocations[locIndex] = {
        ...this.inMemoryLocations[locIndex],
        ...data,
        updatedAt: new Date()
      };
      return this.inMemoryLocations[locIndex];
    }

    return null;
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

