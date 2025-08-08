/**
 * @author Edwin
 * @description Transfiere monedas a otro usuario, con una comisión.
 */
const fs = require('fs');
const path = require('path');
const { getPrefix } = require("../../utils/database");
const { addXP, getUser } = require("../../utils/levelSystem.js");
const { isRegistered } = require("../../utils/auth.js");

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

module.exports = {
  name: "trans1",
  description: "Transfiere monedas a otro usuario.",
  commands: ["transfer1", "transferir1", "trans1"],
  usage: "<prefix>trans1 <cantidad> [@usuario]",
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, fullMessage, userJid, mentionedJidList, webMessage }) => {
    const users = getUsersData();
    
    // --- NUEVO: VERIFICACIÓN DE REGISTRO ---
    if (!isRegistered(users, userJid, sendReply)) {
        return;
    }
    
    const senderData = getUser(users, userJid);

    const args = fullMessage.split(' ');
    let cantidad = Number(args[1]);

    if (isNaN(cantidad) || cantidad <= 0) {
      return sendReply(`_Ingresa una cantidad válida para transferir._`);
    }

    const MIN_TRANSFER = 250;
    if (cantidad < MIN_TRANSFER) {
      return sendReply(`_La cantidad mínima para transferir es de *${MIN_TRANSFER}* monedas._`);
    }

    let targetUserJid;
    if (mentionedJidList && mentionedJidList.length > 0) {
      targetUserJid = mentionedJidList[0];
    } else if (webMessage.message?.extendedTextMessage?.contextInfo?.participant) {
      targetUserJid = webMessage.message.extendedTextMessage.contextInfo.participant;
    } else {
      return sendReply("_Menciona a un usuario o responde a su mensaje para transferirle._");
    }

    if (targetUserJid === userJid) {
      return sendReply("_No puedes transferirte monedas a ti mismo, idiota._");
    }
    
    // --- USANDO BIGINT PARA CÁLCULOS EXACTOS ---
    const cantidadBig = BigInt(cantidad);
    const comision = cantidadBig / 7n;
    const totalDescontar = cantidadBig + comision;
    const montoRecibido = cantidadBig;

    const senderMoney = BigInt(senderData.money || 0);

    if (senderMoney < totalDescontar) {
      return sendReply(`_No tienes suficientes monedas. Necesitas *${totalDescontar}* (incluyendo la comisión de *${comision}*)._\n_Tu saldo actual es de: *${senderMoney}* monedas._`);
    }

    const targetUserData = getUser(users, targetUserJid);
    const targetMoney = BigInt(targetUserData.money || 0);
    
    // Realizamos la transferencia
    senderData.money = (senderMoney - totalDescontar).toString();
    targetUserData.money = (targetMoney + montoRecibido).toString();
    
    saveUsersData(users);

    await addXP(users, userJid, sendReply);

    const replyMessage = `
- _¡Transferencia exitosa!_ ✅
- _*Enviaste:* *${montoRecibido}* monedas._ 🪙
- _*Comisión del bot:* *${comision}* monedas._ 🤖
- _*Saldo de:* *@${userJid.split('@')[0]}*: *${senderData.money}* monedas._ 💰
- _*Saldo de:* *@${targetUserJid.split('@')[0]}*: *${targetUserData.money}* monedas._ 💰`;

    await sendReply(replyMessage, {
        mentions: [userJid, targetUserJid]
    });
  },
};

