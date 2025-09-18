// backend/services/adminService.js
import { supabase } from '../config/database.js';
import bcrypt from 'bcrypt';

/**
 * Admin management service
 */
export class AdminService {

    /**
     * Authenticate admin user
     * @param {string} username - Username
     * @param {string} password - Password
     * @returns {Promise<Object>} Authentication result
     */
    static async authenticateAdmin(username, password) {
        try {
            console.log('Admin login attempt:', { username, password });

            const { data, error } = await supabase
                .from('admin_users')
                .select('*')
                .eq('username', username)
                .eq('is_active', true)
                .single();

            console.log('Database query result:', { data, error });

            if (error) {
                console.error('Database error:', error);
                return {
                    success: false,
                    error: 'Database error: ' + error.message
                };
            }

            if (!data) {
                console.log('No admin user found with username:', username);
                return {
                    success: false,
                    error: 'Admin user not found'
                };
            }

            // Use bcrypt to compare passwords
            const isValidPassword = await bcrypt.compare(password, data.password_hash);
            console.log('Password check:', {
                provided: password,
                stored: data.password_hash,
                isValid: isValidPassword
            });

            if (!isValidPassword) {
                return {
                    success: false,
                    error: 'Invalid password'
                };
            }

            return {
                success: true,
                data: {
                    adminId: data.admin_id,
                    username: data.username,
                    role: data.role
                }
            };
        } catch (error) {
            console.error('Admin authentication error:', error);
            return {
                success: false,
                error: 'Authentication failed: ' + error.message
            };
        }
    }

    /**
     * Get system statistics
     * @returns {Promise<Object>} System stats
     */
    static async getSystemStats() {
        try {
            // Get counts for different entities
            const [driversResult, busesResult, routesResult, activeTripsResult] = await Promise.all([
                supabase.from('drivers').select('*', { count: 'exact', head: true }),
                supabase.from('buses').select('*', { count: 'exact', head: true }),
                supabase.from('routes').select('*', { count: 'exact', head: true }),
                supabase.from('trips').select('*', { count: 'exact', head: true }).eq('status', 'active')
            ]);

            // Get active drivers
            const { data: activeDrivers } = await supabase
                .from('drivers')
                .select('*')
                .in('status', ['active', 'on_trip']);

            // Get recent trips (last 24 hours)
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            const { data: recentTrips } = await supabase
                .from('trips')
                .select('*')
                .gte('created_at', yesterday.toISOString())
                .order('created_at', { ascending: false })
                .limit(10);

            return {
                success: true,
                data: {
                    totalDrivers: driversResult.count || 0,
                    totalBuses: busesResult.count || 0,
                    totalRoutes: routesResult.count || 0,
                    activeTrips: activeTripsResult.count || 0,
                    activeDrivers: activeDrivers?.length || 0,
                    recentTrips: recentTrips || []
                }
            };
        } catch (error) {
            console.error('Get system stats error:', error);
            return {
                success: false,
                error: 'Failed to fetch system statistics'
            };
        }
    }

    /**
     * Get all drivers with their assigned routes
     * @returns {Promise<Object>} Drivers data
     */
    static async getAllDrivers() {
        try {
            const { data, error } = await supabase
                .from('drivers')
                .select(`
          *,
          routes (
            route_id,
            route_name,
            description,
            color
          )
        `)
                .order('name');

            if (error) {
                throw error;
            }

            return {
                success: true,
                data: data || []
            };
        } catch (error) {
            console.error('Get all drivers error:', error);
            return {
                success: false,
                error: 'Failed to fetch drivers'
            };
        }
    }

    /**
     * Update driver route assignment
     * @param {string} driverId - Driver ID
     * @param {string} routeId - Route ID
     * @returns {Promise<Object>} Update result
     */
    static async assignDriverToRoute(driverId, routeId) {
        try {
            const { data, error } = await supabase
                .from('drivers')
                .update({ assigned_route: routeId })
                .eq('driver_id', driverId)
                .select()
                .single();

            if (error) {
                throw error;
            }

            return {
                success: true,
                data
            };
        } catch (error) {
            console.error('Assign driver to route error:', error);
            return {
                success: false,
                error: 'Failed to assign driver to route'
            };
        }
    }

