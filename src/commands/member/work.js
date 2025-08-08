/**
 * @author Edwin
 * @description Te da una cantidad de dinero aleatoria por "trabajar".
 */
const fs = require('fs');
const path = require('path');
const { getPrefix } = require("../../utils/database");
// Importamos la función de verificación de registro
const { isRegistered } = require("../../utils/auth.js");
// Importamos la función addXP y getUser desde tu sistema de niveles
const { addXP, getUser } = require("../../utils/levelSystem.js");

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

// Función para guardar los datos de los usuarios
const saveUsersData = (data) => {
  fs.writeFileSync(USERS_DB_PATH, JSON.stringify(data, null, 2));
};

module.exports = {
  name: "work",
  description: "Ganas dinero por trabajar.",
  commands: ["work", "trabajar"],
  usage: "<prefix>work", // Corregido para evitar el error de getPrefix
  
  handle: async ({ sendReply, userJid, isGroup }) => {
    const users = getUsersData();
    
    // --- NUEVO: VERIFICACIÓN DE REGISTRO ---
    if (!isRegistered(users, userJid, sendReply)) {
        return;
    }
    
    const userData = getUser(users, userJid);

    const lastWork = userData.lastWork || 0;
    const now = Date.now();
    const cooldown = 30 * 60 * 1000; // 30 minutos en milisegundos

    if (now - lastWork < cooldown) {
      const tiempoRestante = cooldown - (now - lastWork);
      const minutos = Math.floor(tiempoRestante / (60 * 1000));
      const segundos = Math.floor((tiempoRestante % (60 * 1000)) / 1000);
      return sendReply(`_¡Estás cansado!_ ⚠️\n_Vuelve a trabajar en ${minutos}m ${segundos}s._ ⏰`);
    }
    
    // Rango de dinero a ganar
    const minMoney = 50;
    const maxMoney = 200;
    
    const earnedMoney = Math.floor(Math.random() * (maxMoney - minMoney + 1)) + minMoney;
    
    userData.money += earnedMoney;
    userData.lastWork = now;
    
    // GUARDAMOS LOS DATOS DESPUÉS DE ACTUALIZAR EL DINERO Y EL COOLDOWN
    saveUsersData(users);

    // LÓGICA DEL SISTEMA DE NIVELES
    await addXP(users, userJid, sendReply);
    
    const replyMessage = `_Trabajaste y ganaste *${earnedMoney}* monedas._ 🪙\n_Tu saldo actual es de *${userData.money}* monedas._ 💰`;
    
    await sendReply(replyMessage, {
      mentions: [userJid]
    });
  },
};

