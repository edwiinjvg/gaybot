const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError, WarningError } = require(`${BASE_DIR}/errors`);
const {
  activateExitGroup,
  deactivateExitGroup,
  isActiveExitGroup,
} = require(`${BASE_DIR}/utils/database`);

module.exports = {
  name: "exit",
  description:
    "Activa/desactiva la función de envío de mensajes cuando alguien sale del grupo.",
  commands: ["exit"],
  usage: `${PREFIX}exit (on/off)`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ args, sendReply, sendSuccessReact, remoteJid }) => {
    if (!args.length) {
      throw new InvalidParameterError(
        "_¡Necesitas escribir on u off!_"
      );
    }

    const exit = args[0] === "1";
    const notExit = args[0] === "0";

    if (!exit && !notExit) {
      throw new InvalidParameterError(
        "_¡Necesitas escribir on u off!_"
      );
    }

    const hasActive = exit && isActiveExitGroup(remoteJid);
    const hasInactive = notExit && !isActiveExitGroup(remoteJid);

    if (hasActive || hasInactive) {
      throw new WarningError(
        `_¡La función de salida ha sido ${exit ? "activada" : "desactivada"}!_`
      );
    }

    if (exit) {
      activateExitGroup(remoteJid);
    } else {
      deactivateExitGroup(remoteJid);
    }

    await sendSuccessReact();

    const context = exit ? "activado" : "desactivado";

    await sendReply(
      `_¡Mensaje de salida ${context} con éxito!_`
    );
  },
};
