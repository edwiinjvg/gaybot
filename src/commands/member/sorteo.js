
/**
 * @author Edwin
 */
const fs = require('fs');
const path = require('path');
const { getPrefix } = require("../../utils/database");
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
  name: "sorteo",
  description: "Inicia un sorteo en el grupo y elige un ganador aleatorio de entre los participantes.",
  commands: ["sorteo"],
  usage: `${getPrefix()}sorteo <objeto>`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, fullMessage, remoteJid, socket, userJid }) => {
    // Verificamos si el comando se está ejecutando en un grupo
    if (!remoteJid.endsWith('@g.us')) {
      return sendReply('_Este comando solo puede ser utilizado en grupos._');
    }

    const args = fullMessage.split(' ');
    // Extraemos el objeto a sortear del mensaje
    const objeto = args.slice(1).join(' ').trim();

    if (!objeto) {
      return sendReply(`_Debes especificar el objeto a sortear._`);
    }

    // Obtenemos la metadata del grupo para conseguir la lista de participantes
    const groupMetadata = await socket.groupMetadata(remoteJid);
    const participants = groupMetadata.participants;

    // Verificamos que haya participantes en el grupo
    if (participants.length === 0) {
      return sendReply('_No hay suficientes participantes en el grupo para realizar un sorteo._');
    }

    // Seleccionamos un participante aleatorio
    const randomIndex = Math.floor(Math.random() * participants.length);
    const winnerJid = participants[randomIndex].id;
    
    // --- LÓGICA DEL SISTEMA DE NIVELES (AÑADIDA) ---
    const users = getUsersData();
    await addXP(users, userJid, sendReply);

    const replyMessage = `_🎉 ¡Sorteo de *${objeto}*! 🎉_\n\n_El ganador es... *¡@${winnerJid.split('@')[0]}!*_ 🏆`;

    await sendReply(replyMessage, {
      mentions: [winnerJid]
    });
  },
};
