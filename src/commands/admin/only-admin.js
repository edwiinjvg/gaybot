const {
  activateOnlyAdmins,
  deactivateOnlyAdmins,
  isActiveOnlyAdmins,
} = require("../../utils/database");

const { InvalidParameterError, WarningError } = require(`${BASE_DIR}/errors`);

const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "only-admin",
  description: "Permite que solo administradores utilicen mis comandos.",
  commands: [
    "onlyadmin",
    "onlyadm",
    "onlyadministrator",
    "onlyadministrators",
    "onlyadmins",
    "soadm",
    "soadmin",
    "soadministrador",
    "soadministradores",
    "soadmins",
  ],
  usage: `${PREFIX}only-admin on`,
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

    const onlyAdminOn = args[0] === "on";
    const onlyAdminOff = args[0] === "off";

    if (!onlyAdminOn && !onlyAdminOff) {
      throw new InvalidParameterError(
        "_¡Necesitas escribir o u off!_"
      );
    }

    const hasActive = onlyAdminOn && isActiveOnlyAdmins(remoteJid);
    const hasInactive = onlyAdminOff && !isActiveOnlyAdmins(remoteJid);

    if (hasActive || hasInactive) {
      throw new WarningError(
        `_¡La función de solo administradores fue ${
          onlyAdminOn ? "activada" : "desactivada"
        }_!`
      );
    }

    if (onlyAdminOn) {
      activateOnlyAdmins(remoteJid);
    } else {
      deactivateOnlyAdmins(remoteJid);
    }

    await sendSuccessReact();

    const context = onlyAdminOn ? "activada" : "desactivada";

    await sendReply(
      `_¡Función de solo administradores ${context} con éxito!_`
    );
  },
};
