const { PREFIX } = require(`${BASE_DIR}/config`);
const { isGroup } = require(`${BASE_DIR}/utils`);
const { errorLog } = require(`${BASE_DIR}/utils/logger`);

module.exports = {
  name: "demote",
  description: "Degrada a un administrador a miembro común",
  commands: ["demote", "deladmin"],
  usage: `${PREFIX}demote @usuario`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({
    args,
    remoteJid,
    socket,
    sendWarningReply,
    sendSuccessReply,
    sendErrorReply,
  }) => {
    if (!isGroup(remoteJid)) {
      return sendWarningReply(
        "_¡Este comando solo puede ser utilizado en grupos!_"
      );
    }

    if (!args.length || !args[0]) {
      return sendWarningReply(
        "_Etiquete a un administrador para degradarlo._"
      );
    }

    const userId = args[0].replace("@", "") + "@s.whatsapp.net";

    try {
      await socket.groupParticipantsUpdate(remoteJid, [userId], "demote");
      await sendSuccessReply("_¡Administrador degradado con éxito!_");
    } catch (error) {
      errorLog(`Error al degradar administrador: ${error.message}`);
      await sendErrorReply(
        "_¡Necesito ser administrador del grupo para degradar a otros administradores!_"
      );
    }
  },
};
