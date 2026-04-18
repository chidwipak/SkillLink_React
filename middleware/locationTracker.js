const EARTH_RADIUS_KM = 6371;
const MIN_UPDATE_INTERVAL = 5000;
const lastUpdateTime = new Map();

const isValidLatitude = (lat) => {
  const num = parseFloat(lat);
  return !isNaN(num) && num >= -90 && num <= 90;
};

const isValidLongitude = (lng) => {
  const num = parseFloat(lng);
  return !isNaN(num) && num >= -180 && num <= 180;
};

const validateCoordinates = (coords) => {
  if (!coords) return { valid: false, error: 'Coordinates are required' };
  
  const { latitude, longitude, lat, lng } = coords;
  const finalLat = latitude !== undefined ? latitude : lat;
  const finalLng = longitude !== undefined ? longitude : lng;
  
  if (finalLat === undefined || finalLng === undefined) {
    return { valid: false, error: 'Both latitude and longitude are required' };
  }
  if (!isValidLatitude(finalLat)) {
    return { valid: false, error: 'Invalid latitude. Must be between -90 and 90' };
  }
  if (!isValidLongitude(finalLng)) {
    return { valid: false, error: 'Invalid longitude. Must be between -180 and 180' };
  }
  
  return { valid: true, coordinates: { latitude: parseFloat(finalLat), longitude: parseFloat(finalLng) } };
};

const calculateDistance = (point1, point2) => {
  const toRadians = (degrees) => degrees * (Math.PI / 180);
  
  const lat1 = toRadians(point1.latitude);
  const lat2 = toRadians(point2.latitude);
  const deltaLat = toRadians(point2.latitude - point1.latitude);
  const deltaLng = toRadians(point2.longitude - point1.longitude);
  
  const a = Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return EARTH_RADIUS_KM * c;
};

const formatDistance = (distanceKm) => {
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`;
  return `${distanceKm.toFixed(1)} km`;
};

const estimateTravelTime = (distanceKm, mode = 'car') => {
  const speeds = { walk: 5, bike: 15, car: 40 };
  const speed = speeds[mode] || speeds.car;
  const hours = distanceKm / speed;
  const minutes = Math.ceil(hours * 60);
  
  return {
    minutes,
    formatted: minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)}h ${minutes % 60}min`
  };
};

const validateLocation = (req, res, next) => {
  const validation = validateCoordinates(req.body);
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_LOCATION', message: validation.error }
    });
  }
  req.location = validation.coordinates;
  next();
};

const throttleLocationUpdates = (req, res, next) => {
  const userId = req.user?.userId || req.ip;
  const now = Date.now();
  const lastUpdate = lastUpdateTime.get(userId);
  
  if (lastUpdate && (now - lastUpdate) < MIN_UPDATE_INTERVAL) {
    return res.status(429).json({
      success: false,
      error: { code: 'TOO_MANY_UPDATES', message: `Please wait at least ${MIN_UPDATE_INTERVAL / 1000} seconds between location updates` }
    });
  }
  
  lastUpdateTime.set(userId, now);
  next();
};

const geoHelpers = (req, res, next) => {
  req.calculateDistanceTo = (targetCoords) => {
    if (!req.location) return null;
    return calculateDistance(req.location, targetCoords);
  };
  
  req.estimateTravelTimeTo = (targetCoords, mode = 'car') => {
    const distance = req.calculateDistanceTo(targetCoords);
    if (distance === null) return null;
    return estimateTravelTime(distance, mode);
  };
  
  next();
};

const extractLocationFromQuery = (req, res, next) => {
  const { lat, lng, latitude, longitude, radius } = req.query;
  const coords = { latitude: latitude || lat, longitude: longitude || lng };
  
  if (coords.latitude && coords.longitude) {
    const validation = validateCoordinates(coords);
    if (validation.valid) {
      req.location = validation.coordinates;
      req.searchRadius = parseFloat(radius) || 10;
    }
  }
  
  next();
};

const createGeoPoint = (coords) => ({
  type: 'Point',
  coordinates: [coords.longitude, coords.latitude]
});

const createNearbyQuery = (center, radiusKm) => ({
  $near: {
    $geometry: createGeoPoint(center),
    $maxDistance: radiusKm * 1000
  }
});

const broadcastLocationUpdate = (io) => {
  return (req, res, next) => {
    const originalJson = res.json.bind(res);
    
    res.json = (body) => {
      if (res.statusCode === 200 && req.location && io) {
        const userId = req.user?.userId;
        const room = req.body.orderId || req.body.bookingId;
        
        if (room) {
          io.to(room).emit('locationUpdate', {
            userId,
            location: req.location,
            timestamp: new Date().toISOString()
          });
        }
      }
      return originalJson(body);
    };
    
    next();
  };
};

const checkProximity = (options = {}) => {
  const maxDistance = options.maxDistance || 0.5;
  
  return (req, res, next) => {
    if (!req.location || !req.body.jobLocation) return next();
    
    const distance = calculateDistance(req.location, req.body.jobLocation);
    req.distanceFromJob = distance;
    req.isWithinRange = distance <= maxDistance;
    
    next();
  };
};

module.exports = {
  validateLocation,
  validateCoordinates,
  throttleLocationUpdates,
  geoHelpers,
  extractLocationFromQuery,
  calculateDistance,
  formatDistance,
  estimateTravelTime,
  createGeoPoint,
  createNearbyQuery,
  broadcastLocationUpdate,
  checkProximity,
  isValidLatitude,
  isValidLongitude
};
