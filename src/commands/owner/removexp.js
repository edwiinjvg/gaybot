/**
 * @author Gemini
 * @description Comando para quitar XP a un usuario (solo para pruebas).
 */
const fs = require('fs');
const path = require('path');
const { removeXP } = require(`${BASE_DIR}/utils/levelSystem.js`);
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
    name: "removexp",
    description: "Quita una cantidad específica de XP a un usuario (solo para pruebas).",
    commands: ["removexp", "remxp", "rx"],
    usage: `${getPrefix()}removexp <cantidad> [@usuario]`,
    handle: async ({ sendReply, userJid, args, isReply, replyJid, mentionedJidList }) => {
        let targetJid = userJid;

        if (mentionedJidList && mentionedJidList.length > 0) {
            targetJid = mentionedJidList[0];
        } else if (isReply) {
            targetJid = replyJid;
        }

        const amount = parseInt(args[0]);

        if (isNaN(amount) || amount <= 0) {
            throw new InvalidParameterError(`_Especifica una cantidad válida de XP._`);
        }

        const users = getUsersData();
        removeXP(users, targetJid, amount);
        
        const targetNumber = onlyNumbers(targetJid);
        
        await sendReply(`_Removiste *${amount}* de XP a *@${targetNumber}*._ 📉`, {
            mentions: [targetJid]
        });
    },
};
