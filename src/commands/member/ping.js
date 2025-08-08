/**
 * Mejorado por: Mkg
 *
 * @author Dev Gui
 */
const fs = require("node:fs");
const path = require('path');
const { PREFIX } = require(`${BASE_DIR}/config`);
const { addXP } = require("../../utils/levelSystem.js");

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
  name: "ping",
  description:
    "Verifica si el bot está en línea, el tiempo de respuesta y el tiempo de actividad.",
  commands: ["ping", "pong"],
  usage: `${PREFIX}ping`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, sendReact, startProcess, fullMessage, userJid }) => {
    const response = fullMessage.slice(1).startsWith("ping")
      ? "🏓 ¡Pong!"
      : "🏓 ¡Ping!";

    await sendReact("🏓");

    const uptime = process.uptime();

    const h = Math.floor(uptime / 3600);
    const m = Math.floor((uptime % 3600) / 60);
    const s = Math.floor(uptime % 60);

    const ping = Date.now() - startProcess;

    // --- LÓGICA DEL SISTEMA DE NIVELES (AÑADIDA) ---
    const users = getUsersData();
    await addXP(users, userJid, sendReply);

    await sendReply(`${response}

📶 Velocidad de respuesta: ${ping}ms
⏱️ Tiempo de actividad: ${h}h ${m}m ${s}s`);
  },
};

