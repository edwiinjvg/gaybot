/**
 * @author Edwin
 */
const fs = require('fs');
const path = require('path');
const { getPrefix } = require("../../utils/database");
const { addXP, getUser } = require("../../utils/levelSystem.js");
const { isRegistered } = require("../../utils/auth.js");

const USERS_DB_PATH = path.join(BASE_DIR, '..', 'database', 'users.json');

// Define la ruta a la imagen que quieres enviar
const MINE_IMAGE_PATH = path.join(__dirname, 'assets', 'images', 'minar.png');

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
  name: "mine",
  description: "Mina criptomonedas y obtén una recompensa aleatoria.",
  commands: ["mine", "minar"],
  usage: "<prefix>mine", // Corregido para evitar el error de getPrefix
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, sendImage, userJid }) => {
    const users = getUsersData();

    // --- NUEVO: VERIFICACIÓN DE REGISTRO ---
    if (!isRegistered(users, userJid, sendReply)) {
        return;
    }

    const userData = getUser(users, userJid);

    const lastMine = userData.lastMine || 0;
    const now = Date.now();
    const cooldown = 1 * 60 * 60 * 1000; // 1 hora en milisegundos

    if (now - lastMine < cooldown) {
      const tiempoRestante = cooldown - (now - lastMine);
      const horas = Math.floor(tiempoRestante / (60 * 60 * 1000));
      const minutos = Math.floor((tiempoRestante % (60 * 60 * 1000)) / (60 * 1000));
      const segundos = Math.floor((tiempoRestante % (60 * 1000)) / 1000);
      return sendReply(`_¡Acabaste de minar!_ ⛏️\n_Puedes volver a minar en ${horas}h ${minutos}m ${segundos}s._ ⏰`);
    }

    const recompensa = Math.floor(Math.random() * (500 - 200 + 1)) + 200; // Recompensa aleatoria entre 200 y 500 monedas
    
    // --- USANDO BIGINT PARA CÁLCULOS EXACTOS ---
    const recompensaBig = BigInt(recompensa);
    const userMoney = BigInt(userData.money || 0);
    userData.money = (userMoney + recompensaBig).toString();
    userData.lastMine = now;

    saveUsersData(users);

    // --- LÓGICA DEL SISTEMA DE NIVELES (AÑADIDA) ---
    await addXP(users, userJid, sendReply);
    
    const caption = `_¡Minaste y encontraste *${recompensa}* monedas!_ ⛏️\n_Tu saldo actual es de *${userData.money}* monedas._ 💰`;

    if (fs.existsSync(MINE_IMAGE_PATH)) {
      await sendImage(MINE_IMAGE_PATH, caption);
    } else {
      await sendReply(caption);
    }
  },
};

