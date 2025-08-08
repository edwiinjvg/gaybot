/**
 * @author Edwin
 * @description Rechaza una propuesta de pareja pendiente.
 */
const fs = require('fs');
const path = require('path');
const { getPrefix } = require("../../utils/database");
const { pendingProposals } = require('./state.js'); // Importa el estado compartido
// --- Usamos las funciones del sistema de niveles que ya habíamos corregido ---
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
  name: "rechazar",
  description: "Rechaza una propuesta de pareja.",
  commands: ["rechazar"],
  usage: `${getPrefix()}rechazar`,
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
    pendingProposals.delete(proposerJid);
    
    // --- LÓGICA DEL SISTEMA DE NIVELES ---
    await addXP(users, userJid, sendReply);

    const mentionProposer = `@${proposerJid.split('@')[0]}`;
    const mentionTarget = `@${userJid.split('@')[0]}`;
    const replyMessage = `_*${mentionTarget}* rechazó la propuesta de *${mentionProposer}*._ 💔`;
    
    await sendReply(replyMessage, { mentions: [proposerJid, userJid] });
  },
};

