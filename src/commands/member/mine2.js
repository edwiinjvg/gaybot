/**
 * @author Gemini
 * @description Permite a los usuarios minar XP con un cooldown.
 */
const fs = require('fs');
const path = require('path');
const { getPrefix } = require(`${BASE_DIR}/utils/database`);
const { addXP, getUser } = require(`${BASE_DIR}/utils/levelSystem.js`);
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

const COOLDOWN_HOURS = 1;
const MIN_XP = 100;
const MAX_XP = 300;

module.exports = {
  name: "minexp",
  description: `Mina XP para tu cuenta. Tienes que esperar ${COOLDOWN_HOURS} hora para volver a minar.`,
  commands: ["minexp", "mine2", "minar2"],
  usage: "<prefix>minexp",
  handle: async ({ sendReply, userJid, sendWaitReact }) => {
    await sendWaitReact();

    const now = Date.now();
    const users = getUsersData();
    
    // --- NUEVO: VERIFICACIÓN DE REGISTRO ---
    if (!isRegistered(users, userJid, sendReply)) {
        return;
    }
    
    const user = getUser(users, userJid);

    const lastMineXP = user.lastMineXP || 0;
    // --- MODIFICADO: Cooldown a 1 hora ---
    const cooldownTime = COOLDOWN_HOURS * 60 * 60 * 1000;
    const timeLeft = now - lastMineXP;

    if (timeLeft < cooldownTime) {
      const remainingMilliseconds = cooldownTime - timeLeft;
      const remainingHours = Math.floor(remainingMilliseconds / (1000 * 60 * 60));
      const remainingMinutes = Math.floor((remainingMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
      const remainingSeconds = Math.floor((remainingMilliseconds % (1000 * 60)) / 1000);
      return sendReply(`_¡Acabaste de minar!_ ⛏️\n_Puedes volver a minar *XP* en ${remainingHours}h ${remainingMinutes}m y ${remainingSeconds}s._ ⏰`);
    }

    const minedXP = getRandomNumber(MIN_XP, MAX_XP);
    
    await addXP(users, userJid, sendReply, minedXP);
    
    user.lastMineXP = now;

    // --- CORRECCIÓN: Usamos la función para guardar los datos ---
    saveUsersData(users);

    return sendReply(`_Minaste y encontraste *${minedXP} XP*._ ✨⛏️`);
  },
};

