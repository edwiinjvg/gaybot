const { PREFIX } = require(`${BASE_DIR}/config`);
const { isGroup } = require(`${BASE_DIR}/utils`);
const { errorLog } = require(`${BASE_DIR}/utils/logger`);

module.exports = {
  name: "promote",
  description: "Promueve a un usuario a administrador del grupo",
  commands: ["promote", "admin"],
  usage: `${PREFIX}promote @usuario`,
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
        "_Etiquete a un usuario para promoverlo._"
      );
    }

    const userId = args[0].replace("@", "") + "@s.whatsapp.net";

    try {
      await socket.groupParticipantsUpdate(remoteJid, [userId], "promote");
      await sendSuccessReply("_¡Usuario promovido con éxito!_");
    } catch (error) {
      errorLog(`Error al promover usuario: ${error.message}`);
      await sendErrorReply(
        "_¡Necesito ser administrador para promover a otros usuarios!_"
      );
    }
  },
};
