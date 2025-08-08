/**
 * @author Edwin
 * @description Roba monedas y diamantes a otro usuario.
 */
const fs = require('fs');
const path = require('path');
const { addXP, getUser } = require("../../utils/levelSystem.js");
const { getPrefix } = require("../../utils/database");
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

const saveUsersData = (data) => {
    fs.writeFileSync(USERS_DB_PATH, JSON.stringify(data, null, 2));
};

module.exports = {
  name: "rob",
  description: "Roba monedas y diamantes a otro usuario.",
  commands: ["rob", "robar"],
  usage: "<prefix>rob @usuario", // Corregido para evitar el error de getPrefix
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, userJid, mentionedJidList, webMessage }) => {
    const users = getUsersData();

    // --- NUEVO: VERIFICACIÓN DE REGISTRO ---
    if (!isRegistered(users, userJid, sendReply)) {
        return;
    }

    const robUser = getUser(users, userJid);

    let targetUserJid;

    // 1. Verificamos si se mencionó a un usuario
    if (mentionedJidList && mentionedJidList.length > 0) {
        targetUserJid = mentionedJidList[0];
    }
    // 2. Si no se mencionó, verificamos si es una respuesta a un mensaje
    else if (webMessage.message?.extendedTextMessage?.contextInfo?.participant) {
        targetUserJid = webMessage.message.extendedTextMessage.contextInfo.participant;
    }
    // 3. Si no hay mención ni respuesta, devolvemos un error
    else {
        const prefix = getPrefix();
        return sendReply(`_Menciona a un usuario o responde a su mensaje para robarle._`);
    }

    const targetUser = getUser(users, targetUserJid);

    // Verificamos que no se intente robar a sí mismo
    if (targetUserJid === userJid) {
        return sendReply("_No puedes robarte a ti mismo, gilipollas._ 🧠?");
    }
    
    // Verificamos que el objetivo también esté registrado
    if (!targetUser.name) {
      return sendReply(`_*@${targetUserJid.split('@')[0]}* no está registrado, no puedes robarle._`, {
        mentions: [targetUserJid]
      });
    }

    // Cooldown de 1 hora y media
    const now = Date.now();
    const cooldown = 1.5 * 60 * 60 * 1000; // 1 hora y media en milisegundos

    if (now - robUser.lastRob < cooldown) {
      const tiempoRestante = cooldown - (now - robUser.lastRob);
      const horas = Math.floor(tiempoRestante / (60 * 60 * 1000));
      const minutos = Math.floor((tiempoRestante % (60 * 60 * 1000)) / (60 * 1000));
      const segundos = Math.floor((tiempoRestante % (60 * 1000)) / 1000);
      return sendReply(`_Acabaste de robar._\n_Puedes volver a robar en ${horas}h ${minutos}m ${segundos}s._ ⏰`);
    }

    // --- USANDO BIGINT PARA CÁLCULOS EXACTOS ---
    const targetMoneyBig = BigInt(targetUser.money || 0);
    const targetDiamondsBig = BigInt(targetUser.diamonds || 0);
    
    // Verificamos si el objetivo tiene suficientes monedas (mínimo 300) y diamantes (mínimo 30)
    if (targetMoneyBig < 300n && targetDiamondsBig < 30n) {
        robUser.lastRob = now; // El cooldown se activa aunque falle el robo
        saveUsersData(users); // Se guardan los datos del cooldown
        return sendReply(`_*@${targetUserJid.split('@')[0]}* no tiene suficientes monedas ni diamantes para robarle, es un pobretón._ 😹`, {
            mentions: [targetUserJid]
        });
    }

    // Cálculo de la cantidad robada
    const cantidadRobadaMonedas = BigInt(Math.floor(Math.random() * (500 - 200 + 1)) + 200);
    const cantidadRobadaDiamantes = BigInt(Math.floor(Math.random() * (60 - 20 + 1)) + 20);

    const robMoneyBig = BigInt(robUser.money || 0);
    const robDiamondsBig = BigInt(robUser.diamonds || 0);
    
    // Actualizamos los saldos solo si tienen suficientes recursos
    let mensajeMonedas = '';
    let mensajeDiamantes = '';

    if (targetMoneyBig >= 300n) {
      robUser.money = (robMoneyBig + cantidadRobadaMonedas).toString();
      targetUser.money = (targetMoneyBig - cantidadRobadaMonedas).toString();
      mensajeMonedas = `*${cantidadRobadaMonedas}* monedas 🪙`;
    }

    if (targetDiamondsBig >= 30n) {
      robUser.diamonds = (robDiamondsBig + cantidadRobadaDiamantes).toString();
      targetUser.diamonds = (targetDiamondsBig - cantidadRobadaDiamantes).toString();
      mensajeDiamantes = `y *${cantidadRobadaDiamantes}* diamantes 💎`;
    }
    
    robUser.lastRob = now;
    saveUsersData(users);

    await addXP(users, userJid, sendReply);
    
    const replyMessage = `- _¡Robo exitoso!_ 😈\n- _*@${userJid.split('@')[0]}* le robó a *@${targetUserJid.split('@')[0]}:*_\n- _${mensajeMonedas} ${mensajeDiamantes}._\n- _Saldo de *@${userJid.split('@')[0]}*:_\n- _*${robUser.money}* monedas y *${robUser.diamonds}* diamantes._\n- _Saldo de *@${targetUserJid.split('@')[0]}*:_\n- _*${targetUser.money}* monedas y *${targetUser.diamonds}* diamantes._`;

    await sendReply(replyMessage, {
        mentions: [userJid, targetUserJid]
    });
  },
};

