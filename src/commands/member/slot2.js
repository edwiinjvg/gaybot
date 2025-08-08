/**
 * @author Edwin
 * @description Juega a la máquina tragamonedas apostando con diamantes.
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
  name: "slot2",
  description: "Juega a la máquina tragamonedas con diamantes. Apuesta la cantidad que elijas.",
  commands: ["slot2", "casino2", "apuesta2", "apostar2"], 
  usage: "!slot2 <cantidad>", // Corregido a una cadena de texto estática
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
    
    if (apuesta < 25) {
      return sendReply(`_La apuesta mínima es de *25* diamantes._`);
    }
    
    const apuestaBig = BigInt(apuesta);
    const userDiamonds = BigInt(userData.diamonds || 0);
    
    if (userDiamonds < apuestaBig) {
        return sendReply(`_No tienes suficientes diamantes para apostar *${apuestaBig}*._ 💎\n\n_Tu saldo actual es de: ${userDiamonds} diamantes._ 💎`);
    }

    userData.diamonds = (userDiamonds - apuestaBig).toString();

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
        userData.diamonds = (BigInt(userData.diamonds) + premio).toString();
        textoRespuesta += `
*¡Ganaste!* 😺\n_Has ganado *${premio}* diamantes._ 💎`;
    } else {
        textoRespuesta += `
*¡Perdiste!* 😿\n_Has perdido *${apuestaBig}* diamantes._ 💎`;
    }

    saveUsersData(users);

    // LÓGICA DEL SISTEMA DE NIVELES - AHORA SOLO SE EJECUTA EN GRUPOS
    if (remoteJid.endsWith('@g.us')) {
      await addXP(users, userJid, sendReply);
    }

    textoRespuesta += `\n_Saldo actual: ${userData.diamonds} diamantes_ 💎`;

    await sendReply(textoRespuesta);
  },
};

