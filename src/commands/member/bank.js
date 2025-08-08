/**
 * @author Edwin
 * @description Te permite ver el dinero que tienes guardado en el banco.
 */
const fs = require('fs');
const path = require('path');
const { getPrefix } = require("../../utils/database");
const { getUser } = require("../../utils/levelSystem.js");
const { isRegistered } = require("../../utils/auth.js");

const USERS_DB_PATH = path.join(BASE_DIR, '..', 'database', 'users.json');

const getUsersData = () => {
  if (!fs.existsSync(USERS_DB_PATH)) {
    fs.writeFileSync(USERS_DB_PATH, JSON.stringify({}, null, 2));
  }
  const data = fs.readFileSync(USERS_DB_PATH, 'utf-8');
  return JSON.parse(data);
};

module.exports = {
  name: "bank",
  description: "Revisa tu saldo en el banco.",
  commands: ["bank", "banco"],
  usage: "<prefix>bank", // Corregido para evitar el error de getPrefix
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
    
    // --- CÁLCULOS CON BIGINT PARA EVITAR PÉRDIDAS DE PRECISIÓN ---
    const userMoney = BigInt(userData.money || 0);
    const userBankMoney = BigInt(userData.bankMoney || 0);
    const total = userMoney + userBankMoney;
    const prefix = getPrefix();

    await sendReply(`_Saldo en el banco: *${userBankMoney}* monedas._ 🏦\n_Dinero total: *${total}* monedas._ 🪙`);
    await sendReply(`_Usa *${prefix}guardar <cantidad>* para guardar monedas._ 🪙\n_Usa *${prefix}retirar <cantidad>* para retirar monedas._ 💸`);
  },
};

