// Archivo: src/utils/auth.js
const { getUser } = require("./levelSystem.js");
const { getPrefix } = require("./database.js");

const isRegistered = (users, userJid, sendReply) => {
    const user = getUser(users, userJid);

    // Si el usuario no tiene un nombre registrado, no está registrado
    if (!user.name) {
        const prefix = getPrefix();
        sendReply(`_Para utilizar los comandos de economía necesitas estar registrado._`);
        return false; // El usuario no está registrado
    }
    
    return true; // El usuario está registrado
};

module.exports = {
    isRegistered
};
