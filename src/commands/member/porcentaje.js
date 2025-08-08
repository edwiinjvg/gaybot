
/**
 * @author Edwin
 * @description Mide el nivel de algo con un porcentaje aleatorio. Incluye comandos como 'tonto' y 'tonta'.
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

// Función para obtener o crear un usuario (la lógica se mueve a addXP)
const getUser = (users, userJid) => {
  const userId = userJid.split('@')[0];
  if (!users[userId]) {
    users[userId] = {
      money: 500, 
      lastReward: 0,
      lastWork: 0,
      lastMine: 0,
      lastRob: 0,
      partnerJid: null,
      level: 0,
      xp: 0,
    };
  }
  return users[userId];
};

module.exports = {
  name: "porcentaje",
  description: "Mide el nivel de algo con un porcentaje aleatorio. Incluye comandos como 'tonto' y 'tonta'.",
  commands: ["gay", "lesbiana", "imbecil", "gilipollas"], // Puedes añadir más comandos aquí
  usage: `${getPrefix()}[comando] [@usuario]`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, userJid, mentionedJidList, webMessage, commandName }) => {
    let targetUserJid;

    // Lógica para determinar el usuario objetivo (mención, respuesta o tú mismo)
    if (mentionedJidList && mentionedJidList.length > 0) {
        targetUserJid = mentionedJidList[0];
    } else if (webMessage.message?.extendedTextMessage?.contextInfo?.participant) {
        targetUserJid = webMessage.message.extendedTextMessage.contextInfo.participant;
    } else {
        targetUserJid = userJid;
    }

    // Genera un número aleatorio entre 1 y 1000
    const porcentaje = Math.floor(Math.random() * 1000) + 1;

    let replyMessage;
    const mention = `@${targetUserJid.split('@')[0]}`;

    // Lógica para generar el mensaje basado en el comando
    switch (commandName) {
        case "gay":
            if (targetUserJid === userJid) {
                replyMessage = `*_¡Eres ${porcentaje}% homosexual!_* 🏳️‍🌈`;
            } else {
                replyMessage = `*_${mention} es ${porcentaje}% homosexual._* 🏳️‍🌈`;
            }
            break;
        case "lesbiana":
            if (targetUserJid === userJid) {
                replyMessage = `*_¡Eres ${porcentaje}% lesbiana!_* 🏳️‍🌈`;
            } else {
                replyMessage = `*_${mention} es  ${porcentaje}% lesbiana._* 🏳️‍🌈`;
            }
            break;
        case "imbecil":
            if (targetUserJid === userJid) {
                replyMessage = `*_¡Eres ${porcentaje}% imbécil!_* 😹`;
            } else {
                replyMessage = `*_${mention} es ${porcentaje}% imbécil._ 😹*`;
            }
            break;
        case "gilipollas":
            if (targetUserJid === userJid) {
                replyMessage = `*_¡Eres ${porcentaje}% gilipollas!_* 👺 `;
            } else {
                replyMessage = `*_${mention} es ${porcentaje}% gilipollas._* 👺`;
            }
            break;
        default:
            // Mensaje por defecto si el comando no se reconoce
            replyMessage = `*_¡El nivel de ${commandName} de ${mention} es ${porcentaje}%!_*`;
            break;
    }
    
    // --- LÓGICA DEL SISTEMA DE NIVELES (AÑADIDA) ---
    const users = getUsersData();
    await addXP(users, userJid, sendReply);

    await sendReply(replyMessage, {
        mentions: [targetUserJid]
    });
  },
};
