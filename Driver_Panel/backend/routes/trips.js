import express from 'express';
import { TripService } from '../services/tripService.js';

const router = express.Router();

router.get('/active/:driverId', async (req, res) => {
  try {
    const { driverId } = req.params;

    if (!driverId) {
      return res.status(400).json({
        success: false,
        error: 'Driver ID is required'
      });
    }

    const result = await TripService.getActiveTrip(driverId);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Get active trip endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

router.post('/start', async (req, res) => {
  try {
    const { driverId, busNumber } = req.body;

    if (!driverId || !busNumber) {
      return res.status(400).json({
        success: false,
        error: 'Driver ID and bus number are required'
      });
    }

    const result = await TripService.startTrip(driverId, busNumber);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (error) {
    console.error('Start trip endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

router.post('/end', async (req, res) => {
  try {
    const { tripId } = req.body;

    if (!tripId) {
      return res.status(400).json({
        success: false,
        error: 'Trip ID is required'
      });
    }

    const result = await TripService.endTrip(tripId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('End trip endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

router.get('/:tripId', async (req, res) => {
  try {
    const { tripId } = req.params;

    if (!tripId) {
      return res.status(400).json({
        success: false,
        error: 'Trip ID is required'
      });
    }

    const result = await TripService.getTripById(tripId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Get trip endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;