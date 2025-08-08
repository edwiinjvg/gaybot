/**
 * @author Edwin
 * @description Elimina el registro del usuario en la base de datos de la economía.
 */
const fs = require('fs');
const path = require('path');
const { getPrefix } = require("../../utils/database");
const { getUser } = require("../../utils/levelSystem.js");

const USERS_DB_PATH = path.join(BASE_DIR, '..', 'database', 'users.json');

const getUsersData = () => {
  if (!fs.existsSync(USERS_DB_PATH)) {
    fs.writeFileSync(USERS_DB_PATH, JSON.stringify({}, null, 2));
  }
  const data = fs.readFileSync(USERS_DB_PATH, 'utf-8');
  return JSON.parse(data);
};

module.exports = {
  name: "unreg",
  description: "Elimina tu registro del bot.",
  commands: ["unreg", "unregister"],
  usage: `${getPrefix()}unreg`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, userJid }) => {
    const users = getUsersData();
    const user = getUser(users, userJid);

    // Verificamos si el usuario está registrado
    if (!user.name) {
      return sendReply("_No estás registrado, usa el comando .reg para registrarte._");
    }

    // Eliminamos el nombre y la edad del perfil
    delete user.name;
    delete user.age;
    
    // Guardamos los cambios
    fs.writeFileSync(USERS_DB_PATH, JSON.stringify(users, null, 2));
    
    return sendReply("_Eliminaste tu registro con éxito. Puedes volver a registrarte con el comando .reg._");
  },
};
