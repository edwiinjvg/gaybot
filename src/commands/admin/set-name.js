const { errorLog } = require(`${BASE_DIR}/utils/logger`);
const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);
const { WarningError } = require(`${BASE_DIR}/errors`);

module.exports = {
  name: "set-name",
  description: "Cambia el nombre del grupo y guarda el nombre antiguo",
  commands: ["setname", "setgroupname", "mudar-nome-grupo", "nome-grupo"],
  usage: `${PREFIX}set-name nuevo nombre del grupo`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({
    fullArgs,
    remoteJid,
    socket,
    sendErrorReply,
    sendSuccessReply,
    sendWaitReply,
    isGroup,
  }) => {
    if (!isGroup) {
      throw new WarningError("_Este comando solo puede ser utilizado en grupos._");
    }

    if (!fullArgs) {
      throw new InvalidParameterError(
        "_¡Necesitas proporcionar un nuevo nombre para el grupo!_"
      );
    }

    const minLength = 3;
    const maxLength = 40;

    if (fullArgs.length < minLength || fullArgs.length > maxLength) {
      throw new InvalidParameterError(
        `_¡El nombre del grupo debe tener entre ${minLength} y ${maxLength} carácteres!_`
      );
    }

    try {
      await sendWaitReply("_Cambiando el nombre del grupo..._");

      const groupMetadata = await socket.groupMetadata(remoteJid);
      const oldName = groupMetadata.subject;

      await socket.groupUpdateSubject(remoteJid, fullArgs);

      await sendSuccessReply(
        `*_¡Nombre del grupo actualizado con éxito!_*\n\n*_Antiguo:_* _${oldName}_\n\n*_Nuevo:_* _${fullArgs}_`
      );
    } catch (error) {
      errorLog("Error al cambiar el nombre del grupo:", error);
      await sendErrorReply(
        "_¡Necesito ser administrador para cambiar el nombre del grupo!_"
      );
    }
  },
};
