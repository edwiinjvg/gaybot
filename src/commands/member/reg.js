/**
 * @author Edwin
 * @description Registra a un nuevo usuario en la base de datos de la economía.
 */
const fs = require('fs');
const path = require('path');
const { getPrefix } = require("../../utils/database");
const { addXP, getUser } = require("../../utils/levelSystem.js");

const USERS_DB_PATH = path.join(BASE_DIR, '..', 'database', 'users.json');

const getUsersData = () => {
  if (!fs.existsSync(USERS_DB_PATH)) {
    fs.writeFileSync(USERS_DB_PATH, JSON.stringify({}, null, 2));
  }
  const data = fs.readFileSync(USERS_DB_PATH, 'utf-8');
  return JSON.parse(data);
};

module.exports = {
  name: "reg",
  description: "Te registras en el bot para usar los comandos de la economía.",
  commands: ["reg", "register"],
  usage: `${getPrefix()}reg <nombre> <edad>`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, fullMessage, userJid }) => {
    const args = fullMessage.split(' ');
    
    if (args.length < 3) {
      return sendReply(`_Para registrarte, usa: ${getPrefix()}reg <nombre> <edad>_`);
    }

    const name = args[1];
    const age = parseInt(args[2]);

    if (isNaN(age) || age <= 10 || age > 50) {
      return sendReply(`_Ingresa una edad válida._`);
    }

    const users = getUsersData();
    const user = getUser(users, userJid);

    // Verificamos si el usuario ya tiene un nombre registrado
    if (user.name) {
      return sendReply(`_Ya estás registrado como *${user.name}*, no puedes registrarte dos veces._`);
    }

    // Guardamos las propiedades del registro
    user.name = name;
    user.age = age;

    // --- LÓGICA DE BONIFICACIÓN CON BANDERA ---
    // La bonificación solo se da la primera vez que se registran
    let hasBonus = false;
    if (!user.hasRegistered) {
      user.money = (user.money || 0) + 2500;
      user.diamonds = (user.diamonds || 0) + 250;
      user.hasRegistered = true; // Establecemos la bandera
      hasBonus = true;
    }

    fs.writeFileSync(USERS_DB_PATH, JSON.stringify(users, null, 2));
    
    await addXP(users, userJid, sendReply);
    
    if (hasBonus) {
      return sendReply(`_¡Registro exitoso, *${name}*!_ 🎉\n_Recibiste una bonificación de *2500* monedas 🪙 y *250* diamantes._ 💎`);
    } else {
      return sendReply(`_¡Bienvenido de nuevo, *${name}*!_ 🎉\n_Te has registrado exitosamente._`);
    }
  },
};

