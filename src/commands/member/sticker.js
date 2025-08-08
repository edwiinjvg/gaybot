/**
 * Desarrollado por: Dev Gui
 * Implementación de metadatos hecha por: MRX
 *
 * @author Dev Gui
 */
const { getRandomName } = require(`${BASE_DIR}/utils`);
const fs = require("node:fs");
const path = require("path");
const { addStickerMetadata } = require(`${BASE_DIR}/services/sticker`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);
const { BOT_NAME } = require(`${BASE_DIR}/config`);
const { exec } = require("child_process");
const { addXP } = require("../../utils/levelSystem.js");

module.exports = {
  name: "sticker",
  description: "Crea stickers de imagen, gif o video (máximo 10 segundos).",
  commands: ["s", "sticker"],
  // Se ha corregido el 'usage' para que sea una cadena de texto estática
  usage: "!sticker (marca o responde a una imagen/gif/video)",
  handle: async ({
    isImage,
    isVideo,
    downloadImage,
    downloadVideo,
    webMessage,
    sendErrorReply,
    sendWaitReact,
    sendSuccessReact,
    sendStickerFromFile,
    userJid,
    sendReply,
    remoteJid,
  }) => {
    if (!isImage && !isVideo) {
      throw new InvalidParameterError(
        `_¡Responde a una imagen/gif/video!_`
      );
    }

    await sendWaitReact();

    const username =
      webMessage.pushName ||
      webMessage.notifyName ||
      userJid.replace(/@s.whatsapp.net/, "");

    const metadata = {
      username: username,
      botName: `${BOT_NAME}`,
    };

    const outputPath = getRandomName("webp");
    let inputPath = null;

    try {
      if (isImage) {
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            inputPath = await downloadImage(webMessage, getRandomName());
            break;
          } catch (downloadError) {
            console.error(
              `Intento ${attempt} de descarga de imagen falló:`,
              downloadError.message
            );

            if (attempt === 3) {
              throw new Error(
                `Falló al descargar imagen después de 3 intentos: ${downloadError.message}`
              );
            }

            await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
          }
        }

        await new Promise((resolve, reject) => {
          const cmd = `ffmpeg -i "${inputPath}" -vf "scale=512:512:force_original_aspect_ratio=decrease" -f webp -quality 90 "${outputPath}"`;

          exec(cmd, (error, _, stderr) => {
            if (error) {
              console.error("Error de FFmpeg:", stderr);
              reject(error);
            } else {
              resolve();
            }
          });
        });
      } else {
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            inputPath = await downloadVideo(webMessage, getRandomName());
            break;
          } catch (downloadError) {
            console.error(
              `Intento ${attempt} de descarga de video falló:`,
              downloadError.message
            );

            if (attempt === 3) {
              throw new Error(
                `Falló al descargar video después de 3 intentos. Problema de conexión con WhatsApp.`
              );
            }

            await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
          }
        }

        const maxDuration = 10;
        const seconds =
          webMessage.message?.videoMessage?.seconds ||
          webMessage.message?.extendedTextMessage?.contextInfo?.quotedMessage
            ?.videoMessage?.seconds;

        if (!seconds || seconds > maxDuration) {
          if (inputPath && fs.existsSync(inputPath)) {
            fs.unlinkSync(inputPath);
          }
          return sendErrorReply(
            `_¡El video enviado dura más de ${maxDuration} segundos! Envía un video más corto._`
          );
        }

        await new Promise((resolve, reject) => {
          const cmd = `ffmpeg -y -i "${inputPath}" -vcodec libwebp -fs 0.99M -filter_complex "[0:v] scale=512:512, fps=15, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse" -f webp "${outputPath}"`;

          exec(cmd, (error, _, stderr) => {
            if (error) {
              console.error("Error de FFmpeg:", stderr);
              reject(error);
            } else {
              resolve();
            }
          });
        });
      }

      if (inputPath && fs.existsSync(inputPath)) {
        fs.unlinkSync(inputPath);
        inputPath = null;
      }

      if (!fs.existsSync(outputPath)) {
        throw new Error("El archivo de salida no fue creado por FFmpeg");
      }

      const stickerPath = await addStickerMetadata(
        await fs.promises.readFile(outputPath),
        metadata
      );
      
      // LÓGICA DEL SISTEMA DE NIVELES - AHORA SOLO SE EJECUTA EN GRUPOS
      if (remoteJid.endsWith('@g.us')) {
        const users = JSON.parse(fs.readFileSync(path.join(BASE_DIR, '..', 'database', 'users.json'), 'utf-8'));
        await addXP(users, userJid, sendReply);
      }

      // ENVIAR EL STICKER FINAL
      await sendStickerFromFile(stickerPath);
      await sendSuccessReact();
      
      // LIMPIAR ARCHIVOS TEMPORALES
      fs.unlinkSync(outputPath);
      fs.unlinkSync(stickerPath);

    } catch (error) {
      console.error(error);
      await sendErrorReply(
        "_Ocurrió un error al crear el sticker. Inténtalo de nuevo más tarde._"
      );
    } finally {
      if (inputPath && fs.existsSync(inputPath)) {
        fs.unlinkSync(inputPath);
      }
    }
  },
};

