/*const express = require('express');
const fs = require('fs-extra');
let router = express.Router();
const pino = require("pino");
const { Boom } = require("@hapi/boom");
const MESSAGE = process.env.MESSAGE || `
🔥 𝐊ąìʂҽɳ-𝐌𝐃 | 𝐒𝐞𝐬𝐬𝐢𝐨𝐧 𝐂𝐨𝐧𝐧𝐞𝐜𝐭𝐞𝐝 ✅
🔥 Your Bot is Now Alive, Royal & Ready to Rock! 🔥
━━━━━━━━━━━━━━━━━━━━━━
🟢 Session pair code Successfully ✅
🔗 Connect for Instant Support & Royal Help:
📌 WhatsApp Group:
https://chat.whatsapp.com/Ja7bWhgrFkc3V67yBjchM2
━━━━━━━━━━━━━━━━━━━━━━
📦 GitHub Repo — Star It For Power Boost!
✴️ 𝐊ąìʂҽɳ-𝐌𝐃 GitHub:
🪂github.com/sumon9836/KAISEN-MD.git
━━━━━━━━━━━━━━━━━━━━━━
🚀 Deploy Your Royal Bot Now
👑 𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐝 𝐁𝐲: 𝐋𝐨𝐯𝐞𝐥𝐲-𝐁𝐨𝐲.𝐱.𝐒𝐮𝐦𝐨𝐧
🍉 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲: 𝐊ąìʂҽɳ 𝐈𝐧𝐭𝐞𝐥 𝐂𝐨𝐫𝐞™
✨ Deploy & Rule Like a True Legend
━━━━━━━━━━━━━━━━━━━━━━
📝 Royal Quote of the Bot:

> “𝐁𝐨𝐭 𝐁𝐲 𝐍𝐚𝐦𝐞, 𝐋𝐞𝐠𝐞𝐧𝐝 𝐁𝐲 𝐅𝐚𝐦𝐞”
— Royalty Runs in the Code
━━━━━━━━━━━━━━━━━━━━━━
🦾 𝐊ąìʂҽɳ_𝐌𝐃 || 𝐒𝐚𝐦𝐢𝐧_𝐒𝐮𝐦𝐨𝐧 || 𝐑𝐨𝐲𝐚𝐥𝐁𝐨𝐭
`;

const activeSessions = new Map();
const sessionTimeouts = new Map();

async function cleanupSession(sessionId, force = false) {
    const session = activeSessions.get(sessionId);
    if (!session) return;

    try {
        const timeout = sessionTimeouts.get(sessionId);
        if (timeout) {
            clearTimeout(timeout);
            sessionTimeouts.delete(sessionId);
        }

        if (session.socket && typeof session.socket.end === 'function') {
            session.socket.end();
        }

        if (session.authDir && await fs.pathExists(session.authDir)) {
            await fs.remove(session.authDir);
        }

        activeSessions.delete(sessionId);
        console.log(` Session ${sessionId} cleaned up successfully`);
    } catch (error) {
        console.error(` Error cleaning up session ${sessionId}:`, error.message);

    }
}

function scheduleCleanup(sessionId, timeout = 300000) {
    const existingTimeout = sessionTimeouts.get(sessionId);
    if (existingTimeout) {
        clearTimeout(existingTimeout);
    }

    const timeoutId = setTimeout(() => {
        cleanupSession(sessionId, true);
    }, timeout);

    sessionTimeouts.set(sessionId, timeoutId);
}

const { upload } = require('../utils/mega');
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers,
    DisconnectReason
} = require("@whiskeysockets/baileys");

// Ensure the directory is empty when the app starts
if (fs.existsSync('../auth_info_baileys')) {
    fs.emptyDirSync(__dirname + './auth_info_baileys');
}

router.get('/', async (req, res) => {
    let num = req.query.number;

    async function SUHAIL() {
        const { state, saveCreds } = await useMultiFileAuthState(`../auth_info_baileys`);
        try {
            let Smd = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                browser: Browsers.macOS("Safari"),
            });

            if (!Smd.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await Smd.requestPairingCode(num);
                if (!res.headersSent) {
                    await res.send({ code });
                }
            }

            Smd.ev.on('creds.update', saveCreds);
            Smd.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;

                if (connection === "open") {
                    try {
                        await delay(10000);
                        if (fs.existsSync('./auth_info_baileys/creds.json'));

                        const auth_path = './auth_info_baileys/';
                        let user = Smd.user.id;

                        // Define randomMegaId function to generate random IDs
                        function randomMegaId(length = 6, numberLength = 4) {
                            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                            let result = '';
                            for (let i = 0; i < length; i++) {
                                result += characters.charAt(Math.floor(Math.random() * characters.length));
                            }
                            const number = Math.floor(Math.random() * Math.pow(10, numberLength));
                            return `${result}${number}`;
                        }

                        // Upload credentials to Mega
                        const mega_url = await upload(fs.createReadStream(auth_path + 'creds.json'), `${randomMegaId()}.json`);
                        const Id_session = mega_url.replace('https://mega.nz/file/', '');

                        const Scan_Id = Id_session;

                        let msgsss = await Smd.sendMessage(user, { text: "KAISEN~" + Scan_Id });
                        await Smd.sendMessage(user, { text: MESSAGE }, { quoted: msgsss });
                        await delay(1000);
                        try { await fs.emptyDir('./auth_info_baileys'); } catch (e) {}

                    } catch (e) {
                        console.log("Error during file upload or message send: ", e);
                    }

                    await delay(100);
                    await fs.emptyDir('./auth_info_baileys');
                }

                // Handle connection closures
                if (connection === "close") {
                    let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
                    if (reason === DisconnectReason.connectionClosed) {
                        console.log("Connection closed!");
                    } else if (reason === DisconnectReason.connectionLost) {
                        console.log("Connection Lost from Server!");
                    } else if (reason === DisconnectReason.restartRequired) {
                        console.log("Restart Required, Restarting...");
                        SUHAIL().catch(err => console.log(err));
                    } else if (reason === DisconnectReason.timedOut) {
                        console.log("Connection TimedOut!");
                    } else {
                        console.log('Connection closed with bot. Please run again.');
                        console.log(reason);
                        await delay(5000);
                        exec('pm2 restart qasim');
                    }
                }
            });

        } catch (err) {
            console.log("Error in SUHAIL function: ", err);
            exec('pm2 restart qasim');
            console.log("Service restarted due to error");
            SUHAIL();
            await fs.emptyDir('./auth_info_baileys');
            if (!res.headersSent) {
                await res.send({ code: "Try After Few Minutes" });
            }
        }
    }

    await SUHAIL();
});
process.on('SIGINT', async () => {
    console.log(' Cleaning up before exit...');
    const cleanupPromises = Array.from(activeSessions.keys()).map(sessionId =>
        cleanupSession(sessionId, true)
    );
    await Promise.allSettled(cleanupPromises);
    process.exit(0);
});


module.exports = router;
*/