    /**
     * Get all buses with their current status
     * @returns {Promise<Object>} Buses data
     */
    static async getAllBuses() {
        try {
            const { data, error } = await supabase
                .from('buses')
                .select(`
          *,
          drivers (
            driver_id,
            name,
            assigned_route
          )
        `)
                .order('bus_number');

            if (error) {
                throw error;
            }

            return {
                success: true,
                data: data || []
            };
        } catch (error) {
            console.error('Get all buses error:', error);
            return {
                success: false,
                error: 'Failed to fetch buses'
            };
        }
    }

    /**
     * Get active trips with details
     * @returns {Promise<Object>} Active trips data
     */
    static async getActiveTrips() {
        try {
            const { data, error } = await supabase
                .from('trips')
                .select(`
          *,
          drivers (
            driver_id,
            name,
            assigned_route
          ),
          buses (
            bus_number,
            status
          )
        `)
                .eq('status', 'active')
                .order('start_time', { ascending: false });

            if (error) {
                throw error;
            }

            return {
                success: true,
                data: data || []
            };
        } catch (error) {
            console.error('Get active trips error:', error);
            return {
                success: false,
                error: 'Failed to fetch active trips'
            };
        }
    }

    /**
     * Get recent location updates for active trips
     * @returns {Promise<Object>} Location updates data
     */
    static async getRecentLocationUpdates() {
        try {
            const { data, error } = await supabase
                .from('trip_locations')
                .select(`
          *,
          trips (
            trip_id,
            driver_id,
            bus_number,
            drivers (
              name,
              assigned_route
            )
          )
        `)
                .order('timestamp', { ascending: false })
                .limit(50);

            if (error) {
                throw error;
            }

            return {
                success: true,
                data: data || []
            };
        } catch (error) {
            console.error('Get recent location updates error:', error);
            return {
                success: false,
                error: 'Failed to fetch location updates'
            };
        }
    }

    /**
     * Update admin profile (username and password)
     * @param {string} adminId - Admin ID
     * @param {Object} updateData - Update data
     * @param {string} updateData.username - New username
     * @param {string} updateData.currentPassword - Current password (required if changing password)
     * @param {string} updateData.newPassword - New password (optional)
     * @returns {Promise<Object>} Update result or error
     */
    static async updateAdminProfile(adminId, updateData) {
        try {
            const { username, currentPassword, newPassword } = updateData;

            // First, get the current admin data
            const { data: currentAdmin, error: fetchError } = await supabase
                .from('admin_users')
                .select('*')
                .eq('admin_id', adminId)
                .single();

            if (fetchError) {
                throw fetchError;
            }

            if (!currentAdmin) {
                return {
                    success: false,
                    error: 'Admin not found'
                };
            }

            // If changing password, verify current password
            if (newPassword) {
                const isValidCurrentPassword = await bcrypt.compare(currentPassword, currentAdmin.password_hash);
                if (!isValidCurrentPassword) {
                    return {
                        success: false,
                        error: 'Current password is incorrect'
                    };
                }
            }

            // Prepare update data
            const updateFields = {
                username: username,
                updated_at: new Date().toISOString()
            };

            // If new password provided, hash it and update
            if (newPassword) {
                const saltRounds = 10;
                updateFields.password_hash = await bcrypt.hash(newPassword, saltRounds);
            }

            // Update the admin profile
            const { data, error } = await supabase
                .from('admin_users')
                .update(updateFields)
                .eq('admin_id', adminId)
                .select()
                .single();

            if (error) {
                throw error;
            }

            return {
                success: true,
                data: {
                    admin_id: data.admin_id,
                    username: data.username,
                    role: data.role,
                    updated_at: data.updated_at
                }
            };
        } catch (error) {
            console.error('Update admin profile error:', error);
            return {
                success: false,
                error: 'Failed to update admin profile'
            };
        }
    }

