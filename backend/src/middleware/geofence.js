const { isWithinShahkot } = require('../utils/geolocation');

/**
 * Geofence Middleware
 * Soft-checks user location by default. Strict blocking can be enabled via env.
 */
function geofenceCheck(req, res, next) {
  const strictGeofence = process.env.ENFORCE_GEOFENCE === 'true' && process.env.SKIP_GEOFENCE !== 'true';

  // In non-strict mode, never block authentication based on location.
  if (!strictGeofence) {
    return next();
  }

  // Get location from request body (during registration) or from user profile
  const latitude = req.body.latitude || (req.user && req.user.latitude);
  const longitude = req.body.longitude || (req.user && req.user.longitude);

  if (!latitude || !longitude) {
    return res.status(400).json({
      error: 'Location is required. Please enable GPS/location services.',
      code: 'LOCATION_REQUIRED',
    });
  }

  const result = isWithinShahkot(parseFloat(latitude), parseFloat(longitude));

  if (!result.isWithin) {
    return res.status(403).json({
      error: `You are ${result.distance}KM away from Shahkot. This app is only available within ${result.maxRadius}KM of Shahkot city.`,
      code: 'OUTSIDE_GEOFENCE',
      distance: result.distance,
      maxRadius: result.maxRadius,
    });
  }

  // Attach location info to request
  req.locationInfo = result;
  next();
}

module.exports = { geofenceCheck };
