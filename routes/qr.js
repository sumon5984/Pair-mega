
const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const pino = require("pino");
const { toBuffer } = require("qrcode");
const { Boom } = require("@hapi/boom");
const { upload } = require('../utils/mega');
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    Browsers,
    DisconnectReason
} = require("@whiskeysockets/baileys");

const MESSAGE = process.env.MESSAGE || `
🔥 𝐊ąìʂҽղ-𝐌𝐃 | 𝐒𝐞𝐬𝐬𝐢𝐨𝐧 𝐂𝐨𝐧𝐧𝐞𝐜𝐭𝐞𝐝 ✅
🔥 Your Bot is Now Alive, Royal & Ready to Rock! 🔥
━━━━━━━━━━━━━━━━━━━━━━
🟢 Session qr code Successfully ✅
🔗 Connect for Instant Support & Royal Help:
📌 WhatsApp Group:
https://chat.whatsapp.com/Ja7bWhgrFkc3V67yBjchM2
━━━━━━━━━━━━━━━━━━━━━━
📦 GitHub Repo — Star It For Power Boost!
✴️ 𝐊ąìʂҽղ-𝐌𝐃 GitHub:
🪂github.com/sumon9836/KAISEN-MD.git
━━━━━━━━━━━━━━━━━━━━━━
🚀 Deploy Your Royal Bot Now
👑 𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐝 𝐁𝐲: 𝐋𝐨𝐯𝐞𝐥𝐲-𝐁𝐨𝐲.𝐱.𝐒𝐮𝐦𝐨𝐧
🧠 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲: 𝐊ąìʂҽղ 𝐈𝐧𝐭𝐞𝐥 𝐂𝐨𝐫𝐞™
✨ Deploy & Rule Like a True Legend
━━━━━━━━━━━━━━━━━━━━━━
📝 Royal Quote of the Bot:

> "𝐁𝐨𝐭 𝐁𝐲 𝐍𝐚𝐦𝐞, 𝐋𝐞𝐠𝐞𝐧𝐝 𝐁𝐲 𝐅𝐚𝐦𝐞"
— Royalty Runs in the Code
━━━━━━━━━━━━━━━━━━━━━━
🦾 𝐊ąìʂҽղ_𝐌𝐃 || 𝐒𝐚𝐦𝐢𝐧_𝐒𝐮𝐦𝐨𝐧 || 𝐑𝐨𝐲𝐚𝐥𝐁𝐨𝐭
`;

// Store QR sessions
const qrSessions = new Map();
const qrTimeouts = new Map();

// Cleanup function for QR sessions
async function cleanupQRSession(sessionId) {
    const session = qrSessions.get(sessionId);
    if (!session) return;

    try {
        // Clear timeout
        const timeout = qrTimeouts.get(sessionId);
        if (timeout) {
            clearTimeout(timeout);
            qrTimeouts.delete(sessionId);
        }

        // Close socket
        if (session.socket && typeof session.socket.end === 'function') {
            session.socket.end();
        }

        // Remove auth directory
        if (session.authDir && await fs.pathExists(session.authDir)) {
            await fs.remove(session.authDir);
        }

        qrSessions.delete(sessionId);
        console.log(`✅ QR Session ${sessionId} cleaned up`);
    } catch (error) {
        console.error(`❌ Error cleaning QR session ${sessionId}:`, error.message);
    }
}

// Schedule QR session cleanup
function scheduleQRCleanup(sessionId, timeout = 300000) {
    const existingTimeout = qrTimeouts.get(sessionId);
    if (existingTimeout) {
        clearTimeout(existingTimeout);
    }

    const timeoutId = setTimeout(() => {
        cleanupQRSession(sessionId);
    }, timeout);
    
    qrTimeouts.set(sessionId, timeoutId);
}

