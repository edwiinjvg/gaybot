/**
 * @author Edwin
 */
const fs = require('fs');
const path = require('path');
const { getUser } = require("../../utils/levelSystem.js");

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
  name: "balance",
  description: "Muestra la cantidad de monedas que tienes o las de otro usuario.",
  commands: ["balance", "bal"],
  usage: "<prefix>balance [@usuario]",
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, userJid, mentionedJidList, webMessage }) => {
    const users = getUsersData();
    let targetUserJid;

    // 1. Verificamos si se mencionó a un usuario
    if (mentionedJidList && mentionedJidList.length > 0) {
        targetUserJid = mentionedJidList[0];
    } 
    // 2. Si no se mencionó, verificamos si es una respuesta a un mensaje
    else if (webMessage.message?.extendedTextMessage?.contextInfo?.participant) {
        targetUserJid = webMessage.message.extendedTextMessage.contextInfo.participant;
    }
    // 3. Si no hay mención ni respuesta, mostramos el saldo del propio usuario
    else {
        targetUserJid = userJid;
    }

    const targetUserData = getUser(users, targetUserJid);
    
    // Si el usuario es el mismo que ejecutó el comando
    if (targetUserJid === userJid) {
        await sendReply(`
- _Tu saldo actual es de:_
- _*Monedas:* ${targetUserData.money}_ 💰
- _*Diamantes:* ${targetUserData.diamonds}_ 💎
- _*XP:* ${targetUserData.xp}_ ✨`);
    } else {
        // Para mostrar el nombre del otro usuario
        const mention = `@${targetUserJid.split('@')[0]}`;
        await sendReply(`
- _El saldo de *${mention}* es de:_
- _*Monedas:* ${targetUserData.money}_ 💰
- _*Diamantes:* ${targetUserData.diamonds}_ 💎
- _*XP:* ${targetUserData.xp}_ ✨`, {
            mentions: [targetUserJid]
        });
    }
  },
}

