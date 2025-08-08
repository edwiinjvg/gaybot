/**
 * @author Gemini
 * @description Te marca como AFK (Away From Keyboard) o te desactiva del estado AFK.
 */
const fs = require('fs');
const path = require('path');
const { isRegistered } = require("../../utils/auth.js");

const USERS_DB_PATH = path.join(__dirname, '..', '..', '..', 'database', 'users.json');

const getUsersData = () => {
  if (!fs.existsSync(USERS_DB_PATH)) {
    fs.writeFileSync(USERS_DB_PATH, JSON.stringify({}, null, 2));
  }
  const data = fs.readFileSync(USERS_DB_PATH, 'utf-8');
  return JSON.parse(data);
};

const saveUsersData = (data) => {
  fs.writeFileSync(USERS_DB_PATH, JSON.stringify(data, null, 2));
};

module.exports = {
  name: "afk",
  description: "Te marca como AFK (Away From Keyboard) o te desactiva del estado AFK.",
  commands: ["afk", "ausente"],
  usage: "!afk <razón>",
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, fullMessage, userJid, webMessage }) => {
    const users = getUsersData();

    if (!isRegistered(users, userJid, sendReply)) {
        return;
    }
    
    let userData = users[userJid];
    
    if (userData && userData.afk && userData.afk.isAfk) {
        delete userData.afk;
        saveUsersData(users);
        return sendReply("_¡Ya no estás AFK!_\n_Puedes volver a activarlo si lo necesitas._");
    }

    const args = fullMessage.split(' ').slice(1);
    const reason = args.join(' ').trim() || 'Sin especificar';

    if (!userData) {
      users[userJid] = {};
      userData = users[userJid];
    }
    
    // --- CORRECCIÓN: GUARDAMOS EL NOMBRE DEL USUARIO ---
    userData.name = webMessage.pushName;
    userData.afk = {
      isAfk: true,
      reason: reason,
      time: Date.now(),
    };
    saveUsersData(users);

    return sendReply(`_¡Ahora estás AFK!_\n_*Razón:* ${reason}_\n_Te avisaré cuando alguien te mencione._`);
  },
};

