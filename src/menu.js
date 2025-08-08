/**
 * Menú del bot
 *
 * @author Dev Gui
 */
const { BOT_NAME } = require("./config");
const packageInfo = require("../package.json");
const { readMore } = require("./utils");
const { getPrefix } = require("./utils/database");

exports.menuMessage = (groupJid) => {
  const date = new Date();

  const prefix = getPrefix(groupJid);

  return `
• _Fecha: ${date.toLocaleDateString("es-es")} 📆_
• _Hora: ${date.toLocaleTimeString("es-es")} ⏰_
• _Prefijo: ${prefix} 📌_
• _Versión: ${packageInfo.version}_ 🤖`;
};
