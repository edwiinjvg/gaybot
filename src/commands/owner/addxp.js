/**
 * @author Gemini
 * @description Comando para añadir XP a un usuario (solo para pruebas).
 */
const fs = require('fs');
const path = require('path');
const { addXP } = require(`${BASE_DIR}/utils/levelSystem.js`);
const { getPrefix } = require(`${BASE_DIR}/utils/database`);
const { toUserJid, onlyNumbers } = require(`${BASE_DIR}/utils`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);

const USERS_DB_PATH = path.join(BASE_DIR, '..', 'database', 'users.json');

const getUsersData = () => {
    if (!fs.existsSync(USERS_DB_PATH)) {
        fs.writeFileSync(USERS_DB_PATH, JSON.stringify({}, null, 2));
    }
    const data = fs.readFileSync(USERS_DB_PATH, 'utf-8');
    return JSON.parse(data);
};

module.exports = {
    name: "addxp",
    description: "Añade una cantidad específica de XP a un usuario (solo para pruebas).",
    commands: ["addxp", "ax"],
    usage: `${getPrefix()}addxp <cantidad> [@usuario]`,
    handle: async ({ sendReply, userJid, args, isReply, replyJid, mentionedJidList }) => {
        let targetJid = userJid;

        // Comprueba si se mencionó a alguien
        if (mentionedJidList && mentionedJidList.length > 0) {
            targetJid = mentionedJidList[0];
        // Comprueba si se respondió a un mensaje
        } else if (isReply) {
            targetJid = replyJid;
        }

        const amount = parseInt(args[0]);

        if (isNaN(amount) || amount <= 0) {
            throw new InvalidParameterError(`_Especifica una cantidad válida de XP._`);
        }

        const users = getUsersData();
        await addXP(users, targetJid, sendReply, amount);
        
        const targetNumber = onlyNumbers(targetJid);
        
        await sendReply(`_Añadiste *${amount}* XP a *@${targetNumber}*._ ✨`, {
            mentions: [targetJid]
        });
    },
};

