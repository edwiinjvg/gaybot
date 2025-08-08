/**
 * @author Edwin
 */
const fs = require('fs');
const path = require('path');
const { isBotOwner } = require("../../middlewares");
const { getPrefix } = require("../../utils/database");

const USERS_DB_PATH = path.join(BASE_DIR, '..', 'database', 'users.json');

// Función para obtener los datos de los usuarios
const getUsersData = () => {
  if (!fs.existsSync(USERS_DB_PATH)) {
    fs.writeFileSync(USERS_DB_PATH, JSON.stringify({}, null, 2));
  }
  const data = fs.readFileSync(USERS_DB_PATH, 'utf-8');
  return JSON.parse(data);
};

// Función para guardar los datos de los usuarios
const saveUsersData = (data) => {
  fs.writeFileSync(USERS_DB_PATH, JSON.stringify(data, null, 2));
};

// Función para obtener o crear un usuario con un saldo inicial (MODIFICADA)
const getUser = (users, userJid) => {
  const userId = userJid.split('@')[0];
  
  if (!users[userId]) {
    users[userId] = {
      money: 500,
      lastWork: 0,
      lastMine: 0,
      lastRob: 0,
      lastReward: 0,
      partnerJid: null
    };
  }
  return users[userId];
};

module.exports = {
  name: "removemoney",
  description: "Quita monedas a tu cuenta o a la de un usuario mencionado. Solo para el propietario del bot.",
  commands: ["removemoney", "rm"],
  usage: `${getPrefix()}removemoney <cantidad> [@usuario]`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, fullMessage, userJid, mentionedJidList, webMessage }) => {
    // Verificamos si el usuario es el propietario del bot
    if (!isBotOwner({ userJid })) {
      return sendReply("_Este comando solo puede ser utilizado por el propietario del bot._");
    }

    const args = fullMessage.split(' ');
    let cantidad = Number(args[1]);

    if (isNaN(cantidad) || cantidad <= 0) {
      return sendReply(`_Ingresa una cantidad válida para quitar._`);
    }

    const users = getUsersData();
    let targetUserJid;

    // --- Lógica para determinar el usuario objetivo (MODIFICADA) ---
    // 1. Verificamos si es una respuesta a un mensaje
    if (webMessage.message?.extendedTextMessage?.contextInfo?.participant) {
        targetUserJid = webMessage.message.extendedTextMessage.contextInfo.participant;
    }
    // 2. Si no es una respuesta, verificamos si se mencionó a un usuario
    else if (mentionedJidList && mentionedJidList.length > 0) {
        targetUserJid = mentionedJidList[0];
    } 
    // 3. Si no se menciona ni se responde, el objetivo eres tú mismo
    else {
        targetUserJid = userJid;
    }

    const targetUserData = getUser(users, targetUserJid);

    // Verificamos si el usuario tiene suficientes monedas
    if (targetUserData.money < cantidad) {
      const mention = `@${targetUserJid.split('@')[0]}`;
      return sendReply(`_El usuario ${mention} no tiene suficientes monedas para quitarle *${cantidad}*._ 🪙\n_Su saldo actual es de: *${targetUserData.money}*._ 💰`, {
          mentions: [targetUserJid]
      });
    }

    targetUserData.money -= cantidad;
    saveUsersData(users);

    if (targetUserJid === userJid) {
        return sendReply(`_Removiste *${cantidad}* monedas de tu cuenta._ 🪙\n_Tu nuevo saldo es de: *${targetUserData.money}* monedas._ 💰`);
    } else {
        const mention = `@${targetUserJid.split('@')[0]}`;
        await sendReply(`_Removiste *${cantidad}* monedas de la cuenta de ${mention}._ 🪙\n_El nuevo saldo de ${mention} es de: *${targetUserData.money}* monedas._ 💰`, {
            mentions: [targetUserJid]
        });
    }
  },
};

