
/**
 * @author Edwin
 * @description Muestra quién es tu pareja actual.
 */
const fs = require('fs');
const path = require('path');
const { getPrefix } = require("../../utils/database");
const { addXP } = require("../../utils/levelSystem.js");

const USERS_DB_PATH = path.join(BASE_DIR, '..', 'database', 'users.json');

// --- Funciones de la base de datos (AÑADIDAS Y MODIFICADAS) ---
const getUsersData = () => {
  if (!fs.existsSync(USERS_DB_PATH)) {
    fs.writeFileSync(USERS_DB_PATH, JSON.stringify({}, null, 2));
  }
  const data = fs.readFileSync(USERS_DB_PATH, 'utf-8');
  return JSON.parse(data);
};

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
  name: "mipareja",
  description: "Muestra quién es tu pareja actual.",
  commands: ["mipareja"],
  usage: `${getPrefix()}mipareja`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, userJid }) => {
    const users = getUsersData();
    const userData = getUser(users, userJid);
    
    // --- LÓGICA DEL SISTEMA DE NIVELES (AÑADIDA) ---
    await addXP(users, userJid, sendReply);
    
    if (userData.partnerJid) {
        const partnerJid = userData.partnerJid;
        const mention = `@${partnerJid.split('@')[0]}`;
        await sendReply(`_Tu pareja es ${mention}._ 💕`, {
            mentions: [partnerJid]
        });
    } else {
        await sendReply("_No tienes pareja, perdedor._ 😹");
    }
  },
};
