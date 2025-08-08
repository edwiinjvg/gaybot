
/**
 * @author Edwin
 * @description Crea una lista aleatoria de 10 personas de un grupo con un texto personalizado.
 */
const fs = require('fs');
const path = require('path');
const { getPrefix } = require("../../utils/database");
const { addXP } = require("../../utils/levelSystem.js");

const emojis = ['🍒', '🍑', '🍆', '🔥', '👑', '💫', '🌟', '✨', '💋', '😈', '🥵', '💦'];

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

// Función para obtener o crear un usuario
const getUser = (users, userJid) => {
  const userId = userJid.split('@')[0];
  
  if (!users[userId]) {
    users[userId] = {
      money: 500, 
      lastReward: 0,
      lastWork: 0,
      lastMine: 0,
      lastRob: 0,
      partnerJid: null,
      level: 0,
      xp: 0,
    };
  }
  return users[userId];
};

module.exports = {
  name: "top",
  description: "Crea una lista de 10 personas del grupo de forma aleatoria, con un texto a elegir.",
  commands: ["top", "top10"],
  usage: `${getPrefix()}top <tu texto>`,
  handle: async ({ sendReply, fullMessage, isGroup, getGroupParticipants, userJid }) => {
    if (!isGroup) {
      return sendReply("_Este comando solo se puede utilizar en grupos._");
    }
    
    const participants = await getGroupParticipants();
    
    if (!Array.isArray(participants) || participants.length === 0) {
      return sendReply("_Este grupo no tiene participantes._");
    }

    const args = fullMessage.split(' ');
    const topText = args.slice(1).join(' ');

    if (!topText) {
      return sendReply(`_Escribe un texto para tu top._`);
    }

    let top10Participants = [];
    
    if (participants.length < 10) {
        for (let i = 0; i < 10; i++) {
            const randomIndex = Math.floor(Math.random() * participants.length);
            top10Participants.push(participants[randomIndex]);
        }
    } else {
        const shuffledParticipants = [...participants].sort(() => Math.random() - 0.5);
        top10Participants = shuffledParticipants.slice(0, 10);
    }
    
    let topListText = ` - 「 *_TOP 10 ${topText.toUpperCase()}_ 」*\n\n`;
    let mentions = [];
    
    for (let i = 0; i < top10Participants.length; i++) {
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        
        const participant = top10Participants[i];
        
        const participantNumber = participant.id.split('@')[0];
        
        mentions.push(participant.id);
        
        topListText += `  - *_${i + 1}._* ${randomEmoji} _*@${participantNumber}*_ ${randomEmoji}\n`;
    }

    // --- LÓGICA DEL SISTEMA DE NIVELES (AÑADIDA) ---
    const users = getUsersData();
    await addXP(users, userJid, sendReply);

    await sendReply(topListText, { mentions: mentions });
  },
};
