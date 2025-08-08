const { getPrefix } = require("../../utils/database");
module.exports = {
  name: "deathnote",
  description: "Elimina a un usuario aleatorio que no sea admin del grupo.",
  commands: ["deathnote", "dn"],
  // Se ha corregido el 'usage' para que sea una cadena de texto estática
  usage: "!deathnote", 
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, getGroupAdmins, getGroupParticipants, remoteJid, userJid, socket }) => {
    // 1. Verificar si el bot es un administrador
    const groupAdmins = await getGroupAdmins();
    const botJid = socket.user.id;
    
    const botIsAdmin = groupAdmins.includes(botJid);
    
    if (!botIsAdmin) {
      return sendReply("_No soy administrador en este grupo. No puedo ejecutar este comando._");
    }
    
    // 2. Obtener todos los participantes y administradores del grupo
    const groupParticipants = await getGroupParticipants();
    
    // 3. Filtrar la lista para obtener solo a los no-administradores
    const nonAdmins = groupParticipants.filter(p => !groupAdmins.includes(p.id));

    // 4. Asegurarse de que el usuario que ejecuta el comando no se elimine a sí mismo
    const targetableUsers = nonAdmins.filter(p => p.id !== userJid);

    if (targetableUsers.length === 0) {
      return sendReply("_No hay usuarios no-administradores para eliminar en este grupo._");
    }

    // 5. Elegir a una persona aleatoria de la lista de no-administradores
    const randomIndex = Math.floor(Math.random() * targetableUsers.length);
    const userToKick = targetableUsers[randomIndex];

    // 6. Ejecutar el comando para eliminar al usuario
    try {
      await socket.groupParticipantsUpdate(remoteJid, [userToKick.id], 'remove');
      return sendReply(`_¡El nombre de ${userToKick.id.split('@')[0]} ha sido escrito en la Death Note!_`);
    } catch (e) {
      console.error(e);
      return sendReply("_Ocurrió un error al intentar eliminar al usuario. Asegúrate de que el bot tenga los permisos necesarios._");
    }
  },
};

