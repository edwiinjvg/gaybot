
/**
 * Mejorado por: Mkg
 *
 * @author Dev Gui
 */
const fs = require("node:fs");
const { PREFIX, ASSETS_DIR } = require(`${BASE_DIR}/config`);
const { menuMessage } = require(`${BASE_DIR}/menu`);
const path = require("path");
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
  name: "menu",
  description: "Menú de comandos",
  commands: ["menu", "help"],
  usage: `${PREFIX}menu`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ remoteJid, sendImageFromFile, sendSuccessReact, userJid, sendReply }) => {
    await sendSuccessReact();

    // --- LÓGICA DEL SISTEMA DE NIVELES (AÑADIDA) ---
    const users = getUsersData();
    await addXP(users, userJid, sendReply);

    await sendImageFromFile(
      path.join(ASSETS_DIR, "images", "takeshi-bot.png"),
      `\n\n${menuMessage(remoteJid)}`
    );
  },
};
