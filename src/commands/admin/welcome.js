const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError, WarningError } = require(`${BASE_DIR}/errors`);
const {
  activateWelcomeGroup,
  deactivateWelcomeGroup,
  isActiveWelcomeGroup,
} = require(`${BASE_DIR}/utils/database`);

module.exports = {
  name: "welcome",
  description: "Activa/desactiva la función de bienvenida en el grupo.",
  commands: ["welcome", "welkom", "welkon", "bienvenida"],
  usage: `${PREFIX}welcome (1/0)`,
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

    const welcome = args[0] === "on";
    const notWelcome = args[0] === "off";

    if (!welcome && !notWelcome) {
      throw new InvalidParameterError(
        "_¡Necesitas escribir on u off!_"
      );
    }

    const hasActive = welcome && isActiveWelcomeGroup(remoteJid);
    const hasInactive = notWelcome && !isActiveWelcomeGroup(remoteJid);

    if (hasActive || hasInactive) {
      throw new WarningError(
        `_¡La función de bienvenida ha sido ${
          welcome ? "activada" : "desactivada"
        }!_`
      );
    }

    if (welcome) {
      activateWelcomeGroup(remoteJid);
    } else {
      deactivateWelcomeGroup(remoteJid);
    }

    await sendSuccessReact();

    const context = welcome ? "activada" : "desactivada";

    await sendReply(`_¡Función de bienvenida ${context} con éxito!_`);
  },
};
