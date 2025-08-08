/**
 * @author Edwin
 * @description Inicia una propuesta para tener pareja con un tiempo límite.
 */
const fs = require('fs');
const path = require('path');
const { getPrefix } = require("../../utils/database");
const { pendingProposals } = require('./state.js');
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

module.exports = {
  name: "pareja",
  description: "Propone a una persona ser tu pareja.",
  commands: ["pareja", "proponer"],
  usage: `${getPrefix()}pareja @usuario`,
  handle: async ({ sendReply, userJid, mentionedJidList, isGroup, groupJid, webMessage }) => {
    if (!isGroup) {
      return sendReply("_Este comando solo puede ser utilizado en grupos._");
    }

    const users = getUsersData();
    const user = getUser(users, userJid);

    // --- AÑADIDO: Verificamos si el usuario ya tiene pareja ---
    if (user.partnerJid) {
        const partnerId = user.partnerJid.split('@')[0];
        return sendReply(`_Ya tienes pareja, infiel de mierda._ 💔`, {
            mentions: [user.partnerJid]
        });
    }

    let targetUserJid;

    if (webMessage.message?.extendedTextMessage?.contextInfo?.participant) {
        targetUserJid = webMessage.message.extendedTextMessage.contextInfo.participant;
    } else if (mentionedJidList && mentionedJidList.length > 0) {
      targetUserJid = mentionedJidList[0];
    } else {
      return sendReply("_Menciona a un usuario o responde su mensaje para proponerle ser tu pareja._");
    }
    
    if (targetUserJid === userJid) {
      return sendReply("_No puedes hacerte pareja de ti mismo, eso sería raro..._ 💀");
    }

    const existingProposal = Array.from(pendingProposals.values()).find(
      p => p.proposer === userJid || p.target === userJid
    );

    if (existingProposal) {
      return sendReply(`_Ya tienes una propuesta pendiente. *@${existingProposal.target.split('@')[0]}*, aún no ha respondido._`);
    }

    pendingProposals.set(userJid, {
        proposer: userJid,
        target: targetUserJid,
        timestamp: Date.now()
    });

    // --- LÓGICA DEL SISTEMA DE NIVELES ---
    await addXP(users, userJid, sendReply);

    const mentionProposer = `@${userJid.split('@')[0]}`;
    const mentionTarget = `@${targetUserJid.split('@')[0]}`;
    const replyMessage = `_*${mentionProposer}* le propuso a ${mentionTarget} ser su pareja._ 💕\n\n_*${mentionTarget}*, tienes 1 minuto para aceptar con *.aceptar* o rechazar con *.rechazar*._`;
    setTimeout(() => {
        if (pendingProposals.has(userJid)) {
            const expiredProposal = pendingProposals.get(userJid);
            if (expiredProposal.target === targetUserJid) {
                pendingProposals.delete(userJid);
                sendReply(`_La propuesta de *@${userJid.split('@')[0]}* a *@${targetUserJid.split('@')[0]}* ha caducado porque no respondió a tiempo._ ⏰`, {
                    mentions: [userJid, targetUserJid]
                });
            }
        }
    }, 60 * 1000);
    await sendReply(replyMessage, { mentions: [userJid, targetUserJid] });
  },
};

