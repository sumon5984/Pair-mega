/*

const { exec } = require("child_process");
const { upload } = require('../utils/mega');
const express = require('express');
const router = express.Router();
const pino = require("pino");
const { toBuffer } = require("qrcode");
const path = require('path');
const fs = require("fs-extra");
const { Boom } = require("@hapi/boom");

const MESSAGE = process.env.MESSAGE || `
🔥 𝐊ąìʂҽղ-𝐌𝐃 | 𝐒𝐞𝐬𝐬𝐢𝐨𝐧 𝐂𝐨𝐧𝐧𝐞𝐜𝐭𝐞𝐝 ✅
🔥 Your Bot is Now Alive, Royal & Ready to Rock! 🔥
━━━━━━━━━━━━━━━━━━━━━━
🟢 Session qr code Successfully ✅
📌 WhatsApp Group: https://chat.whatsapp.com/Ja7bWhgrFkc3V67yBjchM2
📦 GitHub: github.com/sumon9836/KAISEN-MD.git
👑 Dev: Lovely-Boy.x.Sumon
🧠 Powered By: Kąìʂҽղ Intel Core™
━━━━━━━━━━━━━━━━━━━━━━
📝 “𝐁𝐨𝐭 𝐁𝐲 𝐍𝐚𝐦𝐞, 𝐋𝐞𝐠𝐞𝐧𝐝 𝐁𝐲 𝐅𝐚𝐦𝐞”
`;

const AUTH_DIR = path.join(__dirname,  '..', 'auth_info_baileys');
if (fs.existsSync(AUTH_DIR)) fs.emptyDirSync(AUTH_DIR);

router.get('/', async (req, res) => {
    const { default: makeWASocket, useMultiFileAuthState, delay, Browsers, DisconnectReason } = require("@whiskeysockets/baileys");

    async function startBot() {
        const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
        try {
            const sock = makeWASocket({
                logger: pino({ level: "silent" }),
                printQRInTerminal: false,
                browser: Browsers.macOS("Desktop"),
                auth: state,
            });

            sock.ev.on('creds.update', saveCreds);

            sock.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {
                if (qr && !res.headersSent) {
                    try {
                        const qrBuffer = await toBuffer(qr);
                        res.setHeader('Content-Type', 'image/png');
                        return res.end(qrBuffer);
                    } catch (err) {
                        console.error('❌ Error generating QR:', err);
                        res.status(500).send('QR Generation Failed');
                        return;
                    }
                }

                if (connection === "open") {
                    try {
                        await delay(3000);
                        const user = sock.user.id;

                        const randomId = () => {
                            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                            const text = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
                            const num = Math.floor(Math.random() * 10000);
                            return `${text}${num}`;
                        };

                        const credsFile = path.join(AUTH_DIR, 'creds.json');
                        const url = await upload(fs.createReadStream(credsFile), `${randomId()}.json`);
                        const sessionId = url.replace('https://mega.nz/file/', '');

                        const sent = await sock.sendMessage(user, { text: `KAISEN~${sessionId}` });
                        await sock.sendMessage(user, { text: MESSAGE }, { quoted: sent });

                        // Delete creds and restart after 20s
                        setTimeout(() => {
                            try {
                                fs.emptyDirSync(AUTH_DIR);
                                console.log("✅ Auth folder cleaned after session.");
                            } catch (e) {
                                console.error("❌ Failed to clean auth folder:", e);
                            }
                            process.exit(1);
                        }, 20000);

                    } catch (err) {
                        console.error("❌ Error in success handler:", err);
                        fs.emptyDirSync(AUTH_DIR);
                        process.exit(1);
                    }
                }

                if (connection === "close") {
                    const reason = new Boom(lastDisconnect?.error)?.output.statusCode;
                    fs.emptyDirSync(AUTH_DIR);

                    switch (reason) {
                        case DisconnectReason.restartRequired:
                            console.log("🔁 Restart required...");
                            return startBot();
                        case DisconnectReason.loggedOut:
                            console.log("📴 Logged out. Please rescan.");
                            process.exit(1);
                        default:
                            console.log("❌ Connection closed:", reason);
                            exec('pm2 restart qasim');
                            process.exit(1);
                    }
                }
            });

        } catch (err) {
            console.error("❌ Critical bot error:", err);
            fs.emptyDirSync(AUTH_DIR);
            if (!res.headersSent) res.send({ code: "Internal error. Try again." });
            process.exit(1);
        }
    }

    return await startBot();
});

module.exports = router;

*/

