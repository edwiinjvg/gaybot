/**
 * @author Gemini
 * @description Permite a los usuarios minar diamantes con un cooldown.
 */
const fs = require('fs');
const path = require('path');
const { getPrefix } = require(`${BASE_DIR}/utils/database`);
const { getUser } = require(`${BASE_DIR}/utils/levelSystem.js`);
const { isRegistered } = require(`${BASE_DIR}/utils/auth.js`);
const { getRandomNumber } = require(`${BASE_DIR}/utils`);

const USERS_DB_PATH = path.join(BASE_DIR, '..', 'database', 'users.json');

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

const COOLDOWN_HOURS = 1.5;
const MIN_DIAMONDS = 20;
const MAX_DIAMONDS = 50;

module.exports = {
  name: "mine3",
  description: `Mina diamantes para tu cuenta. Tienes que esperar ${COOLDOWN_HOURS} horas para volver a minar.`,
  commands: ["mine3", "minedi", "diamantes"],
  usage: "<prefix>mine3",
  handle: async ({ sendReply, userJid, sendWaitReact }) => {
    await sendWaitReact();

    const now = Date.now();
    const users = getUsersData();

    // --- NUEVO: VERIFICACIÓN DE REGISTRO ---
    if (!isRegistered(users, userJid, sendReply)) {
        return;
    }
    
    const user = getUser(users, userJid);

    const lastMine3 = user.lastMine3 || 0;
    const cooldownTime = COOLDOWN_HOURS * 60 * 60 * 1000;
    const timeLeft = now - lastMine3;

    if (timeLeft < cooldownTime) {
      const remainingMilliseconds = cooldownTime - timeLeft;
      const remainingHours = Math.floor(remainingMilliseconds / (1000 * 60 * 60));
      const remainingMinutes = Math.floor((remainingMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
      const remainingSeconds = Math.floor((remainingMilliseconds % (1000 * 60)) / 1000);
      return sendReply(`_¡Acabaste de minar!_\_Puedes volver a minar diamantes en ${remainingHours}h ${remainingMinutes}m y ${remainingSeconds}s._`);
    }

    const minedDiamonds = getRandomNumber(MIN_DIAMONDS, MAX_DIAMONDS);
    
    const userDiamonds = BigInt(user.diamonds || 0);
    const minedDiamondsBig = BigInt(minedDiamonds);

    user.diamonds = (userDiamonds + minedDiamondsBig).toString();
    user.lastMine3 = now;

    saveUsersData(users);

    return sendReply(`_Minaste y encontraste *${minedDiamonds} diamante(s)*._ 💎`);
  },
};