const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const pino = require('pino');
const { Boom } = require('@hapi/boom');
const { upload } = require('./utils/mega');

const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers,
    DisconnectReason,
} = require('@whiskeysockets/baileys');

const router = express.Router();
const AUTH_DIR = path.join(__dirname, 'auth_info_baileys');

const MESSAGE = process.env.MESSAGE || `
🔥 𝐊ąìʂҽղ-𝐌𝐃 | 𝐒𝐞𝐬𝐬𝐢𝐨𝐧 𝐂𝐨𝐧𝐧𝐞𝐜𝐭𝐞𝐝 ✅
🔥 Your Bot is Now Alive, Royal & Ready to Rock! 🔥
━━━━━━━━━━━━━━━━━━━━━━
🟢 Session pair code Successfully ✅
🔗 Connect for Instant Support & Royal Help:
📌 WhatsApp Group:
https://chat.whatsapp.com/Ja7bWhgrFkc3V67yBjchM2
━━━━━━━━━━━━━━━━━━━━━━
📦 GitHub Repo — Star It For Power Boost!
✴️ 𝐊ąìʂҽɳ-𝐌𝐃 GitHub:
🪂github.com/sumon9836/KAISEN-MD.git
━━━━━━━━━━━━━━━━━━━━━━
🚀 Deploy Your Royal Bot Now
👑 𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐝 𝐁𝐲: 𝐋𝐨𝐯𝐞𝐥𝐲-𝐁𝐨𝐲.𝐱.𝐒𝐮𝐦𝐨𝐧
🍉 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲: 𝐊ąìʂҽղ 𝐈𝐧𝐭𝐞𝐥 𝐂𝐨𝐫𝐞™
✨ Deploy & Rule Like a True Legend
━━━━━━━━━━━━━━━━━━━━━━
📝 Royal Quote of the Bot:
> “𝐁𝐨𝐭 𝐁𝐲 𝐍𝐚𝐦𝐞, 𝐋𝐞𝐠𝐞𝐧𝐝 𝐁𝐲 𝐅𝐚𝐦𝐞”
— Royalty Runs in the Code
━━━━━━━━━━━━━━━━━━━━━━
🦾 𝐊ąìʂҽղ_𝐌𝐃 || 𝐒𝐚𝐦𝐢𝐧_𝐒𝐮𝐦𝐨𝐧 || 𝐑𝐨𝐲𝐚𝐥𝐁𝐨𝐭
`;

