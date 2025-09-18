import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { cronService } from "./services/cronService";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS configuration for cross-origin requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Session configuration - fixed for proper cookie handling
app.use(session({
  secret: process.env.SESSION_SECRET || "dev-secret-key-super-long-for-security-run-pick-2025",
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    secure: false,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: false, // Allow client access for debugging
    sameSite: 'lax',
    domain: undefined, // Let it default to current domain
    path: '/' // Ensure cookie is available site-wide
  },
  name: 'runpick.sid'
}));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Singleton guard to prevent double start
if (globalThis.__RUNPICK_SERVER_STARTED__) {
  console.log('⚠️ Server already started, skipping initialization');
  process.exit(0);
}
globalThis.__RUNPICK_SERVER_STARTED__ = true;

let serverInstance: any = null;

// Graceful shutdown handlers
const gracefulShutdown = (signal: string) => {
  console.log(`\n🛑 ${signal} received, gracefully shutting down...`);
  if (serverInstance) {
    serverInstance.close(() => {
      console.log('✅ Server closed successfully');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('uncaughtException', (err) => {
  console.error('🚨 Uncaught Exception:', err);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

(async () => {
  try {
    console.log('Starting server setup...');
    serverInstance = await registerRoutes(app);
    const server = serverInstance;
    console.log('Routes registered successfully');

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      console.error('Server error:', err);
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (process.env.NODE_ENV === "development" || app.get("env") === "development") {
      console.log('Setting up Vite middleware...');
      await setupVite(app, server);
      console.log('Vite middleware setup complete');
    } else {
      serveStatic(app);
    }

    // ALWAYS serve the app on port 5000
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = 5000;
    console.log('About to start listening on port', port);
    server.listen(port, "0.0.0.0", () => {
      console.log(`Server successfully bound to port ${port}`);
      log(`serving on port ${port}`);


      // Start cron jobs after server is ready
      console.log('🚀 Starting scheduled tasks...');
      cronService.startWeeklyCommissionReminders();
      cronService.startDailyCommissionCalculation();
      console.log('✅ All scheduled tasks started successfully');
    });

    server.on('error', (err) => {
      console.error('Server error:', err);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();