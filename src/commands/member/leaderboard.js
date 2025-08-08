/**
 * @author Gemini
 * @description Muestra el top 5 de usuarios por monedas y diamantes.
 */
const fs = require('fs');
const path = require('path');
const { getUser } = require("../../utils/levelSystem.js");
const { getPrefix } = require("../../utils/database");

const USERS_DB_PATH = path.join(BASE_DIR, '..', 'database', 'users.json');

const getUsersData = () => {
  if (!fs.existsSync(USERS_DB_PATH)) {
    fs.writeFileSync(USERS_DB_PATH, JSON.stringify({}, null, 2));
  }
  const data = fs.readFileSync(USERS_DB_PATH, 'utf-8');
  return JSON.parse(data);
};

module.exports = {
  name: "leaderboard",
  description: "Muestra el top 5 de usuarios con más monedas y diamantes.",
  commands: ["lb", "leaderboard"],
  usage: `${getPrefix()}ld`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, userJid }) => {
    const usersData = getUsersData();
    const allUsers = Object.keys(usersData).map(userId => {
      const userData = usersData[userId];
      return {
        jid: `${userId}@s.whatsapp.net`,
        money: BigInt(userData.money || 0),
        diamonds: BigInt(userData.diamonds || 0),
        name: userData.name || `@${userId}`
      };
    });

    // Filtramos los usuarios con 0 monedas y 0 diamantes
    const filteredUsers = allUsers.filter(user => user.money > 0n || user.diamonds > 0n);

    // Clasificación por monedas
    const moneyLeaderboard = [...filteredUsers].sort((a, b) => {
      if (a.money > b.money) return -1;
      if (a.money < b.money) return 1;
      return 0;
    }).slice(0, 5);

    // Clasificación por diamantes
    const diamondLeaderboard = [...filteredUsers].sort((a, b) => {
      if (a.diamonds > b.diamonds) return -1;
      if (a.diamonds < b.diamonds) return 1;
      return 0;
    }).slice(0, 5);

    let reply = `- _*🏆 Líderes del bot 🏆*_\n\n`;

    // Mensaje para el Top de Monedas
    reply += `- _*Top 5 - Monedas:*_ 🪙\n`;
    const moneyMentions = [];
    moneyLeaderboard.forEach((user, index) => {
      moneyMentions.push(user.jid);
      reply += `_*${index + 1}.* @${user.jid.split('@')[0]} - *${user.money}*_.\n`;
    });

    reply += `\n- _*Top 5 - Diamantes:*_ 💎\n`;
    const diamondMentions = [];
    diamondLeaderboard.forEach((user, index) => {
      diamondMentions.push(user.jid);
      reply += `_*${index + 1}.* @${user.jid.split('@')[0]} - *${user.diamonds}*_.\n`;
    });

    // Enviamos el mensaje con todas las menciones
    await sendReply(reply, {
        mentions: [...moneyMentions, ...diamondMentions]
    });
  },
};
