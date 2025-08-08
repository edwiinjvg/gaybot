
/**
 * Desarrollado por: Mkg
 * Refactorizado por: Dev Gui
 *
 * @author Dev Gui
 */
const fs = require("node:fs");
const path = require('path');
const { upload } = require(`${BASE_DIR}/services/upload`);
const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);
const { getRandomNumber } = require(`${BASE_DIR}/utils`);
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
  name: "generate-link",
  description: "Sube imágenes",
  commands: ["generate-link", "up", "upload"],
  usage: `${PREFIX}generate-link (etiqueta la imagen) o ${PREFIX}generar-link (responde a la imagen)`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({
    isImage,
    downloadImage,
    sendSuccessReact,
    sendWaitReact,
    sendReply,
    webMessage,
    userJid,
  }) => {
    if (!isImage) {
      throw new InvalidParameterError(
        "_¡Debes responder a una imagen!_"
      );
    }

    await sendWaitReact();

    const fileName = getRandomNumber(10_000, 99_999).toString();
    const filePath = await downloadImage(webMessage, fileName);

    const buffer = fs.readFileSync(filePath);

    const link = await upload(buffer, `${fileName}.png`);

    if (!link) {
      throw new Error(
        "_Error al subir la imagen, inténtalo de nuevo más tarde._"
      );
    }

    await sendSuccessReact();
    
    // --- LÓGICA DEL SISTEMA DE NIVELES (AÑADIDA) ---
    const users = getUsersData();
    await addXP(users, userJid, sendReply);

    await sendReply(`*_¡Aquí está el enlace de tu imagen!_*\n\n- *${link}*`);

    fs.unlinkSync(filePath);
  },
};
