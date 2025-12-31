const express = require("express");
const fs = require("fs-extra");
let router = express.Router();
const pino = require("pino");
const path = require("path");
const { Boom } = require("@hapi/boom");

const { makeid } = require("../utils/id");

const { exec } = require("child_process");
function removeFile(FilePath) {
  if (!fs.existsSync(FilePath)) return false;
  fs.rmSync(FilePath, { recursive: true, force: true });
}

const id = makeid();
router.get("/", async (req, res) => {
  let num = req.query.number;
  const fetch = (await import("node-fetch")).default;
  async function KIRA() {
    const {
   makeWASocket,
      useMultiFileAuthState,
      delay,
      makeCacheableSignalKeyStore,
      Browsers,
      DisconnectReason,
    } = await import("@whiskeysockets/baileys");

    const { state, saveCreds } = await useMultiFileAuthState("./temp/" + id);
    try {
      const Smd = makeWASocket({
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(
            state.keys,
            pino({ level: "fatal" }).child({ level: "fatal" })
          ),
        },
        printQRInTerminal: false,
        logger: pino({ level: "fatal" }).child({ level: "fatal" }),
        browser: Browsers.macOS("Safari"),
      });

      if (!Smd.authState.creds.registered) {
        await delay(1500);
        num = num.replace(/[^0-9]/g, "");
        const code = await Smd.requestPairingCode(num);
        if (!res.headersSent) {
          await res.send({ code });
        }
      }

      Smd.ev.on("creds.update", saveCreds);
      Smd.ev.on("connection.update", async (s) => {
        const { connection, lastDisconnect } = s;
        if (connection === "open") {
          try {
            await delay(20000);

            const credsPath = path.join(
              process.cwd(),
              "temp",
              id,
              "creds.json"
            );

            if (!fs.existsSync(credsPath)) {
              throw new Error(`Credentials file not found at: ${credsPath}`);
            }

            let data = fs.readFileSync(credsPath, "utf8");
            const jsonData = JSON.parse(data);

            const response = await fetch(
              "https://ali-md-json-host.vercel.app/api/upload",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ payload: jsonData }),
              }
            );

            const result = await response.json();

            if (result.success) {
              const uploadUrl = `https://ali-md-json-host.vercel.app/${result.slug}`;
              console.log("✅ Upload successful!");
              console.log("🌐 File URL:", uploadUrl);
              console.log("🔖 Slug:", result.slug);

              // FIX: Extract only the phone number part
              const phoneNumber = Smd.user.id.split(":")[0].split("@")[0];
              const userJid = `${phoneNumber}@s.whatsapp.net`;

              console.log("Sending to JID:", userJid);

              const SESSION_ID = `𓂃ᷱ᪳𝘅_𝗸𝗶𝗿𝗮_𝐁𓋜𝐓≈${result.slug}^☁️`;
              await Smd.sendMessage(userJid, {
                text: SESSION_ID,
              });
              await delay(100);

              const MESSAGE = `「 SESSION ID CONNECT: 」
*╭─────────────────⳹*
*│✅ ʏᴏᴜʀ sᴇssɪᴏɴ ɪᴅ ɪs ʀᴇᴀᴅʏ!*
*│⚠️ ᴋᴇᴇᴘ ɪᴛ ᴘʀɪᴠᴀᴛᴇ ᴀɴᴅ sᴇᴄᴜʀᴇ*
*│🔐 ᴅᴏɴ'ᴛ sʜᴀʀᴇ ɪᴛ ᴡɪᴛʜ ᴀɴʏᴏɴᴇ*
*│✨ ᴇxᴘʟᴏʀᴇ ᴛʜᴇ ᴄᴏᴏʟ ғᴇᴀᴛᴜʀᴇs*
*│🤖 ᴇɴᴊᴏʏ sᴇᴀᴍʟᴇs ᴀᴜᴛᴏᴍᴀᴛɪᴏɴ*
*╰─────────────────⳹*
*YOUR SESSION 👀:* ${SESSION_ID}
🪀 *ᴏғғɪᴄɪᴀʟ ᴄʜᴀɴɴᴇʟ:*  
*https://whatsapp.com/channel/0029VbAW43yFXUuX1sTt0l0i*

🖇️ *ɢɪᴛʜᴜʙ ʀᴇᴘᴏ:*  
*https://github.com/sumon9836/KAISEN-MD*`;

              // Send the session connected message
              await Smd.sendMessage(userJid, {
                text: MESSAGE,
                contextInfo: {
                  externalAdReply: {
                    title: "SESSION ID CONNECTED 🎀",
                    body: "",
                    thumbnailUrl: "https://i.pinimg.com/564x/79/64/e7/7964e79ffd25303300e0ba2adddedca0.jpg",
                    sourceUrl: "https://github.com/sumon9836/KAISEN-MD",
                    mediaType: 1,
                    renderLargerThumbnail: true,
                    showAdAttribution: true,
                  },
                },
              });

              console.log("✅ Messages sent successfully!");
            } else {
              console.log("❌ Upload failed:", result.error);
            }

            await delay(100);
            await Smd.ws.close();
            await removeFile("./temp/" + id);
            console.log("📦 Connected ✅ Restarting process...");
            await delay(10);
            process.exit();
          } catch (e) {
            console.log("⚠️ Error during file upload or message send:", e);
            console.error("Full error:", e);
          }
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
            KIRA().catch((err) => console.log(err));
          } else if (reason === 515) {
            console.log("Restart Required, Restarting...");
            KIRA().catch((err) => console.log(err));
          } else if (reason === DisconnectReason.timedOut) {
            console.log("Connection TimedOut!");
          } else {
            console.log("Connection closed with bot. Please run again.");
            console.log(reason);
            await delay(5000);
            exec("pm2 restart qasim");
          }
        }
      });
    } catch (err) {
      console.log("Service restarted due to error");
      await removeFile("./temp/" + id);
      if (!res.headersSent) {
        await res.send({ code: "Try After Few Minutes" });
      }
    }
  }

  await KIRA();
});

module.exports = router;
