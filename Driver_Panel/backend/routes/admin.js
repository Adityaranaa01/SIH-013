// backend/routes/admin.js
import express from 'express';
import { RouteService } from '../services/routeService.js';
import { AdminService } from '../services/adminService.js';
import { supabase } from '../config/database.js';

const router = express.Router();

// Admin authentication middleware
const authenticateAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            error: 'Admin authentication required'
        });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // For demo purposes, we'll extract admin ID from the token
    // In production, implement proper JWT validation
    if (token.startsWith('admin-token-')) {
        // Extract admin ID from localStorage or token
        // For now, we'll use a default admin ID
        req.admin = { admin_id: 'admin-1' };
        next();
    } else {
        return res.status(401).json({
            success: false,
            error: 'Invalid admin token'
        });
    }
};

/**
 * GET /api/admin/debug/users
 * Debug endpoint to check admin users
 */
router.get('/debug/users', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('admin_users')
            .select('*');

        res.json({
            success: true,
            data: data || [],
            error: error || null
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/admin/auth/login
 * Admin login
 */
router.post('/auth/login', async (req, res) => {
    try {
        console.log('Login request received:', {
            body: req.body,
            headers: req.headers,
            contentType: req.get('Content-Type')
        });

        const { username, password } = req.body;

        if (!username || !password) {
            console.log('Missing credentials:', { username, password });
            return res.status(400).json({
                success: false,
                error: 'Username and password are required'
            });
        }

        const result = await AdminService.authenticateAdmin(username, password);

        if (!result.success) {
            return res.status(401).json(result);
        }

        res.json({
            success: true,
            data: {
                ...result.data,
                token: 'admin-token-' + Date.now() // Simple token for demo
            }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * GET /api/admin/stats
 * Get system statistics
 */
router.get('/stats', authenticateAdmin, async (req, res) => {
    try {
        const result = await AdminService.getSystemStats();
        res.json(result);
    } catch (error) {
        console.error('Get system stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * GET /api/admin/routes
 * Get all routes
 */
router.get('/routes', authenticateAdmin, async (req, res) => {
    try {
        const result = await RouteService.getAllRoutes();
        res.json(result);
    } catch (error) {
        console.error('Get routes error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * GET /api/admin/routes/active
 * Get active routes only
 */
router.get('/routes/active', authenticateAdmin, async (req, res) => {
    try {
        const result = await RouteService.getActiveRoutes();
        res.json(result);
    } catch (error) {
        console.error('Get active routes error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * GET /api/admin/routes/with-stops
 * Get all routes with their stops
 */
router.get('/routes/with-stops', authenticateAdmin, async (req, res) => {
    try {
        const result = await RouteService.getRoutesWithStops();
        res.json(result);
    } catch (error) {
        console.error('Get routes with stops error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * GET /api/admin/routes/:routeId
 * Get route by ID
 */
router.get('/routes/:routeId', authenticateAdmin, async (req, res) => {
    try {
        const { routeId } = req.params;
        const result = await RouteService.getRouteById(routeId);
        res.json(result);
    } catch (error) {
        console.error('Get route by ID error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * POST /api/admin/routes
 * Create new route
 */
router.post('/routes', authenticateAdmin, async (req, res) => {
    try {
        const routeData = req.body;
        const result = await RouteService.createRoute(routeData);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.status(201).json(result);
    } catch (error) {
        console.error('Create route error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * PUT /api/admin/routes/:routeId
 * Update route
 */
router.put('/routes/:routeId', authenticateAdmin, async (req, res) => {
    try {
        const { routeId } = req.params;
        const updateData = req.body;
        const result = await RouteService.updateRoute(routeId, updateData);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json(result);
    } catch (error) {
        console.error('Update route error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * DELETE /api/admin/routes/:routeId
 * Delete route
 */
router.delete('/routes/:routeId', authenticateAdmin, async (req, res) => {
    try {
        const { routeId } = req.params;
        const result = await RouteService.deleteRoute(routeId);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json(result);
    } catch (error) {
        console.error('Delete route error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * GET /api/admin/routes/:routeId/stops
 * Get route stops
 */
router.get('/routes/:routeId/stops', authenticateAdmin, async (req, res) => {
    try {
        const { routeId } = req.params;
        const result = await RouteService.getRouteStops(routeId);
        res.json(result);
    } catch (error) {
        console.error('Get route stops error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * POST /api/admin/routes/:routeId/stops
 * Add route stop
 */
router.post('/routes/:routeId/stops', authenticateAdmin, async (req, res) => {
    try {
        const { routeId } = req.params;
        const stopData = { ...req.body, route_id: routeId };
        const result = await RouteService.addRouteStop(stopData);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.status(201).json(result);
    } catch (error) {
        console.error('Add route stop error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * PUT /api/admin/stops/:stopId
 * Update route stop
 */
router.put('/stops/:stopId', authenticateAdmin, async (req, res) => {
    try {
        const { stopId } = req.params;
        const updateData = req.body;
        const result = await RouteService.updateRouteStop(stopId, updateData);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json(result);
    } catch (error) {
        console.error('Update route stop error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * DELETE /api/admin/stops/:stopId
 * Delete route stop
 */
router.delete('/stops/:stopId', authenticateAdmin, async (req, res) => {
    try {
        const { stopId } = req.params;
        const result = await RouteService.deleteRouteStop(stopId);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json(result);
    } catch (error) {
        console.error('Delete route stop error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * GET /api/admin/routes-with-stops
 * Get all routes with their stops
 */
router.get('/routes-with-stops', authenticateAdmin, async (req, res) => {
    try {
        const result = await RouteService.getRoutesWithStops();
        res.json(result);
    } catch (error) {
        console.error('Get routes with stops error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * GET /api/admin/drivers
 * Get all drivers
 */
router.get('/drivers', authenticateAdmin, async (req, res) => {
    try {
        const result = await AdminService.getAllDrivers();
        res.json(result);
    } catch (error) {
        console.error('Get drivers error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * PUT /api/admin/drivers/:driverId/assign-route
 * Assign driver to route
 */
router.put('/drivers/:driverId/assign-route', authenticateAdmin, async (req, res) => {
    try {
        const { driverId } = req.params;
        const { routeId } = req.body;

        if (!routeId) {
            return res.status(400).json({
                success: false,
                error: 'Route ID is required'
            });
        }

        const result = await AdminService.assignDriverToRoute(driverId, routeId);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json(result);
    } catch (error) {
        console.error('Assign driver to route error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * GET /api/admin/buses
 * Get all buses
 */
router.get('/buses', authenticateAdmin, async (req, res) => {
    try {
        const result = await AdminService.getAllBuses();
        res.json(result);
    } catch (error) {
        console.error('Get buses error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * POST /api/admin/buses
 * Create new bus
 */
router.post('/buses', authenticateAdmin, async (req, res) => {
    try {
        const busData = req.body;
        const result = await AdminService.createBus(busData);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.status(201).json(result);
    } catch (error) {
        console.error('Create bus error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * PUT /api/admin/buses/:busNumber
 * Update bus
 */
router.put('/buses/:busNumber', authenticateAdmin, async (req, res) => {
    try {
        const { busNumber } = req.params;
        const updateData = req.body;
        const result = await AdminService.updateBus(busNumber, updateData);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json(result);
    } catch (error) {
        console.error('Update bus error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * DELETE /api/admin/buses/:busNumber
 * Delete bus
 */
router.delete('/buses/:busNumber', authenticateAdmin, async (req, res) => {
    try {
        const { busNumber } = req.params;
        const result = await AdminService.deleteBus(busNumber);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json(result);
    } catch (error) {
        console.error('Delete bus error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * PUT /api/admin/buses/:busNumber/assign-route
 * Assign bus to route
 */
router.put('/buses/:busNumber/assign-route', authenticateAdmin, async (req, res) => {
    try {
        const { busNumber } = req.params;
        const { route_id } = req.body;

        if (!route_id) {
            return res.status(400).json({
                success: false,
                error: 'Route ID is required'
            });
        }

        const result = await AdminService.assignBusToRoute(busNumber, route_id);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json(result);
    } catch (error) {
        console.error('Assign bus to route error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * GET /api/admin/trips/active
 * Get active trips
 */
router.get('/trips/active', authenticateAdmin, async (req, res) => {
    try {
        const result = await AdminService.getActiveTrips();
        res.json(result);
    } catch (error) {
        console.error('Get active trips error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * GET /api/admin/locations/recent
 * Get recent location updates
 */
router.get('/locations/recent', authenticateAdmin, async (req, res) => {
    try {
        const result = await AdminService.getRecentLocationUpdates();
        res.json(result);
    } catch (error) {
        console.error('Get recent location updates error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * PUT /api/admin/profile
 * Update admin profile (username and password)
 */
router.put('/profile', authenticateAdmin, async (req, res) => {
    try {
        const { username, currentPassword, newPassword } = req.body;
        const adminId = req.admin.admin_id;

        // Validate required fields
        if (!username || !username.trim()) {
            return res.status(400).json({
                success: false,
                error: 'Username is required'
            });
        }

        // If changing password, validate current password
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({
                    success: false,
                    error: 'Current password is required to change password'
                });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({
                    success: false,
                    error: 'New password must be at least 6 characters long'
                });
            }
        }

        const result = await AdminService.updateAdminProfile(adminId, {
            username: username.trim(),
            currentPassword,
            newPassword
        });

        res.json(result);
    } catch (error) {
        console.error('Update admin profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

export default router;
