/**
 * @author Edwin
 * @description Te permite retirar monedas de tu cuenta del banco.
 */
const fs = require('fs');
const path = require('path');
const { getPrefix } = require("../../utils/database");
const { addXP, getUser } = require("../../utils/levelSystem.js");
const { isRegistered } = require("../../utils/auth.js");

const USERS_DB_PATH = path.join(BASE_DIR, '..', 'database', 'users.json');

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
  name: "bankr",
  description: "Retira monedas del banco.",
  commands: ["bankr", "retirar"],
  usage: "<prefix>bankr <cantidad>", // Corregido para evitar el error de getPrefix
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, fullMessage, userJid }) => {
    const users = getUsersData();

    // --- NUEVO: VERIFICACIÓN DE REGISTRO ---
    if (!isRegistered(users, userJid, sendReply)) {
      return;
    }

    const userData = getUser(users, userJid);

    const args = fullMessage.split(' ');
    const cantidad = Number(args[1]);

    if (isNaN(cantidad) || cantidad <= 0) {
      return sendReply("_Ingresa una cantidad válida para retirar._");
    }

    // --- CÁLCULOS CON BIGINT PARA EVITAR PÉRDIDAS DE PRECISIÓN ---
    const userMoney = BigInt(userData.money || 0);
    const userBankMoney = BigInt(userData.bankMoney || 0);
    const cantidadBig = BigInt(cantidad);

    if (userBankMoney < cantidadBig) {
      return sendReply(`_No tienes suficientes monedas en el banco. Tu saldo en el banco es de: *${userBankMoney}* monedas._`);
    }

    userData.money = (userMoney + cantidadBig).toString();
    userData.bankMoney = (userBankMoney - cantidadBig).toString();
    saveUsersData(users);

    await addXP(users, userJid, sendReply);

    return sendReply(`_Retiraste *${cantidadBig}* monedas del banco._ 🏦\n_*Dinero en el banco:* ${userData.bankMoney} monedas._ 🪙\n_*Tu saldo actual:* ${userData.money} monedas._ 💰`);
  },
};

