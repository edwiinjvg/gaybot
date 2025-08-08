/**
 * @author Edwin
 * @description Muestra tu perfil o el de un usuario mencionado, incluyendo su foto.
 */
const fs = require('fs');
const path = require('path');
const { getProfileImageData } = require("../../services/baileys");
const { addXP, getUser, getXPForNextLevel } = require("../../utils/levelSystem.js");

const USERS_DB_PATH = path.join(BASE_DIR, '..', 'database', 'users.json');

// --- Funciones de la base de datos ---
const getUsersData = () => {
  if (!fs.existsSync(USERS_DB_PATH)) {
    fs.writeFileSync(USERS_DB_PATH, JSON.stringify({}, null, 2));
  }
  const data = fs.readFileSync(USERS_DB_PATH, 'utf-8');
  return JSON.parse(data);
};

module.exports = {
  name: "profile",
  description: "Muestra tu perfil o el de un usuario mencionado.",
  commands: ["profile", "perfil"],
  usage: "<prefix>profile [@usuario]",
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, userJid, mentionedJidList, webMessage, socket, remoteJid }) => {
    let targetUserJid = userJid;

    if (webMessage.message?.extendedTextMessage?.contextInfo?.participant) {
        targetUserJid = webMessage.message.extendedTextMessage.contextInfo.participant;
    } else if (mentionedJidList && mentionedJidList.length > 0) {
      targetUserJid = mentionedJidList[0];
    }
    
    const users = getUsersData();
    const targetUserId = targetUserJid.split('@')[0];
    const targetUserData = getUser(users, targetUserJid);

    // --- Se comprueba si el usuario tiene un nombre ---
    let registrationStatus = targetUserData.name ? '_Sí_ ✅' : '_No_ ❌';
    let name = targetUserData.name || `@${targetUserId}`;
    let age = targetUserData.age || 'N/A';
    let money = targetUserData.money;
    let partnerJid = targetUserData.partnerJid;
    let level = targetUserData.level;
    let xp = targetUserData.xp;
    let diamonds = targetUserData.diamonds;
    let role = targetUserData.role || 'Hetere 😴';
    
    const xpForNextLevel = getXPForNextLevel(level);

    let partnerInfo = "_Sin pareja_ 😹";
    let mentions = [targetUserJid];

    if (partnerJid) {
        const partnerId = partnerJid.split('@')[0];
        const partnerName = getUser(users, partnerJid).name || partnerId;
        partnerInfo = `_*@${partnerId}* (${partnerName})._ 💕`;
        mentions.push(partnerJid);
    }
    
    // --- LÓGICA DEL SISTEMA DE NIVELES (AÑADIDA) ---
    await addXP(users, userJid, sendReply);

    const replyMessage = `
- _*Nombre:*_ _${name}_ 👤
- _*Edad:* ${age}_ 🎂
- _*Registrado:*_ ${registrationStatus}
- _*Rol:* ${role}_ 
- _*Pareja:*_ ${partnerInfo}
- _*Nivel:* ${level}_ 📈
- _*XP:* ${xp}/${xpForNextLevel}_ ✨
- _*Balance:* ${money}_ 🪙
- _*Diamantes:* ${diamonds}_ 💎 `;
    
    let profilePicUrl;
    try {
        const { profileImage } = await getProfileImageData(socket, targetUserJid);
        profilePicUrl = profileImage || `${ASSETS_DIR}/images/default-user.png`;
    } catch (error) {
        console.error("Error al obtener la foto de perfil:", error);
        profilePicUrl = `${ASSETS_DIR}/images/default-user.png`;
    }

    await socket.sendMessage(remoteJid, {
        image: { url: profilePicUrl },
        caption: replyMessage,
        mentions: mentions,
    });
  },
};