    /**
     * Create new bus
     * @param {Object} busData - Bus data
     * @param {string} busData.bus_number - Bus number
     * @param {string} busData.capacity - Bus capacity
     * @param {string} busData.model - Bus model
     * @param {string} busData.year - Bus year
     * @param {string} busData.status - Bus status
     * @returns {Promise<Object>} Create result
     */
    static async createBus(busData) {
        try {
            const { bus_number, capacity, model, year, status = 'halt' } = busData;

            // Validate required fields
            if (!bus_number) {
                return {
                    success: false,
                    error: 'Bus number is required'
                };
            }

            // Check if bus already exists
            const { data: existingBus } = await supabase
                .from('buses')
                .select('bus_number')
                .eq('bus_number', bus_number)
                .single();

            if (existingBus) {
                return {
                    success: false,
                    error: 'Bus with this number already exists'
                };
            }

            // Create the bus
            const { data, error } = await supabase
                .from('buses')
                .insert({
                    bus_number,
                    capacity: capacity ? parseInt(capacity) : null,
                    model,
                    year: year ? parseInt(year) : null,
                    status,
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) {
                throw error;
            }

            return {
                success: true,
                data
            };
        } catch (error) {
            console.error('Create bus error:', error);
            return {
                success: false,
                error: 'Failed to create bus'
            };
        }
    }

    /**
     * Update bus
     * @param {string} busNumber - Bus number
     * @param {Object} updateData - Update data
     * @returns {Promise<Object>} Update result
     */
    static async updateBus(busNumber, updateData) {
        try {
            const { capacity, model, year, status } = updateData;

            // Prepare update fields
            const updateFields = {};
            if (capacity !== undefined) updateFields.capacity = parseInt(capacity);
            if (model !== undefined) updateFields.model = model;
            if (year !== undefined) updateFields.year = parseInt(year);
            if (status !== undefined) updateFields.status = status;

            // Update the bus
            const { data, error } = await supabase
                .from('buses')
                .update(updateFields)
                .eq('bus_number', busNumber)
                .select()
                .single();

            if (error) {
                throw error;
            }

            if (!data) {
                return {
                    success: false,
                    error: 'Bus not found'
                };
            }

            return {
                success: true,
                data
            };
        } catch (error) {
            console.error('Update bus error:', error);
            return {
                success: false,
                error: 'Failed to update bus'
            };
        }
    }

    /**
     * Delete bus
     * @param {string} busNumber - Bus number
     * @returns {Promise<Object>} Delete result
     */
    static async deleteBus(busNumber) {
        try {
            // Check if bus has active trips
            const { data: activeTrips } = await supabase
                .from('trips')
                .select('trip_id')
                .eq('bus_number', busNumber)
                .eq('status', 'active');

            if (activeTrips && activeTrips.length > 0) {
                return {
                    success: false,
                    error: 'Cannot delete bus with active trips'
                };
            }

            // Delete the bus
            const { error } = await supabase
                .from('buses')
                .delete()
                .eq('bus_number', busNumber);

            if (error) {
                throw error;
            }

            return {
                success: true,
                message: 'Bus deleted successfully'
            };
        } catch (error) {
            console.error('Delete bus error:', error);
            return {
                success: false,
                error: 'Failed to delete bus'
            };
        }
    }

    /**
     * Assign bus to route
     * @param {string} busNumber - Bus number
     * @param {string} routeId - Route ID
     * @returns {Promise<Object>} Assignment result
     */
    static async assignBusToRoute(busNumber, routeId) {
        try {
            // Check if bus exists
            const { data: bus, error: busError } = await supabase
                .from('buses')
                .select('bus_number')
                .eq('bus_number', busNumber)
                .single();

            if (busError || !bus) {
                return {
                    success: false,
                    error: 'Bus not found'
                };
            }

            // Check if route exists
            const { data: route, error: routeError } = await supabase
                .from('routes')
                .select('route_id')
                .eq('route_id', routeId)
                .single();

            if (routeError || !route) {
                return {
                    success: false,
                    error: 'Route not found'
                };
            }

            // Update bus with route assignment
            // First check if assigned_route column exists
            const { data: testData, error: testError } = await supabase
                .from('buses')
                .select('assigned_route')
                .limit(1);

            if (testError && testError.message.includes('assigned_route')) {
                return {
                    success: false,
                    error: 'assigned_route column does not exist. Please add it to the buses table first.'
                };
            }

            const { data, error } = await supabase
                .from('buses')
                .update({
                    assigned_route: routeId,
                    updated_at: new Date().toISOString()
                })
                .eq('bus_number', busNumber)
                .select()
                .single();

            if (error) {
                throw error;
            }

            // Also update the driver's assigned route if there's a current driver
            if (data.current_driver) {
                await supabase
                    .from('drivers')
                    .update({
                        assigned_route: routeId,
                        updated_at: new Date().toISOString()
                    })
                    .eq('driver_id', data.current_driver);
            }

            return {
                success: true,
                data: {
                    bus_number: data.bus_number,
                    assigned_route: data.assigned_route
                },
                message: 'Bus assigned to route successfully'
            };
        } catch (error) {
            console.error('Assign bus to route error:', error);
            return {
                success: false,
                error: 'Failed to assign bus to route'
            };
        }
    }
}