const { exec } = require("child_process");
const { upload } = require('../utils/mega');
const express = require('express');
let router = express.Router()
const pino = require("pino");
let { toBuffer } = require("qrcode");
const path = require('path');
const fs = require("fs-extra");
const { Boom } = require("@hapi/boom");

const MESSAGE = process.env.MESSAGE ||  `
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
🪂
github.com/sumon9836/KAISEN-MD.git
━━━━━━━━━━━━━━━━━━━━━━
🚀 Deploy Your Royal Bot Now
👑 𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐝 𝐁𝐲: 𝐋𝐨𝐯𝐞𝐥𝐲-𝐁𝐨𝐲.𝐱.𝐒𝐮𝐦𝐨𝐧
🧠 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲: 𝐊ąìʂҽղ 𝐈𝐧𝐭𝐞𝐥 𝐂𝐨𝐫𝐞™
✨ Deploy & Rule Like a True Legend
━━━━━━━━━━━━━━━━━━━━━━
📝 Royal Quote of the Bot:

> “𝐁𝐨𝐭 𝐁𝐲 𝐍𝐚𝐦𝐞, 𝐋𝐞𝐠𝐞𝐧𝐝 𝐁𝐲 𝐅𝐚𝐦𝐞”
— Royalty Runs in the Code
━━━━━━━━━━━━━━━━━━━━━━
🦾 𝐊ąìʂҽղ_𝐌𝐃 || 𝐒𝐚𝐦𝐢𝐧_𝐒𝐮𝐦𝐨𝐧 || 𝐑𝐨𝐲𝐚𝐥𝐁𝐨𝐭
`;

if (fs.existsSync('./auth_info_baileys')) {
    fs.emptyDirSync(__dirname + '/auth_info_baileys');
}

router.get('/', async (req, res) => {
    const { default: makeWASocket, useMultiFileAuthState, delay, Browsers, DisconnectReason } = require("@whiskeysockets/baileys");

    async function SUHAIL() {
        const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/auth_info_baileys')
        try {
            let Smd = makeWASocket({
                printQRInTerminal: false,
                logger: pino({ level: "silent" }),
                browser: Browsers.macOS("Desktop"),
                auth: state
            });

            Smd.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect, qr } = s;

                if (qr) {
                    if (!res.headersSent) {
                        res.setHeader('Content-Type', 'image/png');
                        try {
                            const qrBuffer = await toBuffer(qr);
                            res.end(qrBuffer);
                            return;
                        } catch (error) {
                            console.error("Error generating QR Code buffer:", error);
                            return;
                        }
                    }
                }

                if (connection === "open") {
                    await delay(3000);
                    let user = Smd.user.id;

                    function randomMegaId(length = 6, numberLength = 4) {
                        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                        let result = '';
                        for (let i = 0; i < length; i++) {
                            result += characters.charAt(Math.floor(Math.random() * characters.length));
                        }
                        const number = Math.floor(Math.random() * Math.pow(10, numberLength));
                        return `${result}${number}`;
                    }

                    const auth_path = './auth_info_baileys/';
                    const mega_url = await upload(fs.createReadStream(auth_path + 'creds.json'), `${randomMegaId()}.json`);
                    const string_session = mega_url.replace('https://mega.nz/file/', '');
                    const Scan_Id = string_session;

                    let msgsss = await Smd.sendMessage(user, { text: "KAISEN~" + Scan_Id });
                    await Smd.sendMessage(user, { text: MESSAGE }, { quoted: msgsss });
                
                    await delay(1000);
                    try { 
                        await fs.emptyDirSync(__dirname + '/auth_info_baileys'); 
                    } catch(e) {}
                }

                Smd.ev.on('creds.update', saveCreds)

                if (connection === "close") {
                    let reason = new Boom(lastDisconnect?.error)?.output.statusCode
                    if (reason === DisconnectReason.restartRequired) {
                        console.log("Restart Required, Restarting...")
                        SUHAIL().catch(err => console.log(err));
                    } else if (reason === DisconnectReason.loggedOut) {
                        console.log("Device Logged Out, Please Delete Session and Scan Again.");
                        process.exit();
                    } else {
                        console.log('Connection closed:', reason);
                        exec('pm2 restart qasim');
                        process.exit(0);
                    }
                }
            });
        } catch (err) {
            console.log(err);
            exec('pm2 restart qasim');
            await fs.emptyDirSync(__dirname + '/auth_info_baileys');
        }
    }
    return await SUHAIL();
});

module.exports = router;
