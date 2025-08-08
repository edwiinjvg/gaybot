const fs = require('fs');
const path = require('path');
const USERS_DB_PATH = path.join(process.cwd(), 'database', 'users.json');

const saveUsersData = (data) => {
    fs.writeFileSync(USERS_DB_PATH, JSON.stringify(data, null, 2));
};

const XP_PER_COMMAND = 50;
const XP_REQUIRED_BASE = 100;
const XP_REQUIRED_MULTIPLIER = 50;

const getXPForNextLevel = (level) => {
    return XP_REQUIRED_BASE + (level * XP_REQUIRED_MULTIPLIER);
};

const getUser = (users, userJid) => {
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
            diamonds: 0,
            lastMine3: 0,
        };
    }
    return users[userId];
};

const addXP = async (users, userJid, sendReply, xpAmount = XP_PER_COMMAND) => {
    const user = getUser(users, userJid);
    
    user.xp += xpAmount;
    let leveledUp = false;
    let newRole = null;

    while (user.xp >= getXPForNextLevel(user.level)) {
        user.xp -= getXPForNextLevel(user.level);
        user.level += 1;
        leveledUp = true;
        
        switch (user.level) {
            case 5:
                newRole = "Penelover 💜";
                break;
            case 10:
                newRole = "Furry 🐾";
                break;
            case 25:
                newRole = "Femboy 👯‍♂️";
                break;
            case 50:
                newRole = "Gay 🏳️‍🌈";
                break;
            case 75:
                newRole = "Trans 🏳️‍⚧️";
                break;
            case 100:
                newRole = "Género fluido 👰🏻‍♂️";
                break;
        }

        if (newRole) {
            user.role = newRole;
        }
    }
    
    saveUsersData(users);

    if (leveledUp) {
        await sendReply(`_¡Felicidades, *@${userJid.split('@')[0]}* subiste al nivel *${user.level}*!_ 🥳`, {
            mentions: [userJid]
        });
        
        if (newRole) {
            await sendReply(`_Alcanzaste el rol de *${newRole}*._`);
        }
    }

    return leveledUp;
};

const removeXP = (users, userJid, xpAmount) => {
    const user = getUser(users, userJid);

    user.xp -= xpAmount;
    if (user.xp < 0) {
        user.xp = 0;
    }

    saveUsersData(users);
};

// --- NUEVO: Función para añadir diamantes ---
const addDiamonds = (users, userJid, amount) => {
    const user = getUser(users, userJid);
    user.diamonds += amount;
    saveUsersData(users);
};

module.exports = {
    XP_PER_COMMAND,
    getXPForNextLevel,
    addXP,
    removeXP,
    addDiamonds, // Exportamos la nueva función
    getUser,
};

