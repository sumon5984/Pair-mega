
const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const pino = require('pino');
const { Boom } = require('@hapi/boom');
const { upload } = require('../utils/mega');

const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers,
    DisconnectReason,
} = require('@whiskeysockets/baileys');

const router = express.Router();
const AUTH_DIR = path.join(__dirname, '..', 'auth_info_baileys');

// Clean auth folder at start
if (fs.existsSync(AUTH_DIR)) fs.emptyDirSync(AUTH_DIR);

const MESSAGE = process.env.MESSAGE || "🔥 Kaisen Bot Connected 🔥";

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
                        await delay(10000); // let all events sync

                        const credsPath = path.join(AUTH_DIR, 'creds.json');
                        if (!fs.existsSync(credsPath)) return;

                        function randomMegaId(length = 6, digits = 4) {
                            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                            const str = Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
                            return str + Math.floor(Math.random() * Math.pow(10, digits));
                        }

                        const fileName = `${randomMegaId()}.json`;
                        const url = await upload(fs.createReadStream(credsPath), fileName);
                        const sessionId = url.replace('https://mega.nz/file/', '');

                        const sent = await socket.sendMessage(socket.user.id, { text: `KAISEN~${sessionId}` });
                        await socket.sendMessage(socket.user.id, { text: MESSAGE }, { quoted: sent });

                        // Delete after 20 seconds, then exit
                        setTimeout(() => {
                            try {
                                fs.emptyDirSync(AUTH_DIR);
                                console.log('✅ Auth folder cleaned after success.');
                            } catch (err) {
                                console.error('❌ Error deleting auth folder after success:', err);
                            }
                            process.exit(1); // force PM2 restart
                        }, 20000);

                    } catch (err) {
                        console.error('❌ Error during success flow:', err);
                        fs.emptyDirSync(AUTH_DIR);
                        process.exit(1);
                    }
                }

                if (connection === 'close') {
                    const reason = new Boom(lastDisconnect?.error)?.output.statusCode;
                    console.log('🔌 Connection closed, reason code:', reason);

                    fs.emptyDirSync(AUTH_DIR);
                    process.exit(1); // always restart
                }
            });
        } catch (err) {
            console.error('💥 Fatal bot error:', err);
            fs.emptyDirSync(AUTH_DIR);
            if (!res.headersSent) res.send({ code: 'Try again later' });
            process.exit(1);
        }
    }

    startBot().catch(err => {
        console.error('❌ Uncaught error:', err);
        fs.emptyDirSync(AUTH_DIR);
        if (!res.headersSent) res.send({ code: 'Internal error' });
        process.exit(1);
    });
});

module.exports = router;