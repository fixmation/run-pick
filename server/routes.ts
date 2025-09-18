
import { type Express } from "express";
import { createServer } from "http";
import otpRoutes from "./routes/otpRoutes";
import { WebSocketServer } from 'ws';
import rideRoutes from "./routes/rideRoutes";
import lorryRoutes from "./routes/lorryRoutes";
import foodRoutes from "./routes/foodRoutes";
import parcelRoutes from "./routes/parcelRoutes";
import commissionRoutes from "./routes/commissionRoutes";
import recommendationRoutes from "./routes/recommendationRoutes";
import searchRoutes from "./routes/searchRoutes";
import authRoutes from "./routes/authRoutes";
import { achievementRoutes } from "./routes/achievementRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import chatRoutes from "./routes/chat";
import LiveOrderService from "./services/liveOrderService";
import notificationService from "./services/notificationService";
import cleanupService from "./services/cleanupService";
import { chatService } from "./services/chatService";
import { db } from "./db";

export function registerRoutes(app: Express) {
  // Authentication routes
  app.use("/api/auth", authRoutes);
  app.use("/api/auth", otpRoutes);
  
  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // MapBox configuration endpoint
  app.get('/api/config/mapbox', (_req, res) => {
    const token = process.env.MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoidGVzdC11c2VyIiwiYSI6ImNrcnl6aG90NDFud3Ayd3BnYmVmOGxlM3IifQ.demo-token';
    res.json({ accessToken: token });
  });

  // MapBox token endpoint (simplified)
  app.get('/api/mapbox/token', (_req, res) => {
    const token = process.env.MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoidGVzdC11c2VyIiwiYSI6ImNrcnl6aG90NDFud3Ayd3BnYmVmOGxlM3IifQ.demo-token';
    res.json({ token });
  });

  // Geoapify configuration endpoint (DISABLED - using server-side API instead)
  app.get('/api/config/geoapify', (_req, res) => {
    // Security: No longer expose API key to client - use server-side /api/geocode/autocomplete instead
    res.status(410).json({ 
      error: 'Direct API key access disabled for security', 
      message: 'Use /api/geocode/autocomplete endpoint instead' 
    });
  });

  // Server-side routing endpoint to avoid CORS issues
  app.get('/api/geocode/route', async (req, res) => {
    try {
      const { from, to, waypoints } = req.query;
      
      // Support both legacy (from/to) and new (waypoints) formats
      let waypointsParam;
      
      if (waypoints) {
        // New format: waypoints=lat1,lng1|lat2,lng2|lat3,lng3
        waypointsParam = waypoints as string;
      } else if (from && to) {
        // Legacy format: from=lat,lng&to=lat,lng
        waypointsParam = `${from}|${to}`;
      } else {
        return res.status(400).json({ error: 'Missing waypoints or from/to coordinates' });
      }

      const apiKey = process.env.GEOAPIFY_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'Geoapify API key not configured' });
      }

      const url = `https://api.geoapify.com/v1/routing?waypoints=${waypointsParam}&mode=drive&details=instruction_details&apiKey=${apiKey}`;
      console.log('🛣️ Multi-waypoint routing:', { waypointsParam, waypoints: waypoints || `${from}|${to}` });
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`Geoapify routing API error: ${response.status} - ${response.statusText}`);
        console.error(`URL: ${url.replace(/apiKey=[^&]+/, 'apiKey=***')}`); // Hide API key in logs
        
        // Log the actual response body for debugging
        try {
          const errorBody = await response.text();
          console.error(`Error response body: ${errorBody}`);
        } catch (e) {
          console.error('Could not read error response body');
        }
        
        // Return more specific error based on status
        if (response.status === 401) {
          return res.status(500).json({ 
            error: 'Geoapify API authentication failed - check API key validity' 
          });
        } else if (response.status === 403) {
          return res.status(500).json({ 
            error: 'Geoapify API access denied - check API key permissions' 
          });
        } else if (response.status === 429) {
          return res.status(500).json({ 
            error: 'Geoapify API rate limit exceeded' 
          });
        } else {
          return res.status(500).json({ 
            error: `Geoapify API error: ${response.status}` 
          });
        }
      }
      
      const data = await response.json();
      
      res.json({
        success: true,
        features: data.features || []
      });
    } catch (error) {
      console.error('Geoapify routing error:', error);
      res.status(500).json({ error: 'Failed to get route' });
    }
  });

  // Server-side address autocomplete endpoint to avoid CORS issues
  app.get('/api/geocode/autocomplete', async (req, res) => {
    try {
      const { query, limit = 8 } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Query parameter is required' });
      }

      const apiKey = process.env.GEOAPIFY_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'Geoapify API key not configured' });
      }

      // Use Geoapify address autocomplete API
      const geoapifyUrl = `https://api.geoapify.com/v1/geocode/autocomplete?` +
        `text=${encodeURIComponent(query)}&` +
        `apiKey=${apiKey}&` +
        `filter=countrycode:lk&` +
        `lang=en&` +
        `limit=${limit}&` +
        `format=json`;

      const response = await fetch(geoapifyUrl);
      
      if (!response.ok) {
        console.error('Geoapify API error:', response.status, response.statusText);
        // Fallback to empty results instead of error
        return res.json({ 
          suggestions: [],
          source: 'server-fallback',
          error: `Geoapify API returned ${response.status}`
        });
      }

      const data = await response.json();
      
      // Transform Geoapify results to match frontend expectations
      const suggestions = data.results?.map((result: any) => ({
        id: result.place_id || Math.random().toString(),
        place_name: result.formatted || result.address_line1 || result.name,
        full_address: result.formatted,
        center: [result.lon, result.lat], // [longitude, latitude]
        address_line1: result.address_line1,
        address_line2: result.address_line2,
        postcode: result.postcode,
        source: 'geoapify-server'
      })) || [];

      res.json({
        suggestions,
        source: 'geoapify-server',
        count: suggestions.length
      });

    } catch (error) {
      console.error('Server address autocomplete error:', error);
      res.json({ 
        suggestions: [],
        source: 'server-error',
        error: 'Failed to fetch suggestions'
      });
    }
  });

  // API routes
  app.use("/api/rides", rideRoutes);
  app.use("/api/lorries", lorryRoutes);
  app.use("/api/food", foodRoutes);
  app.use("/api/parcels", parcelRoutes);
  app.use("/api/commissions", commissionRoutes);
  app.use("/api/recommendations", recommendationRoutes);
  app.use("/api/search", searchRoutes);
  app.use("/api/achievements", achievementRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/chat", chatRoutes);

  // Test database connection
  app.get("/api/db-test", async (_req, res) => {
    try {
      // Simple query to test connection
      await db.execute("SELECT 1");
      res.json({ status: "Database connected successfully" });
    } catch (error) {
      console.error("Database connection error:", error);
      res.status(500).json({ status: "Database connection failed", error: (error as Error).message });
    }
  });

  const httpServer = createServer(app);

  // Setup WebSocket server for notifications (all user types)
  const notificationWss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws/notifications',
    verifyClient: (info: any) => {
      try {
        // Check for session cookie
        const cookieHeader = info.req.headers.cookie;
        if (!cookieHeader || !cookieHeader.includes('connect.sid=')) {
          console.log('WebSocket connection rejected: No session cookie');
          return false;
        }

        const url = new URL(info.req.url || '', `http://${info.req.headers.host}`);
        const userId = url.searchParams.get('userId');
        const userRole = url.searchParams.get('userRole');
        
        if (!userId || !userRole || isNaN(parseInt(userId))) {
          console.log('WebSocket connection rejected: Invalid userId or userRole');
          return false;
        }

        return true;
      } catch (error) {
        console.error('Error verifying notification WebSocket client:', error);
        return false;
      }
    }
  });

  // Initialize notification service with WebSocket server
  notificationService.setWebSocketServer(notificationWss);

  // Setup WebSocket server for live driver notifications (legacy)
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws/drivers',
    verifyClient: (info: any) => {
      // Basic verification - in production, add JWT validation
      try {
        const url = new URL(info.req.url || '', `http://${info.req.headers.host}`);
        const driverId = url.searchParams.get('driverId');
        return !!driverId && !isNaN(parseInt(driverId));
      } catch (error) {
        console.error('Error verifying WebSocket client:', error);
        return false;
      }
    }
  });

  // Initialize live order service with WebSocket server
  LiveOrderService.setWebSocketServer(wss);

  console.log('🔌 WebSocket server initialized for driver notifications');

  // Setup WebSocket server for chat
  const chatWss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws/chat',
    verifyClient: (info: any) => {
      try {
        // Check for session cookie
        const cookieHeader = info.req.headers.cookie;
        if (!cookieHeader || !cookieHeader.includes('connect.sid=')) {
          console.log('Chat WebSocket connection rejected: No session cookie');
          return false;
        }

        const url = new URL(info.req.url || '', `http://${info.req.headers.host}`);
        const userId = url.searchParams.get('userId');
        const userRole = url.searchParams.get('userRole');
        
        if (!userId || !userRole || isNaN(parseInt(userId))) {
          console.log('Chat WebSocket connection rejected: Invalid userId or userRole');
          return false;
        }

        return true;
      } catch (error) {
        console.error('Error verifying chat WebSocket client:', error);
        return false;
      }
    }
  });

  // Initialize chat service with WebSocket server
  chatService.setWebSocketServer(chatWss);

  console.log('💬 Chat WebSocket server initialized');

  // Start cleanup service for 90-day message retention
  cleanupService.start();

  return httpServer;
}
