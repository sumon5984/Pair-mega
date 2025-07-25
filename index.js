
const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");
const fs = require('fs-extra');

const app = express();
const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || '0.0.0.0';

// Set global path
global.__path = process.cwd();

// Increase event emitter listeners for multiple users
require('events').EventEmitter.defaultMaxListeners = 1000;

// Ensure required directories exist
async function ensureDirectories() {
    try {
        await fs.ensureDir(path.join(__dirname, 'sessions'));
        await fs.ensureDir(path.join(__dirname, 'qr_sessions'));
        await fs.ensureDir(path.join(__dirname, 'public'));
        await fs.ensureDir(path.join(__dirname, 'views'));
        console.log('✅ Required directories ensured');
    } catch (error) {
        console.error('❌ Error creating directories:', error.message);
    }
}

// Clean up old auth directories on startup
async function cleanupOldSessions() {
    try {
        const sessionsDir = path.join(__dirname, 'sessions');
        const qrDir = path.join(__dirname, 'qr_sessions');
        const authDir = path.join(__dirname, 'auth_info_baileys');
        
        // Clean up old session directories
        if (await fs.pathExists(sessionsDir)) {
            const sessions = await fs.readdir(sessionsDir);
            for (const session of sessions) {
                const sessionPath = path.join(sessionsDir, session);
                const stat = await fs.stat(sessionPath);
                // Remove sessions older than 1 hour
                if (Date.now() - stat.mtime.getTime() > 3600000) {
                    await fs.remove(sessionPath);
                    console.log(`🗑️ Removed old session: ${session}`);
                }
            }
        }

        if (await fs.pathExists(qrDir)) {
            const qrSessions = await fs.readdir(qrDir);
            for (const session of qrSessions) {
                const sessionPath = path.join(qrDir, session);
                const stat = await fs.stat(sessionPath);
                if (Date.now() - stat.mtime.getTime() > 3600000) {
                    await fs.remove(sessionPath);
                    console.log(`🗑️ Removed old QR session: ${session}`);
                }
            }
        }

        // Clean up legacy auth directory
        if (await fs.pathExists(authDir)) {
            await fs.emptyDir(authDir);
            console.log('🗑️ Cleaned legacy auth directory');
        }

    } catch (error) {
        console.error('❌ Error during cleanup:', error.message);
    }
}

// Initialize server
async function initializeServer() {
    await ensureDirectories();
    await cleanupOldSessions();

    // Middleware
    app.use(bodyParser.json({ limit: '10mb' }));
    app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
    app.use(express.static(path.join(__dirname, 'public')));

    // Security headers
    app.use((req, res, next) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        next();
    });

    // Request logging
    app.use((req, res, next) => {
        console.log(`📥 ${req.method} ${req.path} - ${req.ip}`);
        next();
    });

    // Import routes
    const qrRoute = require('./routes/qr');
    const pairRoute = require('./routes/pair');

    // Routes with error handling
    app.use('/qr', (req, res, next) => {
        try {
            qrRoute(req, res, next);
        } catch (error) {
            console.error('❌ QR route error:', error.message);
            next(error);
        }
    });

    app.use('/code', (req, res, next) => {
        try {
            pairRoute(req, res, next);
        } catch (error) {
            console.error('❌ Pair route error:', error.message);
            next(error);
        }
    });

    // Serve HTML pages with error handling
    app.get('/pair', (req, res) => {
        try {
            const filePath = path.join(__path, 'views', 'pair.html');
            if (fs.existsSync(filePath)) {
                res.sendFile(filePath);
            } else {
                res.status(404).send('Pair page not found');
            }
        } catch (error) {
            console.error('❌ Error serving pair page:', error.message);
            res.status(500).send('Internal server error');
        }
    });

    app.get('/qr-scanner', (req, res) => {
        try {
            const filePath = path.join(__path, 'views', 'qr.html');
            if (fs.existsSync(filePath)) {
                res.sendFile(filePath);
            } else {
                res.status(404).send('QR scanner page not found');
            }
        } catch (error) {
            console.error('❌ Error serving QR page:', error.message);
            res.status(500).send('Internal server error');
        }
    });

    app.get('/', (req, res) => {
        try {
            const filePath = path.join(__path, 'views', 'main.html');
            if (fs.existsSync(filePath)) {
                res.sendFile(filePath);
            } else {
                res.status(404).send('Main page not found');
            }
        } catch (error) {
            console.error('❌ Error serving main page:', error.message);
            res.status(500).send('Internal server error');
        }
    });

    // Health check endpoint
    app.get('/health', (req, res) => {
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            version: require('./package.json').version
        });
    });

    // 404 handler
    app.use((req, res) => {
        res.status(404).json({
            error: 'Not Found',
            message: `Route ${req.method} ${req.path} not found`
        });
    });

    // Global error handling middleware
    app.use((err, req, res, next) => {
        console.error('❌ Global error handler:', err.message);
        console.error(err.stack);
        
        if (!res.headersSent) {
            res.status(err.status || 500).json({
                error: 'Internal server error',
                message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
            });
        }
    });
}

// Graceful shutdown
function gracefulShutdown(signal) {
    console.log(`\n🔄 Received ${signal}. Starting graceful shutdown...`);
    
    process.exit(0);
}

// Handle process signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Start server
initializeServer().then(() => {
    app.listen(PORT, HOST, () => {
        console.log(`🚀 Server running on http://${HOST}:${PORT}`);
        console.log('🔥 Kaisen-MD Pairing Web Ready!');
        console.log('📊 Health check available at /health');
    });
}).catch((error) => {
    console.error('❌ Failed to initialize server:', error.message);
    process.exit(1);
});

module.exports = app;