router.get('/', async (req, res) => {
    const sessionId = uuidv4();
    const authDir = path.join(__dirname, '..', 'qr_sessions', sessionId);

    // Request timeout
    const responseTimeout = setTimeout(() => {
        if (!res.headersSent) {
            res.status(408).json({ error: 'QR generation timeout' });
        }
        cleanupQRSession(sessionId);
    }, 30000);

    try {
        await fs.ensureDir(authDir);
        
        const { state, saveCreds } = await useMultiFileAuthState(authDir);
        
        const socket = makeWASocket({
            printQRInTerminal: false,
            logger: pino({ level: "fatal" }),
            browser: Browsers.macOS("Desktop"),
            auth: state,
            connectTimeoutMs: 30000,
            defaultQueryTimeoutMs: 30000,
        });

        // Store session
        qrSessions.set(sessionId, { socket, authDir, createdAt: Date.now() });
        scheduleQRCleanup(sessionId);

        let qrSent = false;

        socket.ev.on("connection.update", async (update) => {
            try {
                const { connection, lastDisconnect, qr } = update;

                // Handle QR code generation
                if (qr && !qrSent) {
                    clearTimeout(responseTimeout);
                    if (!res.headersSent) {
                        try {
                            res.setHeader('Content-Type', 'image/png');
                            const qrBuffer = await toBuffer(qr);
                            res.end(qrBuffer);
                            qrSent = true;
                        } catch (qrError) {
                            console.error("❌ QR generation error:", qrError.message);
                            res.status(500).json({ error: 'Failed to generate QR code' });
                        }
                    }
                }

                // Handle successful connection
                if (connection === "open") {
                    console.log(`✅ QR Connection opened for session ${sessionId}`);
                    
                    try {
                        await delay(3000);
                        
                        const user = socket.user.id;
                        const credsPath = path.join(authDir, 'creds.json');
                        
                        if (await fs.pathExists(credsPath)) {
                            // Generate random ID and upload
                            const randomId = generateRandomId();
                            const mega_url = await upload(fs.createReadStream(credsPath), `${randomId}.json`);
                            const sessionCode = mega_url.replace('https://mega.nz/file/', '');

                            const msgId = await socket.sendMessage(user, { text: "KAISEN~" + sessionCode });
                            await socket.sendMessage(user, { text: MESSAGE }, { quoted: msgId });
                            
                            console.log(`✅ QR Session completed for ${sessionId}: ${sessionCode}`);
                        }
                    } catch (error) {
                        console.error(`❌ Error in QR session completion:`, error.message);
                    }
                    
                    // Schedule cleanup after success
                    scheduleQRCleanup(sessionId, 10000);
                }

                // Handle connection close
                if (connection === "close") {
                    const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
                    console.log(`🔴 QR Connection closed for session ${sessionId}, reason: ${reason}`);
                    
                    if (reason === DisconnectReason.loggedOut) {
                        console.log("❌ Device logged out, cleaning session");
                    }
                    
                    await cleanupQRSession(sessionId);
                }

            } catch (error) {
                console.error(`❌ QR connection update error for ${sessionId}:`, error.message);
                await cleanupQRSession(sessionId);
            }
        });

        // Save credentials
        socket.ev.on('creds.update', async () => {
            try {
                await saveCreds();
            } catch (error) {
                console.error(`❌ Error saving QR credentials:`, error.message);
            }
        });

    } catch (error) {
        clearTimeout(responseTimeout);
        console.error(`❌ QR route error for session ${sessionId}:`, error.message);
        
        await cleanupQRSession(sessionId);
        
        if (!res.headersSent) {
            res.status(500).json({ 
                error: 'Failed to generate QR code',
                message: 'Please try again later'
            });
        }
    }
});

function generateRandomId(length = 6, numberLength = 4) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    const number = Math.floor(Math.random() * Math.pow(10, numberLength));
    return `${result}${number}`;
}

// Cleanup endpoint
router.delete('/cleanup/:sessionId', async (req, res) => {
    const { sessionId } = req.params;
    
    try {
        await cleanupQRSession(sessionId);
        res.json({ message: 'QR session cleaned up successfully' });
    } catch (error) {
        console.error("❌ QR cleanup error:", error.message);
        res.status(500).json({ error: 'Failed to cleanup QR session' });
    }
});

// Health check
router.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        activeQRSessions: qrSessions.size,
        uptime: process.uptime()
    });
});

// Cleanup on process exit
process.on('SIGINT', async () => {
    console.log('🔄 Cleaning up all QR sessions...');
    const cleanupPromises = Array.from(qrSessions.keys()).map(sessionId => 
        cleanupQRSession(sessionId)
    );
    await Promise.allSettled(cleanupPromises);
});

module.exports = router;
