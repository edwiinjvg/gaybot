const { PREFIX } = require(`${BASE_DIR}/config`);
const { activateGroup } = require(`${BASE_DIR}/utils/database`);

module.exports = {
  name: "on",
  description: "Activa el bot en el grupo",
  commands: ["on"],
  usage: `${PREFIX}on`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendSuccessReply, remoteJid, isGroup }) => {
    if (!isGroup) {
      throw new WarningError("_Este comando solo puede ser utilizado en grupos._");
    }

    activateGroup(remoteJid);

    await sendSuccessReply("_¡Bot activado en este grupo!_");
  },
};