if (fs.existsSync(AUTH_DIR)) fs.emptyDirSync(AUTH_DIR);

router.get('/', async (req, res) => {
    const number = (req.query.number || '').replace(/[^0-9]/g, '');
    if (!number) return res.status(400).json({ error: 'Please provide a valid number' });

    async function startBot() {
        const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

        try {
            const socket = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
                },
                printQRInTerminal: false,
                logger: pino({ level: 'silent' }),
                browser: Browsers.macOS('Safari'),
            });

            if (!socket.authState.creds.registered) {
                await delay(1500);
                const code = await socket.requestPairingCode(number);
                if (!res.headersSent) return res.send({ code });
            }

            socket.ev.on('creds.update', saveCreds);

            socket.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
                if (connection === 'open') {
                    try {
                        await delay(10000); // Wait for everything to sync

                        const credsFile = path.join(AUTH_DIR, 'creds.json');
                        if (!fs.existsSync(credsFile)) return;

                        function randomMegaId(length = 6, numLen = 4) {
                            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                            const id = Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
                            return id + Math.floor(Math.random() * Math.pow(10, numLen));
                        }

                        const fileName = `${randomMegaId()}.json`;
                        const url = await upload(fs.createReadStream(credsFile), fileName);
                        const sessionId = url.replace('https://mega.nz/file/', '');

                        const sent = await socket.sendMessage(socket.user.id, { text: `KAISEN~${sessionId}` });
                        await socket.sendMessage(socket.user.id, { text: MESSAGE }, { quoted: sent });

                        // Delete auth folder after 20 seconds
                        setTimeout(() => {
                            fs.emptyDir(AUTH_DIR).catch(err => console.error('Failed to delete auth dir:', err));
                        }, 20000);
                    } catch (err) {
                        console.error('Error during upload/send:', err);
                        process.exit(1);
                    }
                }

                if (connection === 'close') {
                    const reason = new Boom(lastDisconnect?.error)?.output.statusCode;
                    switch (reason) {
                        case DisconnectReason.connectionClosed:
                            console.log("Connection closed!");
                            break;
                        case DisconnectReason.connectionLost:
                            console.log("Connection lost!");
                            break;
                        case DisconnectReason.restartRequired:
                            console.log("Restart required...");
                            return startBot();
                        case DisconnectReason.timedOut:
                            console.log("Connection timed out!");
                            break;
                        default:
                            console.error("Unknown disconnect reason:", reason);
                            exec('pm2 restart qasim');
                            break;
                    }
                }
            });
        } catch (err) {
            console.error('Fatal bot error:', err);
            if (!res.headersSent) res.send({ code: 'Try after few minutes' });
            setTimeout(() => {
                fs.emptyDir(AUTH_DIR).catch(() => {});
                process.exit(1);
            }, 2000);
        }
    }

    startBot().catch(err => {
        console.error('Unhandled error:', err);
        if (!res.headersSent) res.send({ code: 'Internal server error' });
        process.exit(1);
    });
});

module.exports = router;