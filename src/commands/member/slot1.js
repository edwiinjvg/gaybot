/**
 * @author Edwin
 * @description Juega a la máquina tragamonedas apostando con monedas.
 */
const fs = require('fs');
const path = require('path');
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
  name: "slot1",
  description: "Juega a la máquina tragamonedas con monedas. Apuesta la cantidad que elijas.",
  commands: ["slot1", "casino1", "apuesta1", "apostar2"], 
  usage: "!slot1 <cantidad>", // Corregido a una cadena de texto estática
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, sendReact, fullMessage, userJid, remoteJid }) => {
    // 1. Validar si el comando se está usando en un grupo.
    if (!remoteJid.endsWith('@g.us')) {
      return sendReply("_Este comando solo puede ser usado en grupos._");
    }

    const users = getUsersData();
    
    // --- VERIFICACIÓN DE REGISTRO ---
    if (!isRegistered(users, userJid, sendReply)) {
        return;
    }
    
    const userData = getUser(users, userJid);

    const args = fullMessage.split(' ');
    let apuesta = Number(args[1]);

    if (isNaN(apuesta) || apuesta <= 0) {
      return sendReply(`_Ingresa una cantidad válida para apostar._`);
    }
    
    if (apuesta < 250) {
      return sendReply(`_La apuesta mínima es de *250* monedas._`);
    }
    
    // --- USANDO BIGINT PARA CÁLCULOS EXACTOS ---
    const apuestaBig = BigInt(apuesta);
    const userMoney = BigInt(userData.money || 0);

    if (userMoney < apuestaBig) {
        return sendReply(`_No tienes suficientes monedas para apostar *${apuestaBig}*._ 🪙\n\n_Tu saldo actual es de: ${userMoney} monedas._ 💰`);
    }

    userData.money = (userMoney - apuestaBig).toString();

    const emojis = ['🍒', '🍑', '🍆'];
    let resultado = [];
    let gana = false;

    if (Math.random() <= 0.40) {
      gana = true;
      const emojiGanador = emojis[Math.floor(Math.random() * emojis.length)];
      resultado = [emojiGanador, emojiGanador, emojiGanador];
    } else {
      while (new Set(resultado).size < 3) {
        resultado = [
          emojis[Math.floor(Math.random() * emojis.length)],
          emojis[Math.floor(Math.random() * emojis.length)],
          emojis[Math.floor(Math.random() * emojis.length)]
        ];
      }
    }

    await sendReact("🎰");

    const maquinas = resultado.join(' | ');

    let textoRespuesta = `
🎰 *「 SLOT 」* 🎰
------------------------------
     ${maquinas}
------------------------------
`;

    if (gana) {
        const premio = apuestaBig * 2n; 
        userData.money = (BigInt(userData.money) + premio).toString();
        textoRespuesta += `
*¡Ganaste!* 😺\n_Has ganado *${premio}* monedas._ 🪙`;
    } else {
        textoRespuesta += `
*¡Perdiste!* 😿\n_Has perdido *${apuestaBig}* monedas._ 🪙`;
    }

    saveUsersData(users);

    // LÓGICA DEL SISTEMA DE NIVELES - AHORA SOLO SE EJECUTA EN GRUPOS
    if (remoteJid.endsWith('@g.us')) {
      // Usamos los datos de usuarios que ya obtuvimos al inicio para evitar leer el archivo dos veces
      await addXP(users, userJid, sendReply);
    }
    
    textoRespuesta += `\n_Saldo actual: ${userData.money} monedas_ 💰`;

    await sendReply(textoRespuesta);
  },
};

