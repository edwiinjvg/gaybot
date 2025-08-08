
/**
 * @author Edwin
 */
const fs = require("node:fs");
const path = require('path');
const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError, DangerError } = require(`${BASE_DIR}/errors`);
const {
  isAnimatedSticker,
  processStaticSticker,
  processAnimatedSticker,
  addStickerMetadata,
} = require(`${BASE_DIR}/services/sticker`);
const { getRandomName } = require(`${BASE_DIR}/utils`);
const { addXP } = require("../../utils/levelSystem.js");

// Define la ruta a la base de datos de usuarios
const USERS_DB_PATH = path.join(BASE_DIR, '..', 'database', 'users.json');

// Función para obtener los datos de los usuarios
const getUsersData = () => {
  if (!fs.existsSync(USERS_DB_PATH)) {
    fs.writeFileSync(USERS_DB_PATH, JSON.stringify({}, null, 2));
  }
  const data = fs.readFileSync(USERS_DB_PATH, 'utf-8');
  return JSON.parse(data);
};

module.exports = {
  name: "rename",
  description: "Añade nuevos metadatos al sticker.",
  commands: ["rename", "rn"],
  usage: `${PREFIX}rename paquete / autor (responde a un sticker)`,
  handle: async ({
    isSticker,
    downloadSticker,
    webMessage,
    sendWaitReact,
    sendSuccessReact,
    sendStickerFromFile,
    args,
    userJid,
    sendReply,
  }) => {
    if (!isSticker) {
      throw new InvalidParameterError("_¡Reaponde a un sticker!_");
    }

    if (args.length !== 2) {
      throw new InvalidParameterError(
        "_Proporciona el paquete y el autor en el formato paquete / autor para renombrar._"
      );
    }

    const pack = args[0];
    const author = args[1];

    if (!pack || !author) {
      throw new InvalidParameterError(
        "_Proporciona el paquete y el autor en el formato paquete / autor para renombrar._"
      );
    }

    const minLength = 2;
    const maxLength = 50;

    if (pack.length < minLength || pack.length > maxLength) {
      throw new DangerError(
        `_El paquete debe tener entre ${minLength} y ${maxLength} carácteres._`
      );
    }

    if (author.length < minLength || author.length > maxLength) {
      throw new DangerError(
        `_El autor debe tener entre ${minLength} y ${maxLength} carácteres._`
      );
    }

    let finalStickerPath = null;

    await sendWaitReact();

    const inputPath = await downloadSticker(webMessage, getRandomName("webp"));

    try {
      const metadata = {
        username: pack,
        botName: author,
      };

      const isAnimated = await isAnimatedSticker(inputPath);

      if (isAnimated) {
        finalStickerPath = await processAnimatedSticker(
          inputPath,
          metadata,
          addStickerMetadata
        );
      } else {
        finalStickerPath = await processStaticSticker(
          inputPath,
          metadata,
          addStickerMetadata
        );
      }

      // --- LÓGICA DEL SISTEMA DE NIVELES (AÑADIDA) ---
      const users = getUsersData();
      await addXP(users, userJid, sendReply);

      await sendSuccessReact();

      await sendStickerFromFile(finalStickerPath);
    } catch (error) {
      throw new Error(`Error al renombrar el sticker: ${error.message}`);
    } finally {
      if (fs.existsSync(inputPath)) {
        fs.unlinkSync(inputPath);
      }

      if (finalStickerPath && fs.existsSync(finalStickerPath)) {
        fs.unlinkSync(finalStickerPath);
      }
    }
  },
};
