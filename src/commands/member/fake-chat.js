
/**
 * Desarrollado por: Mkg
 * Refactorizado por: Dev Gui
 *
 * @author Dev Gui
 */
const fs = require("node:fs");
const path = require('path');
const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);
const { toUserJid } = require(`${BASE_DIR}/utils`);
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
  name: "fake-chat",
  description: "Crea una cita falsa mencionando a un usuario",
  commands: ["fakechat", "fq", "fakequote", "fquote", "fk"],
  usage: `${PREFIX}fake-chat @usuario / texto citado / mensaje que se enviará`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ remoteJid, socket, args, userJid, sendReply }) => {
    if (args.length !== 3) {
      throw new InvalidParameterError(
        `_Ejemplo de uso correcto: ${PREFIX}fakechat @usuario / texto citado / mensaje que se enviará_`
      );
    }

    const quotedText = args[1];
    const responseText = args[2];

    const mentionedJid = toUserJid(args[0]);

    if (quotedText.length < 2) {
      throw new InvalidParameterError(
        "_El texto citado debe tener al menos 2 caracteres._"
      );
    }

    if (responseText.length < 2) {
      throw new InvalidParameterError(
        "_El mensaje de respuesta debe tener al menos 2 caracteres._"
      );
    }

    const fakeQuoted = {
      key: {
        fromMe: false,
        participant: mentionedJid,
        remoteJid,
      },
      message: {
        extendedTextMessage: {
          text: quotedText,
          contextInfo: {
            mentionedJid: [mentionedJid],
          },
        },
      },
    };

    // --- LÓGICA DEL SISTEMA DE NIVELES (AÑADIDA) ---
    const users = getUsersData();
    await addXP(users, userJid, sendReply);

    await socket.sendMessage(
      remoteJid,
      { text: responseText },
      { quoted: fakeQuoted }
    );
  },
};
