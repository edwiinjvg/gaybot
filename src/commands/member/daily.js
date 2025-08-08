/**
 * @author Edwin
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

const saveUsersData = (data) => {
    fs.writeFileSync(USERS_DB_PATH, JSON.stringify(data, null, 2));
};

module.exports = {
  name: "daily",
  description: "Obtén una recompensa diaria de 500 monedas.",
  commands: ["daily", "recompensa"],
  usage: "<prefix>daily", // Corregido para evitar el error de getPrefix
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, userJid }) => {
    const users = getUsersData();

    // --- NUEVO: VERIFICACIÓN DE REGISTRO ---
    if (!isRegistered(users, userJid, sendReply)) {
      return;
    }

    const userData = getUser(users, userJid);

    const lastReward = userData.lastReward || 0;
    const now = Date.now();
    const cooldown = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

    if (now - lastReward < cooldown) {
      const tiempoRestante = cooldown - (now - lastReward);
      const horas = Math.floor(tiempoRestante / (60 * 60 * 1000));
      const minutos = Math.floor((tiempoRestante % (60 * 60 * 1000)) / (60 * 1000));
      const segundos = Math.floor((tiempoRestante % (60 * 1000)) / 1000);
      return sendReply(`_Ya reclamaste tu recompensa diaria._ ⏰\n_Puedes volver a reclamarla en ${horas}h ${minutos}m ${segundos}s._`);
    }

    // --- CÓDIGO EDITADO: USANDO BIGINT PARA CÁLCULOS EXACTOS ---
    const recompensa = BigInt(Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000);
    const xpRecompensa = BigInt(Math.floor(Math.random() * (500 - 200 + 1)) + 300);
    const diamantesRecompensa = BigInt(Math.floor(Math.random() * (100 - 50 + 1)) + 50);

    const userMoney = BigInt(userData.money || 0);
    const userDiamonds = BigInt(userData.diamonds || 0);

    userData.money = (userMoney + recompensa).toString();
    userData.diamonds = (userDiamonds + diamantesRecompensa).toString();
    userData.lastReward = now;
    
    // --- LÓGICA DEL SISTEMA DE NIVELES (CORREGIDA) ---
    // Llamamos a addXP para que maneje la subida de nivel y los mensajes
    await addXP(users, userJid, sendReply, Number(xpRecompensa));
    
    // --- CÓDIGO AÑADIDO: GUARDAR LOS DATOS ACTUALIZADOS ---
    saveUsersData(users);

    return sendReply(`
- _Reclamaste tu recompensa diaria, obtuviste:_
- _*${recompensa}* monedas._ 🪙
- _*${xpRecompensa}* XP._ ✨
- _*${diamantesRecompensa}* diamantes._ 💎`);
  },
};

