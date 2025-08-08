/**
 * @author Edwin
 * @description Acepta una propuesta de pareja pendiente.
 */
const fs = require('fs');
const path = require('path');
const { getPrefix } = require("../../utils/database");
const { pendingProposals } = require('./state.js'); // Importa el estado compartido
const { addXP, getUser } = require("../../utils/levelSystem.js");

const USERS_DB_PATH = path.join(BASE_DIR, '..', 'database', 'users.json');

const getUsersData = () => {
  if (!fs.existsSync(USERS_DB_PATH)) {
    fs.writeFileSync(USERS_DB_PATH, JSON.stringify({}, null, 2));
  }
  const data = fs.readFileSync(USERS_DB_PATH, 'utf-8');
  return JSON.parse(data);
};

// --- Modificamos el getUser para que coincida con la última versión ---
const getUserData = (users, userJid) => {
    const userId = userJid.split('@')[0];
    if (!users[userId]) {
        users[userId] = {
            money: 500,
            lastReward: 0,
            lastWork: 0,
            lastMine: 0,
            lastMineXP: 0,
            lastRob: 0,
            partnerJid: null,
            level: 0,
            xp: 0,
            role: "Hetere 😴",
        };
    }
    return users[userId];
};

module.exports = {
  name: "aceptar",
  description: "Acepta una propuesta de pareja.",
  commands: ["aceptar"],
  usage: `${getPrefix()}aceptar`,
  handle: async ({ sendReply, userJid, isGroup }) => {
    if (!isGroup) {
      return sendReply("_Este comando solo puede ser utilizado en grupos._");
    }
    const users = getUsersData();
    const proposal = Array.from(pendingProposals.values()).find(
        p => p.target === userJid
    );
    if (!proposal) {
        return sendReply("_No tienes ninguna propuesta de pareja pendiente._ 🥺");
    }
    
    // --- Comprobación de tiempo de 1 minuto ---
    const now = Date.now();
    if (now - proposal.timestamp > 60 * 1000) {
        pendingProposals.delete(proposal.proposer);
        return sendReply("_La propuesta de pareja ha caducado._ ⏰");
    }

    const proposerJid = proposal.proposer;
    
    const targetUser = getUserData(users, userJid);
    const proposerUser = getUserData(users, proposerJid);
    
    // Asignamos la pareja a ambos usuarios
    proposerUser.partnerJid = userJid;
    targetUser.partnerJid = proposerJid;

    // Guardamos los cambios
    fs.writeFileSync(USERS_DB_PATH, JSON.stringify(users, null, 2));
    
    // Ambos usuarios reciben XP por el compromiso
    await addXP(users, userJid, sendReply);
    await addXP(users, proposerJid, sendReply);

    pendingProposals.delete(proposerJid);
    
    const mentionProposer = `@${proposerJid.split('@')[0]}`;
    const mentionTarget = `@${userJid.split('@')[0]}`;
    const replyMessage = `_¡Felicidades!_ 🎉\n_*${mentionTarget}* aceptó la propuesta de *${mentionProposer}*. Ahora son pareja._ 💕`;
    await sendReply(replyMessage, { mentions: [proposerJid, userJid] });
  },
};

