// backend/routes/auth.js
import express from 'express';
import { DriverService } from '../services/driverService.js';

const router = express.Router();

/**
 * POST /api/auth/login
 * Authenticate driver with ID and bus number
 */
router.post('/login', async (req, res) => {
  try {
    const { driverId, busNumber } = req.body;

    // Validate input
    if (!driverId || !busNumber) {
      return res.status(400).json({
        success: false,
        error: 'Driver ID and bus number are required'
      });
    }

    // Authenticate driver
    const result = await DriverService.authenticateDriver(driverId, busNumber);

    if (!result.success) {
      return res.status(401).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Login endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/auth/driver/:driverId
 * Get driver information by ID
 */
router.get('/driver/:driverId', async (req, res) => {
  try {
    const { driverId } = req.params;

    if (!driverId) {
      return res.status(400).json({
        success: false,
        error: 'Driver ID is required'
      });
    }

    const result = await DriverService.getDriverById(driverId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Get driver endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout driver and reset statuses
 */
router.post('/logout', async (req, res) => {
  try {
    const { driverId, busNumber } = req.body;
    if (!driverId || !busNumber) {
      return res.status(400).json({ success: false, error: 'Driver ID and bus number are required' });
    }
    const result = await DriverService.logout(driverId, busNumber);
    if (!result.success) {
      const code = result.error && result.error.includes('active') ? 409 : 400;
      return res.status(code).json(result);
    }
    res.json(result);
  } catch (error) {
    console.error('Logout endpoint error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
