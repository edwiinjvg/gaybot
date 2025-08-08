const { PREFIX } = require(`${BASE_DIR}/config`);
const { errorLog } = require(`${BASE_DIR}/utils/logger`);

module.exports = {
  name: "close",
  description: "Cierra el grupo.",
  commands: ["close", "closegroup", "cerrar", "cerrargrupo"],
  usage: `${PREFIX}close`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ socket, remoteJid, sendSuccessReply, sendErrorReply }) => {
    try {
      await socket.groupSettingUpdate(remoteJid, "announcement");
      await sendSuccessReply("_¡Grupo cerrado con éxito!_");
    } catch (error) {
      await sendErrorReply(
        "_¡Para cerrar el grupo necesito ser administrador!_"
      );
      errorLog(
        `¡Ocurrió un error al cerrar el grupo! Motivo: ${JSON.stringify(
          error,
          null,
          2
        )}`
      );
    }
  },
};
