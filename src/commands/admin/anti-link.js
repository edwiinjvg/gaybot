const { isActiveAntiLinkGroup } = require("../../utils/database");

const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError, WarningError } = require(`${BASE_DIR}/errors`);
const {
  activateAntiLinkGroup,
  deactivateAntiLinkGroup,
} = require(`${BASE_DIR}/utils/database`);

module.exports = {
  name: "anti-link",
  description: "Activa/desactiva la función de anti-enlace en el grupo.",
  commands: ["antilink", "antienlace"],
  usage: `${PREFIX}anti-link (on/off)`,
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

    const antiLinkOn = args[0] === "on";
    const antiLinkOff = args[0] === "off";

    if (!antiLinkOn && !antiLinkOff) {
      throw new InvalidParameterError(
        "_¡Necesitas escribir on u off!_"
      );
    }

    const hasActive = antiLinkOn && isActiveAntiLinkGroup(remoteJid);
    const hasInactive = antiLinkOff && !isActiveAntiLinkGroup(remoteJid);

    if (hasActive || hasInactive) {
      throw new WarningError(
        `_¡Anti-link ha sido ${
          antiLinkOn ? "activado" : "desactivado" 
        }!_`
      );
    }

    if (antiLinkOn) {
      activateAntiLinkGroup(remoteJid);
    } else {
      deactivateAntiLinkGroup(remoteJid);
    }

    await sendSuccessReact();

    const context = antiLinkOn ? "activado" : "desactivado";

    await sendReply(`_¡Anti-link ${context} con éxito!_`);
  },
};
