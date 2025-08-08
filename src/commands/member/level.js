/**
 * @author Edwin
 * @description Muestra el nivel, XP y rol del usuario.
 */
const fs = require('fs');
const path = require('path');
const { isRegistered } = require("../../utils/auth.js");

// Importamos las funciones necesarias de tu archivo levelSystem.js
const { getUser, getXPForNextLevel } = require("../../utils/levelSystem.js");

const USERS_DB_PATH = path.join(BASE_DIR, '..', 'database', 'users.json');

const getUsersData = () => {
    if (!fs.existsSync(USERS_DB_PATH)) {
      fs.writeFileSync(USERS_DB_PATH, JSON.stringify({}, null, 2));
    }
    const data = fs.readFileSync(USERS_DB_PATH, 'utf-8');
    return JSON.parse(data);
};

module.exports = {
  name: "level",
  description: "Muestra tu nivel, XP y progreso.",
  commands: ["level", "lvl"],
  usage: "<prefix>level",
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, userJid }) => {
    const users = getUsersData();

    // --- NUEVO: VERIFICACIÓN DE REGISTRO ---
    if (!isRegistered(users, userJid, sendReply)) {
      return;
    }

    const userData = getUser(users, userJid);

    const level = userData.level || 0;
    const xp = userData.xp || 0;
    const role = userData.role || "Hetere 😴";
    const xpNeeded = getXPForNextLevel(level);
    const xpRemaining = xpNeeded - xp;
    
    const xpPercentage = Math.min(100, Math.floor((xp / xpNeeded) * 100));
    const progressBar = "█".repeat(Math.floor(xpPercentage / 10)) + "░".repeat(10 - Math.floor(xpPercentage / 10));

    const replyMessage = `
- _Estadísticas de Nivel_ 📊
- _*Nivel:* ${level}_ 👤
- _*Rol:* ${role}_
- _*XP:* ${xp} / ${xpNeeded}._ ✨
- _*Progreso:* ${progressBar} ${xpPercentage}%_\n\n_Te falta *${xpRemaining}* XP para el nivel *${level + 1}*._ ⚡`;

    return sendReply(replyMessage);
  },
};

