// backend/services/routeService.js
import { supabase } from '../config/database.js';

/**
 * Route management service
 */
export class RouteService {

    /**
     * Get all routes
     * @returns {Promise<Object>} Routes data or error
     */
    static async getAllRoutes() {
        try {
            const { data, error } = await supabase
                .from('routes')
                .select('*')
                .order('route_name');

            if (error) {
                throw error;
            }

            return {
                success: true,
                data: data || []
            };
        } catch (error) {
            console.error('Get all routes error:', error);
            return {
                success: false,
                error: 'Failed to fetch routes'
            };
        }
    }

    /**
     * Get active routes only
     * @returns {Promise<Object>} Active routes data or error
     */
    static async getActiveRoutes() {
        try {
            const { data, error } = await supabase
                .from('routes')
                .select('*')
                .eq('is_active', true)
                .order('route_name');

            if (error) {
                throw error;
            }

            return {
                success: true,
                data: data || []
            };
        } catch (error) {
            console.error('Get active routes error:', error);
            return {
                success: false,
                error: 'Failed to fetch active routes'
            };
        }
    }

    /**
     * Get route by ID
     * @param {string} routeId - Route ID
     * @returns {Promise<Object>} Route data or error
     */
    static async getRouteById(routeId) {
        try {
            const { data, error } = await supabase
                .from('routes')
                .select('*')
                .eq('route_id', routeId)
                .single();

            if (error) {
                return {
                    success: false,
                    error: 'Route not found'
                };
            }

            return {
                success: true,
                data
            };
        } catch (error) {
            console.error('Get route by ID error:', error);
            return {
                success: false,
                error: 'Failed to fetch route'
            };
        }
    }

    /**
     * Create new route
     * @param {Object} routeData - Route data
     * @returns {Promise<Object>} Created route data or error
     */
    static async createRoute(routeData) {
        try {
            const { data, error } = await supabase
                .from('routes')
                .insert(routeData)
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
            console.error('Create route error:', error);
            return {
                success: false,
                error: 'Failed to create route'
            };
        }
    }

    /**
     * Update route
     * @param {string} routeId - Route ID
     * @param {Object} updateData - Update data
     * @returns {Promise<Object>} Updated route data or error
     */
    static async updateRoute(routeId, updateData) {
        try {
            const { data, error } = await supabase
                .from('routes')
                .update(updateData)
                .eq('route_id', routeId)
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
            console.error('Update route error:', error);
            return {
                success: false,
                error: 'Failed to update route'
            };
        }
    }

    /**
     * Delete route
     * @param {string} routeId - Route ID
     * @returns {Promise<Object>} Success or error
     */
    static async deleteRoute(routeId) {
        try {
            const { error } = await supabase
                .from('routes')
                .delete()
                .eq('route_id', routeId);

            if (error) {
                throw error;
            }

            return {
                success: true,
                message: 'Route deleted successfully'
            };
        } catch (error) {
            console.error('Delete route error:', error);
            return {
                success: false,
                error: 'Failed to delete route'
            };
        }
    }

    /**
     * Get route stops
     * @param {string} routeId - Route ID
     * @returns {Promise<Object>} Route stops data or error
     */
    static async getRouteStops(routeId) {
        try {
            const { data, error } = await supabase
                .from('route_stops')
                .select('*')
                .eq('route_id', routeId)
                .order('stop_order');

            if (error) {
                throw error;
            }

            return {
                success: true,
                data: data || []
            };
        } catch (error) {
            console.error('Get route stops error:', error);
            return {
                success: false,
                error: 'Failed to fetch route stops'
            };
        }
    }

    /**
     * Add route stop
     * @param {Object} stopData - Stop data
     * @returns {Promise<Object>} Created stop data or error
     */
    static async addRouteStop(stopData) {
        try {
            const { data, error } = await supabase
                .from('route_stops')
                .insert(stopData)
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
            console.error('Add route stop error:', error);
            return {
                success: false,
                error: 'Failed to add route stop'
            };
        }
    }

    /**
     * Update route stop
     * @param {number} stopId - Stop ID
     * @param {Object} updateData - Update data
     * @returns {Promise<Object>} Updated stop data or error
     */
    static async updateRouteStop(stopId, updateData) {
        try {
            const { data, error } = await supabase
                .from('route_stops')
                .update(updateData)
                .eq('stop_id', stopId)
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
            console.error('Update route stop error:', error);
            return {
                success: false,
                error: 'Failed to update route stop'
            };
        }
    }

    /**
     * Delete route stop
     * @param {number} stopId - Stop ID
     * @returns {Promise<Object>} Success or error
     */
    static async deleteRouteStop(stopId) {
        try {
            const { error } = await supabase
                .from('route_stops')
                .delete()
                .eq('stop_id', stopId);

            if (error) {
                throw error;
            }

            return {
                success: true,
                message: 'Route stop deleted successfully'
            };
        } catch (error) {
            console.error('Delete route stop error:', error);
            return {
                success: false,
                error: 'Failed to delete route stop'
            };
        }
    }

    /**
     * Get routes with their stops
     * @returns {Promise<Object>} Routes with stops data or error
     */
    static async getRoutesWithStops() {
        try {
            const { data, error } = await supabase
                .from('routes')
                .select(`
          *,
          route_stops (
            stop_id,
            stop_name,
            stop_order,
            latitude,
            longitude,
            is_major_stop
          )
        `)
                .order('route_name');

            if (error) {
                throw error;
            }

            // Sort stops by stop_order for each route
            const routesWithSortedStops = data.map(route => ({
                ...route,
                route_stops: route.route_stops.sort((a, b) => a.stop_order - b.stop_order)
            }));

            return {
                success: true,
                data: routesWithSortedStops
            };
        } catch (error) {
            console.error('Get routes with stops error:', error);
            return {
                success: false,
                error: 'Failed to fetch routes with stops'
            };
        }
    }
}
