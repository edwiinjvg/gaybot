const { setPrefix } = require(`${BASE_DIR}/utils/database`);

const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);

module.exports = {
  name: "set-prefix",
  description: "Cambio el prefijo de uso de mis comandos",
  commands: [
    "setprefix",
    "cambiarprefijo",
    "alterarprefijo",
    "modificarprefijo",
    "prefijo",
    "setprefijo",
    "cambiarprefix",
    "alterarprefix",
    "modificarprefix",
    "establecerprefijo",
  ],
  usage: `${PREFIX}set-prefix =`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ remoteJid, args, sendSuccessReply }) => {
    if (!args.length) {
      throw new InvalidParameterError("_¡Debes proporcionar un prefijo!_");
    }

    if (args.length !== 1) {
      throw new InvalidParameterError("_¡El prefijo debe ser solo 1 carácter!&");
    }

    const newPrefix = args[0];

    setPrefix(remoteJid, newPrefix);

    await sendSuccessReply(`_¡Prefijo cambiado a: ${newPrefix} en este grupo!_`);
  },
};
