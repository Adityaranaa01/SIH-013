import { supabase } from '../config/database.js';

export class RouteService {

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