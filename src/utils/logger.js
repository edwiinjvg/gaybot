/**
 * Logs
 *
 * @author Dev Gui
 */
const { version } = require("../../package.json");

exports.sayLog = (message) => {
  console.log("\x1b[36m[GAYBOT | TALK]\x1b[0m", message);
};

exports.inputLog = (message) => {
  console.log("\x1b[30m[GAYBOT | INPUT]\x1b[0m", message);
};

exports.infoLog = (message) => {
  console.log("\x1b[34m[GAYBOT | INFO]\x1b[0m", message);
};

exports.successLog = (message) => {
  console.log("\x1b[32m[GAYBOT | SUCCESS]\x1b[0m", message);
};

exports.errorLog = (message) => {
  console.log("\x1b[31m[GAYBOT | ERROR]\x1b[0m", message);
};

exports.warningLog = (message) => {
  console.log("\x1b[33m[ GAYBOT | WARNING]\x1b[0m", message);
};

exports.bannerLog = () => {
  console.log(`\x1b[36m░██████╗░░█████╗░██╗░░░██╗██████╗░░█████╗░████████╗
██╔════╝░██╔══██╗╚██╗░██╔╝██╔══██╗██╔══██╗╚══██╔══╝
██║░░██╗░███████║░╚████╔╝░██████╦╝██║░░██║░░░██║░░░
██║░░╚██╗██╔══██║░░╚██╔╝░░██╔══██╗██║░░██║░░░██║░░░
╚██████╔╝██║░░██║░░░██║░░░██████╦╝╚█████╔╝░░░██║░░░
░╚═════╝░╚═╝░░╚═╝░░░╚═╝░░░╚═════╝░░╚════╝░░░░╚═╝░░░\n`);
  console.log(`\x1b[36m🤖 Versión: \x1b[0m${version}\n`);
};
