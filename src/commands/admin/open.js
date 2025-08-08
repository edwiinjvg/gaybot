const { PREFIX } = require(`${BASE_DIR}/config`);
const { errorLog } = require(`${BASE_DIR}/utils/logger`);

module.exports = {
  name: "open",
  description: "Abre el grupo.",
  commands: ["open", "opengroup", "opengp", "abrir", "abrirgrupo", "abrirgp"],
  usage: `${PREFIX}open`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ socket, remoteJid, sendSuccessReply, sendErrorReply }) => {
    try {
      await socket.groupSettingUpdate(remoteJid, "not_announcement");
      await sendSuccessReply("_¡Grupo abierto con éxito!_");
    } catch (error) {
      await sendErrorReply(
        "_¡Para abrir el grupo necesito ser administrador!_"
      );
      errorLog(
        `¡Ocurrió un error al abrir el grupo! Motivo: ${JSON.stringify(
          error,
          null,
          2
        )}`
      );
    }
  },
};
