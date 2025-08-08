
/**
 * Desarrollado por: Mkg
 * Refactorizado por: Dev Gui
 *
 * @author Dev Gui
 */
const fs = require("node:fs");
const path = require('path');
const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError, WarningError } = require(`${BASE_DIR}/errors`);
const { onlyNumbers } = require(`${BASE_DIR}/utils`);
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
  name: "get-lid",
  description: "Devuelve el LID del contacto mencionado.",
  commands: ["getlid"],
  usage: `${PREFIX}get-lid @etiqueta o +telefono`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ args, sendSuccessReply, socket, userJid, sendReply }) => {
    if (!args.length) {
      throw new InvalidParameterError(
        "_¡Debes mencionar a alguien o introducir un contacto!_"
      );
    }

    const [result] = await socket.onWhatsApp(onlyNumbers(args[0]));

    if (!result) {
      throw new WarningError(
        "_¡El número introducido no está registrado en WhatsApp!_"
      );
    }

    const jid = result?.jid;
    const lid = result?.lid;
    
    // --- LÓGICA DEL SISTEMA DE NIVELES (AÑADIDA) ---
    const users = getUsersData();
    await addXP(users, userJid, sendReply);

    await sendSuccessReply(`JID: ${jid}${lid ? `\nLID: ${lid}` : ""}`);
  },
};
