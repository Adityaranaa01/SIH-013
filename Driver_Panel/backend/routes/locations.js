import express from 'express';
import { LocationService } from '../services/locationService.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { tripId, latitude, longitude, timestamp } = req.body;

    if (!tripId || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Trip ID, latitude, and longitude are required'
      });
    }

    const result = await LocationService.saveLocation({
      tripId,
      latitude,
      longitude,
      timestamp
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (error) {
    console.error('Save location endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

router.get('/active', async (req, res) => {
  try {
    const result = await LocationService.getActiveLocations();

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Get active locations endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

router.get('/trip/:tripId', async (req, res) => {
  try {
    const { tripId } = req.params;
    const { limit } = req.query;

    if (!tripId) {
      return res.status(400).json({
        success: false,
        error: 'Trip ID is required'
      });
    }

    const result = await LocationService.getLocationHistory(tripId, limit ? parseInt(limit) : 50);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Get location history endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

router.get('/latest/:tripId', async (req, res) => {
  try {
    const { tripId } = req.params;

    if (!tripId) {
      return res.status(400).json({
        success: false,
        error: 'Trip ID is required'
      });
    }

    const result = await LocationService.getLatestLocation(tripId);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Get latest location endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

router.get('/latest-by-bus/:busNumber', async (req, res) => {
  try {
    const { busNumber } = req.params;

    if (!busNumber) {
      return res.status(400).json({ success: false, error: 'Bus number is required' });
    }

    const result = await LocationService.getLatestByBus(busNumber);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Get latest by bus endpoint error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;