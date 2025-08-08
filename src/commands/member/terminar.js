/**
 * @author Edwin
 * @description Disuelve la relación de pareja con tu compañero.
 */
const fs = require('fs');
const path = require('path');
const { getPrefix } = require("../../utils/database");
const { addXP } = require("../../utils/levelSystem.js");

const USERS_DB_PATH = path.join(BASE_DIR, '..', 'database', 'users.json');

// --- Funciones de la base de datos (mismas que en otros comandos) ---
const getUsersData = () => {
  if (!fs.existsSync(USERS_DB_PATH)) {
    fs.writeFileSync(USERS_DB_PATH, JSON.stringify({}, null, 2));
  }
  const data = fs.readFileSync(USERS_DB_PATH, 'utf-8');
  return JSON.parse(data);
};

// Función para obtener o crear un usuario (ACTUALIZADA)
const getUser = (users, userJid) => {
  const userId = userJid.split('@')[0];
  if (!users[userId]) {
    users[userId] = {
      money: 500,
      lastWork: 0,
      lastMine: 0,
      lastRob: 0,
      lastReward: 0,
      partnerJid: null,
      level: 0,
      xp: 0
    };
  }
  return users[userId];
};

module.exports = {
  name: "terminar",
  description: "Disuelve la relación de pareja.",
  commands: ["terminar", "romper"],
  usage: `${getPrefix()}terminar`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, userJid }) => {
    const users = getUsersData();
    const userData = getUser(users, userJid);

    // Verificamos si el usuario tiene pareja
    if (!userData.partnerJid) {
        return sendReply("_No tienes pareja para terminar una relación, perdedor._ 😹");
    }

    const partnerJid = userData.partnerJid;
    const partnerData = getUser(users, partnerJid);

    // Disolvemos la relación para ambos
    userData.partnerJid = null;
    partnerData.partnerJid = null;
    
    // --- LÓGICA DEL SISTEMA DE NIVELES (AÑADIDA) ---
    await addXP(users, userJid, sendReply);
    
    const mentionUser = `@${userJid.split('@')[0]}`;
    const mentionPartner = `@${partnerJid.split('@')[0]}`;

    await sendReply(`_*${mentionUser}* le terminó a *${mentionPartner}*._ 💔`, {
        mentions: [userJid, partnerJid]
    });
  },
};

