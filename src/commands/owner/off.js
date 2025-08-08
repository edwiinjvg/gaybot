const { PREFIX } = require(`${BASE_DIR}/config`);
const { deactivateGroup } = require(`${BASE_DIR}/utils/database`);

module.exports = {
  name: "off",
  description: "Desactiva el bot en el grupo",
  commands: ["off"],
  usage: `${PREFIX}off`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendSuccessReply, remoteJid, isGroup }) => {
    if (!isGroup) {
      throw new WarningError("_Este comando solo puede ser utilizado en grupos._");
    }

    deactivateGroup(remoteJid);

    await sendSuccessReply("_¡Bot desactivado en este grupo!_");
  },
};
